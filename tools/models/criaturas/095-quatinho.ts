/**
 * 095 · QUATINHO (Comum) — filhote de quati, nariz comprido metido em tudo.
 * Traços únicos: focinho comprido arrebitado de ponta escura · máscara de pintas creme em volta dos olhos ·
 * rabo de anéis em pé feito antena · orelhinhas de borda creme · pitanga roubada no focinho.
 */
import { criatura, quadrupede, animsQuadrupede, blob, par, m, lz, qz, type V3 } from './kits';

export const paletaQuati = {
  rampas: [
    ['#48293a', '#a6623a', '#e0a062'], // 0 pelo ruivo
    ['#b39a84', '#f4e2c4', '#fffaf0'], // 1 creme da máscara e da barriga
    ['#201622', '#412c32', '#69494a'], // 2 focinho, patas e anéis escuros
    ['#93223a', '#e44a36', '#ffa25e'], // 3 pitanga · faixas de ginga
  ] as [string, string, string][],
  contorno: '#241420',
  extras: { w: '#ffffff', p: '#1a0f18', f: '#a6623a' },
};

export interface QuatiP { k: number; cabeca: V3; rabo: number; r: number }

/** Corpo comum da linha: focinho arrebitado, máscara de pintas, rabo de anéis erguido. */
export function corpoQuati(p: QuatiP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: [0.27 * k, 0.18 * k, 0.17 * k], peito: 0.96,
    pernas: { alt: 0.16 * k, r: 0.056 * k, xF: 0.58, xT: -0.55, pe: [0.075 * k, 0.035 * k, 0.06 * k] },
    pescoco: { len: 0.13 * k, ang: 34, r: 0.12 * k },
    cabeca: p.cabeca,
    focinho: { len: cx * 1.15, r0: cy * 0.5, r1: cy * 0.24, cai: -10, y: -0.2, nariz: cy * 0.22 },
    orelha: { tipo: 'redonda', alt: cy * 0.5, larg: cy * 0.5, x: -0.3, z: 0.72, abre: 30, deita: -6 },
    cauda: { segs: 5, len: p.rabo, r0: p.r, r1: p.r * 0.8, ang: 62, curva: 6 },
    olho: { r: 0.027, pos: [cx * 0.8, cy * 0.22, cz * 0.62] },
    rampas: { pelo: 0, barriga: 1, focinho: 2, nariz: 2, pe: 2, canelaF: 2, canelaT: 2, orelha: 2, orelhaDentro: 1, cauda: 0 },
  });
  const rig = kit.rig, sl = p.rabo / 5;
  for (let i = 1; i <= 5; i++) rig.add('cauda' + i, blob([sl * 0.24, p.r * 1.12, p.r * 1.12], m(2), { pos: [-sl * 0.5, 0, 0], seg: 10 }));
  par((_, s) => {
    // máscara: pinta em cima e embaixo do olho, risca clara no focinho
    rig.add('cabeca', blob([cx * 0.16, cy * 0.14, cz * 0.1], m.plano(1), { pos: [cx * 0.74, cy * 0.56, cz * 0.56 * s], seg: 8 }), blob([cx * 0.2, cy * 0.14, cz * 0.1], m.plano(1), { pos: [cx * 0.86, -cy * 0.1, cz * 0.6 * s], seg: 8 }));
    rig.add('cabeca', blob([cx * 0.4, cy * 0.08, cz * 0.08], m.plano(1), { pos: [cx * 1.4, -cy * 0.08, cz * 0.26 * s], rot: [0, 0, 10], seg: 8 }));
  });
  rig.add('cabeca', blob([cx * 0.3, cy * 0.2, cz * 0.4], m(1), { pos: [cx * 0.9, -cy * 0.62, 0], seg: 8 }));
  return kit;
}

function build() {
  const { rig, ref } = corpoQuati({ k: 1, cabeca: [0.17, 0.15, 0.15], rabo: 0.6, r: 0.05 });
  rig.bone('pitanga', 'cabeca', [ref.pontaFocinho[0] + 0.0, ref.pontaFocinho[1] + 0.09, 0]);
  rig.add('pitanga', blob([0.055, 0.05, 0.055], m(3), { seg: 10 }), blob([0.02, 0.02, 0.02], m.luz(3), { pos: [0.02, 0.025, -0.02], seg: 6 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.65, hPerna: 0.16, mole: 1.2, cauda: 0.4 }, {
  idle: { pitanga: lz([0, 8, 0, -8]), cauda3: lz([0, 4, 8, 3]) },
  dano: { pitanga: qz([-30, -10, 0]) },
});

export const quatinho = criatura({
  num: 95, id: 'quatinho', nome: 'Quatinho', porte: 'P', estagio: 'basico', paleta: paletaQuati, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
