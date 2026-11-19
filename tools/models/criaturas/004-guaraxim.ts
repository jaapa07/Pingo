/**
 * 004 · GUARAXIM (Brasa) — filhote de lobo-guará de crina em brasa. Inicial de Brasa.
 * Traços únicos: pernas compridas de "meias" escuras · orelhonas com miolo de brasa ·
 * crina de três labaredas na nuca · ponta da cauda acesa.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, chama, chamaDupla, par, m, ls, type V3 } from './kits';

export const paletaGuara = {
  rampas: [
    ['#8f2f3a', '#d5522f', '#f08a3c'], // 0 pelo ruivo (sombra vinho, luz alaranjada)
    ['#2b1a30', '#4d2d3c', '#7a4852'], // 1 meias, focinho e nariz (ameixa escura)
    ['#ff7a1c', '#ffc12e', '#fff29a'], // 2 brasa e chama (amarelo quente, miolo quase branco)
    ['#cba38c', '#f7e4c4', '#fffbef'], // 3 creme do peito e da garganta
  ] as [string, string, string][],
  contorno: '#33151f',
  extras: { w: '#ffffff', p: '#2b1a30', f: '#d5522f', a: '#ffc93c' },
};

/** Tremulação das labaredas: um valor por quadro, defasado entre ossos para não pulsarem juntas. */
export const tremula = (ossos: string[]) => Object.fromEntries(ossos.map((o, i) => {
  const v: V3[] = [[1, 1, 1], [0.9, 1.18, 0.9], [1.06, 0.88, 1.06], [0.94, 1.1, 0.94]];
  return ['?' + o, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])];
}));

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.25, 0.19, 0.17], peito: 1.12,
    pernas: { alt: 0.37, r: 0.062, rFim: 0.05, xF: 0.6, xT: -0.6, z: 0.62, dobraF: 6, dobraT: -26, pe: [0.07, 0.04, 0.06] },
    pescoco: { len: 0.2, ang: 58, r: 0.1, x: 0.62, y: 0.3 },
    cabeca: [0.2, 0.18, 0.18],
    focinho: { len: 0.16, r0: 0.095, r1: 0.055, cai: 6, y: -0.3, nariz: 0.04 },
    orelha: { tipo: 'ponta', alt: 0.26, larg: 0.19, x: -0.05, z: 0.6, abre: 24, deita: 6 },
    cauda: { segs: 2, len: 0.28, r0: 0.07, r1: 0.085, ang: -30, curva: -14 },
    olho: { r: 0.025, pos: [0.2, 0.03, 0.15] },
    rampas: { pelo: 0, barriga: 3, pernaF: 0, canelaF: 1, pernaT: 0, canelaT: 1, pe: 1, focinho: 3, nariz: 1, orelha: 0, orelhaDentro: 2, cauda: 0 },
  });
  // garganta e peito creme, bochechas peludas
  rig.add('pescoco', blob([0.09, 0.14, 0.1], m(3), { pos: [0.1, 0.04, 0], rot: [0, 0, -30] }));
  par((_, s) => rig.add('cabeca', blob([0.07, 0.06, 0.05], m(3), { pos: [0.12, -0.09, 0.13 * s], seg: 14 })));
  // crina em brasa: três labaredas da nuca ao dorso, cada uma no seu osso
  const crina: [string, string, V3, number, number, number][] = [
    ['chama1', 'cabeca', [ref.nuca[0] + 0.05, ref.nuca[1] + 0.05, 0], 0.26, 0.095, 34],
    ['chama2', 'pescoco', [-0.04, 0.08, 0], 0.3, 0.11, 50],
    ['chama3', 'corpo', [0.0, 0.15, 0], 0.24, 0.1, 62],
  ];
  for (const [nome, pai, pos, alt, r, tomba] of crina) {
    rig.bone(nome, pai, pos, [0, 0, tomba]);
    rig.add(nome, ...chamaDupla(alt, r, m.plano(2), m.luz(2), { curva: 28 }));
  }
  // ponta da cauda acesa
  rig.bone('chama4', 'cauda2', [-0.13, 0, 0], [0, 0, 70]);
  rig.add('chama4', ...chamaDupla(0.26, 0.11, m.plano(2), m.luz(2), { curva: 20 }));
  // listra escura da testa ao nariz (marca do guará) e sela de pelo mais escuro
  rig.add('cabeca', calota([0.21, 0.19, 0.06], m.sombra(0), { de: 0, ate: 60, pos: [0.06, 0, 0], rot: [0, 0, -40] }));
  rig.add('cabeca', chama(0.09, 0.035, m.plano(2), { pos: [ref.topo[0] + 0.02, ref.topo[1] - 0.01, 0], rot: [0, 0, 20] }));
  return rig;
}

const anims = animsQuadrupede({ u: 0.85, hPerna: 0.37, mole: 0.9, passo: 30, cauda: 1.2 }, { todas: tremula(['chama1', 'chama2', 'chama3', 'chama4']) });

export const guaraxim = criatura({
  num: 4, id: 'guaraxim', nome: 'Guaraxim', porte: 'P', estagio: 'basico', paleta: paletaGuara, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'ppap', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
