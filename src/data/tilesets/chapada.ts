import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#8a4a30', G: '#c07a44', l: '#dca060', L: '#f4cc8c',
    t: '#9a6a4a', T: '#d8a878', U: '#f0cca0',
    s: '#5a3c3c', S: '#7c5450', Z: '#a47468',
    a: '#1e5a8c', A: '#3088b8', e: '#7cc4dc', E: '#eafaff',
    r: '#6a2c2c', R: '#a44a34', q: '#d07a48', Q: '#f0b070',
    f: '#4a5a2a', F: '#6e8434', v: '#9cac44', V: '#ccd468',
    m: '#4a2a24', M: '#7a4830', n: '#ac7448',
    y: '#ffe060', p: '#f06a50', w: '#fff0d8',
    x: '#a02818', X: '#f0601c', o: '#ffc83c',
    k: '#2c1a24',
};
/** CHAPADA: terra laranja, arenito vermelho em degraus, cinza vulcânica e lava acesa. */
const chapada: TilesetExterior = {
  nome: 'chapada',
  periodos: true,
  descricao: 'Chapada Rubra: paredões avermelhados, chão de terra, mandacarus e lava do vulcão',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    decor: [
      [
        '................', '................', '.....kk.........', '....kQqk....v.v.',
        '...kqqRRk...vVv.', '...kRRrrk..v.F.v', '....kkkk.....F..', '................',
        '..........kkk...', '.........kvFvk..', '..y.y....kFvFk..', '..yLy....kfFfk..',
        '.y.l.y....kkk...', '...l............', '................', '................',
      ],
      [
        '................', '................', '..q.............', '.qRq......q.....',
        '..r......qRq....', '..........r.....', '......kk........', '.....kqRk.......',
        '.....kRrk....y..', '......kk....yLy.', '...........y.l.y', '..q..........l..',
        '.qRq............', '..r.............', '................', '................',
      ],
    ],
  },
  arvore: ['seca', 'mandacaru'],
  arvoreSacudivel: 'tortuosa',
  construcao: construcao(paleta, { parede: ['#b07a54', '#e4b488', '#f8dcb8'], telhado: ['#7a2c20', '#b04428', '#dc7444'], detalhe: ['#1c5c7a', '#2c88a8', '#6cc0d4'], detalhe2: ['#c08a1c', '#f0bc30', '#ffe480'] }),
  bordaCaminho: 'organica',
  acesas: ['x', 'X', 'o'],
};
export default chapada;
