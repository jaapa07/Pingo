/**
 * 003 · BANDEIRÃO (Mata/Terra) — tamanduá-bandeira de cauda-bandeira de folhagem. Estágio final.
 * Mantém da linha: colete de folha escura, broto na testa, folhas vivas, unhas ameixa.
 * Cresce: cauda-bandeira (leque de nove folhas em duas camadas, tremula) · faixa diagonal do bandeira
 * com debrum creme · juba de folhas ao longo do dorso · braçadeiras de terra batida e unhas de enxada.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, folha3d, garra, segmento, listra, par, m, lz, lr, qz } from './kits';
import { paletaTamandua } from './001-tamandui';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.46, 0.27, 0.25], peito: 1.14,
    pernas: { alt: 0.36, r: 0.11, rFim: 0.095, xF: 0.56, xT: -0.58, z: 0.64, dobraF: 10, dobraT: -22, pe: [0.13, 0.06, 0.105] },
    pescoco: { len: 0.26, ang: 18, r: 0.14, x: 0.66, y: 0.22 },
    cabeca: [0.2, 0.17, 0.165],
    focinho: { len: 0.5, r0: 0.095, r1: 0.045, cai: 22, y: -0.15, nariz: 0.045 },
    orelha: { tipo: 'redonda', alt: 0.09, larg: 0.09, x: -0.35, z: 0.75, abre: 30, deita: 24 },
    cauda: { segs: 2, len: 0.34, r0: 0.13, r1: 0.1, ang: 34, curva: 26 },
    olho: { r: 0.022, pos: [0.17, 0.04, 0.132] },
    rampas: { pelo: 0, cabeca: 0, pernaF: 0, canelaF: 0, pernaT: 0, canelaT: 0, pe: 3, nariz: 3, orelha: 3, cauda: 1 },
  });
  // colete escuro cobrindo a garupa + faixa diagonal do bandeira com debrum creme
  rig.add('corpo',
    calota([0.42, 0.283, 0.262], m(1), { de: 0, ate: 100, pos: [-0.06, 0.005, 0] }),
    blob([0.1, 0.3, 0.268], m(3), { pos: [0.2, 0.0, 0], rot: [0, 0, -34] }),
    blob([0.035, 0.3, 0.27], m.luz(0), { pos: [0.3, 0.02, 0], rot: [0, 0, -34] }),
    blob([0.035, 0.3, 0.27], m.luz(0), { pos: [0.1, -0.02, 0], rot: [0, 0, -34] }));
  // barra de folhas vivas na borda do colete
  par((_, s) => {
    for (const [x, g] of [[-0.36, 150], [-0.22, 170], [-0.08, 188]] as const)
      rig.add('corpo', folha3d(0.18, 0.14, m(2), { pos: [x, 0.0, 0.26 * s], rot: [10 * s, 0, g], esp: 0.5 }));
  });
  // juba de folhas ao longo do dorso (da nuca à garupa)
  const juba: [number, number, number][] = [[0.3, 0.19, -30], [0.14, 0.22, -14], [-0.02, 0.22, 4], [-0.18, 0.2, 20], [-0.32, 0.17, 34]];
  juba.forEach(([x, alt, g], i) => rig.add('corpo', folha3d(alt, 0.15, i % 2 ? m(2) : m.luz(2), { pos: [x, 0.24, 0], rot: [0, 0, g], esp: 0.7 })));
  rig.add('pescoco', folha3d(0.16, 0.13, m(2), { pos: [0.08, 0.13, 0], rot: [0, 0, -44], esp: 0.7 }));
  // CAUDA-BANDEIRA: leque de folhas em duas camadas, num osso que tremula
  rig.bone('bandeira', 'cauda2', [-0.14, 0, 0], [0, 0, 62]);
  const leque: [number, number, number][] = [[-64, 0.42, 1], [-34, 0.56, 2], [-4, 0.64, 1], [26, 0.58, 2], [56, 0.44, 1]];
  for (const [g, l, r] of leque) rig.add('bandeira', folha3d(l, 0.26, m(r), { rot: [0, 0, g], esp: 0.5, pos: [0, 0, 0] }));
  for (const [g, l] of [[-48, 0.34], [-18, 0.42], [12, 0.44], [42, 0.36]] as const)
    par((_, s) => rig.add('bandeira', folha3d(l, 0.2, m.luz(2), { rot: [0, 0, g], esp: 0.5, pos: [0, 0.02, 0.05 * s] })));
  rig.add('bandeira', blob([0.12, 0.1, 0.11], m(1), { pos: [0, 0.02, 0] }));
  // broto de três folhas na testa
  rig.bone('broto', 'cabeca', [ref.topo[0] - 0.03, ref.topo[1] - 0.02, 0]);
  rig.add('broto', segmento([0, 0, 0], [0, 0.05, 0], 0.024, 0.02, m(2)),
    folha3d(0.2, 0.12, m(2), { pos: [0, 0.04, 0], rot: [0, 0, -50], esp: 0.5 }),
    folha3d(0.16, 0.1, m.luz(2), { pos: [0, 0.04, 0], rot: [0, 0, 0], esp: 0.5 }),
    folha3d(0.15, 0.1, m(2), { pos: [0, 0.04, 0], rot: [0, 0, 50], esp: 0.5 }));
  // braçadeiras de terra batida e unhas de enxada
  par((l) => {
    rig.add('perna_f' + l, listra(0.105, 0.03, m.luz(0), { pos: [0.01, -0.1, 0] }));
    rig.add('canela_f' + l, listra(0.1, 0.028, m.luz(0), { pos: [-0.01, -0.03, 0] }));
    for (const z of [-0.07, 0, 0.07]) rig.add('canela_f' + l, garra(0.13, 0.032, m.luz(3), { pos: [0.12, -0.13, z], curva: 0.6 }));
    for (const z of [-0.05, 0.05]) rig.add('canela_t' + l, garra(0.07, 0.024, m.luz(3), { pos: [0.12, -0.16, z], curva: 0.5 }));
  });
  // máscara: risca escura do olho ao pescoço e ponta do focinho
  par((_, s) => rig.add('cabeca', blob([0.16, 0.03, 0.02], m.plano(3), { pos: [0.02, -0.02, 0.155 * s], rot: [0, 8 * s, 14], seg: 10 })));
  const pf = ref.pontaFocinho;
  rig.add('cabeca', blob([0.05, 0.04, 0.048], m.plano(3), { pos: [pf[0] - 0.01, pf[1] + 0.005, 0], seg: 12 }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.0, hPerna: 0.36, mapa: { comp: 0.6, larg: 1.5, frontal: 1.35 }, mole: 0.6, passo: 22, cauda: 0.6 }, {
  idle: { broto: lz([0, 5, 8, 3]), bandeira: lr([[0, 0, 0], [4, 0, -3], [0, 0, -6], [-4, 0, -2]]) },
  especial: { broto: qz([0, 14, 18, -24, -8, 0]), bandeira: qz([0, 10, 14, -18, -6, 0]) },
  fisico: { bandeira: qz([4, 8, -12, -5, 0]) },
  dano: { bandeira: qz([12, 5, 0]) },
  andar: { bandeira: lz([0, -5, 0, 5]) },
});

export const bandeirao = criatura({
  num: 3, id: 'bandeirao', nome: 'Bandeirão', porte: 'G', estagio: 'final', paleta: paletaTamandua, build, anims,
  olho: {
    frente: ['kkkk.', '.pppk', 'ppwpp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
