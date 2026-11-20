import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
export const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/captura';
export const BASE = 'http://127.0.0.1:5203/';
const CODE = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
export async function abrir(query, o = {}) {
  const browser = await pw.chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await browser.newContext(o.contexto ?? { viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  const turbo = o.turbo ?? 1;
  if (turbo !== 1) await page.addInitScript((k) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / k, ...a);
  }, turbo);
  await page.goto(BASE + (query ?? ''));
  const t = { page, browser, ctx, erros };
  t.espera = (ms) => page.waitForTimeout(ms);
  t.pronto = () => page.waitForFunction(() => window.__pingo?.mundo?.pronto, null, { timeout: 240000 });
  t.st = () => page.evaluate(() => { const p = window.__pingo, m = p.mundo; return { x: m.jogador.x, y: m.jogador.y, dir: m.jogador.dir, mov: m.jogador.movendo, oc: m.ocupado, pronto: m.pronto, zona: m.zona?.id, telas: p.telas.pilha.length, topo: p.telas.topo?.el.className, nb: m.batalhas.length, modo: m.jogador.modo }; });
  t.assentar = async (max = 120000, tecla = 'z') => {
    const t0 = Date.now(); let livres = 0;
    while (Date.now() - t0 < max) {
      const s = await t.st();
      if (!s.pronto) { await t.espera(80); livres = 0; continue; }
      if (s.oc || s.telas > 1) { livres = 0; if (tecla) await page.keyboard.press(tecla); await t.espera(70); continue; }
      if (s.mov) { livres = 0; await t.espera(30); continue; }
      if (++livres >= 3) return s;
      await t.espera(30);
    }
    throw new Error('assentar: tempo esgotado ' + JSON.stringify(await t.st()));
  };
  t.tecla = async (d) => {
    await page.evaluate((code) => new Promise((res) => {
      const p = window.__pingo, m = p.mundo, x0 = m.jogador.x, y0 = m.jogador.y, t0 = performance.now();
      const ev = (tipo) => document.dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true }));
      ev('keydown');
      const f = () => { if (m.jogador.movendo || m.jogador.x !== x0 || m.jogador.y !== y0 || p.telas.pilha.length > 1 || performance.now() - t0 > 400) { ev('keyup'); res(); } else requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }), CODE[d]);
  };
  t.passo = async (d) => { const a = await t.assentar(); await t.tecla(d); let b = await t.assentar(); if (a.x === b.x && a.y === b.y && a.nb === b.nb && a.zona === b.zona) { await t.espera(120); await t.tecla(d); b = await t.assentar(); } return b; };
  t.ir = async (seq) => { let s; for (const d of seq) s = await t.passo(d); return s; };
  t.virar = async (d) => { const s = await t.assentar(); if (s.dir !== d) { await page.evaluate((d) => window.__pingo.mundo.jogador.virar(d), d); await t.espera(60); } };
  t.k = async (tecla, ms = 150) => { await page.keyboard.press(tecla, { delay: 40 }); await t.espera(ms); };
  t.foto = (nome) => page.screenshot({ path: `${S}/${nome}.png`, timeout: 150000 });
  t.falas = (n = 6) => page.evaluate((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.ev = (f, a) => page.evaluate(f, a);
  t.ok = (cond, rotulo, extra = '') => { console.log(`${cond ? 'ok  ' : 'ERRO'} ${rotulo} ${extra}`); if (!cond) t.falhas = (t.falhas ?? 0) + 1; };
  return t;
}
