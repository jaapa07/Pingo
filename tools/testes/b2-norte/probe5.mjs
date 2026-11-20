import { abrir } from './lib.mjs';
const t = await abrir('B-SG', 7, 28, '&dir=l&insignias=15&amuletos=todos&flags=inicial-mata');
await t.page.keyboard.press('z'); await t.espera(300); await t.assentar();
console.log('pastor', (await t.falas(4)).map((x) => x.slice(0, 80)), JSON.stringify((await t.flags('troca')).flags), JSON.stringify((await t.flags('x')).equipe)); await t.fim();
