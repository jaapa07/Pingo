/** Gerador único do jogo (mulberry32) com semente salva. Todo o acaso do jogo passa por aqui. */
let s = 0x9e3779b9;
export const rng = {
  seed(n: number) { s = n >>> 0 || 1; },
  estado() { return s >>> 0; },
  /** [0, 1) */
  f(): number { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },
  /** inteiro em [a, b] */
  int(a: number, b: number) { return a + Math.floor(this.f() * (b - a + 1)); },
  chance(p: number) { return this.f() < p; },
  escolha<T>(xs: readonly T[]): T { return xs[Math.floor(this.f() * xs.length)]; },
  /** escolha ponderada */
  peso<T extends { peso: number }>(xs: readonly T[]): T { let t = xs.reduce((a, x) => a + x.peso, 0) * this.f(); for (const x of xs) { t -= x.peso; if (t < 0) return x; } return xs[xs.length - 1]; },
};
/** variação cosmética (partículas) que não consome a sequência do jogo */
let c = 12345;
export function cosmetico() { c = (Math.imul(c, 1103515245) + 12345) >>> 0; return c / 4294967296; }
