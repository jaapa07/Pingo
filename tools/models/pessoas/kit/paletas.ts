/**
 * Paletas autorais das pessoas. Cada rampa = [sombra, base, luz] escrita à mão,
 * com sombra puxando para o frio/roxo e luz para o quente.
 * Índices fixos das rampas de uma pessoa: 0 pele · 1 cabelo · 2 roupa A · 3 roupa B · 4 detalhe.
 */
export type Rampa = [string, string, string];

export const R_PELE = 0, R_CAB = 1, R_A = 2, R_B = 3, R_D = 4;

export const PELES = {
  clara: ['#c4846e', '#efbf9c', '#ffe2c6'],
  rosada: ['#c07a74', '#f0b4a0', '#ffdccb'],
  oliva: ['#9c6950', '#cf9e76', '#f0cb9e'],
  canela: ['#a3604a', '#d6956a', '#f3c090'],
  morena: ['#874c3e', '#bb7850', '#e0a676'],
  castanha: ['#6b3a34', '#99593f', '#c6855c'],
  retinta: ['#4b2b33', '#744534', '#a16a4a'],
} satisfies Record<string, Rampa>;
export type NomePele = keyof typeof PELES;

export const CABELOS = {
  preto: ['#1c1a2c', '#33304c', '#56527a'],
  azeviche: ['#221a26', '#3c2c38', '#63485a'],
  castanhoEscuro: ['#2f1c26', '#52302c', '#7d4e3a'],
  castanho: ['#4c2a28', '#7c4a32', '#aa7242'],
  mel: ['#7a4a2a', '#b47a3a', '#dea85a'],
  loiro: ['#a06c30', '#dcaa48', '#f8da7c'],
  ruivo: ['#7c2a22', '#ba4a2c', '#ea7e44'],
  grisalho: ['#55566e', '#8c8ea4', '#c2c5d2'],
  branco: ['#8689a6', '#cdd0e0', '#fafaff'],
  prata: ['#6a7088', '#a8afc2', '#e2e6ee'],
} satisfies Record<string, Rampa>;
export type NomeCabelo = keyof typeof CABELOS;

/** Tecidos, couros, palhas e metais. */
export const TONS = {
  // quentes
  urucum: ['#7e1f2e', '#c2382e', '#ee6a3c'],
  coral: ['#a83a4a', '#e8634e', '#ffa070'],
  goiaba: ['#a3405e', '#e0698a', '#ffa3ae'],
  pitanga: ['#8c2440', '#d23c54', '#f77e78'],
  laranja: ['#a8481e', '#e87c22', '#ffb648'],
  ouro: ['#a8701e', '#e8ae2a', '#ffe06a'],
  ipe: ['#b07a14', '#f0c020', '#fff07a'],
  manteiga: ['#b89858', '#ecd58e', '#fff6c8'],
  // verdes
  mata: ['#1c4a3a', '#2c7a48', '#5cb45a'],
  folha: ['#2a6238', '#48a048', '#8cd65e'],
  limao: ['#5a8a22', '#96c832', '#d6f06a'],
  musgo: ['#3c4a2a', '#66763a', '#98a85a'],
  oliva: ['#4a4a26', '#7a7836', '#aeaa58'],
  // azuis
  petroleo: ['#14384c', '#1e6278', '#3c98a2'],
  mar: ['#1a4a7e', '#2a7cc0', '#5cb8ea'],
  ceu: ['#3a6aa8', '#6aa8e0', '#aadcf8'],
  anil: ['#221e5c', '#3a3a9a', '#6a70d2'],
  turquesa: ['#126a6c', '#22a89c', '#6ce0c4'],
  jeans: ['#2a3460', '#46589a', '#7890c8'],
  noite: ['#18183a', '#2a2c5e', '#4a5090'],
  // roxos
  jabuticaba: ['#2c1640', '#4e2a6c', '#7e4ea4'],
  lilas: ['#5e4a98', '#9a82d2', '#d0bcf4'],
  vinho: ['#4a1430', '#7c2444', '#b04860'],
  orquidea: ['#7a2c7a', '#b84cb0', '#ea8ade'],
  // neutros
  branco: ['#9aa0bc', '#e4e6f0', '#ffffff'],
  cru: ['#a08a70', '#d8c8a4', '#f8eed0'],
  renda: ['#b0a8b8', '#f0e8e4', '#ffffff'],
  cinza: ['#4a4c62', '#7a7e92', '#b0b6c4'],
  chumbo: ['#2a2a3c', '#484a5e', '#70748a'],
  carvao: ['#252232', '#403d52', '#66637e'],
  // terra, couro, palha, madeira
  palha: ['#a87a34', '#dab45a', '#f8e294'],
  bambu: ['#8a8a34', '#c8c058', '#f0ec98'],
  couro: ['#5a2e22', '#8e4e2c', '#c07e44'],
  couroClaro: ['#8a5a30', '#c08a48', '#e6ba74'],
  barro: ['#7a3a2a', '#b25e38', '#de905a'],
  terra: ['#4a3028', '#74503a', '#a47c58'],
  caqui: ['#7a6a48', '#b0a070', '#dccc9c'],
  ferrugem: ['#6a2a1c', '#a84a22', '#de7e34'],
  // metais
  ferro: ['#3a4058', '#6a7690', '#a8b8c8'],
  latao: ['#7a5a1e', '#c09a34', '#f0d870'],
  cobre: ['#7a3a2a', '#c06a3a', '#f0a868'],
  prata: ['#6a7490', '#aab6cc', '#eef4fa'],
} satisfies Record<string, Rampa>;
export type NomeTom = keyof typeof TONS;

export function lum(h: string) {
  const n = parseInt(h.slice(1), 16);
  return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11;
}
