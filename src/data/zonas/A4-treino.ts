import type { ZonaDef, NpcDef } from '../../core/tipos';
import { LIDERES_AGENDA, TREINO_POSICOES, spriteDoLider } from '../revancha';

/**
 * Ginásio de Treino de Porto Sereia (spec 10A, item 25) — salão das REVANCHES DOS LÍDERES depois da Liga.
 * Entra-se pelo Guia do Treino, ao lado do Ginásio do Rio em A4 (só depois de `liga-vencida`). Cada líder aparece no
 * seu lugar do salão no dia em que o jogador ligou para ele pelo Rádio Cipó no dia e período da agenda
 * (flag `treino-hoje:<id>`, mantida por src/data/eventos/regras.ts). A recepcionista lê a agenda da semana.
 */
const lideres: NpcDef[] = LIDERES_AGENDA.map((l, i) => {
  const [x, y] = TREINO_POSICOES[i];
  return { id: 'treino-' + l.id, get sprite() { return spriteDoLider(l.id); }, x, y, dir: 's', se: 'flag:treino-hoje:' + l.id, script: 'treino-' + l.id };
});

const zona: ZonaDef = {
  id: 'A4-treino', nome: 'Ginásio de Treino', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-03', passo: 9,
  mapaChars: [
    '###################',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#........+........#',
    '#.......+++.......#',
    '#........+........#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#........+........#',
    '#########+#########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g03' },
    { o: 'gin-estatua', x: 7, y: 15, texto: ['GINÁSIO DE TREINO\nRevanches dos líderes de Pingorama.\nLigue pelo Rádio Cipó no dia e no período de cada um.'] },
    { o: 'gin-estatua', x: 11, y: 15, texto: ['Regra da casa: uma revanche por líder por dia. Quem perde volta para o Posto, como em qualquer ginásio.'] },
    { o: 'gin-pedestal', x: 9, y: 1 },
  ],
  // sem warp: a entrada é pelo Guia do Treino em A4 (o salão não tem porta no mapa da cidade); a porta de baixo leva de volta ao guia
  warps: [],
  gatilhos: [{ x: 9, y: 16, script: 'treino-saida' }],
  npcs: [
    { id: 'treino-recepcao', sprite: 'npc-atendente-posto', x: 9, y: 12, dir: 's', script: 'treino-recepcao' },
    ...lideres,
  ],
  pouso: [9, 15],
};
export default zona;
