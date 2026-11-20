// QA pós-Liga 9 — passada por TOQUE no iPhone 13 deitado: Rádio Cipó (agenda, contatos, revanches), uma prova da
// Gincana (Corrida, tocando nas raias) e um encontro do Safári (botões ISCA/PEDRA/PERTO/CUIA). Só toques na tela.
import { abrir, lerSave, pw } from './lib.mjs';
import { preparar, relogio, textos, limparTextos, topo, irPara } from './comum.mjs';
const t = await abrir(lerSave('campeao'), { contexto: { ...pw.devices['iPhone 13 landscape'] }, rapido: false, anim: true });
const page = t.page;
await preparar(t);
const rects = () => page.evaluate(async () => { const m = await import('/src/ui/toque.ts'); const r = m.retangulosToque(); const o = {}; for (const k in r) o[k] = [r[k].left, r[k].top, r[k].width, r[k].height]; return o; });
const DIR = { cima: [0, -0.33], baixo: [0, 0.33], esq: [-0.33, 0], dir: [0.33, 0] };
async function botao(acao, ms = 350) {
  const r = await rects();
  if (DIR[acao]) { const d = r.dpad; await page.touchscreen.tap(d[0] + d[2] / 2 + DIR[acao][0] * d[2], d[1] + d[3] / 2 + DIR[acao][1] * d[3]); }
  else { const b = r[acao]; if (!b) throw new Error('sem botão de toque ' + acao + ' ' + Object.keys(r)); await page.touchscreen.tap(b[0] + b[2] / 2, b[1] + b[3] / 2); }
  await t.espera(ms);
}
/** toca no item `i` da lista visível na tela do topo */
const marcarTopo = () => page.evaluate(() => { document.querySelectorAll('[data-topo]').forEach((e) => e.removeAttribute('data-topo')); window.__pingo.telas.topo?.el.setAttribute('data-topo', '1'); });
const item = async (i, ms = 600) => { await marcarTopo(); const el = page.locator('[data-topo="1"] .lista-item').nth(i); await el.tap({ timeout: 8000 }); await t.espera(ms); };
/** ponto nativo (px do palco 320×180) → toque */
const nativo = async (x, y) => { const r = await page.evaluate(() => { const e = document.querySelector('#tela') ?? document.querySelector('.tela'); const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }; }); const k = r.w / 320; await page.touchscreen.tap(r.x + x * k, r.y + y * k); };
const passarFalas = async (max = 30) => { for (let k = 0; k < max && /dialogo/.test(await topo(t)) && !(await page.evaluate(() => !!document.querySelector('.tela.dialogo .lista'))); k++) await botao('a', 300); };
try {
  const info = await page.evaluate(() => { const p = window.__pingo.palco; return p ? { modo: p.modo, ctrl: p.controles, esc: p.escala } : null; });
  console.log('   palco:', JSON.stringify(info), JSON.stringify(await rects()));
  await relogio(t, 5, 8 * 60);
  await irPara(t, 'A4', 17, 18, 'n');
  await t.foto('r9-mundo');
  if (process.argv[2] !== 'so-safari') {
  // RÁDIO
  await botao('menu', 700);
  await item(3, 900); t.ok(/tela-radio/.test(await topo(t)), 'rádio aberto tocando no item do menu'); await t.foto('r9-radio');
  await item(0, 900); await t.foto('r9-agenda');
  for (let k = 0; k < 5 && !/tela-radio/.test(await topo(t)); k++) await botao('a', 500);
  t.ok(/tela-radio/.test(await topo(t)), 'agenda (páginas) fechada com o botão A');
  await item(1, 900); await t.foto('r9-contatos');
  const ci = await page.evaluate(async () => { const D = await import('/src/world/deps.ts'); return window.__pingo.jogo.save.contatos.filter((id) => D.treinador(id)).indexOf('lider-05'); });
  // toque num item fora da área visível: rola com o direcional e toca
  for (let k = 0; k < ci; k++) await botao('baixo', 150);
  await marcarTopo(); await page.locator('[data-topo="1"] .lista-item.foco').tap(); await t.espera(800);
  await limparTextos(t); await passarFalas(); console.log('   ligação:', (await textos(t, 2)).join(' ⏎ ').slice(0, 200));
  t.ok((await textos(t, 3)).some((x) => /meu dia de treino|Já combinamos/.test(x)), 'ligação para o líder por toque');
  await botao('b', 600); await item(2, 900); await t.foto('r9-revanches'); await botao('b', 600);
  await item(6, 900); await t.foto('r9-recado'); await botao('a', 600);
  for (let k = 0; k < 4 && (await page.evaluate(() => window.__pingo.telas.pilha.length)) > 1; k++) await botao('b', 500);
  // GINCANA
  await t.assentar(); await irPara(t, 'A-GN', 5, 11, 'l');
  const jz = await page.evaluate(() => { const n = window.__pingo.mundo.npcs.find((q) => q.id === 'gincana-juiza'); return [n.ator.x, n.ator.y]; });
  await t.irAte(jz[0], jz[1] + 1); await page.evaluate(() => window.__pingo.mundo.jogador.virar('n'));
  await botao('a', 700); await passarFalas();
  await item(0, 900); await passarFalas();
  await t.foto('r9-gincana-escolhe');
  await page.locator('.tela-equipe .grade > *').nth(5).tap().catch(() => 0); await t.espera(1200); await passarFalas();
  t.ok(/tela-gincana/.test(await topo(t)), 'Corrida aberta por toque', await topo(t));
  const zonas = [112, 132, 152];
  for (let k = 0; k < 120 && !(await page.evaluate(() => !!document.querySelector('.tela-gincana .gn-res'))); k++) { await nativo(160, zonas[k % 3] - 6); await t.espera(350); if (k === 20) await t.foto('r9-corrida'); }
  await t.foto('r9-corrida-res');
  await page.locator('.tela-gincana .gn-res').tap().catch(() => 0); await t.espera(800); await passarFalas();
  console.log('   corrida por toque:', (await textos(t, 3)).filter((x) => /pontos/.test(x)).join(' ⏎ '));
  }
  // SAFÁRI
  await t.assentar(); await irPara(t, 'A-SF', 13, 4, 's');
  await t.falarCom('safari-bilheteira').catch((e) => console.log('   porteira', e.message.split('\n')[0]));
  t.ok((await t.st()).zona === 'A-SF-parque', 'no parque');
  const g = await page.evaluate(() => { const z = window.__pingo.mundo.zona; for (let y = 33; y > 17; y--) for (let x = 2; x < 20; x++) if (z.mapaChars[y][x] === '"' && z.mapaChars[y][x + 1] === '"' && z.mapaChars[y][x - 1] === '"') return [x, y]; return null; });
  await t.irAte(g[0], g[1]);
  let enc = false;
  // um toque curto no direcional só vira o personagem; andar pede segurar — aqui o passo é dado segurando a seta do teclado
  const passo = (d) => page.evaluate(async (C) => { const P = window.__pingo, ev = (tp) => document.dispatchEvent(new KeyboardEvent(tp, { code: C, key: C, bubbles: true })), q = () => new Promise((r) => requestAnimationFrame(r)); const x0 = P.mundo.jogador.x; ev('keydown'); for (let i = 0; i < 30; i++) { await q(); if (P.mundo.jogador.movendo || P.mundo.jogador.x !== x0 || document.querySelector('.tela-safari')) break; } ev('keyup'); for (let i = 0; i < 40 && P.mundo.jogador.movendo; i++) await q(); }, d);
  for (let k = 0; k < 200 && !enc; k++) { await passo(k % 2 ? 'ArrowLeft' : 'ArrowRight'); enc = await page.evaluate(() => !!document.querySelector('.tela-safari')); }
  t.ok(enc, 'encontro no capim do parque');
  if (enc) {
    const pronto = () => page.evaluate(() => { const m = document.querySelector('.tela-safari .sf-menu .cursor-mao'); return !!m && m.style.visibility !== 'hidden'; });
    const plano = [3, 1, 2, 0, 0, 0, 0, 0, 0, 0]; let k = 0;
    for (let i = 0; i < 200 && (await page.evaluate(() => !!document.querySelector('.tela-safari'))); i++) {
      if (await pronto()) { await page.locator('.tela-safari .sf-menu .botao').nth(plano[Math.min(k++, plano.length - 1)]).tap(); await t.espera(700); if (k === 2 || k === 4) await t.foto(`r9-safari-${k}`); }
      else { await page.locator('.tela-safari .mol-texto').tap().catch(() => 0); await t.espera(500); }
    }
    await passarFalas();
    console.log('   safari:', (await textos(t, 4)).join(' ⏎ ').slice(0, 200));
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r9-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
