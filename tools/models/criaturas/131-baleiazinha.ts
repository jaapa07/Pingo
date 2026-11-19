/**
 * 131 · BALEIAZINHA (Rio) — filhote de baleia-franca, que nasce no inverno do litoral sul e chora se perde a mãe de vista.
 * Traços únicos: corpo roliço azul-noite SEM dorsal · calosidades creme na cabeça (a "touca" da franca) ·
 * boca em arco bem alto · esguicho em "V" · nadadeiras em pá · barriga com mancha branca.
 */
import { criatura, aquatico, animsAquatico, blob, tube, ring, par, m, ls, qs, lz, type Rig, type V3 } from './kits';

export const paletaBaleia = {
  rampas: [
    ['#1a2046', '#3a4c82', '#8ea4cc'], // 0 couro azul-noite
    ['#a8a0b4', '#f0e8e0', '#ffffff'], // 1 calosidades e barriga
    ['#3a78c0', '#86c8f0', '#e4f8ff'], // 2 água do esguicho
    ['#5a7ad0', '#a8d0ff', '#f2fcff'], // 3 gelo (a geada do Jubartão)
  ] as [string, string, string][],
  contorno: '#12142e',
  extras: { w: '#ffffff', p: '#0e1024', f: '#3a4c82' },
};

/** Esguicho em "V" num osso próprio (`jato`), com duas gotas (`gota1`, `gota2`). */
export function esguicho(rig: Rig, pai: string, pos: V3, k: number, mat = m.luz(2)) {
  rig.bone('jato', pai, pos);
  for (const s of [1, -1]) rig.add('jato', tube([[0, 0, 0], [-0.02 * k, 0.12 * k, 0.05 * k * s], [-0.06 * k, 0.22 * k, 0.14 * k * s], [-0.1 * k, 0.24 * k, 0.22 * k * s]], (u) => 0.035 * k * (0.7 + u * 0.6), mat, { seg: 10, radial: 8 }));
  rig.bone('gota1', 'jato', [-0.12 * k, 0.2 * k, 0.28 * k]); rig.add('gota1', blob([0.035 * k, 0.045 * k, 0.035 * k], mat, { seg: 8 }));
  rig.bone('gota2', 'jato', [-0.12 * k, 0.16 * k, -0.3 * k]); rig.add('gota2', blob([0.03 * k, 0.04 * k, 0.03 * k], mat, { seg: 8 }));
}
export const animJato = {
  idle: { jato: ls([[1, 0.5, 1], [1, 0.9, 1], [1, 1.15, 1], [1, 0.8, 1]]), gota1: ls([0.4, 0.8, 1.2, 1]), gota2: ls([1, 0.4, 0.8, 1.2]) },
  especial: { jato: qs([[1, 0.4, 1], [1, 0.2, 1], [1, 0.2, 1], [1.2, 1.7, 1.2], [1.1, 1.3, 1.1], 1]) },
  desmaio: { jato: qs([1, 0.7, 0.4, 0.15, 0.15]) },
  status: { jato: ls([[1, 0.3, 1], [1, 0.4, 1], [1, 0.3, 1], [1, 0.2, 1]]) },
};

function build() {
  const { rig, ref } = aquatico({
    tronco: [0.36, 0.27, 0.27], flutua: 0.36, ergue: 6,
    cabeca: { r: [0.28, 0.27, 0.27], x: 0.62, y: 0.02, gira: -4 },
    cauda: { len: 0.3, r0: 0.17, r1: 0.07, cai: -14 },
    lobos: { len: 0.24, larg: 0.17, abre: 44 },
    nad: { len: 0.24, larg: 0.17, x: 0.3, cai: 40, abre: 50 },
    dorsal: null,
    olho: { r: 0.034, pos: [0.13, -0.08, 0.235] },
    rampas: { pele: 0, barriga: 1 },
  });
  // boca em arco alto: lábio inferior claro subindo dos dois lados
  par((_, s) => rig.add('cabeca', tube([[0.27, -0.1, 0.02 * s], [0.2, -0.02, 0.19 * s], [0.06, -0.01, 0.262 * s], [-0.06, -0.12, 0.25 * s]], 0.022, m.sombra(0), { seg: 12, radial: 6 })));
  rig.add('cabeca', blob([0.2, 0.12, 0.2], m(1), { pos: [0.08, -0.18, 0], seg: 16 }));
  // CALOSIDADES: touca de calombos creme no alto da cabeça e no queixo
  const cal: [V3, number][] = [[[0.2, 0.17, 0], 0.07], [[0.1, 0.23, 0.07], 0.06], [[0.11, 0.23, -0.07], 0.055], [[0.24, 0.07, 0.08], 0.045], [[0.24, 0.07, -0.08], 0.045], [[0.0, 0.26, 0], 0.05]];
  cal.forEach(([pos, r], i) => rig.add('cabeca', blob([r, r * 0.8, r], i % 2 ? m.luz(1) : m(1), { pos, seg: 8 })));
  par((_, s) => rig.add('cabeca', blob([0.04, 0.035, 0.03], m(1), { pos: [0.17, 0.0, 0.215 * s], seg: 8 }))); // sobrancelha de calo
  esguicho(rig, 'cabeca', [ref.respiro[0] - 0.04, ref.respiro[1], 0], 1);
  // bochecha rosada não: lágrima de filhote (gota clara sob o olho da frente)
  rig.add('cabeca', ring(0.05, 0.012, m.luz(0), { pos: [0.13, -0.08, 0.24], rot: [0, 10, 0], arc: 180 }));
  return rig;
}

const anims = animsAquatico({ u: 0.7, flutua: 0.36, mole: 1.2 }, { ...animJato, idle: { ...animJato.idle, cabeca: lz([0, -2, -3, -1]) } });

export const baleiazinha = criatura({
  num: 131, id: 'baleiazinha', nome: 'Baleiazinha', porte: 'M', estagio: 'basico', paleta: paletaBaleia, build, anims,
  olho: {
    frente: ['.ppp.', 'pwwpp', 'pwppp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
