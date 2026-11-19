import type { EventoDef } from '../../core/tipos';

const VOLTA = { nome: 'Faroleiro Volta', retrato: 'lider-07' };
/** Ginásio do Trovão: conversa, batalha e prêmios do líder (insígnia 5, Pergaminho do Choque de Poraquê; o Lampião vem do evento do Farol). */
export const EVENTOS_GINASIO_05: EventoDef[] = [
  {
    id: 'ginasio-05-lider',
    passos: [
      ['se', 'flag:ginasio-05-vencido', [
        ['falar', VOLTA, 'Deixei todas as pontes ligadas para você passear.\fA Gruta Breu sai de Cidade Coral: com o Lampião aceso você atravessa até a Serra Fumaça. A Dona Benta Sombra, de lá, conta causo de arrepiar.'],
      ], [
        ['falar', VOLTA, 'Então foi você que tirou aquele bando do meu farol! E ainda ligou as minhas pontes na ordem certa.\fEu devia agradecer… mas inventor agradece com experiência. Vamos testar a sua resistência!'],
        ['batalha', 'lider-05'],
        ['flag', 'venceu:lider-05'],
        ['musica', 'ginasio'],
        ['falar', VOLTA, 'Experiência concluída: você conduz melhor que fio de cobre! A Insígnia Raio é sua!'],
        ['insignia', 5],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Raio!'],
        ['dar', 'pt-19'],
        ['falar', VOLTA, 'Esse pergaminho ensina o Choque de Poraquê: uma descarga que deixa o adversário paralisado.\fAgora anote aí. Com o Lampião que você ganhou no farol dá para atravessar a Gruta Breu, que sai de Cidade Coral. Do outro lado fica a Serra Fumaça.\fO ginásio de lá é da Dona Benta Sombra, contadora de causos. O tipo dela é Assombro, e a casa é mais escura que porão de navio. Leve criatura que acenda o Lampião!'],
      ]],
    ],
  },
];
