import { abrir } from './lib.mjs';
const t = await abrir('A6-ginasio', '', 4, '3:95,6:95');
await t.espia(() => window.__pingo.mundo.irPara('A6-ginasio', 13, 11, 'l', 'nenhuma'));
await t.espera(500);
console.log(await t.ir('l'));
console.log(await t.ir('n'));
console.log(await t.espia(async () => { const m = await import('/src/world/vivo.ts'); const M = m.M; return { c: M.zv.chao(14, 10), ch: M.zv.ch(14, 10), obj: M.zv.objeto(14, 10), tem: M.zv.temObjeto(14, 10), npcs: M.npcs.map((n) => [n.id, n.ator.x, n.ator.y]) }; }));
await t.browser.close();
