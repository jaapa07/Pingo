// QA pós-Liga 1 — Rádio Cipó do Campeão: agenda, contatos (dia errado / certo), tabela de Revanches, Ginásio de Treino
// e uma revanche de líder JOGADA na tela de batalha (piloto por teclado). Uso: run.sh r1-radio.mjs <seg> [lider=lider-05] [dia=5] [min=480]
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, tecla, textos, limparTextos, topo, foco, escolherIdx, passarFalas, flags, irPara } from './comum.mjs';
const lider = process.argv[2] ?? 'lider-05', DIA = Number(process.argv[3] ?? 5), MIN = Number(process.argv[4] ?? 480), errado = process.argv[5] ?? 'lider-06';
const t = await abrir(lerSave(process.argv[6] ?? 'campeao'), { anim: true });
await preparar(t);
try {
  await relogio(t, DIA, MIN);
  await irPara(t, 'A4', 17, 18, 'n');
  const cont = await t.q(async () => { const D = await import('/src/world/deps.ts'); return window.__pingo.jogo.save.contatos.filter((id) => D.treinador(id)); });
  console.log('contatos válidos:', cont.join(' '));
  // MENU → Rádio Cipó
  await tecla(t, 'menu', 1, 10);
  const ops = await t.q(() => [...document.querySelectorAll('.tela-menu .lista-item')].length);
  await escolherIdx(t, 3); await tecla(t, 'a', 0);
  t.ok(/tela-radio/.test(await topo(t)), 'rádio abre pelo menu', `(${ops} itens no menu)`);
  await t.foto('r1-radio-abre');
  await escolherIdx(t, 0); // Agenda do dia
  await t.foto('r1-agenda-carta');
  await tecla(t, 'b', 2, 10);
  if (!/tela-radio/.test(await topo(t))) await tecla(t, 'b', 1, 10);
  // Contatos → dia errado
  await escolherIdx(t, 1);
  await t.foto('r1-contatos');
  await escolherIdx(t, cont.indexOf(errado), false); await t.foto('r1-contato-errado-desc'); await tecla(t, 'a', 1, 10);
  await limparTextos(t); await passarFalas(t); const fe = await textos(t);
  t.ok(fe.some((x) => /Hoje não vai dar/.test(x)) && !(await flags(t, '^treino:' + errado))['treino:' + errado], `${errado} recusa fora da agenda`, JSON.stringify(fe.slice(-1)));
  // dia certo
  await escolherIdx(t, cont.indexOf(lider), false); await t.foto('r1-contato-certo-desc'); await tecla(t, 'a', 1, 10);
  await limparTextos(t); await passarFalas(t); const fc = await textos(t);
  const fl = await flags(t, '^treino');
  t.ok(fc.some((x) => /meu dia de treino/.test(x)) && fl['treino-hoje:' + lider] === true, `${lider} marca a revanche no Ginásio de Treino`, JSON.stringify(fc.slice(-1)));
  // liga de novo: já marcado
  await escolherIdx(t, cont.indexOf(lider)); await limparTextos(t); await passarFalas(t);
  t.ok((await textos(t)).some((x) => /Já combinamos/.test(x)), 'ligar de novo lembra que já está marcado');
  await tecla(t, 'b', 1, 10);
  // Revanches
  await escolherIdx(t, 2); await t.foto('r1-revanches');
  const idxRev = await t.q(async (lider) => { const D = await import('/src/world/deps.ts'); const R = await import('/src/data/revancha.ts'); const s = window.__pingo.jogo.save; const cs = s.contatos.map((id) => D.treinador(id)).filter((x) => x && !/^rival-/.test(x.id)).sort((a, b) => ((R.agendaDe(a).dia + 6) % 7) - ((R.agendaDe(b).dia + 6) % 7) || ['manha', 'dia', 'noite'].indexOf(R.agendaDe(a).periodo) - ['manha', 'dia', 'noite'].indexOf(R.agendaDe(b).periodo)); return cs.findIndex((x) => x.id === lider); }, lider);
  await escolherIdx(t, idxRev, false); await t.foto('r1-revanches-lider');
  for (let k = 0; k < 6 && (await t.q(() => window.__pingo.telas.pilha.length)) > 1; k++) await tecla(t, 'b', 1, 10);
  await t.assentar();
  // Ginásio de Treino
  await t.falarCom('a4-guia-treino');
  let s = await t.st();
  t.ok(s.zona === 'A4-treino', 'guia leva ao Ginásio de Treino', s.zona);
  const npcs = (await t.npcs()).map((n) => n.id);
  t.ok(npcs.includes('treino-' + lider) && !npcs.includes('treino-' + errado), 'no salão só o líder marcado', npcs.join(','));
  await t.foto('r1-salao');
  await limparTextos(t);
  await t.q(() => { window.Q.regrasEscolha.push([/agenda da semana/, 0]); });
  await t.falarCom('treino-recepcao');
  console.log('   recepção:', (await textos(t, 12)).map((x) => x.replace(/\n/g, ' ')).join(' ⏎ ').slice(0, 900));
  // a revanche (tela de batalha, piloto esperto pelo teclado)
  const antes = await t.resumo();
  console.log('   equipe antes:', antes.equipe.map((e) => e.split(' [')[0]).join(' · '));
  const nb = (await t.st()).nb;
  await t.falarCom('treino-' + lider).catch((e) => console.log('   (luta)', e.message.split('\n')[0]));
  await t.assentar().catch((e) => console.log('   (assentar)', e.message.split('\n')[0]));
  const bs = await t.relato(nb);
  const fl2 = await flags(t, 'revanche|treino-hoje');
  console.log('   flags:', JSON.stringify(fl2));
  const r = await t.resumo(); console.log('   depois:', r.zona, '$' + r.dinheiro, '(antes $' + antes.dinheiro + ')', r.equipe.map((e) => e.split(' [')[0]).join(' · '));
  t.ok(bs.length === 1 && bs[0].tipo === 'treinador', 'revanche jogada na tela de batalha', bs.map((b) => b.resultado).join(','));
  await t.foto('r1-depois');
  // repetir no mesmo dia
  if (r.zona === 'A4-treino') {
    const vis = (await t.npcs()).some((n) => n.id === 'treino-' + lider);
    t.ok(!vis, 'líder sai do salão depois da revanche');
  }
  await t.checkpoint('pos-r1-' + lider);
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r1-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
