import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente, placa } from './_b2n-lib';

/**
 * PP-conselho · Salão do Conselho dos Guardiões (Pico Pingorama). De baixo para cima: o vestíbulo (porta do Cume), a
 * sala de espera, as cinco salas em fila — Guardiã do Mar Iara Costa (Rio/Encanto), Guardião da Mata Cauã (Mata/Inseto),
 * Guardiã do Céu Jandaia (Vento/Trovão), Guardião da Terra Moacir (Terra/Pedra/Ferro) e o Guardião-Mor Arandu — e, no
 * alto, a Sala da Memória (créditos).
 * Regras (src/data/eventos/conselho.ts): quem cruza a porta da sala de espera não volta (`conselho-em-curso`); cada porta
 * seguinte só abre com a vitória anterior (`conselho-1`…`conselho-4`); dentro, só se cura com itens; a derrota leva de
 * volta ao Portão dos Guardiões e zera a sequência. Depois do Conselho a sala reabre para revanches (o andarilho do Cume
 * volta a cada nova vitória).
 */
export const CONSELHO_VESTIBULO: [number, number] = [15, 55];
const g = grade('PP-conselho', [
  '##############################',
  '########..............########',
  '########.E....H.....E.########',
  '########..............########',
  '########..............########',
  '###############Q##############',
  '#######................#######',
  '#######.u............u.#######',
  '#######........5.......#######',
  '#######.......,,.......#######',
  '#######.u.....::.....u.#######',
  '#######........:.......#######',
  '#######........:.......#######',
  '###############O##############',
  '#######................#######',
  '#######..##....4....##.#######',
  '#######..#...........#.#######',
  '#######........:.......#######',
  '#######.U......:.....U.#######',
  '#######..##....:....##.#######',
  '#######........:.......#######',
  '###############N##############',
  '#######................#######',
  '#######.f......3.....f.#######',
  '#######.f..,.......,.f.#######',
  '#######.f......:.....f.#######',
  '#######.ff.....:....ff.#######',
  '#######........:.......#######',
  '#######........:.......#######',
  '###############L##############',
  '#######................#######',
  '#######.TT.....2.....TT#######',
  '#######.T....,,,,.....T#######',
  '#######........:.......#######',
  '#######.T......:......T#######',
  '#######.TT.....:.....TT#######',
  '#######........:.......#######',
  '###############K##############',
  '#######................#######',
  '#######.~~~....1...~~~.#######',
  '#######.~~~~.......~~~~#######',
  '#######..~~....:....~~.#######',
  '#######........:.......#######',
  '#######.~~.....:....~~.#######',
  '#######........:.......#######',
  '###############J##############',
  '##########..........##########',
  '##########.B..A...B.##########',
  '##########.....:....##########',
  '##########.....:....##########',
  '##########.....:....##########',
  '###############G##############',
  '###########.........##########',
  '###########.F...:...##########',
  '###########.....:...##########',
  '###########.....:...##########',
  '###############DD#############',
], {
  Q: ':', O: ':', N: ':', L: ':', K: ':', J: ':', G: ':', D: ':', H: '.', E: '.', u: '.', U: '.', B: '.', A: '.', F: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.',
});
const porta = (m: string, requer: string, fala: string) => { const [x, y] = g.p(m); return { x, y, requer, fala }; };
const placas = [placa(g, 'F', 'SALÃO DO CONSELHO DOS GUARDIÕES\n1. Entrou, não volta.  2. Cinco lutas seguidas.  3. Cura só pela mochila.\n4. Perdeu, desce ao Portão.  5. Ganhou, sobe à Memória.')];
const zona: ZonaDef = {
  id: 'PP-conselho', nome: 'Salão do Conselho', mapa: 'PP', tipo: 'dungeon', tileset: 'pico', musica: 'pico', arena: 'pico', passo: 17,
  mapaChars: g.mapa,
  objetos: [
    ...g.todos('E').map(([x, y]) => ({ o: 'estatua', x, y, texto: ['Uma estátua de Guardião com os olhos fechados. Na base, o nome de quem venceu o Conselho há cem anos.'] })),
    obj(g, 'H', 'totem', { texto: ['O Marco da Memória: um tronco de pau-brasil entalhado com os nomes de todos que já subiram até aqui. Há espaço para mais um.'] }),
    ...g.todos('u').map(([x, y]) => ({ o: 'totem', x, y })),
    ...g.todos('U').map(([x, y]) => ({ o: 'pedra-grande', x, y })),
    ...g.todos('B').map(([x, y]) => ({ o: 'banco', x, y })),
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: saidas(g, 'D', 'PP', 20, 7, 's', 'porta'),
  portoes: [
    porta('G', '!flag:conselho-em-curso', 'A porta da sala de espera fechou atrás de você. No Conselho só se anda para a frente.'),
    porta('K', 'flag:conselho-1', 'A porta só abre para quem vencer a Guardiã do Mar.'),
    porta('L', 'flag:conselho-2', 'A porta só abre para quem vencer o Guardião da Mata.'),
    porta('N', 'flag:conselho-3', 'A porta só abre para quem vencer a Guardiã do Céu.'),
    porta('O', 'flag:conselho-4', 'A porta só abre para quem vencer o Guardião da Terra. Do outro lado espera o Guardião-Mor.'),
    porta('Q', 'flag:conselho-memoria', 'A porta da Sala da Memória só se abre pelas mãos do Guardião-Mor.'),
  ],
  npcs: [
    gente(g, 'A', 'conselho-recepcao', 'npc-atendente-posto', 'Guardiã da Sala de Espera', { script: 'conselho-recepcao' }),
    gente(g, '1', 'guardia-iara', 'guardia-iara', 'Guardiã Iara Costa', { script: 'conselho-1' }),
    gente(g, '2', 'guardiao-caua', 'guardiao-caua', 'Guardião Cauã', { script: 'conselho-2' }),
    gente(g, '3', 'guardia-jandaia', 'guardia-jandaia', 'Guardiã Jandaia', { script: 'conselho-3' }),
    gente(g, '4', 'guardiao-moacir', 'guardiao-moacir', 'Guardião Moacir', { script: 'conselho-4' }),
    gente(g, '5', 'guardiao-arandu', 'guardiao-arandu', 'Guardião-Mor Arandu', { script: 'conselho-5' }),
  ],
  gatilhos: [{ x: 15, y: 52, script: 'conselho-entrada', se: '!flag:conselho-em-curso' }],
};
export default zona;
