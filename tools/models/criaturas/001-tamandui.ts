/**
 * 001 · TAMANDUÍ (Mata) — tamanduá-mirim com pelagem de folhas. Inicial de Mata.
 * Traços únicos: colete de folhas escuras com barra recortada · broto de duas folhas na testa ·
 * cauda preênsil enrolada com uma folha na ponta · focinho comprido de ponta arrebitada.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, folha3d, garra, segmento, par, m, lz, qz, type V3 } from './kits';

export const paletaTamandua = {
  rampas: [
    ['#b07a52', '#e6bd7c', '#fae8ae'], // 0 pelo creme-dourado (sombra puxa para o ferrugem)
    ['#1d4a44', '#2f7d50', '#5fae58'], // 1 colete de folha escura (sombra azulada)
    ['#2f8f47', '#70c84c', '#c0ec6e'], // 2 folha viva (luz amarelada)
    ['#3b2740', '#5d4052', '#8a6470'], // 3 unhas, nariz e orelhas (ameixa)
  ] as [string, string, string][],
  contorno: '#2b1c30',
  extras: { w: '#ffffff', p: '#2b1c30', f: '#e6bd7c', r: '#f29a8e' },
};

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.29, 0.24, 0.225], peito: 1.08,
    pernas: { alt: 0.2, r: 0.085, rFim: 0.075, xF: 0.52, xT: -0.55, z: 0.6, dobraF: 6, dobraT: -16, pe: [0.1, 0.05, 0.085] },
    pescoco: { len: 0.17, ang: 32, r: 0.13, x: 0.62, y: 0.3 },
    cabeca: [0.22, 0.2, 0.195],
    focinho: { len: 0.3, r0: 0.105, r1: 0.058, cai: 30, y: -0.2, nariz: 0.045 },
    orelha: { tipo: 'redonda', alt: 0.1, larg: 0.1, x: -0.25, z: 0.7, abre: 28, deita: 18 },
    cauda: { segs: 3, len: 0.5, r0: 0.085, r1: 0.05, ang: 38, curva: 48 },
    olho: { r: 0.03, pos: [0.2, 0.04, 0.148] },
    rampas: { pelo: 0, cabeca: 0, pernaF: 0, canelaF: 0, pernaT: 0, canelaT: 0, pe: 3, nariz: 3, orelha: 3, cauda: 0 },
  });
  // colete de folhas: sela escura no dorso + alças que descem pelos ombros
  rig.add('corpo',
    calota([0.27, 0.25, 0.235], m(1), { de: 0, ate: 96, pos: [-0.03, 0.005, 0] }),
    blob([0.075, 0.25, 0.235], m(1), { pos: [0.13, -0.01, 0], rot: [0, 0, -24] }));
  // barra recortada do colete: pontas de folha caindo pelos flancos
  par((_, s) => {
    for (const [x, g] of [[-0.17, 160], [-0.02, 190]] as const)
      rig.add('corpo', folha3d(0.15, 0.13, m(2), { pos: [x, 0.0, 0.222 * s], rot: [10 * s, 0, g], esp: 0.5 }));
  });
  // broto na testa: duas folhas em V (osso próprio para balançar)
  rig.bone('broto', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.02, 0]);
  rig.add('broto',
    segmento([0, 0, 0], [0, 0.05, 0], 0.022, 0.018, m(2)),
    folha3d(0.19, 0.12, m(2), { pos: [0, 0.04, 0], rot: [0, 0, -38], esp: 0.5 }),
    folha3d(0.14, 0.1, m.luz(2), { pos: [0, 0.04, 0], rot: [0, 0, 42], esp: 0.5 }));
  // folha na ponta da cauda enrolada
  rig.add('cauda3', folha3d(0.24, 0.19, m(2), { pos: [-0.14, 0, 0], rot: [0, 0, 80], esp: 0.6 }));
  // unhas grandes de tamanduá nas patas da frente
  par((l) => {
    for (const z of [-0.045, 0.045]) rig.add('canela_f' + l, garra(0.07, 0.022, m.luz(3), { pos: [0.1, -0.1, z], curva: 0.5 }));
  });
  // anel claro no focinho (máscara do mirim ao contrário) e bochecha
  const pf = ref.pontaFocinho as V3;
  rig.add('cabeca', blob([0.05, 0.04, 0.052], m.plano(3), { pos: [pf[0] - 0.01, pf[1] + 0.005, 0], seg: 12 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.75, hPerna: 0.2, mapa: { comp: 0.7, larg: 1.4, frontal: 1.3 }, mole: 1.1 }, {
  idle: { broto: lz([0, 6, 10, 4]), cauda3: lz([0, -8, -12, -4]) },
  especial: { broto: qz([0, 14, 18, -24, -8, 0]) },
  andar: { broto: lz([0, 8, 0, -8]) },
});

export const tamandui = criatura({
  num: 1, id: 'tamandui', nome: 'Tamanduí', porte: 'P', estagio: 'basico', paleta: paletaTamandua, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
