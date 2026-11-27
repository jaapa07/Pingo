/**
 * Diálogo e UI compartilhada (contrato em docs/MOTOR.md): caixa de texto letra a letra com retrato e voz
 * balbuciada, escolhas, sim/não, pedido de nome, avisos e abertura de telas com resultado.
 */
import { jogo } from '../core/estado';
import { bus } from '../core/events';
import { input, tocavel } from '../core/input';
import { vista } from '../core/assets';
import { Sprite } from '../render/sprite';
import { telas, criarTela, type Tela } from './telas';
import { elTela, retirar } from './base';
import { texto, escrever, revelar, em, type CorTexto } from './fonte';
import { moldura, spr, som } from './kit';
import { Lista } from './componentes/lista';
import { criarTelaNome } from './telas/nome';
import { tela as traduzir, t } from '../i18n';

export interface Quem { nome?: string; retrato?: string; expressao?: 'neutro' | 'feliz' | 'bravo'; voz?: string }

/** traduz (catálogo EN, src/i18n) e troca {JOGADOR} e {RIVAL} pelos nomes do save */
export const substituir = (s: string) => traduzir(s).replace(/\{JOGADOR\}/g, jogo.save.jogador.nome).replace(/\{RIVAL\}/g, String(jogo.save.flags['rival'] ?? 'Tainá'));

const VEL = [28, 55, 120]; // letras por segundo para velTexto 1, 2, 3
const LINHAS = 2, ENTRE = 14;

/**
 * Caixa de texto reutilizável (o diálogo e a batalha usam a mesma): escreve letra a letra, pagina de 2 em 2
 * linhas e mostra a seta de "continuar". Não lê a entrada sozinha: quem usa chama `atualizar` e `avancar`.
 */
export class CaixaTexto {
  el: HTMLElement;
  private janela: HTMLElement; private txt: HTMLElement; private seta: HTMLElement;
  private paginas: HTMLElement[][] = [];
  private pag = 0; private n = 0;
  /** true quando a página atual já apareceu inteira */
  completa = true;
  constructor(x = 8, y = 128, readonly w = 304, readonly h = 48, cor: CorTexto = 'tinta') {
    this.el = moldura('texto', w, h, x, y); this.el.classList.add('caixa-texto');
    this.janela = document.createElement('div');
    this.janela.style.cssText = `position:absolute;left:12px;top:${Math.floor((h - (LINHAS * ENTRE + 2)) / 2)}px;width:${w - 24}px;height:${LINHAS * ENTRE + 2}px;overflow:hidden`;
    this.txt = em(texto('', { tamanho: 12, cor, largura: w - 24, entrelinha: ENTRE }), 0, 2);
    this.janela.append(this.txt);
    this.seta = em(spr('continuar', 'quica'), w - 18, h - 11); this.seta.style.display = 'none';
    this.el.append(this.janela, this.seta);
  }
  /** carrega um texto (uma "caixa"); devolve o número de páginas */
  definir(str: string): number {
    escrever(this.txt, str);
    this.paginas = [];
    for (const g of Array.from(this.txt.children) as HTMLElement[]) { const lin = Math.round((parseInt(g.style.top) + 1) / ENTRE); (this.paginas[Math.floor(lin / LINHAS)] ??= []).push(g); g.style.visibility = 'hidden'; }
    for (let i = 0; i < this.paginas.length; i++) this.paginas[i] ??= [];
    if (!this.paginas.length) this.paginas = [[]];
    this.pag = 0; this.mostrarPagina(); return this.paginas.length;
  }
  private mostrarPagina() { this.txt.style.top = 2 - this.pag * LINHAS * ENTRE + 'px'; this.n = 0; this.completa = this.paginas[this.pag].length === 0; this.seta.style.display = 'none'; }
  get ultimaPagina() { return this.pag >= this.paginas.length - 1; }
  /** texto visível da página atual (para a voz balbuciada) */
  get letrasDaPagina() { return this.paginas[this.pag].length; }
  /** avança o letra a letra; `rapido` triplica a velocidade */
  atualizar(dt: number, rapido = false) {
    if (this.completa) return;
    const gl = this.paginas[this.pag], antes = Math.floor(this.n);
    this.n = Math.min(gl.length, this.n + dt * VEL[(jogo.opcoes.velTexto ?? 2) - 1] * (rapido ? 3 : 1));
    for (let i = antes; i < Math.floor(this.n); i++) gl[i].style.visibility = '';
    if (this.n >= gl.length) this.completa = true;
  }
  /** mostra a página inteira de uma vez */
  completar() { for (const g of this.paginas[this.pag]) g.style.visibility = ''; this.n = this.paginas[this.pag].length; this.completa = true; }
  /** vai para a próxima página; false se não há mais */
  proxima(): boolean { if (this.ultimaPagina) return false; this.pag++; this.mostrarPagina(); return true; }
  mostrarSeta(v: boolean) { this.seta.style.display = v ? '' : 'none'; }
  limpar() { escrever(this.txt, ''); this.paginas = [[]]; this.pag = 0; this.completa = true; this.mostrarSeta(false); }
}

/* ------------------------------ tela de diálogo (uma só, reaproveitada entre falas seguidas) ------------------------------ */
class TelaDialogo implements Tela {
  el = elTela('ui', 'dialogo');
  sobreposta = true;
  caixa = new CaixaTexto();
  private quadroRetrato = moldura('tinta', 56, 56, 8, 74);
  private placa: HTMLElement | null = null;
  private retrato: Sprite | null = null;
  private idRetrato = '';
  private lista: Lista | null = null;
  private fase: 'ocioso' | 'falando' | 'esperando' | 'escolhendo' = 'ocioso';
  private aoFim: (() => void) | null = null;
  private voz = ''; private caixas: string[] = []; private primeiroPasso = true;
  constructor() {
    this.quadroRetrato.style.display = 'none';
    const recorte = document.createElement('div'); recorte.className = 'dlg-retrato'; this.quadroRetrato.append(recorte);
    this.el.append(this.quadroRetrato, this.caixa.el);
    tocavel(this.caixa.el, () => input.pulsar('a'));
  }
  private definirQuem(q?: Quem) {
    const id = q?.retrato && vista(q.retrato, 'retrato') ? q.retrato : '';
    if (id !== this.idRetrato) {
      this.retrato?.remover(); this.retrato = null; this.idRetrato = id;
      if (id) { const s = new Sprite(id, 'retrato', this.quadroRetrato.querySelector('.dlg-retrato') as HTMLElement); s.x = s.meta!.px; s.y = s.meta!.py; this.retrato = s; }
    }
    if (this.retrato) { this.retrato.tocar(q?.expressao ?? 'neutro', { reiniciar: true }); this.retrato.desenhar(); }
    this.quadroRetrato.style.display = id ? '' : 'none';
    this.placa?.remove(); this.placa = null;
    if (q?.nome) {
      const t = texto(substituir(q.nome), { cor: 'creme', sombra: true });
      this.placa = moldura('placa', parseInt(t.style.width) + 13, 15, id ? 66 : 14, 116); this.placa.append(em(t, 6, 4)); this.el.append(this.placa);
    }
    this.voz = q?.voz ?? (q?.nome ? 'padrao' : '');
  }
  /** mostra as caixas (separadas por \f) e resolve quando a última termina; `segurar` deixa o texto na tela */
  falar(str: string, q: Quem | undefined, segurar: boolean): Promise<void> {
    this.fecharLista(); this.definirQuem(q);
    this.caixas = substituir(str).split('\f');
    return new Promise((r) => { this.aoFim = r; this.segurar = segurar; this.proximaCaixa(); });
  }
  private segurar = false;
  private atual = '';
  private proximaCaixa() { this.atual = this.caixas.shift() ?? ''; this.caixa.definir(this.atual); this.fase = 'falando'; this.primeiroPasso = true; this.balbuciar(); }
  private balbuciar() { if (this.voz && this.caixa.letrasDaPagina) bus.emit('babble', { voz: this.voz, texto: this.atual.replace(/\{[^}]*\}/g, '').slice(0, 60) }); }
  private terminar() { this.fase = 'ocioso'; this.caixa.mostrarSeta(false); const f = this.aoFim; this.aoFim = null; f?.(); }
  escolher(opcoes: string[], padrao: number): Promise<number> {
    return new Promise((r) => {
      const fim = (i: number) => { this.fecharLista(); this.fase = 'ocioso'; r(i); };
      const l = this.lista = new Lista({ itens: opcoes, tamanho: 12, visiveis: Math.min(5, opcoes.length), inicial: padrao, aoEscolher: (i) => fim(i), aoCancelar: () => fim(-1) });
      em(l.el, 312 - l.largura, 130 - parseInt(l.el.style.height)); this.el.append(l.el);
      this.fase = 'escolhendo';
    });
  }
  private fecharLista() { this.lista?.el.remove(); this.lista = null; }
  limpar() { this.caixa.limpar(); this.fecharLista(); this.placa?.remove(); this.placa = null; }
  atualizar(dt: number) {
    this.retrato?.atualizar(dt);
    const toque = !this.primeiroPasso && (input.apertou('a') || input.apertou('b'));
    this.primeiroPasso = false;
    if (this.fase === 'falando') {
      if (toque && !this.caixa.completa) { this.caixa.completar(); input.consumir('a'); input.consumir('b'); }
      else this.caixa.atualizar(dt, input.segurando('a') || input.segurando('b'));
      if (this.caixa.completa) {
        // a última página de uma pergunta não espera toque: a lista aparece em seguida
        if (this.caixa.ultimaPagina && !this.caixas.length && this.segurar) this.terminar();
        else { this.fase = 'esperando'; this.caixa.mostrarSeta(true); }
      }
    } else if (this.fase === 'esperando') {
      if (toque) {
        input.consumir('a'); input.consumir('b'); som('texto'); this.caixa.mostrarSeta(false);
        if (this.caixa.proxima()) { this.fase = 'falando'; this.balbuciar(); }
        else if (this.caixas.length) this.proximaCaixa();
        else this.terminar();
      }
    } else if (this.fase === 'escolhendo') this.lista?.atualizar(dt);
  }
  desenhar() { this.retrato?.desenhar(); }
}

let tela: TelaDialogo | null = null;
let fechamento: ReturnType<typeof setTimeout> | null = null;
let fila: Promise<unknown> = Promise.resolve();
function abrir(): TelaDialogo {
  if (fechamento) { clearTimeout(fechamento); fechamento = null; }
  if (!tela) tela = new TelaDialogo();
  if (!telas.pilha.includes(tela)) telas.empilhar(tela);
  else if (telas.topo !== tela) { retirar(tela); telas.empilhar(tela); }
  return tela;
}
/** fecha no próximo instante livre: falas seguidas reaproveitam a mesma caixa, sem piscar */
function soltar() {
  if (fechamento) clearTimeout(fechamento);
  fechamento = setTimeout(() => { fechamento = null; if (tela) { tela.limpar(); retirar(tela); } }, 0);
}
const emFila = <T>(f: () => Promise<T>): Promise<T> => { const p = fila.then(f, f); fila = p.catch(() => undefined); return p; };

/** caixa de texto letra a letra; `\n` quebra a linha, `\f` abre nova caixa; {JOGADOR} e {RIVAL} são substituídos */
export function falar(str: string, quem?: Quem): Promise<void> {
  return emFila(async () => { await abrir().falar(str, quem, false); soltar(); });
}
/** pergunta com opções; devolve o índice ou −1 se cancelou com B */
export function escolher(pergunta: string, opcoes: string[], padrao = 0): Promise<number> {
  return emFila(async () => {
    const t = abrir();
    if (pergunta) await t.falar(pergunta, undefined, true); else t.limpar();
    const i = await t.escolher(opcoes, padrao);
    soltar(); return i;
  });
}
export const simNao = (pergunta: string): Promise<boolean> => escolher(pergunta, [t('Sim'), t('Não')]).then((i) => i === 0);
/** teclado em grade; devolve o nome digitado (ou `padrao` se o jogador confirmar vazio) */
export function pedirNome(titulo: string, max: number, padrao = ''): Promise<string> {
  return emFila(() => new Promise<string>((r) => { const t = criarTelaNome({ titulo: substituir(titulo), max, padrao }); const s = t.sair?.bind(t); t.sair = () => { s?.(); r(String((t as Tela & { resultado?: unknown }).resultado ?? padrao)); }; telas.empilhar(t); }));
}
/** empilha uma tela registrada e resolve quando ela fecha, com o `resultado` que ela deixou (ver `fechar` em ui/base.ts) */
export function abrirTela(id: string, args?: unknown): Promise<unknown> {
  return new Promise((r) => { const t = criarTela(id, args); const s = t.sair?.bind(t); t.sair = () => { s?.(); r((t as Tela & { resultado?: unknown }).resultado); }; telas.empilhar(t); });
}

/* ------------------------------ avisos (faixa curta no alto da tela) ------------------------------ */
const filaAvisos: string[] = []; let avisando = false;
function proximoAviso() {
  const raiz = document.getElementById('avisos'); const str = filaAvisos.shift();
  if (!raiz || str == null) { avisando = false; return; }
  avisando = true;
  const t = texto(substituir(str), { cor: 'creme', sombra: true, largura: 220, alinhar: 'centro' });
  const cx = moldura('placa', 236, parseInt(t.style.height) + 9, 42, 4); cx.classList.add('aviso'); cx.append(em(t, 8, 5)); raiz.append(cx);
  requestAnimationFrame(() => requestAnimationFrame(() => cx.classList.add('dentro')));
  setTimeout(() => cx.classList.remove('dentro'), 2200 + str.length * 20);
  setTimeout(() => { cx.remove(); proximoAviso(); }, 2550 + str.length * 20);
}
/** faixa curta que entra e sai sozinha (nome da zona, item obtido); não pausa o jogo */
export function avisar(str: string): void { filaAvisos.push(str); if (!avisando) proximoAviso(); }
