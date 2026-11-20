import { abrir } from './lib.mjs';
const vp = process.argv[2] ?? 'pc';
const t = await abrir('?zona=A-SF-casa&x=2&y=5&dir=n&flags=liga-vencida&itens=pedra-de-rio,muda-de-buriti&dinheiro=3000&equipe=23:45,102:45,98:45&semente=7');
const { page } = t;
await t.pronto(); await t.espera(800);
const topo = () => page.evaluate(() => window.__pingo.telas.topo?.el.className ?? '');
const fl = () => page.evaluate(() => window.__pingo.jogo.save.flags);
await t.k('z', 1000); await t.foto('t4-01-dono');
await t.assentar(60000);
let f = await fl(); t.ok(f['safari-setor-2'] && f['safari-setor-3'] && !f['safari-setor-4'], 'dono abriu setores 2 e 3', JSON.stringify(f));
await page.evaluate(() => window.__pingo.mundo.irPara('A-SF', 12, 3, 'n')); await t.assentar(); await t.espera(500);
await t.foto('t4-02-portaria');
await t.k('z', 800);
for (let i = 0; i < 30 && !(await page.evaluate(() => window.__pingo.mundo.falas.slice(-1)[0]?.texto.startsWith('Entrada'))); i++) await t.k('z', 400);
await t.foto('t4-03-escolha');
await t.k('z', 800);
await t.assentar(60000);
let s = await t.st(); t.ok(s.zona === 'A-SF-parque', 'entrou no parque', JSON.stringify(s));
f = await fl(); t.ok(f['safari-ativo'] && f['safari-passos'] === 500, 'passeio ativo', `${f['safari-passos']}`);
t.ok(await page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-safari'] === 30 && window.__pingo.jogo.save.jogador.dinheiro === 2500), '30 cuias e 500 patacas pagas');
await t.espera(600); await t.foto('t4-04-parque');
// até o portão do setor 2 e o capim da lagoa
for (const d of 'nnnnnnn') await t.passo(d);
for (let i = 0; i < 13; i++) await t.passo('l');
await t.foto('t4-05-lagoa');
await t.passo('s');
const pronto = () => page.evaluate(() => { const c = document.querySelector('.tela-safari .cursor-mao'); return !!c && c.style.visibility !== 'hidden'; });
let capturou = false, encontros = 0, acoes = ['isca', 'pedra', 'perto', 'perto', 'cuia'];
for (let passo = 0; passo < 200 && encontros < 3 && !capturou; passo++) {
  const st = await t.st();
  if ((await topo()).includes('tela-safari')) {
    encontros++; let k = 0, fotos = 0;
    await t.foto(`t4-06-encontro${encontros}`);
    while ((await topo()).includes('tela-safari')) {
      if (await pronto()) {
        const a = acoes[Math.min(k++, acoes.length - 1)];
        const i = { cuia: 0, isca: 1, pedra: 2, perto: 3 }[a];
        if (a === 'isca') { await t.k('ArrowDown', 300); await t.k('z', 600); }
        else await page.locator('.tela-safari .sf-menu .botao').nth(i).click();
        await t.espera(400);
        if (fotos++ < 3) await t.foto(`t4-07-acao${encontros}-${a}`);
      } else await t.k('z', 500);
    }
    await t.espera(800);
    const fl2 = await fl(); capturou = (fl2['safari-capturas'] ?? 0) > 0;
    // apelido: não
    for (let i = 0; i < 10 && (await t.st()).oc; i++) { await t.k('x', 500); }
    await t.foto(`t4-08-depois${encontros}`);
    continue;
  }
  await t.passo(st.x >= 25 ? 'o' : 'l');
}
f = await fl();
const eq = await page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie} nv${c.nivel} ${c.localCaptura ?? ''} ${c.cuia}`));
console.log('encontros', encontros, 'capturou', capturou, 'passos', f['safari-passos'], 'cuias', await page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-safari']), eq);
// sai pela porteira (warp) e confere o fim do passeio
await page.evaluate(() => window.__pingo.mundo.irPara('A-SF', 13, 3, 's')); await t.assentar(); await t.espera(800);
f = await fl(); t.ok(!f['safari-ativo'] && !(await page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-safari'])), 'saiu: passeio encerrado e cuias devolvidas');
await t.foto('t4-09-saida');
console.log(await t.falas(5));
console.log('erros', t.erros);
await t.browser.close();
