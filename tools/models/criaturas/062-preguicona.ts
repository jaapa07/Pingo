/**
 * 062 · PREGUIÇONA (Comum/Mente) — preguiça adulta com musgo e flores no pelo. Estágio final.
 * Mantém da linha: máscara em faixa, espiral lilás na testa, garras-gancho claras, topete.
 * Cresce: braço erguido num aceno lento · manto de musgo nas costas com três flores lilases ·
 * franjas de pelo comprido pendendo dos braços · flor atrás da orelha.
 */
import { criatura, animsArboricola, unirExtras, blob, calota, tufo, folha3d, par, m, lz, qz, D2R, type Rig, type V3 } from './kits';
import { paletaPreguica, corpoPreguica, sonha, bracosCurtos } from './061-preguicim';

/** Flor de 5 pétalas com miolo creme, deitada no plano XZ (abre para +Y). */
function flor(rig: Rig, osso: string, r: number) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    rig.add(osso, blob([r * 0.6, r * 0.3, r * 0.6], m(3), { pos: [Math.cos(a) * r * 0.7, 0, Math.sin(a) * r * 0.7], seg: 10 }));
  }
  rig.add(osso, blob([r * 0.42, r * 0.42, r * 0.42], m.luz(1), { pos: [0, r * 0.12, 0], seg: 10 }));
}

function build() {
  const { rig, ref } = corpoPreguica({ k: 1.3, cabeca: [0.27, 0.24, 0.27], bracos: 0.98, garras: 3, curva: 12 });
  // braço da frente erguido num aceno lento
  rig.bones.braco_e.rotation.z = 118 * D2R; rig.bones.antebraco_e.rotation.z = 34 * D2R; rig.bones.braco_e.rotation.x = 14 * D2R;
  // topete e franjas compridas nos braços
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.04, 0], [0, 0, 14]);
  rig.add('topete', tufo(4, 0.2, 0.085, m(0), { abre: 44 }));
  par((l) => {
    rig.bone('franja_' + l, 'braco_' + l, [0.03, -0.18, 0], [0, 0, 180]);
    rig.add('franja_' + l, tufo(3, 0.2, 0.07, m.sombra(0), { abre: 30 }));
  });
  // manto de musgo nas costas + borda de folhas
  rig.add('tronco', calota([0.275, 0.33, 0.29], m(2), { de: 0, ate: 80, rot: [0, 0, 84] }));
  for (const [y, z, g] of [[-0.12, 0.2, 150], [-0.12, -0.2, 150], [0.26, 0, 20]] as const)
    rig.add('tronco', folha3d(0.2, 0.16, m.luz(2), { pos: [-0.2, y, z], rot: [0, 0, g + 60], esp: 0.5 }));
  // três flores no manto e uma atrás da orelha
  const flores: [string, string, V3, V3, number][] = [
    ['flor1', 'tronco', [-0.27, 0.12, 0.08], [0, 0, 80], 0.085],
    ['flor2', 'tronco', [-0.2, -0.06, -0.17], [-50, 0, 70], 0.07],
    ['flor3', 'tronco', [-0.16, 0.27, -0.06], [-10, 0, 40], 0.065],
    ['flor4', 'cabeca', [-0.02, 0.2, -0.2], [-52, 0, 10], 0.085],
  ];
  for (const [nome, pai, pos, rot, r] of flores) { rig.bone(nome, pai, pos, rot); flor(rig, nome, r); }
  sonha(rig);
  return rig;
}

const anims = animsArboricola({ u: 1.0, hPerna: 0.17, mole: 0.9 }, unirExtras(bracosCurtos, {
  idle: { topete: lz([0, 4, 7, 2]), braco_e: lz([0, 5, 9, 4]), antebraco_e: lz([0, -8, -14, -6]), franja_e: lz([0, -6, -10, -4]) },
  fisico: { braco_e: qz([10, 24, -70, -30, 0]), antebraco_e: qz([10, 20, -30, -10, 0]) },
  especial: { topete: qz([0, 12, 16, -22, -8, 0]), braco_e: qz([0, 6, 8, -14, -6, 0]), flor1: qz([0, 6, 8, -12, -4, 0]) },
  desmaio: { braco_e: qz([0, -20, -60, -110, -108]) },
  andar: { topete: lz([0, 8, 0, -8]), braco_e: lz([0, 6, 0, -6]) },
}));

export const preguicona = criatura({
  num: 62, id: 'preguicona', nome: 'Preguiçona', porte: 'M', estagio: 'final', paleta: paletaPreguica, build, anims,
  olho: {
    frente: ['.ppp.', 'ppwpp', 'ppppp', 'pwppp', '.ppp.'],
    fechado: ['.....', '.....', 'p...p', '.ppp.', '.....'],
    mapa: ['p', 'p'],
  },
});
void qz;
