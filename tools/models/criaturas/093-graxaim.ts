/**
 * 093 · GRAXAIM (Comum/Assombro) — graxaim-do-mato, raposinha grisalha que some na neblina da madrugada.
 * Traços únicos: pelo grisalho de lombo escuro · meias pretas · rabo peludo de ponta preta que solta névoa ·
 * orelhas pontudas grandes · bochechas creme · tufos de névoa aos pés.
 */
import { criatura, quadrupede, animsQuadrupede, blob, espuma, par, m, lz, ls, lp, qs, type V3 } from './kits';

export const paletaGraxaim = {
  rampas: [
    ['#383246', '#827884', '#c8bcb0'], // 0 pelo grisalho
    ['#b3a092', '#f2e4cc', '#fffaf0'], // 1 creme do peito e das bochechas
    ['#1b1725', '#373143', '#5d576f'], // 2 meias, lombo e ponta do rabo
    ['#5868b0', '#a8c0f0', '#f0f8ff'], // 3 névoa azulada
  ] as [string, string, string][],
  contorno: '#1e1828',
  extras: { w: '#ffffff', p: '#17121f', f: '#827884', a: '#a8c0f0' },
};

export interface GraxaimP { k: number; cabeca: V3; rabo: number; nevoa?: boolean }

/** Corpo comum da linha: raposa esguia de meias escuras e rabo peludo. `nevoa` troca as pernas por neblina. */
export function corpoGraxaim(p: GraxaimP) {
  const k = p.k, [cx, cy, cz] = p.cabeca, perna = p.nevoa ? 3 : 2;
  const kit = quadrupede({
    tronco: [0.26 * k, 0.18 * k, 0.16 * k], peito: 1.08,
    pernas: { alt: 0.27 * k, r: 0.052 * k, rFim: 0.04 * k, xF: 0.6, xT: -0.6, dobraT: -26, pe: [0.06 * k, 0.035 * k, 0.05 * k] },
    pescoco: { len: 0.17 * k, ang: 52, r: 0.1 * k, x: 0.62, y: 0.3 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.85, r0: cy * 0.5, r1: cy * 0.26, cai: 8, y: -0.22, nariz: cy * 0.2 },
    orelha: { tipo: 'ponta', alt: cy * 1.15, larg: cy * 0.8, x: -0.1, z: 0.62, abre: 24, deita: -4 },
    cauda: { segs: 3, len: p.rabo, r0: 0.08 * k, r1: 0.1 * k, ang: -30, curva: -8 },
    olho: { r: 0.027, pos: [cx * 0.84, cy * 0.24, cz * 0.6] },
    rampas: { pelo: 0, barriga: 1, canelaF: perna, canelaT: perna, pe: perna, nariz: 2, orelha: 0, orelhaDentro: 1, cauda: 0, caudaPonta: 2 },
  });
  const rig = kit.rig;
  // lombo escuro, bochechas e queixo creme
  rig.add('corpo', blob([0.22 * k, 0.07 * k, 0.1 * k], m(2), { pos: [-0.02 * k, 0.115 * k, 0], seg: 14 }));
  par((_, s) => rig.add('cabeca', blob([cx * 0.36, cy * 0.34, cz * 0.3], m(1), { pos: [cx * 0.5, -cy * 0.4, cz * 0.66 * s], seg: 10 })));
  rig.add('cabeca', blob([cx * 0.5, cy * 0.2, cz * 0.4], m(1), { pos: [cx * 0.95, -cy * 0.5, 0], seg: 10 }));
  rig.add('pescoco', blob([0.07 * k, 0.11 * k, 0.09 * k], m(1), { pos: [0.08 * k, 0.02 * k, 0], seg: 12 }));
  return kit;
}
export function nevoa(rig: ReturnType<typeof corpoGraxaim>['rig'], nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos); rig.add(nome, espuma(r, m.luz(3)), blob([r * 0.7, r * 0.5, r * 0.7], m(3), { pos: [0, -r * 0.4, 0], seg: 8 }));
}
export const nevoaAnda = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const v = [1, 1.15, 1.3, 1.1], x: V3[] = [[0, 0, 0], [-0.015, 0.01, 0], [-0.03, 0.02, 0], [-0.01, 0.01, 0]];
  return [n, [...ls([...v.slice(i % 4), ...v.slice(0, i % 4)]), ...lp([...x.slice(i % 4), ...x.slice(0, i % 4)])]];
}));

function build() {
  const { rig } = corpoGraxaim({ k: 1, cabeca: [0.18, 0.16, 0.16], rabo: 0.48 });
  nevoa(rig, 'nevoa1', 'cauda3', [-0.2, 0.04, 0], 0.07);
  nevoa(rig, 'nevoa2', 'base', [-0.26, 0.05, 0.16], 0.06);
  nevoa(rig, 'nevoa3', 'base', [0.3, 0.04, -0.14], 0.05);
  return rig;
}

const anims = animsQuadrupede({ u: 0.7, hPerna: 0.27, mole: 1.1 }, {
  todas: nevoaAnda(['nevoa1', 'nevoa2', 'nevoa3']),
  especial: { nevoa1: qs([1, 1.4, 1.8, 2.4, 1.5, 1]) },
});

export const graxaim = criatura({
  num: 93, id: 'graxaim', nome: 'Graxaim', porte: 'P', estagio: 'basico', paleta: paletaGraxaim, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
void lz;
