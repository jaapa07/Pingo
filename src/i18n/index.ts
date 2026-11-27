/**
 * Idiomas do jogo (docs/I18N.md). Os dados e o código continuam em português; o catálogo EN mapeia o texto PT exato
 * (ou o modelo com marcadores) para o texto em inglês, e a troca acontece onde o texto vira tela:
 *  - `tela(str)`: usado por `ui/fonte.ts` (texto/escrever/medir/quebrar) e por `substituir` do diálogo — troca a frase
 *    inteira se ela estiver no catálogo; senão devolve como veio (cai para o PT, nunca quebra);
 *  - `tr(modelo, valores)`: frases montadas em código. `tr('{nome} usou {golpe}!', { nome, golpe })`. Os valores de texto
 *    também passam pelo catálogo (nome de golpe, de item, de tipo…); nomes de criaturas e pessoas não estão nele e passam
 *    iguais. Marcadores são `{palavra}`; `{c:cor}…{/c}`, `{JOGADOR}`/`{RIVAL}` (sem valor), `\n` e `\f` passam intactos.
 * Em português nada é consultado: `tr` só preenche o modelo, e o resultado é idêntico ao texto montado antes.
 * Este módulo não toca no DOM nem em `import.meta.glob` (o motor de batalha roda também no Node, nos testes);
 * a carga do catálogo fica em `i18n/carga.ts`.
 */
export type Idioma = 'pt' | 'en';
export const IDIOMAS: Idioma[] = ['pt', 'en'];

let idioma: Idioma = 'pt';
const catalogo = new Map<string, string>();
/** saídas recentes de `tr` em inglês: `tela` não as acusa como texto sem tradução */
const produzidos = new Set<string>();
const faltas = new Set<string>();
const DEV = !!(import.meta as { env?: { DEV?: boolean } }).env?.DEV;

export const idiomaAtual = (): Idioma => idioma;
export const emIngles = () => idioma === 'en';
export function definirIdioma(i: Idioma) { idioma = i === 'en' ? 'en' : 'pt'; }
/** acrescenta traduções ao catálogo (valores vazios são ignorados: caem para o PT) */
export function instalarCatalogo(pares: Record<string, string>) { for (const [k, v] of Object.entries(pares)) if (v) catalogo.set(k, v); }
export const tamanhoCatalogo = () => catalogo.size;
/** textos que apareceram em inglês sem tradução nesta sessão (só em desenvolvimento; os testes leem por window.__pingo.i18n) */
export const semTraducao = () => [...faltas];

/** idioma sugerido pelo navegador: "pt…" → português; o resto → inglês */
export function idiomaDoNavegador(): Idioma {
  const n = typeof navigator !== 'undefined' ? navigator.languages?.[0] ?? navigator.language ?? '' : '';
  return /^pt\b/i.test(n) ? 'pt' : 'en';
}

function faltou(s: string) {
  if (!DEV || faltas.has(s) || produzidos.has(s) || !/[A-Za-zÀ-ÿ]{2}/.test(s)) return;
  faltas.add(s); console.info('[i18n] sem tradução:', JSON.stringify(s));
}
function produzido(s: string) { if (produzidos.size > 4000) produzidos.clear(); produzidos.add(s); return s; }

/** tradução exata de uma frase pronta (sem marcadores a preencher); sem tradução devolve a própria frase */
export function t(s: string): string {
  if (idioma === 'pt' || !s) return s;
  const e = catalogo.get(s);
  if (e !== undefined) return produzido(e);
  faltou(s); return s;
}
/** usado no ponto em que o texto vira tela (fonte bitmap e diálogo) */
export function tela(s: string): string {
  if (idioma === 'pt' || !s) return s;
  const e = catalogo.get(s);
  if (e !== undefined) return e;
  faltou(s); return s;
}

export type Valores = Record<string, string | number | null | undefined>;
const MARCADOR = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;
/** frase montada: troca o modelo (se houver tradução) e preenche os marcadores; valores de texto também são traduzidos */
export function tr(modelo: string, valores?: Valores): string {
  const ing = idioma === 'en';
  let m = modelo;
  if (ing) { const e = catalogo.get(modelo); if (e !== undefined) m = e; else faltou(modelo); }
  if (valores) m = m.replace(MARCADOR, (todo, k: string) => { if (!(k in valores)) return todo; const v = valores[k]; return v == null ? '' : typeof v === 'number' ? String(v) : ing ? (catalogo.get(v) ?? v) : v; });
  return ing ? produzido(m) : m;
}
/** junta uma lista como na fala: "A, B e C" / "A, B and C" (`conj` 'ou' → "ou"/"or"); os itens já vêm traduzidos */
export function juntar(itens: string[], conj: 'e' | 'ou' = 'e'): string {
  const c = idioma === 'en' ? (conj === 'e' ? 'and' : 'or') : conj;
  return itens.length < 2 ? (itens[0] ?? '') : itens.slice(0, -1).join(', ') + ' ' + c + ' ' + itens[itens.length - 1];
}
/** marcadores `{x}` de um texto (sem cores), em ordem alfabética — o PT e o EN de uma entrada precisam ter os mesmos */
export function marcadores(s: string): string[] { return [...s.matchAll(MARCADOR)].map((x) => x[1]).sort(); }
