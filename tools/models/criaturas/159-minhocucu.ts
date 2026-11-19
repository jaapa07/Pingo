/**
 * 159 · MINHOCUÇU (Terra) — minhoca-gigante roliça que vive revirando o barro.
 * Traços únicos: corpo de anéis em dois tons de rosa · clitelo creme (a "sela" das minhocas) ·
 * torrão de terra na cabeça com um brotinho · ponta da cauda enlameada.
 */
import { criatura, serpente, animsSerpente, blob, folha3d, ring, par, m, lz, qz } from './kits';

export const paletaMinhoca = {
  rampas: [
    ['#8a465c', '#d27f7c', '#f7b79a'], // 0 rosa-terroso (sombra vinho, luz pêssego)
    ['#6f3352', '#b25d6e', '#e3978c'], // 1 anéis mais escuros
    ['#b98a68', '#f0cd98', '#fff3cf'], // 2 clitelo, ventre e dentes
    ['#3b2838', '#70493c', '#a97c4e'], // 3 terra, barro e pedra
  ] as [string, string, string][],
  contorno: '#2e1a2c',
  extras: { w: '#ffffff', p: '#2e1a2c', f: '#d27f7c' },
};

function build() {
  const { rig, ref } = serpente({
    r: 0.125,
    pescoco: { segs: 3, len: 0.15, curva: [58, 24, -22], rFim: 0.115 },
    cauda: { segs: 4, len: 0.16, curva: [46, -84, -70, 64], rFim: 0.06 },
    cabeca: [0.15, 0.13, 0.135],
    olho: { r: 0.026, pos: [0.13, 0.05, 0.1] },
    rampas: { corpo: 0, anel: 1, barriga: 2, cabeca: 0 },
  });
  // clitelo: a sela creme e grossa no 2º segmento do pescoço
  rig.add('pescoco2', blob([0.07, 0.14, 0.14], m(2), { pos: [0.07, 0, 0], seg: 16 }));
  // sulcos entre os anéis
  for (const [o, x] of [['pescoco1', 0.15], ['pescoco3', 0.02], ['cauda1', -0.16], ['cauda2', -0.16]] as const) rig.add(o, ring(o.startsWith('c') ? 0.105 : 0.12, 0.018, m.sombra(1), { pos: [x, o.startsWith('c') ? -0.02 : 0, 0], rot: [0, 90, 0] }));
  // torrão de terra na cabeça + brotinho (osso próprio)
  rig.add('cabeca', blob([0.11, 0.07, 0.115], m(3), { pos: [0.05, 0.12, 0], seg: 12 }), blob([0.05, 0.04, 0.05], m.luz(3), { pos: [-0.03, 0.15, 0.05], seg: 8 }));
  rig.bone('broto', 'cabeca', [0.05, 0.18, 0]);
  rig.add('broto', folha3d(0.12, 0.08, m.luz(2), { rot: [0, 0, -30], esp: 0.6 }), folha3d(0.09, 0.07, m(2), { rot: [0, 0, 36], esp: 0.6 }));
  // bochechas e boca redonda
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.03], m.luz(0), { pos: [0.13, -0.02, 0.105 * s], seg: 10 })));
  rig.add('cabeca', blob([0.03, 0.035, 0.05], m.plano(1), { pos: [ref.focinho[0] - 0.02, -0.01, 0], seg: 10 }));
  // ponta da cauda enlameada e respingos de barro
  rig.add('cauda4', blob([0.08, 0.07, 0.07], m(3), { pos: [-0.15, -0.055, 0], seg: 12 }));
  rig.add('cauda2', blob([0.05, 0.03, 0.05], m(3), { pos: [-0.08, 0.07, 0.03], seg: 8 }));
  rig.add('pescoco1', blob([0.05, 0.03, 0.05], m(3), { pos: [0.06, -0.09, 0.08], seg: 8 }));
  return rig;
}

const anims = animsSerpente({ u: 0.55, pescoco: 3, cauda: 4, mole: 1.3, investida: 0.02 }, {
  // bote curto: a minhoca dá uma cabeçada em vez de se esticar toda
  fisico: { pescoco1: qz([8, 14, -14, -6, 0]), pescoco2: qz([8, 16, -18, -8, 0]), pescoco3: qz([6, 12, -14, -6, 0]), broto: qz([8, 14, -20, -8, 0]) },
  desmaio: { pescoco1: qz([4, -6, -16, -24, -22]), pescoco2: qz([0, -10, -30, -50, -48]), pescoco3: qz([0, -10, -30, -44, -42]), cabeca: qz([0, 4, 10, 16, 14]) },
  idle: { broto: lz([0, 6, 10, 3]) },
  especial: { broto: qz([0, 14, 18, -24, -8, 0]) },
  dano: { broto: qz([26, 10, 0]) },
});

export const minhocucu = criatura({
  num: 159, id: 'minhocucu', nome: 'Minhocuçu', porte: 'P', estagio: 'basico', paleta: paletaMinhoca, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
