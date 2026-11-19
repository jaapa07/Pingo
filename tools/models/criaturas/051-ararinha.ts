/**
 * 051 · ARARINHA (Vento) — filhote de arara-canindé, azul por cima e amarela por baixo.
 * Traços únicos: cara branca pelada com babador negro · testa verde · bico negro em gancho maior que o rosto ·
 * cauda comprida azul com forro amarelo · penugem arrepiada no cocuruto.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, par, m, lz, qz, qr, unirExtras, type V3 } from './kits';

export const paletaArara = {
  rampas: [
    ['#1f3a8c', '#3a82da', '#8ccaf8'], // 0 azul das costas, asas e cauda
    ['#c8781e', '#f8c830', '#fff0a0'], // 1 amarelo do peito
    ['#1b1727', '#39334a', '#6a6482'], // 2 bico, babador e pés negros
    ['#34a85c', '#f6f1e8', '#ffffff'], // 3 trio chapado: verde da testa (sombra) · branco da cara (base)
  ] as [string, string, string][],
  contorno: '#171a36',
  extras: { w: '#ffffff', p: '#15121f', f: '#f6f1e8', a: '#f8c830' },
};

/** Asas contidas: as do kit abrem até 85° e encolhem o sprite; aqui abrem até a metade (vale para araras, papagaios e urubus). */
const abre = (v: [number, number][]) => ({ asa_d: qr(v.map(([a, b]) => [-b, a, 0] as V3)), asa_e: qr(v.map(([a, b]) => [b, -a, 0] as V3)) });
export const asasContidas = {
  entrada: abre([[36, 22], [42, -6], [28, 12], [10, 2], [0, 0]]),
  fisico: abre([[12, 6], [22, 16], [16, -6], [6, 0], [0, 0]]),
  especial: abre([[16, 8], [30, 22], [38, 30], [44, -12], [26, 8], [0, 0]]),
  dano: abre([[28, 14], [10, 4], [0, 0]]),
  desmaio: abre([[6, 0], [14, 6], [22, 2], [28, -4], [26, -2]]),
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.2, 0.19, 0.18], ergue: 56,
    pescoco: { len: 0.08, ang: 76, r: 0.13 },
    cabeca: [0.18, 0.17, 0.17],
    bico: { len: 0.15, r: 0.1, y: -0.2, gancho: 64, achata: 0.7, inferior: 0.5 },
    asa: { len: 0.28, larg: 0.17, cai: 26, ponta: 0.5 },
    cauda: { len: 0.42, larg: 0.085, ang: -34, penas: 3, abre: 9 },
    pernas: { alt: 0.09, r: 0.03, z: 0.5, dedo: 0.085 },
    olho: { r: 0.028, pos: [0.1, 0.03, 0.145] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  // testa verde, cara branca, babador negro
  rig.add('cabeca', calota([0.19, 0.18, 0.18], m.sombra(3), { de: 0, ate: 50, rot: [0, 0, -50] }));
  par((l, s) => {
    rig.add('cabeca', blob([0.09, 0.1, 0.05], m.plano(3), { pos: [0.085, -0.01, 0.125 * s], seg: 14 }));
    rig.add('cabeca', blob([0.05, 0.014, 0.03], m.plano(2), { pos: [0.07, -0.065, 0.16 * s], seg: 6, castShadow: false }));
    // bochecha amarela descendo para o peito e forro amarelo da asa
    rig.add('pescoco', blob([0.08, 0.1, 0.07], m(1), { pos: [0.05, 0.0, 0.08 * s], seg: 12 }));
    rig.add('asa2_' + l, pena(0.12, 0.05, m.luz(0), { esp: 0.04, pos: [-0.04, 0.02, 0.02 * s] }));
  });
  rig.add('cabeca', blob([0.07, 0.06, 0.12], m(2), { pos: [0.1, -0.14, 0], seg: 12 }));
  // forro amarelo da cauda
  rig.add('cauda1', pena(0.34, 0.07, m(1), { esp: 0.03, rot: [90, 0, 0], pos: [0.0, -0.03, 0] }));
  // penugem arrepiada
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.02, 0], [0, 0, 26]);
  rig.add('topete', tufo(3, 0.09, 0.04, m(0), { abre: 30 }));
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.09, mole: 1.3 }, unirExtras(asasContidas, {
  idle: { topete: lz([0, 6, 12, -4]) },
  especial: { topete: qz([0, 16, 22, -28, -10, 0]) },
  dano: { topete: qz([28, 10, 0]) },
}));

export const ararinha = criatura({
  num: 51, id: 'ararinha', nome: 'Ararinha', porte: 'P', estagio: 'basico', paleta: paletaArara, build, anims,
  olho: {
    frente: ['.pp.', 'pawp', 'paap', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
