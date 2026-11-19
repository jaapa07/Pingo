/**
 * 096 · QUATIZÃO (Comum/Ginga) — quati macho de rabo anelado sempre erguido, brigão do bando. Estágio final.
 * Mantém da linha: pelo ruivo, focinho arrebitado escuro, máscara de pintas creme, rabo de anéis em pé, o vermelho.
 * Cresce: rabão grosso mais alto que o corpo · faixas vermelhas de ginga nas munhecas e na testa (pontas voando) ·
 * garras compridas de cavar · peitoral creme · caninos · pata da frente erguida em guarda.
 */
import { criatura, animsQuadrupede, blob, garra, pena, par, m, lz, qz, D2R } from './kits';
import { paletaQuati, corpoQuati } from './095-quatinho';

function build() {
  const { rig, ref } = corpoQuati({ k: 1.35, cabeca: [0.2, 0.17, 0.175], rabo: 1.0, r: 0.075 });
  par((l, s) => {
    rig.add('canela_f' + l, blob([0.07, 0.04, 0.07], m(3), { pos: [0, -0.02, 0], seg: 10 }));
    for (const z of [-0.035, 0, 0.035]) rig.add('canela_f' + l, garra(0.08, 0.02, m.luz(1), { pos: [0.11, -0.1, z], curva: 0.5 }));
    rig.add('cabeca', blob([0.016, 0.04, 0.016], m.luz(1), { pos: [ref.pontaFocinho[0] - 0.08, ref.pontaFocinho[1] - 0.07, 0.035 * s], seg: 6 }));
    rig.add('cabeca', blob([0.07, 0.02, 0.05], m.sombra(0), { pos: [0.17, 0.11, 0.1 * s], rot: [-20 * s, 0, -24], seg: 8 }));
  });
  // faixa na testa com as pontas voando para trás
  rig.add('cabeca', blob([0.2, 0.03, 0.18], m(3), { pos: [0.04, 0.1, 0], rot: [0, 0, 8], seg: 14 }));
  rig.bone('faixa', 'cabeca', [-0.14, 0.11, 0.06], [0, 0, 20]);
  rig.add('faixa', pena(0.2, 0.05, m(3), { esp: 0.025 }), pena(0.15, 0.045, m.sombra(3), { esp: 0.025, rot: [0, 0, -30] }));
  // peitoral creme e guarda
  rig.add('corpo', blob([0.1, 0.13, 0.15], m(1), { pos: [0.3, -0.04, 0], seg: 12 }));
  rig.bones.perna_fe.rotation.z = 56 * D2R; rig.bones.canela_fe.rotation.z = 34 * D2R;
  return rig;
}

const anims = animsQuadrupede({ u: 0.9, hPerna: 0.2, mole: 0.9, cauda: 0.3 }, {
  idle: { faixa: lz([0, 8, 16, 6]), perna_fe: lz([0, 4, 8, 3]), cauda3: lz([0, 3, 6, 2]) },
  fisico: { perna_fe: qz([10, 24, -66, -30, 0]), canela_fe: qz([10, 20, -34, -10, 0]), faixa: qz([10, 20, -40, -14, 0]) },
  dano: { faixa: qz([-30, -10, 0]) },
});

export const quatizao = criatura({
  num: 96, id: 'quatizao', nome: 'Quatizão', porte: 'G', estagio: 'final', paleta: paletaQuati, build, anims,
  olho: { frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
