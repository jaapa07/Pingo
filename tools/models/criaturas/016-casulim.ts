/**
 * 016 · CASULIM (Inseto) — crisálida dourada pendurada num galho.
 * Mantém da linha: dourado, ameixa, o "olho de coruja" no flanco, os dois chifrinhos (agora na ponta de baixo).
 * Traços únicos: crisálida em gota pendurada por um fio de seda num galho arqueado · folha-telhado ·
 * anéis de gomo e pingos metálicos · olhar sonolento.
 * Anatomia: rig próprio (base → corpo no nó do fio; a crisálida balança como pêndulo).
 */
import { criatura, novoRig, olhos, movBase, somar, montar, blob, lathe, tube, ring, segmento, folha3d, calota, par, m, lz, qz, qp, qs, ls, type Mov, type Faixas } from './kits';
import { paletaBruxa, olhoCoruja } from './015-lagartim';

const H = 0.96; // altura do nó do fio

function build() {
  const rig = novoRig(H);
  // galho arqueado fincado no chão, com nó e folha-telhado
  rig.add('base', tube([[-0.34, 0, 0], [-0.4, 0.4, 0], [-0.32, 0.82, 0], [-0.12, 1.02, 0], [0.04, H + 0.02, 0]], (t) => 0.06 - t * 0.03, m(0), { seg: 20, radial: 10 }),
    blob([0.1, 0.05, 0.1], m.sombra(0), { pos: [-0.34, 0.03, 0], seg: 12 }),
    segmento([-0.39, 0.5, 0], [-0.52, 0.62, 0], 0.035, 0.02, m(0)));
  rig.bone('folha', 'base', [-0.1, 1.03, 0], [0, 0, -62]);
  rig.add('folha', folha3d(0.42, 0.3, m(2), { esp: 0.5, curva: 30 }), folha3d(0.2, 0.14, m.luz(2), { pos: [0, 0, 0], rot: [0, 0, 150], esp: 0.5 }));
  rig.add('base', folha3d(0.2, 0.14, m(2), { pos: [-0.52, 0.62, 0], rot: [0, 0, 60], esp: 0.5 }));
  // fio de seda e crisálida em gota
  rig.add('corpo', segmento([0, 0, 0], [0, -0.14, 0], 0.022, 0.03, m.luz(3)), blob([0.05, 0.035, 0.05], m.luz(3), { pos: [0, -0.01, 0], seg: 10 }));
  rig.add('corpo', lathe([[0.001, -0.8], [0.09, -0.76], [0.18, -0.64], [0.215, -0.5], [0.2, -0.36], [0.15, -0.24], [0.09, -0.15], [0.04, -0.1], [0.001, -0.08]], m(1), { seg: 24, deform: [(v) => { v.z *= 0.92; }] }));
  // estojo das asas: placa mais clara na frente; anéis de gomo em cima
  rig.add('corpo', calota([0.2, 0.3, 0.19], m.luz(1), { de: 0, ate: 62, pos: [0.03, -0.5, 0], rot: [0, 0, -100] }));
  rig.add('corpo', ring(0.125, 0.025, m.sombra(1), { pos: [0, -0.21, 0], rot: [90, 0, 0] }), ring(0.17, 0.025, m.sombra(1), { pos: [0, -0.29, 0], rot: [90, 0, 0] }));
  // pingos metálicos e chifrinhos na ponta
  for (const [x, y, z] of [[-0.12, -0.42, 0.15], [-0.13, -0.56, -0.14], [-0.05, -0.34, -0.16], [-0.02, -0.66, 0.15]] as const) rig.add('corpo', blob([0.03, 0.03, 0.03], m.luz(3), { pos: [x, y, z], seg: 8 }));
  par((_, s) => {
    rig.add('corpo', segmento([0.03, -0.76, 0.05 * s], [0.07, -0.86, 0.09 * s], 0.035, 0.02, m(0)));
    rig.add('corpo', ...olhoCoruja(0.065, [-0.06, -0.47, 0.2 * s], s));
  });
  olhos(rig, 'corpo', 0.036, [0.225, -0.55, 0.1]);
  return rig;
}

const membros: Partial<Record<Mov, Faixas>> = {
  entrada: { corpo: qz([-22, 16, -9, 4, 0]), folha: qz([10, -8, 4, 0, 0]) },
  idle: { corpo: lz([0, 4, 0, -4]), folha: lz([0, 2, 4, 1]) },
  fisico: { corpo: qz([12, 28, -38, -12, 0]), folha: qz([0, 6, -8, -2, 0]) },
  especial: { corpo: [...qz([0, 6, -6, 0, 0, 0]), ...qs([1, 0.92, 0.9, 1.16, 1.05, 1])], folha: qz([0, -6, -8, 12, 4, 0]) },
  dano: { corpo: qz([-28, -10, 0]), folha: qz([-12, -4, 0]) },
  // o fio cede e a crisálida desce até o chão
  desmaio: { corpo: [...qz([6, -6, 3, 10, 9]), ...qp([[0, 0, 0], [0, 0, 0], [0, -0.07, 0], [0, -0.15, 0], [0, -0.14, 0]])], folha: qz([0, 4, 10, 18, 16]) },
  status: { corpo: lz([-5, -2, 5, 2]), folha: lz([4, 6, 4, 2]) },
  andar: { corpo: lz([9, 0, -9, 0]) },
  parado: { corpo: lz([0, 5]) },
};
const anims = montar(somar(movBase({ u: 1, mole: 0.7 }), membros), {}, { comp: 1, larg: 1.15, frontal: 1.1, olho: 1.5 });
void ls;

export const casulim = criatura({
  num: 16, id: 'casulim', nome: 'Casulim', porte: 'P', estagio: 'medio', paleta: { ...paletaBruxa, extras: { w: '#ffffff', p: '#3a2440', f: '#f0b83a' } }, build, anims,
  olho: {
    frente: ['ffff', 'pppp', 'pwpp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
