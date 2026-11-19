import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A6 Ilha do Farol (passo 5): chega-se remando pelo oeste. O Cartel Ferrugem tomou o farol do cabo nordeste e
 * prendeu o Faroleiro Volta lá em cima: vencer o tenente Rebite rende o Lampião (`farol-ok`); o ginásio (Trovão) só
 * reabre depois do remédio da Faísca (`farol-remedio`: Xarope de Algas da boticária de Cidade Coral).
 * Do platô do farol pula-se a saliência de volta para a vila. Para depois: a prateleira de pedra do sudeste
 * (Escalar) e a loca rachada da praia sul (Quebra-pedra).
 */
const g = grade('A6', 50, [
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~#####|#####~~~~~',
  '~~~~~~~~~~|~~~~;;;;;;|;;;;;~~~~~|~~~###....|....###~~~',
  '~~~~~~~~;;|;;;;;;....|....;;;;~~|~~##...HH.|......##~~',
  '~~~~~~;q;;|..........|.......;;;|~##....FH.|...k...#~~',
  '~~~~~;;;..|...HHHHHH.|........;;|;#.....:..|.......#~~',
  '~~~~;;;...|...HHHHHH.|..T......;|;#.....:..|..2....#~~',
  '~~~;;;....|...HHHHHH.|.........;|##.....:..|.......#~~',
  '~~~;;.....|...GHHHHH.|..,.......|#...::::..|.....###~~',
  '~~;;;..T..|...h..:...|..........|#...:.....|...###~~~~',
  '~~;;......|......:..u|.........:|:::::..3..|.###~~~~~~',
  '~~;;...b..|......:...|HHHHHHHHH:|#.."""""".|##~~~~~~~~',
  '~~;;;.....|......:...|HHHHHHHHH:|#.."""""##|~~~~~~~~~~',
  '~~~;;;....|......:...|OHHHHVHHH:|####vv###~|~~~~~~~~~~',
  '~~~~;;::::|::::::::::|::::::::::|::::::::;;|;~~~~~~~~~',
  '~~~====;a.|..s.......|..........|.........;|;;~~~~~~~~',
  '~~~~;;;;..|.HHHH.....|HHHH...HHH|HH......;;|;~~~~~~~~~',
  '~~~~;;;...|.HHHH...1.|HHHH...HHH|HH..y....;|;~~~~~~~~~',
  '~~~;q;....|.AHHH.....|BHHH...QHH|HH.......;|;;~~~~~~~~',
  '~~;;;.....|...:......|.:.......:|.........;|;;;~~~~~~~',
  '~~;;......|...:::::::|::::::::::|..........|.;;;~~~~~~',
  '~~;;..C.C.|..........|....:.....|.....#####|##.;;;~~~~',
  '~~;;......|.."""""...|....:.....|.....#.m..|.#.;;;~~~~',
  '~~~;;.....|."""""""..|....:.....|.....#....|.#..;;~~~~',
  '~~~;;.....|."""""""..|....:..4..|.....##e##|##..;;~~~~',
  '~~~;;;....|..""""""..|....:.....|..........|....;;~~~~',
  '~~~~;;....|...""""...|....:..j..|...""""...|...;;;~~~~',
  '~~~~;;;...|..........|....:.....|..""""""..|..;;;~~~~~',
  '~~~~~;;;..|....5.....|....:.....|..""""""..|.;;;~~~~~~',
  '~~~~~~;;;;|..........|....:.....|...""""...|;q;~~~~~~~',
  '~~~~~~~;;;|;;;.......|....:.....|.........;|;;~~~~~~~~',
  '~~~~~~~~;;|;;q;;;;;;;|;;;;:;;;;;|;;;;;;;;;;|;~~~~~~~~~',
  '~~~~~~~~~~|;;;;;##r##|;;;;=;;;;;|;;;6;;;;;~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~;;#.n.#|;;~~=~~;;;|;;;;;~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~#####|~~~~=~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
], { q: ';', a: ';', '6': ';' });

const G = g.p('G'), F = g.p('F');
const zona: ZonaDef = {
  id: 'A6', nome: 'Ilha do Farol', mapa: 'A', tipo: 'cidade', tileset: 'costa', musica: 'cidade-choro', arena: 'praia', passo: 5,
  pouso: [22, 14],
  mapaChars: g.mapa,
  objetos: [
    { o: 'ginasio', ...G, cor: '#8c7a1f,#e8c83c,#fff4b0' },
    { o: 'posto', ...g.p('O') }, { o: 'venda', ...g.p('V') },
    { o: 'casa-b', ...g.p('A') }, { o: 'casa-palafita', ...g.p('B') }, { o: 'oficina', ...g.p('Q') },
    { o: 'farol', ...F },
    ...g.todos('q').map((p) => ({ o: 'coqueiro', ...p })),
    { o: 'placa', ...g.p('s'), texto: 'ILHA DO FAROL\n"A luz que guia a Baía Azul."\nNorte: Ginásio · Nordeste: Farol · Sul: praia dos pescadores.' },
    { o: 'placa', ...g.p('u'), texto: 'GINÁSIO DA ILHA DO FAROL\nLíder: Faroleiro Volta, o inventor.\n"Se piscar, é defeito. Se piscar bonito, é invenção."' },
    { o: 'placa', ...g.p('y'), texto: 'OFICINA DO VOLTA — consertam-se rádios, relógios e ideias.\nO FAROL fica na ponta do cabo: suba pelo caminho ao lado da Venda.' },
    { o: 'poste', x: 12, y: 13 }, { o: 'poste', x: 31, y: 15 }, { o: 'poste', x: 38, y: 9 },
    { o: 'banco', x: 16, y: 15 }, { o: 'canoa', x: 2, y: 14 }, { o: 'jangada', x: 27, y: 33 }, { o: 'barco', x: 6, y: 31 },
  ],
  warps: [
    { x: 0, y: 16, para: { zona: 'A-BA', x: 88, y: 14, dir: 'o' }, tipo: 'borda' }, { x: 0, y: 17, para: { zona: 'A-BA', x: 88, y: 15, dir: 'o' }, tipo: 'borda' },
    { x: G.x + 3, y: G.y, para: { zona: 'A6-ginasio', x: 8, y: 17, dir: 'n' }, tipo: 'porta' },
    { ...g.d('O', 2, 0), para: { zona: 'A6-posto', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { ...g.d('V', 1, 0), para: { zona: 'A6-venda', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('A', 2, 0), para: { zona: 'A6-casa-1', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('B', 1, 0), para: { zona: 'A6-casa-2', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('Q', 2, 0), para: { zona: 'A6-oficina', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...F, para: { zona: 'A6-farol-1', x: 7, y: 12, dir: 'n' }, tipo: 'porta' },
  ],
  portoes: [
    { x: G.x + 3, y: G.y, requer: 'flag:farol-remedio', fala: 'A porta do ginásio está trancada. Um bilhete preso com fita isolante:\n"Fui dar uma olhada no farol, que piscou esquisito. Volto em cinco minutos. — Volta"\fA tinta do bilhete já desbotou.' },
  ],
  npcs: [
    { id: 'a6-marinheiro', sprite: 'npc-marinheiro', ...g.p('a'), dir: 'o', se: '!flag:farol-ok', fala: ['Chegou em má hora, canoeiro. O farol apagou faz três noites e o Volta sumiu lá dentro.', 'Uns sujeitos de macacão cor de ferrugem subiram o cabo carregando jaulas. Desde então só desce faísca.'] },
    { id: 'a6-marinheiro-2', sprite: 'npc-marinheiro', ...g.p('a'), dir: 'o', se: 'flag:farol-ok', fala: ['O farol voltou a varrer a baía! Já dá para ver as pedras do canal de novo.', 'Ouvi dizer que você subiu lá e desceu com o Lampião. Com ele, a Gruta Breu de Cidade Coral deixa de ser breu.'] },
    { id: 'a6-senhora', sprite: 'npc-idosa', ...g.p('h'), fala: ['O Volta é um gênio, mas esquece a chave até do próprio ginásio.', 'Tipo Trovão morre de medo de Terra. O resto ele eletrocuta e pede desculpa depois.'] },
    { id: 'a6-radialista', sprite: 'npc-homem-3', ...g.p('j'), mov: 'olhar', script: 'a2-m-radio' },
    { id: 'A6-1', sprite: 'cl-crianca-f', ...g.p('1'), dir: 's', treinador: 'A6-1', visao: 3 },
    { id: 'A6-2', sprite: 'capanga-f', ...g.p('2'), dir: 'o', se: '!flag:farol-ok', treinador: 'A6-2', visao: 4 },
    { id: 'A6-3', sprite: 'capanga-m', ...g.p('3'), dir: 'o', se: '!flag:farol-ok', treinador: 'A6-3', visao: 3 },
    { id: 'A6-4', sprite: 'cl-observadora', ...g.p('4'), dir: 'o', mov: 'olhar', treinador: 'A6-4', visao: 3 },
    { id: 'A6-5', sprite: 'cl-surfista', ...g.p('5'), dir: 'l', treinador: 'A6-5', visao: 4 },
    { id: 'A6-6', sprite: 'cl-pescador', ...g.p('6'), dir: 'o', treinador: 'A6-6', visao: 4 },
  ],
  itens: [
    { ...g.p('k'), item: 'cuia-noturna', qtd: 3, flag: 'item:A6:cabo' },
    { ...g.p('m'), item: 'pt-23', flag: 'item:A6:prateleira' },
    { ...g.p('n'), item: 'pedra-lunar', flag: 'item:A6:loca' },
    { x: 20, y: 2, item: 'concha-rara', oculto: true, flag: 'item:A6:praia-norte' },
    { x: 45, y: 26, item: 'pepita', oculto: true, flag: 'item:A6:praia-leste' },
    { x: 8, y: 26, item: 'garrafada', flag: 'item:A6:oeste' },
  ],
  habitats: [
    { metodo: 'grama', taxa: 0.1, todos: [{ e: 129, nv: [24, 27], peso: 35 }, { e: 35, nv: [24, 27], peso: 30 }, { e: 28, nv: [24, 26], peso: 20 }, { e: 107, nv: [25, 28], peso: 15 }], noite: [{ e: 28, nv: [24, 26], peso: 40 }, { e: 123, nv: [24, 27], peso: 30 }, { e: 35, nv: [24, 27], peso: 30 }], camadas: [{ apos: 8, todos: [{ e: 130, nv: [38, 41], peso: 30 }, { e: 36, nv: [38, 41], peso: 30 }, { e: 29, nv: [37, 40], peso: 25 }, { e: 108, nv: [37, 40], peso: 15 }] }] },
    { metodo: 'agua', taxa: 0.05, todos: [{ e: 125, nv: [24, 28], peso: 40 }, { e: 79, nv: [24, 28], peso: 35 }, { e: 117, nv: [25, 28], peso: 25 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [12, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [22, 26], peso: 60 }, { e: 115, nv: [24, 27], peso: 25 }, { e: 125, nv: [24, 27], peso: 15 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 117, nv: [30, 31], peso: 45 }, { e: 115, nv: [30, 33], peso: 35 }, { e: 121, nv: [32, 35], peso: 20 }] },
  ],
};
export default zona;
