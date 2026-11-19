/**
 * Camadas da tela de título e padrões que se repetem (cada uma vira um PNG próprio em assets/ui/camadas/).
 * Os perfis (serra, mata) são desenhados coluna a coluna: a altura de cada coluna foi escolhida à mão.
 */
import type { Arte } from './icones';

/** desenha um perfil: para cada coluna, `alturas[x]` pixels a partir da base; `faixas` = [espessura, cor] de cima para baixo */
function perfil(h: number, alturas: number[], faixas: [number, string][]): string[] {
  const linhas: string[] = [];
  for (let y = 0; y < h; y++) {
    let l = '';
    for (const a of alturas) {
      const prof = y - (h - a);
      if (prof < 0) { l += '.'; continue; }
      let acc = 0, cor = faixas[faixas.length - 1][1];
      for (const [n, c] of faixas) { acc += n; if (prof < acc) { cor = c; break; } }
      l += cor;
    }
    linhas.push(l);
  }
  return linhas;
}
/** meio disco: larguras da metade esquerda, linha a linha */
const meia = (larg: number[], borda: string, miolo: string, brilho: string) => larg.map((w, y) => '.'.repeat(16 - w) + borda + (y < 12 ? brilho : miolo).repeat(Math.max(0, w - 1)));

export const CAMADAS: Arte[] = [
  { nome: 'sol', espelhoX: true, linhas: meia([3, 6, 8, 9, 10, 11, 12, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 12, 11, 10, 9, 8, 6, 3], 'j', 'j', 'k') },
  { nome: 'nuvem', linhas: [
    '.........77777..........',
    '......7777777777........',
    '....7777777777777.......',
    '..7777777777777777777...',
    '.7777777777777777777777.',
    '77777777777777777777777f',
    '.ffffffffffffffffffffff.',
    '....ffffffffffffff......',
  ] },
  { // serra distante (64 px, repete)
    nome: 'serra', cores: { A: '#7fa8d8', B: '#5f86c0', C: '#4a6aa8' },
    linhas: perfil(34, [10, 11, 12, 14, 15, 17, 19, 20, 22, 24, 25, 26, 28, 29, 30, 30, 31, 30, 29, 27, 26, 24, 23, 21, 20, 18, 17, 16, 15, 15, 16, 17, 18, 20, 21, 22, 23, 24, 24, 25, 25, 24, 23, 22, 20, 19, 17, 16, 14, 13, 12, 11, 10, 9, 9, 8, 8, 8, 7, 8, 8, 9, 9, 10], [[2, 'A'], [9, 'B'], [99, 'C']]),
  },
  { // morros verdes (48 px, repete)
    nome: 'morros', cores: { A: '#6fc46a', B: '#3f9a52', C: '#2a7a4a' },
    linhas: perfil(26, [12, 13, 14, 15, 16, 17, 18, 18, 19, 19, 20, 20, 20, 20, 19, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 10, 9, 9, 9, 10, 10, 11, 12, 13, 14, 14, 15, 15, 15, 15, 14, 14, 13, 12, 12, 11, 11, 11], [[2, 'A'], [7, 'B'], [99, 'C']]),
  },
  { // copas da mata em primeiro plano (32 px, repete)
    nome: 'mata', cores: { A: '#8fd45a', B: '#4fa346', C: '#2f6b3a', D: '#1e4a30' },
    linhas: perfil(30, [20, 22, 24, 25, 26, 26, 27, 27, 26, 26, 25, 23, 21, 19, 21, 23, 24, 26, 27, 28, 29, 29, 28, 28, 27, 26, 24, 22, 20, 18, 17, 18], [[2, 'A'], [5, 'B'], [8, 'C'], [99, 'D']]),
  },
  { // mar ao fundo: faixa de ondas (16 px, repete)
    nome: 'mar', linhas: [
      'dddddddddddddddd',
      'ddeeddddddddeedd',
      'ddddddffdddddddd',
      'dddddddddddddddd',
      'ddddddddddeedddd',
      'cceedddddddddddc',
      'cccccddddddccccc',
      'cccccccccccccccc',
    ] },
  { // trançado de palha escuro: fundo fora do palco
    nome: 'palha', cores: { A: '#211824', B: '#2e212c', C: '#3d2c36' },
    linhas: ['CCCABCBA', 'BBBABCBA', 'CCCABCBA', 'AAAABCBA', 'BCBACCCA', 'BCBABBBA', 'BCBACCCA', 'BCBAAAAA'],
  },
];

/** monta uma linha de máscara a partir de trechos [início, fim) */
const m = (w: number, ...trechos: [number, number][]) => { const l = Array<string>(w).fill('.'); for (const [a, b] of trechos) for (let i = a; i < b; i++) l[i] = '#'; return l.join(''); };
const vezes = (n: number, l: string) => Array.from({ length: n }, () => l);

/** "PINGO": máscaras das letras (26 linhas); o I leva um pingo d'água no lugar do topo */
export const LOGO = {
  pingo: [
    [m(20, [0, 16]), m(20, [0, 18]), m(20, [0, 19]), ...vezes(3, m(20, [0, 20])), m(20, [0, 7], [13, 20]), ...vezes(3, m(20, [0, 7], [14, 20])), m(20, [0, 7], [13, 20]), ...vezes(2, m(20, [0, 20])), m(20, [0, 19]), m(20, [0, 18]), m(20, [0, 16]), ...vezes(10, m(20, [0, 7]))],
    [m(10, [4, 6]), m(10, [4, 6]), m(10, [3, 7]), m(10, [2, 8]), m(10, [1, 9]), m(10, [1, 9]), m(10, [2, 8]), m(10), m(10), ...vezes(4, m(10, [0, 10])), ...vezes(9, m(10, [1, 9])), ...vezes(4, m(10, [0, 10]))],
    [0, 0, 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10, 11, 12, 12, 13, 13].map((d) => m(20, [0, 7], [d, d + 7], [13, 20])),
    [m(20, [6, 16]), m(20, [4, 18]), m(20, [2, 19]), m(20, [1, 20]), m(20, [1, 20]), m(20, [0, 20]), m(20, [0, 8], [13, 20]), m(20, [0, 7], [14, 20]), ...vezes(3, m(20, [0, 7])), ...vezes(5, m(20, [0, 7], [10, 20])), ...vezes(3, m(20, [0, 7], [14, 20])), m(20, [0, 8], [13, 20]), m(20, [0, 20]), m(20, [1, 20]), m(20, [1, 20]), m(20, [2, 19]), m(20, [4, 18]), m(20, [6, 16])],
    [m(20, [6, 14]), m(20, [4, 16]), m(20, [2, 18]), m(20, [1, 19]), m(20, [1, 19]), m(20, [0, 20]), m(20, [0, 8], [12, 20]), ...vezes(12, m(20, [0, 7], [13, 20])), m(20, [0, 8], [12, 20]), m(20, [0, 20]), m(20, [1, 19]), m(20, [1, 19]), m(20, [2, 18]), m(20, [4, 16]), m(20, [6, 14])],
  ],
};
