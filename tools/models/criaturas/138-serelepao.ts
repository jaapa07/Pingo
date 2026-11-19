/**
 * 138 · SERELEPÃO (Geada/Mata) — serelepe guardião das araucárias. Estágio final.
 * Mantém da linha: pelo ruivo, barriga creme, bochechas, pincéis nas orelhas, caudão erguido.
 * Cresce: a cauda vira uma ARAUCÁRIA (tronco felpudo + copa em taça de grimpas verdes nevadas) ·
 * pinha gigante carregada como escudo · gola de grimpas no pescoço · sobrancelha de geada de vigia.
 */
import { criatura, bipede, animsBipede, blob, calota, tufo, spike, par, m, lz, qz, D2R } from './kits';
import { paletaSerelepe } from './137-serelepim';

const paleta = { ...paletaSerelepe, rampas: [paletaSerelepe.rampas[0], paletaSerelepe.rampas[1], ['#1f5a4a', '#2f8a4e', '#7cc65a'] as [string, string, string], paletaSerelepe.rampas[3]] };

function build() {
  const { rig, ref } = bipede({
    tronco: [0.2, 0.25, 0.21],
    pernas: { alt: 0.15, r: 0.085, z: 0.62, pe: [0.15, 0.05, 0.09] },
    bracos: { len: 0.36, r: 0.06, mao: 0.065, abre: 10 },
    pescoco: { len: 0.06, r: 0.12, ang: 14 },
    cabeca: [0.2, 0.175, 0.185],
    focinho: { len: 0.09, r0: 0.085, r1: 0.06, y: -0.3, nariz: 0.032 },
    orelha: { alt: 0.15, larg: 0.11, z: 0.6, abre: 18 },
    cauda: { segs: 4, len: 0.8, r0: 0.11, r1: 0.1, ang: 82, curva: 6 },
    olho: { r: 0.026, pos: [0.17, 0.125, 0.13] },
    rampas: { pelo: 0, barriga: 1, pe: 3, mao: 3, nariz: 3, cauda: 0 },
  });
  // braço da frente segura a PINHA-escudo, o outro fica de guarda
  rig.bones.braco_e.rotation.z = 50 * D2R; rig.bones.antebraco_e.rotation.z = 40 * D2R;
  rig.bones.braco_d.rotation.z = 30 * D2R; rig.bones.antebraco_d.rotation.z = 60 * D2R;
  rig.bone('pinha', 'corpo', [0.3, -0.08, -0.2]);
  rig.add('pinha', blob([0.17, 0.19, 0.17], m(2)));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) {
    const a = (j * 60 + i * 30) * D2R, y = -0.1 + i * 0.1, r = 0.17 * Math.sqrt(1 - (y / 0.19) ** 2);
    rig.add('pinha', blob([0.04, 0.035, 0.04], i === 2 ? m.luz(1) : m.luz(2), { pos: [Math.cos(a) * r, y, Math.sin(a) * r], seg: 8 }));
  }
  rig.add('pinha', calota([0.18, 0.2, 0.18], m.luz(1), { de: 0, ate: 40 }));
  // bochechas, dentes, sobrancelha de geada
  par((l, s) => {
    rig.add('cabeca', blob([0.08, 0.07, 0.06], m(1), { pos: [0.1, 0.04, 0.135 * s], seg: 14 }));
    rig.add('cabeca', blob([0.07, 0.022, 0.03], m.luz(1), { pos: [0.15, 0.195, 0.115 * s], rot: [0, 14 * s, -20], seg: 10 }));
    rig.add('orelha_' + l, tufo(2, 0.13, 0.035, m(3), { pos: [0, 0.11, 0], abre: 16 }));
  });
  rig.add('cabeca', blob([0.02, 0.03, 0.035], m.plano(1), { pos: [ref.pontaFocinho[0] - 0.005, ref.pontaFocinho[1] - 0.05, 0], seg: 8 }));
  // gola de grimpas
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7;
    rig.add('pescoco', spike(0.15, 0.045, i % 2 ? m(2) : m.luz(2), { pos: [0, -0.02, 0], rot: [100, a, 0] }));
  }
  // CAUDA-ARAUCÁRIA: copa em taça no alto (osso próprio) com geada por cima
  rig.bone('copa', 'cauda4', [-0.2, 0, 0], [0, 0, 90 - 82 - 18]);
  for (let i = 0; i < 6; i++) {
    const a = (i * 60) * D2R;
    rig.add('copa', blob([0.12, 0.06, 0.12], m(2), { pos: [Math.cos(a) * 0.2, 0.05, Math.sin(a) * 0.2], seg: 12 }),
      blob([0.07, 0.03, 0.07], m.luz(1), { pos: [Math.cos(a) * 0.21, 0.1, Math.sin(a) * 0.21], seg: 10, castShadow: false }));
  }
  rig.add('copa', blob([0.19, 0.07, 0.19], m.sombra(2), { pos: [0, 0.0, 0] }), blob([0.1, 0.06, 0.1], m.luz(2), { pos: [0, 0.1, 0], seg: 12 }));
  // anéis claros no tronco da cauda
  for (const o of ['cauda2', 'cauda3']) rig.add(o, blob([0.03, 0.105, 0.105], m.luz(0), { pos: [-0.1, 0, 0], seg: 12 }));
  return rig;
}

const anims = animsBipede({ u: 1.0, hPerna: 0.15, mole: 0.8 }, {
  idle: { copa: lz([0, 3, 6, 2]), pinha: lz([0, 2, 4, 1]), braco_e: lz([50, 51, 53, 51]), braco_d: lz([30, 31, 33, 31]) },
  andar: { braco_e: lz([50, 54, 50, 54]), braco_d: lz([30, 20, 30, 40]), copa: lz([0, 5, 0, -5]) },
  parado: { braco_e: lz([50, 52]), braco_d: lz([30, 32]) },
  status: { braco_e: lz([50, 52, 50, 48]), braco_d: lz([30, 32, 30, 28]) },
  fisico: { braco_e: qz([40, 30, 90, 70, 50]), antebraco_e: qz([50, 70, 10, 20, 40]), pinha: [{ t: 0, p: [0.3, -0.08, -0.2] }, { t: 0.25, p: [0.24, -0.06, -0.2] }, { t: 0.5, p: [0.5, 0.02, -0.2] }, { t: 0.75, p: [0.42, -0.04, -0.2] }, { t: 1, p: [0.3, -0.08, -0.2] }] },
  especial: { copa: [...qz([0, 8, 10, -16, -6, 0]), { t: 0, s: 1 }, { t: 0.4, s: 0.9 }, { t: 0.6, s: 1.25 }, { t: 1, s: 1 }] },
  dano: { copa: qz([18, 8, 0]) },
});

export const serelepao = criatura({
  num: 138, id: 'serelepao', nome: 'Serelepão', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
