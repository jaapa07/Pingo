import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, CALCADA, ESPINHOS, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#2c6a6c', G: '#46988a', l: '#74bc98', L: '#b8e4b0',
    t: '#7a6a8a', T: '#a494b4', U: '#ccc0d8',
    s: '#a8946c', S: '#d4c090', Z: '#f0e4bc',
    a: '#2a4a94', A: '#4474c8', e: '#88b4ec', E: '#e8f4ff',
    r: '#6a4a6a', R: '#9a6c8a', q: '#c898a8', Q: '#f0c8c4',
    f: '#1c5058', F: '#2c7a6c', v: '#56a47c', V: '#9cd094',
    m: '#46303c', M: '#70485a', n: '#a0707c',
    y: '#ffe890', p: '#c890ff', w: '#f8f0ff',
    x: '#4a2c8a', X: '#7c50d0', o: '#b89cff',
    k: '#201e3a',
};
/** PLANALTO: capim verde-azulado, caminho de pedra lilás, rocha rosada de cânion. */
const planalto: TilesetExterior = {
  nome: 'planalto',
  periodos: true,
  descricao: 'Planalto Lume: campos altos, cânions rosados, cristais e observatório',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    caminho: CALCADA, perigo: ESPINHOS,
    decor: [
      [
        '................', '................', '.....k..........', '....kok.........',
        '....kowk....y...', '...kXowk...ywy..', '...kXook....y...', '...kXXok....F...',
        '....kkk.........', '................', '..y.............', '.ywy......p.....',
        '..y......pwp....', '..F.......p.....', '..........F.....', '................',
      ],
      [
        '................', '................', '..........kk....', '.........kQqk...',
        '..l.l....kqRk...', '..lLl.....kk....', '...l............', '................',
        '.....kk.........', '....kqQk....l.l.', '....kRqk....lLl.', '.....kk......l..',
        '................', '..........p.....', '.........pwp....', '..........p.....',
      ],
    ],
  },
  arvore: ['ipe-roxo', 'tortuosa'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#b0a4c4', '#ece4f4', '#ffffff'], telhado: ['#3c3c8a', '#5a5cc4', '#8c94ec'], detalhe: ['#6a3c9a', '#9c5cd0', '#c898f4'], detalhe2: ['#b0901c', '#ecc840', '#fff090'] }),
  bordaCaminho: 'reta',
  acesas: ['o', 'y'],
};
export default planalto;
