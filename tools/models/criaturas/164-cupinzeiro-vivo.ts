/**
 * 164 · CUPINZEIRO-VIVO (Pedra/Inseto) — o cupinzeiro que criou patas. Estágio final.
 * Mantém do Cupinzim: cabeça âmbar de soldado com pinças escuras, corpo pálido, barro do torrão.
 * Cresce: o torrão virou um murundu inteiro de três torres nas costas, com bocas de túnel e dois soldadinhos
 * espiando · patas grossas com joelheiras de barro · pinças enormes · capim brotando no alto.
 */
import { criatura, inseto, animsInseto, blob, lathe, tufo, spike, par, m, lz, qz } from './kits';
import { paletaCupim } from './163-cupinzim';

function build() {
  const { rig } = inseto({
    torax: [0.2, 0.17, 0.2], abdomen: [0.3, 0.22, 0.26], cabeca: [0.27, 0.23, 0.25], alt: 0.3, caiAbdomen: 4,
    patas: { abre: 0.4, r: 0.055 }, antenas: { len: 0.2, r: 0.022, abre: 40, bola: 0.036 }, mandibulas: 0.3,
    olho: { r: 0.036, pos: [0.3, 0.03, 0.18] },
    rampas: { torax: 1, abdomen: 1, cabeca: 0, patas: 3, antenas: 3 },
  });
  rig.add('cabeca', blob([0.17, 0.11, 0.19], m.luz(0), { pos: [0.12, 0.13, 0], seg: 14 }));
  // MURUNDU de três torres
  rig.bone('murundu', 'corpo', [-0.24, 0.1, 0], [0, 0, 6]);
  const torre = (r: number, h: number) => lathe([[r, 0], [r * 0.95, h * 0.3], [r * 0.7, h * 0.66], [r * 0.34, h * 0.92], [0.001, h]], m(2), { seg: 8 });
  const t1 = torre(0.3, 0.74); rig.add('murundu', t1);
  const t2 = torre(0.2, 0.5); t2.position.set(0.22, -0.02, 0.1); t2.rotation.z = -0.2; rig.add('murundu', t2);
  const t3 = torre(0.18, 0.44); t3.position.set(-0.24, -0.04, -0.08); t3.rotation.z = 0.24; rig.add('murundu', t3);
  rig.add('murundu', blob([0.34, 0.12, 0.3], m.sombra(2), { pos: [0, 0.02, 0] }));
  // bocas de túnel e soldadinhos espiando
  for (const [x, y, z] of [[0.2, 0.26, -0.2], [-0.02, 0.44, -0.18], [0.3, 0.18, 0.18], [-0.26, 0.2, -0.2]] as const) rig.add('murundu', blob([0.05, 0.06, 0.05], m.plano(3), { pos: [x, y, z], seg: 8 }));
  for (const [x, y, z] of [[0.22, 0.25, -0.24], [0.33, 0.17, 0.22]] as const) rig.add('murundu', blob([0.045, 0.04, 0.045], m.luz(0), { pos: [x, y, z], seg: 8 }));
  rig.bone('capim', 'murundu', [0, 0.72, 0]); rig.add('capim', tufo(3, 0.2, 0.05, m.luz(1), { abre: 36 }));
  par((l, s) => {
    for (const i of [1, 2, 3]) rig.add(`pata${i}_${l}`, blob([0.07, 0.07, 0.07], m(2), { pos: [0, 0.1, 0.2 * s], seg: 8 }));
    rig.add('cabeca', spike(0.12, 0.04, m(3), { pos: [0.2, 0.2, 0.12 * s], rot: [24 * s, 0, -20] }));
  });
  return rig;
}

const anims = animsInseto({ u: 1.1, alt: 0.3, mole: 0.5 }, {
  idle: { capim: lz([0, 6, 10, 3]), murundu: lz([0, 1, 2, 0]) },
  especial: { murundu: qz([0, 4, 6, -8, -3, 0]), capim: qz([0, 12, 18, -20, -6, 0]) },
});

export const cupinzeiroVivo = criatura({
  num: 164, id: 'cupinzeiro-vivo', nome: 'Cupinzeiro-Vivo', porte: 'G', estagio: 'final', paleta: paletaCupim, build, anims,
  olho: { frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
