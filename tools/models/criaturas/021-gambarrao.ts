/**
 * 021 · GAMBARRÃO (Comum/Veneno) — gambá adulto que carrega a ninhada nas costas. Estágio final.
 * Mantém da linha: cara branca riscada, orelhas brancas de miolo rosa, rabo rosa enrolado, fedor lilás-limão.
 * Cresce: três filhotes agarrados no lombo (cada um com a própria carinha) · presas à mostra ·
 * juba grisalha arrepiada na cernelha · nuvem fedida grande saindo de trás.
 */
import { criatura, animsQuadrupede, blob, tufo, par, m, lz, qz, qs, qp, type V3 } from './kits';
import { paletaGamba, corpoGamba, fedor, fedorAnda } from './020-gambazinho';

function build() {
  const { rig, ref } = corpoGamba({ k: 1.3, cabeca: [0.23, 0.2, 0.2], rabo: 0.95, orelha: 0.15 });
  // lombo escuro e juba arrepiada
  rig.add('corpo', blob([0.3, 0.08, 0.14], m.sombra(0), { pos: [-0.02, 0.2, 0], seg: 14 }));
  rig.bone('juba', 'corpo', [ref.cernelha[0] - 0.02, ref.cernelha[1] - 0.02, 0], [0, 0, -24]);
  rig.add('juba', tufo(3, 0.15, 0.06, m(0), { abre: 34 }));
  // presas e sobrancelhas bravas
  par((_, s) => {
    rig.add('cabeca', blob([0.016, 0.04, 0.016], m.luz(1), { pos: [0.3, -0.13, 0.05 * s], seg: 8 }));
    rig.add('cabeca', blob([0.07, 0.022, 0.05], m.sombra(0), { pos: [0.21, 0.115, 0.115 * s], rot: [-20 * s, 0, -24], seg: 8 }));
  });
  // NINHADA: três filhotes no lombo
  const filhotes: [string, V3, number, number][] = [['filhote1', [0.12, 0.27, 0.05], 1, 14], ['filhote2', [-0.07, 0.3, -0.06], 0.9, -8], ['filhote3', [-0.24, 0.25, 0.06], 0.82, 20]];
  for (const [nome, pos, e, vira] of filhotes) {
    rig.bone(nome, 'corpo', pos, [0, vira, 0]);
    rig.add(nome,
      blob([0.09 * e, 0.07 * e, 0.075 * e], m(0), { pos: [-0.03 * e, 0, 0], seg: 14 }),
      blob([0.07 * e, 0.065 * e, 0.068 * e], m(1), { pos: [0.07 * e, 0.045 * e, 0], seg: 14 }),
      blob([0.045 * e, 0.03 * e, 0.03 * e], m(1), { pos: [0.13 * e, 0.025 * e, 0], seg: 10 }),
      blob([0.018 * e, 0.018 * e, 0.018 * e], m.plano(2), { pos: [0.175 * e, 0.03 * e, 0], seg: 8 }));
    par((_, s) => rig.add(nome,
      blob([0.02 * e, 0.035 * e, 0.03 * e], m.plano(2), { pos: [0.04 * e, 0.11 * e, 0.05 * e * s], seg: 8 }),
      blob([0.014, 0.016, 0.012], m.sombra(0), { pos: [0.11 * e, 0.06 * e, 0.055 * e * s], seg: 6, castShadow: false })));
  }
  fedor(rig, 'fedor1', [-0.56, 0.36, 0.12], 0.1);
  fedor(rig, 'fedor2', [-0.46, 0.6, -0.14], 0.07);
  fedor(rig, 'fedor3', [-0.66, 0.62, 0.02], 0.045);
  return rig;
}

const pula = (a: number): V3[] => [[0, 0, 0], [0, a, 0], [0, a * 0.3, 0], [0, 0, 0]];
const anims = animsQuadrupede({ u: 0.85, hPerna: 0.2, mole: 0.9, cauda: 0.5 }, {
  idle: { ...fedorAnda(['fedor1', 'fedor2', 'fedor3']), juba: lz([0, 4, 8, 2]), filhote1: lz([0, 0, 6, 0]), filhote3: lz([0, -6, 0, 0]) },
  status: fedorAnda(['fedor1', 'fedor2', 'fedor3']),
  // os filhotes pulam das costas na hora do golpe
  fisico: { filhote1: qp([[0, 0, 0], [0, 0.02, 0], [0.14, 0.12, 0], [0.06, 0.04, 0], [0, 0, 0]]), filhote2: qp([[0, 0, 0], [0, 0.03, 0], [0.08, 0.16, 0], [0.03, 0.05, 0], [0, 0, 0]]), juba: qz([8, 14, -16, -6, 0]) },
  especial: { fedor1: qs([1, 1.4, 1.8, 2.4, 1.5, 1]), fedor2: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), fedor3: qs([1, 1.6, 2, 2.8, 1.6, 1]), filhote2: qp([...pula(0.06), [0, 0.03, 0], [0, 0, 0]]) },
  dano: { filhote1: qp([[0, 0.06, 0], [0, 0.02, 0], [0, 0, 0]]), filhote3: qp([[0, 0.08, 0], [0, 0.03, 0], [0, 0, 0]]) },
});

export const gambarrao = criatura({
  num: 21, id: 'gambarrao', nome: 'Gambarrão', porte: 'M', estagio: 'final', paleta: paletaGamba, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
