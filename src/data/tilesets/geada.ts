import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, ESPINHOS, construcao, nevar } from './_comum';

const paleta: PaletaBioma = {
    g: '#4a7a6c', G: '#78ac8c', l: '#a8d0ac', L: '#e4f4e0',
    t: '#5a4a44', T: '#86706a', U: '#b09c94',
    s: '#9cb4d4', S: '#dce8f6', Z: '#ffffff',
    a: '#2a5c94', A: '#4a8cc4', e: '#9cccec', E: '#f2fcff',
    r: '#4a5068', R: '#747c98', q: '#a4acc4', Q: '#dce4f0',
    f: '#1c4a44', F: '#2e7058', v: '#56946c', V: '#9cc490',
    m: '#44302c', M: '#6e4c3c', n: '#9c745c',
    y: '#f8e080', p: '#e06c8c', w: '#fefefe',
    x: '#3a4a8a', X: '#6080c8', o: '#a8c8f8',
    k: '#1e2440',
};
/** GEADA: capim esbranquiçado de geada, neve azulada nas sombras, água gelada. */
const geada: TilesetExterior = {
  nome: 'geada',
  periodos: true,
  descricao: 'Serra da Geada: araucárias, campos com geada, neve e chalés',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    perigo: ESPINHOS, arbusto: nevar(ARTE_COMUM.arbusto, 3),
    decor: [
      [
        '................', '................', '...w............', '.w.w.w.....kk...',
        '..www.....kMnk..', '.wwwww....kmMk..', '..www......kk...', '.w.w.w..........',
        '...w............', '..........w.....', '.........www....', '....p.....w.....',
        '...pwp..........', '....p...........', '....F...........', '................',
      ],
      [
        '................', '................', '.....wwww.......', '...wwwwwwww.....',
        '..wwwwwwwwwo....', '...owwwwwoo.....', '.....oooo.......', '................',
        '...........l.l..', '...........lLl..', '............l...', '..l.l...........',
        '..lLl......w....', '...l......www...', '...........w....', '................',
      ],
    ],
  },
  arvore: ['araucaria', 'pinheiro-neve'],
  arvoreSacudivel: 'pinheiro',
  construcao: construcao(paleta, { parede: ['#7a5a48', '#a8826a', '#d0ac90'], telhado: ['#4a3440', '#74505c', '#a07a80'], detalhe: ['#8a2c34', '#c4444c', '#ec8080'], detalhe2: ['#2c5c4a', '#3c8c6c', '#7cc4a0'], neve: true }),
  bordaCaminho: 'organica',
};
export default geada;
