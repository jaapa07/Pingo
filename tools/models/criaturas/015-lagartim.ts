/**
 * 015 · LAGARTIM (Inseto) — lagarta de borboleta-coruja.
 * Traços únicos: corpo de gomos verdes com a frente erguida · cabeça ameixa com dois chifres de clava ·
 * "olho de coruja" dourado pintado no flanco (o que um dia vai para as asas) · rabo bifurcado e espinhos no dorso.
 * Anatomia: cadeia da serpente (mesmos nomes de ossos), montada aqui com gomos em vez de cilindros.
 */
import { criatura, animsSerpente, novoRig, olhos, blob, segmento, spike, par, m, lz, qz, type V3 } from './kits';

export const paletaBruxa = {
  rampas: [
    ['#3a2440', '#6a4560', '#9a6c84'], // 0 ameixa-castanho (cabeça, chifres; nas asas da adulta)
    ['#b8702a', '#f0b83a', '#fff0a0'], // 1 dourado dos "olhos de coruja" e da crisálida
    ['#2f7a4e', '#6cc050', '#c8ec78'], // 2 verde da lagarta e da folha
    ['#b0a070', '#f0ecc0', '#fffff0'], // 3 creme-esverdeado da barriga e da seda
  ] as [string, string, string][],
  contorno: '#2a1a30',
  extras: { w: '#ffffff', p: '#1e1226', f: '#6a4560', a: '#f0b83a' },
};

/** "Olho de coruja": disco dourado com miolo escuro e brilho, chapado, de frente para ±Z. */
export function olhoCoruja(r: number, pos: V3, s: number) {
  return [
    blob([r, r, r * 0.3], m.plano(1), { pos, seg: 14, castShadow: false }),
    blob([r * 0.55, r * 0.55, r * 0.3], m.sombra(0), { pos: [pos[0], pos[1], pos[2] + r * 0.12 * s], seg: 12, castShadow: false }),
    blob([r * 0.2, r * 0.2, r * 0.2], m.luz(3), { pos: [pos[0] + r * 0.25, pos[1] + r * 0.25, pos[2] + r * 0.3 * s], seg: 8, castShadow: false }),
  ];
}

function build() {
  const rig = novoRig(0.15);
  const gomo = (osso: string, x: number, r: number, espinho = true) => {
    rig.add(osso, blob([r * 1.05, r, r * 1.08], m(2), { pos: [x, 0, 0], seg: 20 }), blob([r * 0.85, r * 0.6, r * 0.9], m(3), { pos: [x, -r * 0.5, 0], seg: 14 }));
    if (espinho) rig.add(osso, spike(r * 0.7, r * 0.22, m(0), { pos: [x, r * 0.85, 0] }));
    par((_, s) => rig.add(osso, blob([r * 0.3, r * 0.34, r * 0.3], m(1), { pos: [x, -r * 0.92, r * 0.5 * s], seg: 8 }))); // falsas patas douradas
  };
  gomo('corpo', 0, 0.15);
  // frente erguida
  rig.bone('pescoco1', 'corpo', [0.02, 0.01, 0], [0, 0, 38]); gomo('pescoco1', 0.17, 0.145);
  rig.bone('pescoco2', 'pescoco1', [0.2, 0, 0], [0, 0, 34]); gomo('pescoco2', 0.14, 0.135, false);
  rig.bone('cabeca', 'pescoco2', [0.2, 0, 0], [0, 0, -62]);
  rig.add('cabeca', blob([0.19, 0.18, 0.19], m(0), { pos: [0.1, 0.04, 0] }), blob([0.1, 0.09, 0.15], m.luz(0), { pos: [0.21, -0.04, 0], seg: 14 }));
  rig.bone('mandibula', 'cabeca', [0.2, -0.09, 0]);
  rig.add('mandibula', blob([0.06, 0.035, 0.08], m.sombra(0), { pos: [0.03, 0, 0], seg: 10 }));
  olhos(rig, 'cabeca', 0.036, [0.23, 0.075, 0.13]);
  // chifres de clava (ossos próprios)
  par((l, s) => {
    rig.bone('chifre_' + l, 'cabeca', [0.04, 0.18, 0.09 * s], [-16 * s, 0, 12]);
    rig.add('chifre_' + l, segmento([0, 0, 0], [0, 0.2, 0], 0.04, 0.03, m(0)), blob([0.055, 0.055, 0.055], m(1), { pos: [0, 0.23, 0], seg: 10 }));
  });
  // traseira no chão, em S, com o olho de coruja no primeiro gomo
  rig.bone('cauda1', 'corpo', [-0.02, 0, 0], [0, 14, 0]); gomo('cauda1', -0.19, 0.145);
  par((_, s) => rig.add('cauda1', ...olhoCoruja(0.075, [-0.19, 0.035, 0.15 * s], s)));
  rig.bone('cauda2', 'cauda1', [-0.21, 0, 0], [0, -30, 0]); gomo('cauda2', -0.16, 0.125);
  rig.bone('cauda3', 'cauda2', [-0.19, 0, 0], [0, -22, 0]); gomo('cauda3', -0.13, 0.105, false);
  par((_, s) => rig.add('cauda3', spike(0.17, 0.04, m(0), { pos: [-0.2, 0.03, 0.04 * s], rot: [20 * s, 0, 60] })));
  return rig;
}

const anims = animsSerpente({ u: 0.55, pescoco: 2, cauda: 3, mole: 1.3, mapa: { comp: 0.8, larg: 1.25, cabeca: 1.25, frontal: 1.25 } }, {
  idle: { chifre_d: lz([0, 6, 10, 3]), chifre_e: lz([0, 4, 10, 6]) },
  especial: { chifre_d: qz([0, -14, -18, 24, 8, 0]), chifre_e: qz([0, -14, -18, 24, 8, 0]) },
  dano: { chifre_d: qz([26, 10, 0]), chifre_e: qz([26, 10, 0]) },
});

export const lagartim = criatura({
  num: 15, id: 'lagartim', nome: 'Lagartim', porte: 'P', estagio: 'basico', paleta: paletaBruxa, build, anims,
  olho: {
    frente: ['.www.', 'wwppw', 'wwppw', '.www.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
