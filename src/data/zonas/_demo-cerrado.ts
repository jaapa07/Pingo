import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `cerrado`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-cerrado', nome: 'Demonstração: Cerrado', mapa: 'B', tipo: 'rota', tileset: 'cerrado', musica: 'vila', arena: 'campo',
  mapaChars: [
    '##############################',
    '#T.........................T.#',
    '#..........................t.#',
    '#.............,....b..ffff...#',
    '#..,..............,...f..f.T.#',
    '#.....:.......:.......f.Cf...#',
    '#:::::::::::::::::::..f.Cf...#',
    '#.""":..b.p.r.c..:.,......>..#',
    '#.""":vvvvv..o.M.:...gg...>ll#',
    '#;;;;:;;;;;;;;;;;:;<..gg..>ll#',
    '#;;;;;;;;;;;;;;;;:;<......xx.#',
    '#;;~~~~~~~;;;;~~~=~~~~~~..xx.#',
    '#;~~~~~~~~~~~~~~~=~~~~~~~....#',
    '#~~~~~d~~~~~~~~~~=~~~~####w###',
    '#~~~~~~~~~==~~~~~=~~~~~~~~~~~#',
    '#~~~~~~~~~==~~~~~:;;~~d~~~~~~#',
    '#~~~~~~;;;;;;;;;;:;;;;~~~~~~~#',
    '#;;;;;;;;%%%;+++;:;;T;;;;;;;;#',
    '#;T;;;;;;%%%;+++;;;;;;;T;;;ee#',
    '###########  #################',
  ],
  objetos: [{ o: 'casa-b', x: 2, y: 5 }, { o: 'venda', x: 8, y: 5 }, { o: 'cupinzeiro', x: 14, y: 4 }, { o: 'ipe-amarelo', x: 17, y: 4 }, { o: 'ipe-roxo', x: 19, y: 2 }, { o: 'buriti', x: 12, y: 17 }, { o: 'ninho', x: 24, y: 12 }, { o: 'estacao', x: 2, y: 10 }],
  warps: [],
};
export default zona;
