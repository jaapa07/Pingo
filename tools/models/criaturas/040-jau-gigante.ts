/**
 * 040 · JAÚ-GIGANTE (Rio/Terra) — jaú colossal do fundo dos poços, coberto de barro e pedra. Estágio final.
 * Mantém da linha: cabeçorra chata, beição creme, bigodes grossos, pintas escuras, nadadeiras verde-água.
 * Cresce: corpanzil de tora · crosta de barro rachado no lombo com três pedras · broto de aguapé nas costas ·
 * bocarra larga com papada · bigodes enormes · ferrão dorsal robusto.
 */
import { criatura, peixe, animsPeixe, blob, calota, spike, folha3d, par, m, lz, qz } from './kits';
import { bigode, bigodes } from './039-mandizinho';

const paleta = {
  rampas: [
    ['#4a3a3a', '#8f7440', '#c9b060'], // 0 couro oliva-barrento (mais escuro que o do filhote)
    ['#b59c88', '#f0e0c0', '#fffaea'], // 1 barriga, beiço e papada
    ['#2e2a3e', '#6a5a58', '#a89888'], // 2 pintas e bigodes · pedra · luz da pedra
    ['#2f6a78', '#5fb7ae', '#c8f2dc'], // 3 nadadeiras e broto verde-água
  ] as [string, string, string][],
  contorno: '#261e30',
  extras: { w: '#ffffff', p: '#1a1626', f: '#8f7440' },
};

function build() {
  const { rig } = peixe({
    corpo: [0.42, 0.24, 0.28], flutua: 0.36, ergue: 9,
    boca: { len: 0.12, r: 0.09 },
    cauda: { len: 0.14, r: 0.085, alt: 0.4, larg: 0.2, forma: 'redonda' },
    dorsal: { alt: 0.12, len: 0.18, x: 0.0 },
    anal: { alt: 0.09, len: 0.2, x: -0.5 },
    nad: { len: 0.24, larg: 0.14, y: -0.55 },
    olho: { r: 0.026, pos: [0.3, 0.13, 0.17] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 3, cauda: 0, boca: 1 },
  });
  // cabeçorra chata, bocarra e papada
  rig.add('tronco', blob([0.22, 0.19, 0.3], m(0), { pos: [0.26, -0.01, 0] }));
  rig.add('tronco', blob([0.1, 0.06, 0.27], m(1), { pos: [0.43, -0.09, 0], seg: 14 }));
  rig.add('tronco', blob([0.16, 0.1, 0.22], m(1), { pos: [0.26, -0.17, 0], seg: 14 }));
  rig.add('tronco', blob([0.09, 0.02, 0.22], m.sombra(2), { pos: [0.44, -0.035, 0], seg: 12 })); // risco da boca
  // crosta de barro rachado no lombo (sela) e três pedras
  rig.add('tronco', calota([0.36, 0.255, 0.25], m.plano(2), { de: 0, ate: 50, pos: [-0.06, 0, 0] }));
  for (const [x, y, z, r] of [[-0.02, 0.25, 0.1, 0.075], [-0.16, 0.22, -0.06, 0.09], [-0.26, 0.17, 0.08, 0.06]] as const)
    rig.add('tronco', blob([r, r * 0.75, r * 0.9], m.luz(2), { pos: [x, y, z], seg: 6 }));
  for (const [x, z, a] of [[0.08, 0.0, 30], [-0.1, 0.12, -40], [-0.2, -0.02, 70]] as const)
    rig.add('tronco', blob([0.07, 0.012, 0.014], m.sombra(2), { pos: [x, 0.25 - Math.abs(x) * 0.2, z], rot: [0, a, 0], seg: 6, castShadow: false }));
  // pintas escuras nos flancos
  par((_, s) => { for (const [x, y, r] of [[0.02, 0.06, 0.04], [-0.12, 0.02, 0.036], [-0.24, 0.05, 0.03], [0.12, -0.02, 0.03]] as const)
    rig.add('tronco', blob([r, r, 0.02], m.sombra(2), { pos: [x, y, (0.27 - Math.abs(x) * 0.25) * s], seg: 8, castShadow: false })); });
  // ferrão e broto de aguapé (osso próprio)
  rig.add('dorsal', spike(0.2, 0.04, m.sombra(2), { pos: [0.08, 0, 0], rot: [0, 0, -10] }));
  rig.bone('broto', 'tronco', [-0.14, 0.28, -0.05], [0, 0, 10]);
  rig.add('broto', folha3d(0.22, 0.13, m(3), { rot: [0, 30, -28], curva: 20 }), folha3d(0.17, 0.11, m.luz(3), { rot: [0, -40, 34], curva: -20 }), blob([0.04, 0.04, 0.04], m.sombra(3), { seg: 8 }));
  // bigodes enormes
  par((l, s) => {
    bigode(rig, 'bigode_' + l, 'tronco', [0.44, -0.03, 0.22 * s], 0.3, 0.045, s, 78, 0.8, m.sombra(2));
    bigode(rig, 'bigode2_' + l, 'tronco', [0.46, -0.13, 0.12 * s], 0.2, 0.036, s, 25, 1.3, m.sombra(2));
    rig.add('tronco', blob([0.05, 0.035, 0.03], m.luz(0), { pos: [0.33, 0.04, 0.26 * s], seg: 10 }));
  });
  rig.add('cauda2', blob([0.035, 0.19, 0.035], m(3), { pos: [-0.18, 0, 0], seg: 8 }));
  return rig;
}

const anims = animsPeixe({ u: 0.7, flutua: 0.3, mole: 0.6 }, {
  ...bigodes,
  idle: { ...bigodes.idle, broto: lz([0, 5, 8, -4]) },
  especial: { ...bigodes.especial, broto: qz([0, 10, 14, -24, -8, 0]) },
});

export const jauGigante = criatura({
  num: 40, id: 'jau-gigante', nome: 'Jaú-Gigante', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
