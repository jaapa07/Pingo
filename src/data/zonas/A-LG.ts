import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, placa } from './_a1-grade';

/**
 * A-LG · Platô da Liga — fim do mapa A. De baixo para cima: a subida, o Portão das Oito Insígnias, o terreiro (Posto,
 * Venda e seis Desafiantes que treinam ali: níveis 40–42, a ponte entre o 8º ginásio e os Mestres), a sala de espera e as cinco salas em fila: Mestra Maré, Ferreiro Brasa-Viva, Pajé Neblina, Domadora Pampa e
 * o Campeão Cacique Aracê. Lá no alto, o Hall da Fama.
 * Regras (eventos em src/data/eventos/liga.ts): quem cruza a porta da sala de espera não volta (`liga-em-curso` fecha a
 * porta atrás); cada porta seguinte só abre com a vitória anterior (`liga-1`…`liga-4`); não há cura lá dentro, só itens;
 * a derrota devolve ao terreiro e zera a sequência. Depois de `liga-vencida` a porta fica fechada (revanche pelo Rádio Cipó).
 */
export const LIGA_ENTRADA: [number, number] = [15, 55];
const g = grade('A-LG', [
  '##############################',
  '########..............########',
  '########.E....H.....E.########',
  '########..............########',
  '########..............########',
  '###############Q##############',
  '#######................#######',
  '#######.E............E.#######',
  '#######........5.......#######',
  '#######.......,,.......#######',
  '#######.E.....::.....E.#######',
  '#######........:.......#######',
  '#######........:.......#######',
  '###############O##############',
  '#######................#######',
  '#######..ffff..4.ffff..#######',
  '#######................#######',
  '#######.f......:.....f.#######',
  '#######.f......:.....f.#######',
  '#######..ffff..:.ffff..#######',
  '#######........:.......#######',
  '###############N##############',
  '#######................#######',
  '#######.U......3.....U.#######',
  '#######......,...,.....#######',
  '#######...U....:...U...#######',
  '#######........:.......#######',
  '#######.U......:.....U.#######',
  '#######........:.......#######',
  '###############L##############',
  '#######................#######',
  '#######..F.....2....F..#######',
  '#######................#######',
  '#######....##..:.##....#######',
  '#######........:.......#######',
  '#######..F.....:....F..#######',
  '#######........:.......#######',
  '###############K##############',
  '#######................#######',
  '#######.~~~....1...~~~.#######',
  '#######.~~~~.......~~~~#######',
  '#######..~~....:....~~.#######',
  '#######........:.......#######',
  '#######.~~.....:....~~.#######',
  '#######........:.......#######',
  '###############J##############',
  '##########..........##########',
  '##########.B..A...B.##########',
  '##########.....:....##########',
  '##########.....:....##########',
  '##########.....:....##########',
  '###############G##############',
  '#..............:.............#',
  '#.,............:..........,..#',
  '#..............:.............#',
  '#..............:.............#',
  '#..P...........:.....V.......#',
  '#......i...a...:........j....#',
  '#..::::::::::::::::::::......#',
  '#..............:...6.........#',
  '#.....7........:.............#',
  '#..............:..........,..#',
  '###############S##############',
  '#######........:.......#######',
  '#######.T......:..q..T.#######',
  '#######........:.......#######',
  '#######..,.....:.......#######',
  '#######.T......:.....T.#######',
  '#######........:.......#######',
  '###############X##############',
], {
  X: ':', S: ':', Q: ':', G: ':', J: ':', K: ':', L: ':', N: ':', O: ':', H: '.', E: '.', U: '.', F: '.', B: '.', A: '.', P: '.', V: '.',
  i: '.', j: '.', a: '.', q: '.', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.',
});
const placas = [
  placa(g, 'q', 'PLATÔ DA LIGA DOS GUARDIÕES\nQuatro Mestres e um Campeão. Oito insígnias para entrar; coragem para ficar.'),
  placa(g, 'i', 'POSTO GUARDIÃO DO PLATÔ\nCure-se AQUI. Lá dentro, só o que couber na mochila.'),
  placa(g, 'j', 'VENDA DO PLATÔ\nPreço de altitude. Reclamações: desça a serra.'),
  placa(g, 'a', 'REGRAS DA LIGA\n1. Entrou, não volta.  2. Cinco lutas seguidas.  3. Cura só por itens.\n4. Perdeu, recomeça do primeiro Mestre.  5. É proibido chorar no tapete.'),
];
const porta = (m: string, requer: string, fala: string) => { const [x, y] = g.p(m); return { x, y, requer, fala }; };
const [sx, sy] = g.p('S');
const zona: ZonaDef = {
  id: 'A-LG', nome: 'Platô da Liga', mapa: 'A', tipo: 'cidade', tileset: 'planalto', musica: 'pico', arena: 'planalto', passo: 8,
  pouso: [5, 57],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'P', 'posto'), obj(g, 'V', 'venda'),
    ...g.todos('E').map(([x, y]) => ({ o: 'estatua', x, y, texto: ['Estátua de um Campeão antigo. A placa diz só: "Chegou aqui. Você também pode."'] })),
    obj(g, 'H', 'totem', { texto: ['O Marco do Hall da Fama. Os nomes dos Campeões da Costa do Sol estão entalhados de cima a baixo.'] }),
    ...g.todos('U').map(([x, y]) => ({ o: 'totem', x, y })),
    ...g.todos('F').map(([x, y]) => ({ o: 'fogueira', x, y })),
    ...g.todos('B').map(([x, y]) => ({ o: 'banco', x, y })),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'X', 'A10', 21, 1, 's'),
    entrada(g, 'P', 'posto', 'A-LG-posto', 6, 8),
    entrada(g, 'V', 'venda', 'A-LG-venda', 5, 7),
  ],
  portoes: [
    { x: sx, y: sy, requer: 'insignias:8', sprite: 'npc-homem-4', fala: 'Alto! Sou o Guardião da Entrada. Daqui para cima é o Platô da Liga.\fMostre o estojo… Faltam insígnias aí. São OITO, criatura: uma de cada ginásio da Costa do Sol. Volte quando o estojo estiver cheio.' },
    porta('G', '!flag:liga-em-curso', 'A porta da sala de espera trancou atrás de você. Na Liga só se anda para a frente.'),
    porta('K', 'flag:liga-1', 'A porta só abre para quem vencer a Mestra Maré.'),
    porta('L', 'flag:liga-2', 'A porta só abre para quem vencer o Ferreiro Brasa-Viva.'),
    porta('N', 'flag:liga-3', 'A porta só abre para quem vencer o Pajé Neblina.'),
    porta('Q', 'flag:liga-campeao', 'A porta do Hall da Fama só se abre pelas mãos do Campeão.'),
    porta('O', 'flag:liga-4', 'A porta só abre para quem vencer a Domadora Pampa. Do outro lado espera o Campeão.'),
  ],
  npcs: [
    // Torre de Desafios (spec 10A item 35): 1 batalha por dia no nível 50, depois da Liga (src/data/eventos/regras.ts, src/data/torre.ts)
    { id: 'a-lg-torre', sprite: 'npc-homem-4', x: 4, y: 53, dir: 's', se: 'flag:liga-vencida', script: 'torre-desafios' },
    // Gincana e Safári (spec 10A itens 32 e 33): o carreiro leva ao Vale do Buriti-Alto (A-GN) depois da Liga (src/data/eventos/posliga.ts)
    { id: 'carreiro-gincana', sprite: 'npc-idoso', x: 28, y: 55, dir: 'o', se: 'flag:liga-vencida', script: 'carreiro-ida' },
    gente(g, 'A', 'liga-recepcao', 'npc-atendente-posto', 'Guardiã da Sala de Espera', { script: 'liga-recepcao' }),
    gente(g, '1', 'liga-mare', 'liga-mare', 'Mestra Maré', { script: 'liga-1' }),
    gente(g, '2', 'liga-brasa-viva', 'liga-brasa-viva', 'Ferreiro Brasa-Viva', { script: 'liga-2' }),
    gente(g, '3', 'liga-neblina', 'liga-neblina', 'Pajé Neblina', { script: 'liga-3' }),
    gente(g, '4', 'liga-pampa', 'liga-pampa', 'Domadora Pampa', { script: 'liga-4' }),
    gente(g, '5', 'liga-arace', 'liga-arace', 'Cacique Aracê', { script: 'liga-5' }),
    gente(g, '6', 'liga-veterana', 'cl-montanhista', 'Veterana Cumeeira', { mov: 'olhar', fala: ['Maré mistura Rio com Veneno; Brasa-Viva, Brasa com Ferro; Neblina, Mente com Assombro; Pampa, Comum com Ginga.', 'O Cacique Aracê usa de tudo um pouco, e guarda para o fim uma criatura do tipo Lenda. Encanto e Geada assustam Lenda.'] }),
    gente(g, '7', 'liga-menino', 'cl-crianca-m', 'Torcedor Pequi', { mov: 'vagar', fala: ['Eu venho todo dia ver quem entra. Sair pela porta da frente, vi poucos.', 'Você tem cara de quem sai. Ou de quem volta rápido. Uma das duas.'] }),
    // Desafiantes do terreiro (src/data/treinadores/liga.ts): fora do caminho e das portas; só desafiam quem fala com eles ou passa a dois passos da frente deles (o verificador exige 2 tiles de visão)
    { id: 'A-LG-1', sprite: 'cl-pescador', x: 9, y: 54, dir: 's', treinador: 'A-LG-1', visao: 2 },
    { id: 'A-LG-2', sprite: 'cl-ferreiro', x: 18, y: 54, dir: 's', treinador: 'A-LG-2', visao: 2 },
    { id: 'A-LG-3', sprite: 'cl-repentista', x: 27, y: 57, dir: 'o', treinador: 'A-LG-3', visao: 2 },
    { id: 'A-LG-4', sprite: 'cl-vaqueiro', x: 11, y: 60, dir: 'o', treinador: 'A-LG-4', visao: 2 },
    { id: 'A-LG-5', sprite: 'cl-mateira', x: 23, y: 60, dir: 'n', treinador: 'A-LG-5', visao: 2 },
    { id: 'A-LG-6', sprite: 'cl-capoeirista', x: 26, y: 59, dir: 'o', treinador: 'A-LG-6', visao: 2 },
    { id: 'taina', sprite: 'taina', x: 15, y: 58, dir: 'n', se: 'flag:liga-vencida&!flag:rival-5', script: 'rival-5' },
  ],
  // oferenda dos Guardiões a quem chega: sem ela a mochila honesta não fecha as cinco lutas (docs/QA-TRECHO-2.md)
  itens: [
    { x: 1, y: 61, item: 'elixir-andiroba', qtd: 3, flag: 'item:A-LG:terreiro-oeste' },
    { x: 28, y: 61, item: 'cha-guarana', flag: 'item:A-LG:terreiro-leste' },
  ],
  gatilhos: [{ x: 15, y: 52, script: 'liga-entrada', se: '!flag:liga-em-curso' }],
};
export default zona;
