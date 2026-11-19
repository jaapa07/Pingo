/**
 * 133 · PINGUINZINHO (Geada/Rio) — pinguim-de-magalhães jovem, visitante do inverno.
 * Traços únicos: duas faixas escuras no peito (marca do magalhães) · topete de pingentes de gelo ·
 * nadadeiras abertas de equilibrista · pés rosados enormes · máscara branca em arco na bochecha.
 */
import { criatura, ave, animsAve, blob, calota, spike, par, m, lz, qz } from './kits';

export const paletaPinguim = {
  rampas: [
    ['#232a4a', '#3b4a73', '#6079a3'], // 0 costas azul-ardósia (sombra anil)
    ['#a9b6d6', '#eef3fb', '#ffffff'], // 1 barriga branca (sombra azulada)
    ['#4f9fd0', '#9ad9f2', '#e2fbff'], // 2 gelo e água
    ['#b0506a', '#f08a8a', '#ffc9b0'], // 3 pés, bico e bochecha rosados
  ] as [string, string, string][],
  contorno: '#1a1c38',
  extras: { w: '#ffffff', p: '#1a1c38', f: '#3b4a73' },
};

/** Monta o pinguim-base da linha (usado também pelo Pinguimar). */
export function pinguimBase(k: number, cabeca: number) {
  const { rig, ref } = ave({
    corpo: [0.27 * k, 0.2 * k, 0.2 * k], ergue: 80,
    pescoco: { len: 0.07 * k, ang: 80, r: 0.15 * k },
    cabeca: [0.2 * cabeca, 0.185 * cabeca, 0.19 * cabeca],
    bico: { len: 0.13 * cabeca, r: 0.06 * cabeca, y: -0.2, achata: 0.8 },
    asa: { len: 0.3 * k, larg: 0.12 * k, esp: 0.03 * k, cai: 34, ponta: 0.3 },
    cauda: { len: 0.12 * k, larg: 0.07 * k, ang: 30, penas: 3, abre: 20 },
    pernas: { alt: 0.07 * k, r: 0.04 * k, z: 0.5, x: 0.0, dedo: 0.13 * k },
    olho: { r: 0.03 * cabeca, pos: [0.115 * cabeca, 0.035 * cabeca, 0.155 * cabeca] },
    rampas: { corpo: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 3, perna: 3 },
  });
  // nadadeiras abertas para os lados
  rig.bones.asa_d.rotation.x = -0.55; rig.bones.asa_e.rotation.x = 0.55;
  // barrigão branco e as duas faixas do magalhães
  rig.add('tronco', blob([0.25 * k, 0.17 * k, 0.185 * k], m(1), { pos: [-0.0, -0.065 * k, 0] }));
  for (const [de, ate] of [[44, 54], [64, 72]] as const)
    rig.add('tronco', calota([0.176 * k, 0.26 * k, 0.192 * k], m.plano(0), { de, ate, pos: [0, -0.065 * k, 0], rot: [0, 0, -90] }));
  // máscara branca em arco: bochecha + garganta
  par((_, s) => rig.add('cabeca', blob([0.085 * cabeca, 0.07 * cabeca, 0.04 * cabeca], m(1), { pos: [0.06 * cabeca, -0.07 * cabeca, 0.155 * cabeca * s], seg: 14 })));
  rig.add('cabeca', blob([0.1 * cabeca, 0.06 * cabeca, 0.14 * cabeca], m(1), { pos: [0.07 * cabeca, -0.13 * cabeca, 0] }));
  return { rig, ref };
}

function build() {
  const { rig, ref } = pinguimBase(1, 1.1);
  // topete de três pingentes de gelo
  rig.bone('topete', 'cabeca', [ref.topo[0] + 0.02, ref.topo[1] - 0.03, 0], [0, 0, 10]);
  rig.add('topete',
    spike(0.13, 0.04, m.luz(2), { rot: [0, 0, -30] }), spike(0.17, 0.045, m(2), { rot: [0, 0, 8] }), spike(0.12, 0.04, m.luz(2), { rot: [0, 0, 44] }));
  // bochechas rosadas de frio
  par((_, s) => rig.add('cabeca', blob([0.035, 0.028, 0.02], m.plano(3), { pos: [0.1, -0.055, 0.17 * s], seg: 10 })));
  // gotinha de gelo na ponta da cauda
  rig.add('cauda1', calota([0.05, 0.05, 0.05], m.luz(2), { de: 0, ate: 180, pos: [-0.12, 0, 0] }));
  return rig;
}

const anims = animsAve({ u: 0.7, hPerna: 0.07, mole: 1.3 }, {
  idle: { topete: lz([0, 5, 9, -4]) },
  especial: { topete: qz([0, 12, 16, -26, -8, 0]) },
  dano: { topete: qz([26, 10, 0]) },
});

export const pinguinzinho = criatura({
  num: 133, id: 'pinguinzinho', nome: 'Pinguinzinho', porte: 'P', estagio: 'basico', paleta: paletaPinguim, build, anims,
  olho: {
    frente: ['.ww.', 'wpwp', 'wppp', '.pp.'],
    fechado: ['ffff', 'wffw', 'fwwf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
