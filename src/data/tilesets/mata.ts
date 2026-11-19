import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, ESPINHOS, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#1f6b4a', G: '#2f9450', l: '#55b85a', L: '#9bdc6a',
    t: '#6b4a36', T: '#94684a', U: '#b98c62',
    s: '#8a5a30', S: '#b07a3c', Z: '#d6a456',
    a: '#155a6a', A: '#1f8a8a', e: '#5cc6b4', E: '#d8fff0',
    r: '#4a4a60', R: '#70708a', q: '#9a9cac', Q: '#c8ccd0',
    f: '#0f4a40', F: '#1c7448', v: '#3ea04a', V: '#86d058',
    m: '#4a2f2a', M: '#7a4c34', n: '#a8744a',
    y: '#ffd64a', p: '#f0506e', w: '#fff4e0',
    x: '#7a1f4a', X: '#c83a5a', o: '#ff8a5a',
    k: '#1a2238',
};
/** MATA: verdes fundos e saturados, serrapilheira alaranjada, rio verde-azulado. */
const mata: TilesetExterior = {
  nome: 'mata',
  periodos: true,
  descricao: 'Mata Atlântica: floresta densa, bromélias e helicônias',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    perigo: ESPINHOS,
    decor: [
      ...ARTE_COMUM.decor.slice(0, 1),
      [
        '................', '................', '....v...v.......', '.....F.F........',
        '..v..FXF..v.....', '...F.XpX.F......', '....FFXFF.......', '.....fFf........',
        '................', '..........kk....', '.........kXXk...', '........kXwXXk..',
        '.........kwwk...', '..........ww....', '..........k.....', '................',
      ],
      [
        '................', '.....o..........', '....oX..........', '.....Xo.........',
        '....oX......v...', '.....F.....vFv..', '.....F....v.F.v.', '....vFv....vFv..',
        '...v.F.v..v.F.v.', '.....f.....vFv..', '............F...', '..v.v.......f...',
        '..vFv...........', '...F............', '................', '................',
      ],
    ],
  },
  arvore: ['jequitiba', 'embauba'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#a8a890', '#ece4c8', '#fffbe6'], telhado: ['#6a3430', '#a04c3a', '#cc7850'], detalhe: ['#1c6048', '#2e9060', '#6cc890'], detalhe2: ['#b05a1c', '#e88a2c', '#ffc060'] }),
  bordaCaminho: 'organica',
};
export default mata;
