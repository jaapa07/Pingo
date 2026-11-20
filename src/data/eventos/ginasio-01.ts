import type { EventoDef } from '../../core/tipos';

const GAIVOTA = { nome: 'Mestre Gaivota', retrato: 'lider-01' };
/** Ginásio do Vento: conversa, batalha e prêmios do líder (insígnia 1, Pergaminho do Rasante; o Faro vem da missão do Seu Aroeira). */
export const EVENTOS_GINASIO_01: EventoDef[] = [
  {
    id: 'ginasio-01-lider',
    passos: [
      ['se', 'flag:ginasio-01-vencido', [
        ['falar', GAIVOTA, 'A Insígnia Pena fica bem em você.\fJá falou com o Seu Aroeira? E não esqueça: o Bosque Alto fica depois da Mata dos Sabiás.\fPara descer, é só pular na rajada depois do segundo mastro: o mar devolve você na entrada.'],
      ], [
        ['falar', GAIVOTA, 'Chegou até aqui sem cair no mar? Então já entendeu metade da lição: não se briga com o vento.\fA outra metade eu ensino agora. Eu sou o Mestre Gaivota!'],
        ['batalha', 'lider-01'],
        ['flag', 'venceu:lider-01'],
        ['musica', 'ginasio'],
        ['falar', GAIVOTA, 'Rapaz… você voou mais alto que as minhas pipas. Tome: a Insígnia Pena é sua!'],
        ['insignia', 1],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Pena!'],
        ['dar', 'pt-31'],
        ['falar', GAIVOTA, 'Esse pergaminho ensina o Rasante: um voo baixo e certeiro, que quase nunca erra.\fAgora escute. O Seu Aroeira, aqui da vila, anda atrás de alguém de confiança para uma tarefa. Dizem que ele guarda um Amuleto que faz as criaturas farejarem coisas escondidas.\fDepois siga pelos Campos de Restinga e atravesse a Mata dos Sabiás. No Bosque Alto, a Lia Teia espera os desafiantes no alto das copas.\fAh, para descer do píer não tem prancha: deixe a corrente da direita levar você e pule na rajada depois do segundo mastro. O mar devolve todo mundo na entrada!'],
      ]],
    ],
  },
];
