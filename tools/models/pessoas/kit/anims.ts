/**
 * Animações à mão do kit de pessoas (poucos quadros, bem escolhidos).
 * Ângulos em graus. Rotação Z positiva leva perna/braço para a FRENTE (+X); negativa inclina o tronco para a frente.
 */
import type { Anim, AnimSet, Key } from '../../../render/anim';
import type { V3 } from '../../../render/sculpt';
import { HIP } from './corpo';
import type { PorteDef } from './corpo';

type Keys = Record<string, Key[]>;
const k = (t: number, rz: number, y = 0): Key => ({ t, r: [0, 0, rz], p: [0, y, 0] });
const kr = (t: number, r: V3): Key => ({ t, r });
const kp = (t: number, p: V3): Key => ({ t, p });
/** ciclo de 4 tempos: a, b, c, d, a */
const c4 = (a: Key, b: Key, c: Key, d: Key): Key[] => [{ ...a, t: 0 }, { ...b, t: 0.25 }, { ...c, t: 0.5 }, { ...d, t: 0.75 }, { ...a, t: 1 }];
const R = (rz: number, y = 0, x = 0): Key => ({ t: 0, r: [0, 0, rz], p: [x, y, 0] });

export const DIRS = { s: 0, l: 90, n: 180, o: -90 } as const;
export type Dir = keyof typeof DIRS;

/* ------------------------------ mapa ------------------------------ */
const andar: Anim = {
  frames: 4, fps: 7, keys: {
    pernaD: c4(R(34), R(0), R(-34), R(0, 0.07)),
    pernaE: c4(R(-34), R(0, 0.07), R(34), R(0)),
    bracoD: c4(R(-30), R(0), R(30), R(0)),
    bracoE: c4(R(30), R(0), R(-30), R(0)),
    corpo: c4(R(0, -0.05), R(0), R(0, -0.05), R(0)),
  },
};
/** de frente e de costas o passo precisa de pés que sobem e descem bem visíveis */
const andarFrente: Anim = {
  frames: 4, fps: 7, keys: {
    pernaD: c4(R(30, -0.0), R(0), R(-20, 0.1), R(0, 0.05)),
    pernaE: c4(R(-20, 0.1), R(0, 0.05), R(30, -0.0), R(0)),
    bracoD: c4(R(-30, 0.04), R(0), R(30, -0.03), R(0)),
    bracoE: c4(R(30, -0.03), R(0), R(-30, 0.04), R(0)),
    corpo: c4(R(0, -0.05), R(0), R(0, -0.05), R(0)),
    tronco: c4({ t: 0, r: [0, -8, 0] }, { t: 0, r: [0, 0, 0] }, { t: 0, r: [0, 8, 0] }, { t: 0, r: [0, 0, 0] }),
  },
};
const parado: Anim = { frames: 2, fps: 2, keys: { cabeca: [kp(0, [0, 0, 0]), { t: 0.5, p: [0, -0.045, 0], e: 'step' }, { t: 1, p: [0, 0, 0], e: 'step' }], bracoD: [k(0, 0), { ...k(0.5, 0, -0.045), e: 'step' }, { ...k(1, 0), e: 'step' }], bracoE: [k(0, 0), { ...k(0.5, 0, -0.045), e: 'step' }, { ...k(1, 0), e: 'step' }] } };
const correr: Anim = {
  frames: 4, fps: 10, keys: {
    pernaD: c4(R(52), R(8, 0.02), R(-48, 0.04), R(10, 0.11)),
    pernaE: c4(R(-48, 0.04), R(10, 0.11), R(52), R(8, 0.02)),
    bracoD: c4(R(-58), R(-5), R(58), R(5)),
    bracoE: c4(R(58), R(5), R(-58), R(-5)),
    tronco: c4(R(-14), R(-10), R(-14), R(-10)),
    corpo: c4(R(0, -0.06, 0.02), R(0, 0.03, 0.02), R(0, -0.06, 0.02), R(0, 0.03, 0.02)),
  },
};
const bike: Anim = {
  frames: 4, fps: 8, keys: {
    corpo: c4(R(0, 0.14, -0.1), R(0, 0.14, -0.1), R(0, 0.14, -0.1), R(0, 0.14, -0.1)),
    tronco: c4(R(-16), R(-16, -0.02), R(-16), R(-16, -0.02)),
    cabeca: c4(R(12), R(12), R(12), R(12)),
    pernaD: c4(R(28, 0.0), R(52, 0.07), R(40, 0.12), R(14, 0.06)),
    pernaE: c4(R(40, 0.12), R(14, 0.06), R(28, 0.0), R(52, 0.07)),
    bracoD: c4(R(62), R(62), R(62), R(62)),
    bracoE: c4(R(62), R(62), R(62), R(62)),
    vBike: c4(R(0), R(0, 0.0), R(0), R(0, 0.0)),
  },
};
const remar: Anim = {
  frames: 4, fps: 5, keys: {
    corpo: c4(R(0, -0.1), R(0, -0.1), R(0, -0.1), R(0, -0.1)),
    pernaD: [{ t: 0, s: 0.001 }], pernaE: [{ t: 0, s: 0.001 }],
    tronco: c4({ t: 0, r: [0, -14, -12] }, { t: 0, r: [0, -6, 4] }, { t: 0, r: [0, 14, -12] }, { t: 0, r: [0, 6, 4] }),
    cabeca: c4({ t: 0, r: [0, 10, 8] }, { t: 0, r: [0, 4, -2] }, { t: 0, r: [0, -10, 8] }, { t: 0, r: [0, -4, -2] }),
    bracoD: c4({ t: 0, r: [-20, 0, 70] }, { t: 0, r: [-20, 0, 15] }, { t: 0, r: [40, 0, 95] }, { t: 0, r: [40, 0, 60] }),
    bracoE: c4({ t: 0, r: [-40, 0, 95] }, { t: 0, r: [-40, 0, 60] }, { t: 0, r: [20, 0, 70] }, { t: 0, r: [20, 0, 15] }),
    vRemo: c4({ t: 0, r: [-28, 0, 32], p: [0.04, 0, 0.19] }, { t: 0, r: [-28, 0, -32], p: [-0.06, 0, 0.19] }, { t: 0, r: [28, 0, 32], p: [0.04, 0, -0.19] }, { t: 0, r: [28, 0, -32], p: [-0.06, 0, -0.19] }),
    vCanoa: c4(R(0), R(0, -0.02), R(0), R(0, -0.02)),
  },
};
for (const key of Object.values(remar.keys)) for (const q of key) q.e = 'step';
const escalar: Anim = {
  frames: 4, fps: 6, keys: {
    bracoD: c4(R(172, 0.05), R(150), R(128, -0.02), R(150)),
    bracoE: c4(R(128, -0.02), R(150), R(172, 0.05), R(150)),
    pernaD: c4(R(-8, 0.0), R(4, 0.04), R(16, 0.1), R(4, 0.04)),
    pernaE: c4(R(16, 0.1), R(4, 0.04), R(-8, 0.0), R(4, 0.04)),
    corpo: c4(R(0, 0), R(0, 0.05), R(0, 0), R(0, 0.05)),
    tronco: c4({ t: 0, r: [5, 0, -4] }, { t: 0, r: [0, 0, -4] }, { t: 0, r: [-5, 0, -4] }, { t: 0, r: [0, 0, -4] }),
  },
};
const mergulhar: Anim = {
  frames: 4, fps: 5, keys: {
    corpo: c4(R(-28, 0.1), R(-28, 0.14), R(-28, 0.1), R(-28, 0.06)),
    cabeca: c4(R(20), R(20), R(20), R(20)),
    pernaD: c4(R(18), R(-6), R(-30), R(-6)),
    pernaE: c4(R(-30), R(-6), R(18), R(-6)),
    bracoD: c4({ t: 0, r: [-30, 0, 120] }, { t: 0, r: [-55, 0, 60] }, { t: 0, r: [-20, 0, -10] }, { t: 0, r: [-10, 0, 60] }),
    bracoE: c4({ t: 0, r: [30, 0, 120] }, { t: 0, r: [55, 0, 60] }, { t: 0, r: [20, 0, -10] }, { t: 0, r: [10, 0, 60] }),
  },
};
const arremessoMapa: Anim = {
  frames: 4, fps: 9, loop: false, keys: {
    bracoD: [k(0, -110), k(1 / 3, -195), k(2 / 3, -280), k(1, -320)],
    bracoE: [k(0, 40), k(1 / 3, 20), k(2 / 3, -25), k(1, -30)],
    tronco: [kr(0, [0, -18, 9]), kr(1 / 3, [0, -8, 3]), kr(2 / 3, [0, 14, -12]), kr(1, [0, 16, -14])],
    pernaD: [k(0, -14), k(1 / 3, -10), k(2 / 3, -22), k(1, -24)],
    pernaE: [k(0, 10), k(1 / 3, 14), k(2 / 3, 26), k(1, 26)],
    corpo: [k(0, 0, -0.02), k(1 / 3, 0, 0), k(2 / 3, 0, -0.05), k(1, 0, -0.05)],
    vCuia: [{ t: 0, s: 1 }, { t: 1 / 3, s: 1 }, { t: 2 / 3, s: 0.001, e: 'step' }, { t: 1, s: 0.001 }],
  },
};

/* ------------------------------ batalha, costas, retrato ------------------------------ */
const st = (t: number, o: Partial<Key>): Key => ({ t, e: 'step', ...o });
const respirar: Anim = { frames: 2, fps: 2.5, keys: { tronco: [kp(0, [0, 0, 0]), st(0.5, { p: [0, -0.028, 0] }), st(1, { p: [0, 0, 0] })], cabeca: [kp(0, [0, 0, 0]), st(0.5, { p: [0, -0.004, 0] }), st(1, { p: [0, 0, 0] })] } };
const derrota: Anim = {
  frames: 2, fps: 3, loop: false, olho: 'fechado', keys: {
    tronco: [{ t: 0, r: [0, 0, 8], p: [0, 0, 0] }, st(1, { r: [0, 0, -9], p: [0, -0.03, 0] })],
    cabeca: [kr(0, [0, 0, 10]), st(1, { r: [0, 0, -24] })],
    bracoD: [k(0, -35), st(1, { r: [0, 0, 12] })],
    bracoE: [k(0, -30), st(1, { r: [0, 0, 12] })],
  },
};
const arremesso: Anim = {
  frames: 5, fps: 10, loop: false, keys: {
    bracoD: [{ t: 0, r: [0, 0, 55] }, { t: 0.25, r: [0, 0, -100] }, { t: 0.5, r: [38, 0, -185] }, { t: 0.75, r: [20, 0, -262] }, { t: 1, r: [0, 0, -318] }],
    bracoE: [{ t: 0, r: [0, 0, 35] }, { t: 0.25, r: [25, 0, 75] }, { t: 0.5, r: [20, 0, 50] }, { t: 0.75, r: [10, 0, -30] }, { t: 1, r: [10, 0, -45] }],
    tronco: [kr(0, [0, 0, 0]), kr(0.25, [0, -34, 14]), kr(0.5, [0, -18, 6]), kr(0.75, [0, 22, -18]), kr(1, [0, 30, -24])],
    cabeca: [kr(0, [0, 0, 0]), kr(0.25, [0, 22, -10]), kr(0.5, [0, 10, -2]), kr(0.75, [0, -12, 12]), kr(1, [0, -16, 16])],
    pernaD: [k(0, 0), k(0.25, -20), k(0.5, -14), k(0.75, -30), k(1, -34)],
    pernaE: [k(0, 0), k(0.25, 10), k(0.5, 18, 0.03), k(0.75, 32), k(1, 32)],
    corpo: [{ t: 0, p: [0, 0, 0] }, { t: 0.25, p: [-0.04, -0.03, 0] }, { t: 0.5, p: [-0.01, 0.02, 0] }, { t: 0.75, p: [0.05, -0.05, 0] }, { t: 1, p: [0.07, -0.06, 0] }],
    vCuia: [{ t: 0, s: 1 }, { t: 0.5, s: 1 }, { t: 0.75, s: 0.001, e: 'step' }, { t: 1, s: 0.001 }],
  },
};
const quieto: Anim = { frames: 1, fps: 1, loop: false, keys: {} };

/* ------------------------------ composição ------------------------------ */
export type Expr = 'neutro' | 'feliz' | 'bravo' | 'triste';
export interface Comp { yaw?: number; pitch?: number; mostra?: string[]; expr?: Expr; bat?: PorteDef; viraCabeca?: number; braco?: number; extra?: Keys }

/** ossos que somem quando a animação não pede */
const CHAVES = ['vBike', 'vCanoa', 'vRemo', 'vCuia', 'vMascara', 'prop', 'oculos'];
const SOME: Key = { t: 0, s: 0.001 };

export function compor(base: Anim, c: Comp = {}): Anim {
  const keys: Keys = {};
  for (const [n, ks] of Object.entries(base.keys)) keys[n] = ks.map((q) => ({ ...q }));
  const junta = (n: string, q: Key) => { (keys[n] ??= []).push(q); };
  for (const b of CHAVES) if (!c.mostra?.includes(b) && !keys[b]?.some((q) => q.s !== undefined)) junta('?' + b, SOME);
  const e = c.expr ?? 'neutro';
  if (e !== 'neutro') junta('bocaN', SOME);
  if (e !== 'feliz') junta('bocaF', SOME);
  if (e !== 'bravo' && e !== 'triste') junta('bocaB', SOME);
  if (e === 'bravo') { junta('sobrD', { t: 0, r: [-24, 0, 0], p: [0, -0.022, -0.012] }); junta('sobrE', { t: 0, r: [24, 0, 0], p: [0, -0.022, 0.012] }); }
  if (e === 'triste') { junta('sobrD', { t: 0, r: [18, 0, 0] }); junta('sobrE', { t: 0, r: [-18, 0, 0] }); }
  if (e === 'feliz') { junta('sobrD', { t: 0, p: [0, 0.02, 0] }); junta('sobrE', { t: 0, p: [0, 0.02, 0] }); }
  if (c.braco !== undefined && !keys.bracoD) junta('bracoD', { t: 0, r: [0, 0, c.braco] });
  if (c.viraCabeca) {
    const ks = (keys.cabeca ??= []);
    let tem = false;
    for (const q of ks) if (q.r) { q.r = [q.r[0], q.r[1] + c.viraCabeca, q.r[2]]; tem = true; }
    if (!tem) ks.push({ t: 0, r: [0, c.viraCabeca, 0] });
  }
  if (c.bat) {
    const P = c.bat, tx = 1.12;
    // pernas afastadas e levemente abertas: os dois pés aparecem na vista 3/4
    if (!keys.pernaD) { junta('pernaD', { t: 0, r: [-5, 0, 6], p: [0, 0, 0.022] }); junta('pernaE', { t: 0, r: [5, 0, -6], p: [0, 0, -0.022] }); }
    junta('pernaD', { t: 0, s: [1.02, P.perna, 1.02] }); junta('pernaE', { t: 0, s: [1.02, P.perna, 1.02] });
    junta('ajuste', { t: 0, p: [0, HIP * (P.perna - 1), 0] });
    junta('tronco', { t: 0, s: [tx, P.tronco, tx] });
    junta('cabeca', { t: 0, s: [P.cabBat / tx, P.cabBat / P.tronco, P.cabBat / tx] });
  }
  for (const [n, ks] of Object.entries(c.extra ?? {})) for (const q of ks) junta(n, q);
  const a: Anim = { ...base, keys };
  if (c.yaw !== undefined) a.yaw = c.yaw;
  if (c.pitch !== undefined) a.pitch = c.pitch;
  if (e === 'feliz') a.olho = 'fechado';
  return a;
}

export function animsMapa(jogador: boolean, propNoMapa: boolean, braco?: number): AnimSet {
  const out: AnimSet = {};
  const base = propNoMapa ? ['prop'] : [];
  const em = (nome: string, a: Anim, mostra: string[] = [], dirs: Dir[] = ['s', 'l', 'n', 'o']) => { for (const d of dirs) out[`${nome}-${d}`] = compor(a, { yaw: DIRS[d], mostra: [...base, ...mostra], braco: propNoMapa ? braco : undefined }); };
  for (const d of ['s', 'l', 'n', 'o'] as const) em('andar', d === 's' || d === 'n' ? andarFrente : andar, [], [d]);
  em('idle', parado);
  if (jogador) {
    em('correr', correr);
    em('bike', bike, ['vBike']);
    em('remar', remar, ['vCanoa', 'vRemo']);
    em('escalar', escalar, [], ['n']);
    em('mergulhar', mergulhar, ['vMascara']);
    out.arremessar = compor(arremessoMapa, { yaw: 90, mostra: ['vCuia'] });
    for (const d of ['s', 'n', 'o'] as const) out[`arremessar-${d}`] = compor(arremessoMapa, { yaw: DIRS[d], mostra: ['vCuia'] });
  }
  return out;
}

export function animsBatalha(P: PorteDef, vira: number, braco?: number): AnimSet {
  const m = ['prop', 'oculos'];
  return {
    idle: compor(respirar, { bat: P, viraCabeca: vira, mostra: m, braco }),
    derrota: compor(derrota, { bat: P, viraCabeca: vira, mostra: m, expr: 'triste' }),
  };
}
export function animsCostas(P: PorteDef): AnimSet {
  return { idle: compor(respirar, { bat: P, mostra: ['oculos'] }), arremessar: compor(arremesso, { bat: P, mostra: ['vCuia', 'oculos'] }) };
}
export function animsRetrato(P: PorteDef, vira: number): AnimSet {
  const m = ['oculos'];
  return {
    neutro: compor(quieto, { bat: P, viraCabeca: vira, mostra: m }),
    feliz: compor(quieto, { bat: P, viraCabeca: vira, mostra: m, expr: 'feliz', extra: { cabeca: [{ t: 0, p: [0, 0.012, 0] }] } }),
    bravo: compor(quieto, { bat: P, viraCabeca: vira, mostra: m, expr: 'bravo', extra: { cabeca: [{ t: 0, p: [0, -0.012, 0] }] } }),
  };
}
