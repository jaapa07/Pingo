/**
 * 118 · ARRAIÃO (Rio/Veneno) — arraia gigante de ferrão. Estágio final.
 * Mantém da linha: couro ameixa com ocelos de brasa, olhos em calombos, asas em "V", ferrão verde-veneno.
 * Cresce: envergadura enorme com pontas de asa reviradas · espinhaço de espinhos claros no dorso ·
 * anéis de brasa duplos · cauda longa de chicote com ferrão serrilhado e gotas de veneno pingando · barbatanas de véu.
 */
import { criatura, blob, spike, par, m, lz, qz, ls, lp, qs } from './kits';
import { paletaArraia, arraia, animsArraia } from './117-arraiazinha';

function build() {
  const { rig, fim, seg } = arraia({
    disco: [0.34, 0.13, 0.26], flutua: 0.34, asa: { larg: 0.5, comp: 0.36, sobe: 40 }, cauda: { segs: 5, len: 0.8, r: 0.065 }, olho: 0.026,
    ocelos: [[0.1, 0.14, 0.075], [-0.14, 0.24, 0.065], [0.02, 0.36, 0.06], [-0.2, 0.46, 0.045], [0.14, 0.3, 0.035]],
  });
  // anéis duplos: aro escuro dentro das brasas maiores + brasa central no dorso
  par((l, s) => {
    rig.add('asa_' + l, blob([0.03, 0.03, 0.03], m.sombra(0), { pos: [0.1, 0.075, 0.14 * s], seg: 8 }), blob([0.026, 0.03, 0.026], m.sombra(0), { pos: [-0.14, 0.075, 0.24 * s], seg: 8 }));
    // pontas de asa com brasa
    rig.add('asa2_' + l, blob([0.06, 0.04, 0.06], m.plano(1), { pos: [-0.06, 0.02, 0.1 * s], seg: 10 }));
    // barbatanas de véu junto à cauda
    rig.add('tronco', blob([0.14, 0.03, 0.09], m(0), { pos: [-0.36, -0.02, 0.12 * s], rot: [0, 20 * s, 0], seg: 12 }));
    // sobrancelha
    rig.add('tronco', blob([0.07, 0.025, 0.05], m.sombra(0), { pos: [0.24, 0.2, 0.13 * s], rot: [0, 0, -20], seg: 8 }));
  });
  for (const [x, r] of [[0.02, 0.07], [-0.14, 0.06]] as const) rig.add('tronco', blob([r, 0.04, r], m.plano(1), { pos: [x, 0.11, 0], seg: 12 }), blob([r * 0.5, 0.04, r * 0.5], m.luz(1), { pos: [x, 0.125, 0], seg: 8 }));
  // espinhaço de espinhos claros até a cauda
  for (let i = 0; i < 4; i++) rig.add(i < 2 ? 'tronco' : 'cauda' + (i - 1), spike(0.1 - i * 0.012, 0.035, m(2), { pos: i < 2 ? [-0.22 - i * 0.1, 0.09, 0] : [-0.08, 0.05, 0], rot: [0, 0, 20] }));
  // ferrão serrilhado + gotas de veneno
  rig.bone('ferrao', fim, [-seg, 0, 0], [0, 0, 60]);
  rig.add('ferrao', spike(0.3, 0.06, m.plano(3)), spike(0.12, 0.035, m.plano(3), { pos: [0.02, 0.08, 0], rot: [0, 0, -60] }), spike(0.12, 0.035, m.plano(3), { pos: [-0.02, 0.14, 0], rot: [0, 0, 60] }), blob([0.06, 0.06, 0.06], m.luz(3), { seg: 10 }));
  rig.bone('gota1', 'ferrao', [0.06, 0.3, 0]); rig.add('gota1', blob([0.04, 0.05, 0.04], m.luz(3), { seg: 8 }));
  rig.bone('gota2', 'corpo', [-0.2, 0.75, 0.3]); rig.add('gota2', blob([0.035, 0.045, 0.035], m.plano(3), { seg: 8 }));
  return rig;
}

const anims = animsArraia({ u: 0.75, flutua: 0.34, mole: 0.8 }, {
  todas: { gota1: ls([1, 1.3, 0.8, 1.1]) },
  idle: { ferrao: lz([0, 6, 10, 3]), gota2: lp([[0, 0, 0], [0, -0.06, 0], [0, -0.12, 0], [0, -0.18, 0]]) },
  fisico: { ferrao: qz([0, 20, -34, -10, 0]), cauda3: qz([6, 14, -30, -10, 0]), cauda4: qz([6, 14, -30, -10, 0]) },
  especial: { gota1: qs([1, 1.4, 1.8, 0.4, 0.8, 1]), ferrao: qz([0, 10, 16, -24, -8, 0]) },
  desmaio: { gota2: qs([1, 0.5, 0.01, 0.01, 0.01]) },
});

export const arraiao = criatura({
  num: 118, id: 'arraiao', nome: 'Arraião', porte: 'G', estagio: 'final', paleta: paletaArraia, build, anims,
  olho: {
    frente: ['pppp.', 'wppw.', 'wppw.', '.ww..'],
    fechado: ['ffff.', 'pffp.', 'fppf.', 'ffff.'],
    mapa: ['w', 'p'],
  },
});
