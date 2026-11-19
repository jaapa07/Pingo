/**
 * Lista vertical com cursor de mão, rolagem e toque direto. Componente passivo: a tela dona chama
 * `atualizar(dt)` a cada passo enquanto a lista estiver ativa.
 */
import { input, tocavel } from '../../core/input';
import { texto, escrever, em, type CorTexto, type Tamanho } from '../fonte';
import { moldura, cursorMao, seta, som, fatiaDe, type TipoMoldura } from '../kit';

export interface ItemLista { rotulo: string; /** texto à direita (quantidade, valor) */ valor?: string; desabilitado?: boolean; icone?: HTMLElement; cor?: CorTexto }
export interface OpLista {
  itens: (string | ItemLista)[];
  x?: number; y?: number;
  /** largura total, com a moldura (padrão: cabe o maior item) */
  largura?: number;
  /** quantos itens aparecem de uma vez (padrão: todos, até 7) */
  visiveis?: number;
  tamanho?: Tamanho;
  moldura?: TipoMoldura | null;
  cor?: CorTexto;
  inicial?: number;
  /** passar do fim volta ao começo (padrão: sim) */
  circular?: boolean;
  aoEscolher?(i: number, item: ItemLista): void;
  aoCancelar?(): void;
  aoMover?(i: number, item: ItemLista): void;
}
export class Lista {
  el: HTMLElement;
  itens: ItemLista[] = [];
  indice = 0;
  private topo = 0;
  private janela: HTMLElement; private trilho: HTMLElement; private cursor: HTMLElement;
  private sCima: HTMLElement; private sBaixo: HTMLElement;
  private linhas: HTMLElement[] = [];
  private valores: (HTMLElement | null)[] = [];
  readonly alt: number; readonly visiveis: number; readonly largura: number;
  private margem: number; private wItem: number;
  constructor(private o: OpLista) {
    const tam = o.tamanho ?? 8;
    this.alt = tam === 12 ? 16 : 12;
    const its = o.itens.map((i) => (typeof i === 'string' ? { rotulo: i } : i));
    this.visiveis = Math.max(1, Math.min(o.visiveis ?? 7, Math.max(1, its.length)));
    const tipo = o.moldura === undefined ? 'madeira' : o.moldura;
    this.margem = tipo ? fatiaDe(tipo) + (fatiaDe(tipo) >= 8 ? 0 : 2) : 0;
    const maior = Math.max(24, ...its.map((i) => parseInt(texto(i.rotulo + (i.valor ? '  ' + i.valor : ''), { tamanho: tam }).style.width) + (i.icone ? 18 : 0)));
    this.largura = o.largura ?? maior + 20 + this.margem * 2;
    this.wItem = this.largura - this.margem * 2 - 18;
    const h = this.visiveis * this.alt + this.margem * 2 + 2;
    this.el = tipo ? moldura(tipo, this.largura, h) : document.createElement('div');
    this.el.classList.add('lista'); if (tipo === 'tinta' || tipo === 'placa') this.el.classList.add('escura');
    this.el.style.width = this.largura + 'px'; this.el.style.height = h + 'px';
    if (o.x != null) em(this.el, o.x, o.y ?? 0);
    this.janela = document.createElement('div'); this.janela.className = 'lista-janela';
    this.janela.style.cssText = `left:${this.margem + 16}px;top:${this.margem}px;width:${this.wItem + 2}px;height:${this.visiveis * this.alt + 2}px`;
    this.trilho = document.createElement('div'); this.trilho.className = 'lista-trilho'; this.janela.append(this.trilho);
    this.cursor = cursorMao();
    this.sCima = em(seta('cima'), this.largura - this.margem - 9, this.margem - 5); this.sBaixo = em(seta('baixo'), this.largura - this.margem - 9, h - this.margem - 3);
    this.el.append(this.janela, this.cursor, this.sCima, this.sBaixo);
    this.definirItens(its, o.inicial ?? 0);
  }
  get item(): ItemLista | undefined { return this.itens[this.indice]; }
  definirItens(itens: (string | ItemLista)[], indice = this.indice) {
    this.itens = itens.map((i) => (typeof i === 'string' ? { rotulo: i } : i));
    const tam = this.o.tamanho ?? 8, escura = this.el.classList.contains('escura');
    this.trilho.innerHTML = ''; this.linhas = []; this.valores = [];
    this.itens.forEach((it, i) => {
      const l = document.createElement('div'); l.className = 'lista-item';
      l.style.cssText = `top:${i * this.alt + 2}px;width:${this.wItem}px;height:${this.alt - 2}px`;
      const cor: CorTexto = it.desabilitado ? 'cinza' : it.cor ?? this.o.cor ?? (escura ? 'creme' : 'tinta');
      let x = 1;
      if (it.icone) { l.append(em(it.icone, 0, tam === 12 ? 0 : -2)); x = 18; }
      l.append(em(texto(it.rotulo, { tamanho: tam, cor }), x, tam === 12 ? 0 : 1));
      let v: HTMLElement | null = null;
      if (it.valor != null) { v = texto(it.valor, { tamanho: tam, cor }); l.append(em(v, this.wItem - parseInt(v.style.width) - 1, tam === 12 ? 0 : 1)); }
      this.valores.push(v);
      tocavel(l, () => { this.selecionar(i, true); this.escolher(); }, () => this.selecionar(i, true));
      this.trilho.append(l); this.linhas.push(l);
    });
    this.indice = Math.max(0, Math.min(this.itens.length - 1, indice));
    this.pintar();
  }
  /** troca o texto à direita de um item sem refazer a lista */
  definirValor(i: number, valor: string) {
    const v = this.valores[i]; if (!v) return; this.itens[i].valor = valor;
    escrever(v, valor); v.style.left = this.wItem - parseInt(v.style.width) - 1 + 'px';
  }
  selecionar(i: number, quieto = false) {
    if (i === this.indice || i < 0 || i >= this.itens.length) return;
    this.indice = i; this.pintar(); if (!quieto) som('ui-mover'); this.o.aoMover?.(i, this.itens[i]);
  }
  private escolher() {
    const it = this.item; if (!it) return;
    if (it.desabilitado) { som('ui-erro'); return; }
    som('ui-ok'); this.o.aoEscolher?.(this.indice, it);
  }
  private pintar() {
    if (this.indice < this.topo) this.topo = this.indice;
    if (this.indice >= this.topo + this.visiveis) this.topo = this.indice - this.visiveis + 1;
    this.topo = Math.max(0, Math.min(this.topo, Math.max(0, this.itens.length - this.visiveis)));
    this.trilho.style.top = -this.topo * this.alt + 'px';
    this.linhas.forEach((l, i) => l.classList.toggle('foco', i === this.indice));
    em(this.cursor, this.margem - 2, this.margem + (this.indice - this.topo) * this.alt + (this.alt === 16 ? 4 : 2));
    this.cursor.style.display = this.itens.length ? '' : 'none';
    this.sCima.classList.add('quica'); this.sBaixo.classList.add('quica');
    this.sCima.style.display = this.topo > 0 ? '' : 'none';
    this.sBaixo.style.display = this.topo + this.visiveis < this.itens.length ? '' : 'none';
  }
  /** lê a entrada; chame só quando a lista estiver em foco */
  atualizar(_dt: number) {
    const n = this.itens.length; if (!n) { if (input.apertou('b')) { som('ui-voltar'); this.o.aoCancelar?.(); } return; }
    const circ = this.o.circular ?? true;
    if (input.repetiu('baixo')) this.selecionar(this.indice + 1 < n ? this.indice + 1 : circ && input.apertou('baixo') ? 0 : this.indice);
    else if (input.repetiu('cima')) this.selecionar(this.indice > 0 ? this.indice - 1 : circ && input.apertou('cima') ? n - 1 : this.indice);
    if (input.apertou('a')) { input.consumir('a'); this.escolher(); }
    else if (input.apertou('b') && this.o.aoCancelar) { input.consumir('b'); som('ui-voltar'); this.o.aoCancelar(); }
  }
  /** mostra/esconde o cursor (lista sem foco) */
  focar(f: boolean) { this.cursor.style.visibility = f ? '' : 'hidden'; }
}
