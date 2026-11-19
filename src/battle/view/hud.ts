/**
 * Caixas de status da batalha (autorais, cantos chanfrados em degraus de pixel e faixa na cor do tipo):
 * nome, sexo, nível, barra de vida de 1 em 1 px, ícone de status; a do jogador tem vida em números e experiência.
 * Também as bolinhas de equipe e o número de dano opcional.
 */
import type { StatusId, TipoId } from '../../core/tipos';
import { barra, CORES_TIPO, iconeStatus, type Barra } from '../../ui/kit';
import { em, escrever, medir, texto } from '../../ui/fonte';
import type { ResumoCriatura } from '../engine';
import { fxUi } from './cena';
import { div } from './palco';

/** recorte com cantos chanfrados em degraus (sem diagonais suavizadas) */
export function chanfro(n: number): string {
  const L: [number, number][] = [[0, n]];
  for (let i = 1; i <= n; i++) L.push([i, n - i + 1], [i, n - i]);
  const X = (x: number, dir: boolean) => (dir ? `calc(100% - ${x}px)` : `${x}px`);
  const R = [...L].reverse();
  const pts = [...L.map(([x, y]) => `${X(x, false)} ${X(y, false)}`), ...R.map(([x, y]) => `${X(x, true)} ${X(y, false)}`), ...L.map(([x, y]) => `${X(x, true)} ${X(y, true)}`), ...R.map(([x, y]) => `${X(x, false)} ${X(y, true)}`)];
  return `polygon(${pts.join(',')})`;
}
const CHANFRO3 = chanfro(3), CHANFRO2 = chanfro(2);
/** painel autoral: contorno escuro + miolo, ambos chanfrados */
export function painel(w: number, h: number, classe = ''): { el: HTMLElement; miolo: HTMLElement } {
  const el = div('bt-painel ' + classe); el.style.cssText = `width:${w}px;height:${h}px;clip-path:${CHANFRO3}`;
  const miolo = div('bt-miolo', el); miolo.style.clipPath = CHANFRO2;
  return { el, miolo };
}

export class CaixaStatus {
  el: HTMLElement;
  private faixa: HTMLElement; private nome = texto('', { sombra: true }); private nv = texto('', { sombra: true });
  private num = texto('', { cor: 'tinta' }); private st = div('bt-st'); private cap = fxUi('ui-cuia-mini', 0);
  private bv: Barra; private be: Barra | null = null;
  private vidaMax = 1; private vidaAlvo = 0; readonly w: number; readonly h: number;
  constructor(readonly lado: 0 | 1, compacta = false) {
    const jog = lado === 0;
    this.w = jog ? 122 : 110; this.h = jog ? (compacta ? 31 : 39) : 27;
    const p = painel(this.w, this.h, jog ? 'jog' : 'ini'); this.el = p.el;
    this.faixa = div('bt-faixa', p.miolo);
    const wb = jog ? 72 : 62;
    this.bv = barra('vida', wb, (px, max) => { if (jog) this.escreverNum(Math.round((px / max) * this.vidaMax)); });
    p.miolo.append(em(this.nome, 5, 2), em(this.nv, 0, 2), em(texto('VD', { cor: 'laranja' }), 4, 15), em(this.bv.el, 17, 14), em(this.st, wb + 20, 13));
    em(this.cap.el, 0, 2); this.cap.el.style.display = 'none'; p.miolo.append(this.cap.el);
    if (jog) {
      p.miolo.append(em(this.num, 0, 21));
      if (!compacta) { this.be = barra('exp', 92); p.miolo.append(em(texto('EXP', { cor: 'azul' }), 4, 28), em(this.be.el, 23, 31)); }
      
    }
    this.el.style.visibility = 'hidden';
  }
  private escreverNum(v: number) { escrever(this.num, `${v}/${this.vidaMax}`); this.num.style.left = this.w - 8 - medir(`${v}/${this.vidaMax}`) + 'px'; }
  definir(r: ResumoCriatura, tipo: TipoId, capturada = false) {
    const [base, escura] = CORES_TIPO[tipo];
    this.faixa.style.background = base; this.faixa.style.boxShadow = `inset 0 -1px 0 ${escura}`;
    const sexo = r.sexo === 'F' ? ' {c:rosa}♀{/c}' : r.sexo === 'M' ? ' {c:agua}♂{/c}' : '';
    let nome = r.nome; while (medir(nome) > this.w - 42 && nome.length > 3) nome = nome.slice(0, -1);
    escrever(this.nome, nome + sexo);
    this.cap.el.style.display = capturada && this.lado === 1 ? '' : 'none';
    this.cap.el.style.left = 6 + medir(nome + (r.sexo ? ' ♀' : '')) + 3 + 'px';
    this.nivel(r.nivel);
    this.vidaMax = r.vidaMax; this.vida(r.vida, r.vidaMax, false);
    this.status(r.status);
    if (this.be) this.be.definir(fracExp(r), false);
    this.el.style.visibility = '';
  }
  nivel(n: number) { escrever(this.nv, `Nv${n}`); this.nv.style.left = this.w - 8 - medir(`Nv${n}`) + 'px'; }
  vida(v: number, max: number, animar = true) { this.vidaMax = max; this.vidaAlvo = v; this.bv.definir(v / max, animar); if (!animar && this.lado === 0) this.escreverNum(v); }
  status(s: StatusId | 'desmaiado' | null) { this.st.replaceChildren(); if (s) this.st.append(iconeStatus(s)); }
  exp(frac: number, animar = true) { this.be?.definir(Math.max(0, Math.min(1, frac)), animar); }
  /** a barra de vida está perto de acabar? (alerta sonoro) */
  get fracVida() { return this.vidaAlvo / this.vidaMax; }
  mostrar(b: boolean) { this.el.style.visibility = b ? '' : 'hidden'; }
  /** devolve true enquanto alguma barra ainda anda */
  atualizar(dt: number): boolean {
    const a = this.bv.atualizar(dt); if (!a && this.lado === 0 && this.el.style.visibility !== 'hidden') this.escreverNum(this.vidaAlvo);
    const b = this.be?.atualizar(dt * 1.4) ?? false;
    return a || b;
  }
  get andandoExp() { return !!this.be; }
}
export const fracExp = (r: { exp: number; expNivel: number; expProx: number }) => (r.expProx > r.expNivel ? (r.exp - r.expNivel) / (r.expProx - r.expNivel) : 1);

/** fileira de bolinhas da equipe: 0 = pronta · 1 = desmaiada/com status · 2 = vaga */
export class Bolinhas {
  el = div('bt-bolinhas');
  /** `direita`: a fileira termina em x (alinhada à direita) */
  constructor(private x: number, y: number, private direita: boolean) { em(this.el, x, y); }
  definir(estados: number[]) {
    this.el.replaceChildren();
    estados.forEach((e, i) => this.el.append(em(fxUi('ui-cuia-mini', e).el, i * 8, 0)));
    this.el.style.left = (this.direita ? this.x - estados.length * 8 : this.x) + 'px';
  }
}

/** número de dano que sobe e some (opção "números de dano") */
export function numeroDano(pai: HTMLElement, x: number, y: number, valor: number, cor: 'branco' | 'amarelo' | 'verde' = 'branco'): { atualizar(dt: number): boolean } {
  const t = texto((cor === 'verde' ? '+' : '-') + valor, { cor, sombra: true, tamanho: 12 });
  const w = parseInt(t.style.width); pai.append(em(t, x - w / 2, y)); t.classList.add('bt-num');
  let s = 0;
  return { atualizar(dt) { s += dt; t.style.top = Math.round(y - Math.min(14, s * 40)) + 'px'; if (s > 0.7) { t.remove(); return true; } return false; } };
}
