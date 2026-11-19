/**
 * 056 · URUBU-REI (Vento/Assombro) — urubu-rei de cabeça colorida, senhor do céu e das almas penadas. Estágio final.
 * Mantém da linha: creme, negro, laranja do bico, o lilás do assombro, a gola fofa.
 * Cresce: cabeça pelada em laranja, vermelho e lilás com carúncula sobre o bico · gola cinzenta larga ·
 * asas creme de pontas negras entreabertas como manto · olho branco de aro vermelho · três fogos-fátuos.
 */
import { criatura, ave, animsAve, blob, calota, pena, par, m, lz, qs, D2R, unirExtras } from './kits';
import { paletaUrubu, fatuo, fatuoAnda } from './055-urubuzim';
import { asasContidas } from './051-ararinha';

const paleta = { ...paletaUrubu, extras: { w: '#ffffff', p: '#120e1a', f: '#f07a2a', a: '#b62f2a' } };

function build() {
  const { rig, ref } = ave({
    corpo: [0.31, 0.28, 0.26], ergue: 48,
    pescoco: { len: 0.2, ang: 70, r: 0.1 },
    cabeca: [0.17, 0.155, 0.15],
    bico: { len: 0.2, r: 0.085, y: -0.1, gancho: 58, achata: 0.75, inferior: 0.6 },
    asa: { len: 0.46, larg: 0.3, cai: 14, ponta: 0.55 },
    cauda: { len: 0.24, larg: 0.13, ang: -30, penas: 3, abre: 16 },
    pernas: { alt: 0.17, r: 0.042, z: 0.5, dedo: 0.13 },
    olho: { r: 0.026, pos: [0.09, 0.04, 0.125] },
    rampas: { corpo: 0, peito: 0, cabeca: 2, asa: 0, asaPonta: 1, cauda: 1, bico: 2, perna: 2 },
  });
  // cabeça colorida: cocuruto vermelho, bochecha lilás, pescoço amarelo-ouro, base do bico negra, carúncula
  rig.add('cabeca', calota([0.18, 0.165, 0.16], m.sombra(2), { de: 0, ate: 54, rot: [0, 0, 20] }));
  rig.add('pescoco', blob([0.105, 0.13, 0.105], m.luz(2), { pos: [0.02, 0.07, 0], seg: 14 }));
  rig.add('cabeca', blob([0.05, 0.085, 0.09], m.plano(1), { pos: [0.15, -0.02, 0], seg: 10 }));
  rig.bone('caruncula', 'cabeca', [0.23, 0.07, 0], [0, 0, -10]);
  rig.add('caruncula', blob([0.05, 0.06, 0.045], m.luz(2), { seg: 10 }), blob([0.03, 0.035, 0.03], m(2), { pos: [0.03, -0.045, 0], seg: 8 }));
  // GOLA cinzenta larga
  for (const [x, z, r] of [[0.11, 0, 0.11], [0.05, 0.12, 0.11], [0.05, -0.12, 0.11], [-0.07, 0.08, 0.1], [-0.07, -0.08, 0.1]] as const)
    rig.add('pescoco', blob([r, r * 0.7, r], m.sombra(0), { pos: [x, -0.06, z], seg: 12 }));
  par((l, s) => {
    rig.add('cabeca', blob([0.06, 0.06, 0.03], m.plano(3), { pos: [0.02, -0.03, 0.135 * s], seg: 10 }));
    // manto: asas entreabertas, faixa negra larga na borda
    rig.bones['asa_' + l].rotation.y = 22 * s * D2R;
    rig.add('asa_' + l, blob([0.2, 0.06, 0.06], m(1), { pos: [-0.3, -0.19, 0.04 * s], rot: [0, 0, 10], seg: 12 }));
    rig.add('asa2_' + l, pena(0.34, 0.12, m(1), { esp: 0.06, pos: [0.06, -0.24, 0], rot: [0, 0, 26] }));
    // calção de penas creme sobre as pernas
    rig.add('perna_' + l, blob([0.09, 0.12, 0.09], m(0), { pos: [0, -0.04, 0], seg: 12 }));
  });
  fatuo(rig, 'fatuo1', 'corpo', [-0.3, 0.52, 0.3], 0.24, 14);
  fatuo(rig, 'fatuo2', 'corpo', [-0.42, 0.24, -0.34], 0.19, 24);
  fatuo(rig, 'fatuo3', 'corpo', [0.2, 0.68, 0.34], 0.16, -6);
  void ref;
  return rig;
}

const anims = animsAve({ u: 1.05, hPerna: 0.17, mole: 0.7 }, unirExtras(asasContidas, {
  todas: fatuoAnda(['fatuo1', 'fatuo2', 'fatuo3']),
  idle: { caruncula: lz([0, -6, -12, -4]) },
  especial: { fatuo1: qs([1, 1.2, 1.4, 1.6, 1.3, 1]), fatuo2: qs([1, 1.2, 1.4, 1.6, 1.3, 1]), fatuo3: qs([1, 1.2, 1.4, 1.7, 1.3, 1]) },
}));

export const urubuRei = criatura({
  num: 56, id: 'urubu-rei', nome: 'Urubu-Rei', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.aaa.', 'awwwa', 'awpwa', 'awwwa', '.aaa.'],
    fechado: ['.aaa.', 'afffa', 'apppa', 'afffa', '.aaa.'],
    mapa: ['w', 'p'],
  },
});
