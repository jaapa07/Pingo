/**
 * 058 · CAPIVARONA (Comum/Rio) — capivara zen: nada a tira do sério, e os passarinhos sabem disso. Estágio final.
 * Mantém da linha: barril castanho sem rabo, focinho quadrado escuro, olho alto de sossego, a folha de chapéu, as gotas.
 * Cresce: corpanzil · dois passarinhos amarelos pousados (cocuruto e garupa) · dentões brancos ·
 * pelo eriçado no lombo · papada · folha maior com flor aberta.
 */
import { criatura, animsQuadrupede, blob, tufo, bico, pena, par, m, lz, lp, qp, type V3 } from './kits';
import { paletaCapivara, corpoCapivara, chapeuRegia, pingo, escorre } from './057-capivarinha';

function passaro(rig: ReturnType<typeof corpoCapivara>['rig'], nome: string, pai: string, pos: V3, k: number, vira: number) {
  rig.bone(nome, pai, pos, [0, vira, 0]);
  rig.add(nome,
    blob([0.075 * k, 0.065 * k, 0.06 * k], m.plano(3), { pos: [0, 0.065 * k, 0], seg: 12 }),
    blob([0.055 * k, 0.05 * k, 0.05 * k], m.plano(3), { pos: [0.06 * k, 0.13 * k, 0], seg: 12 }),
    blob([0.04 * k, 0.025 * k, 0.05 * k], m.luz(3), { pos: [0.03 * k, 0.035 * k, 0], seg: 8 }),
    bico(0.05 * k, 0.022 * k, m(1), { pos: [0.1 * k, 0.125 * k, 0] }),
    pena(0.09 * k, 0.045 * k, m(1), { esp: 0.02 * k, pos: [-0.05 * k, 0.07 * k, 0], rot: [0, 0, -24] }));
  par((_, s) => rig.add(nome,
    blob([0.045 * k, 0.03 * k, 0.015 * k], m(1), { pos: [-0.01 * k, 0.075 * k, 0.055 * k * s], rot: [0, 0, -20], seg: 8 }),
    blob([0.014 * k, 0.016 * k, 0.012 * k], m.sombra(1), { pos: [0.085 * k, 0.14 * k, 0.04 * k * s], seg: 6, castShadow: false })));
}

function build() {
  const { rig, ref } = corpoCapivara({ k: 1.45, tronco: [0.43, 0.31, 0.3], cabeca: [0.22, 0.19, 0.19], alt: 0.18 });
  chapeuRegia(rig, [ref.topo[0] - 0.08, ref.topo[1] + 0.0, 0.03], 0.17, 12);
  passaro(rig, 'passaro1', 'folha', [0.02, 0.01, -0.03], 1.25, 20);
  passaro(rig, 'passaro2', 'corpo', [-0.24, 0.3, 0.04], 1.15, 160);
  pingo(rig, 'pingo1', 'cabeca', [0.06, 0.1, 0.21], 0.032);
  pingo(rig, 'pingo2', 'corpo', [-0.3, 0.2, 0.28], 0.036);
  pingo(rig, 'pingo3', 'corpo', [0.12, 0.16, 0.3], 0.03);
  // dentões, papada e pelo eriçado
  par((_, s) => rig.add('cabeca', blob([0.022, 0.045, 0.026], m.luz(3), { pos: [0.33, -0.13, 0.03 * s], seg: 8 })));
  rig.add('pescoco', blob([0.13, 0.12, 0.17], m.luz(0), { pos: [0.08, -0.12, 0], seg: 14 }));
  for (const [x, t] of [[0.18, -20], [0.02, 0], [-0.4, 44]] as const) rig.add('corpo', tufo(2, 0.1, 0.05, m.sombra(0), { pos: [x, 0.29 - Math.abs(x) * 0.2, 0], rot: [0, 0, t], abre: 20 }));
  return rig;
}

const pulinho: V3[] = [[0, 0, 0], [0, 0.03, 0], [0, 0, 0], [0, 0, 0]];
const anims = animsQuadrupede({ u: 0.9, hPerna: 0.18, mole: 0.6, passo: 20 }, {
  idle: { ...escorre(['pingo1', 'pingo2', 'pingo3']), passaro1: lp(pulinho), passaro2: [...lp([pulinho[2], pulinho[3], pulinho[0], pulinho[1]]), ...lz([0, 0, 8, 0])] },
  // os passarinhos levantam voo no susto e pousam de volta
  dano: { passaro1: qp([[0, 0.12, 0], [0, 0.05, 0], [0, 0, 0]]), passaro2: qp([[0, 0.14, 0], [0, 0.06, 0], [0, 0, 0]]) },
  especial: { passaro1: qp([[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.16, 0], [0, 0.06, 0], [0, 0, 0]]), passaro2: qp([[0, 0, 0], [0, 0.02, 0], [0, 0.03, 0], [0, 0.12, 0], [0, 0.05, 0], [0, 0, 0]]) },
});

export const capivarona = criatura({
  num: 58, id: 'capivarona', nome: 'Capivarona', porte: 'G', estagio: 'final', paleta: paletaCapivara, build, anims,
  olho: {
    frente: ['fffff', 'ppppp', 'ppwpp', '.ppp.', '.....'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fffff', '.....'],
    mapa: ['p', 'p'],
  },
});
