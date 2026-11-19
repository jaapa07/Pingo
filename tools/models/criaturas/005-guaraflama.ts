/**
 * 005 · GUARAFLAMA (Brasa) — lobo-guará jovem de pernas de chama.
 * Mantém do Guaraxim: pelo ruivo, orelhonas de miolo em brasa, crina de labaredas, cauda acesa.
 * Cresce: as "meias" viraram canelas incandescentes com labaredas subindo dos joelhos ·
 * crina de quatro línguas · pernas bem mais longas · peitilho creme em ponta.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, chama, chamaDupla, par, m, type V3 } from './kits';
import { paletaGuara, tremula } from './004-guaraxim';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.3, 0.19, 0.17], peito: 1.16,
    pernas: { alt: 0.48, r: 0.062, rFim: 0.048, xF: 0.62, xT: -0.62, z: 0.6, dobraF: 8, dobraT: -30, pe: [0.07, 0.04, 0.058] },
    pescoco: { len: 0.25, ang: 56, r: 0.1, x: 0.66, y: 0.3 },
    cabeca: [0.19, 0.165, 0.165],
    focinho: { len: 0.21, r0: 0.085, r1: 0.05, cai: 6, y: -0.3, nariz: 0.038 },
    orelha: { tipo: 'ponta', alt: 0.3, larg: 0.19, x: -0.08, z: 0.6, abre: 24, deita: 8 },
    cauda: { segs: 2, len: 0.32, r0: 0.07, r1: 0.09, ang: -34, curva: -12 },
    olho: { r: 0.022, pos: [0.19, 0.03, 0.137] },
    rampas: { pelo: 0, barriga: 3, pernaF: 0, canelaF: 2, pernaT: 0, canelaT: 2, pe: 1, focinho: 3, nariz: 1, orelha: 0, orelhaDentro: 2, cauda: 0 },
  });
  // peitilho creme em ponta e bochechas
  rig.add('pescoco', blob([0.09, 0.17, 0.1], m(3), { pos: [0.11, 0.04, 0], rot: [0, 0, -32] }));
  par((_, s) => rig.add('cabeca', blob([0.07, 0.06, 0.05], m(3), { pos: [0.11, -0.085, 0.12 * s], seg: 14 })));
  rig.add('cabeca', calota([0.2, 0.175, 0.055], m.sombra(0), { de: 0, ate: 60, pos: [0.05, 0, 0], rot: [0, 0, -40] }));
  // pernas de chama: canela incandescente (rampa 2) + labareda subindo de cada joelho
  let n = 5;
  par((l) => {
    for (const q of ['f', 't']) {
      const nome = 'chama' + n++;
      rig.bone(nome, 'canela_' + q + l, [-0.01, 0.0, 0], [0, 0, q === 'f' ? 22 : 40]);
      rig.add(nome, ...chamaDupla(0.2, 0.075, m.plano(2), m.luz(2), { curva: 20 }));
      rig.add('canela_' + q + l, blob([0.062, 0.05, 0.062], m.sombra(2), { pos: [0, -0.2, 0], seg: 12 }));
    }
  });
  // crina de quatro labaredas
  const crina: [string, string, V3, number, number, number][] = [
    ['chama1', 'cabeca', [ref.nuca[0] + 0.05, ref.nuca[1] + 0.05, 0], 0.28, 0.1, 34],
    ['chama2', 'pescoco', [0.0, 0.14, 0], 0.32, 0.11, 46],
    ['chama3', 'pescoco', [-0.1, -0.02, 0], 0.32, 0.12, 56],
    ['chama4', 'corpo', [-0.05, 0.15, 0], 0.26, 0.1, 66],
  ];
  for (const [nome, pai, pos, alt, r, tomba] of crina) {
    rig.bone(nome, pai, pos, [0, 0, tomba]);
    rig.add(nome, ...chamaDupla(alt, r, m.plano(2), m.luz(2), { curva: 28 }));
  }
  // cauda acesa (tocha maior) e faísca na testa
  rig.bone('chama9', 'cauda2', [-0.15, 0, 0], [0, 0, 72]);
  rig.add('chama9', ...chamaDupla(0.34, 0.13, m.plano(2), m.luz(2), { curva: 22 }));
  rig.add('cabeca', chama(0.12, 0.04, m.plano(2), { pos: [ref.topo[0] + 0.02, ref.topo[1] - 0.01, 0], rot: [0, 0, 20] }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.0, hPerna: 0.48, mole: 0.8, passo: 30, cauda: 1.1 }, { todas: tremula(['chama1', 'chama2', 'chama3', 'chama4', 'chama5', 'chama6', 'chama7', 'chama8', 'chama9']) });

export const guaraflama = criatura({
  num: 5, id: 'guaraflama', nome: 'Guaraflama', porte: 'M', estagio: 'medio', paleta: paletaGuara, build, anims,
  olho: {
    frente: ['.ppp', 'ppwp', 'ppap', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
