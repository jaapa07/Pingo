import type { EventoDef } from '../../core/tipos';

const TOPAZIO = { nome: 'Garimpeiro Topázio', retrato: 'lider-09' };
/** Ginásio da Pedra: conversa, batalha e prêmios do líder (insígnia 9, Amuleto Escalar, Pergaminho de Pedra). */
export const EVENTOS_GINASIO_09: EventoDef[] = [
  {
    id: 'ginasio-09-lider',
    passos: [
      ['se', 'flag:ginasio-09-vencido', [
        ['falar', TOPAZIO, 'A mina voltou a ser do povo da Chapada, e você ainda levou o meu Cristal. Dia cheio!\fO Arraial Brasa fica depois dos paredões. Suba com o Escalar.'],
      ], [
        ['falar', TOPAZIO, 'Então foi você que botou o Cartel para correr da mina! Eu sou o Topázio.\fMas gratidão não amolece pedra. Aqui, quem quer o Cristal tem que aguentar o desmoronamento!'],
        ['batalha', 'lider-09'],
        ['flag', 'venceu:lider-09'],
        ['musica', 'ginasio'],
        ['falar', TOPAZIO, 'Rachou a minha defesa de ponta a ponta… Tome: a Insígnia Cristal é sua!'],
        ['insignia', 9],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Cristal!'],
        ['falar', TOPAZIO, 'E leve o Amuleto do Escalar. Com uma criatura Ginga, Comum ou Inseto na equipe, paredão com trepadeira vira caminho.'],
        ['amuleto', 'escalar'],
        ['dar', 'pt-40'],
        ['falar', TOPAZIO, 'Esse pergaminho ensina o Deslizamento: a serra inteira desce em cima do adversário.\fAgora escute: a Chapada dos Paredões, ao norte daqui, leva ao Arraial Brasa. A Ferreira Labareda de lá bate ferro e bate forte.'],
      ]],
    ],
  },
];
