/**
 * Controles de toque no estilo do jogo: direcional de 8 direções por arraste, A e B grandes, Menu e Select.
 * Em pé ficam embaixo da tela; deitado, nas laterais sobre a imagem, com transparência.
 * A camada tem escala própria, inteira em pixels do aparelho, para os alvos terem tamanho de dedo.
 */
import { input, type Acao } from '../core/input';
import { plataforma } from '../core/plataforma';
import { palco } from './palco';
import { spr, trocarSpr, em } from './kit';

const BRACO = 16, DPAD = BRACO * 3, BOTAO = 24, PIL_W = 40, PIL_H = 12, PINO = 14;
let raiz: HTMLElement;
let dpad: HTMLElement, pino: HTMLElement, zonaDpad: HTMLElement;
const bracos: Partial<Record<Acao, HTMLElement>> = {};
const botoes: { el: HTMLElement; acao: Acao; nome: string; img: HTMLElement; zona: HTMLElement }[] = [];
let escala = 1;

function criarBotao(acao: Acao, nome: string, w: number, h: number) {
  const el = document.createElement('div'); el.className = 'tq'; el.style.width = w + 'px'; el.style.height = h + 'px';
  const img = spr(nome); el.append(img);
  const zona = document.createElement('div'); zona.className = 'tq-zona'; el.append(zona);
  const soltar = (e: PointerEvent) => { input.fonte(acao, 'd:' + acao, false); trocarSpr(img, nome); try { zona.releasePointerCapture(e.pointerId); } catch { /* já solto */ } };
  zona.addEventListener('pointerdown', (e) => { e.preventDefault(); input.modo = 'toque'; try { zona.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético */ } input.fonte(acao, 'd:' + acao, true); trocarSpr(img, nome + '-ap'); input.vibrar(8); });
  zona.addEventListener('pointerup', soltar); zona.addEventListener('pointercancel', soltar);
  raiz.append(el); botoes.push({ el, acao, nome, img, zona });
  return el;
}
/** margem invisível em volta do desenho, para o alvo ter pelo menos 48 px no aparelho */
function folga(b: { zona: HTMLElement }, w: number, h: number) {
  const mx = Math.max(2, Math.ceil((48 / escala - w) / 2)), my = Math.max(2, Math.ceil((48 / escala - h) / 2));
  b.zona.style.left = -mx + 'px'; b.zona.style.top = -my + 'px'; b.zona.style.width = w + 2 * mx + 'px'; b.zona.style.height = h + 2 * my + 'px';
}

function criarDpad() {
  dpad = document.createElement('div'); dpad.className = 'tq'; dpad.style.width = dpad.style.height = DPAD + 'px';
  const pecas: [Acao | null, string, number, number][] = [['cima', 'dpad-cima', BRACO, 0], ['dir', 'dpad-dir', BRACO * 2, BRACO], ['baixo', 'dpad-baixo', BRACO, BRACO * 2], ['esq', 'dpad-esq', 0, BRACO], [null, 'dpad-miolo', BRACO, BRACO]];
  for (const [a, nome, x, y] of pecas) { const p = em(spr(nome), x, y); dpad.append(p); if (a) bracos[a] = p; }
  pino = em(spr('dpad-pino'), (DPAD - PINO) / 2, (DPAD - PINO) / 2); dpad.append(pino);
  zonaDpad = document.createElement('div'); zonaDpad.className = 'tq-zona'; dpad.append(zonaDpad);
  let dedo = -1;
  const ligar = (dirs: Acao[]) => {
    for (const a of ['cima', 'baixo', 'esq', 'dir'] as Acao[]) { const on = dirs.includes(a); input.fonte(a, 'd:pad', on); trocarSpr(bracos[a]!, `dpad-${a}${on ? '-ap' : ''}`); }
    const dx = (dirs.includes('dir') ? 1 : 0) - (dirs.includes('esq') ? 1 : 0), dy = (dirs.includes('baixo') ? 1 : 0) - (dirs.includes('cima') ? 1 : 0);
    em(pino, (DPAD - PINO) / 2 + dx * 9, (DPAD - PINO) / 2 + dy * 9);
  };
  let ultima = '';
  const mirar = (e: PointerEvent) => {
    const r = dpad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy), morta = r.width * 0.13;
    const dirs: Acao[] = [];
    if (dist > morta) {
      // 8 setores de 45°: as diagonais ligam duas direções
      const setor = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
      const s = ((setor % 8) + 8) % 8;
      if (s === 7 || s === 0 || s === 1) dirs.push('dir');
      if (s >= 1 && s <= 3) dirs.push('baixo');
      if (s >= 3 && s <= 5) dirs.push('esq');
      if (s >= 5 && s <= 7) dirs.push('cima');
    }
    const chave = dirs.join('+'); if (chave !== ultima) { ultima = chave; ligar(dirs); if (dirs.length) input.vibrar(5); }
  };
  zonaDpad.addEventListener('pointerdown', (e) => { e.preventDefault(); input.modo = 'toque'; dedo = e.pointerId; try { zonaDpad.setPointerCapture(dedo); } catch { /* ponteiro sintético */ } mirar(e); });
  zonaDpad.addEventListener('pointermove', (e) => { if (e.pointerId === dedo) mirar(e); });
  const fim = (e: PointerEvent) => { if (e.pointerId !== dedo) return; dedo = -1; ultima = ''; ligar([]); };
  zonaDpad.addEventListener('pointerup', fim); zonaDpad.addEventListener('pointercancel', fim);
  raiz.append(dpad);
}

function arrumar() {
  const ativo = plataforma.toque;
  raiz.classList.toggle('ativo', ativo);
  if (!ativo) return;
  const { vw, vh, dpr, seguro: s, modo } = palco;
  const retrato = modo === 'retrato';
  raiz.classList.toggle('paisagem', !retrato);
  // tamanho alvo do direcional em px CSS → escala inteira em pixels do aparelho
  const livreH = retrato ? vh - s.b - (palco.y + palco.h) : vh - s.t - s.b;
  const alvo = Math.max(96, Math.min(retrato ? 150 : 124, (retrato ? Math.min(vw * 0.4, livreH * 0.5) : livreH * 0.36)));
  escala = Math.max(1, Math.round((alvo * dpr) / DPAD)) / dpr;
  raiz.style.transform = `scale(${escala})`;
  const u = (px: number) => Math.round(px / escala); // px CSS → unidades da camada
  const W = u(vw), esq = u(s.l), dirt = W - u(s.r), base = u(vh - s.b), topo = retrato ? u(palco.y + palco.h) : u(s.t);
  const [a, b, menu, select] = botoes;
  let dx: number, dy: number, ax: number, ay: number;
  if (retrato) {
    const meio = topo + Math.round((base - topo) * 0.42);
    dx = esq + Math.max(6, Math.round(W * 0.07)); dy = meio - DPAD / 2;
    ax = dirt - Math.max(6, Math.round(W * 0.06)) - BOTAO; ay = meio - BOTAO - 2;
    em(a.el, ax, ay); em(b.el, ax - BOTAO - 6, ay + BOTAO - 2);
    const py = Math.min(base - PIL_H - 8, meio + DPAD / 2 + Math.round((base - meio - DPAD / 2) * 0.45));
    em(select.el, Math.round(W / 2) - PIL_W - 5, py); em(menu.el, Math.round(W / 2) + 5, py);
  } else {
    dx = esq + 5; dy = base - DPAD - 8;
    ax = dirt - BOTAO - 5; ay = base - BOTAO * 2 - 6;
    em(a.el, ax, ay); em(b.el, ax - BOTAO - 4, ay + BOTAO - 4);
    em(select.el, esq + 5, topo + 5); em(menu.el, dirt - PIL_W - 5, topo + 5);
  }
  em(dpad, dx, dy);
  // a zona do direcional é maior que o desenho: o polegar pode escorregar
  const m = Math.round(DPAD * 0.45);
  zonaDpad.style.left = -Math.min(m, dx) + 'px'; zonaDpad.style.top = -m + 'px'; zonaDpad.style.width = DPAD + m + Math.min(m, dx) + 'px'; zonaDpad.style.height = DPAD + 2 * m + 'px';
  folga(a, BOTAO, BOTAO); folga(b, BOTAO, BOTAO); folga(menu, PIL_W, PIL_H); folga(select, PIL_W, PIL_H);
}

export function iniciarToque() {
  raiz = document.getElementById('toque')!;
  criarDpad();
  criarBotao('a', 'botao-a', BOTAO, BOTAO); criarBotao('b', 'botao-b', BOTAO, BOTAO);
  criarBotao('menu', 'pilula-menu', PIL_W, PIL_H); criarBotao('select', 'pilula-select', PIL_W, PIL_H);
  palco.aoAjustar.push(arrumar); arrumar();
  // o primeiro toque num aparelho híbrido (notebook com tela de toque) liga os controles
  window.addEventListener('touchstart', () => { if (!plataforma.toque) { plataforma.toque = true; import('./palco').then((m) => m.ajustarPalco()); } }, { passive: true });
}
/** para testes: retângulos (px CSS) dos controles */
export function retangulosToque() { const r: Record<string, DOMRect> = { dpad: dpad.getBoundingClientRect() }; for (const b of botoes) r[b.acao] = b.el.getBoundingClientRect(); return r; }
