import type { ZonaDef } from '../../core/tipos';
import { grade, saidas, duelista, item, placa, subBosque } from './_a1-grade';

/**
 * A-R2 · Campos de Restinga (A2 a oeste → Mata dos Sabiás a leste). Dunas com saliências, cajueiros sacudíveis,
 * a Lagoa do Meio (ilhota: Remo), o Cajual Fechado (cipó: Facão), o atalho do pedregulho (Força) e a loca
 * rachada (Quebra-pedra). A Paçoca do Seu Aroeira se esconde no recanto do nordeste (missão do Faro).
 */
const g = grade('A-R2', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TTm....t..|..;;;;;;;;|;;;..TTTTT|TTTTTTTTTT|TTTTTTTTTT|TT..""""";|;;;;;..TTT|TTTTTTTTTT',
  'TT.,......|.;;;;;;;;;|;;;;..TTTT|TTTTTTTTTT|T.t..a..TT|T.."""""";|;;;;;;.TTT|.....tP.TT',
  'TT...1....|;;;""""";;|;;;;;..TTT|TTTTTTTTTT|T....t..TT|T.."""""";|;;;;;;.TTT|..,.....TT',
  'TT........|;;""""""";|;;;;;;...,|....t...TT|T.......TT|T...""";;;|;;;;;...TT|T.......TT',
  'TT.....,..|;;"""""";;|;;;;;.....|.........T|TTTTcTTTTT|....;;;;;;|;;;.....TT|TTT.TTTTTT',
  'TT........|;;;"""";;;|;;;;......|..........|..........|...;;;;;;.|........t.|........TT',
  'TT..b.....|::::::::::|:::::::...|..........|....,.....|..........|..........|.....,..TT',
  'TT........|:.........|......:...|..........|..........|..........|..........|........TT',
  'TT........|:..,......|......:...|..........|....::::::|::::::::::|:.........|""""""8.TT',
  'TT...t....|:..2......|..C.C.:...|....~~~~~.|....:.....|....."""""|:........"|""""""".TT',
  'TT........|:.........|......:...|..~~~~~~~~|~...:.....|....""""""|:........"|""":::::EE',
  'TT.s......|:.........|..C.C.:..~|~~~~~~~~~~|~~..:.....|..3.""""""|:.........|"":.....EE',
  'W:::::::::|:.........|......:.~~|~~~~~i~~~~|~~~.:.....|....."""".|:..7......|..:.....TT',
  'W:........|..........|......:.~~|~~~~;;;~~~|~~~.:..,..|..........|:.........|..:.....TT',
  'TT....,...|..........|......:.~~|~~~~~;~~~~|~~~.:.....|..........|:..,......|..:..,..TT',
  'TT........|....t.....|......:..~|~~~~~~~~~~|~~..:.....|..........|:.........|..:.....TT',
  'TTvvvvvvvv|<.........|......:...|~~~~~~~~~~|~...:.....|..........|::::::::::|:::.....TT',
  'TT;;;;;;;;|<..,......|......:...|..~~~~~~~.|....:.....|.....t....|..........|........TT',
  'TT;;;;;;;;|<.........|......:...|....;;;...|....:.....|..........|....,.....|...t....TT',
  'TT;;4;;;;;|<.........|......:...|..........|....:.....|vvvvvvvvvv|vvvvvvvvvv|vvvv....TT',
  'TT;;;;;;;;|;.........|......::::|::::::::::|:::::.....|;;;;;;;;;;|;;;;;;;;;;|;;;;....TT',
  'TT;;;;h;;;|;;........|..........|......,...|..........|;;;"""""";|;;;;;;;;;;|;;;;....TT',
  'TT;;;;;;;;|;;;.......|..........|5.........|..........|;;""""""";|;;;;##r##;|;;;;;...TT',
  'TT;;;;;;;;|;;;;..,...|.....t....|....######|#####.....|;;;"""""";|;;;;#;;k#;|;;;;;;..TT',
  'TT;;;;;;;;|;;;;;.....|..........|....#;;;;;|;;;;;p....|;;;;;;;;;;|;;;;#####;|;;6;;;;.TT',
  'TT;;;;;;;;|;;;;;;;...|..........|....#;j;;;|;;;;;#....|.;;;;;;;;;|;;;;;;;;;;|;;;;;;;;TT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT######|######TTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
], { W: ':', E: ':', m: '.', s: '.', a: '.', P: '.', i: ';', h: ';', k: ';', j: ';', '1': '.', '2': '.', '3': '.', '4': ';', '5': '.', '6': ';', '7': '.', '8': '.' });
const p1 = placa(g, 's', 'CAMPOS DE RESTINGA\nOeste: Vila Caiçara · Leste: Mata dos Sabiás\nCajueiro de tronco grosso? Dê uma sacudida. (A prefeitura não se responsabiliza pelo que cair.)');
const [px, py] = g.p('P');
const zona: ZonaDef = {
  id: 'A-R2', nome: 'Campos de Restinga', mapa: 'A', tipo: 'rota', tileset: 'costa', musica: 'rota-dia-A', arena: 'restinga', passo: 2,
  mapaChars: subBosque(g.mapa, false),
  objetos: [p1.objeto],
  placas: [p1.placa],
  warps: [...saidas(g, 'W', 'A2', 42, 15, 'o'), ...saidas(g, 'E', 'A-MS', 2, 21, 'l')],
  npcs: [
    duelista(g, '1', 'A-R2-1', 'cl-escoteira', 's', 4),
    duelista(g, '2', 'A-R2-2', 'cl-crianca-m', 'o', 3),
    duelista(g, '3', 'A-R2-3', 'cl-observadora', 'l', 4, { mov: 'olhar' }),
    duelista(g, '4', 'A-R2-4', 'cl-surfista', 'l', 4),
    duelista(g, '5', 'A-R2-5', 'cl-mateira', 'n', 3),
    duelista(g, '6', 'A-R2-6', 'cl-capoeirista', 'n', 4),
    duelista(g, '7', 'A-R2-7', 'cl-biologa', 'o', 3),
    duelista(g, '8', 'A-R2-8', 'cl-crianca-f', 's', 3),
    // a Paçoca (cutia do Seu Aroeira) some depois da insígnia 1 e se esconde aqui até a missão do Faro acabar
    { id: 'pacoca', sprite: 'c:cotiazinha', x: px, y: py, dir: 's', se: 'flag:faro-missao&!flag:faro-ok', script: 'faro-pacoca' },
  ],
  itens: [
    item(g, 'm', 'A-R2', 'cha-cidreira'),
    item(g, 'a', 'A-R2', 'pt-38'),
    item(g, 'i', 'A-R2', 'cuia-ouro'),
    item(g, 'h', 'A-R2', 'fumaca-andiroba'),
    item(g, 'k', 'A-R2', 'pepita'),
    item(g, 'j', 'A-R2', 'pedra-solar'),
    { x: 23, y: 9, item: 'caju', qtd: 2, oculto: true, flag: 'item:A-R2:23,9' },
    { x: 68, y: 8, item: 'mel-puro', oculto: true, flag: 'item:A-R2:68,8' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      manha: [{ e: 10, nv: [6, 8], peso: 25 }, { e: 15, nv: [6, 8], peso: 25 }, { e: 41, nv: [7, 9], peso: 15 }, { e: 33, nv: [7, 9], peso: 15 }, { e: 81, nv: [7, 9], peso: 12 }, { e: 47, nv: [8, 9], peso: 8 }],
      dia: [{ e: 10, nv: [6, 8], peso: 25 }, { e: 15, nv: [6, 8], peso: 22 }, { e: 41, nv: [7, 9], peso: 22 }, { e: 33, nv: [7, 9], peso: 14 }, { e: 81, nv: [7, 9], peso: 12 }, { e: 47, nv: [8, 10], peso: 5 }],
      noite: [{ e: 20, nv: [6, 9], peso: 55 }, { e: 33, nv: [7, 9], peso: 25 }, { e: 81, nv: [7, 9], peso: 20 }],
      camadas: [
        { apos: 5, dia: [{ e: 10, nv: [20, 23], peso: 20 }, { e: 16, nv: [20, 22], peso: 15 }, { e: 41, nv: [21, 24], peso: 25 }, { e: 33, nv: [21, 24], peso: 15 }, { e: 81, nv: [21, 24], peso: 15 }, { e: 47, nv: [22, 25], peso: 10 }], noite: [{ e: 20, nv: [20, 23], peso: 45 }, { e: 21, nv: [24, 26], peso: 15 }, { e: 33, nv: [21, 24], peso: 20 }, { e: 81, nv: [21, 24], peso: 20 }] },
        { apos: 10, dia: [{ e: 11, nv: [34, 37], peso: 25 }, { e: 42, nv: [34, 38], peso: 25 }, { e: 34, nv: [34, 38], peso: 20 }, { e: 82, nv: [35, 38], peso: 15 }, { e: 47, nv: [33, 36], peso: 15 }], noite: [{ e: 21, nv: [34, 38], peso: 45 }, { e: 34, nv: [34, 38], peso: 30 }, { e: 82, nv: [35, 38], peso: 25 }] },
      ],
    },
    {
      metodo: 'arvore',
      dia: [{ e: 149, nv: [7, 9], peso: 65 }, { e: 27, nv: [7, 9], peso: 35 }],
      noite: [{ e: 20, nv: [7, 9], peso: 100 }],
      camadas: [{ apos: 5, dia: [{ e: 149, nv: [21, 24], peso: 60 }, { e: 27, nv: [21, 25], peso: 40 }], noite: [{ e: 20, nv: [21, 24], peso: 100 }] }],
    },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 37, nv: [22, 26], peso: 60 }, { e: 57, nv: [22, 26], peso: 40 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [6, 9], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [16, 21], peso: 100 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 37, nv: [28, 33], peso: 55 }, { e: 38, nv: [31, 35], peso: 45 }] },
  ],
};
export default zona;
