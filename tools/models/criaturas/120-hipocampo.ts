/**
 * 120 · HIPOCAMPO (Rio/Lenda) — cavalo-marinho de crina de algas, corcel dos recifes. Estágio final.
 * Mantém da linha: couro âmbar, gomos creme, turquesa, postura em pé, canudo, caracol da cauda, bolhas.
 * Cresce: CRINA de algas verdes escorrendo da nuca às costas · coroa alta de cinco pontas ·
 * barbilhões de alga no queixo · dorsal em leque largo · folha de alga na ponta da cauda · peitoral de placas.
 */
import { criatura, blob, folha3d, tufo, par, m, lz, qz, type V3 } from './kits';
import { paletaHipo, cavaloMarinho, animsCavalo, bolhasHipo } from './119-hipocampim';

const paleta = { ...paletaHipo, rampas: [['#8c3a34', '#e08a2e', '#ffd470'], paletaHipo.rampas[1], paletaHipo.rampas[2], paletaHipo.rampas[3]] as [string, string, string][], extras: { ...paletaHipo.extras, f: '#e08a2e' } };

// crina: [osso, posição, comprimento, largura, inclinação] — folhas grandes, da nuca para baixo
const CRINA: [string, V3, number, number, number][] = [
  ['cabeca', [-0.12, 0.14, 0], 0.3, 0.16, 62], ['cabeca', [-0.2, 0.04, 0], 0.34, 0.17, 100],
  ['pescoco', [-0.14, 0.2, 0], 0.36, 0.18, 112], ['pescoco', [-0.15, 0.04, 0], 0.36, 0.18, 124],
  ['tronco', [-0.18, 0.16, 0], 0.34, 0.17, 132], ['tronco', [-0.19, -0.02, 0], 0.3, 0.15, 142],
];

function build() {
  const { rig, fim, seg } = cavaloMarinho({ barriga: [0.2, 0.25, 0.17], flutua: 0.62, cabeca: [0.19, 0.16, 0.15], canudo: 0.3, cauda: { segs: 6, len: 0.86, r: 0.115, curva: -52 }, olho: 0.034 });
  CRINA.forEach(([osso, pos, len, larg, ang], i) => {
    rig.bone('crina' + (i + 1), osso, pos, [0, 0, ang]);
    rig.add('crina' + (i + 1), folha3d(len, larg, i % 2 ? m(3) : m.luz(3), { esp: 0.5, curva: -30 }));
  });
  // coroa alta de cinco pontas e chifrinhos de coral turquesa
  rig.add('cabeca', tufo(5, 0.2, 0.06, m(2), { pos: [0.0, 0.17, 0], rot: [0, 0, 10], abre: 50 }));
  par((_, s) => {
    // barbilhões de alga no queixo
    rig.add('cabeca', folha3d(0.16, 0.07, m(3), { pos: [0.2, -0.12, 0.06 * s], rot: [0, 0, 170], esp: 0.6 }));
    // sobrancelha em calombo
    rig.add('cabeca', blob([0.07, 0.04, 0.04], m.luz(0), { pos: [0.1, 0.11, 0.11 * s], rot: [0, 0, -20], seg: 8 }));
    // ombreiras de placa
    rig.add('tronco', blob([0.09, 0.11, 0.06], m.luz(0), { pos: [0.02, 0.1, 0.15 * s], seg: 10 }));
  });
  // peitoral: escama clara no alto do peito e pedra turquesa
  rig.add('tronco', blob([0.07, 0.06, 0.1], m.luz(1), { pos: [0.17, 0.14, 0], seg: 10 }), blob([0.045, 0.05, 0.045], m.plano(2), { pos: [0.21, 0.02, 0], seg: 10 }));
  // folha de alga na ponta do caracol
  rig.bone('folhaCauda', fim, [-seg, 0, 0], [0, 0, 90]);
  rig.add('folhaCauda', folha3d(0.2, 0.13, m.luz(3), { esp: 0.5 }), folha3d(0.14, 0.09, m(3), { rot: [0, 0, 60], esp: 0.5 }));
  const bolhas: V3[] = [[0.62, 0.42, 0.08], [0.56, 0.62, -0.08], [0.7, 0.2, -0.04]];
  bolhas.forEach((pos, i) => { rig.bone('bolha' + (i + 1), 'corpo', pos); const r = [0.05, 0.035, 0.03][i]; rig.add('bolha' + (i + 1), blob([r, r, r], m.luz(2), { seg: 10 })); });
  return rig;
}

// a crina ondula em sequência, como alga na correnteza
const onda = (q: typeof lz, v: number[]) => Object.fromEntries(CRINA.map((_, i) => ['crina' + (i + 1), q(v.map((_, k) => v[(k + i) % v.length]))]));
const anims = animsCavalo({ u: 1.2, flutua: 0.62, segs: 6, mole: 0.9 }, {
  todas: onda(lz, [0, 6, 10, 4]),
  idle: { ...bolhasHipo(['bolha1', 'bolha2', 'bolha3']), folhaCauda: lz([0, 8, 14, 5]) },
  status: bolhasHipo(['bolha1', 'bolha2', 'bolha3']),
  especial: Object.fromEntries(CRINA.map((_, i) => ['crina' + (i + 1), qz([0, 10, 16, -24, -10, 0])])),
  dano: Object.fromEntries(CRINA.map((_, i) => ['crina' + (i + 1), qz([-18, -6, 0])])),
});

export const hipocampo = criatura({
  num: 120, id: 'hipocampo', nome: 'Hipocampo', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', '.pppp', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
