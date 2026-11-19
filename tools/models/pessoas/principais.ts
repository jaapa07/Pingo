/** Personagens principais: jogadores, família, rival, mentores e o Cartel Ferrugem. */
import { pessoa } from './kit/pessoa';
import { R_A, R_B, R_D, R_CAB, R_PELE, TONS } from './kit/paletas';
import type { PixModel } from '../../render/types';

export const principais: PixModel[] = [
  // Kauê: menino caiçara, camiseta ouro com faixa, bermuda petróleo, cesto de palha nas costas
  pessoa({ id: 'kaue', pele: 'morena', cabelo: 'preto', a: 'ouro', b: 'petroleo', d: 'palha', iris: '#6a4426', jogador: true, batalha: true, retrato: true,
    v: { porte: 'crianca', cabelo: 'crespo', chapeu: 'faixa', rChapeu: R_B, manga: 'curta', listra: R_B, baixo: 'short', pes: 'sandalia', rPes: R_D, costas: 'cesto', rCostas: R_D, rCostasFaixa: R_B } }),
  // Ayra: trança comprida com laço, regata urucum, saia verde-mata, bolsa de palha a tiracolo e flor no cabelo
  pessoa({ id: 'ayra', pele: 'canela', cabelo: 'azeviche', a: 'coral', b: 'mata', d: 'palha', iris: '#3a5a2a', jogador: true, batalha: true, retrato: true,
    v: { porte: 'crianca', cabelo: 'tranca', laco: R_A, chapeu: 'flor', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'sem', baixo: 'saia', rBarra: R_D, pes: 'sandalia', rPes: R_D, costas: 'bolsa', rCostas: R_D, rCostasFaixa: R_D } }),
  // Mãe: vestido turquesa, avental cru de cozinha, coque e brincos
  pessoa({ id: 'mae', pele: 'morena', cabelo: 'preto', a: 'turquesa', b: 'goiaba', d: 'cru', iris: '#5a3a22', retrato: true,
    v: { cabelo: 'coque', laco: R_B, manga: 'curta', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_B, sobre: 'avental', rSobre: R_D, rSobreFaixa: R_B, brinco: R_B, pes: 'sandalia', rPes: R_B } }),
  // Profª Ipê Amarelo: cabelo black com flor de ipê, jaleco branco sobre blusa amarela, óculos
  pessoa({ id: 'prof-ipe', pele: 'castanha', cabelo: 'castanhoEscuro', a: 'ipe', b: 'jabuticaba', d: 'branco', iris: '#3a2a1a', retrato: true,
    v: { cabelo: 'black', chapeu: 'flor', rChapeu: R_A, rChapeuFaixa: R_D, sobre: 'jaleco', rSobre: R_D, rSobreFaixa: R_A, oculos: R_B, brinco: R_A, pes: 'sapato', rPes: R_B } }),
  // Tainá (rival): rabo alto, jaqueta pitanga, short chumbo, lenço limão — sobrancelha de quem não perde
  pessoa({ id: 'taina', pele: 'oliva', cabelo: 'castanhoEscuro', a: 'pitanga', b: 'chumbo', d: 'limao', iris: '#6a8a1a', batalha: true, retrato: true,
    v: { porte: 'crianca', cabelo: 'rabo-alto', laco: R_D, sobrancelha: 'grossa', manga: 'longa', listra: R_D, baixo: 'short', pes: 'bota', rPes: R_B, pescoco: 'lenco', rPescoco: R_D, costas: 'mochila', rCostas: R_B, rCostasFaixa: R_D, luvas: R_B } }),
  // Seu Aroeira: mateiro velho, chapéu de palha, barba branca, colete de couro e cajado
  pessoa({ id: 'seu-aroeira', pele: 'morena', cabelo: 'branco', a: 'cru', b: 'couro', d: 'palha', iris: '#4a3a2a', retrato: true,
    v: { porte: 'idoso', cabelo: 'calvo', barba: 'barba', sobrancelha: 'grossa', chapeu: 'palha', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'longa', sobre: 'colete', rSobre: R_B, pes: 'bota', rPes: R_B, cinto: R_D, prop: 'bengala', rProp: R_B, propNoMapa: true } }),
  // Drª Buriti: pesquisadora do sertão, chapéu de explorador, camisa oliva, binóculo e óculos
  pessoa({ id: 'dra-buriti', pele: 'retinta', cabelo: 'preto', a: 'oliva', b: 'couroClaro', d: 'manteiga', iris: '#2a1a1a', retrato: true,
    v: { cabelo: 'cachos', chapeu: 'explorador', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'curta', pes: 'bota', rPes: R_B, cinto: R_D, pescoco: 'binoculo', rPescoco: R_CAB, rPescocoFaixa: R_B, oculos: R_D, costas: 'saco', rCostas: R_B, rCostasFaixa: R_D } }),
  // Coronel Garrote: chefe do Cartel Ferrugem — quepe, farda ferrugem, ombreiras de latão, capa de carvão, bigodão
  pessoa({ id: 'coronel-garrote', pele: 'clara', cabelo: 'grisalho', a: 'ferrugem', b: 'carvao', d: 'latao', iris: '#7a2a1a', contorno: '#261624', batalha: true, retrato: true,
    v: { porte: 'forte', cabelo: 'curto', barba: 'bigode', sobrancelha: 'grossa', chapeu: 'quepe', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'longa', listra: R_D, pes: 'bota', rPes: R_B, cinto: R_D, sobre: 'ombreiras', rSobre: R_D, rSobreFaixa: R_D, sobre2: 'capa', rSobre2: R_B, rSobre2Faixa: R_D, luvas: R_B, prop: 'chicote', rProp: R_D } }),
  // Tenente Lata: magro, capacete de lata amassado e chave inglesa
  pessoa({ id: 'tenente-lata', pele: 'oliva', cabelo: 'loiro', a: 'ferrugem', b: 'carvao', d: 'prata', iris: '#3a6a8a', batalha: true, retrato: true,
    v: { porte: 'magro', cabelo: 'espetado', chapeu: 'capacete', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', pes: 'bota', rPes: R_B, cinto: R_D, pescoco: 'gola', rPescoco: R_B, luvas: R_D, prop: 'chave', rProp: R_D } }),
  // Tenente Arame: alta, cabelo cor de vinho preso no alto, rolo de arame de cobre
  pessoa({ id: 'tenente-arame', pele: 'clara', cabelo: TONS.vinho, a: 'ferrugem', b: 'carvao', d: 'cobre', iris: '#8a3a5a', batalha: true, retrato: true,
    v: { porte: 'magro', cabelo: 'rabo-alto', laco: R_D, sobrancelha: 'fina', manga: 'longa', pes: 'bota', rPes: R_B, cinto: R_D, pescoco: 'cachecol', rPescoco: R_B, rPescocoFaixa: R_D, brinco: R_D, luvas: R_B, prop: 'laco', rProp: R_D } }),
  // Tenente Rebite: fortão careca de cavanhaque, ombreiras de ferro e marreta
  pessoa({ id: 'tenente-rebite', pele: 'castanha', cabelo: 'preto', a: 'ferrugem', b: 'carvao', d: 'ferro', iris: '#3a2a1a', batalha: true, retrato: true,
    v: { porte: 'forte', cabelo: 'careca', barba: 'cavanhaque', sobrancelha: 'grossa', manga: 'sem', pes: 'bota', rPes: R_B, cinto: R_D, sobre: 'ombreiras', rSobre: R_D, rSobreFaixa: R_D, luvas: R_B, prop: 'martelo', rProp: R_B, rPropFaixa: R_D } }),
  // Capangas do Cartel: boné e lenço cinza, uniforme ferrugem
  pessoa({ id: 'capanga-m', pele: 'canela', cabelo: 'castanhoEscuro', a: 'ferrugem', b: 'carvao', d: 'cinza', batalha: true,
    v: { cabelo: 'curto', chapeu: 'bone', rChapeu: R_B, rChapeuFaixa: R_A, manga: 'curta', pes: 'bota', rPes: R_B, cinto: R_D, pescoco: 'lenco', rPescoco: R_D, luvas: R_B } }),
  pessoa({ id: 'capanga-f', pele: 'clara', cabelo: 'ruivo', a: 'ferrugem', b: 'carvao', d: 'cinza', batalha: true,
    v: { cabelo: 'rabo', chapeu: 'bone', rChapeu: R_B, rChapeuFaixa: R_A, manga: 'curta', baixo: 'short', pes: 'bota', rPes: R_B, cinto: R_D, pescoco: 'lenco', rPescoco: R_D, luvas: R_B } }),
];
void R_PELE;
