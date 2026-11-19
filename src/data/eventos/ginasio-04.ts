import type { EventoDef } from '../../core/tipos';

const BURITI = { nome: 'Dona Buriti', retrato: 'lider-04' };
/** Ginásio da Mata: conversa, batalha e prêmios da líder (insígnia 4, Amuleto do Remo, Pergaminho do Abraço de Sumaúma). */
export const EVENTOS_GINASIO_04: EventoDef[] = [
  {
    id: 'ginasio-04-lider',
    passos: [
      ['se', 'flag:ginasio-04-vencido', [
        ['falar', BURITI, 'Os cipós sossegaram desde a sua vitória: pode andar pela estufa à vontade.\fCom o Remo você atravessa o Pantanal. Do outro lado fica Pantanal Grande, terra da Boiadeira Zefa.'],
      ], [
        ['falar', BURITI, 'Ora, ora! Passou pelos meus cipós sem levar uma chicotada? Então tem paciência e tem pressa na medida certa.\fSou a Dona Buriti, raizeira desta vila. Vamos ver o que a sua equipe tem na raiz!'],
        ['batalha', 'lider-04'],
        ['flag', 'venceu:lider-04'],
        ['musica', 'ginasio'],
        ['falar', BURITI, 'Arre! Nem chá de boldo cura uma derrota dessas. Tome, a Insígnia Folha é sua!'],
        ['insignia', 4],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Folha!'],
        ['falar', BURITI, 'E leve o Amuleto do Remo. Com uma criatura do tipo Rio na equipe, ela puxa a sua canoa por qualquer água mansa.'],
        ['amuleto', 'remo'],
        ['dar', 'pt-07'],
        ['falar', BURITI, 'Esse pergaminho ensina o Abraço de Sumaúma: a árvore aperta e ainda devolve força para quem usa.\fAgora ouça a velha. Com o Remo você cruza as águas do Pantanal, ao sul da vila. Do outro lado fica Pantanal Grande, onde a Boiadeira Zefa toca o ginásio de Terra.\fVá com calma: naquele brejo o chão engole quem pisa sem olhar.'],
      ]],
    ],
  },
];
