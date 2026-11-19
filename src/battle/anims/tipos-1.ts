/**
 * Animações de golpe por tipo — parte 1: Comum, Mata, Brasa, Rio, Trovão, Geada, Ginga e Veneno.
 * `<tipo>-1` projétil leve · `-2` rajada/feixe · `-3` explosão forte · `-4` aura/ambiente.
 */
import { type AnimGolpe, boca, chuva, clarear, emCada, esp, estilhacos, impulso, investida, juntos, noAlvo, orbita, pulo, balanco, somar, subir, tiro, trilha, varrer } from './nucleo';

export const TIPOS_1: Record<string, AnimGolpe> = {
  /* ------------------------------ Comum ------------------------------ */
  // três estrelas em arco curto
  'comum-1': async (k) => {
    await tiro(k, 'comum-estrela', { n: 3, intervalo: 0.1, dur: 0.26, arco: 14, espalha: 6, impacto: 'comum-impacto', som: 'golpe-fraco' });
    await esp(k, 0.2);
  },
  // linhas de velocidade e um anel que se abre no alvo
  'comum-2': async (k) => {
    void k.c.uma('comum-linhas', ...k.eu.centro, { atras: true });
    await investida(k, 8, 0.06, 0.1);
    await emCada(k, async (a) => { noAlvo(k, 'comum-anel', a); await esp(k, 0.1); noAlvo(k, 'comum-impacto', a, { dx: -6, dy: -4 }); await esp(k, 0.1); noAlvo(k, 'comum-impacto', a, { dx: 7, dy: 5 }); });
    await esp(k, 0.3);
  },
  // carga com anel, clarão e três estouros grandes
  'comum-3': async (k) => {
    noAlvo(k, 'comum-anel', k.eu, { atras: true }); k.som('carga');
    await impulso(k, 6, 0.26);
    void k.c.flash('#fff8e7', 0.16);
    await emCada(k, async (a) => {
      for (const [dx, dy] of [[-8, -6], [8, 2], [0, -2]] as const) { noAlvo(k, 'comum-impacto', a, { dx, dy }); noAlvo(k, 'fis-impacto', a, { dx: -dx, dy: -dy, atras: true }); await esp(k, 0.09); }
      void estilhacos(k, 'comum-estrela', a.centro, { n: 6, raio: 26, dur: 0.32 });
    });
    await k.c.tremor(3, 0.3);
  },

  /* ------------------------------ Mata ------------------------------ */
  // folhas rodopiando em arco
  'mata-1': async (k) => {
    await tiro(k, 'mata-folha', { n: 5, intervalo: 0.07, dur: 0.34, arco: 18, espalha: 8, abre: 5, impacto: 'mata-lamina' });
    await esp(k, 0.2);
  },
  // três lâminas de folha em linha reta, com folhas soltas no impacto
  'mata-2': async (k) => {
    await tiro(k, 'mata-lamina', { n: 3, intervalo: 0.12, dur: 0.18, espalha: 4, impacto: 'fis-corte', som: 'g-corte' });
    await emCada(k, (a) => estilhacos(k, 'mata-folha', a.centro, { n: 5, raio: 20, dur: 0.3, queda: 6 }));
  },
  // raízes rompem o chão debaixo do alvo
  'mata-3': async (k) => {
    k.som('tremor');
    void k.c.tremor(2, 0.5);
    await emCada(k, async (a) => {
      for (const dx of [-14, 12, 0]) { noAlvo(k, 'mata-raiz', a, { base: true, dx, segura: true, atras: dx !== 0 }); await esp(k, 0.1); }
      await juntos(pulo(k, a, 5, 0.22), estilhacos(k, 'mata-folha', a.centro, { n: 7, raio: 28, dur: 0.36, queda: 8 }));
    });
    await esp(k, 0.24);
    k.c.limparSegurados();
  },
  // brotos nascem em volta e folhas sobem
  'mata-4': async (k) => {
    const a = k.alvo;
    for (const dx of [-16, 14, -4, 6]) { noAlvo(k, 'mata-broto', a, { base: true, dx, dy: dx % 3 }); await esp(k, 0.08); }
    await juntos(subir(k, 'mata-folha', a, { n: 5, dur: 0.5 }), orbita(k, 'mata-semente', a, { n: 3, dur: 0.6, voltas: 1 }));
  },

  /* ------------------------------ Brasa ------------------------------ */
  // bola de fogo com rastro de fagulhas
  'brasa-1': async (k) => {
    await tiro(k, 'brasa-bola', { dur: 0.32, rastro: 'brasa-fagulha' });
    await emCada(k, async (a) => { noAlvo(k, 'brasa-chama', a, { base: true, dy: -4 }); await estilhacos(k, 'brasa-fagulha', a.centro, { n: 5, raio: 16, dur: 0.24 }); });
    await esp(k, 0.12);
  },
  // lança-chamas: chamas carimbadas ao longo da linha até o alvo
  'brasa-2': async (k) => {
    await trilha(k, 'brasa-chama', { n: 7, intervalo: 0.05, fps: 14 });
    await emCada(k, async (a) => { for (const dx of [-8, 6, -1]) { noAlvo(k, 'brasa-chama', a, { base: true, dx }); await esp(k, 0.08); } });
    await esp(k, 0.3);
  },
  // labareda debaixo do alvo, explosão e clarão laranja
  'brasa-3': async (k) => {
    const desfaz = k.c.escurecer('#5a1020', 0.4);
    await emCada(k, async (a) => { noAlvo(k, 'brasa-labareda', a, { base: true, atras: true }); await esp(k, 0.22); noAlvo(k, 'brasa-labareda', a, { base: true, dx: 8, fps: 16 }); });
    await esp(k, 0.12);
    k.som('g-explosao'); void k.c.flash('#f58a4b', 0.2);
    await juntos(emCada(k, (a) => { noAlvo(k, 'brasa-explosao', a); return estilhacos(k, 'brasa-fagulha', a.centro, { n: 8, raio: 30, dur: 0.34 }); }), k.c.tremor(4, 0.36));
    desfaz();
  },
  // chamas rodeiam e fagulhas sobem (aura de calor)
  'brasa-4': async (k) => {
    const a = k.alvo, desfaz = k.c.escurecer('#a32638', 0.25);
    await juntos(orbita(k, 'brasa-chama', a, { n: 4, dur: 0.75, voltas: 1.25, dy: 6 }), subir(k, 'brasa-fagulha', a, { n: 8, dur: 0.4, intervalo: 0.07 }));
    desfaz();
  },

  /* ------------------------------ Rio ------------------------------ */
  // rajada de gotas
  'rio-1': async (k) => {
    await tiro(k, 'rio-gota', { n: 4, intervalo: 0.08, dur: 0.24, espalha: 6, abre: 3, impacto: 'rio-bolha' });
    await emCada(k, (a) => noAlvo(k, 'rio-respingo', a, { base: true }).fim);
  },
  // jato contínuo: os segmentos ficam ondulando até o respingo
  'rio-2': async (k) => {
    const fs = await trilha(k, 'rio-jato', { n: 6, intervalo: 0.04, loop: true });
    await emCada(k, async (a) => { noAlvo(k, 'rio-respingo', a, { dy: 4 }); await balanco(k, a, 2, 0.34); });
    for (const f of fs) { f.remover(); await esp(k, 0.03); }
    await esp(k, 0.1);
  },
  // onda grande que atravessa o alvo
  'rio-3': async (k) => {
    k.som('onda-praia');
    const desfaz = k.c.escurecer('#12304e', 0.35);
    await juntos(
      emCada(k, (a) => varrer(k, 'rio-onda', a, { base: true, dur: 0.6, margem: 90, dy: 6, fps: 10 })),
      (async () => { await esp(k, 0.26); void k.c.tremor(3, 0.3); await emCada(k, (a) => { noAlvo(k, 'rio-respingo', a, { base: true, dx: -8 }); noAlvo(k, 'rio-respingo', a, { base: true, dx: 10, espelho: true }); return pulo(k, a, 6, 0.26); }); })(),
    );
    await emCada(k, (a) => subir(k, 'rio-bolha', a, { n: 4, dur: 0.24, intervalo: 0.03 }));
    desfaz();
  },
  // bolhas subindo num véu azulado
  'rio-4': async (k) => {
    const a = k.alvo, desfaz = k.c.escurecer('#1f4f7a', 0.3);
    void subir(k, 'rio-gota', a, { n: 4, dur: 0.4, desce: true, intervalo: 0.12, viraY: false });
    await subir(k, 'rio-bolha', a, { n: 9, dur: 0.5, intervalo: 0.06, larg: a.larg + 10 });
    desfaz();
  },

  /* ------------------------------ Trovão ------------------------------ */
  // esfera elétrica que estala ao chegar
  'trovao-1': async (k) => {
    await tiro(k, 'trovao-esfera', { dur: 0.3, onda: 4 });
    await emCada(k, async (a) => { noAlvo(k, 'trovao-faisca', a, { dx: -6 }); noAlvo(k, 'trovao-faisca', a, { dx: 7, dy: -5 }); await clarear(k, a, 0.06); await esp(k, 0.08); noAlvo(k, 'trovao-faisca', a, { dy: 6 }); });
    await esp(k, 0.2);
  },
  // teia de descargas ao longo do caminho
  'trovao-2': async (k) => {
    const fs = await trilha(k, 'trovao-rede', { n: 5, intervalo: 0.04, loop: true });
    void k.c.flash('#fff07a', 0.1, 0.5);
    await emCada(k, async (a) => { noAlvo(k, 'st-paralisia', a); await balanco(k, a, 1, 0.3, 30); });
    for (const f of fs) f.remover();
    await esp(k, 0.12);
  },
  // o céu escurece e o raio cai
  'trovao-3': async (k) => {
    const desfaz = k.c.escurecer('#171030', 0.6);
    await esp(k, 0.22);
    k.som('trovao');
    await emCada(k, async (a) => {
      noAlvo(k, 'trovao-raio', a, { base: true, dy: 2 }); void k.c.flash('#fffbe0', 0.14);
      await clarear(k, a, 0.1);
      noAlvo(k, 'trovao-raio', a, { base: true, dx: 6, espelho: true, quadro: 1 });
      void estilhacos(k, 'trovao-faisca', a.centro, { n: 6, raio: 24, dur: 0.28 });
    });
    await k.c.tremor(4, 0.4);
    desfaz();
  },
  // campo carregado: faíscas em órbita e estalos amarelos
  'trovao-4': async (k) => {
    const a = k.alvo;
    void orbita(k, 'trovao-faisca', a, { n: 5, dur: 0.8, voltas: 2, ry: 10 });
    for (let i = 0; i < 3; i++) { noAlvo(k, 'trovao-rede', a, { dy: -a.alt / 2 + i * 10, atras: i % 2 === 0 }); void k.c.flash('#fff07a', 0.08, 0.35); await esp(k, 0.24); }
    await esp(k, 0.1);
  },

  /* ------------------------------ Geada ------------------------------ */
  // lanças de gelo
  'geada-1': async (k) => {
    await tiro(k, 'geada-lanca', { n: 3, intervalo: 0.11, dur: 0.2, espalha: 5, impacto: 'geada-estilhaco', som: 'golpe-fraco' });
    await esp(k, 0.3);
  },
  // sopro gelado com flocos
  'geada-2': async (k) => {
    k.som('g-sopro');
    void tiro(k, 'geada-floco', { n: 6, intervalo: 0.06, dur: 0.4, espalha: 10, abre: 4, onda: 5 });
    await trilha(k, 'geada-sopro', { n: 6, intervalo: 0.06 });
    await emCada(k, (a) => balanco(k, a, 1, 0.3, 24));
  },
  // cristais brotam e estilhaçam
  'geada-3': async (k) => {
    const desfaz = k.c.escurecer('#164a5c', 0.4);
    await emCada(k, async (a) => {
      for (const dx of [-12, 10, 0]) { noAlvo(k, 'geada-cristal', a, { base: true, dx, segura: true }); await esp(k, 0.1); }
      await esp(k, 0.16);
    });
    k.c.limparSegurados(); void k.c.flash('#ffffff', 0.16);
    await juntos(emCada(k, (a) => { noAlvo(k, 'geada-estilhaco', a); return estilhacos(k, 'geada-floco', a.centro, { n: 8, raio: 30, dur: 0.36 }); }), k.c.tremor(3, 0.3));
    desfaz();
  },
  // flocos caindo devagar sobre o campo
  'geada-4': async (k) => {
    const a = k.alvo, desfaz = k.c.escurecer('#2a7f96', 0.25);
    await chuva(k, 'geada-floco', a, { n: 10, dur: 0.5, larg: 34, altura: 60, intervalo: 0.05, vies: 10 * k.d });
    noAlvo(k, 'st-brilho', a, { dy: -8 });
    await esp(k, 0.2);
    desfaz();
  },

  /* ------------------------------ Ginga ------------------------------ */
  // soco direto
  'ginga-1': async (k) => {
    await investida(k, 12, 0.07, 0.14, () => { k.som('g-pancada'); void emCada(k, (a) => { noAlvo(k, 'ginga-soco', a); }); });
    await esp(k, 0.24);
  },
  // meia-lua: giro no lugar e chute no alvo
  'ginga-2': async (k) => {
    k.som('g-giro');
    noAlvo(k, 'ginga-giro', k.eu, { dy: 4 });
    await balanco(k, k.eu, 3, 0.3, 8);
    await investida(k, 10, 0.06, 0.14, () => { void emCada(k, (a) => { noAlvo(k, 'ginga-chute', a, { espelho: k.d === -1 }); noAlvo(k, 'comum-impacto', a, { atras: true }); }); });
    await esp(k, 0.2);
  },
  // rasteira, chute e soco final com tremor
  'ginga-3': async (k) => {
    await investida(k, 9, 0.06, 0.1, () => { void emCada(k, (a) => { noAlvo(k, 'ginga-rasteira', a, { base: true, espelho: k.d === -1 }); }); });
    await investida(k, 11, 0.06, 0.1, () => { k.som('g-pancada'); void emCada(k, (a) => { noAlvo(k, 'ginga-chute', a, { dy: -4, espelho: k.d === -1 }); return pulo(k, a, 4, 0.16); }); });
    await impulso(k, 4, 0.12);
    await investida(k, 14, 0.05, 0.16, () => { k.som('golpe-forte'); void k.c.tremor(3, 0.26); void emCada(k, (a) => { noAlvo(k, 'ginga-soco', a); noAlvo(k, 'fis-impacto', a, { atras: true }); }); });
    await esp(k, 0.16);
  },
  // ginga no lugar: balanço de capoeira com giros e brilho
  'ginga-4': async (k) => {
    const a = k.alvo;
    noAlvo(k, 'ginga-giro', a, { dy: 6 });
    await balanco(k, a, 4, 0.36, 5);
    noAlvo(k, 'ginga-giro', a, { dy: -4, espelho: true });
    await juntos(pulo(k, a, 5, 0.24), subir(k, 'st-brilho', a, { n: 3, dur: 0.3, intervalo: 0.06 }));
  },

  /* ------------------------------ Veneno ------------------------------ */
  // espinhos venenosos
  'veneno-1': async (k) => {
    await tiro(k, 'veneno-espinho', { n: 3, intervalo: 0.09, dur: 0.18, espalha: 5, impacto: 'veneno-gota' });
    await emCada(k, (a) => noAlvo(k, 'veneno-bolha', a, { dy: -6 }).fim);
  },
  // cusparada em arco alto que vira poça
  'veneno-2': async (k) => {
    await tiro(k, 'veneno-gota', { n: 3, intervalo: 0.1, dur: 0.36, arco: 30, espalha: 6 });
    await emCada(k, async (a) => { noAlvo(k, 'veneno-poca', a, { base: true, atras: true, fps: 8 }); noAlvo(k, 'veneno-bolha', a, { dx: -8 }); await esp(k, 0.14); noAlvo(k, 'veneno-bolha', a, { dx: 8, dy: -6 }); });
    await esp(k, 0.4);
  },
  // nuvem tóxica densa
  'veneno-3': async (k) => {
    const desfaz = k.c.escurecer('#30144a', 0.45);
    await emCada(k, async (a) => {
      for (const [dx, dy] of [[-12, 4], [12, -2], [0, -12], [2, 6]] as const) { noAlvo(k, 'veneno-nuvem', a, { dx, dy, fps: 9, atras: dy < 0 }); await esp(k, 0.11); }
      await juntos(balanco(k, a, 1, 0.4, 10), subir(k, 'veneno-bolha', a, { n: 3, dur: 0.4, intervalo: 0.1 }));
    });
    desfaz();
  },
  // poça borbulhante e vapor (aura tóxica)
  'veneno-4': async (k) => {
    const a = k.alvo;
    noAlvo(k, 'veneno-poca', a, { base: true, atras: true, fps: 5 });
    await subir(k, 'veneno-bolha', a, { n: 5, dur: 0.3, intervalo: 0.07, alt: 26 });
    await noAlvo(k, 'veneno-nuvem', a, { dy: -a.alt / 2, fps: 14 }).fim;
  },
};
