/**
 * Auxiliar de autoria das zonas do time A2 (não é zona: não tem `export default`).
 * As grades são escritas à mão; para não contar colunas a olho, os pontos de interesse levam MARCAS
 * (caracteres fora da legenda de docs/ZONAS.md) que este módulo troca pelo chão indicado e devolve como coordenadas.
 *   - marca única: `g.p('a')` → { x, y }
 *   - marca repetida: `g.todos('q')` → [{ x, y }…] (fileiras de coqueiros, postes…)
 *   - `H` é reservado: miolo de prédio/objeto grande (vira o chão padrão) só para enxergar a planta na grade.
 *   - `|` é só régua visual (blocos de 10 colunas) e some antes da leitura.
 * Linhas com largura errada derrubam a carga com a lista completa dos erros.
 */
const LEGENDA = new Set('.,:;"%~dw=#Ttbfcprev<>glxCo+M ');

export interface Ponto { x: number; y: number }
export interface Grade {
  mapa: string[];
  p(marca: string): Ponto;
  todos(marca: string): Ponto[];
  /** ponto deslocado a partir de uma marca */
  d(marca: string, dx: number, dy: number): Ponto;
}

/**
 * @param id      id da zona (para as mensagens de erro)
 * @param largura largura esperada de todas as linhas
 * @param linhas  a grade com marcas
 * @param sob     marca → caractere de chão que fica no lugar (padrão `padrao`)
 * @param padrao  chão sob marcas sem entrada em `sob` (padrão '.')
 */
export function grade(id: string, largura: number, linhas: string[], sob: Record<string, string> = {}, padrao = '.'): Grade {
  const erros: string[] = [];
  const achados = new Map<string, Ponto[]>();
  const mapa = linhas.map((bruta, y) => {
    const l = bruta.split('|').join('');
    if (bruta.includes('|')) bruta.split('|').forEach((bl, i, t) => { if (bl.length !== 10 && !(i === t.length - 1 && bl.length < 10)) erros.push(`linha ${y}: bloco ${i} com ${bl.length} colunas (régua de 10)`); });
    if (l.length !== largura) erros.push(`linha ${y}: ${l.length} colunas (esperado ${largura})`);
    let s = '';
    for (let x = 0; x < l.length; x++) {
      const c = l[x];
      if (LEGENDA.has(c)) { s += c; continue; }
      if (c !== 'H') { const lista = achados.get(c) ?? []; lista.push({ x, y }); achados.set(c, lista); }
      s += sob[c] ?? padrao;
    }
    return s;
  });
  if (erros.length) throw new Error(`[zona ${id}] grade irregular:\n  ` + erros.join('\n  '));
  const todos = (m: string): Ponto[] => achados.get(m) ?? [];
  const p = (m: string): Ponto => {
    const l = todos(m);
    if (l.length !== 1) throw new Error(`[zona ${id}] a marca '${m}' aparece ${l.length} vezes (esperado 1)`);
    return l[0];
  };
  return { mapa, p, todos, d: (m, dx, dy) => { const q = p(m); return { x: q.x + dx, y: q.y + dy }; } };
}
