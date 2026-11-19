import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-R4 Estrada da Usina (passo 3): de Porto Sereia até o portão da Usina Velha.
 * Caminho principal pelo meio; ramal sul até o Manguezal (cipó: Facão); bolsão de saliências;
 * áreas para voltar depois: ilhota do açude e da represa (Remo), platô (Escalar), furna de rocha rachada (Quebra-pedra).
 */
const g = grade('A-R4', 80, [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TT########|########TT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TT..."""""|"...T....t|..,....TTT|TT#....;;i|;;.....#T.|...""""...|.T...~~~~~|~~~~TTTTTT',
  'T...."""""|"........T|.....""..T|T.#..,....|.......#..|..""""""..|.....~~~~~|~~~~~TTTTT',
  'T..,..""""|..1.......|...."""...|..#...."""|"......#..|..""""""..|..b..~~~;;|;~~~~~TTTT',
  'T.....""".|...b......|..t.""""..|..#...""".|.......#..|...""""...|.....~~~;j|;~~~~~TTTT',
  'T.........|..........|....""....|..#.......|.......#..|.......r..|.....~~~~~|~~~~~~TTTT',
  'T..t......|....,.....|..........|..#.......|.......#..|.....2....|.....~~~~~|~~~~~TTTTT',
  'T.........|..........|...,......|..####e###|########..|..........|..........|......TTTT',
  'TT........|...."""...|..........|..........|..........|..........|......HHHH|HHHH..TTTT',
  'TTT.......|..."""""..|..........|..........|...."""...|.....3....|......HHHH|HHHH..TTTT',
  'TT...CC.P.|...""""...|.......:::|::::::::::|::::::::::|:.........|......HHHH|HHHH.tTTTT',
  'T.........|..........|.......:..|...t......|......b...|:..fffffff|ffffffUHHH|HHHHfffTTT',
  'W:::::::::|::::::::::|::::::::..|a.........|..........|:.........|........7.|:.8....TTT',
  'T...."""..|..........|:.........|..........|..........|::::::::::|::::::::::|:..Q...TTT',
  'T...""""".|.....t....|:....#####|##########|########..|..........|..n.,.....|.......TTT',
  'T.."""""".|..........|:........"|"""...."""|""....b#..|..........|..b.......|......TTTT',
  'T...~~~~~~|~~~~......|:.........|""..5...""|""...,.#..|...#####rr|####......|......TTTT',
  'T..~~~~~~~|~~~~~.....|:.........|.""""...""|"......#..|...#.,..k.|...#......|......TTTT',
  'T..~~~;;~~|~~~~~.....|:....vvvvv|vvvvvvvvvv|vvvvvvv#..|...#."""".|...#..t...|.....TTTTT',
  'T..~~~;m~~|~~~~~.....|:.........|...,......|.......#..|...#......|...#......|.....TTTTT',
  'T..~~~~~~~|~~~~~..b..|:.........|..""""....|.......#..|...#######|####......|....TTTTTT',
  'T...~~~~~~|~~~~......|:..t......|.""""""...|...4......|..........|......""""|....TTTTTT',
  'TT...~~~~~|~~~.......|:.........|..""""....|..........|....""""..|....."""""|"...TTTTTT',
  'TTT.......|..........|:.........|..........|.....t....|..""""""..|....."""""|"...TTTTTT',
  'TTTT...h..|..........|::::::::::|:::::::::.|..........|...""""...|......""""|...TTTTTTT',
  'TTTTTT....|...,......|.....TTTTT|TTTTTTTb:b|TTTTT.....|..........|..........|..TTTTTTTT',
  'TTTTTTTT..|..........|...TTTTTTT|TTTTTTTTcT|TTTTTTT...|......t...|.........T|TTTTTTTTTT',
  'TTTTTTTTTT|TTTT......|.TTTTTTTTT|TTTTTTT.:.|TTTTTTTTTT|TT........|....TTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTT.:.|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTST|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
], { W: ':', S: ':', m: ';', i: ';', j: ';' });

const zona: ZonaDef = {
  id: 'A-R4', nome: 'Estrada da Usina', mapa: 'A', tipo: 'rota', tileset: 'costa', musica: 'rota-dia-A', arena: 'restinga', passo: 3,
  mapaChars: g.mapa,
  objetos: [
    { o: 'usina-fachada', ...g.p('U') },
    { o: 'placa', ...g.p('P'), texto: 'ESTRADA DA USINA\n← Porto Sereia · Usina Velha →\nRamal sul: Manguezal (leve o Facão).' },
    { o: 'placa', ...g.p('Q'), texto: 'USINA VELHA — Companhia de Luz da Costa do Sol.\nAlguém pichou por cima: "FECHADA PARA REFORMA. ASS.: NINGUÉM SUSPEITO."' },
    { o: 'poste', x: 29, y: 9 }, { o: 'poste', x: 49, y: 9 }, { o: 'poste', x: 62, y: 14 },
  ],
  warps: [
    { ...g.p('W'), para: { zona: 'A4', x: 58, y: 20, dir: 'o' }, tipo: 'borda' },
    { ...g.d('U', 4, 0), para: { zona: 'A-US-1', x: 15, y: 20, dir: 'n' }, tipo: 'porta' },
    { ...g.p('S'), para: { zona: 'A-MG', x: 30, y: 1, dir: 's' }, tipo: 'borda' },
  ],
  npcs: [
    { id: 'eletricista', sprite: 'npc-homem-2', ...g.p('a'), mov: 'olhar', se: '!flag:usina-ok', fala: ['Sou eletricista da Usina. Quer dizer, era: uns sujeitos de macacão cor de ferrugem trocaram a fechadura.', 'Sem a Usina, o guindaste do cais não levanta nem pena e ninguém zarpa para a Baía Azul. A estação também apagou.'] },
    { id: 'eletricista-2', sprite: 'npc-homem-2', ...g.p('a'), mov: 'olhar', se: 'flag:usina-ok', fala: ['A luz voltou! O guindaste do cais de Porto Sereia já está rangendo: pode remar para a Baía Azul.', 'Os vaga-lumes voltaram para o pátio da Usina. De noite parece festa junina.'] },
    { id: 'menino', sprite: 'cl-crianca-m', ...g.p('n'), mov: 'vagar', fala: ['Meu avô diz que na represa mora um peixe que dá choque.', 'Eu queria ver, mas só chega lá quem rema. E eu só sei nadar cachorrinho.'] },
    { id: 'andarilha', sprite: 'npc-mulher-3', ...g.p('h'), fala: ['Para o sul fica o Manguezal. Os cipós fecharam a trilha de novo.', 'Com o Facão e uma parceira de Mata, Inseto ou Ginga, abre num instante.', 'Lá dentro, sem canoa, você só molha a canela na beirada.'] },
    { id: 't1', sprite: 'cl-escoteira', ...g.p('1'), dir: 's', treinador: 'A-R4-1', visao: 4 },
    { id: 't2', sprite: 'cl-observadora', ...g.p('2'), dir: 'o', treinador: 'A-R4-2', visao: 5 },
    { id: 't3', sprite: 'cl-crianca-m', ...g.p('3'), dir: 'o', treinador: 'A-R4-3', visao: 4 },
    { id: 't4', sprite: 'cl-mateira', ...g.p('4'), dir: 'o', mov: 'olhar', treinador: 'A-R4-4', visao: 4 },
    { id: 't5', sprite: 'cl-capoeirista', ...g.p('5'), dir: 'o', treinador: 'A-R4-5', visao: 5 },
    { id: 'capanga-a', sprite: 'capanga-m', ...g.p('7'), dir: 'l', se: '!flag:usina-ok', treinador: 'A-R4-6', visao: 2 },
    { id: 'capanga-b', sprite: 'capanga-f', ...g.p('8'), dir: 'o', se: '!flag:usina-ok', treinador: 'A-R4-7', visao: 2 },
  ],
  itens: [
    { ...g.p('i'), item: 'pedra-solar', flag: 'item:A-R4:plato' },
    { ...g.p('j'), item: 'cuia-rede', qtd: 3, flag: 'item:A-R4:represa' },
    { ...g.p('k'), item: 'pepita', flag: 'item:A-R4:furna' },
    { ...g.p('m'), item: 'concha-rara', oculto: true, flag: 'item:A-R4:acude' },
    { x: 77, y: 12, item: 'garrafada', flag: 'item:A-R4:patio' },
    { x: 2, y: 1, item: 'unguento', flag: 'item:A-R4:capim' },
    { x: 44, y: 22, item: 'mel-puro', oculto: true, flag: 'item:A-R4:trilha' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [{ e: 55, nv: [20, 23], peso: 35 }, { e: 88, nv: [20, 23], peso: 35 }, { e: 41, nv: [20, 22], peso: 20 }, { e: 45, nv: [20, 23], peso: 10 }],
      manha: [{ e: 55, nv: [20, 22], peso: 30 }, { e: 88, nv: [20, 23], peso: 30 }, { e: 45, nv: [20, 23], peso: 25 }, { e: 41, nv: [20, 22], peso: 15 }],
      noite: [{ e: 141, nv: [20, 23], peso: 35 }, { e: 88, nv: [20, 23], peso: 25 }, { e: 55, nv: [20, 22], peso: 20 }, { e: 93, nv: [21, 24], peso: 15 }, { e: 20, nv: [20, 22], peso: 5 }],
      camadas: [{
        apos: 7,
        dia: [{ e: 55, nv: [32, 35], peso: 35 }, { e: 88, nv: [30, 31], peso: 30 }, { e: 89, nv: [36, 38], peso: 10 }, { e: 41, nv: [28, 29], peso: 15 }, { e: 46, nv: [36, 38], peso: 10 }],
        noite: [{ e: 142, nv: [36, 38], peso: 25 }, { e: 93, nv: [31, 33], peso: 30 }, { e: 88, nv: [30, 31], peso: 20 }, { e: 55, nv: [33, 35], peso: 25 }],
      }],
    },
    { metodo: 'arvore', todos: [{ e: 151, nv: [20, 23], peso: 65 }, { e: 143, nv: [21, 24], peso: 35 }], camadas: [{ apos: 7, todos: [{ e: 151, nv: [26, 27], peso: 45 }, { e: 143, nv: [30, 33], peso: 40 }, { e: 152, nv: [36, 38], peso: 15 }] }] },
    { metodo: 'rocha', todos: [{ e: 163, nv: [30, 33], peso: 100 }] },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 37, nv: [20, 24], peso: 70 }, { e: 115, nv: [21, 24], peso: 30 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [10, 15], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [20, 25], peso: 80 }, { e: 115, nv: [22, 26], peso: 20 }] },
  ],
};
export default zona;
