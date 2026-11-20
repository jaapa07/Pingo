/**
 * `npm run check`: verificador único de Adventures of Pingo. Roda tudo, resume e sai com 0 só se nada falhar.
 * Cada falha traz arquivo e motivo. Itens do mapa B / pós-jogo aparecem como "pendente" e não derrubam o resultado.
 *
 * Opções: `--offline` inclui os testes Playwright do pacote offline e da atualização (minutos), sobre o build limpo;
 *         `--rapido` pula o build limpo (clone do HEAD + npm run build numa pasta temporária, ~1 min);
 *         `--so-head` faz o build limpo só do HEAD, sem as alterações locais ainda não commitadas;
 *         `--tudo` mostra todos os avisos (por padrão, os 12 primeiros de cada checagem);
 *         `--so=progressao,niveis` roda só as checagens citadas.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RAIZ, carregar, novoAchado, type Achado } from './verify/dados';
import { integridade, detalhesMapaB } from './verify/integridade';
import { progressao, type ResultadoProgressao } from './verify/progressao';
import { niveis, sprites } from './verify/niveis';
import { buildLimpo, type ResultadoLimpo } from './verify/build-limpo';
import { pacote } from './verify/pacote';

const args = process.argv.slice(2);
const TUDO = args.includes('--tudo'), OFFLINE = args.includes('--offline'), RAPIDO = args.includes('--rapido'), SO_HEAD = args.includes('--so-head');
const SO = args.find((a) => a.startsWith('--so='))?.slice(5).split(',');
interface Linha extends Achado { id: string; nome: string; ms: number }
const linhas: Linha[] = [];

function rodarFilho(cmd: string, argv: string[], limiteMs = 300000): Promise<{ codigo: number; saida: string }> {
  return new Promise((ok) => {
    const p = spawn(cmd, argv, { cwd: RAIZ, env: { ...process.env, FORCE_COLOR: '0' } });
    let saida = ''; const junta = (b: Buffer) => { saida += b.toString(); };
    p.stdout.on('data', junta); p.stderr.on('data', junta);
    const t = setTimeout(() => { saida += '\n(tempo esgotado)'; p.kill('SIGKILL'); }, limiteMs);
    p.on('close', (c) => { clearTimeout(t); ok({ codigo: c ?? 1, saida }); });
    p.on('error', (e) => { clearTimeout(t); ok({ codigo: 1, saida: saida + String(e) }); });
  });
}
const bin = (n: string) => join(RAIZ, 'node_modules/.bin', n);
async function medir(id: string, nome: string, f: () => Promise<Achado>): Promise<Linha> {
  const t0 = Date.now(); let a: Achado;
  try { a = await f(); } catch (e) { a = novoAchado(); a.erros.push(`tools/verify.ts: a checagem "${nome}" quebrou — ${String((e as Error).stack ?? e).slice(0, 500)}`); }
  const l = { id, nome, ms: Date.now() - t0, ...a }; linhas.push(l); return l;
}

/* ------------------------------ checagens ------------------------------ */
async function tsc(): Promise<Achado> {
  const a = novoAchado(), r = await rodarFilho(bin('tsc'), ['--noEmit', '-p', '.']);
  for (const l of r.saida.split('\n')) { const m = /^(.+?)\((\d+),\d+\): error (TS\d+): (.*)$/.exec(l.trim()); if (m) a.erros.push(`${m[1]}:${m[2]}: ${m[3]} ${m[4]}`); }
  if (r.codigo && !a.erros.length) a.erros.push('tsconfig.json: tsc terminou com erro — ' + r.saida.trim().slice(0, 300));
  a.info.push('tsc --noEmit -p . (strict)');
  return a;
}
async function batalha(): Promise<Achado> {
  const a = novoAchado(), r = await rodarFilho(bin('tsx'), ['tools/test-batalha.ts']);
  for (const l of r.saida.split('\n')) if (/^\s*(FALHA|falhou|✗|x )\s/i.test(l)) a.erros.push('tools/test-batalha.ts: ' + l.trim().slice(0, 300));
  const m = /(\d+) testes? passaram, (\d+) falharam/.exec(r.saida);
  if (r.codigo && !a.erros.length) a.erros.push('tools/test-batalha.ts: terminou com erro — ' + r.saida.trim().split('\n').slice(-3).join(' | ').slice(0, 400));
  a.info.push(m ? `${m[1]} testes passaram, ${m[2]} falharam` : 'sem resumo na saída');
  return a;
}
async function zonas(arquivo: string): Promise<Achado> {
  const a = novoAchado(), r = await rodarFilho(bin('tsx'), [arquivo]), d = await carregar();
  const ls = r.saida.split('\n');
  /** arquivo de dados a que a linha se refere (zona, treinador ou evento citado), senão o próprio verificador */
  const dono = (t: string) => { const m = /\b(treinador|evento|zona) ([A-Za-z0-9_-]+)/.exec(t); return (m && (m[1] === 'treinador' ? d.arquivoDoTreinador.get(m[2]) : m[1] === 'evento' ? d.arquivoDoEvento.get(m[2]) : d.arquivoDaZona.get(m[2]))) || arquivo; };
  for (const l of ls) {
    const t = l.trim();
    if (t.startsWith('✗') || t.startsWith('ERRO')) { const z = /^[✗\s]*(?:ERRO ao carregar )?([A-Z][A-Za-z0-9-]*)(?:\.ts)?[: ]/.exec(t)?.[1]; a.erros.push(`${z && existsSync(`${RAIZ}src/data/zonas/${z}.ts`) ? `src/data/zonas/${z}.ts` : dono(t)}: ${t.replace(/^✗\s*/, '')}`.slice(0, 400)); }
    else if (t.startsWith('·') && !/zona de outro time ainda ausente/.test(t)) a.avisos.push(`${arquivo}: ${t.slice(1).trim()}`.slice(0, 300));
  }
  const ausentes = ls.filter((l) => /zona de outro time ainda ausente/.test(l)).length;
  if (ausentes) a.pendentes.push(`${ausentes} warp(s) para zonas de outro time ainda ausentes (mapa B)`);
  if (r.codigo && !a.erros.length) a.erros.push(`${arquivo}: terminou com erro — ` + r.saida.trim().split('\n').slice(-3).join(' | ').slice(0, 400));
  a.info.push(ls.filter((l) => l.trim()).slice(-1)[0]?.trim().slice(0, 160) ?? '');
  return a;
}
function arquivosDe(dir: string, saida: string[] = []): string[] {
  for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) arquivosDe(p, saida); else saida.push(p); }
  return saida;
}
async function palavras(): Promise<Achado> {
  const a = novoAchado();
  // as palavras são montadas em pedaços para este arquivo não conter o que ele mesmo proíbe
  const regras: [RegExp, string][] = [
    [new RegExp('\\b(' + ['TO' + 'DO', 'FIX' + 'ME'].join('|') + ')\\b'), 'marcador de pendência no código'],
    [new RegExp(['place' + 'holder', 'lo' + 'rem'].join('|'), 'i'), 'texto ou asset provisório'],
    [new RegExp('Math\\.' + 'random'), 'acaso fora do rng do jogo (use src/core/rng.ts)'],
    [new RegExp('<' + 'canvas|get' + 'Context', 'i'), 'canvas no runtime (proibido pelo spec 2.1)'],
  ];
  const lista = [...arquivosDe(RAIZ + 'src').filter((f) => /\.(ts|tsx|css|html|json|md|svg)$/.test(f)), RAIZ + 'index.html'];
  let n = 0;
  for (const f of lista) {
    const txt = readFileSync(f, 'utf8'); n++;
    if (!regras.some(([r]) => r.test(txt))) continue;
    txt.split('\n').forEach((l, i) => { for (const [r, motivo] of regras) { const m = r.exec(l); if (m) a.erros.push(`${relative(RAIZ, f)}:${i + 1}: "${m[0]}" — ${motivo}`); } });
  }
  a.info.push(`${n} arquivos de src/ e index.html sem palavras proibidas, acaso solto ou canvas`);
  return a;
}
/** `d`: pasta do dist a medir (a do build limpo, se houve; senão a local) */
async function dist(d: string, limpo: boolean): Promise<Achado> {
  const a = novoAchado();
  if (!existsSync(d + 'index.html')) { a.avisos.push('dist/: não existe — rode `npm run build` para medir o pacote'); return a; }
  const arqs = arquivosDe(d), bytes = arqs.reduce((s, f) => s + statSync(f).size, 0), mb = bytes / 1048576;
  // em disco cada arquivo ocupa blocos inteiros de 4 KB: com milhares de PNGs pequenos, o `du` mostra quase o dobro
  const emDisco = arqs.reduce((s, f) => s + Math.ceil(statSync(f).size / 4096) * 4096, 0) / 1048576;
  a.info.push(limpo ? `medido no dist do build limpo (${d})` : 'medido no dist/ local (sem build limpo nesta rodada)');
  if (!existsSync(d + 'sw.js') || !existsSync(d + 'pingo-arquivos.json')) a.erros.push('dist/sw.js: Service Worker ausente (o build não chegou a tools/build-sw.ts)');
  else {
    const lista = JSON.parse(readFileSync(d + 'pingo-arquivos.json', 'utf8')) as { v: string; arquivos: [string, string, number, string][] };
    const naLista = new Map(lista.arquivos.map((x) => [x[0], x]));
    let fora = 0, velhos = 0;
    for (const f of arqs) { const c = relative(d, f).split('\\').join('/'); if (c === 'sw.js' || c === 'pingo-arquivos.json') continue; const e = naLista.get(c); if (!e) fora++; else if (e[2] !== statSync(f).size) velhos++; }
    if (fora || velhos || naLista.size !== arqs.length - 2) a.erros.push(`dist/pingo-arquivos.json: lista do Service Worker não bate com o dist (${fora} arquivo(s) fora da lista, ${velhos} com tamanho diferente) — rode npm run build`);
    const sw = readFileSync(d + 'sw.js', 'utf8'); if (!sw.includes(JSON.stringify(lista.v))) a.erros.push('dist/sw.js: versão diferente da lista de arquivos');
    const g = (t: string) => lista.arquivos.filter((x) => x[3] === t);
    const soma = (t: string) => (g(t).reduce((s, x) => s + x[2], 0) / 1048576).toFixed(1);
    a.info.push(`${arqs.length} arquivos, ${mb.toFixed(1)} MB de conteúdo (≈${emDisco.toFixed(0)} MB em blocos de disco, o número do \`du\`) · pré-cache: núcleo ${g('n').length} (${soma('n')} MB) + resto ${g('r').length} (${soma('r')} MB) · por demanda ${g('d').length} (${soma('d')} MB) · versão ${lista.v}`);
  }
  const html = readFileSync(d + 'index.html', 'utf8');
  if (/(src|href)="\//.test(html)) a.erros.push('dist/index.html: caminho absoluto ("/…") — o jogo não abriria numa subpasta (vite.config.ts precisa de base: "./")');
  for (const [re, oque] of [[/rel="manifest"/, 'link do manifest'], [/apple-touch-icon/, 'ícone da Apple'], [/apple-mobile-web-app-capable/, 'meta apple-mobile-web-app-capable'], [/viewport-fit=cover/, 'viewport-fit=cover'], [/user-scalable=no/, 'user-scalable=no']] as [RegExp, string][]) if (!re.test(html)) a.erros.push(`dist/index.html: falta ${oque}`);
  for (const f of ['manifest.webmanifest', 'icones/apple-touch-icon.png', 'icones/icone-192.png', 'icones/icone-512.png', 'icones/icone-maskable-512.png']) if (!existsSync(d + f)) a.erros.push(`dist/${f}: ausente (PWA)`);
  if (mb > 300) a.erros.push(`dist/: ${mb.toFixed(0)} MB, acima do orçamento de 300 MB do spec 15A.3`);
  else if (mb > 60) a.avisos.push(`dist/: ${mb.toFixed(0)} MB, acima de 60 MB — o pré-cache guarda só o mapa A e o resto fica por demanda`);
  if (existsSync(RAIZ + 'docs/capturas/offline/resultado.json')) {
    const res = JSON.parse(readFileSync(RAIZ + 'docs/capturas/offline/resultado.json', 'utf8')) as { perfil: string; ok: boolean; precacheMs: number }[];
    if (res.some((x) => !x.ok)) a.avisos.push('docs/capturas/offline/resultado.json: o último teste offline teve falha (npm run test:offline)');
    a.info.push(`último teste offline: ${res.map((x) => `${x.perfil.split(' (')[0]} ${x.ok ? 'OK' : 'FALHOU'} (pré-cache ${(x.precacheMs / 1000).toFixed(0)} s)`).join(' · ')}`);
  } else a.avisos.push('teste offline ainda não rodou neste pacote (npm run test:offline)');
  return a;
}
async function offline(): Promise<Achado> {
  const a = novoAchado();
  const { testarOffline } = await import('./verify/offline');
  for (const r of await testarOffline(undefined, limpo?.dist)) { for (const f of r.falhas) a.erros.push(`tools/verify/offline.ts [${r.perfil}]: ${f}`); a.info.push(`${r.perfil}: ${r.ok ? 'OK' : 'FALHOU'}, pré-cache ${(r.precacheMs / 1000).toFixed(1)} s, atualização com o jogo aberto em ${(r.atualizacaoMs / 1000).toFixed(1)} s (${r.atualizacaoArquivos} arquivo(s))`); }
  const at = await rodarFilho(bin('tsx'), ['tools/verify/atualizacao.ts', ...(limpo?.dist ? [limpo.dist] : [])], 600000);
  for (const l of at.saida.split('\n')) if (l.startsWith('✗')) a.erros.push('tools/verify/atualizacao.ts: ' + l.slice(1).trim());
  if (at.codigo && !at.saida.includes('✗')) a.erros.push('tools/verify/atualizacao.ts: terminou com erro — ' + at.saida.trim().split('\n').slice(-3).join(' | ').slice(0, 400));
  a.info.push('atualização: ' + (at.codigo ? 'FALHOU' : at.saida.trim().split('\n').filter((l) => l.startsWith('·')).map((l) => l.slice(1).trim()).join(' · ')));
  return a;
}

/* ------------------------------ execução ------------------------------ */
let limpo: ResultadoLimpo | undefined;
const quer = (id: string) => !SO || SO.includes(id);
const t0 = Date.now();
console.log('Adventures of Pingo — npm run check\n');
// processos filhos em paralelo; as checagens de dados rodam neste processo
const filhos: Promise<unknown>[] = [];
if (quer('tsc')) filhos.push(medir('tsc', 'TypeScript (tsc --noEmit)', tsc));
if (quer('batalha')) filhos.push(medir('batalha', 'Testes de batalha', batalha));
if (quer('zonas-a1')) filhos.push(medir('zonas-a1', 'Zonas A1 (verifica-zonas-a1)', () => zonas('tools/verifica-zonas-a1.mts')));
if (quer('zonas-a2')) filhos.push(medir('zonas-a2', 'Zonas A2 (verifica-zonas-a2)', () => zonas('tools/verifica-zonas-a2.mts')));
if (quer('zonas-b1')) filhos.push(medir('zonas-b1', 'Zonas B1 (verifica-zonas-b1)', () => zonas('tools/verifica-zonas-b1.mts')));
if (!RAPIDO && quer('limpo')) filhos.push(medir('limpo', 'Build limpo (git clone do HEAD + npm run build, como no GitHub)', async () => (limpo = await buildLimpo(SO_HEAD))));
if (quer('palavras')) await medir('palavras', 'Palavras proibidas, acaso e canvas', palavras);
if (quer('integridade')) await medir('integridade', 'Integridade de dados (ids referenciados)', integridade);
let prog: ResultadoProgressao | undefined;
if (quer('progressao') || quer('niveis') || quer('sprites')) { const l = await medir('progressao', 'Progressão do mapa A (quarto → Liga)', async () => (prog = await progressao())); if (!quer('progressao')) linhas.splice(linhas.indexOf(l), 1); }
if (prog && quer('niveis')) await medir('niveis', 'Curva de níveis (líderes, Liga, treinadores, selvagens)', () => niveis(prog!));
if (prog && quer('sprites')) await medir('sprites', 'Sprites das espécies do mapa A', () => sprites(prog!));
await Promise.all(filhos);
const pastaDist = limpo?.dist ? limpo.dist + '/' : RAIZ + 'dist/';
if (quer('pacote')) await medir('pacote', 'Arquivos do mapa A no pacote publicado', async () => { if (existsSync(pastaDist + 'index.html')) return pacote(pastaDist, limpo?.dist ? 'dist limpo' : 'dist'); const a = novoAchado(); a.avisos.push('dist/: não existe — rode `npm run build` (ou o check sem --rapido) para conferir o pacote'); return a; });
if (OFFLINE && quer('offline')) await medir('offline', 'Pacote offline e atualização no navegador (Playwright)', offline);
if (quer('dist')) await medir('dist', 'Pacote dist/ e PWA', () => dist(pastaDist, !!limpo?.dist));

const ORDEM = ['tsc', 'batalha', 'zonas-a1', 'zonas-a2', 'palavras', 'integridade', 'progressao', 'niveis', 'sprites', 'limpo', 'pacote', 'offline', 'dist'];
linhas.sort((x, y) => ORDEM.indexOf(x.id) - ORDEM.indexOf(y.id));
for (const l of linhas) {
  const marca = l.erros.length ? '✗ FALHOU' : l.avisos.length ? '✓ ok (com avisos)' : '✓ ok';
  console.log(`${marca}  ${l.nome}  [${(l.ms / 1000).toFixed(1)} s]`);
  for (const i of l.info) if (i) console.log(`     ${i}`);
  if (l.id === 'progressao' && prog) for (const p of prog.passos) console.log(`     ${p.insignias} insígnia(s): ${p.disponiveis.length ? 'abre o líder ' + p.disponiveis.join(', ') : p.insignias === 8 ? 'Liga vencida' : 'nenhum líder novo'} · Amuletos [${p.amuletos.join(', ')}]${p.zonasNovas.length ? ' · zonas novas: ' + p.zonasNovas.join(' ') : ''}`);
  for (const e of l.erros) console.log(`     ✗ ${e}`);
  const av = TUDO ? l.avisos : l.avisos.slice(0, 12);
  for (const e of av) console.log(`     ! AVISO ${e}`);
  if (av.length < l.avisos.length) console.log(`     ! … e mais ${l.avisos.length - av.length} aviso(s) (use --tudo)`);
  for (const e of l.pendentes) console.log(`     ~ pendente: ${e}`);
  if (l.id === 'integridade' && TUDO) for (const e of detalhesMapaB) console.log(`       · ${e}`);
}
const nE = linhas.reduce((s, l) => s + l.erros.length, 0), nA = linhas.reduce((s, l) => s + l.avisos.length, 0), nP = linhas.reduce((s, l) => s + l.pendentes.length, 0);
const falhas = linhas.filter((l) => l.erros.length);
console.log(`\n===== RESUMO: ${linhas.length - falhas.length} de ${linhas.length} checagens passaram · ${nE} erro(s) · ${nA} aviso(s) · ${nP} pendente(s) do mapa B/pós-jogo · ${((Date.now() - t0) / 1000).toFixed(0)} s =====`);
if (falhas.length) console.log('Falharam: ' + falhas.map((l) => l.nome).join(' · '));
if (RAPIDO) console.log('(build limpo pulado com --rapido: rode sem a opção antes de enviar ao GitHub)');
if (!OFFLINE) console.log('(teste offline e de atualização no navegador: npm run check -- --offline)');
process.exit(nE ? 1 : 0);
