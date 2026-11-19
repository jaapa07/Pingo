/**
 * 111 · PIRARUCINHO (Rio) — pirarucu filhote: corpo roliço verde-oliva que vai avermelhando para a cauda.
 * Traços únicos: cabeça chata de placa óssea clara · escamas de borda vermelha só na metade de trás ·
 * dorsal e anal longas e baixas coladas à cauda-leque · boca virada para cima de quem sobe para respirar.
 */
import { criatura, peixe, animsPeixe, blob, calota, pinta, par, m, lz, qz } from './kits';

export const paletaPirarucu = {
  rampas: [
    ['#2f4a52', '#55806f', '#9cc08e'], // 0 verde-oliva do dorso
    ['#8a2440', '#d8443c', '#ff8f5a'], // 1 vermelho das escamas e da cauda
    ['#a9a58c', '#efe6c2', '#fffbe8'], // 2 creme da barriga e da placa da cabeça
    ['#1f2a3c', '#34495a', '#5f7f86'], // 3 nadadeiras escuras
  ] as [string, string, string][],
  contorno: '#1c2233',
  extras: { w: '#ffffff', p: '#1c2233', f: '#55806f' },
};

function build() {
  const { rig, ref } = peixe({
    corpo: [0.34, 0.15, 0.14], flutua: 0.24, ergue: 14,
    boca: { len: 0.1, r: 0.05, queixo: 0.03 },
    cauda: { len: 0.1, r: 0.07, alt: 0.24, larg: 0.16, forma: 'redonda' },
    dorsal: { alt: 0.07, len: 0.26, x: -0.6 },
    anal: { alt: 0.07, len: 0.24, x: -0.6 },
    nad: { len: 0.14, larg: 0.09, x: 0.3, y: -0.5 },
    olho: { r: 0.03, pos: [0.2, 0.04, 0.115] },
    rampas: { corpo: 0, barriga: 2, nadadeiras: 3, cauda: 1, boca: 2 },
  });
  // placa óssea clara e chata na cabeça
  rig.add('tronco', calota([0.17, 0.11, 0.13], m(2), { de: 0, ate: 62, pos: [0.2, 0.06, 0], rot: [0, 0, -24] }));
  // escamas vermelhas: três fileiras crescendo para a cauda
  par((_, s) => {
    for (const [x, y, r] of [[-0.04, 0.03, 0.03], [-0.13, 0.05, 0.036], [-0.12, -0.04, 0.034], [-0.22, 0.02, 0.04], [-0.21, -0.06, 0.034]] as const)
      rig.add('tronco', pinta(r, m(1), [x, y, (0.14 - Math.abs(x) * 0.12) * s], [0, 0, 0]));
    rig.add('cauda1', blob([0.1, 0.075, 0.055], m(1), { pos: [-0.04, 0, 0.012 * s], seg: 12 }));
  });
  // borda clara na cauda-leque
  rig.add('cauda2', blob([0.03, 0.11, 0.03], m.luz(1), { pos: [-0.15, 0, 0], seg: 10 }));
  void ref;
  return rig;
}

const anims = animsPeixe({ u: 0.6, flutua: 0.24, mole: 1.2 }, {
  idle: { tronco: lz([0, 2, 4, 1]) },
  especial: { tronco: qz([-6, -12, -12, 26, 10, 0]) },
});

export const pirarucinho = criatura({
  num: 111, id: 'pirarucinho', nome: 'Pirarucinho', porte: 'P', estagio: 'basico', paleta: paletaPirarucu, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
