import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-MG Manguezal (passo 4; opcional): a beirada norte abre a pé pelo ramal da Estrada da Usina (cipó: Facão), mas o
 * miolo é só de canoa (Remo) entre ilhas de lama e raízes; a saída sul deságua na Baía Azul. Berçário de caranguejos,
 * jacarezinhos, garças e, no canal fundo, peixe-boi. Para depois: a furna rachada (Quebra-pedra) e o cofre do
 * tronco de pedra (Força).
 */
const g = grade('A-MG', 50, [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|NTTTTTTTTT|TTTTTTTTTT',
  'TTTTTTTTTT|TTTTTTT...|..........|:...TTTTTT|TTTTTTTTTT',
  'TTTTTTTT..|...""""...|.......s..|:..""""..T|TTTTTTTTTT',
  'TTTTTT....|..""""""".|....1.....|:.""""""..|.TTTTTTTTT',
  'TTTTT...t.|...""""...|..........|:..""""...|...TTTTTTT',
  'TTTTbbbbbb|bbbbbbbbbb|bbbbbbbbbb|cbbbbbbbbb|bbbbTTTTTT',
  'TTTT......|..l.......|....l.....|:.........|....TTTTTT',
  'TTT...""""|..........|..""""....|:....l....|..t..TTTTT',
  'TTT.."""""|"....l....|.""""""...|:.........|.....TTTTT',
  'TTT...""""|..........|..""""....|=.........|......TTTT',
  'TTTl......|...~~~~~~~|~~~~~~~~~~|=~~~~~~...|..l...TTTT',
  'TTT...~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|......TTTT',
  'TT...~~~~~|~~TTT~~~~~|~~~~TT~~~~|~~~~~~~~~~|~~....TTTT',
  'TT..~~~~~~|~TTTTT~~~~|~~~TTTT~~~|~~~l""l~~~|~~~...TTTT',
  'TT.~~~~l""|"~TTT~~~~~|~~~~TT~~~~|~~l""""l~~|~~~~.TTTTT',
  'TT~~~~l"""|"l~~~~~~~~|~~~~~~~~~~|~~l"2""l~~|~~~~~~TTTT',
  'TT~~~~l"3"|"l~~~~~l""|l~~~~~~~~~|~~~l""l~~~|~~~~~~~TTT',
  'TT~~~~~l""|l~~~~~l"""|"l~~~~~~~~|~~~~~~~~~~|~~~~~~~TTT',
  'TTT~~~~~~~|~~~~~~l"k"|"l~~~~~~~~|~~TTT~~~~~|~~l""l~TTT',
  'TTT~~~~~~~|~~~~~~~l""|l~~~~~~~~~|~TTTTT~~~~|~l""""l~TT',
  'TTTT~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~TTT~~~~~|~l"4""l~TT',
  'TTTT~~TT~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~l""l~~TT',
  'TTT~~TTTT~|~~~~l""l~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~TT',
  'TTT~~~TT~~|~~~l""""l~|~~~####l~~|~~~~~~~~~~|~~~~~~~TTT',
  'TTT~~~~~~~|~~~l"5""l~|~~~#y.rl~~|~~~~~~~~~~|~~~~~~TTTT',
  'TTTT~~~~~~|~~~~l""l~~|~~~####l~~|~~~~~~~~~~|~~~~~~TTTT',
  'TTTT~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~####~~~~|~~~~~TTTTT',
  'TTTTT~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~#u##~~~~|~~~~TTTTTT',
  'TTTTT~~~~~|~~~TT~~~~~|~~~~~~~~~~|~lp..#~~~~|~~~TTTTTTT',
  'TTTTTT~~~~|~~TTTT~~~~|~~~~~~~~~~|~~####~~~~|~~~TTTTTTT',
  'TTTTTTT~~~|~~~TT~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~TTTTTT',
  'TTTTTTTT~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~TTTTTT',
  'TTTTTTTTTT|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~TTTTT',
  'TTTTTTTTTT|TTTT~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~TTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTT~~|~~~~~~~~~~|~~~TTTTTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|~~TTTTTTTT',
], { N: ':', k: '"', '2': '"', '3': '"', '4': '"', '5': '"' });
const zona: ZonaDef = {
  id: 'A-MG', nome: 'Manguezal', mapa: 'A', tipo: 'floresta', tileset: 'mata', musica: 'agua', arena: 'mangue', passo: 4,
  mapaChars: g.mapa,
  objetos: [
    { o: 'placa', ...g.p('s'), texto: 'MANGUEZAL — berçário da Baía Azul.\nDaqui para dentro, só de canoa. Na andada do caranguejo, não se cata: se admira.' },
    { o: 'canoa', x: 32, y: 9 }, { o: 'tronco-caido', x: 8, y: 6 }, { o: 'bromelia', x: 20, y: 7 }, { o: 'bromelia', x: 42, y: 8 },
  ],
  warps: [
    { ...g.p('N'), para: { zona: 'A-R4', x: 38, y: 28, dir: 'n' }, tipo: 'borda' },
    { x: 40, y: 35, para: { zona: 'A-BA', x: 12, y: 1, dir: 's' }, tipo: 'borda' }, { x: 41, y: 35, para: { zona: 'A-BA', x: 13, y: 1, dir: 's' }, tipo: 'borda' },
  ],
  npcs: [
    { id: 'mg-catador', sprite: 'npc-homem-4', x: 34, y: 7, mov: 'olhar', fala: ['Quer entrar no mangue? A pé você vai até a lama da beirada. Dali em diante é canoa, e canoa quem puxa é criatura de Rio.', 'Lá no fundo o canal deságua na Baía Azul, do ladinho da praia de Porto Sereia.'] },
    { id: 'mg-menino', sprite: 'cl-crianca-m', x: 13, y: 8, mov: 'vagar', fala: ['Eu conto caranguejo: um, dois, três… eles andam de lado para eu perder a conta. É de propósito!', 'De noite o Pererecão canta grosso. Minha mãe diz que é ele chamando chuva.'] },
    { id: 'A-MG-1', sprite: 'npc-mulher-1', ...g.p('1'), dir: 's', treinador: 'A-MG-1', visao: 3 },
    { id: 'A-MG-2', sprite: 'cl-pescador', ...g.p('2'), dir: 'o', treinador: 'A-MG-2', visao: 4 },
    { id: 'A-MG-3', sprite: 'cl-biologa', ...g.p('3'), dir: 'n', mov: 'olhar', treinador: 'A-MG-3', visao: 4 },
    { id: 'A-MG-4', sprite: 'cl-mateira', ...g.p('4'), dir: 'o', treinador: 'A-MG-4', visao: 4 },
    { id: 'A-MG-5', sprite: 'cl-observadora', ...g.p('5'), dir: 's', mov: 'olhar', treinador: 'A-MG-5', visao: 4 },
  ],
  itens: [
    { ...g.p('k'), item: 'cuia-rede', qtd: 3, flag: 'item:A-MG:ilha' },
    { ...g.p('y'), item: 'pt-20', flag: 'item:A-MG:furna' },
    { ...g.p('u'), item: 'cuia-ouro', flag: 'item:A-MG:tronco' },
    { x: 7, y: 3, item: 'unguento', qtd: 2, flag: 'item:A-MG:beirada' },
    { x: 44, y: 13, item: 'pomada-copaiba', qtd: 2, flag: 'item:A-MG:leste' },
    { x: 37, y: 14, item: 'concha-rara', oculto: true, flag: 'item:A-MG:lama' },
    { x: 3, y: 10, item: 'caju', qtd: 2, oculto: true, flag: 'item:A-MG:raiz' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.12,
      todos: [{ e: 35, nv: [21, 25], peso: 22 }, { e: 83, nv: [21, 25], peso: 20 }, { e: 127, nv: [21, 25], peso: 18 }, { e: 107, nv: [21, 25], peso: 16 }, { e: 129, nv: [21, 25], peso: 14 }, { e: 24, nv: [20, 21], peso: 10 }],
      noite: [{ e: 35, nv: [21, 25], peso: 22 }, { e: 83, nv: [21, 25], peso: 20 }, { e: 25, nv: [22, 25], peso: 20 }, { e: 127, nv: [21, 25], peso: 16 }, { e: 24, nv: [20, 21], peso: 12 }, { e: 129, nv: [21, 25], peso: 10 }],
      camadas: [{ apos: 8, todos: [{ e: 36, nv: [38, 41], peso: 22 }, { e: 108, nv: [37, 40], peso: 20 }, { e: 84, nv: [36, 40], peso: 20 }, { e: 127, nv: [28, 31], peso: 14 }, { e: 129, nv: [30, 33], peso: 12 }, { e: 35, nv: [26, 27], peso: 12 }], noite: [{ e: 36, nv: [38, 41], peso: 24 }, { e: 25, nv: [34, 37], peso: 24 }, { e: 84, nv: [36, 40], peso: 22 }, { e: 128, nv: [37, 40], peso: 16 }, { e: 108, nv: [37, 40], peso: 14 }] }],
    },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 83, nv: [21, 25], peso: 40 }, { e: 37, nv: [21, 24], peso: 30 }, { e: 125, nv: [21, 25], peso: 22 }, { e: 77, nv: [22, 25], peso: 8 }], camadas: [{ apos: 8, todos: [{ e: 84, nv: [36, 40], peso: 40 }, { e: 126, nv: [36, 40], peso: 25 }, { e: 37, nv: [28, 29], peso: 20 }, { e: 77, nv: [34, 38], peso: 15 }] }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [12, 18], peso: 70 }, { e: 35, nv: [12, 18], peso: 30 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [21, 25], peso: 45 }, { e: 129, nv: [21, 25], peso: 30 }, { e: 83, nv: [21, 25], peso: 25 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 83, nv: [26, 27], peso: 45 }, { e: 77, nv: [34, 38], peso: 30 }, { e: 86, nv: [34, 37], peso: 25 }] },
  ],
};
export default zona;
