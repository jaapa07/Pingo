import type { EventoDef } from '../../core/tipos';

const BENTA = { nome: 'Dona Benta Sombra', retrato: 'lider-08' };
/** Ginásio do Assombro: conversa, batalha e prêmios da líder (insígnia 6, Amuleto Quebra-pedra, Pergaminho da Bola de Breu). */
export const EVENTOS_GINASIO_06: EventoDef[] = [
  {
    id: 'ginasio-06-lider',
    passos: [
      ['se', 'flag:ginasio-06-vencido', [
        ['falar', BENTA, 'Deixei os lustres acesos para você: agora os alçapões estão todos à mostra.\fAs rochas rachadas da Rota 5 não seguram mais ninguém que tenha o Quebra-pedra. No fim dela fica a Vila Ferrugem.'],
      ], [
        ['falar', BENTA, 'Ora, ora… atravessou o meu sobrado e ainda chegou com a chama acesa. Faz tempo que um causo não começa tão bem.\fEu sou a Benta Sombra. Agora deixe eu contar a parte em que as assombrações aparecem!'],
        ['batalha', 'lider-06'],
        ['flag', 'venceu:lider-06'],
        ['musica', 'ginasio'],
        ['falar', BENTA, 'Credo em cruz! Você espantou até as minhas visagens. A Insígnia Lamparina é sua!'],
        ['insignia', 6],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Lamparina!'],
        ['falar', BENTA, 'Leve também o Amuleto Quebra-pedra. Com uma criatura de Pedra, Terra, Ferro ou Ginga na equipe, rocha rachada vira cascalho.'],
        ['amuleto', 'quebra-pedra'],
        ['dar', 'pt-42'],
        ['falar', BENTA, 'Esse pergaminho ensina a Bola de Breu: um punhado de escuridão atirado bem no meio do adversário.\fAgora ouça o próximo capítulo. A Rota 5 desce a serra, mas está entupida de rochas rachadas: o Quebra-pedra resolve.\fNo fim dela fica a Vila Ferrugem, onde a Engenheira Bigorna comanda um ginásio de Ferro cheio de esteiras e engrenagens. Dizem que lá o chão anda sozinho… esse causo eu quero ouvir de você.'],
      ]],
    ],
  },
];
