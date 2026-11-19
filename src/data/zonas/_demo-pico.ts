import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `pico`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-pico', nome: 'Demonstração: Pico', mapa: 'PP', tipo: 'rota', tileset: 'pico', musica: 'vila', arena: 'campo',
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
  objetos: [{ o: 'caverna-entrada', x: 3, y: 5 }, { o: 'totem', x: 8, y: 4 }, { o: 'estatua', x: 10, y: 4 }, { o: 'pedra-grande', x: 13, y: 4 }, { o: 'casa-a', x: 2, y: 10 }, { o: 'fogueira', x: 8, y: 9 }],
  warps: [],
};
export default zona;
