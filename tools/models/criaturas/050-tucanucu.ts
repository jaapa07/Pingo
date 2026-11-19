/**
 * 050 · TUCANUÇU (Vento/Brasa) — tucano-toco de bico em chamas. Estágio final.
 * Mantém da linha: penas negras, papo claro, vermelho sob a cauda, anel azul do olho, faixa verde (agora só na base do bico).
 * Cresce: BICÃO laranja enorme, incandescente, com labaredas na ponta e na crista · papo branco-ouro largo ·
 * cauda longa com brasa · asas de pontas em brasa.
 */
import { criatura, ave, animsAve, blob, calota, chamaDupla, pena, par, m, lz, qz } from './kits';
import { tremula } from './004-guaraxim';
import { paletaTucano } from './049-tucaninho';

const paleta = { ...paletaTucano, rampas: [paletaTucano.rampas[0], ['#d9a04a', '#ffe9a0', '#fffbe8'], paletaTucano.rampas[2], ['#b8301e', '#f57a1e', '#ffc83c']] as [string, string, string][] };

function build() {
  const { rig, ref } = ave({
    corpo: [0.3, 0.25, 0.23], ergue: 50,
    pescoco: { len: 0.14, ang: 70, r: 0.15 },
    cabeca: [0.18, 0.17, 0.17],
    bico: { len: 0.54, r: 0.13, y: 0.0, achata: 0.55, gancho: 30, inferior: 0.88 },
    asa: { len: 0.45, larg: 0.25, cai: 24, ponta: 0.45 },
    cauda: { len: 0.4, larg: 0.12, ang: -20, penas: 3, abre: 14 },
    pernas: { alt: 0.15, r: 0.036, z: 0.5, dedo: 0.11 },
    olho: { r: 0.024, pos: [0.09, 0.05, 0.15] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 3, perna: 2 },
  });
  // papo branco-ouro largo
  rig.add('pescoco', blob([0.12, 0.15, 0.15], m(1), { pos: [0.07, 0.02, 0], rot: [0, 0, -20], seg: 14 }));
  rig.add('cabeca', blob([0.09, 0.08, 0.155], m(1), { pos: [0.09, -0.09, 0], seg: 14 }));
  rig.add('tronco', blob([0.05, 0.05, 0.2], m.sombra(3), { pos: [0.19, -0.2, 0], rot: [0, 0, -30], seg: 12 }));
  rig.add('cauda1', blob([0.07, 0.05, 0.08], m.sombra(3), { pos: [0.03, -0.05, 0], seg: 10 }));
  // bico: faixa verde e risca negra na base, ponta incandescente
  rig.add('cabeca', blob([0.03, 0.14, 0.085], m.plano(2), { pos: [0.18, 0.0, 0], seg: 12 }), blob([0.02, 0.135, 0.08], m.sombra(0), { pos: [0.15, 0.0, 0], seg: 12 }));
  rig.add('cabeca', blob([0.1, 0.09, 0.06], m.luz(3), { pos: [ref.pontaBico[0] - 0.1, ref.pontaBico[1] - 0.09, 0], rot: [0, 0, -34], seg: 10 }));
  rig.add('cabeca', blob([0.2, 0.03, 0.03], m.luz(3), { pos: [0.4, 0.085, 0], rot: [0, 0, -14], seg: 10 }));
  // LABAREDAS: crista do bico (2) + ponta (1) + nuca (1)
  const ch: [string, string, [number, number, number], number, number, number][] = [
    ['chama1', 'cabeca', [0.3, 0.12, 0], 0.2, 0.07, 30],
    ['chama2', 'cabeca', [0.47, 0.07, 0], 0.26, 0.085, 20],
    ['chama3', 'cabeca', [-0.08, 0.14, 0], 0.22, 0.08, 40],
    ['chama4', 'cauda1', [-0.38, 0, 0], 0.26, 0.09, 70],
  ];
  for (const [nome, pai, pos, alt, r, tomba] of ch) {
    rig.bone(nome, pai, pos, [0, 0, tomba]);
    rig.add(nome, ...chamaDupla(alt, r, m.plano(3), m.luz(1), { curva: 24 }));
  }
  par((l, s) => {
    rig.add('cabeca', blob([0.055, 0.055, 0.02], m.plano(2), { pos: [0.09, 0.05, 0.145 * s], seg: 10 }));
    rig.add('asa2_' + l, pena(0.2, 0.09, m.sombra(3), { esp: 0.05, pos: [-0.08, -0.02, 0.02 * s] }), pena(0.1, 0.06, m.luz(3), { esp: 0.055, pos: [-0.2, -0.02, 0.02 * s] }));
    rig.add('asa_' + l, blob([0.15, 0.028, 0.035], m.plano(1), { pos: [-0.24, -0.09, 0.06 * s], rot: [0, 0, 8], seg: 10 }));
    rig.add('perna_' + l, blob([0.08, 0.1, 0.08], m(0), { pos: [0, -0.04, 0], seg: 12 }));
  });
  rig.add('cauda1', blob([0.035, 0.03, 0.13], m.plano(1), { pos: [-0.3, 0, 0], seg: 10 }));
  return rig;
}

const anims = animsAve({ u: 1.0, hPerna: 0.15, mole: 0.7 }, {
  todas: tremula(['chama1', 'chama2', 'chama3', 'chama4']),
  idle: { chama3: lz([0, 6, 10, -4]) },
});

export const tucanucu = criatura({
  num: 50, id: 'tucanucu', nome: 'Tucanuçu', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.aaa.', 'apppa', 'apwpa', 'apppa', '.aaa.'],
    fechado: ['.aaa.', 'afffa', 'apppa', 'afffa', '.aaa.'],
    mapa: ['a', 'p'],
  },
});
