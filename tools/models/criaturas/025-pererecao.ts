/**
 * 025 · PERERECÃO (Rio) — perereca-macaco gigante, que anda agarrando os galhos em vez de pular.
 * Mantém da linha: verde-folha, barriga creme, olhões de íris laranja, ventosas laranja, a gota d'água.
 * Cresce: braços e pernas compridos de "macaco" · pintas creme de aro escuro nos flancos e nas coxas ·
 * glândulas saltadas atrás dos olhos · papo grande · três gotas escorrendo.
 */
import { criatura, anfibio, animsAnfibio, blob, par, m, lz, qp, qz, unirExtras } from './kits';
import { paletaPerereca, gota, contido } from './024-pererequinha';

function build() {
  const { rig, ref } = anfibio({
    corpo: [0.27, 0.19, 0.22], ergue: 34, cabeca: [0.21, 0.14, 0.22], olhoSaliente: 0.08,
    bracos: { len: 0.34, r: 0.046 }, pernas: { coxa: 0.3, canela: 0.3, pe: 0.22, r: 0.055 },
    ventosa: 0.048, papo: 0.09, olho: { r: 0.028 },
    rampas: { pele: 0, barriga: 1, pernas: 0, dedos: 2, papo: 1, olho: 0 },
  });
  par((l, s) => {
    // glândula saltada atrás do olho, descendo pelo ombro
    rig.add('cabeca', blob([0.12, 0.05, 0.06], m.luz(0), { pos: [0.0, 0.1, 0.17 * s], rot: [0, 10 * s, -16], seg: 12 }));
    // pintas creme com aro escuro nos flancos
    for (const [x, y, r] of [[0.1, -0.03, 0.04], [-0.03, -0.01, 0.048], [-0.15, 0.01, 0.036]] as const) {
      rig.add('tronco', blob([r * 1.35, r * 1.35, 0.02], m.sombra(0), { pos: [x, y, (0.215 - Math.abs(x) * 0.12) * s], seg: 10, castShadow: false }));
      rig.add('tronco', blob([r, r, 0.026], m.plano(1), { pos: [x, y, (0.222 - Math.abs(x) * 0.12) * s], seg: 10, castShadow: false }));
    }
    // pinta na coxa e lábio creme
    rig.add('perna_t' + l, blob([0.045, 0.045, 0.045], m.plano(1), { pos: [0.12, -0.02, 0.085 * s], seg: 8, castShadow: false }));
    rig.add('cabeca', blob([0.15, 0.022, 0.03], m.plano(1), { pos: [0.14, -0.03, 0.19 * s], rot: [0, -16 * s, 0], seg: 8 }));
  });
  // pintas claras no lombo e três gotas
  for (const [x, z] of [[0.05, 0.0], [-0.1, 0.09], [-0.1, -0.09]] as const) rig.add('tronco', blob([0.04, 0.02, 0.04], m.luz(0), { pos: [x, 0.185 - Math.abs(x) * 0.2, z], seg: 8, castShadow: false }));
  gota(rig, 'gota', 'cabeca', [ref.topoOlho[0] - 0.03, ref.topoOlho[1] + 0.04, 0], 0.055);
  gota(rig, 'gota2', 'tronco', [-0.2, 0.2, 0.1], 0.04);
  gota(rig, 'gota3', 'tronco', [-0.1, 0.24, -0.1], 0.03);
  return rig;
}

const anims = animsAnfibio({ u: 0.6, papo: true, mole: 1.2 }, unirExtras(contido, {
  idle: { gota: lz([0, 6, 0, -6]), perna_fe: lz([0, 4, 8, 3]) },
  // braçada de macaco no lugar do salto
  fisico: { perna_fe: qz([-10, -30, 50, 20, 0]), canela_fe: qz([-10, -24, 20, 8, 0]), gota: qp([[0, 0, 0], [0, -0.01, 0], [0, 0.08, 0], [0, 0.03, 0], [0, 0, 0]]) },
  especial: { gota: qp([[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.1, 0], [0, 0.04, 0], [0, 0, 0]]), gota2: qp([[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [-0.04, 0.14, 0], [-0.02, 0.05, 0], [0, 0, 0]]) },
  dano: { gota: qp([[-0.04, 0.08, 0], [-0.02, 0.03, 0], [0, 0, 0]]) },
}));

export const pererecao = criatura({
  num: 25, id: 'pererecao', nome: 'Pererecão', porte: 'M', estagio: 'medio', paleta: paletaPerereca, build, anims,
  olho: {
    frente: ['.aaa.', 'apppa', 'appwa', 'apppa', '.aaa.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
