import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-GN&x=13&y=9&dir=n&flags=liga-vencida,gincana-visitou&equipe=23:45,102:45');
const { page } = t;
await t.pronto(); await t.espera(1000);
const topo = () => page.evaluate(() => window.__pingo.telas.topo?.el.className ?? '');
const s = () => page.evaluate(() => window.__pingo.jogo.save);
// ranking (quadro)
await t.k('z', 1500); t.ok((await topo()).includes('tela-gincana-ranking'), 'ranking aberto pelo quadro');
await t.foto('t7-01-ranking'); await t.k('z', 800);
// tesouraria com 100 pontos
await page.evaluate(() => { window.__pingo.jogo.save.flags['gincana-pontos'] = 100; void window.__pingo.mundo.rodarEvento('gincana-troca'); });
for (let i = 0; i < 10 && !(await topo()).includes('tela-loja'); i++) await t.k('z', 500);
await t.foto('t7-02-loja-menu');
await t.k('z', 800); await t.foto('t7-03-loja-lista');
await t.k('z', 800); await t.foto('t7-04-qtd'); await t.k('z', 800); await t.k('z', 800);
let sv = await s(); t.ok(sv.mochila['vitamina-vida'] === 1 && sv.flags['gincana-pontos'] === 70, 'trocou 30 pontos por Vitamina de Abacate', `${sv.mochila['vitamina-vida']} ${sv.flags['gincana-pontos']}`);
for (let i = 0; i < 6 && (await topo()).includes('tela-loja'); i++) await t.k('x', 500);
await t.assentar(60000, 'x');
// usar a vitamina pela Equipe
const esf0 = sv.equipe[0].esf.vida;
await page.evaluate(() => { void window.__pingo.mundo.rodarPassos([['tela', 'equipe', { modo: 'usar', item: 'vitamina-vida' }]]); });
await t.espera(1500); await t.k('z', 1200); await t.foto('t7-05-vitamina');
for (let i = 0; i < 6 && (await t.st()).telas > 1; i++) await t.k('z', 600);
sv = await s(); t.ok(sv.equipe[0].esf.vida === esf0 + 10 && !sv.mochila['vitamina-vida'], 'vitamina: +10 de esforço em Vida', `${esf0}→${sv.equipe[0].esf.vida}`);
await t.assentar(60000, 'x');
// rival
await page.evaluate(() => { void window.__pingo.mundo.rodarEvento('gincana-rival-2'); }); await t.espera(1200); await t.foto('t7-06-rival');
await t.assentar(60000);
// doador da muda em A10
await page.evaluate(() => window.__pingo.mundo.irPara('A10', 19, 22, 'n')); await t.assentar(60000); await t.espera(600);
await t.foto('t7-07-viveirista');
await t.k('z', 800); await t.assentar(60000);
sv = await s(); t.ok(sv.mochila['muda-de-buriti'] === 1, 'viveirista deu a Muda de Buriti');
console.log(await t.falas(5));
console.log('erros', t.erros);
await t.browser.close();
