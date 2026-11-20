import { abrir } from './lib.mjs';
const t = await abrir('PP', 32, 5, '&dir=n&insignias=16&flags=conselho-vencido,misterioso-pode,garrote-vencido,rival-8');
await t.pagina(async () => { (await import('/src/battle/index.ts')).definirHeadless(true); });
const info = await t.pagina(async () => { const { M } = window.__a2; return M.npcs.map((n) => [n.def?.id ?? n.id, n.ator.x, n.ator.y]); });
console.log(JSON.stringify(info));
await t.usar(32, 3); console.log(await t.falas(4), JSON.stringify((await t.flags('andarilho|misterioso')).flags));
await t.usar(5, 8); console.log(await t.falas(3), JSON.stringify((await t.flags('neve')).flags));
await t.fim();
