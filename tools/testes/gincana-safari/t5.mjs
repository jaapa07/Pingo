import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-SF-parque&x=10&y=25&dir=n&flags=liga-vencida,safari-ativo,safari-setor-2&itens=cuia-safari:30&equipe=23:45,102:45&semente=7');
const { page } = t;
await t.pronto(); await page.evaluate(() => { window.__pingo.jogo.save.flags['safari-passos'] = 300; }); await t.espera(1500);
const fps = () => Promise.race([page.evaluate(() => new Promise((ok) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else ok(n); }; requestAnimationFrame(f); })), new Promise((ok) => setTimeout(() => ok('TRAVOU'), 8000))]);
console.log('parque fps', await fps(), await t.st());
await page.evaluate(() => { void window.__pingo.mundo.rodarPassos([['tela', 'safari-encontro', { especie: 108, nivel: 42, arena: 'pantanal', setor: 2 }]]); });
for (let i = 0; i < 6; i++) { await t.espera(1000); console.log('safari fps', await fps(), (await t.st()).topo, t.erros.slice(-2)); }
const t0 = Date.now(); await t.foto('t5-safari'); console.log('foto ms', Date.now() - t0);
await t.browser.close();
