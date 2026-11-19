/**
 * 139 · MARACAJIM (Geada/Ginga) — gato-maracajá filhote.
 * Traços únicos: olhões de caçador noturno · rosetas escuras no dorso · cauda grossa e comprida de anéis ·
 * orelhas redondas com ocelo branco atrás · patas grandes com faixa de lutador · tufinho de gelo na testa.
 */
import { criatura, quadrupede, animsQuadrupede, blob, pinta, spike, listra, par, m, lz, qz } from './kits';

export const paletaMaracaja = {
  rampas: [
    ['#7d86b0', '#c9d3ea', '#f6fbff'], // 0 pelagem de geada (sombra lilás)
    ['#2a2440', '#4a4468', '#7d78a0'], // 1 rosetas, anéis, nariz
    ['#4fa0d6', '#9adcf5', '#e4fcff'], // 2 gelo
    ['#b3565e', '#e88d7a', '#ffd0a8'], // 3 faixas de lutador, orelha por dentro, focinho rosado
  ] as [string, string, string][],
  contorno: '#231d3a',
  extras: { w: '#ffffff', p: '#231d3a', f: '#c9d3ea', a: '#f2b632' },
};

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.25, 0.18, 0.17], peito: 1.05,
    pernas: { alt: 0.2, r: 0.075, rFim: 0.07, xF: 0.55, xT: -0.55, z: 0.62, dobraF: 6, dobraT: -20, pe: [0.1, 0.05, 0.09] },
    pescoco: { len: 0.12, ang: 46, r: 0.12 },
    cabeca: [0.2, 0.185, 0.2],
    focinho: { len: 0.06, r0: 0.085, r1: 0.065, cai: 12, y: -0.32, nariz: 0.028 },
    orelha: { tipo: 'redonda', alt: 0.14, larg: 0.15, x: -0.05, z: 0.72, abre: 24, deita: 6 },
    cauda: { segs: 4, len: 0.56, r0: 0.075, r1: 0.085, ang: 24, curva: 24 },
    olho: { r: 0.034, pos: [0.185, 0.03, 0.115] },
    rampas: { pelo: 0, pe: 0, nariz: 3, orelha: 1, orelhaDentro: 3, cauda: 0, caudaPonta: 1 },
  });
  // rosetas no dorso e nos flancos
  par((_, s) => {
    for (const [x, y, r] of [[0.13, 0.12, 0.05], [-0.02, 0.14, 0.055], [-0.16, 0.11, 0.05], [0.06, 0.0, 0.045], [-0.1, -0.01, 0.05]] as const)
      rig.add('corpo', blob([r, r * 0.9, 0.04], m.plano(1), { pos: [x, y, Math.sqrt(Math.max(0.0001, 1 - (y / 0.18) ** 2 - (x / 0.25) ** 2)) * 0.165 * s], rot: [-30 * s * (y > 0.1 ? 1 : 0), 0, 0], seg: 10, castShadow: false }));
    // ocelo branco atrás da orelha, riscas da testa e da bochecha
    rig.add('orelha_' + (s > 0 ? 'd' : 'e'), pinta(0.035, m.luz(0), [-0.035, 0.07, 0], [0, 90, 0]));
    rig.add('cabeca', blob([0.07, 0.02, 0.025], m.plano(1), { pos: [0.1, 0.15, 0.06 * s], rot: [0, 0, -30], seg: 8 }));
    rig.add('cabeca', blob([0.06, 0.018, 0.02], m.plano(1), { pos: [0.1, -0.06, 0.18 * s], rot: [0, 20 * s, 14], seg: 8 }));
  });
  // anéis da cauda
  for (const o of ['cauda1', 'cauda2', 'cauda3']) rig.add(o, blob([0.03, 0.088, 0.088], m.plano(1), { pos: [-0.08, 0, 0], seg: 12 }));
  // faixas de lutador nas patas da frente
  par((l) => rig.add('canela_f' + l, listra(0.072, 0.028, m(3), { pos: [0, -0.04, 0] })));
  // tufinho de gelo na testa
  rig.bone('gelo', 'cabeca', [ref.topo[0], ref.topo[1] - 0.02, 0], [0, 0, -10]);
  rig.add('gelo', spike(0.12, 0.04, m.luz(2)), spike(0.08, 0.035, m(2), { rot: [0, 0, 40] }), spike(0.08, 0.035, m(2), { rot: [0, 0, -40] }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.7, hPerna: 0.2, mole: 1.2, cauda: 1.2, mapa: { comp: 0.75, larg: 1.35, frontal: 1.3 } }, {
  idle: { cauda3: lz([0, -8, -14, -5]), cauda4: lz([0, -8, -14, -5]) },
  especial: { cauda3: qz([0, -10, -14, 20, 8, 0]) },
});

export const maracajim = criatura({
  num: 139, id: 'maracajim', nome: 'Maracajim', porte: 'P', estagio: 'basico', paleta: paletaMaracaja, build, anims,
  olho: {
    frente: ['.ppp.', 'pawpp', 'pappp', 'paapp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['a', 'p'],
  },
});
