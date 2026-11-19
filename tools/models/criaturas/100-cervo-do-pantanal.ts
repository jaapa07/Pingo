/**
 * 100 · CERVO-DO-PANTANAL (Rio/Encanto) — o maior cervo do Brasil, que atravessa o alagado com a galhada florida. Estágio final.
 * Mantém da linha: pelo castanho-dourado, orelhonas, rabinho de forro branco, a flor rosa.
 * Cresce: pernas pretas compridas de andar na água · GALHADA aquática de quatro pontas por lado, com flores de
 * aguapé e gotas pendendo · peitoral creme · anéis d'água em volta dos cascos · focinho escuro de aro claro.
 */
import { criatura, animsQuadrupede, blob, tube, ring, par, m, lz, ls, lp, qz, type V3 } from './kits';
import { paletaVeado, corpoVeado, flor } from './099-catingueirinho';

function build() {
  const { rig, ref } = corpoVeado({ k: 1.3, cabeca: [0.19, 0.16, 0.155], alt: 0.5, pernaEscura: true, pescoco: 0.3 });
  // GALHADA: haste principal e três pontas, um osso por lado
  par((l, s) => {
    rig.bone('galhada_' + l, 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.02, 0.07 * s], [0, 0, 6]);
    const g = (pts: V3[], r: number) => tube(pts.map(([x, y, z]) => [x, y, z * s] as V3), (u) => r * (1 - u * 0.5), m(1), { seg: 10, radial: 8 });
    rig.add('galhada_' + l,
      g([[0, 0, 0], [-0.03, 0.16, 0.08], [-0.08, 0.32, 0.14], [-0.04, 0.46, 0.16]], 0.036),
      g([[-0.02, 0.1, 0.05], [0.08, 0.2, 0.08], [0.12, 0.3, 0.07]], 0.028),
      g([[-0.06, 0.26, 0.12], [0.04, 0.36, 0.2], [0.07, 0.46, 0.22]], 0.026),
      g([[-0.07, 0.3, 0.13], [-0.17, 0.38, 0.14], [-0.2, 0.48, 0.13]], 0.026));
    // gota pendendo e flor numa ponta
    rig.bone('gota_' + l, 'galhada_' + l, [0.12, 0.24, 0.07 * s]); rig.add('gota_' + l, blob([0.026, 0.04, 0.026], m.sombra(3), { seg: 8 }));
    // cascos e meias: anel d'água no chão
    rig.add('cabeca', blob([0.07, 0.02, 0.05], m(2), { pos: [0.14, 0.105, 0.09 * s], rot: [-12 * s, 0, -8], seg: 8 }));
  });
  flor(rig, 'flor', 'galhada_e', [0.07, 0.48, -0.22], 0.07);
  flor(rig, 'flor2', 'galhada_d', [-0.2, 0.5, 0.13], 0.06);
  flor(rig, 'flor3', 'cabeca', [ref.topo[0] + 0.02, ref.topo[1] + 0.04, 0], 0.05);
  // peitoral creme, aro claro no focinho
  rig.add('corpo', blob([0.09, 0.12, 0.13], m(1), { pos: [0.28, -0.03, 0], seg: 12 }));
  rig.add('cabeca', blob([0.03, 0.09, 0.1], m.luz(1), { pos: [ref.pontaFocinho[0] - 0.05, ref.pontaFocinho[1] + 0.01, 0], seg: 10 }));
  // anéis d'água em volta dos cascos (no chão)
  const an: [string, V3, number][] = [['agua1', [0.2, 0.012, 0], 0.2], ['agua2', [-0.2, 0.012, 0], 0.19]];
  for (const [nome, pos, r] of an) { rig.bone(nome, 'base', pos); rig.add(nome, ring(r, 0.02, m.sombra(3), { rot: [90, 0, 0] }), ring(r * 0.55, 0.016, m.luz(3), { rot: [90, 0, 0] })); }
  return rig;
}

const pinga = (i: number) => { const y: V3[] = [[0, 0, 0], [0, -0.03, 0], [0, -0.07, 0], [0, -0.12, 0]]; return lp([...y.slice(i), ...y.slice(0, i)]); };
const anims = animsQuadrupede({ u: 1.1, hPerna: 0.5, mole: 0.7 }, {
  idle: { gota_d: pinga(0), gota_e: pinga(2), agua1: ls([1, 1.08, 1.16, 1.05]), agua2: ls([1.16, 1.05, 1, 1.08]), galhada_d: lz([0, 1, 2, 0]), galhada_e: lz([0, 1, 2, 0]) },
  especial: { galhada_d: qz([0, 6, 10, -14, -4, 0]), galhada_e: qz([0, 6, 10, -14, -4, 0]) },
  desmaio: { agua1: [{ t: 0, s: 1, e: 'linear' }, { t: 1, s: 0.3, e: 'linear' }], agua2: [{ t: 0, s: 1, e: 'linear' }, { t: 1, s: 0.3, e: 'linear' }] },
});

export const cervoDoPantanal = criatura({
  num: 100, id: 'cervo-do-pantanal', nome: 'Cervo-do-Pantanal', porte: 'G', estagio: 'final', paleta: paletaVeado, build, anims,
  olho: { frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
