/**
 * 170 · URUTAU-FANTASMA (Assombro/Mente) — a mãe-da-lua, de olhos enormes e canto de lamento. Estágio final.
 * Mantém do Urutauzim: plumagem de casca, bocarra de orelha a orelha, pose de toco, manchas de líquen.
 * Cresce: olhos-lua gigantes · asas-manto abertas como galhos secos, com franja de névoa lilás ·
 * toco alto e torto com galho · dois "chifres" de pena · cauda comprida escorrendo pelo toco · fogo-fátuo ao lado.
 */
import { criatura, ave, animsAve, blob, tufo, chama, pena, segmento, par, m, lz, qz, ls, D2R, type V3 } from './kits';
import { paletaUrutau, toco } from './169-urutauzim';

const NEV = ['nev_d1', 'nev_d2', 'nev_e1', 'nev_e2', 'fatuo'];

function build() {
  const H = 0.5;
  const { rig, ref } = ave({
    corpo: [0.32, 0.22, 0.22], ergue: 76,
    pescoco: { len: 0.08, ang: 84, r: 0.19 },
    cabeca: [0.26, 0.23, 0.26],
    bico: { len: 0.08, r: 0.045, y: -0.1, achata: 2.4, inferior: 1 },
    asa: { len: 0.56, larg: 0.26, cai: 20, ponta: 0.6 },
    cauda: { len: 0.5, larg: 0.12, ang: 72, penas: 3, abre: 8 },
    pernas: { alt: 0.08, r: 0.034, z: 0.5, dedo: 0.08 },
    olho: { r: 0.054, pos: [0.2, 0.05, 0.15] },
    rampas: { corpo: 0, peito: 0, cabeca: 0, asa: 0, asaPonta: 2, cauda: 0, bico: 2, perna: 2 },
  });
  rig.bones.corpo.position.y += H;
  rig.add('base', toco(0.2, H + 0.06), segmento([-0.1, 0.3, 0.1], [-0.4, 0.52, 0.2], 0.06, 0.03, m(2)), segmento([-0.3, 0.44, 0.17], [-0.36, 0.66, 0.1], 0.035, 0.02, m(2)));
  rig.add('cabeca', blob([0.17, 0.026, 0.24], m.plano(2), { pos: [0.13, -0.12, 0], seg: 12 }));
  par((l, s) => {
    // asas-manto entreabertas, com franja de névoa
    rig.bones['asa_' + l].rotation.set(0, 40 * s * D2R, 26 * D2R);
    rig.add('asa_' + l, pena(0.4, 0.14, m.sombra(0), { esp: 0.05, pos: [-0.2, -0.14, 0.03 * s], rot: [0, 0, 20] }), blob([0.06, 0.04, 0.03], m(1), { pos: [-0.16, 0.04, 0.06 * s], seg: 8 }), blob([0.05, 0.035, 0.03], m(1), { pos: [-0.34, -0.02, 0.06 * s], seg: 8 }));
    for (let i = 0; i < 2; i++) {
      const nome = 'nev_' + l + (i + 1);
      rig.bone(nome, 'asa2_' + l, [-0.1 - i * 0.16, -0.1, 0], [0, 0, 200]);
      rig.add(nome, chama(0.24 - i * 0.04, 0.07, m.luz(3), { curva: 20 }));
    }
    // "chifres" de pena e líquen no peito
    rig.bone('chifre_' + l, 'cabeca', [ref.topo[0] - 0.06, ref.topo[1] - 0.05, 0.14 * s], [34 * s, 0, 24]);
    rig.add('chifre_' + l, tufo(2, 0.2, 0.06, m.sombra(0), { abre: 16 }));
    rig.add('tronco', blob([0.06, 0.04, 0.03], m(1), { pos: [0.1, 0.06, 0.2 * s], seg: 8 }), blob([0.05, 0.035, 0.03], m(1), { pos: [-0.08, -0.03, 0.19 * s], seg: 8 }));
  });
  rig.bone('fatuo', 'base', [0.5, 0.9, 0.2]);
  rig.add('fatuo', chama(0.22, 0.08, m.luz(3), { curva: 24 }), chama(0.1, 0.045, m(1), { scale: [1, 1, 1.9] }));
  rig.bones.cabeca.rotation.z = 8 * D2R;
  return rig;
}

const anims = animsAve({ u: 1.1, hPerna: 0.08, mole: 0.7 }, {
  todas: Object.fromEntries(NEV.map((v, i) => [v, ls([[1, 1, 1], [0.9, 1.18, 0.9], [1.06, 0.88, 1.06], [0.95, 1.08, 0.95]].map((_, k, a) => a[(k + i) % 4] as V3))])),
  idle: { chifre_d: lz([0, 3, 6, 2]), chifre_e: lz([0, 3, 6, 2]) },
  especial: { chifre_d: qz([0, 10, 14, -16, -5, 0]), chifre_e: qz([0, 10, 14, -16, -5, 0]) },
});

export const urutauFantasma = criatura({
  num: 170, id: 'urutau-fantasma', nome: 'Urutau-Fantasma', porte: 'M', estagio: 'final', paleta: paletaUrutau, build, anims,
  olho: { frente: ['.aaaaa.', 'aaaawwa', 'aapppwa', 'aapppaa', 'aapppaa', 'oaaaaao', '.ooooo.'], fechado: ['fffffff', 'fffffff', 'pfffffp', 'fpppppf', 'fffffff', 'fffffff', 'fffffff'], mapa: ['a', 'p'] },
});
