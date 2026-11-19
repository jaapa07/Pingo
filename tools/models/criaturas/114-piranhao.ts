/**
 * 114 · PIRANHÃO (Rio/Ginga) — piranha chefe de cardume. Estágio final.
 * Mantém da linha: disco prateado de barrigão vermelho, queixada com serrilha de dentes, olho de brasa.
 * Cresce: queixo de lutador enorme · cicatriz no flanco e dorsal rasgada em espinhos ·
 * DUAS piranhinhas do cardume nadando em formação atrás dele · nadadeiras peitorais em punho.
 */
import { criatura, peixe, animsPeixe, blob, pinta, slab, par, m, lz, qz, lp, ly, type V3 } from './kits';
import { paletaPiranha, dentes } from './113-piranhinha';

function build() {
  const { rig } = peixe({
    corpo: [0.36, 0.32, 0.19], flutua: 0.4, ergue: 8,
    boca: { len: 0.16, r: 0.11, queixo: 0.09 },
    cauda: { len: 0.1, r: 0.07, alt: 0.4, larg: 0.22, forma: 'lua' },
    dorsal: { alt: 0.15, len: 0.3, x: -0.1, espinhos: 5 },
    anal: { alt: 0.12, len: 0.24, x: -0.45 },
    nad: { len: 0.2, larg: 0.13, x: 0.2, y: -0.4 },
    olho: { r: 0.034, pos: [0.22, 0.11, 0.155] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 1, cauda: 3, boca: 1 },
  });
  rig.add('tronco', blob([0.3, 0.15, 0.16], m(3), { pos: [-0.03, 0.2, 0] }));
  dentes(rig, 0.21, 0.07, 0.09, 5, 0.03);
  par((l, s) => {
    // sobrancelha de briga, pintas de brilho e punho nas peitorais
    rig.add('tronco', blob([0.1, 0.03, 0.03], m.sombra(3), { pos: [0.22, 0.17, 0.14 * s], rot: [0, 0, -24], seg: 10 }));
    for (const [x, y] of [[-0.04, 0.08], [-0.16, 0.03], [0.06, -0.01], [-0.08, -0.06]] as const) rig.add('tronco', pinta(0.03, m.luz(0), [x, y, 0.188 * s]));
    rig.add('nad_' + l, blob([0.06, 0.06, 0.05], m.luz(1), { pos: [-0.17, 0, 0], seg: 10 }));
  });
  // cicatriz em X no flanco direito
  rig.add('tronco', blob([0.07, 0.014, 0.02], m.plano(2), { pos: [-0.1, 0.1, 0.18], rot: [0, 0, 40], seg: 8 }), blob([0.07, 0.014, 0.02], m.plano(2), { pos: [-0.1, 0.1, 0.18], rot: [0, 0, -40], seg: 8 }));
  // o cardume: duas piranhinhas em formação
  const peq: [string, V3, number][] = [['cardume1', [-0.5, 0.26, 0.3], 1], ['cardume2', [-0.42, -0.2, -0.36], 0.85]];
  for (const [nome, pos, k] of peq) {
    rig.bone(nome, 'corpo', pos);
    rig.add(nome, blob([0.12 * k, 0.11 * k, 0.07 * k], m(0)), blob([0.1 * k, 0.07 * k, 0.065 * k], m(1), { pos: [0.01, -0.045 * k, 0] }), blob([0.09 * k, 0.04 * k, 0.055 * k], m(3), { pos: [-0.01, 0.075 * k, 0] }),
      slab([[0, 0.02], [-0.1, 0.09], [-0.07, 0], [-0.1, -0.09], [0, -0.02]], 0.02, m(3), { pos: [-0.11 * k, 0, 0], scale: k }),
      blob([0.022, 0.022, 0.022], m.plano(1), { pos: [0.07 * k, 0.025 * k, 0.05 * k], seg: 8 }), blob([0.022, 0.022, 0.022], m.plano(1), { pos: [0.07 * k, 0.025 * k, -0.05 * k], seg: 8 }));
  }
  return rig;
}

const anims = animsPeixe({ u: 0.85, flutua: 0.4, mole: 0.8 }, {
  idle: { mandibula: lz([0, -8, -14, -4]), cardume1: lp([[0, 0, 0], [0.02, 0.03, 0], [0.03, 0.01, 0], [0.01, -0.02, 0]]), cardume2: lp([[0, 0, 0], [-0.02, -0.02, 0], [0, -0.03, 0], [0.02, 0, 0]]) },
  fisico: { mandibula: qz([-16, -48, 8, 0, 0]), cardume1: [...qz([0, 10, -20, -6, 0]), ...[{ t: 0, p: [0, 0, 0] as V3 }, { t: 0.5, p: [0.3, -0.05, 0] as V3 }, { t: 1, p: [0, 0, 0] as V3 }]], cardume2: [{ t: 0, p: [0, 0, 0] as V3 }, { t: 0.6, p: [0.3, 0.08, 0] as V3 }, { t: 1, p: [0, 0, 0] as V3 }] },
  andar: { cardume1: ly([-10, 0, 10, 0]), cardume2: ly([10, 0, -10, 0]) },
  desmaio: { cardume1: [{ t: 0, p: [0, 0, 0] as V3 }, { t: 1, p: [-0.1, -0.5, 0] as V3 }], cardume2: [{ t: 0, p: [0, 0, 0] as V3 }, { t: 1, p: [-0.1, -0.1, 0] as V3 }] },
});

export const piranhao = criatura({
  num: 114, id: 'piranhao', nome: 'Piranhão', porte: 'M', estagio: 'final', paleta: paletaPiranha, build, anims,
  olho: {
    frente: ['ppp..', 'wappp', 'wapp.', '.pp..'],
    fechado: ['fffff', 'pffpf', '.pp..', 'ffff.'],
    mapa: ['a', 'p'],
  },
});
