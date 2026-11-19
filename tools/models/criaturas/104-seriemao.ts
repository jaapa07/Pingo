/**
 * 104 · SERIEMÃO (Ginga/Comum) — seriema caçadora de cobra, que golpeia com o bico e com a garra em foice. Estágio final.
 * Mantém da linha: penacho na testa, bico e pernas vermelhos, cauda longa de faixa escura e ponta creme, aro azul do olho.
 * Cresce: penacho alto em leque · bico-machadinha grosso · GARRA em foice erguida na perna da frente ·
 * pescoço comprido de plumas eriçadas · asas de pontas barradas · cauda em leque de cinco penas.
 */
import { criatura, animsAve, blob, garra, pena, tufo, par, m, lz, qz, unirExtras, D2R } from './kits';
import { asasContidas } from './051-ararinha';
import { paletaSeriema, corpoSeriema } from './103-seriemim';

function build() {
  const { rig } = corpoSeriema({ k: 1.3, pescoco: 0.42, perna: 0.54, cabeca: [0.14, 0.125, 0.12], bico: 0.2, cauda: 0.62, penacho: 0.2 });
  // plumas eriçadas descendo a nuca
  for (const [y, t] of [[0.34, 60], [0.22, 70], [0.1, 80]] as const) rig.add('pescoco', tufo(2, 0.11, 0.035, m.luz(0), { pos: [-0.03 + y * 0.28, y, 0], rot: [0, 0, t], abre: 16 }));
  // bico-machadinha: reforço no cúlmen
  rig.add('cabeca', blob([0.09, 0.03, 0.04], m.luz(2), { pos: [0.19, 0.03, 0], rot: [0, 0, -14], seg: 8 }));
  par((l, s) => {
    // GARRA em foice no dedo de dentro
    rig.add('canela_' + l, garra(0.15, 0.035, m(3), { pos: [0.03, -0.3, 0.02 * s], rot: [0, 0, 40], curva: 0.9 }));
    rig.add('asa2_' + l, pena(0.16, 0.06, m.luz(1), { esp: 0.045, pos: [-0.06, 0.02, 0.02 * s] }));
    rig.add('cauda1', pena(0.5, 0.08, m(0), { esp: 0.03, rot: [90, 24 * s, 0], pos: [0.02, 0.012, 0] }), blob([0.04, 0.03, 0.05], m.luz(1), { pos: [-0.44, 0.012, 0.2 * s], seg: 8 }));
  });
  // golpe armado: perna da frente erguida, pescoço para trás
  rig.bones.perna_e.rotation.z = 50 * D2R; rig.bones.canela_e.rotation.z = -84 * D2R;
  rig.bones.pescoco.rotation.z = 8 * D2R;
  rig.add('tronco', blob([0.12, 0.12, 0.15], m.luz(1), { pos: [0.2, 0.0, 0], seg: 10 }));
  return rig;
}

const anims = animsAve({ u: 1.15, hPerna: 0.54, mole: 0.8 }, unirExtras(asasContidas, {
  idle: { penacho: lz([0, 4, 8, -3]), perna_e: lz([0, 3, 6, 2]) },
  // bicada de cima para baixo + foice
  fisico: { pescoco: qz([16, 26, -40, -16, 0]), cabeca: qz([8, 14, -24, -8, 0]), perna_e: qz([6, 14, -44, -18, 0]), canela_e: qz([-6, -14, 70, 26, 0]) },
  especial: { penacho: qz([0, 14, 20, -26, -8, 0]) },
  dano: { penacho: qz([28, 10, 0]) },
}));

export const seriemao = criatura({
  num: 104, id: 'seriemao', nome: 'Seriemão', porte: 'G', estagio: 'final', paleta: paletaSeriema, build, anims,
  olho: { frente: ['ppp..', '.aaa.', 'apwpa', 'apppa', '.aaa.'], fechado: ['.....', '.aaa.', 'afffa', 'apppa', '.aaa.'], mapa: ['a', 'p'] },
});
