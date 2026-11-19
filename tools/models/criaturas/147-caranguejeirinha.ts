/**
 * 147 · CARANGUEJEIRINHA (Inseto/Veneno) — aranha-caranguejeira filhote, que guarda as cascas das mudas para assustar visitas.
 * Traços únicos: oito patas GROSSAS e peludas de joelho salmão · abdômen peludo com topete rosado ·
 * presinhas verde-veneno · olhões de filhote com dois olhinhos extras na testa · palpos curtos erguidos.
 * O construtor `aranha` é reaproveitado pelo Caranguejeirão.
 */
import { criatura, aracnideo, animsAracnideo, blob, spike, tufo, segmento, par, m, lz, qr, type Rig, type V3 } from './kits';

export const paletaAranha = {
  rampas: [
    ['#2c1c30', '#5e3e48', '#9c7670'], // 0 pelo castanho-escuro
    ['#a2445e', '#f08e86', '#ffd2ba'], // 1 pelos salmão dos joelhos e do topete
    ['#38882c', '#98e04a', '#f2ffaa'], // 2 verde-veneno das presas
    ['#988a82', '#dacec2', '#fffbf2'], // 3 casca de muda (palha clara)
  ] as [string, string, string][],
  contorno: '#1e1224',
  extras: { w: '#ffffff', p: '#1a0e20', f: '#5e3e48', a: '#98e04a' },
};

export const tarsosAranha = { desmaio: Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3, 4].map((i) => [`tarso${i}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? 14 : -14, 0, 0], [l === 'd' ? 30 : -30, 0, 0], [l === 'd' ? 28 : -28, 0, 0]])]))) };

export interface AranhaP { k: number; alt: number; /** raio das patas */ r: number; abre: number; presa: number }

/** Caranguejeira: corpo + abdômen do kit, patas grossas com joelheira de pelo salmão, presas e palpos. */
export function aranha(p: AranhaP): { rig: Rig; c: V3; J: number } {
  const k = p.k, c: V3 = [0.21 * k, 0.17 * k, 0.2 * k], J = 0.17 * k;
  const { rig } = aracnideo({
    corpo: c, alt: p.alt, abdomen: { r: [0.23 * k, 0.2 * k, 0.21 * k], ang: 14 },
    patas: { pares: 4, abre: p.abre, r: p.r, joelho: J },
    olho: { r: 0.04 * Math.min(k, 1.1), pos: [0.185 * k, 0.06 * k, 0.09 * k] },
    rampas: { corpo: 0, abdomen: 0, patas: 0, pontas: 0 },
  });
  par((l, s) => {
    // patas em LEQUE (as do kit descem paralelas e viram uma cortina): refaz os dois segmentos de cada uma
    [52, 80, 112, 148].forEach((az, i) => {
      const co = Math.cos(az * Math.PI / 180), si = Math.sin(az * Math.PI / 180) * s;
      const a = rig.bones[`pata${i + 1}_${l}`], b = rig.bones[`tarso${i + 1}_${l}`];
      a.clear(); b.clear(); a.add(b);
      a.position.set(c[0] * 0.7 * co, -c[1] * 0.1, c[2] * 0.75 * si);
      const j: V3 = [co * p.abre * 0.6, J, si * p.abre * 0.6], f: V3 = [co * p.abre * 0.55, -(J + p.alt - c[1] * 0.1) + p.r * 0.5, si * p.abre * 0.55];
      b.position.set(...j);
      rig.add(`pata${i + 1}_${l}`, segmento([0, 0, 0], j, p.r, p.r * 1.05, m(0)), blob([p.r * 1.35, p.r * 1.25, p.r * 1.35], m(1), { pos: j, seg: 10 }));
      rig.add(`tarso${i + 1}_${l}`, segmento([0, 0, 0], f, p.r * 1.05, p.r * 0.7, m(0)), blob([p.r * 1.0, p.r * 0.8, p.r * 1.0], m.luz(0), { pos: f, seg: 8 }));
    });
    // palpos curtos erguidos e presas verde-veneno
    rig.bone('palpo_' + l, 'corpo', [c[0] * 0.8, -c[1] * 0.35, c[2] * 0.55 * s], [0, -30 * s, -10]);
    rig.add('palpo_' + l, blob([0.09 * k, 0.05 * k, 0.05 * k], m(0), { pos: [0.07 * k, 0, 0], seg: 10 }), blob([0.045 * k, 0.045 * k, 0.045 * k], m(1), { pos: [0.15 * k, 0.01 * k, 0], seg: 8 }));
    rig.add('corpo', blob([0.05 * k, 0.07 * k, 0.05 * k], m(0), { pos: [c[0] * 0.95, -c[1] * 0.45, 0.05 * k * s], seg: 10 }), spike(p.presa, p.presa * 0.36, m.plano(2), { pos: [c[0] * 0.98, -c[1] * 0.7, 0.05 * k * s], rot: [0, 0, 170] }));
    // olhinhos extras na testa
    rig.add('corpo', blob([0.018 * k, 0.02 * k, 0.018 * k], m.sombra(0), { pos: [0.16 * k, 0.135 * k, 0.04 * k * s], seg: 6, castShadow: false }));
  });
  // sulco do dorso e faixa de pelo claro no abdômen
  rig.add('corpo', blob([0.06 * k, 0.03 * k, 0.06 * k], m.luz(0), { pos: [-0.02 * k, 0.14 * k, 0], seg: 8, castShadow: false }));
  return { rig, c, J };
}

function build() {
  const { rig } = aranha({ k: 1, alt: 0.17, r: 0.045, abre: 0.27, presa: 0.1 });
  // topete rosado no alto do abdômen
  rig.bone('topete', 'abdomen', [-0.2, 0.18, 0], [0, 0, 20]);
  rig.add('topete', tufo(3, 0.13, 0.05, m(1), { abre: 34 }));
  // bochechas salmão
  par((_, s) => rig.add('corpo', blob([0.03, 0.03, 0.04], m.plano(1), { pos: [0.175, -0.02, 0.11 * s], seg: 8, castShadow: false })));
  return rig;
}

const anims = animsAracnideo({ u: 0.55, alt: 0.17, pares: 4, mole: 1 }, {
  ...tarsosAranha,
  idle: { topete: lz([0, 6, 10, 4]), palpo_d: lz([0, 10, 18, 6]), palpo_e: lz([18, 6, 0, 10]) },
  fisico: { palpo_d: [{ t: 0, r: [0, 0, 20] }, { t: 0.5, r: [0, 0, -30] }, { t: 1, r: [0, 0, 0] }], palpo_e: [{ t: 0, r: [0, 0, 20] }, { t: 0.5, r: [0, 0, -30] }, { t: 1, r: [0, 0, 0] }] },
});

export const caranguejeirinha = criatura({
  num: 147, id: 'caranguejeirinha', nome: 'Caranguejeirinha', porte: 'P', estagio: 'basico', paleta: paletaAranha, build, anims,
  olho: {
    frente: ['.ww.', 'wwpw', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', '.ww.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
