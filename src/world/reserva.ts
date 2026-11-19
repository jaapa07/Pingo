/**
 * Reservas usadas SOMENTE quando os módulos de UI ainda não existem (testes isolados do motor de mundo):
 * entrada por teclado e caixas de diálogo mínimas. Com `src/core/input.ts` e `src/ui/dialogo.ts`
 * presentes, nada daqui é usado.
 */
import type { Dir } from '../core/tipos';
import { telas, criarTela, temTela, type Tela } from '../ui/telas';
import { jogo } from '../core/estado';

export type Acao = 'cima' | 'baixo' | 'esq' | 'dir' | 'a' | 'b' | 'menu' | 'select';
export interface Entrada { apertou(a: Acao): boolean; segurando(a: Acao): boolean; soltou(a: Acao): boolean; eixo(): Dir | null }

const TECLAS: Record<string, Acao> = { ArrowUp: 'cima', KeyW: 'cima', ArrowDown: 'baixo', KeyS: 'baixo', ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir', KeyZ: 'a', Enter: 'a', KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b', Escape: 'menu', KeyC: 'menu', KeyV: 'select' };
const DIRS: Partial<Record<Acao, Dir>> = { cima: 'n', baixo: 's', esq: 'o', dir: 'l' };
const baixadas = new Set<Acao>(), filaAp: Acao[] = [], filaSo: Acao[] = [];
let ap = new Set<Acao>(), so = new Set<Acao>();
const ordem: Acao[] = [];
let ligado = false;
function ligar() {
  if (ligado) return; ligado = true;
  addEventListener('keydown', (e) => { const a = TECLAS[e.code]; if (!a) return; e.preventDefault(); if (baixadas.has(a)) return; baixadas.add(a); filaAp.push(a); if (DIRS[a]) ordem.push(a); });
  addEventListener('keyup', (e) => { const a = TECLAS[e.code]; if (!a) return; baixadas.delete(a); filaSo.push(a); const i = ordem.indexOf(a); if (i >= 0) ordem.splice(i, 1); });
  addEventListener('blur', () => { baixadas.clear(); ordem.length = 0; });
}
export const entradaReserva: Entrada = {
  apertou: (a) => ap.has(a), segurando: (a) => baixadas.has(a), soltou: (a) => so.has(a),
  eixo: () => (ordem.length ? DIRS[ordem[ordem.length - 1]]! : null),
};
/** 1× por passo de simulação */
export function pollReserva() { ligar(); ap = new Set(filaAp); so = new Set(filaSo); filaAp.length = 0; filaSo.length = 0; }

/* ------------------------------ diálogo mínimo ------------------------------ */
const subst = (s: string) => s.replace(/\{JOGADOR\}/g, jogo.save.jogador.nome).replace(/\{RIVAL\}/g, String(jogo.save.flags['rival'] ?? 'Tainá'));
function caixa(y: number, h: number) {
  const el = document.createElement('div');
  el.className = 'reserva-caixa';
  el.style.cssText = `position:absolute;left:4px;top:${y}px;width:310px;height:${h}px;box-sizing:border-box;background:#f4ecd8;border:2px solid #3b2413;color:#2a1a0e;font:8px/10px monospace;padding:3px 5px;white-space:pre-wrap;overflow:hidden;z-index:50`;
  return el;
}
function sobre(el: HTMLElement, passo: (fechar: () => void) => void): Promise<void> {
  return new Promise((res) => {
    let quadros = 0;
    const t: Tela = { el, sobreposta: true, atualizar() { pollReserva(); if (++quadros > 6) passo(() => { telas.desempilhar(t); res(); }); } };
    telas.empilhar(t);
  });
}
export async function falarR(texto: string, quem?: { nome?: string }): Promise<void> {
  for (const pagina of subst(texto).split('\f')) {
    const el = caixa(132, 44);
    el.dataset.dialogo = '1';
    el.textContent = (quem?.nome ? quem.nome + ': ' : '') + pagina;
    await sobre(el, (f) => { if (entradaReserva.apertou('a') || entradaReserva.apertou('b')) f(); });
  }
}
export async function escolherR(pergunta: string, opcoes: string[], padrao = 0): Promise<number> {
  const el = caixa(176 - 30 - opcoes.length * 10, 26 + opcoes.length * 10);
  el.dataset.escolha = '1';
  let i = padrao, r = -1;
  const pinta = () => { el.textContent = subst(pergunta) + '\n' + opcoes.map((o, k) => (k === i ? '> ' : '  ') + o).join('\n'); };
  pinta();
  await sobre(el, (f) => {
    const e = entradaReserva;
    if (e.apertou('cima')) { i = (i + opcoes.length - 1) % opcoes.length; pinta(); }
    if (e.apertou('baixo')) { i = (i + 1) % opcoes.length; pinta(); }
    if (e.apertou('a')) { r = i; f(); } else if (e.apertou('b')) { r = -1; f(); }
  });
  return r;
}
export const simNaoR = async (p: string) => (await escolherR(p, ['Sim', 'Não'])) === 0;
export const pedirNomeR = async (_t: string, _max: number, padrao = '') => padrao;
export function avisarR(texto: string) {
  const el = caixa(4, 16); el.dataset.aviso = '1'; el.style.width = 'auto'; el.textContent = subst(texto);
  telas.raiz?.append(el); setTimeout(() => el.remove(), 1800);
}
/** empilha uma tela registrada e resolve quando ela sai da pilha */
export function abrirTelaR(id: string, args?: unknown): Promise<unknown> {
  if (!temTela(id)) return Promise.resolve(undefined);
  const t = criarTela(id, args);
  telas.empilhar(t);
  return new Promise((res) => { const v = setInterval(() => { if (!telas.pilha.includes(t)) { clearInterval(v); res((t as unknown as { resultado?: unknown }).resultado); } }, 50); });
}
