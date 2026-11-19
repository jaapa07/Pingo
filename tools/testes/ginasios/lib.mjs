import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/gin18';
const KEY = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
export async function abrir(zona, extra = "", turbo = 4, equipe = "3:60,6:60", golpe = "atropelo") {
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await page.addInitScript((g) => { window.__golpe = g; }, golpe);
  await page.addInitScript((k) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / k, ...a);
  }, turbo);
  await page.goto(`http://localhost:5196/?zona=${zona}&x=8&y=17&dir=n&equipe=${equipe}&amuletos=todos&semente=7${extra}`);
  await page.waitForFunction(() => window.__pingo?.mundo?.pronto, null, { timeout: 30000 });
  await page.evaluate(async (z) => {
    if (window.__injetar) await import("/src/world/mecanicas/index.ts"); window.__gin = 1;
    const p = window.__pingo;
    const g1 = window.__golpe || 'atropelo'; const forte = { 3: [g1, 'queda-de-jequitiba', 'tremor-de-terra', 'vendaval-de-folhas'], 6: [g1, 'martelo', 'labareda', 'fogo-de-coivara'] };
    for (const c of p.jogo.save.equipe) c.golpes = forte[c.especie].map((id) => ({ id, pg: 60, pgMax: 60 }));
    p.jogo.opcoes.velTexto = 3;
    await p.mundo.irPara(z, 8, 17, 'n', 'nenhuma');
  }, zona);
  const t = { page, browser, erros, batalhas: 0 };
  t.st = () => page.evaluate(() => { const p = window.__pingo, m = p.mundo; if (!window.__gin) throw new Error("pagina recarregou"); return { x: m.jogador.x, y: m.jogador.y, dir: m.jogador.dir, mov: m.jogador.movendo, oc: m.ocupado, pronto: m.pronto, zona: m.zona?.id, telas: p.telas.pilha.length, nb: m.batalhas.length }; });
  t.espera = (ms) => page.waitForTimeout(ms);
  /** espera o jogo ficar livre, apertando Z enquanto houver diálogo/batalha */
  t.assentar = async (max = 400000) => {
    const t0 = Date.now(); let livres = 0;
    while (Date.now() - t0 < max) {
      const s = await t.st();
      if (!s.pronto) { await t.espera(80); livres = 0; continue; }
      if (s.oc || s.telas > 1) { livres = 0; await page.keyboard.press('z'); await t.espera(70); continue; }
      if (s.mov) { livres = 0; await t.espera(30); continue; }
      if (++livres >= 3) return s;
      await t.espera(30);
    }
    throw new Error('assentar: tempo esgotado ' + JSON.stringify(await t.st()));
  };
  /** um passo (ou tentativa) na direção */
  const CODE = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
  /** segura a tecla dentro da página até o passo começar (sem atraso de IPC, para não andar dois tiles) */
  t.passo = async (d) => {
    const a = await t.assentar();
    await t.tecla(d);
    let b = await t.assentar();
    if (a.x === b.x && a.y === b.y && a.nb === b.nb) { await t.espera(120); await t.tecla(d); b = await t.assentar(); }
    return b;
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
  t.ir = async (seq) => { let s; for (const d of seq) s = await t.passo(d); return s; };
  /** vira para a direção (os alvos de interação são sempre tiles bloqueados: o passo vira e esbarra) */
  t.virar = async (d) => { const s = await t.assentar(); if (s.dir !== d) await t.passo(d); };
  t.agir = async (d) => { if (d) await t.virar(d); await page.keyboard.press('z', { delay: 40 }); await t.espera(600); return t.assentar(); };
  t.foto = (nome) => page.screenshot({ path: `${S}/${nome}.png` });
  t.falas = (n = 6) => page.evaluate((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.save = () => page.evaluate(() => { const s = window.__pingo.jogo.save; return { insignias: s.insignias, amuletos: s.amuletos, flags: Object.keys(s.flags).filter((f) => /venceu|ginasio/.test(f) && s.flags[f]), itens: s.itens ?? s.mochila, zona: s.jogador.zona, x: s.jogador.x, y: s.jogador.y }; });
  t.espia = (expr) => page.evaluate(expr);
  t.confere = async (x, y, rotulo) => { const s = await t.assentar(); await page.evaluate(() => window.__pingo.mundo.rodarPassos([['curar']])).catch(() => 0); const ok = s.x === x && s.y === y; console.log(`${ok ? 'ok ' : 'ERRO'} ${rotulo}: (${s.x},${s.y})${ok ? '' : ` esperado (${x},${y})`} batalhas=${s.nb}`); if (!ok) { await t.foto('erro'); throw new Error('posição inesperada em ' + rotulo); } return s; };
  return t;
}
