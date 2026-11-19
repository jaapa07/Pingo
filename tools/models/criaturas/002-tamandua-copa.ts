/**
 * 002 · TAMANDUÁ-COPA (Mata) — tamanduá com uma copa de árvore crescendo no dorso.
 * Mantém do Tamanduí: colete de folha escura, broto na testa, cauda preênsil com folha.
 * Cresce: copa de cinco tufos no dorso (balança) · broto virou trevo de três folhas ·
 * unhas maiores · cauda com leque de três folhas.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, folha3d, garra, segmento, wobble, par, m, lz, lr, qz } from './kits';
import { paletaTamandua } from './001-tamandui';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.36, 0.25, 0.235], peito: 1.1,
    pernas: { alt: 0.25, r: 0.092, rFim: 0.08, xF: 0.55, xT: -0.56, z: 0.62, dobraF: 8, dobraT: -20, pe: [0.11, 0.055, 0.092] },
    pescoco: { len: 0.2, ang: 26, r: 0.13, x: 0.64, y: 0.26 },
    cabeca: [0.21, 0.185, 0.18],
    focinho: { len: 0.38, r0: 0.1, r1: 0.05, cai: 26, y: -0.2, nariz: 0.045 },
    orelha: { tipo: 'redonda', alt: 0.1, larg: 0.1, x: -0.3, z: 0.72, abre: 28, deita: 20 },
    cauda: { segs: 3, len: 0.6, r0: 0.095, r1: 0.055, ang: 30, curva: 40 },
    olho: { r: 0.026, pos: [0.19, 0.04, 0.142] },
    rampas: { pelo: 0, cabeca: 0, pernaF: 0, canelaF: 0, pernaT: 0, canelaT: 0, pe: 3, nariz: 3, orelha: 3, cauda: 0 },
  });
  // colete de folha escura (sela + alça do ombro) com barra de folhas vivas
  rig.add('corpo',
    calota([0.33, 0.262, 0.248], m(1), { de: 0, ate: 98, pos: [-0.04, 0.005, 0] }),
    blob([0.08, 0.262, 0.248], m(1), { pos: [0.16, -0.01, 0], rot: [0, 0, -24] }));
  par((_, s) => {
    for (const [x, g] of [[-0.24, 158], [-0.08, 180], [0.06, 198]] as const)
      rig.add('corpo', folha3d(0.16, 0.13, m(2), { pos: [x, 0.0, 0.243 * s], rot: [10 * s, 0, g], esp: 0.5 }));
  });
  // COPA: cinco tufos de folhagem no dorso, escuros por baixo e vivos por cima
  rig.bone('copa', 'corpo', [-0.06, ref.dorso[1] - 0.04, 0]);
  rig.add('copa', segmento([0, -0.02, 0], [0, 0.1, 0], 0.07, 0.055, m(3)));
  const tufos: [number, number, number, number][] = [[0, 0.2, 0, 0.19], [-0.17, 0.14, 0.05, 0.15], [0.16, 0.15, -0.04, 0.14], [-0.03, 0.15, 0.15, 0.13], [0.02, 0.14, -0.15, 0.13]];
  tufos.forEach(([x, y, z, r], i) => {
    rig.add('copa', blob([r, r * 0.8, r], m(i === 0 ? 2 : 1), { pos: [x, y, z], deform: [wobble(0.02, 16)], seg: 20 }));
    rig.add('copa', blob([r * 0.7, r * 0.5, r * 0.7], m(2), { pos: [x - r * 0.15, y + r * 0.42, z], deform: [wobble(0.015, 18)], seg: 16 }));
  });
  rig.add('copa', folha3d(0.14, 0.1, m.luz(2), { pos: [0.02, 0.36, 0], rot: [0, 0, -20], esp: 0.5 }), folha3d(0.12, 0.09, m.luz(2), { pos: [-0.04, 0.36, 0], rot: [0, 0, 35], esp: 0.5 }));
  // trevo de três folhas na testa
  rig.bone('broto', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.02, 0]);
  rig.add('broto', segmento([0, 0, 0], [0, 0.05, 0], 0.024, 0.02, m(2)),
    folha3d(0.2, 0.12, m(2), { pos: [0, 0.04, 0], rot: [0, 0, -46], esp: 0.5 }),
    folha3d(0.17, 0.11, m.luz(2), { pos: [0, 0.04, 0], rot: [0, 0, 6], esp: 0.5 }),
    folha3d(0.15, 0.1, m(2), { pos: [0, 0.04, 0], rot: [0, 0, 52], esp: 0.5 }));
  // leque de três folhas na ponta da cauda
  for (const [g, l] of [[50, 0.22], [85, 0.27], [120, 0.22]] as const)
    rig.add('cauda3', folha3d(l, 0.17, m(g === 85 ? 2 : 1), { pos: [-0.17, 0, 0], rot: [0, 0, g], esp: 0.6 }));
  // unhas de tamanduá (três por pata dianteira)
  par((l) => { for (const z of [-0.055, 0, 0.055]) rig.add('canela_f' + l, garra(0.09, 0.024, m.luz(3), { pos: [0.11, -0.12, z], curva: 0.55 })); });
  const pf = ref.pontaFocinho;
  rig.add('cabeca', blob([0.05, 0.04, 0.05], m.plano(3), { pos: [pf[0] - 0.01, pf[1] + 0.005, 0], seg: 12 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.9, hPerna: 0.25, mapa: { comp: 0.65, larg: 1.45, frontal: 1.3 }, mole: 0.9 }, {
  idle: { broto: lz([0, 6, 10, 4]), copa: lr([[0, 0, 0], [3, 0, 3], [0, 0, 5], [-3, 0, 2]]), cauda3: lz([0, -8, -12, -4]) },
  especial: { broto: qz([0, 14, 18, -24, -8, 0]), copa: qz([0, 6, 8, -14, -5, 0]) },
  fisico: { copa: qz([4, 8, -10, -4, 0]) },
  dano: { copa: qz([12, 4, 0]) },
  andar: { broto: lz([0, 8, 0, -8]), copa: lz([0, 4, 0, -4]) },
});

export const tamanduaCopa = criatura({
  num: 2, id: 'tamandua-copa', nome: 'Tamanduá-Copa', porte: 'M', estagio: 'medio', paleta: paletaTamandua, build, anims,
  olho: {
    frente: ['.ppp.', 'pppwp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
