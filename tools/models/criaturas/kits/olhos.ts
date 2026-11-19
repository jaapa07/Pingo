/**
 * Carimbos de olho de partida (desenhados à mão, olhando para a DIREITA da tela; o pipeline espelha).
 * Letras: p pupila/contorno · w brilho branco · f cor do pelo em volta (defina `f` em paleta.extras com
 * o tom BASE da rampa onde o olho fica) · a íris colorida (defina `a`) · '.' não mexe no pixel.
 * São pontos de partida: copie, cole no arquivo da criatura e redesenhe para dar personalidade.
 * O carimbo fechado precisa cobrir o marcador (use `f`), senão sobra um ponto branco.
 */
/** conta redonda 4×4 com brilho — filhotes e bichos mansos */
export const conta = ['.pp.', 'ppwp', 'pppp', '.pp.'];
/** oval alta 4×5 — expressiva, para cabeças grandes */
export const oval = ['.pp.', 'ppwp', 'pppp', 'pppp', '.pp.'];
/** com íris colorida 4×5 */
export const iris = ['.pp.', 'ppwp', 'ppap', 'pppp', '.pp.'];
/** grande 5×5 com brilho duplo — estágios médios */
export const grande = ['.ppp.', 'pppwp', 'ppppp', 'pwppp', '.ppp.'];
/** bravo 5×5: sobrancelha caída para o focinho — estágios finais */
export const bravo = ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'];
/** sereno 5×5: pálpebra reta e cílio */
export const sereno = ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'];
/** rapina 5×4: sobrancelha clara, íris e pupila pequena */
export const rapina = ['wwww.', 'faapf', 'fappf', '.fff.'];
/** esclera branca 4×4 para olhos sobre máscara ou pele escura */
export const mascara = ['fwwf', 'wppw', 'wppw', 'fwwf'];
/** fechado em arco (dormindo/tonto/desmaiado) 4×4 e 5×5 */
export const fechado4 = ['ffff', 'pffp', '.pp.', 'ffff'];
export const fechado5 = ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'];
/** mapa: 1×2 escuro, ou com brilho */
export const mapa = ['p', 'p'];
export const mapaBrilho = ['w', 'p'];
