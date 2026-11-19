/**
 * 098 · ANTÃO (Terra/Mata) — anta adulta, a jardineira da floresta: semeia o que come e leva um canteiro no lombo. Estágio final.
 * Mantém da linha: barril castanho, tromba caída de ponta escura, orelhas de ponta branca, as folhas.
 * Cresce: corpanzil · crina curta em pé da testa ao lombo · CANTEIRO no lombo (samambaias, broto alto, flor creme, musgo) ·
 * restos das listras de filhote apagados na garupa · cascos largos de três dedos.
 */
import { criatura, animsQuadrupede, blob, folha3d, tufo, par, m, lz, qz, type V3 } from './kits';
import { paletaAnta, corpoAnta } from './097-tapirinho';

function build() {
  const T: V3 = [0.46, 0.3, 0.28];
  const { rig } = corpoAnta({ k: 1.45, tronco: T, cabeca: [0.23, 0.2, 0.19], alt: 0.22 });
  // crina curta em pé
  rig.add('pescoco', tufo(3, 0.1, 0.055, m(2), { pos: [-0.02, 0.2, 0], rot: [0, 0, 0], abre: 30 }));
  rig.add('cabeca', tufo(2, 0.08, 0.05, m(2), { pos: [-0.02, 0.19, 0], rot: [0, 0, -10], abre: 20 }));
  // musgo e canteiro
  rig.add('corpo', blob([0.3, 0.06, 0.2], m.sombra(3), { pos: [-0.06, 0.28, 0], seg: 14 }));
  const plantas: [V3, number, number, number][] = [[[0.14, 0.3, 0.08], 0.26, -24, 0], [[0.04, 0.32, -0.1], 0.3, -6, 1], [[-0.1, 0.32, 0.1], 0.34, 12, 0], [[-0.22, 0.3, -0.06], 0.3, 30, 1], [[-0.32, 0.26, 0.08], 0.22, 48, 0]];
  plantas.forEach(([pos, len, t, luz], i) => { rig.bone('planta' + i, 'corpo', pos, [0, 0, t]); rig.add('planta' + i, folha3d(len, len * 0.34, luz ? m.luz(3) : m(3), { curva: 24 }), folha3d(len * 0.7, len * 0.3, m(3), { rot: [50, 0, -20], curva: 20 })); });
  // flor creme no meio
  rig.bone('flor', 'corpo', [-0.02, 0.34, 0], [0, 0, 4]);
  rig.add('flor', blob([0.02, 0.1, 0.02], m.sombra(3), { pos: [0, 0.1, 0], seg: 6 }), blob([0.07, 0.04, 0.07], m.luz(1), { pos: [0, 0.22, 0], seg: 10 }), blob([0.03, 0.035, 0.03], m(0), { pos: [0, 0.24, 0], seg: 6 }));
  par((l, s) => {
    // listras apagadas na garupa e cascos de três dedos
    for (const x of [-0.3, -0.18]) rig.add('corpo', blob([0.05, 0.02, 0.014], m.luz(0), { pos: [x, 0.02, T[2] * Math.sqrt(1 - (x / T[0]) ** 2) * s], seg: 6, castShadow: false }));
    for (const q of ['f', 't'] as const) for (const z of [-0.045, 0.045]) rig.add(`canela_${q}${l}`, blob([0.04, 0.045, 0.035], m(2), { pos: [0.07, -0.085, z], seg: 8 }));
    rig.add('cabeca', blob([0.07, 0.02, 0.05], m(2), { pos: [0.15, 0.12, 0.13 * s], rot: [-14 * s, 0, -10], seg: 8 }));
  });
  return rig;
}

const balanca = (i: number) => { const v = [0, 4, 8, 3]; return lz([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsQuadrupede({ u: 0.95, hPerna: 0.22, mole: 0.6, passo: 20 }, {
  todas: { planta0: balanca(0), planta1: balanca(1), planta2: balanca(2), planta3: balanca(3), planta4: balanca(0), flor: balanca(2) },
  especial: { flor: qz([0, 8, 12, -16, -6, 0]) },
});

export const antao = criatura({
  num: 98, id: 'antao', nome: 'Antão', porte: 'G', estagio: 'final', paleta: paletaAnta, build, anims,
  olho: { frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
