/**
 * 167 · ANDORIM (Vento/Pedra) — andorinhão-de-coleira filhote, que dorme agarrado ao paredão.
 * Traços: coleira branca inteira no pescoço, como a do andorinhão-de-coleira · asas-foice compridas demais
 * cruzadas atrás · bico minúsculo de boca larga · agarrado a uma lasca de pedra · cauda curta em forquilha.
 */
import { criatura, ave, animsAve, blob, calota, pena, par, m, lz, qz, D2R } from './kits';
import { pedra } from './165-mocozim';

export const paletaAndor = {
  rampas: [
    ['#1f2238', '#3d4560', '#6e7c98'], // 0 plumagem fuligem-azulada
    ['#aab4c8', '#f2f5fa', '#ffffff'], // 1 coleira branca
    ['#3a3348', '#6c647c', '#a8a0b0'], // 2 pedra do paredão, bico e pés
    ['#2f7f9c', '#62c8dc', '#c6f4f6'], // 3 água da cachoeira
  ] as [string, string, string][],
  contorno: '#171a2c',
  extras: { w: '#ffffff', p: '#171a2c', f: '#3d4560' },
};

function build() {
  const { rig } = ave({
    corpo: [0.23, 0.2, 0.19], ergue: 40,
    pescoco: { len: 0.07, ang: 60, r: 0.13 },
    cabeca: [0.21, 0.19, 0.2],
    bico: { len: 0.07, r: 0.05, y: -0.2, achata: 1.5, inferior: 0.9 },
    asa: { len: 0.4, larg: 0.19, cai: 4, ponta: 0.7 },
    cauda: { len: 0.26, larg: 0.09, ang: -16, penas: 2, abre: 30 },
    pernas: { alt: 0.1, r: 0.03, z: 0.5, dedo: 0.08 },
    olho: { r: 0.034, pos: [0.12, 0.02, 0.15] },
    rampas: { corpo: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  // coleira branca inteira
  rig.add('pescoco', calota([0.2, 0.19, 0.21], m.luz(1), { de: 30, ate: 128, rot: [0, 0, 60], pos: [-0.01, -0.03, 0] }));
  rig.add('tronco', blob([0.09, 0.1, 0.13], m(1), { pos: [0.17, -0.04, 0], seg: 12 }));
  // asas-foice cruzadas, apontando para cima e para trás
  par((l, s) => { rig.bones['asa_' + l].rotation.set(0, 14 * s * D2R, -38 * D2R); rig.add('asa2_' + l, pena(0.26, 0.07, m.sombra(0), { esp: 0.04, pos: [-0.14, 0.02, 0], rot: [0, 0, -14] })); });
  // lasca de pedra onde se agarra
  rig.bones.corpo.position.y += 0.12;
  rig.add('base', pedra([0.3, 0.14, 0.28], m(2), [0.02, 0.06, 0], [0, 24, 6]), pedra([0.13, 0.1, 0.13], m.luz(2), [-0.18, 0.05, 0.12], [10, 50, 0]));
  // respingo da cachoeira na lasca
  rig.add('base', blob([0.07, 0.035, 0.09], m(3), { pos: [0.24, 0.1, -0.12], seg: 8 }), blob([0.035, 0.045, 0.035], m.luz(3), { pos: [0.3, 0.2, -0.16], seg: 6 }), blob([0.028, 0.035, 0.028], m.luz(3), { pos: [0.2, 0.26, -0.26], seg: 6 }));
  rig.add('cabeca', blob([0.07, 0.05, 0.1], m.luz(0), { pos: [0.1, 0.11, 0], seg: 10 }));
  return rig;
}

// asas-foice compridas: batem em Rz (o abrir do kit estoura a célula)
const bate = (v: number[]) => ({ asa_d: qz(v), asa_e: qz(v) });
const anims = animsAve({ u: 0.6, hPerna: 0.1, mole: 1.2 }, {
  idle: { cabeca: lz([0, 3, 6, 2]) },
  entrada: bate([-24, 16, -10, 4, 0]),
  fisico: bate([-8, -20, 24, 8, 0]),
  especial: { cabeca: qz([0, -4, -6, 8, 3, 0]), ...bate([0, -12, -18, 26, 10, 0]) },
  dano: bate([-16, -6, 0]),
  desmaio: bate([0, 8, 20, 34, 32]),
});

export const andorim = criatura({
  num: 167, id: 'andorim', nome: 'Andorim', porte: 'P', estagio: 'basico', paleta: paletaAndor, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['w', 'p'] },
});
