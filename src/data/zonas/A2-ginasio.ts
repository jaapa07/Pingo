import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Vento (nº 1, Vila Caiçara) — píer do Mestre Gaivota. Tema g01.
 * Quebra-cabeça (src/world/mecanicas/ginasio-01.ts): correntes de vento (`x`) empurram quem pisa nelas.
 * Solução: suba pela prancha do meio (vento a favor). No deque central a rajada sopra para o leste: entre nela
 * entre os dois mastros para parar no segundo mastro, suba pela prancha da direita, vire a alavanca dos
 * cata-ventos no deque nordeste, volte pela mesma prancha (agora sopra para o sul), entre na rajada ANTES do
 * primeiro mastro, suba pela prancha da esquerda e deixe o vento levar você até o Mestre Gaivota.
 * Quem entra na rajada depois do segundo mastro cai no mar e volta para a entrada.
 */
const zona: ZonaDef = {
  id: 'A2-ginasio', nome: 'Ginásio de Vila Caiçara', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-01', passo: 1,
  mapaChars: [
    '#################',
    '#~~~~~~...~~~~~~#',
    '#~~~~~~.,.~~~~~~#',
    '#~...~~...~~...~#',
    '#~...xx...xx...~#',
    '#~...~~~~~~~...~#',
    '#~~x~~~~~~~~~x~~#',
    '#~~x~~~~~~~~~x~~#',
    '#~~x~~~~~~~~~x~~#',
    '#~.............~#',
    '#~xxxxTxxxxxTxx~#',
    '#~.............~#',
    '#~~~~~~~x~~~~~~~#',
    '#~~~~~~~x~~~~~~~#',
    '#~~~~~~~x~~~~~~~#',
    '#~~~~.......~~~~#',
    '#~~~~...+...~~~~#',
    '#~~~~..+++..~~~~#',
    '########+########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g01' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE VILA CAIÇARA\nLíder: Mestre Gaivota\n"Quem conhece o vento não rema à toa."', 'Dica do píer: o vento leva quem pisa nele até onde houver um mastro, uma corda ou um deque firme.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['As setas no chão mostram para onde a corrente sopra. Contra o vento ninguém sobe prancha.', 'A alavanca do deque nordeste vira os cata-ventos das duas pranchas do norte ao mesmo tempo.'] },
    { o: 'gin-pedestal', x: 8, y: 2 },
    { o: 'alavanca', x: 14, y: 3 },
    { o: 'gin-ventilador', x: 2, y: 5 }, { o: 'gin-ventilador', x: 12, y: 5 },
    { o: 'gin-ventilador', x: 5, y: 15 }, { o: 'gin-ventilador', x: 11, y: 15 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A2', x: 21, y: 8, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g01-1', sprite: 'cl-crianca-m', x: 2, y: 11, dir: 'l', treinador: 'g01-1', visao: 3 },
    { id: 'g01-2', sprite: 'cl-pescador', x: 10, y: 9, dir: 'l', treinador: 'g01-2', visao: 3 },
    { id: 'g01-3', sprite: 'cl-observadora', x: 12, y: 4, dir: 'l', treinador: 'g01-3', visao: 2 },
    { id: 'g01-4', sprite: 'cl-surfista', x: 2, y: 4, dir: 'l', treinador: 'g01-4', visao: 2 },
    { id: 'lider', sprite: 'lider-01', x: 8, y: 1, dir: 's', script: 'ginasio-01-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
