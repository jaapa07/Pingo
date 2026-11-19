import { abrir } from './lib.mjs';
const t = await abrir('A3-ginasio');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.foto('g2-a');
  await t.ir('nnnnnn'); await t.confere(8, 11, 'ponte 1 → centro'); console.log(await t.falas(1));
  await t.ir('n'); await t.ir('oo'); await t.confere(8, 16, 'ponte 4 fora de ordem derruba'); console.log(await t.falas(1));
  await t.ir('nnnnnn'); await t.ir('lll'); await t.ir('l'); await t.confere(12, 10, 'ponte 2 → leste'); await nb(1, 'g02-1');
  await t.ir('nll'); await t.ir('nnnn'); await t.confere(14, 5, 'ponte 3 → nordeste'); await nb(2, 'g02-2');
  await t.foto('g2-b');
  await t.ir('lnnno'); await t.ir('oo'); await t.confere(8, 16, 'ponte 7 (atalho) derruba'); console.log(await t.falas(1));
  await t.ir('nnnnnn'); await t.ir('ooo'); await t.ir('o'); await t.confere(4, 10, 'ponte 4 → oeste'); await nb(3, 'g02-3');
  await t.ir('noo'); await t.ir('nnnn'); await t.confere(2, 5, 'ponte 5 → noroeste'); await nb(4, 'g02-4');
  await t.ir('lnnn'); await t.ir('lll'); await t.confere(6, 2, 'ponte 6 → líder');
  await t.foto('g2-c');
  await t.ir('ll'); await t.agir('n'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(3)); console.log(JSON.stringify(await t.save()));
  await t.foto('g2-d');
  await t.ir('lll'); await t.ir('l'); await t.confere(12, 2, 'ponte 7 agora aguenta (depois da 6)');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erro2').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
