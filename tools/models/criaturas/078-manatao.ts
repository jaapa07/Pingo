/**
 * 078 · MANATÃO (Rio/Encanto) — peixe-boi adulto, gentil, que carrega um jardim de algas no lombo. Estágio final.
 * Mantém da linha: barril cinza-azulado, beição rosado, remo redondo, a flor lilás, as bolhas.
 * Cresce: corpanzil · JARDIM de algas compridas ondulando no lombo · três flores de aguapé · cicatrizes claras ·
 * colar de bolhas encantadas · olhar sereno.
 */
import { criatura, animsAquatico, blob, folha3d, m, lz, qs, type V3 } from './kits';
import { paletaManati, corpoManati, florAguape, bolha, bolhasSobem } from './077-manatim';

function build() {
  const { rig, ref } = corpoManati({ k: 1.35, flutua: 0.4 });
  // algas: fitas compridas em ossos próprios, deitadas para trás
  const algas: [V3, number, number][] = [[[0.1, 0.3, 0.1], 0.36, 30], [[0.0, 0.32, -0.1], 0.42, 44], [[-0.14, 0.3, 0.06], 0.4, 54], [[-0.26, 0.26, -0.08], 0.34, 62], [[-0.34, 0.22, 0.1], 0.3, 70]];
  algas.forEach(([pos, len, t], i) => { rig.bone('alga' + i, 'tronco', pos, [0, 0, t]); rig.add('alga' + i, folha3d(len, 0.1, i % 2 ? m.luz(2) : m(2), { curva: 30, esp: 0.45 })); });
  // tapete de musgo
  rig.add('tronco', blob([0.3, 0.06, 0.2], m.sombra(2), { pos: [-0.1, 0.29, 0], seg: 14 }));
  florAguape(rig, 'flor', 'cabeca', [ref.melao[0] - 0.12, ref.melao[1] + 0.02, 0], 0.085, 10);
  florAguape(rig, 'flor2', 'tronco', [0.16, 0.33, -0.08], 0.07, -10);
  florAguape(rig, 'flor3', 'tronco', [-0.22, 0.3, 0.14], 0.06, 30);
  // cicatrizes claras no flanco
  for (const z of [0.325, -0.325]) for (const x of [-0.05, 0.06]) rig.add('tronco', blob([0.02, 0.09, 0.012], m.luz(0), { pos: [x, 0.02, z * (1 - Math.abs(x))], rot: [0, 0, 24], seg: 6, castShadow: false }));
  bolha(rig, 'bolha1', [0.6, 0.34, 0.16], 0.05); bolha(rig, 'bolha2', [0.44, 0.54, -0.14], 0.036); bolha(rig, 'bolha3', [0.66, 0.1, -0.2], 0.03);
  return rig;
}

const onda = (i: number) => { const v = [0, 6, 12, 4]; return lz([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsAquatico({ u: 0.9, flutua: 0.14, mole: 0.8 }, {
  todas: { alga0: onda(0), alga1: onda(1), alga2: onda(2), alga3: onda(3), alga4: onda(0) },
  idle: bolhasSobem(['bolha1', 'bolha2', 'bolha3']),
  especial: { flor: qs([1, 1.3, 1.6, 2, 1.3, 1]), flor2: qs([1, 1.2, 1.5, 1.9, 1.3, 1]), flor3: qs([1, 1.2, 1.4, 1.8, 1.2, 1]) },
});

export const manatao = criatura({
  num: 78, id: 'manatao', nome: 'Manatão', porte: 'G', estagio: 'final', paleta: paletaManati, build, anims,
  olho: { frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
