import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-RS Recife Submerso (área de retorno, Mergulho — insígnia 9): o fundo da Baía Azul, em três bolsões sem ligação
 * entre si; cada poço fundo da baía desce a um deles. Oeste: jardim de corais. Leste: a clareira de areia onde a
 * Tartaruga-Gigante sobe para respirar às sextas-feiras. Sul: o canal que acaba na gruta da Boiúna (ela só acorda
 * para quem tem a insígnia 12, Berimbau).
 */
const g = grade('A-RS', 50, [
  '##########|##########|##########|##########|##########',
  '###%%%%%%#|####%%%%%%|%%########|##########|##########',
  '##%%%%%%%%|%%%%%%%%%%|%%%#######|##########|##########',
  '##%%T%%%%%|%%%%.%%T%%|%%%%######|##########|##########',
  '#%%%%%1%%%|%%%...%%%%|%%%%######|##########|##########',
  '#%%%%%%%%#|##%%...%%%|%T%%######|##########|##########',
  '#%%a%%%###|###%%%.%%%|%%%%######|##########|##########',
  '##%%%%####|####%...%%|%%%#######|######%%%%|%%%%######',
  '###%%%%%%#|###%.U..%%|%%########|####%%%%%%|%%%%%%%###',
  '####%%%%%%|%%%%...%%%|%#########|###%%%T%%%|3%%%T%%%##',
  '#####%%T%%|%%%%%%%%%%|##########|##%%%%%%%%|%%%%%%%%%#',
  '######%%%%|%%%2%%%%##|##########|##%%%.....|.%%%%%%%%#',
  '########%%|%%%%%%####|##########|##%%%..G..|.%%%%%q%%#',
  '##########|##########|##########|###%%.....|.%%%%%%%##',
  '##########|##########|##########|###%%%....|%%%T%%%%##',
  '##########|##########|##########|####%%%%%%|%%%%%%%%%#',
  '##########|##########|##########|#####%%%%%|%%%...%%%#',
  '##########|##########|##########|######%T%%|%%%...%%%#',
  '##########|##########|##########|#######%%%|%%%.V.%%%#',
  '##########|##########|##########|########%%|%%%...%%##',
  '##########|##########|##########|##########|%%%%%%%###',
  '##########|##########|##########|##########|##########',
  '##########|####%%%%%%|%%%%%%%%%%|%%%%%#####|##########',
  '#########%|%%%%%%%T%%|%%%%%%%%%%|%%%%%%%###|##########',
  '##....###%|%%%%%%%%%%|4%%%%T%%%%|%%%%%%%%##|##########',
  '#......##%|%%T%%%%%%%|%%%%%%%%%%|%%%%T%%%##|##########',
  '#..B...+%%|%%%%%%%%%%|%%%%%%%%..|...%%%%%%#|##########',
  '#......##%|%%%%%%%%%%|%%%%%%%%..|W..%%%j%##|##########',
  '##....###%|%%%%T%%%%%|%%%%%%%%..|...%%%%###|##########',
  '#########%|%%%%%%%%%%|%%%T%%%%%%|%%%%%%####|##########',
  '##########|###%%%%%%%|%%%%%%%%%%|%%%%######|##########',
  '##########|##########|##########|##########|##########',
], { a: '%', q: '%', j: '%', '1': '%', '2': '%', '3': '%', '4': '%' });
const U = g.p('U'), V = g.p('V'), W = g.p('W'), G = g.p('G'), B = g.p('B');
const fundo = [{ e: 121, nv: [48, 49], peso: 22 }, { e: 126, nv: [48, 52], peso: 16 }, { e: 130, nv: [48, 52], peso: 14 }, { e: 118, nv: [48, 52], peso: 14 }, { e: 80, nv: [49, 52], peso: 10 }, { e: 122, nv: [49, 52], peso: 8 }, { e: 78, nv: [49, 52], peso: 6 }, { e: 119, nv: [48, 49], peso: 6 }, { e: 120, nv: [50, 52], peso: 2 }, { e: 124, nv: [50, 52], peso: 2 }] as { e: number; nv: [number, number]; peso: number }[];
const zona: ZonaDef = {
  id: 'A-RS', nome: 'Recife Submerso', mapa: 'A', tipo: 'agua', tileset: 'submerso', musica: 'mergulho', arena: 'recife', submerso: true, passo: 10,
  mapaChars: g.mapa,
  warps: [
    { ...U, para: { zona: 'A-BA', x: 42, y: 11 } },
    { ...V, para: { zona: 'A-BA', x: 66, y: 23 } },
    { ...W, para: { zona: 'A-BA', x: 52, y: 29 } },
  ],
  gatilhos: [{ x: G.x - 3, y: G.y - 2, w: 7, h: 5, script: 'a2-rs-sexta' }],
  npcs: [
    { id: 'boiuna', sprite: 'c:boiuna', ...B, dir: 'l', se: '!flag:boiuna-ok', script: 'a2-rs-boiuna' },
    { id: 'tartaruga', sprite: 'c:tartaruga-gigante', ...G, dir: 's', se: 'flag:hoje-sexta&!flag:sexta-capturada', script: 'a2-rs-tartaruga' },
    { id: 'A-RS-1', sprite: 'cl-mergulhador', ...g.p('1'), dir: 'l', treinador: 'A-RS-1', visao: 4 },
    { id: 'A-RS-2', sprite: 'cl-mergulhador', ...g.p('2'), dir: 'n', mov: 'olhar', treinador: 'A-RS-2', visao: 3 },
    { id: 'A-RS-3', sprite: 'cl-mergulhador', ...g.p('3'), dir: 's', treinador: 'A-RS-3', visao: 4 },
    { id: 'A-RS-4', sprite: 'cl-mergulhador', ...g.p('4'), dir: 'o', treinador: 'A-RS-4', visao: 5 },
  ],
  itens: [
    { ...g.p('a'), item: 'pedra-mare', flag: 'item:A-RS:jardim' },
    { ...g.p('q'), item: 'pt-45', flag: 'item:A-RS:clareira' },
    { ...g.p('j'), item: 'concha-rara', qtd: 2, flag: 'item:A-RS:canal' },
    { x: 5, y: 2, item: 'pepita', oculto: true, flag: 'item:A-RS:coral' },
    { x: 46, y: 10, item: 'cuia-rede', qtd: 5, flag: 'item:A-RS:leste' },
    { x: 15, y: 29, item: 'cuia-guardia', flag: 'item:A-RS:fundo' },
  ],
  habitats: [{ metodo: 'mergulho', taxa: 0.1, todos: fundo, noite: fundo.map((q) => (q.e === 126 ? { ...q, peso: 24 } : q)) }],
};
export default zona;
