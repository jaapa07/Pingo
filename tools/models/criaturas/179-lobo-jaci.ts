/**
 * 179 · LOBO-JACI (Mente/Assombro) — o lobo-guará que Jaci, a lua, acende nas noites cheias. Lendário.
 * Traços: pernas altíssimas de lobo-guará em meias negras · pelagem azul-lunar com crina prateada ·
 * crescente de lua na testa e disco de lua cheia flutuando entre as orelhonas · cauda de névoa em três
 * mechas que se desfazem · manto de estrelas no dorso · olhos de luar · fios de névoa nas patas.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, tufo, ring, chama, pena, par, m, lz, qz, ls, lp, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#2a2a72', '#5562c0', '#98acf2'], // 0 pelagem azul-lunar
    ['#9aa2d0', '#e4e9fb', '#ffffff'], // 1 prata: crina, peito, névoa
    ['#17142e', '#2b2748', '#4b4770'], // 2 meias negras, orelhas, manto da noite
    ['#d9a84a', '#ffe98a', '#fffbe0'], // 3 luar: lua, estrelas, olhos
  ] as [string, string, string][],
  contorno: '#131028',
  extras: { w: '#ffffff', p: '#131028', f: '#5562c0', a: '#ffe98a' },
};

const NEVOA = ['nevoa1', 'nevoa2', 'nevoa3', 'nevoa4', 'nevoa5', 'nevoa6', 'nevoa7'];

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.36, 0.25, 0.23], peito: 1.32,
    pernas: { alt: 0.56, r: 0.08, rFim: 0.055, xF: 0.6, xT: -0.64, z: 0.66, dobraF: 10, dobraT: -34, pe: [0.08, 0.045, 0.065] },
    pescoco: { len: 0.32, ang: 58, r: 0.13, x: 0.68, y: 0.3 },
    cabeca: [0.28, 0.24, 0.24],
    focinho: { len: 0.3, r0: 0.11, r1: 0.055, cai: 10, y: -0.3, nariz: 0.042 },
    orelha: { tipo: 'ponta', alt: 0.44, larg: 0.25, x: -0.1, z: 0.62, abre: 28, deita: 10 },
    cauda: { segs: 2, len: 0.3, r0: 0.07, r1: 0.09, ang: 16, curva: 16 },
    olho: { r: 0.034, pos: [0.28, 0.05, 0.195] },
    rampas: { pelo: 0, barriga: 1, pernaF: 0, canelaF: 2, pernaT: 0, canelaT: 2, pe: 2, focinho: 1, nariz: 2, orelha: 2, orelhaDentro: 1, cauda: 0 },
  });
  // peitilho prateado, bochechas e máscara
  rig.add('pescoco', blob([0.12, 0.2, 0.14], m.luz(1), { pos: [0.17, 0.1, 0], rot: [0, 0, -30] }), tufo(3, 0.2, 0.09, m.luz(1), { pos: [0.2, -0.04, 0], rot: [0, 0, 215], abre: 30 }));
  par((_, s) => rig.add('cabeca', tufo(2, 0.18, 0.07, m(1), { pos: [0.08, -0.1, 0.16 * s], rot: [110 * s, 0, 30], abre: 22 })));
  par((_, s) => rig.add('cabeca', blob([0.13, 0.11, 0.07], m.luz(1), { pos: [0.16, -0.07, 0.18 * s], seg: 10 })));
  rig.add('cabeca', blob([0.1, 0.05, 0.07], m.luz(1), { pos: [0.24, 0.13, 0], rot: [0, 0, -30], seg: 10 }));
  // CRESCENTE na testa e LUA CHEIA flutuando entre as orelhas
  rig.add('cabeca', ring(0.075, 0.032, m.luz(3), { pos: [0.27, 0.19, 0], rot: [0, 90, 0], arc: 220 }));
  rig.bone('lua', 'cabeca', [-0.1, 0.62, 0]);
  rig.add('lua', blob([0.2, 0.2, 0.12], m.luz(3), { seg: 18 }), blob([0.05, 0.05, 0.03], m(3), { pos: [0.05, 0.04, -0.09], seg: 8 }), blob([0.035, 0.035, 0.03], m(3), { pos: [-0.05, -0.05, -0.09], seg: 8 }), ring(0.26, 0.026, m(1), { rot: [0, 0, 0], arc: 250 }));
  // crina prateada: cinco mechas do alto da cabeça ao ombro
  const crina: [string, V3, number, number, number][] = [
    ['cabeca', [ref.nuca[0] + 0.06, ref.nuca[1] + 0.04, 0], 0.24, 0.085, 50], ['pescoco', [0.14, 0.2, 0], 0.3, 0.1, 56],
    ['pescoco', [0.0, 0.1, 0], 0.3, 0.1, 62], ['corpo', [0.14, 0.2, 0], 0.24, 0.09, 66], ['corpo', [-0.08, 0.2, 0], 0.18, 0.075, 72],
  ];
  crina.forEach(([pai, pos, alt, r, tomba], i) => {
    rig.bone('crina' + (i + 1), pai, pos, [0, 0, tomba]);
    rig.add('crina' + (i + 1), chama(alt, r, m(1), { curva: 30 }));
  });
  // MANTO de noite no dorso com estrelas
  rig.add('corpo', calota([0.37, 0.225, 0.2], m(2), { de: 0, ate: 62 }));
  const estrelas: V3[] = [[0.2, 0.18, 0.11], [0.02, 0.2, 0.09], [-0.16, 0.17, 0.12], [0.12, 0.13, 0.17], [-0.06, 0.12, 0.18], [-0.26, 0.1, 0.15]];
  for (const e of estrelas) for (const s of [1, -1]) rig.add('corpo', blob([0.03, 0.03, 0.03], m.luz(3), { pos: [e[0], e[1], e[2] * s], seg: 8, castShadow: false }));
  // CAUDA de névoa: três mechas largas que se desfazem + flocos soltos
  const mechas: [V3, number, number, number][] = [[[-0.14, 0.02, 0], 0.56, 0.17, 62], [[-0.1, 0.06, 0.05], 0.42, 0.13, 30], [[-0.12, -0.03, -0.05], 0.44, 0.13, 96]];
  mechas.forEach(([pos, alt, r, g], i) => {
    rig.bone(NEVOA[i], 'cauda2', pos, [0, 0, g]);
    rig.add(NEVOA[i], chama(alt, r, i ? m(1) : m.luz(1), { curva: 34 }), chama(alt * 0.5, r * 0.6, m(0), { curva: 20, scale: [1, 1, 1.9] }));
  });
  rig.bone(NEVOA[3], 'base', [-0.86, 0.86, 0.1]); rig.add(NEVOA[3], blob([0.07, 0.06, 0.06], m.luz(1), { seg: 8 }));
  rig.bone(NEVOA[4], 'base', [-0.96, 0.62, -0.1]); rig.add(NEVOA[4], blob([0.05, 0.045, 0.045], m(1), { seg: 8 }));
  // fios de névoa nas patas e meias negras até o joelho
  let n = 5;
  par((l) => {
    for (const q of ['f', 't']) {
      rig.add('perna_' + q + l, blob([0.075, 0.06, 0.075], m(2), { pos: [0, -0.3, 0], seg: 10 }));
      if ((q === 'f') === (l === 'e') || n > 6) continue;
      const nome = NEVOA[n++];
      rig.bone(nome, 'canela_' + q + l, [-0.02, -0.26, 0], [0, 0, 40]);
      rig.add(nome, chama(0.2, 0.07, m(1), { curva: 30 }));
    }
  });
  // estrela na ponta de cada orelha
  par((l) => rig.add('orelha_' + l, blob([0.035, 0.035, 0.035], m.luz(3), { pos: [0, 0.45, 0], seg: 8 })));
  rig.add('corpo', pena(0.2, 0.1, m(1), { pos: [0.3, -0.14, 0], rot: [0, 0, 80], esp: 0.1 }));
  return rig;
}

const ondula = (f: number) => ls([[1, 1, 1], [0.92, 1.12, 0.92], [1.05, 0.9, 1.05], [0.96, 1.07, 0.96]].map((_, k, v) => v[(k + f) % 4] as V3));
const anims = animsQuadrupede({ u: 1.35, hPerna: 0.56, mole: 0.55, passo: 26, cauda: 0.8 }, {
  todas: { ...Object.fromEntries(NEVOA.map((c, i) => ['?' + c, ondula(i)])), ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => ['crina' + i, ondula(i + 1)])) },
  idle: { lua: lp([[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.015, 0]]) },
  especial: { lua: [...qz([0, 0, 0, 0, 0, 0]), ...ls([1, 1.1, 1.25, 1.5, 1.2, 1])] },
  dano: { lua: lp([[0, 0.05, 0], [0, 0.02, 0], [0, 0, 0]]) },
  desmaio: { lua: [...ls([1, 0.9, 0.7, 0.5, 0.5])] },
  andar: { lua: lp([[0, 0, 0], [0, 0.03, 0], [0, 0, 0], [0, 0.03, 0]]) },
});

export const loboJaci = criatura({
  num: 179, id: 'lobo-jaci', nome: 'Lobo-Jaci', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['pp....', 'paaap.', '.awpap', '.aapap', '..ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['a', 'a'],
  },
});
