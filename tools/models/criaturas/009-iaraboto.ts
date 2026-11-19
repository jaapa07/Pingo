/**
 * 009 · IARABOTO (Rio/Encanto) — boto encantado de chapéu de espuma. Estágio final.
 * Mantém da linha: rosa com manto lilás, gota azul na testa, nadadeiras e gola de espuma, bolhas na cauda.
 * Cresce: CHAPÉU de espuma de aba larga com fita azul e pérola (a lenda do boto que esconde o respiro) ·
 * cabeleira de espuma escorrendo pela nuca · colar de pérolas · três bolhas encantadas orbitando ·
 * lobos da cauda em leque de onda · olhar sereno de cílio.
 */
import { criatura, aquatico, animsAquatico, blob, calota, espuma, lathe, ring, par, m, lp, lz, qz, type V3 } from './kits';
import { paletaBoto, borbulha } from './007-botinho';

function build() {
  const { rig, ref } = aquatico({
    tronco: [0.32, 0.2, 0.185], flutua: 0.72, ergue: 60,
    cabeca: { r: [0.2, 0.19, 0.18], x: 0.82, y: 0.08, gira: -52 },
    rostro: { len: 0.42, r0: 0.048, r1: 0.028, cai: 12, y: -0.52 },
    cauda: { len: 0.44, r0: 0.125, r1: 0.05, cai: -16 },
    lobos: { len: 0.3, larg: 0.2, abre: 52 },
    nad: { len: 0.32, larg: 0.16, x: 0.4, cai: 46, abre: 58 },
    dorsal: { alt: 0.12, base: 0.3, x: -0.25 },
    olho: { r: 0.022, pos: [0.1, -0.03, 0.148] },
    rampas: { pele: 1, cabeca: 1, rostro: 1, cauda: 1, lobos: 2, nad: 2, dorsal: 0 },
  });
  rig.add('tronco', calota([0.33, 0.21, 0.195], m(0), { de: 0, ate: 62, pos: [-0.02, 0, 0] }));
  rig.add('cauda1', calota([0.24, 0.125, 0.12], m(0), { de: 0, ate: 70, pos: [-0.08, 0.01, 0] }));
  // gota azul e bochechas
  rig.add('cabeca', blob([0.05, 0.065, 0.05], m.plano(3), { pos: [ref.melao[0] + 0.1, ref.melao[1] - 0.1, 0], rot: [0, 0, -50], seg: 12 }));
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.03], m.sombra(1), { pos: [0.1, -0.09, 0.155 * s], seg: 10 })));
  // CHAPÉU de espuma: aba larga ondulada, copa, fita azul e pérola
  rig.bone('chapeu', 'cabeca', [-0.02, 0.15, 0], [0, 0, 10]);
  rig.add('chapeu',
    lathe([[0.001, 0.0], [0.2, 0.0], [0.31, 0.02], [0.345, 0.05], [0.32, 0.075], [0.2, 0.06], [0.001, 0.06]], m(2), { seg: 24, deform: [(v) => { v.y += Math.sin(Math.atan2(v.z, v.x) * 3) * 0.025 * (Math.hypot(v.x, v.z) / 0.34); }] }),
    lathe([[0.001, 0.04], [0.17, 0.05], [0.175, 0.12], [0.15, 0.2], [0.09, 0.245], [0.001, 0.255]], m(2), { seg: 20 }),
    ring(0.172, 0.03, m.plano(3), { pos: [0, 0.085, 0], rot: [90, 0, 0] }),
    blob([0.04, 0.04, 0.04], m.luz(2), { pos: [0.17, 0.095, 0.06], seg: 10 }),
    espuma(0.06, m.luz(2), { pos: [-0.02, 0.26, 0] }));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; rig.add('chapeu', espuma(0.05, m.luz(2), { pos: [Math.cos(a) * 0.33, 0.05, Math.sin(a) * 0.33] })); }
  // cabeleira de espuma escorrendo pela nuca (3 mechas em ossos encadeados)
  rig.bone('mecha1', 'cabeca', [-0.16, 0.02, 0], [0, 0, 10]);
  rig.add('mecha1', espuma(0.09, m(2)), espuma(0.07, m(2), { pos: [-0.02, 0, 0.1] }), espuma(0.07, m(2), { pos: [-0.02, 0, -0.1] }));
  rig.bone('mecha2', 'mecha1', [-0.06, -0.13, 0]);
  rig.add('mecha2', espuma(0.085, m(2)), espuma(0.06, m(2), { pos: [0, -0.02, 0.09] }));
  rig.bone('mecha3', 'mecha2', [-0.05, -0.13, 0]);
  rig.add('mecha3', espuma(0.07, m(2)), espuma(0.045, m.luz(2), { pos: [-0.03, -0.09, 0] }));
  // colar de pérolas
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; rig.add('tronco', blob([0.03, 0.03, 0.03], m.luz(2), { pos: [0.08, Math.cos(a) * 0.205, Math.sin(a) * 0.19], seg: 8 })); }
  // nadadeiras de espuma com punho e leque de onda na cauda
  par((l, s) => {
    rig.add('nad_' + l, espuma(0.08, m.luz(2), { pos: [-0.03, -0.29, 0] }), espuma(0.055, m.luz(2), { pos: [0.05, -0.14, 0] }), ring(0.075, 0.025, m.plano(3), { pos: [0, -0.03, 0], rot: [90, 0, 0] }));
    rig.add('lobo_' + l, espuma(0.075, m.luz(2), { pos: [-0.26, 0, 0] }), espuma(0.055, m.luz(2), { pos: [-0.16, 0, 0.08 * s] }));
  });
  const flocos: [string, V3, number][] = [['bolha1', [-0.02, 0.075, 0.075], 0.055], ['bolha2', [-0.03, 0.065, -0.085], 0.05], ['bolha3', [-0.04, -0.075, 0.0], 0.055]];
  for (const [nome, pos, r] of flocos) { rig.bone(nome, 'cauda2', pos); rig.add(nome, espuma(r, m.luz(2))); }
  // três bolhas encantadas orbitando (anel azul com brilho)
  const orbes: [string, V3, number][] = [['orbe1', [0.5, 0.42, 0.3], 0.07], ['orbe2', [-0.5, 0.3, -0.25], 0.06], ['orbe3', [0.2, -0.36, -0.42], 0.05]];
  for (const [nome, pos, r] of orbes) {
    rig.bone(nome, 'corpo', pos);
    rig.add(nome, blob([r, r, r], m.luz(3), { seg: 12 }), blob([r * 0.4, r * 0.4, r * 0.4], m.luz(2), { pos: [-r * 0.3, r * 0.35, r * 0.3], seg: 8 }));
  }
  return rig;
}

const sobe = (a: number): V3[] => [[0, 0, 0], [0, a, 0], [0, a * 1.6, 0], [0, a * 0.6, 0]];
const anims = animsAquatico({ u: 1.2, flutua: 0.1, mole: 0.8 }, {
  todas: borbulha(['bolha1', 'bolha2', 'bolha3', 'orbe1', 'orbe2', 'orbe3']),
  idle: { chapeu: lz([0, -2, -4, -1]), mecha1: lz([0, 5, 9, 3]), mecha2: lz([0, 7, 12, 5]), mecha3: lz([0, 9, 14, 6]), orbe1: lp(sobe(0.04)), orbe2: lp(sobe(-0.035)), orbe3: lp(sobe(0.03)) },
  especial: { chapeu: qz([0, -6, -8, 12, 4, 0]), mecha1: qz([0, 10, 14, -20, -8, 0]) },
  dano: { chapeu: qz([14, 5, 0]), mecha1: qz([-16, -6, 0]) },
  andar: { mecha1: lz([0, 8, 0, -6]), mecha2: lz([4, 10, 4, -4]) },
});

export const iaraboto = criatura({
  num: 9, id: 'iaraboto', nome: 'Iaraboto', porte: 'G', estagio: 'final', paleta: paletaBoto, build, anims,
  olho: {
    frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'],
    fechado: ['rrrrr', 'rrrrr', 'prrrp', '.ppp.', 'rrrrr'],
    mapa: ['p', 'p'],
  },
});
