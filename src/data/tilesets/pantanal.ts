import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#2a7448', G: '#46a050', l: '#74c458', L: '#b4e474',
    t: '#5a4630', T: '#846846', U: '#ac9060',
    s: '#7a6a3c', S: '#a8985a', Z: '#d0c484',
    a: '#1c5a6c', A: '#2c8890', e: '#62c0b0', E: '#dcfff0',
    r: '#4a4c5c', R: '#727688', q: '#9ea4b0', Q: '#ccd4d4',
    f: '#14503c', F: '#247a48', v: '#48a850', V: '#90d860',
    m: '#46302a', M: '#74503a', n: '#a47c54',
    y: '#ffe04a', p: '#b47cf0', w: '#ffffff',
    x: '#5a3a1c', X: '#8a5c28', o: '#b8843c',
    k: '#1a2434',
};
/** PANTANAL: verde úmido, barro claro, água verde-azulada parada. */
const pantanal: TilesetExterior = {
  nome: 'pantanal',
  periodos: true,
  descricao: 'Pantanal: campos alagados, aguapés, juncos e palafitas',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'X' },
  arte: {
    ...ARTE_COMUM,
    decor: [
      ...ARTE_COMUM.decor.slice(0, 2),
      [
        '................', '.........m......', '.........m..m...', '...p.....M..m...',
        '..pwp....v..M...', '...p.....F..v...', '..vFv....F..F...', '.vFFFv...f..f...',
        '..vFv...........', '.....vFv........', '....vFFFv..p....', '.....vFv..pwp...',
        '...........p....', '..........vFv...', '.........vFFFv..', '..........vFv...',
      ],
    ],
  },
  arvore: ['mangue', 'ipe-rosa'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#8a6a4a', '#c09868', '#e4c490'], telhado: ['#7a4428', '#a8683c', '#d09858'], detalhe: ['#1c5a8a', '#2c84c0', '#70b8e8'], detalhe2: ['#a83c2c', '#dc5c3c', '#f89868'] }),
  bordaCaminho: 'organica',
};
export default pantanal;
