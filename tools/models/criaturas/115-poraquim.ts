/**
 * 115 · PORAQUIM (Rio/Trovão) — poraquê filhote, enguia roliça de papo laranja.
 * Traços únicos: cabeça chata e larga de sorriso comprido · papo e barriga cor de laranja ·
 * três pilhas amarelas no lombo que acendem · raiozinho na ponta da cauda.
 */
import { criatura, serpente, animsSerpente, blob, slab, m, ls, qs, lz, type V2, type V3, type Mat } from './kits';

export const paletaPoraque = {
  rampas: [
    ['#262a48', '#46566e', '#7892a0'], // 0 couro cinza-azeitona
    ['#a23c22', '#ef8a2e', '#ffd27a'], // 1 laranja do papo
    ['#c99a00', '#ffe23c', '#fffdc8'], // 2 amarelo elétrico
    ['#2f8fd0', '#8fe2ff', '#ffffff'], // 3 faísca azulada
  ] as [string, string, string][],
  contorno: '#1c1c38',
  extras: { w: '#ffffff', p: '#1c1c38', f: '#46566e' },
};

/** Raio em zigue-zague, chapado, nascendo na origem e subindo em +Y. */
export function raio(len: number, larg: number, mat: Mat, o: { pos?: V3; rot?: V3 } = {}) {
  const w = larg / 2;
  const pts: V2[] = [[-w * 0.5, 0], [w * 1.3, len * 0.5], [w * 0.1, len * 0.5], [w * 1.1, len], [-w * 1.3, len * 0.4], [-w * 0.1, len * 0.4], [-w * 1.2, 0]];
  return slab(pts, larg * 0.22, mat, { ...o, smooth: false, bevel: larg * 0.04, castShadow: false });
}

/** Pisca-pisca: cada pilha incha num quadro diferente. */
export const pisca = (ossos: string[]) => Object.fromEntries(ossos.map((o, i) => {
  const v: (V3 | number)[] = [1, 1.25, 0.9, 1.1];
  return ['?' + o, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])];
}));

function build() {
  const { rig, ref } = serpente({
    r: 0.135,
    pescoco: { segs: 3, len: 0.13, curva: [56, 24, 6], rFim: 0.13 },
    cauda: { segs: 5, len: 0.13, curva: [30, -60, -50, 70, 60], rFim: 0.06 },
    cabeca: [0.2, 0.15, 0.19],
    olho: { r: 0.034, pos: [0.17, 0.07, 0.14] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  // três pilhas amarelas (ossos próprios para piscar)
  const pilhas: [string, string, V3][] = [['pilha1', 'pescoco2', [0.05, 0.125, 0]], ['pilha2', 'cauda1', [-0.07, 0.12, 0]], ['pilha3', 'cauda3', [-0.07, 0.06, 0]]];
  for (const [nome, osso, pos] of pilhas) { rig.bone(nome, osso, pos); rig.add(nome, blob([0.05, 0.04, 0.05], m.plano(2), { seg: 12 }), blob([0.025, 0.02, 0.025], m.luz(2), { pos: [0, 0.025, 0], seg: 8 })); }
  // raiozinho na ponta da cauda
  rig.bone('faisca', 'cauda5', [ref.fimCauda[0] * 1.05, -0.05, 0], [0, 0, 20]);
  rig.add('faisca', raio(0.24, 0.16, m.plano(2)), blob([0.04, 0.04, 0.04], m.luz(2), { seg: 8 }));
  // bochechas laranja
  rig.add('cabeca', blob([0.06, 0.04, 0.17], m.plano(1), { pos: [0.12, -0.04, 0], seg: 10 }));
  return rig;
}

const anims = animsSerpente({ u: 0.5, pescoco: 3, cauda: 5, mole: 1 }, {
  todas: pisca(['pilha1', 'pilha2', 'pilha3']),
  idle: { faisca: lz([0, 10, -6, 4]) },
  especial: { faisca: qs([1, 1.1, 1.2, 1.5, 1.2, 1]), pilha1: qs([1, 1.3, 1.6, 2, 1.3, 1]), pilha2: qs([1, 1.3, 1.6, 2, 1.3, 1]), pilha3: qs([1, 1.3, 1.6, 2, 1.3, 1]) },
});

export const poraquim = criatura({
  num: 115, id: 'poraquim', nome: 'Poraquim', porte: 'P', estagio: 'basico', paleta: paletaPoraque, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
