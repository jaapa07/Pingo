import { abrir } from './lib.mjs';
const t = await abrir('A8-ginasio', '', 4, '6:95,3:95', 'labareda');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.ir('nnn'); await t.confere(8, 14, 'pé da esteira da porta'); await nb(1, 'g07-1');
  await t.ir('n'); await t.confere(8, 14, 'esteira descendo devolve');
  await t.foto('t7-a');
  await t.ir('oooo'); await t.ir('s'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('n'); await t.ir('llll'); await t.ir('n'); await t.confere(8, 11, '1º andar'); await nb(2, 'g07-2');
  await t.ir('nl'); await t.ir('n'); await t.confere(8, 16, 'esteira do meio leva à prensa'); console.log(await t.falas(1));
  await t.ir('nn'); await t.ir('n'); await t.confere(8, 11, '1º andar de novo');
  await t.ir('n'); await t.ir('lllllll'); await t.confere(15, 10, 'engrenagem azul'); await t.agir('l');
  await t.foto('t7-b');
  await t.ir('o'); await t.ir('n'); await t.confere(14, 7, '2º andar pela esteira azul'); await nb(3, 'g07-3');
  await t.ir('nl'); await t.agir('l');
  await t.ir('ooooooooo'); await t.ir('s'); await t.ir('oooo'); await t.ir('n'); await t.confere(2, 6, 'pé da esteira do noroeste'); await nb(4, 'g07-4');
  await t.ir('n'); await t.confere(2, 2, 'mezanino');
  await t.ir('l'); await t.ir('l'); await t.confere(3, 2, 'esteira azul contra devolve');
  await t.foto('t7-c');
  await t.ir('oo'); await t.agir('n');
  await t.ir('ll'); await t.ir('l'); await t.confere(7, 2, 'salão da líder');
  await t.ir('ll'); await t.confere(9, 2, 'último operário'); await nb(5, 'g07-5');
  await t.ir('n'); await t.agir('l'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.foto('t7-d');
  await t.ir('sooooo'); await t.confere(4, 2, 'depois da vitória as esteiras param');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erroT7').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
