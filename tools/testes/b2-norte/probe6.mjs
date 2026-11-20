import { abrir } from './lib.mjs';
let t = await abrir('B7', 24, 1, '&dir=n&insignias=14&amuletos=todos&flags=inicial-mata');
let s = await t.ir('n'); s = await t.assentar(); console.log('B7 norte →', JSON.stringify(s));
await t.fim();
t = await abrir('B7', 1, 19, '&dir=o&insignias=14&amuletos=todos&flags=inicial-mata');
s = await t.ir('o'); s = await t.assentar(); console.log('B7 oeste →', JSON.stringify(s)); await t.fim();
t = await abrir('B7', 48, 19, '&dir=l&insignias=14&amuletos=todos&flags=inicial-mata');
s = await t.ir('l'); s = await t.assentar(); console.log('B7 leste →', JSON.stringify(s)); await t.fim();
