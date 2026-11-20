/**
 * 165 · MOCOZIM (Pedra/Comum) — mocó filhote, o preá das pedras do sertão.
 * Traços: corpo de batata sem cauda · garupa ruiva e dorso cinza como o mocó de verdade · bochechas e
 * garganta brancas · orelhinhas redondas · empoleirado num seixo · três pedrinhas cinza no lombo.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, roundBox, par, m, lz, qz, type V3 } from './kits';

export const paletaMoco = {
  rampas: [
    ['#4d4356', '#968b8c', '#d6cbbe'], // 0 pelo cinza-pedra puxado ao pardo (luz quente: some menos na rocha azulada)
    ['#b8a89c', '#f6ecdc', '#ffffff'], // 1 garganta e bochechas brancas
    ['#8a3c2c', '#cf6e36', '#f4a85a'], // 2 garupa e patas ruivas
    ['#33384e', '#5c6680', '#9aa8c0'], // 3 rocha azulada
  ] as [string, string, string][],
  contorno: '#262234',
  extras: { w: '#ffffff', p: '#262234', f: '#968b8c' },
};

export interface MocoP { k: number; tronco: V3; cabeca: V3; pernas: number }
export function corpoMoco(p: MocoP) {
  const k = p.k, [cx, cy, cz] = p.cabeca, tr = p.tronco;
  const kit = quadrupede({
    tronco: tr, peito: 0.9,
    pernas: { alt: p.pernas, r: 0.06 * k, xF: 0.5, xT: -0.5 },
    pescoco: { len: 0.12 * k, ang: 26, r: tr[1] * 0.62 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.42, r0: cy * 0.56, r1: cy * 0.4, nariz: cy * 0.17, cai: 6 },
    orelha: { tipo: 'redonda', alt: cy * 0.46, larg: cy * 0.5, x: -0.2, z: 0.7 },
    olho: { r: 0.036, pos: [cx * 0.88, cy * 0.24, cz * 0.62] },
    rampas: { pelo: 0, barriga: 1, canelaF: 2, canelaT: 2, pe: 2, nariz: 2, orelha: 2, focinho: 0 },
  });
  const rig = kit.rig;
  // garupa ruiva, garganta e bochechas brancas
  // (a garupa desce pelos flancos até a metade do corpo: de frente ela aparece como a mancha ruiva do mocó)
  rig.add('corpo', calota([tr[0] * 0.92, tr[1] * 1.06, tr[2] * 1.07], m(2), { de: 0, ate: 96, pos: [-tr[0] * 0.18, 0, 0], rot: [0, 0, 70] }));
  rig.add('pescoco', blob([0.08 * k, 0.1 * k, 0.11 * k], m(1), { pos: [0.1 * k, -0.02, 0], seg: 12 }));
  par((_, s) => rig.add('cabeca', blob([cx * 0.42, cy * 0.34, cz * 0.28], m(1), { pos: [cx * 0.6, -cy * 0.34, cz * 0.52 * s], seg: 10 })));
  return kit;
}
/** Pedra facetada. */
export const pedra = (t: V3, mat: ReturnType<typeof m>, pos: V3, rot: V3 = [0, 0, 0]) => roundBox(t, Math.min(...t) * 0.22, mat, { pos, rot });

function build() {
  const tr: V3 = [0.25, 0.2, 0.19];
  const { rig } = corpoMoco({ k: 1, tronco: tr, cabeca: [0.2, 0.18, 0.18], pernas: 0.15 });
  // seixo debaixo das patas da frente (ele sempre sobe numa pedra para vigiar)
  rig.add('base', pedra([0.3, 0.12, 0.34], m(3), [0.18, 0.05, 0], [0, 20, 4]));
  rig.bones.perna_fd.position.y += 0.08; rig.bones.perna_fe.position.y += 0.08; rig.bones.corpo.rotation.z = 0.2;
  rig.bones.perna_fd.rotation.z = -0.2; rig.bones.perna_fe.rotation.z = -0.2; rig.bones.perna_td.rotation.z = -0.2; rig.bones.perna_te.rotation.z = -0.2;
  for (const [x, z, r] of [[0.02, 0.06, 0.07], [-0.1, -0.05, 0.06], [0.12, -0.04, 0.05]] as const) rig.add('corpo', pedra([r, r * 0.8, r], m.luz(3), [x, tr[1] * 0.96, z], [10, 30, 8]));
  return rig;
}

const anims = animsQuadrupede({ u: 0.7, hPerna: 0.15, mole: 1.2 }, { idle: { cabeca: lz([0, 3, 6, 2]) }, especial: { cabeca: qz([0, -6, -8, 10, 4, 0]) } });

export const mocozim = criatura({
  num: 165, id: 'mocozim', nome: 'Mocozim', porte: 'P', estagio: 'basico', paleta: paletaMoco, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
