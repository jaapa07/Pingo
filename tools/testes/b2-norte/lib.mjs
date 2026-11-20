// Apoio dos roteiros jogados do time A2 (Playwright): abre o jogo numa zona, anda por busca de caminho no próprio
// mapa vivo (embarca na canoa, corta cipó e quebra rocha quando o caminho pede) e atravessa falas e batalhas com A.
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/b2n';
const KEY = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
const EQUIPE = process.env.EQUIPE || '3:70,6:70,9:70';
export async function abrir(zona, x, y, extra = '', turbo = 8) {
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' || /desconhecid/.test(m.text())) erros.push(m.text()); });
  await page.addInitScript((k) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / k, ...a);
  }, turbo);
  await page.goto(`http://localhost:5199/?zona=${zona}&x=${x}&y=${y}&equipe=${EQUIPE}&semente=7${extra}`);
  await page.waitForFunction(() => window.__pingo?.mundo?.pronto, null, { timeout: 40000 });
  await page.evaluate(async () => {
    window.__a2 = await import('/src/world/vivo.ts');
    const p = window.__pingo;
    const forte = { 3: ['tremor-de-terra', 'queda-de-jequitiba', 'atropelo', 'vendaval-de-folhas'], 6: ['carreira-em-chamas', 'martelo', 'atropelo', 'fogo-de-coivara'], 9: ['enxurrada', 'pororoca', 'atropelo', 'enxurrada'] };
    for (const c of p.jogo.save.equipe) if (forte[c.especie]) c.golpes = forte[c.especie].map((id) => ({ id, pg: 60, pgMax: 60 }));
    p.jogo.opcoes.velTexto = 3; p.jogo.save.repelente = 999999;
  });
  const t = { page, browser, erros };
  t.st = () => page.evaluate(() => { const p = window.__pingo, m = p.mundo; return { x: m.jogador.x, y: m.jogador.y, dir: m.jogador.dir, modo: m.jogador.modo, mov: m.jogador.movendo, oc: m.ocupado, pronto: m.pronto, zona: m.zona?.id, telas: p.telas.pilha.length, nb: m.batalhas.length }; });
  t.espera = (ms) => page.waitForTimeout(ms);
  t.assentar = async (max = 600000) => {
    const t0 = Date.now(); let livres = 0;
    while (Date.now() - t0 < max) {
      const s = await t.st();
      if (!s.pronto) { await t.espera(80); livres = 0; continue; }
      if (s.oc || s.telas > 1) { livres = 0; await page.keyboard.press('z'); await t.espera(60); continue; }
      if (s.mov) { livres = 0; await t.espera(25); continue; }
      if (++livres >= 3) return s;
      await t.espera(25);
    }
    throw new Error('assentar: tempo esgotado ' + JSON.stringify(await t.st()));
  };
  t.passo = async (d) => {
    const a = await t.assentar();
    await page.keyboard.down(KEY[d]);
    const t0 = Date.now();
    while (Date.now() - t0 < 700) { const s = await t.st(); if (s.x !== a.x || s.y !== a.y || s.oc || s.mov || s.zona !== a.zona) break; await t.espera(12); }
    await page.keyboard.up(KEY[d]);
    return t.assentar();
  };
  t.ir = async (seq) => { let s; for (const d of seq) s = await t.passo(d); return s; };
  t.virar = async (d) => { await t.assentar(); const s = await t.st(); if (s.dir === d) return; await page.keyboard.down(KEY[d]); await t.espera(25); await page.keyboard.up(KEY[d]); await t.espera(140); };
  t.agir = async (d) => { if (d) await t.virar(d); await page.keyboard.press('z'); await t.espera(150); return t.assentar(); };
  t.foto = (nome) => page.screenshot({ path: `${S}/${nome}.png`, timeout: 5000 }).catch(() => console.log('   (sem foto: ' + nome + ')'));
  t.falas = (n = 6) => page.evaluate((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.flags = (re) => page.evaluate((r) => { const s = window.__pingo.jogo.save, x = new RegExp(r); return { flags: Object.keys(s.flags).filter((f) => x.test(f) && s.flags[f]), insignias: s.insignias, amuletos: s.amuletos, mochila: s.mochila, equipe: s.equipe.map((c) => (c.ovo ? 'ovo:' : '') + c.especie + ':' + c.nivel) }; }, re);
  t.pagina = (fn, arg) => page.evaluate(fn, arg);
  /** plano de passos até (tx, ty): letras = andar; 'A'+dir = interagir (embarcar / cipó / rocha) e depois andar */
  t.plano = (tx, ty, vizinho = false) => page.evaluate(([tx, ty, vizinho]) => {
    const { M } = window.__a2, z = M.zv, m = window.__pingo.mundo, am = window.__pingo.jogo.save.amuletos;
    const D = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
    const ocup = new Set([...M.npcs.map((n) => n.ator.x + ',' + n.ator.y), ...M.guardas.map((g) => g.ator.x + ',' + g.ator.y)]);
    const item = (x, y) => (z.def.itens ?? []).some((i) => i.x === x && i.y === y && !i.oculto && !window.__pingo.jogo.save.flags[i.flag]);
    const alvo = (x, y) => (vizinho ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
    const k0 = m.jogador.x + ',' + m.jogador.y, ant = new Map([[k0, null]]), fila = [[m.jogador.x, m.jogador.y]];
    let fim = null;
    while (fila.length && !fim) {
      const [x, y] = fila.shift();
      const naAgua = z.agua(x, y);
      for (const d of 'nslo') {
        const nx = x + D[d][0], ny = y + D[d][1], k = nx + ',' + ny;
        if (ant.has(k) || !z.dentro(nx, ny) || ocup.has(k) || z.portao(nx, ny) || item(nx, ny)) continue;
        const ch = z.ch(nx, ny), w = z.warp(nx, ny), destino = nx === tx && ny === ty && !vizinho;
        if (w && !destino) continue;
        let passo = null;
        if (z.agua(nx, ny)) { if (ch === 'w') continue; passo = naAgua ? d : am.includes('remo') ? 'A' + d : null; }
        else if (z.chao(nx, ny) || (destino && w)) passo = d;
        else if (!naAgua && ((ch === 'c' && am.includes('facao')) || (ch === 'r' && am.includes('quebra-pedra')))) passo = 'A' + d;
        if (!passo) continue;
        ant.set(k, [x + ',' + y, passo]);
        if (alvo(nx, ny)) { fim = k; break; }
        fila.push([nx, ny]);
      }
    }
    if (alvo(m.jogador.x, m.jogador.y)) return [];
    if (!fim) return null;
    const passos = []; for (let k = fim; ant.get(k); k = ant.get(k)[0]) passos.unshift(ant.get(k)[1]);
    return passos;
  }, [tx, ty, vizinho]);
  /** anda até (tx, ty) (ou até um vizinho); replaneja depois de batalha, fala ou tranco; para se a zona mudar */
  t.irAte = async (tx, ty, o = {}) => {
    const z0 = (await t.assentar()).zona;
    for (let volta = 0; volta < 400; volta++) {
      const s = await t.assentar();
      if (s.zona !== z0) return s;
      const pl = await t.plano(tx, ty, !!o.vizinho);
      if (pl === null) throw new Error(`sem caminho em ${s.zona} de (${s.x},${s.y}) até (${tx},${ty})`);
      if (!pl.length) return s;
      for (const p of pl.slice(0, 6)) {
        const a = await t.st();
        if (p[0] === 'A') { await t.agir(p[1]); const b = await t.st(); if (b.x === a.x && b.y === a.y) await t.passo(p[1]); }
        else await t.passo(p);
        const b = await t.st();
        if (b.zona !== z0) return b;
        if (b.x === a.x && b.y === a.y) break; // tranco: replaneja
        if (b.nb !== a.nb) break;
      }
    }
    throw new Error(`irAte: não chegou a (${tx},${ty})`);
  };
  /** fala/interage com o que está em (tx, ty): vai até um vizinho, vira e aperta A */
  t.usar = async (tx, ty) => {
    let s = await t.irAte(tx, ty, { vizinho: true });
    for (let i = 0; i < 4; i++) { const n = s.nb; await t.espera(200); s = await t.assentar(); if (s.nb === n) break; s = await t.irAte(tx, ty, { vizinho: true }); }
    const d = tx > s.x ? 'l' : tx < s.x ? 'o' : ty > s.y ? 's' : 'n';
    return t.agir(d);
  };
  t.confere = async (cond, rotulo) => { console.log(`${cond ? 'ok  ' : 'ERRO'} ${rotulo}`); if (!cond) { await t.foto('erro-' + rotulo.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)); throw new Error('falhou: ' + rotulo); } };
  t.fim = async () => { console.log('erros de console:', JSON.stringify(t.erros.slice(0, 6))); await browser.close(); };
  return t;
}
