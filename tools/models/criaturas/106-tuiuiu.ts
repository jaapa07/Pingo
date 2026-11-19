/**
 * 106 · TUIUIÚ (Vento/Rio) — o símbolo do Pantanal, de papo vermelho, mais alto que uma criança. Estágio final.
 * Mantém da linha: corpo branco, cabeça e pescoço negros, bicão arrebitado, pernas compridas negras, o peixe azul.
 * Cresce: altura imponente · PAPO vermelho inflado como um colar · asas enormes entreabertas de pontas longas ·
 * penacho ralo na nuca · anéis d'água em volta dos pés · bico gigante.
 */
import { criatura, animsAve, blob, pena, ring, par, m, ls, lz, qs, unirExtras, D2R } from './kits';
import { asasContidas } from './051-ararinha';
import { paletaTuiuiu, corpoTuiuiu, peixeNoBico } from './105-tuiuiuzim';

function build() {
  const { rig } = corpoTuiuiu({ k: 1.25, pescoco: 0.46, perna: 0.62, cabeca: [0.13, 0.115, 0.11], bico: 0.44, gola: 0.16, ergue: 22 });
  par((l, s) => {
    rig.bones['asa_' + l].rotation.y = 16 * s * D2R;
    rig.add('asa2_' + l, pena(0.3, 0.1, m.luz(0), { esp: 0.05, pos: [0.04, -0.14, 0], rot: [0, 0, 22] }), pena(0.24, 0.09, m.sombra(0), { esp: 0.05, pos: [0.1, -0.2, 0], rot: [0, 0, 34] }));
    rig.add('perna_' + l, blob([0.09, 0.11, 0.09], m(0), { pos: [0, -0.02, 0], seg: 10 }));
  });
  // penacho ralo na nuca e dobra do papo
  rig.add('cabeca', blob([0.05, 0.03, 0.05], m.luz(1), { pos: [-0.1, 0.07, 0], seg: 8 }));
  rig.add('gola', blob([0.08, 0.05, 0.11], m.sombra(2), { pos: [0.02, -0.08, 0], seg: 10 }));
  peixeNoBico(rig, [0.2, 0.0, 0], 0.9);
  // anéis d'água
  rig.bone('agua', 'base', [0, 0.012, 0]);
  rig.add('agua', ring(0.26, 0.022, m(3), { rot: [90, 0, 0] }), ring(0.14, 0.018, m.luz(3), { rot: [90, 0, 0] }));
  return rig;
}

const anims = animsAve({ u: 1.3, hPerna: 0.62, mole: 0.7 }, unirExtras(asasContidas, {
  idle: { gola: ls([1, 1.06, 1.14, 1.05]), agua: ls([1, 1.1, 1.2, 1.08]), peixe: lz([0, 4, 0, -4]) },
  especial: { gola: qs([1, 1.2, 1.4, 1.7, 1.3, 1]) },
  desmaio: { agua: [{ t: 0, s: 1, e: 'linear' }, { t: 1, s: 0.3, e: 'linear' }] },
}));

export const tuiuiu = criatura({
  num: 106, id: 'tuiuiu', nome: 'Tuiuiú', porte: 'G', estagio: 'final', paleta: paletaTuiuiu, build, anims,
  olho: { frente: ['.ww.', 'wppw', 'wpww', '.ww.'], fechado: ['ffff', 'wffw', 'fwwf', 'ffff'], mapa: ['w', 'p'] },
});
