/**
 * Curva de níveis do mapa B (spec 4.5; decisão do autor em docs/EQUILIBRIO-MAPA-B.md): Conselho com o Guardião-Mor
 * no 77, revanches de fase 4 no 81 e os líderes 9–16 abaixo disso, com o jogador honesto 2–4 níveis abaixo de cada ás
 * (estimativa de tools/estima-chegada-b.ts). Usada por tools/verify/niveis.ts e pelos verificadores das zonas B.
 */
/** ás de cada líder 9–16 */
export const AS_LIDER_B: Record<number, number> = { 9: 55, 10: 58, 11: 61, 12: 63, 13: 66, 14: 68, 15: 70, 16: 72 };
/** faixa da equipe do líder: ás − 4 até o ás (o ás no limite de cima) */
export const faixaLiderB = (n: number): [number, number] => [AS_LIDER_B[n] - 4, AS_LIDER_B[n]];
export const AS_GARROTE = 74;
export const AS_RIVAL_8 = 75;
/** ás dos cinco do Conselho, em ordem; o Guardião-Mor leva o lendário no 77 */
export const AS_CONSELHO = [73, 74, 75, 76, 77];
export const FAIXA_CONSELHO: [number, number] = [72, 77];
/** ás do "próximo chefe" de um passo do mapa B: 9–16 = líder; 17 (Pico) = Garrote */
export const asDoPassoB = (p: number): number => (p <= 16 ? AS_LIDER_B[Math.max(9, p)] : AS_GARROTE);
