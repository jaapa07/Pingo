/**
 * 089 · JARARACUÇU (Veneno/Terra) — jararacuçu parruda de escamas foscas. Estágio final.
 * Mantém da Jararaquinha: cabeça de flecha com bochechas de veneno, selas escuras, presas com veneno roxo, ponta de cauda clara.
 * Cresce: corpo grosso enrolado em duas voltas · fileira de escamas-pedra foscas na nuca e no dorso ·
 * sobrancelhas de pedra · boca entreaberta mostrando o veneno · poça roxa pingando.
 */
import { criatura, serpente, animsSerpente, blob, lathe, calota, spike, par, m, lz, ls, qz, qp } from './kits';
import { sela, voltaCobra, pintasVolta, extrasCobra } from './086-sucurizinha';
import { paletaJararaca } from './088-jararaquinha';

const CURVA = [78, 30, -70];

function build() {
  const r = 0.14;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.2, curva: CURVA, rFim: 0.12 },
    cauda: { segs: 3, len: 0.18, curva: [-40, -50, -40], rFim: 0.035 },
    cabeca: [0.27, 0.15, 0.2],
    olho: { r: 0.032, pos: [0.19, 0.085, 0.135] },
    rampas: { corpo: 0, barriga: 2, cabeca: 0 },
  });
  // voltas no chão (o corpo do kit fica no centro, erguendo o pescoço de dentro do rolo)
  rig.bones.corpo.position.set(0.05, 0.3, 0);
  rig.bones.cauda1.position.set(-0.5, r - 0.3, -0.2);
  voltaCobra(rig, 'base', [0, 0.14, 0], 0.36, 0.14, m(0), m(2), [4, 3]);
  voltaCobra(rig, 'base', [0, 0.36, 0], 0.25, 0.13, m(0), m(2), [-6, -5]);
  pintasVolta(rig, 'base', [0, 0.16, 0], 0.36, 0.14, 8, m.plano(1), 0.62, 0);
  pintasVolta(rig, 'base', [0, 0.38, 0], 0.25, 0.13, 6, m.plano(1), 0.6, 0.5);
  // cabeça de flecha: bochechas de veneno, topo escuro, sobrancelha de pedra, presas
  par((_, s) => {
    rig.add('cabeca', blob([0.14, 0.11, 0.11], m(0), { pos: [0.03, 0.0, 0.15 * s], seg: 14 }));
    rig.add('cabeca', blob([0.12, 0.03, 0.025], m.plano(1), { pos: [0.03, 0.06, 0.245 * s], rot: [0, 14 * s, 16], seg: 10 }));
    rig.add('cabeca', blob([0.1, 0.04, 0.06], m.sombra(1), { pos: [0.2, 0.135, 0.105 * s], rot: [0, 10 * s, -22], seg: 10 }));
    rig.add('cabeca', spike(0.11, 0.028, m.luz(2), { pos: [0.3, -0.03, 0.07 * s], rot: [0, 0, 172] }));
  });
  rig.add('cabeca', calota([0.24, 0.16, 0.15], m.sombra(0), { de: 0, ate: 62, pos: [0.12, 0.018, 0], rot: [0, 0, -8] }));
  // boca entreaberta com o céu da boca roxo
  rig.bones.mandibula.rotation.z = -0.3;
  rig.add('mandibula', blob([0.17, 0.03, 0.13], m.plano(3), { pos: [0.14, 0.05, 0], seg: 12 }));
  // escamas-pedra foscas: fileira da nuca ao pescoço
  const pedra = (osso: string, x: number, y: number, h: number, rot: number) => rig.add(osso, lathe([[h * 0.55, 0], [h * 0.42, h * 0.5], [0.001, h]], m(1), { seg: 6, pos: [x, y, 0], rot: [0, 0, rot] }));
  pedra('cabeca', -0.02, 0.12, 0.1, 30); pedra('cabeca', -0.14, 0.08, 0.12, 50);
  pedra('pescoco3', 0.1, 0.1, 0.12, 20); pedra('pescoco2', 0.12, 0.11, 0.13, 10); pedra('pescoco2', 0.0, 0.11, 0.12, 10); pedra('pescoco1', 0.1, 0.12, 0.11, 0);
  sela(rig, 'pescoco1', 0.1, 0, 0.138, m.plano(1), 0.5, 0.96); sela(rig, 'pescoco2', 0.1, 0, 0.13, m.plano(1), 0.5, 0.96); sela(rig, 'pescoco3', 0.08, 0, 0.125, m.plano(1), 0.45, 0.96);
  // gota de veneno e poça
  rig.bone('gota', 'cabeca', [0.3, -0.17, -0.07]);
  rig.add('gota', blob([0.035, 0.05, 0.035], m(3), { seg: 10 }));
  rig.add('base', blob([0.13, 0.025, 0.09], m(3), { pos: [0.5, 0.02, -0.12], seg: 12 }), blob([0.05, 0.02, 0.04], m.luz(3), { pos: [0.6, 0.02, 0.0], seg: 10 }));
  // ponta de cauda clara
  rig.bone('isca', 'cauda3', [-0.18, 0.035 - r, 0], [0, 0, -60]);
  rig.add('isca', blob([0.08, 0.04, 0.04], m.luz(2), { pos: [-0.05, 0, 0], seg: 12 }));
  return rig;
}

const ex = extrasCobra(CURVA, 3);
const anims = animsSerpente({ u: 0.9, pescoco: 3, cauda: 3, mole: 0.5, mapa: { comp: 1, larg: 1, frontal: 1.1, cabeca: 1.2 } }, {
  fisico: { ...ex.fisico, mandibula: qz([0, -8, -30, -10, 0]) },
  desmaio: { pescoco1: qz([4, -6, -24, -50, -48]), pescoco2: qz([0, -4, -20, -44, -42]), pescoco3: qz([0, 0, 10, 30, 28]), cabeca: qz([0, 4, 10, 18, 16]) },
  idle: { isca: lz([0, 18, -6, 14]), gota: [...ls([1, 1.1, 1.25, 0.9]), ...qp([[0, 0, 0], [0, -0.01, 0], [0, -0.03, 0], [0, 0, 0], [0, 0, 0]])] },
  especial: { ...ex.especial, isca: qz([0, 24, 30, -30, -10, 0]), gota: qp([[0, 0, 0], [0, -0.01, 0], [0, -0.02, 0], [0.2, 0.04, 0], [0.34, -0.08, 0], [0, 0, 0]]) },
});

export const jararacucu = criatura({
  num: 89, id: 'jararacucu', nome: 'Jararacuçu', porte: 'M', estagio: 'final', paleta: paletaJararaca, build, anims,
  olho: {
    frente: ['ppppp', '.apaw', '.apaa', '..aa.'],
    fechado: ['fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['a', 'p'],
  },
});
