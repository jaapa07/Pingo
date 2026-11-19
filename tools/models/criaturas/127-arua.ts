/**
 * 127 · ARUÁ (Rio/Pedra) — caramujo-aruá do brejo, que fecha a porta da concha e dorme na seca.
 * Traços únicos: concha bojuda dourado-oliva em espiral com faixas · cacho de OVOS cor-de-rosa grudado na concha ·
 * antenas compridas · pé largo cinza-azulado com barra clara · seixos de pedra incrustados (o tipo Pedra).
 * Anatomia própria (não há kit de caramujo): `caramujo` + `animsCaramujo`, reutilizadas pelo Aruazão.
 */
import { criatura, novoRig, olhos, segmento, blob, ring, par, m, movBase, somar, montar, lz, qz, lr, qr, ls, qs, flattenBelow, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi } from './kits';

export const paletaArua = {
  rampas: [
    ['#34305e', '#66709c', '#b0c0dc'], // 0 corpo cinza-azulado
    ['#6c4426', '#bc8a30', '#f0d470'], // 1 concha dourado-oliva
    ['#4c4658', '#928c9a', '#d8d4d4'], // 2 pedra
    ['#b23c74', '#f284aa', '#ffd4de'], // 3 ovos cor-de-rosa
  ] as [string, string, string][],
  contorno: '#2a1e3a',
  extras: { w: '#ffffff', p: '#221a34', f: '#66709c' },
};

export interface CaramujoP { /** semi-eixos do pé */ pe: V3; /** cabeça */ cabeca: V3; antena: number; /** raio da volta maior da concha e largura (Z) */ concha: number; larg: number; olho: number }

/** Monta o caramujo. Ossos: corpo (pé) → cabeca → antena_d/e · corpo → rabo · corpo → concha. Devolve o centro da volta maior (espaço de `concha`). */
export function caramujo(p: CaramujoP): { rig: Rig; centro: V3 } {
  const [px, py, pz] = p.pe, [hx, hy, hz] = p.cabeca, R = p.concha, W = p.larg;
  const rig = novoRig(py);
  rig.add('corpo', blob([px, py, pz], m(0), { deform: [flattenBelow(-py * 0.5, 0.9)] }), blob([px * 1.04, py * 0.36, pz * 1.06], m.luz(0), { pos: [0, -py * 0.6, 0], seg: 20 }));
  rig.bone('rabo', 'corpo', [-px * 0.7, 0, 0]);
  rig.add('rabo', blob([px * 0.5, py * 0.7, pz * 0.6], m(0), { pos: [-px * 0.3, -py * 0.1, 0], seg: 16, deform: [flattenBelow(-py * 0.5, 0.9)] }));
  rig.bone('cabeca', 'corpo', [px * 0.74, py * 1.3, 0], [0, 0, 10]);
  rig.add('cabeca', segmento([-hx * 1.1, -hy * 1.0, 0], [0, 0, 0], hy * 0.95, hy * 0.9, m(0)), blob([hx, hy, hz], m(0), { pos: [hx * 0.3, hy * 0.1, 0] }));
  par((l, s) => {
    // lábios em dois gomos e antenas compridas
    rig.add('cabeca', blob([hx * 0.4, hy * 0.36, hz * 0.42], m.luz(0), { pos: [hx * 1.05, -hy * 0.4, hz * 0.42 * s], seg: 12 }));
    rig.bone('antena_' + l, 'cabeca', [hx * 0.5, hy * 0.8, hz * 0.5 * s], [-16 * s, 0, -20]);
    rig.add('antena_' + l, segmento([0, 0, 0], [0, p.antena, 0], hy * 0.3, hy * 0.2, m(0)), blob([hy * 0.3, hy * 0.3, hy * 0.3], m.luz(0), { pos: [0, p.antena, 0], seg: 8 }));
  });
  olhos(rig, 'cabeca', p.olho, [hx * 0.86, hy * 0.36, hz * 0.7]);
  // concha: volta maior, volta do meio e ápice, subindo para trás; espiral desenhada nas duas faces
  const c: V3 = [0, R * 0.92, 0];
  rig.bone('concha', 'corpo', [-px * 0.22, py * 0.5, 0], [0, 0, 12]);
  rig.add('concha', blob([R, R, W], m(1), { pos: c }));
  for (const s of [1, -1]) rig.add('concha',
    // faces da espiral: disco claro, sulco em arco e o ápice saltado
    blob([R * 0.8, R * 0.8, W * 0.3], m.luz(1), { pos: [c[0], c[1], W * 0.78 * s], seg: 20, castShadow: false }),
    ring(R * 0.5, R * 0.1, m.sombra(1), { pos: [c[0] - R * 0.04, c[1] + R * 0.02, W * 0.98 * s], arc: 280, rot: [0, 0, 120] }),
    blob([R * 0.22, R * 0.22, W * 0.24], m(1), { pos: [c[0] - R * 0.04, c[1] + R * 0.02, W * 1.02 * s], seg: 10, castShadow: false }));
  // quilha escura pelo meio da volta e a boca da concha com beiço claro
  rig.add('concha', ring(R * 1.0, R * 0.06, m.sombra(1), { pos: c, arc: 250, rot: [0, 0, -20] }));
  rig.add('concha', blob([R * 0.26, R * 0.42, W * 0.9], m.luz(1), { pos: [c[0] + R * 0.86, c[1] - R * 0.5, 0], rot: [0, 0, 24], seg: 14 }));
  return { rig, centro: c };
}

export function animsCaramujo(o: BaseP & { mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  const ant = (q: typeof qz, v: number[]): Faixas => ({ antena_d: q(v), antena_e: q(v.map((x) => x * 0.7)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { cabeca: [...qs([0.3, 0.6, 1.15, 0.95, 1]), ...qz([-20, 0, 10, -3, 0])], concha: qz([14, -8, 5, -2, 0]), ...ant(qz, [-40, 20, -12, 4, 0]) },
    idle: { cabeca: lz([0, 3, 6, 2]), concha: lz([0, -1, -3, -1]), ...ant(lz, [0, 8, 14, 4]), rabo: lr([[0, 0, 0], [0, 5, 0], [0, 0, 0], [0, -5, 0]]) },
    fisico: { cabeca: [...qz([10, 20, -22, -8, 0]), ...qs([0.9, 0.8, 1.18, 1.06, 1])], concha: qz([-4, -10, 12, 4, 0]), ...ant(qz, [10, 24, -30, -10, 0]) },
    // esconde-se na concha, treme e sai de uma vez
    especial: { cabeca: [...qs([0.8, 0.45, 0.4, 1.25, 1.06, 1]), ...qz([0, -10, -10, 16, 5, 0])], concha: [...qz([4, 10, 6, -14, -4, 0]), ...qs([1, 1.04, 1.08, 0.94, 0.99, 1])], ...ant(qz, [-10, -30, -30, 30, 10, 0]) },
    dano: { cabeca: [...qs([0.7, 0.88, 1]), ...qz([16, 6, 0])], concha: qz([12, 4, 0]), ...ant(qz, [-30, -10, 0]) },
    desmaio: { cabeca: [...qs([1, 0.85, 0.6, 0.38, 0.4]), ...qz([0, -8, -16, -22, -20])], concha: qz([0, 6, 14, 20, 19]), ...ant(qz, [0, -14, -30, -44, -42]), rabo: qs([1, 0.95, 0.85, 0.75, 0.76]) },
    status: { cabeca: [...lz([-12, -16, -12, -8]), ...ls([0.8, 0.76, 0.8, 0.84])], ...ant(lz, [-24, -30, -24, -18]), concha: lz([3, 5, 3, 1]) },
    andar: { corpo: ls([[0.8, 1, 1.3], [0.86, 0.96, 1.3], [0.8, 1, 1.3], [0.74, 1.04, 1.3]]), cabeca: lz([0, 6, 0, -4]), ...ant(lz, [0, 10, 0, -8]), concha: lz([0, -4, 0, 4]) },
    parado: { ...ant(lz, [0, 10]), cabeca: lz([0, 4]) },
  };
  return montar(somar(movBase({ mole: 0.7, ...o }), membros, extra), {}, { comp: 0.8, larg: 1.3, cabeca: 1.25, frontal: 1.2, olho: 1.5, ...o.mapa });
}

function build() {
  const { rig, centro: c } = caramujo({ pe: [0.32, 0.085, 0.17], cabeca: [0.14, 0.125, 0.13], antena: 0.2, concha: 0.23, larg: 0.15, olho: 0.034 });
  // cacho de OVOS cor-de-rosa grudado no alto da concha
  rig.bone('ovos', 'concha', [c[0] - 0.04, c[1] + 0.22, 0.0]);
  const ov: V3[] = [[0, 0, 0.05], [0.05, 0.01, -0.02], [-0.03, 0.03, -0.04], [0.02, 0.06, 0.02], [0.07, -0.03, 0.06]];
  ov.forEach((pos, i) => rig.add('ovos', blob([0.045, 0.045, 0.045], i % 2 ? m.luz(3) : m(3), { pos, seg: 10 })));
  // seixos de pedra incrustados
  const px: [V3, number][] = [[[c[0] + 0.17, c[1] + 0.14, 0.06], 0.05], [[c[0] - 0.2, c[1] + 0.1, 0.07], 0.045], [[c[0] + 0.19, c[1] + 0.12, -0.07], 0.045], [[c[0] - 0.22, c[1] - 0.04, -0.06], 0.05], [[c[0] + 0.08, c[1] + 0.22, 0], 0.04]];
  px.forEach(([pos, r], i) => rig.add('concha', blob([r, r * 0.8, r], i % 2 ? m.luz(2) : m(2), { pos, seg: 7 })));
  return rig;
}

const anims = animsCaramujo({ u: 0.6 }, { idle: { ovos: ls([1, 1.03, 1.06, 1.02]) } });

export const arua = criatura({
  num: 127, id: 'arua', nome: 'Aruá', porte: 'P', estagio: 'basico', paleta: paletaArua, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
