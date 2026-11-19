/**
 * 160 · MINHOCÃO (Terra/Lenda) — o minhocão das lendas, que abre valas e derruba barrancos. Estágio final.
 * Mantém da linha: anéis rosa em dois tons, clitelo creme, barro na cabeça.
 * Cresce: brota de um monte de terra revirada · placas de pedra ao longo do dorso · bocarra redonda com
 * coroa de dentes · dois tentáculos-chifre na testa · a cauda sai de um segundo buraco atrás.
 */
import { criatura, serpente, animsSerpente, blob, ring, spike, tube, par, m, lz, qz, ls, type V3 } from './kits';
import { paletaMinhoca } from './159-minhocucu';

function build() {
  const { rig } = serpente({
    r: 0.2,
    pescoco: { segs: 4, len: 0.25, curva: [78, 14, -24, -34], rFim: 0.18 },
    cauda: { segs: 3, len: 0.2, curva: [20, -30, 24], rFim: 0.08 },
    cabeca: [0.2, 0.19, 0.2],
    olho: { r: 0.032, pos: [0.14, 0.12, 0.155] },
    rampas: { corpo: 0, anel: 1, barriga: 2, cabeca: 0 },
  });
  // a cauda brota de um segundo buraco: sobe em arco atrás do corpo
  rig.bones.cauda1.position.set(-0.52, -0.1, 0.1); rig.bones.cauda1.rotation.set(0, 0.3, -1.25);
  rig.bones.cauda2.rotation.set(0, 0, -0.6); rig.bones.cauda3.rotation.set(0, 0, -0.7);
  // montes de terra revirada (no chão, não respiram com o corpo)
  const monte: [V3, V3, number][] = [[[0.34, 0.14, 0.36], [0, 0.02, 0], 3], [[0.16, 0.1, 0.15], [0.26, 0.03, 0.2], 3], [[0.15, 0.09, 0.14], [0.2, 0.02, -0.26], 3], [[0.14, 0.1, 0.14], [-0.22, 0.03, 0.26], 3], [[0.22, 0.11, 0.22], [-0.5, 0.02, 0.08], 3], [[0.1, 0.07, 0.1], [-0.3, 0.03, -0.2], 3]];
  for (const [r, pos] of monte) rig.add('base', blob(r, m(3), { pos, seg: 14 }));
  for (const pos of [[0.36, 0.1, 0.02], [-0.06, 0.13, 0.3], [-0.6, 0.1, 0.22]] as V3[]) rig.add('base', blob([0.07, 0.05, 0.07], m.luz(3), { pos, seg: 8 }));
  // clitelo e placas de pedra no dorso de cada segmento
  rig.add('pescoco3', blob([0.1, 0.205, 0.21], m(2), { pos: [0.12, 0, 0], seg: 16 }));
  for (const [o, k] of [['pescoco1', 1], ['pescoco2', 0.95], ['pescoco4', 0.85]] as const)
    rig.add(o, blob([0.1, 0.07, 0.15 * k], m(3), { pos: [0.13, 0.17 * k, 0], seg: 10 }), spike(0.12, 0.05, m.luz(3), { pos: [0.13, 0.2 * k, 0], rot: [0, 0, 20] }));
  for (const o of ['pescoco2', 'pescoco3', 'pescoco4']) rig.add(o, ring(0.19, 0.022, m.sombra(1), { pos: [0.01, 0, 0], rot: [0, 90, 0] }));
  // capacete de barro seco na cabeça
  rig.add('cabeca', blob([0.17, 0.09, 0.18], m(3), { pos: [0.06, 0.16, 0], seg: 12 }));
  // BOCARRA redonda: aro escuro, garganta e coroa de dentes
  rig.add('cabeca', blob([0.07, 0.13, 0.14], m.sombra(1), { pos: [0.27, -0.02, 0], seg: 14 }), ring(0.14, 0.04, m(1), { pos: [0.26, -0.02, 0], rot: [0, 90, 0] }));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.5; rig.add('cabeca', spike(0.08, 0.035, m.luz(2), { pos: [0.28, -0.02 + Math.cos(a) * 0.12, Math.sin(a) * 0.12], rot: [(Math.sin(a) * 180) / Math.PI * -0.6, 0, -90 - Math.cos(a) * 40] })); }
  // tentáculos-chifre da lenda (ossos próprios)
  par((l, s) => {
    rig.bone('tent_' + l, 'cabeca', [0.12, 0.2, 0.1 * s], [18 * s, 0, 0]);
    rig.add('tent_' + l, tube([[0, 0, 0], [0.06, 0.12, 0], [0.16, 0.2, 0], [0.26, 0.2, 0]], (t) => 0.04 * (1 - t * 0.6), m(1), { seg: 10, radial: 8 }), blob([0.04, 0.04, 0.04], m.luz(2), { pos: [0.27, 0.2, 0], seg: 8 }));
  });
  rig.add('cauda3', blob([0.09, 0.08, 0.08], m(3), { pos: [-0.2, -0.1, 0], seg: 10 }));
  return rig;
}

// o pescoço é comprido: as curvas do kit (somadas em 4 juntas) jogariam a cabeça longe; aqui cada junta faz um terço
const P = (v: number[]) => Object.fromEntries([1, 2, 3, 4].map((i) => ['pescoco' + i, qz(v)]));
const anims = animsSerpente({ u: 1.1, pescoco: 4, cauda: 3, mole: 0.4, investida: 0.03 }, {
  entrada: { ...P([-8, 3, -4, 1, 0]) },
  idle: { tent_d: lz([0, 8, 12, 4]), tent_e: lz([4, 12, 8, 0]), cauda2: lz([0, 5, 9, 3]) },
  // recolhe e dá o bote de cima para baixo
  fisico: { ...P([3, 6, -10, -4, 0]), tent_d: qz([10, 24, -30, -10, 0]), tent_e: qz([10, 24, -30, -10, 0]) },
  // ergue-se, escancara a bocarra e ruge
  especial: { ...P([-2, -4, -4, 5, 2, 0]), tent_d: qz([0, 14, 20, -30, -10, 0]), tent_e: qz([0, 14, 20, -30, -10, 0]), cabeca: [...qz([4, 8, 8, -14, -5, 0]), ...ls([1, 1.04, 1.08, 1.2, 1.08, 1])] },
  dano: { ...P([5, 2, 0]), tent_d: qz([30, 12, 0]), tent_e: qz([30, 12, 0]) },
  // desaba enrolando para a frente até a cabeça pousar no monte de terra
  desmaio: { pescoco1: qz([3, -4, -10, -16, -15]), pescoco2: qz([0, -8, -22, -36, -34]), pescoco3: qz([0, -8, -22, -34, -32]), pescoco4: qz([0, -4, -10, -16, -14]), cabeca: qz([0, 4, 10, 16, 14]), cauda1: qz([0, -6, -20, -40, -38]) },
});

export const minhocao = criatura({
  num: 160, id: 'minhocao', nome: 'Minhocão', porte: 'G', estagio: 'final', paleta: paletaMinhoca, build, anims,
  olho: {
    frente: ['pp..', 'pppp', '.wpp', '.ppp'],
    fechado: ['ffff', 'pfff', '.ppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
