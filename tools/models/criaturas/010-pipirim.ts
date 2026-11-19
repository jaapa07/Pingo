/**
 * 010 · PIPIRIM (Comum/Vento) — pardal-do-mato (tico-tico) gorducho e atrevido.
 * Traços únicos: topete de três peninhas listradas · colar ferrugem na nuca ·
 * cauda empinada de ponta clara · bochechas creme redondas.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, par, m, lz, qz } from './kits';

const paleta = {
  rampas: [
    ['#6a4338', '#a9724a', '#dcaa6c'], // 0 penas marrons do dorso (sombra arroxeada)
    ['#bda48e', '#f3e4c8', '#fffbf0'], // 1 creme do peito e das bochechas
    ['#8c382f', '#cc6338', '#f09a52'], // 2 ferrugem do colar e do topete
    ['#2e2940', '#4f4763', '#7f7894'], // 3 bico, pernas e riscas (ardósia azulada)
  ] as [string, string, string][],
  contorno: '#2b1f34',
  extras: { w: '#ffffff', p: '#2b1f34', f: '#a9724a' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.21, 0.18, 0.18], ergue: 28,
    pescoco: { len: 0.1, ang: 62, r: 0.13 },
    cabeca: [0.18, 0.17, 0.175],
    bico: { len: 0.12, r: 0.06, y: -0.15, achata: 0.9 },
    asa: { len: 0.25, larg: 0.17, cai: 2, ponta: 0.36 },
    cauda: { len: 0.27, larg: 0.08, ang: 50, penas: 3, abre: 14 },
    pernas: { alt: 0.12, r: 0.022, z: 0.45, dedo: 0.07 },
    olho: { r: 0.028, pos: [0.1, 0.03, 0.15] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 3, cauda: 3, bico: 3, perna: 2 },
  });
  // bochechas creme e garganta
  par((_, s) => rig.add('cabeca', blob([0.085, 0.075, 0.05], m(1), { pos: [0.07, -0.06, 0.14 * s], seg: 14 })));
  rig.add('cabeca', blob([0.1, 0.07, 0.12], m(1), { pos: [0.08, -0.11, 0] }));
  // boné ferrugem + colar na nuca
  rig.add('cabeca', calota([0.19, 0.18, 0.185], m(2), { de: 0, ate: 52, rot: [0, 0, 18] }));
  rig.add('pescoco', calota([0.15, 0.13, 0.16], m(2), { de: 40, ate: 105, rot: [0, 0, 70], pos: [0.01, 0.03, 0] }));
  // risca escura atrás do olho
  par((_, s) => rig.add('cabeca', blob([0.07, 0.022, 0.02], m.plano(3), { pos: [0.0, 0.035, 0.168 * s], rot: [0, 12 * s, 8], seg: 10 })));
  // topete de três peninhas (osso próprio)
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.03, 0], [0, 0, 24]);
  rig.add('topete', tufo(3, 0.15, 0.045, m(2), { abre: 30 }), blob([0.03, 0.03, 0.03], m.plano(3), { pos: [0, 0.06, 0], seg: 8 }));
  // barra clara na asa e ponta clara na cauda
  par((l, s) => rig.add('asa_' + l, blob([0.1, 0.022, 0.03], m.plano(1), { pos: [-0.14, -0.03, 0.05 * s], rot: [0, 0, 12], seg: 10 })));
  rig.add('cauda1', pena(0.08, 0.085, m(1), { rot: [90, 0, 0], pos: [-0.21, 0.01, 0], esp: 0.03 }));
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.12, mole: 1.3 }, {
  idle: { topete: lz([0, 6, 12, -8]) },
  especial: { topete: qz([0, 16, 20, -30, -10, 0]) },
  dano: { topete: qz([30, 12, 0]) },
});

export const pipirim = criatura({
  num: 10, id: 'pipirim', nome: 'Pipirim', porte: 'P', estagio: 'basico', paleta, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
