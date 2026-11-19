import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, ESPINHOS, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#8a7a2c', G: '#c4a83c', l: '#e0c858', L: '#f6e68c',
    t: '#8a3c24', T: '#b85a30', U: '#de8a4c',
    s: '#b08a4a', S: '#d8b46a', Z: '#f2d898',
    a: '#1e62a0', A: '#3494cc', e: '#7ccce8', E: '#eafaff',
    r: '#5a4a52', R: '#86707a', q: '#b29ca0', Q: '#dcccc8',
    f: '#3a5a24', F: '#5e8430', v: '#8cae3c', V: '#c4d85c',
    m: '#4a2e24', M: '#7c4c30', n: '#b07c4c',
    y: '#ffd030', p: '#e85a78', w: '#fff8e8',
    x: '#6a2418', X: '#b8401c', o: '#f08030',
    k: '#2a2030',
};
/** CERRADO: capim dourado sob sol forte, estrada de terra vermelha, água limpa de vereda. */
const cerrado: TilesetExterior = {
  nome: 'cerrado',
  periodos: true,
  descricao: 'Cerrado: capim dourado, terra vermelha, ipês, cupinzeiros e veredas',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    perigo: ESPINHOS,
    decor: [
      [
        '................', '................', '..L.L.......w...', '..lLl......wyw..',
        '.l.l.l......w...', '...g........F...', '............f...', '.......L.L......',
        '.......lLl......', '......l.l.l.....', '........g.......', '..w.............',
        '.wyw.......L.L..', '..w........lLl..', '..F.......l.l.l.', '............g...',
      ],
      [
        '................', '................', '......kk........', '.....kTUk.......',
        '....kTTUTk......', '....kTtTTk......', '...ktTTtTTk.....', '...kttTTttk.....',
        '....kkkkkk......', '............L.L.', '............lLl.', '..p........l.l.l',
        '.pyp.........g..', '..p.............', '..F.............', '................',
      ],
    ],
  },
  arvore: ['tortuosa', 'ipe-amarelo'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#c09c70', '#f0d8a8', '#fff2d0'], telhado: ['#8a3c28', '#c05a34', '#e88c54'], detalhe: ['#1c6a6a', '#2c9c94', '#70d0c0'], detalhe2: ['#b0406a', '#e0608c', '#f8a0b8'] }),
  bordaCaminho: 'organica',
};
export default cerrado;
