import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Veneno (nº 13, Brejo Roxo) — serpentário do Doutor Peçonha. Tema g13.
 * Quebra-cabeça (src/world/mecanicas/ginasio-13.ts): três tanques de piso tóxico (`x`). O jogador tem 3 de FÔLEGO
 * (medidor sobre a cabeça): cada passo na poça gasta 1; sem fôlego, o próximo passo na poça é desmaio e os
 * assistentes devolvem o jogador à boca do tanque. Chão limpo não gasta nem devolve fôlego. A planta-antídoto (`,`)
 * devolve o fôlego inteiro, mas murcha na hora (vira poça). Sair do tanque por qualquer lado faz as plantas
 * rebrotarem. Os tanques crescem: A pede 4 plantas, B pede 7 numa ordem só, C pede 8.
 * Soluções (busca em posição × fôlego × plantas usadas; passos a partir da boca, n/s/l/o):
 *  - Tanque A, boca (8, 15) → saída (12, 10): `nonnnolllllln` — plantas (7, 14), (6, 11), (9, 11), (12, 11).
 *  - Tanque B, boca (18, 16) → saída (25, 10): `nnnnllllssllslllnnnonon` — plantas (18, 12), (21, 12), (22, 14),
 *    (24, 15), (27, 15), (26, 12), (25, 11). Única combinação de plantas que passa.
 *  - Tanque C, boca (26, 6) → saída (12, 2): `nnnnnsooossooooooonnoooo` — plantas (26, 5), (26, 1), (24, 2), (23, 3),
 *    (20, 4), (17, 4), (16, 4), (14, 2).
 */
const zona: ZonaDef = {
  id: 'B6-ginasio', nome: 'Ginásio de Brejo Roxo', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-13', passo: 13,
  mapaChars: [
    '#############################',
    '#C.........C#xx#xx,xxxxxxx,x#',
    '#............x,xxx#xxxxx,xxx#',
    '#C..........#xxxxxxxxxx,#xxx#',
    '#C..........#xxx,,xx,xxxxxxx#',
    '#...........#xxx#xx,xxxxxx,x#',
    '#C.........C##############.##',
    '##################..........#',
    '#................#.......+..#',
    '#...........+....#..........#',
    '############.##..########.###',
    '###xxx,xx,xx,x#..#xxxxxxx,xx#',
    '###xxxxxxxxxx,#..#,xx,xxxx,x#',
    '###xxxxxxxxxx##..#xxx#xxx#xx#',
    '###x#xx,xxxxxx#..#xxxx,xx#xx#',
    '########.######..#xxxxxx,xx,#',
    '#......+.+....#..#.##########',
    '#......+++....#..+..#########',
    '########+####################',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g13' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE BREJO ROXO\nLíder: Doutor Peçonha\n"Veneno e remédio: a diferença é a dose."', 'Aviso do serpentário: no piso tóxico você aguenta 3 passos. A planta-antídoto devolve o fôlego todo… e murcha na hora. Chão limpo não gasta nem devolve.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Sair do tanque faz as plantas rebrotarem. Desmaiou? Os assistentes trazem você de volta à boca do tanque.', 'Conselho do Doutor: antes de pisar, conte. Toda planta que você pular agora pode faltar lá na frente.'] },
    { o: 'gin-pedestal', x: 6, y: 2 },
    { o: 'gin-antidoto', x: 3, y: 9 }, { o: 'gin-antidoto', x: 20, y: 8 }, { o: 'gin-antidoto', x: 3, y: 16 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B6', x: 33, y: 12, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g13-1', sprite: 'cl-biologa', x: 12, y: 16, dir: 'o', treinador: 'g13-1', visao: 4 },
    { id: 'g13-2', sprite: 'cl-mateira', x: 15, y: 12, dir: 'n', treinador: 'g13-2', visao: 3 },
    { id: 'g13-3', sprite: 'cl-crianca-m', x: 19, y: 17, dir: 'o', treinador: 'g13-3', visao: 1 },
    { id: 'g13-4', sprite: 'cl-biologa', x: 22, y: 9, dir: 'l', treinador: 'g13-4', visao: 3 },
    { id: 'g13-5', sprite: 'cl-vaqueiro', x: 27, y: 7, dir: 'o', treinador: 'g13-5', visao: 2 },
    { id: 'g13-6', sprite: 'cl-observadora', x: 11, y: 3, dir: 'n', treinador: 'g13-6', visao: 1 },
    { id: 'lider', sprite: 'lider-13', x: 6, y: 1, dir: 's', script: 'ginasio-13-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
