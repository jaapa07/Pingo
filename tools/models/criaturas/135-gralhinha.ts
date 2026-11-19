/**
 * 135 · GRALHINHA (Vento/Geada) — gralha-azul filhote e gritona.
 * Traços únicos: capuz preto até o peito · topete arrepiado · bico aberto no grito ·
 * pontas da cauda e das asas brancas de geada · pinhão preso debaixo do pé.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, par, m, lz, qz, D2R } from './kits';

export const paletaGralha = {
  rampas: [
    ['#1f3a8a', '#2f6fd6', '#6fb4f5'], // 0 azul-gralha (sombra anil, luz ciano)
    ['#15152c', '#2b2e4e', '#565a86'], // 1 capuz preto-azulado, bico e pernas
    ['#8fb6dc', '#dff1fb', '#ffffff'], // 2 geada
    ['#5a2c2a', '#a3542f', '#e0a05a'], // 3 pinhão castanho
  ] as [string, string, string][],
  contorno: '#13122a',
  extras: { w: '#ffffff', p: '#13122a', f: '#2b2e4e' },
};

/** Pinhão: semente comprida com a ponta clara, crescendo em +X. */
export function pinhao(len: number, mat = m(3), ponta = m.luz(3)) {
  const g = blob([len * 0.5, len * 0.22, len * 0.22], mat, { pos: [len * 0.5, 0, 0], seg: 14 });
  g.add(blob([len * 0.18, len * 0.16, len * 0.16], ponta, { pos: [len * 0.42, 0, 0], seg: 10 }));
  return g;
}

function build() {
  const { rig, ref } = ave({
    corpo: [0.21, 0.175, 0.17], ergue: 34,
    pescoco: { len: 0.1, ang: 64, r: 0.125 },
    cabeca: [0.185, 0.175, 0.175],
    bico: { len: 0.14, r: 0.06, y: -0.12, achata: 0.8 },
    asa: { len: 0.26, larg: 0.16, cai: 4, ponta: 0.4 },
    cauda: { len: 0.36, larg: 0.085, ang: 28, penas: 3, abre: 12 },
    pernas: { alt: 0.13, r: 0.024, z: 0.45, dedo: 0.075 },
    olho: { r: 0.03, pos: [0.105, 0.035, 0.15] },
    rampas: { corpo: 0, cabeca: 1, asa: 0, asaPonta: 0, cauda: 0, bico: 1, perna: 1 },
  });
  rig.bones.mandibula.rotation.z = -24 * D2R; // gritando
  rig.add('mandibula', blob([0.05, 0.02, 0.035], m.plano(3), { pos: [0.04, 0.025, 0], seg: 8 })); // língua
  // capuz preto descendo em babador pelo peito
  rig.add('tronco', calota([0.22, 0.185, 0.18], m(1), { de: 0, ate: 62, rot: [0, 0, -78] }));
  // topete arrepiado (osso próprio)
  rig.bone('topete', 'cabeca', [ref.topo[0] + 0.03, ref.topo[1] - 0.03, 0], [0, 0, 6]);
  rig.add('topete', tufo(4, 0.14, 0.05, m(1), { abre: 46 }));
  // geada: pontas da cauda, barra da asa, sobrancelha de gelo
  rig.add('cauda1', pena(0.1, 0.1, m.luz(2), { rot: [90, 0, 0], pos: [-0.28, 0.012, 0], esp: 0.035 }));
  par((l, s) => {
    rig.add('asa2_' + l, pena(0.09, 0.07, m.luz(2), { esp: 0.045, pos: [-0.04, -0.01, 0.015 * s] }));
    rig.add('asa_' + l, blob([0.09, 0.02, 0.03], m.plano(2), { pos: [-0.15, -0.04, 0.045 * s], rot: [0, 0, 10], seg: 10 }));
  });
  // pinhão debaixo do pé esquerdo (o da frente na câmera)
  rig.add('base', pinhao(0.17).translateX(0.1).translateY(0.035).translateZ(-0.1));
  return rig;
}

const anims = animsAve({ u: 0.62, hPerna: 0.13, mole: 1.3 }, {
  idle: { topete: lz([0, 6, 12, -8]), mandibula: lz([-24, -24, -6, -24]) },
  especial: { topete: qz([0, 16, 20, -30, -10, 0]) },
  dano: { topete: qz([30, 12, 0]) },
});

export const gralhinha = criatura({
  num: 135, id: 'gralhinha', nome: 'Gralhinha', porte: 'P', estagio: 'basico', paleta: paletaGralha, build, anims,
  olho: {
    frente: ['.ww.', 'wpww', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', 'fwwf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
