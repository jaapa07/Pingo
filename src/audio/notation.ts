/** Leitura da notação das faixas para eventos na grade de passos. */
import type { EstiloHarmonia, Faixa, InstId, Parte, PecaId } from '../data/music/types';

export interface Evento { passo: number; dur: number; midi: number; vel: number; inst: InstId | PecaId; parte: Parte }

const NOTAS: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export function notaMidi(s: string): number {
  const l = s[0].toLowerCase();
  let i = 1;
  let ac = 0;
  while (i < s.length - 1 && (s[i] === '#' || s[i] === 'b')) { ac += s[i] === '#' ? 1 : -1; i++; }
  const oct = Number(s.slice(i));
  if (!(l in NOTAS) || !Number.isFinite(oct)) throw new Error('nota inválida: ' + s);
  return NOTAS[l] + ac + (oct + 1) * 12;
}

const QUAL: Record<string, number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus2: [0, 2, 7], sus4: [0, 5, 7],
  dim: [0, 3, 6], aug: [0, 4, 8], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14], '9': [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], '5': [0, 7, 12],
};

export function acorde(sim: string, oitava: number): number[] {
  const semBaixo = sim.split('/')[0];
  const m = /^([A-G])(#|b)?(.*)$/.exec(semBaixo);
  if (!m) throw new Error('acorde inválido: ' + sim);
  const q = QUAL[m[3]];
  if (!q) throw new Error('qualidade inválida: ' + sim);
  let raiz = NOTAS[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  raiz = ((raiz % 12) + 12) % 12;
  // fundamental perto do centro da oitava pedida (voicing fechado, sem saltos grandes)
  let base = raiz + (oitava + 1) * 12;
  if (raiz > 7) base -= 12;
  return q.map((iv) => base + iv);
}

/** Converte uma parte melódica (compassos com `|`) em eventos. */
export function lerParte(texto: string, passoInicial: number, passosCompasso: number, parte: Parte, inst: InstId, eventos: Evento[], ultimo: { ev: Evento | null; dur: number }, avisos?: string[]): number {
  const compassos = texto.split('|');
  let p = passoInicial;
  for (const comp of compassos) {
    const fichas = comp.trim().split(/\s+/).filter(Boolean);
    const ini = p;
    if (fichas.length === 1 && fichas[0] === '-') { ultimo.ev = null; p += passosCompasso; continue; }
    for (const f of fichas) {
      let s = f;
      let vel = 0.8;
      if (s.endsWith('!')) { vel = 1; s = s.slice(0, -1); } else if (s.endsWith('?')) { vel = 0.5; s = s.slice(0, -1); }
      const [nome, durTxt] = s.split(':');
      if (durTxt) ultimo.dur = Number(durTxt);
      const dur = ultimo.dur;
      if (nome === 'r') { ultimo.ev = null; }
      else if (nome === '_') { if (ultimo.ev) ultimo.ev.dur += dur; }
      else {
        const ev: Evento = { passo: p, dur, midi: notaMidi(nome), vel, inst, parte };
        eventos.push(ev);
        ultimo.ev = ev;
      }
      p += dur;
    }
    // compasso incompleto é completado com pausa; compasso estourado mantém a grade
    if (avisos && fichas.length && p !== ini + passosCompasso) avisos.push(`${parte}: compasso ${Math.round((ini - passoInicial) / passosCompasso) + 1} soma ${p - ini} (esperado ${passosCompasso}): ${comp.trim()}`);
    p = ini + passosCompasso;
  }
  return p;
}

export interface AcordeNoTempo { sim: string; passo: number; dur: number }

/** Lê a cifra (compassos com `|`, vários acordes por compasso dividem o tempo por igual; `%` repete, `-` cala). */
export function listarAcordes(texto: string, passoInicial: number, pc: number, anterior: { a: string }): AcordeNoTempo[] {
  const lista: AcordeNoTempo[] = [];
  let p = passoInicial;
  for (const comp of texto.split('|')) {
    const sims = comp.trim().split(/\s+/).filter(Boolean);
    const n = Math.max(1, sims.length);
    const fatia = pc / n;
    sims.forEach((s0, i) => {
      const s = s0 === '%' ? anterior.a : s0;
      if (s !== '-') anterior.a = s;
      lista.push({ sim: s, passo: p + Math.round(i * fatia), dur: Math.round((i + 1) * fatia) - Math.round(i * fatia) });
    });
    p += pc;
  }
  return lista;
}

export function lerAcordes(lista: AcordeNoTempo[], passoInicial: number, estilo: EstiloHarmonia, inst: InstId, eventos: Evento[]): void {
  const oit = estilo.oitava ?? 4;
  for (const a of lista) {
    if (a.sim === '-') continue;
    const notas = acorde(a.sim, oit);
    if (estilo.tipo === 'pad') {
      for (const m of notas) eventos.push({ passo: a.passo, dur: a.dur, midi: m, vel: 0.75, inst, parte: 'harmonia' });
    } else if (estilo.tipo === 'arpejo') {
      const pad = estilo.padrao ?? [0, 1, 2, 1];
      const st = estilo.passo ?? 2;
      let k = 0;
      for (let q = 0; q < a.dur; q += st, k++) {
        const idx = pad[k % pad.length];
        const m = notas[idx % notas.length] + 12 * Math.floor(idx / notas.length);
        eventos.push({ passo: a.passo + q, dur: st * 2, midi: m, vel: k % 4 === 0 ? 0.85 : 0.65, inst, parte: 'harmonia' });
      }
    } else {
      const grade = estilo.grade ?? 'x...x...x...x...';
      const curto = estilo.tipo === 'stab';
      for (let q = 0; q < a.dur; q++) {
        const ch = grade[(a.passo + q - passoInicial) % grade.length];
        if (ch !== 'x' && ch !== 'X') continue;
        let prox = q + 1;
        while (prox < a.dur && grade[(a.passo + prox - passoInicial) % grade.length] === '.') prox++;
        const dur = curto ? 1 : Math.max(1, prox - q);
        notas.forEach((m, i) => eventos.push({ passo: a.passo + q + i * 0.12, dur, midi: m, vel: ch === 'X' ? 0.9 : 0.7, inst, parte: 'harmonia' }));
      }
    }
  }
}

/** Fundamental (ou baixo invertido `C/E`) e intervalos do acorde, para o baixo derivado da cifra. */
function raizBaixo(sim: string): { pc: number; q: number[] } {
  const [corpo, inv] = sim.split('/');
  const m = /^([A-G])(#|b)?(.*)$/.exec(corpo);
  if (!m) throw new Error('acorde inválido: ' + sim);
  const q = QUAL[m[3]] ?? QUAL[''];
  const classe = (l: string, ac?: string) => (((NOTAS[l.toLowerCase()] + (ac === '#' ? 1 : ac === 'b' ? -1 : 0)) % 12) + 12) % 12;
  const raiz = classe(m[1], m[2]);
  if (inv) {
    const mi = /^([A-G])(#|b)?$/.exec(inv);
    if (mi) { const b = classe(mi[1], mi[2]); return { pc: b, q: q.map((iv) => (((raiz + iv - b) % 12) + 12) % 12) }; }
  }
  return { pc: raiz, q };
}

const alturaBaixo = (pc: number): number => (pc > 8 ? pc + 24 : pc + 36);

/** Baixo derivado da cifra por uma grade rítmica (ver `Secao` em types.ts). */
export function lerBaixoAuto(texto: string, lista: AcordeNoTempo[], passoInicial: number, pc: number, compassos: number, inst: InstId, eventos: Evento[]): void {
  const grades = texto.split('|').map((g) => g.trim()).filter(Boolean);
  const validos = lista.filter((a) => a.sim !== '-');
  if (!grades.length || !validos.length) return;
  for (let b = 0; b < compassos; b++) {
    const grade = grades[b % grades.length];
    for (let q = 0; q < pc && q < grade.length; q++) {
      const ch = grade[q];
      if (ch === '.' || ch === '-') continue;
      const passo = passoInicial + b * pc + q;
      let i = -1;
      for (let k = 0; k < lista.length; k++) if (lista[k].passo <= passo) i = k;
      if (i < 0 || lista[i].sim === '-') continue;
      const r = raizBaixo(lista[i].sim);
      const base = alturaBaixo(r.pc);
      let midi = base;
      if (ch === '3') midi = base + r.q[1];
      else if (ch === '5') midi = base + r.q[2] - (r.q[2] > 5 && base > 38 ? 12 : 0);
      else if (ch === '7') midi = base + (r.q[3] ?? (r.q[1] === 3 ? 10 : 9)) - 12;
      else if (ch === '8') midi = base + 12;
      else if (ch === 'a') {
        let j = i + 1;
        while (j < lista.length && (lista[j].sim === '-' || lista[j].sim === lista[i].sim)) j++;
        const prox = j < lista.length ? lista[j] : validos[0];
        midi = alturaBaixo(raizBaixo(prox.sim).pc) - 1;
      } else if (ch !== '1') continue;
      let fim = q + 1;
      while (fim < pc && fim < grade.length && grade[fim] === '.') fim++;
      eventos.push({ passo, dur: fim - q, midi, vel: q % 4 === 0 ? 0.85 : 0.7, inst, parte: 'baixo' });
    }
  }
}

const VEL: Record<string, number> = { X: 1, x: 0.75, o: 0.38 };

export interface Compilada {
  faixa: Faixa;
  total: number;
  pc: number;
  porPasso: Evento[][];
  compassos: number;
}

export function compilar(f: Faixa, avisos?: string[]): Compilada {
  const pc = f.passos ?? 16;
  const eventos: Evento[] = [];
  let p = 0;
  const ult = { melodia: { ev: null as Evento | null, dur: 4 }, contra: { ev: null as Evento | null, dur: 4 }, baixo: { ev: null as Evento | null, dur: 4 } };
  const ant = { a: 'C' };
  let compassos = 0;
  for (const id of f.ordem) {
    const s = f.secoes[id];
    if (!s) throw new Error(`seção ${id} ausente em ${f.id}`);
    const n = s.acordes.split('|').length;
    const inst = { ...f.inst, ...(s.inst ?? {}) };
    const av = avisos ? [] as string[] : undefined;
    for (const [nome, txt] of [['melodia', s.melodia], ['contra', s.contra]] as const) {
      const nb = txt.split('|').length;
      if (av && nb !== n && txt.trim() !== '-') av.push(`${nome}: ${nb} compassos para ${n} de cifra`);
    }
    lerParte(s.melodia, p, pc, 'melodia', inst.melodia, eventos, ult.melodia, av);
    lerParte(s.contra, p, pc, 'contra', inst.contra, eventos, ult.contra, av);
    const lista = listarAcordes(s.acordes, p, pc, ant);
    if (s.baixo.trim().startsWith('@')) { lerBaixoAuto(s.baixo.trim().slice(1), lista, p, pc, n, inst.baixo, eventos); ult.baixo.ev = null; }
    else {
      if (av && s.baixo.split('|').length !== n) av.push(`baixo: ${s.baixo.split('|').length} compassos para ${n} de cifra`);
      lerParte(s.baixo, p, pc, 'baixo', inst.baixo, eventos, ult.baixo, av);
    }
    if (av && avisos) for (const a of av) avisos.push(`${f.id}/${id} ${a}`);
    lerAcordes(lista, p, s.estilo ?? f.estilo, inst.harmonia, eventos);
    const pads = s.bateria.trim().split(/\s+/);
    for (let b = 0; b < n; b++) {
      const pid = pads[b % pads.length];
      if (pid === '-') continue;
      const padrao = f.bateria[pid];
      if (!padrao) throw new Error(`padrão ${pid} ausente em ${f.id}`);
      for (const [peca, grade] of Object.entries(padrao) as [PecaId, string][]) {
        for (let q = 0; q < pc && q < grade.length; q++) {
          const v = VEL[grade[q]];
          if (v) eventos.push({ passo: p + b * pc + q, dur: 1, midi: 60, vel: v, inst: peca, parte: 'bateria' });
        }
      }
    }
    p += n * pc;
    compassos += n;
  }
  const total = p;
  const porPasso: Evento[][] = Array.from({ length: total }, () => []);
  for (const e of eventos) {
    const i = Math.floor(e.passo);
    if (i >= 0 && i < total) porPasso[i].push(e);
  }
  return { faixa: f, total, pc, porPasso, compassos };
}
