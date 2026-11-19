import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `costa`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-costa', nome: 'Demonstração: Costa', mapa: 'A', tipo: 'cidade', tileset: 'costa', musica: 'vila', arena: 'praia',
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
  objetos: [
    { o: 'casa-a', x: 2, y: 5 }, { o: 'posto', x: 8, y: 5 }, { o: 'poste', x: 14, y: 4 }, { o: 'placa', x: 18, y: 5 },
    { o: 'jangada', x: 3, y: 13 }, { o: 'coqueiro', x: 12, y: 17 }, { o: 'banco', x: 15, y: 4 },
  ],
  warps: [],
};
export default zona;
