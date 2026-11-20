// Fluxos das decisões finais no navegador (mapa B ligado só no Vite 5211): rival 7 cura antes, maca entre Zinabre e Lata,
// peão do ginásio 14, revanches 9–16 só com 16 insígnias (recepção do Ginásio de Treino e salão), prêmio ×1,5 na tela,
// Agenda do rádio sem a tartaruga sem Mergulho. Batalhas no modo sem tela (piloto padrão do motor), falas passadas com A.
// Uso: run.sh fluxos.mjs <seg>
import { abrir, lerSave } from './lib.mjs';
let falhas = 0;
const ok = (c, r, x = '') => { console.log(`${c ? 'ok  ' : 'ERRO'} ${r} ${x}`); if (!c) falhas++; };

async function cenario(save, prep, fn, arg) {
  const t = await abrir(lerSave(save));
  try {
    await t.q(async () => {
      const Q = window.Q; Q.textos = []; Q.inicios = [];
      const DLG = await import('/src/ui/dialogo.ts'); const def = DLG.CaixaTexto.prototype.definir;
      DLG.CaixaTexto.prototype.definir = function (str, ...r) { Q.textos.push(String(str)); return def.call(this, str, ...r); };
      const B = await import('/src/battle/index.ts'); B.definirHeadless(true);
      const { bus } = await import('/src/core/events.ts');
      bus.on('batalha-inicio', ({ pedido }) => { const eq = window.__pingo.jogo.save.equipe.filter((c) => !c.ovo); Q.inicios.push({ id: pedido.treinador?.id, cheia: eq.every((c) => c.vida === B.atributos(c).vida), vidas: eq.map((c) => c.vida).join('/') }); });
      bus.on('batalha-fim', () => { Q.fimDinheiro = window.__pingo.jogo.save.jogador.dinheiro; });
      /** roda passos e aperta A nas falas (e na 1ª opção das perguntas) até terminar */
      Q.rodarAte = async (passos) => {
        let fim = false; const p = window.__pingo.mundo.rodarPassos(passos).then(() => { fim = true; }, (e) => { fim = true; Q.erroEv = String(e); });
        for (let k = 0; k < 4000 && !fim; k++) { if (/dialogo/.test(window.__pingo.telas.topo?.el.className ?? '')) await Q.toque('a'); await Q.quadros(3); }
        await p; await Q.assentar?.();
      };
    });
    if (prep) await t.q(prep, arg);
    await fn(t);
  } finally { await t.fim(); }
}
const textos = (t) => t.q(() => window.Q.textos.join(' ⏎ '));

// 1. rival 7: chega com a equipe gasta e a Tainá cura antes da luta
await cenario('b-vv', async () => {
  const s = window.__pingo.jogo.save; for (const c of s.equipe) c.vida = 1;
  await window.__pingo.mundo.irPara('B7', 24, 37, 'n', 'nenhuma');
}, async (t) => {
  await t.q(() => window.Q.rodarAte([['chamar', 'b2-rival-7']]));
  const r = await t.q(() => ({ i: window.Q.inicios, f: window.__pingo.jogo.save.flags['rival-7'] }));
  ok(r.i.length === 1 && r.i[0].cheia, 'rival 7: equipe curada antes da luta', JSON.stringify(r.i));
  ok(/chimarrão/.test(await textos(t)), 'rival 7: fala do chimarrão');
  ok(!!r.f, 'rival 7: flag rival-7');
});

// 2. laboratório: maca entre a Zinabre e o Lata
await cenario('passo-12', async () => {
  // equipe forte (o piloto do modo sem tela é simples): a 1ª luta a desgasta, a maca tem de curar antes da 2ª
  const s = window.__pingo.jogo.save, B = await import('/src/battle/index.ts'); for (const c of s.equipe) { B.ganharExp(c, 3000000); c.vida = B.atributos(c).vida; }
  await window.__pingo.mundo.irPara('B6-lab-3', 3, 3, 's', 'nenhuma');
}, async (t) => {
  await t.q(() => window.Q.rodarAte([['chamar', 'b2-lab-final']]));
  const r = await t.q(() => ({ i: window.Q.inicios, f: window.__pingo.jogo.save.flags }));
  ok(r.i.length >= 2 && r.i[0].id === 'B6-lab-zinabre' && r.i[1].id === 'B6-lab-lata', 'lab: Zinabre e depois Lata', JSON.stringify(r.i.map((x) => x.id)));
  ok(r.i[1]?.cheia, 'lab: equipe cheia ao começar a luta com o Lata', r.i[1]?.vidas);
  ok(/maca/.test(await textos(t)), 'lab: fala da maca');
});

// 3. peão do ginásio 14 leva à porta
await cenario('passo-14', async () => { await window.__pingo.mundo.irPara('B7-ginasio', 12, 4, 'l', 'nenhuma'); }, async (t) => {
  await t.q(() => window.Q.rodarAte([['chamar', 'ginasio-14-peao']]));
  const st = await t.q(() => { const s = window.__pingo.jogo.save.jogador; return [s.zona, s.x, s.y]; });
  ok(st[0] === 'B7-ginasio' && st[1] === 8 && st[2] === 16, 'peão: levou à porta do ginásio 14', JSON.stringify(st));
  const npc = await t.q(() => window.__pingo.mundo.npcs.some((n) => n.id === 'g14-peao'));
  ok(npc, 'peão está no ginásio');
});

// 4. revanches: com 14 insígnias a recepção só fala dos líderes 1–8; com 16, os 9–16 entram
for (const [n, quer] of [[14, false], [16, true]]) {
  await cenario('passo-14', async (n) => {
    const s = window.__pingo.jogo.save; s.insignias = Array.from({ length: n }, (_, i) => i + 1);
    await window.__pingo.mundo.irPara('A4-treino', 9, 14, 'n', 'nenhuma');
  }, async (t) => {
    await t.q((n) => { window.Q.regrasEscolha = [[/semana inteira/, 0]]; }, n);
    await t.q(() => window.Q.rodarAte([['agendaTreino']]));
    const tx = await textos(t);
    const nomes = ['Topázio', 'Labareda', 'Gingado', 'Peçonha', 'Pinhão', 'Jaci', 'Trovão'];
    ok(nomes.some((x) => tx.includes(x)) === quer, `recepção com ${n} insígnias ${quer ? 'lista' : 'não lista'} os líderes 9–16`);
    // revPreparar do líder 10 com o treino marcado hoje
    await t.q(async () => { const R = await import('/src/data/revancha.ts'); const s = window.__pingo.jogo.save; s.flags['treino:lider-10'] = R.diaCorrido(s.relogio.deslocamentoMin); window.Q.textos.length = 0; });
    await t.q(() => window.Q.rodarAte([['revPreparar', 'lider-10']]));
    const ro = await t.q(() => !!window.__pingo.jogo.save.flags['rev-ok']);
    ok(ro === quer, `revanche do líder 10 com ${n} insígnias: ${quer ? 'libera' : 'recusa'}`, (await textos(t)).slice(0, 120));
  }, n);
}

// 5. prêmio ×1,5 numa luta de rota do mapa B (B-R5-1 em B-R5) e agenda sem/com Mergulho
await cenario('passo-14', async () => { const s = window.__pingo.jogo.save, B = await import('/src/battle/index.ts'); for (const c of s.equipe) { B.ganharExp(c, 3000000); c.vida = B.atributos(c).vida; } await window.__pingo.mundo.irPara('B-R5', 10, 10, 's', 'nenhuma'); delete s.flags['venceu:B-R5-1']; }, async (t) => {
  const r = await t.q(async () => {
    const s = window.__pingo.jogo.save, d0 = s.jogador.dinheiro; const D = await import('/src/world/deps.ts'); const tr = D.treinador('B-R5-1');
    await window.Q.rodarAte([['batalha', 'B-R5-1']]);
    return { d0, d1: s.jogador.dinheiro, premio: tr.premio, venceu: !!s.flags['venceu:B-R5-1'] };
  });
  ok(r.venceu && r.d1 - r.d0 === Math.round(r.premio * 1.5), 'prêmio ×1,5 em B-R5', JSON.stringify(r));
  const ag = await t.q(async () => { const R = await import('/src/data/radio.ts'); const s = window.__pingo.jogo.save; const a = (m) => R.agendaDoDia({ dia: 5, periodo: 'dia', liga: true, contatos: [], enxame: null, cartao: false, mergulho: m }).texto; return [/TARTARUGA/.test(a(false)), /TARTARUGA/.test(a(true)), s.amuletos.includes('mergulho')]; });
  ok(!ag[0] && ag[1] && ag[2], 'agenda: tartaruga só com Mergulho', JSON.stringify(ag));
});
console.log(falhas ? `${falhas} falha(s)` : 'TODOS OK');
