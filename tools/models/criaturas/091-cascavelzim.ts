/**
 * 091 · CASCAVELZIM (Veneno/Terra) — cascavel filhote enroladinha.
 * Traços únicos: corpo em rosca com a cabeça espiando do meio · losangos escuros de miolo claro ·
 * chocalhinho de dois gomos em pé, tremendo · sobrancelhas emburradas de escama.
 */
import { criatura, serpente, animsSerpente, blob, par, m, lz, qz, type Rig, type Mat } from './kits';
import { voltaCobra, extrasCobra } from './086-sucurizinha';

export const paletaCascavel = {
  rampas: [
    ['#7a5348', '#c99c60', '#f2d08e'], // 0 areia do corpo (sombra rosada)
    ['#3a2a36', '#6c4a3c', '#98705a'], // 1 losangos e riscas
    ['#b8a08c', '#f3e7cd', '#fffbf0'], // 2 creme da barriga, miolo dos losangos e couro do tambor
    ['#74283a', '#c44a38', '#f38b56'], // 3 chocalho de barro vermelho
  ] as [string, string, string][],
  contorno: '#2e1c28',
  extras: { w: '#ffffff', p: '#2e1c28', f: '#c99c60', a: '#f2c53a' },
};

/** Losangos em volta de uma volta do corpo: bolota escura com miolo claro. */
export function losangosVolta(rig: Rig, osso: string, y: number, raio: number, esp: number, n: number, escuro: Mat, claro: Mat, fase = 0) {
  for (let i = 0; i < n; i++) {
    const a = ((i + fase) / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    rig.add(osso, blob([esp * 0.62, esp * 0.62, esp * 0.62], escuro, { pos: [c * (raio + esp * 0.5), y + esp * 0.2, s * (raio + esp * 0.5)], seg: 10, castShadow: false }));
    rig.add(osso, blob([esp * 0.32, esp * 0.32, esp * 0.32], claro, { pos: [c * (raio + esp * 0.86), y + esp * 0.24, s * (raio + esp * 0.86)], seg: 8, castShadow: false }));
  }
}

const CURVA = [60, 20, -40];

function build() {
  const r = 0.1;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.11, curva: CURVA, rFim: 0.095 },
    cauda: { segs: 2, len: 0.14, curva: [0, 0], rFim: 0.05 },
    cabeca: [0.19, 0.125, 0.155],
    olho: { r: 0.03, pos: [0.12, 0.07, 0.105] },
    rampas: { corpo: 0, barriga: 2, cabeca: 0 },
  });
  // rosca: uma volta larga no chão e outra menor por cima; pescoço sai do miolo, cauda sobe por trás
  rig.bones.corpo.position.set(0.02, 0.24, 0);
  voltaCobra(rig, 'base', [0, 0.11, 0], 0.26, 0.11, m(0), m(2));
  voltaCobra(rig, 'base', [0, 0.27, 0], 0.16, 0.1, m(0), null, [-5, 4]);
  losangosVolta(rig, 'base', 0.11, 0.26, 0.11, 7, m.plano(1), m.luz(2), 0.3);
  rig.bones.cauda1.position.set(-0.24, 0.04, 0.08); rig.bones.cauda1.rotation.z = -1.25; rig.bones.cauda2.rotation.z = -0.25;
  // chocalhinho de dois gomos + botão claro
  rig.bone('guizo', 'cauda2', [-0.14, 0.05 - r, 0]);
  rig.add('guizo', blob([0.05, 0.062, 0.062], m(3), { pos: [-0.03, 0, 0], seg: 12 }), blob([0.045, 0.052, 0.052], m(3), { pos: [-0.1, 0, 0], seg: 12 }), blob([0.035, 0.036, 0.036], m.luz(2), { pos: [-0.16, 0, 0], seg: 10 }));
  // cabeça: bochechas, sobrancelha emburrada, risca atrás do olho
  par((_, s) => {
    rig.add('cabeca', blob([0.09, 0.08, 0.075], m(0), { pos: [0.02, 0.0, 0.11 * s], seg: 14 }));
    rig.add('cabeca', blob([0.075, 0.03, 0.045], m(1), { pos: [0.125, 0.115, 0.085 * s], rot: [0, 10 * s, -24], seg: 10 }));
    rig.add('cabeca', blob([0.08, 0.024, 0.02], m.plano(1), { pos: [0.02, 0.035, 0.18 * s], rot: [0, 14 * s, 16], seg: 10 }));
  });
  rig.add('cabeca', blob([0.05, 0.03, 0.045], m.plano(1), { pos: [0.02, 0.118, 0], seg: 10, castShadow: false }));
  return rig;
}

const ex = extrasCobra(CURVA, 2);
const anims = animsSerpente({ u: 0.5, pescoco: 3, cauda: 2, mole: 1.1, mapa: { comp: 1, larg: 1, frontal: 1.1, cabeca: 1.2 } }, {
  fisico: { pescoco1: qz([6, 12, -10, -4, 0]), pescoco2: qz([6, 12, -10, -4, 0]), pescoco3: qz([6, 12, -10, -4, 0]) },
  desmaio: { pescoco1: qz([4, -6, -20, -40, -38]), pescoco2: qz([0, -4, -16, -30, -28]), pescoco3: qz([0, 0, -6, -12, -10]), cabeca: qz([0, 4, 10, 18, 16]), cauda1: qz([0, 10, 30, 60, 56]) },
  todas: { guizo: lz([14, -14, 12, -12]) },
  idle: { cauda1: [{ t: 0, r: [0, 0, 0] }] },
  andar: { cauda1: [{ t: 0, r: [0, 0, 0] }], cauda2: [{ t: 0, r: [0, 0, 0] }] },
  especial: { cauda1: qz([0, -8, -12, 10, 4, 0]), cauda2: qz([0, 0, 0, 0, 0, 0]) },
});
void ex;

export const cascavelzim = criatura({
  num: 91, id: 'cascavelzim', nome: 'Cascavelzim', porte: 'P', estagio: 'basico', paleta: paletaCascavel, build, anims,
  olho: {
    frente: ['pppp', 'appw', 'appa', '.aa.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['a', 'p'],
  },
});
