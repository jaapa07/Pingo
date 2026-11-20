import { abrir, pw } from './lib.mjs';
const modo = process.argv[2] ?? 'empe';
const dev = pw.devices['iPhone 13'];
const contexto = modo === 'empe' ? { ...dev } : { ...dev, viewport: { width: dev.viewport.height, height: dev.viewport.width }, screen: { width: dev.screen.height, height: dev.screen.width } };
const Q = modo === 'empe'
  ? '?zona=A-GN&x=7&y=19&dir=n&flags=liga-vencida,gincana-visitou&itens=pequi:1&equipe=23:45,102:45&dinheiro=3000'
  : '?zona=A-GN&x=16&y=9&dir=n&flags=liga-vencida,gincana-visitou&equipe=98:45,23:45&dinheiro=3000';
const t = await abrir(Q, { contexto });
const { page } = t;
await t.pronto(); await t.espera(1500);
const topo = () => page.evaluate(() => window.__pingo.telas.topo?.el.className ?? '');
const tq = (i) => page.locator('#toque .tq').nth(i).locator('.tq-zona');
const A = async (ms = 700) => { await tq(1).tap(); await t.espera(ms); };
/** toque no ponto (x, y) nativo do palco 320×180 */
const tocarNativo = async (x, y) => { const r = await page.evaluate(() => { const e = document.querySelector('.tela-gincana') ?? document.querySelector('.tela'); const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }; }); const k = r.w / 320; await page.touchscreen.tap(r.x + x * k, r.y + y * k); };
const ate = async (classe, max = 40) => { for (let i = 0; i < max; i++) { if ((await topo()).includes(classe)) return true; await A(500); } return false; };
if (modo === 'empe') {
  // sucos
  await A(1200); await t.foto('t6-empe-01-graviola');
  t.ok(await ate('tela-equipe'), 'suco: escolher criatura (toque)');
  await A(1000);
  await t.assentar(60000, null).catch(() => {});
  for (let i = 0; i < 8 && (await t.st()).oc; i++) await A(500);
  const f = await page.evaluate(() => window.__pingo.jogo.save.flags);
  t.ok(Object.keys(f).some((k) => k.startsWith('gincana-suco:')), 'suco tomado', JSON.stringify(Object.keys(f)));
  // prova de agilidade por toque
  await page.evaluate(() => window.__pingo.mundo.irPara('A-GN', 16, 9, 'n')); await t.assentar(60000, null); await t.espera(500);
  await A(1200);
  t.ok(await ate('tela-equipe'), 'prova: escolher criatura (toque)');
  await A(1500);
  t.ok((await topo()).includes('tela-gincana'), 'corrida aberta');
  await t.espera(4000);
  for (let i = 0; i < 14; i++) { await tocarNativo(160, [112, 132, 152][i % 3] - 6); await t.espera(450); if (i === 6) await t.foto('t6-empe-02-corrida'); }
  for (let i = 0; i < 300 && !(await page.evaluate(() => !!document.querySelector('.tela-gincana .mol-madeira'))); i++) { await tocarNativo(160, 120); await t.espera(400); }
  await t.foto('t6-empe-03-resultado');
  await page.locator('.tela-gincana .mol-madeira').tap(); await t.espera(800);
  for (let i = 0; i < 6 && (await t.st()).oc; i++) await A(600);
  // tesouraria: loja de pontos por toque
  await page.evaluate(() => { window.__pingo.jogo.save.flags['gincana-pontos'] = 120; window.__pingo.mundo.irPara('A-GN', 23, 19, 'n'); }); await t.assentar(60000, null); await t.espera(500);
  await A(1200); await A(800);
  t.ok(await ate('tela-loja', 6), 'loja de pontos aberta');
  await page.locator('.tela-loja .item-lista, .tela-loja .lista > *').first().tap().catch(() => {}); await t.espera(800);
  await t.foto('t6-empe-04-loja');
  console.log('falas', await t.falas(4));
} else {
  // deitado: prova de força por toque na pista
  await A(1200);
  await A(700); // escolha: Agilidade
  await page.evaluate(() => {}); 
  t.ok(await ate('tela-equipe'), 'deitado: escolher criatura');
  await A(1500);
  await t.espera(4000);
  for (let i = 0; i < 10; i++) { await tocarNativo(160, 125); await t.espera(400); }
  await t.foto('t6-deitado-01-prova');
  for (let i = 0; i < 300 && !(await page.evaluate(() => !!document.querySelector('.tela-gincana .mol-madeira'))); i++) { await tocarNativo(160, 125); await t.espera(400); }
  await page.locator('.tela-gincana .mol-madeira').tap(); await t.espera(800);
  for (let i = 0; i < 6 && (await t.st()).oc; i++) await A(600);
  // safári por toque
  await page.evaluate(() => { const s = window.__pingo.jogo.save; s.flags['safari-ativo'] = true; s.flags['safari-passos'] = 300; s.mochila['cuia-safari'] = 30; window.__pingo.mundo.irPara('A-SF-parque', 6, 30, 'n'); }); await t.assentar(60000, null); await t.espera(800);
  await t.foto('t6-deitado-02-parque');
  await page.evaluate(() => { void window.__pingo.mundo.rodarPassos([['tela', 'safari-encontro', { especie: 102, nivel: 41, arena: 'cerrado', setor: 1 }]]); });
  const pronto = () => page.evaluate(() => { const c = document.querySelector('.tela-safari .cursor-mao'); return !!c && c.style.visibility !== 'hidden'; });
  let k = 0;
  for (let i = 0; i < 120 && (await topo()).includes('tela-safari') || i < 3; i++) {
    if (await pronto()) { if (k === 0) { k++; await t.k('ArrowDown', 300); await t.k('z', 600); await t.foto('t6-deitado-03a-isca'); continue; } const b = [1, 2, 3, 3, 0, 0, 0, 0, 0][Math.min(k++, 8)]; await page.locator('.tela-safari .sf-menu .botao').nth(b).tap(); await t.espera(600); if (k === 3 || k === 5) await t.foto(`t6-deitado-03-safari${k}`); }
    else { await page.locator('.tela-safari .mol-texto').tap().catch(() => {}); await t.espera(500); }
  }
  console.log('safari: ações', k, 'equipe', await page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => c.especie)), 'cuias', await page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-safari']));
}
console.log('erros', t.erros);
await t.browser.close();
