/** Utilidades comuns das telas: elemento-raiz, fechamento com resultado e espera por quadros. */
import { telas, type Tela } from './telas';

/** cria o elemento-raiz de uma tela (320×180, recortado) */
export function elTela(...classes: string[]): HTMLElement { const el = document.createElement('div'); el.className = ['tela', ...classes].join(' '); return el; }
/** fecha a tela guardando o resultado que `abrirTela` vai devolver */
export function fechar(t: Tela, resultado?: unknown) { (t as Tela & { resultado?: unknown }).resultado = resultado; telas.desempilhar(t); }
/** tira uma tela da pilha mesmo que não seja o topo, sem acordar a de cima */
export function retirar(t: Tela) {
  if (telas.topo === t) { telas.desempilhar(t); return; }
  const i = telas.pilha.indexOf(t); if (i < 0) return;
  telas.pilha.splice(i, 1); t.sair?.(); t.el.remove();
}
export const div = (classe = '', pai?: HTMLElement): HTMLElement => { const d = document.createElement('div'); d.className = classe; pai?.append(d); return d; };
