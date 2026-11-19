/**
 * 007 · BOTINHO (Rio) — filhote de boto-cor-de-rosa, ainda cinza-lilás com a barriga rosada. Inicial de Rio.
 * Traços únicos: melão redondo com uma gota azul na testa · bico fino de "sorriso" rosa ·
 * anel de bolhas de espuma no pedúnculo da cauda · peitorais grandes de remo com ponta rosa.
 */
import { criatura, aquatico, animsAquatico, blob, espuma, par, m, ls, lz, type V3 } from './kits';

export const paletaBoto = {
  rampas: [
    ['#62639a', '#989ac8', '#c8c9ea'], // 0 pele cinza-lilás do filhote
    ['#c56c92', '#f4a3b6', '#ffd6d8'], // 1 rosa da barriga, bico e bochechas
    ['#8cc4ea', '#daf2fc', '#ffffff'], // 2 espuma
    ['#235a9c', '#3b92d4', '#80ccf2'], // 3 azul de rio (gota e marcas)
  ] as [string, string, string][],
  contorno: '#2b2a58',
  extras: { w: '#ffffff', p: '#2b2a58', f: '#989ac8', r: '#f4a3b6' },
};

/** Bolhas que pulsam: cada osso de espuma incha num quadro diferente. */
export const borbulha = (ossos: string[]) => Object.fromEntries(ossos.map((o, i) => {
  const v: (V3 | number)[] = [1, 1.14, 0.92, 1.06];
  return ['?' + o, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])];
}));

function build() {
  const { rig, ref } = aquatico({
    tronco: [0.24, 0.19, 0.18], flutua: 0.5, ergue: 50,
    cabeca: { r: [0.2, 0.195, 0.185], x: 0.78, y: 0.1, gira: -42 },
    rostro: { len: 0.27, r0: 0.05, r1: 0.032, cai: 12, y: -0.52 },
    cauda: { len: 0.26, r0: 0.12, r1: 0.055, cai: -12 },
    lobos: { len: 0.2, larg: 0.15, abre: 48 },
    nad: { len: 0.19, larg: 0.12, x: 0.34, cai: 52, abre: 52 },
    dorsal: { alt: 0.085, base: 0.2, x: -0.2 },
    olho: { r: 0.027, pos: [0.1, -0.03, 0.15] },
    rampas: { pele: 0, barriga: 1, cabeca: 0, rostro: 0, cauda: 0, lobos: 0, nad: 0, dorsal: 0 },
  });
  // gota azul na testa do melão
  rig.add('cabeca', blob([0.05, 0.065, 0.05], m.plano(3), { pos: [ref.melao[0] + 0.07, ref.melao[1] - 0.06, 0], rot: [0, 0, -45], seg: 12 }),
    blob([0.02, 0.02, 0.02], m.luz(2), { pos: [ref.melao[0] + 0.1, ref.melao[1] - 0.05, 0.02], seg: 8 }));
  // bochechas rosadas
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.03], m.plano(1), { pos: [0.1, -0.09, 0.165 * s], seg: 10 })));
  // pontas rosa nos remos e nos lobos da cauda
  par((l) => {
    rig.add('nad_' + l, blob([0.058, 0.05, 0.035], m(1), { pos: [-0.02, -0.15, 0], seg: 12 }));
    rig.add('lobo_' + l, blob([0.06, 0.035, 0.065], m(1), { pos: [-0.15, 0, 0], seg: 12 }));
  });
  // anel de bolhas de espuma na cauda (3 flocos, cada um no seu osso)
  const flocos: [string, V3, number][] = [['bolha1', [-0.02, 0.07, 0.07], 0.05], ['bolha2', [-0.03, 0.06, -0.08], 0.045], ['bolha3', [-0.04, -0.07, 0.0], 0.05]];
  for (const [nome, pos, r] of flocos) { rig.bone(nome, 'cauda2', pos); rig.add(nome, espuma(r, m.luz(2))); }
  return rig;
}

const anims = animsAquatico({ u: 0.7, flutua: 0.1, mole: 1.2 }, {
  todas: borbulha(['bolha1', 'bolha2', 'bolha3']),
  idle: { dorsal: lz([0, 0, 0, 0]) },
});

export const botinho = criatura({
  num: 7, id: 'botinho', nome: 'Botinho', porte: 'P', estagio: 'basico', paleta: paletaBoto, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
