/**
 * 166 · MOCÓ-DA-ROCHA (Pedra) — mocó adulto de pelagem mineral. Estágio final.
 * Mantém da linha: dorso cinza, garupa ruiva, garganta e bochechas brancas, orelhas redondas.
 * Cresce: couraça de lajes azuladas do pescoço à garupa, com três cristas de pedra · sobrancelha de rocha ·
 * unhas-pitão de escalador · topete e suíças ruivas · seixo equilibrado na garupa.
 */
import { criatura, animsQuadrupede, blob, tufo, garra, par, m, lz, qz, type V3 } from './kits';
import { paletaMoco, corpoMoco, pedra } from './165-mocozim';

function build() {
  const tr: V3 = [0.36, 0.27, 0.26];
  const { rig, ref } = corpoMoco({ k: 1.4, tronco: tr, cabeca: [0.25, 0.22, 0.23], pernas: 0.22 });
  // couraça de lajes e cristas
  const lajes: [V3, V3, V3][] = [[[0.2, 0.1, 0.34], [0.22, 0.24, 0], [0, 0, -14]], [[0.22, 0.1, 0.38], [0.0, 0.27, 0], [0, 6, 0]], [[0.2, 0.1, 0.34], [-0.22, 0.24, 0], [0, -4, 16]]];
  for (const [t, p, r] of lajes) rig.add('corpo', pedra(t, m(3), p, r));
  for (const [x, h] of [[0.22, 0.16], [0.0, 0.22], [-0.22, 0.17]] as const) rig.add('corpo', pedra([0.12, h, 0.12], m.luz(3), [x, 0.3 + h * 0.4, 0], [0, 45, x * 40]));
  par((l, s) => {
    rig.add('corpo', pedra([0.16, 0.14, 0.07], m(3), [0.1, 0.1, 0.25 * s], [0, 0, 10]), pedra([0.14, 0.12, 0.07], m.sombra(3), [-0.14, 0.08, 0.25 * s], [0, 0, -8]));
    rig.add('cabeca', pedra([0.12, 0.05, 0.08], m(3), [0.2, 0.15, 0.12 * s], [0, 12 * s, -20]));
    rig.add('cabeca', tufo(2, 0.15, 0.06, m(2), { pos: [0.06, -0.1, 0.19 * s], rot: [110 * s, 0, 30], abre: 24 }));
    for (const q of ['f', 't']) for (const z of [-0.04, 0.04]) rig.add('canela_' + q + l, garra(0.1, 0.03, m.luz(3), { pos: [0.08, -0.1, z], curva: 0.6 }));
  });
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.03, 0], [0, 0, 20]);
  rig.add('topete', tufo(3, 0.17, 0.06, m(2), { abre: 30 }));
  rig.bone('seixo', 'corpo', [-0.36, 0.3, 0]);
  rig.add('seixo', pedra([0.16, 0.13, 0.15], m.luz(3), [0, 0.04, 0], [12, 30, 10]));
  return rig;
}

const anims = animsQuadrupede({ u: 1.0, hPerna: 0.22, mole: 0.6 }, {
  idle: { topete: lz([0, 4, 7, 2]), seixo: lz([0, 3, 0, -3]) },
  especial: { topete: qz([0, 10, 14, -18, -6, 0]), seixo: qz([0, 6, 10, -20, -6, 0]) },
});

export const mocoDaRocha = criatura({
  num: 166, id: 'moco-da-rocha', nome: 'Mocó-da-Rocha', porte: 'M', estagio: 'final', paleta: paletaMoco, build, anims,
  olho: { frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
void blob;
