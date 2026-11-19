import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `caverna`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-caverna', nome: 'Demonstração: Caverna', mapa: 'A', tipo: 'caverna', tileset: 'caverna', musica: 'vila', arena: 'campo',
  mapaChars: [
    '##############################',
    '#TTtTT.....####......TTTTtTTT#',
    '#T..."""...#ee#..,....."""..T#',
    '#T.."""",..........b...""",.T#',
    '#...........:::::::.........T#',
    '######v####.:.....:..fffff...#',
    '#....,.....::.C.C.:..f...f.T.#',
    '#.b.....p..:......:..f.o.f...#',
    '#..r..c....:..M...:::::::::::#',
    '#######....:....<.gg.>...ll..#',
    '#~~~~w##...:....<.gg.>...ll..#',
    '#~~~~w~~~~~=~~~~~.....xx.....#',
    '#~~d~~~~~~~=~~~~~~~...xx.,...#',
    '#~~~~~~~~~~=~~~~d~~~.........#',
    '#;;~~~~;;;;:;;;~~~~~..TT.t.T.#',
    '#;;;;;;;;;;:;;;;;~~~.........#',
    '#.,..%%%%..:..+++.;;.##..##..#',
    '#T...%%%%..:..+++....#########',
    '#TT.T......:.......TT#########',
    '###########  #################',
  ],
  objetos: [{ o: 'pedra-grande', x: 13, y: 3 }, { o: 'placa', x: 12, y: 15 }, { o: 'fogueira', x: 14, y: 13 }, { o: 'totem', x: 24, y: 12 }],
  warps: [],
};
export default zona;
