/**
 * 087 · SUCURIÃO (Rio/Terra) — sucuri gigante enrolada num tronco. Estágio final.
 * Mantém da Sucurizinha: olhos no alto da cabeça, pintas escuras nos flancos, risca atrás do olho, ponta da cauda enlameada.
 * Cresce: três voltas grossas abraçando um toco quebrado · cabeçorra de sobrancelha pesada ·
 * galho com folhas e raízes no toco · filete amarelo da barriga em cada volta.
 */
import { criatura, serpente, animsSerpente, blob, lathe, calota, folha3d, segmento, par, m, lz, qz } from './kits';
import { paletaSucuri, voltaCobra, pintasVolta, pintaFlanco, extrasCobra } from './086-sucurizinha';

const CURVA = [72, -30, -28];

function build() {
  const r = 0.135;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.2, curva: CURVA, rFim: 0.125 },
    cauda: { segs: 3, len: 0.2, curva: [-30, -50, -50], rFim: 0.04 },
    cabeca: [0.27, 0.17, 0.22],
    olho: { r: 0.034, pos: [0.19, 0.15, 0.15] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  // o corpo do kit vira a saída do pescoço no alto do toco; a cauda sai por baixo da última volta
  rig.bones.corpo.position.set(0.2, 0.92, 0);
  rig.bones.cauda1.position.set(-0.52, r - 0.92, -0.16);
  // TOCO quebrado com raízes, galho e folhas (tudo no osso base: não acompanha o bote)
  rig.add('base', lathe([[0.3, 0], [0.24, 0.1], [0.2, 0.4], [0.19, 0.95], [0.21, 1.12], [0.12, 1.2], [0.001, 1.16]], m(3), { seg: 14, pos: [-0.05, 0, 0] }));
  rig.add('base', blob([0.15, 0.04, 0.15], m.luz(1), { pos: [-0.05, 1.17, 0], seg: 12 }));
  for (const [a, l] of [[-70, 0.26], [40, 0.24], [170, 0.28], [-150, 0.22]] as const) {
    const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
    rig.add('base', segmento([-0.05 + c * 0.18, 0.12, s * 0.18], [-0.05 + c * (0.2 + l), 0.02, s * (0.2 + l)], 0.09, 0.04, m(3)));
  }
  rig.bone('galho', 'base', [-0.2, 1.02, -0.08], [0, 0, 0]);
  rig.add('galho', segmento([0, 0, 0], [-0.2, 0.14, -0.1], 0.055, 0.035, m(3)));
  rig.add('galho', folha3d(0.22, 0.13, m.luz(0), { pos: [-0.2, 0.14, -0.1], rot: [0, 0, 50] }), folha3d(0.18, 0.11, m(0), { pos: [-0.18, 0.15, -0.1], rot: [30, 0, -10] }), folha3d(0.16, 0.1, m.luz(0), { pos: [-0.1, 0.08, -0.06], rot: [-40, 0, 30] }));
  // TRÊS VOLTAS abraçando o toco
  const voltas: [number, number, number, [number, number]][] = [[0.17, 0.34, 0.15, [6, 5]], [0.45, 0.31, 0.14, [-7, -5]], [0.72, 0.29, 0.135, [5, 7]]];
  voltas.forEach(([y, R, e, incl], i) => {
    voltaCobra(rig, 'base', [-0.05, y, 0], R, e, m(0), m(1), incl);
    pintasVolta(rig, 'base', [-0.05, y, 0], R, e, 9, m.plano(2), 0.46, i * 0.5);
  });
  // cabeçorra: olhos no alto, sobrancelha pesada, risca clara e escura atrás do olho, narinas
  par((_, s) => {
    rig.add('cabeca', blob([0.065, 0.055, 0.05], m(0), { pos: [0.17, 0.14, 0.105 * s], seg: 12 }));
    rig.add('cabeca', blob([0.1, 0.03, 0.05], m.sombra(0), { pos: [0.19, 0.205, 0.11 * s], rot: [0, 8 * s, -16], seg: 10 }));
    rig.add('cabeca', blob([0.12, 0.03, 0.025], m.plano(1), { pos: [0.0, 0.105, 0.185 * s], rot: [0, 10 * s, 14], seg: 10 }));
    rig.add('cabeca', blob([0.13, 0.035, 0.025], m.plano(2), { pos: [-0.01, 0.055, 0.195 * s], rot: [0, 10 * s, 14], seg: 10 }));
    rig.add('cabeca', blob([0.022, 0.018, 0.018], m.plano(2), { pos: [0.37, 0.1, 0.05 * s], seg: 8 }));
  });
  rig.add('cabeca', calota([0.2, 0.18, 0.2], m.sombra(0), { de: 0, ate: 50, pos: [0.02, 0.02, 0], rot: [0, 0, 30] }));
  for (const a of [-65, 65]) { pintaFlanco(rig, 'pescoco1', 0.1, 0, 0.133, a, m.plano(2), 0.42); pintaFlanco(rig, 'pescoco2', 0.1, 0, 0.13, a, m.plano(2), 0.42); }
  // ponta da cauda enlameada
  rig.bone('ponta', 'cauda3', [-0.2, 0.04 - r, 0], [0, 0, -55]);
  rig.add('ponta', blob([0.07, 0.06, 0.06], m(3), { pos: [-0.03, 0, 0], seg: 12 }), blob([0.04, 0.04, 0.04], m.luz(3), { pos: [-0.1, 0.01, 0], seg: 10 }));
  return rig;
}

const ex = extrasCobra(CURVA, 3);
const anims = animsSerpente({ u: 1.2, pescoco: 3, cauda: 3, mole: 0.4, mapa: { comp: 1, larg: 1, frontal: 1.05, cabeca: 1.25 } }, {
  fisico: ex.fisico,
  desmaio: { pescoco1: qz([4, -6, -20, -40, -38]), pescoco2: qz([0, -4, -20, -38, -36]), pescoco3: qz([0, -4, -14, -30, -28]), cabeca: qz([0, 4, 14, 26, 24]) },
  idle: { ponta: lz([0, 10, 18, 6]), galho: lz([0, 2, 4, 1]) },
  especial: { ...ex.especial, ponta: qz([0, 20, 30, -30, -10, 0]), galho: qz([0, 6, 8, -10, -4, 0]) },
  dano: { galho: qz([12, 5, 0]) },
});

export const sucuriao = criatura({
  num: 87, id: 'sucuriao', nome: 'Sucurião', porte: 'G', estagio: 'final', paleta: paletaSucuri, build, anims,
  olho: {
    frente: ['pppp.', '.apwp', '.appp', '..pp.'],
    fechado: ['fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
