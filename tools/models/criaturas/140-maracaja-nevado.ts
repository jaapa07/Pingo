/**
 * 140 · MARACAJÁ-NEVADO (Geada/Ginga) — maracajá de pelagem de geada. Estágio final.
 * Mantém da linha: pelagem prateada com rosetas, cauda de anéis, ocelos nas orelhas, faixas de lutador.
 * Cresce: postura de ginga (frente baixa, garupa alta, pata dianteira erguida) · cauda longuíssima em S com
 * maça de cristal de gelo na ponta · juba de pingentes nos ombros · suíças de geada · garras de gelo.
 */
import { criatura, quadrupede, animsQuadrupede, blob, pinta, spike, listra, garra, par, m, lz, qz, D2R } from './kits';
import { paletaMaracaja } from './139-maracajim';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.36, 0.19, 0.17], peito: 1.12,
    pernas: { alt: 0.36, r: 0.075, rFim: 0.06, xF: 0.6, xT: -0.6, z: 0.66, dobraF: 10, dobraT: -30, pe: [0.1, 0.05, 0.085] },
    pescoco: { len: 0.18, ang: 30, r: 0.115, x: 0.66 },
    cabeca: [0.21, 0.185, 0.2],
    focinho: { len: 0.08, r0: 0.085, r1: 0.065, cai: 12, y: -0.32, nariz: 0.03 },
    orelha: { tipo: 'redonda', alt: 0.13, larg: 0.14, x: -0.1, z: 0.72, abre: 26, deita: 14 },
    cauda: { segs: 5, len: 0.85, r0: 0.07, r1: 0.075, ang: 44, curva: -12 },
    olho: { r: 0.026, pos: [0.21, 0.035, 0.125] },
    rampas: { pelo: 0, pe: 0, nariz: 3, orelha: 1, orelhaDentro: 3, cauda: 0, caudaPonta: 1 },
  });
  // GINGA: frente baixa, garupa alta, pata dianteira (a da câmera) erguida
  rig.bones.corpo.rotation.z = -9 * D2R;
  rig.bones.perna_fe.rotation.z = 64 * D2R; rig.bones.canela_fe.rotation.z = -96 * D2R;
  rig.bones.pescoco.rotation.z = 14 * D2R;
  par((l, s) => {
    for (const [x, y, r] of [[0.22, 0.13, 0.04], [0.08, 0.16, 0.05], [-0.08, 0.16, 0.05], [-0.24, 0.12, 0.045], [0.16, 0.02, 0.04], [0.0, 0.03, 0.045], [-0.16, 0.01, 0.045]] as const)
      rig.add('corpo', blob([r * 1.15, r, 0.04], m.plano(1), { pos: [x, y, Math.sqrt(Math.max(0.0001, 1 - (y / 0.19) ** 2 - (x / 0.36) ** 2)) * 0.17 * s], seg: 10, castShadow: false }));
    rig.add('orelha_' + l, pinta(0.035, m.luz(0), [-0.035, 0.07, 0], [0, 90, 0]));
    rig.add('cabeca', blob([0.07, 0.02, 0.025], m.plano(1), { pos: [0.1, 0.135, 0.06 * s], rot: [0, 0, -30], seg: 8 }));
    // suíças de geada
    rig.add('cabeca', spike(0.14, 0.045, m.luz(2), { pos: [0.06, -0.08, 0.14 * s], rot: [100 * s, 0, 40] }), spike(0.1, 0.04, m(2), { pos: [0.02, -0.03, 0.15 * s], rot: [80 * s, 0, 30] }));
    // faixas e garras de gelo
    rig.add('canela_f' + l, listra(0.066, 0.028, m(3), { pos: [0, -0.07, 0] }), listra(0.064, 0.024, m(3), { pos: [0, -0.13, 0] }));
    rig.add('canela_t' + l, listra(0.064, 0.026, m(3), { pos: [-0.02, -0.1, 0] }));
    for (const z of [-0.04, 0.04]) rig.add('canela_f' + l, garra(0.07, 0.022, m.luz(2), { pos: [0.1, -0.17, z], curva: 0.6 }));
  });
  for (const o of ['cauda1', 'cauda2', 'cauda3', 'cauda4']) rig.add(o, blob([0.03, 0.082, 0.082], m.plano(1), { pos: [-0.12, 0, 0], seg: 12 }));
  // MAÇA de cristal na ponta da cauda
  rig.bone('maca', 'cauda5', [-0.22, 0, 0]);
  rig.add('maca', blob([0.09, 0.09, 0.09], m(2)));
  for (const r of [[0, 0, 0], [0, 0, 72], [0, 0, 144], [0, 0, -72], [0, 0, -144], [80, 0, 30], [-80, 0, 30]] as const) rig.add('maca', spike(0.2, 0.05, m.luz(2), { rot: [r[0], r[1], r[2]] }));
  // juba de pingentes nos ombros
  rig.bone('juba', 'corpo', [0.2, 0.15, 0]);
  for (const [z, a, h] of [[0, 20, 0.3], [0.1, 6, 0.24], [-0.1, 6, 0.24], [0.05, 46, 0.22], [-0.05, 46, 0.22]] as const)
    rig.add('juba', spike(h, 0.07, z === 0 ? m.luz(2) : m(2), { pos: [0, 0, z], rot: [z * 200, 0, a] }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.0, hPerna: 0.36, mole: 0.8, cauda: 0.8, mapa: { comp: 0.6, larg: 1.4, frontal: 1.3 } }, {
  idle: { maca: lz([0, 20, 40, 20]), perna_fe: lz([64, 68, 72, 67]), cauda4: lz([0, -5, -9, -3]) },
  fisico: { perna_fe: qz([70, 90, 10, 40, 64]), canela_fe: qz([-96, -120, -10, -60, -96]) },
  especial: { maca: [...qz([0, 60, 120, 240, 300, 360]), { t: 0, s: 1 }, { t: 0.5, s: 1.3 }, { t: 1, s: 1 }], cauda4: qz([0, -10, -16, 24, 10, 0]) },
  andar: { perna_fe: lz([26, 0, -26, 0]), canela_fe: lz([0, -31, 0, 0]) },
  desmaio: { perna_fe: qz([64, 40, 30, 56, 52]), canela_fe: qz([-96, -50, -10, 0, 0]) },
});

export const maracajaNevado = criatura({
  num: 140, id: 'maracaja-nevado', nome: 'Maracajá-Nevado', porte: 'M', estagio: 'final', paleta: paletaMaracaja, build, anims,
  olho: {
    frente: ['pp...', 'paap.', '.pawp', '.papp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['a', 'p'],
  },
});
