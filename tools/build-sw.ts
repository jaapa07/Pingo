/**
 * Último passo do `npm run build`: lê o `dist/`, calcula o hash de TODOS os arquivos e gera
 *  - `dist/pingo-arquivos.json`: lista completa { v, arquivos: [caminho, hash, bytes, grupo] }
 *  - `dist/sw.js`: Service Worker com a versão e a lista do núcleo embutidas.
 *
 * Grupos:
 *  - `n` núcleo: página, código, interface, tilesets, FX, ícones. Entra na instalação do SW (em lotes).
 *  - `r` resto: sprites, arenas e zonas. A página baixa em lotes logo depois (src/core/offline.ts),
 *    com retomada: o que já está no cache não é baixado de novo.
 *  - `d` demanda: zonas de demonstração e, se o pacote passar do orçamento, o que não é do mapa A.
 *    Só entra no cache quando é pedido (cache-first).
 * Atualização: cada versão tem o seu cache (`pingo-<versão>`); ao ativar, o SW copia do cache antigo
 * o que não mudou (mesmo hash) e apaga os caches velhos.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const DIST_PADRAO = join(RAIZ, 'dist');
/** acima disto, só o mapa A entra no pré-cache; o resto fica por demanda */
export const ORCAMENTO_MB = 60;
const LOTE_NUCLEO = 16;

type Grupo = 'n' | 'r' | 'd';
type Entrada = [caminho: string, hash: string, bytes: number, grupo: Grupo];

function andar(dir: string, saida: string[] = []): string[] {
  for (const nome of readdirSync(dir).sort()) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) andar(p, saida); else saida.push(p);
  }
  return saida;
}

const ehNucleo = (c: string) =>
  !c.includes('/') || c.startsWith('icones/') || /^assets\/[^/]+$/.test(c) || /^assets\/(ui|tiles|fx)\//.test(c);
const ehDemo = (c: string) => /^assets\/zonas\/_/.test(c);
const ehMapaA = (c: string) => !/^assets\/zonas\//.test(c) || /^assets\/zonas\/A/.test(c);
/** ordem do download do resto: gente, zonas na ordem da viagem, criaturas, arenas */
function prioridade(c: string): number {
  if (c.startsWith('assets/sprites/pessoa/')) return 0;
  const z = /^assets\/zonas\/(A\d+|A-[A-Z0-9]+)/.exec(c)?.[1];
  if (z) { const n = /^A(\d+)/.exec(z); return n ? 1 + Number(n[1]) : 6; }
  if (c.startsWith('assets/sprites/criatura/')) return 20;
  if (c.startsWith('assets/arenas/')) return 21;
  return 30;
}

export function gerar(DIST: string = DIST_PADRAO): { versao: string; total: number; bytes: number; nucleo: number; bytesNucleo: number; resto: number; bytesResto: number; demanda: number; bytesDemanda: number } {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('dist/index.html não existe: rode `vite build` antes.');
  const brutos = andar(DIST).map((p) => relative(DIST, p).split(sep).join('/')).filter((c) => c !== 'sw.js' && c !== 'pingo-arquivos.json');
  const bytesTotal = brutos.reduce((s, c) => s + statSync(join(DIST, c)).size, 0);
  const estourou = bytesTotal > ORCAMENTO_MB * 1024 * 1024;
  const arquivos: Entrada[] = brutos.map((c) => {
    const dados = readFileSync(join(DIST, c));
    const g: Grupo = ehNucleo(c) ? 'n' : ehDemo(c) || (estourou && !ehMapaA(c)) ? 'd' : 'r';
    return [c, createHash('sha256').update(dados).digest('hex').slice(0, 12), dados.length, g];
  });
  arquivos.sort((a, b) => prioridade(a[0]) - prioridade(b[0]) || (a[0] < b[0] ? -1 : 1));
  const versao = createHash('sha256').update(arquivos.map((a) => a[0] + ':' + a[1]).sort().join('\n')).digest('hex').slice(0, 10);
  writeFileSync(join(DIST, 'pingo-arquivos.json'), JSON.stringify({ v: versao, arquivos }));
  const nucleo = arquivos.filter((a) => a[3] === 'n').map((a) => a[0]);
  nucleo.push('pingo-arquivos.json');
  writeFileSync(join(DIST, 'sw.js'), codigoSw(versao, nucleo));
  const soma = (g: Grupo) => arquivos.filter((a) => a[3] === g).reduce((s, a) => s + a[2], 0);
  const conta = (g: Grupo) => arquivos.filter((a) => a[3] === g).length;
  return { versao, total: arquivos.length, bytes: bytesTotal, nucleo: conta('n'), bytesNucleo: soma('n'), resto: conta('r'), bytesResto: soma('r'), demanda: conta('d'), bytesDemanda: soma('d') };
}

function codigoSw(versao: string, nucleo: string[]): string {
  return `/* Adventures of Pingo: Service Worker gerado por tools/build-sw.ts. Não edite à mão. */
'use strict';
const VERSAO = ${JSON.stringify(versao)};
const PREFIXO = 'pingo-';
const CACHE = PREFIXO + VERSAO;
const NUCLEO = ${JSON.stringify(nucleo)};
const LOTE = ${LOTE_NUCLEO};
const BASE = self.registration.scope;
const abs = (c) => new URL(c, BASE).href;

async function emLotes(lista, tamanho, f) {
  for (let i = 0; i < lista.length; i += tamanho) await Promise.all(lista.slice(i, i + tamanho).map(f));
}
async function baixar(cache, caminho) {
  const r = await fetch(new Request(abs(caminho), { cache: 'reload' }));
  if (!r.ok) throw new Error('falha ao baixar ' + caminho + ' (' + r.status + ')');
  await cache.put(abs(caminho), r);
}
async function listaDe(cache) {
  try {
    const r = await cache.match(abs('pingo-arquivos.json'));
    if (!r) return null;
    const j = await r.json();
    return new Map(j.arquivos.map((a) => [a[0], a[1]]));
  } catch (e) { return null; }
}

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // a lista nova primeiro: com ela dá para aproveitar do cache antigo o que não mudou
    await baixar(cache, 'pingo-arquivos.json');
    const nova = await listaDe(cache);
    const antigos = [];
    for (const nome of await caches.keys()) {
      if (!nome.startsWith(PREFIXO) || nome === CACHE) continue;
      const c = await caches.open(nome), l = await listaDe(c);
      if (l) antigos.push([c, l]);
    }
    const pendentes = NUCLEO.filter((c) => c !== 'pingo-arquivos.json');
    await emLotes(pendentes, LOTE, async (caminho) => {
      if (await cache.match(abs(caminho))) return;
      const h = nova && nova.get(caminho);
      for (const [c, l] of antigos) {
        if (h && l.get(caminho) === h) { const r = await c.match(abs(caminho)); if (r) { await cache.put(abs(caminho), r); return; } }
      }
      await baixar(cache, caminho);
    });
    // primeira instalação: assume logo; atualização: espera a página pedir (mensagem 'ativar')
    if (!self.registration.active) await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE), nova = await listaDe(cache);
    for (const nome of await caches.keys()) {
      if (!nome.startsWith(PREFIXO) || nome === CACHE) continue;
      const c = await caches.open(nome), l = await listaDe(c);
      if (nova && l) {
        const iguais = [...nova].filter(([caminho, h]) => l.get(caminho) === h).map(([caminho]) => caminho);
        await emLotes(iguais, 32, async (caminho) => {
          if (await cache.match(abs(caminho))) return;
          const r = await c.match(abs(caminho)); if (r) await cache.put(abs(caminho), r);
        });
      }
      await caches.delete(nome);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (ev) => {
  if (ev.data === 'ativar') void self.skipWaiting();
  if (ev.data === 'versao' && ev.source) ev.source.postMessage({ pingoVersao: VERSAO });
});

async function responder(req) {
  const cache = await caches.open(CACHE);
  if (req.mode === 'navigate') {
    const pagina = await cache.match(abs('index.html'));
    if (pagina) return pagina;
  }
  const guardado = await cache.match(req, { ignoreSearch: true });
  if (guardado) return guardado;
  try {
    const r = await fetch(req);
    if (r.ok && r.type === 'basic') void cache.put(req.url.split('?')[0].split('#')[0], r.clone()).catch(() => undefined);
    return r;
  } catch (e) {
    if (req.mode === 'navigate') { const pagina = await cache.match(abs('index.html')); if (pagina) return pagina; }
    return new Response('', { status: 504, statusText: 'sem rede e fora do cache' });
  }
}
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || !req.url.startsWith(BASE)) return;
  if (req.url === abs('sw.js')) return;
  // o download em lotes da página (src/core/offline.ts) vai direto à rede e grava ele mesmo no cache
  if (req.cache === 'reload') return;
  ev.respondWith(responder(req));
});
`;
}

const direto = process.argv[1]?.endsWith('build-sw.ts');
if (direto) {
  const r = gerar();
  const mb = (b: number) => (b / 1048576).toFixed(1) + ' MB';
  console.log(`[sw] versão ${r.versao}: ${r.total} arquivos, ${mb(r.bytes)} no dist`);
  console.log(`[sw] núcleo (instalação): ${r.nucleo} arquivos, ${mb(r.bytesNucleo)}`);
  console.log(`[sw] resto (lotes após abrir): ${r.resto} arquivos, ${mb(r.bytesResto)}`);
  console.log(`[sw] por demanda: ${r.demanda} arquivos, ${mb(r.bytesDemanda)}${r.bytes > ORCAMENTO_MB * 1048576 ? ` (pacote acima de ${ORCAMENTO_MB} MB: só o mapa A no pré-cache)` : ''}`);
}
