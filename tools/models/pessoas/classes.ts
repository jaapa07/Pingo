/** As 16 classes de treinador (spec 9.2). */
import { pessoa } from './kit/pessoa';
import { R_A, R_B, R_D, R_PELE } from './kit/paletas';
import type { PixModel } from '../../render/types';

const T = { batalha: true } as const;

export const classes: PixModel[] = [
  pessoa({ id: 'cl-pescador', pele: 'morena', cabelo: 'castanhoEscuro', a: 'branco', b: 'jeans', d: 'palha', ...T, zoomBatalha: 0.85,
    v: { cabelo: 'curto', barba: 'bigode', chapeu: 'palha', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'sem', baixo: 'short', pes: 'descalco', prop: 'vara', rProp: R_D, rPropFaixa: R_A, propBraco: 30 } }),
  pessoa({ id: 'cl-escoteira', pele: 'clara', cabelo: 'ruivo', a: 'caqui', b: 'musgo', d: 'urucum', ...T,
    v: { porte: 'jovem', cabelo: 'trancas', laco: R_D, chapeu: 'bone', rChapeu: R_B, rChapeuFaixa: R_B, manga: 'curta', baixo: 'short', pes: 'bota', rPes: R_B, cinto: R_B, pescoco: 'lenco', rPescoco: R_D, costas: 'mochila', rCostas: R_B, rCostasFaixa: R_D } }),
  pessoa({ id: 'cl-capoeirista', pele: 'castanha', cabelo: 'preto', a: 'branco', b: 'mata', d: 'limao', ...T,
    v: { porte: 'jovem', cabelo: 'crespo', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', rBaixo: R_A, cinto: R_D, pes: 'descalco', listra: R_B } }),
  pessoa({ id: 'cl-vaqueiro', pele: 'canela', cabelo: 'preto', a: 'couro', b: 'couroClaro', d: 'ouro', ...T,
    v: { cabelo: 'curto', barba: 'bigode', chapeu: 'couro', rChapeu: R_A, rChapeuFaixa: R_D, manga: 'longa', pes: 'bota', rPes: R_A, cinto: R_D, pescoco: 'lenco', rPescoco: R_D, sobre: 'colete', rSobre: R_B, prop: 'chicote', rProp: R_B } }),
  pessoa({ id: 'cl-rendeira', pele: 'morena', cabelo: 'azeviche', a: 'renda', b: 'goiaba', d: 'turquesa', ...T,
    v: { cabelo: 'coque', laco: R_D, chapeu: 'flor', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'curta', baixo: 'saia-longa', rBarra: R_A, brinco: R_D, pes: 'sandalia', rPes: R_D, prop: 'bilro', rProp: R_D, rPropFaixa: R_A } }),
  pessoa({ id: 'cl-surfista', pele: 'oliva', cabelo: 'loiro', a: 'laranja', b: 'turquesa', d: 'manteiga', ...T, zoomBatalha: 0.82,
    v: { porte: 'jovem', cabelo: 'tigela', manga: 'sem', rTorso: R_PELE, baixo: 'short', rBaixo: R_A, pes: 'descalco', pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_B, prop: 'prancha', rProp: R_B, rPropFaixa: R_A } }),
  pessoa({ id: 'cl-mateira', pele: 'canela', cabelo: 'preto', a: 'oliva', b: 'terra', d: 'laranja', ...T,
    v: { cabelo: 'rabo', chapeu: 'lenco', rChapeu: R_D, rChapeuFaixa: R_D, manga: 'longa', pes: 'bota', rPes: R_B, cinto: R_B, costas: 'saco', rCostas: R_B, rCostasFaixa: R_D, prop: 'facao', rProp: R_B, rPropFaixa: R_A } }),
  pessoa({ id: 'cl-garimpeiro', pele: 'clara', cabelo: 'castanho', a: 'barro', b: 'jeans', d: 'ferro', ...T,
    v: { cabelo: 'curto', barba: 'barba', chapeu: 'pescador', rChapeu: R_A, rChapeuFaixa: R_B, manga: 'curta', sobre: 'jardineira', rSobre: R_B, rSobreFaixa: R_D, pes: 'bota', rPes: R_A, prop: 'bateia', rProp: R_D, rPropFaixa: R_A, propBraco: 40 } }),
  pessoa({ id: 'cl-observadora', pele: 'rosada', cabelo: 'grisalho', a: 'ceu', b: 'caqui', d: 'cru', ...T,
    v: { cabelo: 'chanel', chapeu: 'aba-larga', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'curta', baixo: 'short', sobre: 'colete', rSobre: R_B, pes: 'bota', rPes: R_B, pescoco: 'binoculo', rPescoco: R_B, rPescocoFaixa: R_B, oculos: R_B } }),
  pessoa({ id: 'cl-biologa', pele: 'retinta', cabelo: 'preto', a: 'folha', b: 'jeans', d: 'branco', ...T,
    v: { porte: 'jovem', cabelo: 'cachos', sobre: 'jaleco', rSobre: R_D, rSobreFaixa: R_A, oculos: R_D, pes: 'sapato', rPes: R_B, prop: 'prancheta', rProp: R_B, rPropFaixa: R_D, propBraco: 45 } }),
  pessoa({ id: 'cl-repentista', pele: 'morena', cabelo: 'preto', a: 'urucum', b: 'cru', d: 'couroClaro', ...T,
    v: { cabelo: 'curto', barba: 'bigode', chapeu: 'couro', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', listra: R_B, pes: 'sandalia', rPes: R_D, cinto: R_D, prop: 'viola', rProp: R_D, rPropFaixa: R_D, propBraco: 50 } }),
  pessoa({ id: 'cl-mergulhador', pele: 'canela', cabelo: 'preto', a: 'petroleo', b: 'ceu', d: 'ipe', ...T,
    v: { cabelo: 'raspado', chapeu: 'goggles', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'longa', rBaixo: R_A, listra: R_D, pes: 'sapato', rPes: R_D, luvas: R_A, costas: 'cilindro', rCostas: R_D, rCostasFaixa: R_B, prop: 'arpao', rProp: R_B, rPropFaixa: R_B } }),
  pessoa({ id: 'cl-ferreiro', pele: 'oliva', cabelo: 'preto', a: 'cinza', b: 'carvao', d: 'couro', ...T,
    v: { porte: 'forte', cabelo: 'careca', barba: 'barba', sobrancelha: 'grossa', manga: 'sem', sobre: 'avental', rSobre: R_D, rSobreFaixa: R_B, pes: 'bota', rPes: R_D, luvas: R_D, prop: 'martelo', rProp: R_D, rPropFaixa: R_A } }),
  pessoa({ id: 'cl-montanhista', pele: 'clara', cabelo: 'castanho', a: 'lilas', b: 'chumbo', d: 'pitanga', ...T,
    v: { cabelo: 'rabo', chapeu: 'gorro', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', pes: 'bota', rPes: R_B, luvas: R_D, pescoco: 'cachecol', rPescoco: R_D, rPescocoFaixa: R_A, costas: 'mochila', rCostas: R_B, rCostasFaixa: R_D, prop: 'corda', rProp: R_D } }),
  pessoa({ id: 'cl-crianca-m', pele: 'canela', cabelo: 'castanho', a: 'limao', b: 'mar', d: 'laranja', ...T,
    v: { porte: 'crianca', cabelo: 'espetado', manga: 'curta', listra: R_D, baixo: 'short', pes: 'sapato', rPes: R_D } }),
  pessoa({ id: 'cl-crianca-f', pele: 'retinta', cabelo: 'preto', a: 'goiaba', b: 'ipe', d: 'branco', ...T,
    v: { porte: 'crianca', cabelo: 'chiquinhas', laco: R_B, manga: 'curta', baixo: 'saia', rBaixo: R_A, rBarra: R_D, pes: 'sandalia', rPes: R_B, pescoco: 'laco', rPescoco: R_B } }),
];
