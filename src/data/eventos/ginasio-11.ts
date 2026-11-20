import type { EventoDef } from '../../core/tipos';

const LABAREDA = { nome: 'Ferreira Labareda', retrato: 'lider-10' };
/** Ginásio da Brasa: conversa, batalha e prêmios da líder (insígnia 11, Pergaminho da Labareda; sem Amuleto). */
export const EVENTOS_GINASIO_11: EventoDef[] = [
  {
    id: 'ginasio-11-lider',
    passos: [
      ['se', 'flag:ginasio-11-vencido', [
        ['falar', LABAREDA, 'As fogueiras não apagam desde a sua vitória: o arraial inteiro quer dançar com você.\fA Trilha da Roda sai pela porteira leste do arraial e leva a Cidade Ginga. Com a Chama no peito, o contramestre deixa passar.'],
      ], [
        ['falar', LABAREDA, 'Acendeu os três terreiros sem queimar a música! Tem ouvido de sanfoneiro e mão de ferreiro.\fEu sou a Labareda. Forjo sino, ferradura e campeão. Vamos ver se você aguenta o calor da forja!'],
        ['batalha', 'lider-11'],
        ['flag', 'venceu:lider-11'],
        ['musica', 'ginasio'],
        ['falar', LABAREDA, 'Vixe, apagou a minha fornalha! Tome, a Insígnia da Chama é sua, e está quentinha ainda.'],
        ['insignia', 11],
        ['falar', null, '{JOGADOR} recebeu a Insígnia da Chama!'],
        ['dar', 'pt-10'],
        ['falar', LABAREDA, 'Esse pergaminho ensina a Labareda, que leva o meu nome: fogo alto que ainda pode deixar queimadura.\fAgora escute: a porteira leste do arraial abre a Trilha da Roda para quem tem a Chama. No fim dela fica Cidade Ginga, e o Mestre Gingado joga capoeira no ritmo do berimbau.\fE se ainda não foi, leve um lampião na Caverna Vulcânica, na Chapada dos Paredões. Dizem que um bicho de fogo azul dorme lá no fundo, e que só gente de coragem consegue olhar para ele.'],
      ]],
    ],
  },
];
