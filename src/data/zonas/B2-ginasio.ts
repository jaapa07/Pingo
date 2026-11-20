import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Terra (nº 9, Pantanal Grande) — curral da Boiadeira Zefa. Tema g05 (arte da Terra).
 * Quebra-cabeça (src/world/mecanicas/ginasio-09.ts): três cercados de lama (`l`). A lama afunda e vira buraco
 * quando o jogador sai de cima dela; a porteira do cercado só abre depois que TODA a lama dele foi pisada.
 * Sair do cercado pela passarela ou atolar (ficar sem saída) faz os peões alisarem a lama de novo; o sino ao
 * lado de cada cercado faz o mesmo a pedido. Cercado vencido vira chão firme.
 * Soluções (verificadas por busca de caminho que cobre toda a lama):
 *  - cercado 1 (lama 5×2, porteira em (10, 13)): entrando por (6, 15) `nlslnlsln`, por (8, 15) `oonlllsln`
 *    ou por (10, 15) `oooonllll`; pelas colunas 7 e 9 não há caminho;
 *  - cercado 2 (lama 7×3 com um fardo em (9, 11), porteira em (6, 8)): só pelas colunas 5 e 7 — de (5, 11)
 *    `lllnllslnnoooosoonl`, de (7, 11) `lnllslnnoooososonnl`;
 *  - cercado 3 (lama 11×3 com fardos em (8, 6) e (10, 6), porteira em (7, 3)): só entre os fardos, por (9, 6),
 *    e há 4 caminhos, ex.: `nllslnlslnnoooooososonosonnlll`.
 */
const zona: ZonaDef = {
  id: 'B2-ginasio', nome: 'Ginásio de Pantanal Grande', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-05', passo: 9,
  mapaChars: [
    '###################',
    '#ppp....,,,....ppp#',
    '#.................#',
    '#ppffff:ffffffffpp#',
    '#ppflllllllllllfpp#',
    '#ppflllllllllllfpp#',
    '#ppfllllplpllllfpp#',
    '#.................#',
    '#pppff:ffffffpppp##',
    '#pppflllllllfpppp##',
    '#pppflllllllfpppp##',
    '#pppfllllpllfpppp##',
    '#.................#',
    '#ppppfffff:fpppppp#',
    '#ppppflllllfpppppp#',
    '#ppppflllllfpppppp#',
    '#......,+,........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g05' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE PANTANAL GRANDE\nLíder: Boiadeira Zefa\n"Pé no barro, cabeça no céu."', 'Dica do curral: a lama afunda quando você sai de cima dela. A porteira só abre depois que o cercado inteiro levou pisada.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Cada cercado tem só um jeito de começar. Olhe bem antes de pôr o pé: cada passo é sem volta.', 'Atolou? Os peões alisam a lama e devolvem você à beira do cercado. O sino de cada cercado faz o mesmo.'] },
    { o: 'alavanca', x: 4, y: 15 }, { o: 'alavanca', x: 3, y: 11 }, { o: 'alavanca', x: 2, y: 6 },
    { o: 'gin-pedestal', x: 9, y: 1 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B2', x: 23, y: 9, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'peao-1', sprite: 'cl-vaqueiro', x: 16, y: 16, dir: 'o', fala: ['Bem-vindo ao curral da Zefa! Aqui o chão é que manda.', 'Pisou na lama e saiu, ela afunda. Para a porteira abrir, o cercado inteiro tem que levar pisada, sem repetir nenhum palmo.', 'No primeiro cercado, comece por uma das pontas ou bem pelo meio. Pelas colunas do lado de cada um desses, não tem jeito.'] },
    { id: 'g09-1', sprite: 'cl-vaqueiro', x: 13, y: 17, dir: 'o', treinador: 'g09-1', visao: 3 },
    { id: 'g09-2', sprite: 'cl-pescador', x: 16, y: 12, dir: 'o', treinador: 'g09-2', visao: 5 },
    { id: 'g09-3', sprite: 'cl-biologa', x: 1, y: 12, dir: 'l', treinador: 'g09-3', visao: 5 },
    { id: 'g09-4', sprite: 'cl-vaqueiro', x: 16, y: 7, dir: 'o', treinador: 'g09-4', visao: 7 },
    { id: 'g09-5', sprite: 'cl-mateira', x: 3, y: 2, dir: 'l', treinador: 'g09-5', visao: 4 },
    { id: 'lider', sprite: 'lider-05', x: 9, y: 1, dir: 's', script: 'ginasio-09-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
