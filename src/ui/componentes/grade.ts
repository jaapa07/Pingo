/**
 * Grade de células com cantoneiras de seleção (viveiro, teclado, insígnias, mochila em ícones).
 * A tela dona fornece as células já desenhadas; a grade cuida do cursor, da entrada e do toque.
 */
import { input, tocavel } from '../../core/input';
import { em } from '../fonte';
import { moldura, som } from '../kit';

export interface OpGrade {
  colunas: number;
  celulas: HTMLElement[];
  /** tamanho de cada célula e espaço entre elas */
  w: number; h: number; vao?: number;
  x?: number; y?: number;
  inicial?: number;
  aoEscolher?(i: number): void;
  aoCancelar?(): void;
  aoMover?(i: number): void;
  /** o cursor tentou sair pela borda; devolver true = tratado (não dá a volta) */
  aoSair?(lado: 'cima' | 'baixo' | 'esq' | 'dir', i: number): boolean | void;
}
export class Grade {
  el = document.createElement('div');
  indice = 0;
  private sel: HTMLElement;
  private passoX: number; private passoY: number;
  constructor(private o: OpGrade) {
    const vao = o.vao ?? 0; this.passoX = o.w + vao; this.passoY = o.h + vao;
    const linhas = Math.ceil(o.celulas.length / o.colunas);
    this.el.className = 'grade'; this.el.style.cssText = `position:absolute;width:${o.colunas * this.passoX - vao}px;height:${linhas * this.passoY - vao}px`;
    if (o.x != null) em(this.el, o.x, o.y ?? 0);
    o.celulas.forEach((c, i) => {
      em(c, (i % o.colunas) * this.passoX, Math.floor(i / o.colunas) * this.passoY); c.style.width = o.w + 'px'; c.style.height = o.h + 'px';
      tocavel(c, () => { this.selecionar(i, true); som('ui-ok'); o.aoEscolher?.(i); }, () => this.selecionar(i, true));
      this.el.append(c);
    });
    this.sel = moldura('selecao', o.w + 4, o.h + 4); this.sel.classList.add('quica'); this.sel.style.pointerEvents = 'none'; this.el.append(this.sel);
    this.indice = Math.min(o.celulas.length - 1, o.inicial ?? 0); this.pintar();
  }
  selecionar(i: number, quieto = false) { if (i === this.indice || i < 0 || i >= this.o.celulas.length) return; this.indice = i; this.pintar(); if (!quieto) som('ui-mover'); this.o.aoMover?.(i); }
  focar(f: boolean) { this.sel.style.display = f ? '' : 'none'; }
  private pintar() { em(this.sel, (this.indice % this.o.colunas) * this.passoX - 2, Math.floor(this.indice / this.o.colunas) * this.passoY - 2); }
  atualizar(_dt: number) {
    const n = this.o.celulas.length, c = this.o.colunas, i = this.indice, col = i % c, lin = Math.floor(i / c), linhas = Math.ceil(n / c);
    const sair = (l: 'cima' | 'baixo' | 'esq' | 'dir') => this.o.aoSair?.(l, i) === true;
    if (input.repetiu('dir')) { if (col + 1 < c && i + 1 < n) this.selecionar(i + 1); else if (!sair('dir')) this.selecionar(lin * c); }
    else if (input.repetiu('esq')) { if (col > 0) this.selecionar(i - 1); else if (!sair('esq')) this.selecionar(Math.min(n - 1, lin * c + c - 1)); }
    else if (input.repetiu('baixo')) { if (i + c < n) this.selecionar(i + c); else if (lin + 1 < linhas) this.selecionar(n - 1); else if (!sair('baixo')) this.selecionar(col); }
    else if (input.repetiu('cima')) { if (lin > 0) this.selecionar(i - c); else if (!sair('cima')) this.selecionar(Math.min(n - 1, (linhas - 1) * c + col)); }
    if (input.apertou('a')) { input.consumir('a'); som('ui-ok'); this.o.aoEscolher?.(this.indice); }
    else if (input.apertou('b') && this.o.aoCancelar) { input.consumir('b'); som('ui-voltar'); this.o.aoCancelar(); }
  }
}
