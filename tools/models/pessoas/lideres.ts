/** Os 16 líderes de ginásio (spec 5), na ordem das insígnias. */
import { pessoa } from './kit/pessoa';
import { R_A, R_B, R_D, R_CAB, R_PELE, TONS } from './kit/paletas';
import type { PixModel } from '../../render/types';

const L = { batalha: true, retrato: true } as const;

export const lideres: PixModel[] = [
  // 1 Pena · Mestre Gaivota, velho pescador de pipa
  pessoa({ id: 'lider-01', pele: 'morena', cabelo: 'branco', a: 'ceu', b: 'cru', d: 'coral', iris: '#3a6a8a', ...L, zoomBatalha: 0.82,
    v: { porte: 'idoso', cabelo: 'calvo', barba: 'barba', chapeu: 'pescador', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'curta', baixo: 'short', pes: 'descalco', pescoco: 'lenco', rPescoco: R_D, prop: 'pipa', rProp: R_D, rPropFaixa: R_B, propBraco: 25 } }),
  // 2 Casulo · Lia Teia, bióloga de copa (capacete de escalada, arnês e puçá)
  pessoa({ id: 'lider-02', pele: 'oliva', cabelo: 'castanho', a: 'folha', b: 'caqui', d: 'laranja', iris: '#4a7a2a', ...L, zoomBatalha: 0.9,
    v: { cabelo: 'chanel', chapeu: 'capacete', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'curta', baixo: 'short', pes: 'bota', rPes: R_B, cinto: R_D, sobre: 'faixa-peito', rSobre: R_D, rSobreFaixa: R_B, oculos: R_D, costas: 'rede', rCostas: R_B, prop: 'puca', rProp: R_B, rPropFaixa: R_B } }),
  // 3 Concha · Marujo Netuno Silva, ex-campeão de remo
  pessoa({ id: 'lider-03', pele: 'castanha', cabelo: 'preto', a: 'branco', b: 'mar', d: 'ouro', iris: '#2a4a7a', ...L, zoomBatalha: 0.9,
    v: { porte: 'forte', cabelo: 'raspado', barba: 'costeleta', sobrancelha: 'grossa', chapeu: 'marinheiro', rChapeu: R_A, rChapeuFaixa: R_B, manga: 'sem', listra: R_B, baixo: 'short', pes: 'sandalia', rPes: R_B, pescoco: 'colar', rPescoco: R_B, rPescocoFaixa: R_D, prop: 'remo', rProp: R_D, rPropFaixa: R_B } }),
  // 4 Folha · Dona Buriti, raizeira
  pessoa({ id: 'lider-04', pele: 'retinta', cabelo: 'branco', a: 'musgo', b: 'urucum', d: 'palha', iris: '#3a5a2a', ...L,
    v: { porte: 'idoso', cabelo: 'coque', chapeu: 'turbante', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'curta', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_D, sobre: 'xale', rSobre: R_B, rSobreFaixa: R_D, pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, brinco: R_D, pes: 'sandalia', rPes: R_D, prop: 'cesta', rProp: R_D, rPropFaixa: R_A } }),
  // 5 Barro · Boiadeira Zefa, peoa pantaneira
  pessoa({ id: 'lider-05', pele: 'canela', cabelo: 'azeviche', a: 'pitanga', b: 'jeans', d: 'couroClaro', iris: '#5a3a1a', ...L,
    v: { cabelo: 'trancas', laco: R_A, chapeu: 'pantaneiro', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', pes: 'bota', rPes: R_D, cinto: R_D, pescoco: 'lenco', rPescoco: R_D, prop: 'laco', rProp: R_D } }),
  // 6 Estrela · Iracema Lua, rendeira
  pessoa({ id: 'lider-06', pele: 'morena', cabelo: 'azeviche', a: 'renda', b: 'lilas', d: 'ipe', iris: '#6a4a9a', ...L,
    v: { cabelo: 'longo', chapeu: 'flor', rChapeu: R_A, rChapeuFaixa: R_D, manga: 'curta', baixo: 'saia-longa', rBarra: R_A, sobre: 'xale', rSobre: R_A, rSobreFaixa: R_B, brinco: R_D, pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, pes: 'sandalia', rPes: R_D, prop: 'bilro', rProp: R_B, rPropFaixa: R_A } }),
  // 7 Raio · Faroleiro Volta, inventor (capa amarela de faroleiro, óculos de solda na testa)
  pessoa({ id: 'lider-07', pele: 'clara', cabelo: 'grisalho', a: 'ipe', b: 'noite', d: 'latao', iris: '#2a6a9a', ...L,
    v: { porte: 'magro', cabelo: 'espetado', barba: 'cavanhaque', chapeu: 'goggles', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'longa', listra: R_B, pes: 'bota', rPes: R_B, cinto: R_D, luvas: R_B, sobre: 'macacao', rSobre: R_B, rSobreFaixa: R_D, prop: 'chave', rProp: R_D } }),
  // 8 Lamparina · Dona Benta Sombra, contadora de causos
  pessoa({ id: 'lider-08', pele: 'castanha', cabelo: 'grisalho', a: 'jabuticaba', b: 'vinho', d: 'laranja', iris: '#5a2a6a', ...L,
    v: { porte: 'idoso', cabelo: 'coque', manga: 'longa', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_B, sobre: 'xale', rSobre: R_B, rSobreFaixa: R_A, oculos: R_D, brinco: R_D, pes: 'sapato', rPes: R_B, prop: 'lamparina', rProp: R_B, rPropFaixa: R_D, propNoMapa: true, propBraco: 55 } }),
  // 9 Cristal · Garimpeiro Topázio
  pessoa({ id: 'lider-09', pele: 'oliva', cabelo: 'castanhoEscuro', a: 'terra', b: 'jeans', d: 'ipe', iris: '#b88a1a', ...L, zoomBatalha: 0.92,
    v: { cabelo: 'curto', barba: 'barba', sobrancelha: 'grossa', chapeu: 'capacete', rChapeu: R_D, rChapeuFaixa: R_D, manga: 'curta', sobre: 'macacao', rSobre: R_B, rSobreFaixa: R_D, pes: 'bota', rPes: R_A, luvas: R_A, prop: 'picareta', rProp: R_A, rPropFaixa: R_B } }),
  // 10 Chama · Ferreira Labareda
  pessoa({ id: 'lider-10', pele: 'castanha', cabelo: TONS.laranja, a: 'cinza', b: 'carvao', d: 'couro', iris: '#c84a1a', ...L,
    v: { porte: 'forte', cabelo: 'rabo-alto', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_A, manga: 'sem', sobre: 'avental', rSobre: R_D, rSobreFaixa: R_A, pes: 'bota', rPes: R_D, luvas: R_D, prop: 'martelo', rProp: R_D, rPropFaixa: R_A } }),
  // 11 Berimbau · Mestre Gingado, capoeirista
  pessoa({ id: 'lider-11', pele: 'retinta', cabelo: 'preto', a: 'branco', b: 'palha', d: 'urucum', iris: '#2a1a1a', ...L, zoomBatalha: 0.9,
    v: { cabelo: 'black', barba: 'cavanhaque', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', rTorso: R_PELE, rBaixo: R_A, cinto: R_D, pes: 'descalco', pescoco: 'colar', rPescoco: R_B, rPescocoFaixa: R_D, prop: 'berimbau', rProp: R_B, rPropFaixa: R_B, propBraco: 35 } }),
  // 12 Engrenagem · Engenheira Bigorna
  pessoa({ id: 'lider-12', pele: 'castanha', cabelo: 'azeviche', a: 'cinza', b: 'anil', d: 'ipe', iris: '#3a3a8a', ...L,
    v: { cabelo: 'coque', chapeu: 'capacete', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'curta', sobre: 'macacao', rSobre: R_B, rSobreFaixa: R_D, pes: 'bota', rPes: R_A, luvas: R_D, oculos: R_A, cinto: R_D, prop: 'chave', rProp: R_A } }),
  // 13 Espinho · Doutor Peçonha, herpetólogo
  pessoa({ id: 'lider-13', pele: 'clara', cabelo: 'azeviche', a: 'orquidea', b: 'musgo', d: 'branco', iris: '#7a2a8a', ...L, zoomBatalha: 0.9,
    v: { porte: 'magro', cabelo: 'topete', barba: 'cavanhaque', sobre: 'jaleco', rSobre: R_D, rSobreFaixa: R_A, oculos: R_B, luvas: R_A, pes: 'bota', rPes: R_B, prop: 'gancho', rProp: R_B, rPropFaixa: R_A } }),
  // 14 Floco · Gaúcha Pinhão (pala, bombacha, lenço e boina)
  pessoa({ id: 'lider-14', pele: 'rosada', cabelo: 'mel', a: 'petroleo', b: 'terra', d: 'urucum', iris: '#2a6a7a', ...L,
    v: { cabelo: 'tranca', laco: R_D, chapeu: 'boina', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', rTorso: R_A, baixo: 'bombacha', pes: 'bota', rPes: R_B, sobre: 'pala', rSobre: R_A, rSobreFaixa: R_D, pescoco: 'lenco', rPescoco: R_D, prop: 'chimarrao', rProp: R_B, rPropFaixa: R_D, propBraco: 60 } }),
  // 15 Olho · Astrônoma Jaci
  pessoa({ id: 'lider-15', pele: 'morena', cabelo: 'preto', a: 'noite', b: 'lilas', d: 'ipe', iris: '#8a6ad2', ...L,
    v: { cabelo: 'longo', chapeu: 'tiara', rChapeu: R_D, manga: 'longa', baixo: 'saia-longa', rBaixo: R_A, rBarra: R_D, sobre: 'capa', rSobre: R_B, rSobreFaixa: R_D, brinco: R_D, pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, pes: 'sapato', rPes: R_B, prop: 'luneta', rProp: R_D, rPropFaixa: R_B, propBraco: 50 } }),
  // 16 Escama · Pajé Trovão-Velho
  pessoa({ id: 'lider-16', pele: 'canela', cabelo: 'branco', a: 'urucum', b: 'palha', d: 'turquesa', iris: '#1a7a7a', ...L,
    v: { porte: 'idoso', cabelo: 'longo', sobrancelha: 'grossa', chapeu: 'cocar-grande', rChapeu: R_A, rChapeuFaixa: R_D, manga: 'sem', rTorso: R_PELE, baixo: 'saia', rBaixo: R_B, rBarra: R_A, pes: 'descalco', pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_A, sobre: 'faixa-peito', rSobre: R_A, rSobreFaixa: R_D, prop: 'cajado', rProp: R_B, rPropFaixa: R_D, propNoMapa: true, propBraco: 40 } }),
];
void R_CAB;
