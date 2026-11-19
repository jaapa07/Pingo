import { abrir } from './lib.mjs';
const t = await abrir('A6-ginasio', '', 4, '3:95,6:95');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.ir('nnn'); await t.ir('llllll'); await t.ir('n'); await t.confere(14, 14, 'ponte leste recolhida');
  await t.foto('t5-a');
  await t.ir('oooooooooo'); await t.confere(4, 14, 'pé da ponte oeste'); await nb(1, 'g05-1');
  await t.ir('nnn'); await t.confere(4, 11, 'ponte oeste'); await nb(2, 'g05-2');
  await t.ir('oo'); await t.agir('n'); console.log(await t.falas(1));
  await t.ir('ll'); await t.ir('ssss'); await t.ir('lllllll'); await t.confere(11, 15, 'chave 1'); await t.agir('l'); console.log(await t.falas(1));
  await t.foto('t5-b');
  await t.ir('n'); await t.ir('lll'); await t.ir('nnn'); await t.confere(14, 11, 'ponte leste'); await nb(3, 'g05-3');
  await t.ir('n'); await t.ir('ooooooooooo'); await t.confere(3, 10, 'relé'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('lllllllllll'); await t.ir('nnn'); await t.confere(14, 7, 'ponte norte'); await nb(4, 'g05-4');
  await t.ir('n'); await t.ir('ooo'); await t.ir('o'); await t.confere(11, 6, 'piso eletrificado barra');
  await t.foto('t5-c');
  await t.ir('s'); await t.ir('ooooooo'); await t.ir('n'); await t.confere(4, 6, 'chave 3'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('s'); await t.ir('lllll'); await t.ir('nnnnn'); await t.confere(9, 2, 'ponte do líder');
  await t.foto('t5-d');
  await t.agir('n'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.ir('ssss'); await t.ir('lllll'); await t.ir('ssss'); await t.ir('sss'); await t.confere(14, 13, 'depois da vitória as pontes ficam todas ligadas');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erroT5').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
