/**
 * Núcleo das animações de golpe: contexto (`Golpeio`) e os movimentos básicos com que cada animação é composta
 * (projéteis, chuvas, órbitas, estouros, investidas). Posições sempre em px inteiros.
 */
import type { Ator } from '../view/palco';
import type { Cena, Fx, OpFx, Pt } from '../view/cena';

export interface Golpeio {
  c: Cena;
  /** quem usa o golpe */
  eu: Ator;
  /** quem foi atingido (pode ser o próprio usuário em golpes de apoio; vazio em golpes de campo) */
  alvos: Ator[];
  /** primeiro alvo (ou o próprio usuário, se não houver) */
  alvo: Ator;
  /** adversário à frente do usuário (para efeitos que cruzam o campo mesmo sem alvo) */
  outro: Ator;
  /** sentido do golpe no eixo x: +1 do jogador para o rival, −1 ao contrário */
  d: 1 | -1;
  som(id: string, o?: { pitch?: number; vol?: number }): void;
}
export type AnimGolpe = (k: Golpeio) => Promise<void>;

export const TAU = Math.PI * 2;
export const esp = (k: Golpeio, s: number) => k.c.espera(s);
/** ponto de onde saem os projéteis: à frente do corpo de quem ataca */
export const boca = (k: Golpeio): Pt => { const [x, y] = k.eu.centro; return [x + k.d * Math.round(k.eu.larg * 0.7), y - k.d * 4]; };
export const somar = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];
/** direção unitária de quem ataca até o alvo */
export function rumo(k: Golpeio, alvo: Ator = k.alvo === k.eu ? k.outro : k.alvo): Pt { const a = k.eu.centro, b = alvo.centro, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; }
/** roda `f` para cada alvo ao mesmo tempo */
export const emCada = (k: Golpeio, f: (a: Ator, i: number) => Promise<unknown> | void) => Promise.all(k.alvos.map((a, i) => f(a, i)));
/** várias coisas ao mesmo tempo */
export const juntos = (...ps: (Promise<unknown> | void)[]) => Promise.all(ps);
const esp1 = (k: Golpeio) => k.d === -1;

/** quem ataca avança `dist` px na direção do alvo e volta */
export async function investida(k: Golpeio, dist = 10, ida = 0.07, volta = 0.13, aoBater?: () => void) {
  const [ux, uy] = rumo(k), a = k.eu;
  await k.c.rel.entre(ida, (t) => { a.dx = Math.round(ux * dist * t); a.dy = Math.round(uy * dist * t * 0.6); });
  aoBater?.();
  await k.c.rel.entre(volta, (t) => { a.dx = Math.round(ux * dist * (1 - t)); a.dy = Math.round(uy * dist * (1 - t) * 0.6); });
  a.dx = a.dy = 0;
}
/** pulinho no lugar */
export async function pulo(k: Golpeio, a: Ator, alt = 6, dur = 0.22) { await k.c.rel.entre(dur, (t) => { a.dy = -Math.round(Math.sin(t * Math.PI) * alt); }); a.dy = 0; }
/** balanço lateral (medo, vento, choque) */
export async function balanco(k: Golpeio, a: Ator, amp = 2, dur = 0.4, freq = 14) { await k.c.rel.entre(dur, (t) => { a.dx = Math.round(Math.sin(t * dur * freq * TAU / 2) * amp); }); a.dx = 0; }
/** recuo: quem ataca se afasta do alvo e volta (tomar impulso) */
export async function impulso(k: Golpeio, dist = 5, dur = 0.16) { const [ux, uy] = rumo(k), a = k.eu; await k.c.rel.entre(dur, (t) => { const s = Math.sin(t * Math.PI); a.dx = -Math.round(ux * dist * s); a.dy = -Math.round(uy * dist * s * 0.6); }); a.dx = a.dy = 0; }

export interface OpTiro extends OpFx {
  n?: number; intervalo?: number; dur?: number; arco?: number;
  /** espalhamento da chegada em px */
  espalha?: number;
  /** espalhamento da saída em px */
  abre?: number;
  /** FX tocado na chegada de cada projétil */
  impacto?: string;
  de?: Pt; alvo?: Ator;
  /** som de cada chegada */
  som?: string;
  /** rastro: id do FX deixado pelo caminho */
  rastro?: string;
  /** ondulação lateral do voo em px */
  onda?: number;
}
/** `n` projéteis de quem ataca até o alvo, um depois do outro; resolve quando o último chega */
export async function tiro(k: Golpeio, id: string, o: OpTiro = {}) {
  const n = o.n ?? 1, alvo = o.alvo ?? (k.alvo === k.eu ? k.outro : k.alvo), de = o.de ?? boca(k), ps: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const a: Pt = [de[0] + (o.abre ? k.c.var(o.abre) : 0), de[1] + (o.abre ? k.c.var(o.abre) : 0)];
    const b: Pt = [alvo.centro[0] + (o.espalha ? k.c.var(o.espalha) : 0), alvo.centro[1] + (o.espalha ? k.c.var(o.espalha) : 0)];
    ps.push((async () => {
      const f = k.c.fx(id, a[0], a[1], { loop: true, espelho: esp1(k), ...o });
      const dur = o.dur ?? 0.3, nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1; let ult = 0;
      await k.c.rel.entre(dur, (t) => {
        const w = o.onda ? Math.sin(t * TAU * 1.5) * o.onda : 0;
        f.x = Math.round(a[0] + (b[0] - a[0]) * t + (nx / L) * w); f.y = Math.round(a[1] + (b[1] - a[1]) * t + (ny / L) * w - Math.sin(t * Math.PI) * (o.arco ?? 0));
        if (o.rastro && t - ult > 0.16 && t < 0.95) { ult = t; k.c.fx(o.rastro, f.x, f.y, { atras: o.atras }); }
      });
      f.remover();
      if (o.som) k.som(o.som);
      if (o.impacto) k.c.fx(o.impacto, b[0], b[1]);
    })());
    if (i < n - 1) await esp(k, o.intervalo ?? 0.08);
  }
  await Promise.all(ps);
}

/** coisas caindo do alto sobre um ator */
export async function chuva(k: Golpeio, id: string, a: Ator, o: OpFx & { n?: number; dur?: number; larg?: number; altura?: number; intervalo?: number; impacto?: string; vies?: number; alvoY?: number; som?: string } = {}) {
  const n = o.n ?? 5, ps: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const x = a.x + k.c.var(o.larg ?? a.larg), y1 = (o.alvoY ?? a.y - Math.round(a.alt * 0.35)) + k.c.var(5), y0 = y1 - (o.altura ?? 70), x0 = x - (o.vies ?? 0);
    ps.push((async () => { await k.c.voar(id, [x0, y0], [x, y1], o.dur ?? 0.3, { ...o }); if (o.som) k.som(o.som); if (o.impacto) k.c.fx(o.impacto, x, y1); })());
    if (i < n - 1) await esp(k, o.intervalo ?? 0.06);
  }
  await Promise.all(ps);
}
/** `n` FX girando em volta de um ator (elipse em px inteiros) */
export async function orbita(k: Golpeio, id: string, a: Ator, o: OpFx & { n?: number; rx?: number; ry?: number; voltas?: number; dur?: number; sobe?: number; fecha?: boolean; dy?: number } = {}) {
  const n = o.n ?? 3, rx = o.rx ?? a.larg + 8, ry = o.ry ?? 7, [cx, cy] = a.centro, base = cy + (o.dy ?? 0);
  const fs: Fx[] = []; for (let i = 0; i < n; i++) fs.push(k.c.fx(id, cx, base, { loop: true, ...o }));
  await k.c.rel.entre(o.dur ?? 0.7, (t) => {
    const raio = o.fecha ? 1 - t * 0.85 : 1;
    fs.forEach((f, i) => {
      const ang = (i / n + t * (o.voltas ?? 1)) * TAU, s = Math.sin(ang);
      f.x = Math.round(cx + Math.cos(ang) * rx * raio); f.y = Math.round(base + s * ry * raio - (o.sobe ?? 0) * t);
      // metade de trás da órbita passa por trás da criatura
      const pai = s < 0 ? k.c.tras : k.c.frente; if (f.el.parentElement !== pai) pai.append(f.el);
    });
  });
  for (const f of fs) f.remover();
}
/** partículas subindo (ou descendo, com `desce`) em volta de um ator */
export async function subir(k: Golpeio, id: string, a: Ator, o: OpFx & { n?: number; dur?: number; alt?: number; larg?: number; intervalo?: number; desce?: boolean; dy?: number } = {}) {
  const n = o.n ?? 5, ps: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const x = a.x + k.c.var(o.larg ?? a.larg + 4), y0 = a.y - (o.dy ?? 4) - k.c.var(4) - (o.desce ? (o.alt ?? a.alt + 10) : 0), y1 = y0 + (o.desce ? 1 : -1) * (o.alt ?? a.alt + 10);
    ps.push(k.c.voar(id, [x, y0], [x, y1], o.dur ?? 0.45, { ...o }));
    if (i < n - 1) await esp(k, o.intervalo ?? 0.06);
  }
  await Promise.all(ps);
}
/** partículas que saem do centro para todos os lados */
export async function estilhacos(k: Golpeio, id: string, p: Pt, o: OpFx & { n?: number; raio?: number; dur?: number; queda?: number; fase?: number } = {}) {
  const n = o.n ?? 6, ps: Promise<void>[] = [];
  for (let i = 0; i < n; i++) {
    const ang = ((i + (o.fase ?? 0.3)) / n) * TAU, r = (o.raio ?? 22) + k.c.var(4);
    ps.push(k.c.voar(id, p, [Math.round(p[0] + Math.cos(ang) * r), Math.round(p[1] + Math.sin(ang) * r * 0.7 + (o.queda ?? 0))], o.dur ?? 0.3, { arco: o.queda ? 8 : 0, ...o }));
  }
  await Promise.all(ps);
}
/** carimba um FX ao longo da linha de quem ataca até o alvo (jatos, sopros, feixes) */
export async function trilha(k: Golpeio, id: string, o: OpFx & { n?: number; intervalo?: number; alvo?: Ator; de?: Pt; ate?: number; onda?: number } = {}) {
  const alvo = o.alvo ?? (k.alvo === k.eu ? k.outro : k.alvo), a = o.de ?? boca(k), b = alvo.centro, n = o.n ?? 6, fs: Fx[] = [];
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) / n) * (o.ate ?? 1), w = o.onda ? Math.round(Math.sin(i * 1.9) * o.onda) : 0;
    fs.push(k.c.fx(id, Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t) + w, { espelho: esp1(k), ...o }));
    await esp(k, o.intervalo ?? 0.04);
  }
  return fs;
}
/** FX no alvo (centro do corpo, ou nos pés com `base`) */
export function noAlvo(k: Golpeio, id: string, a: Ator = k.alvo, o: OpFx & { dx?: number; dy?: number } = {}): Fx {
  const p = o.base ? a.pes : a.centro;
  return k.c.fx(id, p[0] + (o.dx ?? 0), p[1] + (o.dy ?? 0) + (o.base ? 2 : 0), o);
}
/** FX que atravessa a tela na horizontal passando pelo alvo */
export async function varrer(k: Golpeio, id: string, a: Ator, o: OpFx & { dur?: number; dy?: number; margem?: number } = {}) {
  const [x, y] = o.base ? a.pes : a.centro, m = o.margem ?? 70;
  await k.c.voar(id, [x - k.d * m, y + (o.dy ?? 0)], [x + k.d * m, y + (o.dy ?? 0)], o.dur ?? 0.4, { espelho: esp1(k), ...o });
}
/** pisca a criatura (visível/invisível) algumas vezes */
export async function piscar(k: Golpeio, a: Ator, vezes = 3, passo = 0.05) { for (let i = 0; i < vezes; i++) { a.visivel = false; await esp(k, passo); a.visivel = true; await esp(k, passo); } }
/** silhueta branca por um instante */
export async function clarear(k: Golpeio, a: Ator, s = 0.08) { a.branco = true; await esp(k, s); a.branco = false; }
