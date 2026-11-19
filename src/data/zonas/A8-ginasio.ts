import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Ferro (nº 7, Vila Ferrugem) — fábrica da Engenheira Bigorna. Tema g12.
 * Quebra-cabeça (src/world/mecanicas/ginasio-07.ts): seis esteiras (`:`) em dois circuitos, VERMELHO e AZUL.
 * A esteira carrega quem pisa nela; contra o sentido, devolve. Cada engrenagem inverte TODAS as esteiras da sua
 * cor. A esteira do meio do 1º andar leva direto à prensa de vapor (`x`) enquanto o circuito vermelho roda para
 * o norte: quem cai nela volta à entrada.
 * Solução: engrenagem vermelha da entrada (a esteira da porta passa a subir) → engrenagem azul do 1º andar →
 * esteira azul da direita → engrenagem vermelha do 2º andar (inverte de novo) → esteira vermelha do canto
 * noroeste → engrenagem azul do mezanino → esteira azul até a líder.
 * A esteira vermelha da esquerda e a do meio são armadilhas: uma devolve, a outra leva à prensa.
 */
const zona: ZonaDef = {
  id: 'A8-ginasio', nome: 'Ginásio de Vila Ferrugem', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-12', passo: 7,
  mapaChars: [
    '###################',
    '#...###...,.......#',
    '#...:::...........#',
    '##:################',
    '##:################',
    '##:################',
    '#.................#',
    '#........x........#',
    '###:#####:####:####',
    '###:#####:####:####',
    '#.................#',
    '#.................#',
    '########:##########',
    '########:##########',
    '#.................#',
    '#.................#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g12' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE VILA FERRUGEM\nLíder: Engenheira Bigorna\n"Máquina boa é a que a gente entende."', 'Dica da fábrica: esteira carrega para onde a seta aponta. Seta VERMELHA obedece às engrenagens vermelhas; seta AZUL, às azuis.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Cada engrenagem inverte todas as esteiras da sua cor de uma vez, até as que você já deixou para trás.', 'Cuidado com a esteira do meio: enquanto o circuito vermelho sobe, ela termina na prensa de vapor.'] },
    { o: 'gin-pedestal', x: 10, y: 2 },
    { o: 'gin-engrenagem', x: 3, y: 15 }, { o: 'gin-engrenagem', x: 16, y: 10 }, { o: 'gin-engrenagem', x: 16, y: 6 }, { o: 'gin-engrenagem', x: 1, y: 1 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A8', x: 30, y: 13, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g07-1', sprite: 'cl-ferreiro', x: 11, y: 14, dir: 'o', treinador: 'g07-1', visao: 3 },
    { id: 'g07-2', sprite: 'cl-garimpeiro', x: 5, y: 11, dir: 'l', treinador: 'g07-2', visao: 3 },
    { id: 'g07-3', sprite: 'cl-ferreiro', x: 17, y: 7, dir: 'o', treinador: 'g07-3', visao: 3 },
    { id: 'g07-4', sprite: 'cl-montanhista', x: 5, y: 6, dir: 'o', treinador: 'g07-4', visao: 3 },
    { id: 'g07-5', sprite: 'cl-ferreiro', x: 13, y: 2, dir: 'o', treinador: 'g07-5', visao: 4 },
    { id: 'lider', sprite: 'lider-12', x: 10, y: 1, dir: 's', script: 'ginasio-07-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
