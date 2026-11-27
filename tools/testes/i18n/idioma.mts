/**
 * Idiomas (docs/I18N.md), no servidor de desenvolvimento (`npx vite --port 5391`; outra porta: I18N_URL):
 *  1. iPhone 13 (toque), navegador em inglês, 1ª abertura: tela de idioma com English pré-selecionado → título em inglês;
 *  2. tela de título → "Language: English" → Português: recarrega e o título volta ao português; e de volta ao inglês;
 *  3. save feito em português (o da QA) abre em inglês: menu, equipe, mochila e uma batalha selvagem (fotos);
 *  4. PC 1280×720 (teclado), navegador em português, 1ª abertura: Português pré-selecionado; jogo idêntico ao de antes.
 * Fotos em I18N_FOTOS (padrão: scratchpad). Lista no fim os textos que apareceram em inglês sem tradução.
 * Uso: npx tsx tools/testes/i18n/idioma.mts
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { pw, RAIZ, ARGS_CHROMIUM, controle, gravarNoSlot, topo } from '../demo/lib.mts';

const URL_BASE = process.env.I18N_URL ?? 'http://localhost:5391/';
const FOTOS = (process.env.I18N_FOTOS ?? '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/i18n-fotos') + '/';
mkdirSync(FOTOS, { recursive: true });
const browser = await pw.chromium.launch({ args: ARGS_CHROMIUM });
const falhas: string[] = [];
const faltas = new Set<string>();
const conferir = (cond: boolean, msg: string) => { console.log('  ' + (cond ? 'OK  ' : 'FALHA ') + msg); if (!cond) falhas.push(msg); };

async function abrir(perfil: 'iphone' | 'pc', locale: string) {
  const ctx = await browser.newContext(perfil === 'iphone' ? { ...pw.devices['iPhone 13'], locale } : { viewport: { width: 1280, height: 720 }, locale });
  const page = await ctx.newPage();
  page.on('console', (m: any) => { const t = m.text(); const k = /^\[i18n\] sem tradução: (.*)$/.exec(t); if (k) faltas.add(k[1]); else if (m.type() === 'error') falhas.push(`[${perfil}] console: ${t.slice(0, 200)}`); });
  page.on('pageerror', (e: any) => falhas.push(`[${perfil}] erro na página: ${String(e).slice(0, 200)}`));
  const cdp = perfil === 'iphone' ? await ctx.newCDPSession(page) : undefined;
  const c = controle(page, page, perfil === 'iphone' ? 'toque' : 'teclado', cdp);
  const ev = <T,>(f: (a: any) => T, a?: unknown): Promise<T> => page.evaluate(f, a);
  const foto = (n: string) => page.screenshot({ path: FOTOS + n + '.png' }).catch(() => undefined);
  const pronto = () => page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  return { ctx, page, c, ev, foto, pronto };
}
const telaTopo = (ev: any) => ev(() => { const p = (window as any).__pingo.telas.pilha; return String(p[p.length - 1]?.el.className ?? ''); });
/** espera a tela do título (pula a abertura com A) */
async function ateTitulo(c: any) { return c.avancar((s: any) => /titulo/.test(topo(s)) && !s.cortina, 40000, 'título'); }

try {
  console.log('== 1. iPhone 13, navegador em inglês, 1ª abertura — ' + URL_BASE);
  let { ctx, page, c, ev, foto, pronto } = await abrir('iphone', 'en-US');
  await page.goto(URL_BASE); await pronto(); await c.dormir(800);
  conferir(/idioma/.test(await telaTopo(ev)), `tela de idioma antes de tudo (topo: ${await telaTopo(ev)})`);
  conferir((await ev(() => (window as any).__pingo.i18n.idiomaAtual())) === 'en', 'English pré-selecionado pelo navegador');
  await foto('1-iphone-idioma');
  await c.apertar('a'); await ateTitulo(c); await c.dormir(800); await foto('1-iphone-titulo-en');
  const op = await ev(() => JSON.parse(localStorage.getItem('pingo.opcoes') ?? '{}'));
  conferir(op.idioma === 'en', `opção gravada: idioma=${op.idioma}`);
  conferir((await ev(() => (window as any).__pingo.i18n.t('Jogar'))) !== 'Jogar', `catálogo carregado: Jogar → ${await ev(() => (window as any).__pingo.i18n.t('Jogar'))}`);

  console.log('== 2. Troca pela tela de título (recarrega)');
  await c.apertar('baixo'); await c.dormir(150); await c.apertar('baixo'); await c.dormir(150); await c.apertar('a'); await c.dormir(1500);
  conferir(/idioma/.test(await telaTopo(ev)), 'tela de idioma aberta pelo título');
  await c.apertar('cima'); await c.dormir(150);
  await c.dormir(300); await Promise.all([page.waitForEvent('framenavigated', { timeout: 30000 }), c.apertar('a')]); await c.dormir(1500); await pronto(); await ateTitulo(c);
  conferir((await ev(() => (window as any).__pingo.i18n.idiomaAtual())) === 'pt', 'depois de escolher Português: título em português');
  await foto('2-iphone-titulo-pt');
  await c.apertar('baixo'); await c.dormir(150); await c.apertar('baixo'); await c.dormir(150); await c.apertar('a'); await c.dormir(1500);
  await c.apertar('baixo'); await c.dormir(150);
  await c.dormir(300); await Promise.all([page.waitForEvent('framenavigated', { timeout: 30000 }), c.apertar('a')]); await c.dormir(1500); await pronto(); await ateTitulo(c);
  conferir((await ev(() => (window as any).__pingo.i18n.idiomaAtual())) === 'en', 'e de volta ao inglês');

  console.log('== 3. Save feito em português abre em inglês');
  const base = JSON.parse(readFileSync(RAIZ + 'tools/testes/qa/saves/mata-pre-lider-2.json', 'utf8')).save;
  await gravarNoSlot(page, base, 0);
  await ev(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  await c.apertar('a'); // Play
  let s = await c.continuarSlot(0);
  conferir(!!s.zona, `continuou o save em ${s.zona}`);
  await c.dormir(800); await foto('3-iphone-mundo');
  await c.apertar('menu'); await c.dormir(700); await foto('3-iphone-menu');
  await c.apertar('a'); await c.dormir(900); await foto('3-iphone-diario');
  await c.apertar('b'); await c.dormir(500); await c.apertar('baixo'); await c.dormir(150); await c.apertar('a'); await c.dormir(900); await foto('3-iphone-equipe');
  await c.apertar('b'); await c.dormir(500); await c.apertar('baixo'); await c.dormir(150); await c.apertar('a'); await c.dormir(900); await foto('3-iphone-mochila');
  await c.apertar('b'); await c.dormir(500); await c.apertar('b'); await c.dormir(500);
  // batalha selvagem: Tico-tico nível 5
  await ev(() => { void (window as any).__pingo.mundo.rodarPassos([['selvagem', 10, 5]]); });
  await c.dormir(2500); await foto('3-iphone-batalha-1');
  for (let i = 0; i < 6; i++) { await c.apertar('a'); await c.dormir(700); }
  await foto('3-iphone-batalha-2');
  for (let i = 0; i < 40; i++) { const t = await telaTopo(ev); if (!/batalha/.test(t)) break; await c.apertar('a'); await c.dormir(500); if (i === 6) await foto('3-iphone-batalha-3'); }
  await ctx.close();

  console.log('== 4. PC 1280×720, navegador em português, 1ª abertura');
  ({ ctx, page, c, ev, foto, pronto } = await abrir('pc', 'pt-BR'));
  await page.goto(URL_BASE); await pronto(); await c.dormir(800);
  conferir(/idioma/.test(await telaTopo(ev)), 'tela de idioma na 1ª abertura');
  conferir((await ev(() => (window as any).__pingo.i18n.idiomaAtual())) === 'pt', 'Português pré-selecionado');
  await foto('4-pc-idioma');
  await c.apertar('a'); await ateTitulo(c); await c.dormir(800); await foto('4-pc-titulo-pt');
  // um jogador antigo (opções sem o campo idioma) fica em português e não vê a tela de idioma
  await ev(() => { localStorage.setItem('pingo.opcoes', JSON.stringify({ musica: 0.5 })); });
  await page.reload(); await pronto(); await c.dormir(800);
  conferir(!/idioma/.test(await telaTopo(ev)) && (await ev(() => (window as any).__pingo.i18n.idiomaAtual())) === 'pt', 'opções antigas sem idioma: português, sem tela de idioma');
  // batalha em inglês pelo atalho de teste
  await page.goto(URL_BASE + '?batalha=10,5&idioma=en'); await pronto(); await c.dormir(3000); await foto('4-pc-batalha-en');
  for (let i = 0; i < 4; i++) { await c.apertar('a'); await c.dormir(1500); }
  await foto('4-pc-batalha-en-2');
  await ctx.close();
} catch (e) { falhas.push('exceção: ' + String((e as Error).stack ?? e).slice(0, 600)); }
await browser.close();
console.log(`\nTextos que apareceram em inglês sem tradução (${faltas.size}):`);
for (const f of faltas) console.log('  ' + f);
console.log(falhas.length ? `\n${falhas.length} FALHA(S):\n  ` + falhas.join('\n  ') : '\nTudo certo. Fotos em ' + FOTOS);
process.exit(falhas.length ? 1 : 0);
