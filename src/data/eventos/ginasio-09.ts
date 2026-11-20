import type { EventoDef } from '../../core/tipos';

const ZEFA = { nome: 'Boiadeira Zefa', retrato: 'lider-05' };
/** Ginásio da Terra: conversa, batalha e prêmios da líder (insígnia 9, Amuleto Mergulho, Pergaminho do Tremor de Terra). */
export const EVENTOS_GINASIO_09: EventoDef[] = [
  {
    id: 'ginasio-09-lider',
    passos: [
      ['se', 'flag:ginasio-09-vencido', [
        ['se', 'flag:pantanal-ok', [
          ['falar', ZEFA, 'Os ninhos estão a salvo e a peãozada não para de falar de você!\fO canal do sul agora leva ao Porto Pantaneiro. De lá, a Estrada Vermelha sobe até Chapada Rubra, onde o Garimpeiro Topázio cava o ginásio dele.'],
        ], [
          ['falar', ZEFA, 'Meus peões viram gente do Cartel rondando o ninhal, lá no canal leste do Pantanal.\fA canoa do canal já sabe que você tem o Barro. Vá lá e bote aquela turma para correr!'],
        ]],
      ], [
        ['falar', ZEFA, 'Ora, passou pelos três cercados sem deixar a lama engolir as botas! Tem pé de pantaneiro, isso tem.\fEu sou a Zefa, boiadeira destas bandas. Já toquei boiada com a água pela cintura e não é um Campeão da Liga que vai me assustar.\fBora ver se a sua equipe tem chão firme!'],
        ['batalha', 'lider-09'],
        ['flag', 'venceu:lider-09'],
        ['musica', 'ginasio'],
        ['falar', ZEFA, 'Arre égua! Derrubou a boiada inteira… Tome, a Insígnia do Barro é sua, e é bem merecida.'],
        ['insignia', 9],
        ['falar', null, '{JOGADOR} recebeu a Insígnia do Barro!'],
        ['falar', ZEFA, 'E leve também o Amuleto do Mergulho. Com uma criatura de Rio na equipe, dá para descer nas águas fundas marcadas e ver o que mora lá embaixo.'],
        ['amuleto', 'mergulho'],
        ['dar', 'pt-28'],
        ['falar', ZEFA, 'Esse pergaminho ensina o Tremor de Terra: a criatura bate o pé e o chão inteiro responde.\fAgora uma coisa séria. Meus peões viram gente do Cartel rondando o ninhal das garças, no canal leste do Pantanal. A canoa do canal já sabe que você tem o Barro: vá lá e proteja aqueles ovos.\fResolvido isso, o canal do sul leva ao Porto Pantaneiro, e de lá a Estrada Vermelha sobe até Chapada Rubra, onde o Garimpeiro Topázio espera.\fAh, e com o Mergulho vale voltar aos poços fundos: tem um na Trilha das Águas, aqui no Sertão, e outro no Recife dos Corais, lá na Costa do Sol.'],
      ]],
    ],
  },
];
