// QA pós-Liga 5 — Gincana jogada como gente (tempo real, jogador "humano.js" com reação e erro de mira), suco, ranking,
// rivais e troca de pontos. Uso: run.sh r5-gincana.mjs <seg> [reacao=0.25] [sigma=0.045] [distrai=0.1] [semente=1]
import { readFileSync } from 'node:fs';
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, tecla, textos, limparTextos, topo, flags, irPara } from './comum.mjs';
const [REA, SIG, DIS, SEM] = [Number(process.argv[2] ?? 0.25), Number(process.argv[3] ?? 0.045), Number(process.argv[4] ?? 0.1), Number(process.argv[5] ?? 1)];
const t = await abrir(lerSave(process.argv[6] ?? 'campeao'), { rapido: false, anim: true });
await preparar(t);
await t.page.addScriptTag({ content: readFileSync(new URL('./humano.js', import.meta.url), 'utf8') });
const escolherCard = (i) => t.q(async (i) => {
  const Q = window.Q;
  for (let g = 0; g < 60; g++) {
    const sel = document.querySelector('.tela-equipe .grade .mol-selecao'); const cur = sel ? Math.round((parseInt(sel.style.top) + 2) / 48) * 2 + Math.round((parseInt(sel.style.left) + 2) / 158) : 0;
    if (cur === i) { await Q.toque('a'); await Q.quadros(4); return true; }
    const rc = cur >> 1, rt = i >> 1; await Q.toque(rc !== rt ? (cur % 2 === 1 ? 'esq' : rc < rt ? 'baixo' : 'cima') : cur < i ? 'dir' : 'esq'); await Q.quadros(3);
  }
  return false;
}, i);
/** melhor criatura da equipe para a prova (como quem olha o Resumo) */
const melhor = (prova) => t.q(async (prova) => {
  const B = await import('/src/battle/index.ts'); const eq = window.__pingo.jogo.save.equipe;
  const nota = (c) => { const a = B.atributos(c); return prova === 'forca' ? a.atq + 0.5 * a.def : prova === 'salto' ? a.vel + 0.5 * a.def : a.vel + 0.3 * a.def; };
  let k = 0; eq.forEach((c, i) => { if (!c.ovo && c.vida > 0 && nota(c) > nota(eq[k])) k = i; });
  const a = B.atributos(eq[k]); return { k, nome: eq[k].especie, vel: a.vel, atq: a.atq, def: a.def };
}, prova);
try {
  await relogio(t, 3, 15 * 60);
  await irPara(t, 'A-LG', 26, 55, 'l');
  await t.falarCom('carreiro-gincana');
  t.ok((await t.st()).zona === 'A-GN', 'carreiro leva ao Vale do Buriti-Alto');
  await t.foto('r5-vale');
  // suco de caju para a corredora
  const ag = await melhor('agilidade');
  await t.q(() => { window.Q.telaEsperada = /tela-equipe/; });
  await limparTextos(t); await t.falarCom('gincana-graviola');
  if (/tela-equipe/.test(await topo(t))) { await t.foto('r5-escolhe-suco'); await escolherCard(ag.k); }
  await t.q(() => { window.Q.telaEsperada = null; }); await t.assentar();
  console.log('   graviola:', (await textos(t, 8)).map((x) => x.replace(/\n/g, ' ')).join(' ⏎ ').slice(0, 500));
  const res = {};
  for (const [i, prova] of (process.argv[7] === 'sem-provas' ? [] : ['agilidade', 'forca', 'salto']).entries()) {
    const m = await melhor(prova);
    const dur = (0.55 + 0.2 * Math.max(0, Math.min(1, (m.vel - 30) / 220)));
    await t.q((i) => { const Q = window.Q; Q.regrasEscolha = Q.regrasEscolha.filter((r) => !r[0].prova); Q.regrasEscolha.unshift([{ prova: true, test: () => /^Qual prova/.test(Q.textos[Q.textos.length - 1] ?? '') }, i]); Q.telaEsperada = /tela-equipe/; }, i);
    await limparTextos(t); await t.falarCom('gincana-juiza');
    if (!/tela-equipe/.test(await topo(t))) { t.ok(false, prova + ': escolha da criatura não abriu', await topo(t)); continue; }
    await escolherCard(m.k);
    await t.q(() => { window.Q.telaEsperada = null; });
    for (let g = 0; g < 400 && !/tela-gincana/.test(await topo(t)); g++) { if (/dialogo/.test(await topo(t))) await tecla(t, 'a', 1, 6); else await t.espera(50); }
    await t.espera(1500);
    const jog = t.q(([p, o]) => window.H.jogar(p, o), [prova, { reacao: REA, sigma: SIG, distrai: DIS, semente: SEM + i, dur }]);
    if (i === 1) { await t.espera(15000); await t.foto('r5-forca-meio'); }
    const log = await jog;
    await t.foto(`r5-${prova}-res`);
    await tecla(t, 'a', 1, 10);
    await t.assentar();
    const fs = (await textos(t, 6)).filter((x) => /pontos/.test(x));
    console.log(`   ${prova} (criatura ${m.nome}, vel ${m.vel} atq ${m.atq} def ${m.def}; ${log.teclas} teclas em ${log.seg.toFixed(0)} s):`, fs.map((x) => x.replace(/\n/g, ' ')).join(' ⏎ '));
    res[prova] = fs.join(' ');
  }
  if (process.argv[7] !== 'sem-provas') t.ok(Object.keys(res).length === 3, '3 provas jogadas');
  // ranking pelo quadro
  await t.q(async () => { const V = await import('/src/world/vivo.ts'); const o = V.M.zv.def.objetos.find((x) => x.script === 'gincana-quadro'); window.__quadro = [o.x, o.y]; });
  const [qx, qy] = await t.q(() => window.__quadro);
  void t.usar(qx, qy).catch(() => 0);
  for (let g = 0; g < 80 && !/ranking/.test(await topo(t)); g++) await t.espera(100);
  await t.foto('r5-ranking');
  await tecla(t, 'a', 1, 10); await t.assentar();
  // rivais
  await limparTextos(t); await t.falarCom('gn-lina').catch((e) => console.log('   lina', e.message.split('\n')[0]));
  console.log('   rival:', (await textos(t, 2)).join(' ⏎ '));
  // tesouraria
  const pts = Number((await flags(t, '^gincana-pontos$'))['gincana-pontos'] ?? 0);
  console.log('   pontos da Gincana:', pts);
  await t.q(() => { window.Q.telaEsperada = /tela-loja/; });
  await t.falarCom('gincana-tesoureiro');
  await t.foto('r5-tesouraria');
  if (pts >= 30) {
    const v0 = (await t.resumo()).mochila['vitamina-vida'] ?? 0;
    for (let g = 0; g < 30; g++) {
      const tp = await topo(t);
      if (/janela-qtd|confirmacao/.test(tp)) { await t.foto('r5-tesouraria-qtd'); await tecla(t, 'a', 1, 10); continue; }
      if (/dialogo/.test(tp)) { await tecla(t, 'a', 1, 10); continue; }
      if ((await t.resumo()).mochila['vitamina-vida'] > v0) break;
      await tecla(t, 'a', 1, 10);
    }
    const v1 = (await t.resumo()).mochila['vitamina-vida'] ?? 0, p1 = Number((await flags(t, '^gincana-pontos$'))['gincana-pontos'] ?? 0);
    t.ok(v1 === v0 + 1 && p1 === pts - 30, 'troca de 30 pontos por Vitamina de Vida', `${v0}→${v1}, pontos ${pts}→${p1}`);
  }
  await t.q(() => { window.Q.telaEsperada = null; });
  for (let g = 0; g < 8 && (await t.q(() => window.__pingo.telas.pilha.length)) > 1; g++) await tecla(t, 'b', 1, 10);
  await t.assentar();
  await t.checkpoint('pos-r5-gincana');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r5-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
