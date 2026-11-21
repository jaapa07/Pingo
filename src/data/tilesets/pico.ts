import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, CALCADA, ESPINHOS, construcao, nevar } from './_comum';

const paleta: PaletaBioma = {
    g: '#94a8cc', G: '#e0eaf6', l: '#f2f7fd', L: '#ffffff',
    t: '#6a6a84', T: '#9494ac', U: '#c0c0d0',
    s: '#5c5a70', S: '#84829a', Z: '#b0aec0',
    a: '#26508c', A: '#3c7cbc', e: '#8cc0e8', E: '#f0faff',
    r: '#3e4460', R: '#62698c', q: '#9098b8', Q: '#ccd4e8',
    f: '#20484c', F: '#34705e', v: '#5c9874', V: '#a4c8a0',
    m: '#40302c', M: '#6a4a3c', n: '#98725c',
    y: '#f8dc70', p: '#c06cc8', w: '#fefefe',
    x: '#2c4a9a', X: '#5088dc', o: '#a8d4ff',
    k: '#1c2040',
};
/** PICO: neve com sombras azuis, cascalho escuro, degraus de pedra e gelo cortante. */
const pico: TilesetExterior = {
  nome: 'pico',
  periodos: true,
  descricao: 'Pico Pingorama: cume nevado, rocha nua e gelo',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    caminho: CALCADA, perigo: ESPINHOS, arbusto: nevar(ARTE_COMUM.arbusto, 5),
    decor: [
      [
        '................', '................', '....kkkk........', '...kwwwwk.......',
        '..kwwqqRRk......', '..kqqRRRrk......', '...kkkkkk.......', '................',
        '..........p.....', '.........pyp....', '..........p.....', '..........F.....',
        '...kk...........', '..kwwk..........', '..kqRk..........', '...kk...........',
      ],
      [
        '................', '................', '......k.........', '.....kwk........',
        '.....kwok.......', '....kwook...g...', '....kwoXk..g....', '....kooXk.......',
        '.....kkk........', '................', '..g.............', '.g.......k......',
        '........kwk.....', '........kok.....', '.........k......', '................',
      ],
    ],
  },
  arvore: ['pinheiro-neve', 'seca'],
  arvoreSacudivel: 'pinheiro-neve',
  construcao: construcao(paleta, { parede: ['#7c84a4', '#b4bcd4', '#e4ecf8'], telhado: ['#2c3c6a', '#44609c', '#7c98cc'], detalhe: ['#8a6a1c', '#d0a82c', '#f8e070'], detalhe2: ['#8a2c44', '#c84864', '#f08ca0'], neve: true }),
  bordaCaminho: 'reta',
};
export default pico;
