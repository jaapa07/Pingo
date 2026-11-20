import type { EventoDef } from '../../core/tipos';

const TOPAZIO = { nome: 'Garimpeiro Topázio', retrato: 'lider-09' };
/** Ginásio da Pedra: conversa, batalha e prêmios do líder (insígnia 10, Amuleto Escalar, Pergaminho do Deslizamento). */
export const EVENTOS_GINASIO_10: EventoDef[] = [
  {
    id: 'ginasio-10-lider',
    passos: [
      ['se', 'flag:ginasio-10-vencido', [
        ['falar', TOPAZIO, 'A mina voltou a ser do povo da Chapada, e você ainda levou o meu Cristal. Dia cheio!\fO Arraial Brasa fica depois dos paredões, ao norte. Suba com o Escalar.'],
      ], [
        ['falar', TOPAZIO, 'Então foi você que botou o Cartel para correr da Mina Velha! Eu sou o Topázio.\fMas gratidão não amolece pedra. Aqui, quem quer o Cristal tem que aguentar o desmoronamento!'],
        ['batalha', 'lider-10'],
        ['flag', 'venceu:lider-10'],
        ['musica', 'ginasio'],
        ['falar', TOPAZIO, 'Rachou a minha defesa de ponta a ponta… Tome: a Insígnia Cristal é sua!'],
        ['insignia', 10],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Cristal!'],
        ['falar', TOPAZIO, 'E leve o Amuleto do Escalar. Com uma criatura Ginga, Comum ou Inseto na equipe, paredão com trepadeira vira caminho.'],
        ['amuleto', 'escalar'],
        ['dar', 'pt-40'],
        ['falar', TOPAZIO, 'Esse pergaminho ensina o Deslizamento: a serra inteira desce em cima do adversário.\fAgora escute: o paredão de trepadeiras ao norte da vila sobe para a Chapada dos Paredões, e de lá se chega ao Arraial Brasa.\fA Ferreira Labareda bate ferro e bate forte. E dizem que, com uma lamparina, a Caverna Vulcânica do caminho guarda um bicho de fogo que ninguém consegue segurar…'],
      ]],
    ],
  },
];
