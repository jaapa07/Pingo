/**
 * FX dos 17 tipos (≥ 3 por tipo). Cada um é desenhado quadro a quadro em resolução nativa com o pincel
 * de pixel art (formas inteiras, 3 a 4 tons e contorno escuro). Projéteis apontam para a DIREITA; a view espelha.
 */
import { Quadro, semente, girar, TAU, type FxDef, type Pt, type Rampa } from './pincel';
import { R } from './rampas';

export const fx = (id: string, w: number, h: number, n: number, fps: number, desenhar: FxDef['desenhar']): FxDef => ({ id, w, h, n, fps, desenhar });

/** estouro genérico: estrela que cresce e depois vira lascas que se afastam */
export function estouro(q: Quadro, cx: number, cy: number, i: number, n: number, Rm: number, p: Rampa, pontas = 6, giro = 0.3) {
  const t = i / (n - 1);
  if (t < 0.55) {
    const r = Rm * (0.45 + t * 1.0);
    q.estrela(cx, cy, r, r * 0.42, pontas, giro + i * 0.25, p[2]); q.estrela(cx, cy, r * 0.72, r * 0.3, pontas, giro + i * 0.25, p[3]); q.disco(cx, cy, r * 0.28, p[4]);
  } else {
    const k = (t - 0.55) / 0.45;
    for (let j = 0; j < pontas; j++) { const a = giro + (j * TAU) / pontas + 0.4, r1 = Rm * (0.55 + k * 0.3), r2 = Rm * (0.95 - k * 0.05); q.linha(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, k > 0.6 ? p[2] : p[3], k > 0.6 ? 1 : 2); }
    if (k < 0.5) q.anel(cx, cy, Rm * 0.5, Rm * 0.5, 1, p[4]);
  }
  q.contorno(p[0]);
}
/** folha: elipse inclinada com nervura clara e talo */
function folha(q: Quadro, cx: number, cy: number, len: number, ang: number, p: Rampa) {
  q.elipseRot(cx, cy, len, len * 0.45, ang, p[2]);
  q.elipseRot(cx - Math.sin(ang) * 1, cy + Math.cos(ang) * 1, len * 0.8, len * 0.2, ang, p[1]);
  q.linha(cx - Math.cos(ang) * len, cy - Math.sin(ang) * len, cx + Math.cos(ang) * (len - 1), cy + Math.sin(ang) * (len - 1), p[3]);
  q.set(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len, p[4]);
}
/** gota com a ponta para trás (voa para a direita) */
function gota(q: Quadro, cx: number, cy: number, r: number, p: Rampa, ang = Math.PI) {
  q.poli(girar([[0, -r], [r * 2.2, 0], [0, r]], ang, cx, cy), p[2]);
  q.bola(cx, cy, r, p);
}
/** lasca/cristal alongado apontando para `ang` */
function lasca(q: Quadro, cx: number, cy: number, len: number, larg: number, ang: number, p: Rampa) {
  q.poli(girar([[-len, 0], [-len * 0.3, -larg], [len, 0], [-len * 0.3, larg]], ang, cx, cy), p[2]);
  q.poli(girar([[-len, 0], [-len * 0.3, -larg], [len, 0]], ang, cx, cy), p[3]);
  q.linha(cx - Math.cos(ang) * len * 0.6, cy - Math.sin(ang) * len * 0.6, cx + Math.cos(ang) * len * 0.7, cy + Math.sin(ang) * len * 0.7, p[4]);
}
/** crescente (lâmina de ar, chute, corte) */
function crescente(q: Quadro, cx: number, cy: number, r: number, esp: number, a0: number, a1: number, p: Rampa) {
  for (let k = 0; k <= 40; k++) {
    const t = k / 40, a = (a0 + (a1 - a0) * t) * TAU, e = Math.sin(t * Math.PI) * esp;
    for (let d = 0; d <= e; d += 0.5) { const rr = r - d; q.set(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, d < e * 0.35 ? p[4] : d < e * 0.7 ? p[3] : p[2]); }
  }
}

export const FX_TIPOS: FxDef[] = [
  /* ------------------------------ comum ------------------------------ */
  fx('comum-impacto', 24, 24, 5, 14, (q, i, ) => estouro(q, 12, 12, i, 5, 10, R.comum, 6)),
  fx('comum-estrela', 16, 16, 4, 10, (q, i) => { const p = R.ouro, a = (i * TAU) / 20 - Math.PI / 2; q.estrela(8, 8, 6, 2.6, 5, a, p[2]); q.estrela(7.6, 7.6, 3.6, 1.6, 5, a, p[3]); q.set(7, 7, p[4]); q.contorno(p[0]); }),
  fx('comum-anel', 32, 32, 5, 14, (q, i) => { const p = R.branco, r = 4 + i * 2.8; q.anel(16, 16, r, r, i < 3 ? 3 : 2, i < 4 ? p[2] : p[1]); if (i < 3) q.anel(16, 16, r - 1, r - 1, 1, p[1]); if (i === 4) for (let k = 0; k < 32; k++) for (let j = 0; j < 32; j++) if ((k + j) % 2) q.apagar(k, j); q.contorno(p[0]); }),
  fx('comum-linhas', 32, 32, 4, 12, (q, i) => { const p = R.branco, rnd = semente(7 + i); for (let k = 0; k < 9; k++) { const a = (k * TAU) / 9 + rnd() * 0.3, r1 = 7 + rnd() * 3 + i, r2 = 13 + rnd() * 2; q.linha(16 + Math.cos(a) * r1, 16 + Math.sin(a) * r1, 16 + Math.cos(a) * r2, 16 + Math.sin(a) * r2, p[2]); } q.contorno(R.comum[1]); }),

  /* ------------------------------ mata ------------------------------ */
  fx('mata-folha', 16, 16, 6, 12, (q, i, f) => { folha(q, 8, 8, 5.5, f * Math.PI, R.mata); q.contorno(R.mata[0]); }),
  fx('mata-semente', 12, 12, 4, 10, (q, i, f) => { const p = R.terra, a = f * TAU; q.elipseRot(6, 6, 3.4, 2.2, a, p[2]); q.elipseRot(6 - 0.5, 6 - 0.5, 2, 1, a, p[3]); q.set(6 + Math.cos(a) * 3.6, 6 + Math.sin(a) * 3.6, R.mata[3]); q.contorno(p[0]); }),
  fx('mata-raiz', 32, 40, 6, 9, (q, i) => {
    const p = R.terra, alt = [6, 14, 24, 32, 34, 34][i];
    for (const [bx, inc, k] of [[10, -0.18, 1], [16, 0.05, 1.15], [23, 0.2, 0.85]] as const) {
      const h = alt * k;
      for (let y = 0; y < h; y++) { const t = y / 34, x = bx + Math.sin(y * 0.32 + bx) * 2.2 + inc * y, e = Math.max(0.6, 2.6 - t * 2.6); q.elipse(x, 39 - y, e, 0.8, p[2]); q.set(x - e * 0.5, 39 - y, p[3]); q.set(x + e, 39 - y, p[1]); }
      if (i >= 2) { const y = h - 1, x = bx + Math.sin(y * 0.32 + bx) * 2.2 + inc * y; folha(q, x + 3, 39 - y, 3, -0.6, R.mata); if (i >= 3) folha(q, x - 3, 42 - y, 2.6, Math.PI + 0.6, R.mata); }
    }
    q.contorno(p[0]);
  }),
  fx('mata-lamina', 32, 20, 4, 14, (q, i) => { const p = R.mata; crescente(q, 10 + i * 2, 10, 13, 4.5 - i * 0.6, -0.17, 0.17, p); folha(q, 6 + i * 2, 10, 3, 0, p); q.contorno(p[0]); }),
  fx('mata-broto', 16, 16, 5, 8, (q, i) => { const p = R.mata, h = [2, 5, 8, 9, 9][i]; q.linha(8, 15, 8, 15 - h, p[2]); if (i >= 1) folha(q, 5, 15 - h + 1, 2.6, Math.PI + 0.5, p); if (i >= 2) folha(q, 11, 15 - h + 1, 2.6, -0.5, p); if (i >= 3) q.set(8, 15 - h - 1, i === 4 ? R.encanto[2] : p[4]); q.contorno(p[0]); }),

  /* ------------------------------ brasa ------------------------------ */
  fx('brasa-chama', 16, 24, 6, 12, (q, i, f) => { q.chama(8, 22, 12, 19 + (i % 2) * 2, f, R.brasa); q.contorno(R.brasa[0]); }),
  fx('brasa-bola', 24, 16, 4, 14, (q, i) => { const p = R.brasa; for (let k = 0; k < 3; k++) q.poli([[15, 8 - 4 + k], [1 + k * 3 + (i % 2) * 2, 8 + ((i + k) % 3) - 1], [15, 8 + 4 - k]], p[1 + k]); q.bola(16, 8, 5.5, [p[0], p[2], p[3], p[4], '#ffffff']); q.contorno(p[0]); }),
  fx('brasa-labareda', 32, 56, 6, 12, (q, i, f) => { const p = R.brasa, h = [20, 36, 50, 52, 46, 30][i]; q.chama(16, 54, 26 - (i === 5 ? 8 : 0), h, f * 2, p); q.chama(8, 54, 9, h * 0.45, f * 2 + 0.3, p); q.chama(25, 54, 9, h * 0.5, f * 2 + 0.6, p); q.contorno(p[0]); }),
  fx('brasa-fagulha', 8, 8, 4, 12, (q, i) => { const p = R.brasa; q.cintilar(4, 4, [1, 2, 3, 1][i], i === 3 ? p[2] : p[3], p[4]); q.contorno(p[1]); }),
  fx('brasa-explosao', 40, 40, 6, 14, (q, i) => {
    const p = R.brasa, rnd = semente(31), r = [6, 11, 15, 17, 17, 16][i];
    if (i < 4) { q.disco(20, 20, r, p[2]); q.disco(20, 20, r * 0.75, p[3]); q.disco(20, 20, r * 0.45, p[4]); if (i > 1) q.disco(20, 20, r * 0.2, '#ffffff'); for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + 0.2; q.disco(20 + Math.cos(a) * r * 0.9, 20 + Math.sin(a) * r * 0.9, 2 + rnd() * 2, p[2 + (k % 2)]); } }
    else for (let k = 0; k < 10; k++) { const a = (k * TAU) / 10 + rnd(), d = r * (0.6 + rnd() * 0.4); q.disco(20 + Math.cos(a) * d, 20 + Math.sin(a) * d - (i - 3) * 2, i === 4 ? 3 : 1.6, k % 2 ? R.pedra[1] : p[1]); if (i === 4) q.disco(20 + Math.cos(a) * d - 1, 19 + Math.sin(a) * d - (i - 3) * 2, 1.2, p[2]); }
    q.contorno(p[0]);
  }),

  /* ------------------------------ rio ------------------------------ */
  fx('rio-gota', 16, 12, 4, 12, (q, i) => { gota(q, 10 - (i % 2), 6, 3.4 + (i % 2) * 0.3, R.rio); q.contorno(R.rio[0]); }),
  fx('rio-jato', 32, 16, 4, 14, (q, i) => {
    const p = R.rio;
    for (let x = 0; x < 32; x++) { const o = Math.sin((x + i * 8) * 0.39) * 1.6, h = 4.2 + Math.sin((x - i * 8) * 0.2) * 0.8; for (let y = -h; y <= h; y++) q.set(x, 8 + o + y, Math.abs(y) > h - 1.2 ? p[1] : y < -h * 0.3 ? p[3] : p[2]); if ((x + i * 8) % 11 < 3) q.set(x, 8 + o - h * 0.5, p[4]); }
    q.contorno(p[0]);
  }),
  fx('rio-onda', 48, 32, 6, 10, (q, i) => {
    const p = R.rio, h = [8, 16, 24, 26, 18, 8][i], av = i * 4;
    for (let x = 0; x < 48; x++) { const t = (x - av) / 34, c = t >= 0 && t <= 1 ? Math.sin(t * Math.PI) ** 1.5 * h : 0; const topo = 31 - Math.max(2, c); for (let y = Math.round(topo); y < 32; y++) q.set(x, y, y - topo < 2 ? p[4] : y - topo < 5 ? p[3] : (x + y) % 7 === 0 ? p[3] : p[2]); }
    if (i >= 2 && i <= 4) { const cx = av + 26, cy = 31 - h + 3; q.disco(cx + 3, cy + 2, 4, p[4]); q.disco(cx + 7, cy + 6, 3, p[4]); q.disco(cx + 9, cy + 11, 2, p[3]); }
    q.contorno(p[0]);
  }),
  fx('rio-bolha', 12, 12, 5, 10, (q, i) => { const p = R.rio; if (i < 4) { const r = 2 + i; q.anel(6, 6, r, r, 1, p[3]); q.set(6 - r * 0.5, 6 - r * 0.5, p[4]); if (r > 3) q.set(6 - r * 0.5 + 1, 6 - r * 0.5 - 1, p[4]); } else for (let k = 0; k < 6; k++) { const a = (k * TAU) / 6; q.set(6 + Math.cos(a) * 5, 6 + Math.sin(a) * 5, p[3]); } q.contorno(p[1]); }),
  fx('rio-respingo', 32, 20, 5, 12, (q, i) => {
    const p = R.rio, h = [4, 10, 14, 12, 6][i];
    for (let k = -3; k <= 3; k++) { const x = 16 + k * (2 + i * 0.9), a = h * (1 - Math.abs(k) * 0.18); if (i < 4) q.linha(16 + k * 2, 19, x, 19 - a, p[2], 2); q.disco(x, 19 - a - (i > 2 ? (i - 2) * -2 : 0), 1.2, p[3]); q.set(x, 18 - a, p[4]); }
    q.elipse(16, 18, 6 + i * 2, 1, p[3]); q.contorno(p[0]);
  }),

  /* ------------------------------ trovão ------------------------------ */
  fx('trovao-raio', 32, 80, 5, 16, (q, i) => {
    const p = R.trovao, rnd = semente(i < 2 ? 11 : i < 4 ? 23 : 11);
    if (i === 4) { q.raio(16, 0, 16, 79, rnd, 9, p[2], 1, 9); return; }
    const e = [2, 4, 3, 2][i];
    q.raio(16, 0, 16, 79, rnd, 9, p[3], e + 1, 9); const r2 = semente(i < 2 ? 11 : 23); q.raio(16, 0, 16, 79, r2, 9, p[4], Math.max(1, e - 1), 9);
    if (i === 1 || i === 2) { const r3 = semente(40 + i); q.raio(16, 30, 4 + i * 20, 52, r3, 4, p[3], 1, 4); q.disco(16, 77, 4, p[4]); }
    q.contorno(p[1]);
  }),
  fx('trovao-faisca', 16, 16, 4, 16, (q, i) => { const p = R.trovao, rnd = semente(60 + i); for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4 + i * 0.7; q.raio(8, 8, 8 + Math.cos(a) * 6.5, 8 + Math.sin(a) * 6.5, rnd, 2, k % 2 ? p[3] : p[4], 1, 3); } q.disco(8, 8, 1.2, '#ffffff'); q.contorno(p[1]); }),
  fx('trovao-esfera', 24, 24, 6, 14, (q, i) => { const p = R.trovao, rnd = semente(80 + i); q.bola(12, 12, 6.5 + (i % 2) * 0.6, p); q.disco(12, 12, 2.5, '#ffffff'); for (let k = 0; k < 3; k++) { const a = rnd() * TAU; q.raio(12 + Math.cos(a) * 5, 12 + Math.sin(a) * 5, 12 + Math.cos(a + 0.5) * 10.5, 12 + Math.sin(a + 0.5) * 10.5, rnd, 2, p[4], 1, 3); } q.contorno(p[0]); }),
  fx('trovao-rede', 40, 24, 4, 16, (q, i) => { const p = R.trovao, rnd = semente(100 + i * 3); for (let k = 0; k < 4; k++) q.raio(2 + rnd() * 6, 3 + k * 6, 38 - rnd() * 6, 3 + ((k + 1 + i) % 4) * 6, rnd, 4, k % 2 ? p[4] : p[3], 1, 6); q.contorno(p[1]); }),

  /* ------------------------------ geada ------------------------------ */
  fx('geada-cristal', 20, 28, 5, 10, (q, i) => {
    const p = R.geada, h = [6, 14, 22, 24, 24][i];
    const dente = (bx: number, alt: number, larg: number, inc: number) => { const topo: Pt = [bx + inc, 27 - alt]; q.poli([[bx - larg, 27], topo, [bx + larg, 27]], p[2]); q.poli([[bx - larg, 27], topo, [bx - larg * 0.2, 27]], p[3]); q.linha(bx - larg * 0.2, 27, topo[0], topo[1], p[4]); q.poli([[bx + larg * 0.4, 27], topo, [bx + larg, 27]], p[1]); };
    dente(5, h * 0.55, 3, -2); dente(15, h * 0.65, 3, 2); dente(10, h, 4.5, 0);
    if (i === 3) q.cintilar(10, 6, 2, '#ffffff'); if (i === 4) q.cintilar(14, 12, 1, '#ffffff');
    q.contorno(p[0]);
  }),
  fx('geada-floco', 12, 12, 4, 8, (q, i) => { const p = R.geada, a0 = (i * TAU) / 24; for (let k = 0; k < 6; k++) { const a = a0 + (k * TAU) / 6; q.linha(6, 6, 6 + Math.cos(a) * 4.6, 6 + Math.sin(a) * 4.6, p[3]); q.set(6 + Math.cos(a + 0.5) * 3, 6 + Math.sin(a + 0.5) * 3, p[2]); } q.set(6, 6, '#ffffff'); q.contorno(p[1]); }),
  fx('geada-estilhaco', 36, 36, 5, 14, (q, i) => { const p = R.geada, rnd = semente(140); for (let k = 0; k < 9; k++) { const a = (k * TAU) / 9 + rnd() * 0.5, d = 3 + i * (2.4 + rnd() * 1.2), len = Math.max(1, 4.5 - i * 0.7 + rnd() * 2); lasca(q, 18 + Math.cos(a) * d, 18 + Math.sin(a) * d, len, len * 0.4, a, p); } if (i < 2) q.cintilar(18, 18, 5 - i * 2, '#ffffff'); q.contorno(p[0]); }),
  fx('geada-lanca', 24, 12, 3, 12, (q, i) => { const p = R.geada; lasca(q, 12, 6, 10, 3, 0, p); if (i) q.cintilar(4 + i * 6, 3 + i, 1, '#ffffff'); q.contorno(p[0]); }),
  fx('geada-sopro', 32, 20, 4, 12, (q, i) => { const p = R.geada, rnd = semente(160 + i); for (let k = 0; k < 14; k++) { const x = (rnd() * 32 + i * 9) % 32, y = 10 + (rnd() - 0.5) * (6 + x * 0.35); if (k % 3 === 0) q.cintilar(x, y, 1, p[3], '#ffffff'); else q.linha(x, y, x + 2 + rnd() * 3, y, k % 2 ? p[3] : p[4]); } q.contorno(p[1]); }),

  /* ------------------------------ ginga ------------------------------ */
  fx('ginga-chute', 36, 36, 5, 16, (q, i) => { const p = R.ginga, a = -0.42 + i * 0.13; crescente(q, 18, 20, 15, [3, 5, 6, 4, 2][i], a, a + 0.3, [p[0], p[1], p[2], p[3], '#ffffff']); q.contorno(p[0]); }),
  fx('ginga-soco', 28, 28, 5, 16, (q, i) => { const p = R.ginga; if (i < 3) { const r = 5 + i * 3.5; q.estrela(14, 14, r, r * 0.55, 8, 0.2, p[2]); q.estrela(14, 14, r * 0.7, r * 0.35, 8, 0.2, p[4]); q.disco(14, 14, r * 0.22, '#ffffff'); } else for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + 0.2; q.linha(14 + Math.cos(a) * (8 + i), 14 + Math.sin(a) * (8 + i), 14 + Math.cos(a) * 13, 14 + Math.sin(a) * 13, p[3], i === 3 ? 2 : 1); } q.contorno(p[0]); }),
  fx('ginga-giro', 44, 20, 6, 16, (q, i, f) => { const p = R.ginga; for (let k = 0; k < 3; k++) { const a0 = f + k / 3; q.anel(22, 10, 20 - k * 4, 8 - k * 1.6, 2, k === 1 ? p[4] : p[3], a0, a0 + 0.22); } q.contorno(p[0]); }),
  fx('ginga-rasteira', 40, 16, 5, 16, (q, i) => { const p = R.ginga, x = 4 + i * 7; for (let k = 0; k < 3; k++) q.linha(Math.max(0, x - 14 + k * 3), 8 + (k - 1) * 4, x, 8 + (k - 1) * 3, [p[2], p[4], p[3]][k], 2); q.disco(x + 2, 8, 3.2 - i * 0.3, p[4]); q.contorno(p[0]); }),

  /* ------------------------------ veneno ------------------------------ */
  fx('veneno-nuvem', 36, 32, 6, 8, (q, i, f) => { const p = R.veneno, rnd = semente(200); q.nuvem(18, 17, 11 + Math.sin(f * TAU) * 1.2, 7, rnd, f * TAU, p); const y = 26 - ((i * 4) % 20); q.anel(9 + (i % 3) * 8, y, 2, 2, 1, p[4]); q.contorno(p[0]); }),
  fx('veneno-gota', 16, 12, 4, 12, (q, i) => { gota(q, 10 - (i % 2), 6, 3.3, R.veneno); q.set(4 - i, 6 + (i % 2 ? 2 : -2), R.veneno[3]); q.contorno(R.veneno[0]); }),
  fx('veneno-bolha', 20, 20, 6, 10, (q, i) => { const p = R.veneno; if (i < 4) { const r = 2.5 + i * 1.8; q.disco(10, 11, r, p[2]); q.disco(10 - r * 0.15, 11 - r * 0.15, r * 0.7, p[3]); q.set(10 - r * 0.5, 11 - r * 0.5, p[4]); q.set(10 - r * 0.5 + 1, 11 - r * 0.5, p[4]); } else for (let k = 0; k < 7; k++) { const a = (k * TAU) / 7, d = 6 + (i - 4) * 3; gota(q, 10 + Math.cos(a) * d, 10 + Math.sin(a) * d, 1.2, p, a + Math.PI); } q.contorno(p[0]); }),
  fx('veneno-poca', 36, 12, 4, 6, (q, i) => { const p = R.veneno; q.elipse(18, 8, 15, 3, p[1]); q.elipse(18, 7, 14, 2.4, p[2]); q.elipse(13, 6.5, 5, 0.8, p[3]); const b = [[8, 0], [24, 1], [16, 2], [28, 3]] as const; for (const [x, o] of b) { const fase = (i + o) % 4; if (fase < 3) q.anel(x, 5 - fase, 1 + fase * 0.5, 1 + fase * 0.5, 1, p[4]); } q.contorno(p[0]); }),
  fx('veneno-espinho', 16, 8, 2, 10, (q, i) => { const p = R.veneno; lasca(q, 8, 4, 7, 2, 0, p); q.set(1 - i, 4, p[3]); q.contorno(p[0]); }),

  /* ------------------------------ terra ------------------------------ */
  fx('terra-fenda', 56, 16, 5, 12, (q, i) => { const p = R.terra, rnd = semente(240), L = [12, 28, 44, 54, 54][i]; let y = 9; for (let x = 28 - L / 2; x < 28 + L / 2; x++) { y += (rnd() - 0.5) * 2.4; y = Math.max(6, Math.min(12, y)); const e = Math.sin(((x - (28 - L / 2)) / L) * Math.PI) * (i === 4 ? 1.5 : 2.6); for (let k = -e; k <= e; k++) q.set(x, y + k, Math.abs(k) < e * 0.5 ? '#1a1423' : p[1]); if (i > 0 && i < 4 && rnd() < 0.25) q.disco(x, y - e - 2 - rnd() * (4 + i), 1, p[2]); } q.contorno(p[0]); }),
  fx('terra-lama', 28, 24, 5, 12, (q, i) => { const p = R.terra, h = [5, 12, 17, 14, 6][i]; for (let k = -2; k <= 2; k++) { const x = 14 + k * (2.5 + i), a = h * (1 - Math.abs(k) * 0.22); q.linha(14 + k * 2.5, 23, x, 23 - a, p[1], 3); q.disco(x, 23 - a, 2.2 - Math.abs(k) * 0.3, p[2]); q.set(x - 1, 22 - a, p[3]); } q.elipse(14, 22, 8 + i, 1.4, p[1]); q.contorno(p[0]); }),
  fx('terra-torrao', 14, 14, 4, 10, (q, i, f) => { const p = R.terra, pts = girar([[-5, -2], [-1, -5], [4, -3], [5, 2], [1, 5], [-4, 3]], f * TAU, 7, 7); q.poli(pts, p[2]); q.poli(girar([[-5, -2], [-1, -5], [4, -3], [0, 0]], f * TAU, 7, 7), p[3]); q.poli(girar([[5, 2], [1, 5], [-4, 3], [0, 1]], f * TAU, 7, 7), p[1]); q.contorno(p[0]); }),
  fx('terra-poeira', 28, 16, 5, 10, (q, i, f) => { const p = R.terra, rnd = semente(260); q.nuvem(14, 10 - i, 5 + i * 1.5, 5, rnd, f * 2, [p[0], p[2], p[3], p[4], p[4]]); if (i === 4) for (let x = 0; x < 28; x++) for (let y = 0; y < 16; y++) if ((x + y) % 2) q.apagar(x, y); q.contorno(p[1]); }),

  /* ------------------------------ vento ------------------------------ */
  fx('vento-rajada', 40, 20, 4, 14, (q, i) => { const p = R.vento; for (let k = 0; k < 3; k++) { const y0 = 4 + k * 6, av = ((i * 10 + k * 13) % 40); for (let x = 0; x < 22; x++) { const xx = (av + x) % 40, yy = y0 + Math.sin(x * 0.3 + k) * 1.8; q.set(xx, yy, x > 16 ? p[4] : x > 6 ? p[3] : p[2]); if (x > 12) q.set(xx, yy + 1, p[3]); } } q.contorno(p[0]); }),
  fx('vento-pena', 16, 16, 6, 10, (q, i, f) => { const p = R.vento, a = Math.sin(f * TAU) * 0.9 - 0.6; q.elipseRot(8, 8, 6, 2.2, a, p[3]); q.elipseRot(8 + Math.sin(a), 8 - Math.cos(a), 5, 1, a, p[4]); q.linha(8 - Math.cos(a) * 7, 8 - Math.sin(a) * 7, 8 + Math.cos(a) * 5, 8 + Math.sin(a) * 5, p[2]); q.contorno(p[0]); }),
  fx('vento-tufao', 36, 52, 6, 14, (q, i, f) => { const p = R.vento; for (let k = 0; k < 9; k++) { const y = 49 - k * 5.4, rx = 4 + k * 1.6, cx = 18 + Math.sin(f * TAU + k * 0.7) * (1 + k * 0.4), a0 = f * 2 + k * 0.13; q.anel(cx, y, rx, 2.6, 2, k % 2 ? p[3] : p[2], a0, a0 + 0.6); q.anel(cx, y, rx, 2.6, 1, p[4], a0 + 0.1, a0 + 0.3); } q.contorno(p[0]); }),
  fx('vento-lamina', 24, 28, 4, 16, (q, i) => { const p = R.vento; crescente(q, 4 + i, 14, 14, 4.5, -0.16, 0.16, [p[0], p[1], p[3], p[4], '#ffffff']); q.contorno(p[0]); }),

  /* ------------------------------ mente ------------------------------ */
  fx('mente-onda', 40, 40, 6, 12, (q, i) => { const p = R.mente; for (let k = 0; k < 3; k++) { const r = ((i + k * 2) % 6) * 3.2 + 2; q.anel(20, 20, r, r, r > 12 ? 1 : 2, r > 14 ? p[1] : k % 2 ? p[3] : p[2]); } q.contorno(p[0]); }),
  fx('mente-olho', 28, 18, 5, 10, (q, i) => { const p = R.mente, ab = [1, 3, 6, 7, 6][i]; q.elipse(14, 9, 12, ab, p[4]); if (ab > 2) { q.disco(14, 9, Math.min(ab - 0.5, 4.5), p[2]); q.disco(14, 9, Math.min(ab - 2, 2), p[0]); q.set(13, 8, '#ffffff'); } q.contorno(p[0]); if (i >= 3) { q.linha(1, 9, 3, 9, p[3]); q.linha(24, 9, 26, 9, p[3]); } }),
  fx('mente-espiral', 28, 28, 6, 12, (q, i, f) => { const p = R.mente; for (let t = 0; t < 1; t += 0.006) { const a = t * TAU * 2.5 + f * TAU, r = t * 12; q.disco(14 + Math.cos(a) * r, 14 + Math.sin(a) * r, t > 0.6 ? 1 : 0.6, t > 0.7 ? p[2] : t > 0.35 ? p[3] : p[4]); } q.contorno(p[0]); }),
  fx('mente-prisma', 16, 16, 4, 8, (q, i) => { const p = R.mente, r = 5 + (i % 2); q.poli([[8, 8 - r], [8 + r * 0.7, 8], [8, 8 + r], [8 - r * 0.7, 8]], p[2]); q.poli([[8, 8 - r], [8, 8], [8 - r * 0.7, 8]], p[4]); q.poli([[8, 8 + r], [8, 8], [8 + r * 0.7, 8]], p[1]); if (i === 2) q.cintilar(11, 4, 2, '#ffffff'); q.contorno(p[0]); }),

  /* ------------------------------ inseto ------------------------------ */
  fx('inseto-enxame', 40, 32, 6, 14, (q, i, f) => { const p = R.inseto; for (let k = 0; k < 8; k++) { const a = f * TAU + k * 0.9, x = 20 + Math.cos(a * (1 + (k % 3))) * (6 + k * 1.4), y = 16 + Math.sin(a * 2 + k) * (4 + (k % 4) * 2.4); q.ret(Math.round(x), Math.round(y), 2, 2, k % 2 ? p[2] : R.trovao[2]); q.set(x + 2, y + 1, p[0]); const asa = (i + k) % 2; q.set(x, y - 1 - asa, '#ffffff'); q.set(x + 1, y - 1 - asa, p[4]); } q.contorno(p[0]); }),
  fx('inseto-ferrao', 20, 8, 2, 12, (q, i) => { const p = R.inseto; q.poli([[2, 2], [19, 4], [2, 6]], p[2]); q.linha(3, 3, 17, 4, p[4]); q.set(1 - i, 4, p[3]); q.set(0, 2 + i * 4, p[3]); q.contorno(p[0]); }),
  fx('inseto-teia', 40, 40, 5, 10, (q, i) => { const p = R.branco, r = [5, 10, 15, 18, 18][i]; for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + 0.2; q.linha(20, 20, 20 + Math.cos(a) * r, 20 + Math.sin(a) * r, p[2]); } for (let rr = 5; rr <= r; rr += 5) for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + 0.2, b = a + TAU / 8, m = a + TAU / 16; const mx = 20 + Math.cos(m) * rr * 0.8, my = 20 + Math.sin(m) * rr * 0.8; q.linha(20 + Math.cos(a) * rr, 20 + Math.sin(a) * rr, mx, my, p[1]); q.linha(mx, my, 20 + Math.cos(b) * rr, 20 + Math.sin(b) * rr, p[1]); } q.contorno(R.ferro[1]); }),
  fx('inseto-po', 28, 28, 4, 10, (q, i) => { const p = R.inseto, rnd = semente(330); for (let k = 0; k < 16; k++) { const x = rnd() * 26 + 1, y = (rnd() * 26 + i * 3 * (0.5 + rnd())) % 26 + 1; if ((k + i) % 4 === 0) q.cintilar(x, y, 1, p[3], p[4]); else q.set(x, y, k % 2 ? p[3] : R.trovao[3]); } q.contorno(p[1]); }),

  /* ------------------------------ pedra ------------------------------ */
  fx('pedra-rocha', 20, 20, 4, 8, (q, i) => { const p = R.pedra, a = (i * TAU) / 4, o: Pt[] = [[-8, -2], [-4, -7], [3, -8], [8, -3], [7, 4], [2, 8], [-5, 6]]; q.poli(girar(o, a, 10, 10), p[2]); q.poli(girar([[-8, -2], [-4, -7], [3, -8], [1, -1], [-4, 1]], a, 10, 10), p[3]); q.poli(girar([[7, 4], [2, 8], [-5, 6], [0, 3]], a, 10, 10), p[1]); q.set(10 + Math.cos(a - 2.3) * 5, 10 + Math.sin(a - 2.3) * 5, p[4]); q.contorno(p[0]); }),
  fx('pedra-lasca', 12, 12, 4, 12, (q, i, f) => { lasca(q, 6, 6, 4.6, 2, f * TAU, R.pedra); q.contorno(R.pedra[0]); }),
  fx('pedra-bloco', 32, 32, 2, 4, (q, i) => { const p = R.pedra, o: Pt[] = [[4, 12], [10, 3], [21, 2], [29, 10], [28, 23], [20, 30], [8, 29], [3, 21]]; q.poli(o, p[2]); q.poli([[4, 12], [10, 3], [21, 2], [18, 12], [9, 16]], p[3]); q.poli([[28, 23], [20, 30], [8, 29], [14, 22], [24, 18]], p[1]); q.linha(18, 12, 24, 18, p[1]); q.linha(9, 16, 14, 22, p[1]); q.set(11 + i, 6, p[4]); q.set(12 + i, 6, p[4]); q.set(11 + i, 7, p[4]); q.contorno(p[0]); }),
  fx('pedra-quebra', 40, 32, 5, 12, (q, i) => { const p = R.pedra, rnd = semente(370); for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI + (rnd() - 0.5) * 0.3, d = 4 + i * (2.5 + rnd() * 2), tam = Math.max(1, 4 - i * 0.6 + rnd() * 1.5); const x = 20 + Math.cos(a) * d * 1.3, y = 26 + Math.sin(a) * d + i * i * 0.5; q.poli(girar([[-tam, -tam * 0.6], [tam * 0.5, -tam], [tam, tam * 0.5], [-tam * 0.4, tam]], k + i, x, y), p[2]); q.set(x - 1, y - 1, p[3]); } if (i < 2) q.elipse(20, 28, 10 + i * 4, 2, p[4]); q.contorno(p[0]); }),

  /* ------------------------------ assombro ------------------------------ */
  fx('assombro-veu', 40, 44, 6, 8, (q, i, f) => { const p = R.assombro; for (let x = 4; x < 36; x++) { const topo = 4 + Math.sin(x * 0.4 + f * TAU) * 2 + Math.abs(x - 20) * 0.35, fim = 38 + Math.sin(x * 0.9 + f * TAU * 2) * 4; for (let y = Math.round(topo); y < fim; y++) { const c = (x + Math.round(Math.sin(y * 0.25 + f * TAU) * 2)) % 6; if (y > fim - 6 && (x + y) % 2) continue; q.set(x, y, c < 2 ? p[1] : c < 5 ? p[2] : p[3]); } } q.disco(15, 16, 2, p[0]); q.disco(25, 16, 2, p[0]); q.set(15, 15, p[4]); q.set(25, 15, p[4]); q.contorno(p[0]); }),
  fx('assombro-chama', 16, 24, 6, 10, (q, i, f) => { const p = R.assombro; q.chama(8, 22, 11, 18 + (i % 2) * 2, f, [p[0], p[1], p[2], p[3], p[4]]); q.set(6, 16, p[0]); q.set(10, 16, p[0]); q.contorno(p[0]); }),
  fx('assombro-garra', 36, 36, 5, 16, (q, i) => { const p = R.assombro, L = [0.3, 0.65, 1, 1, 1][i]; for (let k = 0; k < 3; k++) { const x0 = 8 + k * 9, n = Math.round(28 * L); for (let t = 0; t < n; t++) { const x = x0 + t * 0.45 - Math.sin(t * 0.11) * 4, y = 4 + t, e = Math.sin((t / 28) * Math.PI) * (i === 4 ? 1 : 2.4); for (let d = -e; d <= e; d++) q.set(x + d, y, i === 4 ? p[2] : Math.abs(d) < 1 ? p[4] : p[2]); } } q.contorno(p[0]); }),
  fx('assombro-bola', 24, 24, 4, 12, (q, i, f) => { const p = R.assombro; q.bola(12, 12, 7, [p[0], p[0], p[1], p[2], p[3]]); for (let k = 0; k < 3; k++) { const a = f * TAU + (k * TAU) / 3; q.anel(12, 12, 9.5, 9.5, 2, k === 0 ? p[4] : p[3], a / TAU, a / TAU + 0.14); } q.disco(12, 12, 2, p[4]); q.contorno(p[0]); }),

  /* ------------------------------ lenda ------------------------------ */
  fx('lenda-escama', 16, 16, 6, 10, (q, i) => { const p = R.lenda, w = [6, 5, 2.5, 1, 2.5, 5][i]; q.poli([[8, 1], [8 + w, 7], [8, 15], [8 - w, 7]], p[2]); q.poli([[8, 1], [8, 7], [8 - w, 7]], p[3]); q.poli([[8, 15], [8, 8], [8 + w, 7]], p[1]); if (i === 0 || i === 5) q.cintilar(6, 5, 2, '#ffffff'); q.contorno(p[0]); }),
  fx('lenda-feixe', 32, 20, 4, 16, (q, i) => { const p = R.lenda, h = [6, 8, 7, 5][i]; q.ret(0, 10 - h, 32, h * 2, p[2]); q.ret(0, 10 - h + 2, 32, h * 2 - 4, p[3]); q.ret(0, 10 - h + 4, 32, Math.max(1, h * 2 - 8), '#ffffff'); for (let x = (i * 8) % 16; x < 32; x += 16) { q.set(x, 10 - h - 1, p[3]); q.set(x + 8, 10 + h, p[3]); } q.contorno(p[0]); for (let y = 0; y < 20; y++) { if (q.cheio(0, y) && !q.cheio(1, y)) q.apagar(0, y); if (q.cheio(31, y) && !q.cheio(30, y)) q.apagar(31, y); } }),
  fx('lenda-aura', 48, 56, 6, 12, (q, i) => { const p = R.lenda, rnd = semente(420); for (let k = 0; k < 3; k++) { const y = 52 - ((i * 7 + k * 16) % 48), rx = 20 - Math.abs(y - 30) * 0.25; q.anel(24, y, rx, 4, 2, k === 1 ? p[4] : p[3], 0, 0.5); } for (let k = 0; k < 7; k++) { const x = 6 + rnd() * 36, y = 50 - ((rnd() * 48 + i * 8) % 48); q.cintilar(x, y, (k + i) % 3 === 0 ? 2 : 1, p[3], '#ffffff'); } q.contorno(p[0]); }),
  fx('lenda-cometa', 32, 20, 4, 14, (q, i) => { const p = R.lenda; for (let k = 0; k < 3; k++) q.poli([[22, 10 - 5 + k * 1.5], [2 + k * 5 + (i % 2) * 2, 10 + ((i + k) % 3) - 1], [22, 10 + 5 - k * 1.5]], p[1 + k]); q.estrela(23, 10, 7, 3, 4, i * 0.4, p[4]); q.disco(23, 10, 2, '#ffffff'); q.contorno(p[0]); }),
  fx('lenda-runa', 40, 16, 5, 10, (q, i) => { const p = R.lenda, rx = [6, 12, 18, 19, 19][i]; q.anel(20, 8, rx, rx * 0.36, 2, p[3]); q.anel(20, 8, rx * 0.6, rx * 0.2, 1, p[4]); if (i >= 3) for (let k = 0; k < 6; k++) { const a = (k * TAU) / 6 + i; q.set(20 + Math.cos(a) * rx * 0.8, 8 + Math.sin(a) * rx * 0.28, '#ffffff'); } q.contorno(p[0]); }),

  /* ------------------------------ ferro ------------------------------ */
  fx('ferro-lamina', 36, 36, 5, 18, (q, i) => { const p = R.ferro, L = [0.35, 0.8, 1, 1, 1][i], e = [2, 3.4, 3, 1.6, 0.6][i]; const n = Math.round(30 * L); for (let t = 0; t < n; t++) { const k = Math.sin((t / 30) * Math.PI) * e; for (let d = -k; d <= k; d++) q.set(32 - t + d * 0.7, 3 + t + d * 0.7, Math.abs(d) < k * 0.4 ? '#ffffff' : d < 0 ? p[3] : p[2]); } if (i === 2) q.cintilar(17, 18, 4, '#ffffff'); q.contorno(p[0]); }),
  fx('ferro-engrenagem', 24, 24, 4, 12, (q, i) => { const p = R.ferro, a0 = (i * TAU) / 32; for (let k = 0; k < 8; k++) { const a = a0 + (k * TAU) / 8; q.poli(girar([[6, -2], [11, -1.5], [11, 1.5], [6, 2]], a, 12, 12), p[2]); } q.disco(12, 12, 7.5, p[2]); q.anel(12, 12, 7.5, 7.5, 2, p[3], 0.5, 0.85); q.anel(12, 12, 7.5, 7.5, 2, p[1], 0, 0.35); q.disco(12, 12, 3, p[0]); q.disco(12, 12, 1.4, p[1]); q.contorno(p[0]); }),
  fx('ferro-fagulha', 20, 20, 5, 16, (q, i) => { const p = R.ferro, rnd = semente(470); for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + rnd(), d = 2 + i * 2, len = Math.max(0.5, 3.5 - i * 0.7); q.linha(10 + Math.cos(a) * d, 10 + Math.sin(a) * d + i * i * 0.2, 10 + Math.cos(a) * (d + len), 10 + Math.sin(a) * (d + len) + i * i * 0.2, k % 2 ? R.ouro[3] : '#ffffff'); } if (i === 0) q.cintilar(10, 10, 4, '#ffffff'); q.contorno(R.ouro[1]); }),
  fx('ferro-bigorna', 32, 24, 2, 4, (q, i) => { const p = R.ferro; q.poli([[2, 3], [29, 3], [26, 9], [20, 11], [20, 16], [25, 19], [25, 22], [7, 22], [7, 19], [12, 16], [12, 11], [6, 9]], p[2]); q.ret(3, 3, 26, 2, p[3]); q.ret(13, 11, 2, 6, p[3]); q.ret(18, 11, 2, 6, p[1]); q.ret(8, 20, 17, 2, p[1]); q.ret(4 + i * 12, 3, 5, 1, '#ffffff'); q.contorno(p[0]); }),
  fx('ferro-escudo', 28, 32, 4, 10, (q, i) => { const p = R.ferro; q.poli([[4, 3], [24, 3], [24, 16], [14, 29], [4, 16]], p[2]); q.poli([[4, 3], [14, 3], [14, 29], [4, 16]], p[3]); q.poli([[7, 6], [21, 6], [21, 15], [14, 24], [7, 15]], p[1]); q.poli([[7, 6], [14, 6], [14, 24], [7, 15]], p[2]); const x = 2 + i * 7; q.linha(x, 16, x + 6, 4, '#ffffff'); q.contorno(p[0]); for (let y = 0; y < 32; y++) for (let k = 0; k < 28; k++) if (!q.cheio(k, y)) continue; }),

  /* ------------------------------ encanto ------------------------------ */
  fx('encanto-estrela', 16, 16, 6, 12, (q, i) => { const p = R.encanto, r = [1, 3, 6, 7, 4, 2][i]; q.cintilar(8, 8, r, i > 3 ? p[3] : p[4], '#ffffff'); if (r >= 6) { q.set(5, 5, p[3]); q.set(11, 5, p[3]); q.set(5, 11, p[3]); q.set(11, 11, p[3]); } q.contorno(p[1]); }),
  fx('encanto-petala', 12, 12, 6, 10, (q, i, f) => { const p = R.encanto, a = f * TAU; q.elipseRot(6, 6, 4, 2 + Math.abs(Math.cos(a)) * 0.6, a, p[2]); q.elipseRot(6 - Math.cos(a), 6 - Math.sin(a), 2, 1, a, p[3]); q.set(6 + Math.cos(a) * 4, 6 + Math.sin(a) * 4, p[4]); q.contorno(p[0]); }),
  fx('encanto-coracao', 16, 16, 4, 6, (q, i) => { const p = R.encanto, s = i % 2 ? 1 : 0; q.disco(5 - s * 0.3, 6, 3.2 + s * 0.6, p[2]); q.disco(11 + s * 0.3, 6, 3.2 + s * 0.6, p[2]); q.poli([[1.4 - s, 7.5], [14.6 + s, 7.5], [8, 14 + s]], p[2]); q.disco(4.6, 5.2, 1.4, p[3]); q.set(4, 4, '#ffffff'); q.linha(10, 11, 12, 8, p[1]); q.contorno(p[0]); }),
  fx('encanto-lua', 28, 28, 4, 6, (q, i) => { const p = R.encanto, o = R.ouro; q.disco(14, 14, 10, o[3]); q.disco(13, 13, 7, o[4]); for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) { const dx = x - 19, dy = y - 11; if (dx * dx + dy * dy <= 81) q.apagar(x, y); } q.contorno(o[0]); q.cintilar(20, 9 + (i % 2), i % 2 ? 2 : 1, p[4], '#ffffff'); q.cintilar(22, 19, i > 1 ? 1 : 0, p[3]); }),
  fx('encanto-arco', 40, 24, 5, 12, (q, i) => { const p = R.encanto, cs = [p[2], R.ouro[3], R.cura[2], R.rio[3]], a1 = [0.62, 0.75, 0.88, 1, 1][i]; cs.forEach((c, k) => q.anel(20, 23, 18 - k * 2, 18 - k * 2, 2, c, 0.5, a1)); if (i === 4) q.cintilar(34, 8, 2, '#ffffff'); q.contorno(p[0]); }),
];
