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
  lider: 'Uma revanche de líder é coisa séria. Volte a ligar quando o Conselho dos Guardiões reconhecer você.',
  venceu: 'Ufa! Você continua em forma. Me liga amanhã para outra!',
  perdeu: 'Viu só como eu treinei? Cuide da equipe e me ligue amanhã.',
};
