/**
 * 080 · TARTARUGA-GIGANTE (Rio/Pedra) — tartaruga-de-couro anciã que carrega um recife inteiro nas costas. Estágio final.
 * Mantém da linha: nadadeirões, pele azul-petróleo, creme por baixo, o coral rosa e a estrela-do-mar.
 * Cresce: casco de COURO azul-ardósia com cinco quilhas · RECIFE no lombo (corais em galho, coral-cérebro, rocha) ·
 * pintas claras na pele · bico em gancho · nadadeiras enormes.
 */
import { criatura, tartaruga, animsTartaruga, blob, tube, par, m, lz, qz, type V3 } from './kits';
import { paletaTartaruga, estrela } from './079-tartarui';

const paleta = { ...paletaTartaruga, rampas: [['#1d2946', '#3c5682', '#7b9ec2'], paletaTartaruga.rampas[1], paletaTartaruga.rampas[2], paletaTartaruga.rampas[3]] as [string, string, string][] }; // 0 couro azul-ardósia

function build() {
  const { rig } = tartaruga({
    casco: [0.46, 0.27, 0.36], alt: 0.1, pernas: { len: 0.38, r: 0.075, nadadeira: true },
    pescoco: { len: 0.2, r: 0.11, ang: 24 }, cabeca: [0.19, 0.16, 0.165], cauda: 0.12,
    olho: { r: 0.027, pos: [0.14, 0.07, 0.13] },
    rampas: { casco: 0, borda: 0, plastrao: 1, pele: 2 },
  });
  // cinco quilhas ao longo do casco
  for (const [z, y] of [[0, 0.262], [0.15, 0.225], [-0.15, 0.225], [0.27, 0.14], [-0.27, 0.14]] as const)
    rig.add('corpo', blob([0.4 * (1 - Math.abs(z) * 0.6), 0.03, 0.03], m.luz(0), { pos: [0, y, z], seg: 12 }));
  // RECIFE: rocha, coral-cérebro, corais em galho (ossos próprios para balançar)
  rig.add('corpo', blob([0.16, 0.1, 0.14], m.sombra(0), { pos: [-0.1, 0.27, 0.02], seg: 8 }), blob([0.1, 0.08, 0.1], m(0), { pos: [0.12, 0.26, -0.1], seg: 7 }));
  rig.add('corpo', blob([0.1, 0.085, 0.1], m.luz(3), { pos: [0.1, 0.3, 0.1], seg: 12 }), blob([0.03, 0.09, 0.1], m(3), { pos: [0.1, 0.3, 0.1], seg: 8 }));
  const galhos: [string, V3, number, number][] = [['coral1', [-0.12, 0.34, 0.06], 0.26, 8], ['coral2', [-0.2, 0.3, -0.1], 0.2, 30], ['coral3', [0.02, 0.32, -0.06], 0.17, -16]];
  for (const [nome, pos, h, t] of galhos) {
    rig.bone(nome, 'corpo', pos, [0, 0, t]);
    rig.add(nome, tube([[0, 0, 0], [0.01, h * 0.5, 0], [0, h, 0]], (u) => 0.04 * (1 - u * 0.4), m(3), { seg: 8, radial: 8 }),
      tube([[0, h * 0.35, 0], [0.07, h * 0.6, 0.02], [0.1, h * 0.9, 0.02]], 0.03, m(3), { seg: 6, radial: 8 }),
      tube([[0, h * 0.5, 0], [-0.06, h * 0.7, -0.03], [-0.09, h * 0.95, -0.04]], 0.028, m.luz(3), { seg: 6, radial: 8 }));
  }
  estrela(rig, 'estrela', 'corpo', [0.28, 0.2, 0.14], 0.08, [30, 0, -30]);
  par((l, s) => {
    // pintas claras nas nadadeiras e no pescoço, sobrancelha
    for (const x of [0.06, 0.16]) rig.add('canela_f' + l, blob([0.035, 0.02, 0.03], m.luz(2), { pos: [x, -0.01 - x * 0.1, 0.1 * s], seg: 6, castShadow: false }));
    rig.add('cabeca', blob([0.07, 0.025, 0.05], m.sombra(2), { pos: [0.13, 0.125, 0.1 * s], rot: [-14 * s, 0, -12], seg: 8 }));
    rig.add('cabeca', blob([0.03, 0.025, 0.03], m.luz(2), { pos: [0.0, 0.12, 0.09 * s], seg: 6, castShadow: false }));
  });
  // bico em gancho creme
  rig.add('cabeca', blob([0.06, 0.07, 0.09], m(1), { pos: [0.265, -0.01, 0], seg: 10 }));
  return rig;
}

const anims = animsTartaruga({ u: 0.75, hPerna: 0.1, pescoco: 0.2, mole: 0.4 }, {
  idle: { perna_fd: lz([0, 6, 12, 5]), perna_fe: lz([0, 6, 12, 5]), coral1: lz([0, 3, 6, 2]), coral2: lz([0, -3, -6, -2]), coral3: lz([0, 4, 0, -4]) },
  especial: { perna_fd: qz([0, 16, 24, -24, -8, 0]), perna_fe: qz([0, 16, 24, -24, -8, 0]) },
});

export const tartarugaGigante = criatura({
  num: 80, id: 'tartaruga-gigante', nome: 'Tartaruga-Gigante', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: { frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
