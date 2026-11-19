/**
 * 014 · COTIADÃ (Comum) — cutia com sementes guardadas nas bochechas. Estágio final.
 * Mantém da linha: garupa dourada arrepiada, dentões, verde do coquinho.
 * Cresce: bochechas estufadas de sementes (creme, enormes) · muda de castanheira brotando na garupa
 * (a cutia que planta florestas) · crista de pelos compridos no lombo · colar de três coquinhos.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, tufo, folha3d, segmento, par, m, lz, qz, ls, qs, type V3 } from './kits';
import { paletaCotia } from './013-cotiazinha';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.36, 0.27, 0.24], peito: 0.84,
    pernas: { alt: 0.27, r: 0.06, rFim: 0.045, xF: 0.58, xT: -0.5, z: 0.62, dobraF: 6, dobraT: -32, pe: [0.085, 0.04, 0.055] },
    pescoco: { len: 0.17, ang: 38, r: 0.15, x: 0.6, y: 0.2 },
    cabeca: [0.22, 0.19, 0.19],
    focinho: { len: 0.14, r0: 0.11, r1: 0.075, cai: 12, y: -0.25, nariz: 0.04 },
    orelha: { tipo: 'redonda', alt: 0.12, larg: 0.13, x: -0.25, z: 0.72, abre: 30, deita: 14 },
    olho: { r: 0.03, pos: [0.2, 0.055, 0.15] },
    rampas: { pelo: 0, barriga: 1, canelaF: 2, canelaT: 2, pe: 2, nariz: 2, orelha: 0 },
  });
  // garupa dourada + crista de pelos compridos descendo o lombo
  rig.add('corpo', calota([0.28, 0.29, 0.255], m.luz(0), { de: 0, ate: 74, pos: [-0.16, 0.0, 0], rot: [0, 0, 46] }));
  const crista: [string, V3, number, number][] = [['pelo1', [-0.1, 0.25, 0], 30, 0.15], ['pelo2', [-0.24, 0.2, 0], 52, 0.19], ['pelo3', [-0.35, 0.08, 0], 78, 0.2]];
  for (const [nome, pos, rz, alt] of crista) { rig.bone(nome, 'corpo', pos, [0, 0, rz]); rig.add(nome, tufo(3, alt, 0.075, m.luz(0), { abre: 26 })); }
  // muda de castanheira na garupa: haste + três folhas
  rig.bone('muda', 'corpo', [-0.17, 0.27, 0], [0, 0, 8]);
  rig.add('muda', segmento([0, 0, 0], [0, 0.13, 0], 0.025, 0.02, m.sombra(3)),
    folha3d(0.2, 0.13, m(3), { pos: [0, 0.11, 0], rot: [0, 0, -50], esp: 0.5 }),
    folha3d(0.17, 0.12, m.luz(3), { pos: [0, 0.11, 0], rot: [0, 0, 44], esp: 0.5 }),
    folha3d(0.15, 0.1, m(3), { pos: [0, 0.12, 0], rot: [50, 0, 0], esp: 0.5 }));
  par((l, s) => rig.add('orelha_' + l, blob([0.04, 0.045, 0.02], m.luz(2), { pos: [0.03, 0.055, 0.012 * s], seg: 10 })));
  // BOCHECHAS estufadas (ossos próprios para inflar) com o relevo de uma semente
  par((l, s) => {
    rig.bone('bochecha_' + l, 'cabeca', [0.13, -0.075, 0.14 * s]);
    rig.add('bochecha_' + l, blob([0.12, 0.11, 0.1], m(1), { seg: 16 }), blob([0.045, 0.05, 0.04], m.luz(1), { pos: [0.02, 0.02, 0.075 * s], seg: 10 }));
  });
  const pf = ref.pontaFocinho as V3;
  rig.add('cabeca', blob([0.024, 0.05, 0.045], m.luz(1), { pos: [pf[0] - 0.005, pf[1] - 0.065, 0], seg: 10 }));
  // colar de coquinhos no peito
  for (const z of [-0.11, 0, 0.11]) rig.add('pescoco', blob([0.055, 0.06, 0.055], m(3), { pos: [0.1 - Math.abs(z) * 0.5, -0.09 + Math.abs(z) * 0.25, z], seg: 12 }));
  // dorso mais escuro na cernelha (sela)
  rig.add('corpo', calota([0.2, 0.285, 0.25], m.sombra(0), { de: 0, ate: 50, pos: [0.14, 0, 0], rot: [0, 0, -20] }));
  return rig;
}

const infla = (v: number[]) => ({ bochecha_d: v, bochecha_e: v });
const anims = animsQuadrupede({ u: 0.95, hPerna: 0.27, mole: 1.0, mapa: { comp: 0.72, larg: 1.3, frontal: 1.25 } }, {
  idle: { muda: lz([0, 5, 9, 3]), pelo2: lz([0, -4, -7, -2]), pelo3: lz([0, -5, -9, -3]), bochecha_d: ls(infla([1, 1.05, 1.1, 1.04]).bochecha_d), bochecha_e: ls(infla([1, 1.05, 1.1, 1.04]).bochecha_e) },
  especial: { muda: qz([0, 12, 16, -26, -8, 0]), bochecha_d: qs([1, 1.2, 1.35, 0.8, 0.95, 1]), bochecha_e: qs([1, 1.2, 1.35, 0.8, 0.95, 1]), pelo1: qz([0, 10, 14, -18, -6, 0]), pelo2: qz([0, 12, 18, -22, -8, 0]), pelo3: qz([0, 12, 18, -22, -8, 0]) },
  dano: { muda: qz([22, 8, 0]), pelo3: qz([-22, -8, 0]) },
  andar: { muda: lz([0, 7, 0, -7]) },
});

export const cotiada = criatura({
  num: 14, id: 'cotiada', nome: 'Cotiadã', porte: 'M', estagio: 'final', paleta: paletaCotia, build, anims,
  olho: {
    frente: ['.ppp.', 'ppwpp', 'ppppp', 'pwppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
