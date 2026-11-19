/**
 * 097 · TAPIRINHO (Terra) — filhote de anta, listrado feito melancia para sumir na sombra da mata.
 * Traços únicos: tromba curta caída · listras e pintas creme em fileiras pelo corpo · orelhas de ponta branca ·
 * corpo de barril em pernas curtas · folha no canto da boca.
 */
import { criatura, quadrupede, animsQuadrupede, blob, folha3d, par, m, lz, qz, type V3 } from './kits';

export const paletaAnta = {
  rampas: [
    ['#372a38', '#6c544e', '#a48a74'], // 0 couro castanho-acinzentado
    ['#b5a088', '#f4e6c8', '#fffbf0'], // 1 creme das listras e das pontas das orelhas
    ['#1f1722', '#3d2d34', '#62494c'], // 2 cascos, crina e ponta da tromba
    ['#28683c', '#58b64a', '#b9e872'], // 3 folhas
  ] as [string, string, string][],
  contorno: '#20161e',
  extras: { w: '#ffffff', p: '#180f16', f: '#6c544e' },
};

export interface AntaP { k: number; tronco: V3; cabeca: V3; alt: number }

/** Corpo comum da linha: barril, tromba caída, orelhas de ponta branca, rabinho. */
export function corpoAnta(p: AntaP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: p.tronco, peito: 0.96,
    pernas: { alt: p.alt, r: 0.065 * k, rFim: 0.055 * k, xF: 0.58, xT: -0.58, z: 0.6, pe: [0.07 * k, 0.045 * k, 0.065 * k] },
    pescoco: { len: 0.13 * k, ang: 18, r: 0.16 * k, x: 0.64, y: 0.15 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.95, r0: cy * 0.6, r1: cy * 0.34, cai: 40, y: -0.05 },
    orelha: { tipo: 'redonda', alt: cy * 0.62, larg: cy * 0.5, x: -0.4, z: 0.7, abre: 26, deita: -8 },
    cauda: { segs: 1, len: 0.07 * k, r0: 0.04 * k, r1: 0.03 * k, ang: -40 },
    olho: { r: 0.026, pos: [cx * 0.66, cy * 0.32, cz * 0.74] },
    rampas: { pelo: 0, pe: 2 },
  });
  const rig = kit.rig;
  par((l, s) => rig.add('orelha_' + l, blob([cy * 0.14, cy * 0.12, cy * 0.1], m.luz(1), { pos: [0, cy * 0.5, 0], seg: 8 })));
  // ponta escura da tromba e queixo claro
  rig.add('cabeca', blob([cy * 0.3, cy * 0.26, cy * 0.3], m(2), { pos: [kit.ref.pontaFocinho[0], kit.ref.pontaFocinho[1], 0], seg: 10 }));
  rig.add('cabeca', blob([cx * 0.4, cy * 0.24, cz * 0.5], m.luz(0), { pos: [cx * 0.7, -cy * 0.6, 0], seg: 10 }));
  return kit;
}

function build() {
  const T: V3 = [0.29, 0.21, 0.2];
  const { rig } = corpoAnta({ k: 1, tronco: T, cabeca: [0.17, 0.15, 0.14], alt: 0.15 });
  // listras: três fileiras de traços creme ao longo dos flancos + pintas nas coxas e na cara
  par((l, s) => {
    for (const [y, n] of [[0.11, 4], [0.0, 5], [-0.1, 4]] as const) for (let i = 0; i < n; i++) {
      const x = -0.2 + (0.42 * i) / (n - 1), f = Math.sqrt(Math.max(0.05, 1 - (x / T[0]) ** 2 - (y / T[1]) ** 2));
      rig.add('corpo', blob([0.04, 0.02, 0.014], m.plano(1), { pos: [x, y, T[2] * f * s * 0.99], seg: 6, castShadow: false }));
    }
    rig.add('perna_t' + l, blob([0.022, 0.022, 0.014], m.plano(1), { pos: [0, -0.04, 0.06 * s], seg: 6, castShadow: false }));
    rig.add('cabeca', blob([0.035, 0.018, 0.014], m.plano(1), { pos: [0.06, -0.02, 0.145 * s], seg: 6, castShadow: false }));
  });
  for (const x of [-0.16, -0.02, 0.12]) rig.add('corpo', blob([0.045, 0.014, 0.022], m.plano(1), { pos: [x, 0.205 * Math.sqrt(1 - (x / T[0]) ** 2), 0], seg: 6, castShadow: false }));
  // folha no canto da boca
  rig.bone('folha', 'cabeca', [0.2, -0.1, -0.04], [0, 30, -70]);
  rig.add('folha', folha3d(0.13, 0.08, m(3), {}));
  return rig;
}

const anims = animsQuadrupede({ u: 0.6, hPerna: 0.15, mole: 1.1 }, {
  idle: { folha: lz([0, 8, 16, 6]) },
  dano: { folha: qz([-30, -10, 0]) },
});

export const tapirinho = criatura({
  num: 97, id: 'tapirinho', nome: 'Tapirinho', porte: 'P', estagio: 'basico', paleta: paletaAnta, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
