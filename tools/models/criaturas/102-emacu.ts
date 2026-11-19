/**
 * 102 · EMAÇU (Terra/Ginga) — ema adulta de passadas que fazem o cerrado tremer. Estágio final.
 * Mantém da linha: pescoço comprido de cabeça chata, coroa escura, pernas compridas de joelho grosso, asas em saia.
 * Cresce: plumagem cinza-parda desgrenhada · asas enormes abertas em leque de plumas · GARRAS grossas ·
 * uma perna erguida pronta para o pisão · chão rachado com lascas de terra saltando · colar escuro.
 */
import { criatura, animsAve, blob, pena, garra, slab, par, m, lz, lp, qz, qp, unirExtras, D2R, type V3 } from './kits';
import { asasContidas } from './051-ararinha';
import { paletaEma, corpoEma } from './101-ema-mirim';

function build() {
  const { rig } = corpoEma({ k: 1.3, pescoco: 0.52, perna: 0.56, cabeca: [0.12, 0.1, 0.1], corpo: 0, asa: 0.46 });
  par((l, s) => {
    // plumas desgrenhadas na asa e na garupa
    rig.bones['asa_' + l].rotation.y = 20 * s * D2R;
    for (const [x, y, t] of [[-0.2, -0.16, 30], [-0.3, -0.12, 14], [-0.38, -0.05, 0]] as const) rig.add('asa_' + l, pena(0.2, 0.09, m.luz(0), { esp: 0.045, pos: [x, y, 0.04 * s], rot: [0, 0, t] }));
    rig.add('asa2_' + l, pena(0.24, 0.1, m(1), { esp: 0.05, pos: [0, -0.08, 0.02 * s], rot: [0, 0, 20] }));
    // garras grossas
    for (const g of [-30, 0, 30]) rig.add('canela_' + l, garra(0.12, 0.035, m(2), { pos: [0.06, -0.32, 0], rot: [0, g, -8], curva: 0.3 }));
  });
  rig.add('pescoco', blob([0.11, 0.09, 0.11], m(2), { pos: [0.0, 0.03, 0], seg: 10 }));
  for (const y of [0.2, 0.36]) rig.add('pescoco', blob([0.02, 0.06, 0.05], m.luz(0), { pos: [-0.03 + y * 0.2, y, 0], seg: 6 }));
  // perna da frente erguida para o pisão
  rig.bones.perna_e.rotation.z = 40 * D2R; rig.bones.canela_e.rotation.z = -70 * D2R;
  // CHÃO RACHADO: laje partida sob os pés e três lascas no ar (ossos próprios)
  rig.bone('chao', 'base', [0.1, 0, 0]);
  rig.add('chao', blob([0.36, 0.035, 0.26], m.sombra(3), { pos: [0, 0.01, 0], seg: 12 }), slab([[0, 0], [0.2, 0.03], [0.34, -0.02], [0.18, -0.05]], 0.03, m(2), { rot: [-90, 0, 0], pos: [-0.1, 0.045, 0.02] }), slab([[0, 0], [-0.16, 0.08], [-0.26, 0.04]], 0.03, m(2), { rot: [-90, 0, 0], pos: [0.0, 0.045, 0.0] }));
  const lascas: [string, V3, number][] = [['lasca1', [0.42, 0.14, -0.16], 0.07], ['lasca2', [0.3, 0.26, 0.2], 0.055], ['lasca3', [-0.18, 0.12, -0.26], 0.05]];
  for (const [nome, pos, r] of lascas) { rig.bone(nome, 'base', pos, [20, 30, 40]); rig.add(nome, blob([r, r * 0.6, r * 0.8], m(3), { seg: 5 }), blob([r * 0.5, r * 0.3, r * 0.4], m.luz(3), { pos: [0, r * 0.4, 0], seg: 5 })); }
  return rig;
}

const salta = (i: number) => { const y: V3[] = [[0, 0, 0], [0, 0.05, 0], [0, 0.08, 0], [0, 0.03, 0]]; return lp([...y.slice(i), ...y.slice(0, i)]); };
const anims = animsAve({ u: 1.2, hPerna: 0.56, mole: 0.7 }, unirExtras(asasContidas, {
  idle: { lasca1: salta(0), lasca2: salta(2), lasca3: salta(1), perna_e: lz([0, 4, 8, 3]) },
  // pisão: a perna erguida desce e as lascas saltam
  fisico: { perna_e: qz([10, 20, -40, -16, 0]), canela_e: qz([-10, -20, 60, 24, 0]), lasca1: qp([[0, 0, 0], [0, 0, 0], [0.04, 0.16, 0], [0.02, 0.06, 0], [0, 0, 0]]), lasca2: qp([[0, 0, 0], [0, 0, 0], [0, 0.2, 0.04], [0, 0.08, 0.02], [0, 0, 0]]) },
  especial: { perna_e: qz([0, 14, 20, -40, -14, 0]), canela_e: qz([0, -14, -20, 60, 20, 0]), lasca3: qp([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0.2, 0], [0, 0.08, 0], [0, 0, 0]]) },
}));

export const emacu = criatura({
  num: 102, id: 'emacu', nome: 'Emaçu', porte: 'G', estagio: 'final', paleta: paletaEma, build, anims,
  olho: { frente: ['ppp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
