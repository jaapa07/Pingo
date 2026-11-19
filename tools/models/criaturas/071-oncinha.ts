/**
 * 071 · ONÇINHA (Comum) — onça-pintada filhote, gorducha e de patas grandes demais.
 * Traços únicos: patonas largas com dedos creme · rosetas em anel com miolo ferrugem ·
 * orelhas redondas de borda escura · cauda curta e grossa de ponta preta · bochechas de bigode.
 */
import { criatura, quadrupede, animsQuadrupede, blob, par, m, lz, type V3 } from './kits';
import { pintas, dosDois } from './069-jaguatirim';

export const paletaOnca = {
  rampas: [
    ['#a05a2c', '#eeaa3a', '#ffdc74'], // 0 pelo amarelo-ouro
    ['#2a1a26', '#4a2e34', '#74504c'], // 1 rosetas, orelhas e ponta da cauda
    ['#c4a88c', '#f8ecd2', '#ffffff'], // 2 creme do focinho, peito, barriga e dedos
    ['#8c3a24', '#cc6a2c', '#f09a4c'], // 3 ferrugem do miolo das rosetas e do nariz
  ] as [string, string, string][],
  contorno: '#2a1620',
  extras: { w: '#ffffff', p: '#2a1620', f: '#eeaa3a', a: '#9ad04a' },
};

export interface OncaP { k: number; tronco: V3; peito: number; pernas: number; rPerna: number; cabeca: V3; pesc: [number, number]; cauda: { len: number; ang: number; curva: number; r: number } }

export function corpoOnca(p: OncaP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: p.tronco, peito: p.peito,
    pernas: { alt: p.pernas, r: p.rPerna, rFim: p.rPerna * 0.95, xF: 0.58, xT: -0.6, z: 0.62, dobraT: -20, pe: [p.rPerna * 1.6, p.rPerna * 0.7, p.rPerna * 1.4] },
    pescoco: { len: p.pesc[0], ang: p.pesc[1], r: p.tronco[1] * 0.66, x: 0.62, y: 0.28 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.34, r0: cy * 0.56, r1: cy * 0.44, cai: 10, y: -0.34, nariz: cy * 0.17 },
    orelha: { tipo: 'redonda', alt: cy * 0.6, larg: cy * 0.62, x: -0.1, z: 0.74, abre: 30, deita: 6 },
    cauda: { segs: 3, len: p.cauda.len, r0: p.cauda.r, r1: p.cauda.r * 0.9, ang: p.cauda.ang, curva: p.cauda.curva },
    olho: { r: 0.03, pos: [cx * 1.0, cy * 0.16, cz * 0.56] },
    rampas: { pelo: 0, barriga: 2, focinho: 2, nariz: 3, orelha: 1, orelhaDentro: 0, pe: 2, cauda: 0, caudaPonta: 1 },
  });
  const rig = kit.rig;
  par((_, s) => {
    // bochechas de bigode com três pintinhas
    rig.add('cabeca', blob([cx * 0.34, cy * 0.3, cz * 0.26], m(2), { pos: [cx * 0.72, -cy * 0.4, cz * 0.5 * s], seg: 10 }));
    rig.add('cabeca', blob([cx * 0.08, cy * 0.07, cz * 0.08], m.plano(1), { pos: [cx * 0.95, -cy * 0.38, cz * 0.6 * s], seg: 6 }));
  });
  pintas(rig, 'cabeca', [cx * 0.25, 0, 0], p.cabeca, dosDois([[0.3, 28, 0.9], [-0.2, 40, 0.9], [0.0, 0, 0.8]]), 0.03 * k, m.plano(1));
  return kit;
}

function build() {
  const tr: V3 = [0.26, 0.21, 0.2];
  const { rig } = corpoOnca({ k: 1, tronco: tr, peito: 0.96, pernas: 0.17, rPerna: 0.08, cabeca: [0.23, 0.21, 0.22], pesc: [0.13, 36], cauda: { len: 0.3, ang: 40, curva: -14, r: 0.062 } });
  pintas(rig, 'corpo', [0, 0, 0], tr, dosDois([[0.4, 46], [-0.05, 40], [-0.5, 46], [0.15, 86, 0.9], [-0.3, 84, 0.9], [-0.7, 78, 0.8], [0.2, 0, 0.9], [-0.3, 0, 0.9]]), 0.052, m.plano(1), m.plano(3));
  return rig;
}

const anims = animsQuadrupede({ u: 0.75, hPerna: 0.17, mole: 1.3, cauda: 1.2 }, {
  idle: { cabeca: lz([0, 2, 5, 2]) },
});

export const oncinha = criatura({
  num: 71, id: 'oncinha', nome: 'Onçinha', porte: 'P', estagio: 'basico', paleta: paletaOnca, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
