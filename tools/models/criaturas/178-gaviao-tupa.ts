/**
 * 178 · GAVIÃO-TUPÃ (Lenda/Trovão) — o gavião que carrega a voz do trovão. Lendário.
 * Traços: asas de tempestade abertas de ponta a ponta, com primárias em leque de borda elétrica ·
 * crista de três raios · cabeça branca de gavião-real com faixa escura no olho · peito branco barrado ·
 * pousado numa nuvem de trovoada que solta dois raios até o chão · cauda de penas em zigue-zague ·
 * garras douradas enormes agarrando a nuvem.
 */
import { criatura, ave, animsAve, blob, calota, pena, slab, garra, espuma, par, m, lz, qz, ls, lp, D2R, type V2, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#1f2552', '#3c5296', '#7ea2dc'], // 0 azul-tempestade das asas e do dorso
    ['#a3b0d0', '#eef3fb', '#ffffff'], // 1 branco da cabeça e do peito
    ['#e08a18', '#ffdc3c', '#fffcc8'], // 2 raio: crista, bico, garras, bordas
    ['#231c38', '#474060', '#8b86a6'], // 3 nuvem de trovoada, faixa do olho, pontas das asas
  ] as [string, string, string][],
  contorno: '#161432',
  extras: { w: '#ffffff', p: '#161432', f: '#eef3fb', a: '#ffdc3c', n: '#474060' },
};

/** Raio: placa em zigue-zague crescendo em +Y, da largura `w` até a ponta. */
function raio(len: number, w: number, mat: ReturnType<typeof m>, o: { pos?: V3; rot?: V3 } = {}) {
  const pts: V2[] = [[-w * 0.5, 0], [w * 0.5, 0], [w * 0.2, len * 0.36], [w * 0.75, len * 0.4], [0.02, len], [-w * 0.1, len * 0.56], [-w * 0.7, len * 0.52]];
  return slab(pts, 0.04, mat, o);
}

const RAIOS = ['raio1', 'raio2', 'crista1', 'crista2', 'crista3'];

function build() {
  const { rig, ref } = ave({
    corpo: [0.31, 0.27, 0.25], ergue: 60,
    pescoco: { len: 0.16, ang: 76, r: 0.16 },
    cabeca: [0.2, 0.18, 0.18],
    bico: { len: 0.2, r: 0.085, y: -0.08, achata: 0.75, gancho: 70, inferior: 0.5 },
    asa: { len: 0.6, larg: 0.34, cai: 0, ponta: 0.5 },
    cauda: { len: 0.4, larg: 0.13, ang: -30, penas: 5, abre: 30 },
    pernas: { alt: 0.24, r: 0.045, z: 0.56, x: -0.06, dedo: 0.16 },
    olho: { r: 0.026, pos: [0.125, 0.035, 0.16] },
    rampas: { corpo: 0, peito: 1, cabeca: 1, asa: 0, asaPonta: 3, cauda: 0, bico: 2, perna: 2 },
  });
  for (const o of ['canela_d', 'canela_e']) rig.bones[o].traverse((x) => { const mesh = x as { isMesh?: boolean; material?: unknown }; if (mesh.isMesh) mesh.material = m.plano(2); });
  // NUVEM de trovoada sob as garras, com dois raios até o chão
  const H = 0.54;
  rig.bones.corpo.position.y += H;
  const flocos: [V3, number][] = [[[0, 0.4, 0], 0.2], [[0.24, 0.38, 0.1], 0.15], [[-0.26, 0.39, -0.06], 0.16], [[0.05, 0.38, -0.24], 0.14], [[-0.08, 0.38, 0.26], 0.14], [[0.34, 0.34, -0.14], 0.1], [[-0.4, 0.34, 0.14], 0.1]];
  flocos.forEach(([p, r], i) => rig.add('base', espuma(r, i % 3 === 0 ? m.luz(3) : m(3), { pos: p })));
  rig.add('base', blob([0.44, 0.1, 0.36], m.sombra(3), { pos: [-0.02, 0.31, 0] }));
  rig.bone('raio1', 'base', [0.2, 0.3, -0.16], [0, 40, 180]); rig.add('raio1', raio(0.3, 0.2, m.plano(2)));
  rig.bone('raio2', 'base', [-0.26, 0.3, 0.1], [0, -30, 172]); rig.add('raio2', raio(0.3, 0.18, m.plano(2)));
  // ASAS abertas de ponta a ponta, erguidas; leque de primárias com borda elétrica
  par((l, s) => {
    rig.bones['asa_' + l].rotation.set(0, 74 * s * D2R, -34 * D2R);
    rig.bones['asa2_' + l].rotation.z = -10 * D2R;
    rig.add('asa_' + l, blob([0.3, 0.09, 0.06], m.luz(0), { pos: [-0.22, 0.1, 0.03 * s], rot: [0, 0, 4], seg: 12 }));
    for (let i = 0; i < 5; i++) {
      const g = -52 + i * 27, len = 0.56 - Math.abs(i - 1.5) * 0.05;
      rig.add('asa2_' + l, pena(len, 0.115, i % 2 ? m.sombra(0) : m(0), { esp: 0.05, pos: [0.14, -0.02, 0.01 * s * i], rot: [0, 0, g] }));
      rig.add('asa2_' + l, pena(len * 0.3, 0.11, i % 2 ? m.luz(2) : m(3), { esp: 0.056, pos: [0.14 - Math.cos(g * D2R) * len * 0.7, -0.02 - Math.sin(g * D2R) * len * 0.7, 0.012 * s * i], rot: [0, 0, g] }));
    }
    // secundárias: três penas claras ao longo do braço
    for (let i = 0; i < 3; i++) rig.add('asa_' + l, pena(0.3, 0.14, m(0), { esp: 0.05, pos: [-0.1 - i * 0.16, -0.08, 0.02 * s], rot: [0, 0, 74 - i * 8] }), pena(0.1, 0.12, m.luz(0), { esp: 0.056, pos: [-0.16 - i * 0.2, -0.34 + i * 0.01, 0.02 * s], rot: [0, 0, 74 - i * 8] }));
    // faixa escura do olho, sobrancelha e calções
    rig.add('cabeca', blob([0.13, 0.035, 0.03], m.plano(3), { pos: [0.02, 0.03, 0.165 * s], rot: [0, 10 * s, 8], seg: 10 }));
    rig.add('cabeca', blob([0.11, 0.03, 0.04], m.sombra(3), { pos: [0.1, 0.1, 0.13 * s], rot: [0, 12 * s, -20], seg: 10 }));
    rig.add('perna_' + l, blob([0.11, 0.15, 0.1], m(0), { pos: [0, -0.05, 0], seg: 14 }), blob([0.09, 0.022, 0.105], m.luz(0), { pos: [0.01, -0.1, 0], seg: 10 }));
    for (const g of [-34, 0, 34]) rig.add('canela_' + l, garra(0.1, 0.034, m.luz(2), { pos: [Math.cos(g * D2R) * 0.15 - 0.014, -0.125, -Math.sin(g * D2R) * 0.15], rot: [0, g, 0], curva: 0.9 }));
  });
  // crista de três raios
  for (const [i, z, g, len] of [[1, 0, 16, 0.34], [2, 0.07, 44, 0.26], [3, -0.07, 44, 0.26]] as const) {
    rig.bone('crista' + i, 'cabeca', [ref.topo[0] - 0.04 - (i > 1 ? 0.05 : 0), ref.topo[1] - 0.03, z], [z * 300, 0, g]);
    rig.add('crista' + i, raio(len, 0.12, i === 1 ? m.luz(2) : m(2)));
  }
  // peito branco barrado e colar escuro
  rig.add('pescoco', calota([0.2, 0.18, 0.21], m(3), { de: 40, ate: 100, rot: [0, 0, 74] }));
  for (const [x, y] of [[0.2, 0.04], [0.24, -0.06], [0.22, -0.16]] as const) rig.add('tronco', blob([0.03, 0.025, 0.15], m.plano(0), { pos: [x + 0.03, y, 0], rot: [0, 0, -30], seg: 10, castShadow: false }));
  // cauda em zigue-zague: faixa clara e pontas de raio
  rig.add('cauda1', blob([0.035, 0.032, 0.2], m.luz(0), { pos: [-0.18, 0, 0], seg: 10 }));
  for (const z of [-0.14, 0, 0.14]) rig.add('cauda1', raio(0.2, 0.1, m.luz(2), { pos: [-0.3, 0, z], rot: [0, 0, 90] }));
  return rig;
}

const pisca = (f: number) => ls([[1, 1, 1], [1.15, 0.8, 1], [0.9, 1.12, 1], [1.05, 0.95, 1]].map((_, k, v) => v[(k + f) % 4] as V3));
const bate = (v: number[]) => ({ asa_d: v.map((a, i) => ({ t: i / (v.length - 1), r: [0, 0, a] as V3, e: 'linear' as const })), asa_e: v.map((a, i) => ({ t: i / (v.length - 1), r: [0, 0, a] as V3, e: 'linear' as const })) });
const anims = animsAve({ u: 1.4, hPerna: 0.24, mole: 0.5 }, {
  todas: Object.fromEntries(RAIOS.map((r, i) => [r, pisca(i)])),
  // as asas já estão abertas: o kit não precisa abri-las, só batem (Rz)
  entrada: bate([-30, 20, -14, 4, 0]),
  idle: { asa_d: lz([0, 4, 8, 3]), asa_e: lz([0, 4, 8, 3]), asa2_d: lz([0, 3, 6, 2]), asa2_e: lz([0, 3, 6, 2]) },
  fisico: bate([-10, -24, 30, 10, 0]),
  especial: { ...bate([0, -14, -22, 34, 12, 0]), raio1: ls([1, 1.2, 1.5, [1.4, 2.0, 1], 1.3, 1]), raio2: ls([1, 1.2, 1.5, [1.4, 2.0, 1], 1.3, 1]) },
  dano: bate([-20, -8, 0]),
  desmaio: { ...bate([0, 10, 30, 56, 54]), raio1: ls([1, 0.7, 0.4, 0.1, 0.1]), raio2: ls([1, 0.7, 0.4, 0.1, 0.1]), corpo: lp([[0, 0, 0]]) },
  status: { asa_d: lz([20, 22, 20, 18]), asa_e: lz([20, 22, 20, 18]) },
  andar: { asa_d: lz([-10, 14, -10, 14]), asa_e: lz([-10, 14, -10, 14]) },
});

export const gaviaoTupa = criatura({
  num: 178, id: 'gaviao-tupa', nome: 'Gavião-Tupã', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['nnnnn.', 'naapn.', 'napwn.', '.nnn..'],
    fechado: ['nnnnn.', 'nffffn', 'fnnnnf', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
