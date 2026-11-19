/**
 * 024 · PEREREQUINHA (Rio) — perereca-verde de dedos grudentos, do tamanho de uma folha.
 * Traços únicos: olhões saltados de íris laranja · ventosas laranja nos dedos · risca creme do olho ao flanco ·
 * gota d'água equilibrada no cocuruto · papo que incha.
 */
import { criatura, anfibio, animsAnfibio, blob, par, m, lz, qz, qr, qp, unirExtras, type V3 } from './kits';

export const paletaPerereca = {
  rampas: [
    ['#23655a', '#55bb48', '#b6ea68'], // 0 verde-folha
    ['#a3a676', '#f1efc2', '#ffffea'], // 1 creme da barriga, do papo e da risca
    ['#a8402a', '#f08a2c', '#ffd162'], // 2 laranja das ventosas e dos olhos
    ['#3566b0', '#66b6ec', '#d9f6ff'], // 3 água
  ] as [string, string, string][],
  contorno: '#16303a',
  extras: { w: '#ffffff', p: '#16202c', f: '#55bb48', a: '#f08a2c' },
};

/** gota d'água num osso próprio */
export function gota(rig: ReturnType<typeof anfibio>['rig'], nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos);
  rig.add(nome, blob([r, r * 1.15, r], m(3), { seg: 12 }), blob([r * 0.4, r * 0.5, r * 0.4], m.luz(3), { pos: [r * 0.1, r * 0.45, r * 0.5], seg: 8 }), blob([r * 0.4, r * 0.4, r * 0.4], m.luz(3), { pos: [0, r * 1.1, 0], seg: 8 }));
}

/** Entrada e desmaio contidos (os do kit esticam as pernas além da célula). */
export const contido = {
  entrada: { perna_td: qz([-16, -24, 6, 0, 0]), perna_te: qz([-16, -24, 6, 0, 0]), canela_td: qz([20, 30, -6, 0, 0]), canela_te: qz([20, 30, -6, 0, 0]), perna_fd: qz([14, 20, -8, 0, 0]), perna_fe: qz([14, 20, -8, 0, 0]) },
  desmaio: { tronco: qr([[0, 0, 6], [0, 0, -6], [8, 0, -12], [16, 0, -18], [15, 0, -17]]), perna_td: qz([0, -6, -14, -22, -20]), perna_te: qz([0, -6, -14, -22, -20]), canela_td: qz([0, 6, 18, 30, 28]), canela_te: qz([0, 6, 18, 30, 28]), perna_fd: qz([0, 6, 16, 26, 24]), perna_fe: qz([0, 6, 16, 26, 24]) },
};

function build() {
  const { rig, ref } = anfibio({
    corpo: [0.2, 0.15, 0.18], ergue: 30, cabeca: [0.17, 0.12, 0.185], olhoSaliente: 0.075,
    bracos: { len: 0.2, r: 0.036 }, pernas: { coxa: 0.2, canela: 0.2, pe: 0.16, r: 0.044 },
    ventosa: 0.036, papo: 0.065, olho: { r: 0.028 },
    rampas: { pele: 0, barriga: 1, pernas: 0, dedos: 2, papo: 1, olho: 0 },
  });
  par((_, s) => {
    // risca creme do olho ao flanco
    rig.add('cabeca', blob([0.1, 0.022, 0.03], m.plano(1), { pos: [0.1, 0.015, 0.175 * s], rot: [0, -12 * s, 0], seg: 8 }));
    rig.add('tronco', blob([0.15, 0.025, 0.03], m.plano(1), { pos: [-0.02, 0.01, 0.18 * s], rot: [0, 6 * s, 0], seg: 8 }));
    // pintas claras no lombo
    rig.add('tronco', blob([0.03, 0.02, 0.03], m.luz(0), { pos: [-0.08, 0.135, 0.07 * s], seg: 8, castShadow: false }));
  });
  rig.add('tronco', blob([0.035, 0.02, 0.035], m.luz(0), { pos: [0.04, 0.148, 0], seg: 8, castShadow: false }));
  gota(rig, 'gota', 'cabeca', [ref.topoOlho[0] - 0.02, ref.topoOlho[1] + 0.03, 0], 0.05);
  return rig;
}

const anims = animsAnfibio({ u: 0.45, papo: true }, unirExtras(contido, {
  idle: { gota: lz([0, 6, 0, -6]) },
  fisico: { gota: qp([[0, 0, 0], [0, -0.01, 0], [0, 0.08, 0], [0, 0.03, 0], [0, 0, 0]]) },
  especial: { gota: qp([[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.1, 0], [0, 0.04, 0], [0, 0, 0]]) },
  dano: { gota: qp([[-0.04, 0.08, 0], [-0.02, 0.03, 0], [0, 0, 0]]) },
}));

export const pererequinha = criatura({
  num: 24, id: 'pererequinha', nome: 'Pererequinha', porte: 'P', estagio: 'basico', paleta: paletaPerereca, build, anims,
  olho: {
    frente: ['.aaa.', 'apppa', 'appwa', 'apppa', '.aaa.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
