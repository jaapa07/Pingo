import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, CASCALHO, ROCHA_TOPO, TERRA, construcao, trocarLetras } from './_comum';

const paleta: PaletaBioma = {
    g: '#4a4058', G: '#6c6078', l: '#8c8298', L: '#b4acbc',
    t: '#5a4a44', T: '#80685c', U: '#a88c78',
    s: '#5c5448', S: '#847a64', Z: '#aca288',
    a: '#14384c', A: '#1e5a70', e: '#4a94a0', E: '#b4e8e4',
    r: '#2c2638', R: '#4a4258', q: '#70688a', Q: '#a09cb8',
    f: '#1c4a4a', F: '#2c7468', v: '#4cac8c', V: '#8ce4b4',
    m: '#3a2c2c', M: '#5e463c', n: '#8a6a54',
    y: '#f8e070', p: '#70d8e8', w: '#f0fcff',
    x: '#7a2c1c', X: '#d0541c', o: '#ffb43c',
    k: '#14121e',
};
/** CAVERNA: pedra arroxeada, paredes quase negras, musgo e cristais que brilham. */
const caverna: TilesetExterior = {
  nome: 'caverna',
  periodos: false,
  descricao: 'Cavernas e grutas: chão de pedra, estalagmites, cristais e lago subterrâneo',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'g', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'k', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    chao: [...trocarLetras(TERRA, { U: 'l', t: 'g' }), ...trocarLetras(TERRA, { U: 'l', t: 'g' }).slice(0, 2), ...trocarLetras(CASCALHO, { q: 'L', R: 'l', r: 'g' }).slice(0, 1)], encontro: trocarLetras(CASCALHO, { q: 'l', R: 'G', r: 'k' }), paredeTopo: trocarLetras(ROCHA_TOPO, { q: 'r' }),
    decor: [
      [
        '................', '................', '.....k..........', '....kpk.........',
        '....kpwk........', '...kppwk....l...', '...kpppk...lG...', '....kkk.........',
        '................', '..........kk....', '.........kLlk...', '..l......klGk...',
        '.lG.......kk....', '................', '................', '................',
      ],
      [
        '................', '................', '..v.v...........', '.vVvFv..........',
        '..vFv.....ww....', '...f.....wkkw...', '..........ww....', '................',
        '......kk........', '.....klLk.......', '.....kGlk...v...', '......kk...vVv..',
        '............v...', '................', '................', '................',
      ],
    ],
  },
  arvore: ['estalagmite'],
  arvoreSacudivel: 'cogumelo',
  construcao: construcao(paleta, { parede: ['#4a4258', '#70688a', '#a09cb8'], telhado: ['#5e463c', '#8a6a54', '#b09070'], detalhe: ['#7a2c1c', '#d0541c', '#ffb43c'], detalhe2: ['#1e5a70', '#4a94a0', '#b4e8e4'] }),
  bordaCaminho: 'organica',
};
export default caverna;
