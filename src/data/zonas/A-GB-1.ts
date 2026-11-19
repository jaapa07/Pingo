import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-GB-1 Gruta Breu, galeria de cima (escura: Lampião). Entra-se por Cidade Coral (sul) e desce-se pela escada do
 * nordeste. A saliência do salão norte é atalho só de volta. Para depois: a loca da rocha rachada (Quebra-pedra),
 * o nicho do pedregulho (Força) e a ilhota do poço (Remo… com Lampião aceso).
 */
const g = grade('A-GB-1', 40, [
  '##########|##########|##########|##########',
  '##########|##########|##########|##########',
  '###%%%%%##|####%%%%%%|%%####%%%%|%%%%%%D###',
  '##%%%k%%%#|###%%%%%%%|%%%###%%%%|%%%%%%..##',
  '##%%%%%%%#|###%%.2%%%|%%%###%%%%|%%3%%%%%##',
  '###%%%%%##|###%%%%%%%|%%%%##%%%%|%%%%%%%###',
  '####r#####|####%%%%%%|%%%%%.%%%%|%%%%######',
  '###%%%####|#####vvvv#|###%%%%%%%|%%%#######',
  '##%%%%%%##|###%%%%%%%|%###%%%%%%|%%###.#%%#',
  '##%%%%%%%#|##%%%%%%%%|%%###%%###|#####.%%m#',
  '##%%1%%%%%|%%%%%%%%%%|%%%##%%%##|#####p####',
  '##%%%%%%%%|%%%%%%%%%%|%%%%%%%%%%|%%%%%%%%##',
  '###%%%%%##|##%%%%%%%%|%%###%%%%%|%%%%%%%###',
  '####%%%###|####%%%%%#|#####%%%%%|%%4%%%####',
  '####%%%###|#####%%%##|######%%%%|%%%%%#####',
  '####%%%###|##########|#####~~~~~|~~~~%%%###',
  '###%%%%%##|##########|####~~~~~~|~~~~~%%###',
  '###%%.%%%#|#####%%%%%|%###~~~;;~|~~~~~%%###',
  '###%%%%%%%|%%%%%%%%%%|%%##~~~;n~|~~~~%%%###',
  '####%%%%%%|%%%%%5%%%%|%%%#~~~~~~|~~~%%%####',
  '#####%%%##|#####%%%%%|%%%##~~~~~|~~%%%#####',
  '#####%%###|#######%%%|%%%%######|##########',
  '####%%%###|########%%|%%i%%#####|##########',
  '####%%%###|##########|##########|##########',
  '###%%%%%##|##########|##########|##########',
  '###%%.%%##|##########|##########|##########',
  '###%%+%%##|##########|##########|##########',
  '#####S####|##########|##########|##########',
], { S: '+', k: '%', m: '%', i: '%', n: ';', '1': '%', '2': '%', '3': '%', '4': '%', '5': '%' });
const zona: ZonaDef = {
  id: 'A-GB-1', nome: 'Gruta Breu', mapa: 'A', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', escuro: true, passo: 6,
  mapaChars: g.mapa,
  objetos: [{ o: 'escada-desce', ...g.p('D') }],
  warps: [
    { ...g.p('S'), para: { zona: 'A5', x: 7, y: 9, dir: 's' }, tipo: 'caverna' },
    { ...g.p('D'), para: { zona: 'A-GB-2', x: 2, y: 2, dir: 'l' }, tipo: 'escada' },
  ],
  npcs: [
    { id: 'A-GB-1', sprite: 'cl-montanhista', ...g.p('1'), dir: 'l', treinador: 'A-GB-1', visao: 4 },
    { id: 'A-GB-2', sprite: 'cl-garimpeiro', ...g.p('2'), dir: 's', mov: 'olhar', treinador: 'A-GB-2', visao: 3 },
    { id: 'A-GB-3', sprite: 'cl-biologa', ...g.p('3'), dir: 'o', treinador: 'A-GB-3', visao: 4 },
    { id: 'A-GB-4', sprite: 'cl-escoteira', ...g.p('4'), dir: 'o', treinador: 'A-GB-4', visao: 3 },
    { id: 'A-GB-5', sprite: 'cl-garimpeiro', ...g.p('5'), dir: 'l', treinador: 'A-GB-5', visao: 4 },
  ],
  placas: [],
  itens: [
    { ...g.p('k'), item: 'pt-24', flag: 'item:A-GB-1:loca' },
    { ...g.p('m'), item: 'cuia-ouro', flag: 'item:A-GB-1:nicho' },
    { ...g.p('n'), item: 'pedra-lunar', flag: 'item:A-GB-1:ilhota' },
    { ...g.p('i'), item: 'elixir-andiroba', flag: 'item:A-GB-1:fundo' },
    { x: 5, y: 17, item: 'cuia-noturna', qtd: 2, oculto: true, flag: 'item:A-GB-1:entrada' },
    { x: 25, y: 6, item: 'pepita', oculto: true, flag: 'item:A-GB-1:salao' },
  ],
  habitats: [
    { metodo: 'caverna', taxa: 0.09, todos: [{ e: 30, nv: [20, 21], peso: 15 }, { e: 171, nv: [27, 30], peso: 30 }, { e: 31, nv: [28, 31], peso: 20 }, { e: 147, nv: [27, 29], peso: 12 }, { e: 165, nv: [27, 29], peso: 8 }], camadas: [{ apos: 8, todos: [{ e: 31, nv: [36, 39], peso: 35 }, { e: 172, nv: [38, 41], peso: 25 }, { e: 171, nv: [32, 33], peso: 20 }, { e: 148, nv: [37, 40], peso: 20 }] }] },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 39, nv: [27, 31], peso: 70 }, { e: 127, nv: [27, 30], peso: 30 }] },
    { metodo: 'pesca-velha', todos: [{ e: 39, nv: [14, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 39, nv: [26, 30], peso: 75 }, { e: 127, nv: [26, 30], peso: 25 }] },
  ],
};
export default zona;
