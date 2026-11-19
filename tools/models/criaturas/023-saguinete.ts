/**
 * 023 · SAGUINETE (Comum/Ginga) — sagui acrobata, ginga de capoeira e pirueta no cipó. Estágio final.
 * Mantém da linha: cara escura com estrela, leques brancos nas orelhas, rabo de anéis, âmbar.
 * Cresce: leques ainda maiores · rabo em "S" erguido acima da cabeça com pincel branco · cordão âmbar
 * amarrado na cintura com as pontas voando · munhequeiras âmbar · braço erguido em guarda de ginga.
 */
import { criatura, animsArboricola, unirExtras, blob, tufo, ring, pena, par, m, lz, qz, qr, D2R } from './kits';
import { bracosCurtos } from './061-preguicim';
import { paletaSagui, corpoSagui } from './022-saguinho';

function build() {
  const { rig } = corpoSagui({ k: 1.12, cabeca: [0.21, 0.195, 0.21], bracos: 0.66, curva: 12, tufo: 0.22, rabo: 1.25, caudaAng: 64, caudaCurva: -22 });
  // rabo em S: a ponta volta para a frente e termina em pincel branco
  rig.bones.cauda4.rotation.z = 60 * D2R; rig.bones.cauda5.rotation.z = 50 * D2R;
  rig.add('cauda5', tufo(3, 0.13, 0.055, m(1), { pos: [-0.25, 0, 0], rot: [0, 0, 90], abre: 30 }));
  // peito claro de adulto e topete
  rig.add('tronco', blob([0.1, 0.13, 0.13], m.luz(0), { pos: [0.1, 0.06, 0], seg: 14 }));
  rig.add('cabeca', tufo(3, 0.1, 0.05, m(2), { pos: [-0.04, 0.17, 0], rot: [0, 0, 24], abre: 26 }));
  // cordão de ginga na cintura, com nó e duas pontas voando para trás
  rig.add('tronco', ring(0.165, 0.03, m(3), { pos: [0, -0.1, 0], rot: [90, 0, 0], scale: [1.05, 1.1, 1] }));
  rig.bone('cordao', 'tronco', [-0.14, -0.1, 0.1], [0, 0, 24]);
  rig.add('cordao', blob([0.04, 0.04, 0.04], m.luz(3), { seg: 8 }), pena(0.24, 0.06, m(3), { esp: 0.03, rot: [0, 0, 0] }), pena(0.18, 0.055, m.sombra(3), { esp: 0.03, rot: [0, 0, -34] }));
  par((l, s) => {
    // munhequeiras
    rig.add('antebraco_' + l, blob([0.06, 0.035, 0.06], m(3), { pos: [0.15 * (0.9), -0.2, -0.02 * s], seg: 10 }));
    void s;
  });
  // guarda de ginga: braço da frente erguido, o de trás aberto
  rig.bones.braco_e.rotation.z = 78 * D2R; rig.bones.antebraco_e.rotation.z = 60 * D2R;
  rig.bones.braco_d.rotation.z = -26 * D2R;
  return rig;
}

const anims = animsArboricola({ u: 0.95, hPerna: 0.16, mole: 1.1, caudaSegs: 2 }, unirExtras(bracosCurtos, {
  idle: { leque_d: lz([0, 3, 7, 2]), leque_e: lz([0, 3, 7, 2]), cordao: lz([0, 8, 16, 6]), braco_e: lz([0, -5, -10, -4]), braco_d: lz([0, 5, 10, 4]), tronco: lr4([0, 2, 4, 1]) },
  // meia-lua: gira o tronco e desce o braço
  fisico: { braco_e: qz([10, 24, -80, -36, 0]), antebraco_e: qz([10, 20, -40, -14, 0]), tronco: qr([[0, 0, 6], [0, -14, 10], [0, 20, -16], [0, 8, -6], [0, 0, 0]]), cordao: qz([10, 20, -40, -14, 0]) },
  especial: { leque_d: qz([0, 14, 20, -24, -8, 0]), leque_e: qz([0, 14, 20, -24, -8, 0]), cordao: qz([0, 14, 22, -40, -14, 0]), cauda4: qz([0, 10, 16, -30, -10, 0]) },
  dano: { leque_d: qz([24, 8, 0]), leque_e: qz([24, 8, 0]), cordao: qz([-30, -10, 0]) },
  desmaio: { braco_e: qz([0, -30, -70, -110, -106]) },
}));
function lr4(v: number[]) { return lz(v); }

export const saguinete = criatura({
  num: 23, id: 'saguinete', nome: 'Saguinete', porte: 'M', estagio: 'final', paleta: paletaSagui, build, anims,
  olho: {
    frente: ['aa...', 'aaaa.', '.awpa', '.appa', '..aa.'],
    fechado: ['fffff', 'fffff', 'afffa', 'faaaf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
