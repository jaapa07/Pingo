/**
 * 119 · HIPOCAMPIM (Rio/Lenda) — cavalo-marinho filhote, o "dragãozinho" dos bancos de capim-marinho.
 * Traços únicos: postura EM PÉ com a cauda enrolada em caracol para a frente · focinho em canudo ·
 * coroinha de três pontas turquesa · nadadeira dorsal em leque · barriga em gomos creme · bolhas.
 * Anatomia própria (não há kit de cavalo-marinho): `cavaloMarinho` + `animsCavalo`, reutilizadas pelo Hipocampo.
 */
import { criatura, novoRig, cauda, olhos, segmento, blob, tufo, par, m, movBase, somar, montar, lr, lz, qz, qr, qp, ls, lp, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi } from './kits';

export const paletaHipo = {
  rampas: [
    ['#a04a34', '#ec9a38', '#ffdc7c'], // 0 couro âmbar
    ['#b58a72', '#f7e2b4', '#fffbe8'], // 1 gomos creme da barriga
    ['#1c5f80', '#36bcc0', '#b6f6e2'], // 2 turquesa das nadadeiras, coroa e bolhas
    ['#255c3c', '#52aa48', '#c2ec78'], // 3 alga
  ] as [string, string, string][],
  contorno: '#3a1c36',
  extras: { w: '#ffffff', p: '#2c1430', f: '#ec9a38' },
};

const PERFIL = 30;
export interface CavaloP { /** semi-eixos da barriga */ barriga: V3; flutua: number; /** cabeça e canudo */ cabeca: V3; canudo: number; cauda: { segs: number; len: number; r: number; curva: number }; olho: number }

/** Monta o cavalo-marinho. Ossos: tronco → pescoco → cabeca · tronco → cauda1..N · tronco → dorsal · cabeca → nad_d/e. */
export function cavaloMarinho(p: CavaloP): { rig: Rig; fim: string; seg: number } {
  const [bx, by, bz] = p.barriga, [hx, hy, hz] = p.cabeca;
  const rig = novoRig(p.flutua);
  // `giro` põe o bicho quase de perfil para as câmeras de batalha (o canudo e o caracol só leem de lado); o mapa desfaz
  rig.bone('giro', 'corpo', [0, 0, 0], [0, -PERFIL, 0]);
  rig.bone('tronco', 'giro', [0, 0, 0], [0, 0, -6]);
  rig.add('tronco', blob([bx, by, bz], m(0)), blob([bx * 0.72, by * 0.86, bz * 0.8], m(1), { pos: [bx * 0.42, -by * 0.04, 0] }));
  // gomos da barriga: três cintas mais escuras
  for (const y of [-0.45, 0, 0.45]) rig.add('tronco', blob([bx * 0.5, by * 0.07, bz * 0.72], m.sombra(1), { pos: [bx * 0.72, by * y - by * 0.04, 0], seg: 12, castShadow: false }));
  // espinhaço: calombos pelas costas
  for (const y of [-0.5, 0, 0.5]) rig.add('tronco', blob([bx * 0.26, by * 0.2, bz * 0.3], m.luz(0), { pos: [-bx * 0.86, by * y, 0], seg: 10 }));
  rig.bone('pescoco', 'tronco', [bx * 0.0, by * 0.72, 0], [0, 0, 10]);
  rig.add('pescoco', segmento([0, 0, 0], [bx * 0.3, by * 0.8, 0], bx * 0.74, bx * 0.62, m(0)), blob([bx * 0.4, by * 0.4, bz * 0.5], m(1), { pos: [bx * 0.55, by * 0.3, 0], seg: 14 }));
  rig.bone('cabeca', 'pescoco', [bx * 0.3, by * 0.86, 0], [0, 0, -34]);
  rig.add('cabeca', blob([hx, hy, hz], m(0), { pos: [hx * 0.2, hy * 0.1, 0] }));
  // canudo com a boquinha aberta em trombeta
  rig.add('cabeca', segmento([hx * 0.8, -hy * 0.1, 0], [hx * 0.8 + p.canudo, -hy * 0.3, 0], hy * 0.4, hy * 0.3, m(0)),
    blob([hy * 0.26, hy * 0.42, hy * 0.42], m.luz(0), { pos: [hx * 0.8 + p.canudo, -hy * 0.3, 0], seg: 12 }),
    blob([hy * 0.16, hy * 0.26, hy * 0.26], m.sombra(1), { pos: [hx * 0.8 + p.canudo + hy * 0.22, -hy * 0.3, 0], seg: 8 }));
  // bochecha clara e sobrancelha em calombo
  par((_, s) => rig.add('cabeca', blob([hx * 0.4, hy * 0.36, hz * 0.3], m(1), { pos: [hx * 0.5, -hy * 0.34, hz * 0.72 * s], seg: 12 })));
  olhos(rig, 'cabeca', p.olho, [hx * 0.52, hy * 0.26, hz * 0.84]);
  par((l, s) => {
    rig.bone('nad_' + l, 'cabeca', [-hx * 0.5, -hy * 0.1, hz * 0.8 * s], [0, 30 * s, 0]);
    rig.add('nad_' + l, blob([hx * 0.5, hy * 0.6, hz * 0.14], m(2), { pos: [-hx * 0.4, 0, 0], seg: 12, castShadow: false }));
  });
  rig.bone('dorsal', 'tronco', [-bx * 0.8, by * 0.1, 0]);
  rig.add('dorsal', blob([bx * 0.62, by * 0.62, bz * 0.16], m(2), { pos: [-bx * 0.44, 0, 0], seg: 14, castShadow: false }));
  for (const y of [-0.3, 0.05, 0.4]) rig.add('dorsal', blob([bx * 0.5, by * 0.07, bz * 0.2], m.luz(2), { pos: [-bx * 0.5, by * y, 0], rot: [0, 0, -y * 40], seg: 8, castShadow: false }));
  const c = cauda(rig, 'tronco', [-bx * 0.1, -by * 0.7, 0], { segs: p.cauda.segs, len: p.cauda.len, r0: p.cauda.r, r1: p.cauda.r * 0.36, ang: -78, curva: p.cauda.curva, mat: m(0) });
  return { rig, fim: c.ultimo, seg: c.seg };
}

export function animsCavalo(o: BaseP & { flutua: number; segs: number; mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  // enrola(v): graus a mais de caracol em cada osso da cauda, um valor por quadro (− aperta, + solta)
  const enrola = (q: typeof qz, v: number[]) => Object.fromEntries(Array.from({ length: o.segs - 1 }, (_, i) => [`cauda${i + 2}`, q(v)]));
  const abana = (q: typeof qr, v: number[]) => ({ nad_d: q(v.map((a) => [0, a, 0] as V3)), nad_e: q(v.map((a) => [0, -a, 0] as V3)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { tronco: qz([-16, 8, -6, 2, 0]), cabeca: qz([14, -10, 6, -2, 0]), ...enrola(qz, [-10, 8, -5, 2, 0]), ...abana(qr, [30, -20, 20, -8, 0]) },
    idle: { cabeca: lz([0, -3, -5, -2]), pescoco: lz([0, 2, 3, 1]), ...enrola(lz, [0, -2, -4, -1]), dorsal: lr([[0, 0, 0], [0, 14, 0], [0, 0, 0], [0, -14, 0]]), ...abana(lr, [0, 22, 0, -22]) },
    fisico: { tronco: qz([8, 14, -14, -5, 0]), pescoco: qz([8, 16, -18, -6, 0]), cabeca: qz([10, 20, -16, -6, 0]), ...enrola(qz, [-4, -8, 8, 3, 0]) },
    especial: { tronco: qz([4, 8, 10, -8, -3, 0]), pescoco: qz([6, 14, 16, -12, -4, 0]), cabeca: qz([8, 18, 22, -10, -4, 0]), ...enrola(qz, [-4, -8, -10, 8, 3, 0]), dorsal: qr([[0, 0, 0], [0, 20, 0], [0, -20, 0], [0, 20, 0], [0, -10, 0], [0, 0, 0]]) },
    dano: { tronco: qz([10, 4, 0]), cabeca: qz([16, 6, 0]), ...enrola(qz, [8, 3, 0]), ...abana(qr, [40, 14, 0]) },
    desmaio: { tronco: qz([4, -2, -6, -10, -9]), pescoco: qz([0, -6, -12, -18, -16]), cabeca: qz([0, -8, -14, -20, -18]), ...enrola(qz, [0, 3, 6, 9, 8]), ...abana(qr, [0, -10, -24, -36, -34]) },
    status: { tronco: lr([[5, 0, -3], [0, 0, -5], [-5, 0, -3], [0, 0, -1]]), cabeca: lz([-10, -14, -10, -8]), dorsal: lr([[0, 6, 0], [0, 0, 0], [0, -6, 0], [0, 0, 0]]) },
    andar: { giro: [{ t: 0, r: [0, PERFIL, 0] }], tronco: lz([4, 0, -4, 0]), ...enrola(lz, [0, -4, 0, 4]), dorsal: lr([[0, 16, 0], [0, 0, 0], [0, -16, 0], [0, 0, 0]]), ...abana(lr, [20, 0, -20, 0]) },
    parado: { giro: [{ t: 0, r: [0, PERFIL, 0] }], ...enrola(lz, [0, -3]), dorsal: lr([[0, 10, 0], [0, -10, 0]]) },
  };
  const b = movBase({ ...o, flutua: 0 });
  b.idle.corpo = lp([[0, 0, 0], [0, 0.03 * o.u, 0], [0, 0.045 * o.u, 0], [0, 0.02 * o.u, 0]]);
  b.desmaio = { base: qr([[0, 0, 4], [0, 0, -3], [4, 0, -4], [8, 0, -2], [8, 0, -2]]), corpo: qp([[0, 0.02, 0], [0, -o.flutua * 0.03, 0], [0, -o.flutua * 0.07, 0], [0, -o.flutua * 0.1, 0], [0, -o.flutua * 0.09, 0]]) };
  return montar(somar(b, membros, extra), {}, { comp: 1, larg: 1.1, cabeca: 1.15, frontal: 1.1, olho: 1.5, ...o.mapa });
}

/** Bolhas que sobem e incham em rodízio (um osso por bolha). */
export const bolhasHipo = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const v = [1, 1.25, 1.5, 0.7], y: V3[] = [[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.01, 0]];
  return [n, [...ls([...v.slice(i % 4), ...v.slice(0, i % 4)]), ...lp([...y.slice(i % 4), ...y.slice(0, i % 4)])]];
}));

function build() {
  const { rig } = cavaloMarinho({ barriga: [0.17, 0.2, 0.15], flutua: 0.5, cabeca: [0.17, 0.15, 0.14], canudo: 0.24, cauda: { segs: 5, len: 0.62, r: 0.095, curva: -58 }, olho: 0.036 });
  // coroinha de três pontas
  rig.add('cabeca', tufo(3, 0.15, 0.05, m(2), { pos: [-0.02, 0.15, 0], rot: [0, 0, 20], abre: 36 }));
  // 3ª rodada: cabeça menos baixa (o canudo saía apontando para o chão, rente ao peito)
  rig.bones.cabeca.rotation.z += 0.3;
  // 3ª rodada: a ponta do canudo era clara como a bochecha e o focinho lia como um bracinho; agora a boquinha é escura
  // e o canudo ganha um anel turquesa — lê como focinho de cavalo-marinho
  rig.add('cabeca', blob([0.05, 0.07, 0.07], m.sombra(0), { pos: [0.395, -0.045, 0], seg: 10 }), blob([0.03, 0.062, 0.062], m.plano(2), { pos: [0.27, -0.03, 0], rot: [0, 0, 10], seg: 10 }));
  rig.bone('bolha1', 'corpo', [0.56, 0.5, 0.06]); rig.add('bolha1', blob([0.04, 0.04, 0.04], m.luz(2), { seg: 10 }));
  rig.bone('bolha2', 'corpo', [0.44, 0.64, -0.06]); rig.add('bolha2', blob([0.028, 0.028, 0.028], m.luz(2), { seg: 8 }));
  return rig;
}

const anims = animsCavalo({ u: 0.9, flutua: 0.5, segs: 5, mole: 1.1 }, {
  idle: bolhasHipo(['bolha1', 'bolha2']),
  status: bolhasHipo(['bolha1', 'bolha2']),
});

export const hipocampim = criatura({
  num: 119, id: 'hipocampim', nome: 'Hipocampim', porte: 'P', estagio: 'basico', paleta: paletaHipo, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
