/** Pilha de telas. A tela do topo recebe update; todas as visíveis recebem render. */
export interface Tela {
  el: HTMLElement;
  /** não esconde nem pausa visualmente a de baixo (menus, caixas de texto) */
  sobreposta?: boolean;
  entrar?(): void | Promise<void>;
  sair?(): void;
  voltar?(): void; // voltou a ser o topo
  atualizar?(dt: number): void;
  desenhar?(alpha: number): void;
}
class Pilha {
  pilha: Tela[] = [];
  raiz!: HTMLElement;
  private cortinaEl!: HTMLElement;
  ocupada = false;
  iniciar(raiz: HTMLElement) { this.raiz = raiz; this.cortinaEl = document.createElement('div'); this.cortinaEl.className = 'cortina'; raiz.append(this.cortinaEl); }
  get topo() { return this.pilha[this.pilha.length - 1]; }
  empilhar(t: Tela) { this.raiz.insertBefore(t.el, this.cortinaEl); this.pilha.push(t); t.entrar?.(); return t; }
  desempilhar(t?: Tela) { const i = t ? this.pilha.indexOf(t) : this.pilha.length - 1; if (i < 0) return; const [x] = this.pilha.splice(i, 1); x.sair?.(); x.el.remove(); this.topo?.voltar?.(); }
  /** troca tudo com transição ('fade' ou classe CSS de transição de batalha) */
  async trocar(t: Tela, transicao = 'fade', ms = 350) {
    await this.cortina(true, transicao, ms);
    while (this.pilha.length) { const x = this.pilha.pop()!; x.sair?.(); x.el.remove(); }
    this.empilhar(t);
    await this.cortina(false, transicao, ms);
  }
  cortina(fechar: boolean, classe = 'fade', ms = 350): Promise<void> {
    this.ocupada = true;
    this.cortinaEl.className = 'cortina ' + classe + (fechar ? ' fechada' : '');
    this.cortinaEl.style.transitionDuration = ms + 'ms';
    return new Promise((r) => setTimeout(() => { this.ocupada = fechar; r(); }, ms + 30));
  }
  atualizar(dt: number) { this.topo?.atualizar?.(dt); }
  desenhar(a: number) { for (let i = 0; i < this.pilha.length; i++) if (i === this.pilha.length - 1 || this.pilha.slice(i + 1).every((x) => x.sobreposta)) this.pilha[i].desenhar?.(a); }
}
export const telas = new Pilha();
type Fab = (args?: any) => Tela;
const fabs = new Map<string, Fab>();
export function registrarTela(id: string, f: Fab) { fabs.set(id, f); }
export function criarTela(id: string, args?: any): Tela { const f = fabs.get(id); if (!f) throw new Error('tela não registrada: ' + id); return f(args); }
export const temTela = (id: string) => fabs.has(id);
