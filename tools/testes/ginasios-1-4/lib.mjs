import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/gin18';
const KEY = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
export async function abrir(zona, extra = '', turbo = 4) {
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await page.addInitScript((k) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / k, ...a);
  }, turbo);
  await page.goto(`http://localhost:5196/?zona=${zona}&x=8&y=17&dir=n&equipe=3:60,6:60&amuletos=todos&semente=7${extra}`);
  await page.waitForFunction(() => window.__pingo?.mundo?.pronto, null, { timeout: 30000 });
  await page.evaluate(async (z) => {
    await import("/src/world/mecanicas/index.ts"); window.__gin = 1;
    const p = window.__pingo;
    const forte = { 3: ['tremor-de-terra', 'queda-de-jequitiba', 'atropelo', 'vendaval-de-folhas'], 6: ['carreira-em-chamas', 'martelo', 'atropelo', 'fogo-de-coivara'] };
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
  t.passo = async (d) => {
    const a = await t.assentar();
    await page.keyboard.down(KEY[d]);
    const t0 = Date.now();
    while (Date.now() - t0 < 700) { const s = await t.st(); if (s.x !== a.x || s.y !== a.y || s.oc || s.mov) break; await t.espera(15); }
    await page.keyboard.up(KEY[d]);
    return t.assentar();
  };
  t.ir = async (seq) => { let s; for (const d of seq) s = await t.passo(d); return s; };
  /** vira para a direção sem andar (toque curto) e aperta A */
  t.virar = async (d) => { await t.assentar(); const s = await t.st(); if (s.dir === d) return; await page.keyboard.down(KEY[d]); await t.espera(25); await page.keyboard.up(KEY[d]); await t.espera(120); };
  t.agir = async (d) => { if (d) await t.virar(d); await page.keyboard.press('z'); await t.espera(150); return t.assentar(); };
  t.foto = (nome) => page.screenshot({ path: `${S}/${nome}.png` });
  t.falas = (n = 6) => page.evaluate((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.save = () => page.evaluate(() => { const s = window.__pingo.jogo.save; return { insignias: s.insignias, amuletos: s.amuletos, flags: Object.keys(s.flags).filter((f) => /venceu|ginasio/.test(f) && s.flags[f]), itens: s.itens ?? s.mochila, zona: s.jogador.zona, x: s.jogador.x, y: s.jogador.y }; });
  t.espia = (expr) => page.evaluate(expr);
  t.confere = async (x, y, rotulo) => { const s = await t.assentar(); const ok = s.x === x && s.y === y; console.log(`${ok ? 'ok ' : 'ERRO'} ${rotulo}: (${s.x},${s.y})${ok ? '' : ` esperado (${x},${y})`} batalhas=${s.nb}`); if (!ok) { await t.foto('erro'); throw new Error('posição inesperada em ' + rotulo); } return s; };
  return t;
}
