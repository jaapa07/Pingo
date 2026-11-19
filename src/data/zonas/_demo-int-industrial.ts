import type { ZonaDef } from '../../core/tipos';

/** Demonstração do tileset `industrial` (laboratório do Cartel Ferrugem) com todos os caracteres da legenda. */
const zona: ZonaDef = {
  id: '_demo-int-cartel', nome: 'Demonstração: laboratório do Cartel', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel', arena: 'usina',
  mapaChars: [
    '####################',
    '#####eee############',
    '#..,,..::::..;;;;.T#',
    '#.++...:..:..;%%;.t#',
    '#.++.M.:..:..""..b.#',
    '#....M.::::..""..C.#',
    '#~~~=~~~..ggg..lll.#',
    '#~d~=~w~..ggg..lll.#',
    '#~~~=~~~.xxx..o..f.#',
    '#........xxx.cpr.f.#',
    '#.vv.<.>.........f.#',
    '#..................#',
    '####################',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    { o: 'computador-cartel', x: 1, y: 11 }, { o: 'tanque', x: 4, y: 11 }, { o: 'tanque', x: 5, y: 11 }, { o: 'jaula', x: 7, y: 11 }, { o: 'tambor', x: 9, y: 11 },
    { o: 'gerador', x: 11, y: 11 }, { o: 'painel', x: 14, y: 11 }, { o: 'vagonete', x: 17, y: 11 }, { o: 'turbina', x: 8, y: 3 },
  ],
  warps: [],
};
export default zona;
