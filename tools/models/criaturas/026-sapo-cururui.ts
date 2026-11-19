/**
 * 026 · SAPO-CURURUÍ (Rio/Veneno) — sapo-cururu de glândulas que reluzem no escuro. Estágio final.
 * Mantém da linha: barriga e papo creme, íris laranja, o corpo agachado de anfíbio.
 * Cresce: corpanzil largo e verrugoso em verde-oliva · duas GLÂNDULAS enormes atrás dos olhos brilhando em
 * lilás-limão · verrugas que brilham no lombo · sobrancelha ossuda · gotas de peçonha escorrendo · bocarra.
 */
import { criatura, anfibio, animsAnfibio, blob, par, m, ls, qs, unirExtras, type V3 } from './kits';
import { paletaPerereca, contido } from './024-pererequinha';

const paleta = {
  ...paletaPerereca,
  rampas: [
    ['#33423c', '#74883e', '#c2cb68'], // 0 verde-oliva verrugoso
    paletaPerereca.rampas[1], paletaPerereca.rampas[2],
    ['#5c2c86', '#b45fe0', '#e6ff72'], // 3 peçonha: lilás que acende em limão
  ] as [string, string, string][],
  extras: { ...paletaPerereca.extras, f: '#74883e' },
};

function build() {
  const { rig } = anfibio({
    corpo: [0.36, 0.27, 0.36], ergue: 26, cabeca: [0.27, 0.17, 0.33], olhoSaliente: 0.085,
    bracos: { len: 0.3, r: 0.07 }, pernas: { coxa: 0.3, canela: 0.3, pe: 0.24, r: 0.085 },
    papo: 0.13, olho: { r: 0.034 },
    rampas: { pele: 0, barriga: 1, pernas: 0, dedos: 2, papo: 1, olho: 0 },
  });
  // GLÂNDULAS: um osso de cada lado, para pulsar
  par((l, s) => {
    rig.bone('glandula_' + l, 'cabeca', [-0.06, 0.13, 0.22 * s], [0, 14 * s, -20]);
    rig.add('glandula_' + l, blob([0.17, 0.085, 0.1], m(3)), blob([0.11, 0.05, 0.07], m.luz(3), { pos: [0.01, 0.045, 0.02 * s], seg: 12 }));
    for (const x of [-0.08, 0.0, 0.08]) rig.add('glandula_' + l, blob([0.02, 0.02, 0.02], m.sombra(3), { pos: [x, 0.07, 0.06 * s], seg: 6, castShadow: false }));
    // sobrancelha ossuda e canto da boca
    rig.add('cabeca', blob([0.1, 0.026, 0.06], m.sombra(0), { pos: [0.13, 0.2, 0.2 * s], rot: [0, 0, -14], seg: 10 }));
    rig.add('cabeca', blob([0.2, 0.02, 0.03], m.sombra(0), { pos: [0.16, -0.045, 0.27 * s], rot: [0, -22 * s, 4], seg: 8 }));
    // gota de peçonha escorrendo da glândula
    rig.bone('pingo_' + l, 'cabeca', [-0.02, 0.02, 0.34 * s]);
    rig.add('pingo_' + l, blob([0.03, 0.045, 0.03], m.luz(3), { seg: 8 }));
    // dedos gordos com ponta laranja nas mãos
    rig.add('canela_f' + l, blob([0.075, 0.05, 0.085], m(0), { pos: [0.08, -0.12, 0], seg: 10 }));
  });
  // verrugas: as grandes brilham
  const ver: [V3, number, boolean][] = [[[0.0, 0.27, 0.0], 0.05, true], [[-0.14, 0.24, 0.14], 0.045, true], [[-0.14, 0.24, -0.14], 0.045, true], [[-0.26, 0.17, 0.0], 0.04, true],
    [[0.12, 0.24, 0.12], 0.03, false], [[0.12, 0.24, -0.12], 0.03, false], [[-0.02, 0.2, 0.26], 0.035, false], [[-0.02, 0.2, -0.26], 0.035, false], [[-0.22, 0.12, 0.25], 0.03, false], [[-0.22, 0.12, -0.25], 0.03, false]];
  ver.forEach(([pos, r, brilha], i) => {
    if (brilha) { rig.bone('verruga' + i, 'tronco', pos); rig.add('verruga' + i, blob([r, r * 0.7, r], m(3), { seg: 10 }), blob([r * 0.5, r * 0.4, r * 0.5], m.luz(3), { pos: [0, r * 0.4, 0], seg: 8 })); }
    else rig.add('tronco', blob([r, r * 0.6, r], m.luz(0), { pos, seg: 8, castShadow: false }));
  });
  // manchas escuras no lombo
  for (const [x, z] of [[0.08, 0.0], [-0.2, 0.12], [-0.2, -0.12]] as const) rig.add('tronco', blob([0.07, 0.03, 0.06], m.sombra(0), { pos: [x, 0.25 - Math.abs(x) * 0.25, z], seg: 8, castShadow: false }));
  return rig;
}

const acende = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => { const v = [1, 1.1, 1.25, 1.1]; return [n, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])]; }));
const brilhos = ['glandula_d', 'glandula_e', 'verruga0', 'verruga1', 'verruga2', 'verruga3'];
const anims = animsAnfibio({ u: 0.8, papo: true, mole: 0.8 }, unirExtras(contido, {
  idle: { ...acende(brilhos), pingo_d: ls([1, 1.2, 1.5, 0.6]), pingo_e: ls([1.5, 0.6, 1, 1.2]) },
  status: acende(brilhos),
  especial: { glandula_d: qs([1, 1.2, 1.4, 1.8, 1.3, 1]), glandula_e: qs([1, 1.2, 1.4, 1.8, 1.3, 1]), verruga0: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), verruga1: qs([1, 1.3, 1.6, 2, 1.4, 1]), verruga2: qs([1, 1.3, 1.6, 2, 1.4, 1]) },
}));

export const sapoCururui = criatura({
  num: 26, id: 'sapo-cururui', nome: 'Sapo-Cururuí', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppppp', 'apppa', 'appwa', 'apppa', '.aaa.'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
