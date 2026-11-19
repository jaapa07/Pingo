/**
 * 046 · QUERO-GUARDA (Vento/Ginga) — quero-quero adulto, sentinela que defende o ninho no esporão. Estágio final.
 * Mantém da linha: pernas rosadas compridas, babador preto, penacho da nuca, olho vermelho, faixa branca.
 * Cresce: asas entreabertas em guarda com ESPORÕES vermelhos nos punhos · ombreira verde-bronze ·
 * penacho duplo comprido · cauda branca de barra preta · peito estufado de lutador.
 */
import { criatura, ave, animsAve, blob, calota, pena, spike, par, m, lz, qz, qr, type V3 } from './kits';
import { paletaQuero } from './045-quero-querinho';

function build() {
  const { rig, ref } = ave({
    corpo: [0.27, 0.2, 0.19], ergue: 34,
    pescoco: { len: 0.19, ang: 72, r: 0.1 },
    cabeca: [0.15, 0.135, 0.135],
    bico: { len: 0.14, r: 0.042, y: -0.08 },
    asa: { len: 0.4, larg: 0.2, cai: 16, ponta: 0.5 },
    cauda: { len: 0.26, larg: 0.1, ang: 4, penas: 3, abre: 18 },
    pernas: { alt: 0.42, r: 0.024, z: 0.62, dedo: 0.11 },
    olho: { r: 0.024, pos: [0.085, 0.03, 0.116] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 2, cauda: 1, bico: 3, perna: 3 },
  });
  // guarda de ginga: asas entreabertas, uma mais alta que a outra
  rig.bones.asa_d.rotation.set(-0.35, 0.75, rig.bones.asa_d.rotation.z);
  rig.bones.asa_e.rotation.set(0.2, -0.6, rig.bones.asa_e.rotation.z);
  // babador preto descendo da testa ao peito
  rig.add('pescoco', blob([0.075, 0.15, 0.09], m.plano(2), { pos: [0.065, 0.03, 0], rot: [0, 0, -18], seg: 14 }));
  rig.add('tronco', blob([0.14, 0.16, 0.17], m.plano(2), { pos: [0.17, 0.02, 0], seg: 14 }));
  rig.add('cabeca', blob([0.05, 0.07, 0.07], m.plano(2), { pos: [0.12, 0.0, 0], seg: 12 }));
  par((l, s) => {
    rig.add('cabeca', blob([0.1, 0.022, 0.02], m.plano(1), { pos: [0.02, -0.035, 0.128 * s], rot: [0, 10 * s, -24], seg: 10 }));
    // ombreira bronze, espelho branco e ESPORÃO no punho
    rig.add('asa_' + l, blob([0.11, 0.07, 0.035], m.luz(2), { pos: [-0.11, 0.02, 0.05 * s], seg: 10 }), blob([0.15, 0.03, 0.035], m.plano(1), { pos: [-0.24, -0.07, 0.05 * s], rot: [0, 0, 8], seg: 10 }));
    rig.add('asa_' + l, spike(0.2, 0.055, m.luz(3), { pos: [0.0, 0.03, 0.03 * s], rot: [0, 0, -100] }), blob([0.055, 0.055, 0.055], m(3), { pos: [0.0, 0.03, 0.03 * s], seg: 8 }));
    rig.add('canela_' + l, blob([0.034, 0.034, 0.034], m(3), { seg: 8 }));
    rig.add('perna_' + l, blob([0.07, 0.09, 0.065], m(1), { pos: [0, -0.04, 0], seg: 12 }));
  });
  rig.add('cabeca', blob([0.04, 0.032, 0.032], m.sombra(2), { pos: [ref.pontaBico[0] - 0.03, ref.pontaBico[1], 0], seg: 8 }));
  // penacho duplo comprido
  rig.bone('penacho', 'cabeca', [ref.nuca[0] + 0.02, ref.nuca[1] + 0.03, 0], [0, 0, -14]);
  rig.add('penacho', pena(0.34, 0.045, m.plano(2), { esp: 0.035 }), pena(0.26, 0.04, m.plano(2), { esp: 0.035, rot: [0, 0, -16] }));
  // cauda branca com barra preta e ponta branca
  rig.add('cauda1', blob([0.05, 0.035, 0.11], m.plano(2), { pos: [-0.17, 0, 0], seg: 10 }), blob([0.025, 0.03, 0.09], m.luz(1), { pos: [-0.24, 0, 0], seg: 8 }));
  // faixa cinza-lilás no peito abaixo do babador
  rig.add('tronco', blob([0.03, 0.03, 0.17], m.luz(0), { pos: [0.2, -0.13, 0], rot: [0, 0, -30], seg: 10, castShadow: false }));
  return rig;
}

const A = (x: number, y: number): V3 => [x, y, 0];
const anims = animsAve({ u: 1.0, hPerna: 0.42, mole: 0.8 }, {
  idle: { penacho: lz([0, 5, 10, -5]) },
  fisico: { penacho: qz([0, 14, -20, -8, 0]), asa_d: qr([A(-10, 8), A(-30, 26), A(50, -34), A(20, -12), A(0, 0)]), asa_e: qr([A(0, 0), A(8, -6), A(-20, 14), A(-6, 4), A(0, 0)]) },
  especial: { penacho: qz([0, 16, 24, -30, -10, 0]) },
  dano: { penacho: qz([30, 12, 0]) },
});

export const queroGuarda = criatura({
  num: 46, id: 'quero-guarda', nome: 'Quero-Guarda', porte: 'M', estagio: 'final', paleta: paletaQuero, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwap', '.paap', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
