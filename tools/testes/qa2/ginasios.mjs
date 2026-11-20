// Roteiros dos quebra-cabeças dos ginásios 5–8 (soluções de tools/testes/ginasios/t5, t6, t7 e g8), como teclas e
// conferências de posição. Entrada sempre em (8, 17) olhando para o norte.
const R = (...xs) => xs.map((x) => (typeof x === 'string' ? (x.startsWith('!') ? { agir: x.slice(1) } : { ir: x }) : Array.isArray(x) ? { em: [x[0], x[1]], r: x[2] } : x));
const CUIDAR = { cuidar: 1 };
export const GINASIOS = {
  5: { zona: 'A6-ginasio', passos: R('nnn', 'oooo', [4, 14, 'pé da ponte oeste'], 'nnn', [4, 11, 'ponte oeste'], 'oo', '!n', 'll', 'ssss', 'lllllll', [11, 15, 'chave 1'], '!l',
    'n', 'lll', 'nnn', [14, 11, 'ponte leste'], 'n', 'ooooooooooo', [3, 10, 'relé'], '!o', 'lllllllllll', 'nnn', [14, 7, 'ponte norte'], 'n', 'ooo', 's', 'ooooooo', 'n', [4, 6, 'chave 3'], '!o',
    's', 'lllll', 'nnnnn', [9, 2, 'ponte do líder'], CUIDAR, '!n') },
  // 6 Assombro (t6): o 1º alçapão no escuro pega todo estreante; depois acende as lamparinas
  6: { zona: 'A7-ginasio', passos: R('n', [8, 16, 'entrada'], 'nn', [12, 15, 'alçapão devolve ao começo da sala 1'], 's', '!l', 'nnn', 'oooooooo', 'nn', [4, 11, 'sala 2'], 'o', '!o',
    'lnn', 'llll', 'ss', 'llllll', [14, 11, 'segunda lamparina da sala 2'], '!l', 'nn', 'oooo', 'nn', [10, 7, 'sala 3'], '!l',
    'nn', 'oooo', 'ss', 'oooo', 'n', [2, 6, 'lamparina oeste da sala 3'], '!o', 'nn', 'llllll', 'nn', [8, 2, 'salão da líder'], 'l', CUIDAR, '!n') },
  // 7 Ferro (t7): esteiras e engrenagens
  7: { zona: 'A8-ginasio', passos: R('nnn', [8, 14, 'pé da esteira da porta'], 'oooo', 's', '!o', 'n', 'llll', 'n', [8, 11, '1º andar'],
    'n', 'lllllll', [15, 10, 'engrenagem azul'], '!l', 'o', 'n', [14, 7, '2º andar pela esteira azul'], 'nl', '!l',
    'ooooooooo', 's', 'oooo', 'n', [2, 6, 'pé da esteira do noroeste'], 'n', [2, 2, 'mezanino'], 'o', '!n', 'll', 'l', [7, 2, 'salão da líder'], 'll', [9, 2, 'último operário'], 'n', CUIDAR, '!l') },
  // 8 Mata (g8): cipós que rebrotam em 15 passos, vasos de extrato e o Facão
  8: { zona: 'A10-ginasio', passos: R('nn', 'ololol', 'lllllll', [15, 15, 'canto do salão sul'], '!n', 'nnn', [15, 12, 'portinhola depois do Facão'], 'l', '!l',
    'onn', 'oooo', 'nn', 'll', [13, 8, 'corredor leste'], 'nn', [13, 6, 'subida da coluna 13 a tempo'], 'oonn', 'oooo', 'ss', [7, 6, 'fila 6'],
    'llss', 'o', [8, 8, 'vaso do meio, lado norte'], '!o', 'lnn', 'oooo', [5, 6, 'fila 6 a tempo'], 'nn', 'oooo', 'nn', [1, 2, 'salão da líder'], 'llll', [5, 2, 'diante da última treinadora'], 'llll', CUIDAR, '!n') },
};
