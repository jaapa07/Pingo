/**
 * 069 · JAGUATIRIM (Comum) — jaguatirica filhote, caçadora da noite.
 * Traços únicos: orelhas grandes de costas escuras com pinta clara · duas listras na testa ·
 * cauda comprida anelada erguida em gancho · rosetas alongadas no dorso · olhão de íris verde.
 */
import { criatura, quadrupede, animsQuadrupede, blob, par, m, lz, type Mat, type Rig, type V3 } from './kits';

export const paletaJaguatirica = {
  rampas: [
    ['#8a5a4a', '#d6a35c', '#f4d890'], // 0 pelo areia-dourado
    ['#2c1c30', '#4c3140', '#775262'], // 1 rosetas, listras e anéis
    ['#bfa58e', '#f6e8cc', '#fffaf0'], // 2 creme do focinho, peito e barriga
    ['#2a7c84', '#52c8b8', '#c2f6e0'], // 3 verde-água espectral (olhos; no adulto, a parte que some)
  ] as [string, string, string][],
  contorno: '#2a1a2c',
  extras: { w: '#ffffff', p: '#2a1a2c', f: '#d6a35c', a: '#52c8b8' },
};

/**
 * Pintas sobre um elipsoide: cada item é [fx, phi, escala] — fx = posição ao longo de X (−1..1),
 * phi = graus em volta do eixo X a partir do topo (+ = lado direito). `miolo` põe um centro claro (roseta).
 */
export function pintas(rig: Rig, osso: string, centro: V3, raios: V3, itens: [number, number, number?][], r: number, mat: Mat, miolo?: Mat, alonga = 1) {
  for (const [fx, phi, k = 1] of itens) {
    const q = Math.sqrt(Math.max(0, 1 - fx * fx)), a = (phi * Math.PI) / 180;
    const p: V3 = [centro[0] + raios[0] * fx * 0.97, centro[1] + raios[1] * q * Math.cos(a) * 0.97, centro[2] + raios[2] * q * Math.sin(a) * 0.97];
    rig.add(osso, blob([r * k * alonga, r * k, r * k], mat, { pos: p, seg: 10, castShadow: false }));
    if (miolo) rig.add(osso, blob([r * k * alonga * 0.55, r * k * 0.55, r * k * 0.55], miolo, { pos: [centro[0] + (p[0] - centro[0]) * 1.045, centro[1] + (p[1] - centro[1]) * 1.07, centro[2] + (p[2] - centro[2]) * 1.07], seg: 8, castShadow: false }));
  }
}
/** Os dois lados de uma lista de pintas. */
export const dosDois = (v: [number, number, number?][]): [number, number, number?][] => v.flatMap(([x, p, k]) => (p === 0 ? [[x, p, k]] : [[x, p, k], [x, -p, k]]) as [number, number, number?][]);

export interface JaguaP { k: number; tronco: V3; pernas: number; cabeca: V3; orelha: number; cauda: number }

export function corpoJaguatirica(p: JaguaP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: p.tronco, peito: 1.06,
    pernas: { alt: p.pernas, r: 0.058 * k, rFim: 0.05 * k, xF: 0.6, xT: -0.6, z: 0.6, dobraT: -26, pe: [0.075 * k, 0.04 * k, 0.065 * k] },
    pescoco: { len: 0.13 * k, ang: 48, r: 0.105 * k, x: 0.66, y: 0.3 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.36, r0: cy * 0.48, r1: cy * 0.36, cai: 12, y: -0.32, nariz: cy * 0.16 },
    orelha: { tipo: 'ponta', alt: p.orelha, larg: p.orelha * 0.82, x: -0.15, z: 0.62, abre: 24, deita: 6 },
    cauda: { segs: 4, len: p.cauda, r0: 0.05 * k, r1: 0.045 * k, ang: 20, curva: -24 },
    olho: { r: 0.03, pos: [cx * 0.98, cy * 0.14, cz * 0.6] },
    rampas: { pelo: 0, barriga: 2, focinho: 2, nariz: 1, orelha: 1, orelhaDentro: 2, pe: 0, cauda: 0, caudaPonta: 1 },
  });
  const rig = kit.rig;
  // duas listras na testa, bochechas creme e pinta clara nas costas da orelha
  par((l, s) => {
    rig.add('cabeca', blob([cx * 0.42, cy * 0.1, cz * 0.1], m.plano(1), { pos: [cx * 0.5, cy * 0.86, cz * 0.22 * s], rot: [0, 0, -24], seg: 8 }));
    rig.add('cabeca', blob([cx * 0.3, cy * 0.26, cz * 0.2], m(2), { pos: [cx * 0.66, -cy * 0.36, cz * 0.62 * s], seg: 10 }));
    rig.add('cabeca', blob([cx * 0.3, cy * 0.07, cz * 0.1], m.plano(1), { pos: [cx * 0.4, -cy * 0.1, cz * 0.94 * s], rot: [0, -20 * s, 10], seg: 8 }));
    rig.add('orelha_' + l, blob([p.orelha * 0.12, p.orelha * 0.2, p.orelha * 0.1], m.luz(2), { pos: [-p.orelha * 0.16, p.orelha * 0.42, 0], seg: 8 }));
  });
  // anéis da cauda
  const sl = p.cauda / 4;
  for (const c of [1, 2, 3]) rig.add('cauda' + c, blob([0.028 * k, 0.062 * k, 0.062 * k], m.plano(1), { pos: [-sl * 0.55, 0, 0], seg: 10 }));
  return kit;
}

function build() {
  const tr: V3 = [0.25, 0.17, 0.155];
  const { rig } = corpoJaguatirica({ k: 1, tronco: tr, pernas: 0.24, cabeca: [0.2, 0.18, 0.19], orelha: 0.19, cauda: 0.56 });
  pintas(rig, 'corpo', [0, 0, 0], tr, dosDois([[0.45, 50], [0.05, 40], [-0.4, 48], [-0.15, 82, 0.9], [0.3, 88, 0.8], [-0.62, 80, 0.8], [0.1, 0, 0.8], [-0.4, 0, 0.8]]), 0.04, m.plano(1), undefined, 1.5);
  return rig;
}

const anims = animsQuadrupede({ u: 0.8, hPerna: 0.24, mole: 1.1, cauda: 0.8 }, {
  idle: { cauda3: lz([0, -8, -14, -5]) },
});

export const jaguatirim = criatura({
  num: 69, id: 'jaguatirim', nome: 'Jaguatirim', porte: 'P', estagio: 'basico', paleta: paletaJaguatirica, build, anims,
  olho: {
    frente: ['.ppp.', 'paawp', 'pappp', 'paapp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
