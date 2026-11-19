import type { ZonaDef } from '../../core/tipos';

/** Casa do violeiro de Vila Buriti. */
const zona: ZonaDef = {
  id: 'B1-casa-2', nome: 'Casa do Violeiro', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-catira', arena: 'cerrado', passo: 4,
  mapaChars: [
    '##########',
    '##########',
    '#........#',
    '#........#',
    '#........#',
    '#...,,...#',
    '#...++...#',
    '####++####',
  ],
  objetos: [
    { o: 'rede', x: 1, y: 2 },
    { o: 'radio', x: 4, y: 2, texto: 'O rádio toca uma moda de viola. O locutor avisa: "névoa forte na serra, gente".' },
    { o: 'estante', x: 6, y: 2, texto: 'Cadernos de modas de viola. Uma se chama "Saudade do Trem das Sete (que Chegou às Nove)".' },
    { o: 'tapete-a', x: 4, y: 5 },
    { o: 'bau', x: 8, y: 4, texto: 'Um baú cheio de cordas de viola arrebentadas. Cada uma tem data.' },
    { o: 'quadro', x: 3, y: 1 },
    { o: 'cesto', x: 1, y: 6 },
  ],
  warps: [
    { x: 4, y: 7, para: { zona: 'B1', x: 5, y: 23, dir: 's' }, tipo: 'porta' },
    { x: 5, y: 7, para: { zona: 'B1', x: 5, y: 23, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'violeiro', sprite: 'cl-repentista', x: 6, y: 4, dir: 'o', fala: ['Quem quer chegar ao Arraial Brasa\ntem chão para caminhar:', 'passa o Pantanal, a Estrada Vermelha\ne um paredão de escalar!', '…Gostou? Fiz agora. O repente é assim, de improviso e de graça.'] },
  ],
};
export default zona;
