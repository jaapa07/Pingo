/**
 * 108 · GARÇA-REAL (Vento/Rio) — garça-real elegante, de boné negro e cara azul, que pesca parada feito estátua. Estágio final.
 * Mantém da linha: corpo branco esguio, pescoço fino, bico-agulha, pernas compridas, plumas na nuca, véu nas costas.
 * Cresce: BONÉ negro · cara e bico azuis · pescoço e peito amarelo-creme · três plumas brancas compridíssimas
 * caindo da nuca · pousada numa perna só · manto de plumas até o chão · anel d'água sob o pé.
 */
import { criatura, animsAve, blob, calota, pena, ring, par, m, lz, ls, qz, unirExtras, D2R } from './kits';
import { asasContidas } from './051-ararinha';
import { paletaGarca, corpoGarca } from './107-garcinha';

function build() {
  const { rig } = corpoGarca({ k: 1.35, pescoco: 0.5, perna: 0.62, cabeca: [0.11, 0.095, 0.09], bico: 0.26, rBico: 3, rPerna: 3, pluma: 0.5 });
  // boné negro, cara azul, ponta do bico escura
  rig.add('cabeca', calota([0.116, 0.1, 0.095], m(1), { de: 0, ate: 62, rot: [0, 0, 18] }));
  par((l, s) => {
    rig.add('cabeca', blob([0.06, 0.05, 0.03], m(3), { pos: [0.06, 0.0, 0.07 * s], seg: 10 }));
    // manto de plumas até embaixo
    rig.add('asa2_' + l, pena(0.3, 0.07, m.luz(0), { esp: 0.04, pos: [0.04, -0.1, 0.02 * s], rot: [0, 0, 26] }));
  });
  rig.add('cabeca', blob([0.06, 0.025, 0.025], m.sombra(1), { pos: [0.34, -0.012, 0], seg: 6 }));
  // terceira pluma comprida
  rig.add('pluma', pena(0.44, 0.04, m(0), { esp: 0.035, rot: [20, 0, -8] }));
  // pescoço e peito amarelo-creme
  rig.add('pescoco', blob([0.07, 0.24, 0.065], m.luz(2), { pos: [0.06, 0.2, 0], rot: [0, 0, -20], seg: 12 }));
  rig.add('tronco', blob([0.12, 0.13, 0.14], m.luz(2), { pos: [0.2, 0.02, 0], seg: 12 }));
  // numa perna só: a de trás recolhida junto ao corpo
  rig.bones.perna_d.rotation.z = 70 * D2R; rig.bones.canela_d.rotation.z = -130 * D2R;
  rig.bone('agua', 'base', [0, 0.012, 0]);
  rig.add('agua', ring(0.2, 0.02, m(3), { rot: [90, 0, 0] }), ring(0.1, 0.016, m.luz(3), { rot: [90, 0, 0] }));
  return rig;
}

const anims = animsAve({ u: 1.25, hPerna: 0.62, mole: 0.7 }, unirExtras(asasContidas, {
  idle: { pluma: lz([0, 4, 8, 3]), agua: ls([1, 1.1, 1.2, 1.08]) },
  // bote do bico-agulha
  fisico: { pescoco: qz([18, 30, -44, -18, 0]), cabeca: qz([-8, -14, 20, 8, 0]) },
  especial: { pluma: qz([0, 14, 20, -26, -8, 0]) },
  dano: { pluma: qz([-28, -10, 0]) },
  andar: { perna_d: lz([26, 0, -26, 0]) },
  desmaio: { agua: [{ t: 0, s: 1, e: 'linear' }, { t: 1, s: 0.3, e: 'linear' }] },
}));

export const garcaReal = criatura({
  num: 108, id: 'garca-real', nome: 'Garça-Real', porte: 'G', estagio: 'final', paleta: { ...paletaGarca, extras: { ...paletaGarca.extras, f: '#58a8e6' } }, build, anims,
  olho: { frente: ['ppp.', 'apwa', 'appa', '.aa.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
