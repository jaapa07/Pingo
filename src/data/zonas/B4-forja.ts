import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, gente } from './_b1-lib';

/** Forja Grande de Arraial Brasa (porta em (9, 24) na cidade): o ferreiro Malho e os sinos da festa (`b1-forja`). */
const g = grade('B4-forja', [
  '############',
  '###K####W###',
  '#FF..1...QQ#',
  '#..........#',
  '#.GG...JJ..#',
  '#.....2....#',
  '#.J..aa....#',
  '#....aa..R.#',
  '#####DD#####',
], { K: '#', W: '#', F: '.', Q: '.', G: '.', J: '.', R: '.', a: ',', D: '+', '1': '.', '2': '.' });
const zona: ZonaDef = {
  id: 'B4-forja', nome: 'Forja Grande', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-catira', arena: 'vulcao', passo: 11,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'sertaneja' },
    obj(g, 'K', 'quadro', { texto: ['Um sino de bronze desenhado a carvão na parede, com as medidas anotadas: "para a capela de Vila Cascavel".'] }),
    obj(g, 'W', 'janela'),
    { o: 'lareira', x: g.todos('F')[0]?.[0] ?? 1, y: 2, texto: ['A fornalha da forja, com brasa viva. O calor encosta no rosto feito abraço de tia.'] },
    { o: 'estante', x: g.todos('Q')[0]?.[0] ?? 9, y: 2, texto: ['Ferraduras, facões, sinos pequenos e uma bigorna de brinquedo que o ferreiro fez para o neto.'] },
    { o: 'mesa', x: g.todos('G')[0]?.[0] ?? 2, y: 4, texto: ['Tenazes, martelos e uma lima. Tudo com o cabo gasto no formato da mão do Malho.'] },
    ...objs(g, 'J', 'barril'), obj(g, 'R', 'cesto'),
    { o: 'tapete-a', x: g.todos('a')[2]?.[0] ?? 5, y: g.todos('a')[2]?.[1] ?? 7 },
  ],
  warps: saidas(g, 'D', 'B4', 9, 25, 's', 'porta'),
  npcs: [
    gente(g, '1', 'b4-malho', 'cl-ferreiro', 'Ferreiro Malho', { dir: 's', script: 'b1-forja' }),
    gente(g, '2', 'b4-neto-malho', 'cl-crianca-m', 'Malhinho', { mov: 'vagar', fala: ['O vô diz que o Boitatá da caverna é parente do fogo da forja.', 'Eu acho que é parente do vô: os dois soltam fumaça quando ficam bravos.'] }),
  ],
};
export default zona;
