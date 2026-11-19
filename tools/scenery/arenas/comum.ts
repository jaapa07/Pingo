/** Montagens comuns às arenas: chão natural com clareira e apoios, e animações recorrentes. */
import { Tela, Rampa, Cor, VAZIO, h, fbm, Seq, APOIO, W, H, type AnimDef, type Ctx } from './nucleo';
import { terreno, mancha, franja, capim, salpico } from './pecas';

export interface ChaoOpt {
  /** horizonte por coluna */
  yh: (x: number) => number;
  /** rampa de 5 tons: [sombra funda, sombra, base, clareira, luz] */
  r: Rampa;
  s: number;
  /** quantidade de tufos de capim */
  tufos?: number;
  /** sem franja de grama no topo (areia, pedra) */
  liso?: boolean;
  /** textura: tracinhos de grama ('v'), grãos ('g') ou nada */
  textura?: 'v' | 'g' | 'n';
  capimR?: Rampa;
  /** sem a faixa de sombra junto ao horizonte (campo aberto) */
  aberto?: boolean;
}
/** Chão orgânico: base, sombra sob o cenário e nos cantos, clareira central clara e os dois apoios. */
export function chaoNatural(t: Tela, o: ChaoOpt) {
  const { r, s } = o;
  terreno(t, o.yh, () => r[2]);
  // sombra das árvores junto ao horizonte e nos cantos de baixo
  t.campo(0, 0, W, H, (x, y) => {
    if (t.g(x, y) === VAZIO) return VAZIO;
    const yh = o.yh(x), prof = y - yh;
    const n = fbm(x, y * 2, 22, s + 2);
    if (!o.aberto && prof < 5 + n * 10) return r[1];
    const canto = Math.max(0, (Math.abs(x - 160) - 105) / 55) + Math.max(0, (y - 150) / 30) * 0.6;
    if (canto + n * 0.7 > 0.95) return r[1];
    return VAZIO;
  });
  t.campo(0, 0, W, H, (x, y) => (t.g(x, y) === r[1] && ((!o.aberto && y - o.yh(x) < 2 + fbm(x, 0, 9, s + 4) * 4) || (y > 168 && fbm(x, y, 10, s + 6) > 0.5 && Math.abs(x - 160) > 90)) ? r[0] : VAZIO));
  // clareira: faixa diagonal que une os dois apoios
  mancha(t, 160, 112, 128, 34, r[3], s + 10, 0.42, 18);
  mancha(t, APOIO.inimigo.x - 4, APOIO.inimigo.y + 3, 60, 13, r[3], s + 11, 0.4, 12);
  mancha(t, APOIO.jogador.x + 6, APOIO.jogador.y + 2, 74, 19, r[3], s + 12, 0.4, 14);
  // apoios: miolo mais claro
  mancha(t, APOIO.inimigo.x, APOIO.inimigo.y + 1, 36, 7, r[4], s + 13, 0.45, 9);
  mancha(t, APOIO.jogador.x, APOIO.jogador.y + 1, 46, 10, r[4], s + 14, 0.45, 10);
  mancha(t, 160, 110, 40, 8, r[4], s + 15, 0.6, 9);
  // textura
  const tx = o.textura ?? 'v';
  if (tx !== 'n') salpico(t, 0, 0, W - 1, H - 1, 520, s + 20, (x, y, i) => {
    const c = t.g(x, y); if (c === VAZIO || y - o.yh(x) < 3) return;
    const k = r.indexOf(c); if (k < 0) return;
    const alvo = i % 3 === 0 && k > 0 ? r[k - 1] : k < r.length - 1 ? r[k + 1] : r[k - 1];
    if (tx === 'v') { t.p(x, y, alvo); t.p(x + 1, y - 1, alvo); if (i % 2) t.p(x + 2, y, alvo); else t.p(x - 1, y - 1, alvo); }
    else { t.p(x, y, alvo); if (i % 2) t.p(x + 1, y, alvo); }
  });
  if (!o.liso) franja(t, o.yh, [r[0], r[1], r[2], r[3]], s + 30, 3);
  // tufos de capim, maiores quanto mais perto da câmera
  const cr = o.capimR ?? r;
  salpico(t, 4, 0, W - 5, H - 3, o.tufos ?? 80, s + 40, (x, y, i, k) => {
    const prof = (y - o.yh(x)) / (H - o.yh(x)); if (prof < 0.06) return;
    const c = t.g(x, y), claro = c === r[3] || c === r[4];
    // dentro dos apoios o chão fica limpo
    const de = ((x - APOIO.inimigo.x) / 30) ** 2 + ((y - APOIO.inimigo.y) / 9) ** 2, dj = ((x - APOIO.jogador.x) / 40) ** 2 + ((y - APOIO.jogador.y) / 12) ** 2;
    if (de < 1 || dj < 1) return;
    if (prof > 0.25) { t.p(x - 2, y + 1, r[1]); t.p(x - 1, y + 1, r[1]); t.p(x, y + 1, r[1]); t.p(x + 1, y + 1, r[1]); t.p(x + 2, y + 1, r[1]); }
    capim(t, x, y, 4 + Math.floor(k * 3 + prof * 3), 4 + Math.round(prof * 7 + k * 3), claro ? [cr[1], cr[2], cr[3], cr[4]] : [cr[0], cr[1], cr[2], cr[3]], s + i);
  });
}

/** Partículas que caem em laço perfeito de 4 quadros (folhas, neve, cinzas, pétalas). */
export function animQueda(id: string, x: number, y: number, w: number, hh: number, n: number, s: number, cores: (c: Ctx) => Cor[], o: { fps?: number; vx?: number; passo?: number; forma?: 'folha' | 'ponto' | 'floco' } = {}): AnimDef {
  return {
    id, x, y, w, h: hh, sobre: 'frente', fps: o.fps ?? 5,
    pintar(t, q, c) {
      const cs = cores(c), sq = new Seq(s), passo = o.passo ?? 3;
      for (let i = 0; i < n; i++) {
        const fase = sq.int(0, 3), bx = x + sq.int(2, w - 6), by = y + sq.int(0, hh - 14), cor = cs[i % cs.length];
        const k = (q + fase) % 4, px = bx + Math.round((o.vx ?? 1) * k + Math.sin(k * 1.6 + i) * 1), py = by + k * passo;
        if ((q + fase) % 4 === 3 && i % 2 === 0) continue; // some no último passo: o laço fecha sem salto
        if (o.forma === 'ponto') t.p(px, py, cor);
        else if (o.forma === 'floco') { t.p(px, py, cor); if (i % 3 === 0) { t.p(px + 1, py, cor); t.p(px, py + 1, cor); } }
        else if (k % 2) { t.p(px, py, cor); t.p(px + 1, py + 1, cor); } else { t.p(px, py, cor); t.p(px + 1, py, cor); }
      }
    },
  };
}
/** Vaga-lumes/brilhos que piscam no lugar. */
export function animPisca(id: string, x: number, y: number, w: number, hh: number, n: number, s: number, cores: (c: Ctx) => Cor[], o: { so?: 'dia' | 'noite'; fps?: number; cruz?: boolean; sobre?: AnimDef['sobre'] } = {}): AnimDef {
  return {
    id, x, y, w, h: hh, sobre: o.sobre ?? 'frente', fps: o.fps ?? 4, so: o.so,
    pintar(t, q, c) {
      const cs = cores(c), sq = new Seq(s);
      for (let i = 0; i < n; i++) {
        const fase = sq.int(0, 3), bx = x + sq.int(2, w - 3), by = y + sq.int(2, hh - 3), k = (q + fase) % 4;
        if (k === 3) continue;
        const px = bx + (o.cruz ? 0 : k === 1 ? 1 : 0), py = by - (o.cruz ? 0 : k === 2 ? 1 : 0);
        t.p(px, py, k === 1 ? cs[cs.length - 1] : cs[0]);
        if (k === 1 && (o.cruz || i % 2 === 0)) { t.p(px - 1, py, cs[0]); t.p(px + 1, py, cs[0]); t.p(px, py - 1, cs[0]); t.p(px, py + 1, cs[0]); }
      }
    },
  };
}
/** Chama/labareda animada num ponto (base em x,y). */
export function chama(t: Tela, q: number, x: number, y: number, alt: number, r: Rampa, s = 0) {
  for (let j = 0; j < alt; j++) {
    const k = j / alt, lar = Math.round((1 - k) ** 0.8 * alt * 0.42 + 0.5), des = Math.round(Math.sin((j + q * 2 + s) * 1.3) * k * 2);
    for (let i = -lar; i <= lar; i++) {
      const u = Math.abs(i) / (lar + 0.5);
      if (h(i, j + q * 3, s) < k * 0.35) continue;
      t.p(x + i + des, y - j, u < 0.35 && k < 0.6 ? r[3] : u < 0.7 ? r[2] : r[1]);
    }
  }
}
/** Coluna de fumaça/vapor em 4 quadros. */
export function fumaca(t: Tela, q: number, x: number, y: number, alt: number, r: Rampa, s = 0) {
  for (let i = 0; i < 5; i++) {
    const k = ((i + q / 4) / 5), py = y - k * alt, rad = 2 + k * 5, px = x + Math.sin(k * 5 + s) * 4 + k * 5;
    if (k > 0.85 && (i + q) % 2) continue;
    t.elipse(px, py, rad, rad * 0.8, (_x, _y, nx, ny) => (nx + ny < -0.5 ? r[2] : nx + ny > 0.7 ? r[0] : r[1]));
  }
}
/** Bolhas subindo. */
export function bolhas(t: Tela, q: number, x: number, y: number, w: number, hh: number, n: number, r: Rampa, s: number) {
  const sq = new Seq(s);
  for (let i = 0; i < n; i++) {
    const bx = x + sq.int(2, w - 4), by = y + sq.int(8, hh - 3), fase = sq.int(0, 3), g = sq.n() > 0.6, k = (q + fase) % 4;
    const py = by - k * 2, px = bx + (k % 2);
    if (k === 3) { t.p(px - 1, py, r[2]); t.p(px + 1, py, r[2]); t.p(px, py - 1, r[2]); continue; }
    if (g) { t.p(px, py - 1, r[3]); t.p(px - 1, py, r[2]); t.p(px + 1, py, r[1]); t.p(px, py + 1, r[1]); } else t.p(px, py, r[3]);
  }
}
export const yhOnda = (base: number, amp: number, esc: number, s: number) => (x: number) => base + (fbm(x, 0, esc, s) - 0.5) * 2 * amp;

import { ceu, nuvem, estrelas, astro } from './pecas';
/** Céu de bioma: 4 faixas (P.ceu, do alto ao horizonte), nuvens de dia, estrelas e lua à noite. */
export function ceuBioma(t: Tela, c: Ctx, o: { ate: number; nuvens?: [number, number, number][]; astro?: [number, number, number]; s?: number }) {
  const { P, noite } = c, a = o.ate;
  ceu(t, [[Math.round(a * 0.3), P.ceu[0]], [Math.round(a * 0.58), P.ceu[1]], [Math.round(a * 0.82), P.ceu[2]], [a, P.ceu[3]]]);
  if (noite) estrelas(t, Math.round(a * 0.8), 46, P.astro, (o.s ?? 1) + 77);
  if (o.astro) astro(t, o.astro[0], o.astro[1], o.astro[2], P.astro, noite);
  for (const [x, y, w] of o.nuvens ?? []) nuvem(t, x, y, w, P.nuvem, x + y);
}
