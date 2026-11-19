/**
 * 033 · TATUZIM (Terra) — filhote de tatu-bola, o único tatu que se fecha numa bola perfeita.
 * Traços únicos: casco em cúpula com três cintas escuras · escudo no cocuruto · orelhinhas rosadas em pé ·
 * focinho fino sujo de terra vermelha · rabinho em cone · unhas de cavar.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, garra, par, m, lz, qz, qs, type V3 } from './kits';

export const paletaTatu = {
  rampas: [
    ['#633a30', '#a8703a', '#e2ba6c'], // 0 casco ocre-queimado
    ['#a06878', '#edb8ac', '#ffe6da'], // 1 pele rosada e barriga
    ['#32222e', '#5d4149', '#8c6c68'], // 2 cintas, unhas e sombra do casco
    ['#6b2b2a', '#b3533a', '#eb9a68'], // 3 terra vermelha
  ] as [string, string, string][],
  contorno: '#2a1a26',
  extras: { w: '#ffffff', p: '#2a1a26', f: '#edb8ac' },
};

export interface TatuP { k: number; tronco: V3; cabeca: V3; cintas: number; /** rampa das cintas */ cinta: number; orelha: number; rabo: number; alt: number }

/** Corpo comum da linha: casco em cúpula com cintas, escudo na cabeça, focinho fino, rabo em cone. */
export function corpoTatu(p: TatuP) {
  const [tx, ty, tz] = p.tronco, [cx, cy, cz] = p.cabeca, k = p.k;
  const kit = quadrupede({
    tronco: [tx * 0.92, ty * 0.85, tz * 0.9], peito: 0.96,
    pernas: { alt: p.alt, r: 0.06 * k, rFim: 0.055 * k, xF: 0.6, xT: -0.55, z: 0.6, pe: [0.075 * k, 0.04 * k, 0.065 * k] },
    pescoco: { len: 0.1 * k, ang: -4, r: 0.1 * k, x: 0.78, y: -0.1 },
    cabeca: p.cabeca,
    focinho: { len: cx * 1.15, r0: cy * 0.5, r1: cy * 0.2, cai: 14, y: -0.2, nariz: cy * 0.2 },
    orelha: { tipo: 'ponta', alt: p.orelha, larg: p.orelha * 0.7, x: -0.1, z: 0.6, abre: 24, deita: -4 },
    cauda: { segs: 3, len: p.rabo, r0: 0.07 * k, r1: 0.02 * k, ang: -8, curva: 0 },
    olho: { r: 0.027, pos: [cx * 0.72, cy * 0.12, cz * 0.78] },
    rampas: { pelo: 1, barriga: 1, pe: 2, nariz: 2, orelha: 1, orelhaDentro: 1, cauda: 0 },
  });
  const rig = kit.rig;
  // CASCO: cúpula que cobre lombo e flancos, com aba escura
  rig.add('corpo', calota([tx * 1.06, ty * 1.2, tz * 1.12], m(0), { de: 0, ate: 104, pos: [0, -ty * 0.08, 0] }));
  rig.add('corpo', blob([tx * 1.02, ty * 0.1, tz * 1.1], m.sombra(0), { pos: [0, -ty * 0.34, 0], seg: 20 }));
  // cintas: aros finos atravessando o casco
  for (let i = 0; i < p.cintas; i++) {
    const x = tx * (p.cintas === 1 ? 0 : -0.3 + (0.6 * i) / (p.cintas - 1)), f = Math.sqrt(1 - (x / (tx * 1.08)) ** 2);
    rig.add('corpo', calota([tx * 0.085, ty * 1.25 * f, tz * 1.17 * f], m.plano(p.cinta), { de: 0, ate: 100, pos: [x, -ty * 0.08, 0], seg: 20 }));
  }
  // escudo do cocuruto
  rig.add('cabeca', calota([cx * 1.06, cy * 1.12, cz * 0.9], m(0), { de: 0, ate: 66, pos: [cx * 0.25, 0, 0], rot: [0, 0, -24] }));
  // unhas de cavar nas patas da frente
  par((l, s) => { for (const z of [-0.035, 0.035]) rig.add('canela_f' + l, garra(0.07 * k, 0.022 * k, m.luz(2), { pos: [0.07 * k, -p.alt * 0.5 + 0.02 * k, z * k], curva: 0.5 })); void s; });
  return kit;
}

function build() {
  const { rig, ref } = corpoTatu({ k: 1, tronco: [0.26, 0.22, 0.22], cabeca: [0.15, 0.13, 0.13], cintas: 3, cinta: 2, orelha: 0.2, rabo: 0.2, alt: 0.1 });
  // escamas claras na frente e atrás do casco
  for (const [x, y, z] of [[0.17, 0.14, 0.1], [0.17, 0.14, -0.1], [0.2, 0.04, 0.17], [-0.17, 0.14, 0.1], [-0.17, 0.14, -0.1], [-0.21, 0.04, 0.16]] as const)
    rig.add('corpo', blob([0.035, 0.03, 0.035], m.luz(0), { pos: [x, y, z], seg: 8, castShadow: false }));
  // torrão de terra vermelha no focinho e montinho no lombo
  rig.bone('torrao', 'cabeca', [ref.pontaFocinho[0] - 0.02, ref.pontaFocinho[1] + 0.04, 0]);
  rig.add('torrao', blob([0.05, 0.04, 0.05], m(3), { seg: 10 }), blob([0.025, 0.02, 0.025], m.luz(3), { pos: [-0.03, 0.03, 0.02], seg: 8 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.5, hPerna: 0.1, mole: 0.9, cauda: 0.6 }, {
  idle: { torrao: lz([0, 0, 8, 0]) },
  // encolhe para dentro do casco antes de soltar o golpe
  especial: { pescoco: qz([-10, -30, -40, 20, 8, 0]), torrao: qs([1, 1.2, 1.4, 0.4, 0.8, 1]) },
  dano: { pescoco: qz([-30, -12, 0]) },
});

export const tatuzim = criatura({
  num: 33, id: 'tatuzim', nome: 'Tatuzim', porte: 'P', estagio: 'basico', paleta: paletaTatu, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
