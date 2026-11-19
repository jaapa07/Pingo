/**
 * 092 · CASCAVELÃO (Veneno/Terra) — cascavel de chocalho-tambor. Estágio final.
 * Mantém do Cascavelzim: rosca de corpo com losangos de miolo claro, sobrancelhas de escama, chocalho de barro vermelho.
 * Cresce: o chocalho virou um tambor de três gomos com couro claro e amarração · pescoço alto em S ·
 * chifrinhos de escama sobre os olhos · presas à mostra · três voltas de corpo.
 */
import { criatura, serpente, animsSerpente, blob, lathe, ring, spike, par, m, lz, qz, qs } from './kits';
import { voltaCobra, sela, extrasCobra } from './086-sucurizinha';
import { paletaCascavel, losangosVolta } from './091-cascavelzim';

const CURVA = [80, 30, -66];

function build() {
  const r = 0.13;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.22, curva: CURVA, rFim: 0.115 },
    cauda: { segs: 3, len: 0.2, curva: [0, 0, 0], rFim: 0.07 },
    cabeca: [0.26, 0.15, 0.2],
    olho: { r: 0.032, pos: [0.18, 0.085, 0.135] },
    rampas: { corpo: 0, barriga: 2, cabeca: 0 },
  });
  rig.bones.corpo.position.set(0.08, 0.5, 0);
  voltaCobra(rig, 'base', [0, 0.13, 0], 0.38, 0.135, m(0), m(2), [3, 3]);
  voltaCobra(rig, 'base', [0, 0.34, 0], 0.29, 0.125, m(0), m(2), [-5, -4]);
  voltaCobra(rig, 'base', [0, 0.52, 0], 0.18, 0.115, m(0), null, [5, 4]);
  losangosVolta(rig, 'base', 0.13, 0.38, 0.135, 8, m.plano(1), m.luz(2), 0);
  losangosVolta(rig, 'base', 0.34, 0.29, 0.125, 7, m.plano(1), m.luz(2), 0.5);
  // losangos no pescoço
  sela(rig, 'pescoco1', 0.11, 0, 0.128, m.plano(1), 0.5, 1.05); sela(rig, 'pescoco2', 0.11, 0, 0.122, m.plano(1), 0.48, 1.05); sela(rig, 'pescoco3', 0.1, 0, 0.118, m.plano(1), 0.45, 1.05);
  rig.add('pescoco1', blob([0.03, 0.14, 0.14], m.luz(2), { pos: [0.11, 0, 0], seg: 12, castShadow: false }));
  rig.add('pescoco2', blob([0.028, 0.134, 0.134], m.luz(2), { pos: [0.11, 0, 0], seg: 12, castShadow: false }));
  // cauda erguida por trás, segurando o tambor
  rig.bones.cauda1.position.set(-0.38, -0.3, 0.06); rig.bones.cauda1.rotation.z = -1.15; rig.bones.cauda2.rotation.z = -0.3; rig.bones.cauda3.rotation.z = -0.25;
  rig.bone('guizo', 'cauda3', [-0.2, 0.07 - r, 0]);
  // CHOCALHO-TAMBOR: três gomos de barro (eixo ao longo de −X), couro claro na ponta, amarração escura
  const gomoT = (x: number, R: number, h: number) => rig.add('guizo', lathe([[R * 0.72, 0], [R, h * 0.3], [R, h * 0.7], [R * 0.72, h]], m(3), { seg: 14, pos: [x, 0, 0], rot: [0, 0, 90] }));
  gomoT(0, 0.13, 0.15); gomoT(-0.14, 0.16, 0.17); gomoT(-0.3, 0.19, 0.2);
  rig.add('guizo', blob([0.03, 0.17, 0.17], m.luz(2), { pos: [-0.5, 0, 0], seg: 14 }));
  rig.add('guizo', ring(0.185, 0.022, m.plano(1), { pos: [-0.47, 0, 0], rot: [0, 90, 0] }), ring(0.135, 0.02, m.plano(1), { pos: [-0.145, 0, 0], rot: [0, 90, 0] }), ring(0.165, 0.02, m.plano(1), { pos: [-0.305, 0, 0], rot: [0, 90, 0] }));
  // cabeça: bochechas, chifrinhos de escama, risca do olho, presas
  par((_, s) => {
    rig.add('cabeca', blob([0.13, 0.105, 0.105], m(0), { pos: [0.03, 0.0, 0.15 * s], seg: 14 }));
    rig.add('cabeca', spike(0.14, 0.05, m(1), { pos: [0.16, 0.12, 0.11 * s], rot: [18 * s, 0, 28] }));
    rig.add('cabeca', blob([0.12, 0.03, 0.025], m.plano(1), { pos: [0.03, 0.045, 0.245 * s], rot: [0, 14 * s, 16], seg: 10 }));
    rig.add('cabeca', spike(0.1, 0.026, m.luz(2), { pos: [0.3, -0.03, 0.07 * s], rot: [0, 0, 172] }));
  });
  rig.add('cabeca', blob([0.09, 0.04, 0.07], m.plano(1), { pos: [0.02, 0.14, 0], seg: 10, castShadow: false }));
  rig.bones.mandibula.rotation.z = -0.2;
  return rig;
}

const ex = extrasCobra(CURVA, 3);
const anims = animsSerpente({ u: 1.1, pescoco: 3, cauda: 3, mole: 0.5, mapa: { comp: 1, larg: 1, frontal: 1.05, cabeca: 1.2 } }, {
  fisico: { pescoco1: qz([6, 12, -10, -4, 0]), pescoco2: qz([6, 12, -10, -4, 0]), pescoco3: qz([6, 12, -10, -4, 0]), mandibula: qz([0, -8, -30, -10, 0]), cauda1: [{ t: 0, r: [0, 0, 0] }], cauda2: [{ t: 0, r: [0, 0, 0] }], cauda3: [{ t: 0, r: [0, 0, 0] }] },
  desmaio: { pescoco1: qz([4, -6, -24, -50, -48]), pescoco2: qz([0, -4, -20, -44, -42]), pescoco3: qz([0, 0, 10, 30, 28]), cabeca: qz([0, 4, 10, 18, 16]), cauda1: qz([0, 6, 20, 40, 38]) },
  idle: { guizo: lz([8, -8, 6, -6]), cauda1: [{ t: 0, r: [0, 0, 0] }], cauda2: [{ t: 0, r: [0, 0, 0] }], cauda3: [{ t: 0, r: [0, 0, 0] }] },
  andar: { guizo: lz([8, -8, 6, -6]), cauda1: [{ t: 0, r: [0, 0, 0] }], cauda2: [{ t: 0, r: [0, 0, 0] }], cauda3: [{ t: 0, r: [0, 0, 0] }] },
  especial: { guizo: [...qz([0, 16, -18, 18, -14, 0]), ...qs([1, 1.05, 1.15, 1.2, 1.08, 1])], cauda1: qz([0, -6, -10, 8, 3, 0]), cauda2: qz([0, 0, 0, 0, 0, 0]), cauda3: qz([0, 0, 0, 0, 0, 0]) },
  dano: { guizo: qz([20, -10, 0]) },
});
void ex;

export const cascavelao = criatura({
  num: 92, id: 'cascavelao', nome: 'Cascavelão', porte: 'G', estagio: 'final', paleta: paletaCascavel, build, anims,
  olho: {
    frente: ['ppppp', '.apaw', '.apaa', '..aa.'],
    fechado: ['fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['a', 'p'],
  },
});
