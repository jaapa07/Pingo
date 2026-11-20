import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, gente } from './_b1-lib';

/**
 * Centro de Reabilitação de Fauna de Pantanal Grande (porta em (35, 20) na cidade). Depois do ninhal salvo
 * (`pantanal-ok`), a veterinária entrega um filhote resgatado por dia a quem quiser adotar (`b1-orfaos`): são as linhas
 * do Sertão que, soltas no mato, já aparecem crescidas (nível 44+).
 */
const g = grade('B2-centro', [
  '################',
  '###K#####W###W##',
  '#QQ.GG..1..GG.V#',
  '#..............#',
  '#.J.J.J...,,,..#',
  '#.........,,,.2#',
  '#.J.J.J........#',
  '#..........3...#',
  '#..............#',
  '#######DD#######',
], { K: '#', W: '#', Q: '.', G: '.', V: '.', J: '.', D: '+', '1': '.', '2': '.', '3': '.' });
const zona: ZonaDef = {
  id: 'B2-centro', nome: 'Centro de Reabilitação de Fauna', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'pantanal', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'laboratorio' },
    obj(g, 'K', 'quadro', { texto: ['Quadro de avisos: "Soltura de jacarés na quinta. Favor não levar o almoço."'] }),
    ...objs(g, 'W', 'janela'),
    { o: 'estante-lab', x: g.todos('Q')[0]?.[0] ?? 1, y: 2, texto: ['Fichas de resgate: espécie, peso, onde foi achado e um desenho do filhote feito pelas crianças da escola.'] },
    { o: 'mesa-lab', x: g.todos('G')[0]?.[0] ?? 4, y: 2, texto: ['Mamadeiras, conta-gotas e uma balança onde um Tatuzim insiste em dormir.'] },
    { o: 'mesa-lab', x: g.todos('G')[2]?.[0] ?? 11, y: 2, texto: ['Um mapa do ninhal com os ninhos marcados em verde. Os que o Cartel saqueou estão em vermelho.'] },
    obj(g, 'V', 'viveiro', { script: 'viveiro' }),
    ...objs(g, 'J', 'cesto', { texto: ['Um cesto forrado de capim, morninho. Alguém dormiu aqui e deixou pelo.'] }),
  ],
  warps: saidas(g, 'D', 'B2', 35, 21, 's', 'porta'),
  npcs: [
    gente(g, '1', 'b2-veterinaria', 'cl-biologa', 'Drª Taiamã', { dir: 's', script: 'b1-orfaos' }),
    gente(g, '2', 'b2-tratadora', 'npc-mulher-4', 'Tratadora Nhá Joana', { dir: 'o', fala: ['Os filhotes tirados dos ninhos não sabem voltar para o mato sozinhos. Precisam de alguém que ensine.', 'Um treinador de Campeão ensina rápido. Mas ensina com carinho, viu? Filhote sente.'] }),
    gente(g, '3', 'b2-tatuzim', 'c:tatuzim', 'Tatuzim', { mov: 'vagar', fala: ['(O Tatuzim residente se enrola feito bola e rola até a porta. Ele faz isso com todo visitante.)'] }),
  ],
};
export default zona;
