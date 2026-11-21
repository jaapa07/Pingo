/**
 * Pacote do itch.io DENTRO de um iframe de outra origem (como o itch.io serve: página em um domínio, jogo em outro).
 * O .zip é extraído numa pasta nova e servido em http://127.0.0.1:5421/jogo/; a "página do itch" fica em
 * http://localhost:5422/ com um iframe de 960×540 (outro site: o navegador isola o armazenamento do iframe).
 *  1. carrega: título, nenhum Service Worker, nenhum pedido falho; arquivos vêm dos pacotes (blob:);
 *  2. joga: continua um save, anda pelo teclado, uma batalha selvagem (sprites e arena dos pacotes);
 *  3. salva pelo menu, recarrega a página e confere o save no localStorage do iframe;
 *  4. escala: 960×540, "tela cheia" (iframe 1920×1080) e celular (iPhone 13 deitado e em pé, por toque) — fotos;
 *  5. (completo) save pós-Liga → B1 (Vila Cascavel), B2 e PP (mapa B) carregam.
 * Uso: npm run build:itch && npx tsx tools/testes/demo/itch.mts demo
 *      npm run build:itch:completo && npx tsx tools/testes/demo/itch.mts completo
 */
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { servir } from '../../verify/servidor';
import { pw, RAIZ, FOTOS, ARGS_CHROMIUM, TURBO, controle, gravarNoSlot, vigiar, livre, topo } from './lib.mts';

const QUAL = (process.argv[2] ?? 'demo') as 'demo' | 'completo';
const ZIP = RAIZ + (QUAL === 'demo' ? 'pingo-demo-itch.zip' : 'pingo-completo-itch.zip');
if (!existsSync(ZIP)) throw new Error(`rode npm run build:itch${QUAL === 'demo' ? '' : ':completo'} antes`);
const PASTA = FOTOS + '../itch-' + QUAL + '-extraido';
rmSync(PASTA, { recursive: true, force: true }); mkdirSync(PASTA, { recursive: true });
execFileSync('unzip', ['-q', ZIP, '-d', PASTA]);
if (!existsSync(PASTA + '/index.html')) throw new Error('o .zip não tem index.html na raiz');
const jogo = await servir(PASTA, 5421, '/jogo/');
const URL_JOGO = 'http://127.0.0.1:5421/jogo/index.html';
let largura = '960px', altura = '540px';
const PAI = createServer((req, res) => {
  const q = new URL(req.url ?? '/', 'http://x').searchParams; const w = q.get('w') ?? largura, h = q.get('h') ?? altura;
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>página do itch (teste)</title>
<style>html,body{margin:0;background:#222;color:#ddd;font:14px sans-serif}${w === '100vw' ? 'iframe{position:fixed;inset:0}' : 'body{padding:20px}'}</style></head>
<body>${w === '100vw' ? '' : '<p>Adventures of Pingo — página de teste em outra origem</p>'}
<iframe id="jogo" src="${URL_JOGO}" style="width:${w};height:${h};border:0" allowfullscreen allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer" scrolling="no" frameborder="0"></iframe></body></html>`);
});
await new Promise<void>((ok) => PAI.listen(5422, ok));
const URL_PAI = 'http://localhost:5422/';

const browser = await pw.chromium.launch({ args: ARGS_CHROMIUM });
const falhas: string[] = [];
const log = (s: string) => console.log('  ' + s);
const conferir = (cond: boolean, msg: string) => { log((cond ? 'OK  ' : 'FALHA ') + msg); if (!cond) falhas.push(msg); };
const quadro = async (page: any) => { for (let i = 0; i < 100; i++) { const f = page.frames().find((x: any) => x.url().startsWith('http://127.0.0.1:5421/')); if (f) return f; await page.waitForTimeout(100); } throw new Error('iframe do jogo não apareceu'); };
const pronto = async (f: any) => { await f.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 }); await f.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; }); };
const pedidos: string[] = [];

try {
  console.log(`== itch.io (${QUAL}) num iframe de outra origem — ${URL_PAI} → ${URL_JOGO}`);
  const n = execFileSync('unzip', ['-Z1', ZIP]).toString().trim().split('\n').filter((l) => !l.endsWith('/')).length;
  conferir(n <= 1000, `${ZIP.replace(RAIZ, '')}: ${n} arquivos (limite do itch.io: 1000), index.html na raiz`);

  /* 1–3. PC, 960×540 */
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  vigiar(page, falhas);
  page.on('request', (q: any) => pedidos.push(q.url()));
  await page.addInitScript(TURBO, 3);
  await page.goto(URL_PAI);
  let f = await quadro(page);
  await pronto(f);
  const c = controle(page, f, 'teclado');
  await page.click('#jogo'); // foco no iframe (como o clique em "Run game" do itch)
  await c.avancar((s) => /titulo/.test(topo(s)), 30000, 'título').catch(() => undefined);
  await c.dormir(1200);
  await page.screenshot({ path: FOTOS + `itch-${QUAL}-1-titulo-960x540.png` });
  const sw = await f.evaluate(async () => ({ regs: (await navigator.serviceWorker?.getRegistrations?.())?.length ?? 0, ctrl: !!navigator.serviceWorker?.controller, origem: location.origin, topo: (() => { try { return window.top!.location.href; } catch { return 'outra origem (bloqueado)'; } })() }));
  conferir(sw.regs === 0 && !sw.ctrl && !pedidos.some((u) => /sw\.js|pingo-arquivos\.json/.test(u)), `sem Service Worker (registros ${sw.regs}, controlado ${sw.ctrl}); iframe em ${sw.origem}, página de cima: ${sw.topo}`);
  const esc = await f.evaluate(() => { const p = (window as any).__pingo.palco; return { escala: p.escala, w: p.w, h: p.h, vw: p.vw, vh: p.vh, modo: p.modo }; });
  conferir(esc.w <= esc.vw && esc.h <= esc.vh && esc.escala >= 2, `escala no iframe 960×540: ${JSON.stringify(esc)}`);

  // save preparado e Continuar pelo teclado
  const save = QUAL === 'completo'
    ? JSON.parse(readFileSync(RAIZ + 'tools/testes/posliga/saves/pos-r1-lider-05.json', 'utf8'))
    : JSON.parse(readFileSync(RAIZ + 'tools/testes/demo/saida/demo-save.json', 'utf8'));
  await gravarNoSlot(f, save, 0);
  let s = await c.continuarSlot(0);
  conferir(s.zona === save.jogador.zona, `continuou o Jogo 1 em ${s.zona} (${s.x},${s.y})`);
  let passos = 0; for (const d of ['baixo', 'baixo', 'dir', 'dir', 'cima', 'esq'] as const) { if (await c.andar(d)) passos++; await c.avancar(livre, 20000, 'livre'); }
  conferir(passos >= 3, `andou ${passos} passos pelo teclado`);
  const blobs = await f.evaluate(() => { const ch = [...document.querySelectorAll('.chunk')] as HTMLElement[]; return { chunks: ch.length, blob: ch.filter((e) => e.style.backgroundImage.includes('blob:')).length, pac: (window as any).__pingoPacotes?.carregados?.() }; });
  conferir(blobs.chunks > 0 && blobs.blob === blobs.chunks, `mapa vem dos pacotes: ${blobs.blob}/${blobs.chunks} chunks com blob:, pacotes ${JSON.stringify(blobs.pac)}`);
  await page.screenshot({ path: FOTOS + `itch-${QUAL}-2-mundo.png` });
  // batalha selvagem: criatura e arena vêm de pacotes
  void f.evaluate(() => { const p = (window as any).__pingo; void p.mundo.batalhaSelvagem(13, 5); });
  await f.waitForFunction(() => (window as any).__pingo.telas.pilha.some((t: any) => /batalha/.test(t.el.className)), null, { timeout: 60000 });
  await c.dormir(2500);
  await page.screenshot({ path: FOTOS + `itch-${QUAL}-3-batalha.png` });
  const bt = await f.evaluate(() => { const els = [...document.querySelectorAll('.tela.batalha *')] as HTMLElement[]; const bg = els.map((e) => e.style.backgroundImage).filter((b) => b && b.includes('url(')); return { blob: bg.filter((b) => b.includes('blob:')).length, vazias: bg.filter((b) => b.includes('data:image/gif')).length, assets: bg.filter((b) => /assets\/(sprites|arenas)/.test(b)).length }; });
  conferir(bt.blob > 0 && bt.assets === 0 && bt.vazias === 0, `batalha com sprites/arena dos pacotes: ${JSON.stringify(bt)}`);
  s = await c.avancar(livre, 120000, 'fim da batalha');
  // salva pelo menu (Diário?, Equipe, Mochila, Rádio?, Perfil → Salvar)
  const antes = await f.evaluate(() => (window as any).__pingo.save.listarSlots()[0]?.quando ?? 0);
  await c.andar('baixo'); await c.avancar(livre, 20000, 'livre');
  s = await c.st();
  await c.apertar('menu'); await c.dormir(500);
  const idx = await f.evaluate(() => { const v = (window as any).__pingo.jogo.save; let k = 0; if (v.mochila['diario-de-campo'] || v.flags['ovo-entregue'] || v.diario.visto.length) k++; if (v.equipe.length) k++; k++; if (v.mochila['radio-cipo'] || v.flags['intro-ok']) k++; return k + 1; });
  const focoMenu = () => f.evaluate(() => { const x = document.querySelector('.tela-menu .foco'); return x?.parentElement ? [...x.parentElement.children].indexOf(x) : -1; });
  for (let i = 0; i < 16 && (await focoMenu()) !== idx; i++) { await c.apertar('baixo'); await c.dormir(120); }
  await c.apertar('a'); await c.dormir(500); await c.apertar('a'); await c.dormir(700);
  await page.screenshot({ path: FOTOS + `itch-${QUAL}-4-salvou.png` });
  for (let i = 0; i < 6; i++) { const q = await c.st(); if (livre(q)) break; await c.apertar(/menu/.test(topo(q)) ? 'b' : 'a'); await c.dormir(250); }
  const ls = await f.evaluate(() => { const k = Object.keys(localStorage).sort(); const r = JSON.parse(localStorage.getItem(k.find((x) => /slot\.0$/.test(x)) ?? '') ?? 'null'); return { chaves: k, quando: r?.quando ?? 0, zona: r?.resumo?.zona, x: r?.dados?.jogador?.x, y: r?.dados?.jogador?.y }; });
  conferir(ls.quando > antes && ls.zona === s.zona && ls.x === s.x && ls.y === s.y, `Salvar gravou no localStorage do iframe (${ls.chaves.join(', ')}): ${ls.zona} (${ls.x},${ls.y})`);
  // recarrega a página "do itch" e continua
  await page.reload();
  f = await quadro(page); await pronto(f); await page.click('#jogo');
  const c2 = controle(page, f, 'teclado');
  const s2 = await c2.continuarSlot(0);
  conferir(s2.zona === s.zona && s2.x === s.x && s2.y === s.y, `recarregou a página e o save continuou: ${s2.zona} (${s2.x},${s2.y})`);

  /* 5. completo: mapa B */
  if (QUAL === 'completo') {
    for (const [z, x, y] of [['B1', 0, 0], ['B2', 0, 0], ['PP', 0, 0]] as [string, number, number][]) {
      const r = await f.evaluate(async ({ z, x, y }: any) => {
        const m = (window as any).__pingo.mundo;
        try { await m.irPara(z, x || 10, y || 10, 's', 'nenhuma'); } catch (e) { return { zona: 'erro ' + e }; }
        await new Promise((ok) => setTimeout(ok, 800));
        const ch = [...document.querySelectorAll('.chunk')] as HTMLElement[];
        return { zona: m.zona?.id, modo: (document.querySelector('[data-zona]') as HTMLElement)?.dataset.modo, chunks: ch.length, blob: ch.filter((e) => e.style.backgroundImage.includes('blob:')).length, outros: ch.filter((e) => !e.style.backgroundImage.includes('blob:')).map((e) => e.className + ' ' + e.style.backgroundImage.slice(0, 60)).slice(0, 3) };
      }, { z, x, y });
      if (r.zona === z) { await c2.dormir(600); await page.screenshot({ path: FOTOS + `itch-completo-5-${z}.png` }); }
      conferir(r.zona === z && r.modo === 'bake' && r.chunks > 0 && r.blob >= r.chunks - r.outros.filter((o: string) => /peca/.test(o)).length, `mapa B: ${z} → ${JSON.stringify(r)}`);
    }
  }
  await ctx.close();

  /* 4. escala: "tela cheia" (iframe ocupando 1920×1080) e celular */
  const telas = [
    { nome: 'tela-cheia-1920x1080', ctx: { viewport: { width: 1920, height: 1080 } }, w: '100vw', h: '100vh' },
    { nome: 'iphone-deitado', ctx: { ...pw.devices['iPhone 13 landscape'] }, w: '100vw', h: '100vh' },
    { nome: 'iphone-em-pe', ctx: { ...pw.devices['iPhone 13'] }, w: '100vw', h: '100vh' },
  ];
  for (const t of telas) {
    const cx = await browser.newContext(t.ctx);
    const pg = await cx.newPage(); vigiar(pg, falhas);
    await pg.goto(`${URL_PAI}?w=${t.w}&h=${t.h}`);
    const fr = await quadro(pg); await pronto(fr);
    await pg.waitForTimeout(2500);
    const e = await fr.evaluate(() => { const p = (window as any).__pingo.palco; return { escala: +p.escala.toFixed(2), w: Math.round(p.w), h: Math.round(p.h), vw: p.vw, vh: p.vh, modo: p.modo, controles: p.controles, toque: document.querySelectorAll('#toque > .tq').length }; });
    await pg.screenshot({ path: FOTOS + `itch-${QUAL}-escala-${t.nome}.png` });
    const celular = t.nome.startsWith('iphone');
    conferir(e.w <= e.vw && e.h <= e.vh && (celular ? e.modo !== 'desktop' && e.toque > 0 : e.escala >= 5), `${t.nome}: ${JSON.stringify(e)}`);
    await cx.close();
  }
} catch (e) { falhas.push('parou: ' + String((e as Error).stack ?? e).slice(0, 700)); }
console.log(falhas.length ? '\nFALHAS:\n - ' + falhas.join('\n - ') : '\nsem falhas');
console.log(`fotos em ${FOTOS}`);
await browser.close(); await jogo.fechar(); PAI.closeAllConnections?.(); PAI.close();
process.exit(falhas.length ? 1 : 0);
