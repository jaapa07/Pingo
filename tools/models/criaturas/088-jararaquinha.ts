/**
 * 088 · JARARAQUINHA (Veneno) — jararaca filhote, magrinha e desconfiada.
 * Traços únicos: cabeça em ponta de flecha com bochechas de veneno · selas escuras em trapézio no dorso ·
 * ponta da cauda clarinha erguida, que ela balança como isca · gota roxa de veneno pendurada na presa.
 */
import { criatura, serpente, animsSerpente, blob, calota, spike, par, m, lz, ls, qz, qp, type V3 } from './kits';
import { pintaFlanco, gomo, extrasCobra } from './086-sucurizinha';

export const paletaJararaca = {
  rampas: [
    ['#5c3f48', '#a67d55', '#dcb982'], // 0 pardo do corpo (sombra arroxeada)
    ['#2a1f30', '#4b3637', '#735748'], // 1 selas escuras, risca do olho
    ['#b59a88', '#efdfc0', '#fffaf0'], // 2 creme da barriga, presas e ponta da cauda
    ['#5a2a80', '#9c50d2', '#dba8ff'], // 3 veneno roxo
  ] as [string, string, string][],
  contorno: '#2a1c2c',
  extras: { w: '#ffffff', p: '#2a1c2c', f: '#a67d55', a: '#f2c53a' },
};

const CURVA = [74, 38, -62];

function build() {
  const r = 0.085, rF = 0.03, N = 6, len = 0.16;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.15, curva: CURVA, rFim: 0.075 },
    cauda: { segs: N, len, curva: [35, -70, -60, 70, 75, 30], rFim: rF },
    cabeca: [0.17, 0.1, 0.13],
    olho: { r: 0.028, pos: [0.115, 0.06, 0.085] },
    rampas: { corpo: 0, barriga: 2, cabeca: 0 },
  });
  // cabeça de flecha: bochechas de veneno largas atrás, topo mais escuro, risca atrás do olho
  par((_, s) => {
    rig.add('cabeca', blob([0.085, 0.07, 0.07], m(0), { pos: [0.02, 0.0, 0.095 * s], seg: 14 }));
    rig.add('cabeca', blob([0.08, 0.022, 0.02], m.plano(1), { pos: [0.02, 0.04, 0.155 * s], rot: [0, 14 * s, 16], seg: 10 }));
    rig.add('mandibula', spike(0.06, 0.016, m.luz(2), { pos: [0.19, 0.05, 0.045 * s], rot: [0, 0, 180] })); // presas
  });
  rig.add('cabeca', calota([0.15, 0.108, 0.1], m.sombra(0), { de: 0, ate: 62, pos: [0.08, 0.012, 0], rot: [0, 0, -8] }));
  // gota de veneno (osso próprio para pingar)
  rig.bone('gota', 'cabeca', [0.2, -0.085, -0.045]);
  rig.add('gota', blob([0.03, 0.04, 0.03], m(3), { seg: 10 }), blob([0.014, 0.014, 0.014], m.luz(3), { pos: [0.008, 0.012, -0.02], seg: 8 }));
  // selas escuras em trapézio
  for (const i of [1, 2, 3, 4, 5]) { const g = gomo(r, rF, N, i); for (const a of [-62, 62]) pintaFlanco(rig, 'cauda' + i, -len / 2, g.y, g.rm, a, m.plano(1), 0.6); }
  for (const a of [-75, 75]) { pintaFlanco(rig, 'pescoco1', 0.08, 0, 0.084, a, m.plano(1), 0.6); pintaFlanco(rig, 'pescoco2', 0.08, 0, 0.08, a, m.plano(1), 0.6); pintaFlanco(rig, 'pescoco3', 0.06, 0, 0.078, a, m.plano(1), 0.55); }
  // isca: ponta da cauda clara e erguida
  rig.bone('isca', 'cauda' + N, [-len, rF - r, 0], [0, 0, -70]);
  rig.add('isca', blob([0.07, 0.035, 0.035], m.luz(2), { pos: [-0.05, 0, 0], seg: 12 }), blob([0.03, 0.028, 0.028], m.luz(2), { pos: [-0.12, 0.012, 0], seg: 10 }));
  return rig;
}

const ex = extrasCobra(CURVA, 6);
const anims = animsSerpente({ u: 0.5, pescoco: 3, cauda: 6, mole: 0.9 }, {
  fisico: ex.fisico, desmaio: ex.desmaio,
  idle: { isca: lz([0, 22, -6, 18]), gota: [...ls([1, 1.1, 1.25, 0.9]), ...lp4()] },
  especial: { ...ex.especial, isca: qz([0, 24, 30, -30, -10, 0]), gota: qp([[0, 0, 0], [0, -0.01, 0], [0, -0.02, 0], [0.12, 0.02, 0], [0.2, -0.05, 0], [0, 0, 0]]) },
  dano: { isca: qz([30, 12, 0]) },
});
function lp4() { const v: V3[] = [[0, 0, 0], [0, -0.006, 0], [0, -0.016, 0], [0, 0, 0]]; return [...v, v[0]].map((p, i) => ({ t: i / 4, p, e: 'linear' as const })); }

export const jararaquinha = criatura({
  num: 88, id: 'jararaquinha', nome: 'Jararaquinha', porte: 'P', estagio: 'basico', paleta: paletaJararaca, build, anims,
  olho: {
    frente: ['pppp', 'appw', 'appa', '.aa.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['a', 'p'],
  },
});
