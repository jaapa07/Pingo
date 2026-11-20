import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/**
 * Casa do Seu Jatobá, dono do Parque Safári (spec 10A item 33). Na mesa, a maquete do parque com os quatro
 * setores; é aqui que se entregam os objetos de ambiente (evento `safari-dono`, src/data/eventos/posliga.ts).
 * Entrada em (5, 7); a porta devolve para A-SF em frente à casa.
 */
const g = grade('A-SF-casa', [
  '############',
  '##W###K##N##',
  '#EE..T..FF.#',
  '#..........#',
  '#.1...hmmh.#',
  '#..........#',
  '#B.....2...#',
  '#....aa....#',
  '#####DD#####',
], { W: '#', K: '#', N: '#', E: '.', T: '.', F: '.', h: '.', m: '.', B: '.', a: ',', D: '+', '1': '.', '2': '.' });
const h = g.todos('h');
const zona: ZonaDef = {
  id: 'A-SF-casa', nome: 'Casa do Seu Jatobá', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'casa', arena: 'cerrado', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'sertaneja' },
    obj(g, 'W', 'janela'), obj(g, 'K', 'mapa-linhas', { texto: ['Um mapa antigo do Buriti-Alto, riscado a lápis: "lagoa aqui", "mata ali", "toca dos ocos lá no alto".'] }), obj(g, 'N', 'relogio'),
    { o: 'estante', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: ['Cadernos de campo do Seu Jatobá: "Dia 1: comprei um pasto. Dia 40: o pasto virou vereda. Dia 300: a vereda virou parque."'] },
    obj(g, 'T', 'filtro-barro', { texto: ['Água de buriti, fresquinha. Seu Jatobá jura que é o segredo das capivaras calmas.'] }),
    { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1] },
    { o: 'cadeira', x: h[0][0], y: h[0][1] },
    { o: 'mesa', x: h[0][0] + 1, y: h[0][1], script: 'safari-maquete' },
    { o: 'cadeira', x: h[1][0], y: h[1][1] },
    obj(g, 'B', 'bau', { texto: ['Sacos de semente, uma enxada sem cabo e um apito de chamar seriema.'] }),
    { o: 'tapete-a', x: g.todos('a')[0][0], y: g.todos('a')[0][1] },
  ],
  warps: saidas(g, 'D', 'A-SF', 19, 9, 's', 'porta'),
  npcs: [
    gente(g, '1', 'safari-dono', 'npc-idoso', 'Seu Jatobá', { dir: 's', script: 'safari-dono' }),
    gente(g, '2', 'safari-neta', 'cl-crianca-f', 'Juçara', { mov: 'vagar', fala: ['O vô diz que o parque é um quebra-cabeça: cada peça que alguém traz vira um pedaço de mundo.', 'Eu trouxe uma pedra de rio uma vez. Era uma batata. Ele plantou mesmo assim.'] }),
  ],
};
export default zona;
