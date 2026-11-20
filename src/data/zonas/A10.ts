import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, item, placa } from './_a1-grade';

/**
 * A10 · Vila Buriti — a última vila da Costa do Sol, numa vereda de buritis ao pé do Platô da Liga.
 * Ginásio da Mata (8ª insígnia), o laboratório de campo da Drª Buriti (que entrega um dos iniciais não escolhidos
 * a quem tiver a Insígnia da Folha) e a saída norte para o Platô. A ilhota do Olho-d'Água pede o Remo.
 */
const g = grade('A10', [
  'TTTTTTTTTT|TTTTTTTTTT|TNNTTTTTTT|TTTTTTTTTT|TTTT',
  'TTTTTTTTTT|TTTTTTTTTT|T::TTTTTTT|TTTTTTTTTT|TTTT',
  'TT........|....I.....|.::.......|...I......|..TT',
  'TT..,.....|..........|.::..q....|......~~~~|..TT',
  'TT........|..........|.::.......|.....~~~~~|~.TT',
  'TT........|..........|.::.......|....~~~k~~|~.TT',
  'TT........|....t.....|.::.......|.....~~~~~|..TT',
  'TT........|..........|.::.......|..I...~~~.|..TT',
  'TT........|..........|.::.......|..........|..TT',
  'TT....Y...|..e.......|.::.......|..........|..TT',
  'TT.......:|..........|.::.......|..........|..TT',
  'TT.......:|..........|.::.......|..........|..TT',
  'TT.......:|..........|.::.......|..........|..TT',
  'TT.......:|.....y....|.::.....P.|......V...|..TT',
  'TT.......:|..........|.::.......|:.i....:.j|..TT',
  'W:::::::::|::::::::::|::::::::::|::::::::::|..TT',
  'W:::::::::|..........|.::.......|..........|..TT',
  'TT........|..........|.::...F...|..........|..TT',
  'TT...I....|...1......|.::.......|....2.....|..TT',
  'TT........|..........|.::.......|..........|..TT',
  'TT........|..........|.::.......|..........|..TT',
  'TT........|.....C.C..|.::.......|..........|..TT',
  'TT...A....|..........|.::.......|..........|I.TT',
  'TT....:.a.|..........|.::.......|L.....u...|..TT',
  'TT....::::|::::::::::|:::.......|..:.......|..TT',
  'TT........|..........|.::.......|..:.......|..TT',
  'TT........|..........|.:::::::::|:::.......|..TT',
  'TT...3....|..........|.::.......|......4...|..TT',
  'TT........|..........|.::...I...|..........|..TT',
  'TT........|..B...z...|.::.......|..........|..TT',
  'TT........|...:::::::|:::.......|..........|..TT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
], {
  N: ':', W: ':', Y: '.', P: '.', V: '.', L: '.', A: '.', B: '.', F: '.', I: '.', y: '.', k: ';',
  q: '.', e: '.', i: '.', j: '.', a: '.', u: '.', z: '.', '1': '.', '2': '.', '3': '.', '4': '.',
});
const placas = [
  placa(g, 'q', 'Norte: PLATÔ DA LIGA\nSó sobe quem carrega as oito insígnias da Costa do Sol.'),
  placa(g, 'e', 'GINÁSIO DE VILA BURITI\nOitava insígnia da Costa do Sol: a Insígnia da Folha. "Quem planta paciência colhe vitória."'),
  placa(g, 'i', 'POSTO GUARDIÃO\nÚltima cura grátis antes do Platô. Aproveite.'),
  placa(g, 'j', 'VENDA DA VEREDA\nEstoque de véspera de Liga: elixir, garrafada e coragem a granel (a coragem está em falta).'),
  placa(g, 'a', 'Casa da Dona Carandá, doceira.\nDoce de buriti: um por pessoa, dois por Campeão.'),
  placa(g, 'u', 'LABORATÓRIO DE CAMPO DA DRª BURITI\nPesquisa de veredas, brejos e criaturas que não gostam de ser pesquisadas.'),
  placa(g, 'z', 'Casa do Seu Tucum, ex-desafiante da Liga.\n"Cheguei no Campeão em 1968. Ele também."'),
];
const zona: ZonaDef = {
  id: 'A10', nome: 'Vila Buriti', mapa: 'A', tipo: 'cidade', tileset: 'mata', musica: 'cidade-baiao', arena: 'mata', passo: 8,
  pouso: [30, 14],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Y', 'ginasio', { cor: '#2f6b2a,#58a83c,#cfe8a0' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'L', 'laboratorio'),
    obj(g, 'A', 'casa-palafita'), obj(g, 'B', 'casa-palafita'), obj(g, 'F', 'fonte'), obj(g, 'y', 'poste'),
    ...g.todos('I').map(([x, y]) => ({ o: 'buriti', x, y })),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'W', 'A-R7', 78, 15, 'o'),
    ...saidas(g, 'N', 'A-LG', 15, 68, 'n'),
    entrada(g, 'Y', 'ginasio', 'A10-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'A10-posto', 6, 8),
    entrada(g, 'V', 'venda', 'A10-venda', 5, 7),
    entrada(g, 'L', 'laboratorio', 'A10-lab', 7, 8),
    entrada(g, 'A', 'casa-palafita', 'A10-casa-1', 5, 7),
    entrada(g, 'B', 'casa-palafita', 'A10-casa-2', 5, 7),
  ],
  npcs: [
    // Parque Safári (spec 10A item 33): a viveirista dá a Muda de Buriti depois da Liga (src/data/eventos/posliga.ts)
    { id: 'safari-viveirista', sprite: 'npc-mulher-2', x: 19, y: 21, dir: 'o', se: 'flag:liga-vencida', script: 'safari-da-muda' },
    gente(g, '1', 'a10-menina', 'cl-crianca-f', 'Juçara', { mov: 'vagar', fala: ['Quando eu crescer vou subir o Platô e ganhar do Cacique Aracê!', 'Minha mãe disse que primeiro eu tenho de ganhar da tabuada.'] }),
    gente(g, '2', 'a10-vaqueiro', 'cl-vaqueiro', 'Vaqueiro Aboio', { mov: 'olhar', fala: ['Na Liga são cinco lutas de enfiada: quatro Mestres e o Campeão. Entrou, não tem porteira de volta.', 'Lá dentro ninguém cura criatura de graça. Encha a mochila de Garrafada e Elixir aqui na Venda.'] }),
    gente(g, '3', 'a10-velha', 'npc-idosa', 'Dona Carandá', { fala: ['A líder do ginásio só luta com criatura do tipo Mata. Fogo, geada, bicada e veneno incomodam as plantas dela.', 'Mas ela deixa o chão crescer no meio da luta. Não se demore, que o cipó sobe.'] }),
    gente(g, '4', 'a10-assistente', 'npc-homem-1', 'Assistente Babaçu', { mov: 'vagar', fala: ['A Drª Buriti cuida de uma criatura que veio do laboratório da Profª Ipê, lá de Vila Jacarandá.', 'Ela só entrega para quem provar que sabe cuidar: quer ver a Insígnia da Folha no estojo.'] }),
  ],
  itens: [
    item(g, 'k', 'A10', 'pedra-lunar'),
    { x: 3, y: 29, item: 'buriti', qtd: 2, oculto: true, flag: 'item:A10:3,29' },
    { x: 40, y: 20, item: 'garrafada', oculto: true, flag: 'item:A10:40,20' },
  ],
};
export default zona;
