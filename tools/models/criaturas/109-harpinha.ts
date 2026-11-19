/**
 * 109 · HARPINHA (Vento/Ginga) — filhote de gavião-real, ainda de penugem branca.
 * Traços únicos: penacho duplo em "V" de pontas escuras · babador cinza-ardósia no peito ·
 * pés amarelos enormes de lutador, com garras escuras · asinhas curtas de punho fechado.
 */
import { criatura, ave, animsAve, blob, calota, tufo, garra, par, m, lz, qz } from './kits';

export const paletaHarpia = {
  rampas: [
    ['#9aa3bd', '#e6e9f2', '#ffffff'], // 0 penugem branca (sombra azulada)
    ['#3a3f5c', '#636b8c', '#99a3bf'], // 1 cinza-ardósia do dorso, babador e penacho
    ['#231f33', '#f0b62c', '#fff0b8'], // 2 trio chapado: escuro (garras, pontas) · amarelo (pés) · marfim
    ['#2b2d44', '#4a4f6e', '#c9cfe0'], // 3 bico de chumbo com brilho
  ] as [string, string, string][],
  contorno: '#22203a',
  extras: { w: '#ffffff', p: '#1b1828', f: '#e6e9f2', a: '#c24a3a' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.2, 0.19, 0.18], ergue: 44,
    pescoco: { len: 0.1, ang: 70, r: 0.13 },
    cabeca: [0.19, 0.18, 0.18],
    bico: { len: 0.13, r: 0.065, y: -0.12, achata: 0.8, gancho: 50, inferior: 0.55 },
    asa: { len: 0.22, larg: 0.16, cai: 10, ponta: 0.4 },
    cauda: { len: 0.16, larg: 0.09, ang: -10, penas: 3, abre: 18 },
    pernas: { alt: 0.13, r: 0.034, z: 0.55, x: 0.0, dedo: 0.12 },
    olho: { r: 0.03, pos: [0.11, 0.03, 0.15] },
    rampas: { corpo: 0, cabeca: 0, asa: 1, asaPonta: 1, cauda: 1, bico: 3, perna: 2 },
  });
  // pés e mandíbula chapados (a rampa 2 mistura escuro/amarelo/marfim)
  for (const o of ['canela_d', 'canela_e']) rig.bones[o].traverse((x) => { const mesh = x as { isMesh?: boolean; material?: unknown }; if (mesh.isMesh) mesh.material = m.plano(2); });
  // babador cinza no alto do peito e manto no dorso
  rig.add('tronco', calota([0.21, 0.2, 0.19], m(1), { de: 0, ate: 48, rot: [0, 0, -78], pos: [0.01, 0.01, 0] }));
  rig.add('tronco', calota([0.21, 0.2, 0.19], m(1), { de: 0, ate: 60, rot: [0, 0, 60] }));
  // penacho duplo em V (dois ossos, um para cada lado)
  par((l, s) => {
    rig.bone('penacho_' + l, 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.04, 0.05 * s], [-26 * s, 0, 22]);
    rig.add('penacho_' + l, tufo(2, 0.17, 0.045, m(1), { abre: 12 }), blob([0.03, 0.035, 0.03], m.sombra(2), { pos: [0, 0.165, 0], seg: 8 }));
  });
  // disco facial mais cinza em volta do olho + sobrancelha
  par((_, s) => rig.add('cabeca', blob([0.085, 0.07, 0.03], m.luz(1), { pos: [0.07, 0.02, 0.155 * s], rot: [0, 14 * s, 0], seg: 12 })));
  // cera clara na base do bico
  rig.add('cabeca', blob([0.06, 0.05, 0.06], m.luz(3), { pos: [0.16, -0.01, 0], seg: 10 }));
  // garras escuras gordinhas nas pontas dos dedos
  par((l) => { for (const g of [-32, 0, 32]) rig.add('canela_' + l, garra(0.05, 0.022, m.sombra(2), { pos: [Math.cos((g * Math.PI) / 180) * 0.105 - 0.008, -0.062, -Math.sin((g * Math.PI) / 180) * 0.105], rot: [0, g, 0], curva: 0.8 })); });
  // calção fofo
  par((l) => rig.add('perna_' + l, blob([0.07, 0.07, 0.07], m(0), { pos: [0, -0.02, 0], seg: 12 })));
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.13, mole: 1.2 }, {
  idle: { penacho_d: lz([0, 5, 10, -6]), penacho_e: lz([0, 8, 6, -4]) },
  fisico: { perna_d: qz([-10, -30, 60, 20, 0]), canela_d: qz([0, -30, 20, 0, 0]) },
  especial: { penacho_d: qz([0, 14, 18, -26, -8, 0]), penacho_e: qz([0, 14, 18, -26, -8, 0]) },
  dano: { penacho_d: qz([26, 10, 0]), penacho_e: qz([26, 10, 0]) },
});

export const harpinha = criatura({
  num: 109, id: 'harpinha', nome: 'Harpinha', porte: 'P', estagio: 'basico', paleta: paletaHarpia, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
