import type { ZonaDef, NpcDef } from '../../core/tipos';

const pessoa = (n: NpcDef & { nome: string }): NpcDef => n;

/**
 * Plataforma da Estação de Vila Cascavel: ponta sertaneja do Trem Serra-Sol. Chegada do trem em (8, 6)
 * (contrato de docs/HISTORIA.md); o warp `trem` fica no vagão e exige `flag:liga-vencida&item:passe-trem`.
 * A primeira chegada roda `b1-chegada` (boas-vindas ao Sertão das Névoas e o caminho até o ginásio 9).
 */
const zona: ZonaDef = {
  id: 'B1-estacao', nome: 'Estação de Vila Cascavel', mapa: 'B', tipo: 'rota', tileset: 'cerrado', musica: 'cidade-catira', arena: 'cerrado', passo: 9,
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
    { o: 'bilheteria', x: 1, y: 6, texto: ['BILHETERIA DE VILA CASCAVEL\nO Passe do Trem dos Campeões vale para sempre. A paciência do bilheteiro, não.'] },
    { o: 'banco-estacao', x: 13, y: 6 },
    { o: 'relogio-estacao', x: 16, y: 4 },
    { o: 'poste', x: 4, y: 4 }, { o: 'poste', x: 12, y: 6 },
    { o: 'placa', x: 6, y: 8 },
    { o: 'buriti', x: 2, y: 9 }, { o: 'ipe-amarelo', x: 15, y: 9 },
  ],
  placas: [{ x: 6, y: 8, texto: 'LINHA SERRA-SOL\nPorto Sereia (Costa do Sol) ⇄ Vila Cascavel (Sertão das Névoas).\nCuidado com o vão entre o trem e a serra.' }],
  warps: [
    { x: 8, y: 3, para: { zona: 'A4-estacao', x: 8, y: 6, dir: 's' }, tipo: 'trem', requer: 'flag:liga-vencida&item:passe-trem', recusa: 'O maquinista confere a mochila e coça a cabeça:\n"Sem o Passe do Trem não desço a serra, Campeão. O Cacique Aracê entrega um a quem vence a Liga."' },
    { x: 8, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'borda' },
    { x: 9, y: 10, para: { zona: 'B1', x: 6, y: 6, dir: 's' }, tipo: 'borda' },
  ],
  npcs: [
    pessoa({ id: 'b1-maquinista', sprite: 'npc-maquinista', x: 10, y: 4, dir: 's', nome: 'Maquinista Firmino', fala: ['Quer voltar para Porto Sereia? É só subir no vagão. A Maria-Fumaça desce a serra em vinte minutos e sobe em quarenta: subida é subida.', 'Linha da serra só leva Campeão da Liga. Você é Campeão. Logo, sobe quando quiser. Lógica de maquinista.'] }),
    pessoa({ id: 'b1-viajante', sprite: 'npc-mulher-3', x: 14, y: 5, dir: 's', nome: 'Viajante Lucinha', fala: ['Vim da Costa do Sol só para comer doce de buriti em Vila Cascavel.', 'Já estou na terceira viagem. É um doce muito bom. Ou eu sou muito fraca para doce.'] }),
    pessoa({ id: 'b1-carregador', sprite: 'npc-homem-2', x: 4, y: 6, mov: 'vagar', nome: 'Carregador Tonho', fala: ['Tem gente de macacão cor de ferrugem rondando o Pantanal. Embarcaram umas gaiolas no último trem de carga.', 'Não gostei da cara deles. Também não gostei da cara das gaiolas. Gaiola não devia ter cara de nada.'] }),
  ],
  gatilhos: [{ x: 7, y: 7, w: 4, h: 1, script: 'b1-chegada', se: '!flag:b1-chegou', umaVez: true }],
};
export default zona;
