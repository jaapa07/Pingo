import type { EventoDef } from '../../core/tipos';

const NETUNO = { nome: 'Marujo Netuno Silva', retrato: 'lider-03' };
/** Ginásio do Rio: conversa, batalha e prêmios do líder (insígnia 3, Amuleto do Remo, Pergaminho da Enxurrada). */
export const EVENTOS_GINASIO_03: EventoDef[] = [
  {
    id: 'ginasio-03-lider',
    passos: [
      ['se', 'flag:ginasio-03-vencido', [
        ['falar', NETUNO, 'A Rota 4 sai pelo leste da cidade e termina na Usina Velha. Enquanto aquilo não for resolvido, o cais sul fica sem energia e ninguém zarpa para a Baía Azul.\fVá ver o que é aquilo, marujo. Depois, com o Remo, é só descer pelo cais até a Cidade Coral.'],
      ], [
        ['falar', NETUNO, 'Abriu as minhas eclusas na ordem certa! Tem cabeça de piloto de rio.\fEu sou o Netuno Silva, capitão deste ginásio. Agora vamos ver se o braço acompanha a cabeça!'],
        ['batalha', 'lider-03'],
        ['flag', 'venceu:lider-03'],
        ['musica', 'ginasio'],
        ['falar', NETUNO, 'Naufraguei no meu próprio cais! Você merece: a Insígnia Concha é sua!'],
        ['insignia', 3],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Concha!'],
        ['falar', NETUNO, 'E leve o Amuleto do Remo. Com uma criatura do tipo Rio na equipe, ela puxa a sua canoa por qualquer água mansa.\fNão tem nenhuma? Não precisa voltar: com a Vara Velha, na beira do cais sai Piabinha.\fE o Seu Arraia, lá na praia, troca o Mandizinho dele por um Pipirim. Sem criatura de Rio, ninguém atravessa a Baía Azul.'],
        ['amuleto', 'remo'],
        ['dar', 'pt-14'],
        ['falar', NETUNO, 'Esse pergaminho ensina a Enxurrada: uma parede de água que arrasta o que estiver na frente.\fAgora preste atenção. Faz dias que sai uma fumaça esquisita da Usina Velha, no fim da Rota 4, a leste daqui. Desde então o cais sul está sem energia e a estação do trem, às escuras.\fDizem que é coisa de um tal Cartel. Resolva isso e o cais volta a funcionar: com o Remo você desce pela Baía Azul até a Cidade Coral, onde a rendeira Iracema Lua guarda o ginásio de Encanto.'],
      ]],
    ],
  },
];
