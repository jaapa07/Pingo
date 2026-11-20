import { abrir, lerSave } from './lib.mjs';
const t = await abrir(lerSave('passo-5'));
try {
  await t.q(() => window.Q.viajar('A5'));
  console.log(await t.st());
  console.log(await t.q(async () => { const V = await import('/src/world/vivo.ts'); const z = V.M.zv; const ws = z.def.warps.filter((w) => /posto|venda/.test(w.para.zona)); return JSON.stringify({ ws: ws.map((w) => [w.x, w.y, w.para.zona, w.requer, w.tipo, window.Q.plano(w.x, w.y)?.length, z.chao(w.x, w.y), z.ch(w.x, w.y), !!z.warp(w.x, w.y)]), npcs: V.M.npcs.filter((n) => n.ator.visivel).map((n) => [n.id, n.ator.x, n.ator.y]), p1810: window.Q.plano(18, 10)?.length, p1711: window.Q.plano(17, 11)?.length }); }));
  await t.foto('dbg-a5');
} catch (e) { console.log('FALHA', e.message); }
await t.fim();
