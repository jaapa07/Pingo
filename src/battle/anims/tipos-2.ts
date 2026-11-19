/**
 * Animações de golpe por tipo — parte 2: Terra, Vento, Mente, Inseto, Pedra, Assombro, Lenda, Ferro e Encanto.
 * `<tipo>-1` projétil leve · `-2` rajada/feixe · `-3` explosão forte · `-4` aura/ambiente.
 */
import { type AnimGolpe, balanco, boca, chuva, clarear, emCada, esp, estilhacos, impulso, investida, juntos, noAlvo, orbita, piscar, pulo, somar, subir, tiro, trilha, varrer } from './nucleo';

export const TIPOS_2: Record<string, AnimGolpe> = {
  /* ------------------------------ Terra ------------------------------ */
  // torrões arremessados em arco
  'terra-1': async (k) => {
    await tiro(k, 'terra-torrao', { n: 3, intervalo: 0.1, dur: 0.3, arco: 22, espalha: 6, impacto: 'terra-poeira', som: 'g-pedrada' });
    await esp(k, 0.3);
  },
  // jorros de lama que espirram no alvo
  'terra-2': async (k) => {
    await tiro(k, 'terra-lama', { n: 2, intervalo: 0.18, dur: 0.26, arco: 8, espalha: 4, parado: true, quadro: 1 });
    await emCada(k, async (a) => { noAlvo(k, 'terra-lama', a, { dx: -6 }); await esp(k, 0.1); noAlvo(k, 'terra-lama', a, { dx: 7, dy: 4, espelho: true }); await balanco(k, a, 1, 0.24, 12); });
    await esp(k, 0.12);
  },
  // terremoto: o chão racha e a poeira sobe por todo o campo
  'terra-3': async (k) => {
    k.som('tremor');
    void k.c.tremor(5, 0.9);
    await emCada(k, async (a) => {
      noAlvo(k, 'terra-fenda', a, { base: true, atras: true, segura: true });
      for (const dx of [-30, 26, -8, 40]) { noAlvo(k, 'terra-poeira', a, { base: true, dx, dy: (dx % 5) - 2 }); await esp(k, 0.1); }
      void estilhacos(k, 'terra-torrao', a.pes, { n: 6, raio: 26, dur: 0.4, queda: -10 });
      await pulo(k, a, 4, 0.2); await pulo(k, a, 3, 0.16);
    });
    await esp(k, 0.1);
    k.c.limparSegurados();
  },
  // poeira levantando e torrões em roda (firmar o chão)
  'terra-4': async (k) => {
    const a = k.alvo;
    noAlvo(k, 'terra-poeira', a, { base: true, dx: -12 }); noAlvo(k, 'terra-poeira', a, { base: true, dx: 12, espelho: true });
    await orbita(k, 'terra-torrao', a, { n: 4, dur: 0.6, voltas: 1, dy: 8, sobe: 10 });
    noAlvo(k, 'fis-pisao', a, { base: true, atras: true });
    await esp(k, 0.3);
  },

  /* ------------------------------ Vento ------------------------------ */
  // lâmina de ar veloz
  'vento-1': async (k) => {
    k.som('vento');
    await tiro(k, 'vento-lamina', { dur: 0.2 });
    await emCada(k, (a) => { noAlvo(k, 'fis-corte', a); return clarear(k, a, 0.06); });
    await esp(k, 0.24);
  },
  // rajadas horizontais com penas
  'vento-2': async (k) => {
    k.som('g-sopro');
    await emCada(k, async (a) => {
      for (const dy of [-10, 4, -3]) { void varrer(k, 'vento-rajada', a, { dy, dur: 0.3, margem: 60 }); await esp(k, 0.12); }
      await juntos(balanco(k, a, 2, 0.3, 12), estilhacos(k, 'vento-pena', a.centro, { n: 4, raio: 24, dur: 0.34, queda: 8 }));
    });
  },
  // tufão que levanta o alvo
  'vento-3': async (k) => {
    k.som('vento');
    const desfaz = k.c.escurecer('#283c6c', 0.35);
    await emCada(k, async (a) => {
      const t = noAlvo(k, 'vento-tufao', a, { base: true, loop: true, dy: 4 });
      void orbita(k, 'vento-pena', a, { n: 4, dur: 0.8, voltas: 2.5, rx: a.larg + 12, sobe: 16 });
      await k.c.rel.entre(0.8, (u) => { a.dy = -Math.round(Math.sin(u * Math.PI) * 8); a.dx = Math.round(Math.sin(u * 22) * 2); });
      a.dx = a.dy = 0; t.remover();
    });
    void k.c.tremor(2, 0.2);
    await esp(k, 0.2);
    desfaz();
  },
  // penas atravessam o campo num vento a favor
  'vento-4': async (k) => {
    const a = k.alvo;
    for (let i = 0; i < 5; i++) { void varrer(k, i % 2 ? 'vento-pena' : 'vento-rajada', a, { dy: -22 + i * 9, dur: 0.44, margem: 80, atras: i % 2 === 0 }); await esp(k, 0.09); }
    await esp(k, 0.42);
  },

  /* ------------------------------ Mente ------------------------------ */
  // prismas em zigue-zague
  'mente-1': async (k) => {
    await tiro(k, 'mente-prisma', { n: 3, intervalo: 0.1, dur: 0.36, onda: 8, espalha: 4 });
    await emCada(k, (a) => noAlvo(k, 'mente-onda', a, { fps: 16 }).fim);
  },
  // ondas saem de quem ataca e reaparecem dentro do alvo
  'mente-2': async (k) => {
    noAlvo(k, 'mente-onda', k.eu, { atras: true });
    await esp(k, 0.26);
    await emCada(k, async (a) => { noAlvo(k, 'mente-onda', a); await balanco(k, a, 2, 0.3, 16); noAlvo(k, 'mente-onda', a, { quadro: 2 }); await balanco(k, a, 3, 0.24, 20); });
    await esp(k, 0.1);
  },
  // o olho se abre no escuro e a mente do alvo rodopia
  'mente-3': async (k) => {
    const desfaz = k.c.escurecer('#5a1436', 0.6);
    await emCada(k, async (a) => {
      const olho = k.c.fx('mente-olho', a.x, a.y - a.alt - 12, { segura: true, fps: 12 });
      await esp(k, 0.36);
      const e = noAlvo(k, 'mente-espiral', a, { loop: true });
      await balanco(k, a, 3, 0.4, 18);
      e.remover(); olho.remover();
    });
    void k.c.flash('#f8a8cc', 0.18);
    await emCada(k, (a) => estilhacos(k, 'mente-prisma', a.centro, { n: 6, raio: 26, dur: 0.3 }));
    desfaz();
  },
  // concentração: espiral e prismas girando
  'mente-4': async (k) => {
    const a = k.alvo;
    const e = k.c.fx('mente-espiral', a.x, a.y - a.alt - 6, { loop: true });
    await orbita(k, 'mente-prisma', a, { n: 4, dur: 0.8, voltas: 1.5, fecha: true });
    e.remover(); noAlvo(k, 'st-brilho', a, { dy: -6 });
    await esp(k, 0.2);
  },

  /* ------------------------------ Inseto ------------------------------ */
  // ferroadas rápidas
  'inseto-1': async (k) => {
    for (let i = 0; i < 3; i++) { await tiro(k, 'inseto-ferrao', { dur: 0.12, espalha: 7, impacto: 'comum-impacto', som: 'golpe-fraco' }); await esp(k, 0.07); }
    await esp(k, 0.2);
  },
  // enxame voa até o alvo e fica zunindo em volta
  'inseto-2': async (k) => {
    const de = boca(k), f = k.c.fx('inseto-enxame', de[0], de[1], { loop: true, espelho: k.d === -1 });
    await k.c.mover(f, ...k.alvo.centro, 0.34, 8);
    const [cx, cy] = k.alvo.centro;
    await juntos(k.c.rel.entre(0.5, (t) => { f.x = cx + Math.round(Math.sin(t * 12) * 8); f.y = cy + Math.round(Math.cos(t * 9) * 5); }), balanco(k, k.alvo, 1, 0.5, 16));
    f.remover();
  },
  // teia prende o alvo; o enxame e os ferrões vêm de três lados
  'inseto-3': async (k) => {
    k.som('g-teia');
    await emCada(k, async (a) => {
      const teia = noAlvo(k, 'inseto-teia', a, { segura: true, fps: 14 });
      await esp(k, 0.3);
      const [cx, cy] = a.centro;
      for (const [dx, dy] of [[-40, -20], [40, -10], [0, -44]] as const) { void k.c.voar('inseto-ferrao', [cx + dx, cy + dy], [cx, cy], 0.14, { espelho: dx > 0 }).then(() => { k.c.fx('comum-impacto', cx + dx / 6, cy + dy / 6); }); await esp(k, 0.1); }
      const z = noAlvo(k, 'inseto-enxame', a, { loop: true });
      await juntos(balanco(k, a, 2, 0.34, 18), k.c.tremor(2, 0.3));
      z.remover(); teia.remover();
    });
  },
  // pó de escamas cintilando sobre o alvo
  'inseto-4': async (k) => {
    const a = k.alvo;
    for (const dx of [-10, 8, 0]) { k.c.fx('inseto-po', a.x + dx, a.y - a.alt - 2 + (dx % 4), { fps: 8 }); await esp(k, 0.14); }
    await subir(k, 'st-brilho', a, { n: 4, dur: 0.3, desce: true, intervalo: 0.07 });
    await esp(k, 0.1);
  },

  /* ------------------------------ Pedra ------------------------------ */
  // pedrada em arco
  'pedra-1': async (k) => {
    await tiro(k, 'pedra-rocha', { dur: 0.34, arco: 26, som: 'g-pedrada' });
    await emCada(k, (a) => { noAlvo(k, 'comum-impacto', a); return estilhacos(k, 'pedra-lasca', a.centro, { n: 5, raio: 20, dur: 0.3, queda: 8 }); });
    await esp(k, 0.1);
  },
  // pedras despencam do alto
  'pedra-2': async (k) => {
    await emCada(k, (a) => chuva(k, 'pedra-rocha', a, { n: 4, dur: 0.24, intervalo: 0.13, impacto: 'pedra-quebra', larg: 16, som: 'g-pedrada' }));
    await k.c.tremor(2, 0.26);
  },
  // um bloco enorme desaba e se parte
  'pedra-3': async (k) => {
    await emCada(k, async (a) => {
      const b = k.c.fx('pedra-bloco', a.x, a.y - a.alt - 80, { parado: true });
      const s = noAlvo(k, 'fis-pisao', a, { base: true, atras: true, parado: true });
      await juntos(k.c.mover(b, a.x, a.y - Math.round(a.alt * 0.6), 0.3), k.c.rel.entre(0.3, (t) => { b.quadro = Math.floor(t * 4) % 2; }));
      s.remover(); k.som('quebrar'); void k.c.tremor(5, 0.44); void k.c.flash('#e8dcc0', 0.12, 0.5);
      b.quadro = 2; await esp(k, 0.07); b.quadro = 3; await esp(k, 0.07); b.remover();
      noAlvo(k, 'pedra-quebra', a); noAlvo(k, 'terra-poeira', a, { base: true, dx: -14 }); noAlvo(k, 'terra-poeira', a, { base: true, dx: 14, espelho: true });
      await estilhacos(k, 'pedra-lasca', a.centro, { n: 8, raio: 32, dur: 0.36, queda: 10 });
    });
    await esp(k, 0.1);
  },

  /* ------------------------------ Assombro ------------------------------ */
  // bola sombria que flutua em onda
  'assombro-1': async (k) => {
    await tiro(k, 'assombro-bola', { dur: 0.46, onda: 7, rastro: 'assombro-chama' });
    await emCada(k, (a) => { void piscar(k, a, 2, 0.05); return noAlvo(k, 'assombro-veu', a, { fps: 14 }).fim; });
  },
  // garra espectral surge por trás do alvo
  'assombro-2': async (k) => {
    const desfaz = k.c.escurecer('#171030', 0.5);
    await esp(k, 0.16);
    await emCada(k, async (a) => { noAlvo(k, 'assombro-garra', a, { espelho: k.d === 1, dx: k.d * 6 }); await esp(k, 0.12); k.som('g-arranhao'); a.escuro = true; await balanco(k, a, 2, 0.26, 16); a.escuro = false; });
    await esp(k, 0.14);
    desfaz();
  },
  // fogos-fátuos cercam o alvo no escuro e se fecham sobre ele
  'assombro-3': async (k) => {
    const desfaz = k.c.escurecer('#0b0818', 0.72);
    await emCada(k, async (a) => {
      await orbita(k, 'assombro-chama', a, { n: 5, dur: 0.66, voltas: 1.5, rx: a.larg + 22, ry: 14, fecha: true });
      noAlvo(k, 'assombro-veu', a, { fps: 12 }); void k.c.flash('#9a8ad0', 0.18);
      a.escuro = true; await juntos(k.c.tremor(3, 0.32), estilhacos(k, 'assombro-bola', a.centro, { n: 5, raio: 26, dur: 0.3 })); a.escuro = false;
    });
    desfaz();
  },
  // véu que sobe do chão com chamas pálidas (maldição)
  'assombro-4': async (k) => {
    const a = k.alvo, desfaz = k.c.escurecer('#2e2452', 0.4);
    noAlvo(k, 'assombro-veu', a, { base: true, dy: 6, atras: true });
    void piscar(k, a, 3, 0.07);
    await orbita(k, 'assombro-chama', a, { n: 3, dur: 0.7, voltas: 1, sobe: 14 });
    desfaz();
  },

  /* ------------------------------ Lenda ------------------------------ */
  // leque de escamas brilhantes
  'lenda-1': async (k) => {
    await tiro(k, 'lenda-escama', { n: 5, intervalo: 0.05, dur: 0.28, abre: 10, espalha: 6, impacto: 'st-brilho' });
    await emCada(k, (a) => noAlvo(k, 'comum-impacto', a).fim);
  },
  // feixe contínuo com runa acesa debaixo do alvo
  'lenda-2': async (k) => {
    await emCada(k, (a) => { noAlvo(k, 'lenda-runa', a, { base: true, atras: true, dy: 4 }); });
    const fs = await trilha(k, 'lenda-feixe', { n: 7, intervalo: 0.03, loop: true });
    void k.c.flash('#8aa0f0', 0.1, 0.4);
    await emCada(k, (a) => juntos(clarear(k, a, 0.1), balanco(k, a, 2, 0.36, 22)));
    for (const f of fs) f.remover();
    await esp(k, 0.14);
  },
  // cometas riscam o céu e caem em sequência
  'lenda-3': async (k) => {
    const desfaz = k.c.escurecer('#0e1850', 0.6);
    await emCada(k, async (a) => {
      noAlvo(k, 'lenda-aura', a, { base: true, atras: true, dy: 4 });
      await chuva(k, 'lenda-cometa', a, { n: 3, dur: 0.24, altura: 90, vies: -70, intervalo: 0.16, impacto: 'brasa-explosao', larg: 10, espelho: false, viraY: false });
    });
    void k.c.flash('#e0e8ff', 0.2);
    await juntos(k.c.tremor(4, 0.34), emCada(k, (a) => estilhacos(k, 'lenda-escama', a.centro, { n: 7, raio: 30, dur: 0.32 })));
    desfaz();
  },
  // aura ancestral, runa no chão e escamas subindo
  'lenda-4': async (k) => {
    const a = k.alvo;
    noAlvo(k, 'lenda-runa', a, { base: true, atras: true, dy: 4, fps: 6 });
    noAlvo(k, 'lenda-aura', a, { base: true, atras: true, dy: 4, fps: 9 });
    await subir(k, 'lenda-escama', a, { n: 6, dur: 0.44, intervalo: 0.07 });
    await clarear(k, a, 0.08);
  },

  /* ------------------------------ Ferro ------------------------------ */
  // engrenagem girando que solta fagulhas
  'ferro-1': async (k) => {
    await tiro(k, 'ferro-engrenagem', { dur: 0.3, arco: 6, fps: 20 });
    await emCada(k, (a) => { k.som('golpe-normal'); noAlvo(k, 'ferro-fagulha', a); noAlvo(k, 'ferro-fagulha', a, { dx: 6, dy: -6, espelho: true }); });
    await esp(k, 0.34);
  },
  // dois cortes de lâmina cruzados
  'ferro-2': async (k) => {
    await investida(k, 10, 0.06, 0.1, () => { k.som('g-corte'); void emCada(k, (a) => { noAlvo(k, 'ferro-lamina', a); }); });
    await investida(k, 10, 0.06, 0.12, () => { k.som('g-corte'); void emCada(k, (a) => { noAlvo(k, 'ferro-lamina', a, { espelho: true }); noAlvo(k, 'ferro-fagulha', a, { atras: true }); }); });
    await esp(k, 0.24);
  },
  // a bigorna cai
  'ferro-3': async (k) => {
    await emCada(k, async (a) => {
      const b = k.c.fx('ferro-bigorna', a.x, a.y - a.alt - 90, { parado: true });
      await juntos(k.c.mover(b, a.x, a.y - Math.round(a.alt * 0.7), 0.26), k.c.rel.entre(0.26, (t) => { b.quadro = Math.floor(t * 4) % 2; }));
      b.quadro = 2; k.som('golpe-forte'); void k.c.tremor(5, 0.4);
      a.dy = 3; void estilhacos(k, 'ferro-fagulha', a.centro, { n: 6, raio: 28, dur: 0.3 });
      await esp(k, 0.2); a.dy = 0; b.quadro = 3;
      await k.c.mover(b, a.x + k.d * 10, a.y - a.alt - 10, 0.14, 6); b.remover();
    });
    await esp(k, 0.2);
  },
  // couraça: escudo de ferro e engrenagens em volta
  'ferro-4': async (k) => {
    const a = k.alvo;
    k.som('protecao');
    noAlvo(k, 'ferro-escudo', a, { dx: k.eu === a ? k.d * 8 : 0 });
    await orbita(k, 'ferro-engrenagem', a, { n: 2, dur: 0.6, voltas: 1 });
    noAlvo(k, 'ferro-fagulha', a, { dy: -8 }); await clarear(k, a, 0.08);
    await esp(k, 0.14);
  },

  /* ------------------------------ Encanto ------------------------------ */
  // estrelinhas em arco
  'encanto-1': async (k) => {
    await tiro(k, 'encanto-estrela', { n: 4, intervalo: 0.09, dur: 0.32, arco: 20, espalha: 7, impacto: 'st-brilho' });
    await esp(k, 0.2);
  },
  // arco-íris de brilho passa pelo alvo e deixa pétalas
  'encanto-2': async (k) => {
    await emCada(k, async (a) => {
      await varrer(k, 'encanto-arco', a, { dur: 0.4, margem: 44, dy: -4 });
      noAlvo(k, 'encanto-arco', a, { dy: -6 });
      await juntos(clarear(k, a, 0.08), estilhacos(k, 'encanto-petala', a.centro, { n: 6, raio: 24, dur: 0.4, queda: 10 }));
    });
  },
  // a lua aparece e uma chuva de estrelas cai
  'encanto-3': async (k) => {
    const desfaz = k.c.escurecer('#5c1c40', 0.55);
    const lua = k.c.fx('encanto-lua', k.alvo.x - k.d * 30, 22, { loop: true, atras: true });
    await esp(k, 0.16);
    await emCada(k, (a) => chuva(k, 'encanto-estrela', a, { n: 6, dur: 0.22, altura: 80, vies: -k.d * 30, intervalo: 0.05, impacto: 'st-brilho', larg: 16 }));
    void k.c.flash('#fcc0e0', 0.18);
    await juntos(k.c.tremor(2, 0.24), emCada(k, (a) => noAlvo(k, 'comum-anel', a).fim));
    lua.remover(); desfaz();
  },
  // corações subindo e pétalas em roda (charme)
  'encanto-4': async (k) => {
    const a = k.alvo;
    void orbita(k, 'encanto-petala', a, { n: 5, dur: 0.8, voltas: 1.2, ry: 9 });
    await subir(k, 'encanto-coracao', a, { n: 4, dur: 0.44, intervalo: 0.12, larg: 10 });
    await esp(k, 0.1);
  },
};
