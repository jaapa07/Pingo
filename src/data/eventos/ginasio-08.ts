import type { EventoDef } from '../../core/tipos';

const BURITI = { nome: 'Dona Buriti', retrato: 'lider-04' };
/** Ginásio da Mata: conversa, batalha e prêmios da líder (insígnia 8, Pergaminho do Abraço de Sumaúma; sem Amuleto: abre o caminho do Platô da Liga). */
export const EVENTOS_GINASIO_08: EventoDef[] = [
  {
    id: 'ginasio-08-lider',
    passos: [
      ['se', 'flag:ginasio-08-vencido', [
        ['falar', BURITI, 'Os cipós sossegaram desde a sua vitória: pode andar pela estufa à vontade.\fA trilha que sai da vila sobe até o Platô da Liga. Com as oito insígnias, o Guardião da Entrada abre o portão para você.'],
      ], [
        ['falar', BURITI, 'Ora, ora! Passou pelos meus cipós sem levar uma chicotada? Então tem paciência e tem pressa na medida certa.\fSou a Dona Buriti, raizeira desta vila e última líder da Costa do Sol. Vamos ver o que a sua equipe tem na raiz!'],
        ['batalha', 'lider-08'],
        ['flag', 'venceu:lider-08'],
        ['musica', 'ginasio'],
        ['falar', BURITI, 'Arre! Nem chá de boldo cura uma derrota dessas. Tome, a Insígnia Folha é sua!'],
        ['insignia', 8],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Folha!'],
        ['dar', 'pt-07'],
        ['falar', BURITI, 'Esse pergaminho ensina o Abraço de Sumaúma: a árvore aperta e ainda devolve força para quem usa.\fAgora ouça a velha: são oito insígnias no seu peito. A trilha que sai da vila sobe até o Platô da Liga, e o Guardião da Entrada só abre o portão para quem tem as oito.\fLá em cima são quatro Mestres e o Campeão, um atrás do outro, sem descanso. Quem vence a Liga ganha passagem para o Sertão das Névoas. Leve remédio na mochila e vá com a bênção desta raizeira.'],
      ]],
    ],
  },
];
