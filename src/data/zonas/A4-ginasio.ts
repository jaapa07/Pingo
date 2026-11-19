import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Rio (nº 3, Porto Sereia) — eclusas do Marujo Netuno Silva. Tema g03.
 * Quebra-cabeça (src/world/mecanicas/ginasio-03.ts): quatro canais (A, B, C e o braço D) começam vazios.
 * Balsas só encostam no cais com o canal CHEIO (A e C); passarelas baixas só aparecem com o canal VAZIO (B e D).
 * Volante 1 (entrada) enche/esvazia A e B · volante 2 (salão do meio, oeste) B e D · volante 3 (salão do meio, leste) C.
 * Solução: volante 1 (A e B enchem), balsa do canal A, atravesse o braço D ainda vazio até o lado leste, volante 3
 * (C enche), volte, volante 2 (B esvazia, D enche), passarela do canal B, balsa do canal C e o líder.
 * Quem gira o volante 2 antes do 3 fica sem acesso ao 3: é só girar de novo.
 */
const zona: ZonaDef = {
  id: 'A4-ginasio', nome: 'Ginásio de Porto Sereia', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-03', passo: 3,
  mapaChars: [
    '###################',
    '#........,........#',
    '#.................#',
    '#~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~#',
    '#.................#',
    '#.................#',
    '#~~~=~~~~~~~~~~~~~#',
    '#~~~=~~~~~~~~~~~~~#',
    '#..........~~.....#',
    '#..........==.....#',
    '#..........~~.....#',
    '#~~~~~~~~~~~~~~~~~#',
    '#~~~~~~~~~~~~~~~~~#',
    '#.................#',
    '#.................#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g03' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE PORTO SEREIA\nLíder: Marujo Netuno Silva\n"Maré não espera ninguém."', 'Dica das eclusas: balsa só encosta no cais com o canal cheio. Passarela baixa só aparece com o canal vazio.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Cada volante mexe em mais de um canal ao mesmo tempo: o que enche um pode esvaziar o outro.', 'O volante do salão leste é o único que enche o canal do líder. Passe por ele antes de fechar o caminho.'] },
    { o: 'gin-pedestal', x: 9, y: 2 },
    { o: 'gin-comporta', x: 4, y: 15 }, { o: 'gin-comporta', x: 2, y: 9 }, { o: 'gin-comporta', x: 16, y: 9 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A4', x: 13, y: 17, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g03-1', sprite: 'cl-pescador', x: 11, y: 14, dir: 'o', treinador: 'g03-1', visao: 3 },
    { id: 'g03-2', sprite: 'cl-surfista', x: 5, y: 11, dir: 'l', treinador: 'g03-2', visao: 3 },
    { id: 'g03-3', sprite: 'cl-mergulhador', x: 17, y: 10, dir: 'o', treinador: 'g03-3', visao: 4 },
    { id: 'g03-4', sprite: 'cl-crianca-m', x: 8, y: 6, dir: 'o', treinador: 'g03-4', visao: 4 },
    { id: 'g03-5', sprite: 'cl-mergulhador', x: 11, y: 2, dir: 'l', treinador: 'g03-5', visao: 3 },
    { id: 'lider', sprite: 'lider-03', x: 9, y: 1, dir: 's', script: 'ginasio-03-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
