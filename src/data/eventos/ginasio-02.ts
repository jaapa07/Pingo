import type { EventoDef } from '../../core/tipos';

const LIA = { nome: 'Lia Teia', retrato: 'lider-02' };
/** Ginásio do Inseto: conversa, batalha e prêmios da líder (insígnia 2, Amuleto do Facão, Pergaminho do Enxame). */
export const EVENTOS_GINASIO_02: EventoDef[] = [
  {
    id: 'ginasio-02-lider',
    passos: [
      ['se', 'flag:ginasio-02-vencido', [
        ['falar', LIA, 'O Facão abre os cipós da Rota 3. Siga por ela e pela Gruta do Eco até Porto Sereia.\fE volte quando quiser: aqui em cima sempre tem inseto novo para conhecer.'],
      ], [
        ['falar', LIA, 'Você atravessou as sete… quer dizer, as seis pontes na ordem certa. Gente apressada nunca chega aqui.\fEu sou a Lia Teia, bióloga de copa. Agora quero ver essa paciência em batalha!'],
        ['batalha', 'lider-02'],
        ['flag', 'venceu:lider-02'],
        ['musica', 'ginasio'],
        ['falar', LIA, 'Incrível! Nem a minha Bruxaluz conseguiu enrolar você. A Insígnia Casulo é sua!'],
        ['insignia', 2],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Casulo!'],
        ['falar', LIA, 'Leve também o Amuleto do Facão. Com uma criatura de Mata, Inseto ou Ginga na equipe, cipó grosso deixa de ser parede.'],
        ['amuleto', 'facao'],
        ['dar', 'pt-38'],
        ['falar', LIA, 'Esse pergaminho ensina o Enxame: uma nuvem de asas que não dá sossego ao adversário.\fOs cipós que fecham a Rota 3, a leste do bosque, agora são problema resolvido. Depois dela vem a Gruta do Eco e, do outro lado, Porto Sereia. O Marujo Netuno Silva comanda o ginásio de lá, e ele adora molhar desafiante.'],
      ]],
    ],
  },
];
