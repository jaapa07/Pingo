// QA 4 — roteiros dos ginásios 9–16 (soluções escritas nos comentários das zonas B2…B8-ginasio e A9-ginasio),
// como passos do piloto: 'seq' = teclas, '!d' = virar e apertar A, [x, y, rótulo] = conferência de posição,
// { ate: [x, y], ev: 'chars' } = andar pelo BFS evitando os tiles com esses caracteres (lama, trilho, fogueira).
const R = (...xs) => xs.map((x) => (typeof x === 'string' ? (x.startsWith('!') ? { agir: x.slice(1) } : { ir: x }) : Array.isArray(x) ? { em: [x[0], x[1]], r: x[2] } : x));
const CUIDAR = { cuidar: 1 };
const A = (x, y, ev) => ({ ate: [x, y], ev });
const PI = (x, y) => ({ pisar: [x, y] });
/** solução escrita com espaços e "A-d" (empurrar/agir) → passos do piloto */
const SOL = (txt) => txt.trim().split(/\s+/).map((k) => (k.startsWith('A-') ? { agir: k.slice(2) } : { ir: k }));
export const GINASIOS_B = {
  // 9 Terra (B2-ginasio): três cercados de lama; cada passo na lama é sem volta
  9: { zona: 'B2-ginasio', passos: R('n', [8, 16, 'beira do cercado 1'], 'n', 'oonlllsln', 'nn', [10, 12, 'passarela 1'],
    A(5, 12, 'lfp'), [5, 12, 'pé do cercado 2'], 'n', 'lllnllslnnoooosoonl', 'nn', [6, 7, 'passarela 2'],
    A(9, 7, 'lfp'), [9, 7, 'pé do cercado 3'], 'n', 'nllslnlslnnoooooososonosonnlll', 'nn', [7, 2, 'salão da líder'],
    A(9, 2, 'lfp'), CUIDAR, '!n') },
  // 12 Ginga (B5-ginasio): três rodas de capoeira no ritmo do berimbau (o piloto devolve a seta chamada na batida)
  12: { zona: 'B5-ginasio', passos: R(A(14, 13, ''), '!n', A(14, 11, ''), [14, 11, 'passou a roda 1'], A(5, 8, ''), '!n', A(5, 6, ''), [5, 6, 'passou a roda 2'],
    A(10, 4, ''), '!n', A(10, 2, ''), [10, 2, 'salão do líder'], CUIDAR, '!n') },
  // 13 Veneno (B6-ginasio): três tanques de piso tóxico, fôlego 3, plantas-antídoto
  13: { zona: 'B6-ginasio', passos: R(A(8, 15, 'x,'), [8, 15, 'boca do tanque A'], 'nonnnolllllln', [12, 10, 'saída do tanque A'],
    A(18, 16, 'x,'), [18, 16, 'boca do tanque B'], 'nnnnllllssllslllnnnonon', [25, 10, 'saída do tanque B'],
    A(26, 6, 'x,'), [26, 6, 'boca do tanque C'], 'nnnnnsooossooooooonnoooo', [12, 2, 'saída do tanque C'],
    A(6, 2, 'x,'), CUIDAR, '!n') },
  // 14 Geada (B7-ginasio): três pistas de gelo, blocos empurráveis nas pistas 2 e 3
  14: { zona: 'B7-ginasio', passos: [...R(A(5, 15, 'g'), [5, 15, 'boca da pista 1']), ...SOL('n o n l s l n l s l l n o s l n'), ...R([12, 10, 'saída da pista 1'],
    A(20, 16, 'g'), [20, 16, 'boca da pista 2']), ...SOL('n o n o n l s l A-l s l n A-n s o n o n l s l n l n'), ...R([26, 10, 'saída da pista 2'],
    A(28, 8, 'g'), [28, 8, 'boca da pista 3']), ...SOL('n l s o n l s A-s l l s o A-o o s o A-n l n l n o s o n o n o n'), ...R([19, 2, 'saída da pista 3'],
    A(8, 3, 'g'), CUIDAR, '!n')],
    // volta do salão da líder até a porta (só pelo gelo; busca com os blocos em qa4 scratch gelo2.py): pista 3 ao contrário, 2 e 1
    volta: [...R([8, 3, 'diante da líder']), ...SOL('l n n l l l l l l l l l l s s l s l s l l l s s o o s s o s o n o n l s l A-l n l s o A-s s l s A-o o o s s o o o o n n n n n n n n o o o o s s l n o s o s o n o s l s s s l l l'), A(8, 17, 'g'), ...R([8, 17, 'porta do ginásio'])] },
  // 15 Mente (B8-ginasio): portais de constelação × quatro horas do céu (solução do comentário da zona)
  15: { zona: 'B8-ginasio', passos: R(PI(5, 15), PI(20, 3), PI(1, 5), PI(1, 5), PI(1, 5), PI(6, 3), PI(20, 10), PI(5, 15), PI(11, 8), PI(20, 3),
    A(13, 2, 'o,'), [13, 2, 'ilha da líder'], CUIDAR, '!n'),
    // volta (alvorada; busca em ilha × hora em qa4 scratch portais.py): P15 → P10, P11 → P5, P6 → P0 (entrada)
    volta: R(PI(13, 3), PI(24, 5), PI(15, 8), A(8, 17, 'o,'), [8, 17, 'porta do ginásio']) },
  // 16 Lenda (A9-ginasio): as quatro provas (fogo, terra, vento, água) e a porta de taquara
  16: { zona: 'A9-ginasio', passos: [...R(A(12, 12, 'x'), [12, 12, 'entrada da ala do fogo']), ...SOL('o n s s s o o o o n n n l n o l o o o s s s s o n l s o o n n o'), ...R([2, 12, 'marca do fogo'],
    A(10, 6, 'xo'), [10, 6, 'entrada da ala da terra']), ...SOL('o o A-n l l n A-o o A-o l n n o o A-s l l s s o A-o o A-o o A-o s o o A-n n A-n n l n A-o o A-o o A-o o o n'), ...R(
    A(20, 8, 'xog'), [20, 8, 'entrada da ala do vento']), ...SOL('l l l l l l l o l o o o o l l l n l l n l l l'), ...R(
    A(20, 12, 'xog'), [20, 12, 'entrada da ala da água']), ...SOL('l s l l n l s s n o o o o l n o n n l o s s s l l l n s l n s s'), ...R(
    A(15, 2, 'xog'), [15, 2, 'câmara do Pajé'], CUIDAR, '!n')] },
  // 10 Pedra (B3-ginasio): vagonetes e chaves de desvio
  10: { zona: 'B3-ginasio', passos: R(A(10, 15, ':o'), '!n', A(3, 8, ':o'), '!n', A(5, 9, ':o'), '!s',
    A(12, 15, ':o'), '!n', A(10, 15, ':o'), '!n', A(18, 8, ':o'), '!n', A(15, 9, ':o'), '!s',
    A(12, 15, ':o'), '!n', A(10, 15, ':o'), '!n', A(3, 8, ':o'), '!n', A(10, 2, ':o'), CUIDAR, '!n'),
    // volta: os vagonetes descem pelo mesmo trilho (o de cima para a galeria oeste, o da galeria oeste para a entrada)
    volta: R(A(3, 2, ':o'), '!s', [3, 8, 'galeria oeste'], A(5, 9, ':o'), '!s', [10, 15, 'pé do trilho da entrada']) },
  // 11 Brasa (B4-ginasio): fogueiras na ordem da música de cada sanfoneiro
  11: { zona: 'B4-ginasio', passos: R(A(2, 13, 'bx'), '!n', A(15, 14, 'bx'), '!n', A(5, 14, 'bx'), '!n', A(10, 14, 'bx'), '!n',
    A(12, 10, 'b'), [12, 10, 'passou as brasas 1'], A(18, 9, 'b'), '!n',
    A(4, 10, 'bx'), '!n', A(16, 10, 'bx'), '!n', A(8, 10, 'bx'), '!n', A(12, 10, 'bx'), '!n',
    A(8, 6, 'b'), [8, 6, 'passou as brasas 2'], A(2, 5, 'bx'), '!n',
    A(9, 6, 'bx'), '!n', A(3, 6, 'bx'), '!n', A(12, 6, 'bx'), '!n', A(15, 6, 'bx'), '!n', A(6, 6, 'bx'), '!n',
    A(10, 2, 'b'), [10, 2, 'salão da líder'], CUIDAR, '!n') },
};
