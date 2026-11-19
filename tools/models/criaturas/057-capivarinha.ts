/**
 * 057 · CAPIVARINHA (Comum/Rio) — filhote de capivara, o roedor mais sossegado do brejo.
 * Traços únicos: focinho quadradão de nariz escuro · olhinho de quem não liga para nada, bem no alto ·
 * orelhinhas redondas lá atrás · folha de vitória-régia de chapéu, com flor · gotas escorrendo · sem rabo.
 */
import { criatura, quadrupede, animsQuadrupede, blob, ring, par, m, lz, lp, qp, type V3 } from './kits';

export const paletaCapivara = {
  rampas: [
    ['#5c3a3c', '#a9743c', '#deb06a'], // 0 pelo castanho
    ['#2c1f2e', '#583c3c', '#89634e'], // 1 nariz, patas e orelhas escuras
    ['#27684a', '#5ab84e', '#b8e878'], // 2 folha de vitória-régia
    ['#56a6e0', '#f8cc30', '#fffbe8'], // 3 trio chapado: água (sombra) · amarelo (base) · branco (luz)
  ] as [string, string, string][],
  contorno: '#2a1a26',
  extras: { w: '#ffffff', p: '#241620', f: '#a9743c' },
};

export interface CapivaraP { k: number; tronco: V3; cabeca: V3; alt: number }

/** Corpo comum da linha: barril sem rabo, focinho quadrado, olho alto, orelhas atrás. */
export function corpoCapivara(p: CapivaraP) {
  const [cx, cy, cz] = p.cabeca, k = p.k;
  const kit = quadrupede({
    tronco: p.tronco, peito: 0.94,
    pernas: { alt: p.alt, r: 0.065 * k, rFim: 0.055 * k, xF: 0.55, xT: -0.55, z: 0.6, pe: [0.075 * k, 0.04 * k, 0.07 * k] },
    pescoco: { len: 0.1 * k, ang: 22, r: 0.15 * k, x: 0.62, y: 0.2 },
    cabeca: p.cabeca,
    focinho: { len: cx * 0.75, r0: cy * 0.8, r1: cy * 0.7, cai: 4, y: -0.12 },
    orelha: { tipo: 'redonda', alt: cy * 0.42, larg: cy * 0.46, x: -0.45, z: 0.72, abre: 26, deita: -10 },
    olho: { r: 0.026, pos: [cx * 0.5, cy * 0.52, cz * 0.82] },
    rampas: { pelo: 0, canelaF: 1, canelaT: 1, pe: 1, orelha: 1 },
  });
  const rig = kit.rig;
  // ponta do focinho escura (nariz largo) e risca da boca
  rig.add('cabeca', blob([cx * 0.2, cy * 0.5, cz * 0.62], m(1), { pos: [cx * 1.55, cy * 0.05, 0], seg: 14 }));
  rig.add('cabeca', blob([cx * 0.4, cy * 0.05, cz * 0.7], m.sombra(1), { pos: [cx * 1.25, -cy * 0.55, 0], seg: 10 }));
  // barriga e garupa mais claras
  rig.add('corpo', blob([p.tronco[0] * 0.8, p.tronco[1] * 0.6, p.tronco[2] * 0.9], m.sombra(0), { pos: [0, -p.tronco[1] * 0.5, 0], seg: 16 }));
  rig.add('corpo', blob([p.tronco[0] * 0.5, p.tronco[1] * 0.5, p.tronco[2] * 0.8], m.luz(0), { pos: [-p.tronco[0] * 0.2, p.tronco[1] * 0.56, 0], seg: 14 }));
  return kit;
}

/** Folha de vitória-régia de chapéu (osso próprio), com flor. */
export function chapeuRegia(rig: ReturnType<typeof corpoCapivara>['rig'], pos: V3, r: number, tomba: number) {
  rig.bone('folha', 'cabeca', pos, [0, 0, tomba]);
  rig.add('folha', blob([r, r * 0.12, r], m(2), { seg: 20 }), ring(r * 0.94, r * 0.11, m.luz(2), { rot: [90, 0, 0], pos: [0, r * 0.1, 0] }),
    blob([r * 0.36, r * 0.3, r * 0.36], m.luz(3), { pos: [-r * 0.2, r * 0.3, r * 0.1], seg: 10 }), blob([r * 0.16, r * 0.16, r * 0.16], m.plano(3), { pos: [-r * 0.2, r * 0.5, r * 0.1], seg: 8 }));
}
export function pingo(rig: ReturnType<typeof corpoCapivara>['rig'], nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos);
  rig.add(nome, blob([r, r * 1.3, r], m.sombra(3), { seg: 10 }), blob([r * 0.4, r * 0.4, r * 0.4], m.luz(3), { pos: [r * 0.2, r * 0.4, -r * 0.4], seg: 6 }));
}
export const escorre = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => { const y: V3[] = [[0, 0, 0], [0, -0.02, 0], [0, -0.05, 0], [0, -0.09, 0]]; return [n, lp([...y.slice(i % 4), ...y.slice(0, i % 4)])]; }));

function build() {
  const { rig, ref } = corpoCapivara({ k: 1, tronco: [0.27, 0.21, 0.2], cabeca: [0.17, 0.15, 0.15], alt: 0.13 });
  chapeuRegia(rig, [ref.topo[0] - 0.02, ref.topo[1] + 0.0, 0], 0.15, 8);
  pingo(rig, 'pingo1', 'cabeca', [0.02, 0.1, 0.17], 0.03);
  pingo(rig, 'pingo2', 'corpo', [-0.2, 0.16, 0.19], 0.03);
  // tufinho de pelo espetado na garupa
  par((_, s) => rig.add('corpo', blob([0.05, 0.035, 0.03], m(0), { pos: [-0.27, 0.06, 0.06 * s], rot: [0, 0, 30], seg: 8 })));
  return rig;
}

const anims = animsQuadrupede({ u: 0.55, hPerna: 0.13, mole: 1.2 }, {
  idle: { ...escorre(['pingo1', 'pingo2']), folha: lz([0, 2, 5, 2]) },
  dano: { folha: qp([[-0.02, 0.06, 0], [-0.01, 0.02, 0], [0, 0, 0]]) },
});

export const capivarinha = criatura({
  num: 57, id: 'capivarinha', nome: 'Capivarinha', porte: 'P', estagio: 'basico', paleta: paletaCapivara, build, anims,
  olho: {
    frente: ['ffff', 'pppp', 'pwpp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
