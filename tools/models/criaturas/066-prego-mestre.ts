/**
 * 066 · PREGO-MESTRE (Ginga/Ferro) — macaco-prego com martelo de pedra-ferro. Estágio final.
 * Mantém da linha: boné escuro de dois tufos, rosto e ombros creme, cauda enrolada, a pedra (agora martelo).
 * Cresce: martelo de cabo de galho e cabeça de pedra-ferro apoiado no ombro · braçadeiras e cinto de ferro ·
 * faixa de mestre na testa com pontas soltas · postura mais ereta · bigorna-coquinho rachado aos pés.
 */
import { criatura, animsArboricola, unirExtras, blob, roundBox, segmento, listra, ring, pena, par, m, lz, qz, D2R } from './kits';
import { bracosCurtos } from './061-preguicim';
import { paletaPrego, corpoPrego } from './065-preguinho';

function build() {
  const { rig } = corpoPrego({ k: 1.3, cabeca: [0.25, 0.23, 0.24], bracos: 0.86, curva: 14, tufos: 0.17 });
  // braço da frente ergue o martelo
  rig.bones.braco_e.rotation.z = 70 * D2R; rig.bones.antebraco_e.rotation.z = 70 * D2R;
  rig.bone('martelo', 'antebraco_e', [0.26, -0.36, -0.03], [0, 0, -100]);
  rig.add('martelo',
    segmento([0, -0.14, 0], [0, 0.34, 0], 0.04, 0.035, m(0)),
    roundBox([0.36, 0.22, 0.22], 0.05, m(3), { pos: [0, 0.4, 0] }),
    roundBox([0.07, 0.25, 0.25], 0.03, m.sombra(3), { pos: [0.11, 0.4, 0] }),
    roundBox([0.07, 0.25, 0.25], 0.03, m.sombra(3), { pos: [-0.11, 0.4, 0] }),
    blob([0.05, 0.05, 0.05], m.luz(3), { pos: [-0.17, 0.45, -0.08], seg: 8 }));
  // braçadeiras e cinto de ferro
  par((l) => {
    rig.add('antebraco_' + l, listra(0.075, 0.035, m(3), { pos: [0.17, -0.22, 0], rot: [90, 0, 38] }));
    rig.add('canela_' + l, listra(0.08, 0.03, m(3), { pos: [-0.02, -0.06, 0] }));
  });
  rig.add('tronco', ring(0.27, 0.045, m(3), { pos: [0, -0.14, 0], rot: [90, 0, 0] }), blob([0.05, 0.06, 0.06], m.luz(3), { pos: [0.27, -0.14, 0], seg: 10 }));
  // faixa de mestre na testa com duas pontas ao vento
  rig.add('cabeca', ring(0.245, 0.035, m.plano(3), { pos: [0, 0.07, 0], rot: [90, 0, 12] }));
  rig.bone('faixa', 'cabeca', [-0.24, 0.04, 0], [0, 0, 24]);
  rig.add('faixa', pena(0.26, 0.08, m(3), { esp: 0.03, rot: [0, 0, -10] }), pena(0.2, 0.07, m.luz(3), { esp: 0.03, rot: [0, 0, 22] }));
  // coquinho rachado aos pés
  rig.add('base', blob([0.09, 0.075, 0.09], m.sombra(0), { pos: [0.5, 0.07, 0.22] }), blob([0.05, 0.03, 0.05], m.luz(1), { pos: [0.5, 0.12, 0.2], seg: 8 }));
  return rig;
}

const anims = animsArboricola({ u: 1.1, hPerna: 0.2, mole: 0.8, caudaSegs: 2 }, unirExtras(bracosCurtos, {
  idle: { faixa: lz([0, 8, 14, 5]), braco_e: lz([0, 3, 6, 2]), martelo: lz([0, -3, -6, -2]) },
  fisico: { braco_e: qz([16, 34, -76, -40, 0]), antebraco_e: qz([10, 24, -40, -16, 0]), martelo: qz([10, 24, -30, -10, 0]), faixa: qz([10, 20, -24, -8, 0]) },
  especial: { braco_e: qz([0, 10, 18, -50, -20, 0]), martelo: qz([0, 10, 16, -40, -14, 0]), faixa: qz([0, 10, 14, -26, -10, 0]) },
  desmaio: { braco_e: qz([0, -20, -60, -100, -98]) },
  andar: { faixa: lz([0, 10, 0, 10]), braco_e: lz([0, 5, 0, -5]) },
}));

export const pregoMestre = criatura({
  num: 66, id: 'prego-mestre', nome: 'Prego-Mestre', porte: 'M', estagio: 'final', paleta: paletaPrego, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
void qz;
