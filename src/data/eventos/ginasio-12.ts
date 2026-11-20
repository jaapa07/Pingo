import type { EventoDef } from '../../core/tipos';

const GINGADO = { nome: 'Mestre Gingado', retrato: 'lider-11' };
/** Ginásio da Ginga: conversa, batalha e prêmios do líder (insígnia 12, Amuleto Cachoeira, Pergaminho do Toque de Berimbau). */
export const EVENTOS_GINASIO_12: EventoDef[] = [
  {
    id: 'ginasio-12-lider',
    passos: [
      ['se', 'flag:ginasio-12-vencido', [
        ['falar', GINGADO, 'Volta e meia a roda lembra de você, camará.\fCom a Cachoeira, suba a cascata do Mirante, aqui no canto nordeste da cidade. E o Brejo Roxo fica do outro lado do Túnel Alagado: o Doutor Peçonha espera lá.'],
      ], [
        ['falar', GINGADO, 'Passou pelas três rodas e ainda chegou sorrindo. Isso é capoeira, camará!\fEu sou o Gingado. Aprendi a jogar na beira da lagoa, ouvindo o berimbau do meu avô. Agora a roda é minha, e o jogo é com você.'],
        ['batalha', 'lider-12'],
        ['flag', 'venceu:lider-12'],
        ['musica', 'ginasio'],
        ['falar', GINGADO, 'Iê, camará! Quem joga assim merece a Insígnia do Berimbau. Tome, é sua!'],
        ['insignia', 12],
        ['falar', null, '{JOGADOR} recebeu a Insígnia do Berimbau!'],
        ['falar', GINGADO, 'E leve o Amuleto da Cachoeira. Com uma criatura de Rio ou uma Lenda na equipe, dá para subir as cascatas remando contra a água.'],
        ['amuleto', 'cachoeira'],
        ['dar', 'pt-25'],
        ['falar', GINGADO, 'Esse pergaminho ensina o Toque de Berimbau: a criatura entra no ritmo e o ataque sobe.\fAgora escute o mestre: a cascata do Mirante, no canto nordeste da cidade, só se sobe com a Cachoeira. E lá na Costa do Sol, o Rio Cachoeira-Véu guarda segredos para quem sobe as quedas.\fQuando quiser seguir viagem, mergulhe no poço da Lagoa do Berimbau: o Túnel Alagado leva ao Brejo Roxo. Dizem que o Doutor Peçonha anda nervoso com uns vizinhos de jaleco que se mudaram para lá…'],
      ]],
    ],
  },
];
