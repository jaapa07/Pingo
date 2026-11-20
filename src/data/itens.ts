/**
 * ITENS — todos autorais (spec 4.4, 7 e 8). Dono: time de batalha.
 * `ItemInfo` = `ItemDef` + `uso` (o que o item faz; lido pelo motor de batalha e pelas telas de Mochila/Equipe).
 */
import type { ItemDef, Bolso, StatusId, TipoId, AmuletoId } from '../core/tipos';

export interface UsoItem {
  /** recupera vida: pontos ou 'total' */
  cura?: number | 'total';
  /** cura estes status ('todos' inclui confusão) */
  curaStatus?: StatusId[] | 'todos';
  /** reanima criatura desmaiada com esta % da vida */
  reanima?: number;
  /** restaura PG de um golpe (ou de todos, se `pgTodos`) */
  pg?: number; pgTodos?: boolean;
  /** cuia de captura */
  cuia?: { bonus: number; contraTipos?: TipoId[]; bonusTipos?: number; noite?: number; primeiroTurno?: number; amizade?: boolean; garantida?: boolean };
  /** pedra/objeto de evolução (usado fora de batalha) */
  evolui?: boolean;
  /** Pergaminho de Técnica: id do golpe ensinado (reutilizável) */
  golpe?: string;
  /** passos de repelente */
  repelente?: number;
  /** sobe um nível */
  nivel?: number;
  /** aumenta a amizade */
  amizade?: number;
  /** Amuleto de Campo correspondente */
  amuleto?: AmuletoId;
  /** vara de pesca: método de encontro */
  pesca?: 'pesca-velha' | 'pesca-boa' | 'pesca-mestra';
  /** pode ser usado durante a batalha */
  emBatalha?: boolean;
  /** fruto: a criatura que o segura come sozinha em batalha quando precisa */
  segurar?: boolean;
}
export interface ItemInfo extends ItemDef { uso?: UsoItem }

const i = (id: string, nome: string, bolso: Bolso, preco: number, desc: string, uso?: UsoItem): ItemInfo => ({ id, nome, bolso, preco, desc, icone: id.startsWith('pt-') ? 'pergaminho' : id, ...(uso ? { uso } : {}) });
const B = true;

/** Pergaminhos de Técnica: pt-01 … pt-50 → id do golpe */
export const PERGAMINHOS: Record<string, string> = {
  'pt-01': 'atropelo', 'pt-02': 'estrondo', 'pt-03': 'soneca', 'pt-04': 'fincar-pe', 'pt-05': 'grito-de-guerra',
  'pt-06': 'toca-e-foge', 'pt-07': 'abraco-de-sumauma', 'pt-08': 'raio-da-clareira', 'pt-09': 'tapete-de-espinhos', 'pt-10': 'labareda',
  'pt-11': 'fogo-de-coivara', 'pt-12': 'sol-a-pino', 'pt-13': 'lume-errante', 'pt-14': 'enxurrada', 'pt-15': 'pororoca',
  'pt-16': 'chuva-de-verao', 'pt-17': 'relampago', 'pt-18': 'trovoada', 'pt-19': 'choque-de-poraque', 'pt-20': 'vento-minuano',
  'pt-21': 'friagem', 'pt-22': 'garoa-gelada', 'pt-23': 'armada', 'pt-24': 'martelo', 'pt-25': 'toque-de-berimbau',
  'pt-26': 'borra-de-timbo', 'pt-27': 'leite-de-cururu', 'pt-28': 'tremor-de-terra', 'pt-29': 'toca-de-tatu', 'pt-30': 'poeirao',
  'pt-31': 'rasante', 'pt-32': 'revoada', 'pt-33': 'vento-a-favor', 'pt-34': 'forca-do-pensamento', 'pt-35': 'matutar',
  'pt-36': 'muro-invisivel', 'pt-37': 'cortina-de-brilho', 'pt-38': 'enxame', 'pt-39': 'voo-de-mamangava', 'pt-40': 'deslizamento',
  'pt-41': 'lasca-afiada', 'pt-42': 'bola-de-breu', 'pt-43': 'nevoeiro', 'pt-44': 'sumico', 'pt-45': 'pulso-das-eras',
  'pt-46': 'garra-ancestral', 'pt-47': 'bigornada', 'pt-48': 'reflexo-de-lata', 'pt-49': 'clarao-da-lua', 'pt-50': 'canto-do-uirapuru',
};
/** nomes dos golpes dos pergaminhos (para o nome do item sem importar golpes.ts aqui) */
const NOME_PT: Record<string, string> = {
  atropelo: 'Atropelo', estrondo: 'Estrondo', soneca: 'Soneca', 'fincar-pe': 'Fincar Pé', 'grito-de-guerra': 'Grito de Guerra', 'toca-e-foge': 'Toca e Foge',
  'abraco-de-sumauma': 'Abraço de Sumaúma', 'raio-da-clareira': 'Raio da Clareira', 'tapete-de-espinhos': 'Tapete de Espinhos', labareda: 'Labareda',
  'fogo-de-coivara': 'Fogo de Coivara', 'sol-a-pino': 'Sol a Pino', 'lume-errante': 'Lume Errante', enxurrada: 'Enxurrada', pororoca: 'Pororoca',
  'chuva-de-verao': 'Chuva de Verão', relampago: 'Relâmpago', trovoada: 'Trovoada', 'choque-de-poraque': 'Choque de Poraquê', 'vento-minuano': 'Vento Minuano',
  friagem: 'Friagem', 'garoa-gelada': 'Garoa Gelada', armada: 'Armada', martelo: 'Martelo', 'toque-de-berimbau': 'Toque de Berimbau',
  'borra-de-timbo': 'Borra de Timbó', 'leite-de-cururu': 'Leite de Cururu', 'tremor-de-terra': 'Tremor de Terra', 'toca-de-tatu': 'Toca de Tatu', poeirao: 'Poeirão',
  rasante: 'Rasante', revoada: 'Revoada', 'vento-a-favor': 'Vento a Favor', 'forca-do-pensamento': 'Força do Pensamento', matutar: 'Matutar',
  'muro-invisivel': 'Muro Invisível', 'cortina-de-brilho': 'Cortina de Brilho', enxame: 'Enxame', 'voo-de-mamangava': 'Voo de Mamangava', deslizamento: 'Deslizamento',
  'lasca-afiada': 'Lasca Afiada', 'bola-de-breu': 'Bola de Breu', nevoeiro: 'Nevoeiro', sumico: 'Sumiço', 'pulso-das-eras': 'Pulso das Eras',
  'garra-ancestral': 'Garra Ancestral', bigornada: 'Bigornada', 'reflexo-de-lata': 'Reflexo de Lata', 'clarao-da-lua': 'Clarão da Lua', 'canto-do-uirapuru': 'Canto do Uirapuru',
};

export const ITENS: ItemInfo[] = [
  /* ------------------------------ Cuias de Captura (8) ------------------------------ */
  i('cuia', 'Cuia', 'cuias', 200, 'Cuia de cabaça entalhada, com trançado de palha. Firma parceria com criaturas selvagens.', { cuia: { bonus: 1 }, emBatalha: B }),
  i('cuia-trancada', 'Cuia Trançada', 'cuias', 600, 'Trançado reforçado de buriti. Segura melhor que a Cuia comum.', { cuia: { bonus: 1.5 }, emBatalha: B }),
  i('cuia-ouro', 'Cuia de Ouro', 'cuias', 1200, 'Banhada em ouro de aluvião. Ótima chance de captura.', { cuia: { bonus: 2 }, emBatalha: B }),
  i('cuia-rede', 'Cuia de Rede', 'cuias', 1000, 'Forrada com rede de pesca. Excelente contra criaturas de Rio e Inseto.', { cuia: { bonus: 1, contraTipos: ['rio', 'inseto'], bonusTipos: 3 }, emBatalha: B }),
  i('cuia-noturna', 'Cuia Noturna', 'cuias', 1000, 'Pintada com jenipapo. Excelente durante a noite.', { cuia: { bonus: 1, noite: 3 }, emBatalha: B }),
  i('cuia-rapida', 'Cuia Rápida', 'cuias', 1000, 'Leve como pena. Excelente se arremessada logo no primeiro turno.', { cuia: { bonus: 1, primeiroTurno: 4 }, emBatalha: B }),
  i('cuia-mel', 'Cuia de Mel', 'cuias', 1000, 'Untada com mel de jataí. A criatura capturada já chega amiga e se apega mais depressa.', { cuia: { bonus: 1, amizade: true }, emBatalha: B }),
  i('cuia-guardia', 'Cuia Guardiã', 'cuias', 0, 'Obra dos antigos Guardiões. Nunca falha. Só existe uma.', { cuia: { bonus: 255, garantida: true }, emBatalha: B }),

  /* ------------------------------ Remédios ------------------------------ */
  i('cha-cidreira', 'Chá de Erva-Cidreira', 'remedios', 300, 'Chazinho morno. Recupera 20 de vida.', { cura: 20, emBatalha: B }),
  i('garrafada', 'Garrafada', 'remedios', 700, 'Mistura de raízes da feira. Recupera 50 de vida.', { cura: 50, emBatalha: B }),
  i('elixir-andiroba', 'Elixir de Andiroba', 'remedios', 2500, 'Óleo raro da floresta. Recupera toda a vida.', { cura: 'total', emBatalha: B }),
  i('mel-puro', 'Mel Puro', 'remedios', 200, 'Cura envenenamento, sono e encantamento.', { curaStatus: ['envenenado', 'dormindo', 'encantado'], emBatalha: B }),
  i('unguento', 'Unguento', 'remedios', 250, 'Pasta de ervas. Cura queimadura, congelamento e paralisia.', { curaStatus: ['queimado', 'congelado', 'paralisado'], emBatalha: B }),
  i('pomada-copaiba', 'Pomada de Copaíba', 'remedios', 600, 'Cura qualquer status e também a confusão.', { curaStatus: 'todos', emBatalha: B }),
  i('cha-guarana', 'Chá de Guaraná', 'remedios', 1500, 'Forte de acordar qualquer um: reanima uma criatura desmaiada com metade da vida.', { reanima: 50, emBatalha: B }),
  i('garapa', 'Garapa', 'remedios', 1200, 'Caldo de cana gelado. Restaura 10 PG de um golpe.', { pg: 10, emBatalha: B }),
  i('garapa-com-limao', 'Garapa com Limão', 'remedios', 0, 'Restaura todos os PG de todos os golpes.', { pg: 99, pgTodos: true, emBatalha: B }),
  i('rapadura', 'Rapadura', 'remedios', 4800, 'Doce de dar sustança: a criatura sobe um nível.', { nivel: 1 }),

  /* ------------------------------ Itens ------------------------------ */
  i('fumaca-andiroba', 'Fumaça de Andiroba', 'itens', 350, 'Repelente: por 100 passos, criaturas mais fracas que a primeira da equipe não aparecem.', { repelente: 100 }),
  i('fumaca-andiroba-forte', 'Fumaça de Andiroba Forte', 'itens', 700, 'Repelente caprichado: dura 250 passos.', { repelente: 250 }),
  i('corda-de-cipo', 'Corda de Cipó', 'itens', 550, 'Leva de volta à entrada de cavernas e matas fechadas.'),
  i('pedra-solar', 'Pedra Solar', 'itens', 2100, 'Pedra morna que guarda a luz do meio-dia. Faz certas criaturas evoluírem.', { evolui: B }),
  i('pedra-mare', 'Pedra Maré', 'itens', 2100, 'Pedra lisa que pulsa com as marés. Faz certas criaturas evoluírem.', { evolui: B }),
  i('pedra-lunar', 'Pedra Lunar', 'itens', 2100, 'Pedra pálida que brilha no escuro. Faz certas criaturas evoluírem.', { evolui: B }),
  i('folha-ancestral', 'Folha Ancestral', 'itens', 2100, 'Folha de uma árvore mais velha que as cidades. Faz certas criaturas evoluírem.', { evolui: B }),
  i('engrenagem-velha', 'Engrenagem Velha', 'itens', 2100, 'Peça da antiga ferrovia. Faz certas criaturas evoluírem.', { evolui: B }),
  i('pepita', 'Pepita', 'itens', 5000, 'Ouro de garimpo. Vale um bom dinheiro na Venda.'),
  i('pena-colorida', 'Pena Colorida', 'itens', 800, 'Pena bonita achada no chão. Colecionadores pagam bem.'),
  i('concha-rara', 'Concha Rara', 'itens', 1500, 'Concha de brilho furta-cor. Vende-se bem nas feiras.'),
  i('biscoito-de-polvilho', 'Biscoito de Polvilho', 'itens', 400, 'Petisco crocante. A criatura fica mais amiga.', { amizade: 10 }),

  /* ------------------------------ Frutos (plantáveis em canteiros) ------------------------------ */
  i('caju', 'Caju', 'frutos', 60, 'Suculento. Recupera 10 de vida. Quem segura come sozinha quando a vida cai à metade.', { cura: 10, emBatalha: B, segurar: B }),
  i('pitanga', 'Pitanga', 'frutos', 80, 'Azedinha e fresca. Cura queimadura.', { curaStatus: ['queimado'], emBatalha: B, segurar: B }),
  i('jabuticaba', 'Jabuticaba', 'frutos', 80, 'Docinha, direto do tronco. Cura envenenamento.', { curaStatus: ['envenenado'], emBatalha: B, segurar: B }),
  i('cupuacu', 'Cupuaçu', 'frutos', 80, 'Cheiro forte de acordar a vizinhança. Cura o sono.', { curaStatus: ['dormindo'], emBatalha: B, segurar: B }),
  i('pequi', 'Pequi', 'frutos', 80, 'Cuidado com os espinhos! Cura paralisia.', { curaStatus: ['paralisado'], emBatalha: B, segurar: B }),
  i('buriti', 'Buriti', 'frutos', 80, 'Fruto quente do cerrado. Cura congelamento.', { curaStatus: ['congelado'], emBatalha: B, segurar: B }),
  i('acerola', 'Acerola', 'frutos', 80, 'Vitamina pura. Cura o encantamento.', { curaStatus: ['encantado'], emBatalha: B, segurar: B }),
  i('acai', 'Açaí', 'frutos', 150, 'Energia da floresta. Restaura 10 PG de um golpe.', { pg: 10, emBatalha: B, segurar: B }),

  /* ------------------------------ Itens-chave ------------------------------ */
  i('radio-cipo', 'Rádio Cipó', 'chave', 0, 'Rádio e telefone de bolso: contatos, programas e o relógio.'),
  i('diario-de-campo', 'Diário de Campo', 'chave', 0, 'Caderno da Profª Ipê para registrar as criaturas de Pindorama.'),
  i('bike-bambu', 'Bicicleta de Bambu', 'chave', 0, 'Leve e resistente. Anda bem mais rápido que a pé.'),
  i('vara-velha', 'Vara Velha', 'chave', 0, 'Vara de bambu remendada. Pesca o que dá.', { pesca: 'pesca-velha' }),
  i('vara-boa', 'Vara Boa', 'chave', 0, 'Vara firme, de bom anzol. Pesca criaturas melhores.', { pesca: 'pesca-boa' }),
  i('vara-mestra', 'Vara Mestra', 'chave', 0, 'A vara dos velhos pescadores. Pesca as raras.', { pesca: 'pesca-mestra' }),
  i('passe-trem', 'Passe do Trem', 'chave', 0, 'Passe da Maria-Fumaça que liga a Costa do Sol ao Sertão das Névoas.'),
  i('bilhete-saveiro', 'Bilhete do Saveiro', 'chave', 0, 'Bilhete permanente do Saveiro que cruza a baía.'),
  i('ovo-pintado', 'Ovo Pintado', 'chave', 0, 'Ovo morno de casca pintadinha que a Profª Ipê mandou levar ao Seu Aroeira.'),
  i('carta-do-dudu', 'Carta do Dudu', 'chave', 0, 'Carta do Dudu, de Vila Jacarandá, para o pai marinheiro em Porto Sereia.'),
  i('resposta-do-barto', 'Resposta do Bartô', 'chave', 0, 'Resposta do Marinheiro Bartô para o filho Dudu, em Vila Jacarandá.'),
  i('chapeu-da-vo-zica', 'Chapéu da Vó Zica', 'chave', 0, 'Chapéu de palha da Vó Zica, que o vento levou até o píer.'),
  i('camera-de-bolso', 'Câmera de Bolso', 'chave', 0, 'Tira fotos de qualquer cena. As melhores vão para o álbum.'),
  i('regador', 'Regador', 'chave', 0, 'Para cuidar dos canteiros de frutos.'),
  i('chocalho-mutirao', 'Chocalho do Mutirão', 'chave', 0, 'Invento do Faroleiro Volta. Quem fica na reserva, 2 níveis ou mais atrás da mais forte da equipe, ganha metade da experiência da luta.'),
  i('estojo-de-insignias', 'Estojo de Insígnias', 'chave', 0, 'Guarda as 16 insígnias de Pindorama.'),
  i('amuleto-facao', 'Amuleto do Facão', 'chave', 0, 'Com uma parceira de Mata, Inseto ou Ginga, corta cipós grossos.', { amuleto: 'facao' }),
  i('amuleto-remo', 'Amuleto do Remo', 'chave', 0, 'Com uma parceira de Rio, a canoa cruza as águas.', { amuleto: 'remo' }),
  i('amuleto-forca', 'Amuleto da Força', 'chave', 0, 'Com uma parceira de Terra, Pedra ou Ginga, empurra pedregulhos.', { amuleto: 'forca' }),
  i('amuleto-lampiao', 'Amuleto do Lampião', 'chave', 0, 'Com uma parceira de Brasa, Trovão ou Encanto, ilumina cavernas e névoa.', { amuleto: 'lampiao' }),
  i('amuleto-quebra-pedra', 'Amuleto Quebra-Pedra', 'chave', 0, 'Com uma parceira de Pedra, Terra, Ferro ou Ginga, quebra rochas rachadas.', { amuleto: 'quebra-pedra' }),
  i('amuleto-escalar', 'Amuleto de Escalar', 'chave', 0, 'Com uma parceira de Ginga, Comum ou Inseto, sobe paredões com trepadeiras.', { amuleto: 'escalar' }),
  i('amuleto-cachoeira', 'Amuleto da Cachoeira', 'chave', 0, 'Com uma parceira de Rio ou Lenda, sobe cascatas.', { amuleto: 'cachoeira' }),
  i('amuleto-mergulho', 'Amuleto do Mergulho', 'chave', 0, 'Com uma parceira de Rio, mergulha nas águas fundas marcadas.', { amuleto: 'mergulho' }),
  i('amuleto-voo', 'Amuleto do Voo', 'chave', 0, 'Com uma parceira de Vento, voa entre as cidades já visitadas.', { amuleto: 'voo' }),
  i('amuleto-faro', 'Amuleto do Faro', 'chave', 0, 'Com uma parceira muito amiga, itens e criaturas ocultas brilham.', { amuleto: 'faro' }),

  /* ------------------------------ Pergaminhos de Técnica (50, reutilizáveis) ------------------------------ */
  ...Object.entries(PERGAMINHOS).map(([id, gid], n) => i(id, `PT${String(n + 1).padStart(2, '0')} ${NOME_PT[gid]}`, 'pergaminhos', 3000, `Pergaminho de Técnica reutilizável. Ensina ${NOME_PT[gid]} a uma criatura compatível.`, { golpe: gid })),
  /* ------------------------------ regras clássicas (spec 10A) ------------------------------ */
  i('cartao-radio', 'Cartão do Rádio', 'chave', 0, 'Prêmio do Quiz do Rádio. Libera os programas extras do Rádio Cipó: Cantiga das Lendas, músicas dos lugares visitados e dicas de captura no Bicho do Dia.'),
];

const mapa = new Map<string, ItemInfo>(ITENS.map((x) => [x.id, x]));
/** Busca um item pelo id (erro se não existir). */
export function item(id: string): ItemInfo { const x = mapa.get(id); if (!x) throw new Error('item desconhecido: ' + id); return x; }
export const temItemDef = (id: string) => mapa.has(id);
export const ehCuia = (id: string) => !!mapa.get(id)?.uso?.cuia;

/* ------------------------------ Missões dos Visitantes (spec 6.5; src/data/eventos/visitantes.ts) ------------------------------ */
for (const x of [
  i('frasco-vazio', 'Frasco Vazio', 'chave', 0, 'Frasco de vidro grosso com rolha de cortiça, do canoeiro Seu Tarumã. Serve para colher água de rio.'),
  i('frasco-agua-escura', 'Frasco de Água Escura', 'chave', 0, 'Água preta como café, colhida de noite no fundo do Poço do Breu, no Rio Cachoeira-Véu.'),
  i('frasco-agua-barrenta', 'Frasco de Água Barrenta', 'chave', 0, 'Água cor de barro, colhida de dia no poço da cascata da Estrada Vermelha.'),
  i('lanterna-boreal', 'Lanterna Boreal', 'chave', 0, 'Lanterna de vidro verde da expedição da Drª Solveig. Juntas e acesas no alto do Pico, de noite, chamam o céu do norte.'),
]) { ITENS.push(x); mapa.set(x.id, x); }
