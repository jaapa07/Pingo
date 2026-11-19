/**
 * Núcleo das bibliotecas de animação: mini-linguagem de quadros desenhados à mão + movimentos do osso
 * `base` comuns a todas as anatomias (respiração, antecipação, squash, recuo, tombo).
 *
 * Regra de ouro: UM VALOR POR QUADRO. Cada lista abaixo tem exatamente o número de quadros da animação;
 * o que você escreve é a pose de cada quadro do sprite (nada de curvas longas amostradas ao acaso).
 */
import type { Anim, AnimSet, Key, Ease } from '../../../render/anim';
import type { V3 } from '../../../render/sculpt';

export type Faixas = Record<string, Key[]>;
export type Mov = 'entrada' | 'idle' | 'fisico' | 'especial' | 'dano' | 'desmaio' | 'status' | 'andar' | 'parado';
export type Movs = Record<Mov, Faixas>;
export interface AnimsCriatura { frente: AnimSet; costas: AnimSet; mapa: AnimSet }

/** Quadros, ritmo e olhos de cada movimento (dentro das faixas do contrato de MODELOS.md). */
export const RITMO: Record<Mov, { frames: number; fps: number; loop: boolean; olho?: 'fechado' }> = {
  entrada: { frames: 5, fps: 10, loop: false },
  idle: { frames: 4, fps: 5, loop: true },
  fisico: { frames: 5, fps: 10, loop: false },
  especial: { frames: 6, fps: 9, loop: false },
  dano: { frames: 3, fps: 8, loop: false },
  desmaio: { frames: 5, fps: 7, loop: false, olho: 'fechado' },
  status: { frames: 4, fps: 4, loop: true, olho: 'fechado' },
  andar: { frames: 4, fps: 8, loop: true },
  parado: { frames: 2, fps: 2, loop: true },
};

const tq = (i: number, n: number) => (n <= 1 ? 0 : i / (n - 1));
const e: Ease = 'linear';

/* ---- animações SEM loop: um valor por quadro (t = i/(n−1)) ---- */
export const qr = (v: V3[]): Key[] => v.map((r, i) => ({ t: tq(i, v.length), r, e }));
export const qx = (v: number[]): Key[] => qr(v.map((a) => [a, 0, 0] as V3));
export const qy = (v: number[]): Key[] => qr(v.map((a) => [0, a, 0] as V3));
export const qz = (v: number[]): Key[] => qr(v.map((a) => [0, 0, a] as V3));
export const qp = (v: V3[]): Key[] => v.map((p, i) => ({ t: tq(i, v.length), p, e }));
export const qs = (v: (V3 | number)[]): Key[] => v.map((s, i) => ({ t: tq(i, v.length), s, e }));

/* ---- animações EM loop: um valor por quadro (t = i/n) e o primeiro repetido em t = 1 ---- */
const volta = <T,>(v: T[]) => [...v, v[0]];
export const lr = (v: V3[]): Key[] => volta(v).map((r, i) => ({ t: i / v.length, r, e }));
export const lx = (v: number[]): Key[] => lr(v.map((a) => [a, 0, 0] as V3));
export const ly = (v: number[]): Key[] => lr(v.map((a) => [0, a, 0] as V3));
export const lz = (v: number[]): Key[] => lr(v.map((a) => [0, 0, a] as V3));
export const lp = (v: V3[]): Key[] => volta(v).map((p, i) => ({ t: i / v.length, p, e }));
export const ls = (v: (V3 | number)[]): Key[] => volta(v).map((s, i) => ({ t: i / v.length, s, e }));

/** Multiplica uma lista de números (amplitude por criatura). */
export const amp = (k: number, v: number[]) => v.map((x) => x * k);
/** Vetores [x,y,z] escalados por u (unidade de tamanho da criatura). */
export const vu = (u: number, v: V3[]): V3[] => v.map(([x, y, z]) => [x * u, y * u, z * u] as V3);

/**
 * Junta camadas de faixas. No mesmo osso, r/p/s de camadas diferentes convivem; se duas camadas
 * definem o MESMO campo no mesmo osso, vale a última (é assim que a criatura sobrescreve o kit).
 */
export function junta(...camadas: (Faixas | undefined)[]): Faixas {
  const out: Faixas = {};
  for (const c of camadas) {
    if (!c) continue;
    for (const [osso, keys] of Object.entries(c)) {
      const campos = new Set<string>();
      for (const k of keys) { if (k.r) campos.add('r'); if (k.p) campos.add('p'); if (k.s !== undefined) campos.add('s'); }
      const antigos = (out[osso] ?? []).map((k) => {
        const n: Key = { ...k };
        if (campos.has('r')) delete n.r; if (campos.has('p')) delete n.p; if (campos.has('s')) delete n.s;
        return n;
      }).filter((k) => k.r || k.p || k.s !== undefined);
      out[osso] = [...antigos, ...keys];
    }
  }
  return out;
}

export interface BaseP {
  /** unidade de tamanho: altura do corpo da criatura em unidades do modelo */ u: number;
  /** força do squash/stretch (1 = padrão; pesados ~0.6, molengas ~1.4) */ mole?: number;
  /** alcance da investida do ataque físico em u (padrão 0.08 ≈ 3 px; o jogo desloca o sprite inteiro por conta própria) */ investida?: number;
  /** altura de flutuação: se > 0, a criatura paira e o desmaio a derruba essa altura */ flutua?: number;
}

/**
 * Movimentos do osso `base` (e do `corpo` para quem flutua), iguais para qualquer anatomia.
 * Cada kit soma por cima as faixas dos membros.
 */
export function movBase(o: BaseP): Movs {
  const u = o.u, k = o.mole ?? 1, inv = (o.investida ?? 0.08) * u, f = o.flutua ?? 0;
  const sq = (a: number): V3 => [1 + a * k * 0.8, 1 - a * k, 1 + a * k * 0.8]; // a > 0 achata, a < 0 estica
  const paira = f > 0;
  const movs: Movs = {
    // sai da cuia pequeno, salta esticado, aterrissa achatado, assenta
    entrada: { base: [...qs([0.5, sq(-0.1), sq(0.13), sq(-0.05), 1]), ...qp(vu(u, [[0, 0, 0], [0, 0.06, 0], [0, 0, 0], [0, 0.015, 0], [0, 0, 0]]))] },
    // respiração: enche (estica de leve) e solta (achata)
    idle: { base: ls([1, sq(0.03), sq(0.05), sq(0.02)]) },
    // antecipa recuando e achatando, dispara esticado, segura o golpe, volta
    fisico: { base: [...qp([[-inv * 0.5, 0, 0], [-inv * 0.8, 0, 0], [inv, 0.03 * u, 0], [inv * 0.7, 0, 0], [0, 0, 0]]), ...qs([sq(0.06), sq(0.13), [1.1, 0.95, 0.96], sq(0.03), 1]), ...qz([3, 6, -7, -3, 0])] },
    // carrega encolhido (treme), solta para cima, assenta
    especial: { base: [...qs([sq(0.07), sq(0.15), sq(0.13), sq(-0.1), sq(-0.04), 1]), ...qp(vu(u, [[0, 0, 0], [-0.02, 0, 0], [0.02, 0, 0], [0, 0.03, 0], [0, 0.01, 0], [0, 0, 0]]))] },
    // recuo seco de ~2 px com o corpo jogado para trás
    dano: { base: [...qp(vu(u, [[-0.07, 0.01, 0], [-0.04, 0, 0], [0, 0, 0]])), ...qz([7, 3, 0]), ...qs([sq(-0.06), sq(0.05), 1])] },
    // cambaleia, cede e arria
    desmaio: { base: [...qr([[0, 0, 6], [0, 0, -4], [8, 0, -6], [14, 0, -3], [15, 0, -2]]), ...qs([sq(-0.04), sq(0.02), sq(0.1), sq(0.2), sq(0.16)])] },
    // tonto/dormindo: balança devagar de um lado para o outro
    status: { base: [...lr([[-5, 0, 0], [0, 0, 2], [5, 0, 0], [0, 0, -2]]), ...ls([sq(0.02), 1, sq(0.04), 1])] },
    // passo: sobe nos quadros de passagem
    andar: { base: lp(vu(u, [[0, 0, 0], [0, 0.04, 0], [0, 0, 0], [0, 0.04, 0]])) },
    parado: { base: ls([1, sq(0.05)]) },
  };
  if (paira) {
    // quem flutua sobe e desce em vez de pisar; no desmaio afunda até o chão
    movs.idle.corpo = lp(vu(u, [[0, 0, 0], [0, 0.035, 0], [0, 0.05, 0], [0, 0.02, 0]]));
    movs.status.corpo = lp(vu(u, [[0, -0.02, 0], [0, 0, 0], [0, -0.02, 0], [0, -0.04, 0]]));
    movs.andar.base = lp(vu(u, [[0, 0, 0], [0, 0.05, 0], [0, 0.02, 0], [0, -0.03, 0]]));
    movs.parado.base = lp(vu(u, [[0, 0, 0], [0, 0.04, 0]]));
    movs.desmaio.corpo = qp([[0, 0.03 * u, 0], [0, -f * 0.15, 0], [0, -f * 0.6, 0], [0, -f, 0], [0, -f * 0.96, 0]]);
  }
  return movs;
}

/** Soma camadas por movimento: `somar(movBase(..), membros, extras)`. A chave `todas` entra em todos. */
export function somar(...camadas: (Partial<Record<Mov | 'todas', Faixas>> | undefined)[]): Movs {
  const nomes = Object.keys(RITMO) as Mov[];
  const out = {} as Movs;
  for (const n of nomes) out[n] = junta(...camadas.map((c) => c?.todas), ...camadas.map((c) => c?.[n]));
  return out;
}

/** Proporções "de bolso" só para a vista de mapa (24 px): encurta, alarga e aumenta a cabeça. */
export interface MapaChibi { /** escala do comprimento do corpo */ comp?: number; /** escala da largura */ larg?: number; /** escala da cabeça */ cabeca?: number; /** ampliação extra nas vistas de frente/costas (S e N), que são estreitas */ frontal?: number; /** ampliação do marcador de olho */ olho?: number }

/** Transforma os 9 movimentos nas 3 vistas do contrato, com os nomes exatos de animação. */
export function montar(mv: Movs, ritmo: Partial<Record<Mov, Partial<(typeof RITMO)[Mov]>>> = {}, chibi: MapaChibi = {}): AnimsCriatura {
  const a = (n: Mov, extra: Partial<Anim> = {}): Anim => {
    const r = { ...RITMO[n], ...ritmo[n] };
    return { frames: r.frames, fps: r.fps, loop: r.loop, ...(r.olho ? { olho: r.olho } : {}), keys: mv[n], ...extra };
  };
  // no mapa o bicho vira "miniatura": mais curto, mais largo e cabeçudo, para ler em 24 px nas 4 direções
  const bolso = (yaw: number): Faixas => {
    const k = yaw === 0 || yaw === 180 ? chibi.frontal ?? 1.25 : 1;
    return { root: [{ t: 0, s: k }], corpo: [{ t: 0, s: [chibi.comp ?? 0.8, 1, chibi.larg ?? 1.3] }], '?cabeca': [{ t: 0, s: chibi.cabeca ?? 1.2 }], '?olho_d': [{ t: 0, s: chibi.olho ?? 1.4 }], '?olho_e': [{ t: 0, s: chibi.olho ?? 1.4 }] };
  };
  const mp = (n: Mov, yaw: number): Anim => { const an = a(n, { yaw }); return { ...an, keys: junta(bolso(yaw), an.keys) }; };
  return {
    frente: { entrada: a('entrada'), idle: a('idle'), 'ataque-fisico': a('fisico'), 'ataque-especial': a('especial'), dano: a('dano'), desmaio: a('desmaio'), status: a('status') },
    costas: { idle: a('idle'), 'ataque-fisico': a('fisico'), 'ataque-especial': a('especial'), dano: a('dano'), desmaio: a('desmaio') },
    mapa: { 'andar-s': mp('andar', 0), 'andar-l': mp('andar', 90), 'andar-n': mp('andar', 180), 'andar-o': mp('andar', -90), 'idle-s': mp('parado', 0) },
  };
}
