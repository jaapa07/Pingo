import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Casa da Vó Zica: máquina de costura, cocadas esfriando e o neto que não larga o rádio. */
const g = grade('A1-casa-2', [
  '############',
  '##W##K###W##',
  '#FF.G..Q.SR#',
  '#..........#',
  '#..hmmh....#',
  '#........1.#',
  '#C...aa....#',
  '#....aa....#',
  '#####DD#####',
], { W: '#', K: '#', F: '.', G: '.', Q: '.', S: '.', R: '.', h: '.', m: '.', C: '.', a: ',', D: '+', '1': '.' });
const h = g.todos('h');
const zona: ZonaDef = {
  id: 'A1-casa-2', nome: 'Casa da Vó Zica', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'sertaneja' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'K', 'quadro-ex-voto'),
    { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1], texto: ['Um tacho de cocada borbulha devagar. Melhor não meter o dedo.'] },
    obj(g, 'G', 'filtro-barro', { texto: ['Água de filtro de barro: a mais gelada de Pindorama, garante a Vó Zica.'] }),
    obj(g, 'Q', 'maquina-costura', { texto: ['Na máquina de costura, uma colcha de retalhos pela metade. Tem um retalho com estampa de Tamanduí.'] }),
    obj(g, 'S', 'radio', { script: 'radio' }), obj(g, 'R', 'planta-b'),
    { o: 'cadeira', x: h[0][0], y: h[0][1] }, { o: 'mesa', x: h[0][0] + 1, y: h[0][1] }, { o: 'cadeira', x: h[1][0], y: h[1][1] },
    obj(g, 'C', 'cesto', { texto: ['Um cesto de novelos. Um deles se mexe… ah, não, é só o gato dormindo.'] }),
    { o: 'tapete-c', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A1', 9, 21, 's', 'porta'),
  npcs: [
    gente(g, '1', 'a1-neto', 'npc-homem-3', 'Neto Dudu', { mov: 'olhar', script: 'm-carta' }),
  ],
};
export default zona;
