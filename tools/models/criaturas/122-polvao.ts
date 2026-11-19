/**
 * 122 · POLVÃO (Rio/Mente) — polvo que pinta no corpo o padrão que o adversário mais teme. Estágio final.
 * Mantém da linha: pele coral, ventosas creme, violeta da mente, manto caído para trás, pontas enroladas.
 * Cresce: manto alto com FAIXAS mutantes turquesa e dois OCELOS hipnóticos (falsos olhos) · dois braços erguidos
 * em espiral · chifres de pele sobre os olhos · terceiro olho maior com aro · braços longos de ventosas à mostra.
 */
import { criatura, blob, calota, ring, spike, par, m, ls, qs, lz, type V3 } from './kits';
import { paletaPolvo, polvo, animsPolvo } from './121-polvinho';

const paleta = { ...paletaPolvo, rampas: [['#6c2452', '#cc4c68', '#ff9c8c'], paletaPolvo.rampas[1], paletaPolvo.rampas[2], paletaPolvo.rampas[3]] as [string, string, string][], extras: { ...paletaPolvo.extras, f: '#cc4c68' } };
const ERG = [7, 4];

function build() {
  const rig = polvo({ manto: [0.3, 0.3, 0.28], cabeca: [0.26, 0.19, 0.26], alt: 0.24, braco: { l1: 0.26, l2: 0.24, r: 0.085 }, erguidos: ERG, olho: 0.036 });
  // FAIXAS mutantes: cintas turquesa atravessando o manto
  for (const [de, ate] of [[24, 40], [58, 74]] as const) rig.add('manto', calota([0.318, 0.318, 0.297], m(3), { de, ate, pos: [-0.03, 0.21, 0], rot: [0, 0, -16] }));
  rig.add('manto', calota([0.318, 0.318, 0.297], m.luz(3), { de: 0, ate: 10, pos: [-0.03, 0.21, 0], rot: [0, 0, -16] }));
  // OCELOS hipnóticos nos flancos do manto: aro violeta, disco creme e pupila
  par((l, s) => {
    rig.bone('ocelo_' + l, 'manto', [0.04, 0.2, 0.27 * s], [0, 0, 0]);
    rig.add('ocelo_' + l, blob([0.1, 0.1, 0.035], m.plano(2), { seg: 14, castShadow: false }), blob([0.07, 0.07, 0.04], m.luz(1), { pos: [0, 0, 0.012 * s], seg: 12, castShadow: false }), blob([0.035, 0.045, 0.04], m.sombra(2), { pos: [0.005, 0, 0.026 * s], seg: 10, castShadow: false }));
    // chifres de pele sobre os olhos
    rig.add('cabeca', spike(0.16, 0.05, m(0), { pos: [0.15, 0.14, 0.15 * s], rot: [10 * s, 0, -14] }), blob([0.04, 0.04, 0.04], m.luz(0), { pos: [0.19, 0.3, 0.17 * s], seg: 8 }));
  });
  // terceiro olho com aro
  rig.bone('gema', 'cabeca', [0.22, 0.14, 0]);
  rig.add('gema', blob([0.06, 0.08, 0.07], m.plano(2), { seg: 12 }), blob([0.03, 0.04, 0.035], m.luz(2), { pos: [0.035, 0.02, -0.02], seg: 8 }), ring(0.085, 0.022, m.sombra(0), { rot: [0, 90, 0], pos: [-0.01, 0, 0] }));
  // ventosas creme à mostra nos braços erguidos (bolinhas na face interna)
  for (const i of ERG) for (const x of [0.06, 0.14, 0.21]) rig.add(`t${i + 1}b`, blob([0.03, 0.03, 0.03], m.luz(1), { pos: [x, 0.07, 0], seg: 8, castShadow: false }));
  // pintas escuras salpicadas no alto da cabeça
  const pintas: V3[] = [[0.0, 0.18, 0.12], [-0.1, 0.17, -0.1], [0.08, 0.17, -0.12]];
  for (const pos of pintas) rig.add('cabeca', blob([0.035, 0.02, 0.035], m.sombra(0), { pos, seg: 8, castShadow: false }));
  return rig;
}

const anims = animsPolvo({ u: 0.85, alt: 0.24, erguidos: ERG, mole: 1.1 }, {
  idle: { gema: ls([1, 1.15, 1.3, 1.1]), ocelo_d: ls([1, 1.08, 1.16, 1.06]), ocelo_e: ls([1.16, 1.06, 1, 1.08]), t8b: lz([0, 14, 24, 8]), t5b: lz([24, 8, 0, 14]) },
  especial: { gema: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), ocelo_d: qs([1, 1.2, 1.4, 1.8, 1.3, 1]), ocelo_e: qs([1, 1.2, 1.4, 1.8, 1.3, 1]) },
});

export const polvao = criatura({
  num: 122, id: 'polvao', nome: 'Polvão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', 'ppppp', '.aapp', '.appp', '..pp.'],
    fechado: ['fffff', 'fffff', 'ppppp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
