/**
 * 068 · LEÃO-DOURADO (Brasa/Ginga) — mico-leão de juba flamejante. Estágio final (Pedra Solar).
 * Mantém da linha: pelo dourado, rosto escuro, juba em coroa, cauda comprida de pincel aceso.
 * Cresce: a juba vira nove labaredas de miolo claro · punhos em guarda de lutador envoltos em brasa ·
 * peitoral dourado claro · tornozeleiras de chama · sobrancelha brava.
 */
import { criatura, animsArboricola, unirExtras, blob, chama, chamaDupla, par, m, lz, qz, D2R, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';
import { tremula } from './004-guaraxim';
import { paletaMico, corpoMico, juba } from './067-mico-leaozim';

function build() {
  const cab: V3 = [0.23, 0.22, 0.23];
  const { rig } = corpoMico({ k: 1.3, cabeca: cab, bracos: 0.78, curva: 10, cauda: 0.85, caudaAng: 96 });
  juba(rig, cab, 9, (i, len) => ({ osso: 'chama' + (i + 1), pecas: chamaDupla(len, 0.11, m.sombra(2), m.plano(2), { curva: 10 }) }), 0.34);
  rig.add('cabeca', blob([0.17, 0.215, 0.235], m(0), { pos: [-0.11, 0, 0] }));
  // guarda de lutador: os dois punhos erguidos, envoltos em brasa
  rig.bones.braco_e.rotation.z = 70 * D2R; rig.bones.antebraco_e.rotation.z = 80 * D2R;
  rig.bones.braco_d.rotation.z = 40 * D2R; rig.bones.antebraco_d.rotation.z = 96 * D2R;
  par((l, s) => {
    rig.add('antebraco_' + l, blob([0.1, 0.095, 0.1], m.plano(2), { pos: [0.24, -0.3, -0.03 * s], seg: 12 }));
    rig.bone('punho_' + l, 'antebraco_' + l, [0.24, -0.3, -0.03 * s], [0, 0, 200]);
    rig.add('punho_' + l, chama(0.2, 0.085, m.luz(2)));
    // tornozeleiras de chama
    rig.bone('pe_' + l, 'canela_' + l, [-0.04, -0.06, 0], [0, 0, 60]);
    rig.add('pe_' + l, ...chamaDupla(0.2, 0.075, m.plano(2), m.luz(2), { curva: 16 }));
  });
  rig.add('tronco', blob([0.13, 0.17, 0.2], m.luz(3), { pos: [0.12, 0.08, 0] }));
  // cauda-tocha
  rig.bone('chama10', 'cauda4', [-0.22, 0, 0], [0, 0, 80]);
  rig.add('chama10', ...chamaDupla(0.36, 0.13, m.sombra(2), m.luz(2), { curva: 18 }));
  return rig;
}

const anims = animsArboricola({ u: 1.1, hPerna: 0.2, mole: 0.8, caudaSegs: 3 }, unirExtras(bracosCurtos, {
  todas: tremula(['chama1', 'chama2', 'chama3', 'chama4', 'chama5', 'chama6', 'chama7', 'chama8', 'chama9', 'chama10', 'punho_d', 'punho_e', 'pe_d', 'pe_e']),
  idle: { braco_e: lz([0, 4, 7, 3]), braco_d: lz([0, -3, -6, -2]) },
  fisico: { braco_e: qz([-10, -24, 40, 20, 0]), antebraco_e: qz([10, 24, -70, -30, 0]) },
  desmaio: { braco_e: qz([0, -20, -50, -80, -78]), braco_d: qz([0, -10, -30, -50, -48]) },
}));

export const leaoDourado = criatura({
  num: 68, id: 'leao-dourado', nome: 'Leão-Dourado', porte: 'M', estagio: 'final', paleta: paletaMico, build, anims,
  olho: {
    frente: ['pp...', 'aaww.', '.awpp', '.wwpp', '..ww.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
void qz;
