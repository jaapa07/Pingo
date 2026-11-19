import type { EventoDef } from '../../core/tipos';

const IRACEMA = { nome: 'Iracema Lua', retrato: 'lider-06' };
/** Ginásio do Encanto: conversa, batalha e prêmios da líder (insígnia 4, Pergaminho do Clarão da Lua; sem Amuleto). */
export const EVENTOS_GINASIO_04: EventoDef[] = [
  {
    id: 'ginasio-04-lider',
    passos: [
      ['se', 'flag:ginasio-04-vencido', [
        ['falar', IRACEMA, 'A Ilha do Farol fica ao norte da cidade. O farol anda apagado e o Faroleiro Volta sumiu lá dentro: vá ver o que houve.\fE passe na Praia das Tartarugas quando puder. Dizem que tem ninho novo por lá.'],
      ], [
        ['falar', IRACEMA, 'Acendeu as minhas duas estrelas! Pouca gente entende que a luz precisa de caminho, igual linha na almofada.\fEu sou a Iracema Lua, rendeira de Cidade Coral. Vamos ver se a sua equipe também brilha!'],
        ['batalha', 'lider-04'],
        ['flag', 'venceu:lider-04'],
        ['musica', 'ginasio'],
        ['falar', IRACEMA, 'Que coisa mais linda de se ver! Tome, meu bem: a Insígnia Estrela é sua!'],
        ['insignia', 4],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Estrela!'],
        ['dar', 'pt-49'],
        ['falar', IRACEMA, 'Esse pergaminho ensina o Clarão da Lua: uma luz tão forte que até criatura de Lenda sente.\fAgora escute, meu bem. Faz noites que o farol da Ilha do Farol não acende, e os saveiros estão batendo nos recifes. O Faroleiro Volta, que também é o líder de lá, não aparece desde então.\fDizem que uns sujeitos de uniforme cinza tomaram a torre. A ilha fica ao norte daqui. Se resolver isso, o Volta vai querer conhecer você… e o ginásio dele é de Trovão.'],
      ]],
    ],
  },
];
