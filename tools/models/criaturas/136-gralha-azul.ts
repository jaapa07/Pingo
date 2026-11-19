/**
 * 136 · GRALHA-AZUL (Vento/Geada) — a gralha que planta pinheiros. Estágio final.
 * Mantém da linha: azul vivo, capuz preto em babador, topete, pontas de geada.
 * Cresce: pinhões guardados aos pés sobre a geada · cauda longa em leque de cinco penas com barra de geada · asas-capa entreabertas ·
 * topete alto com cristais de gelo · colar de geada entre o capuz e o azul · calções de pena.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, spike, par, m, lz, qz } from './kits';
import { paletaGralha, pinhao } from './135-gralhinha';

function build() {
  const { rig, ref } = ave({
    corpo: [0.27, 0.215, 0.2], ergue: 60,
    pescoco: { len: 0.15, ang: 70, r: 0.13 },
    cabeca: [0.18, 0.165, 0.165],
    bico: { len: 0.17, r: 0.07, y: -0.1, achata: 0.7, gancho: 18, inferior: 0.8 },
    asa: { len: 0.46, larg: 0.24, cai: 16, ponta: 0.5 },
    cauda: { len: 0.62, larg: 0.13, ang: -42, penas: 5, abre: 26 },
    pernas: { alt: 0.2, r: 0.036, z: 0.5, x: -0.08, dedo: 0.13 },
    olho: { r: 0.026, pos: [0.11, 0.035, 0.145] },
    rampas: { corpo: 0, cabeca: 1, asa: 0, asaPonta: 0, cauda: 0, bico: 1, perna: 1 },
  });
  rig.bones.asa_d.rotation.y = 0.5; rig.bones.asa_e.rotation.y = -0.5;
  // capuz em babador + colar de geada na borda
  rig.add('tronco', calota([0.28, 0.226, 0.212], m(1), { de: 0, ate: 56, rot: [0, 0, -74] }));
  rig.add('tronco', calota([0.285, 0.232, 0.218], m.luz(2), { de: 54, ate: 68, rot: [0, 0, -74] }));
  // PINHÃO no bico
  // PINHÕES guardados aos pés (atravessado no bico o pinhão virava bico de pato)
  for (const [x, z, a] of [[0.36, 0.14, 20], [0.42, -0.02, -30], [0.3, -0.16, 70]] as const) { const q = pinhao(0.15); q.position.set(x, 0.035, z); q.rotation.y = (a * Math.PI) / 180; rig.add('base', q); }
  rig.add('base', blob([0.2, 0.03, 0.24], m.luz(2), { pos: [0.36, 0.012, 0], seg: 12 }));
  // topete alto: penas pretas + três cristais de gelo
  rig.bone('topete', 'cabeca', [ref.topo[0] + 0.02, ref.topo[1] - 0.03, 0], [0, 0, 20]);
  rig.add('topete', tufo(4, 0.28, 0.07, m(1), { abre: 44 }),
    spike(0.3, 0.055, m.luz(2), { rot: [0, 0, -16], pos: [0, 0.02, 0.05] }), spike(0.24, 0.05, m(2), { rot: [0, 0, 30], pos: [0, 0.02, -0.05] }));
  // cristais de geada nos ombros
  par((_, s) => rig.add('tronco', spike(0.16, 0.05, m.luz(2), { pos: [0.02, 0.2, 0.13 * s], rot: [30 * s, 0, 10] }), spike(0.12, 0.045, m(2), { pos: [-0.1, 0.2, 0.11 * s], rot: [36 * s, 0, 30] })));
  // sobrancelha azul e bigode azul (a gralha tem tufos na base do bico)
  par((l, s) => {
    rig.add('cabeca', blob([0.06, 0.022, 0.02], m.plano(0), { pos: [0.085, 0.085, 0.13 * s], rot: [0, 14 * s, -14], seg: 8 }));
    // asas: espelho claro, barra e pontas de geada
    rig.add('asa_' + l, blob([0.16, 0.05, 0.035], m.luz(0), { pos: [-0.22, 0.0, 0.055 * s], rot: [0, 0, 8], seg: 12 }));
    rig.add('asa2_' + l, pena(0.14, 0.1, m.luz(2), { esp: 0.05, pos: [-0.12, -0.01, 0.02 * s] }), pena(0.12, 0.09, m.luz(2), { esp: 0.05, pos: [-0.05, -0.11, 0.02 * s], rot: [0, 0, 14] }));
    rig.add('perna_' + l, blob([0.075, 0.1, 0.07], m(0), { pos: [0, -0.04, 0], seg: 14 }));
  });
  // cauda: barra escura e ponta de geada
  rig.add('cauda1', blob([0.035, 0.03, 0.2], m.plano(1), { pos: [-0.4, 0, 0], seg: 10 }), blob([0.06, 0.032, 0.21], m.luz(2), { pos: [-0.52, 0, 0], seg: 10 }));
  return rig;
}

const anims = animsAve({ u: 1.0, hPerna: 0.2, mole: 0.8 }, {
  idle: { topete: lz([0, 4, 8, -5]) },
  especial: { topete: qz([0, 12, 16, -24, -8, 0]) },
  dano: { topete: qz([24, 10, 0]) },
});

export const gralhaAzul = criatura({
  num: 136, id: 'gralha-azul', nome: 'Gralha-Azul', porte: 'M', estagio: 'final', paleta: paletaGralha, build, anims,
  olho: {
    frente: ['.www', 'wpww', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', 'fwwf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
