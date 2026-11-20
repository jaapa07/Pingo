/**
 * 018 · FORMIGAÇO (Inseto/Terra) — saúva cortadeira.
 * Traços únicos: cabeçorra com mandíbulas de tesoura · pedaço de folha recortada carregado como vela ·
 * espinhos no dorso · abdômen de gota com cinta clara · antenas de cotovelo.
 */
import { criatura, inseto, animsInseto, blob, slab, spike, segmento, par, m, lz, qz } from './kits';

export const paletaSauva = {
  rampas: [
    ['#6a2434', '#b24a2c', '#e5803c'], // 0 quitina ferrugem
    ['#2e1a2a', '#50303a', '#7c4c4e'], // 1 patas, antenas e mandíbulas (ameixa)
    ['#2a7a48', '#68c04c', '#c8ec74'], // 2 folha cortada
    ['#a87a4c', '#ecc98a', '#fff4cc'], // 3 creme-terra: cintas, pontas, asas da rainha
  ] as [string, string, string][],
  contorno: '#2b1626',
  extras: { w: '#ffffff', p: '#22121e', f: '#b24a2c' },
};

function build() {
  const { rig } = inseto({
    torax: [0.14, 0.11, 0.11], abdomen: [0.17, 0.15, 0.15], cabeca: [0.2, 0.18, 0.2], alt: 0.23, caiAbdomen: 2,
    patas: { abre: 0.27, r: 0.03 }, antenas: { len: 0.2, r: 0.018, abre: 34, bola: 0.032 }, mandibulas: 0.16,
    olho: { r: 0.036, pos: [0.2, 0.03, 0.15] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 1, antenas: 1 },
  });
  // pecíolo (o nó da cintura) e cinta clara no abdômen
  rig.add('corpo', blob([0.05, 0.065, 0.05], m.sombra(0), { pos: [-0.14, 0.02, 0], seg: 10 }));
  rig.add('abdomen', blob([0.035, 0.148, 0.148], m(3), { pos: [-0.1, 0, 0], seg: 14 }), blob([0.03, 0.12, 0.12], m(3), { pos: [-0.22, 0, 0], seg: 12 }));
  // espinhos do dorso e sulco da cabeça
  par((_, s) => {
    rig.add('corpo', spike(0.11, 0.03, m(1), { pos: [0.04, 0.08, 0.05 * s], rot: [18 * s, 0, 10] }), spike(0.09, 0.028, m(1), { pos: [-0.07, 0.08, 0.04 * s], rot: [18 * s, 0, 24] }));
    rig.add('cabeca', blob([0.09, 0.07, 0.07], m.luz(0), { pos: [0.07, 0.11, 0.085 * s], seg: 12 }));
  });
  // folha recortada, presa nas mandíbulas e erguida como vela (osso próprio)
  rig.bone('folha', 'cabeca', [0.3, -0.04, 0], [0, 0, 22]);
  rig.add('folha',
    slab([[0, 0], [0.13, 0.1], [0.2, 0.3], [0.11, 0.36], [0.18, 0.46], [0.02, 0.6], [-0.15, 0.46], [-0.21, 0.25], [-0.12, 0.08]], 0.045, m(2)),
    segmento([0, 0.02, 0], [0.0, 0.5, 0], 0.022, 0.014, m.luz(2)));
  return rig;
}

const anims = animsInseto({ u: 0.6, alt: 0.23, mole: 0.9 }, {
  idle: { folha: lz([0, 3, 6, 2]) },
  fisico: { folha: qz([-6, -12, 20, 8, 0]) },
  especial: { folha: qz([0, -8, -12, 26, 8, 0]) },
  dano: { folha: qz([-20, -8, 0]) },
  // 2ª rodada: a folha tomba só um pouco para trás (deitada para a frente alargava o quadro e encolhia o sprite inteiro)
  desmaio: { folha: qz([0, 4, 8, 12, 11]) },
  andar: { folha: lz([0, 5, 0, -5]) },
});

export const formigaco = criatura({
  num: 18, id: 'formigaco', nome: 'Formigaço', porte: 'P', estagio: 'basico', paleta: paletaSauva, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
