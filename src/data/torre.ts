/**
 * TORRE DE DESAFIOS simplificada (spec 10A, item 35) — pós-Liga, no Platô da Liga (A-LG), com o Juiz da Torre.
 * Uma batalha por dia; as duas equipes lutam no nível 50; o jogador não ganha experiência nem usa a mochila;
 * cada vitória vale pontos (a 7ª seguida vale o dobro) que se trocam por itens raros.
 * O desafiante do dia sai de um rodízio fixo (dia corrido + vitórias seguidas): sem acaso, todos veem o mesmo.
 */
import type { EspecieDef, MembroEquipe, TreinadorDef } from '../core/tipos';

export const TORRE = { nivel: 50, pontosVitoria: 3, zona: 'A-LG', x: 4, y: 53 };
export const PREMIOS_TORRE: { item: string; custo: number }[] = [
  { item: 'cuia-ouro', custo: 3 }, { item: 'cha-guarana', custo: 4 }, { item: 'elixir-andiroba', custo: 6 },
  { item: 'pedra-solar', custo: 9 }, { item: 'pedra-mare', custo: 9 }, { item: 'pedra-lunar', custo: 9 }, { item: 'folha-ancestral', custo: 9 },
  { item: 'pepita', custo: 12 }, { item: 'rapadura', custo: 16 },
];
/** desafiantes da Torre: estágio final de cada linha, sem lendários, com tipos variados */
const EQUIPES: number[][] = [
  [12, 74, 34], [29, 87, 136], [62, 116, 102], [56, 128, 158], [40, 50, 144], [66, 26, 170], [94, 122, 82],
  [110, 9, 152], [72, 92, 108], [100, 42, 140], [48, 130, 64], [106, 162, 32], [68, 118, 172], [3, 6, 120],
];
const NOMES: [string, string, string][] = [
  ['Desafiante', 'Iberê', 'cl-capoeirista'], ['Desafiante', 'Moema', 'cl-mateira'], ['Desafiante', 'Ubirajara', 'cl-vaqueiro'],
  ['Desafiante', 'Jandira', 'cl-biologa'], ['Desafiante', 'Caetê', 'cl-pescador'], ['Desafiante', 'Potira', 'cl-repentista'], ['Desafiante', 'Tibiriçá', 'cl-ferreiro'],
];
/** adversário do dia: `dia` corrido e `seguidas` (vitórias seguidas) escolhem a equipe; da 4ª seguida em diante, 4 criaturas */
export function adversarioDaTorre(dia: number, seguidas: number, esp: (n: number) => EspecieDef | undefined): TreinadorDef {
  const k = ((dia * 3 + seguidas * 5) % EQUIPES.length + EQUIPES.length) % EQUIPES.length, base = EQUIPES[k].filter((e) => esp(e));
  const quarta = EQUIPES[(k + 7) % EQUIPES.length].find((e) => !base.includes(e) && esp(e));
  const nums = seguidas >= 3 && quarta ? [...base, quarta] : base;
  const [classe, nome, sprite] = NOMES[(dia + seguidas) % NOMES.length];
  const equipe: MembroEquipe[] = nums.map((e) => ({ e, nv: TORRE.nivel }));
  return {
    id: 'torre-desafiante', classe, nome, sprite, ia: seguidas >= 3 ? 'lider' : 'treinador', premio: 0, contato: false, flag: 'torre-venceu',
    equipe, desafio: 'Na Torre todo mundo é nível 50. Aqui ganha quem pensa melhor!', derrota: 'Pensou melhor mesmo. Até amanhã na Torre!',
  };
}
