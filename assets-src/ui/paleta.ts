/**
 * Paleta autoral da interface de Adventures of Pingo (31 cores + transparente).
 * Cada cor tem um caractere; as artes em `assets-src/ui/*.ts` são grades desses caracteres.
 */
export const PALETA: Record<string, string> = {
  '0': '#1a1423', // tinta (contorno)
  '1': '#3b2a35', // sombra quente
  '2': '#6b4226', // madeira escura
  '3': '#9c6434', // madeira média
  '4': '#c98f4e', // madeira clara
  '5': '#e8c07a', // palha / ouro claro
  '6': '#f6e6b8', // creme (papel)
  '7': '#fff8e7', // branco quente
  '8': '#2f6b3a', // verde escuro
  '9': '#4fa346', // verde médio
  a: '#8fd45a', // verde claro
  b: '#d9f07a', // verde-limão
  c: '#1f4f7a', // azul escuro
  d: '#2f86c4', // azul médio
  e: '#6fc7e8', // azul claro
  f: '#c8f0f4', // azul gelo
  g: '#a32638', // vermelho escuro
  h: '#e0483c', // vermelho
  i: '#f58a4b', // laranja
  j: '#f9c22b', // amarelo
  k: '#fff07a', // amarelo claro
  l: '#5b3a8c', // roxo escuro
  m: '#9a5fc4', // roxo
  n: '#e58ad0', // rosa
  o: '#f7c4e0', // rosa claro
  p: '#4a4a5e', // cinza escuro
  q: '#8a8aa0', // cinza médio
  r: '#c4c6d4', // cinza claro
  s: '#1f7a6c', // verde-água escuro
  t: '#3fbfa0', // verde-água
  u: '#7a4a2a', // terra
  v: '#b0784a', // terra clara
};

/** cores de texto disponíveis na fonte bitmap: nome → [cor, sombra] (caracteres da paleta) */
export const CORES_TEXTO: Record<string, [string, string]> = {
  branco: ['7', '0'], creme: ['6', '1'], tinta: ['0', '5'], cinza: ['q', '0'], chumbo: ['p', '5'],
  vermelho: ['h', '0'], verde: ['9', '0'], azul: ['d', '0'], amarelo: ['j', '0'], laranja: ['i', '0'],
  roxo: ['m', '0'], rosa: ['n', '0'], marrom: ['2', '5'], ouro: ['5', '1'], agua: ['t', '0'],
};

/** cor de cada tipo: [base, escura, clara] */
export const CORES_TIPO: Record<string, [string, string, string]> = {
  comum: ['#a8a090', '#6e6858', '#d0c8b8'], mata: ['#4fa346', '#2f6b3a', '#8fd45a'], brasa: ['#e0483c', '#a32638', '#f58a4b'],
  rio: ['#2f86c4', '#1f4f7a', '#6fc7e8'], trovao: ['#e0a81c', '#9a6410', '#fff07a'], geada: ['#5fc4d8', '#2a7f96', '#c8f0f4'],
  ginga: ['#c8662a', '#7a3a18', '#f0a060'], veneno: ['#9a4fb8', '#5b2a7c', '#d08ae8'], terra: ['#b0784a', '#6b4226', '#e0b080'],
  vento: ['#7fa8e0', '#4a68a8', '#c0dcf8'], mente: ['#e85a9a', '#9c2a5e', '#f8a8cc'], inseto: ['#9ab82a', '#5a7214', '#d0e86a'],
  pedra: ['#8a7a5c', '#524630', '#c0b08a'], assombro: ['#5a4a8c', '#2e2452', '#9a8ad0'], lenda: ['#3a5ad0', '#1e2e86', '#8aa0f0'],
  ferro: ['#7a8a9c', '#454f5e', '#b8c4d0'], encanto: ['#f07ab8', '#a83a78', '#fcc0e0'],
};
