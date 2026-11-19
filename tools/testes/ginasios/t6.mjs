import { abrir } from './lib.mjs';
const t = await abrir('A7-ginasio', '', 4, '6:95,3:95', 'labareda');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.ir('n'); await t.confere(8, 16, 'entrada'); await nb(1, 'g06-1');
  await t.foto('t6-a');
  await t.ir('nn'); await t.confere(12, 15, 'alçapão no escuro devolve ao começo da sala 1'); console.log(await t.falas(1));
  await t.ir('s'); await t.agir('l'); console.log(await t.falas(1));
  await t.foto('t6-b');
  await t.ir('nnn'); await t.ir('oooooooo'); await t.ir('nn'); await t.confere(4, 11, 'sala 2'); await nb(2, 'g06-2');
  await t.ir('o'); await t.agir('o');
  await t.ir('lnn'); await t.ir('llll'); await t.ir('ss'); await t.ir('llllll'); await t.confere(14, 11, 'segunda lamparina da sala 2'); console.log(await t.falas(2));
  await t.foto('t6-c');
  await t.agir('l');
  await t.ir('nn'); await t.ir('oooo'); await t.ir('nn'); await t.confere(10, 7, 'sala 3'); await nb(3, 'g06-3');
  await t.agir('l');
  await t.ir('nn'); await t.ir('oooo'); await t.ir('ss'); await t.ir('oooo'); await t.ir('n'); await t.confere(2, 6, 'lamparina oeste da sala 3');
  await t.foto('t6-d');
  await t.agir('o'); await t.ir('nn'); await t.ir('llllll'); await t.ir('nn'); await t.confere(8, 2, 'salão da líder'); await nb(4, 'g06-4');
  await t.ir('l'); await t.agir('n'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.ir('oss'); await t.foto('t6-e'); await t.confere(8, 4, 'volta com os lustres acesos');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erroT6').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
