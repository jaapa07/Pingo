/**
 * 072 · PINTADA (Comum/Ginga) — onça-pintada majestosa. Estágio final.
 * Mantém da linha: ouro com rosetas em anel de miolo ferrugem, orelhas redondas escuras, bochechas de bigode, ponta da cauda preta.
 * Cresce: corpo comprido e musculoso de peito alto · cauda longa em S · faixas de capoeira creme nas patas da frente
 * e cordão trançado no pescoço · mandíbula larga com presas · sobrancelha brava e íris verde.
 */
import { criatura, animsQuadrupede, blob, listra, ring, pena, par, m, lz, qz, type V3 } from './kits';
import { pintas, dosDois } from './069-jaguatirim';
import { paletaOnca, corpoOnca } from './071-oncinha';

function build() {
  const tr: V3 = [0.42, 0.24, 0.22];
  const { rig, ref } = corpoOnca({ k: 1.4, tronco: tr, peito: 1.2, pernas: 0.36, rPerna: 0.095, cabeca: [0.25, 0.22, 0.24], pesc: [0.2, 44], cauda: { len: 0.85, ang: -24, curva: -34, r: 0.06 } });
  pintas(rig, 'corpo', [0, 0, 0], tr, dosDois([[0.62, 44], [0.3, 34], [-0.02, 44], [-0.35, 36], [-0.68, 48], [0.46, 84, 0.9], [0.12, 88], [-0.2, 84, 0.9], [-0.52, 86], [0.3, 0, 0.8], [-0.05, 0, 0.8], [-0.4, 0, 0.8]]), 0.06, m.plano(1), m.plano(3));
  // ombros e coxas musculosos, com pintas cheias
  par((l, s) => {
    rig.add('perna_f' + l, blob([0.13, 0.17, 0.1], m(0), { pos: [0, 0.0, 0.01 * s] }), blob([0.035, 0.035, 0.03], m.plano(1), { pos: [0.02, -0.02, 0.1 * s], seg: 8 }), blob([0.03, 0.03, 0.03], m.plano(1), { pos: [-0.04, -0.12, 0.085 * s], seg: 8 }));
    rig.add('perna_t' + l, blob([0.15, 0.19, 0.11], m(0), { pos: [-0.01, 0.0, 0.01 * s] }), blob([0.035, 0.035, 0.03], m.plano(1), { pos: [0, -0.03, 0.11 * s], seg: 8 }), blob([0.03, 0.03, 0.03], m.plano(1), { pos: [-0.06, 0.07, 0.1 * s], seg: 8 }));
    // faixas de capoeira nas patas da frente
    for (const y of [-0.06, -0.13]) rig.add('canela_f' + l, listra(0.098, 0.034, m(2), { pos: [0, y, 0] }));
    // presas
    const pf = ref.pontaFocinho as V3;
    rig.add('cabeca', blob([0.02, 0.055, 0.02], m.luz(2), { pos: [pf[0] - 0.04, pf[1] - 0.09, 0.05 * s], seg: 8 }));
  });
  // mandíbula larga
  rig.add('cabeca', blob([0.15, 0.08, 0.16], m(2), { pos: [0.2, -0.19, 0] }));
  // cordão trançado no pescoço com duas pontas
  rig.add('pescoco', ring(0.17, 0.04, m(3), { pos: [0.06, 0.08, 0], rot: [90, 0, -40] }));
  rig.bone('cordao', 'pescoco', [0.16, -0.04, -0.1], [0, 0, 100]);
  rig.add('cordao', pena(0.2, 0.07, m(3), { esp: 0.035, rot: [0, 0, -10] }), pena(0.15, 0.06, m.luz(3), { esp: 0.035, rot: [0, 0, 22] }));
  // anéis da cauda
  for (const c of [1, 2]) rig.add('cauda' + c, blob([0.03, 0.074, 0.074], m.plano(1), { pos: [-0.16, 0, 0], seg: 10 }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.2, hPerna: 0.36, mole: 0.6, cauda: 0.6 }, {
  idle: { cordao: lz([0, 4, 8, 3]), cauda3: lz([0, -6, -10, -4]) },
  fisico: { cordao: qz([10, 20, -24, -8, 0]) },
  especial: { cordao: qz([0, 10, 14, -26, -10, 0]), cauda3: qz([0, 8, 12, -16, -6, 0]) },
});

export const pintada = criatura({
  num: 72, id: 'pintada', nome: 'Pintada', porte: 'G', estagio: 'final', paleta: paletaOnca, build, anims,
  olho: {
    frente: ['pp...', 'paap.', '.awpp', '.aapp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
