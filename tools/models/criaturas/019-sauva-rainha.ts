/**
 * 019 · SAÚVA-RAINHA (Inseto/Terra) — rainha alada de formigueiro. Estágio final.
 * Mantém da linha: ferrugem com ameixa, cabeçorra de tesoura, espinhos, verde da folha cortada.
 * Cresce: abdômen enorme de cintas creme · quatro asas de vitral erguidas · coroa de três espinhos claros ·
 * manto de folhas cortadas nos ombros · estandarte: uma folha inteira fincada na ponta do abdômen.
 */
import { criatura, inseto, animsInseto, blob, slab, spike, segmento, folha3d, par, m, lz, qz, qr, lr, type V3 } from './kits';
import { paletaSauva } from './018-formigaco';
import { placaAsa } from './017-bruxaluz';

function build() {
  const { rig } = inseto({
    torax: [0.19, 0.16, 0.16], abdomen: [0.31, 0.25, 0.25], cabeca: [0.21, 0.19, 0.21], alt: 0.33, caiAbdomen: 14,
    patas: { abre: 0.32, r: 0.038 }, antenas: { len: 0.24, r: 0.02, abre: 34, bola: 0.036 }, mandibulas: 0.13,
    olho: { r: 0.036, pos: [0.21, 0.03, 0.16] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 1, antenas: 1 },
  });
  rig.add('corpo', blob([0.06, 0.08, 0.06], m.sombra(0), { pos: [-0.18, 0.02, 0], seg: 10 }));
  // cintas creme no abdômen e ponta escura
  for (const [x, k] of [[-0.12, 0.97], [-0.27, 1.04], [-0.42, 0.87]] as const) rig.add('abdomen', blob([0.04, 0.25 * k, 0.25 * k], m(3), { pos: [x, 0, 0], seg: 16 }));
  rig.add('abdomen', blob([0.08, 0.1, 0.1], m(1), { pos: [-0.52, 0, 0], seg: 12 }));
  // COROA de três espinhos claros + sulco da cabeça
  rig.bone('coroa', 'cabeca', [0.1, 0.16, 0]);
  for (const [z, a, h] of [[-0.1, -24, 0.19], [0, 0, 0.26], [0.1, 24, 0.19]] as const) rig.add('coroa', spike(h, 0.055, m.luz(3), { pos: [0, 0, z], rot: [a, 0, 6] }));
  rig.add('coroa', blob([0.07, 0.035, 0.13], m(3), { pos: [0, 0.01, 0], seg: 12 }));
  par((_, s) => rig.add('corpo', spike(0.13, 0.035, m(1), { pos: [-0.1, 0.12, 0.06 * s], rot: [18 * s, 0, 26] })));
  // manto de folhas nos ombros
  par((_, s) => {
    rig.add('corpo', folha3d(0.26, 0.2, m(2), { pos: [0.1, 0.1, 0.1 * s], rot: [118 * s, 0, 20], esp: 0.45 }), folha3d(0.2, 0.16, m.luz(2), { pos: [0.0, 0.12, 0.1 * s], rot: [100 * s, 0, 50], esp: 0.45 }));
  });
  // ASAS de vitral: par grande e par pequeno, erguidas e deitadas para trás
  par((l, s) => {
    rig.bone('asa_' + l, 'corpo', [-0.06, 0.13, 0.07 * s], [-18 * s, 0, 0]);
    rig.add('asa_' + l,
      placaAsa([[0, 0], [0.06, 0.28], [0.18, 0.6], [0.32, 0.8], [0.44, 0.76], [0.44, 0.52], [0.32, 0.24], [0.14, 0.02]], s, m.luz(3), 0.75, 0.03),
      placaAsa([[0.04, 0], [0.2, 0.1], [0.4, 0.3], [0.5, 0.3], [0.48, 0.14], [0.3, -0.02], [0.14, -0.06]], s, m(3), 0.75, 0.03));
    // nervuras
    for (const [e, a] of [[0.12, 0.3], [0.24, 0.5], [0.34, 0.66]] as const) for (const f of [1, -1])
      rig.add('asa_' + l, blob([0.016, 0.05, 0.035], m.sombra(3), { pos: [-a * 0.75 + 0.025 * f, a, e * s] as V3, seg: 8, castShadow: false }));
  });
  // estandarte de folha na ponta do abdômen
  rig.bone('cetro', 'abdomen', [-0.5, 0.1, 0], [0, 0, 20]);
  rig.add('cetro', slab([[0, 0], [0.12, 0.12], [0.16, 0.32], [0.08, 0.5], [0, 0.6], [-0.1, 0.5], [-0.17, 0.3], [-0.11, 0.1]], 0.045, m(2)), segmento([0, 0.02, 0], [0, 0.52, 0], 0.022, 0.014, m.luz(2)));
  return rig;
}

const anims = animsInseto({ u: 0.9, alt: 0.33, mole: 0.7, mapa: { comp: 0.8, larg: 1.1 } }, {
  idle: { cetro: lz([0, 3, 6, 2]), coroa: lz([0, 0, -3, 0]), asa_d: lr([[0, 0, 0], [-8, 0, 0], [-14, 0, 0], [-5, 0, 0]]), asa_e: lr([[0, 0, 0], [8, 0, 0], [14, 0, 0], [5, 0, 0]]) },
  fisico: { cetro: qz([-6, -12, 22, 8, 0]) },
  especial: { cetro: qz([0, -8, -12, 26, 8, 0]), asa_d: qr([[0, 0, 0], [-20, 0, 0], [20, 0, 0], [-36, 0, 0], [10, 0, 0], [0, 0, 0]]), asa_e: qr([[0, 0, 0], [20, 0, 0], [-20, 0, 0], [36, 0, 0], [-10, 0, 0], [0, 0, 0]]) },
  dano: { cetro: qz([-20, -8, 0]), asa_d: qr([[-24, 0, 0], [-8, 0, 0], [0, 0, 0]]), asa_e: qr([[24, 0, 0], [8, 0, 0], [0, 0, 0]]) },
  desmaio: { cetro: qz([0, 6, 14, 26, 24]), asa_d: qr([[0, 0, 0], [6, 0, 0], [20, 0, 0], [40, 0, 0], [38, 0, 0]]), asa_e: qr([[0, 0, 0], [-6, 0, 0], [-20, 0, 0], [-40, 0, 0], [-38, 0, 0]]) },
  andar: { cetro: lz([0, 5, 0, -5]) },
});

export const sauvaRainha = criatura({
  num: 19, id: 'sauva-rainha', nome: 'Saúva-Rainha', porte: 'M', estagio: 'final', paleta: paletaSauva, build, anims,
  olho: {
    frente: ['ppp..', 'ppppp', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
