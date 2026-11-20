import { abrir } from './lib.mjs';
const H = async (t) => t.pagina(async () => { (await import('/src/battle/index.ts')).definirHeadless(true); });
let t = await abrir('B-SG', 7, 30, '&dir=l&insignias=15&amuletos=todos&flags=inicial-mata'); await H(t);
console.log(JSON.stringify(await t.st()), JSON.stringify(await t.pagina(() => window.__a2.M.npcs.filter((n) => /pastor/.test(n.def?.id)).map((n) => [n.def?.id, n.ator.x, n.ator.y]))));
await t.usar(8, 28); console.log('pastor', (await t.falas(4)).map((x) => x.slice(0, 80)), JSON.stringify((await t.flags('troca')).flags), JSON.stringify((await t.flags('x')).equipe), JSON.stringify(await t.st())); await t.fim();
t = await abrir('B-FA', 30, 9, '&dir=n&insignias=16&amuletos=todos&flags=inicial-mata,conselho-vencido'); await H(t);
console.log(JSON.stringify(await t.pagina(() => window.__a2.M.npcs.map((n) => [n.def?.id, n.ator.x, n.ator.y]))));
await t.usar(31, 6); console.log('mapinguari', (await t.falas(4)).map((x) => x.slice(0, 80)), JSON.stringify((await t.flags('mapinguari')).flags), JSON.stringify(await t.st())); await t.fim();
