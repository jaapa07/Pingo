import type { TilesetExterior } from './tipos';
import { ARTE_COMUM } from './_comum';

/** COSTA: vila litorânea, restinga e praia — verdes quentes, areia clara, mar turquesa. */
const costa: TilesetExterior = {
  nome: 'costa',
  periodos: true,
  descricao: 'Vila litorânea, restinga e praia',
  paleta: {
    g: '#2c8a5a', G: '#4bb35a', l: '#7fd15c', L: '#c2ec74',
    t: '#b0753f', T: '#d39c5a', U: '#edc587',
    s: '#dcb672', S: '#f3d894', Z: '#fff0bf',
    a: '#1c64a8', A: '#2a9bd6', e: '#74d4ee', E: '#eafcff',
    r: '#5c5378', R: '#8a819c', q: '#b6adba', Q: '#e2dcd2',
    f: '#17584c', F: '#268a4e', v: '#4fb648', V: '#9be052',
    m: '#5b3b34', M: '#8f5d3c', n: '#c08a58',
    y: '#ffd33c', p: '#f2668c', w: '#fff7ea',
    x: '#7c2a3c', X: '#d14a44', o: '#f79a52',
    k: '#22253f',
  },
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    decor: [
      ...ARTE_COMUM.decor.slice(0, 2),
      [ // conchas e estrela-do-mar
        '................', '................', '..kkk...........', '.kwwpk..........',
        '.kwpwk.....o....', '..kkk.....oXo...', '.........ooXoo..', '..........oXo...',
        '..........o.o...', '................', '.....kk.........', '....kwwk........',
        '....kpwk........', '.....kk.........', '................', '................',
      ],
      [ // capim de restinga e florzinhas de ipomeia
        '................', '..........p.....', '.........pwp....', '..v.......p.....',
        '.vFv.....vFv....', '..F.......F.....', '................', '.....v..........',
        '....vFv.....p...', '...v.F.v...pwp..', '.....F......p...', '...........vFv..',
        '..p.........F...', '.pwp............', '..p.............', '................',
      ],
    ],
  },
  arvore: ['coqueiro', 'amendoeira'],
  arvoreSacudivel: 'frutifera',
  construcao: {
    parede: ['#b9b3c4', '#f4eee0', '#ffffff'],
    telhado: ['#8a3a34', '#c8553c', '#ec8a54'],
    detalhe: ['#1f5aa0', '#2f86d0', '#6fc0f0'],
    detalhe2: ['#b8842a', '#f0c040', '#ffe58a'],
    pedra: ['#5c5378', '#8a819c', '#b6adba'],
    metal: ['#4a5068', '#7c86a0', '#c0c8d8'],
    vidro: '#5a86b8', vidroNoite: '#ffe07a', luz: '#f8e8a0', luzNoite: '#fff6b0',
  },
  bordaCaminho: 'organica',
};
export default costa;
