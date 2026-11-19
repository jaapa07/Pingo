/**
 * 038 · DOURADO-REI (Rio/Brasa) — dourado, o "rei do rio", de escamas em brasa. Estágio final.
 * Mantém da linha: pinta escura do ombro, risca até o rabo, nadadeiras vermelhas, anel no pedúnculo.
 * Cresce: coroa de três labaredas no lugar da dorsal · queixada forte de dentes à mostra ·
 * fileiras de escamas-brasa no flanco · rabo em lua com chamas nas pontas · sobrancelha de rei.
 */
import { criatura, peixe, animsPeixe, blob, calota, slab, chamaDupla, par, m, qz, lz } from './kits';
import { tremula } from './004-guaraxim';

const paleta = {
  rampas: [
    ['#a8571f', '#eeaa22', '#ffe27a'], // 0 ouro do corpo (sombra cobre)
    ['#c99a6a', '#fbe6b0', '#fffbe6'], // 1 barriga clara, dentes e miolo das chamas
    ['#8e1f2c', '#e2412a', '#ff8a3a'], // 2 vermelho-brasa das nadadeiras, escamas e chamas
    ['#30192e', '#5a2a3a', '#8a4a4a'], // 3 pinta, risca e sobrancelha (vinho escuro)
  ] as [string, string, string][],
  contorno: '#2e1524',
  extras: { w: '#ffffff', p: '#22101c', f: '#eeaa22', a: '#e2412a' },
};

function build() {
  const { rig } = peixe({
    corpo: [0.4, 0.25, 0.16], flutua: 0.42, ergue: 8,
    boca: { len: 0.13, r: 0.085, queixo: 0.05 },
    cauda: { len: 0.1, r: 0.07, alt: 0.5, larg: 0.26, forma: 'lua' },
    anal: { alt: 0.12, len: 0.2, x: -0.45 },
    nad: { len: 0.2, larg: 0.11, y: -0.4 },
    olho: { r: 0.03, pos: [0.24, 0.07, 0.125] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 2, cauda: 2, boca: 0 },
  });
  // cabeça-capacete mais escura e sobrancelha de rei
  rig.add('tronco', calota([0.41, 0.26, 0.165], m.sombra(0), { de: 0, ate: 38, rot: [0, 0, -78] }));
  par((_, s) => {
    rig.add('tronco', blob([0.07, 0.022, 0.02], m.plano(3), { pos: [0.25, 0.115, 0.12 * s], rot: [0, 14 * s, -22], seg: 10 }));
    // pinta do ombro + risca herdadas
    rig.add('tronco', blob([0.045, 0.055, 0.02], m.plano(3), { pos: [0.1, 0.04, 0.152 * s], seg: 10 }));
    rig.add('tronco', blob([0.13, 0.02, 0.02], m.plano(3), { pos: [-0.24, 0.0, 0.1 * s], rot: [0, -12 * s, 0], seg: 10 }));
    // escamas-brasa em duas fileiras
    for (const [x, y, r] of [[0.0, 0.1, 0.034], [-0.09, 0.09, 0.03], [-0.17, 0.07, 0.026], [-0.03, -0.03, 0.032], [-0.12, -0.03, 0.028]] as const)
      rig.add('tronco', blob([r, r, 0.016], m.luz(2), { pos: [x, y, (0.15 - Math.abs(x) * 0.12) * s], seg: 8, castShadow: false }));
  });
  // dentes à mostra na queixada
  for (const x of [0.03, 0.08, 0.13]) par((_, s) => rig.add('mandibula', blob([0.016, 0.03, 0.016], m.luz(1), { pos: [x, 0.07, 0.045 * s], seg: 8 })));
  rig.add('tronco', blob([0.07, 0.05, 0.1], m(0), { pos: [0.38, 0.0, 0], seg: 12 }));
  // anel claro no pedúnculo, miolo escuro do rabo
  rig.add('cauda1', blob([0.04, 0.085, 0.065], m.luz(1), { pos: [-0.07, 0, 0], seg: 12 }));
  rig.add('cauda2', slab([[0, 0.04], [-0.12, 0.04], [-0.16, 0], [-0.12, -0.04], [0, -0.04]], 0.05, m.plano(3)));
  // COROA: três labaredas no dorso, cada uma no seu osso
  const coroa: [number, number, number, number][] = [[0.12, 0.2, 0.2, 0.075], [-0.02, 0.24, 0.3, 0.095], [-0.17, 0.2, 0.22, 0.08]];
  coroa.forEach(([x, y, alt, r], i) => {
    rig.bone('chama' + (i + 1), 'tronco', [x, y, 0], [0, 0, 8 + i * 12]);
    rig.add('chama' + (i + 1), ...chamaDupla(alt, r, m.plano(2), m.luz(2), { curva: 22 }));
  });
  // chamas nas duas pontas do rabo
  rig.bone('chama4', 'cauda2', [-0.2, 0.2, 0], [0, 0, 62]);
  rig.add('chama4', ...chamaDupla(0.2, 0.07, m.luz(2), m.luz(1), { curva: 20 }));
  rig.bone('chama5', 'cauda2', [-0.2, -0.2, 0], [0, 0, 118]);
  rig.add('chama5', ...chamaDupla(0.18, 0.065, m.luz(2), m.luz(1), { curva: -20 }));
  // barbatanas peitorais com ponta de brasa
  par((l, s) => rig.add('nad_' + l, blob([0.05, 0.04, 0.02], m.luz(2), { pos: [-0.18, 0, 0.005 * s], seg: 8 })));
  return rig;
}

const anims = animsPeixe({ u: 0.75, flutua: 0.42, mole: 0.8 }, {
  todas: tremula(['chama1', 'chama2', 'chama3', 'chama4', 'chama5']),
  idle: { chama2: lz([0, 6, 0, -6]) },
  especial: { chama1: qz([0, -10, -14, 20, 8, 0]), chama3: qz([0, 10, 14, -20, -8, 0]) },
});

export const douradoRei = criatura({
  num: 38, id: 'dourado-rei', nome: 'Dourado-Rei', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', 'pwapp', '.pppp', '..pp.'],
    fechado: ['fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['w', 'p'],
  },
});
