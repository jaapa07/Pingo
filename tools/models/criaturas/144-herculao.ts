/**
 * 144 · HERCULÃO (Inseto/Ferro) — besouro-hércules de chifre de aço, já confundido com trilho de trem. Estágio final.
 * Mantém da linha: corpo escuro, aço no chifre, costura do casco, antenas em leque alaranjado, ganchos nos pés.
 * Cresce: casco amarelo-oliva PINTADO de preto (como o hércules de verdade) · CHIFRE de aço comprido saindo do escudo,
 * com escova de pelos laranja por baixo · segundo chifre na cabeça fechando a TENAZ · ombros largos · esporões nas patas.
 */
import { criatura, animsInseto, blob, tube, spike, par, m, lz, qz, type V3 } from './kits';
import { paletaBesouro, besouro } from './143-besourim';

const paleta = { ...paletaBesouro, rampas: [['#6c5a22', '#c4aa38', '#f6e884'], paletaBesouro.rampas[1], paletaBesouro.rampas[2], paletaBesouro.rampas[3]] as [string, string, string][] };

function build() {
  const rig = besouro({ k: 1.5, alt: 0.24 });
  // pintas pretas no casco
  const pintas: V3[] = [[-0.2, 0.2, 0.12], [-0.4, 0.14, 0.2], [-0.48, 0.2, 0.06], [-0.3, 0.1, 0.27], [-0.12, 0.12, 0.25]];
  par((l, s) => {
    for (const [x, y, z] of pintas) rig.add('elitro_' + l, blob([0.045, 0.03, 0.045], m.plano(1), { pos: [x, y, z * s], seg: 8, castShadow: false }));
    // ombros largos e esporões nas canelas
    rig.add('corpo', blob([0.12, 0.11, 0.1], m(1), { pos: [0.04, 0.08, 0.25 * s], seg: 12 }));
    for (const i of [1, 2, 3]) rig.add(`tarso${i}_${l}`, spike(0.09, 0.03, m.luz(1), { pos: [[0.06, 0, -0.08][i - 1], -0.16, 0.115 * s], rot: [60 * s, 0, 0] }));
  });
  // CHIFRE de cima: sai do escudo, avança e desce na ponta; escova laranja por baixo
  rig.bone('chifre', 'corpo', [0.12, 0.26, 0], [0, 0, 0]);
  rig.add('chifre', tube([[0, 0, 0], [0.2, 0.14, 0], [0.48, 0.14, 0], [0.7, 0.02, 0]], (u) => 0.085 * (1 - u * 0.62), m(2), { seg: 18, radial: 10 }),
    blob([0.05, 0.045, 0.05], m.luz(2), { pos: [0.71, 0.01, 0], seg: 8 }), spike(0.09, 0.035, m(2), { pos: [0.3, 0.2, 0], rot: [0, 0, -10] }));
  for (const x of [0.2, 0.3, 0.4, 0.5]) rig.add('chifre', blob([0.055, 0.04, 0.045], m(3), { pos: [x, 0.07 + (x < 0.45 ? 0.01 : -0.02), 0], seg: 8, castShadow: false }));
  // CHIFRE de baixo: sai da cabeça e sobe, fechando a tenaz
  rig.bone('chifre2', 'cabeca', [0.2, 0.0, 0], [0, 0, 0]);
  rig.add('chifre2', tube([[0, 0, 0], [0.18, -0.04, 0], [0.36, 0.04, 0], [0.46, 0.16, 0]], (u) => 0.065 * (1 - u * 0.6), m(2), { seg: 14, radial: 10 }), spike(0.07, 0.03, m.luz(2), { pos: [0.22, 0.0, 0], rot: [0, 0, 0] }));
  return rig;
}

const anims = animsInseto({ u: 0.8, alt: 0.24, mole: 0.5 }, {
  idle: { chifre2: lz([0, 3, 6, 2]), chifre: lz([0, -1, -2, -1]) },
  // fecha a tenaz
  fisico: { chifre: qz([8, 14, -10, -4, 0]), chifre2: qz([-10, -18, 22, 8, 0]) },
  especial: { chifre: qz([4, 10, 12, -8, -3, 0]), chifre2: qz([-6, -14, -16, 18, 6, 0]) },
});

export const herculao = criatura({
  num: 144, id: 'herculao', nome: 'Herculão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['wwww.', 'wwppw', 'wwppw', '.www.'],
    fechado: ['fffff', 'wfffw', '.www.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
