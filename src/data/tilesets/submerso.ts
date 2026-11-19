import type { PaletaBioma, TilesetExterior } from './tipos';
import { ARTE_COMUM, AREIA, ALGAS, ESPINHOS, construcao, trocarLetras } from './_comum';

const paleta: PaletaBioma = {
    g: '#2c6a94', G: '#4c98b4', l: '#7cc0cc', L: '#c0ecec',
    t: '#3c5c8c', T: '#5c84ac', U: '#8cb0cc',
    s: '#8a8a6c', S: '#b8b88c', Z: '#e4e4b8',
    a: '#0e2c5c', A: '#184a84', e: '#3c7cb4', E: '#a4dcf0',
    r: '#2c3c6c', R: '#48609a', q: '#7090c0', Q: '#a8c8e4',
    f: '#145c54', F: '#1e8a6c', v: '#48bc84', V: '#98ec9c',
    m: '#4a3050', M: '#7a4a74', n: '#b0749c',
    y: '#ffe060', p: '#ff7ca8', w: '#ffffff',
    x: '#b03450', X: '#f0606c', o: '#ffa48c',
    k: '#101a3c',
};
/** SUBMERSO: tudo banhado de azul; corais quentes e algas verdes dão o contraste. */
const submerso: TilesetExterior = {
  nome: 'submerso',
  periodos: false,
  descricao: 'Fundo do mar e túneis alagados: areia azulada, recifes, corais e algas',
  paleta,
  base: { chao: 'G', caminho: 'T', alt: 'S', encontro: 'G', piso: 'q', gelo: 'E', lama: 't', paredeTopo: 'R', agua: 'A', perigo: 'G' },
  arte: {
    ...ARTE_COMUM,
    chao: trocarLetras(AREIA, { Z: 'l', s: 'g' }), encontro: ALGAS, perigo: ESPINHOS,
    decor: [
      [
        '................', '................', '..kkk...........', '.kwwpk..........',
        '.kwpwk....o.....', '..kkk....oXo....', '........ooXoo...', '.........oXo....',
        '.........o.o....', '................', '.....p.p.p......', '.....pXpXp......',
        '......XXX.......', '......xXx.......', '.......x........', '................',
      ],
      [
        '................', '..........E.....', '.........E.E....', '..v.......E.....',
        '.vF.v...........', '..FvF.......E...', '..F.F...........', '..f.f....v......',
        '........vF.v....', '.........FvF....', '.....w...F.F....', '....wyw..f.f....',
        '.....w..........', '................', '................', '................',
      ],
    ],
  },
  arvore: ['coral', 'alga'],
  arvoreSacudivel: 'alga',
  construcao: construcao(paleta, { parede: ['#48609a', '#7090c0', '#a8c8e4'], telhado: ['#b03450', '#f0606c', '#ffa48c'], detalhe: ['#145c54', '#1e8a6c', '#98ec9c'], detalhe2: ['#b09020', '#ffe060', '#fff8b0'] }),
  bordaCaminho: 'organica',
};
export default submerso;
