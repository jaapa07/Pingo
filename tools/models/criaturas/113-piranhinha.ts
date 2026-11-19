/**
 * 113 · PIRANHINHA (Rio) — piranha-vermelha miúda e invocada.
 * Traços únicos: corpo de disco prateado-azulado com barrigão vermelho · queixada para a frente com
 * serrilha de dentinhos brancos · olho vermelho de brasa · pintas de brilho no flanco.
 */
import { criatura, peixe, animsPeixe, blob, pinta, spike, par, m, lz, qz } from './kits';

export const paletaPiranha = {
  rampas: [
    ['#3c4a78', '#6f8fbf', '#b9d8ee'], // 0 prata-azulado
    ['#8f1f3a', '#e0402f', '#ff9450'], // 1 vermelho da barriga e das nadadeiras
    ['#b8b4c8', '#f4f1ea', '#ffffff'], // 2 dentes e brilhos
    ['#1e2140', '#343a66', '#59649a'], // 3 dorso e cauda escuros
  ] as [string, string, string][],
  contorno: '#1b1a38',
  extras: { w: '#ffffff', p: '#1b1a38', f: '#6f8fbf', a: '#e0402f' },
};

/** Serrilha de dentes brancos na ponta da queixada (osso `mandibula`): `x` avanço, `y` altura, `larg` meia-largura. */
export function dentes(rig: ReturnType<typeof peixe>['rig'], x: number, y: number, larg: number, n: number, t: number) {
  for (let i = 0; i < n; i++) {
    const z = n === 1 ? 0 : -larg + (2 * larg * i) / (n - 1);
    rig.add('mandibula', spike(t * 2.6, t * 1.2, m.plano(2), { pos: [x - Math.abs(z) * 0.5, y, z] }));
  }
}

function build() {
  const { rig } = peixe({
    corpo: [0.24, 0.22, 0.13], flutua: 0.29, ergue: 6,
    boca: { len: 0.1, r: 0.07, queixo: 0.05 },
    cauda: { len: 0.07, r: 0.05, alt: 0.26, larg: 0.15, forma: 'lua' },
    dorsal: { alt: 0.09, len: 0.18, x: -0.15, espinhos: 3 },
    anal: { alt: 0.08, len: 0.16, x: -0.45 },
    nad: { len: 0.12, larg: 0.08, x: 0.2, y: -0.4 },
    olho: { r: 0.029, pos: [0.14, 0.07, 0.108] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 1, cauda: 3, boca: 1 },
  });
  // dorso escuro e testa
  rig.add('tronco', blob([0.2, 0.1, 0.11], m(3), { pos: [-0.02, 0.135, 0] }));
  dentes(rig, 0.13, 0.04, 0.055, 4, 0.022);
  // pintas de brilho no flanco
  par((_, s) => {
    for (const [x, y] of [[-0.02, 0.06], [-0.1, 0.02], [0.05, 0.0]] as const) rig.add('tronco', pinta(0.022, m.luz(0), [x, y, 0.128 * s]));
  });
  return rig;
}

const anims = animsPeixe({ u: 0.55, flutua: 0.29, mole: 1.3 }, {
  idle: { mandibula: lz([0, -8, -14, -4]) },
  fisico: { mandibula: qz([-16, -44, 8, 0, 0]) },
});

export const piranhinha = criatura({
  num: 113, id: 'piranhinha', nome: 'Piranhinha', porte: 'P', estagio: 'basico', paleta: paletaPiranha, build, anims,
  olho: {
    frente: ['pp...', 'wapp.', 'wapp.', '.pp..'],
    fechado: ['ffff.', 'pffp.', '.pp..', 'ffff.'],
    mapa: ['a', 'p'],
  },
});
