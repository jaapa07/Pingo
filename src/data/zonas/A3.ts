import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, duelista, item, placa } from './_a1-grade';

/**
 * A3 · Bosque Alto — a cidade nas copas: casas sobre estacas, passarelas de tábua e pontes de corda sobre o Igarapé do Casulo.
 * Ginásio do Inseto (Dona Seda). A casa-da-árvore do nordeste só abre quando a ponte de corda for consertada (missão do
 * Mestre Imbuia). A prainha além do igarapé, no sudoeste, pede o Remo. A saída leste leva à Trilha dos Cipós.
 */
const g = grade('A3', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
  'TTTTTTTTTT|TTTT~~TTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
  'TT....t...|...T~~T...|..........|TT....k.TT|TTTT',
  'TT.,......|....~~....|..........|T..C..C..T|TTTT',
  'TT........|....~~..I.|..........|T........T|TTTT',
  'TT........|....~~....|..........|T..C..C..T|TTTT',
  'TT..A.....|....~~....|..G.....e.|TTTTBTTTTT|TTTT',
  'TT.....a..|....~~....|..........|....=K....|..TT',
  'TT::::::::|::::==::::|::::::::::|::::::::::|:.TT',
  'TT.......:|...~~~....|.::.......|..........|:.TT',
  'TT..6....:|..~~~.....|.::...I...|..........|:.TT',
  'TT.......:|..~~......|.::.......|..........|:.TT',
  'TT.......:|..~~......|.::.......|..........|:.TT',
  'TT.P.....:|..~~......|.::.......|V.........|:.TT',
  'TT.....i.:|..~~...y..|.::.......|...j......|:.TT',
  'TT...:::::|::==::::::|::::::::::|::::::::::|:::E',
  'TT........|..~~......|.::.......|..........|..:E',
  'TT....I...|..~~......|.::...F...|..........|..TT',
  'TT........|..~~......|.::.......|....I.....|..TT',
  'TT...1....|..~~..2...|.::.......|..........|..TT',
  'TT........|.~~~......|.::.......|..3.......|..TT',
  '~~~~~~~~~~|~~~~......|.::.......|..........|..TT',
  '~~~~~~~~~~|~~~.......|.::.......|....H.....|..TT',
  'TT;;;~~~~~|~.........|.::.......|.......q..|..TT',
  'TT;;n;;TTT|T.........|.::.......|..........|..TT',
  'TT;;;;;;TT|T.........|.::.......|.......4..|..TT',
  'TT;;m;;;TT|T...J.....|.::...C.C.|..........|..TT',
  'TTT;;;;TTT|T......z..|.::.......|...5......|..TT',
  'TTTTTTTTTT|TT........|.::.......|.........T|TTTT',
  'TTTTTTTTTT|TTT.....s.|.::.......|......TTTT|TTTT',
  'TTTTTTTTTT|TTTTTTTTTT|T::TTTTTTT|TTTTTTTTTT|TTTT',
  'TTTTTTTTTT|TTTTTTTTTT|TSSTTTTTTT|TTTTTTTTTT|TTTT',
], {
  S: ':', E: ':', A: '.', G: '.', P: '.', V: '.', H: '.', J: '.', B: '=', K: '.', I: '.', F: '.', y: '.', k: '.', n: ';', m: ';',
  e: '.', a: '.', i: '.', j: '.', q: '.', z: '.', s: '.', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.',
});
const placas = [
  placa(g, 'e', 'GINÁSIO DE BOSQUE ALTO\nLíder: Dona Seda — "a tecelã que nunca perde o fio".'),
  placa(g, 'a', 'Casa da Dona Graúna.\n"Se o Nico aparecer, digam que o almoço esfriou."'),
  placa(g, 'i', 'POSTO GUARDIÃO\nSuba a escada devagar: a criatura machucada agradece.'),
  placa(g, 'j', 'VENDA DO GALHO\nTudo o que cai da árvore, a gente vende. Menos coco, que aqui não dá.'),
  placa(g, 'q', 'Oficina do Mestre Imbuia.\nPontes, escadas e conserto de cadeira de balanço.'),
  placa(g, 'z', 'Casa das Casuleiras.\nSilêncio: tem gente virando borboleta.'),
  placa(g, 's', 'BOSQUE ALTO\n"Mais perto do céu, mais longe do formigueiro."\nSul: Mata dos Sabiás · Leste: Trilha dos Cipós'),
];
const [bx, by] = g.p('B');
const zona: ZonaDef = {
  id: 'A3', nome: 'Bosque Alto', mapa: 'A', tipo: 'cidade', tileset: 'mata', musica: 'cidade-choro', arena: 'mata', passo: 2,
  pouso: [5, 14],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'G', 'ginasio', { cor: '#4c6b2a,#8fb347,#dcecA0' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'),
    obj(g, 'A', 'casa-palafita'), obj(g, 'H', 'casa-palafita'), obj(g, 'J', 'casa-palafita'),
    obj(g, 'F', 'fonte'), obj(g, 'y', 'poste'),
    ...g.todos('I').map(([x, y]) => ({ o: 'ipe-amarelo', x, y })),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'S', 'A-MS', 24, 2, 's'),
    ...saidas(g, 'E', 'A-R3', 1, 15, 'l'),
    entrada(g, 'G', 'ginasio', 'A3-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'A3-posto', 6, 8),
    entrada(g, 'V', 'venda', 'A3-venda', 5, 7),
    entrada(g, 'A', 'casa-palafita', 'A3-casa-1', 5, 7),
    entrada(g, 'H', 'casa-palafita', 'A3-casa-2', 5, 7),
    entrada(g, 'J', 'casa-palafita', 'A3-casa-3', 5, 7),
  ],
  portoes: [{ x: bx, y: by, requer: 'flag:m-ponte-ok', fala: 'A ponte de corda está arrebentada: sobraram duas tábuas e muita coragem.\fO Mestre Imbuia, logo ali, vive dizendo que conserta "assim que arrumar corda".' }],
  npcs: [
    gente(g, 'K', 'a3-imbuia', 'npc-homem-3', 'Mestre Imbuia', { dir: 'o', script: 'm-ponte' }),
    gente(g, '1', 'a3-menina', 'cl-crianca-f', 'Cecília', { mov: 'vagar', fala: ['Aqui ninguém pisa no chão depois que chove: é tudo passarela!', 'Minha vó diz que no tempo dela se ia de cipó. Minha vó conta muita história.'] }),
    gente(g, '2', 'a3-biologa', 'cl-biologa', 'Bióloga Marta', { mov: 'olhar', fala: ['Inseto não aguenta fogo, nem bicada, nem pedrada. Brasa, Vento e Pedra dão conta da Dona Seda.', 'Agora, se a sua parceira for de Mata ou de Mente… leve bastante chá.'] }),
    gente(g, '3', 'a3-velho', 'npc-idoso', 'Seu Jatobá', { fala: ['A Trilha dos Cipós, a leste, fechou de vez depois das chuvas.', 'Só passa quem tem o Amuleto do Facão — e a Dona Seda só entrega o dela para quem leva a Insígnia do Casulo.'] }),
    gente(g, '5', 'a3-moco', 'npc-homem-1', 'Moço do Regador', { mov: 'vagar', fala: ['Canteiro de terra fofa é banco: você deposita um fruto e saca um punhado.', 'Juros de pitanga. Melhor investimento de Pindorama.'] }),
    { id: 'taina', sprite: 'taina', x: 41, y: 15, dir: 'o', se: 'insignia:2&!flag:rival-2', script: 'rival-2' },
    duelista(g, '4', 'A3-1', 'cl-capoeirista', 'o', 4),
    duelista(g, '6', 'A3-2', 'cl-crianca-m', 'l', 4),
  ],
  itens: [
    item(g, 'k', 'A3', 'pt-33'),
    item(g, 'n', 'A3', 'pedra-mare'),
    item(g, 'm', 'A3', 'concha-rara', 1, true),
    { x: 7, y: 2, item: 'acerola', qtd: 2, oculto: true, flag: 'item:A3:7,2' },
  ],
  gatilhos: [{ x: 39, y: 15, w: 1, h: 2, script: 'rival-2', se: 'insignia:2&!flag:rival-2' }],
};
export default zona;
