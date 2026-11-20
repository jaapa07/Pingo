import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, entrada, bordas, gente, item, placa } from './_b1-lib';

/**
 * B1 · Vila Cascavel — a cidade onde o Trem Serra-Sol chega ao Sertão das Névoas (mapa B, aberto depois da Liga).
 * Não tem ginásio: o velho prédio de pedra virou o Salão da Raizeira (cura de ervas, chás e conselho).
 * Norte: Vereda dos Buritis (B-R1) → Cerrado Aberto → Pantanal. Leste, pela lagoa (Remo): Pantanal Alagado.
 * Visível e fora de alcance: o Mirante do Pequizeiro, no alto do paredão do nordeste (Escalar, insígnia 10).
 * Escondido: o quintal das ervas atrás da rocha rachada (Quebra-pedra) e a ilhota da lagoa (Remo).
 */
const g = grade('B1', [
  'TTTTTTTTTT|TTTTTTTTTT|TNNTTTTTTT|TTTTTTTTTT|TTTT',
  'T.........|..........|.::.......|.#########|##TT',
  'T.........|...u.....n|.::.......|.#..,.....|.#TT',
  'T.........|..........|.::.......|.#....k...|.#TT',
  'T.........|..........|.::.......|.#.,...q..|.#TT',
  'T.S.......|..........|.::.......|.#,.......|.#TT',
  'T:::::::::|::::::::::|:::.......|.###e#####|##TT',
  'T.....m...|......5...|.::.G.....|......1...|..TT',
  'T,........|.....u....|.:::::::h.|..........|..TT',
  'T~~~~~~==~|~~~~~~~~~~|~==~~~~~~~|~~~~~~~~~~|~~TT',
  'T~~~~~~==~|~~~~~~~~~~|~==~~~~~~~|~~~~~~~~~~|~~TT',
  'T;;;;;;;;;|;;;;;;;;;;|;::;;;;;;;|;;;;;;;;;;|;;TT',
  'T.........|..........|.::.......|..........|..TT',
  'T.........|..........|.::.......|..........|.uTT',
  'T.........|..........|.::.......|..........|..TT',
  'T..A......|...P......|.::..V....|...L......|..TT',
  'T:::::::::|::::::::::|::::::::::|::::::::::|:.TT',
  'T.........|....2.....|.::.......|.....7....|..TT',
  'T...y.....|..........|.::.......|..u.......|..TT',
  'T.........|......F...|.::.......|.......3..|..TT',
  'T.........|..........|.::...K...|..........|.yTT',
  'T........4|..........|.::.......|..........|..TT',
  'T...B.....|..........|.::.......|.Q........|..TT',
  'T:::::::::|::::::::::|::::::::::|::::::::::|:.TT',
  'Tbbbbrbbbb|b...u.....|.::....6..|...a......|..TT',
  'T.C.C.z..b|..........|.::.......|.......8..|..TT',
  'T.......Cb|;;;;;;;;;;|;::;;;;;;;|;;;;;;;;;;|;;;T',
  'bbbbbbbbbb|b~~~~~~~~~|~==~~~~~~~|~~~~~~~~~~|~~~T',
  'bbbbbbbbbb|~~~~~~~~~~|~==~~~~~~~|~;;;;~~~~~|~~~W',
  'TTTTTTTTT~|~~~~~~~~~~|~=9~~~~~~~|~;j;;~~~~~|~~~W',
  'TTTTTTTT~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~W',
  'TTTTTTTT~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~W',
  'TTTTTTTTT~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~TT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
], {
  N: ':', W: '~', S: '.', G: '.', A: '.', P: '.', V: '.', L: '.', B: '.', Q: '.', F: '.', K: '.', u: '.', y: '.',
  n: '.', m: '.', h: '.', a: '.', q: '.', k: '.', z: '.', j: ';',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.', '9': '=',
});

const placas = [
  placa(g, 'n', 'VILA CASCAVEL\nOnde o Trem Serra-Sol desce a serra e o Sertão começa.\nNorte: Vereda dos Buritis. Leste, pela lagoa: Pantanal Alagado.'),
  placa(g, 'm', 'ESTAÇÃO DE VILA CASCAVEL\nLinha Serra-Sol: Porto Sereia ⇄ Vila Cascavel. Segure o chapéu no túnel.'),
  placa(g, 'h', 'SALÃO DA RAIZEIRA\nAqui já foi ginásio. Hoje é chá, conselho e cura de raiz.\n"Planta que cura não tem pressa."'),
  placa(g, 'a', 'LAGOA DO CASCAVEL\nCanoa só com o Amuleto do Remo e uma criatura de Rio puxando.\nO Pantanal Alagado começa onde a lagoa acaba, a leste.'),
  placa(g, 'q', 'MIRANTE DO PEQUIZEIRO\nDaqui se vê a Chapada Rubra num dia limpo. Num dia de névoa, se vê névoa.'),
];
const zona: ZonaDef = {
  id: 'B1', nome: 'Vila Cascavel', mapa: 'B', tipo: 'cidade', tileset: 'cerrado', musica: 'cidade-catira', arena: 'cerrado', passo: 9,
  pouso: [15, 16],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'S', 'estacao'), obj(g, 'G', 'ginasio', { cor: '#6b3a1c,#a86a34,#e8c48c' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'),
    obj(g, 'L', 'laboratorio'), obj(g, 'A', 'casa-b'), obj(g, 'B', 'casa-d'), obj(g, 'Q', 'casa-f'), obj(g, 'F', 'fonte'), obj(g, 'K', 'coreto'),
    ...objs(g, 'u', 'buriti'), ...objs(g, 'y', 'ipe-amarelo'),
    { o: 'poste', x: 20, y: 7 }, { o: 'poste', x: 20, y: 15 }, { o: 'poste', x: 23, y: 22 }, { o: 'poste', x: 10, y: 15 },
    { o: 'banco', x: 36, y: 18 }, { o: 'canoa', x: 25, y: 28 }, { o: 'cupinzeiro', x: 12, y: 3 }, { o: 'ipe-roxo', x: 40, y: 24 },
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...bordas(g, 'N', 'B-R1', 14, 78, 'n', 1, 0),
    ...bordas(g, 'W', 'B-PA', 1, 16, 'l', 0, 1),
    entrada(g, 'S', 'estacao', 'B1-estacao', 8, 8),
    entrada(g, 'G', 'ginasio', 'B1-salao', 7, 9),
    entrada(g, 'P', 'posto', 'B1-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B1-venda', 5, 7),
    entrada(g, 'L', 'laboratorio', 'B1-lab', 7, 8),
    entrada(g, 'A', 'casa-b', 'B1-casa-1', 5, 7),
    entrada(g, 'B', 'casa-d', 'B1-casa-2', 5, 7),
    entrada(g, 'Q', 'casa-f', 'B1-casa-3', 5, 7),
  ],
  npcs: [
    gente(g, '1', 'b1-mirante', 'cl-montanhista', 'Montanhista Ana Baru', { dir: 's', mov: 'olhar', fala: ['Lá no alto do paredão fica o Mirante do Pequizeiro. Tem um pé de pequi carregado e coisa brilhando no chão.', 'Só sobe quem tem o Amuleto de Escalar. Dizem que o Garimpeiro Topázio, da Chapada Rubra, entrega um a quem vence o ginásio dele.'] }),
    gente(g, '2', 'b1-menina', 'cl-crianca-f', 'Jaci', { mov: 'vagar', fala: ['A cidade tem nome de cobra, mas a cascavel daqui é educada: chocalha antes de chegar.', 'Meu avô diz que é para a gente respeitar o Sertão. Eu respeito. De longe.'] }),
    gente(g, '3', 'b1-idoso', 'npc-idoso', 'Seu Juazeiro', { dir: 'o', fala: ['Do buriti a gente aproveita tudo: a palha, o doce, o óleo e a sombra.', 'O prédio de pedra lá em cima foi ginásio no meu tempo. A líder foi embora para a Costa, e a raizeira ficou com o salão. Melhor assim: lá dentro agora se cura em vez de se bater.'] }),
    gente(g, '4', 'b1-vaqueira', 'cl-vaqueiro', 'Vaqueira Inhuma', { dir: 'l', mov: 'olhar', fala: ['Quer chegar em Pantanal Grande? Tem dois jeitos.', 'Por terra: sobe a Vereda, cruza o Cerrado Aberto e desce as passarelas do Pantanal. Pela água: canoa na lagoa daqui e rema para o leste.', 'A Boiadeira Zefa é a líder de lá. Bicho de Terra que não sai do lugar nem com reza. Leve Rio, Mata ou Geada.'] }),
    gente(g, '5', 'b1-menino-trem', 'cl-crianca-m', 'Zé Trilho', { mov: 'vagar', fala: ['Eu conto os vagões todo dia. Hoje deu sete.', 'Agora o trem traz Campeão da Liga! Você é o terceiro que eu vejo. Os outros dois foram embora chorando para Porto Sereia.'] }),
    gente(g, '6', 'b1-raizeirinho', 'npc-homem-1', 'Ajudante Caraíba', { dir: 's', fala: ['Trabalho no Salão da Raizeira. A Dona Sucupira cura qualquer criatura de graça e ainda ensina o nome da erva.', 'Atrás daquela rocha rachada, no canto oeste, fica o quintal de ervas dela. A rocha caiu na última chuva. Quem tiver o Quebra-pedra pode abrir.'] }),
    gente(g, '7', 'b1-biologo', 'cl-biologa', 'Bióloga Cagaita', { dir: 's', mov: 'olhar', fala: ['O laboratório é a Estação de Pesquisa do Sertão. A Drª Buriti mandou montar antes de se mudar para a Costa do Sol.', 'Estamos medindo as cheias do Pantanal. E as cheias estão medindo a nossa paciência.'] }),
    gente(g, '8', 'b1-homem-ilha', 'npc-homem-3', 'Seu Gravatá', { dir: 's', fala: ['Tá vendo aquela ilhota na lagoa? Meu chapéu voou para lá faz um ano.', 'Quem tiver canoa pode ficar com o que achar. Só não fique com o chapéu, que era do meu pai.'] }),
    gente(g, '9', 'b1-pescador', 'cl-pescador', 'Pescador Mandi', { dir: 's', fala: ['Na lagoa só dá Piabinha de Vara Velha. Peixe grande mesmo mora no Pantanal.', 'Rema para o leste e você chega no Pantanal Alagado. Lá a Vara Boa pega Dourado-Rei, e a Mestra… a Mestra pega até história de pescador.'] }),
  ],
  itens: [
    item(g, 'k', 'pedra-solar'),
    item(g, 'z', 'folha-ancestral'),
    item(g, 'j', 'cuia-rede', 2),
    { x: 18, y: 19, item: 'biscoito-de-polvilho', oculto: true, flag: 'item:B1:18,19' },
    { x: 1, y: 1, item: 'garrafada', flag: 'item:B1:1,1' },
    { x: 41, y: 12, item: 'pequi', qtd: 2, oculto: true, flag: 'item:B1:41,12' },
    { x: 3, y: 26, item: 'elixir-andiroba', oculto: true, flag: 'item:B1:3,26' },
  ],
};
export default zona;
