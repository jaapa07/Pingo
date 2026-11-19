/**
 * 073 · ARIRANHINHA (Rio/Ginga) — filhote de ariranha, a "onça-d'água" que vive em bando barulhento.
 * Traços únicos: corpo comprido chocolate · mancha creme irregular na garganta (cada uma tem a sua) ·
 * rabo grosso que termina em remo achatado · pescoço erguido de periscópio · peixinho azul na boca.
 * Este arquivo também guarda o corpo comum das lontras (075/076 reaproveitam com outra paleta).
 */
import { criatura, quadrupede, animsQuadrupede, blob, pena, par, m, lz, qz, type V3 } from './kits';

export const paletaAriranha = {
  rampas: [
    ['#2c1e2c', '#684434', '#a67a50'], // 0 pelo chocolate
    ['#b69676', '#f4e0b8', '#fffaf0'], // 1 creme da garganta
    ['#1b131d', '#3b292f', '#5f4749'], // 2 nariz, patas e remo do rabo
    ['#2f6ab0', '#5fb4ea', '#d8f4ff'], // 3 água e peixe
  ] as [string, string, string][],
  contorno: '#1e1420',
  extras: { w: '#ffffff', p: '#140e16', f: '#684434' },
};

export interface LontraP { k: number; cabeca: V3; rabo: number; ang: number; barriga?: boolean; tronco?: V3 }

/** Corpo comum de ariranhas e lontras: salsichão de pernas curtas, pescoço erguido, rabo grosso afinando. */
export function corpoLontra(p: LontraP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: p.tronco ?? [0.33 * k, 0.17 * k, 0.17 * k], peito: 1.02,
    pernas: { alt: 0.11 * k, r: 0.058 * k, xF: 0.6, xT: -0.6, z: 0.66, pe: [0.085 * k, 0.03 * k, 0.08 * k] },
    pescoco: { len: 0.25 * k, ang: p.ang, r: 0.125 * k, x: 0.72, y: 0.2 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.42, r0: cy * 0.62, r1: cy * 0.5, cai: 4, y: -0.22, nariz: cy * 0.24 },
    orelha: { tipo: 'redonda', alt: cy * 0.3, larg: cy * 0.36, x: -0.4, z: 0.86, abre: 44, deita: -6 },
    cauda: { segs: 4, len: p.rabo, r0: 0.11 * k, r1: 0.035 * k, ang: -14, curva: 16 },
    olho: { r: 0.027, pos: [cx * 0.82, cy * 0.3, cz * 0.6] },
    rampas: { pelo: 0, ...(p.barriga ? { barriga: 1 } : {}), pe: 2, nariz: 2, orelha: 0 },
  });
  // almofadas do bigode
  par((_, s) => kit.rig.add('cabeca', blob([cx * 0.24, cy * 0.26, cz * 0.26], m(p.barriga ? 1 : 0), { pos: [cx * 1.1, -cy * 0.34, cz * 0.3 * s], seg: 10 })));
  return kit;
}

/** peixinho azul num osso próprio (comprido em X, cabeça para +X) */
export function peixinho(rig: ReturnType<typeof corpoLontra>['rig'], pai: string, pos: V3, k: number, rot: V3 = [0, 0, 0]) {
  rig.bone('peixe', pai, pos, rot);
  rig.add('peixe', blob([0.1 * k, 0.045 * k, 0.03 * k], m(3), { seg: 12 }), pena(0.07 * k, 0.09 * k, m.sombra(3), { esp: 0.02 * k, pos: [-0.08 * k, 0, 0], ponta: 1.3 }), blob([0.05 * k, 0.02 * k, 0.032 * k], m.luz(3), { pos: [0.01 * k, -0.02 * k, 0], seg: 8 }));
}

function build() {
  const { rig, ref } = corpoLontra({ k: 1, cabeca: [0.18, 0.16, 0.17], rabo: 0.5, ang: 66 });
  // mancha creme da garganta: três pedaços irregulares
  rig.add('pescoco', blob([0.08, 0.12, 0.115], m(1), { pos: [0.1, 0.12, 0], seg: 12 }), blob([0.055, 0.06, 0.055], m(1), { pos: [0.13, 0.0, 0.07], seg: 8 }));
  rig.add('cabeca', blob([0.07, 0.04, 0.1], m(1), { pos: [0.1, -0.13, 0], seg: 10 }));
  // remo do rabo
  rig.add('cauda4', blob([0.1, 0.028, 0.075], m(2), { pos: [-0.07, 0, 0], seg: 12 }));
  peixinho(rig, 'cabeca', [ref.pontaFocinho[0] + 0.02, ref.pontaFocinho[1] - 0.045, 0], 0.9, [0, 90, -10]);
  return rig;
}

const anims = animsQuadrupede({ u: 0.6, hPerna: 0.11, mole: 1.2, cauda: 0.6 }, {
  idle: { peixe: lz([0, 8, 0, -8]) },
  dano: { peixe: qz([-30, -10, 0]) },
});

export const ariranhinha = criatura({
  num: 73, id: 'ariranhinha', nome: 'Ariranhinha', porte: 'P', estagio: 'basico', paleta: paletaAriranha, build, anims,
  olho: { frente: ['.ww.', 'wppw', 'wpww', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['w', 'p'] },
});
