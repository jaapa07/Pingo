import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Casa dos Pipeiros: oficina de pipas, rabiolas penduradas e cola por todo lado. */
const g = grade('A2-casa-2', [
  '############',
  '##W##K##K###',
  '#mm.A...T.B#',
  '#..........#',
  '#...1....hm#',
  '#..........#',
  '#cb..aa..2.#',
  '#....aa....#',
  '#####DD#####',
], { W: '#', K: '#', m: '.', A: '.', T: '.', B: '.', h: '.', c: '.', b: '.', a: ',', D: '+', '1': '.', '2': '.' });
const m = g.todos('m');
const zona: ZonaDef = {
  id: 'A2-casa-2', nome: 'Casa dos Pipeiros', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'cidade-samba', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'serrana' },
    obj(g, 'W', 'janela'), { o: 'poster-b', x: g.todos('K')[0][0], y: g.todos('K')[0][1] }, { o: 'quadro', x: g.todos('K')[1][0], y: g.todos('K')[1][1] },
    { o: 'mesa', x: m[0][0], y: m[0][1], texto: ['Varetas de bambu, papel de seda e um pote de cola de farinha. Uma pipa em forma de Gaviãozão está quase pronta.'] },
    obj(g, 'A', 'armario'), obj(g, 'T', 'tv', { texto: ['Previsão do tempo: "Vento nordeste, ótimo para pipa e péssimo para penteado."'] }), obj(g, 'B', 'bau'),
    obj(g, 'h', 'cadeira'), { o: 'mesa-centro', x: m[2][0], y: m[2][1] },
    obj(g, 'c', 'cesto'), obj(g, 'b', 'banquinho'),
    { o: 'tapete-c', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A2', 31, 23, 's', 'porta'),
  npcs: [
    gente(g, '1', 'a2-pipeira', 'npc-mulher-4', 'Pipeira Rosa', { fala: ['Rabiola comprida deixa a pipa firme; rabiola curta deixa ela arisca.', 'Com criatura é igual: cada uma tem sua personalidade, e ela muda os atributos.'] }),
    gente(g, '2', 'a2-pipeiro-pai', 'npc-homem-3', 'Pipeiro Chico', { mov: 'olhar', fala: ['Depois do ginásio daqui, o caminho é pelos Campos de Restinga, a leste.', 'Leve Fumaça de Andiroba se enjoar de tanto Calanguinho pulando na sua canela.'] }),
  ],
};
export default zona;
