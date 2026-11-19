/**
 * 013 · COTIAZINHA (Comum) — cutia filhote.
 * Traços únicos: garupa arrebitada de pelo dourado arrepiado (sem cauda) · dentões de roedor ·
 * coquinho preso na boca · orelhas redondas rosadas e patinhas finas escuras.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, tufo, par, m, lz, qz, type V3 } from './kits';

export const paletaCotia = {
  rampas: [
    ['#7a3f3a', '#b8703c', '#e2a658'], // 0 pelo castanho (sombra vinho, luz dourada)
    ['#c9a184', '#f5e2c0', '#fffaee'], // 1 creme do queixo, barriga e dentes
    ['#3a2638', '#5c3c48', '#f0998a'], // 2 patas e nariz ameixa · luz = rosa da orelha
    ['#5a7a2a', '#9ac43e', '#e0ee7c'], // 3 coquinho verde e brotos
  ] as [string, string, string][],
  contorno: '#2e1b2b',
  extras: { w: '#ffffff', p: '#2e1b2b', f: '#b8703c' },
};

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.27, 0.23, 0.21], peito: 0.86,
    pernas: { alt: 0.2, r: 0.055, rFim: 0.042, xF: 0.55, xT: -0.5, z: 0.6, dobraF: 6, dobraT: -28, pe: [0.07, 0.035, 0.05] },
    pescoco: { len: 0.13, ang: 34, r: 0.13, x: 0.6, y: 0.2 },
    cabeca: [0.2, 0.18, 0.18],
    focinho: { len: 0.1, r0: 0.1, r1: 0.07, cai: 12, y: -0.25, nariz: 0.035 },
    orelha: { tipo: 'redonda', alt: 0.11, larg: 0.12, x: -0.2, z: 0.75, abre: 30, deita: 12 },
    olho: { r: 0.03, pos: [0.19, 0.045, 0.14] },
    rampas: { pelo: 0, barriga: 1, canelaF: 2, canelaT: 2, pe: 2, nariz: 2, orelha: 0 },
  });
  // garupa dourada arrepiada: calota clara + tufo de pelos para trás
  rig.add('corpo', calota([0.21, 0.25, 0.225], m.luz(0), { de: 0, ate: 72, pos: [-0.13, 0.0, 0], rot: [0, 0, 48] }));
  rig.bone('garupa', 'corpo', [-0.26, 0.12, 0], [0, 0, 62]);
  rig.add('garupa', tufo(3, 0.14, 0.07, m.luz(0), { abre: 30 }));
  // miolo rosa das orelhas
  par((l, s) => rig.add('orelha_' + l, blob([0.035, 0.04, 0.02], m.luz(2), { pos: [0.03, 0.05, 0.012 * s], seg: 10 })));
  // bochechas creme e dentões
  const pf = ref.pontaFocinho as V3;
  par((_, s) => rig.add('cabeca', blob([0.07, 0.06, 0.045], m(1), { pos: [0.14, -0.08, 0.12 * s], seg: 12 })));
  rig.add('cabeca', blob([0.022, 0.04, 0.04], m.luz(1), { pos: [pf[0] - 0.005, pf[1] - 0.055, 0], seg: 10 }));
  // coquinho na boca (osso próprio)
  rig.bone('semente', 'cabeca', [pf[0] + 0.06, pf[1] - 0.075, 0]);
  rig.add('semente', blob([0.075, 0.085, 0.075], m(3), { seg: 14 }), blob([0.035, 0.03, 0.035], m.sombra(3), { pos: [0.0, 0.075, 0], seg: 8 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.7, hPerna: 0.2, mole: 1.2, mapa: { comp: 0.75, larg: 1.35, frontal: 1.3 } }, {
  idle: { semente: lz([0, 5, 9, 3]), garupa: lz([0, -5, -9, -3]) },
  especial: { semente: qz([0, 10, 14, -30, -10, 0]), garupa: qz([0, 12, 18, -22, -8, 0]) },
  dano: { garupa: qz([-24, -8, 0]) },
});

export const cotiazinha = criatura({
  num: 13, id: 'cotiazinha', nome: 'Cotiazinha', porte: 'P', estagio: 'basico', paleta: paletaCotia, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', 'pppw', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
