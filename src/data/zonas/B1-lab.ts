import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, gente } from './_b1-lib';

/** Estação de Pesquisa do Sertão (porta em (35, 15) na cidade): a equipe da Drª Buriti mede as cheias e cuida da pesquisa de campo. */
const g = grade('B1-lab', [
  '##############',
  '####K####W####',
  '#GG.EE..GG..V#',
  '#............#',
  '#....,,,,....#',
  '#.1..,,,,..2.#',
  '#EE.......Q..#',
  '#..........3R#',
  '#............#',
  '######DD######',
], { K: '#', W: '#', G: '.', E: '.', V: '.', Q: '.', R: '.', D: '+', '1': '.', '2': '.', '3': '.' });
const zona: ZonaDef = {
  id: 'B1-lab', nome: 'Estação de Pesquisa do Sertão', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'cerrado', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'laboratorio' },
    obj(g, 'K', 'poster-c', { texto: ['Mapa do Sertão das Névoas com alfinetes: vermelhos no Pantanal Alagado, pretos na Chapada Rubra, e um amarelo escrito "BOITATÁ?" na Caverna Vulcânica.'] }),
    obj(g, 'W', 'janela'),
    { o: 'mesa-lab', x: g.todos('G')[0]?.[0] ?? 1, y: 2, texto: ['Réguas de cheia, cadernos encharcados e um pato de borracha com a etiqueta "boia oficial".'] },
    { o: 'estante-lab', x: g.todos('E')[0]?.[0] ?? 4, y: 2 },
    { o: 'mesa-lab', x: g.todos('G')[2]?.[0] ?? 8, y: 2, texto: ['Um microscópio aponta para uma asa de Lavadeira-Dragão. Parece vitral de igreja.'] },
    obj(g, 'V', 'viveiro', { script: 'viveiro' }),
    { o: 'estante-lab', x: g.todos('E')[2]?.[0] ?? 1, y: 6, texto: ['Pastas: "Ninhal do Pantanal — contagem de ovos", "Cartel Ferrugem — denúncias", "Receitas de pequi (não científicas)".'] },
    obj(g, 'Q', 'tanque', { texto: ['Um tanque de observação com um Aruazão dormindo. Ou meditando. Com caramujo não dá para saber.'] }),
    obj(g, 'R', 'planta-b'),
  ],
  warps: saidas(g, 'D', 'B1', 35, 16, 's', 'porta'),
  npcs: [
    gente(g, '1', 'b1-pesquisador', 'npc-homem-1', 'Pesquisador Baru', { dir: 's', fala: ['A Drª Buriti montou esta estação antes de ir para Vila Buriti, na Costa do Sol. Ela liga todo domingo pelo Rádio Cipó.', 'No Sertão, as criaturas já nascem para o nível de Campeão. Quem chega da Liga com equipe de 45 sente o tranco nos primeiros dias, mas a Vereda e o Cerrado treinam ligeiro: no Pantanal você já está no passo.'] }),
    gente(g, '2', 'b1-pesquisadora', 'cl-biologa', 'Bióloga Ingá', { dir: 's', fala: ['As cheias do Pantanal deixam os ninhos do ninhal expostos. E o Cartel Ferrugem sabe disso.', 'A Boiadeira Zefa interditou o ninhal. Ela só deixa passar quem provar que sabe lidar com bicho grande: quem tiver a Insígnia do Barro.'] }),
    gente(g, '3', 'b1-estagiario', 'cl-crianca-m', 'Estagiário Tico', { mov: 'olhar', fala: ['Descobri que o Sapo-Cururuí canta em dó maior.', 'Descobri também que ele canta às três da manhã. Do lado da minha rede.'] }),
  ],
};
export default zona;
