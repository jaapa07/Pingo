import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, duelista, item, placa, subBosque } from './_a1-grade';
import { TEXTOS_DEMO } from '../../core/demo';

/**
 * A-R3 · Trilha dos Cipós (Bosque Alto a oeste → Gruta do Eco a leste). Os cipós grossos fecham a trilha logo na
 * entrada e de novo antes da gruta: só passa quem tem o Facão. No meio corre o Riacho da Piaba (ponte e pesca).
 * Para depois: o platô da trepadeira (Escalar), a ilhota do poção (Remo), o cofre do pedregulho (Força) e a
 * loca rachada (Quebra-pedra). As saliências do sul são caminho só de descida.
 */
const g = grade('A-R3', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|~~~~TTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT######|T#########',
  'TT...t....|TTa....TTT|TTTT......|~~~~..TT##|########TT|TT..""T...|.t..#m..#T|T#########',
  'TT.,......|TT....tTTT|TT..."""..|~~~~...T#h|.......#TT|T.."""T...|....#...#T|T#########',
  'TT........|TT.....TTT|T...""""..|~~~~l..T#.|...,...#TT|T.."""T...|....##r##T|T#########',
  'TT........|TTTTcTTTTT|T..""""...|~~~~l...##|###e####TT|T.....T...|..........|T#########',
  'TT....t...|TT........|..."""....|~~~~l.....|..........|..t...T...|..........|T#########',
  'TT........|TT.""""...|..........|~~~~......|.."""""...|......T...|..........|T#########',
  'TT........|TT."""""..|...1......|~~~~l.....|.""""""...|......TT.T|TTTTTTTTTT|T#########',
  'TT........|TT.."""...|..........|~~~~......|.""""""...|......T...|..........|T#G#######',
  'TT....T...|TT........|......t...|~~~~l.....|..""""....|....3.T...|..7.......|...:..####',
  'TT........|TT........|..........|~~~l......|..........|......T...|..::::::::|::::..####',
  'TT...H.,..|TT...2....|..."""....|~~~l......|...4......|......T...|..:.......|......####',
  'TT........|TTt.......|.."""""...|~~~.......|..........|..""".T...|..:.."""".|T#########',
  'TT......s.|TT........|..""""....|~~~..F....|..........|."""".T...|..:.""""".|T#########',
  'W:::::::::|cc::::::::|::::::::::|===:::::::|::::::::::|::::::c:::|:::.""""8.|T#########',
  'W:::::::::|TT........|..........|~~~.......|..........|......T...|....""""..|T#########',
  'TT........|TT..."""".|..........|~~~l......|.."""""...|......T...|..........|T#########',
  'TT.t......|TT..""""".|....5.....|~~~l......|."""""""..|......T..C|.C........|T#########',
  'TT........|TT..."""".|..........|~~~~......|.."""""...|......T...|..........|T#########',
  'TT........|TTvvvvvvvv|vvvvvvv..~|~~~~~~~...|vvvvvvvvvv|vvvv..T...|.......6..|T#########',
  'TT........|TT........|........~~|~~~~~~~~..|..........|......T...|..........|T#########',
  'TT...,....|TT.t..."".|..t....~~~|~~~~~~~~..|...""""...|......T.##|p##.......|T#########',
  'TT........|TT....""""|.......~~~|~~n~~~~~..|..""""""..|......T.#.|..#.......|T#########',
  'TT........|TTi.."""".|.......~~~|~~~~~~~~..|...""""...|......T.#k|..#.......|T#########',
  'TT..t.....|TT........|..t.....~~|~~~~~~~...|..........|......T.##|###....t..|T#########',
  'TT........|TT........|........l~|~~~~~~l...|.....j....|......T...|..........|T#########',
  'TT........|TT........|.........l|~~~~ll....|..........|......T...|..........|T#########',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|~~~~TTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|T#########',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|~~~~TTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|T#########',
], {
  W: ':', G: '#', a: '.', h: '.', m: '.', n: ';', i: '.', j: '.', k: '.', s: '.', H: '.', F: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.',
});
const p1 = placa(g, 's', 'TRILHA DOS CIPÓS\nOeste: Bosque Alto · Leste: Gruta do Eco → Porto Sereia\nCipó grosso não se desata: corta-se. Traga o Facão e uma parceira que saiba usar.');
const gruta = entrada(g, 'G', 'caverna-entrada', 'A-GE', 4, 29, { tipo: 'caverna' });
const zona: ZonaDef = {
  id: 'A-R3', nome: 'Trilha dos Cipós', mapa: 'A', tipo: 'rota', tileset: 'mata', musica: 'rota-dia-A', arena: 'mata', passo: 3,
  mapaChars: subBosque(g.mapa, false),
  objetos: [obj(g, 'G', 'caverna-entrada'), p1.objeto, { o: 'cuieira', x: 7, y: 7, cor: 'amarela', script: 'cuieira' }],
  placas: [p1.placa],
  warps: [
    ...saidas(g, 'W', 'A3', 41, 15, 'o'),
    gruta,
  ],
  // DEMO (src/core/demo.ts): o guarda fica no único tile de acesso à Gruta do Eco; no jogo completo o portão não existe
  portoes: [{ x: gruta.x, y: gruta.y + 1, requer: '!demo', sprite: 'cl-montanhista', fala: TEXTOS_DEMO.guarda }],
  npcs: [
    // Parque Safári (spec 10A item 33): o pescador dá a Pedra de Rio depois da Liga (src/data/eventos/posliga.ts)
    { id: 'safari-pescador-seixo', sprite: 'cl-pescador', x: 35, y: 6, dir: 'o', se: 'flag:liga-vencida', script: 'safari-da-pedra' },
    gente(g, 'H', 'a-r3-mateiro', 'cl-mateira', 'Mateira Ceci', { mov: 'olhar', fala: ['Esses cipós cresceram numa noite só. Mata fechada é assim: piscou, trançou.', 'O Facão corta, mas quem maneja é a criatura: tem de ser do tipo Mata, Inseto ou Ginga.'] }),
    gente(g, 'F', 'a-r3-pescador', 'cl-pescador', 'Pescador Tonho', { dir: 'o', fala: ['O Riacho da Piaba faz jus ao nome: é jogar a linha e vem Piabinha.', 'De noite a margem enche de Pererequinha e de Vagalumim. Parece festa junina.', 'Dizem que lá dentro da Gruta do Eco tem um bagre de bigode que mora no escuro. Mandizinho, o nome.'] }),
    duelista(g, '1', 'A-R3-1', 'cl-observadora', 's', 4),
    duelista(g, '2', 'A-R3-2', 'cl-escoteira', 's', 3),
    duelista(g, '3', 'A-R3-3', 'cl-biologa', 'o', 4, { mov: 'olhar' }),
    duelista(g, '4', 'A-R3-4', 'cl-capoeirista', 's', 3),
    duelista(g, '5', 'A-R3-5', 'cl-mateira', 'n', 3),
    duelista(g, '6', 'A-R3-6', 'cl-repentista', 'o', 4),
    duelista(g, '7', 'A-R3-7', 'cl-montanhista', 's', 4),
    duelista(g, '8', 'A-R3-8', 'cl-crianca-m', 'o', 4),
  ],
  itens: [
    item(g, 'a', 'A-R3', 'pt-08'),
    item(g, 'h', 'A-R3', 'folha-ancestral'),
    item(g, 'm', 'A-R3', 'elixir-andiroba'),
    item(g, 'n', 'A-R3', 'cuia-rede', 3),
    item(g, 'i', 'A-R3', 'garrafada'),
    item(g, 'j', 'A-R3', 'cuia', 3),
    item(g, 'k', 'A-R3', 'pt-28'),
    { x: 38, y: 22, item: 'jabuticaba', qtd: 2, oculto: true, flag: 'item:A-R3:38,22' },
    { x: 4, y: 26, item: 'fumaca-andiroba', oculto: true, flag: 'item:A-R3:4,26' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [{ e: 57, nv: [15, 17], peso: 30 }, { e: 107, nv: [15, 17], peso: 28 }, { e: 155, nv: [15, 18], peso: 27 }, { e: 18, nv: [16, 18], peso: 15 }],
      noite: [{ e: 24, nv: [15, 17], peso: 32 }, { e: 28, nv: [15, 18], peso: 30 }, { e: 57, nv: [15, 17], peso: 20 }, { e: 155, nv: [15, 18], peso: 10 }, { e: 18, nv: [16, 18], peso: 8 }],
      camadas: [
        { apos: 6, dia: [{ e: 57, nv: [26, 29], peso: 28 }, { e: 107, nv: [26, 29], peso: 26 }, { e: 155, nv: [26, 30], peso: 24 }, { e: 18, nv: [26, 29], peso: 14 }, { e: 19, nv: [28, 31], peso: 8 }], noite: [{ e: 24, nv: [26, 28], peso: 25 }, { e: 25, nv: [27, 30], peso: 15 }, { e: 28, nv: [26, 29], peso: 25 }, { e: 29, nv: [28, 31], peso: 10 }, { e: 57, nv: [26, 29], peso: 25 }] },
        { apos: 11, dia: [{ e: 58, nv: [38, 41], peso: 30 }, { e: 108, nv: [38, 41], peso: 28 }, { e: 155, nv: [36, 39], peso: 22 }, { e: 19, nv: [38, 41], peso: 20 }], noite: [{ e: 25, nv: [38, 41], peso: 35 }, { e: 29, nv: [38, 41], peso: 35 }, { e: 58, nv: [38, 41], peso: 30 }] },
      ],
    },
    { metodo: 'arvore', dia: [{ e: 155, nv: [16, 18], peso: 60 }, { e: 18, nv: [16, 18], peso: 40 }], noite: [{ e: 28, nv: [16, 18], peso: 100 }] },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 37, nv: [22, 26], peso: 50 }, { e: 57, nv: [22, 26], peso: 30 }, { e: 24, nv: [22, 26], peso: 20 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [10, 14], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [18, 23], peso: 85 }, { e: 24, nv: [18, 22], peso: 15 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 37, nv: [30, 34], peso: 55 }, { e: 38, nv: [32, 36], peso: 45 }] },
  ],
};
export default zona;
