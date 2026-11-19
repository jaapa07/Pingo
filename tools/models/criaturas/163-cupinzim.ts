/**
 * 163 · CUPINZIM (Inseto/Pedra) — cupim-soldado de cabeça enorme.
 * Traços: cabeçorra alaranjada de soldado, maior que o corpo · mandíbulas escuras em pinça ·
 * corpo pálido e mole de cupim · torrão de barro grudado nas costas como mochila · antenas de contas.
 */
import { criatura, inseto, animsInseto, blob, lathe, par, m, lz, qz } from './kits';

export const paletaCupim = {
  rampas: [
    ['#a85a2a', '#e59a3c', '#ffd27a'], // 0 cabeça âmbar de soldado
    ['#b59a84', '#f0dcc0', '#fffaf0'], // 1 corpo pálido
    ['#6a3a36', '#a8643c', '#d99a5c'], // 2 barro do cupinzeiro
    ['#2e1a26', '#52303a', '#80504c'], // 3 mandíbulas, patas e antenas
  ] as [string, string, string][],
  contorno: '#2a1622',
  extras: { w: '#ffffff', p: '#2a1622', f: '#e59a3c' },
};

function build() {
  const { rig } = inseto({
    torax: [0.11, 0.1, 0.1], abdomen: [0.16, 0.13, 0.14], cabeca: [0.23, 0.2, 0.21], alt: 0.2, caiAbdomen: 6,
    patas: { abre: 0.24, r: 0.03 }, antenas: { len: 0.16, r: 0.018, abre: 36, bola: 0.03 }, mandibulas: 0.2,
    olho: { r: 0.034, pos: [0.25, 0.02, 0.15] },
    rampas: { torax: 1, abdomen: 1, cabeca: 0, patas: 3, antenas: 3 },
  });
  // testa abaulada mais clara e gomos do abdômen
  rig.add('cabeca', blob([0.15, 0.1, 0.16], m.luz(0), { pos: [0.1, 0.11, 0], seg: 14 }));
  for (const x of [-0.08, -0.18]) rig.add('abdomen', blob([0.022, 0.128, 0.138], m.sombra(1), { pos: [x, 0, 0], seg: 12 }));
  // torrão de barro nas costas, com um furinho de túnel
  rig.bone('torrao', 'abdomen', [-0.12, 0.1, 0], [0, 0, 10]);
  rig.add('torrao', lathe([[0.13, 0], [0.12, 0.08], [0.08, 0.18], [0.03, 0.24], [0.001, 0.25]], m(2), { seg: 7 }), blob([0.03, 0.035, 0.03], m.plano(3), { pos: [0.07, 0.09, 0.07], seg: 8 }));
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.04], m.sombra(0), { pos: [0.3, -0.07, 0.1 * s], seg: 8 })));
  return rig;
}

const anims = animsInseto({ u: 0.55, alt: 0.2, mole: 1.0 }, {
  idle: { torrao: lz([0, 2, 4, 1]) },
  especial: { torrao: qz([0, 8, 12, -14, -4, 0]) },
});

export const cupinzim = criatura({
  num: 163, id: 'cupinzim', nome: 'Cupinzim', porte: 'P', estagio: 'basico', paleta: paletaCupim, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
