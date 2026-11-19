/**
 * 059 · OURIÇO-MIRIM (Comum) — filhote de ouriço-cacheiro, bola de espinhos de nariz de batata.
 * Traços únicos: espinhos creme espetados para tudo que é lado · narigão rosa redondo · patinhas rosa de agarrar galho ·
 * rabo pelado que enrola · um cajuzinho espetado nas costas.
 */
import { criatura, quadrupede, animsQuadrupede, blob, spike, par, m, lz, ls, qs, qz, type V3 } from './kits';

export const paletaOurico = {
  rampas: [
    ['#35263a', '#6c5048', '#a08462'], // 0 pelo castanho-escuro
    ['#b88c48', '#f2d880', '#fffbd2'], // 1 espinhos creme
    ['#9e485a', '#ec8c94', '#ffc9c0'], // 2 rosa do nariz, patas e rabo
    ['#a8382a', '#f07a3a', '#ffc462'], // 3 caju
  ] as [string, string, string][],
  contorno: '#241826',
  extras: { w: '#ffffff', p: '#201424', f: '#6c5048' },
};

export interface OuricoP { k: number; tronco: V3; cabeca: V3; alt: number; rabo: number }
export type Mat = ReturnType<typeof m>;

/** Corpo comum da linha: bola castanha, narigão rosa, patas rosa, rabo pelado enrolado. */
export function corpoOurico(p: OuricoP) {
  const [cx, cy, cz] = p.cabeca, k = p.k;
  return quadrupede({
    tronco: p.tronco, peito: 0.92,
    pernas: { alt: p.alt, r: 0.055 * k, rFim: 0.05 * k, xF: 0.55, xT: -0.5, z: 0.62, pe: [0.075 * k, 0.035 * k, 0.065 * k] },
    pescoco: { len: 0.09 * k, ang: 10, r: 0.13 * k, x: 0.7, y: 0 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.5, r0: cy * 0.62, r1: cy * 0.5, cai: 6, y: -0.2, nariz: cy * 0.42 },
    orelha: { tipo: 'redonda', alt: cy * 0.4, larg: cy * 0.4, x: -0.3, z: 0.8, abre: 40, deita: -6 },
    cauda: { segs: 4, len: p.rabo, r0: 0.05 * k, r1: 0.03 * k, ang: -30, curva: 46 },
    olho: { r: 0.028, pos: [cx * 0.74, cy * 0.28, cz * 0.7] },
    rampas: { pelo: 0, barriga: 0, nariz: 2, pe: 2, canelaF: 0, canelaT: 0, orelha: 2, cauda: 2 },
  });
}

/**
 * Espinhos sobre o elipsoide do tronco: cada item é [x, z] em frações dos semi-eixos (−1..1); o espinho nasce
 * na superfície e aponta para fora e para trás. `mat(i)` escolhe o material de cada um.
 */
export function espinhos(rig: ReturnType<typeof corpoOurico>['rig'], osso: string, r: V3, pts: (readonly [number, number])[], len: number, raio: number, mat: (i: number) => Mat, k = 1) {
  pts.forEach(([fx, fz], i) => {
    const fy = Math.sqrt(Math.max(0.04, 1 - fx * fx - fz * fz));
    const L = len * (0.85 + 0.3 * ((i * 7) % 5) / 4) * k;
    rig.add(osso, spike(L, raio, mat(i), { pos: [fx * r[0], fy * r[1] * 0.86, fz * r[2] * 0.9], rot: [fz * 62, 0, 26 - fx * 46] }));
  });
}
export const GRADE: (readonly [number, number])[] = [[0.62, 0], [0.5, 0.5], [0.5, -0.5], [0.2, 0.28], [0.2, -0.28], [0.12, 0.74], [0.12, -0.74], [-0.14, 0], [-0.2, 0.52], [-0.2, -0.52], [-0.5, 0.26], [-0.5, -0.26], [-0.52, 0.7], [-0.52, -0.7], [-0.82, 0], [-0.8, 0.44], [-0.8, -0.44]];

function build() {
  const T: V3 = [0.23, 0.2, 0.21];
  const { rig } = corpoOurico({ k: 1, tronco: T, cabeca: [0.16, 0.14, 0.145], alt: 0.09, rabo: 0.36 });
  espinhos(rig, 'corpo', T, GRADE, 0.17, 0.042, (i) => (i % 3 === 1 ? m.luz(1) : m(1)));
  // topete de espinhos curtos na cabeça
  for (const [x, z, t] of [[0.02, 0, 10], [-0.05, 0.07, 30], [-0.05, -0.07, 30]] as const) rig.add('cabeca', spike(0.1, 0.034, m(1), { pos: [x, 0.11, z], rot: [z * 300, 0, t] }));
  // cajuzinho espetado (osso próprio)
  rig.bone('caju', 'corpo', [-0.02, 0.33, 0.02], [0, 0, 14]);
  rig.add('caju', blob([0.065, 0.085, 0.065], m(3), { seg: 12 }), blob([0.035, 0.03, 0.045], m.sombra(0), { pos: [0.01, 0.1, 0], seg: 8 }), blob([0.025, 0.03, 0.025], m.luz(3), { pos: [0.03, 0.03, -0.04], seg: 6 }));
  // bochechas claras
  par((_, s) => rig.add('cabeca', blob([0.045, 0.04, 0.03], m.luz(0), { pos: [0.1, -0.05, 0.12 * s], seg: 8 })));
  return rig;
}

const anims = animsQuadrupede({ u: 0.5, hPerna: 0.09, mole: 1.3, cauda: 0.5 }, {
  idle: { caju: lz([0, 4, 8, 2]) },
  // eriça: o corpo incha e o caju pula
  especial: { corpo: qs([1, 0.94, 0.9, 1.2, 1.08, 1]), caju: qz([0, -10, -14, 24, 8, 0]) },
  dano: { caju: qz([-26, -8, 0]) },
});

export const ouricoMirim = criatura({
  num: 59, id: 'ourico-mirim', nome: 'Ouriço-Mirim', porte: 'P', estagio: 'basico', paleta: paletaOurico, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
void ls;
