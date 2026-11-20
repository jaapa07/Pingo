import { abrir } from './lib.mjs';
const t = await abrir('PP-conselho', 15, 40, '&dir=n&insignias=16&flags=conselho-em-curso');
t.page.on('console', (m) => console.log('[c]', m.type(), m.text().slice(0, 200)));
const info = await t.pagina(async () => { const { M } = window.__a2; return M.npcs.map((n) => [n.def?.id ?? n.id, n.ator.x, n.ator.y, n.def?.script, !!n.oculto]); });
console.log(JSON.stringify(info));
await t.agir('n'); console.log(await t.falas(3), JSON.stringify(await t.st()));
await t.fim();
