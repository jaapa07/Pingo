/**
 * 158 · LOUVA-MESTRE (Inseto/Ginga) — louva-a-deus mestre de kata. Estágio final.
 * Mantém da linha: verde-folha, foices de lâmina clara, olhões nos cantos da cabeça, cordão de ginga.
 * Cresce: postura de kata (uma foice erguida, outra em guarda) · foices longas com serrilha ·
 * asas-capa de folha abertas em V nas costas · coroa de três folhas · cordão comprido de duas voltas ·
 * placas claras no protórax alto.
 */
import { criatura, animsInseto, blob, folha3d, spike, ring, par, m, lz, qz, qr, D2R } from './kits';
import { paletaLouva, louva, gingaLouva } from './157-louvadeuzim';

function build() {
  const k = 1.15;
  const { rig, topo } = louva({ k, pro: 0.44, foice: 0.3, faixa: 0.34, alt: 0.3 });
  // KATA: foice esquerda (a que a câmera de frente vê) erguida acima da cabeça; direita em guarda baixa
  rig.bones.pata1_e.rotation.z = 70 * D2R; rig.bones.pata1_e.rotation.x = -32 * D2R; rig.bones.pata1_d.rotation.x = 14 * D2R; rig.bones.tarso1_e.rotation.z = -34 * D2R;
  rig.bones.pata1_d.rotation.z = -6 * D2R; rig.bones.tarso1_d.rotation.z = 14 * D2R;
  // serrilha nas lâminas
  par((l) => { for (const y of [0.08, 0.16, 0.24]) rig.add('tarso1_' + l, spike(0.07, 0.022, m.luz(1), { pos: [0.07 * k, y, 0], rot: [0, 0, -70] })); });
  // asas-capa: duas folhas grandes abertas em V + nervuras
  par((l, s) => {
    rig.bone('capa_' + l, 'corpo', [-0.06, 0.1, 0.05 * s], [-24 * s, 0, 58]);
    rig.add('capa_' + l, folha3d(0.62, 0.3, m.sombra(0), { esp: 0.3, curva: -18 }), folha3d(0.5, 0.1, m.luz(0), { esp: 0.5, pos: [0.012, 0.03, 0.02 * s], curva: -18 }));
  });
  // coroa de três folhas
  rig.bone('coroa', 'cabeca', [topo[0] - 0.02, topo[1], 0]);
  for (const [g, len] of [[-34, 0.15], [4, 0.2], [42, 0.15]] as const) rig.add('coroa', folha3d(len, 0.09, g === 4 ? m.luz(0) : m(0), { rot: [0, 0, g], esp: 0.55 }));
  // segunda volta do cordão e placas do protórax
  rig.add('corpo', ring(0.1 * k, 0.03 * k, m.luz(2), { pos: [-0.13 * k, 0.01, 0], rot: [0, 90, 0] }));
  for (const t of [0.3, 0.55, 0.8]) rig.add('corpo', blob([0.05, 0.03, 0.07], m(1), { pos: [0.09 + t * 0.09, t * 0.42 - 0.02, 0], rot: [0, 0, 70], seg: 10 }));
  // faixas escuras no abdômen
  for (const x of [-0.14, -0.26, -0.36]) rig.add('abdomen', blob([0.022, 0.1 + x * 0.1, 0.12 + x * 0.12], m.sombra(0), { pos: [x, 0.015, 0], seg: 10 }));
  return rig;
}

const anims = animsInseto({ u: 1, alt: 0.3, mole: 0.7 }, {
  ...gingaLouva,
  idle: { ...gingaLouva.idle, coroa: lz([0, 4, 7, 2]), capa_d: lz([0, 3, 6, 2]), capa_e: lz([0, 3, 6, 2]), pata1_e: lz([0, 3, 6, 2]) },
  // o golpe de cima para baixo com a foice erguida
  fisico: { faixa: qz([10, 20, -24, -8, 0]), pata1_e: qz([14, 30, -90, -60, 0]), tarso1_e: qz([-10, -24, 40, 20, 0]), pata1_d: qz([0, 10, -20, -8, 0]), capa_d: qz([6, 14, -10, -4, 0]), capa_e: qz([6, 14, -10, -4, 0]) },
  especial: { faixa: qz([0, 10, 14, -26, -10, 0]), pata1_e: qz([0, 10, 14, -50, -20, 0]), pata1_d: qz([10, 40, 60, -20, -8, 0]), tarso1_d: qz([0, -20, -30, -40, -14, 0]), capa_d: qr([[0, 0, 0], [-10, 0, 10], [-14, 0, 14], [-40, 0, -20], [-16, 0, -8], [0, 0, 0]]), capa_e: qr([[0, 0, 0], [10, 0, 10], [14, 0, 14], [40, 0, -20], [16, 0, -8], [0, 0, 0]]), coroa: qz([0, 10, 14, -20, -8, 0]) },
  desmaio: { ...gingaLouva.desmaio, pata1_e: qz([0, -20, -50, -70, -68]), capa_d: qz([0, 6, 16, 26, 24]), capa_e: qz([0, 6, 16, 26, 24]) },
});

export const louvaMestre = criatura({
  num: 158, id: 'louva-mestre', nome: 'Louva-Mestre', porte: 'M', estagio: 'final', paleta: paletaLouva, build, anims,
  olho: {
    frente: ['aaaa.', 'aawa.', 'aapaa', '.aaa.'],
    fechado: ['ppppp', 'ppppp', 'aappa', 'ppppp'],
    mapa: ['a', 'p'],
  },
});
