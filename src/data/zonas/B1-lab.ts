import type { ZonaDef } from '../../core/tipos';

/** Laboratório de Campo da Drª Buriti: inicial extra depois da insígnia 4 (spec 6.2). */
const zona: ZonaDef = {
  id: 'B1-lab', nome: 'Laboratório da Drª Buriti', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'cerrado', passo: 4,
  mapaChars: [
    '##############',
    '##############',
    '#............#',
    '#............#',
    '#....,,,,....#',
    '#....,,,,....#',
    '#............#',
    '#............#',
    '#.....++.....#',
    '######++######',
  ],
  objetos: [
    { o: 'mesa-lab', x: 1, y: 2, texto: 'Sementes de buriti em potinhos numerados. O número 37 germinou e ganhou um laço.' },
    { o: 'estante-lab', x: 4, y: 2 },
    { o: 'mesa-lab', x: 9, y: 2, texto: 'Um microscópio aponta para uma asa de Lavadeirim. Parece um vitral.' },
    { o: 'viveiro', x: 12, y: 2, script: 'viveiro' },
    { o: 'estante-lab', x: 1, y: 6, texto: 'Pastas: "Cheias do Pantanal", "Criaturas traficadas — denúncias", "Receitas de pequi".' },
    { o: 'tanque', x: 11, y: 5 },
    { o: 'planta-b', x: 12, y: 8 }, { o: 'planta', x: 1, y: 8 },
    { o: 'poster-c', x: 7, y: 1, texto: 'Mapa do Sertão das Névoas, com alfinetes vermelhos no Pantanal e na Chapada Rubra.' },
  ],
  warps: [
    { x: 6, y: 9, para: { zona: 'B1', x: 32, y: 22, dir: 's' }, tipo: 'porta' },
    { x: 7, y: 9, para: { zona: 'B1', x: 32, y: 22, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'dra-buriti', sprite: 'dra-buriti', x: 7, y: 3, dir: 's', script: 'b1-dra-buriti' },
    { id: 'estagiario', sprite: 'npc-homem-1', x: 10, y: 6, dir: 'n', mov: 'olhar', fala: ['A doutora descobriu que o Pererecão canta em dó maior.', 'Eu descobri que ele canta às três da manhã. Do lado da minha rede.'] },
    { id: 'criatura-lab', sprite: 'c:tatuzim', x: 3, y: 5, mov: 'vagar', fala: ['(O Tatuzim se enrola feito bola e rola até o seu pé.)'] },
  ],
};
export default zona;
