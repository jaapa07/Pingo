// QA pós-Liga 3 — Quiz do Rádio na Ilha do Farol: dia 1 com 3 acertos (sem cartão), mesmo dia de novo (recusa),
// dia 2 com 5 acertos (Cartão do Rádio), dia 3 acerta de novo (sem 2º cartão); programas extras do rádio com o Cartão.
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, amanha, tecla, textos, limparTextos, topo, escolherIdx, passarFalas, flags, irPara } from './comum.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'campeao'), { anim: true });
await preparar(t);
/** responde as perguntas do quiz como quem sabe (erra as primeiras `erros`) */
const responder = (erros) => t.q(async (erros) => {
  const QZ = await import('/src/data/quiz.ts'); let n = 0;
  window.Q.regrasEscolha = window.Q.regrasEscolha.filter((r) => !r[0].quiz);
  const certa = (p) => { const q = QZ.QUIZ_FAUNA.find((x) => p.includes(x.p)); if (!q) return null; n++; return n <= erros ? !q.r : q.r; };
  let ultima = null;
  const sim = { quiz: true, test: (p) => { if (!/^Pergunta \d/.test(p)) return false; ultima = certa(p) ?? ultima; return ultima === true; } };
  const nao = { quiz: true, test: (p) => /^Pergunta \d/.test(p) && ultima === false };
  window.Q.regrasEscolha.unshift([sim, 0], [nao, 1], [{ quiz: true, test: (p) => /Topa entrar no ar/.test(p) }, 0]);
}, erros);
try {
  await relogio(t, 3, 10 * 60);
  await irPara(t, 'A6', 27, 26, 'l');
  await responder(2); await limparTextos(t);
  await t.falarCom('a6-locutora');
  let fs = await textos(t, 40);
  console.log('   dia 1:', fs.filter((x) => /^Pergunta|acert|de 5|Faltou/.test(x)).map((x) => x.slice(0, 80)).join(' ⏎ '));
  const ac1 = (await flags(t, 'quiz'))['quiz-acertos'];
  t.ok(ac1 === 3 && !(await t.resumo()).mochila['cartao-radio'], 'dia 1: 3 acertos, sem Cartão do Rádio', String(ac1));
  await limparTextos(t); await t.falarCom('a6-locutora'); fs = await textos(t, 3);
  t.ok(fs.some((x) => /já foi ao ar/.test(x)), 'mesmo dia: o quiz não repete');
  await amanha(t); await responder(0); await limparTextos(t);
  await t.falarCom('a6-locutora'); await t.foto('r3-quiz-dia2');
  fs = await textos(t, 40);
  console.log('   dia 2:', fs.filter((x) => /de 5|Cartão/.test(x)).map((x) => x.slice(0, 120)).join(' ⏎ '));
  const m2 = (await t.resumo()).mochila['cartao-radio'];
  t.ok(m2 === 1, 'dia 2: 5 acertos → Cartão do Rádio', String(m2));
  await amanha(t); await responder(0); await limparTextos(t); await t.falarCom('a6-locutora');
  t.ok((await t.resumo()).mochila['cartao-radio'] === 1, 'dia 3: acertou de novo, continua com 1 cartão');
  // rádio com o Cartão: Cantiga das Lendas, música dos lugares, dica de captura
  await tecla(t, 'menu', 1, 10); await escolherIdx(t, 3);
  await t.foto('r3-radio-cartao');
  const ops = await t.q(() => document.querySelectorAll('.tela-radio .lista-item').length);
  t.ok(ops === 10, 'rádio com 10 programas (Cantiga das Lendas entrou)', String(ops));
  await escolherIdx(t, 7); await t.foto('r3-cantigas');
  for (let i = 0; i < 7; i++) { await escolherIdx(t, i); let p = 0; while (!/tela-radio|escolher|lista/.test(await topo(t)) && p++ < 4) { if (i === 1 || i === 6) await t.foto(`r3-cantiga-${i}-${p}`); await tecla(t, 'a', 1, 8); } }
  await tecla(t, 'b', 1, 10);
  await escolherIdx(t, 3); await t.foto('r3-bicho-dia'); await tecla(t, 'b', 1, 10);
  await escolherIdx(t, 4); await t.foto('r3-musica'); await tecla(t, 'b', 1, 10);
  await escolherIdx(t, 5); await t.foto('r3-noticias'); await escolherIdx(t, 0); await t.foto('r3-noticia-1'); await tecla(t, 'a', 3, 8); await tecla(t, 'b', 1, 10);
  await tecla(t, 'b', 2, 10);
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r3-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
