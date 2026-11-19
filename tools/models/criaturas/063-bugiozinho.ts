/**
 * 063 · BUGIOZINHO (Ginga) — bugio filhote, ruivo e barulhento.
 * Traços únicos: barba dourada em babador · papo de ressonância inflado sob o queixo ·
 * cauda preênsil enrolada em caracol com ponta cinza-tempestade · rosto escuro de boca aberta.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, tufo, ring, par, m, lz, qz, ls, qs, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';

export const paletaBugio = {
  rampas: [
    ['#7a2a3c', '#c2542c', '#ee9a46'], // 0 pelo ruivo (sombra vinho)
    ['#2c1d33', '#553846', '#8a6470'], // 1 rosto, mãos e pés (ameixa)
    ['#d0832a', '#f8cc44', '#fff6a8'], // 2 barba dourada, papo e raios
    ['#3b3a70', '#6d70b4', '#b0bcec'], // 3 cinza-azulado de nuvem de trovoada
  ] as [string, string, string][],
  contorno: '#2a1528',
  extras: { w: '#ffffff', p: '#2a1528', f: '#553846', a: '#f8cc44' },
};

export interface BugioP { k: number; cabeca: V3; bracos: number; papo: number; cauda: number }

/** Corpo comum da linha: agachado, rosto escuro, barba em babador, papo num osso próprio, cauda em caracol. */
export function corpoBugio(p: BugioP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.2 * k, 0.23 * k, 0.2 * k], curva: 26,
    pernas: { alt: 0.15 * k, r: 0.07 * k, pe: 0.1 * k },
    bracos: { len: p.bracos, r: 0.065 * k, mao: 0.065 * k },
    cabeca: p.cabeca, rosto: 0.62, focinho: { len: cx * 0.36, r: cy * 0.36 },
    orelha: { r: cy * 0.22, z: 0.92, y: 0.05 },
    cauda: { segs: 4, len: p.cauda, r0: 0.06 * k, r1: 0.045 * k, ang: 12, curva: 44 },
    olho: { r: 0.028, pos: [cx * 0.88, cy * 0.22, cz * 0.4] },
    rampas: { pelo: 0, rosto: 1, maos: 1, orelha: 1, cauda: 0, caudaPonta: 3 },
  });
  const rig = kit.rig;
  // boca aberta de uivo
  rig.add('cabeca', blob([cx * 0.1, cy * 0.15, cz * 0.2], m.sombra(1), { pos: [cx * 1.18, -cy * 0.36, 0], seg: 10 }));
  // barba em babador + papo de ressonância
  rig.add('cabeca', blob([cx * 0.55, cy * 0.4, cz * 0.95], m(2), { pos: [cx * 0.42, -cy * 0.72, 0] }));
  rig.bone('papo', 'cabeca', [cx * 0.6, -cy * 0.95, 0]);
  rig.add('papo', blob([p.papo, p.papo * 0.9, p.papo * 1.1], m.luz(2)));
  // sobrancelha peluda
  rig.add('cabeca', blob([cx * 0.3, cy * 0.16, cz * 0.8], m(0), { pos: [cx * 0.72, cy * 0.52, 0] }));
  return kit;
}

/** O papo incha no idle e estoura no especial (o uivo). */
export const uivo = {
  idle: { papo: ls([1, 1.1, 1.2, 1.08]) },
  especial: { papo: qs([1, 1.3, 1.5, 0.8, 1.2, 1]), pescoco: qz([0, -8, -12, 22, 10, 0]) },
  dano: { papo: qs([0.7, 0.9, 1]) },
};

function build() {
  const { rig, ref } = corpoBugio({ k: 0.95, cabeca: [0.22, 0.2, 0.21], bracos: 0.6, papo: 0.085, cauda: 0.95 });
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.03, 0], [0, 0, 24]);
  rig.add('topete', tufo(2, 0.12, 0.06, m(0), { abre: 26 }));
  par((_, s) => rig.add('tronco', blob([0.07, 0.1, 0.05], m.luz(0), { pos: [0.02, 0.1, 0.19 * s], seg: 12 })));
  rig.add('cauda4', ring(0.05, 0.022, m.luz(3), { pos: [-0.1, 0, 0], rot: [0, 90, 0] }));
  return rig;
}

const anims = animsArboricola({ u: 0.75, hPerna: 0.14, mole: 1.2, caudaSegs: 2 }, unirExtras(unirExtras(bracosCurtos, uivo), {
  idle: { topete: lz([0, 6, 10, 3]) },
}));

export const bugiozinho = criatura({
  num: 63, id: 'bugiozinho', nome: 'Bugiozinho', porte: 'P', estagio: 'basico', paleta: paletaBugio, build, anims,
  olho: {
    frente: ['fwwf', 'wwpp', 'wwpp', 'fwwf'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
