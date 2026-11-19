/**
 * 145 · ESCORPIM (Veneno/Terra) — escorpião-amarelo filhote, que brilha azul-esverdeado sob luz ultravioleta e acha isso o máximo.
 * Traços únicos: corpo palha com placas castanhas no lombo · cauda de cinco gomos erguida sobre as costas ·
 * ferrão de gota verde-água BRILHANTE (e as pontas das pinças também) · pinças finas de alicate · torrões de terra nas patas.
 * O construtor `escorpiao` é reaproveitado pelo Escorpião-Rei.
 */
import { criatura, aracnideo, animsAracnideo, blob, calota, par, m, ls, qs, qr, lz, type Rig, type V3 } from './kits';

export const paletaEscorpiao = {
  rampas: [
    ['#8c5a2c', '#e2b24a', '#fff2a4'], // 0 amarelo-palha
    ['#3e2632', '#70463a', '#ac7c54'], // 1 placas castanhas do lombo
    ['#1a7868', '#3ee0b2', '#d4fff2'], // 2 brilho verde-água (veneno sob ultravioleta)
    ['#765848', '#bc9872', '#ead4aa'], // 3 terra
  ] as [string, string, string][],
  contorno: '#2c1a2a',
  extras: { w: '#ffffff', p: '#241424', f: '#e2b24a' },
};

export const tarsosEsc = { desmaio: { ...Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3, 4].map((i) => [`tarso${i}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? -10 : 10, 0, 0], [l === 'd' ? -22 : 22, 0, 0], [l === 'd' ? -20 : 20, 0, 0]])]))), pinca_d: qr([[0, 0, 0], [0, -4, -6], [0, -8, -14], [0, -12, -20], [0, -12, -19]]), pinca_e: qr([[0, 0, 0], [0, 4, -6], [0, 8, -14], [0, 12, -20], [0, 12, -19]]), cauda1: qr([[0, 0, 0], [0, 0, 6], [0, 0, 14], [0, 0, 22], [0, 0, 21]]), cauda2: qr([[0, 0, 0], [0, 0, 6], [0, 0, 14], [0, 0, 20], [0, 0, 19]]) } };

export interface EscP { k: number; alt: number; cauda: { len: number; r: number; ferrao: number } }

/** Escorpião: corpo comprido do kit + placas do lombo, gomos da cauda e brilho no ferrão. Devolve o último osso da cauda. */
export function escorpiao(p: EscP): { rig: Rig; fim: string; seg: number } {
  const k = p.k, c: V3 = [0.27 * k, 0.11 * k, 0.17 * k];
  const { rig } = aracnideo({
    corpo: c, alt: p.alt, patas: { pares: 4, abre: 0.2 * k, r: 0.034 * k, joelho: 0.09 * k },
    pincas: { braco: 0.17 * k, r: 0.04 * k, garra: [0.11 * k, 0.065 * k, 0.06 * k], abre: 34 },
    cauda: { segs: 5, len: p.cauda.len, r0: p.cauda.r, r1: p.cauda.r * 0.78, curva: 36, ferrao: p.cauda.ferrao },
    olho: { r: 0.028 * k, pos: [0.24 * k, 0.05 * k, 0.085 * k] },
    rampas: { corpo: 0, barriga: 0, patas: 0, pontas: 1, pincas: 0, cauda: 0 },
  });
  // placas castanhas do lombo: três cintas e o capacete da cabeça
  for (const x of [-0.16, -0.04, 0.08]) rig.add('corpo', calota([0.065 * k, c[1] * 1.12, c[2] * 1.04], m(1), { de: 0, ate: 62, pos: [x * k, 0, 0] }));
  rig.add('corpo', blob([0.07 * k, 0.05 * k, 0.11 * k], m(1), { pos: [0.2 * k, 0.07 * k, 0], seg: 12 }));
  // gomos da cauda: bolinhas nas juntas, e o ferrão aceso
  const sl = p.cauda.len / 5;
  for (let i = 1; i <= 5; i++) rig.add('cauda' + i, blob([p.cauda.r * 1.12, p.cauda.r * 1.12, p.cauda.r * 1.12], i % 2 ? m.luz(0) : m(0), { pos: [-sl, 0, 0], seg: 10 }));
  rig.bone('brilho', 'cauda5', [-sl - p.cauda.ferrao * 0.5, 0, 0]);
  rig.add('brilho', blob([p.cauda.ferrao * 1.05, p.cauda.ferrao * 0.98, p.cauda.ferrao * 0.98], m.plano(2), { seg: 12 }), blob([p.cauda.ferrao * 0.45, p.cauda.ferrao * 0.45, p.cauda.ferrao * 0.45], m.luz(2), { pos: [0, p.cauda.ferrao * 0.5, -p.cauda.ferrao * 0.4], seg: 8 }));
  par((l) => {
    rig.add('dedo_' + l, blob([0.035 * k, 0.03 * k, 0.03 * k], m.plano(2), { pos: [0.1 * k, -0.01 * k, 0], seg: 8 }));
    rig.add('garra_' + l, blob([0.035 * k, 0.03 * k, 0.03 * k], m.plano(2), { pos: [0.25 * k, 0.03 * k, 0], seg: 8 }));
  });
  return { rig, fim: 'cauda5', seg: sl };
}

function build() {
  const { rig } = escorpiao({ k: 1, alt: 0.13, cauda: { len: 0.56, r: 0.055, ferrao: 0.065 } });
  // torrões de terra grudados nas patas e um no lombo
  par((l, s) => { for (const i of [2, 4]) rig.add(`tarso${i}_${l}`, blob([0.045, 0.035, 0.045], m(3), { pos: [(0.45 - 0.9 * (i - 1) / 3) * 0.1, -0.16, 0.1 * s], seg: 7 })); });
  rig.add('corpo', blob([0.05, 0.035, 0.05], m.luz(3), { pos: [-0.2, 0.1, 0.07], seg: 7 }));
  // bochechas claras (filhote)
  par((_, s) => rig.add('corpo', blob([0.04, 0.035, 0.04], m.luz(0), { pos: [0.24, -0.01, 0.1 * s], seg: 8 })));
  return rig;
}

export const brilhaEsc = { todas: { brilho: ls([1, 1.1, 1.22, 1.08]) }, especial: { brilho: qs([1, 0.8, 0.7, 1.7, 1.3, 1]) }, desmaio: { ...tarsosEsc.desmaio, brilho: qs([1, 0.9, 0.7, 0.5, 0.5]) } };
const anims = animsAracnideo({ u: 0.5, alt: 0.13, pares: 4, mole: 0.9 }, { ...brilhaEsc, idle: { cauda3: lz([0, -3, -6, -2]), cauda5: lz([0, 4, 8, 3]) } });

export const escorpim = criatura({
  num: 145, id: 'escorpim', nome: 'Escorpim', porte: 'P', estagio: 'basico', paleta: paletaEscorpiao, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
