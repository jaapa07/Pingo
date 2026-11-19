import { abrir } from './lib.mjs';
const t = await abrir('A5-ginasio');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.foto('e4-a');
  await t.ir('lnn'); await t.ir('n'); await t.confere(9, 15, 'raio da fila 14 barra a passagem');
  await t.ir('oooooo'); await t.confere(3, 15, 'sob o espelho da entrada'); await nb(1, 'g04-1');
  await t.agir('n');
  await t.ir('llllll'); await t.ir('nnn'); await t.confere(9, 12, 'salão do meio');
  await t.ir('nn'); await t.ir('o'); await t.ir('o'); await t.confere(7, 10, 'ao lado do espelho do meio'); await nb(2, 'g04-2');
  await t.foto('e4-b');
  await t.ir('n'); await t.ir('o'); await t.confere(7, 9, 'raio barra a passagem oeste');
  await t.ir('s'); await t.agir('o');
  await t.ir('no'); await t.ir('nn'); await t.confere(6, 7, 'salão norte pelo oeste'); await nb(3, 'g04-3');
  await t.ir('n'); console.log(await t.st());
  console.log(await t.espia(async () => { const m = await import('/src/world/vivo.ts'); const M = m.M; const r = {}; for (const [x,y] of [[6,6],[6,8],[7,7],[5,7]]) r[x+','+y] = [M.zv.chao(x,y), M.zv.ch(x,y)]; r.npcs = M.npcs.map(n => [n.id, n.ator.x, n.ator.y, n.ator.visivel]); r.trava = M.travaDir; r.oc = M.ocupado; r.jog=[M.jog.x,M.jog.y,M.jog.movendo]; return r; }));
} catch (e) { console.log('FALHA', e.message); }
await t.browser.close();
