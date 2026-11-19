/**
 * 032 · VAMPIRINHA (Veneno/Vento) — morcego-vampiro que se embrulha nas asas como numa capa. Estágio final.
 * Mantém da linha: pelo ameixa, membrana roxa de dedos aparentes, orelhas de miolo rosa, presas, o vermelho.
 * Cresce: ASAS-CAPA caídas até o chão com forro vermelho · gola alta de duas pontas atrás da cabeça ·
 * broche vermelho no peito · orelhas compridas de ponta dobrada · topete repartido · pés de garras cruzados.
 */
import { criatura, blob, slab, tufo, garra, par, m, lz, ls, qz, qr, D2R } from './kits';
import { paletaMorcego, corpoMorcego, animsMorcego } from './030-morceguim';

function build() {
  const { rig, ref } = corpoMorcego({ k: 1.25, flutua: 0.16, cabeca: [0.2, 0.18, 0.2], orelha: [0.34, 0.13], focinho: 0.07, asa: 1.0, tomba: 0.12, forro: 3 });
  // capa: as asas caem ao lado do corpo (ombro gira para baixo, a mão fecha um pouco para dentro)
  par((l, s) => {
    rig.bones['asa_' + l].rotation.x = 62 * s * D2R; rig.bones['asa_' + l].rotation.y = -14 * s * D2R;
    rig.bones['asa2_' + l].rotation.x = 26 * s * D2R;
    // gola alta de duas pontas
    rig.add('pescoco', slab([[-0.02, -0.06], [0.05, 0.1], [0.0, 0.3], [-0.16, 0.16], [-0.2, -0.04]], 0.04, m(1), { pos: [-0.06, 0.0, 0.14 * s], rot: [0, -28 * s, 0] }),
      slab([[-0.02, -0.04], [0.02, 0.1], [-0.01, 0.22], [-0.12, 0.12], [-0.15, -0.02]], 0.03, m.plano(3), { pos: [-0.035, 0.0, 0.125 * s], rot: [0, -28 * s, 0] }));
    // presas, sobrancelha fina e cílio
    rig.add('cabeca', blob([0.02, 0.06, 0.02], m.luz(2), { pos: [ref.focinho[0] - 0.01, ref.focinho[1] - 0.07, 0.045 * s], seg: 8 }));
    rig.add('cabeca', blob([0.075, 0.02, 0.06], m.sombra(1), { pos: [0.14, 0.11, 0.105 * s], rot: [-16 * s, 0, -14], seg: 8 }));
    // garras dos pés
    for (const g of [-30, 0, 30]) rig.add('perna_' + l, garra(0.08, 0.022, m.luz(2), { pos: [0.02, -0.13, 0], rot: [0, g, -50], curva: 0.4 }));
  });
  // nariz-folha e broche sobre gola de pelúcia
  rig.add('cabeca', blob([0.035, 0.07, 0.06], m.plano(2), { pos: [ref.focinho[0] + 0.02, ref.focinho[1] + 0.07, 0], rot: [0, 0, 20], seg: 10 }));
  rig.bone('broche', 'corpo', [0.15, 0.15, 0]);
  rig.add('broche', blob([0.05, 0.06, 0.06], m(3), { seg: 12 }), blob([0.02, 0.025, 0.025], m.luz(3), { pos: [0.035, 0.02, -0.02], seg: 8 }), blob([0.03, 0.075, 0.075], m.luz(2), { pos: [-0.02, 0, 0], seg: 10 }));
  // topete repartido
  rig.bone('topete', 'cabeca', [0.04, ref.topo[1] - 0.03, 0], [0, 0, -20]);
  rig.add('topete', tufo(2, 0.12, 0.06, m(0), { abre: 40 }));
  // barriga elegante: pelo escuro até embaixo
  rig.add('corpo', blob([0.12, 0.14, 0.14], m.sombra(0), { pos: [0.02, -0.12, 0], seg: 14 }));
  return rig;
}

const anims = animsMorcego({ u: 1.0, flutua: 0.14, mole: 0.9, bate: 0.3 }, {
  idle: { topete: lz([0, 4, 8, 2]), broche: ls([1, 1.1, 1.25, 1.1]) },
  // abre a capa de uma vez e mostra o forro
  especial: { asa_d: qr([[4, 0, 0], [10, 0, 0], [14, 0, 0], [-58, 14, 0], [-30, 8, 0], [0, 0, 0]]), asa_e: qr([[-4, 0, 0], [-10, 0, 0], [-14, 0, 0], [58, -14, 0], [30, -8, 0], [0, 0, 0]]),
    asa2_d: qr([[0, 0, 0], [6, 0, 0], [8, 0, 0], [-26, 0, 0], [-12, 0, 0], [0, 0, 0]]), asa2_e: qr([[0, 0, 0], [-6, 0, 0], [-8, 0, 0], [26, 0, 0], [12, 0, 0], [0, 0, 0]]), topete: qz([0, 10, 14, -20, -8, 0]) },
  entrada: { asa_d: qr([[-50, 0, 0], [-30, 0, 0], [10, 0, 0], [-4, 0, 0], [0, 0, 0]]), asa_e: qr([[50, 0, 0], [30, 0, 0], [-10, 0, 0], [4, 0, 0], [0, 0, 0]]) },
});

export const vampirinha = criatura({
  num: 32, id: 'vampirinha', nome: 'Vampirinha', porte: 'M', estagio: 'final', paleta: paletaMorcego, build, anims,
  olho: {
    frente: ['ppp..', '.aaa.', 'apwpa', 'apppa', '.aaa.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
