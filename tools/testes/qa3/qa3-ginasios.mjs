// QA 3 — roteiros dos ginásios 9–12 do mapa B (soluções escritas nos comentários das zonas B2/B3/B4-ginasio),
// como passos do piloto: 'seq' = teclas, '!d' = virar e apertar A, [x, y, rótulo] = conferência de posição,
// { ate: [x, y], ev: 'chars' } = andar pelo BFS evitando os tiles com esses caracteres (lama, trilho, fogueira).
const R = (...xs) => xs.map((x) => (typeof x === 'string' ? (x.startsWith('!') ? { agir: x.slice(1) } : { ir: x }) : Array.isArray(x) ? { em: [x[0], x[1]], r: x[2] } : x));
const CUIDAR = { cuidar: 1 };
const A = (x, y, ev) => ({ ate: [x, y], ev });
export const GINASIOS_B = {
  // 9 Terra (B2-ginasio): três cercados de lama; cada passo na lama é sem volta
  9: { zona: 'B2-ginasio', passos: R('n', [8, 16, 'beira do cercado 1'], 'n', 'oonlllsln', 'nn', [10, 12, 'passarela 1'],
    A(5, 12, 'lfp'), [5, 12, 'pé do cercado 2'], 'n', 'lllnllslnnoooosoonl', 'nn', [6, 7, 'passarela 2'],
    A(9, 7, 'lfp'), [9, 7, 'pé do cercado 3'], 'n', 'nllslnlslnnoooooososonosonnlll', 'nn', [7, 2, 'salão da líder'],
    A(9, 2, 'lfp'), CUIDAR, '!n') },
  // 10 Pedra (B3-ginasio): vagonetes e chaves de desvio
  10: { zona: 'B3-ginasio', passos: R(A(10, 15, ':o'), '!n', A(3, 8, ':o'), '!n', A(5, 9, ':o'), '!s',
    A(12, 15, ':o'), '!n', A(10, 15, ':o'), '!n', A(18, 8, ':o'), '!n', A(15, 9, ':o'), '!s',
    A(12, 15, ':o'), '!n', A(10, 15, ':o'), '!n', A(3, 8, ':o'), '!n', A(10, 2, ':o'), CUIDAR, '!n') },
  // 11 Brasa (B4-ginasio): fogueiras na ordem da música de cada sanfoneiro
  11: { zona: 'B4-ginasio', passos: R(A(2, 13, 'bx'), '!n', A(15, 14, 'bx'), '!n', A(5, 14, 'bx'), '!n', A(10, 14, 'bx'), '!n',
    A(12, 10, 'b'), [12, 10, 'passou as brasas 1'], A(18, 9, 'b'), '!n',
    A(4, 10, 'bx'), '!n', A(16, 10, 'bx'), '!n', A(8, 10, 'bx'), '!n', A(12, 10, 'bx'), '!n',
    A(8, 6, 'b'), [8, 6, 'passou as brasas 2'], A(2, 5, 'bx'), '!n',
    A(9, 6, 'bx'), '!n', A(3, 6, 'bx'), '!n', A(12, 6, 'bx'), '!n', A(15, 6, 'bx'), '!n', A(6, 6, 'bx'), '!n',
    A(10, 2, 'b'), [10, 2, 'salão da líder'], CUIDAR, '!n') },
};
