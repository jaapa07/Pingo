import { abrir } from './lib.mjs';
const t = await abrir('B1-ginasio');
const nb = async (n, r) => { const s = await t.assentar(); if (s.nb < n) throw new Error(`${r}: esperava ${n} batalhas, houve ${s.nb}`); };
try {
  await t.ir('nn'); await t.ir('ololol'); await t.ir('lllllll'); await t.confere(15, 15, 'canto do salão sul'); await nb(1, 'g04-1');
  await t.foto('g4-a');
  await t.ir('n'); await t.confere(15, 15, 'cipó do salão fechou a portinhola (15 passos)');
  await t.agir('n'); console.log(await t.falas(1));
  await t.ir('nnn'); await t.confere(15, 12, 'portinhola depois do Facão');
  await t.ir('l'); await t.agir('l'); console.log(await t.falas(1));
  await t.ir('onn'); await t.ir('oooo'); await t.ir('nn'); await t.ir('ll'); await t.confere(13, 8, 'corredor leste'); await nb(2, 'g04-2');
  await t.ir('nn'); await t.confere(13, 6, 'subida da coluna 13 a tempo');
  await t.foto('g4-b');
  await t.ir('oonn'); await t.ir('oooo'); await t.ir('ss'); await t.confere(7, 6, 'fila 6');
  await t.ir('o'); await t.confere(7, 6, 'sem o vaso do meio, o cipó da fila 6 já fechou');
  await t.foto('g4-c');
  await t.ir('llss'); await t.ir('o'); await t.confere(8, 8, 'vaso do meio, lado norte'); await t.agir('o'); console.log(await t.falas(1));
  await t.ir('lnn'); await t.ir('oooo'); await t.confere(5, 6, 'fila 6 a tempo');
  await t.ir('nn'); await t.ir('oooo'); await t.ir('nn'); await t.confere(1, 2, 'salão da líder');
  await t.ir('llll'); await t.confere(5, 2, 'diante da última treinadora'); await nb(3, 'g04-5');
  await t.ir('llll'); await t.agir('n'); const s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(2)); console.log(JSON.stringify(await t.save()));
  await t.foto('g4-d');
  // volta: depois da vitória os cipós dormem
  await t.ir('oooooooo'); await t.ir('ss'); await t.ir('llll'); await t.ir('ss'); await t.ir('ll'); await t.confere(7, 6, 'volta livre depois da vitória');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(4).catch(() => 0)); await t.foto('erro4').catch(() => 0); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
