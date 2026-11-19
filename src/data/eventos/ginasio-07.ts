import type { EventoDef } from '../../core/tipos';

const BIGORNA = { nome: 'Engenheira Bigorna', retrato: 'lider-12' };
/** Ginásio do Ferro: conversa, batalha e prêmios da líder (insígnia 7, Amuleto da Força, Pergaminho da Bigornada). */
export const EVENTOS_GINASIO_07: EventoDef[] = [
  {
    id: 'ginasio-07-lider',
    passos: [
      ['se', 'flag:ginasio-07-vencido', [
        ['falar', BIGORNA, 'Desliguei as esteiras para você circular à vontade.\fOs pedregulhos da saída leste da vila já não seguram quem tem a Força. A Estrada do Buriti leva à Vila Buriti, a última insígnia da Costa do Sol.'],
      ], [
        ['falar', BIGORNA, 'Dois circuitos, quatro engrenagens, uma prensa… e você aqui, sem um arranhão. Gostei.\fSou a Engenheira Bigorna. Vamos ao teste de carga: a sua equipe contra a minha!'],
        ['batalha', 'lider-07'],
        ['flag', 'venceu:lider-07'],
        ['musica', 'ginasio'],
        ['falar', BIGORNA, 'Teste concluído: resistência acima da norma. A Insígnia Engrenagem é sua!'],
        ['insignia', 7],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Engrenagem!'],
        ['falar', BIGORNA, 'Leve o Amuleto da Força. Com uma criatura de Terra, Pedra ou Ginga na equipe, pedregulho vira carrinho de mão.'],
        ['amuleto', 'forca'],
        ['dar', 'pt-47'],
        ['falar', BIGORNA, 'Esse pergaminho ensina a Bigornada: o peso de uma oficina inteira num golpe só.\fAgora o roteiro. A saída leste da vila está travada por pedregulhos: com a Força você empurra e passa para a Estrada do Buriti.\fNo fim dela fica a Vila Buriti, onde a raizeira Dona Buriti guarda a oitava insígnia. E depois dela… bem, dizem que há um platô onde só entra quem tem as oito.'],
      ]],
    ],
  },
];
