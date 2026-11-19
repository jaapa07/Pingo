/**
 * 074 · ARIRANHÃO (Rio/Ginga) — ariranha adulta, chefe do bando, que encara até jacaré. Estágio final.
 * Mantém da linha: corpo chocolate, mancha creme na garganta, rabo de remo, pescoço de periscópio, o azul da água.
 * Cresce: presas à mostra · mancha da garganta descendo pelo peito · mãos de membrana erguidas em guarda ·
 * rabo-remo largo levantando espirros d'água · sobrancelha brava · crista de pelo molhado.
 */
import { criatura, animsQuadrupede, blob, tufo, espuma, par, m, lz, ls, qz, D2R } from './kits';
import { paletaAriranha, corpoLontra } from './073-ariranhinha';

function build() {
  const { rig, ref } = corpoLontra({ k: 1.3, cabeca: [0.2, 0.17, 0.185], rabo: 0.8, ang: 64, tronco: [0.44, 0.22, 0.22] });
  rig.add('pescoco', blob([0.1, 0.16, 0.145], m(1), { pos: [0.13, 0.16, 0], seg: 12 }), blob([0.06, 0.07, 0.06], m(1), { pos: [0.16, -0.08, 0.09], seg: 8 }), blob([0.05, 0.06, 0.05], m(1), { pos: [0.14, -0.1, -0.08], seg: 8 }));
  rig.add('corpo', blob([0.07, 0.09, 0.1], m(1), { pos: [0.4, -0.02, 0], seg: 10 }));
  rig.add('cabeca', blob([0.08, 0.045, 0.12], m(1), { pos: [0.12, -0.15, 0], seg: 10 }));
  par((l, s) => {
    rig.add('cabeca', blob([0.018, 0.045, 0.018], m.luz(1), { pos: [ref.pontaFocinho[0] - 0.02, ref.pontaFocinho[1] - 0.09, 0.05 * s], seg: 8 }));
    rig.add('cabeca', blob([0.07, 0.022, 0.05], m.sombra(0), { pos: [0.17, 0.1, 0.105 * s], rot: [-20 * s, 0, -24], seg: 8 }));
    // membrana clara entre os dedos
    rig.add('canela_f' + l, blob([0.1, 0.02, 0.1], m(2), { pos: [0.07, -0.09, 0], seg: 10 }));
  });
  // guarda de ginga: a mão da frente erguida
  rig.bones.perna_fe.rotation.z = 62 * D2R; rig.bones.canela_fe.rotation.z = 30 * D2R;
  // crista de pelo molhado e remo largo com espirros
  rig.bone('crista', 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.03, 0], [0, 0, 24]);
  rig.add('crista', tufo(3, 0.11, 0.05, m(0), { abre: 28 }));
  rig.add('cauda4', blob([0.17, 0.035, 0.12], m(2), { pos: [-0.12, 0, 0], seg: 14 }));
  rig.bone('espirro1', 'cauda4', [-0.24, 0.08, 0.06]); rig.add('espirro1', espuma(0.06, m.luz(3)));
  rig.bone('espirro2', 'cauda4', [-0.14, 0.15, -0.08]); rig.add('espirro2', blob([0.04, 0.05, 0.04], m(3), { seg: 8 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.85, hPerna: 0.14, mole: 0.9, cauda: 0.6 }, {
  idle: { crista: lz([0, 4, 8, 2]), espirro1: ls([1, 1.3, 0.6, 0.9]), espirro2: ls([0.6, 1, 1.4, 0.8]), perna_fe: lz([0, 4, 8, 3]) },
  fisico: { perna_fe: qz([10, 24, -70, -30, 0]), canela_fe: qz([10, 20, -30, -10, 0]) },
  especial: { crista: qz([0, 12, 18, -22, -8, 0]) },
});

export const ariranhao = criatura({
  num: 74, id: 'ariranhao', nome: 'Ariranhão', porte: 'G', estagio: 'final', paleta: paletaAriranha, build, anims,
  olho: { frente: ['pp...', 'wwww.', '.wppw', '.wpww', '..pp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['w', 'p'] },
});
