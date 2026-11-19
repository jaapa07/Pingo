import { abrir } from './lib.mjs';
const t = await abrir('A5-ginasio', '', 4, '6:95,3:95');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.foto('e4-a');
  await t.ir('lnn'); await t.ir('n'); await t.confere(9, 15, 'raio da fila 14 barra a passagem');
  await t.ir('oooooo'); await t.confere(3, 15, 'sob o espelho da entrada'); await nb(1, 'g04-1');
  await t.agir('n');
  await t.ir('llllll'); await t.ir('nnn'); await t.confere(9, 12, 'salão do meio');
  await t.ir('nn'); await t.ir('o'); await t.ir('o'); await t.confere(7, 10, 'ao lado do espelho do meio'); await nb(2, 'g04-2');
  await t.foto('e4-b');
  await t.ir('n'); await t.ir('o'); await t.confere(7, 9, 'raio barra a passagem oeste');
  await t.ir('s'); await t.agir('o');
  await t.ir('no'); await t.ir('nn'); await t.confere(6, 7, 'salão norte pelo oeste'); await nb(3, 'g04-3');
  await t.ir('n'); await t.agir('n'); // espelho da coluna 6 → oeste
  await t.ir('sl'); await t.ir('llll'); await t.ir('n'); await t.confere(11, 6, 'ao lado do espelho da coluna 12'); await nb(4, 'g04-4');
  await t.agir('l'); console.log(await t.falas(1));
  await t.foto('e4-c');
  await t.ir('onn'); await t.ir('o'); await t.ir('n'); await t.confere(9, 4, 'cortina ainda fechada');
  await t.ir('ssslll'); await t.ir('ss'); await t.confere(12, 9, 'passagem leste livre');
  await t.ir('ooooo'); await t.ir('s'); await t.confere(7, 10, 'espelho do meio de novo'); await t.agir('o'); console.log(await t.falas(2));
  await t.foto('e4-d');
  await t.ir('nlllll'); await t.ir('nn'); await t.ir('ooo'); await t.ir('nnn'); await t.ir('nn'); await t.confere(9, 2, 'cortina aberta'); await nb(5, 'g04-5');
  await t.agir('n'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.foto('e4-e');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erroE4').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
