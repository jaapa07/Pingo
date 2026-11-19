import type { ZonaDef } from '../../core/tipos';

/** Estação de Vila Buriti: ponta sertaneja do Trem Serra-Sol. Plataforma em (8, 6) (contrato de docs/HISTORIA.md). */
const zona: ZonaDef = {
  id: 'B1-estacao', nome: 'Estação de Vila Buriti', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'cidade-catira', arena: 'cerrado', passo: 4,
  mapaChars: [
    '##################',
    '##################',
    '#####;;;;;;;;#####',
    '#####;;;;;;;;#####',
    '#::::::::::::::::#',
    '#::::::::::::::::#',
    '#::::::::::::::::#',
    '#................#',
    '#.......,,.......#',
    '#.......++.......#',
    '########++########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'estacao' },
    { o: 'trem', x: 5, y: 3 },
    { o: 'bilheteria', x: 2, y: 7, texto: 'BILHETERIA\nO Passe do Trem vale para sempre. A paciência do bilheteiro, não.' },
    { o: 'banco-estacao', x: 13, y: 8 },
    { o: 'relogio-estacao', x: 15, y: 4 },
    { o: 'mapa-linhas', x: 2, y: 1, texto: 'LINHA SERRA-SOL\nPorto Sereia (Costa do Sol) ↔ Vila Buriti (Sertão das Névoas).' },
    { o: 'poster-b', x: 15, y: 1 },
    { o: 'planta', x: 1, y: 9 }, { o: 'planta', x: 16, y: 9 },
  ],
  warps: [
    { x: 8, y: 3, para: { zona: 'A4-estacao', x: 8, y: 6, dir: 's' }, tipo: 'trem', requer: 'item:passe-trem', recusa: 'O maquinista pede o Passe do Trem.' },
    { x: 8, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'porta' },
    { x: 9, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'maquinista', sprite: 'npc-maquinista', x: 10, y: 4, dir: 's', fala: ['Quer voltar para Porto Sereia? É só subir no vagão.', 'O trem só anda graças a você, que religou a Usina Velha. A caldeira agradece!'] },
    { id: 'viajante', sprite: 'npc-mulher-3', x: 13, y: 7, dir: 's', fala: ['Vim da Costa do Sol só para comer doce de buriti.', 'Já estou na terceira viagem. É um doce muito bom.'] },
    { id: 'carregador', sprite: 'npc-homem-2', x: 4, y: 5, mov: 'vagar', fala: ['Dizem que tem gente estranha, de macacão cor de ferrugem, rondando o Pantanal.', 'Carregaram umas gaiolas no último trem de carga. Não gostei da cara deles.'] },
  ],
  gatilhos: [{ x: 8, y: 6, script: 'b1-chegada', se: '!flag:b1-chegou', umaVez: true }],
};
export default zona;
