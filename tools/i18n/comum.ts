/**
 * Partes comuns das ferramentas de idioma (docs/I18N.md): áreas do catálogo, leitura/gravação dos JSON,
 * marcadores e medida de largura com a fonte bitmap do jogo.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import kit from '../../src/ui/gerado/kit.json';

export const RAIZ = new URL('../..', import.meta.url).pathname;
export const PASTA_EN = join(RAIZ, 'src/i18n/en');

/** áreas do catálogo, na ordem de prioridade (um texto usado em duas áreas fica na primeira) */
export const AREAS = ['ui', 'batalha', 'itens', 'diario', 'eventos-a', 'eventos-b', 'extras'] as const;
export type Area = (typeof AREAS)[number];

/** uma entrada do catálogo: `en` vazio = a traduzir; `ctx` ajuda o tradutor (arquivo:linha · quem fala/campo) */
export interface Entrada { en: string; ctx: string; obs?: string }
export type Catalogo = Record<string, Entrada>;

const num = (s: string) => Number(/(\d+)/.exec(s)?.[1] ?? 0);
/** área de um arquivo de src/ (caminho relativo à raiz, com "/") ou null se o arquivo não tem texto de jogo */
export function areaDe(rel: string): Area | null {
  const f = rel.replace(/^src\//, '');
  if (/^(audio|render)\//.test(f) || /^data\/(music|tilesets)\//.test(f) || /^data\/(sfx|gritos|catalogo-objetos|catalogo-interiores)\.ts$/.test(f)) return null;
  if (/^data\/zonas\/_(demo|teste)-/.test(f) || /vitrine\.ts$/.test(f) || /^i18n\//.test(f) || /\.d\.ts$/.test(f)) return null;
  if (/^data\/criaturas/.test(f)) return 'diario';
  if (/^battle\//.test(f) || /^data\/(golpes|tabela-tipos|personalidades)\.ts$/.test(f)) return 'batalha';
  if (/^data\/(itens|decoracao)\.ts$/.test(f)) return 'itens';
  if (/^data\/(radio|quiz|gincana|safari|torre|trocas|revancha|ninhos)\.ts$/.test(f) || /^core\/demo\.ts$/.test(f)
    || /^ui\/telas\/(gincana|gincana-safari|radio|creditos|fim-demo)\.ts$/.test(f) || /^world\/mecanicas\/safari\.ts$/.test(f)) return 'extras';
  let m: RegExpExecArray | null;
  if ((m = /^data\/eventos\/(.+)\.ts$/.exec(f))) {
    const n = m[1];
    if (/^ginasio-/.test(n)) return num(n) <= 8 ? 'eventos-a' : 'eventos-b';
    return /^(a1|a2|captura|comuns|regras|_motor)$/.test(n) ? 'eventos-a' : 'eventos-b';
  }
  if ((m = /^data\/treinadores\/(.+)\.ts$/.exec(f))) {
    const n = m[1];
    if (/^ginasio-/.test(n)) return num(n) <= 8 ? 'eventos-a' : 'eventos-b';
    return /^(a1|a2)$/.test(n) ? 'eventos-a' : 'eventos-b';
  }
  if ((m = /^data\/zonas\/(.+)\.ts$/.exec(f))) return /^(A-LG|B|PP|X-|_b)/.test(m[1]) ? 'eventos-b' : 'eventos-a';
  if ((m = /^world\/mecanicas\/ginasio-(\d+)\.ts$/.exec(f))) return Number(m[1]) <= 8 ? 'eventos-a' : 'eventos-b';
  if (/^world\/mecanicas\/(x-ea|_apoio-9a16)\.ts$/.test(f)) return 'eventos-b';
  return 'ui';
}

export const arquivoDaArea = (a: Area) => join(PASTA_EN, a + '.json');
export function lerArea(a: Area): Catalogo { const p = arquivoDaArea(a); return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as Catalogo) : {}; }
export function gravarArea(a: Area, c: Catalogo) { writeFileSync(arquivoDaArea(a), JSON.stringify(c, null, 1) + '\n'); }
export function lerTudo(): Map<Area, Catalogo> { const r = new Map<Area, Catalogo>(); for (const a of AREAS) r.set(a, lerArea(a)); return r; }
export const areasNoDisco = () => (existsSync(PASTA_EN) ? readdirSync(PASTA_EN).filter((f) => f.endsWith('.json')) : []);

/* ------------------------------ marcadores ------------------------------ */
export const marcadoresDe = (s: string) => [...s.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((x) => x[1]).sort().join(',');
export const coresDe = (s: string) => [...s.matchAll(/\{c:([a-z]+)\}/g)].map((x) => x[1]).sort().join(',');
export const fechaCores = (s: string) => (s.match(/\{c:[a-z]+\}/g) ?? []).length === (s.match(/\{\/c\}/g) ?? []).length;
export const palavras = (s: string) => s.replace(/\{[^}]*\}/g, ' ').split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ0-9]/.test(w)).length;

/* ------------------------------ fonte ------------------------------ */
interface MetaFonte { espaco: number; glifos: Record<string, number[]> }
const FONTES = (kit as unknown as { fontes: Record<string, MetaFonte> }).fontes;
const limpo = (s: string) => s.replace(/\{c:[a-z]+\}|\{\/c\}/g, '');
/** caracteres do texto que a fonte bitmap não tem (viram "?" no jogo) */
export function semGlifo(s: string): string[] {
  const f = FONTES['12'], r = new Set<string>();
  for (const ch of limpo(s).replace(/\{[A-Za-z][A-Za-z0-9_]*\}/g, '')) if (ch !== ' ' && ch !== '\n' && ch !== '\f' && !f.glifos[ch]) r.add(ch);
  return [...r];
}
/** largura em px da linha mais larga (`\n` e `\f` quebram), como `medir` de src/ui/fonte.ts; marcadores contam 40 px */
export function largura(s: string, tam: 8 | 12 = 12): number {
  const f = FONTES[String(tam)];
  let max = 0;
  for (const linha of limpo(s).replace(/\{[A-Za-z][A-Za-z0-9_]*\}/g, 'MMMMMM').split(/[\n\f]/)) {
    let w = 0, n = 0;
    for (const ch of linha.trimEnd()) { w += (ch === ' ' ? f.espaco : (f.glifos[ch] ?? f.glifos['?'])[1]) + 1; n++; }
    max = Math.max(max, n ? w - 1 : 0);
  }
  return max;
}
/** número de caixas de 2 linhas que o texto ocupa na caixa de fala (304×48, texto de 280 px na fonte 12) */
export function paginasDeFala(s: string): number {
  const f = FONTES['12'];
  let total = 0;
  for (const caixa of limpo(s).replace(/\{JOGADOR\}|\{RIVAL\}/g, 'MMMMMMMM').replace(/\{[A-Za-z][A-Za-z0-9_]*\}/g, 'MMMMMM').split('\f')) {
    let linhas = 0;
    for (const par of caixa.split('\n')) {
      let x = 0; linhas++;
      for (const w of par.split(' ')) {
        let wp = 0; for (const ch of w) wp += (f.glifos[ch] ?? f.glifos['?'])[1] + 1;
        if (x && x + wp - 1 > 280) { linhas++; x = 0; }
        x += wp + f.espaco + 1;
      }
    }
    total += Math.ceil(linhas / 2);
  }
  return total;
}
