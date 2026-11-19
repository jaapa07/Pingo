/**
 * 037 · PIABINHA (Rio) — piaba prateada de cardume, miúda e arisca.
 * Traços únicos: olhão de conta · pinta escura no ombro e risca no rabo · nadadeiras de ponta vermelha ·
 * topetinho de espinho na dorsal · bolhinha que solta pela boca.
 */
import { criatura, peixe, animsPeixe, blob, calota, slab, espuma, par, m, lz, ls, qs, qp, lp } from './kits';

export const paletaPiaba = {
  rampas: [
    ['#5a6a9a', '#a9c2dc', '#eef8fb'], // 0 prata azulada do dorso e dos flancos
    ['#b9b4c9', '#f5f0e2', '#fffdf4'], // 1 barriga madrepérola e bolhas
    ['#a3323a', '#e8553a', '#ffa25a'], // 2 vermelho-alaranjado das nadadeiras
    ['#2a2a4a', '#4d5a8c', '#f2c94a'], // 3 pinta e risca escuras · azul do lombo · amarelo do anel do rabo
  ] as [string, string, string][],
  contorno: '#272445',
  extras: { w: '#ffffff', p: '#1c1a33', f: '#a9c2dc', a: '#f2c94a' },
};

function build() {
  const { rig } = peixe({
    corpo: [0.27, 0.2, 0.13], flutua: 0.34, ergue: 6,
    boca: { len: 0.06, r: 0.055 },
    cauda: { len: 0.07, r: 0.05, alt: 0.34, larg: 0.2, forma: 'furcada' },
    dorsal: { alt: 0.13, len: 0.2, x: -0.1 },
    anal: { alt: 0.09, len: 0.16, x: -0.45 },
    nad: { len: 0.13, larg: 0.08, y: -0.4 },
    olho: { r: 0.042, pos: [0.15, 0.045, 0.1] },
    rampas: { corpo: 0, barriga: 1, nadadeiras: 2, cauda: 2, boca: 1 },
  });
  // lombo azul mais escuro (sela limpa ao longo do dorso)
  rig.add('tronco', calota([0.275, 0.208, 0.125], m.plano(3), { de: 0, ate: 48, deform: [(v) => { if (v.x < 0) { const k = 1 + (v.x / 0.275) * 0.4; v.y *= k; v.z *= k; } }] }));
  // pinta escura do ombro e risca que corre até o rabo
  par((_, s) => {
    rig.add('tronco', blob([0.04, 0.045, 0.02], m.sombra(3), { pos: [0.03, 0.03, 0.118 * s], seg: 10 }));
    rig.add('tronco', blob([0.1, 0.018, 0.02], m.sombra(3), { pos: [-0.16, 0.0, 0.085 * s], rot: [0, -12 * s, 0], seg: 10 }));
  });
  // anel amarelo no pedúnculo e miolo escuro no rabo
  rig.add('cauda1', blob([0.035, 0.062, 0.05], m.luz(3), { pos: [-0.045, 0, 0], seg: 12 }));
  rig.add('cauda2', slab([[0, 0.03], [-0.1, 0.03], [-0.13, 0], [-0.1, -0.03], [0, -0.03]], 0.04, m.sombra(3)));
  // espinho-topete na frente da dorsal
  rig.add('dorsal', blob([0.03, 0.09, 0.02], m.luz(2), { pos: [0.07, 0.07, 0], rot: [0, 0, 18], seg: 10 }));
  // beicinho e bochecha
  rig.add('tronco', blob([0.05, 0.035, 0.07], m(1), { pos: [0.25, -0.02, 0], seg: 12 }));
  // bolhinha num osso próprio
  rig.bone('bolha', 'corpo', [0.4, 0.12, 0.02]);
  rig.add('bolha', espuma(0.035, m.luz(1)));
  return rig;
}

const anims = animsPeixe({ u: 0.5, flutua: 0.34, mole: 1.3 }, {
  idle: { bolha: [...lp([[0, 0, 0], [0.01, 0.04, 0], [0.02, 0.08, 0], [0.02, 0.11, 0]]), ...ls([0.6, 0.9, 1.1, 0.4])] },
  especial: { bolha: [...qp([[0, 0, 0], [0, 0, 0], [0, 0.02, 0], [0.1, 0.05, 0], [0.14, 0.1, 0], [0, 0, 0]]), ...qs([0.8, 1.2, 1.6, 2, 1.2, 0.6])] },
  desmaio: { bolha: qs([0.6, 0.3, 0.01, 0.01, 0.01]) },
  status: { bolha: ls([0.01, 0.01, 0.01, 0.01]) },
  dano: { bolha: qs([0.01, 0.01, 0.6]) },
  andar: { bolha: ls([0.01, 0.01, 0.01, 0.01]) },
  parado: { bolha: ls([0.01, 0.01]) },
});

export const piabinha = criatura({
  num: 37, id: 'piabinha', nome: 'Piabinha', porte: 'P', estagio: 'basico', paleta: paletaPiaba, build, anims,
  olho: {
    frente: ['.ppp.', 'pwwpp', 'pwppp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
