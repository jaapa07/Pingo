import type { EventoDef } from '../../core/tipos';

const PAJE = { nome: 'Pajé Trovão-Velho', retrato: 'lider-16' };
/** Casa de Provas da Aldeia Tupã: conversa, batalha e prêmios do Pajé (insígnia 16 Escama, Pergaminho da Garra Ancestral; aponta o Portão do Pico Pingorama). */
export const EVENTOS_GINASIO_16: EventoDef[] = [
  {
    id: 'ginasio-16-lider',
    passos: [
      ['se', 'flag:ginasio-16-vencido', [
        ['falar', PAJE, 'A trilha do topo do Monte Tupã sobe até o Pico Pingorama. No Portão dos Guardiões, as dezesseis insígnias falam por você.\fCuidado com o homem do Cartel que subiu antes. Ele quer a montanha só para ele, e montanha não é de ninguém.'],
      ], [
        ['falar', PAJE, 'Sente aqui, caminhante. Você passou pelo fogo sem se queimar, pela terra sem se perder, pelo vento sem cair e pela água sem brigar com o próprio reflexo.\fMeu povo conta essas histórias desde antes das cidades. A Jaci aprendeu as estrelas aqui; muita gente aprendeu a ouvir aqui.\fAgora eu quero ouvir a sua equipe. Sem pressa e sem medo.'],
        ['batalha', 'lider-16'],
        ['flag', 'venceu:lider-16'],
        ['musica', 'ginasio'],
        ['falar', PAJE, 'O trovão ouviu. Esta é a Insígnia Escama, a última das dezesseis. Leve com você.'],
        ['insignia', 16],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Escama!'],
        ['dar', 'pt-46'],
        ['falar', PAJE, 'Esse pergaminho ensina a Garra Ancestral, a força das criaturas mais antigas. Use para proteger, não para mandar.\fAgora escute com atenção. Do topo do Monte Tupã sai a trilha que sobe até o Pico Pingorama. Lá em cima fica o Portão dos Guardiões, e ele só se abre para quem traz as dezesseis insígnias.\fDepois do portão, o Conselho dos Guardiões espera: cinco lutas, uma atrás da outra. E tem mais: um coronel do Cartel subiu na frente, com gente armada de ganância. A montanha é a casa dos lendários. Vá, e cuide dela por nós.'],
      ]],
    ],
  },
];
