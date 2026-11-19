/**
 * 034 · TATUCANASTRA (Terra/Ferro) — tatu-canastra de placas metálicas, o maior tatu do mundo. Estágio final.
 * Mantém da linha: casco ocre em cúpula com cintas, escudo no cocuruto, pele rosada, focinho fino, rabo em cone.
 * Cresce: corpo comprido e baixo · sete cintas de AÇO com rebites · ombreira e garupa blindadas ·
 * GARRAS de foice de aço nas patas da frente (a do meio gigante) · rabo comprido de anéis · orelhas de funil.
 */
import { criatura, animsQuadrupede, blob, calota, garra, par, m, lz, qz } from './kits';
import { paletaTatu, corpoTatu } from './033-tatuzim';

const paleta = { ...paletaTatu, rampas: [paletaTatu.rampas[0], paletaTatu.rampas[1], paletaTatu.rampas[2], ['#39415e', '#8794b0', '#e3ebf6']] as [string, string, string][] }; // 3 aço

function build() {
  const { rig } = corpoTatu({ k: 1.35, tronco: [0.46, 0.27, 0.28], cabeca: [0.17, 0.14, 0.14], cintas: 7, cinta: 3, orelha: 0.22, rabo: 0.62, alt: 0.14 });
  // ombreira e garupa de aço (placas inteiriças) com rebites
  rig.add('corpo', calota([0.2, 0.3, 0.3], m(3), { de: 0, ate: 96, pos: [0.3, -0.03, 0] }), calota([0.2, 0.3, 0.3], m(3), { de: 0, ate: 96, pos: [-0.3, -0.03, 0] }));
  par((l, s) => {
    for (const x of [0.36, -0.36]) for (const y of [0.16, 0.02]) rig.add('corpo', blob([0.028, 0.028, 0.028], m.luz(3), { pos: [x, y, (y > 0.1 ? 0.22 : 0.28) * s], seg: 8, castShadow: false }));
    // GARRAS de foice: três por pata, a do meio gigante
    rig.add('canela_f' + l,
      garra(0.3, 0.05, m(3), { pos: [0.08, -0.05, 0], curva: 0.5 }),
      garra(0.17, 0.035, m(3), { pos: [0.07, -0.06, 0.07], rot: [0, -20, 0], curva: 0.5 }),
      garra(0.17, 0.035, m(3), { pos: [0.07, -0.06, -0.07], rot: [0, 20, 0], curva: 0.5 }));
    rig.add('canela_t' + l, garra(0.12, 0.03, m(3), { pos: [0.07, -0.06, 0], curva: 0.5 }));
    // joelheiras
    rig.add('perna_f' + l, blob([0.08, 0.07, 0.07], m(0), { pos: [0.01, -0.03, 0.02 * s], seg: 10 }));
  });
  // anéis de aço no rabo e ponta ocre
  const sl = 0.62 / 3;
  for (let i = 1; i <= 3; i++) for (const u of [0.25, 0.75]) { const r = (0.095 - 0.068 * ((i - 1 + u) / 3)) * 1.12; rig.add('cauda' + i, blob([0.03, r, r], m.plano(3), { pos: [-sl * u, 0, 0], seg: 10 })); }
  // focinho com placa e risca no escudo
  rig.add('cabeca', blob([0.09, 0.03, 0.07], m(3), { pos: [0.2, 0.03, 0], rot: [0, 0, -16], seg: 10 }));
  rig.add('cabeca', blob([0.03, 0.03, 0.1], m.sombra(0), { pos: [0.04, 0.15, 0], seg: 8 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.8, hPerna: 0.14, mole: 0.55, cauda: 0.5, passo: 20 }, {
  idle: { perna_fe: lz([0, 0, -6, 0]) },
  // patada de foice
  fisico: { perna_fe: qz([-16, -40, 50, 24, 0]), canela_fe: qz([10, 30, -30, -10, 0]) },
  especial: { perna_fe: qz([0, -20, -30, 40, 14, 0]), perna_fd: qz([0, -14, -22, 30, 10, 0]) },
});

export const tatucanastra = criatura({
  num: 34, id: 'tatucanastra', nome: 'Tatucanastra', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
