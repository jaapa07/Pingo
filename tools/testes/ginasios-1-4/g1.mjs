import { abrir } from './lib.mjs';
const t = await abrir('A2-ginasio');
try {
  await t.foto('g1-a');
  await t.ir('nnn'); await t.confere(8, 11, 'prancha do meio leva ao deque central');
  await t.ir('lllll'); await t.ir('n'); await t.confere(8, 16, 'rajada depois do 2º mastro derruba no mar');
  console.log(await t.falas(2));
  await t.ir('nn'); await t.confere(8, 11, 'de novo no deque central');
  await t.ir('ooo'); let s = await t.confere(5, 11, 'treinador 1 desafiou'); if (s.nb < 1) throw new Error('g01-1 não desafiou');
  await t.ir('n'); await t.confere(5, 10, 'parou no 1º mastro');
  await t.ir('noo'); await t.confere(3, 9, 'pé da prancha esquerda');
  await t.ir('n'); await t.confere(3, 9, 'vento contra devolve');
  await t.ir('llll'); await t.ir('s'); await t.confere(11, 10, 'parou no 2º mastro');
  await t.foto('g1-b');
  await t.ir('n'); s = await t.confere(11, 9, 'treinador 2'); if (s.nb < 2) throw new Error('g01-2 não desafiou');
  await t.ir('ll'); await t.ir('n'); await t.confere(13, 5, 'prancha direita leva ao deque nordeste');
  await t.ir('n'); s = await t.confere(13, 4, 'treinador 3'); if (s.nb < 3) throw new Error('g01-3 não desafiou');
  await t.ir('l'); await t.agir('n'); console.log(await t.falas(2));
  await t.foto('g1-c');
  await t.ir('os'); await t.ir('s'); await t.confere(13, 9, 'prancha direita agora desce');
  await t.ir('oo'); await t.ir('s'); await t.confere(11, 10, 'mastro'); await t.ir('s');
  await t.ir('oooooo'); await t.confere(5, 11, 'fila 11');
  await t.ir('n'); await t.ir('noo'); await t.ir('n'); await t.confere(3, 5, 'prancha esquerda sobe');
  await t.ir('n'); s = await t.confere(3, 4, 'treinador 4'); if (s.nb < 4) throw new Error('g01-4 não desafiou');
  await t.ir('l'); await t.ir('l'); await t.confere(7, 4, 'corrente final leva ao deque do líder');
  await t.ir('nnl'); await t.foto('g1-d');
  await t.agir('n'); s = await t.assentar();
  console.log('batalhas', s.nb, await t.falas(3)); console.log(JSON.stringify(await t.save()));
  await t.foto('g1-e');
  // saída: corrente leste até o deque nordeste, prancha direita, volta e porta
  await t.ir('ssl'); await t.ir('l'); s = await t.assentar(); console.log('após corrente leste', s.x, s.y);
} catch (e) { console.log('FALHA', e.message, await t.st(), await t.falas(4)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
