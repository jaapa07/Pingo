import { abrir } from './lib.mjs';
const t = await abrir('A4-ginasio');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.foto('g3-a');
  await t.ir('nnn'); await t.confere(8, 14, 'cais sul'); await nb(1, 'g03-1');
  await t.ir('n'); await t.confere(8, 14, 'balsa encalhada não deixa passar');
  await t.ir('ooos'); await t.agir('o'); console.log(await t.falas(2));
  await t.foto('g3-b');
  await t.ir('nlll'); await t.ir('nnn'); await t.confere(8, 11, 'balsa do canal A'); await nb(2, 'g03-2');
  // ordem errada primeiro: volante 2 fecha o braço D
  await t.ir('n'); await t.ir('ooooo'); await t.ir('n'); await t.confere(3, 9, 'diante do volante 2'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('s'); await t.ir('lllllll'); await t.ir('l'); await t.confere(10, 10, 'braço D cheio barra a passarela');
  await t.foto('g3-c');
  await t.ir('ooooooo'); await t.ir('n'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('s'); await t.ir('lllllll'); await t.ir('lll'); await t.confere(13, 10, 'passarela do braço D'); await nb(3, 'g03-3');
  await t.ir('nll'); await t.agir('l'); console.log(await t.falas(1));
  await t.ir('oos'); await t.ir('ooo'); await t.ir('ooooooo'); await t.ir('n'); await t.confere(3, 9, 'de volta ao volante 2'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('l'); await t.ir('nnn'); await t.confere(4, 6, 'passarela do canal B'); await nb(4, 'g03-4');
  await t.foto('g3-d');
  await t.ir('n'); await t.ir('llllllllll'); await t.ir('nnn'); await t.confere(14, 2, 'balsa do canal C'); await nb(5, 'g03-5');
  await t.ir('n'); await t.ir('oooo'); await t.confere(10, 1, 'ao lado do líder');
  await t.agir('o'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.foto('g3-e');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erro3').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
