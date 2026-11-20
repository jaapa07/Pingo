import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Brasa (nº 11, Arraial Brasa) — terreiro de São João da Ferreira Labareda. Tema g10 (arte da Brasa).
 * Quebra-cabeça (src/world/mecanicas/ginasio-11.ts): três terreiros, cada um com fogueiras apagadas (`b`) que tocam
 * uma nota quando acendem e um sanfoneiro que toca a música do terreiro. Acendendo as fogueiras na ordem da música,
 * as brasas (`x`) da passagem seguinte se apagam; errou a ordem, as fogueiras do terreiro apagam todas.
 * Soluções:
 *  - 1º terreiro (DÓ em (5, 13), MI em (10, 13), SOL em (15, 13)): o Zé do Fole toca e cada fogueira pisca na sua
 *    nota: SOL, DÓ, MI → acenda (15, 13), (5, 13), (10, 13);
 *  - 2º terreiro (RÉ (4, 9), FÁ (8, 9), DÓ (12, 9), MI (16, 9)): a Dona Quitéria toca DÓ, FÁ, MI, RÉ, mas grita
 *    "Anarriê!": acende-se de trás para a frente → RÉ (4, 9), MI (16, 9), FÁ (8, 9), DÓ (12, 9);
 *  - 3º terreiro (MI (3, 5), DÓ (6, 5), SOL (9, 5), FÁ (12, 5), RÉ (15, 5)): o Seu Lua só canta o nome das notas,
 *    sem fogueira piscar: SOL, MI, FÁ, RÉ, DÓ → (9, 5), (3, 5), (12, 5), (15, 5), (6, 5). Cada fogueira diz a sua nota.
 */
const zona: ZonaDef = {
  id: 'B4-ginasio', nome: 'Ginásio de Arraial Brasa', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-10', passo: 11,
  mapaChars: [
    '#####################',
    '#ff......,,,......ff#',
    '#...................#',
    '#########xxx#########',
    '#...................#',
    '#..b..b..b..b..b....#',
    '#...................#',
    '#######xxx###########',
    '#...................#',
    '#...b...b...b...b...#',
    '#...................#',
    '###########xxx#######',
    '#...................#',
    '#....b....b....b....#',
    '#...................#',
    '#...................#',
    '#.......,+,.........#',
    '#.......+++.........#',
    '########+############',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g10' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE ARRAIAL BRASA\nLíder: Ferreira Labareda\n"Ferro se dobra no fogo; gente, na festa."', 'Dica do arraial: cada fogueira acende numa nota. Acenda na ordem da música do sanfoneiro e as brasas da passagem esfriam.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Errou a nota? As fogueiras do terreiro apagam e a música recomeça do princípio.', 'Cada terreiro tem o seu sanfoneiro. Fale com ele quantas vezes quiser: a música não muda.'] },
    { o: 'gin-pedestal', x: 10, y: 1 },
  ],
  placas: [{ x: 1, y: 3, texto: 'Pregada na parede, uma folha de cordel:\n"No terceiro terreiro ninguém pisca, meu irmão: quem quiser passar que escute o nome da canção."' }],
  warps: [{ x: 8, y: 18, para: { zona: 'B4', x: 25, y: 6, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'sanfoneiro-1', sprite: 'cl-repentista', x: 2, y: 12, dir: 's' },
    { id: 'sanfoneiro-2', sprite: 'cl-repentista', x: 18, y: 8, dir: 's' },
    { id: 'sanfoneiro-3', sprite: 'cl-repentista', x: 2, y: 4, dir: 's' },
    { id: 'g11-1', sprite: 'cl-ferreiro', x: 17, y: 16, dir: 'o', treinador: 'g11-1', visao: 4 },
    { id: 'g11-2', sprite: 'cl-repentista', x: 1, y: 10, dir: 'l', treinador: 'g11-2', visao: 3 },
    { id: 'g11-3', sprite: 'cl-ferreiro', x: 19, y: 10, dir: 'o', treinador: 'g11-3', visao: 3 },
    { id: 'g11-4', sprite: 'cl-repentista', x: 19, y: 6, dir: 'o', treinador: 'g11-4', visao: 4 },
    { id: 'g11-5', sprite: 'cl-ferreiro', x: 16, y: 2, dir: 'o', treinador: 'g11-5', visao: 6 },
    { id: 'lider', sprite: 'lider-10', x: 10, y: 1, dir: 's', script: 'ginasio-11-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
