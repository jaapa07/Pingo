/**
 * 155 · LAVADEIRIM (Inseto/Vento) — libélula filhote que bate a ponta do rabo na água como quem lava roupa.
 * Traços únicos: olhões verde-limão que tomam a cabeça toda · quatro asas de véu abertas em "X" · rabo fino e comprido
 * de gomos azuis · ponta do rabo molhada, com gotas · tórax azul-céu de ombros listrados.
 * O construtor `libelula` é reaproveitado pela Lavadeira-Dragão.
 */
import { criatura, inseto, animsInseto, blob, segmento, par, m, ls, lz, qz, lr, qr, qp, type Rig, type Mat } from './kits';

export const paletaLibelula = {
  rampas: [
    ['#1c4898', '#3c96ea', '#aae2ff'], // 0 azul-céu
    ['#1a1c3e', '#36386c', '#7078ac'], // 1 azul-noite das juntas e nervuras
    ['#8eb8da', '#d8f0fc', '#ffffff'], // 2 asas de véu e gotas
    ['#6c9c1c', '#c2ea3c', '#f8ffb2'], // 3 verde-limão dos olhos
  ] as [string, string, string][],
  contorno: '#161834',
  extras: { w: '#ffffff', p: '#141430', f: '#c2ea3c' },
};

export interface LibelulaP { k: number; flutua: number; /** rabo: nº de gomos, comprimento e raio */ rabo: { segs: number; len: number; r: number }; /** asas: comprimento e largura; `vidro(i)` devolve as malhas da asa i (0..3) */ asa: [number, number]; pinta?: (len: number, larg: number, i: number, s: number) => ReturnType<typeof blob>[]; matAsa?: Mat }

/** Libélula: inseto voador do kit + olhões, quatro asas em "X" e rabo de gomos (ossos rabo1..N, saindo para −X). */
export function libelula(p: LibelulaP): Rig {
  const k = p.k;
  const { rig } = inseto({
    torax: [0.14 * k, 0.13 * k, 0.12 * k], abdomen: [0.06 * k, 0.06 * k, 0.06 * k], cabeca: [0.11 * k, 0.11 * k, 0.12 * k], alt: 0.13 * k, flutua: p.flutua, caiAbdomen: 0,
    patas: { abre: 0.08 * k, r: 0.02 * k, joelho: 0.02 * k }, asas: { len: 0.1, larg: 0.1, pares: 1 },
    olho: { r: 0.034 * Math.min(k, 1.15), pos: [0.13 * k, 0.05 * k, 0.15 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 1, patas: 1, asas: 2, barriga: 2 },
  });
  par((l, s) => {
    // OLHÕES verde-limão
    rig.add('cabeca', blob([0.1 * k, 0.11 * k, 0.1 * k], m(3), { pos: [0.07 * k, 0.04 * k, 0.085 * k * s], seg: 16 }));
    // ombros listrados
    rig.add('corpo', blob([0.03 * k, 0.1 * k, 0.03 * k], m(1), { pos: [0.03 * k, 0.04 * k, 0.105 * k * s], rot: [0, 0, 24], seg: 8, castShadow: false }));
    // quatro ASAS: o osso do kit vira o par da frente; `asa2_` é o par de trás
    const [len, larg] = p.asa;
    const faz = (nome: string, i: number, x: number, ry: number, rx: number, kk: number) => {
      const a = nome.startsWith('asa2') ? rig.bone(nome, 'corpo', [0, 0, 0]) : rig.bones[nome];
      a.clear(); a.position.set(x, 0.12 * k, 0.05 * k * s); a.rotation.set(rx * s, ry * s, 0);
      const L = len * kk;
      rig.add(nome, blob([L * 0.5, larg * 0.07, larg * 0.5], p.matAsa ?? m(2), { pos: [-L * 0.52, 0, 0], seg: 18, castShadow: false }), blob([L * 0.5, larg * 0.09, larg * 0.08], m(1), { pos: [-L * 0.5, 0, -larg * 0.34 * s * (ry > 1.5 ? -1 : 1)], seg: 8, castShadow: false }));
      for (const g of p.pinta?.(L, larg, i, s) ?? [blob([larg * 0.2, larg * 0.09, larg * 0.16], m(1), { pos: [-L * 0.86, 0, -larg * 0.2 * s], seg: 8, castShadow: false })]) rig.add(nome, g);
    };
    faz('asa_' + l, 0, 0.03 * k, 1.3, -0.5, 1);
    faz('asa2_' + l, 1, -0.06 * k, 1.85, -0.2, 0.86);
  });
  // rabo de gomos: azul com juntas escuras
  const r = p.rabo, sl = r.len / r.segs;
  let pai = 'abdomen';
  for (let i = 1; i <= r.segs; i++) {
    rig.bone('rabo' + i, pai, i === 1 ? [-0.06 * k, 0, 0] : [-sl, 0, 0], [0, 0, i === 1 ? 10 : 6]);
    const ra = r.r * (1 - (i - 1) / r.segs * 0.35), rb = r.r * (1 - i / r.segs * 0.35);
    rig.add('rabo' + i, segmento([0, 0, 0], [-sl, 0, 0], ra, rb, i % 2 ? m(0) : m.luz(0)), blob([ra * 0.5, ra * 1.12, ra * 1.12], m(1), { pos: [-sl, 0, 0], seg: 8, castShadow: false }));
    pai = 'rabo' + i;
  }
  return rig;
}

/** Animações extras comuns: as asas de trás batem em contratempo e o rabo ondula. */
export const voaLib = (segs: number) => {
  const a2 = (q: typeof lr, v: number[]) => ({ asa2_d: q(v.map((a) => [-a, 0, 0] as [number, number, number])), asa2_e: q(v.map((a) => [a, 0, 0] as [number, number, number])) });
  const rabo = (q: typeof lz, v: number[]) => Object.fromEntries(Array.from({ length: segs }, (_, i) => ['rabo' + (i + 1), q(v.map((_, f) => v[(f + i) % v.length]))]));
  return {
    idle: { ...a2(lr, [36, 0, 36, 0]), ...rabo(lz, [0, 3, 6, 2]) },
    andar: { ...a2(lr, [-10, 36, -10, 36]) }, parado: { ...a2(lr, [36, 0]) }, status: { ...a2(lr, [18, 0, 18, 0]) },
    fisico: { ...a2(qr, [30, -10, 24, 6, 0]), asa_d: qr([12, 20, -8, 6, 0].map((a) => [-a, 0, 0] as [number, number, number])), asa_e: qr([12, 20, -8, 6, 0].map((a) => [a, 0, 0] as [number, number, number])), ...rabo(qz, [-3, -6, 9, 3, 0]) },
    especial: { ...a2(qr, [-6, 16, -6, 16, 6, 0]), asa_d: qr([8, 18, -6, 18, -6, 0].map((a) => [-a, 0, 0] as [number, number, number])), asa_e: qr([8, 18, -6, 18, -6, 0].map((a) => [a, 0, 0] as [number, number, number])), ...rabo(qz, [2, 4, 5, -6, -2, 0]) },
    entrada: { ...a2(qr, [-10, 30, -6, 20, 0]), asa_d: qr([30, -10, 24, -6, 0].map((a) => [-a, 0, 0] as [number, number, number])), asa_e: qr([30, -10, 24, -6, 0].map((a) => [a, 0, 0] as [number, number, number])) },
    // pousa de asas caídas, sem atravessar o chão
    desmaio: { ...a2(qr, [0, 10, 20, 30, 29]), asa_d: qr([[0, 0, 0], [10, 0, 0], [20, 0, 0], [30, 0, 0], [29, 0, 0]]), asa_e: qr([[0, 0, 0], [-10, 0, 0], [-20, 0, 0], [-30, 0, 0], [-29, 0, 0]]), ...rabo(qz, [0, -3, -6, -9, -8]) },
  };
};
export const pousaLib = (f: number, alt: number) => qp([[0, 0.01, 0], [0, -f * 0.2, 0], [0, -f * 0.6, 0], [0, -f - alt * 0.3, 0], [0, -f - alt * 0.28, 0]]);

function build() {
  const rig = libelula({ k: 1, flutua: 0.32, rabo: { segs: 4, len: 0.46, r: 0.04 }, asa: [0.42, 0.14] });
  // ponta do rabo molhada: pá clara e gotas
  rig.add('rabo4', blob([0.05, 0.035, 0.05], m.luz(2), { pos: [-0.13, 0, 0], seg: 8 }));
  rig.bone('gota1', 'rabo4', [-0.16, -0.08, 0.03]); rig.add('gota1', blob([0.028, 0.038, 0.028], m.luz(2), { seg: 8, castShadow: false }));
  rig.bone('gota2', 'rabo4', [-0.1, -0.15, -0.04]); rig.add('gota2', blob([0.022, 0.03, 0.022], m.luz(2), { seg: 8, castShadow: false }));
  // boquinha clara
  rig.add('cabeca', blob([0.05, 0.05, 0.07], m.luz(0), { pos: [0.14, -0.05, 0], seg: 10 }));
  return rig;
}

const v = voaLib(4);
const anims = animsInseto({ u: 0.5, alt: 0.13, flutua: 0.32, asas: true, mole: 1.1, mapa: { comp: 0.75, larg: 1.1 } }, {
  ...v,
  // lava roupa: a ponta do rabo bate para baixo
  idle: { ...v.idle, rabo3: lz([0, 10, 22, 6]), rabo4: lz([0, 14, 30, 8]), gota1: ls([1, 0.4, 1.3, 0.8]), gota2: ls([0.8, 1.3, 0.4, 1]) },
  desmaio: { ...v.desmaio, corpo: pousaLib(0.32, 0.13) },
});

export const lavadeirim = criatura({
  num: 155, id: 'lavadeirim', nome: 'Lavadeirim', porte: 'P', estagio: 'basico', paleta: paletaLibelula, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
