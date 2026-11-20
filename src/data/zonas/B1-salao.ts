import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, gente } from './_b1-lib';

/**
 * Salão da Raizeira (o antigo ginásio de pedra de Vila Cascavel, porta em (27, 7) na cidade). Sem insígnia.
 * A raizeira Dona Sucupira cura a equipe de graça (`b1-raizeira`), ensina o nome das ervas e conduz a missão das três raízes.
 */
const g = grade('B1-salao', [
  '################',
  '##K##W####W##N##',
  '#FF..O..1..EE.R#',
  '#......B.......#',
  '#..............#',
  '#.JJ.......hh..#',
  '#.2.....aa....3#',
  '#.......aa.....#',
  '#..............#',
  '#..............#',
  '#######DD#######',
], { K: '#', W: '#', N: '#', F: '.', O: '.', E: '.', R: '.', B: '.', J: '.', h: '.', a: ',', D: '+', '1': '.', '2': '.', '3': '.' });
const zona: ZonaDef = {
  id: 'B1-salao', nome: 'Salão da Raizeira', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-catira', arena: 'cerrado', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'sertaneja' },
    obj(g, 'K', 'quadro-ex-voto', { texto: ['Ex-votos de madeira: uma pata de Tatuzim, uma asa de Ararinha, um casco de Jabutim. Todos curados aqui.'] }),
    ...objs(g, 'W', 'janela'), obj(g, 'N', 'relogio'),
    { o: 'fogao-lenha', x: g.todos('F')[0]?.[0] ?? 1, y: 2, texto: ['Uma chaleira de barro ferve chá de jurubeba. Amargo que só, cura que só.'] },
    obj(g, 'O', 'oratorio', { texto: ['O oratório da raizeira: uma vela, um galho de arruda e um retrato antigo do ginásio, com a placa "Insígnia da Folha".'] }),
    { o: 'estante-lab', x: g.todos('E')[0]?.[0] ?? 11, y: 2, texto: ['Vidros de raízes secas com rótulos: "Sucupira — dor de junta", "Barbatimão — corte feio", "Ipê-roxo — tristeza de criatura".'] },
    obj(g, 'R', 'pote-barro'),
    obj(g, 'B', 'balcao', { texto: ['A bancada de ervas. Tem pilão, peneira e um caderno aberto na página "o que NÃO dar para Calangão".'] }),
    ...objs(g, 'J', 'cesto'),
    { o: 'rede', x: g.todos('h')[0]?.[0] ?? 11, y: 5 },
    { o: 'tapete-c', x: g.todos('a')[2]?.[0] ?? 8, y: g.todos('a')[2]?.[1] ?? 7 },
  ],
  warps: saidas(g, 'D', 'B1', 27, 8, 's', 'porta'),
  npcs: [
    gente(g, '1', 'b1-sucupira', 'npc-idosa', 'Dona Sucupira', { dir: 's', script: 'b1-raizeira' }),
    gente(g, '2', 'b1-aprendiz', 'cl-mateira', 'Aprendiz Jurema-Preta', { dir: 'l', mov: 'olhar', fala: ['Isto aqui já foi ginásio. A líder, a Dona Buriti, aprendeu as ervas com a Dona Sucupira e foi abrir ginásio na Costa do Sol.', 'Quando ela saiu, deixou o salão para a mestra. Agora o único combate aqui dentro é contra a dor de barriga.'] }),
    gente(g, '3', 'b1-peao-salao', 'cl-vaqueiro', 'Peão Brás', { dir: 'o', fala: ['Trouxe meu Antão para tomar chá de casca. Ele pisou num cupinzeiro e o cupinzeiro pisou de volta.', 'A Dona Sucupira não cobra nada. Diz que planta que cura não tem dono.'] }),
  ],
};
export default zona;
