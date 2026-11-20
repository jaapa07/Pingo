/**
 * Entrada unificada: teclado remapeável, Gamepad API e toque (src/ui/toque.ts liga os controles virtuais aqui).
 * Tudo vira as 8 ações do contrato. Os eventos chegam fora do passo fixo e ficam num buffer;
 * `pollInput(dt)` (1× por passo) os transforma em apertou/segurando/soltou — um toque rápido entre dois
 * passos nunca se perde: ele vale por um passo inteiro.
 */
import type { Dir } from './tipos';
import { jogo } from './estado';
import { telas } from '../ui/telas';
import { plataforma } from './plataforma';

export type Acao = 'cima' | 'baixo' | 'esq' | 'dir' | 'a' | 'b' | 'menu' | 'select';
export const ACOES: Acao[] = ['cima', 'baixo', 'esq', 'dir', 'a', 'b', 'menu', 'select'];
export const NOME_ACAO: Record<Acao, string> = { cima: 'Cima', baixo: 'Baixo', esq: 'Esquerda', dir: 'Direita', a: 'Confirmar', b: 'Voltar/Correr', menu: 'Menu', select: 'Atalho' };

export const TECLAS_PADRAO: Record<Acao, string[]> = {
  cima: ['ArrowUp', 'KeyW'], baixo: ['ArrowDown', 'KeyS'], esq: ['ArrowLeft', 'KeyA'], dir: ['ArrowRight', 'KeyD'],
  a: ['KeyZ', 'Enter'], b: ['KeyX', 'ShiftLeft', 'ShiftRight'], menu: ['Escape', 'KeyC'], select: ['KeyV'],
};
const DIRS: Acao[] = ['cima', 'baixo', 'esq', 'dir'];
const PARA_DIR: Record<string, Dir> = { cima: 'n', baixo: 's', esq: 'o', dir: 'l' };

const fontes = Object.fromEntries(ACOES.map((a) => [a, new Set<string>()])) as Record<Acao, Set<string>>;
const baixo = Object.fromEntries(ACOES.map((a) => [a, false])) as Record<Acao, boolean>;
const tempo = Object.fromEntries(ACOES.map((a) => [a, 0])) as Record<Acao, number>;
const fila: { a: Acao; liga: boolean }[] = [];
const apertou = new Set<Acao>(), soltou = new Set<Acao>(), repetiu = new Set<Acao>(), soltarDepois = new Set<Acao>();
let ordemDir: Acao[] = [];
let mapa = new Map<string, Acao>();
let capturando: ((codigo: string | null) => void) | null = null;
let digitando: ((tecla: string, codigo: string) => boolean) | null = null;
const padAnterior = new Set<string>();

function refazerMapa() {
  mapa = new Map();
  for (const a of ACOES) for (const c of jogo.opcoes.teclas[a]?.length ? jogo.opcoes.teclas[a] : TECLAS_PADRAO[a]) mapa.set(c, a);
}
/** liga/desliga uma fonte física (tecla, botão do controle, dedo) de uma ação */
function fonte(a: Acao, id: string, liga: boolean) {
  const s = fontes[a], antes = s.size > 0;
  if (liga) s.add(id); else s.delete(id);
  const agora = s.size > 0;
  if (antes !== agora) fila.push({ a, liga: agora });
}
function soltarTudo(prefixo = '') { for (const a of ACOES) for (const id of [...fontes[a]]) if (id.startsWith(prefixo)) fonte(a, id, false); }

function aoApertarTecla(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  input.modo = 'teclado';
  if (capturando) { e.preventDefault(); const f = capturando; capturando = null; f(e.code); return; }
  if (digitando && !e.repeat && digitando(e.key, e.code)) { e.preventDefault(); return; }
  if (digitando && e.repeat && (e.key.length === 1 || e.key === 'Backspace')) { digitando(e.key, e.code); e.preventDefault(); return; }
  if (digitando && e.code.startsWith('Shift')) return; // Shift serve para digitar maiúsculas
  const a = mapa.get(e.code);
  if (!a) return;
  e.preventDefault();
  if (!e.repeat) fonte(a, 't:' + e.code, true);
}
function aoSoltarTecla(e: KeyboardEvent) { const a = mapa.get(e.code); if (a) fonte(a, 't:' + e.code, false); for (const x of ACOES) fontes[x].has('t:' + e.code) && fonte(x, 't:' + e.code, false); }

function lerControles() {
  const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
  const agora = new Map<string, Acao>();
  for (const p of pads) {
    if (!p || !p.connected) continue;
    const b = (i: number) => !!p.buttons[i]?.pressed, ex = p.axes[0] ?? 0, ey = p.axes[1] ?? 0;
    const liga = (a: Acao, v: boolean) => { if (v) agora.set('c:' + p.index + a, a); };
    liga('cima', b(12) || ey < -0.5); liga('baixo', b(13) || ey > 0.5); liga('esq', b(14) || ex < -0.5); liga('dir', b(15) || ex > 0.5);
    liga('a', b(0)); liga('b', b(1) || b(2)); liga('menu', b(9)); liga('select', b(8) || b(3));
  }
  for (const [id, a] of agora) if (!padAnterior.has(id)) { padAnterior.add(id); fonte(a, id, true); input.modo = 'controle'; }
  for (const id of [...padAnterior]) if (!agora.has(id)) { padAnterior.delete(id); for (const a of ACOES) if (fontes[a].has(id)) fonte(a, id, false); }
}

/** chamado 1× por passo fixo, antes de atualizar as telas */
export function pollInput(dt: number) {
  apertou.clear(); soltou.clear(); repetiu.clear();
  for (const a of soltarDepois) { baixo[a] = false; soltou.add(a); ordemDir = ordemDir.filter((d) => d !== a); }
  soltarDepois.clear();
  lerControles();
  for (const ev of fila.splice(0)) {
    if (ev.liga) {
      soltarDepois.delete(ev.a);
      if (!baixo[ev.a] || soltou.has(ev.a)) { baixo[ev.a] = true; tempo[ev.a] = 0; apertou.add(ev.a); repetiu.add(ev.a); soltou.delete(ev.a); if (DIRS.includes(ev.a)) ordemDir = [...ordemDir.filter((d) => d !== ev.a), ev.a]; }
    } else if (baixo[ev.a]) {
      if (apertou.has(ev.a)) soltarDepois.add(ev.a); // apertou e soltou no mesmo intervalo: vale por um passo
      else { baixo[ev.a] = false; soltou.add(ev.a); ordemDir = ordemDir.filter((d) => d !== ev.a); }
    }
  }
  for (const a of ACOES) {
    if (!baixo[a] || apertou.has(a)) continue;
    const antes = tempo[a]; tempo[a] += dt;
    // repetição para menus: começa em 0,35 s e repete a cada 0,09 s
    if (tempo[a] >= 0.35 && Math.floor((tempo[a] - 0.35) / 0.09) !== Math.floor((antes - 0.35) / 0.09)) repetiu.add(a);
  }
}

export const input = {
  /** último meio usado (para dicas de botão) */
  modo: (plataforma.toque ? 'toque' : 'teclado') as 'teclado' | 'controle' | 'toque',
  apertou: (a: Acao) => apertou.has(a),
  segurando: (a: Acao) => baixo[a],
  soltou: (a: Acao) => soltou.has(a),
  /** apertou agora ou está repetindo por estar segurado (navegação de menus) */
  repetiu: (a: Acao) => repetiu.has(a),
  /** direção segurada; a última apertada tem prioridade */
  eixo(): Dir | null { const d = ordemDir[ordemDir.length - 1]; return d ? PARA_DIR[d] : null; },
  /** gasta o aperto deste passo (quem tratou primeiro impede os outros de tratarem de novo) */
  consumir(a: Acao) { apertou.delete(a); repetiu.delete(a); },
  /** simula um toque rápido numa ação (tocar na caixa de texto = `a`) */
  pulsar(a: Acao) { fila.push({ a, liga: true }, { a, liga: false }); },
  /** usado pelos controles de toque e por testes */
  fonte,
  soltarTudo,
  /** esquece apertos pendentes (ao trocar de tela) */
  limpar() { fila.length = 0; apertou.clear(); repetiu.clear(); soltou.clear(); },

  /* ----- remapeamento ----- */
  teclasDe: (a: Acao): string[] => (jogo.opcoes.teclas[a]?.length ? jogo.opcoes.teclas[a] : TECLAS_PADRAO[a]),
  remapear(a: Acao, codigos: string[]) {
    // uma tecla só pode servir a uma ação: tira-a das outras
    for (const o of ACOES) if (o !== a) { const atual = input.teclasDe(o).filter((c) => !codigos.includes(c)); if (atual.length !== input.teclasDe(o).length) jogo.opcoes.teclas[o] = atual; }
    jogo.opcoes.teclas[a] = codigos; soltarTudo('t:'); refazerMapa();
  },
  restaurarTeclas() { jogo.opcoes.teclas = {}; soltarTudo('t:'); refazerMapa(); },
  recarregarTeclas: refazerMapa,
  /** espera a próxima tecla física e devolve o `code` (null se desistir com `cancelarCaptura`) */
  capturarTecla(): Promise<string | null> { return new Promise((r) => { capturando = r; }); },
  cancelarCaptura() { const f = capturando; capturando = null; f?.(null); },
  /** modo de digitação (tela de nome): recebe `KeyboardEvent.key` e `.code`; devolver true consome a tecla (false = segue como botão do jogo) */
  digitar(fn: ((tecla: string, codigo: string) => boolean) | null) { digitando = fn; if (fn) soltarTudo('t:'); },
  /** nome legível de um `code` de teclado */
  nomeTecla(c: string) {
    const fixos: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Escape: 'Esc', ShiftLeft: 'Shift', ShiftRight: 'Shift D', Space: 'Espaço', Backspace: 'Apagar', Tab: 'Tab', ControlLeft: 'Ctrl', ControlRight: 'Ctrl D', AltLeft: 'Alt', AltRight: 'Alt D' };
    return fixos[c] ?? c.replace(/^Key|^Digit/, '').replace(/^Numpad/, 'Num ').slice(0, 7);
  },
  vibrar(ms = 10, forte = false) { if (jogo.opcoes.vibrar) plataforma.vibrar(ms, forte); },
};

/**
 * Torna um elemento clicável/tocável: o toque chama o mesmo handler que o `a` chamaria.
 * Só responde se o elemento pertence à tela do topo e não há transição em curso.
 * `aoApontar` (opcional) roda quando o ponteiro entra no item (move o cursor do menu).
 */
export function tocavel(el: HTMLElement, aoTocar: () => void, aoApontar?: () => void) {
  const vale = () => !telas.ocupada && (!telas.topo || telas.topo.el.contains(el) || !el.closest('.tela'));
  el.classList.add('tocavel');
  let armado = false;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') input.modo = 'toque'; else if (e.button !== 0) return; armado = true; e.stopPropagation(); if (vale()) aoApontar?.(); });
  // foco pelo mouse só com movimento de verdade: uma janela que surge debaixo do ponteiro parado (Chromium dispara
  // pointerenter/pointermove sintéticos ao refazer o layout) não pode roubar o cursor do teclado
  el.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && (e.movementX || e.movementY) && vale()) aoApontar?.(); });
  el.addEventListener('pointerleave', () => { armado = false; });
  el.addEventListener('pointercancel', () => { armado = false; });
  // pointerup (e não click): responde na hora e não depende do clique sintético do navegador
  el.addEventListener('pointerup', (e) => { if (!armado) return; armado = false; e.stopPropagation(); if (vale()) aoTocar(); });
}

let iniciado = false;
export function iniciarInput() {
  if (iniciado) return; iniciado = true;
  refazerMapa();
  window.addEventListener('keydown', aoApertarTecla);
  window.addEventListener('keyup', aoSoltarTecla);
  window.addEventListener('blur', () => soltarTudo());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') soltarTudo(); });
}
