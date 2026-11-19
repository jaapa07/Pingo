import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, CALCADA, ESPINHOS, construcao } from './_comum';

const paleta: PaletaBioma = {
    g: '#2e6e62', G: '#4e9a72', l: '#78ba80', L: '#b6dc9a',
    t: '#6e6678', T: '#948c9c', U: '#bab4bc',
    s: '#8a7f6a', S: '#b4a888', Z: '#d8cfae',
    a: '#2a5a8a', A: '#3f84b4', e: '#8cc4dc', E: '#eefaff',
    r: '#4c4868', R: '#767294', q: '#a4a2b8', Q: '#d4d4dc',
    f: '#1c5450', F: '#2e7c5c', v: '#5aa468', V: '#9ccc7c',
    m: '#4a3838', M: '#76564a', n: '#a48266',
    y: '#f4d870', p: '#8a8cf0', w: '#f4f2ff',
    x: '#5a3a6a', X: '#8a5aa0', o: '#c49ad8',
    k: '#22243c',
};
/** SERRA: verdes frios de altitude, pedra violeta, ruas de pé-de-moleque. */
const serra: TilesetExterior = {
  nome: 'serra',
  periodos: true,
  descricao: 'Serra Fumaça: casario colonial na neblina, hortênsias e calçamento de pedra',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'S', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    caminho: CALCADA, perigo: ESPINHOS,
    decor: [
      ...ARTE_COMUM.decor.slice(0, 3),
      [
        '................', '................', '...pp...........', '..pwpp....kk....',
        '..ppwp...kqRk...', '...pp....kRrk...', '...vF.....kk....', '....f...........',
        '..........pp....', '.........pwpp...', '....l....pppp...', '...l.l....pp....',
        '..........Fv....', '...........f....', '................', '................',
      ],
    ],
  },
  arvore: ['manaca', 'pinheiro'],
  arvoreSacudivel: 'frutifera',
  construcao: construcao(paleta, { parede: ['#b4b0c8', '#f0ecec', '#ffffff'], telhado: ['#7a3c3c', '#b0584a', '#d88868'], detalhe: ['#243c8a', '#3c5cc0', '#7c98e8'], detalhe2: ['#a87820', '#e0b040', '#f8dc80'] }),
  bordaCaminho: 'reta',
};
export default serra;
