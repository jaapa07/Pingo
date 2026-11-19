/**
 * 105 · TUIUIUZIM (Vento/Rio) — filhote de tuiuiú, penugem de nuvem e bico grande demais para a cabeça.
 * Traços únicos: bicão negro levemente virado para cima · cabeça e pescoço pelados negros · gola vermelha ·
 * corpo de penugem branca · pernas compridas negras · peixinho azul atravessado no bico.
 */
import { criatura, ave, animsAve, blob, pena, par, m, lz, qz, unirExtras, type V3 } from './kits';
import { asasContidas } from './051-ararinha';

export const paletaTuiuiu = {
  rampas: [
    ['#989eb6', '#eef0f0', '#ffffff'], // 0 branco
    ['#15131d', '#32303c', '#5b576b'], // 1 negro da cabeça, do bico e das pernas
    ['#8a1e2e', '#e03a3a', '#ff8a70'], // 2 gola vermelha
    ['#2f6ab0', '#5fb4ea', '#d8f4ff'], // 3 água e peixe
  ] as [string, string, string][],
  contorno: '#16141e',
  extras: { w: '#ffffff', p: '#0e0c14', f: '#32303c' },
};

export interface TuiuiuP { k: number; pescoco: number; perna: number; cabeca: V3; bico: number; gola: number; ergue: number }

/** Corpo comum da linha: corpo branco, cabeça e pescoço negros, gola vermelha, bicão arrebitado, pernas negras. */
export function corpoTuiuiu(p: TuiuiuP) {
  const k = p.k, [hx, hy, hz] = p.cabeca;
  const kit = ave({
    corpo: [0.27 * k, 0.22 * k, 0.2 * k], ergue: p.ergue,
    pescoco: { len: p.pescoco, ang: 76, r: 0.07 * k },
    cabeca: p.cabeca,
    bico: { len: p.bico, r: hy * 0.52, y: -0.08, gancho: -9, achata: 0.7, inferior: 0.92 },
    asa: { len: 0.36 * k, larg: 0.22 * k, cai: 22, ponta: 0.5 },
    cauda: { len: 0.16 * k, larg: 0.11 * k, ang: -16, penas: 3, abre: 16 },
    pernas: { alt: p.perna, r: 0.034 * k, z: 0.5, x: 0, dedo: 0.1 * k },
    olho: { r: 0.025, pos: [hx * 0.4, hy * 0.2, hz * 0.84] },
    rampas: { corpo: 0, cabeca: 1, asa: 0, asaPonta: 0, cauda: 0, bico: 1, perna: 1 },
  });
  // GOLA vermelha na base do pescoço (osso próprio: incha)
  kit.rig.bone('gola', 'pescoco', [p.gola * 0.15, p.gola * 0.9, 0]);
  kit.rig.add('gola', blob([p.gola, p.gola * 0.85, p.gola * 1.05], m(2), { seg: 14 }), blob([p.gola * 0.6, p.gola * 0.4, p.gola * 0.7], m.luz(2), { pos: [p.gola * 0.3, p.gola * 0.4, 0], seg: 8 }));
  return kit;
}
export function peixeNoBico(rig: ReturnType<typeof corpoTuiuiu>['rig'], pos: V3, k: number) {
  rig.bone('peixe', 'mandibula', pos, [0, 90, 0]);
  rig.add('peixe', blob([0.09 * k, 0.04 * k, 0.03 * k], m(3), { seg: 10 }), pena(0.06 * k, 0.08 * k, m.sombra(3), { esp: 0.02 * k, pos: [-0.07 * k, 0, 0], ponta: 1.3 }), blob([0.04 * k, 0.018 * k, 0.03 * k], m.luz(3), { pos: [0.01 * k, -0.02 * k, 0], seg: 6 }));
}

function build() {
  const { rig } = corpoTuiuiu({ k: 0.78, pescoco: 0.34, perna: 0.42, cabeca: [0.12, 0.105, 0.1], bico: 0.4, gola: 0.085, ergue: 40 });
  // penugem de nuvem: flocos saltados
  for (const [x, y, z] of [[-0.14, 0.12, 0.08], [-0.14, 0.12, -0.08], [-0.22, 0.0, 0]] as const) rig.add('tronco', blob([0.055, 0.05, 0.05], m.luz(0), { pos: [x, y, z], seg: 10 }));
  rig.add('cabeca', blob([0.05, 0.04, 0.05], m(0), { pos: [-0.04, 0.1, 0], seg: 8 }));
  peixeNoBico(rig, [0.2, 0.0, 0], 0.7);
  void par;
  return rig;
}

const anims = animsAve({ u: 0.95, hPerna: 0.42, mole: 1.3 }, unirExtras(asasContidas, {
  idle: { peixe: lz([0, 6, 0, -6]) },
  dano: { peixe: qz([-30, -10, 0]) },
}));

export const tuiuiuzim = criatura({
  num: 105, id: 'tuiuiuzim', nome: 'Tuiuiuzim', porte: 'P', estagio: 'basico', paleta: paletaTuiuiu, build, anims,
  olho: { frente: ['.ww.', 'wppw', 'wpww', '.ww.'], fechado: ['ffff', 'wffw', 'fwwf', 'ffff'], mapa: ['w', 'p'] },
});
