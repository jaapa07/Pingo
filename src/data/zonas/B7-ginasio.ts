import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Geada (nº 14, Serra da Geada) — galpão gelado da Gaúcha Pinhão. Tema g14.
 * Quebra-cabeça (src/world/mecanicas/ginasio-14.ts + gelo do motor): três pistas de gelo (`g`). No gelo o jogador
 * desliza até bater em alguma coisa; a neve batida (`.`) para o deslize. Nas pistas 2 e 3 há blocos de gelo:
 * olhando para um bloco, o botão A o empurra e ele também desliza até bater. Bloco encalhado? Saia da pista e
 * volte: os peões arrumam os blocos. As pistas crescem: 1 só de gelo, 2 com um bloco, 3 com dois.
 * Soluções (busca em posição do jogador × posição dos blocos; n/s/l/o = deslizes, A+dir = empurrão):
 *  - Pista 1, boca (5, 15) → saída (12, 10): n o n l s l n l s l l n o s l n (16 deslizes).
 *  - Pista 2, boca (20, 16) → saída (26, 10): n o n o n l s l A-l s l n A-n s o n o n l s l n l n
 *    (o bloco vai para leste e depois para o norte, virando batente na fila 11).
 *  - Pista 3, boca (28, 8) → saída (19, 2): n l s o n l s A-s l l s o A-o o s o A-n l n l n o s o n o n o n.
 */
const zona: ZonaDef = {
  id: 'B7-ginasio', nome: 'Ginásio da Serra da Geada', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-14', passo: 14,
  mapaChars: [
    '#################################',
    '#..............................##',
    '#......,........###.#############',
    '#...............##ggggg#ggggggg##',
    '#...............##gg#gg.ggggggg##',
    '#...............##g#ggggg#ggg#g##',
    '#...............##ggggggggggggg##',
    '##################gg#g#gg.g.g####',
    '#................###########.####',
    '#................#..............#',
    '############.###.#########.######',
    '##ggg#gggg#gggg#.#.gg#ggggggg####',
    '##gggg#gggggg#g#.#gggggggg#gg####',
    '###ggggggg##ggg#.#g#gggg.ggg#####',
    '##ggggg#g..gggg#.#gg#ggggg#gg####',
    '#####.##########.##gggggggg.g####',
    '#..............#.###.############',
    '#.......+......#................#',
    '########+########################',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g14' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DA SERRA DA GEADA\nLíder: Gaúcha Pinhão\n"No gelo, quem não pensa antes, escorrega depois."', 'Regra do galpão: no gelo você só para quando bate em alguma coisa. A neve batida segura o passo.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Blocos de gelo: olhe para o bloco e aperte A. Ele também escorrega até bater, e vira batente para você.', 'Bloco encalhado num canto? Saia da pista e volte: os peões arrumam tudo no lugar.'] },
    { o: 'gin-pedestal', x: 8, y: 3 },
    { o: 'gin-bloco-gelo', x: 1, y: 8 }, { o: 'gin-bloco-gelo', x: 14, y: 16 }, { o: 'gin-bloco-gelo', x: 1, y: 1 }, { o: 'gin-bloco-gelo', x: 1, y: 6 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B7', x: 31, y: 11, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g14-1', sprite: 'cl-montanhista', x: 13, y: 16, dir: 'o', treinador: 'g14-1', visao: 5 },
    { id: 'g14-2', sprite: 'cl-escoteira', x: 14, y: 8, dir: 's', treinador: 'g14-2', visao: 1 },
    { id: 'g14-3', sprite: 'cl-vaqueiro', x: 23, y: 17, dir: 'o', treinador: 'g14-3', visao: 3 },
    { id: 'g14-4', sprite: 'cl-crianca-f', x: 31, y: 9, dir: 'o', treinador: 'g14-4', visao: 3 },
    { id: 'g14-5', sprite: 'cl-montanhista', x: 15, y: 3, dir: 'n', treinador: 'g14-5', visao: 2 },
    { id: 'lider', sprite: 'lider-14', x: 8, y: 2, dir: 's', script: 'ginasio-14-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
