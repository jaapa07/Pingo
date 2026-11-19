import type { ZonaDef } from '../../core/tipos';

/**
 * Plataforma da Estação de Porto Sereia: ponta litorânea do Trem Serra-Sol. Chegada do trem em (8, 6)
 * (contrato de docs/HISTORIA.md); o warp `trem` fica no vagão. A porta da estação, em Porto Sereia, exige o Passe do Trem.
 */
const zona: ZonaDef = {
  id: 'A4-estacao', nome: 'Estação de Porto Sereia', mapa: 'A', tipo: 'rota', tileset: 'costa', musica: 'cidade-frevo', arena: 'praia', passo: 3,
  mapaChars: [
    'TTTTTTTTTTTTTTTTTT',
    'T.,............,.T',
    'T::b::::::::::b::T',
    'T::b::::::::::b::T',
    'T;;;;;;;;;;;;;;;;T',
    'T;;;;;;;;;;;;;;;;T',
    'T;;;;;;;;;;;;;;;;T',
    'Tffffff;;;;ffffffT',
    'T..,...;::;....,.T',
    'T...b...::...b...T',
    'TTTTTTTT::TTTTTTTT',
  ],
  objetos: [
    { o: 'trem', x: 5, y: 3 },
    { o: 'bilheteria', x: 14, y: 6, texto: ['BILHETERIA\nTrem Serra-Sol: Porto Sereia ↔ Vila Buriti, com vista para a serra inteira.', 'Um aviso colado no vidro: "Passe do Trem não tem validade. O troco, tem: confira na hora."'] },
    { o: 'banco-estacao', x: 2, y: 6 },
    { o: 'relogio-estacao', x: 1, y: 4 },
    { o: 'poste', x: 5, y: 6 }, { o: 'poste', x: 12, y: 4 },
    { o: 'placa', x: 11, y: 8 },
    { o: 'coqueiro', x: 2, y: 9 }, { o: 'coqueiro', x: 15, y: 9 },
  ],
  placas: [{ x: 11, y: 8, texto: 'LINHA SERRA-SOL\nPróxima parada: Vila Buriti, Sertão das Névoas.\nMantenha as criaturas dentro do vagão e as cuias fora da janela.' }],
  warps: [
    { x: 8, y: 3, para: { zona: 'B1-estacao', x: 8, y: 6, dir: 's' }, tipo: 'trem', requer: 'item:passe-trem', recusa: 'O maquinista pede o Passe do Trem.' },
    { x: 8, y: 10, para: { zona: 'A4', x: 44, y: 8, dir: 's' }, tipo: 'borda' },
    { x: 9, y: 10, para: { zona: 'A4', x: 44, y: 8, dir: 's' }, tipo: 'borda' },
  ],
  npcs: [
    { id: 'a4-maquinista', sprite: 'npc-maquinista', x: 10, y: 4, dir: 's', fala: ['Todos a bordo! É só subir no vagão que a Maria-Fumaça faz o resto.', 'Do outro lado da serra o mundo é outro: cerrado, pantanal e uma névoa que não acaba mais.'] },
    { id: 'a4-viajante', sprite: 'npc-homem-3', x: 4, y: 5, dir: 's', mov: 'olhar', fala: ['Vou visitar minha irmã em Vila Buriti. Levo de presente um vidro de água do mar.', 'Ela nunca viu o mar. Vai achar que é só água suja com sal. E é.'] },
    { id: 'a4-carregadora', sprite: 'npc-mulher-4', x: 13, y: 5, mov: 'vagar', fala: ['Dizem que a Drª Buriti, do sertão, anda procurando treinador de confiança.', 'Parece que ela tem uma criatura rara esperando por alguém da Costa do Sol.'] },
  ],
};
export default zona;
