/**
 * Pacotes extras do jogo (docs/DEMO.md). O `npm run build` normal (site, PC, iPhone) NÃO passa por aqui.
 *
 *   tsx tools/build-pacote.ts demo           → dist-demo/      demo para o GitHub Pages de jaapa07/Pingo-demo1
 *                                              (base DEMO_BASE, padrão /Pingo-demo1/; Service Worker e offline)
 *   tsx tools/build-pacote.ts itch           → dist-itch/ + pingo-demo-itch.zip        demo para o itch.io
 *   tsx tools/build-pacote.ts itch-completo  → dist-itch-completo/ + pingo-completo-itch.zip   jogo completo para o itch.io
 *
 * Demo (`VITE_DEMO=1`, src/core/demo.ts): o pacote só leva os bakes das zonas de `ZONAS_DEMO` (as outras não abrem).
 * itch.io (`VITE_SEM_SW=1`, `VITE_PACOTES=1`): base relativa `./`, sem Service Worker (o jogo roda num iframe de outro
 * domínio) e com `assets/zonas|arenas|sprites` juntados em `pacotes/*.bin` (o itch aceita ~1000 arquivos por .zip;
 * src/core/pacotes.ts lê os pacotes no navegador). O .zip tem o index.html na raiz.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync, openSync, writeSync, closeSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { ZONAS_DEMO } from '../src/core/demo';
import { gerar } from './build-sw';

type Modo = 'demo' | 'itch' | 'itch-completo';
const RAIZ = new URL('..', import.meta.url).pathname;
const modo = process.argv[2] as Modo;
if (!['demo', 'itch', 'itch-completo'].includes(modo)) { console.error('uso: tsx tools/build-pacote.ts demo|itch|itch-completo'); process.exit(2); }

const CONF: Record<Modo, { pasta: string; zip?: string; base: string; env: Record<string, string>; demo: boolean }> = {
  demo: { pasta: 'dist-demo', base: process.env.DEMO_BASE || '/Pingo-demo1/', env: { VITE_DEMO: '1' }, demo: true },
  itch: { pasta: 'dist-itch', zip: 'pingo-demo-itch.zip', base: './', env: { VITE_DEMO: '1', VITE_SEM_SW: '1', VITE_PACOTES: '1' }, demo: true },
  'itch-completo': { pasta: 'dist-itch-completo', zip: 'pingo-completo-itch.zip', base: './', env: { VITE_SEM_SW: '1', VITE_PACOTES: '1' }, demo: false },
};
const c = CONF[modo], DIST = join(RAIZ, c.pasta);
const base = c.base.endsWith('/') ? c.base : c.base + '/';

function andar(dir: string, saida: string[] = []): string[] {
  for (const nome of readdirSync(dir).sort()) { const p = join(dir, nome); if (statSync(p).isDirectory()) andar(p, saida); else saida.push(p); }
  return saida;
}
const rel = (p: string) => relative(DIST, p).split(sep).join('/');
const mb = (b: number) => (b / 1048576).toFixed(1) + ' MB';

// 1. vite build com as chaves do pacote (as variáveis VITE_* do ambiente de quem chama não vazam para cá)
const env: NodeJS.ProcessEnv = { ...process.env };
for (const k of Object.keys(env)) if (k.startsWith('VITE_')) delete env[k];
Object.assign(env, c.env);
const r = spawnSync('npx', ['vite', 'build', '--outDir', c.pasta, '--emptyOutDir', '--base', base, '--logLevel', 'warn'], { cwd: RAIZ, env, stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);

// 2. demo: só os bakes das zonas liberadas (as outras nunca abrem: src/world/index.ts → irPara)
if (c.demo) {
  const pz = join(DIST, 'assets', 'zonas');
  let fora = 0;
  for (const z of readdirSync(pz)) if (!ZONAS_DEMO.includes(z)) { rmSync(join(pz, z), { recursive: true, force: true }); fora++; }
  console.log(`[pacote] demo: ${ZONAS_DEMO.length} zonas no pacote (${fora} pastas de zona fora da demo removidas)`);
  // nome do app instalado e título da aba
  const man = join(DIST, 'manifest.webmanifest');
  const m = JSON.parse(readFileSync(man, 'utf8')) as Record<string, unknown>;
  m.name = 'Adventures of Pingo (Demo)'; m.short_name = 'Pingo Demo';
  writeFileSync(man, JSON.stringify(m, null, 2) + '\n');
  const ix = join(DIST, 'index.html');
  writeFileSync(ix, readFileSync(ix, 'utf8').replace('<title>Adventures of Pingo</title>', '<title>Adventures of Pingo — Demo</title>').replace('content="Pingo"', 'content="Pingo Demo"'));
}

// 3. GitHub Pages: Service Worker com prefixo de cache próprio (o jogo completo divide o domínio jaapa07.github.io)
if (modo === 'demo') {
  const s = gerar(DIST, 'pingodemo-');
  // GitHub Pages sem Jekyll: senão os arquivos que começam com "_" (ex.: assets/_pecas-*.js) não são publicados
  writeFileSync(join(DIST, '.nojekyll'), '');
  console.log(`[pacote] sw: versão ${s.versao}, ${s.total} arquivos, ${mb(s.bytes)} (núcleo ${s.nucleo}, resto ${s.resto}, demanda ${s.demanda})`);
}

/** pastas dos sprites dos três iniciais (src/data/eventos/a1.ts: nº 1, 4 e 7) */
const INICIAIS = ['tamandui', 'guaraxim', 'botinho'];
// 4. itch.io: junta zonas/arenas/sprites em pacotes e fecha o .zip
if (c.zip) {
  for (const f of ['sw.js', 'pingo-arquivos.json']) rmSync(join(DIST, f), { force: true });
  const grupos = new Map<string, string[]>();
  const por = (g: string, arq: string) => { let l = grupos.get(g); if (!l) grupos.set(g, (l = [])); l.push(arq); };
  const criaturas = existsSync(join(DIST, 'assets/sprites/criatura')) ? readdirSync(join(DIST, 'assets/sprites/criatura')).sort() : [];
  for (const p of andar(join(DIST, 'assets'))) {
    const k = rel(p);
    let m: RegExpExecArray | null;
    if ((m = /^assets\/zonas\/([^/]+)\//.exec(k))) por('z-' + m[1], k);
    else if (k.startsWith('assets/arenas/')) por('arenas', k);
    else if (k.startsWith('assets/sprites/pessoa/')) por('pessoas', k);
    // os três iniciais (sem a Pelagem Rara) num pacote pequeno só deles: o jogo os pede logo no começo, para a mesa da
    // Profª Ipê mostrar a criatura na hora (src/world/precarga.ts; feedback de jogador em docs/UI-CORRECOES.md)
    else if ((m = /^assets\/sprites\/criatura\/([^/]+)\/[^/]+$/.exec(k)) && INICIAIS.includes(m[1]) && !/-rara\.png$/.test(k)) por('criaturas-iniciais', k);
    else if ((m = /^assets\/sprites\/criatura\/([^/]+)\//.exec(k))) por('criaturas-' + String(Math.floor(criaturas.indexOf(m[1]) / 4)).padStart(2, '0'), k);
    else if (k.startsWith('assets/sprites/')) por('sprites', k);
  }
  const dirPac = join(DIST, 'pacotes');
  mkdirSync(dirPac, { recursive: true });
  const indice: { pacotes: string[]; arquivos: Record<string, [number, number, number]> } = { pacotes: [], arquivos: {} };
  let empacotados = 0, bytes = 0;
  for (const [g, arqs] of [...grupos].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const n = indice.pacotes.push(g + '.bin') - 1, fd = openSync(join(dirPac, g + '.bin'), 'w');
    let pos = 0;
    for (const k of arqs) { const d = readFileSync(join(DIST, k)); writeSync(fd, d); indice.arquivos[k] = [n, pos, d.length]; pos += d.length; rmSync(join(DIST, k)); empacotados++; }
    closeSync(fd); bytes += pos;
  }
  writeFileSync(join(dirPac, 'indice.json'), JSON.stringify(indice));
  // pastas que ficaram vazias
  const limpar = (d: string): boolean => { let vazia = true; for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory() ? !limpar(p) : true) vazia = false; } if (vazia) rmSync(d, { recursive: true }); return vazia; };
  limpar(join(DIST, 'assets'));
  const todos = andar(DIST);
  const total = todos.reduce((s, p) => s + statSync(p).size, 0);
  console.log(`[pacote] itch: ${empacotados} arquivos em ${indice.pacotes.length} pacotes (${mb(bytes)}); ${todos.length} arquivos no total, ${mb(total)}`);
  if (todos.length > 1000) { console.error(`[pacote] ERRO: ${todos.length} arquivos (o itch.io aceita até 1000 por .zip)`); process.exit(1); }
  const zip = join(RAIZ, c.zip);
  rmSync(zip, { force: true });
  const z = spawnSync('zip', ['-q', '-r', '-X', zip, '.'], { cwd: DIST, stdio: 'inherit' });
  if (z.status !== 0) { console.error('[pacote] o comando zip falhou'); process.exit(1); }
  console.log(`[pacote] ${c.zip}: ${mb(statSync(zip).size)} (index.html na raiz)`);
}
console.log(`[pacote] pronto: ${c.pasta}/ (base ${base})`);
