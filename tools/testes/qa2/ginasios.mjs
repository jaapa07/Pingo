// Roteiros dos quebra-cabeças dos ginásios 5–8 (soluções de tools/testes/ginasios/t5, t6, t7 e g8), como teclas e
// conferências de posição. Entrada sempre em (8, 17) olhando para o norte.
const R = (...xs) => xs.map((x) => (typeof x === 'string' ? (x.startsWith('!') ? { agir: x.slice(1) } : { ir: x }) : Array.isArray(x) ? { em: [x[0], x[1]], r: x[2] } : x));
const CUIDAR = { cuidar: 1 };
export const GINASIOS = {
  5: { zona: 'A6-ginasio', passos: R('nnn', 'oooo', [4, 14, 'pé da ponte oeste'], 'nnn', [4, 11, 'ponte oeste'], 'oo', '!n', 'll', 'ssss', 'lllllll', [11, 15, 'chave 1'], '!l',
    'n', 'lll', 'nnn', [14, 11, 'ponte leste'], 'n', 'ooooooooooo', [3, 10, 'relé'], '!o', 'lllllllllll', 'nnn', [14, 7, 'ponte norte'], 'n', 'ooo', 's', 'ooooooo', 'n', [4, 6, 'chave 3'], '!o',
    's', 'lllll', 'nnnnn', [9, 2, 'ponte do líder'], CUIDAR, '!n') },
};
