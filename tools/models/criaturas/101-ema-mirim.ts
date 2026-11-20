/**
 * 101 · EMA-MIRIM (Comum/Ginga) — filhote de ema, listrado e pernudo, que já nasce correndo em ziguezague.
 * Traços únicos: pescoço comprido de cabecinha chata · riscas escuras ao longo do corpo de penugem creme ·
 * pernas compridas de joelho grosso · asinhas-pompom abertas para equilibrar · topetinho.
 */
import { criatura, ave, animsAve, blob, tufo, garra, par, m, lz, qz, unirExtras, type V3 } from './kits';
import { asasContidas } from './051-ararinha';

export const paletaEma = {
  rampas: [
    ['#3c3242', '#887876', '#c8bca8'], // 0 penas cinza-pardas
    ['#b29e88', '#f2e4c8', '#fffaf0'], // 1 creme da barriga e da penugem
    ['#1d1925', '#3b3543', '#615b6b'], // 2 riscas, coroa e base do pescoço
    ['#6a382a', '#b8663a', '#f0a868'], // 3 pernas e bico · terra
  ] as [string, string, string][],
  contorno: '#1e1824',
  extras: { w: '#ffffff', p: '#17121c', f: '#887876' },
};

export interface EmaP { k: number; pescoco: number; perna: number; cabeca: V3; corpo: number; asa: number; /** bico: fração do comprimento da cabeça e rampa (padrão 1.1 e 3) */ bicoLen?: number; rBico?: number; rPescoco?: number }

/** Corpo comum da linha: bola de penas em pernas compridas, pescoço fino, cabeça chata, asas caídas em saia. */
export function corpoEma(p: EmaP) {
  const k = p.k, [hx, hy, hz] = p.cabeca;
  const kit = ave({
    corpo: [0.26 * k, 0.21 * k, 0.2 * k], ergue: 10,
    pescoco: { len: p.pescoco, ang: 76, r: (p.rPescoco ?? 0.055) * k },
    cabeca: p.cabeca,
    bico: { len: hx * (p.bicoLen ?? 1.1), r: hy * (p.bicoLen ? 0.42 : 0.5), y: -0.1, gancho: 8, achata: 1.3, inferior: 0.85 },
    asa: { len: p.asa, larg: p.asa * 0.62, cai: 40, ponta: 0.5 },
    cauda: { len: 0.1 * k, larg: 0.1 * k, ang: -30, penas: 3, abre: 20 },
    pernas: { alt: p.perna, r: 0.036 * k, z: 0.5, x: 0, dedo: 0.11 * k },
    olho: { r: 0.026, pos: [hx * 0.4, hy * 0.3, hz * 0.8] },
    rampas: { corpo: p.corpo, peito: 1, cabeca: p.corpo, asa: p.corpo, asaPonta: p.corpo, cauda: p.corpo, bico: p.rBico ?? 3, perna: 3 },
  });
  const rig = kit.rig;
  // coroa escura, base escura do pescoço e joelhos grossos
  rig.add('cabeca', blob([hx * 0.7, hy * 0.4, hz * 0.8], m(2), { pos: [-hx * 0.1, hy * 0.7, 0], seg: 10 }));
  rig.add('pescoco', blob([0.085 * k, 0.07 * k, 0.085 * k], m(2), { pos: [0, 0.02 * k, 0], seg: 10 }));
  par((l) => rig.add('canela_' + l, blob([0.05 * k, 0.05 * k, 0.05 * k], m(3), { seg: 8 })));
  return kit;
}

function build() {
  // proporção de filhote: bola de penugem maior, cabeça grande, pernas e pescoço mais curtos (antes era um fiapo na célula)
  const { rig, ref } = corpoEma({ k: 1.08, pescoco: 0.36, perna: 0.32, cabeca: [0.15, 0.13, 0.13], corpo: 1, asa: 0.24, bicoLen: 0.75, rBico: 2, rPescoco: 0.06 });
  par((l) => rig.bones['olho_' + l].scale.setScalar(1.35));
  // riscas escuras ao longo do corpo e do pescoço
  const K = 1.08 / 0.84;
  for (const z of [-0.1, 0, 0.1]) rig.add('tronco', blob([0.19 * K, 0.035 * K, 0.034 * K], m.plano(2), { pos: [-0.02, 0.176 * K * Math.sqrt(1 - (z / 0.168) ** 2) * 0.96, z * K], seg: 8, castShadow: false }));
  par((_, s) => rig.add('tronco', blob([0.17 * K, 0.032 * K, 0.02 * K], m.plano(2), { pos: [-0.02, 0.02, 0.166 * K * s], seg: 8, castShadow: false })));
  rig.add('pescoco', blob([0.03, 0.15, 0.03], m.plano(2), { pos: [-0.012, 0.19, 0], rot: [0, 0, 14], seg: 6 }));
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.03, ref.topo[1], 0], [0, 0, 24]);
  rig.add('topete', tufo(3, 0.09, 0.035, m(1), { abre: 34 }));
  return rig;
}

const anims = animsAve({ u: 0.85, hPerna: 0.32, mole: 1.2 }, unirExtras(asasContidas, {
  idle: { topete: lz([0, 6, 12, -4]) },
  // coice para a frente
  fisico: { perna_e: qz([-14, -30, 60, 24, 0]), canela_e: qz([-20, -50, 20, 6, 0]) },
  dano: { topete: qz([28, 10, 0]) },
}));

export const emaMirim = criatura({
  num: 101, id: 'ema-mirim', nome: 'Ema-Mirim', porte: 'P', estagio: 'basico', paleta: { ...paletaEma, extras: { ...paletaEma.extras, f: '#f2e4c8' } }, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
void garra;
