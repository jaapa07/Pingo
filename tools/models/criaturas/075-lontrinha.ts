/**
 * 075 · LONTRINHA (Rio) — lontra neotropical brincalhona, que guarda a pedrinha preferida debaixo do braço.
 * Traços únicos: pelo castanho-claro com barriga e bochechas creme · focinho de bigodão · rabo comprido afinando ·
 * pedrinha lisa azulada equilibrada no focinho · gotas no pelo.
 */
import { criatura, animsQuadrupede, blob, m, lz, lp, qp, type V3 } from './kits';
import { corpoLontra } from './073-ariranhinha';

export const paletaLontra = {
  rampas: [
    ['#4a3040', '#96684a', '#d2a272'], // 0 pelo castanho-claro
    ['#b69676', '#f4e0b8', '#fffaf0'], // 1 creme da barriga e das bochechas
    ['#1b131d', '#3b292f', '#5f4749'], // 2 nariz e patas
    ['#2f6ab0', '#5fb4ea', '#d8f4ff'], // 3 água · pedrinha
  ] as [string, string, string][],
  contorno: '#231622',
  extras: { w: '#ffffff', p: '#180f18', f: '#96684a' },
};

function build() {
  const { rig, ref } = corpoLontra({ k: 1, cabeca: [0.175, 0.155, 0.165], rabo: 0.55, ang: 56, barriga: true });
  rig.add('pescoco', blob([0.09, 0.13, 0.11], m(1), { pos: [0.1, 0.1, 0], seg: 12 }));
  rig.add('cabeca', blob([0.09, 0.05, 0.13], m(1), { pos: [0.1, -0.12, 0], seg: 10 }));
  // pedrinha no focinho (osso próprio)
  rig.bone('pedrinha', 'cabeca', [ref.pontaFocinho[0] + 0.02, ref.pontaFocinho[1] + 0.16, 0]);
  rig.add('pedrinha', blob([0.085, 0.07, 0.08], m(3), { rot: [0, 0, 14], seg: 10 }), blob([0.03, 0.02, 0.03], m.luz(3), { pos: [0.01, 0.03, -0.03], seg: 6 }));
  // gotas no lombo
  const g: V3[] = [[-0.12, 0.17, 0.1]];
  g.forEach((pos, i) => { rig.bone('gota' + i, 'corpo', pos); rig.add('gota' + i, blob([0.025, 0.035, 0.025], m.luz(3), { seg: 8 })); });
  return rig;
}

const anims = animsQuadrupede({ u: 0.6, hPerna: 0.11, mole: 1.3, cauda: 0.6 }, {
  idle: { pedrinha: [...lp([[0, 0, 0], [0, 0.03, 0], [0, 0.06, 0], [0, 0.02, 0]]), ...lz([0, 20, 40, 60])] },
  fisico: { pedrinha: qp([[0, 0, 0], [0, 0.02, 0], [0.1, 0.06, 0], [0.04, 0.03, 0], [0, 0, 0]]) },
  dano: { pedrinha: qp([[-0.04, 0.1, 0], [-0.02, 0.04, 0], [0, 0, 0]]) },
});

export const lontrinha = criatura({
  num: 75, id: 'lontrinha', nome: 'Lontrinha', porte: 'P', estagio: 'basico', paleta: paletaLontra, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
