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
 * Caches: `pingo-n-<versão>` guarda o núcleo de cada versão; `pingo-dados` guarda o resto, com o hash do
 * arquivo na chave (`<url>?h=<hash>`). Atualização: o SW novo aproveita do núcleo antigo o que não mudou,
 * assume logo ao instalar, guarda os núcleos velhos enquanto houver página antiga aberta (a página nova pede a faxina) e os dados que não mudaram continuam valendo; o que
 * mudou é baixado pela página, que depois remove do cache as chaves sem uso.
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
const CACHE_NUCLEO = PREFIXO + 'n-' + VERSAO; // página, código, interface: um por versão
const CACHE_DADOS = PREFIXO + 'dados';        // sprites, arenas e zonas: um só, com o hash na chave
const NUCLEO = ${JSON.stringify(nucleo)};
const LOTE = ${LOTE_NUCLEO};
const BASE = self.registration.scope;
const abs = (c) => new URL(c, BASE).href;

async function emLotes(lista, tamanho, f) {
  for (let i = 0; i < lista.length; i += tamanho) await Promise.all(lista.slice(i, i + tamanho).map(f));
}
/** baixa da rede para o cache; com o hash da lista, recusa conteúdo que não confere (publicação pela metade ou cache intermediário velho) */
async function baixar(cache, caminho, h) {
  const r = await fetch(new Request(abs(caminho), { cache: 'reload' }));
  if (!r.ok) throw new Error('falha ao baixar ' + caminho + ' (' + r.status + ')');
  if (h && self.crypto && self.crypto.subtle) {
    const d = new Uint8Array(await self.crypto.subtle.digest('SHA-256', await r.clone().arrayBuffer()));
    let hex = ''; for (let i = 0; i < 6; i++) hex += d[i].toString(16).padStart(2, '0');
    if (hex !== h) throw new Error('o conteúdo de ' + caminho + ' não é o desta versão');
  }
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
let hashes = null; // caminho → hash desta versão (lido do núcleo quando o SW acorda)
function mapa() {
  if (!hashes) hashes = caches.open(CACHE_NUCLEO).then(listaDe).then((m) => m || new Map());
  return hashes;
}

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    // a lista nova primeiro: com ela dá para aproveitar do núcleo antigo o que não mudou
    await baixar(cache, 'pingo-arquivos.json');
    const nova = await listaDe(cache);
    // a lista tem de ser a desta versão: se o site entregar sw.js novo com lista velha, a instalação é refeita depois
    const jl = await (await cache.match(abs('pingo-arquivos.json'))).json();
    if (jl.v !== VERSAO) { await caches.delete(CACHE_NUCLEO); throw new Error('lista de arquivos de outra versão (' + jl.v + ')'); }
    const antigos = [];
    for (const nome of await caches.keys()) {
      if (!nome.startsWith(PREFIXO + 'n-') || nome === CACHE_NUCLEO) continue;
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
      await baixar(cache, caminho, h);
    });
    // assume assim que instalar (padrão mais previsível nos navegadores). A página que já estava aberta segue
    // funcionando: os núcleos antigos só são apagados quando uma página nova pedir a faxina.
    if (!(await caches.has(CACHE_NUCLEO)) || !(await cache.match(abs('index.html')))) throw new Error('o núcleo foi apagado durante a instalação');
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => { ev.waitUntil(self.clients.claim()); });

async function faxina() {
  // nunca durante a instalação de outra versão (o núcleo dela ainda está sendo montado)
  if (self.registration.installing || self.registration.waiting || self.registration.active !== self.serviceWorker && self.serviceWorker) return;
  for (const nome of await caches.keys()) {
    if (nome.startsWith(PREFIXO) && nome !== CACHE_NUCLEO && nome !== CACHE_DADOS) await caches.delete(nome);
  }
}
self.addEventListener('message', (ev) => {
  // enviada por src/core/offline.ts ao abrir o jogo: a página já é desta versão, os núcleos velhos podem sair
  if (ev.data === 'faxina') ev.waitUntil(faxina());
  if (ev.data === 'versao' && ev.source) ev.source.postMessage({ pingoVersao: VERSAO });
});

/** página aberta antes da atualização pedindo um pedaço de código da versão anterior */
async function doNucleoAntigo(url) {
  for (const nome of await caches.keys()) {
    if (!nome.startsWith(PREFIXO + 'n-') || nome === CACHE_NUCLEO) continue;
    const r = await (await caches.open(nome)).match(url);
    if (r) return r;
  }
  return null;
}
async function responder(req) {
  const nucleo = await caches.open(CACHE_NUCLEO);
  const pagina = () => nucleo.match(abs('index.html'));
  if (req.mode === 'navigate') { const p = await pagina(); if (p) return p; }
  const limpa = req.url.split('#')[0].split('?')[0];
  const doNucleo = await nucleo.match(limpa);
  if (doNucleo) return doNucleo;
  const antigo = req.mode === 'navigate' ? null : await doNucleoAntigo(limpa);
  if (antigo) return antigo;
  const h = (await mapa()).get(decodeURIComponent(limpa.slice(BASE.length)));
  const dados = h ? await caches.open(CACHE_DADOS) : null;
  if (dados) { const guardado = await dados.match(limpa + '?h=' + h); if (guardado) return guardado; }
  // página aberta antes da atualização, sem rede: vale a cópia guardada de qualquer versão do arquivo
  const deOutraVersao = async () => (await caches.open(CACHE_DADOS)).match(limpa, { ignoreSearch: true });
  try {
    const r = await fetch(req);
    // por demanda: o que é do pacote e ainda não estava guardado entra no cache ao ser usado
    if (dados && r.ok && r.type === 'basic') void dados.put(limpa + '?h=' + h, r.clone()).catch(() => undefined);
    if (!r.ok) { const v = await deOutraVersao(); if (v) return v; }
    return r;
  } catch (e) {
    if (req.mode === 'navigate') { const p = await pagina(); if (p) return p; }
    const v = await deOutraVersao(); if (v) return v;
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
