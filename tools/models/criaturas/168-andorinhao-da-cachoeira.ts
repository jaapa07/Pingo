/**
 * 168 · ANDORINHÃO-DA-CACHOEIRA (Vento/Rio) — o andorinhão que atravessa a cortina d'água para dormir atrás dela. Estágio final.
 * Mantém do Andorim: fuligem-azulada, coleira branca, asas-foice, bico de boca larga.
 * Cresce: asas enormes em foice abertas em mergulho · cortina de cachoeira escorrendo das duas asas ·
 * cauda longa em forquilha · sobrancelha clara de velocista · respingos e espuma na rocha de pouso.
 */
import { criatura, ave, animsAve, blob, calota, pena, espuma, lathe, par, m, lz, qz, ls, D2R, type V3 } from './kits';
import { pedra } from './165-mocozim';
import { paletaAndor } from './167-andorim';

const VEUS = ['veu_d1', 'veu_d2', 'veu_d3', 'veu_e1', 'veu_e2', 'veu_e3'];

function build() {
  const { rig } = ave({
    corpo: [0.3, 0.22, 0.21], ergue: 34,
    pescoco: { len: 0.1, ang: 56, r: 0.15 },
    cabeca: [0.2, 0.18, 0.19],
    bico: { len: 0.09, r: 0.055, y: -0.2, achata: 1.5, inferior: 0.9 },
    asa: { len: 0.62, larg: 0.2, cai: 0, ponta: 0.8 },
    cauda: { len: 0.44, larg: 0.09, ang: 14, penas: 2, abre: 30 },
    pernas: { alt: 0.14, r: 0.034, z: 0.5, dedo: 0.1 },
    olho: { r: 0.03, pos: [0.13, 0.02, 0.16] },
    rampas: { corpo: 0, peito: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  rig.add('pescoco', calota([0.2, 0.19, 0.21], m.luz(1), { de: 38, ate: 122, rot: [0, 0, 58], pos: [-0.01, -0.02, 0] }));
  rig.bones.corpo.position.y += 0.2;
  rig.add('base', pedra([0.44, 0.22, 0.36], m(2), [0.0, 0.1, 0], [0, 24, 6]), pedra([0.18, 0.14, 0.18], m.luz(2), [-0.28, 0.07, 0.14], [10, 50, 0]));
  rig.add('base', espuma(0.09, m.luz(3), { pos: [0.3, 0.06, -0.16] }), espuma(0.07, m.luz(1), { pos: [-0.36, 0.05, -0.12] }));
  par((l, s) => {
    // asas-foice abertas e erguidas
    rig.bones['asa_' + l].rotation.set(0, 62 * s * D2R, -40 * D2R); rig.bones['asa2_' + l].rotation.z = 30 * D2R;
    rig.add('asa2_' + l, pena(0.5, 0.11, m.sombra(0), { esp: 0.05, pos: [0.06, 0.03, 0], rot: [0, 0, 8] }), pena(0.36, 0.09, m(0), { esp: 0.05, pos: [0.08, -0.06, 0], rot: [0, 0, 30] }));
    rig.add('asa_' + l, blob([0.24, 0.035, 0.05], m.luz(0), { pos: [-0.24, 0.07, 0.03 * s], seg: 10 }));
    // cortina de cachoeira escorrendo da asa
    for (let i = 0; i < 3; i++) {
      const nome = 'veu_' + l + (i + 1);
      rig.bone(nome, 'asa_' + l, [-0.14 - i * 0.2, -0.08, 0.02 * s], [0, 0, 220]);
      rig.add(nome, lathe([[0.06, 0], [0.07, 0.1], [0.045, 0.24], [0.001, 0.34 - i * 0.04]], i === 1 ? m.luz(3) : m(3), { seg: 8, scale: [1, 1, 0.5] }));
    }
    rig.add('cabeca', blob([0.09, 0.022, 0.03], m(1), { pos: [0.1, 0.09, 0.14 * s], rot: [0, 10 * s, -12], seg: 8 }));
  });
  rig.add('cauda1', blob([0.03, 0.03, 0.1], m(1), { pos: [-0.12, 0, 0], seg: 8 }));
  return rig;
}

const bate = (v: number[]) => ({ asa_d: qz(v), asa_e: qz(v) });
const anims = animsAve({ u: 1.0, hPerna: 0.14, mole: 0.7 }, {
  todas: Object.fromEntries(VEUS.map((v, i) => [v, ls([[1, 1, 1], [1, 1.2, 1], [1, 0.85, 1], [1, 1.1, 1]].map((_, k, a) => a[(k + i) % 4] as V3))])),
  idle: { asa_d: lz([0, 3, 6, 2]), asa_e: lz([0, 3, 6, 2]) },
  entrada: bate([-24, 16, -10, 4, 0]),
  fisico: bate([-8, -20, 26, 8, 0]),
  especial: { ...bate([0, -12, -18, 28, 10, 0]), ...Object.fromEntries(VEUS.map((v) => [v, ls([1, 1.1, 1.3, [1, 1.8, 1], 1.3, 1])])) },
  dano: bate([-16, -6, 0]),
  desmaio: bate([0, 10, 26, 44, 42]),
  status: { asa_d: lz([14, 16, 14, 12]), asa_e: lz([14, 16, 14, 12]) },
  andar: { asa_d: lz([-10, 12, -10, 12]), asa_e: lz([-10, 12, -10, 12]) },
});

export const andorinhaoDaCachoeira = criatura({
  num: 168, id: 'andorinhao-da-cachoeira', nome: 'Andorinhão-da-Cachoeira', porte: 'M', estagio: 'final', paleta: paletaAndor, build, anims,
  olho: { frente: ['pppp.', 'ppwpp', '.pppp', '..pp.'], fechado: ['fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['w', 'p'] },
});
