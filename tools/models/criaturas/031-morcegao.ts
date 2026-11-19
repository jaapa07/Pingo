/**
 * 031 · MORCEGÃO (Veneno/Vento) — morcego-vampiro de mordida que não se sente.
 * Mantém da linha: pelo ameixa, membrana roxa de dedos aparentes, orelhas de miolo rosa, gola creme, o vermelho.
 * Cresce: asas largas · nariz-folha arrebitado · duas presas brancas com gota vermelha · sobrancelha brava ·
 * crista de pelo na nuca · garras nos pés no lugar da pitanga.
 */
import { criatura, blob, tufo, garra, par, m, lz, ls, qz } from './kits';
import { paletaMorcego, corpoMorcego, animsMorcego } from './030-morceguim';

function build() {
  const { rig, ref } = corpoMorcego({ k: 1.15, flutua: 0.2, cabeca: [0.19, 0.17, 0.19], orelha: [0.26, 0.14], focinho: 0.07, asa: 1.0, tomba: 0.3 });
  // nariz-folha
  rig.add('cabeca', blob([0.035, 0.07, 0.06], m.plano(2), { pos: [ref.focinho[0] + 0.02, ref.focinho[1] + 0.07, 0], rot: [0, 0, 20], seg: 10 }));
  par((l, s) => {
    // presas e sobrancelha
    rig.add('cabeca', blob([0.02, 0.055, 0.02], m.luz(2), { pos: [ref.focinho[0] - 0.01, ref.focinho[1] - 0.07, 0.045 * s], seg: 8 }));
    rig.add('cabeca', blob([0.07, 0.024, 0.06], m.sombra(0), { pos: [0.13, 0.1, 0.1 * s], rot: [-22 * s, 0, -26], seg: 8 }));
    // garras nos pés
    for (const g of [-30, 0, 30]) rig.add('perna_' + l, garra(0.07, 0.02, m.luz(2), { pos: [0.02, -0.12, 0], rot: [0, g, -50], curva: 0.4 }));
    // barra creme na ponta da asa
    rig.add('asa2_' + l, blob([0.03, 0.05, 0.07], m.plano(2), { pos: [-0.03, 0.1, 0.5 * s], seg: 8 }));
  });
  // crista de pelo na nuca e gota vermelha na presa
  rig.bone('crista', 'cabeca', [-0.08, ref.topo[1] - 0.03, 0], [0, 0, 36]);
  rig.add('crista', tufo(3, 0.13, 0.055, m(0), { abre: 30 }));
  rig.bone('gota', 'cabeca', [ref.focinho[0] - 0.01, ref.focinho[1] - 0.15, -0.045]);
  rig.add('gota', blob([0.026, 0.038, 0.026], m(3), { seg: 8 }));
  return rig;
}

const anims = animsMorcego({ u: 0.9, flutua: 0.16, mole: 1 }, {
  idle: { crista: lz([0, 5, 10, 3]), gota: ls([1, 1.2, 1.5, 0.5]) },
  especial: { crista: qz([0, 14, 20, -24, -8, 0]) },
  dano: { crista: qz([24, 8, 0]) },
});

export const morcegao = criatura({
  num: 31, id: 'morcegao', nome: 'Morcegão', porte: 'M', estagio: 'medio', paleta: paletaMorcego, build, anims,
  olho: {
    frente: ['.aa.', 'apwa', 'appa', '.aa.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['a', 'p'],
  },
});
