/**
 * 176 · QUEIXADA-CAIPORA (Lenda/Mata) — o porco-do-mato que a Caipora monta para guardar a floresta. Lendário.
 * Traços: queixo e bochechas brancos (o "queixo branco" que dá nome ao queixada) · presas curvas de marfim ·
 * crina eriçada cor de fogo, como o cabelo da Caipora, da testa à garupa · galhada de galhos vivos com folhas ·
 * colar de cipó com sementes · samambaias na garupa e rabo de folha · cascos com musgo · corcova de ombros altos.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, tufo, tube, ring, folha3d, listra, spike, par, m, lz, qz, ls, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#2a2036', '#55414c', '#8c6c5e'], // 0 pelo pardo-escuro (sombra anil)
    ['#a99a94', '#efe6d2', '#ffffff'], // 1 queixo branco e marfim das presas
    ['#1f5d46', '#46a04a', '#b0e45c'], // 2 folhas, cipó e musgo
    ['#8c2236', '#e2552a', '#ffa63c'], // 3 crina de fogo e focinho
  ] as [string, string, string][],
  contorno: '#1c1426',
  extras: { w: '#ffffff', p: '#1c1426', f: '#55414c', a: '#ffa63c' },
};

const CRINA = ['crina1', 'crina2', 'crina3', 'crina4', 'crina5', 'crina6'];

function build() {
  const tr: V3 = [0.46, 0.3, 0.27];
  const { rig, ref } = quadrupede({
    tronco: tr, peito: 1.28,
    pernas: { alt: 0.3, r: 0.1, rFim: 0.07, xF: 0.58, xT: -0.62, z: 0.66, dobraF: 6, dobraT: -26, pe: [0.085, 0.06, 0.08] },
    pescoco: { len: 0.16, ang: 4, r: 0.23, x: 0.62, y: 0.05 },
    cabeca: [0.27, 0.25, 0.25],
    focinho: { len: 0.27, r0: 0.15, r1: 0.105, cai: 14, y: -0.2 },
    orelha: { tipo: 'ponta', alt: 0.17, larg: 0.14, x: -0.2, z: 0.75, abre: 40, deita: 26 },
    cauda: { segs: 1, len: 0.12, r0: 0.04, r1: 0.03, ang: -30 },
    olho: { r: 0.032, pos: [0.28, 0.07, 0.185] },
    rampas: { pelo: 0, barriga: 0, pe: 0, focinho: 0, orelha: 0, orelhaDentro: 3 },
  });
  const pf = ref.pontaFocinho as V3;
  // corcova de ombros e garupa mais clara
  rig.add('corpo', blob([0.26, 0.2, 0.25], m(0), { pos: [0.26, 0.2, 0] }));
  // QUEIXO BRANCO: mandíbula, bochechas e a faixa que desce para o ombro
  rig.add('cabeca', blob([0.24, 0.1, 0.19], m(1), { pos: [0.24, -0.2, 0], rot: [0, 0, -12] }));
  par((l, s) => {
    rig.add('cabeca', blob([0.13, 0.12, 0.07], m(1), { pos: [0.1, -0.12, 0.2 * s], rot: [0, 10 * s, -20], seg: 14 }));
    rig.add('pescoco', blob([0.09, 0.2, 0.06], m(1), { pos: [0.0, -0.08, 0.215 * s], rot: [0, 0, 30], seg: 12 }));
    // presas de marfim, curvas para cima
    rig.add('cabeca', spike(0.3, 0.065, m.luz(1), { pos: [pf[0] - 0.1, pf[1] - 0.04, 0.15 * s], rot: [50 * s, 0, -20], curve: 0.3 }));
    rig.add('cabeca', spike(0.14, 0.045, m(1), { pos: [pf[0] - 0.22, pf[1] - 0.05, 0.15 * s], rot: [44 * s, 0, -8] }));
    // sobrancelha pesada
    rig.add('cabeca', blob([0.11, 0.04, 0.06], m.sombra(0), { pos: [0.27, 0.15, 0.16 * s], rot: [0, 14 * s, -24], seg: 10 }));
    // GALHADA de galhos vivos
    rig.bone('galho_' + l, 'cabeca', [0.0, 0.2, 0.13 * s], [22 * s, 0, 8]);
    rig.add('galho_' + l,
      tube([[0, 0, 0], [-0.03, 0.2, 0.05 * s], [0.04, 0.4, 0.12 * s], [0.0, 0.56, 0.16 * s]], (t) => 0.055 - t * 0.025, m.luz(0), { seg: 10, radial: 8 }),
      tube([[-0.02, 0.2, 0.05 * s], [-0.16, 0.32, 0.08 * s], [-0.2, 0.46, 0.1 * s]], (t) => 0.04 - t * 0.018, m.luz(0), { seg: 8, radial: 8 }),
      tube([[0.03, 0.36, 0.11 * s], [0.16, 0.44, 0.16 * s]], 0.03, m.luz(0), { seg: 4, radial: 8 }),
      folha3d(0.2, 0.14, m.luz(2), { pos: [0.0, 0.54, 0.16 * s], rot: [10 * s, 0, -10], esp: 0.45 }),
      folha3d(0.18, 0.13, m(2), { pos: [-0.2, 0.44, 0.1 * s], rot: [0, 0, 40], esp: 0.45 }),
      folha3d(0.16, 0.12, m.luz(2), { pos: [0.16, 0.43, 0.16 * s], rot: [0, 0, -60], esp: 0.45 }));
    // cascos escuros com polaina de musgo
    for (const q of ['f', 't']) {
      rig.add('canela_' + q + l, blob([0.09, 0.06, 0.085], m.sombra(0), { pos: [0.02, -0.13, 0], seg: 10 }), listra(0.085, 0.035, m(2), { pos: [0, -0.06, 0] }));
    }
    // samambaias na garupa
    rig.add('corpo', folha3d(0.34, 0.16, m(2), { pos: [-0.3, 0.2, 0.14 * s], rot: [34 * s, 0, 62], esp: 0.4, curva: -20 }));
  });
  // disco do focinho
  rig.add('cabeca', blob([0.04, 0.1, 0.105], m.plano(3), { pos: [pf[0] + 0.06, pf[1] + 0.005, 0], rot: [0, 0, -14], seg: 12 }));
  par((_, s) => rig.add('cabeca', blob([0.02, 0.028, 0.022], m.sombra(3), { pos: [pf[0] + 0.095, pf[1] + 0.005, 0.04 * s], seg: 8 })));
  // CRINA de fogo: seis tufos eriçados da testa à garupa
  const crina: [string, V3, number, number, number][] = [
    ['cabeca', [0.14, 0.24, 0], 0.22, 0.075, 8], ['cabeca', [-0.06, 0.22, 0], 0.3, 0.09, 26],
    ['corpo', [0.4, 0.36, 0], 0.36, 0.11, 22], ['corpo', [0.16, 0.38, 0], 0.36, 0.115, 32],
    ['corpo', [-0.1, 0.3, 0], 0.3, 0.1, 42], ['corpo', [-0.32, 0.24, 0], 0.22, 0.085, 54],
  ];
  crina.forEach(([pai, pos, alt, r, tomba], i) => {
    rig.bone(CRINA[i], pai, pos, [0, 0, tomba]);
    rig.add(CRINA[i], tufo(3, alt, r, m(3), { abre: 24 }), tufo(1, alt * 0.62, r * 0.6, m.luz(3), { pos: [0.02, 0, 0], scale: [1, 1, 1.9] }));
  });
  // colar de cipó com sementes
  rig.add('pescoco', ring(0.27, 0.04, m(2), { pos: [-0.02, 0, 0], rot: [0, 90, 0], scale: [1, 1.12, 1] }));
  for (const a of [-110, -70, -30, 210, 250]) {
    const c = Math.cos((a * Math.PI) / 180), sn = Math.sin((a * Math.PI) / 180);
    rig.add('pescoco', blob([0.05, 0.05, 0.05], m.luz(3), { pos: [0.0, sn * 0.31, c * 0.27], seg: 8 }));
  }
  // rabo de folha
  rig.add('cauda1', folha3d(0.24, 0.16, m.luz(2), { pos: [-0.1, 0, 0], rot: [0, 0, 70], esp: 0.45 }));
  rig.add('corpo', calota([0.3, 0.31, 0.28], m.luz(0), { de: 0, ate: 40, pos: [-0.2, 0, 0], rot: [0, 0, 30] }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.3, hPerna: 0.3, mole: 0.5, passo: 22, cauda: 1.4 }, {
  todas: Object.fromEntries(CRINA.map((c, i) => [c, ls([[1, 1, 1], [0.94, 1.1, 0.94], [1.04, 0.93, 1.04], [0.97, 1.06, 0.97]].map((_, k, v) => v[(k + i) % 4] as V3))])),
  idle: { galho_d: lz([0, 2, 4, 1]), galho_e: lz([0, 2, 4, 1]) },
  fisico: { cabeca: qz([10, 24, -30, -10, 0]) },
  especial: { galho_d: qz([0, 8, 10, -14, -5, 0]), galho_e: qz([0, 8, 10, -14, -5, 0]), ...Object.fromEntries(CRINA.map((c) => [c, ls([1, 1.1, 1.2, 1.5, 1.2, 1])])) },
  dano: { galho_d: qz([14, 6, 0]), galho_e: qz([14, 6, 0]) },
});

export const queixadaCaipora = criatura({
  num: 176, id: 'queixada-caipora', nome: 'Queixada-Caipora', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['pp....', 'pppp..', '.aawpp', '.aappp', '..ppp.'],
    fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
