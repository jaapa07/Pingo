/**
 * 036 · GUAIAMUQUE (Rio/Pedra) — guaiamum azul de garra gigante, dono da toca mais funda do mangue. Estágio final.
 * Mantém da linha: patas roxas, ventre creme, olhos em pedúnculo, espuma na boca, a pinça desigual.
 * Cresce: carapaça AZUL alta e larga · GARRA gigante encrostada de pedra (maior que o corpo) ·
 * cracas e lajes de pedra no lombo · pinça pequena de ponta creme.
 */
import { criatura, aracnideo, animsAracnideo, blob, espuma, garra, par, m, lz, qs, qr, type V3 } from './kits';
import { paletaUca, bolhas, tarsos } from './035-caranguejim';

const paleta = {
  ...paletaUca, extras: { ...paletaUca.extras, f: '#4a78c8' },
  rampas: [['#27357a', '#4a78c8', '#9cc9f2'], paletaUca.rampas[1], paletaUca.rampas[2], ['#4a4658', '#908c9a', '#d6d2d2']] as [string, string, string][], // 0 azul-guaiamum · 3 pedra
};

function build() {
  const { rig } = aracnideo({
    corpo: [0.29, 0.23, 0.4], alt: 0.17, patas: { pares: 4, abre: 0.36, r: 0.065, joelho: 0.1 },
    pincas: { braco: 0.18, r: 0.07, garra: [0.13, 0.11, 0.09], abre: 28 }, pedunculo: 0.12,
    olho: { r: 0.036, pos: [0, 0, 0] },
    rampas: { corpo: 0, barriga: 1, patas: 2, pontas: 2, pincas: 0 },
  });
  // GARRA gigante do lado da câmera: palma enorme com crosta de pedra e dedos creme
  rig.bones.garra_e.scale.setScalar(2.1);
  rig.bones.pinca_e.rotation.z = 0.7; rig.bones.pinca_e.rotation.y = 0.3;
  rig.bones.dedo_e.rotation.z = -0.75;
  // palma em pedra, pequena; os dois DEDOS da tenaz são grossos, compridos e abertos em "C" (azul em cima, creme embaixo)
  rig.add('garra_e', blob([0.1, 0.095, 0.085], m(3), { pos: [0.06, 0, 0], seg: 9 }), blob([0.045, 0.04, 0.04], m.luz(3), { pos: [0.02, 0.08, -0.04], seg: 7 }), blob([0.04, 0.035, 0.04], m.sombra(3), { pos: [0.0, -0.05, -0.06], seg: 7 }));
  rig.add('garra_e', garra(0.34, 0.075, m(0), { pos: [0.1, 0.07, 0], rot: [0, 0, 26], curva: 0.75 }), blob([0.035, 0.03, 0.03], m.luz(1), { pos: [0.4, 0.07, 0], seg: 7 }));
  rig.add('dedo_e', garra(0.3, 0.06, m(1), { pos: [-0.02, 0.0, 0], rot: [0, 0, 0], curva: -0.7 }));
  par((l, s) => {
    rig.add('dedo_' + l, blob([0.04, 0.025, 0.03], m.plano(1), { pos: [0.09, -0.014, 0], seg: 8 }));
    // dentes da borda da carapaça e sulco do "H"
    for (const [x, z] of [[0.22, 0.28], [0.11, 0.37]] as const) rig.add('corpo', blob([0.045, 0.04, 0.045], m.luz(0), { pos: [x, 0.07, z * s], seg: 8 }));
    rig.add('corpo', blob([0.13, 0.035, 0.026], m.sombra(0), { pos: [0.06, 0.2, 0.12 * s], seg: 8, castShadow: false }));
    // joelhos roxos claros
    for (const i of [1, 2, 3, 4]) rig.add(`pata${i}_${l}`, blob([0.065, 0.065, 0.065], m.luz(2), { pos: [0, 0.1, 0.18 * s], seg: 8 }));
  });
  // LAJES e cracas de pedra no lombo
  const pedras: [V3, V3, number][] = [[[-0.12, 0.23, 0.14], [0.12, 0.08, 0.11], 10], [[-0.14, 0.24, -0.13], [0.1, 0.09, 0.1], -14], [[0.0, 0.27, 0.0], [0.07, 0.07, 0.07], 4], [[-0.2, 0.16, 0.29], [0.07, 0.06, 0.07], 0], [[-0.21, 0.16, -0.28], [0.08, 0.06, 0.07], 0]];
  pedras.forEach(([pos, r, g], i) => rig.add('corpo', blob(r, i % 2 ? m.luz(3) : m(3), { pos, rot: [0, g, g], seg: 7 })));
  rig.add('corpo', blob([0.03, 0.02, 0.03], m.sombra(3), { pos: [-0.12, 0.31, 0.14], seg: 6 }), blob([0.03, 0.02, 0.03], m.sombra(3), { pos: [-0.14, 0.33, -0.13], seg: 6 }));
  // boca e espuma
  rig.add('corpo', blob([0.03, 0.045, 0.12], m.sombra(1), { pos: [0.28, -0.06, 0], seg: 8 }));
  rig.bone('espuma1', 'corpo', [0.33, -0.03, 0.1]); rig.add('espuma1', espuma(0.05, m.luz(3)));
  rig.bone('espuma2', 'corpo', [0.34, 0.07, 0.0]); rig.add('espuma2', blob([0.032, 0.032, 0.032], m.luz(3), { seg: 8 }));
  return rig;
}

const anims = animsAracnideo({ u: 0.6, alt: 0.17, pares: 4, mole: 0.55 }, {
  ...tarsos,
  idle: { ...bolhas(['espuma1', 'espuma2']), garra_e: lz([0, 3, 6, 2]) },
  status: bolhas(['espuma1', 'espuma2']),
  // marretada com a garra de pedra
  fisico: { pinca_e: qr([[0, 10, 20], [0, 16, 50], [0, -10, -30], [0, -4, -12], [0, 0, 0]]) },
  especial: { espuma1: qs([1, 1.4, 1.8, 2.6, 1.5, 1]), espuma2: qs([1, 1.5, 2, 3, 1.6, 1]), pinca_e: qr([[0, 6, 14], [0, 10, 30], [0, 10, 36], [0, -20, 44], [0, -8, 16], [0, 0, 0]]) },
});

export const guaiamuque = criatura({
  num: 36, id: 'guaiamuque', nome: 'Guaiamuque', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', '.ppp.', 'ppwpp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['p', 'p'],
  },
});
