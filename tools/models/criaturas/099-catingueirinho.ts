/**
 * 099 · CATINGUEIRINHO (Comum/Encanto) — veado-catingueiro arisco, de passo tão leve que não amassa a flor.
 * Traços únicos: pernas finas compridas · orelhonas · pintas creme no lombo · rabinho de forro branco em pé ·
 * dois toquinhos de chifre com uma flor rosa presa entre eles.
 */
import { criatura, quadrupede, animsQuadrupede, blob, par, m, lz, ls, qz, type V3 } from './kits';

export const paletaVeado = {
  rampas: [
    ['#683a38', '#c07c46', '#f0ba7a'], // 0 pelo castanho-dourado
    ['#b5a088', '#f6e8cc', '#fffbf0'], // 1 creme da barriga, das pintas e da galhada
    ['#281a26', '#4e363a', '#7c5a52'], // 2 cascos, nariz e pernas do cervo
    ['#4898e0', '#f08ac8', '#fff0fa'], // 3 trio chapado: água (sombra) · flor rosa (base) · brilho (luz)
  ] as [string, string, string][],
  contorno: '#2a1622',
  extras: { w: '#ffffff', p: '#1e1018', f: '#c07c46' },
};

export interface VeadoP { k: number; cabeca: V3; alt: number; pernaEscura?: boolean; pescoco: number }

/** Corpo comum da linha: esguio, pernas finas, orelhonas, rabinho de forro branco. */
export function corpoVeado(p: VeadoP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: [0.25 * k, 0.17 * k, 0.15 * k], peito: 1.06,
    pernas: { alt: p.alt, r: 0.045 * k, rFim: 0.032 * k, xF: 0.62, xT: -0.6, dobraT: -24, pe: [0.045 * k, 0.04 * k, 0.04 * k] },
    pescoco: { len: p.pescoco, ang: 62, r: 0.085 * k, x: 0.64, y: 0.3 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.75, r0: cy * 0.52, r1: cy * 0.34, cai: 12, y: -0.2, nariz: cy * 0.22 },
    orelha: { tipo: 'ponta', alt: cy * 1.4, larg: cy * 0.95, x: -0.3, z: 0.7, abre: 46, deita: -10 },
    cauda: { segs: 1, len: 0.1 * k, r0: 0.05 * k, r1: 0.04 * k, ang: 50 },
    olho: { r: 0.028, pos: [cx * 0.72, cy * 0.26, cz * 0.7] },
    rampas: { pelo: 0, barriga: 1, pe: 2, nariz: 2, orelhaDentro: 1, ...(p.pernaEscura ? { canelaF: 2, canelaT: 2 } : {}) },
  });
  const rig = kit.rig;
  rig.add('cauda1', blob([0.06 * k, 0.03 * k, 0.05 * k], m.luz(1), { pos: [-0.06 * k, -0.03 * k, 0], seg: 8 }));
  rig.add('cabeca', blob([cx * 0.4, cy * 0.22, cz * 0.45], m(1), { pos: [cx * 0.9, -cy * 0.52, 0], seg: 8 }));
  rig.add('pescoco', blob([0.05 * k, p.pescoco * 0.5, 0.07 * k], m(1), { pos: [0.07 * k, p.pescoco * 0.35, 0], rot: [0, 0, -28], seg: 10 }));
  return kit;
}
export function flor(rig: ReturnType<typeof corpoVeado>['rig'], nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; rig.add(nome, blob([r * 0.55, r * 0.3, r * 0.55], m.plano(3), { pos: [Math.cos(a) * r * 0.6, 0, Math.sin(a) * r * 0.6], seg: 8 })); }
  rig.add(nome, blob([r * 0.4, r * 0.4, r * 0.4], m.luz(3), { pos: [0, r * 0.2, 0], seg: 8 }));
}

function build() {
  const { rig, ref } = corpoVeado({ k: 1, cabeca: [0.16, 0.14, 0.135], alt: 0.3, pescoco: 0.2 });
  // pintas creme no lombo
  for (const [x, z] of [[0.1, 0.07], [0.1, -0.07], [-0.04, 0.1], [-0.04, -0.1], [-0.16, 0.06], [-0.16, -0.06], [0.0, 0.0]] as const)
    rig.add('corpo', blob([0.028, 0.02, 0.028], m.plano(1), { pos: [x, 0.17 * Math.sqrt(1 - (x / 0.25) ** 2 - (z / 0.15) ** 2), z], seg: 6, castShadow: false }));
  // toquinhos e flor
  par((_, s) => rig.add('cabeca', blob([0.025, 0.05, 0.025], m(1), { pos: [ref.topo[0] - 0.01, ref.topo[1] + 0.02, 0.05 * s], seg: 8 })));
  flor(rig, 'flor', 'cabeca', [ref.topo[0] + 0.0, ref.topo[1] + 0.07, 0], 0.06);
  return rig;
}

const anims = animsQuadrupede({ u: 0.75, hPerna: 0.3, mole: 1.1 }, {
  idle: { flor: ls([1, 1.08, 1.2, 1.08]) },
  especial: { flor: qz([0, 30, 60, 120, 160, 180]) },
});

export const catingueirinho = criatura({
  num: 99, id: 'catingueirinho', nome: 'Catingueirinho', porte: 'P', estagio: 'basico', paleta: paletaVeado, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', 'pwpp', '.pp.'], fechado: ['ffff', 'ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
void lz;
