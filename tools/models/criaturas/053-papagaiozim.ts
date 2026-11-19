/**
 * 053 · PAPAGAIOZIM (Comum/Vento) — papagaio-verdadeiro tagarela, que repete tudo com a cabeça de lado.
 * Traços únicos: testa azul e cara amarela · ombro vermelho na asa verde · bico negro em gancho ·
 * cabeça sempre inclinada de curioso · cauda curta quadrada de ponta vermelha.
 */
import { asasContidas } from './051-ararinha';
import { criatura, ave, animsAve, blob, calota, pena, par, m, lr, lz, qz, D2R, unirExtras } from './kits';

export const paletaPapagaio = {
  rampas: [
    ['#1d6648', '#4ab846', '#b2ea66'], // 0 verde
    ['#c8801e', '#f8cc34', '#fff2a8'], // 1 amarelo da cara
    ['#1b1727', '#3b354e', '#6c6688'], // 2 bico e pés
    ['#3b7ae2', '#e8392f', '#ff9a70'], // 3 trio chapado: azul da testa (sombra) · vermelho do ombro (base)
  ] as [string, string, string][],
  contorno: '#14262e',
  extras: { w: '#ffffff', p: '#15121f', f: '#f8cc34', a: '#f08a2c' },
};

/** Cabeça e cores comuns da linha (testa azul, cara amarela, ombro vermelho). */
export function pintaPapagaio(rig: ReturnType<typeof ave>['rig'], h: number, asa: number) {
  rig.add('cabeca', calota([h * 1.05, h * 1.0, h * 1.0], m(1), { de: 0, ate: 84, rot: [0, 0, -78] }));
  rig.add('cabeca', blob([h * 0.4, h * 0.3, h * 0.6], m.sombra(3), { pos: [h * 0.62, h * 0.42, 0], rot: [0, 0, -40], seg: 12 }));
  par((l, s) => {
    rig.add('asa_' + l, blob([asa * 0.26, asa * 0.2, asa * 0.14], m.plano(3), { pos: [-asa * 0.1, asa * 0.06, asa * 0.1 * s], seg: 12 }));
    rig.add('asa2_' + l, pena(asa * 0.3, asa * 0.14, m.sombra(3), { esp: asa * 0.1, pos: [-asa * 0.14, 0, asa * 0.04 * s] }));
  });
  rig.add('cauda1', pena(0.1, 0.1, m.plano(3), { esp: 0.035, rot: [90, 0, 0], pos: [-0.1, 0.01, 0] }));
}

function build() {
  const { rig } = ave({
    corpo: [0.21, 0.2, 0.19], ergue: 52,
    pescoco: { len: 0.07, ang: 74, r: 0.14 },
    cabeca: [0.19, 0.18, 0.18],
    bico: { len: 0.13, r: 0.095, y: -0.16, gancho: 62, achata: 0.72, inferior: 0.5 },
    asa: { len: 0.29, larg: 0.18, cai: 24, ponta: 0.42 },
    cauda: { len: 0.2, larg: 0.11, ang: -10, penas: 3, abre: 14 },
    pernas: { alt: 0.08, r: 0.03, z: 0.5, dedo: 0.085 },
    olho: { r: 0.028, pos: [0.11, 0.035, 0.15] },
    rampas: { corpo: 0, peito: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  pintaPapagaio(rig, 0.18, 0.29);
  // peito mais claro e cabeça de lado
  rig.add('tronco', blob([0.13, 0.15, 0.15], m.luz(0), { pos: [0.08, -0.03, 0], seg: 14 }));
  rig.bones.cabeca.rotation.x = -16 * D2R;
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.08, mole: 1.3 }, unirExtras(asasContidas, {
  // inclina a cabeça para um lado e para o outro, tagarelando
  idle: { cabeca: lr([[0, 0, 0], [8, 0, 0], [30, 0, 0], [22, 0, 0]]), mandibula: lz([0, -16, 0, -16]) },
  especial: { mandibula: qz([0, -20, 0, -30, -10, 0]) },
}));

export const papagaiozim = criatura({
  num: 53, id: 'papagaiozim', nome: 'Papagaiozim', porte: 'P', estagio: 'basico', paleta: paletaPapagaio, build, anims,
  olho: {
    frente: ['.pp.', 'pawp', 'paap', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
