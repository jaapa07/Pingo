import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#2a4a50', G: '#3e6e5c', l: '#5c9468', L: '#94c47c',
    t: '#4a3c50', T: '#6c5870', U: '#94809a',
    s: '#3a5048', S: '#56705c', Z: '#7c9478',
    a: '#3a2a6a', A: '#5c44a0', e: '#9478d0', E: '#dcc8ff',
    r: '#3a3450', R: '#5a5278', q: '#847ca4', Q: '#b8b0d0',
    f: '#1c3c44', F: '#2c5c50', v: '#4c8458', V: '#84b868',
    m: '#382a38', M: '#5c4250', n: '#866478',
    y: '#c8f060', p: '#d060e0', w: '#f0e8ff',
    x: '#5a1c6a', X: '#a030b0', o: '#e870f0',
    k: '#1c1a2c',
};
/** BREJO: verde-petróleo, água roxa, lodo magenta que brilha no escuro. */
const brejo: TilesetExterior = {
  nome: 'brejo',
  periodos: true,
  descricao: 'Brejo Roxo e Vale do Veneno: charco tóxico, fungos e barbas-de-velho',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    decor: [
      [
        '................', '................', '....kkk.........', '...kpopk........',
        '..kppppok...y...', '...kkwkk...yLy..', '.....w......y...', '.....w..........',
        '..........kk....', '.........kXok...', '..X......kXXk...', '.XoX......kk....',
        '..X..........p..', '............pop.', '.............p..', '................',
      ],
      [
        '................', '.......m........', '.......m...m....', '.......M...m....',
        '..w....v...M....', '.wkw...F...v....', '..w....F...F....', '.......f...f....',
        '................', '...ww...ww......', '..wkkwwwkkw.....', '...ww...ww......',
        '............y...', '...........yLy..', '............y...', '................',
      ],
    ],
  },
  arvore: ['barbada', 'mangue'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#6c6480', '#a49cb4', '#d0c8dc'], telhado: ['#3c2c5c', '#5c4490', '#8c70c0'], detalhe: ['#1c6a50', '#2ca070', '#6cd8a0'], detalhe2: ['#8a2c8a', '#c048c0', '#f080e8'] }),
  bordaCaminho: 'organica',
  acesas: ['X', 'o', 'y'],
};
export default brejo;
