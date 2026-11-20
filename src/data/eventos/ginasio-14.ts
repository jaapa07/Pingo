import type { EventoDef } from '../../core/tipos';

const PINHAO = { nome: 'Gaúcha Pinhão', retrato: 'lider-14' };
/** Ginásio da Geada: conversa, batalha e prêmios da líder (insígnia 14 Floco, Amuleto do Voo, Pergaminho do Vento Minuano). */
export const EVENTOS_GINASIO_14: EventoDef[] = [
  {
    id: 'ginasio-14-lider',
    passos: [
      ['se', 'flag:ginasio-14-vencido', [
        ['falar', PINHAO, 'Bah, já de volta? O caminho segue pela ponte da névoa, ao norte da vila, até o Planalto Lume. Lá o céu é tão limpo que a Astrônoma Jaci conta as estrelas uma por uma.\fE com o Voo, quando cansar de andar, é só chamar uma criatura de Vento e escolher a cidade.'],
      ], [
        ['falar', PINHAO, 'Buenas! Deslizou bonito pelas três pistas, hein? Tem gente que leva o dia inteiro e sai com o traseiro roxo.\fEu sou a Pinhão, criada no frio da serra. Aqui a geada cai cedo e a batalha também. Vamos lá, vivente!'],
        ['batalha', 'lider-14'],
        ['flag', 'venceu:lider-14'],
        ['musica', 'ginasio'],
        ['falar', PINHAO, 'Me derreteu, tchê! A Insígnia Floco é tua, com todo o merecimento.'],
        ['insignia', 14],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Floco!'],
        ['falar', PINHAO, 'E leva o Amuleto do Voo. Com uma criatura do tipo Vento na equipe, ela carrega você pelos ares até qualquer cidade que já visitou.'],
        ['amuleto', 'voo'],
        ['dar', 'pt-20'],
        ['falar', PINHAO, 'Esse pergaminho ensina o Vento Minuano: o vento frio do sul, que gela até os ossos.\fAgora escuta: o caminho segue pela borda norte da vila, na ponte que vive coberta de névoa. Leva o Lampião aceso, que sem luz ninguém acha o outro lado.\fDepois da ponte fica o Planalto Lume. A Astrônoma Jaci cuida do ginásio de lá, um observatório inteiro. Dizem que ela lê o céu como quem lê um livro. Vai com Deus e com agasalho!'],
      ]],
    ],
  },
];
