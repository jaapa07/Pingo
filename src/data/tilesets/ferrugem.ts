import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, CHAPA, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#5a6a3a', G: '#8a9448', l: '#b0b45c', L: '#dcd88a',
    t: '#7a3e2c', T: '#a85a36', U: '#d08a54',
    s: '#6a5a52', S: '#8e7c70', Z: '#b8a898',
    a: '#2c5a5a', A: '#44807a', e: '#86b8a4', E: '#dcf0dc',
    r: '#3e3a46', R: '#5e5a66', q: '#8a8690', Q: '#b8b4b8',
    f: '#3e5a34', F: '#5e7c3c', v: '#8aa048', V: '#c0c868',
    m: '#40302c', M: '#6a4a3a', n: '#96705a',
    y: '#f0b840', p: '#d86a3a', w: '#f0e6d0',
    x: '#6a2a1c', X: '#c0481e', o: '#f08a2c',
    k: '#241f2c',
};
/** FERRUGEM: oliva seco, terra cor de ferrugem, água turva e fuligem. */
const ferrugem: TilesetExterior = {
  nome: 'ferrugem',
  periodos: true,
  descricao: 'Vila Ferrugem: cidade operária antiga, capim seco, sucata e chapas',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    piso: CHAPA,
    decor: [
      [
        '................', '................', '....kkk.........', '...kqQqk....l...',
        '...kQkQk...l.l..', '...kqQqk...l....', '....kkk.........', '................',
        '.........kkkk...', '..l.....krRRrk..', '.l.l....kRqRRk..', '.l.......krRrk..',
        '.........kkkk...', '................', '................', '................',
      ],
      [
        '................', '................', '.....kkkkk......', '...kkxxxxxkk....',
        '..kxxpxxxxxxk...', '..kxxxxxoxxxk...', '...kkxxxxxkk....', '.....kkkkk......',
        '................', '...........q....', '..........qRq...', '...........r....',
        '..q.............', '.qRq............', '..r.............', '................',
      ],
    ],
  },
  arvore: ['seca', 'tortuosa'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#6a5e62', '#9a8c88', '#c4b8ac'], telhado: ['#6a2c1c', '#a84c24', '#d8803c'], detalhe: ['#3a4a5a', '#5a7084', '#8ca4b4'], detalhe2: ['#8a6a1c', '#c8a02c', '#ecd060'] }),
  bordaCaminho: 'organica',
};
export default ferrugem;
