/**
 * 082 · JABUTIPIRANGA (Mata/Pedra) — jabuti centenário com um jardim de pedras equilibrado no casco. Estágio final.
 * Mantém da linha: cúpula de escudos amarelos, escamas vermelhas, patas de coluna, o broto.
 * Cresce: JARDIM DE PEDRAS no casco (torre de três seixos, rochas com musgo, arvorezinha torta) ·
 * casco com abas largas · esporas vermelhas · papada · olhar de quem já viu de tudo.
 */
import { criatura, animsTartaruga, blob, tube, folha3d, par, m, lz, qz, qp } from './kits';
import { paletaJabuti, corpoJabuti, broto } from './081-jabutim';

function build() {
  const { rig } = corpoJabuti({ casco: [0.42, 0.34, 0.36], alt: 0.14, perna: 0.2, r: 0.095, cabeca: [0.17, 0.14, 0.145], pescoco: 0.2 });
  // rochas com musgo
  rig.add('corpo', blob([0.14, 0.11, 0.13], m.luz(0), { pos: [-0.16, 0.34, 0.08], rot: [0, 20, 10], seg: 7 }), blob([0.1, 0.03, 0.09], m(2), { pos: [-0.17, 0.43, 0.08], seg: 8 }),
    blob([0.09, 0.07, 0.09], m(0), { pos: [0.2, 0.3, -0.12], seg: 7 }), blob([0.06, 0.02, 0.06], m.luz(2), { pos: [0.2, 0.36, -0.12], seg: 6 }));
  // torre de três seixos (osso próprio: balança sem cair)
  rig.bone('torre', 'corpo', [0.08, 0.36, 0.1]);
  rig.add('torre', blob([0.1, 0.06, 0.09], m.luz(0), { seg: 8 }), blob([0.075, 0.05, 0.07], m(0), { pos: [0.01, 0.1, 0], seg: 8 }), blob([0.05, 0.04, 0.05], m.luz(0), { pos: [-0.005, 0.18, 0.005], seg: 8 }));
  // arvorezinha torta de copa em almofada
  rig.bone('arvore', 'corpo', [-0.06, 0.36, -0.1], [0, 0, 10]);
  rig.add('arvore', tube([[0, 0, 0], [0.04, 0.1, 0], [-0.02, 0.2, 0.01], [0.03, 0.28, 0]], (u) => 0.035 * (1 - u * 0.5), m.sombra(0), { seg: 10, radial: 8 }),
    blob([0.11, 0.07, 0.1], m(2), { pos: [0.04, 0.31, 0], seg: 10 }), blob([0.07, 0.05, 0.07], m.luz(2), { pos: [-0.07, 0.24, 0.03], seg: 8 }), blob([0.03, 0.03, 0.03], m.plano(3), { pos: [0.08, 0.36, 0.05], seg: 6 }));
  broto(rig, 'broto', 'corpo', [-0.34, 0.2, 0], 0.16, 40);
  par((l, s) => {
    rig.add('canela_t' + l, blob([0.035, 0.05, 0.035], m.plano(3), { pos: [-0.1, -0.12, 0.03 * s], seg: 8 }));
    rig.add('cabeca', blob([0.07, 0.022, 0.05], m.sombra(0), { pos: [0.13, 0.12, 0.09 * s], rot: [-10 * s, 0, 8], seg: 8 }));
    void l;
  });
  rig.add('pescoco', blob([0.09, 0.07, 0.09], m(0), { pos: [0.1, -0.03, 0], seg: 10 }));
  rig.add('corpo', folha3d(0.12, 0.07, m(2), { pos: [0.3, 0.22, 0.14], rot: [30, 0, -50] }));
  return rig;
}

const anims = animsTartaruga({ u: 0.85, hPerna: 0.14, pescoco: 0.2, mole: 0.3 }, {
  idle: { torre: lz([0, 2, 4, -2]), arvore: lz([0, -2, -4, 0]), broto: lz([0, 5, 10, 3]) },
  // a torre salta e pousa de volta
  especial: { torre: qp([[0, 0, 0], [0, 0.01, 0], [0, 0.02, 0], [0, 0.14, 0], [0, 0.05, 0], [0, 0, 0]]), arvore: qz([0, 6, 10, -14, -4, 0]) },
  dano: { torre: qz([14, 5, 0]) },
});

export const jabutipiranga = criatura({
  num: 82, id: 'jabutipiranga', nome: 'Jabutipiranga', porte: 'G', estagio: 'final', paleta: paletaJabuti, build, anims,
  olho: { frente: ['wwwww', 'wpppw', 'wpwpw', '.ppp.', '.....'], fechado: ['fffff', 'fffff', 'ppppp', 'fffff', '.....'], mapa: ['w', 'p'] },
});
