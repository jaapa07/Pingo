import type { ZonaDef } from '../../core/tipos';

/** Zona de demonstração do tileset `ferrugem`: usa todos os caracteres da legenda (validação visual do bake). */
const zona: ZonaDef = {
  id: '_demo-ferrugem', nome: 'Demonstração: Ferrugem', mapa: 'A', tipo: 'cidade', tileset: 'ferrugem', musica: 'vila', arena: 'campo',
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
  objetos: [{ o: 'oficina', x: 2, y: 5 }, { o: 'usina-fachada', x: 8, y: 5 }, { o: 'poste', x: 17, y: 5 }, { o: 'trem', x: 2, y: 10 }, { o: 'placa', x: 18, y: 5 }],
  warps: [],
};
export default zona;
