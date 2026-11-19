import type { ZonaDef } from '../../core/tipos';

/** Plataforma da Estação de Vila Buriti: ponta sertaneja do Trem Serra-Sol. Chegada em (8, 6) (contrato de docs/HISTORIA.md). */
const zona: ZonaDef = {
  id: 'B1-estacao', nome: 'Estação de Vila Buriti', mapa: 'B', tipo: 'rota', tileset: 'cerrado', musica: 'cidade-catira', arena: 'cerrado', passo: 4,
  mapaChars: [
    'TTTTTTTTTTTTTTTTTT',
    'T,..............,T',
    'T::b::::::::::b::T',
    'T::b::::::::::b::T',
    'T;;;;;;;;;;;;;;;;T',
    'T;;;;;;;;;;;;;;;;T',
    'T;;;;;;;;;;;;;;;;T',
    'Tffffff;;;;ffffffT',
    'T.,....;::;....,.T',
    'T...b...::...b...T',
    'TTTTTTTT::TTTTTTTT',
  ],
  objetos: [
    { o: 'trem', x: 5, y: 3 },
    { o: 'bilheteria', x: 1, y: 6, texto: 'BILHETERIA\nO Passe do Trem vale para sempre. A paciência do bilheteiro, não.' },
    { o: 'banco-estacao', x: 13, y: 6 },
    { o: 'relogio-estacao', x: 16, y: 4 },
    { o: 'poste', x: 4, y: 4 }, { o: 'poste', x: 12, y: 6 },
    { o: 'placa', x: 6, y: 8, texto: 'LINHA SERRA-SOL\nPorto Sereia (Costa do Sol) ↔ Vila Buriti (Sertão das Névoas).' },
    { o: 'buriti', x: 2, y: 9 }, { o: 'ipe-amarelo', x: 15, y: 9 },
  ],
  warps: [
    { x: 8, y: 3, para: { zona: 'A4-estacao', x: 8, y: 6, dir: 's' }, tipo: 'trem', requer: 'item:passe-trem', recusa: 'O maquinista pede o Passe do Trem.' },
    { x: 8, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'borda' },
    { x: 9, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'borda' },
  ],
  npcs: [
    { id: 'maquinista', sprite: 'npc-maquinista', x: 10, y: 4, dir: 's', fala: ['Quer voltar para Porto Sereia? É só subir no vagão.', 'O trem só anda graças a você, que religou a Usina Velha. A caldeira agradece!'] },
    { id: 'viajante', sprite: 'npc-mulher-3', x: 14, y: 5, dir: 's', fala: ['Vim da Costa do Sol só para comer doce de buriti.', 'Já estou na terceira viagem. É um doce muito bom.'] },
    { id: 'carregador', sprite: 'npc-homem-2', x: 4, y: 6, mov: 'vagar', fala: ['Dizem que tem gente estranha, de macacão cor de ferrugem, rondando o Pantanal.', 'Carregaram umas gaiolas no último trem de carga. Não gostei da cara deles.'] },
  ],
  gatilhos: [{ x: 8, y: 5, w: 1, h: 1, script: 'b1-chegada', se: '!flag:b1-chegou', umaVez: true }],
};
export default zona;
