import type { EventoDef } from '../../core/tipos';

const JACI = { nome: 'Astrônoma Jaci', retrato: 'lider-15' };
/** Ginásio da Mente: conversa, batalha e prêmios da líder (insígnia 15 Olho, Pergaminho da Força do Pensamento; sem Amuleto). */
export const EVENTOS_GINASIO_15: EventoDef[] = [
  {
    id: 'ginasio-15-lider',
    passos: [
      ['se', 'flag:ginasio-15-vencido', [
        ['falar', JACI, 'Com quinze insígnias, o guardião da trilha do Monte Tupã deixa você subir. A Aldeia Tupã fica lá no alto, na Costa do Sol, perto de Vila Ferrugem.\fO Pajé Trovão-Velho guarda a última insígnia. Vá com respeito: ele ouve mais do que fala.'],
      ], [
        ['falar', JACI, 'Que alegria! Pouca gente chega à ilha do topo na primeira noite.\fEu sou a Jaci. Meu nome é o da lua, e quem me ensinou a ler o céu foram os mais velhos da Aldeia Tupã: a Ema que anuncia o frio, a Anta que anuncia o calor, o Homem Velho que chega com as chuvas.\fAgora me mostre o que a sua equipe aprendeu com o céu!'],
        ['batalha', 'lider-15'],
        ['flag', 'venceu:lider-15'],
        ['musica', 'ginasio'],
        ['falar', JACI, 'As estrelas já sabiam, eu é que não quis acreditar. A Insígnia Olho é sua!'],
        ['insignia', 15],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Olho!'],
        ['dar', 'pt-34'],
        ['falar', JACI, 'Esse pergaminho ensina a Força do Pensamento: ergue o adversário só com a mente.\fAgora, o seu caminho. São quinze insígnias no seu peito, e só falta uma. Ela está do outro lado da serra, na Costa do Sol: no Monte Tupã, perto de Vila Ferrugem, o guardião da trilha só deixa passar quem traz quinze.\fLá no alto fica a Aldeia Tupã, a casa do Pajé Trovão-Velho. Foi ele quem me deu de presente o nome das estrelas. Leve a ele o meu abraço, e vá preparado: a prova dele são quatro, uma para cada elemento.'],
      ]],
    ],
  },
];
