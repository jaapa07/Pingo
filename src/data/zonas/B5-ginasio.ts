import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Ginga (nº 12, Cidade Ginga) — academia de capoeira do Mestre Gingado. Tema g11 (arte da Ginga).
 * Quebra-cabeça (src/world/mecanicas/ginasio-12.ts): três rodas de capoeira, cada uma guardada por um camarada parado
 * na passagem da parede. Falando com ele, começa o jogo no ritmo do berimbau: o camarada "chama" uma sequência de
 * golpes (uma seta por batida) e o jogador responde com as mesmas setas, uma em cada batida da resposta.
 * Errar mais de uma batida numa volta faz a roda recomeçar. Vencida a roda, o camarada abre a passagem.
 *  - roda 1 (toque de Angola, lento): 2 voltas, 3 e 4 golpes;
 *  - roda 2 (Benguela): 3 voltas, 3, 4 e 5 golpes;
 *  - roda 3 (São Bento Grande, rápido): 3 voltas, 4, 5 e 6 golpes.
 */
const zona: ZonaDef = {
  id: 'B5-ginasio', nome: 'Ginásio de Cidade Ginga', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-11', passo: 12,
  mapaChars: [
    '#####################',
    '#bb......,,,......bb#',
    '#...................#',
    '##########.##########',
    '#.......,,,,,.......#',
    '#.......,...,.......#',
    '#.......,,,,,.......#',
    '#####.###############',
    '#...................#',
    '#..,,,,,............#',
    '#..,...,............#',
    '#..,,,,,............#',
    '##############.######',
    '#...........,,,,,...#',
    '#...........,...,...#',
    '#...........,,,,,...#',
    '#.......,+,.........#',
    '#.......+++.........#',
    '########+############',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g11' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE CIDADE GINGA\nLíder: Mestre Gingado\n"Quem não pode com a mandinga não carrega patuá."', 'Dica da roda: o camarada chama os golpes, uma seta por batida do berimbau. Depois é a sua vez: devolva as mesmas setas, cada uma na sua batida.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Não adianta correr na frente do berimbau. Aperte a seta quando a batida soar, nem antes nem depois.', 'Numa volta, a roda perdoa um tropeço. Dois, e o jogo recomeça.'] },
    { o: 'gin-berimbau', x: 18, y: 13, texto: 'Um berimbau de verga de biriba e cabaça pintada. O toque de Angola é lento: dá tempo de pensar.' },
    { o: 'gin-berimbau', x: 8, y: 8, texto: 'Um berimbau médio. O toque de Benguela é o do meio: nem devagar, nem ligeiro.' },
    { o: 'gin-berimbau', x: 18, y: 4, texto: 'O berimbau gunga, de som grosso. No São Bento Grande a roda pega fogo: o ritmo é rápido e o jogo é longo.' },
    { o: 'gin-pedestal', x: 10, y: 1 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B5', x: 26, y: 8, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'camarada-1', sprite: 'cl-capoeirista', x: 14, y: 12, dir: 's' },
    { id: 'camarada-2', sprite: 'cl-capoeirista', x: 5, y: 7, dir: 's' },
    { id: 'camarada-3', sprite: 'cl-capoeirista', x: 10, y: 3, dir: 's' },
    { id: 'g12-1', sprite: 'cl-capoeirista', x: 3, y: 16, dir: 'l', treinador: 'g12-1', visao: 5 },
    { id: 'g12-2', sprite: 'cl-capoeirista', x: 19, y: 9, dir: 'o', treinador: 'g12-2', visao: 5 },
    { id: 'g12-3', sprite: 'cl-capoeirista', x: 1, y: 8, dir: 'l', treinador: 'g12-3', visao: 4 },
    { id: 'g12-4', sprite: 'cl-capoeirista', x: 19, y: 5, dir: 'o', treinador: 'g12-4', visao: 5 },
    { id: 'g12-5', sprite: 'cl-capoeirista', x: 3, y: 2, dir: 'l', treinador: 'g12-5', visao: 7 },
    { id: 'lider', sprite: 'lider-11', x: 10, y: 1, dir: 's', script: 'ginasio-12-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
