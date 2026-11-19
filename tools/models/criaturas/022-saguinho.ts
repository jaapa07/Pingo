/**
 * 022 · SAGUINHO (Comum) — sagui-de-tufo-branco que rói casca de árvore para lamber a goma.
 * Traços únicos: leques brancos enormes nas orelhas · estrela branca na testa sobre a cara escura ·
 * rabo comprido de anéis · gota de goma âmbar na mão.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, tufo, par, m, lz, qz, D2R, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';

export const paletaSagui = {
  rampas: [
    ['#463a4e', '#8a7a78', '#cbbda4'], // 0 pelo cinza-pardo rajado
    ['#a7a2b8', '#f1eee8', '#ffffff'], // 1 branco dos tufos e da estrela
    ['#221a2a', '#44333f', '#6c5660'], // 2 cara, mãos e anéis escuros
    ['#a8582a', '#ea9c38', '#ffdc7a'], // 3 goma âmbar · cordão do acrobata
  ] as [string, string, string][],
  contorno: '#20172a',
  extras: { w: '#ffffff', p: '#17101e', f: '#44333f', a: '#ea9c38' },
};

export interface SaguiP { k: number; cabeca: V3; bracos: number; curva: number; tufo: number; rabo: number; caudaAng: number; caudaCurva: number }

/** Corpo comum da linha: cara escura com estrela, leques brancos, rabo de anéis. */
export function corpoSagui(p: SaguiP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.15 * k, 0.2 * k, 0.16 * k], curva: p.curva,
    pernas: { alt: 0.14 * k, r: 0.055 * k, pe: 0.08 * k },
    bracos: { len: p.bracos, r: 0.048 * k, mao: 0.052 * k },
    cabeca: p.cabeca, rosto: 0.62, focinho: { len: cx * 0.26, r: cy * 0.26 },
    cauda: { segs: 5, len: p.rabo, r0: 0.05 * k, r1: 0.04 * k, ang: p.caudaAng, curva: p.caudaCurva },
    olho: { r: 0.026, pos: [cx * 0.88, cy * 0.14, cz * 0.42] },
    rampas: { pelo: 0, barriga: 0, rosto: 2, maos: 2, cauda: 0 },
  });
  const rig = kit.rig;
  // estrela branca na testa e focinho mais claro
  rig.add('cabeca', blob([cx * 0.16, cy * 0.26, cz * 0.24], m.plano(1), { pos: [cx * 0.9, cy * 0.5, 0], rot: [0, 0, 20], seg: 10 }));
  rig.add('cabeca', blob([cx * 0.12, cy * 0.1, cz * 0.2], m.luz(2), { pos: [cx * 1.08, -cy * 0.32, 0], seg: 8 }));
  // LEQUES das orelhas (ossos próprios)
  par((l, s) => {
    rig.bone('leque_' + l, 'cabeca', [-cx * 0.08, cy * 0.18, cz * 0.86 * s], [62 * s, 0, 6]);
    rig.add('leque_' + l, tufo(4, p.tufo, p.tufo * 0.36, m(1), { abre: 46 }));
  });
  // anéis escuros no rabo e riscas no lombo
  const sl = p.rabo / 5;
  for (let i = 1; i <= 5; i++) {
    const r = (0.05 - (0.01 * i) / 5) * k * 1.12;
    rig.add('cauda' + i, blob([sl * 0.2, r, r], m(2), { pos: [-sl * 0.3, 0, 0], seg: 10 }), blob([sl * 0.2, r, r], m(2), { pos: [-sl * 0.8, 0, 0], seg: 10 }));
  }
  for (const y of [0.06, -0.06]) rig.add('tronco', blob([0.05 * k, 0.03 * k, 0.15 * k], m.sombra(0), { pos: [-0.12 * k, y * k, 0], seg: 10 }));
  return kit;
}

function build() {
  const { rig } = corpoSagui({ k: 0.95, cabeca: [0.2, 0.185, 0.2], bracos: 0.5, curva: 22, tufo: 0.17, rabo: 0.9, caudaAng: 40, caudaCurva: 26 });
  // gota de goma âmbar erguida na mão da frente
  rig.bones.braco_e.rotation.z = 46 * D2R; rig.bones.antebraco_e.rotation.z = 44 * D2R;
  rig.bone('goma', 'antebraco_e', [0.17, -0.22, -0.02]);
  rig.add('goma', blob([0.07, 0.085, 0.07], m(3), { rot: [0, 0, 10] }), blob([0.025, 0.03, 0.025], m.luz(3), { pos: [0.025, 0.03, -0.04], seg: 8 }));
  return rig;
}

const anims = animsArboricola({ u: 0.7, hPerna: 0.13, mole: 1.3, caudaSegs: 2 }, unirExtras(bracosCurtos, {
  idle: { leque_d: lz([0, 3, 7, 2]), leque_e: lz([0, 3, 7, 2]), braco_e: lz([0, 4, 8, 3]), goma: lz([0, 6, 10, 4]) },
  fisico: { braco_e: qz([12, 26, -64, -30, 0]), antebraco_e: qz([10, 20, -30, -10, 0]) },
  especial: { leque_d: qz([0, 14, 20, -24, -8, 0]), leque_e: qz([0, 14, 20, -24, -8, 0]), braco_e: qz([0, 10, 16, -40, -14, 0]) },
  dano: { leque_d: qz([24, 8, 0]), leque_e: qz([24, 8, 0]) },
  desmaio: { braco_e: qz([0, -20, -50, -80, -78]) },
  andar: { braco_e: lz([0, 6, 0, -6]) },
}));

export const saguinho = criatura({
  num: 22, id: 'saguinho', nome: 'Saguinho', porte: 'P', estagio: 'basico', paleta: paletaSagui, build, anims,
  olho: {
    frente: ['.aa.', 'apwa', 'appa', '.aa.'],
    fechado: ['ffff', 'afff', 'faaf', 'ffff'],
    mapa: ['a', 'p'],
  },
});
