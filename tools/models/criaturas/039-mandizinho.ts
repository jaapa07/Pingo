/**
 * 039 · MANDIZINHO (Rio) — bagre-mandi miúdo, curioso, de bigodes compridos.
 * Traços únicos: cabeçorra chata e bocão sorridente · três pares de bigodes grossos ·
 * pintas escuras no lombo amarelado · ferrão na dorsal · nadadeiras verde-água.
 */
import { criatura, peixe, animsPeixe, blob, calota, tube, spike, par, m, lz, qz, type V3 } from './kits';

export const paletaMandi = {
  rampas: [
    ['#6a4f3a', '#c49a3c', '#f0d878'], // 0 couro amarelo-oliva
    ['#bfa58e', '#f6e8c8', '#fffbee'], // 1 barriga e beiço creme
    ['#2e2a3e', '#514a66', '#8a84a2'], // 2 pintas, bigodes e ferrão (ardósia)
    ['#2f6a78', '#5fb7ae', '#c8f2dc'], // 3 nadadeiras verde-água
  ] as [string, string, string][],
  contorno: '#2a2238',
  extras: { w: '#ffffff', p: '#1e1a2c', f: '#c49a3c' },
};

/** Bigode grosso num osso próprio: curva para fora e para baixo. */
export function bigode(rig: ReturnType<typeof peixe>['rig'], nome: string, pai: string, pos: V3, len: number, r: number, s: number, abre: number, cai: number, mat = m.plano(2)) {
  rig.bone(nome, pai, pos, [0, -abre * s, 0]);
  rig.add(nome, tube([[0, 0, 0], [len * 0.5, -len * cai * 0.35, 0], [len, -len * cai, 0]], (t) => r * (1 - t * 0.55), mat, { seg: 10, radial: 8 }));
}

function build() {
  const { rig } = peixe({
    corpo: [0.27, 0.19, 0.19], flutua: 0.3, ergue: 10,
    boca: { len: 0.07, r: 0.06 },
    cauda: { len: 0.12, r: 0.055, alt: 0.3, larg: 0.19, forma: 'furcada' },
    dorsal: { alt: 0.1, len: 0.14, x: 0.05 },
    anal: { alt: 0.07, len: 0.16, x: -0.5 },
    nad: { len: 0.15, larg: 0.09, y: -0.5 },
    olho: { r: 0.03, pos: [0.19, 0.075, 0.12] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 3, cauda: 3, boca: 1 },
  });
  // cabeçorra chata e beição creme
  rig.add('tronco', blob([0.15, 0.15, 0.2], m(0), { pos: [0.17, -0.01, 0] }));
  rig.add('tronco', blob([0.07, 0.045, 0.17], m(1), { pos: [0.28, -0.07, 0], seg: 14 }));
  // pintas escuras do lombo
  for (const [x, y, z, r] of [[-0.02, 0.15, 0.07, 0.035], [-0.12, 0.13, -0.05, 0.03], [0.06, 0.13, -0.09, 0.03], [-0.1, 0.07, 0.13, 0.032], [-0.2, 0.09, 0.05, 0.026], [0.0, 0.08, -0.16, 0.03]] as const)
    rig.add('tronco', blob([r, r * 0.6, r], m.plano(2), { pos: [x, y, z], seg: 8, castShadow: false }));
  // ferrão na dorsal e nadadeira adiposa
  rig.add('dorsal', spike(0.17, 0.028, m.plano(2), { pos: [0.06, 0, 0], rot: [0, 0, -12] }));
  rig.add('tronco', blob([0.06, 0.035, 0.02], m(3), { pos: [-0.2, 0.12, 0], seg: 10 }));
  // três pares de bigodes
  par((l, s) => {
    bigode(rig, 'bigode_' + l, 'tronco', [0.29, -0.03, 0.14 * s], 0.19, 0.028, s, 75, 0.7);
    bigode(rig, 'bigode2_' + l, 'tronco', [0.3, -0.1, 0.07 * s], 0.12, 0.024, s, 25, 1.2);
  });
  // bochechas claras
  par((_, s) => rig.add('tronco', blob([0.05, 0.04, 0.03], m.luz(0), { pos: [0.2, -0.02, 0.185 * s], seg: 10 })));
  return rig;
}

export const bigodes = {
  idle: { bigode_d: lz([0, 6, 10, 3]), bigode_e: lz([0, 4, 10, 5]), '?bigode2_d': lz([0, -5, -8, -2]), '?bigode2_e': lz([0, -5, -8, -2]) },
  especial: { bigode_d: qz([0, 14, 20, -24, -8, 0]), bigode_e: qz([0, 14, 20, -24, -8, 0]) },
  dano: { bigode_d: qz([26, 10, 0]), bigode_e: qz([26, 10, 0]) },
  desmaio: { bigode_d: qz([0, -8, -18, -26, -24]), bigode_e: qz([0, -8, -18, -26, -24]) },
};

const anims = animsPeixe({ u: 0.45, flutua: 0.26, mole: 1.3 }, bigodes);

export const mandizinho = criatura({
  num: 39, id: 'mandizinho', nome: 'Mandizinho', porte: 'P', estagio: 'basico', paleta: paletaMandi, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
