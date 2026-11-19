/**
 * Fonte bitmap autoral (8×8 e 8×12, proporcional). Todo texto do jogo passa por aqui: cada letra é um
 * <i> com a folha de glifos como fundo (background-position), em pixels nativos inteiros.
 *
 *   texto('Olá, {c:vermelho}Pingo{/c}!', { tamanho: 12, cor: 'tinta', sombra: false, largura: 200 })
 *
 * A origem do elemento é o topo da célula da letra; acentos de maiúsculas sobem até 3 px acima.
 */
import kit from './gerado/kit.json';

export type Tamanho = 8 | 12;
export type CorTexto = 'branco' | 'creme' | 'tinta' | 'cinza' | 'chumbo' | 'vermelho' | 'verde' | 'azul' | 'amarelo' | 'laranja' | 'roxo' | 'rosa' | 'marrom' | 'ouro' | 'agua';
export interface OpTexto {
  tamanho?: Tamanho;
  cor?: CorTexto;
  sombra?: boolean;
  /** largura máxima em px: quebra a linha entre palavras */
  largura?: number;
  alinhar?: 'esq' | 'centro' | 'dir';
  /** distância entre linhas (padrão: 10 na fonte 8, 14 na fonte 12) */
  entrelinha?: number;
}
interface MetaFonte { src: string; cw: number; ch: number; cols: number; topo: number; altura: number; entrelinha: number; espaco: number; bw: number; bh: number; vcols: number; cores: string[]; glifos: Record<string, number[]> }
const FONTES = kit.fontes as unknown as Record<string, MetaFonte>;
const meta = (t: Tamanho) => FONTES[String(t)];

interface Letra { ch: string; cor: number }
/** separa as marcações {c:cor}…{/c} e devolve as letras com a cor de cada uma (−1 = cor padrão) */
function letras(str: string, f: MetaFonte): Letra[] {
  const r: Letra[] = []; let cor = -1;
  const re = /\{c:([a-z]+)\}|\{\/c\}/g; let ult = 0, m: RegExpExecArray | null;
  const por = (s: string) => { for (const ch of s) r.push({ ch, cor }); };
  while ((m = re.exec(str))) { por(str.slice(ult, m.index)); cor = m[1] ? f.cores.indexOf(m[1]) : -1; ult = re.lastIndex; }
  por(str.slice(ult));
  return r;
}
const larguraDe = (f: MetaFonte, ch: string) => (ch === ' ' ? f.espaco : (f.glifos[ch] ?? f.glifos['?'])[1]);

/** quebra em linhas de no máximo `largura` px (palavra a palavra; `\n` força a quebra) */
function linhasDe(ls: Letra[], f: MetaFonte, largura: number): Letra[][] {
  const linhas: Letra[][] = [[]]; let x = 0;
  let palavra: Letra[] = [], wp = 0;
  const fecharPalavra = () => {
    if (!palavra.length) return;
    const atual = linhas[linhas.length - 1];
    if (atual.length && x + wp - 1 > largura) { while (atual.length && atual[atual.length - 1].ch === ' ') atual.pop(); linhas.push([]); x = 0; }
    linhas[linhas.length - 1].push(...palavra); x += wp; palavra = []; wp = 0;
  };
  for (const l of ls) {
    if (l.ch === '\n') { fecharPalavra(); linhas.push([]); x = 0; continue; }
    if (l.ch === ' ') { fecharPalavra(); if (linhas[linhas.length - 1].length) { linhas[linhas.length - 1].push(l); x += f.espaco + 1; } continue; }
    palavra.push(l); wp += larguraDe(f, l.ch) + 1;
  }
  fecharPalavra();
  return linhas;
}
const larguraLinha = (l: Letra[], f: MetaFonte) => { let n = l.length; while (n && l[n - 1].ch === ' ') n--; let w = 0; for (let i = 0; i < n; i++) w += larguraDe(f, l[i].ch) + 1; return Math.max(0, w - 1); };

/** largura em px de uma linha de texto (sem quebra) */
export function medir(str: string, tamanho: Tamanho = 8): number { const f = meta(tamanho); return larguraLinha(letras(str.replace(/\n/g, ' '), f), f); }
/** quebra o texto em linhas (sem marcação de cor) que cabem em `largura` */
export function quebrar(str: string, largura: number, tamanho: Tamanho = 8): string[] { const f = meta(tamanho); return linhasDe(letras(str, f), f, largura).map((l) => l.map((x) => x.ch).join('').trimEnd()); }

const guardado = new WeakMap<HTMLElement, OpTexto>();
/** (re)escreve o conteúdo de um elemento criado por `texto` */
export function escrever(el: HTMLElement, str: string, o?: OpTexto): HTMLElement {
  const op = { ...(guardado.get(el) ?? {}), ...(o ?? {}) }; guardado.set(el, op);
  const tam = op.tamanho ?? 8, f = meta(tam), sombra = op.sombra ?? false;
  const corBase = Math.max(0, f.cores.indexOf(op.cor ?? 'branco'));
  const linhas = linhasDe(letras(String(str), f), f, op.largura ?? 1e9);
  const entre = op.entrelinha ?? f.entrelinha;
  const largs = linhas.map((l) => larguraLinha(l, f));
  const W = op.largura ?? Math.max(0, ...largs);
  let html = '', n = 0;
  linhas.forEach((l, j) => {
    let x = op.alinhar === 'centro' ? Math.floor((W - largs[j]) / 2) : op.alinhar === 'dir' ? W - largs[j] : 0;
    const y = j * entre - f.topo;
    for (const g of l) {
      if (g.ch === ' ') { x += f.espaco + 1; continue; }
      const [i, w] = f.glifos[g.ch] ?? f.glifos['?'];
      const v = (g.cor >= 0 ? g.cor : corBase) * 2 + (sombra ? 1 : 0);
      const bx = (v % f.vcols) * f.bw + (i % f.cols) * f.cw, by = Math.floor(v / f.vcols) * f.bh + Math.floor(i / f.cols) * f.ch;
      html += `<i class="g${tam}" style="left:${x}px;top:${y}px;width:${w + (sombra ? 1 : 0)}px;background-position:-${bx}px -${by}px"></i>`;
      x += w + 1; n++;
    }
  });
  el.innerHTML = html;
  el.style.width = W + 'px';
  el.style.height = (linhas.length - 1) * entre + f.altura + 'px';
  el.dataset.linhas = String(linhas.length); el.dataset.letras = String(n);
  return el;
}
/** cria um bloco de texto. O elemento tem largura/altura em px e `position: relative` (posicione com left/top). */
export function texto(str: string, o: OpTexto = {}): HTMLElement {
  const el = document.createElement('div'); el.className = 'txt';
  return escrever(el, str, o);
}
/** mostra só as `n` primeiras letras (efeito letra a letra); devolve o total de letras */
export function revelar(el: HTMLElement, n: number): number {
  const filhos = el.children;
  for (let i = 0; i < filhos.length; i++) (filhos[i] as HTMLElement).style.visibility = i < n ? '' : 'hidden';
  return filhos.length;
}
/** coloca um elemento em (x, y) px nativos */
export function em<T extends HTMLElement>(el: T, x: number, y: number): T { el.style.position = 'absolute'; el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px'; return el; }
/** cores da fonte em hexadecimal (para fundos que precisam combinar com o texto) */
export const CORES_TEXTO = kit.coresTexto as Record<CorTexto, string>;
