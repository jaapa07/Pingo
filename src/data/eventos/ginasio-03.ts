import type { EventoDef } from '../../core/tipos';

const NETUNO = { nome: 'Marujo Netuno Silva', retrato: 'lider-03' };
/** Ginásio do Rio: conversa, batalha e prêmios do líder (insígnia 3, Pergaminho da Enxurrada; o Remo só vem na insígnia 4). */
export const EVENTOS_GINASIO_03: EventoDef[] = [
  {
    id: 'ginasio-03-lider',
    passos: [
      ['se', 'flag:ginasio-03-vencido', [
        ['falar', NETUNO, 'A Rota 4 sai pelo leste da cidade e termina na Usina Velha. Se a fumaça de lá continuar, o trem para o Sertão não volta a rodar.\fVá ver o que é aquilo, marujo.'],
      ], [
        ['falar', NETUNO, 'Abriu as minhas eclusas na ordem certa! Tem cabeça de piloto de rio.\fEu sou o Netuno Silva, capitão deste ginásio. Agora vamos ver se o braço acompanha a cabeça!'],
        ['batalha', 'lider-03'],
        ['flag', 'venceu:lider-03'],
        ['musica', 'ginasio'],
        ['falar', NETUNO, 'Naufraguei no meu próprio cais! Você merece: a Insígnia Concha é sua!'],
        ['insignia', 3],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Concha!'],
        ['dar', 'pt-14'],
        ['falar', NETUNO, 'Esse pergaminho ensina a Enxurrada: uma parede de água que arrasta o que estiver na frente.\fAgora preste atenção. Faz dias que sai uma fumaça esquisita da Usina Velha, no fim da Rota 4, a leste daqui. Desde então o trem para o Sertão das Névoas está parado na estação.\fDizem que é coisa de um tal Cartel. Quem resolver isso ganha o passe do trem… e a Vila Buriti, do outro lado, tem ginásio de Mata.'],
      ]],
    ],
  },
];
