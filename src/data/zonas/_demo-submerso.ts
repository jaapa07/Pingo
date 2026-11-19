import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `submerso`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-submerso', nome: 'Demonstração: Submerso', mapa: 'A', tipo: 'agua', tileset: 'submerso', musica: 'vila', arena: 'campo',
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
  objetos: [{ o: 'pedra-grande', x: 2, y: 4 }, { o: 'barco', x: 8, y: 4 }, { o: 'estatua', x: 14, y: 4 }, { o: 'totem', x: 16, y: 4 }],
  warps: [],
};
export default zona;
