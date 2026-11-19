/**
 * 065 · PREGUINHO (Ginga) — macaco-prego que usa pedras para quebrar coquinhos.
 * Traços únicos: boné escuro com dois tufos em "chifrinho" · rosto e peito creme ·
 * pedra redonda erguida na mão · cauda enrolada para a frente com ponta escura.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, calota, tufo, par, m, lz, qz, D2R, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';

export const paletaPrego = {
  rampas: [
    ['#4c2f40', '#94603c', '#cc9654'], // 0 pelo castanho
    ['#b99478', '#f2dab0', '#fff7e2'], // 1 creme do rosto, peito e ombros
    ['#241a2a', '#46323f', '#6e5060'], // 2 boné, mãos, pés e ponta da cauda
    ['#4f5876', '#939db2', '#e2e9f0'], // 3 pedra e ferro
  ] as [string, string, string][],
  contorno: '#231727',
  extras: { w: '#ffffff', p: '#231727', f: '#f2dab0' },
};

export interface PregoP { k: number; cabeca: V3; bracos: number; curva: number; tufos: number }

/** Corpo comum da linha: boné escuro de tufos, rosto creme, ombros claros, cauda enrolada. */
export function corpoPrego(p: PregoP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.18 * k, 0.22 * k, 0.19 * k], curva: p.curva,
    pernas: { alt: 0.16 * k, r: 0.065 * k, pe: 0.095 * k },
    bracos: { len: p.bracos, r: 0.058 * k, mao: 0.062 * k },
    cabeca: p.cabeca, rosto: 0.7, focinho: { len: cx * 0.3, r: cy * 0.3 },
    orelha: { r: cy * 0.26, z: 0.95, y: 0 },
    cauda: { segs: 4, len: 0.95 * k, r0: 0.05 * k, r1: 0.042 * k, ang: 24, curva: 48 },
    olho: { r: 0.028, pos: [cx * 0.86, cy * 0.12, cz * 0.42] },
    rampas: { pelo: 0, barriga: 1, rosto: 1, maos: 2, orelha: 1, cauda: 0, caudaPonta: 2 },
  });
  const rig = kit.rig;
  // boné escuro com bico na testa e dois tufos
  rig.add('cabeca', calota([cx * 1.07, cy * 1.07, cz * 1.07], m(2), { de: 0, ate: 58, rot: [0, 0, 14] }),
    blob([cx * 0.2, cy * 0.26, cz * 0.22], m(2), { pos: [cx * 0.8, cy * 0.6, 0], seg: 10 }));
  par((l, s) => {
    rig.bone('tufo_' + l, 'cabeca', [0, cy * 0.8, cz * 0.55 * s], [26 * s, 0, 10]);
    rig.add('tufo_' + l, tufo(2, p.tufos, p.tufos * 0.42, m(2), { abre: 16 }));
    // ombros claros
    rig.add('braco_' + l, blob([0.085 * k, 0.1 * k, 0.075 * k], m(1), { pos: [0, -0.01, 0.01 * s], seg: 12 }));
  });
  // nariz e sorriso
  rig.add('cabeca', blob([cx * 0.1, cy * 0.09, cz * 0.14], m.plano(2), { pos: [cx * 1.12, -cy * 0.2, 0], seg: 8 }));
  return kit;
}

function build() {
  const { rig } = corpoPrego({ k: 0.95, cabeca: [0.21, 0.19, 0.2], bracos: 0.58, curva: 24, tufos: 0.11 });
  // pedra erguida na mão da frente
  rig.bones.braco_e.rotation.z = 50 * D2R; rig.bones.antebraco_e.rotation.z = 50 * D2R;
  rig.bone('pedra', 'antebraco_e', [0.2, -0.26, -0.02]);
  rig.add('pedra', blob([0.105, 0.09, 0.1], m(3), { rot: [0, 0, 20] }), blob([0.04, 0.03, 0.04], m.sombra(3), { pos: [0.04, -0.03, -0.07], seg: 8 }));
  return rig;
}

const anims = animsArboricola({ u: 0.75, hPerna: 0.15, mole: 1.2, caudaSegs: 2 }, unirExtras(bracosCurtos, {
  idle: { tufo_d: lz([0, 4, 8, 2]), tufo_e: lz([0, 4, 8, 2]), braco_e: lz([0, 4, 8, 3]) },
  fisico: { braco_e: qz([14, 30, -70, -34, 0]), antebraco_e: qz([10, 20, -30, -10, 0]) },
  especial: { braco_e: qz([0, 10, 16, -40, -14, 0]), antebraco_e: qz([0, 8, 10, -20, -8, 0]) },
  desmaio: { braco_e: qz([0, -20, -50, -80, -78]) },
  andar: { braco_e: lz([0, 6, 0, -6]) },
}));

export const preguinho = criatura({
  num: 65, id: 'preguinho', nome: 'Preguinho', porte: 'P', estagio: 'basico', paleta: paletaPrego, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
void qz;
