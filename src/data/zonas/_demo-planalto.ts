import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `planalto`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-planalto', nome: 'Demonstração: Planalto', mapa: 'B', tipo: 'cidade', tileset: 'planalto', musica: 'vila', arena: 'campo',
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
  objetos: [{ o: 'observatorio', x: 2, y: 5 }, { o: 'casa-colonial-c', x: 7, y: 5 }, { o: 'coreto', x: 13, y: 5 }, { o: 'poste', x: 17, y: 5 }, { o: 'estatua', x: 19, y: 4 }, { o: 'ginasio', x: 2, y: 10 }],
  warps: [],
};
export default zona;
