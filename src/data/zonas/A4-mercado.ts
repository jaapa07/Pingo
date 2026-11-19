import type { ZonaDef, NpcDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Mercado de Peixe de Porto Sereia (a Feira): três bancas — frutos, cuias de além-mar e raridades do cais. Entrada em (7, 8). */
const g = grade('A4-mercado', [
  '################',
  '###W###K###W####',
  '#cc.1...2...3.b#',
  '#.BBB.BBB.BBB..#',
  '#..............#',
  '#.s....4.....c.#',
  '#..5.........c.#',
  '#......aa......#',
  '#......aa....6.#',
  '#######DD#######',
], { W: '#', K: '#', c: '.', b: '.', B: '.', s: '.', a: ',', D: '+', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.' });
const B = g.todos('B');
const banca = (marca: string, id: string, sprite: string, nome: string, fala: string, loja: string[], se?: string): NpcDef => gente(g, marca, id, sprite, nome, { fala: [fala], loja, ...(se ? { se } : {}) });
const zona: ZonaDef = {
  id: 'A4-mercado', nome: 'Mercado de Peixe', mapa: 'A', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'praia', passo: 3,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cais' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'K', 'rede-pesca'),
    ...[B[0], B[3], B[6]].map(([x, y]) => ({ o: 'balcao', x, y })),
    ...g.todos('c').map(([x, y]) => ({ o: 'caixote', x, y, texto: ['Caixotes de peixe no gelo. O de cima piscou. Não, foi impressão.'] })),
    obj(g, 'b', 'barril'), obj(g, 's', 'balanca', { texto: ['A balança do mercado. Um aviso: "Dedo no prato é crime."'] }),
    { o: 'tapete-b', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A4', 39, 25, 's', 'porta'),
  npcs: [
    banca('1', 'a4-banca-frutos', 'npc-mulher-1', 'Fruteira Jabuti', 'Fruto maduro, fruto doce! Plante no canteiro ou dê para a criatura segurar.', ['caju', 'pitanga', 'acerola', 'jabuticaba', 'biscoito-de-polvilho']),
    banca('2', 'a4-banca-cuias', 'npc-vendedor', 'Cuieiro Tucum', 'Cuia de tudo que é trançado! Rede para bicho de água, noturna para bicho de lua.', ['cuia-rede', 'cuia-noturna', 'cuia-rapida', 'cuia-trancada']),
    banca('3', 'a4-banca-raridades', 'npc-marinheiro', 'Capitão Bugiganga', 'Raridade de além-mar, só para quem tem a Insígnia da Concha no peito!', ['pedra-mare', 'garapa', 'rapadura', 'cha-guarana', 'fumaca-andiroba-forte'], 'insignia:3'),
    { id: 'a4-banca-fechada', sprite: 'npc-marinheiro', x: g.p('3')[0], y: g.p('3')[1], se: '!insignia:3', fala: ['Minha banca só abre para freguês com a Insígnia da Concha.', 'Não é soberba, é seguro: da última vez um novato trocou meu estoque por um Pipirim.'] } as NpcDef,
    gente(g, '4', 'a4-fregues', 'npc-idosa', 'Dona Tainha', { mov: 'olhar', fala: ['Peixe bom tem olho brilhante e guelra vermelha.', 'Marido bom, também. Mas esse eu ainda não achei na feira.'] }),
    gente(g, '5', 'a4-menina-feira', 'cl-crianca-f', 'Sardinha', { mov: 'vagar', fala: ['Meu apelido é Sardinha porque eu nasci na banca do meu pai.', 'Podia ser pior. Meu irmão é o Baiacu.'] }),
    gente(g, '6', 'a4-cozinheiro', 'npc-homem-4', 'Cozinheiro Dendê', { fala: ['Moqueca de Porto Sereia leva dendê, coentro e paciência.', 'Criatura cansada no meio da estrada? Garapa levanta na hora. Vende ali na banca do capitão.'] }),
  ],
};
export default zona;
