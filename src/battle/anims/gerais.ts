/**
 * Animações gerais: golpes físicos (fisico-1…8), golpes de apoio (status-1…8) e as animações pedidas
 * pelo motor fora de golpes (dano de status, clima, parasita, armadilha, espinhos, remédio e subida de nível).
 */
import { type AnimGolpe, balanco, chuva, clarear, emCada, esp, estilhacos, impulso, investida, juntos, noAlvo, orbita, piscar, pulo, subir, tiro, varrer } from './nucleo';

export const FISICOS: Record<string, AnimGolpe> = {
  // encontrão
  'fisico-1': async (k) => {
    await investida(k, 14, 0.08, 0.14, () => { void emCada(k, (a) => { noAlvo(k, 'fis-impacto', a); noAlvo(k, 'fis-poeira', a, { base: true, dx: k.d * 8 }); }); });
    await esp(k, 0.22);
  },
  // garras
  'fisico-2': async (k) => {
    await investida(k, 9, 0.06, 0.1, () => { k.som('g-arranhao'); void emCada(k, (a) => { noAlvo(k, 'fis-garras', a, { espelho: k.d === -1 }); }); });
    await emCada(k, (a) => balanco(k, a, 1, 0.2, 20));
    await esp(k, 0.1);
  },
  // mordida
  'fisico-3': async (k) => {
    void investida(k, 8, 0.1, 0.16);
    k.som('g-mordida');
    await emCada(k, async (a) => { const m = noAlvo(k, 'fis-mordida', a); await esp(k, 0.16); noAlvo(k, 'comum-impacto', a, { atras: true }); await m.fim; });
    await esp(k, 0.1);
  },
  // chute baixo / rasteira
  'fisico-4': async (k) => {
    await investida(k, 12, 0.07, 0.12, () => { void emCada(k, (a) => { noAlvo(k, 'ginga-rasteira', a, { base: true, espelho: k.d === -1 }); noAlvo(k, 'fis-poeira', a, { base: true, dx: -k.d * 10 }); return pulo(k, a, 5, 0.2); }); });
    await esp(k, 0.24);
  },
  // cabeçada com impulso
  'fisico-5': async (k) => {
    await impulso(k, 7, 0.2);
    await investida(k, 18, 0.06, 0.16, () => { k.som('g-pancada'); void k.c.tremor(2, 0.2); void emCada(k, (a) => { noAlvo(k, 'fis-cabecada', a, { dy: -6 }); noAlvo(k, 'fis-impacto', a, { atras: true }); }); });
    await esp(k, 0.14);
  },
  // chicotada de cauda
  'fisico-6': async (k) => {
    k.som('g-chicote');
    void balanco(k, k.eu, 3, 0.2, 6);
    await emCada(k, async (a) => { const f = noAlvo(k, 'fis-chicote', a, { espelho: k.d === -1, dy: -2 }); await esp(k, 0.18); void clarear(k, a, 0.06); await f.fim; });
    await esp(k, 0.16);
  },
  // sequência de golpes
  'fisico-7': async (k) => {
    for (const [dx, dy] of [[-8, -6], [7, 3], [-3, 6], [6, -8]] as const) {
      await investida(k, 7, 0.04, 0.06, () => { k.som('golpe-fraco'); void emCada(k, (a) => { noAlvo(k, 'comum-impacto', a, { dx, dy }); }); });
    }
    await emCada(k, (a) => noAlvo(k, 'fis-impacto', a).fim);
  },
  // carreira pesada com pisão
  'fisico-8': async (k) => {
    noAlvo(k, 'fis-rastro', k.eu, { atras: true, espelho: k.d === 1, dx: -k.d * 12 });
    noAlvo(k, 'fis-poeira', k.eu, { base: true, dx: -k.d * 10 });
    await investida(k, 22, 0.1, 0.2, () => { k.som('g-pisao'); void k.c.tremor(4, 0.34); void emCada(k, (a) => { noAlvo(k, 'fis-pisao', a, { base: true }); noAlvo(k, 'fis-impacto', a); a.dy = 2; }); });
    await emCada(k, (a) => { a.dy = 0; return noAlvo(k, 'fis-poeira', a, { base: true, dx: 10, espelho: true }).fim; });
  },
};

export const APOIOS: Record<string, AnimGolpe> = {
  // atributo sobe: setas para cima
  'status-1': async (k) => {
    k.som('atrib-sobe');
    await emCada(k, (a) => juntos(subir(k, 'st-seta-cima', a, { n: 5, dur: 0.4, intervalo: 0.07, alt: a.alt }), clarear(k, a, 0.08)));
    await esp(k, 0.1);
  },
  // atributo desce: setas para baixo
  'status-2': async (k) => {
    k.som('atrib-desce');
    await emCada(k, (a) => juntos(subir(k, 'st-seta-baixo', a, { n: 5, dur: 0.4, intervalo: 0.07, alt: a.alt, desce: true }), (async () => { a.escuro = true; await esp(k, 0.3); a.escuro = false; })()));
    await esp(k, 0.1);
  },
  // cura: cruzes e brilhos
  'status-3': async (k) => {
    k.som('cura');
    const desfaz = k.c.escurecer('#1f5a3a', 0.25);
    await emCada(k, (a) => juntos(subir(k, 'st-cruz', a, { n: 4, dur: 0.44, intervalo: 0.1 }), orbita(k, 'st-brilho', a, { n: 3, dur: 0.6, voltas: 1, sobe: 12 })));
    desfaz();
  },
  // proteção: escudo
  'status-4': async (k) => {
    k.som('protecao');
    await emCada(k, async (a) => { const e = noAlvo(k, 'st-escudo', a, { dx: a.lado === 0 ? 10 : -10, segura: true }); await esp(k, 0.5); await clarear(k, a, 0.06); e.remover(); });
    await esp(k, 0.1);
  },
  // som/canto: ondas e notas
  'status-5': async (k) => {
    k.som('g-canto');
    const [x, y] = k.eu.centro;
    for (let i = 0; i < 3; i++) { k.c.fx('st-onda-som', x + k.d * (k.eu.larg + 6 + i * 12), y - k.d * i * 3, { espelho: k.d === -1 }); await esp(k, 0.1); }
    void tiro(k, 'st-nota', { n: 4, intervalo: 0.1, dur: 0.4, arco: 12, onda: 6, espalha: 8, espelho: false });
    await esp(k, 0.5);
    await emCada(k, (a) => (a === k.eu ? pulo(k, a, 3, 0.2) : balanco(k, a, 1, 0.2, 14)));
  },
  // olhar ameaçador
  'status-6': async (k) => {
    const desfaz = k.c.escurecer('#1a1423', 0.5);
    k.c.fx('st-olhar', k.eu.x, k.eu.y - k.eu.alt + 6, { fps: 8 });
    await esp(k, 0.34);
    k.som('g-rugido');
    await emCada(k, (a) => { if (a !== k.eu) k.c.fx('st-suor', a.x + a.larg, a.y - a.alt + 4); return balanco(k, a, 2, 0.36, 22); });
    await esp(k, 0.1);
    desfaz();
  },
  // mudança de clima: nuvem e sol se revezam no alto
  'status-7': async (k) => {
    const n = k.c.fx('st-nuvem', 160 - k.d * 60, 26, { loop: true });
    await k.c.mover(n, 160, 26, 0.36);
    k.c.fx('st-sol', 160, 30, { atras: true, fps: 8 });
    void k.c.flash('#fff8e7', 0.2, 0.5);
    await k.c.mover(n, 160 + k.d * 70, 22, 0.36);
    n.remover();
    await esp(k, 0.1);
  },
  // pó/esporos sobre o alvo
  'status-8': async (k) => {
    k.som('g-po');
    await emCada(k, async (a) => { for (const dx of [-8, 8, 0]) { k.c.fx('st-po', a.x + dx, a.y - a.alt / 2 - 6); await esp(k, 0.12); } await balanco(k, a, 1, 0.24, 10); });
    await esp(k, 0.2);
  },
};

export const MOTOR: Record<string, AnimGolpe> = {
  // confuso: estrelas rodando e pancada em si mesmo
  'confusao-auto': async (k) => {
    const a = k.eu, e = k.c.fx('st-confuso', a.x, a.y - a.alt - 2, { loop: true });
    await balanco(k, a, 3, 0.36, 6);
    noAlvo(k, 'fis-impacto', a); k.som('golpe-normal');
    await esp(k, 0.24); e.remover();
  },
  'status-queimado': async (k) => {
    const a = k.eu; k.som('status-queimadura');
    for (const dx of [-8, 6, -1]) { noAlvo(k, 'brasa-chama', a, { base: true, dx, dy: -a.alt / 3 }); await esp(k, 0.1); }
    await subir(k, 'brasa-fagulha', a, { n: 3, dur: 0.24 });
  },
  'status-envenenado': async (k) => {
    const a = k.eu; k.som('status-veneno');
    a.escuro = true;
    await subir(k, 'veneno-bolha', a, { n: 4, dur: 0.34, intervalo: 0.09, alt: a.alt });
    a.escuro = false; await esp(k, 0.06);
  },
  'status-paralisado': async (k) => {
    const a = k.eu; k.som('status-paralisia');
    const f = noAlvo(k, 'st-paralisia', a, { loop: true });
    await balanco(k, a, 1, 0.5, 30);
    f.remover();
  },
  'status-dormindo': async (k) => {
    const a = k.eu; k.som('status-sono');
    await k.c.uma('st-zzz', a.x + (a.lado === 0 ? 14 : -14), a.y - a.alt - 4, { fps: 6 });
  },
  'status-congelado': async (k) => {
    const a = k.eu; k.som('status-congelado');
    const g = noAlvo(k, 'st-gelo', a, { loop: true, fps: 8 });
    await esp(k, 0.5); g.remover();
  },
  'status-encantado': async (k) => {
    const a = k.eu;
    await juntos(orbita(k, 'encanto-coracao', a, { n: 3, dur: 0.6, voltas: 1, dy: -a.alt / 2 + 2, ry: 5 }), balanco(k, a, 2, 0.6, 4));
  },
  'clima-garoa': async (k) => {
    const a = k.eu;
    await chuva(k, 'geada-floco', a, { n: 5, dur: 0.22, altura: 50, vies: 14, intervalo: 0.05, impacto: 'st-brilho' });
    await esp(k, 0.1);
  },
  'clima-poeira': async (k) => {
    const a = k.eu;
    for (const dy of [-8, 2, -2]) { void varrer(k, 'terra-poeira', a, { dy, dur: 0.24, margem: 40 }); await esp(k, 0.1); }
    await balanco(k, a, 1, 0.24, 14);
  },
  // parasita: bolinhas de energia saem de quem sofre e vão para o outro lado
  semente: async (k) => {
    const a = k.eu; k.som('drenar');
    noAlvo(k, 'mata-broto', a, { base: true, dx: -6 }); a.escuro = true;
    await tiro(k, 'st-dreno', { n: 4, intervalo: 0.09, dur: 0.36, arco: 16, de: a.centro, alvo: k.outro, abre: 6, impacto: 'st-brilho' });
    a.escuro = false;
  },
  // preso: cipó aperta
  armadilha: async (k) => {
    const a = k.eu, c = noAlvo(k, 'st-cipo', a, { segura: true });
    await esp(k, 0.4);
    await balanco(k, a, 1, 0.2, 20);
    c.remover();
  },
  // espinhos no chão
  espinhos: async (k) => {
    const a = k.eu;
    noAlvo(k, 'st-espinho', a, { base: true, segura: true });
    await esp(k, 0.2);
    await pulo(k, a, 5, 0.2);
    await esp(k, 0.1); k.c.limparSegurados();
  },
  // remédio usado
  'item-cura': async (k) => {
    const a = k.eu; k.som('item-usar');
    await juntos(subir(k, 'st-brilho', a, { n: 5, dur: 0.36, intervalo: 0.06 }), (async () => { await esp(k, 0.14); noAlvo(k, 'st-cruz', a, { dy: -a.alt / 2 - 4, fps: 6 }); })());
    await esp(k, 0.16);
  },
  // subiu de nível: coluna dourada
  'subir-nivel': async (k) => {
    const a = k.eu;
    noAlvo(k, 'st-nivel', a, { base: true, atras: true, dy: 4 });
    await esp(k, 0.16); void clarear(k, a, 0.08);
    await subir(k, 'st-brilho', a, { n: 4, dur: 0.3, intervalo: 0.06 });
  },
};
