/**
 * 012 · GAVIÃOZÃO (Comum/Vento) — gavião-carijó altivo. Estágio final.
 * Mantém da linha: topete de três penas ferrugem, colar ferrugem, máscara escura com sobrancelha clara.
 * Cresce: peito carijó (barras ferrugem sobre creme) · bico de gancho com cera amarela ·
 * asas-capa entreabertas com espelho ferrugem e pontas escuras · cauda larga de faixas ·
 * calções de pena e garras amarelas enormes.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, garra, par, m, lz, qz } from './kits';

const paleta = {
  rampas: [
    ['#4a3c40', '#7d675c', '#b39a80'], // 0 dorso cinza-pardo
    ['#b9a089', '#f1e3c6', '#fffaf0'], // 1 creme do peito
    ['#8c382f', '#cc6338', '#f09a52'], // 2 ferrugem das barras, do topete e do espelho da asa
    ['#262238', '#f2bd2e', '#fff3c4'], // 3 escuro (máscara, pontas) · amarelo (cera, pés) · marfim (sobrancelha, garras)
  ] as [string, string, string][],
  contorno: '#241c30',
  extras: { w: '#ffffff', p: '#17131f', f: '#262238', a: '#f2bd2e' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.3, 0.23, 0.22], ergue: 58,
    pescoco: { len: 0.14, ang: 74, r: 0.14 },
    cabeca: [0.17, 0.155, 0.155],
    bico: { len: 0.17, r: 0.07, y: -0.05, achata: 0.75, gancho: 62, inferior: 0.55 },
    asa: { len: 0.5, larg: 0.26, cai: 22, ponta: 0.5 },
    cauda: { len: 0.42, larg: 0.11, ang: -34, penas: 5, abre: 26 },
    pernas: { alt: 0.24, r: 0.034, z: 0.5, x: -0.1, dedo: 0.13 },
    olho: { r: 0.024, pos: [0.115, 0.03, 0.16] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 3, perna: 3 },
  });
  // materiais chapados da rampa 3 (ela mistura escuro/amarelo/marfim de propósito)
  for (const o of ['mandibula']) rig.bones[o].traverse((x) => { const mesh = x as { isMesh?: boolean; material?: unknown }; if (mesh.isMesh) mesh.material = m.plano(3); });
  // asas-capa: entreabertas em repouso
  rig.bones.asa_d.rotation.y = 0.3; rig.bones.asa_e.rotation.y = -0.3;
  // cera amarela chapada sobre a base do bico e ponta escura do gancho
  rig.add('cabeca', blob([0.07, 0.06, 0.065], m.plano(3), { pos: [0.15, -0.0, 0], seg: 12 }), blob([0.04, 0.05, 0.035], m.sombra(3), { pos: [0.275, -0.07, 0], seg: 10 }));
  // máscara escura e sobrancelha de marfim franzida
  par((_, s) => {
    rig.add('cabeca', blob([0.12, 0.045, 0.03], m.sombra(3), { pos: [0.05, 0.025, 0.14 * s], rot: [0, 10 * s, -8], seg: 12 }));
    rig.add('cabeca', blob([0.12, 0.028, 0.035], m.luz(3), { pos: [0.06, 0.085, 0.128 * s], rot: [0, 12 * s, -16], seg: 12 }));
  });
  // PEITO CARIJÓ: barras ferrugem atravessando o creme
  for (const [x, y, w] of [[0.17, 0.09, 0.15], [0.2, 0.02, 0.18], [0.22, -0.06, 0.19], [0.2, -0.14, 0.18], [0.14, -0.21, 0.15]] as const)
    rig.add('tronco', blob([0.03, 0.028, w], m(2), { pos: [x * 1.12 + 0.03, y, 0], rot: [0, 0, -20], seg: 12, castShadow: false }));
  // colar ferrugem + topete herdado, mais comprido e deitado para trás
  rig.add('pescoco', calota([0.16, 0.14, 0.17], m(2), { de: 40, ate: 100, rot: [0, 0, 70], pos: [0.01, 0.03, 0] }));
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.05, ref.topo[1] - 0.03, 0], [0, 0, 48]);
  rig.add('topete', tufo(3, 0.24, 0.05, m(2), { abre: 24 }));
  // asas: espelho ferrugem, barra clara e pontas escuras
  par((l, s) => {
    rig.add('asa_' + l, blob([0.17, 0.06, 0.035], m(2), { pos: [-0.24, -0.02, 0.06 * s], rot: [0, 0, 8], seg: 12 }), blob([0.16, 0.025, 0.035], m.plano(1), { pos: [-0.26, -0.1, 0.06 * s], rot: [0, 0, 8], seg: 10 }));
    rig.add('asa2_' + l, pena(0.2, 0.1, m.sombra(3), { esp: 0.05, pos: [-0.1, -0.02, 0.02 * s] }), pena(0.16, 0.09, m.sombra(3), { esp: 0.05, pos: [-0.02, -0.11, 0.02 * s], rot: [0, 0, 14] }));
  });
  // cauda de faixas: duas barras escuras e ponta clara
  for (const [x, mat] of [[-0.16, m.sombra(3)], [-0.28, m.sombra(3)], [-0.38, m.luz(3)]] as const)
    rig.add('cauda1', blob([0.035, 0.03, 0.17 + x * -0.1], mat, { pos: [x, 0, 0], seg: 10 }));
  // calções de pena nas coxas e garras grandes
  par((l) => {
    rig.add('perna_' + l, blob([0.085, 0.12, 0.08], m(1), { pos: [0.0, -0.05, 0], seg: 14 }), blob([0.07, 0.025, 0.082], m(2), { pos: [0.01, -0.09, 0], seg: 10 }));
    for (const g of [-32, 0, 32]) rig.add('canela_' + l, garra(0.06, 0.02, m.luz(3), { pos: [Math.cos((g * Math.PI) / 180) * 0.115 - 0.014, -0.13, -Math.sin((g * Math.PI) / 180) * 0.115], rot: [0, g, 0], curva: 0.9 }));
  });
  return rig;
}

const anims = animsAve({ u: 1.1, hPerna: 0.24, mole: 0.6 }, {
  idle: { topete: lz([0, 4, 8, -5]) },
  especial: { topete: qz([0, 12, 16, -24, -8, 0]) },
  dano: { topete: qz([24, 10, 0]) },
});

export const gaviaozao = criatura({
  num: 12, id: 'gaviaozao', nome: 'Gaviãozão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['wwww.', 'faapf', 'fappf', '.fff.'],
    fechado: ['fffff', 'wfffw', 'fwwwf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
