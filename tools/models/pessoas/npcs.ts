/** NPCs genéricos de vilas e serviços (só vista de mapa). */
import { pessoa } from './kit/pessoa';
import { R_A, R_B, R_D } from './kit/paletas';
import type { PixModel } from '../../render/types';

export const npcs: PixModel[] = [
  pessoa({ id: 'npc-homem-1', pele: 'clara', cabelo: 'castanho', a: 'mar', b: 'caqui', d: 'couro', v: { cabelo: 'curto', manga: 'curta', pes: 'sapato', rPes: R_D } }),
  pessoa({ id: 'npc-homem-2', pele: 'retinta', cabelo: 'preto', a: 'folha', b: 'cru', d: 'couroClaro', v: { cabelo: 'raspado', barba: 'bigode', manga: 'curta', baixo: 'short', pes: 'sandalia', rPes: R_D } }),
  pessoa({ id: 'npc-homem-3', pele: 'morena', cabelo: 'azeviche', a: 'laranja', b: 'jeans', d: 'branco', v: { cabelo: 'topete', manga: 'sem', listra: R_D, pes: 'sapato', rPes: R_D } }),
  pessoa({ id: 'npc-homem-4', pele: 'oliva', cabelo: 'castanhoEscuro', a: 'vinho', b: 'terra', d: 'palha', v: { porte: 'forte', cabelo: 'curto', barba: 'barba', chapeu: 'palha', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', pes: 'bota', rPes: R_B, cinto: R_D } }),
  pessoa({ id: 'npc-mulher-1', pele: 'morena', cabelo: 'castanhoEscuro', a: 'coral', b: 'manteiga', d: 'turquesa', v: { cabelo: 'longo', manga: 'curta', baixo: 'saia', rBaixo: R_A, rBarra: R_B, brinco: R_D, pes: 'sandalia', rPes: R_D } }),
  pessoa({ id: 'npc-mulher-2', pele: 'clara', cabelo: 'ruivo', a: 'turquesa', b: 'cru', d: 'pitanga', v: { cabelo: 'chanel', manga: 'curta', pes: 'sapato', rPes: R_D, pescoco: 'lenco', rPescoco: R_D } }),
  pessoa({ id: 'npc-mulher-3', pele: 'retinta', cabelo: 'preto', a: 'ipe', b: 'orquidea', d: 'branco', v: { cabelo: 'black', chapeu: 'faixa', rChapeu: R_B, manga: 'sem', baixo: 'saia-longa', rBarra: R_A, brinco: R_A, pes: 'sandalia', rPes: R_A } }),
  pessoa({ id: 'npc-mulher-4', pele: 'canela', cabelo: 'preto', a: 'branco', b: 'jeans', d: 'goiaba', v: { cabelo: 'trancas', laco: R_D, manga: 'curta', baixo: 'short', sobre: 'jardineira', rSobre: R_B, rSobreFaixa: R_D, pes: 'sapato', rPes: R_D } }),
  pessoa({ id: 'npc-idoso', pele: 'canela', cabelo: 'branco', a: 'manteiga', b: 'cinza', d: 'couro', v: { porte: 'idoso', cabelo: 'calvo', barba: 'bigode', manga: 'curta', pes: 'sapato', rPes: R_D, cinto: R_D, prop: 'bengala', rProp: R_D, propNoMapa: true } }),
  pessoa({ id: 'npc-idosa', pele: 'clara', cabelo: 'branco', a: 'petroleo', b: 'lilas', d: 'renda', v: { porte: 'idoso', cabelo: 'coque', manga: 'longa', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_D, sobre: 'xale', rSobre: R_B, rSobreFaixa: R_D, oculos: R_B, pes: 'sapato', rPes: R_B } }),
  // atendente do Posto Guardião: touca e avental brancos com faixa turquesa
  pessoa({ id: 'npc-atendente-posto', pele: 'castanha', cabelo: 'preto', a: 'turquesa', b: 'folha', d: 'branco', v: { cabelo: 'coque', chapeu: 'touca', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'curta', baixo: 'saia', rBaixo: R_A, rBarra: R_D, sobre: 'avental', rSobre: R_D, rSobreFaixa: R_B, pes: 'sapato', rPes: R_D } }),
  // vendedor da Venda: avental verde, viseira e bigode
  pessoa({ id: 'npc-vendedor', pele: 'oliva', cabelo: 'castanhoEscuro', a: 'cru', b: 'terra', d: 'folha', v: { cabelo: 'curto', barba: 'bigode', chapeu: 'viseira', rChapeu: R_D, manga: 'curta', sobre: 'avental', rSobre: R_D, rSobreFaixa: R_A, pes: 'sapato', rPes: R_B } }),
  pessoa({ id: 'npc-marinheiro', pele: 'morena', cabelo: 'preto', a: 'branco', b: 'noite', d: 'urucum', v: { cabelo: 'curto', barba: 'barba', chapeu: 'marinheiro', rChapeu: R_A, rChapeuFaixa: R_B, manga: 'curta', listra: R_B, pes: 'sapato', rPes: R_B, pescoco: 'lenco', rPescoco: R_D } }),
  pessoa({ id: 'npc-maquinista', pele: 'clara', cabelo: 'grisalho', a: 'cru', b: 'jeans', d: 'urucum', v: { cabelo: 'curto', barba: 'bigode', chapeu: 'quepe', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'longa', sobre: 'macacao', rSobre: R_B, rSobreFaixa: R_D, pes: 'bota', rPes: R_B, pescoco: 'lenco', rPescoco: R_D } }),
];
