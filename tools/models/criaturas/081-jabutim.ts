/**
 * 081 · JABUTIM (Mata/Pedra) — filhote de jabuti-piranga, devagar e sempre, com um broto nascendo no casco.
 * Traços únicos: casco alto de cúpula com escudos amarelos · escamas vermelhas nas patas e na cabeça ·
 * patas de coluna · broto de duas folhas no cocuruto do casco · seixo de estimação ao lado.
 */
import { criatura, tartaruga, animsTartaruga, blob, folha3d, par, m, lz, qz, type V3 } from './kits';

export const paletaJabuti = {
  rampas: [
    ['#33262e', '#6c4e40', '#a98a62'], // 0 casco e pele castanhos · pedras
    ['#b4842a', '#f0c850', '#fff1a2'], // 1 amarelo dos escudos e do plastrão
    ['#28683c', '#58b64a', '#b9e872'], // 2 verde do broto e do musgo
    ['#a62e1e', '#f05e2a', '#ffb062'], // 3 escamas vermelhas ("piranga")
  ] as [string, string, string][],
  contorno: '#22181e',
  extras: { w: '#ffffff', p: '#1c1218', f: '#6c4e40' },
};

export interface JabutiP { casco: V3; alt: number; perna: number; r: number; cabeca: V3; pescoco: number }

/** Corpo comum da linha: cúpula alta de escudos amarelos, escamas vermelhas, patas de coluna. */
export function corpoJabuti(p: JabutiP) {
  const [hx, hy, hz] = p.cabeca;
  const kit = tartaruga({
    casco: p.casco, alt: p.alt, pernas: { len: p.perna, r: p.r }, pescoco: { len: p.pescoco, r: hy * 0.62, ang: 28 },
    cabeca: p.cabeca, cauda: p.casco[0] * 0.28, escudos: 7,
    olho: { r: 0.027, pos: [hx * 0.72, hy * 0.38, hz * 0.8] },
    rampas: { casco: 0, borda: 0, plastrao: 1, pele: 0, escudos: 1 },
  });
  const rig = kit.rig;
  par((l, s) => {
    // escamas vermelhas: duas por pata, mancha na bochecha e no cocuruto
    for (const q of ['f', 't'] as const) rig.add(`canela_${q}${l}`, blob([p.r * 0.5, p.r * 0.45, p.r * 0.5], m.plano(3), { pos: [p.r * 0.5, -p.r * 0.5, p.r * 0.6 * s], seg: 8 }), blob([p.r * 0.4, p.r * 0.4, p.r * 0.4], m.luz(3), { pos: [p.r * 0.7, -p.r * 1.5, p.r * 0.2 * s], seg: 8 }));
    rig.add('cabeca', blob([hx * 0.3, hy * 0.26, hz * 0.2], m.plano(3), { pos: [hx * 0.3, -hy * 0.1, hz * 0.86 * s], seg: 8 }));
  });
  rig.add('cabeca', blob([hx * 0.34, hy * 0.2, hz * 0.4], m.plano(3), { pos: [hx * 0.7, hy * 0.9, 0], seg: 8 }));
  return kit;
}

/** broto de duas folhas num osso próprio */
export function broto(rig: ReturnType<typeof corpoJabuti>['rig'], nome: string, pai: string, pos: V3, len: number, tomba = 0) {
  rig.bone(nome, pai, pos, [0, 0, tomba]);
  rig.add(nome, blob([len * 0.1, len * 0.3, len * 0.1], m.sombra(2), { pos: [0, len * 0.2, 0], seg: 8 }), folha3d(len, len * 0.5, m(2), { rot: [0, 0, 44], pos: [0, len * 0.35, 0] }), folha3d(len * 0.85, len * 0.46, m.luz(2), { rot: [0, 0, -46], pos: [0, len * 0.35, 0] }));
}

function build() {
  const { rig, ref } = corpoJabuti({ casco: [0.25, 0.25, 0.22], alt: 0.09, perna: 0.12, r: 0.062, cabeca: [0.12, 0.105, 0.105], pescoco: 0.13 });
  broto(rig, 'broto', 'corpo', [ref.topoCasco[0] - 0.02, ref.topoCasco[1] - 0.02, 0], 0.15, -6);
  // seixo de estimação (fica no chão, ao lado)
  rig.bone('seixo', 'base', [0.2, 0.05, 0.3]);
  rig.add('seixo', blob([0.075, 0.055, 0.065], m.luz(0), { seg: 8 }), blob([0.04, 0.02, 0.04], m(2), { pos: [-0.01, 0.045, 0], seg: 6 }));
  return rig;
}

const anims = animsTartaruga({ u: 0.5, hPerna: 0.09, pescoco: 0.13, mole: 0.5 }, {
  idle: { broto: lz([0, 5, 10, 3]) },
  especial: { broto: qz([0, 12, 18, -24, -8, 0]) },
  dano: { broto: qz([26, 8, 0]) },
});

export const jabutim = criatura({
  num: 81, id: 'jabutim', nome: 'Jabutim', porte: 'P', estagio: 'basico', paleta: paletaJabuti, build, anims,
  olho: { frente: ['.ww.', 'wppw', 'wpww', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['w', 'p'] },
});
