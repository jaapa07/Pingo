/** Conselho dos Guardiões (Pico Pindorama). */
import { pessoa } from './kit/pessoa';
import { R_A, R_B, R_D, TONS } from './kit/paletas';
import type { PixModel } from '../../render/types';

const G = { batalha: true, retrato: true } as const;

export const conselho: PixModel[] = [
  // Guardiã do Mar Iara Costa — Rio e Encanto: vestido turquesa, capa azul-mar, pérolas
  pessoa({ id: 'guardia-iara', pele: 'canela', cabelo: TONS.petroleo, a: 'turquesa', b: 'mar', d: 'renda', iris: '#1a8a9a', ...G,
    v: { cabelo: 'ondulado', chapeu: 'tiara', rChapeu: R_D, chapeu2: 'flor', rChapeu2: R_D, rChapeu2Faixa: R_A, manga: 'sem', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_D, sobre: 'capa', rSobre: R_B, rSobreFaixa: R_D, pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, brinco: R_D, pes: 'descalco', prop: 'arpao', rProp: R_D, rPropFaixa: R_D, propNoMapa: true, propBraco: 35 } }),
  // Guardião da Mata Cauã — Mata e Inseto: coroa de folhas, aljava e lança
  pessoa({ id: 'guardiao-caua', pele: 'morena', cabelo: 'azeviche', a: 'mata', b: 'terra', d: 'limao', iris: '#3a7a1a', ...G,
    v: { cabelo: 'rabo', laco: R_D, chapeu: 'coroa-folhas', rChapeu: R_A, rChapeuFaixa: R_D, manga: 'sem', cinto: R_D, pes: 'descalco', sobre: 'faixa-peito', rSobre: R_B, rSobreFaixa: R_D, costas: 'aljava', rCostas: R_B, rCostasFaixa: R_D, pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, prop: 'lanca', rProp: R_B, rPropFaixa: R_D, propNoMapa: true, propBraco: 35 } }),
  // Guardiã do Céu Jandaia — Vento e Trovão: amarelo e laranja de jandaia, penas no cabelo
  pessoa({ id: 'guardia-jandaia', pele: 'retinta', cabelo: 'preto', a: 'ipe', b: 'ceu', d: 'laranja', iris: '#d2821a', ...G,
    v: { porte: 'magro', cabelo: 'black', chapeu: 'pena', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'curta', baixo: 'bombacha', pes: 'sandalia', rPes: R_D, cinto: R_D, sobre: 'capa', rSobre: R_D, rSobreFaixa: R_A, brinco: R_A, luvas: R_B, pescoco: 'cachecol', rPescoco: R_B, rPescocoFaixa: R_D } }),
  // Guardião da Terra Moacir — Terra, Pedra e Ferro: barbão grisalho, ombreiras de ferro, marreta
  pessoa({ id: 'guardiao-moacir', pele: 'castanha', cabelo: 'grisalho', a: 'barro', b: 'chumbo', d: 'ferro', iris: '#7a4a2a', ...G, zoomBatalha: 0.95,
    v: { porte: 'forte', cabelo: 'careca', barba: 'longa', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', pes: 'bota', rPes: R_D, cinto: R_D, sobre: 'ombreiras', rSobre: R_D, rSobreFaixa: R_D, luvas: R_B, prop: 'martelo', rProp: R_B, rPropFaixa: R_D, propNoMapa: true } }),
  // Guardião-Mor Arandu: grande cocar azul e ouro, túnica branca, capa anil, cajado
  pessoa({ id: 'guardiao-arandu', pele: 'morena', cabelo: 'prata', a: 'branco', b: 'anil', d: 'ouro', iris: '#b8861a', ...G,
    v: { cabelo: 'longo', barba: 'cavanhaque', sobrancelha: 'grossa', chapeu: 'cocar-grande', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'longa', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_D, cinto: R_D, sobre: 'capa', rSobre: R_B, rSobreFaixa: R_D, sobre2: 'faixa-peito', rSobre2: R_D, rSobre2Faixa: R_B, pes: 'sandalia', rPes: R_D, prop: 'cajado', rProp: R_D, rPropFaixa: R_B, propNoMapa: true, propBraco: 40 } }),
];
