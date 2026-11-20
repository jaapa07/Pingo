/**
 * 182 · BOREALCE (Geada/Encanto) — alce nórdico de galhada boreal, trazido por uma expedição do norte. Visitante lendário.
 * Traços: galhada larga em pá, de alce, que acende em faixas de aurora verde e violeta · cortinas de aurora
 * subindo das pontas da galhada · pelagem cinza-azulada com geada nos ombros e nas costas · focinho comprido e
 * caído com barbela (o "sino" do alce) · corcova de ombros · pernas longas e claras · cristais de gelo nos cascos.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, slab, spike, tufo, lathe, par, m, lz, qz, ls, type V2, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#2e3558', '#5c6f96', '#9db4cf'], // 0 pelagem cinza-azulada
    ['#8fa6cc', '#e2f0fa', '#ffffff'], // 1 geada, pernas claras, cristais
    ['#1f8f6e', '#4fe0a0', '#c8ffd8'], // 2 aurora verde
    ['#5a3aa8', '#a678f0', '#e6ccff'], // 3 aurora violeta
  ] as [string, string, string][],
  contorno: '#1a1c3a',
  extras: { w: '#ffffff', p: '#1a1c3a', f: '#5c6f96', a: '#4fe0a0' },
};

/** Pá da galhada: palma larga com `n` pontas, no plano XY (cresce em +Y), para pôr num osso inclinado. */
function pa(larg: number, alt: number, n: number, mat: ReturnType<typeof m>, esp = 0.05) {
  const pts: V2[] = [[-larg * 0.12, 0], [-larg * 0.5, alt * 0.38]];
  for (let i = 0; i < n; i++) { const x0 = -larg * 0.5 + (i / n) * larg, x1 = -larg * 0.5 + ((i + 0.5) / n) * larg, x2 = -larg * 0.5 + ((i + 1) / n) * larg; pts.push([x0 + (x1 - x0) * 0.3, alt * 0.62], [x1, alt * (0.9 + 0.1 * Math.cos(i * 1.7))], [x2 - (x2 - x1) * 0.3, alt * 0.6]); }
  pts.push([larg * 0.5, alt * 0.36], [larg * 0.12, 0]);
  return slab(pts, esp, mat);
}

const AURORA = ['aurora_d1', 'aurora_d2', 'aurora_d3', 'aurora_e1', 'aurora_e2', 'aurora_e3'];

function build() {
  const tr: V3 = [0.42, 0.29, 0.24];
  const { rig, ref } = quadrupede({
    tronco: tr, peito: 1.3,
    pernas: { alt: 0.56, r: 0.095, rFim: 0.062, xF: 0.6, xT: -0.64, z: 0.62, dobraF: 6, dobraT: -26, pe: [0.085, 0.055, 0.075] },
    pescoco: { len: 0.3, ang: 34, r: 0.15, x: 0.66, y: 0.3 },
    cabeca: [0.23, 0.2, 0.19],
    focinho: { len: 0.36, r0: 0.15, r1: 0.13, cai: 26, y: -0.2 },
    orelha: { tipo: 'ponta', alt: 0.2, larg: 0.12, x: -0.3, z: 0.7, abre: 56, deita: 30 },
    cauda: { segs: 1, len: 0.1, r0: 0.05, r1: 0.035, ang: -30 },
    olho: { r: 0.034, pos: [0.22, 0.07, 0.155] },
    rampas: { pelo: 0, barriga: 0, canelaF: 1, canelaT: 1, pe: 0, focinho: 0, orelha: 0, orelhaDentro: 1 },
  });
  const pf = ref.pontaFocinho as V3;
  // corcova de ombros com GEADA; manto de geada no dorso e flocos
  rig.add('corpo', blob([0.26, 0.22, 0.23], m(0), { pos: [0.24, 0.22, 0] }));
  rig.add('corpo', calota([0.28, 0.235, 0.245], m(1), { de: 0, ate: 58, pos: [0.24, 0.22, 0] }), calota([0.44, 0.305, 0.25], m(1), { de: 0, ate: 40 }));
  for (const [x, y, z] of [[0.3, 0.2, 0.2], [0.05, 0.18, 0.18], [-0.2, 0.16, 0.18], [0.42, 0.08, 0.19], [-0.34, 0.1, 0.15]] as const) for (const s of [1, -1]) rig.add('corpo', blob([0.04, 0.05, 0.03], m.luz(1), { pos: [x, y, z * s], seg: 8, castShadow: false }));
  // focinho caído: beiço largo claro, narinas e a barbela ("sino")
  rig.add('cabeca', blob([0.14, 0.115, 0.14], m.luz(0), { pos: [pf[0] - 0.02, pf[1] - 0.02, 0], seg: 14 }));
  par((_, s) => rig.add('cabeca', blob([0.025, 0.03, 0.022], m.sombra(0), { pos: [pf[0] + 0.08, pf[1] + 0.02, 0.05 * s], seg: 8 })));
  rig.bone('sino', 'cabeca', [0.12, -0.16, 0]);
  rig.add('sino', lathe([[0.05, 0], [0.065, -0.1], [0.04, -0.2], [0.001, -0.24]], m(0), { seg: 10 }), blob([0.04, 0.04, 0.04], m.luz(1), { pos: [0, -0.22, 0], seg: 8 }));
  // crina do pescoço e peitilho de geada
  rig.add('pescoco', tufo(3, 0.18, 0.08, m.sombra(0), { pos: [0.08, 0.14, 0], rot: [0, 0, 40], abre: 30 }));
  rig.add('pescoco', tufo(3, 0.2, 0.09, m(1), { pos: [0.16, -0.12, 0], rot: [0, 0, 200], abre: 26 }));
  // GALHADA em pá: haste, palma larga de pontas, faixas de aurora verde e violeta
  par((l, s) => {
    rig.bone('galhada_' + l, 'cabeca', [-0.02, 0.16, 0.12 * s], [54 * s, -10 * s, 6]);
    rig.add('galhada_' + l, spike(0.2, 0.06, m.luz(1), {}));
    const p0 = pa(0.72, 0.62, 4, m(1), 0.06); p0.position.set(-0.04, 0.12, 0); rig.add('galhada_' + l, p0);
    const p1 = pa(0.6, 0.42, 4, m.plano(2), 0.075); p1.position.set(-0.04, 0.17, 0); rig.add('galhada_' + l, p1);
    const p2 = pa(0.44, 0.26, 3, m.plano(3), 0.09); p2.position.set(-0.04, 0.2, 0); rig.add('galhada_' + l, p2);
    rig.add('galhada_' + l, spike(0.22, 0.045, m.luz(1), { pos: [0.1, 0.1, 0], rot: [0, 0, -70] }));
    // cortinas de aurora subindo das pontas
    for (let i = 0; i < 3; i++) {
      const nome = 'aurora_' + l + (i + 1);
      rig.bone(nome, 'galhada_' + l, [-0.3 + i * 0.24, 0.66 + (i === 1 ? 0.06 : 0), 0], [-54 * s, 0, -6]);
      rig.add(nome, lathe([[0.05, 0], [0.075, 0.1], [0.05, 0.26], [0.001, 0.4]], i === 1 ? m.plano(3) : m.plano(2), { seg: 8, scale: [1, i === 1 ? 1.1 : 0.85, 0.5] }));
    }
    // cristais de gelo nos cascos e joelhos escuros
    for (const q of ['f', 't']) {
      rig.add('canela_' + q + l, spike(0.14, 0.04, m.luz(1), { pos: [-0.04, -0.17, 0.03 * s], rot: [20 * s, 0, 40] }), spike(0.1, 0.035, m.luz(2), { pos: [0.03, -0.19, 0.04 * s], rot: [30 * s, 0, -30] }));
      rig.add('perna_' + q + l, blob([0.085, 0.065, 0.08], m.sombra(0), { pos: [0, -0.25, 0], seg: 10 }));
    }
  });
  // rabinho claro
  rig.add('cauda1', blob([0.06, 0.05, 0.05], m(1), { pos: [-0.08, 0, 0], seg: 8 }));
  return rig;
}

const brilha = (f: number) => ls([[1, 1, 1], [0.9, 1.2, 0.9], [1.08, 0.86, 1.08], [0.95, 1.1, 0.95]].map((_, k, v) => v[(k + f) % 4] as V3));
const anims = animsQuadrupede({ u: 1.4, hPerna: 0.56, mole: 0.5, passo: 22, cauda: 1 }, {
  todas: Object.fromEntries(AURORA.map((a, i) => [a, brilha(i)])),
  idle: { sino: lz([0, 5, 0, -5]) },
  // chifrada curta: a galhada é enorme, erguer a cabeça 28° encolhia o sprite inteiro na célula
  fisico: { cabeca: qz([4, 9, -14, -5, 0]) },
  especial: { sino: qz([0, 10, 14, -18, -6, 0]), ...Object.fromEntries(AURORA.map((a) => [a, ls([1, 1.2, 1.5, [1.2, 2.1, 1.2], 1.4, 1])])) },
  desmaio: Object.fromEntries(AURORA.map((a) => [a, ls([1, 0.8, 0.5, 0.2, 0.2])])),
});

export const borealce = criatura({
  num: 182, id: 'borealce', nome: 'Borealce', porte: 'L', estagio: 'lendario', paleta, build, anims,
  enquadre: { frente: { zoom: 1.1 }, costas: { zoom: 1.08 } },
  olho: {
    frente: ['.ppp.', 'ppwpp', 'papwp', '.ppp.'],
    fechado: ['fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
