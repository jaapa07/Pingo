/**
 * 161 · TUQUIM (Terra) — filhote de tuco-tuco, roedor cavador dos campos do sul.
 * Traços únicos: dentões laranja à mostra · corpo de salsicha com pernas curtíssimas ·
 * garras de aço claro nas patas da frente · montinho de areia no cocuruto · cotoco de rabo.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, garra, par, m, lz, qz } from './kits';

export const paletaTuco = {
  rampas: [
    ['#7b4a44', '#bb8250', '#e8bb78'], // 0 pelo castanho-areia
    ['#bfa38c', '#f3e1c2', '#fffaee'], // 1 creme do ventre e das bochechas
    ['#b04f20', '#f08a2a', '#ffd06c'], // 2 dentões laranja e areia
    ['#2f3049', '#6b7997', '#c6d5e4'], // 3 aço das garras; a sombra faz nariz e patas
  ] as [string, string, string][],
  contorno: '#2c1d2e',
  extras: { w: '#ffffff', p: '#2c1d2e', f: '#bb8250' },
};

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.3, 0.2, 0.2], peito: 0.94,
    pernas: { alt: 0.13, r: 0.065, rFim: 0.06, xF: 0.55, xT: -0.5, z: 0.7, dobraF: 4, dobraT: -10, pe: [0.085, 0.04, 0.07] },
    pescoco: { len: 0.1, ang: 16, r: 0.16, x: 0.62, y: 0.1 },
    cabeca: [0.21, 0.19, 0.19],
    focinho: { len: 0.07, r0: 0.11, r1: 0.085, cai: 4, y: -0.25, nariz: 0.04 },
    orelha: { tipo: 'redonda', alt: 0.06, larg: 0.07, x: -0.35, z: 0.8, abre: 30 },
    cauda: { segs: 1, len: 0.1, r0: 0.045, r1: 0.03, ang: 20 },
    olho: { r: 0.027, pos: [0.19, 0.07, 0.135] },
    rampas: { pelo: 0, barriga: 1, pe: 0, nariz: 2, orelha: 0, focinho: 1 },
  });
  const pf = ref.pontaFocinho;
  // DENTÕES laranja (chapados) e bochechas gordas
  for (const z of [-0.028, 0.028]) rig.add('cabeca', blob([0.028, 0.065, 0.03], m.plano(2), { pos: [pf[0] + 0.015, pf[1] - 0.085, z], seg: 10 }));
  par((_, s) => rig.add('cabeca', blob([0.085, 0.075, 0.06], m(1), { pos: [0.14, -0.08, 0.13 * s], seg: 14 })));
  // faixa dorsal mais escura e garupa clara
  rig.add('corpo', calota([0.31, 0.21, 0.13], m.sombra(0), { de: 0, ate: 62 }));
  // garras de aço nas patas da frente (três por pata, bem grossas)
  par((l) => { for (const z of [-0.05, 0, 0.05]) rig.add('canela_f' + l, garra(0.1, 0.03, m.luz(3), { pos: [0.09, -0.05, z], curva: 0.4 })); });
  // montinho de areia no cocuruto (osso próprio: escorrega quando leva golpe)
  rig.bone('areia', 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.03, 0]);
  rig.add('areia', blob([0.1, 0.06, 0.1], m.luz(2), { pos: [0, 0.02, 0], seg: 12 }), blob([0.05, 0.05, 0.05], m.luz(2), { pos: [0.01, 0.07, 0], seg: 8 }), blob([0.03, 0.03, 0.03], m(2), { pos: [-0.08, 0.0, 0.05], seg: 6 }));
  // tufo claro no cotoco de rabo
  rig.add('cauda1', blob([0.05, 0.045, 0.045], m(1), { pos: [-0.1, 0.01, 0], seg: 10 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.55, hPerna: 0.13, mole: 1.3, passo: 22, mapa: { comp: 0.75, larg: 1.3, frontal: 1.3 } }, {
  idle: { areia: lz([0, 2, 4, 1]) },
  // cava com as duas patas da frente
  especial: { areia: qz([0, 8, 10, -16, -6, 0]), perna_fd: qz([10, 40, -30, 40, -20, 0]), perna_fe: qz([10, -30, 40, -30, 30, 0]) },
  dano: { areia: qz([22, 8, 0]) },
});

export const tuquim = criatura({
  num: 161, id: 'tuquim', nome: 'Tuquim', porte: 'P', estagio: 'basico', paleta: paletaTuco, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
