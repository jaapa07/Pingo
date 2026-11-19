/**
 * 045 · QUERO-QUERINHO (Vento) — filhote de quero-quero, pernalta barulhento dos campos.
 * Traços únicos: pernas compridas cor-de-rosa · babador preto no peito · penacho fino na nuca ·
 * olho vermelho com faixa branca · bico rosado de ponta escura.
 */
import { criatura, ave, animsAve, blob, calota, pena, par, m, lz, qz } from './kits';

export const paletaQuero = {
  rampas: [
    ['#5a5068', '#9a9098', '#d2cabc'], // 0 cinza-pardo do dorso e da cabeça
    ['#b9b0c2', '#f4f0e6', '#ffffff'], // 1 branco da barriga e da faixa da cara
    ['#1f1c2e', '#3a3550', '#6a8a6a'], // 2 preto do babador e das pontas · brilho verde-bronze do ombro
    ['#a8324a', '#e8607a', '#ffb0b0'], // 3 rosa-avermelhado das pernas, do bico e dos esporões
  ] as [string, string, string][],
  contorno: '#231c30',
  extras: { w: '#ffffff', p: '#1f1c2e', f: '#9a9098', a: '#e23a4a' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.2, 0.165, 0.16], ergue: 22,
    pescoco: { len: 0.13, ang: 68, r: 0.1 },
    cabeca: [0.16, 0.15, 0.15],
    bico: { len: 0.11, r: 0.042, y: -0.1 },
    asa: { len: 0.24, larg: 0.15, cai: 6, ponta: 0.4 },
    cauda: { len: 0.14, larg: 0.08, ang: 14, penas: 3, abre: 14 },
    pernas: { alt: 0.27, r: 0.02, z: 0.62, dedo: 0.08 },
    olho: { r: 0.027, pos: [0.085, 0.03, 0.128] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 2, cauda: 2, bico: 3, perna: 3 },
  });
  // babador preto: garganta e peito
  rig.add('pescoco', blob([0.085, 0.11, 0.095], m.plano(2), { pos: [0.05, 0.0, 0], rot: [0, 0, -20], seg: 14 }));
  rig.add('tronco', blob([0.1, 0.12, 0.14], m.plano(2), { pos: [0.13, 0.0, 0], seg: 14 }));
  rig.add('cabeca', blob([0.05, 0.05, 0.08], m.plano(2), { pos: [0.13, -0.03, 0], seg: 12 }));
  // faixa branca da cara e ponta escura do bico
  par((_, s) => rig.add('cabeca', blob([0.09, 0.025, 0.02], m.plano(1), { pos: [0.03, -0.035, 0.142 * s], rot: [0, 10 * s, -20], seg: 10 })));
  rig.add('cabeca', blob([0.035, 0.03, 0.03], m.sombra(2), { pos: [ref.pontaBico[0] - 0.025, ref.pontaBico[1], 0], seg: 8 }));
  // penacho fino da nuca (osso próprio)
  rig.bone('penacho', 'cabeca', [ref.nuca[0] + 0.02, ref.nuca[1] + 0.03, 0], [0, 0, -18]);
  rig.add('penacho', pena(0.2, 0.045, m.plano(2), { esp: 0.035 }));
  // ombro bronze e ponta branca da cauda
  par((l, s) => rig.add('asa_' + l, blob([0.07, 0.05, 0.03], m.luz(2), { pos: [-0.07, 0.01, 0.045 * s], seg: 10 })));
  rig.add('cauda1', blob([0.03, 0.03, 0.08], m.plano(1), { pos: [-0.11, 0, 0], seg: 8 }));
  // joelhos ossudos
  par((l) => rig.add('canela_' + l, blob([0.03, 0.03, 0.03], m(3), { seg: 8 })));
  return rig;
}

const anims = animsAve({ u: 0.7, hPerna: 0.27, mole: 1.1 }, {
  idle: { penacho: lz([0, 6, 12, -6]) },
  especial: { penacho: qz([0, 16, 24, -30, -10, 0]) },
  dano: { penacho: qz([30, 12, 0]) },
});

export const queroQuerinho = criatura({
  num: 45, id: 'quero-querinho', nome: 'Quero-querinho', porte: 'P', estagio: 'basico', paleta: paletaQuero, build, anims,
  olho: {
    frente: ['.pp.', 'pwap', 'paap', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['a', 'p'],
  },
});
