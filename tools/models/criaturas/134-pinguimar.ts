/**
 * 134 · PINGUIMAR (Geada/Rio) — pinguim surfista. Estágio final.
 * Mantém da linha: costas ardósia, duas faixas no peito, máscara branca em arco, pés rosados, topete de gelo.
 * Cresce: prancha de lasca de gelo com quilha e risca rosada · onda enrolando atrás com crista de espuma ·
 * topete virado em franja de surfista · nadadeiras longas abertas em equilíbrio · colar de conchinhas.
 */
import { criatura, animsAve, blob, slab, tube, spike, espuma, par, m, lz, qz, ls, D2R } from './kits';
import { paletaPinguim, pinguimBase } from './133-pinguinzinho';

function build() {
  const { rig, ref } = pinguimBase(1.25, 1.12);
  // sobe o corpo para cima da prancha e inclina como quem desce a onda
  rig.bones.corpo.position.y += 0.07;
  rig.bones.corpo.rotation.z = -8 * D2R;
  rig.bones.asa_d.rotation.x = -0.95; rig.bones.asa_e.rotation.x = 0.7;
  rig.bones.asa_e.rotation.z += 0.5;
  // PRANCHA de gelo: lasca pontuda, risca rosada e quilha
  rig.bone('prancha', 'base', [0, 0.045, 0], [0, 0, 4]);
  rig.add('prancha',
    slab([[0.62, 0], [0.42, 0.17], [0, 0.2], [-0.42, 0.16], [-0.52, 0], [-0.42, -0.16], [0, -0.2], [0.42, -0.17]], 0.035, m(2), { rot: [90, 0, 0] }),
    blob([0.5, 0.012, 0.03], m.plano(3), { pos: [0.02, 0.03, 0], seg: 12, castShadow: false }),
    slab([[0, 0], [-0.14, -0.1], [-0.1, 0]], 0.03, m.sombra(2), { pos: [-0.36, -0.02, 0], smooth: false }));
  for (const z of [-0.12, 0.12]) rig.add('prancha', blob([0.07, 0.012, 0.025], m.luz(2), { pos: [0.34, 0.03, z], seg: 10, castShadow: false }));
  // ONDA enrolando atrás, com crista de espuma
  rig.bone('onda', 'base', [-0.5, 0.0, 0]);
  rig.add('onda',
    tube([[-0.02, 0, 0], [-0.2, 0.26, 0], [-0.12, 0.52, 0], [0.1, 0.6, 0], [0.24, 0.47, 0]], (t) => 0.17 * (1 - t * 0.62), m(2), { scale: [1, 1, 1.7], seg: 24 }),
    blob([0.24, 0.08, 0.3], m.sombra(2), { pos: [0.04, 0.03, 0] }));
  rig.bone('espuma1', 'onda', [0.26, 0.45, 0.04]); rig.add('espuma1', espuma(0.085, m.luz(1)));
  rig.bone('espuma2', 'onda', [0.12, 0.64, -0.1]); rig.add('espuma2', espuma(0.06, m.luz(1)));
  rig.bone('espuma3', 'onda', [0.2, 0.52, 0.14]); rig.add('espuma3', espuma(0.055, m.luz(1)));
  // franja de surfista: pingentes maiores, tombados para trás
  rig.bone('topete', 'cabeca', [ref.topo[0] + 0.05, ref.topo[1] - 0.04, 0], [0, 0, 40]);
  rig.add('topete',
    spike(0.2, 0.055, m.luz(2), { rot: [0, 0, -34], curve: -0.3 }), spike(0.28, 0.065, m(2), { rot: [0, 0, 6], curve: -0.3 }),
    spike(0.22, 0.055, m.luz(2), { rot: [0, 0, 38], curve: -0.2 }), spike(0.14, 0.05, m(2), { rot: [0, 0, 70] }));
  // colar de conchinhas
  for (let i = 0; i < 5; i++) {
    const a = (-60 + i * 30) * D2R;
    rig.add('pescoco', blob([0.035, 0.035, 0.035], i % 2 ? m.luz(2) : m.plano(3), { pos: [Math.cos(a) * 0.24, -0.1 - Math.cos(a) * 0.03, Math.sin(a) * 0.2], seg: 10 }));
  }
  // pontas das nadadeiras com geada
  par((l, s) => rig.add('asa2_' + l, blob([0.07, 0.05, 0.03], m.luz(2), { pos: [-0.09, -0.01, 0.01 * s], seg: 10 })));
  return rig;
}

const anims = animsAve({ u: 1.0, hPerna: 0.09, mole: 0.9 }, {
  todas: { '?espuma1': ls([1, 1.15, 0.9, 1.06]), '?espuma2': ls([1.1, 0.92, 1.06, 1]), '?espuma3': ls([0.92, 1.06, 1, 1.14]) },
  idle: { topete: lz([0, 5, 9, -4]), prancha: lz([4, 6, 4, 2]), onda: ls([1, [1, 1.05, 1], [1, 1.08, 1], [1, 1.03, 1]]) },
  fisico: { prancha: qz([4, -4, 14, 8, 4]) },
  especial: { topete: qz([0, 12, 16, -26, -8, 0]), onda: [{ t: 0, s: 1 }, { t: 0.4, s: 0.85 }, { t: 0.6, s: [1.1, 1.35, 1.1] }, { t: 1, s: 1 }] },
  dano: { topete: qz([26, 10, 0]), prancha: qz([-8, -2, 4]) },
  desmaio: { onda: [{ t: 0, s: 1 }, { t: 0.5, s: [1, 0.5, 1] }, { t: 1, s: [1, 0.2, 1] }] },
});

export const pinguimar = criatura({
  num: 134, id: 'pinguimar', nome: 'Pinguimar', porte: 'M', estagio: 'final', paleta: paletaPinguim, build, anims,
  olho: {
    frente: ['www..', 'wpwp.', 'wpppp', '.ppp.'],
    fechado: ['fffff', 'wfffw', 'fwwwf', 'fffff'],
    mapa: ['w', 'p'],
  },
});
