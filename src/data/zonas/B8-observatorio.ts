import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente, item } from './_b2n-lib';

/**
 * Observatório do Lume (porta em (39, 9) na cidade). A luneta grande, a mesa dos mapas do céu e a assistente da Jaci,
 * que propõe a missão das constelações vivas (`b2n-constelacoes`): registrar no Diário três criaturas da noite.
 */
const g = grade('B8-observatorio', [
  '##############',
  '###K####W##N##',
  '#EE...LL...EE#',
  '#............#',
  '#.1..,,,,..2.#',
  '#....,,,,....#',
  '#GG......Q...#',
  '#........3..R#',
  '#.k..........#',
  '#............#',
  '#............#',
  '######DD######',
], { K: '#', W: '#', N: '#', E: '.', L: '.', G: '.', Q: '.', R: '.', D: '+', k: '.', '1': '.', '2': '.', '3': '.' });
const zona: ZonaDef = {
  id: 'B8-observatorio', nome: 'Observatório do Lume', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'planalto', passo: 15,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'laboratorio' },
    obj(g, 'K', 'mapa-linhas', { texto: ['Um mapa do céu do Sertão, com as constelações dos antigos: a Ema, o Homem Velho, a Anta do Norte. Ao lado, alfinetes marcam onde cada uma nasce no horizonte.'] }),
    obj(g, 'W', 'janela'), obj(g, 'N', 'relogio'),
    { o: 'estante-lab', x: g.todos('E')[0]?.[0] ?? 1, y: 2, texto: ['Cadernos de observação desde o tempo do avô da Jaci. O primeiro registro: "Hoje vi uma estrela cair no Pico. Ninguém acredita."'] },
    { o: 'mesa-lab', x: g.todos('L')[0]?.[0] ?? 6, y: 2, texto: ['A luneta grande aponta para fora pela fenda da cúpula. De dia, ela mostra só nuvem. De noite, mostra o mundo.'] },
    { o: 'estante-lab', x: g.todos('E')[2]?.[0] ?? 11, y: 2 },
    { o: 'mesa-lab', x: g.todos('G')[0]?.[0] ?? 1, y: 6, texto: ['Lentes polidas, um astrolábio de latão e um prato de pão de queijo pela metade.'] },
    obj(g, 'Q', 'radio', { script: 'radio' }),
    obj(g, 'R', 'planta-c'),
  ],
  warps: saidas(g, 'D', 'B8', 39, 10, 's', 'porta'),
  npcs: [
    gente(g, '1', 'b8-assistente', 'cl-biologa', 'Astrônoma-assistente Vega', { dir: 's', script: 'b2n-constelacoes' }),
    gente(g, '2', 'b8-estudante', 'cl-escoteira', 'Estudante Antares', { dir: 's', fala: ['A Astrônoma Jaci diz que cada criatura de Mente é uma estrela que desceu para ver a gente de perto.', 'Eu acho que é só um jeito bonito de dizer que elas são difíceis de acertar.'] }),
    gente(g, '3', 'b8-zelador', 'npc-homem-3', 'Zelador Eclipse', { dir: 'n', mov: 'olhar', fala: ['Eu cuido da cúpula. Abro de noite, fecho de dia e limpo coco de Urubu-Rei o tempo todo.', 'Ontem um Papagálio entrou e imitou a voz da Jaci: "Pode ir embora mais cedo". Quase fui.'] }),
  ],
  itens: [item(g, 'k', 'pt-35')],
};
export default zona;
