// QA pós-Liga 8 — ninho do Seu Aroeira (deixar casal, andar, aviso pelo rádio, recolher o ovo, chocar, retirar os pais),
// trocas com os 3 moradores do mapa A e a rara garantida do lago da Gruta Breu (+ estrela na equipe e no Diário).
// Uso: run.sh r8-ninho.mjs <seg> [partes=ninho,troca,lago]
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, tecla, textos, limparTextos, topo, flags, irPara } from './comum.mjs';
const PARTES = (process.argv[2] ?? 'ninho,troca,lago').split(',');
const t = await abrir(lerSave(process.argv[3] ?? 'campeao'));
await preparar(t);
/** anda correndo (B segurado) de um lado para o outro numa faixa livre até `n` passos (ou até `pare()`) */
const andar = (n, pare) => t.q(async ([n, pare]) => {
  const P = window.__pingo, V = await import('/src/world/vivo.ts'), Q = window.Q, M = V.M;
  const fim = M.passos + n, ev = (tp, c) => document.dispatchEvent(new KeyboardEvent(tp, { code: c, key: c, bubbles: true }));
  const quadro = () => new Promise((r) => requestAnimationFrame(r));
  let dir = 'ArrowRight', x0 = P.mundo.jogador.x, guarda = 0;
  ev('keydown', 'KeyX');
  while (M.passos < fim && guarda++ < 200000) {
    if (pare && eval(pare)) break;
    const s = Q.st();
    if (s.oc || s.telas > 1 || !s.pronto) { ev('keyup', dir); ev('keyup', 'KeyX'); await Q.assentar(); ev('keydown', 'KeyX'); continue; }
    ev('keydown', dir); await quadro();
    const x = P.mundo.jogador.x;
    if (!s.mov && x === s.x && guarda % 6 === 5) { ev('keyup', dir); dir = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight'; }
    else if (Math.abs(x - x0) >= 6) { ev('keyup', dir); dir = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight'; x0 = x; }
  }
  ev('keyup', dir); ev('keyup', 'KeyX');
  return M.passos;
}, [n, pare ?? null]);
const ninhoXY = () => t.q(async () => { const V = await import('/src/world/vivo.ts'); const o = V.M.zv.def.objetos.find((x) => x.script === 'criadouro-aroeira'); return [o.x, o.y]; });
const escolha = (re, i) => t.q(([re, i]) => { const Q = window.Q; Q.regrasEscolha.unshift([{ test: () => new RegExp(re).test(Q.textos[Q.textos.length - 1] ?? '') }, i]); }, [re, i]);
const limparEscolhas = () => t.q(() => { window.Q.regrasEscolha = []; window.Q.escolhaFn = null; });
/** roteiro de escolhas em ordem: cada pergunta nova que casa com o próximo [regex, índice] recebe esse índice; fora do roteiro = última opção (sair) */
const roteiro = (seq) => t.q((seq) => {
  // cada lista nova (elemento novo do DOM) consome o próximo índice do roteiro; acabou o roteiro = última opção (sair)
  const Q = window.Q; let k = 0, ultima = null, cur = 99;
  Q.escolhaFn = (el) => { if (el !== ultima) { ultima = el; cur = k < seq.length ? seq[k++] : 99; } return cur; };
}, seq);
try {
  await relogio(t, 2, 10 * 60);
  if (PARTES.includes('ninho')) {
    await irPara(t, 'A2-casa-aroeira', 7, 7, 'n');
    const [nx, ny] = await ninhoXY();
    // deixa Gaviãozão (F, voador, índice 0) e Vampirinha (M, voador, índice 5 → 4 depois de tirar a 1ª)
    await roteiro([0, 0, 0, 4, 99]);
    await limparTextos(t); await t.usar(nx, ny);
    await limparEscolhas();
    const cr = await t.q(() => { const c = window.__pingo.jogo.save.criadouro; return c ? c.casal.map((x) => `${x.especie}${x.sexo}`) : []; });
    console.log('   ninho:', (await textos(t, 8)).filter((x) => /ninho|cuidado|unha|nem se olham|dão bem/.test(x)).map((x) => x.slice(0, 90)).join(' ⏎ '));
    t.ok(cr.length === 2, 'casal deixado no ninho', cr.join(' + '));
    // anda até aparecer o ovo
    await irPara(t, 'A2', 20, 20, 'l');
    await limparTextos(t);
    const p0 = await t.q(async () => (await import('/src/world/vivo.ts')).M.passos);
    await andar(6000, '!!window.__pingo.jogo.save.criadouro?.ovo');
    await t.assentar();
    const p1 = await t.q(async () => (await import('/src/world/vivo.ts')).M.passos);
    const ovo = await t.q(() => window.__pingo.jogo.save.criadouro?.ovo?.especie);
    const radio = (await textos(t, 10)).filter((x) => /Trim|ovo/.test(x));
    t.ok(!!ovo, `apareceu ovo depois de ${p1 - p0} passos`, String(ovo));
    t.ok(radio.some((x) => /Trim, trim/.test(x)), 'aviso pelo Rádio Cipó', radio.join(' | ').slice(0, 200));
    // recolhe
    await irPara(t, 'A2-casa-aroeira', 7, 7, 'n');
    await roteiro([]); await limparTextos(t); await t.usar(nx, ny); await limparEscolhas();
    const eqOvo = await t.q(() => window.__pingo.jogo.save.equipe.filter((c) => c.ovo).map((c) => `${c.especie}:${c.ovo}`));
    t.ok(eqOvo.length === 1, 'ovo recolhido para a equipe', eqOvo.join(','));
    // choca
    await irPara(t, 'A2', 20, 20, 'l');
    await limparTextos(t);
    await andar(4000, '!window.__pingo.jogo.save.equipe.some((c) => c.ovo)');
    await t.assentar();
    const nasc = await t.q(() => { const s = window.__pingo.jogo.save; const c = s.equipe[s.equipe.length - 1]; return { esp: c.especie, nv: c.nivel, ovo: c.ovo, rara: !!c.rara, golpes: c.golpes.map((g) => g.id), local: c.localCaptura, to: c.treinadorOriginal }; });
    t.ok(!nasc.ovo, 'ovo chocou', JSON.stringify(nasc) + ' ' + (await textos(t, 3)).filter((x) => /Nasceu/.test(x)).join(''));
    // retira os pais (paga pela hospedagem)
    await irPara(t, 'A2-casa-aroeira', 7, 7, 'n');
    const d0 = (await t.resumo()).dinheiro;
    await roteiro([0, 0, 1, 0, 99]);
    await limparTextos(t); await t.usar(nx, ny); await limparEscolhas();
    console.log('   retirar:', (await textos(t, 6)).filter((x) => /patacas|cresceu|descansou|cheia/.test(x)).join(' ⏎ '), '| $', d0, '→', (await t.resumo()).dinheiro);
    await t.checkpoint('pos-r8-ninho');
  }
  if (PARTES.includes('troca')) {
    // Cupinzim (163) está no Viveiro do Campeão: vai para a equipe (o jogador faria isso pelo Viveiro de Cuias)
    await t.q(() => { const s = window.__pingo.jogo.save; while (s.equipe.length > 3) { const c = s.equipe.pop(); const cx = s.viveiro.find((x) => x.includes(null)); cx[cx.indexOf(null)] = c; } for (const cx of s.viveiro) { const i = cx.findIndex((c) => c && c.especie === 163); if (i >= 0) { s.equipe.push(cx[i]); cx[i] = null; break; } } });
    // captura Cotiazinha (13) na Trilha do Ipê e Caranguejim (35) em Cidade Coral, pelo capim, na tela
    for (const [z, x, y, e] of [['A-R1', 15, 40, 13], ['A5', 20, 20, 35]]) {
      await irPara(t, z, x, y, 's');
      await t.q((e) => { const Q = window.Q; Q.capturar = (esp) => esp === e; Q.capturarRepetidas = true; Q.maxCapturas = Q.capturadas.length + 1; Q.cuiaPreferida = 'cuia'; }, e);
      for (let k = 0; k < 40 && !(await t.q((e) => window.__pingo.jogo.save.equipe.some((c) => c.especie === e), e)); k++) await t.q(() => window.Q.passear(1)).catch((er) => console.log('   passear', er.message.split('\n')[0]));
      t.ok(await t.q((e) => window.__pingo.jogo.save.equipe.some((c) => c.especie === e), e), `capturou a espécie ${e} em ${z}`);
    }
    for (const [z, npc, quer] of [['A3', 'a3-quiteria', 13], ['A5', 'a5-mare-cheia', 35], ['A8', 'a8-ze-malho', 163]]) {
      await irPara(t, z, ...(await t.q(async ([z, npc]) => { const D = await import('/src/world/zonas.ts'); const n = D.zonaDef(z).npcs.find((q) => q.id === npc); return [n.x, n.y + 2]; }, [z, npc])), 'n');
      await limparTextos(t); await t.falarCom(npc);
      const fs = await textos(t, 8);
      const veio = await t.q((quer) => { const s = window.__pingo.jogo.save; return { tem: s.equipe.some((c) => c.especie === quer), nova: s.equipe.filter((c) => c.treinadorOriginal && c.treinadorOriginal !== s.jogador.nome).map((c) => `${c.apelido}(${c.especie} nv${c.nivel} ${c.item})`) }; }, quer);
      t.ok(!veio.tem, `troca em ${z} feita`, veio.nova.join(', ') + ' | ' + fs.filter((x) => /entregou/.test(x)).join(''));
      await limparTextos(t); await t.falarCom(npc);
      t.ok(!(await textos(t, 3)).some((x) => /^Trocar/.test(x)), `${z}: não troca de novo`, (await textos(t, 1))[0]?.slice(0, 80));
    }
    await t.checkpoint('pos-r8-troca');
  }
  if (PARTES.includes('lago')) {
    await irPara(t, 'A-LG-posto', 7, 4, 'n'); await t.q(() => window.Q.curarNoPosto());
    await irPara(t, 'A-GB-2', 24, 8, 'l');
    const vis = (await t.npcs()).some((n) => n.id === 'cartel-lago');
    t.ok(vis, 'capanga do lago visível depois da Liga');
    await t.q(() => { const Q = window.Q; Q.capturar = () => true; Q.capturarRepetidas = true; Q.maxCapturas = 99; Q.cuiaPreferida = 'cuia-ouro'; });
    const nb = (await t.st()).nb;
    await limparTextos(t); await t.falarCom('cartel-lago').catch((e) => console.log('   lago', e.message.split('\n')[0]));
    await t.assentar().catch(() => 0);
    const bs = await t.relato(nb);
    const rara = await t.q(() => { const s = window.__pingo.jogo.save; return [...s.equipe, ...s.viveiro.flat().filter(Boolean)].filter((c) => c.rara).map((c) => `${c.especie} nv${c.nivel} ${c.item ?? ''}`); });
    t.ok(bs.length === 2 && bs[0].tipo === 'treinador', 'duelo com o capanga + Mandizinho na tela', bs.map((b) => b.tipo + ':' + b.resultado).join(' '));
    t.ok(rara.length >= 1, 'Mandizinho raro capturado', rara.join(','));
    t.ok(!(await t.npcs()).some((n) => n.id === 'cartel-lago' ), 'capanga some depois');
    console.log('   flags:', JSON.stringify(await flags(t, 'lago|rara:|batalha-perdida')));
    // estrela: equipe e Diário
    await tecla(t, 'menu', 1, 10);
    await t.q(async () => { for (let g = 0; g < 10; g++) { const ls = [...document.querySelectorAll('.tela-menu .lista-item')]; const i = ls.findIndex((l) => l.classList.contains('foco')); if (i === 1) break; await window.Q.toque(i < 1 ? 'baixo' : 'cima'); await window.Q.quadros(4); } await window.Q.toque('a'); await window.Q.quadros(10); });
    await t.foto('r8-equipe-rara');
    await tecla(t, 'b', 3, 10);
    await t.checkpoint('pos-r8-lago');
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r8-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
