/**
 * TROCAS COM MORADORES (spec 10A item 12): seis moradores pelos dois mapas trocam uma criatura específica por outra,
 * que chega com apelido, item segurado e o nome do morador como treinador original — por isso ganha experiência ×1,5 e
 * só obedece conforme as insígnias (src/battle/cuias.ts → `limiteObediencia`: 20 · 30 · 50 · 70 · todas).
 *
 * As três do mapa A são deste arquivo (roteiro único `troca` em src/data/eventos/captura.ts). As três do mapa B já
 * existiam nos times de zona e seguem a mesma regra (estão listadas em `TROCAS_MAPA_B` só para consulta).
 */
import type { Cond } from '../core/tipos';

export interface TrocaDef {
  id: string;
  /** nome do morador (vira o treinador original da criatura entregue) e retrato/voz nas falas */
  morador: string; retrato: string;
  zona: string; local: string;
  quer: number; da: number; nivel: number; apelido: string; item: string;
  requer?: Cond;
  falas: { pedido: string; semCriatura: string; recusa: string; feito: string; depois: string };
}

export const TROCAS: TrocaDef[] = [
  {
    id: 'troca-a3', morador: 'Dona Quitéria', retrato: 'npc-mulher-2', zona: 'A3', local: 'Bosque Alto',
    quer: 13, da: 22, nivel: 16, apelido: 'Pipoca', item: 'caju', requer: 'insignias:1',
    falas: {
      pedido: 'Ai, que saudade de uma Cotiazinha! A minha fugiu atrás de um coquinho e nunca mais voltou.\fEu tenho um Saguinho espevitado, o Pipoca. Troca ele por uma Cotiazinha?',
      semCriatura: 'Sem Cotiazinha na equipe? Elas vivem no sub-bosque da Mata dos Sabiás. Traz uma, que o Pipoca está pronto!',
      recusa: 'Tudo bem… O Pipoca vai continuar roubando banana da fruteira.',
      feito: 'Que lindeza! Cuida bem do Pipoca: ele adora caju e grita quando vê gavião.',
      depois: 'A Cotiazinha já enterrou três coquinhos no meu quintal. Vai nascer coqueiro até na cozinha!',
    },
  },
  {
    id: 'troca-a5', morador: 'Seu Maré-Cheia', retrato: 'cl-pescador', zona: 'A5', local: 'Cidade Coral',
    quer: 35, da: 73, nivel: 26, apelido: 'Marola', item: 'acai', requer: 'insignias:3',
    falas: {
      pedido: 'Pescador sem caranguejo é que nem samba sem pandeiro! Me falta um Caranguejim para a rede de cerco.\fEm troca dou a Marola, uma Ariranhinha que eu achei no corixo. Topa?',
      semCriatura: 'Caranguejim mora no mangue e na areia da Baía Azul. Volta com um, que a Marola espera.',
      recusa: 'Então a Marola fica comigo… e com os meus peixes, infelizmente.',
      feito: 'Trato feito! A Marola é brincalhona: mergulha, rouba açaí e volta rindo. Boa viagem pros dois!',
      depois: 'O Caranguejim já é o capitão da rede. Pesquei o dobro esta semana!',
    },
  },
  {
    id: 'troca-a8', morador: 'Mestre Zé Malho', retrato: 'cl-ferreiro', zona: 'A8', local: 'Vila Ferrugem',
    quer: 163, da: 63, nivel: 30, apelido: 'Trovoada', item: 'pequi', requer: 'insignias:5',
    falas: {
      pedido: 'Os cupins comeram a perna da minha bancada… e eu quero um Cupinzim para estudar como eles fazem isso!\fDou em troca o Trovoada, um Bugiozinho que berra mais alto que o meu martelo.',
      semCriatura: 'Cupinzim vive no capim aqui da vila, perto dos cupinzeiros. Traga um!',
      recusa: 'Pois bem. O Trovoada continua acordando a vila às cinco da manhã.',
      feito: 'Negócio fechado! O Trovoada gosta de pequi e de ventania. Se ele não ouvir você, é que ainda está se acostumando.',
      depois: 'O Cupinzim roeu a bancada nova também. Estou aprendendo muito. E comprando muita madeira.',
    },
  },
];

/** as trocas que já existiam no mapa B (roteiros dos times de zona), pela mesma regra */
export const TROCAS_MAPA_B = [
  { morador: 'Seu Aroeirinha', zona: 'B1', quer: 50, da: 102, roteiro: "src/data/eventos/b1.ts ('b1-trocar')" },
  { morador: 'Tchê Barbosa', zona: 'B7', quer: 162, da: 136, roteiro: "src/data/eventos/b2-sul.ts ('b2s-trocar')" },
  { morador: 'Seu Lã-Grossa', zona: 'B-SG', quer: 136, da: 140, roteiro: "src/data/eventos/b2-norte.ts ('b2n-trocar')" },
] as const;

export const troca = (id: string): TrocaDef | undefined => TROCAS.find((t) => t.id === id);
