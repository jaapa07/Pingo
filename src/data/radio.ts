/**
 * RÁDIO CIPÓ — conteúdo dos programas: notícias do Cartel Ferrugem (conforme as flags da história), faixas da
 * "Hora da Música", recados da semana e as falas dos contatos ao telefone. As criaturas raras do dia vêm das
 * tabelas de habitat das zonas (src/ui/telas/dados.ts).
 */
import type { Cond } from '../core/tipos';

export interface Noticia { id: string; titulo: string; se?: Cond; texto: string }
/** da mais antiga para a mais nova; o rádio mostra as que valem, a mais recente primeiro */
export const NOTICIAS: Noticia[] = [
  { id: 'abertura', titulo: 'Jaulas na estrada', texto: 'Moradores da Trilha do Ipê viram caminhões cobertos de lona passando de madrugada. Quem souber de algo avise o Posto Guardião mais próximo.' },
  { id: 'ovo', titulo: 'Ovo Pintado em boas mãos', se: 'flag:ovo-entregue', texto: 'O Seu Aroeira confirma: o Ovo Pintado chegou inteiro à Vila Caiçara, levado por uma jovem treinadora de Vila Jacarandá.' },
  { id: 'apagao', titulo: 'Apagão no Porto', se: 'insignia:3&!flag:usina-ok', texto: 'Porto Sereia segue às escuras. A Usina Velha parou e o Trem Serra-Sol não sai da estação. Há gente estranha de macacão cor de ferrugem rondando por lá.' },
  { id: 'usina', titulo: 'A luz voltou!', se: 'flag:usina-ok', texto: 'A Usina Velha voltou a girar. O tenente Lata, do Cartel Ferrugem, fugiu deixando jaulas vazias para trás. O Trem Serra-Sol já apita outra vez.' },
  { id: 'pantanal', titulo: 'Ninhos salvos no Pantanal', se: 'flag:pantanal-ok', texto: 'A Drª Buriti informa que os ninhos do Pantanal Grande estão a salvo. O tenente Arame foi visto correndo de um tuiuiú muito bravo.' },
  { id: 'farol', titulo: 'Farol aceso de novo', se: 'flag:farol-ok', texto: 'A Ilha do Farol voltou a guiar os saveiros. O tenente Rebite deixou o posto às pressas. As criaturas presas foram soltas na baía.' },
  { id: 'mina', titulo: 'Mina libertada', se: 'flag:mina-ok', texto: 'Os garimpeiros da Chapada Rubra retomaram a mina. As criaturas de pedra voltaram às galerias e, dizem, até o eco ficou mais alegre.' },
  { id: 'laboratorio', titulo: 'Laboratório secreto cai', se: 'flag:laboratorio-ok', texto: 'O esconderijo do Cartel no Brejo Roxo foi desmontado. Cuidado nas estradas: algo grande escapou de lá e anda sem rumo pelo sertão.' },
  { id: 'garrote', titulo: 'Coronel Garrote derrotado', se: 'flag:garrote-vencido', texto: 'Acabou! O chefe do Cartel Ferrugem perdeu no alto do Pico Pindorama. O Conselho dos Guardiões decide agora o que fazer com ele.' },
  { id: 'conselho', titulo: 'Pindorama tem nova guardiã', se: 'pos-jogo', texto: 'O Conselho dos Guardiões foi vencido em batalha limpa. Festa nas duas regiões! E a Floresta Ancestral, enfim, abriu suas trilhas.' },
];

/** faixas que o programa de música pode tocar (ids do motor de áudio; as que não existirem ficam de fora) */
export const FAIXAS_RADIO: { id: string; nome: string; se?: Cond }[] = [
  { id: 'vila-jacaranda', nome: 'Vila Jacarandá' }, { id: 'cidade-choro', nome: 'Sobrados da Serra (choro)' }, { id: 'cidade-frevo', nome: 'Ladeiras do Porto (frevo)' },
  { id: 'cidade-samba', nome: 'Roda na Praça (samba)' }, { id: 'venda', nome: 'A Venda (xote)' }, { id: 'agua', nome: 'Remando na Baía' },
  { id: 'trem', nome: 'Trem da Serra', se: 'item:passe-trem' }, { id: 'cidade-catira', nome: 'Varanda do Buriti (catira)', se: 'flag:visitou:B1' },
  { id: 'cidade-maracatu', nome: 'Cortejo de Coral (maracatu)', se: 'flag:visitou:A5' }, { id: 'saveiro', nome: 'Travessia de Saveiro', se: 'item:bilhete-saveiro' },
  { id: 'cidade-baiao', nome: 'Feira da Chapada (baião)', se: 'flag:visitou:B3' }, { id: 'cidade-forro', nome: 'Arraial em Festa (forró)', se: 'flag:visitou:B4' },
  { id: 'cidade-gaucha', nome: 'Galpão da Geada (rancheira)', se: 'flag:visitou:B7' }, { id: 'creditos', nome: 'Até a Próxima Trilha', se: 'pos-jogo' },
];

/** recado do locutor para cada dia da semana (0 = domingo) */
export const RECADOS_SEMANA = [
  'Domingo é dia de descanso: os Postos Guardiões servem café e bolo de fubá para as parceiras.',
  'Segunda-feira: maré baixa de manhã na Praia das Tartarugas. Bom dia para procurar conchas.',
  'Terça-feira: os pescadores juram que a pesca rende mais ao entardecer.',
  'Quarta-feira: vento forte na Serra Fumaça. Segure o chapéu e as criaturas de pena!',
  'Quinta-feira é dia de feira em Porto Sereia: tem banca que só abre hoje.',
  'Sexta-feira: roda de capoeira aberta na Cidade Ginga, ao cair da tarde.',
  'Sábado tem festival! Fogueira, sanfona e prêmios para quem aparecer com a equipe em forma.',
];

/** falas ao telefone. {N} = nome do contato */
export const FALAS_CONTATO = {
  atende: ['Alô, alô! Aqui é {N}. Que bom ouvir você!', 'Opa, {N} na linha! Como vai essa equipe?', '{N} falando. Achei que tinha esquecido de mim!', 'Alô? Ah, é você! {N} às ordens.'],
  conversa: ['Minhas parceiras andam treinando sem parar.', 'Vi um bicho diferente hoje cedo, mas ele fugiu antes de eu chegar perto.', 'Ouviu o Rádio Cipó hoje? Sempre tem dica boa.', 'Não esqueça de dar cafuné na sua equipe, viu?'],
  propoe: 'Que tal uma revanche agora mesmo? Minha equipe está mais forte!',
  lider: 'Uma revanche de líder é coisa séria. Volte a ligar quando a Liga dos Guardiões reconhecer você como Campeão.',
  liderSertao: 'Revanche comigo? Primeiro termine a sua jornada pelo Sertão: vença os dezesseis ginásios. Aí a gente conversa, no Ginásio de Treino.',
  foraDaAgenda: 'Hoje não vai dar, tenho outros compromissos. Revanche comigo é {Q}. Me liga nessa hora!',
  treino: 'Hoje é o meu dia de treino! Às vezes você me encontra {L}, mas revanche de líder é no {G}. Te espero lá ainda hoje, no salão!',
  treinoMarcado: 'Já combinamos: estou te esperando no {G}. Não demora!',
  rival: 'É você, é? Eu sei que você quer revanche. Terça e quinta eu treino {L}. Uma batalha por dia. Não se atrase!',
  rivalAntes: 'Tô ocupada treinando. A gente se esbarra na estrada, como sempre. E da próxima vez eu ganho!',
  venceu: 'Ufa! Você continua em forma. Me liga amanhã para outra!',
  perdeu: 'Viu só como eu treinei? Cuide da equipe e me ligue amanhã.',
};

/** CANTIGA DAS LENDAS — programa do Cartão do Rádio (spec 10A item 31): versos sobre as lendárias e uma dica de onde procurar */
export const CANTIGAS_LENDAS: { titulo: string; dica: string; versos: string }[] = [
  { titulo: 'O Boitatá da Caverna', dica: 'Fala da cobra de fogo que dorme na Caverna Vulcânica do Sertão.', versos: 'Lá no fundo da caverna, onde a pedra é de brasa,\numa cobra feita de fogo vigia a própria casa.\nQuem acorda o Boitatá leva fogo no olhar:\ncom respeito e coragem, ele deixa você passar.' },
  { titulo: 'A Boiúna do Canal', dica: 'Fala da cobra grande do canal da Gruta do Recife, que só acorda para quem chega remando de longe.', versos: 'Rio abaixo, rio acima, a Boiúna vai nadando,\ncom os olhos de lanterna, os barqueiros vai guiando.\nQuem rema com paciência ouve o rio respirar:\né a cobra grande dormindo, esperando o seu lugar.' },
  { titulo: 'Mapinguari, o Guardião', dica: 'Fala do gigante da mata funda, que anda onde a floresta é mais antiga.', versos: 'Tem um grito na mata que faz a onça calar,\né o velho Mapinguari andando devagar.\nNão derruba árvore nova, não maltrata quem é bom:\nsó aparece pra quem sabe escutar o próprio som.' },
  { titulo: 'Queixada-Caipora', dica: 'Fala da guardiã dos bichos que passou a vagar depois que o laboratório do Cartel caiu.', versos: 'Montada no queixada, a Caipora vem ligeira,\npega o caçador sem dó e solta a bicharada inteira.\nQuem caça por maldade se perde no caminho;\nquem cuida da floresta nunca anda sozinho.' },
  { titulo: 'O Canto do Uirapuru', dica: 'Fala do pássaro cujo canto faz a mata inteira parar para ouvir.', versos: 'Quando canta o Uirapuru, a mata para de falar,\no rio segura a água, o vento para de soprar.\nDizem que dá sorte ouvir um canto só:\nquem ouve duas vezes nunca mais fica sozinho.' },
  { titulo: 'Gavião-Tupã', dica: 'Fala da ave do trovão que mora nas nuvens do alto da serra.', versos: 'Lá no alto da serra, onde o céu faz trovoada,\nmora o Gavião-Tupã de asa relampejada.\nCada pena é um raio, cada grito é um trovão:\nsó sobe até ele quem tem calma no coração.' },
  { titulo: 'Lobo-Jaci e Onça-Guaraci', dica: 'Fala do lobo da lua e da onça do sol, que só andam soltos depois do Conselho dos Guardiões.', versos: 'Jaci é a lua cheia, Guaraci é o sol nascente,\num é lobo, a outra é onça, os dois andam pela gente.\nUm aparece de noite, a outra quando é manhã:\nquem vencer o Conselho vai ver a dança dos dois irmãos.' },
];

/** AGENDA DO DIA (spec 10A item 39): o que vale hoje, dito pelo locutor ao ligar o rádio */
/** `mergulho`: o jogador tem o Amuleto do Mergulho — sem ele o Recife Submerso é inalcançável e a tartaruga não é anunciada */
export function agendaDoDia(o: { dia: number; periodo: string; liga: boolean; contatos: string[]; enxame: { local: string; especie: string } | null; cartao: boolean; mergulho?: boolean }): { resumo: string; texto: string } {
  const DIA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][o.dia];
  const PER: Record<string, string> = { manha: 'manhã', dia: 'dia', tarde: 'tarde', noite: 'noite' };
  const linhas: string[] = [];
  if (o.enxame) linhas.push(`ENXAME: ${o.enxame.especie || 'uma criatura rara'} aparece aos montes em ${o.enxame.local} hoje.`);
  if (o.dia === 5 && o.mergulho) linhas.push('SEXTA DA TARTARUGA: a Tartaruga-Gigante sobe para respirar no Recife Submerso, embaixo da Baía Azul. Só hoje!');
  if (o.liga && (o.dia === 2 || o.dia === 4)) linhas.push('TREINO DA RIVAL: a Tainá está na Gruta do Eco, perto da saída para Porto Sereia. Uma batalha por dia.');
  linhas.push(o.contatos.length ? `REVANCHES agora (${PER[o.periodo]}): ${o.contatos.join(', ')}.` : `REVANCHES: ninguém da sua lista treina nesta ${PER[o.periodo]}. Veja a tabela em Revanches.`);
  if (o.liga) linhas.push('TORRE DE DESAFIOS: o Juiz da Torre espera no Platô da Liga. Uma batalha por dia, todos no nível 50.');
  linhas.push(o.cartao ? 'QUIZ DA FAUNA: a Locutora Sabiá grava perguntas novas hoje na Rádio Farol.' : 'QUIZ DA FAUNA: acerte 4 de 5 perguntas na Rádio Farol, na Ilha do Farol, e ganhe o Cartão do Rádio!');
  const resumo = `Hoje é ${DIA}, ${PER[o.periodo]}.\n${o.enxame ? `Enxame em ${o.enxame.local}. ` : ''}${o.contatos.length ? `${o.contatos.length} revanche(s) agora.` : 'Nenhuma revanche agora.'}`;
  return { resumo, texto: `${o.periodo === 'noite' ? 'Boa noite' : o.periodo === 'tarde' ? 'Boa tarde' : 'Bom dia'}, Pindorama! Hoje é ${DIA}.\n\n${linhas.join('\n\n')}` };
}
