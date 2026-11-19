/**
 * 030 · MORCEGUIM (Vento/Assombro) — filhote de morcego-de-fruta que assombra as grutas com uma pitanga nos pés.
 * Traços únicos: orelhonas de miolo rosa · focinho de raposinha · asas de membrana roxa com dedos aparentes ·
 * gola de pelúcia creme · pitanga vermelha carregada nos pés.
 * Anatomia própria (não há kit de morcego): corpo pairando, asas em placa nos ossos asa_d/e → asa2_d/e,
 * e a biblioteca `animsMorcego` logo abaixo (reaproveitada pela linha toda).
 */
import { criatura, novoRig, segmento, olhos, blob, slab, par, m, movBase, somar, montar, lz, lr, lp, qz, qr, type V2, type V3, type Mov, type Faixas, type AnimsCriatura, type MapaChibi, type Rig } from './kits';

export const paletaMorcego = {
  rampas: [
    ['#3a2848', '#7c5a70', '#bb9c9e'], // 0 pelo castanho-ameixa
    ['#221938', '#4b3a6e', '#7d6cae'], // 1 membrana roxa das asas
    ['#a67688', '#f1cab8', '#fff2e2'], // 2 creme da gola, rosa das orelhas, presas
    ['#8e2448', '#e2473a', '#ffa860'], // 3 vermelho: pitanga, gota e forro da capa
  ] as [string, string, string][],
  contorno: '#1b1228',
  extras: { w: '#ffffff', p: '#1b1228', f: '#7c5a70', a: '#ffd35a' },
};

export interface MorcegoP {
  /** escala geral */ k: number; /** altura em que paira (do chão à barriga) */ flutua: number;
  cabeca: V3; /** altura e largura das orelhas */ orelha: [number, number]; focinho: number;
  /** envergadura de cada asa e quanto ela deita para trás */ asa: number; tomba?: number;
  /** cor do lado de dentro da asa (forro), se diferente */ forro?: number;
}

/** Corpo comum da linha. Ossos: corpo → pescoco → cabeca → mandibula, orelha_d/e · corpo → asa_d/e → asa2_d/e · corpo → perna_d/e. */
export function corpoMorcego(p: MorcegoP) {
  const k = p.k, [cx, cy, cz] = p.cabeca, T = p.tomba ?? 0.25, A = p.asa;
  const rig = novoRig(p.flutua + 0.2 * k);
  rig.add('corpo', blob([0.13 * k, 0.19 * k, 0.14 * k], m(0)), blob([0.1 * k, 0.12 * k, 0.12 * k], m(2), { pos: [0.06 * k, 0.06 * k, 0], seg: 16 }));
  rig.bone('pescoco', 'corpo', [0.03 * k, 0.14 * k, 0]);
  rig.bone('cabeca', 'pescoco', [0.03 * k, cy * 0.75, 0]);
  rig.add('cabeca', blob([cx, cy, cz], m(0)));
  // focinho de raposinha + nariz
  rig.add('cabeca', segmento([cx * 0.6, -cy * 0.2, 0], [cx * 0.6 + p.focinho, -cy * 0.3, 0], cy * 0.5, cy * 0.3, m(0)), blob([cy * 0.2, cy * 0.17, cy * 0.2], m.sombra(1), { pos: [cx * 0.6 + p.focinho + cy * 0.14, -cy * 0.24, 0], seg: 10 }));
  rig.bone('mandibula', 'cabeca', [cx * 0.5, -cy * 0.5, 0]);
  rig.add('mandibula', blob([p.focinho * 0.7, cy * 0.16, cz * 0.4], m.sombra(0), { pos: [p.focinho * 0.5, 0, 0], seg: 10 }));
  olhos(rig, 'cabeca', 0.03, [cx * 0.78, cy * 0.18, cz * 0.55]);
  const [oa, ol] = p.orelha;
  const P = (env: number, alt: number, s: number, dx = 0): V3 => [-alt * T + dx, alt, env * s];
  const placa = (pts: V2[], s: number, mat: ReturnType<typeof m>, dx = 0) => slab(pts, 0.03, mat, { deform: [(v) => { const x = v.x, z = v.z; v.x = z - v.y * T + dx; v.z = x * s; }] });
  par((l, s) => {
    rig.bone('orelha_' + l, 'cabeca', [-cx * 0.1, cy * 0.6, cz * 0.6 * s], [26 * s, 0, 6]);
    rig.add('orelha_' + l,
      slab([[-ol * 0.5, 0], [-ol * 0.6, oa * 0.5], [0, oa], [ol * 0.45, oa * 0.5], [ol * 0.4, 0]], 0.04, m(0), { rot: [0, 90, 0] }),
      slab([[-ol * 0.28, oa * 0.1], [-ol * 0.34, oa * 0.5], [0, oa * 0.8], [ol * 0.24, oa * 0.5], [ol * 0.2, oa * 0.1]], 0.03, m.plano(2), { rot: [0, 90, 0], pos: [0.03, 0, 0] }));
    // ASA: braço e membrana interna; mão e membrana externa (asa2)
    rig.bone('asa_' + l, 'corpo', [-0.02 * k, 0.1 * k, 0.1 * k * s]);
    const dentro: V2[] = [[0, 0.07 * A], [0.24 * A, 0.2 * A], [0.46 * A, 0.24 * A], [0.46 * A, -0.06 * A], [0.36 * A, -0.2 * A], [0.24 * A, -0.1 * A], [0.12 * A, -0.24 * A], [0, -0.12 * A]];
    rig.add('asa_' + l, placa(dentro, s, m(1)), segmento(P(0, 0.05 * A, s), P(0.46 * A, 0.22 * A, s), 0.04 * k, 0.03 * k, m(0)));
    if (p.forro !== undefined) rig.add('asa_' + l, placa(dentro.map(([x, y]) => [x * 0.9, y * 0.86 + 0.01 * A] as V2), s, m(p.forro), 0.025));
    rig.bone('asa2_' + l, 'asa_' + l, P(0.46 * A, 0.1 * A, s));
    const fora: V2[] = [[0, 0.14 * A], [0.24 * A, 0.24 * A], [0.54 * A, 0.1 * A], [0.4 * A, -0.04 * A], [0.34 * A, -0.2 * A], [0.2 * A, -0.1 * A], [0.1 * A, -0.28 * A], [0, -0.16 * A]];
    rig.add('asa2_' + l, placa(fora, s, m(1)));
    if (p.forro !== undefined) rig.add('asa2_' + l, placa(fora.map(([x, y]) => [x * 0.88, y * 0.84 + 0.01 * A] as V2), s, m(p.forro), 0.025));
    // dedos aparentes e a garrinha do polegar
    for (const [e, a] of [[0.52, 0.1], [0.33, -0.18], [0.1, -0.26]] as const) rig.add('asa2_' + l, segmento(P(0, 0.12 * A, s, -0.012), P(e * A, a * A, s, -0.012), 0.024 * k, 0.018 * k, m.luz(1)));
    rig.add('asa2_' + l, blob([0.03 * k, 0.05 * k, 0.03 * k], m.luz(2), { pos: P(0, 0.17 * A, s), seg: 8 }));
    // perninhas penduradas
    rig.bone('perna_' + l, 'corpo', [-0.02 * k, -0.15 * k, 0.07 * k * s]);
    rig.add('perna_' + l, segmento([0, 0, 0], [0.01, -0.09 * k, 0], 0.035 * k, 0.026 * k, m(0)), blob([0.04 * k, 0.025 * k, 0.035 * k], m.sombra(1), { pos: [0.02, -0.1 * k, 0], seg: 8 }));
  });
  return { rig, ref: { topo: [0, cy, 0] as V3, pes: [0, -0.26 * k, 0] as V3, focinho: [cx * 0.6 + p.focinho, -cy * 0.3, 0] as V3, peito: [0.13 * k, 0.05 * k, 0] as V3 } };
}

export interface AnimMorcegoP { u: number; flutua: number; mole?: number; /** amplitude do bater de asas (1 = voo aberto; 0.3 = capa) */ bate?: number; mapa?: MapaChibi }

/** Animações do morcego: bater de asas (Rx: positivo sobe), mordida, guincho. `extra` soma por movimento. */
export function animsMorcego(o: AnimMorcegoP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const b = o.bate ?? 1;
  const bat = (q: (v: V3[]) => Faixas[string], v: number[]): Faixas => ({
    asa_d: q(v.map((a) => [-a * b, 0, 0] as V3)), asa_e: q(v.map((a) => [a * b, 0, 0] as V3)),
    asa2_d: q(v.map((a) => [-a * b * 0.7, 0, 0] as V3)), asa2_e: q(v.map((a) => [a * b * 0.7, 0, 0] as V3)),
  });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...bat(qr, [34, -26, 26, -10, 0]), pescoco: qz([-10, 8, -8, 3, 0]) },
    idle: { ...bat(lr, [0, 24, 4, -22]), pescoco: lz([0, -2, -4, -1]), orelha_d: lz([0, 0, 0, -12]), orelha_e: lz([0, 0, 0, -12]), perna_d: lz([0, 6, 10, 4]), perna_e: lz([0, 6, 10, 4]) },
    fisico: { ...bat(qr, [20, 36, -34, -12, 0]), pescoco: qz([10, 18, -24, -10, 0]), mandibula: qz([0, -10, -34, -10, 0]) },
    especial: { ...bat(qr, [10, 26, 36, -40, -16, 0]), pescoco: qz([-6, -12, -14, 16, 6, 0]), mandibula: qz([0, 0, -8, -36, -12, 0]), orelha_d: qz([0, 12, 14, -16, -6, 0]), orelha_e: qz([0, 12, 14, -16, -6, 0]) },
    dano: { ...bat(qr, [-30, -10, 0]), pescoco: qz([18, 6, 0]), mandibula: qz([-20, -6, 0]), orelha_d: qz([22, 8, 0]), orelha_e: qz([22, 8, 0]) },
    desmaio: { ...bat(qr, [10, 30, -10, -40, -38]), pescoco: qz([8, -8, -20, -32, -30]), orelha_d: qz([0, 8, 18, 28, 26]), orelha_e: qz([0, 8, 18, 28, 26]) },
    status: { ...bat(lr, [-30, -34, -30, -26]), pescoco: lz([-10, -13, -10, -7]), cabeca: lr([[6, 0, -4], [0, 0, -6], [-6, 0, -4], [0, 0, -2]]) },
    // no mapa as asas varrem para trás, senão de lado viram um risco
    andar: { asa_d: lr([34, 0, -34, 0].map((a) => [-a, -42, 0] as V3)), asa_e: lr([34, 0, -34, 0].map((a) => [a, 42, 0] as V3)) },
    parado: { asa_d: lr([12, -14].map((a) => [-a, -42, 0] as V3)), asa_e: lr([12, -14].map((a) => [a, 42, 0] as V3)) },
  };
  return montar(somar(movBase({ mole: 1.1, ...o }), membros, extra), {}, { comp: 1, larg: 0.85, cabeca: 1.25, frontal: 1, ...o.mapa });
}

/** fruta/objeto carregado nos pés, num osso próprio */
function pitanga(rig: Rig, pos: V3, r: number) {
  rig.bone('fruta', 'corpo', pos);
  rig.add('fruta', blob([r, r * 0.85, r], m(3)), blob([r * 0.35, r * 0.3, r * 0.35], m.luz(3), { pos: [r * 0.2, r * 0.45, -r * 0.5], seg: 8 }), blob([r * 0.3, r * 0.22, r * 0.3], m.sombra(1), { pos: [0, r * 0.8, 0], seg: 8 }));
}

function build() {
  const { rig, ref } = corpoMorcego({ k: 1, flutua: 0.22, cabeca: [0.19, 0.17, 0.19], orelha: [0.24, 0.17], focinho: 0.11, asa: 0.72 });
  pitanga(rig, [0.02, ref.pes[1] - 0.09, 0], 0.085);
  // topete de penugem
  rig.add('cabeca', blob([0.06, 0.06, 0.07], m.luz(0), { pos: [0.02, ref.topo[1], 0], seg: 10 }));
  return rig;
}

const anims = animsMorcego({ u: 0.7, flutua: 0.14, mole: 1.3 }, {
  idle: { fruta: lz([0, 6, 0, -6]) },
  dano: { fruta: qz([-24, -8, 0]) },
});

export const morceguim = criatura({
  num: 30, id: 'morceguim', nome: 'Morceguim', porte: 'P', estagio: 'basico', paleta: paletaMorcego, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
void lp;
