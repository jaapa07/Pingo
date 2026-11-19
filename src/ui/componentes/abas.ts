/** Abas horizontais (bolsos da mochila, páginas do resumo). Trocam com esquerda/direita ou toque. */
import { input, tocavel } from '../../core/input';
import { texto, em } from '../fonte';
import { moldura, trocarMoldura, som } from '../kit';

export interface OpAbas { rotulos: string[]; icones?: HTMLElement[]; x?: number; y?: number; largura?: number; inicial?: number; aoTrocar?(i: number): void }
export class Abas {
  el = document.createElement('div');
  indice: number;
  private botoes: HTMLElement[] = [];
  constructor(private o: OpAbas) {
    this.indice = o.inicial ?? 0;
    this.el.className = 'abas'; this.el.style.position = 'absolute';
    if (o.x != null) em(this.el, o.x, o.y ?? 0);
    let x = 0;
    o.rotulos.forEach((r, i) => {
      const t = texto(r, { cor: 'tinta' }), ic = o.icones?.[i];
      const w = o.largura ?? parseInt(t.style.width) + 10 + (ic ? 18 : 0);
      const b = moldura('botao', w, ic ? 20 : 14, x, 0);
      if (ic) b.append(em(ic, 2, 2));
      if (r) b.append(em(t, ic ? 20 : Math.floor((w - parseInt(t.style.width)) / 2), ic ? 6 : 3));
      tocavel(b, () => this.ir(i));
      this.el.append(b); this.botoes.push(b); x += w + 1;
    });
    this.el.style.width = x - 1 + 'px'; this.el.style.height = (o.icones ? 20 : 14) + 'px';
    this.pintar();
  }
  ir(i: number, quieto = false) { const n = this.o.rotulos.length; i = ((i % n) + n) % n; if (i === this.indice) return; this.indice = i; this.pintar(); if (!quieto) som('ui-mover'); this.o.aoTrocar?.(i); }
  private pintar() { this.botoes.forEach((b, i) => trocarMoldura(b, i === this.indice ? 'botao-foco' : 'botao')); }
  /** trata esquerda/direita; devolve true se trocou de aba */
  atualizar(_dt: number): boolean {
    if (input.repetiu('dir')) { this.ir(this.indice + 1); return true; }
    if (input.repetiu('esq')) { this.ir(this.indice - 1); return true; }
    return false;
  }
}
