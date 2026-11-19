/**
 * 070 · JAGUATIRICÃO (Comum/Assombro) — jaguatirica de rosetas que somem. Estágio final.
 * Mantém da linha: orelhas grandes de pinta clara, listras na testa, cauda anelada em gancho, olho verde-água.
 * Cresce: a garupa e as pernas traseiras desbotam em verde-água espectral · três rosetas-anel se soltam do
 * corpo e flutuam acima do dorso · ponta da cauda em fogo-fátuo · colar de pelo creme e presas.
 */
import { criatura, animsQuadrupede, blob, calota, chama, ring, par, m, lz, lp, qz, ls, type V3 } from './kits';
import { paletaJaguatirica, corpoJaguatirica, pintas, dosDois } from './069-jaguatirim';

function build() {
  const tr: V3 = [0.36, 0.2, 0.18];
  const { rig, ref } = corpoJaguatirica({ k: 1.3, tronco: tr, pernas: 0.38, cabeca: [0.22, 0.2, 0.21], orelha: 0.25, cauda: 0.8 });
  pintas(rig, 'corpo', [0, 0, 0], tr, dosDois([[0.6, 48], [0.28, 36], [0.0, 50], [0.42, 86, 0.9], [0.1, 90, 0.9], [0.3, 0, 0.8], [0.0, 0, 0.8]]), 0.05, m.plano(1), m.plano(0), 1.4);
  // metade de trás espectral: garupa, coxas e canelas em verde-água, com rosetas apagadas
  rig.add('corpo', calota([0.375, 0.21, 0.19], m(3), { de: 0, ate: 62, rot: [0, 0, 90] }));
  pintas(rig, 'corpo', [0, 0, 0], [0.38, 0.21, 0.19], dosDois([[-0.55, 44], [-0.78, 70], [-0.6, 0]]), 0.045, m.luz(3), undefined, 1.4);
  par((l) => {
    rig.add('perna_t' + l, blob([0.09, 0.14, 0.085], m(3), { pos: [0, -0.07, 0] }));
    rig.add('canela_t' + l, blob([0.07, 0.13, 0.065], m.sombra(3), { pos: [0.02, -0.1, 0] }), chama(0.14, 0.06, m.luz(3), { pos: [-0.03, -0.1, 0], rot: [0, 0, 50] }));
  });
  // rosetas soltas flutuando
  const soltas: [string, V3, number][] = [['roseta1', [-0.08, 0.36, 0.06], 0.075], ['roseta2', [-0.36, 0.44, -0.05], 0.06], ['roseta3', [-0.6, 0.3, 0.04], 0.048]];
  for (const [nome, pos, r] of soltas) { rig.bone(nome, 'corpo', pos); rig.add(nome, ring(r, r * 0.42, m.plano(1), { rot: [0, 40, 0] }), blob([r * 0.5, r * 0.5, r * 0.3], m.luz(3), { rot: [0, 40, 0], seg: 8 })); }
  // fogo-fátuo na ponta da cauda
  rig.bone('fatuo', 'cauda4', [-0.2, 0, 0], [0, 0, 70]);
  rig.add('fatuo', chama(0.3, 0.11, m(3), { curva: 16 }), chama(0.17, 0.065, m.luz(3), { scale: [1, 1, 1.9] }));
  // colar de pelo creme e presas
  rig.add('pescoco', blob([0.1, 0.13, 0.15], m(2), { pos: [0.1, -0.02, 0], rot: [0, 0, -30] }));
  const pf = ref.pontaFocinho as V3;
  par((_, s) => rig.add('cabeca', blob([0.018, 0.045, 0.018], m.luz(2), { pos: [pf[0] - 0.03, pf[1] - 0.07, 0.04 * s], seg: 8 })));
  return rig;
}

const anims = animsQuadrupede({ u: 1.1, hPerna: 0.38, mole: 0.8, cauda: 0.8 }, {
  todas: { roseta1: lp([[0, 0, 0], [0, 0.02, 0], [0, 0.035, 0], [0, 0.015, 0]]), roseta2: lp([[0, 0.03, 0], [0, 0.01, 0], [0, 0, 0], [0, 0.02, 0]]), roseta3: lp([[0, 0.01, 0], [0, 0.03, 0], [0, 0.02, 0], [0, 0, 0]]), fatuo: ls([[1, 1, 1], [0.9, 1.18, 0.9], [1.06, 0.88, 1.06], [0.94, 1.1, 0.94]]) },
  idle: { cauda3: lz([0, -8, -14, -5]) },
  especial: { cauda3: qz([0, 10, 14, -20, -8, 0]) },
});

export const jaguatiricao = criatura({
  num: 70, id: 'jaguatiricao', nome: 'Jaguatiricão', porte: 'M', estagio: 'final', paleta: paletaJaguatirica, build, anims,
  olho: {
    frente: ['pp...', 'paap.', '.awpp', '.aapp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
