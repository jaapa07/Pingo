import { abrir } from './lib.mjs';
const Q = '?zona=A-LG&x=27&y=55&dir=l&flags=liga-vencida&insignias=8&equipe=23:45,102:45,98:45&dinheiro=5000&itens=pitanga:2,cupuacu:2,buriti:2';
const t = await abrir(Q);
const { page } = t;
await t.pronto(); await t.espera(800);
await t.foto('t1-01-alg');
const topo = () => page.evaluate(() => window.__pingo.telas.topo?.el.className ?? '');
const ate = async (classe, tecla = 'z', max = 60) => { for (let i = 0; i < max; i++) { if ((await topo()).includes(classe)) return true; await t.k(tecla, 180); } return false; };
// fala com o carreiro (leste)
await t.virar('l'); await t.k('z', 400);
await t.foto('t1-02-carreiro');
await t.assentar(30000);
let s = await t.st(); t.ok(s.zona === 'A-GN', 'carreiro leva ao A-GN', JSON.stringify(s));
await t.espera(600); await t.foto('t1-03-agn');
// juíza
await page.evaluate(() => window.__pingo.mundo.irPara('A-GN', 16, 9, 'n')); await t.assentar(); await t.espera(400);
await t.k('z', 400); await t.foto('t1-04-juiza');
t.ok(await ate('tela-equipe'), 'escolha de criatura');
await t.foto('t1-05-equipe');
await t.k('z', 600);
t.ok((await topo()).includes('tela-gincana'), 'tela da gincana aberta', await topo());
await t.espera(1500); await t.foto('t1-06-contagem');
await t.espera(2500);
for (let i = 0; i < 40; i++) { await t.k(i % 3 === 0 ? 'ArrowUp' : 'ArrowDown', 300); if (i === 12) await t.foto('t1-07-corrida'); }
await t.espera(3000); await t.foto('t1-08-resultado');
await t.k('z', 800);
for (let i = 0; i < 3; i++) { await t.foto(`t1-09-fala${i}`); await t.k('z', 700); }
console.log(await t.falas(6));
console.log('pontos', await page.evaluate(() => window.__pingo.jogo.save.flags));
console.log('erros', t.erros);
await t.browser.close();
