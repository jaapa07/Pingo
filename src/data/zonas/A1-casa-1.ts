import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Casa da família da rival Tainá: o avô jangadeiro e a estante de troféus (quase todos de segundo lugar). */
const g = grade('A1-casa-1', [
  '############',
  '##W###K##N##',
  '#EE..T..FF.#',
  '#..........#',
  '#.1...hmmh.#',
  '#..........#',
  '#B...aa..2.#',
  '#....aa....#',
  '#####DD#####',
], { W: '#', K: '#', N: '#', E: '.', T: '.', F: '.', h: '.', m: '.', B: '.', a: ',', D: '+', '1': '.', '2': '.' });
const h = g.todos('h');
const zona: ZonaDef = {
  id: 'A1-casa-1', nome: 'Casa da família da rival', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'caicara' },
    obj(g, 'W', 'janela'), obj(g, 'K', 'rede-pesca'), obj(g, 'N', 'quadro'),
    { o: 'estante', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: ['Troféus da {RIVAL}: "2º lugar — Corrida de Saco", "2º lugar — Concurso de Pipa", "1º lugar — Teimosia" (esse foi o avô que fez).'] },
    obj(g, 'T', 'tv', { texto: ['Um programa de culinária: moqueca em 12 passos. O passo 1 é "tenha um peixe".'] }),
    { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1] },
    { o: 'cadeira', x: h[0][0], y: h[0][1] }, { o: 'mesa', x: h[0][0] + 1, y: h[0][1] }, { o: 'cadeira', x: h[1][0], y: h[1][1] },
    obj(g, 'B', 'bau', { texto: ['Um baú com cheiro de maresia. Dentro, velas remendadas e um remo partido.'] }),
    { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A1', 29, 22, 's', 'porta'),
  npcs: [
    gente(g, '1', 'a1-avo', 'npc-idoso', 'Vô Jangadeiro', { fala: ['A {RIVAL} acordou antes do galo e saiu dizendo que ia "ser lenda".', 'Puxou a mim. Eu também ia ser lenda, mas dava muito trabalho.'] }),
    gente(g, '2', 'a1-mae-rival', 'npc-mulher-3', 'Dona Jandira', { mov: 'olhar', fala: ['Se cruzar com a minha filha na estrada, lembra ela de comer.', 'E você também, {JOGADOR}: batalha de barriga vazia não presta.'] }),
  ],
};
export default zona;
