/**
 * 011 · BEM-TE-VIÇO (Comum/Vento) — bem-te-vi de máscara negra, cheio de viço.
 * Mantém do Pipirim: topete de três penas ferrugem, colar ferrugem na nuca, cauda empinada de ponta clara.
 * Cresce: peito amarelo-ouro · máscara negra de bandido com sobrancelha branca · bico forte ·
 * asas com espelho ferrugem.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, par, m, lz, qz } from './kits';

export const paletaBemTeVi = {
  rampas: [
    ['#5e4636', '#96714a', '#c9a468'], // 0 dorso marrom-oliva
    ['#d18a1f', '#f8cf3a', '#fff19a'], // 1 amarelo-ouro do peito (sombra alaranjada)
    ['#8c382f', '#cc6338', '#f09a52'], // 2 ferrugem do topete, colar e espelho da asa
    ['#262238', '#4d4763', '#f4f1fb'], // 3 máscara negra · ardósia · branco da sobrancelha (usar com viés/plano)
  ] as [string, string, string][],
  contorno: '#241c30',
  extras: { w: '#ffffff', p: '#17131f', f: '#262238', a: '#f8cf3a' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.25, 0.19, 0.185], ergue: 36,
    pescoco: { len: 0.12, ang: 64, r: 0.13 },
    cabeca: [0.185, 0.165, 0.17],
    bico: { len: 0.2, r: 0.062, y: -0.1, achata: 0.8, gancho: 14 },
    asa: { len: 0.34, larg: 0.19, cai: 6, ponta: 0.42 },
    cauda: { len: 0.34, larg: 0.085, ang: 30, penas: 3, abre: 16 },
    pernas: { alt: 0.16, r: 0.024, z: 0.45, dedo: 0.08 },
    olho: { r: 0.026, pos: [0.105, 0.025, 0.148] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 3, cauda: 0, bico: 3, perna: 3 },
  });
  // garganta branca e peito amarelo subindo até o bico
  rig.add('cabeca', blob([0.11, 0.075, 0.13], m.luz(3), { pos: [0.07, -0.105, 0] }));
  // MÁSCARA negra do bico à nuca + sobrancelha branca por cima
  par((_, s) => {
    rig.add('cabeca', blob([0.15, 0.048, 0.03], m.sombra(3), { pos: [0.04, 0.025, 0.158 * s], rot: [0, 10 * s, 4], seg: 12 }));
    rig.add('cabeca', blob([0.15, 0.028, 0.03], m.luz(3), { pos: [0.03, 0.082, 0.146 * s], rot: [0, 12 * s, 6], seg: 12 }));
  });
  rig.add('cabeca', calota([0.19, 0.172, 0.176], m.sombra(3), { de: 0, ate: 40, rot: [0, 0, 10] }));
  // colar ferrugem na nuca + topete (herança do Pipirim), agora maior
  rig.add('pescoco', calota([0.15, 0.13, 0.16], m(2), { de: 40, ate: 100, rot: [0, 0, 70], pos: [0.01, 0.03, 0] }));
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.03, ref.topo[1] - 0.03, 0], [0, 0, 30]);
  rig.add('topete', tufo(3, 0.2, 0.05, m(2), { abre: 30 }), tufo(2, 0.13, 0.035, m.plano(1), { abre: 14, pos: [0.03, 0, 0] }));
  // espelho ferrugem na asa e ponta clara na cauda
  par((l, s) => rig.add('asa_' + l, blob([0.11, 0.05, 0.03], m(2), { pos: [-0.2, -0.05, 0.05 * s], rot: [0, 0, 10], seg: 12 })));
  rig.add('cauda1', pena(0.09, 0.095, m.luz(3), { rot: [90, 0, 0], pos: [-0.27, 0.01, 0], esp: 0.03 }));
  return rig;
}

const anims = animsAve({ u: 0.75, hPerna: 0.16, mole: 1.0 }, {
  idle: { topete: lz([0, 6, 12, -8]) },
  especial: { topete: qz([0, 16, 20, -30, -10, 0]) },
  dano: { topete: qz([30, 12, 0]) },
});

export const bemTeVico = criatura({
  num: 11, id: 'bem-te-vico', nome: 'Bem-te-viço', porte: 'M', estagio: 'medio', paleta: paletaBemTeVi, build, anims,
  olho: {
    frente: ['fwwf', 'wppw', 'wppw', 'fwwf'],
    fechado: ['ffff', 'wffw', 'fwwf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
