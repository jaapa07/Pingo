/**
 * 006 · LOBO-FORNALHA (Brasa/Ginga) — lobo-guará de pernas longas em postura de luta. Estágio final.
 * Mantém da linha: pelo ruivo, orelhonas em brasa, crina e cauda de fogo, pernas de chama.
 * Cresce: pata dianteira erguida em guarda (ginga) · fornalha acesa no peito com grade escura ·
 * faixas de lutador nas canelas dianteiras e lenço creme no pescoço com pontas ao vento ·
 * crina contínua de seis labaredas da testa à garupa · olhar bravo de sobrancelha.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, chama, chamaDupla, listra, pena, ring, par, m, lz, qz, D2R, type V3 } from './kits';
import { paletaGuara, tremula } from './004-guaraxim';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.34, 0.2, 0.18], peito: 1.24,
    pernas: { alt: 0.62, r: 0.068, rFim: 0.05, xF: 0.6, xT: -0.64, z: 0.66, dobraF: 10, dobraT: -34, pe: [0.08, 0.045, 0.065] },
    pescoco: { len: 0.3, ang: 50, r: 0.11, x: 0.68, y: 0.3 },
    cabeca: [0.19, 0.16, 0.16],
    focinho: { len: 0.25, r0: 0.085, r1: 0.048, cai: 8, y: -0.3, nariz: 0.038 },
    orelha: { tipo: 'ponta', alt: 0.32, larg: 0.18, x: -0.1, z: 0.6, abre: 26, deita: 14 },
    cauda: { segs: 2, len: 0.34, r0: 0.075, r1: 0.095, ang: 10, curva: 14 },
    olho: { r: 0.02, pos: [0.19, 0.03, 0.132] },
    rampas: { pelo: 0, barriga: 3, pernaF: 0, canelaF: 2, pernaT: 0, canelaT: 2, pe: 1, focinho: 3, nariz: 1, orelha: 0, orelhaDentro: 2, cauda: 0 },
  });
  // POSTURA DE LUTA: pata dianteira esquerda (a que a câmera de frente vê) erguida em guarda
  rig.bones.perna_fe.rotation.z = 72 * D2R; rig.bones.canela_fe.rotation.z = -118 * D2R;
  rig.bones.perna_fd.rotation.z = -8 * D2R; rig.bones.corpo.rotation.z = 5 * D2R;
  // peitilho creme, bochechas e máscara escura do focinho
  rig.add('pescoco', blob([0.08, 0.13, 0.09], m(3), { pos: [0.16, 0.12, 0], rot: [0, 0, -36] }));
  par((_, s) => rig.add('cabeca', blob([0.075, 0.06, 0.05], m(3), { pos: [0.1, -0.08, 0.115 * s], seg: 14 })));
  rig.add('cabeca', calota([0.2, 0.17, 0.055], m(1), { de: 0, ate: 62, pos: [0.05, 0, 0], rot: [0, 0, -42] }));
  // FORNALHA no peito: boca incandescente com grade
  rig.add('corpo',
    blob([0.12, 0.15, 0.15], m.plano(2), { pos: [0.34, -0.03, 0], seg: 16 }),
    blob([0.08, 0.1, 0.1], m.luz(2), { pos: [0.41, -0.04, 0], seg: 14 }),
    ring(0.15, 0.04, m(1), { pos: [0.36, -0.03, 0], rot: [0, 90, 0] }));
  for (const z of [-0.05, 0.05]) rig.add('corpo', blob([0.024, 0.14, 0.022], m.plano(1), { pos: [0.455, -0.03, z], seg: 8 }));
  // lenço de lutador no pescoço com duas pontas ao vento
  rig.add('pescoco', ring(0.125, 0.04, m(3), { pos: [0.05, 0.1, 0], rot: [90, 0, -34] }));
  rig.bone('lenco', 'pescoco', [-0.05, 0.14, 0], [0, 0, 20]);
  rig.add('lenco', pena(0.3, 0.09, m(3), { esp: 0.035, rot: [0, 0, -8] }), pena(0.22, 0.075, m(3), { esp: 0.035, rot: [0, 0, 24] }));
  // pernas de chama + faixas nas canelas da frente
  let n = 7;
  par((l) => {
    for (const q of ['f', 't']) {
      const nome = 'chama' + n++;
      rig.bone(nome, 'canela_' + q + l, [-0.01, 0.0, 0], [0, 0, q === 'f' ? 24 : 42]);
      rig.add(nome, ...chamaDupla(0.26, 0.09, m.plano(2), m.luz(2), { curva: 22 }));
      rig.add('canela_' + q + l, blob([0.066, 0.05, 0.066], m.sombra(2), { pos: [0, -0.27, 0], seg: 12 }));
    }
    for (const y of [-0.1, -0.17]) rig.add('canela_f' + l, listra(0.06, 0.026, m(3), { pos: [-0.01, y, 0] }));
    rig.add('perna_f' + l, listra(0.075, 0.024, m(1), { pos: [0.01, -0.12, 0] }));
  });
  // crina contínua de seis labaredas, da testa à garupa
  const crina: [string, string, V3, number, number, number][] = [
    ['chama1', 'cabeca', [ref.topo[0], ref.topo[1] - 0.02, 0], 0.22, 0.085, 24],
    ['chama2', 'cabeca', [ref.nuca[0] + 0.04, ref.nuca[1] + 0.02, 0], 0.32, 0.11, 40],
    ['chama3', 'pescoco', [0.02, 0.14, 0], 0.36, 0.12, 50],
    ['chama4', 'pescoco', [-0.1, -0.03, 0], 0.3, 0.11, 58],
    ['chama5', 'corpo', [-0.02, 0.17, 0], 0.2, 0.08, 66],
    ['chama6', 'corpo', [-0.24, 0.15, 0], 0.16, 0.07, 72],
  ];
  for (const [nome, pai, pos, alt, r, tomba] of crina) {
    rig.bone(nome, pai, pos, [0, 0, tomba]);
    rig.add(nome, ...chamaDupla(alt, r, m.plano(2), m.luz(2), { curva: 28 }));
  }
  // cauda-tocha
  rig.bone('chama11', 'cauda2', [-0.16, 0, 0], [0, 0, 64]);
  rig.add('chama11', ...chamaDupla(0.4, 0.14, m.plano(2), m.luz(2), { curva: 24 }), chama(0.24, 0.08, m.plano(2), { pos: [0.06, 0.02, 0], rot: [0, 0, -40] }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.25, hPerna: 0.62, mole: 0.6, passo: 28, cauda: 0.9 }, {
  todas: tremula(['chama1', 'chama2', 'chama3', 'chama4', 'chama5', 'chama6', 'chama7', 'chama8', 'chama9', 'chama10', 'chama11']),
  idle: { lenco: lz([0, 8, 14, 5]), perna_fe: lz([0, 4, 8, 3]) },
  fisico: { lenco: qz([10, 20, -24, -8, 0]), perna_fe: qz([10, 24, -60, -30, 0]), canela_fe: qz([-10, -24, 70, 30, 0]) },
  especial: { lenco: qz([0, 10, 14, -26, -10, 0]) },
  andar: { lenco: lz([0, 10, 0, 10]), perna_fe: lz([-74, -46, -20, -46]), canela_fe: lz([78, 40, 78, 78]) },
});

export const loboFornalha = criatura({
  num: 6, id: 'lobo-fornalha', nome: 'Lobo-Fornalha', porte: 'G', estagio: 'final', paleta: paletaGuara, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
