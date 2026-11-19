/**
 * 020 · GAMBAZINHO (Comum/Veneno) — filhote de gambá-de-orelha-branca, mestre em se fingir de morto.
 * Traços únicos: cara branca com risca escura na testa e olheiras · orelhonas brancas de miolo rosa ·
 * focinho comprido de nariz rosa · rabo pelado enrolado para cima · nuvenzinha fedida lilás-limão.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, espuma, par, m, lz, lp, ls, qz, qs, type V3 } from './kits';

export const paletaGamba = {
  rampas: [
    ['#383150', '#807c94', '#c2c0cc'], // 0 pelo cinza grisalho
    ['#b3a2b0', '#f3ece4', '#ffffff'], // 1 branco da cara, barriga e orelhas
    ['#9a4868', '#e58a9c', '#ffc9c4'], // 2 rosa do nariz, patas, orelha por dentro e rabo
    ['#5b2f80', '#a060cf', '#d2f070'], // 3 fedor: lilás com brilho limão
  ] as [string, string, string][],
  contorno: '#261c34',
  extras: { w: '#ffffff', p: '#221830', f: '#f3ece4' },
};

export interface GambaP { k: number; cabeca: V3; rabo: number; orelha: number }

/** Corpo comum da linha: cara branca riscada, orelhas brancas, rabo rosa enrolado. */
export function corpoGamba(p: GambaP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = quadrupede({
    tronco: [0.27 * k, 0.2 * k, 0.2 * k], peito: 0.9,
    pernas: { alt: 0.15 * k, r: 0.055 * k, xF: 0.55, xT: -0.5, pe: [0.07 * k, 0.035 * k, 0.06 * k] },
    pescoco: { len: 0.13 * k, ang: 24, r: 0.13 * k },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.85, r0: cy * 0.52, r1: cy * 0.22, cai: 6, y: -0.25, nariz: cy * 0.22 },
    orelha: { tipo: 'redonda', alt: p.orelha, larg: p.orelha * 0.95, x: -0.15, z: 0.7, abre: 30, deita: -4 },
    cauda: { segs: 5, len: p.rabo, r0: 0.045 * k, r1: 0.028 * k, ang: -10, curva: 44 },
    olho: { r: 0.028, pos: [cx * 0.86, cy * 0.2, cz * 0.62] },
    rampas: { pelo: 0, barriga: 1, cabeca: 1, focinho: 1, nariz: 2, orelha: 1, orelhaDentro: 2, cauda: 2, pe: 2, canelaF: 0, canelaT: 0 },
  });
  const rig = kit.rig;
  // nuca cinza e risca escura da testa ao focinho
  rig.add('cabeca', calota([cx * 1.05, cy * 1.06, cz * 1.05], m(0), { de: 0, ate: 62, pos: [cx * 0.25, 0, 0], rot: [0, 0, 62] }));
  rig.add('cabeca', blob([cx * 0.62, cy * 0.2, cz * 0.2], m.sombra(0), { pos: [cx * 0.6, cy * 0.86, 0], rot: [0, 0, -26], seg: 12 }));
  par((_, s) => {
    // risca escura atrás do olho
    rig.add('cabeca', blob([cx * 0.26, cy * 0.12, cz * 0.1], m.sombra(0), { pos: [cx * 0.56, cy * 0.3, cz * 0.84 * s], rot: [0, -14 * s, 16], seg: 10 }));
    // bochecha fofa
    rig.add('cabeca', blob([cx * 0.3, cy * 0.3, cz * 0.3], m(1), { pos: [cx * 0.5, -cy * 0.45, cz * 0.7 * s], seg: 10 }));
  });
  // base do rabo ainda peluda
  rig.add('cauda1', blob([0.08 * k, 0.07 * k, 0.07 * k], m(0), { pos: [-0.02 * k, 0, 0], seg: 12 }));
  return kit;
}

/** Nuvem fedida num osso próprio: flocos lilás com miolo limão. */
export function fedor(rig: ReturnType<typeof corpoGamba>['rig'], nome: string, pos: V3, r: number) {
  rig.bone(nome, 'corpo', pos);
  rig.add(nome, espuma(r, m(3)), blob([r * 0.5, r * 0.45, r * 0.5], m.luz(3), { pos: [r * 0.1, r * 0.25, r * 0.5], seg: 8 }));
}
export const fedorAnda = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const v = [1, 1.15, 1.3, 1.1], y: V3[] = [[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.015, 0]];
  return [n, [...ls([...v.slice(i % 4), ...v.slice(0, i % 4)]), ...lp([...y.slice(i % 4), ...y.slice(0, i % 4)])]];
}));

function build() {
  const { rig } = corpoGamba({ k: 1, cabeca: [0.2, 0.18, 0.18], rabo: 0.62, orelha: 0.15 });
  fedor(rig, 'fedor1', [-0.42, 0.34, 0.1], 0.065);
  fedor(rig, 'fedor2', [-0.3, 0.5, -0.12], 0.04);
  // linguinha de fora (a encenação)
  rig.add('cabeca', blob([0.03, 0.02, 0.03], m.plano(2), { pos: [0.3, -0.13, 0.03], seg: 8 }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.6, hPerna: 0.15, mole: 1.3, cauda: 0.5 }, {
  idle: fedorAnda(['fedor1', 'fedor2']),
  especial: { fedor1: qs([1, 1.4, 1.8, 2.6, 1.6, 1]), fedor2: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), cauda3: qz([0, -10, -16, 24, 8, 0]) },
  status: fedorAnda(['fedor1', 'fedor2']),
});

export const gambazinho = criatura({
  num: 20, id: 'gambazinho', nome: 'Gambazinho', porte: 'P', estagio: 'basico', paleta: paletaGamba, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['p', 'p'],
  },
});
void lz;
