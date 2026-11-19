/**
 * FX gerais da batalha: golpes físicos, status, clima (ladrilhos repetíveis), captura (as 8 cuias),
 * evolução e as ilustrações do menu (cartão LUTAR e ícones dos botões).
 */
import { Quadro, semente, girar, TAU, type FxDef, type Rampa, type Cor } from './pincel';
import { R } from './rampas';
import { fx, estouro } from './fx-tipos';

const BR = '#ffffff';

/** três (ou uma) garras curvas que aparecem de cima para baixo */
function garras(q: Quadro, n: number, prog: number, esp: number, claro: Cor, escuro: Cor, W = 32) {
  for (let k = 0; k < n; k++) {
    const x0 = W * 0.72 - (n - 1) * 4 + k * 8, total = W - 8, m = Math.round(total * prog);
    for (let t = 0; t < m; t++) { const x = x0 - t * 0.55 + Math.sin(t * 0.12) * 3, y = 4 + t, e = Math.sin((t / total) * Math.PI) * esp; for (let d = -e; d <= e; d++) q.set(x + d, y, d > e * 0.3 ? escuro : claro); }
  }
}
/* ------------------------------ cuias ------------------------------ */
// k contorno · T tampa clara · t tampa · s tampa sombra · a/b trançado · G cabaça luz · g cabaça · d cabaça sombra · p pino da tampa
const CUIA = [
  '................',
  '.......kk.......',
  '......kppk......',
  '....kkkttkkk....',
  '...kTTtttttsk...',
  '..kTTttttttssk..',
  '..kkkkkkkkkkkk..',
  '.kababababababk.',
  '.kbabababababak.',
  '.kkkkkkkkkkkkkk.',
  '.kGGgggggggdddk.',
  '.kGggggggggdddk.',
  '.kgggggggggddk..',
  '..kgggggggdddk..',
  '...kkgggdddkk...',
  '.....kkkkkk.....',
];
type CoresCuia = Record<string, Cor>;
const cuiaCores = (cab: [Cor, Cor, Cor], tampa: [Cor, Cor, Cor], tr: [Cor, Cor], pino: Cor, k = '#2c1a14'): CoresCuia => ({ k, G: cab[2], g: cab[1], d: cab[0], T: tampa[2], t: tampa[1], s: tampa[0], a: tr[0], b: tr[1], p: pino });
const CUIAS: Record<string, CoresCuia> = {
  cuia: cuiaCores(['#7a4a2a', '#b0784a', '#e0b080'], ['#9c6434', '#c98f4e', '#e8c07a'], ['#f6e6b8', '#c98f4e'], '#e0483c'),
  'cuia-trancada': cuiaCores(['#6b4226', '#9c6434', '#c98f4e'], ['#2f6b3a', '#4fa346', '#8fd45a'], ['#d9f07a', '#4fa346'], '#f9c22b'),
  'cuia-ouro': cuiaCores(['#c98f4e', '#f9c22b', '#fff07a'], ['#9a6410', '#e0a81c', '#fff07a'], ['#fff8e7', '#f9c22b'], '#e0483c', '#5a3a08'),
  'cuia-rede': cuiaCores(['#1f4f7a', '#2f86c4', '#6fc7e8'], ['#7a4a2a', '#b0784a', '#e0b080'], ['#c8f0f4', '#1f4f7a'], '#fff8e7', '#12304e'),
  'cuia-noturna': cuiaCores(['#2e2452', '#5a4a8c', '#9a8ad0'], ['#1a1423', '#3b2a35', '#5a4a8c'], ['#fff07a', '#2e2452'], '#fff07a', '#171030'),
  'cuia-rapida': cuiaCores(['#a32638', '#e0483c', '#f58a4b'], ['#c4c6d4', '#fff8e7', '#ffffff'], ['#fff07a', '#e0483c'], '#2f86c4', '#4a1020'),
  'cuia-mel': cuiaCores(['#c8662a', '#f9c22b', '#fff07a'], ['#7a3a18', '#c8662a', '#f0a060'], ['#fff8e7', '#f58a4b'], '#6b4226', '#4a2010'),
  'cuia-guardia': cuiaCores(['#1f7a6c', '#3fbfa0', '#8fe8b0'], ['#c98f4e', '#f9c22b', '#fff07a'], ['#fff8e7', '#3a5ad0'], '#e58ad0', '#0e3a34'),
};
/** quadros: 0 fechada · 1 inclina à esquerda · 2 inclina à direita · 3 aberta · 4–7 girando no ar */
function quadroCuia(q: Quadro, i: number, cores: CoresCuia) {
  const des = (dx: (y: number) => number, tampaDy = 0) => CUIA.forEach((l, y) => { for (let x = 0; x < 16; x++) { const c = cores[l[x]]; if (c) q.set(x + dx(y), y + (y < 7 ? tampaDy : 0), c); } });
  if (i === 0) des(() => 0);
  else if (i === 1) des((y) => (y < 5 ? -1 : y > 12 ? 1 : 0));
  else if (i === 2) des((y) => (y < 5 ? 1 : y > 12 ? -1 : 0));
  else if (i === 3) { CUIA.forEach((l, y) => { for (let x = 0; x < 16; x++) { const c = cores[l[x]]; if (!c) continue; if (y < 7) q.set(x + 2 + Math.round((6 - y) * 0.5), y - 2, c); else q.set(x, y + 1, c); } }); q.ret(3, 7, 10, 1, '#1a1423'); }
  else { const g = i - 4; CUIA.forEach((l, y) => { for (let x = 0; x < 16; x++) { const c = cores[l[x]]; if (!c) continue; const [X, Y] = g === 0 ? [15 - y, x] : g === 1 ? [15 - x, 15 - y] : g === 2 ? [y, 15 - x] : [x, y]; q.set(X, Y, c); } }); }
}

export const FX_GERAIS: FxDef[] = [
  /* ------------------------------ físicos ------------------------------ */
  fx('fis-impacto', 32, 32, 5, 16, (q, i) => estouro(q, 16, 16, i, 5, 14, [R.sangue[0], R.ouro[1], R.ouro[2], R.ouro[3], BR], 7)),
  fx('fis-garras', 32, 32, 5, 16, (q, i) => { garras(q, 3, [0.35, 0.75, 1, 1, 1][i], [1.4, 2.4, 2.4, 1.4, 0.5][i], BR, i > 2 ? R.sangue[1] : R.sangue[2]); q.contorno(R.sangue[0]); }),
  fx('fis-corte', 36, 36, 4, 16, (q, i) => { garras(q, 1, [0.5, 1, 1, 1][i], [2, 3.6, 2.4, 1][i], BR, R.vento[3], 36); if (i === 1) q.cintilar(18, 18, 3, BR); q.contorno(R.vento[0]); }),
  fx('fis-mordida', 36, 36, 5, 14, (q, i) => {
    const ab = [12, 7, 1, 1, 5][i], p = R.branco;
    for (let k = 0; k < 4; k++) { const x = 6 + k * 8; q.poli([[x - 3, 18 - ab - 9], [x + 3, 18 - ab - 9], [x, 18 - ab]], p[2]); q.linha(x - 2, 18 - ab - 8, x, 18 - ab - 1, p[3]); q.poli([[x + 1, 18 + ab + 9], [x + 7, 18 + ab + 9], [x + 4, 18 + ab]], p[2]); q.linha(x + 6, 18 + ab + 8, x + 4, 18 + ab + 1, p[1]); }
    q.ret(2, 18 - ab - 11, 30, 2, R.sangue[1]); q.ret(4, 18 + ab + 9, 30, 2, R.sangue[1]);
    if (i === 2) { q.cintilar(8, 18, 3, R.ouro[3], BR); q.cintilar(26, 18, 3, R.ouro[3], BR); }
    q.contorno(p[0]);
  }),
  fx('fis-poeira', 20, 14, 5, 12, (q, i, f) => { const p = R.comum, rnd = semente(510); q.nuvem(10, 9 - i * 0.6, 3.5 + i * 1.2, 4, rnd, f * 2, [p[0], p[2], p[3], p[4], p[4]]); if (i === 4) for (let x = 0; x < 20; x++) for (let y = 0; y < 14; y++) if ((x + y) % 2) q.apagar(x, y); q.contorno(p[1]); }),
  fx('fis-rastro', 40, 20, 3, 16, (q, i) => { const rnd = semente(520 + i); for (let k = 0; k < 6; k++) { const y = 2 + k * 3 + (rnd() > 0.5 ? 1 : 0), x = rnd() * 14, L = 12 + rnd() * 14; q.linha(x, y, x + L, y, k % 2 ? BR : R.branco[1]); } q.contorno(R.comum[1]); }),
  fx('fis-chicote', 44, 28, 5, 16, (q, i) => { const p = R.ginga, a1 = [0.58, 0.7, 0.85, 1, 1][i]; for (let t = 0.5; t <= a1; t += 0.004) { const a = t * TAU, k = (t - 0.5) / 0.5, e = i === 4 ? 0.5 : 2.4 * (1 - k * 0.6); q.disco(22 + Math.cos(a) * 19, 26 + Math.sin(a) * 22, e, k > 0.7 ? BR : p[3]); } if (i === 3) q.cintilar(40, 24, 3, BR); q.contorno(p[0]); }),
  fx('fis-pisao', 56, 20, 5, 14, (q, i) => { const p = R.terra, rx = 8 + i * 5; q.anel(28, 13, rx, 3 + i * 0.6, i < 3 ? 2 : 1, i < 3 ? BR : p[3]); const rnd = semente(540); if (i < 4) for (let k = 0; k < 7; k++) { const x = 28 + (rnd() - 0.5) * rx * 2; q.disco(x, 12 - rnd() * (3 + i * 2), 1.4, p[2 + (k % 2)]); } q.contorno(p[0]); }),
  fx('fis-cabecada', 28, 28, 4, 16, (q, i) => { const p = R.ouro; if (i < 3) { q.estrela(14, 14, 6 + i * 3, 2.5 + i, 4, 0.78, p[3]); q.estrela(14, 14, 4 + i * 2, 1.5 + i * 0.6, 4, 0, BR); } else for (let k = 0; k < 4; k++) { const a = 0.78 + (k * TAU) / 4; q.cintilar(14 + Math.cos(a) * 10, 14 + Math.sin(a) * 10, 1, p[3], BR); } q.contorno(p[0]); }),

  /* ------------------------------ status e efeitos de apoio ------------------------------ */
  fx('st-seta-cima', 12, 16, 4, 10, (q, i) => { const p = R.brasa; q.poli([[6, 1], [11, 7], [8, 7], [8, 14], [4, 14], [4, 7], [1, 7]], p[3]); q.linha(4, 7, 4, 14, R.ouro[3]); q.linha(6, 2, 2, 7, R.ouro[3]); const y = 13 - i * 3; q.ret(4, y, 5, 1, BR); q.contorno(p[0]); }),
  fx('st-seta-baixo', 12, 16, 4, 10, (q, i) => { const p = R.rio; q.poli([[6, 14], [11, 8], [8, 8], [8, 1], [4, 1], [4, 8], [1, 8]], p[2]); q.linha(4, 1, 4, 8, p[3]); const y = 2 + i * 3; q.ret(4, y, 5, 1, p[4]); q.contorno(p[0]); }),
  fx('st-brilho', 12, 12, 5, 12, (q, i) => { q.cintilar(6, 6, [1, 3, 5, 3, 1][i], i > 2 ? R.ouro[3] : BR, BR); q.contorno(R.ouro[1]); }),
  fx('st-cruz', 12, 12, 4, 8, (q, i) => { const p = R.cura; q.ret(4, 1, 4, 10, p[2]); q.ret(1, 4, 10, 4, p[2]); q.ret(4, 1, 1, 10, p[3]); q.ret(1, 4, 10, 1, p[3]); q.set(5 + (i % 2), 2 + i * 2, BR); q.contorno(p[0]); }),
  fx('st-escudo', 36, 44, 5, 12, (q, i) => {
    const p = R.lenda, k = [0.3, 0.7, 1, 1, 1][i], cx = 18, cy = 22, pts: [number, number][] = [[0, -20 * k], [15 * k, -11 * k], [15 * k, 9 * k], [0, 20 * k], [-15 * k, 9 * k], [-15 * k, -11 * k]];
    const abs = pts.map(([x, y]) => [cx + x, cy + y] as [number, number]);
    q.poli(abs, p[3]); for (let y = 0; y < 44; y++) for (let x = 0; x < 36; x++) if (q.cheio(x, y) && (x + y) % 2) q.apagar(x, y);
    for (let j = 0; j < 6; j++) q.linha(abs[j][0], abs[j][1], abs[(j + 1) % 6][0], abs[(j + 1) % 6][1], j < 2 || j === 5 ? p[4] : p[2], 2);
    if (i >= 2) { const x = 6 + (i - 2) * 9; q.linha(x, 30, x + 8, 12, BR, 2); }
    q.contorno(p[0]);
  }),
  fx('st-nota', 12, 16, 4, 6, (q, i) => { const p = i % 2 ? R.encanto : R.rio, dy = i % 2; q.elipseRot(4, 12 + dy, 3, 2.2, -0.4, p[2]); q.ret(6, 3 + dy, 1, 9, p[2]); q.poli([[6, 2 + dy], [11, 4 + dy], [11, 7 + dy], [7, 5 + dy]], p[2]); q.set(3, 11 + dy, p[4]); q.contorno(p[0]); }),
  fx('st-onda-som', 20, 36, 4, 12, (q, i) => { const p = R.branco; for (let k = 0; k < 3; k++) { const r = 5 + ((i + k * 2) % 6) * 2.4; q.anel(-2, 18, r, r * 1.3, 2, k % 2 ? p[1] : p[2], -0.14, 0.14); } q.contorno(R.vento[0]); }),
  fx('st-olhar', 40, 16, 5, 12, (q, i) => { const ab = [1, 4, 5, 5, 2][i]; for (const s of [-1, 1]) { const cx = 20 + s * 9; q.poli([[cx - 7 * s, 8 - ab], [cx + 7 * s, 8 - ab * 0.2], [cx + 6 * s, 8 + ab * 0.8], [cx - 6 * s, 8 + ab]], BR); if (ab > 2) { q.disco(cx - s, 8 + 0.5, 2, R.sangue[2]); q.set(cx - s, 8, '#1a1423'); } } q.contorno('#1a1423'); if (i === 2 || i === 3) { q.cintilar(3, 3, 2, R.ouro[3]); q.cintilar(37, 3, 2, R.ouro[3]); } }),
  fx('st-po', 32, 28, 6, 10, (q, i) => { const rnd = semente(600); for (let k = 0; k < 20; k++) { const x = (rnd() * 30 + Math.sin(i + k) * 2 + 1), y = (rnd() * 26 + i * (2 + rnd() * 2)) % 26 + 1, c = [R.inseto[3], R.ouro[3], R.mata[3], BR][k % 4]; if ((k + i) % 5 === 0) q.cintilar(x, y, 1, c); else q.set(x, y, c); } q.contorno(R.inseto[1]); }),
  fx('st-zzz', 20, 20, 4, 4, (q, i) => { const z = (x: number, y: number, s: number, c: Cor) => { q.ret(x, y, s, 1, c); q.linha(x + s - 1, y, x, y + s - 1, c); q.ret(x, y + s - 1, s, 1, c); }; const p = R.vento; if (i >= 0) z(2, 12 - (i % 2), 5, p[4]); if (i >= 1) z(8, 6 - (i % 2), 5, p[3]); if (i >= 2) z(14, 1, 4, p[3]); q.contorno(p[0]); }),
  fx('st-confuso', 36, 16, 6, 12, (q, i, f) => { for (let k = 0; k < 3; k++) { const a = f * TAU + (k * TAU) / 3, x = 18 + Math.cos(a) * 13, y = 8 + Math.sin(a) * 4; if (Math.sin(a) > -0.3) { q.estrela(x, y, 3.6, 1.5, 5, a, R.ouro[3]); q.set(x, y, BR); } else q.set(x, y, R.ouro[2]); } q.contorno(R.ouro[0]); }),
  fx('st-gelo', 52, 52, 4, 8, (q, i) => {
    const p = R.geada, pts: [number, number][] = [[10, 12], [26, 3], [42, 12], [46, 40], [26, 49], [6, 40]];
    q.poli(pts, p[2]); q.poli([[10, 12], [26, 3], [26, 22], [8, 26]], p[3]); q.poli([[26, 22], [42, 12], [46, 40], [26, 49]], p[1]);
    for (let y = 0; y < 52; y++) for (let x = 0; x < 52; x++) if (q.cheio(x, y) && (x + y) % 2 === 0) q.apagar(x, y);
    for (let j = 0; j < 6; j++) q.linha(pts[j][0], pts[j][1], pts[(j + 1) % 6][0], pts[(j + 1) % 6][1], p[4]);
    q.linha(26, 3, 26, 22, p[4]); q.linha(26, 22, 8, 26, p[3]); q.linha(26, 22, 46, 40, p[3]);
    q.cintilar([14, 36, 20, 40][i], [14, 18, 38, 34][i], 2, BR); q.contorno(p[0]);
  }),
  fx('st-paralisia', 36, 36, 4, 14, (q, i) => { const p = R.trovao, rnd = semente(640 + i); for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4 + i * 0.8 + 0.4; q.raio(18 + Math.cos(a) * 9, 18 + Math.sin(a) * 9, 18 + Math.cos(a + 0.9) * 16, 18 + Math.sin(a + 0.9) * 16, rnd, 3, k % 2 ? p[3] : p[4], 1, 4); } q.contorno(p[1]); }),
  fx('st-nivel', 36, 52, 6, 12, (q, i) => { const p = R.ouro, rnd = semente(660), h = [14, 28, 44, 50, 50, 40][i]; for (let x = 6; x < 30; x++) { const col = (x * 7) % 5; if (col === 0) continue; const hh = h * (0.6 + ((x * 13) % 7) / 16); for (let y = 0; y < hh; y++) if ((y + x + i * 3) % 4 !== 0 || col > 2) q.set(x, 51 - y, y > hh - 4 ? p[2] : col > 2 ? p[4] : p[3]); } for (let y = 0; y < 52; y++) for (let x = 0; x < 36; x++) if (q.cheio(x, y) && (x + y) % 2) q.apagar(x, y); for (let k = 0; k < 6; k++) q.cintilar(4 + rnd() * 28, 48 - ((rnd() * 44 + i * 9) % 46), (k + i) % 2 + 1, p[3], BR); q.contorno(p[1]); }),
  fx('st-sol', 44, 44, 4, 6, (q, i) => { const p = R.ouro; for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + (i * TAU) / 32; q.poli(girar([[11, -2.5], [19 + (k % 2) * 2, 0], [11, 2.5]], a, 22, 22), k % 2 ? p[2] : p[3]); } q.bola(22, 22, 9, [p[0], p[2], p[3], p[4], BR]); q.contorno(R.brasa[1]); }),
  fx('st-nuvem', 52, 28, 2, 3, (q, i) => { const p: Rampa = ['#1a1f38', '#454f5e', '#7a8a9c', '#b8c4d0', '#f0f4f8'], rnd = semente(700); q.nuvem(26, 13 + i, 15, 9, rnd, 0, p); q.elipse(26, 19 + i, 20, 4, p[1]); q.contorno(p[0]); }),
  fx('st-espinho', 36, 14, 4, 12, (q, i) => { const p = R.pedra, h = [3, 8, 11, 10][i]; for (let k = 0; k < 5; k++) { const x = 4 + k * 7, a = h * (k % 2 ? 0.7 : 1); q.poli([[x - 3, 13], [x + (k % 2 ? 1 : -1), 13 - a], [x + 3, 13]], p[2]); q.linha(x - 2, 13, x + (k % 2 ? 1 : -1), 14 - a, p[4]); } q.contorno(p[0]); }),
  fx('st-cipo', 44, 44, 5, 12, (q, i) => { const p = R.mata, a1 = [0.25, 0.5, 0.8, 1, 1][i], r = i === 4 ? 15 : 18; for (let k = 0; k < 2; k++) for (let t = 0; t <= a1; t += 0.004) { const a = (t + k * 0.5) * TAU, rr = r + Math.sin(t * TAU * 5 + k) * 2; q.disco(22 + Math.cos(a) * rr, 22 + Math.sin(a) * rr * 0.9, 1.2, (Math.floor(t * 40) % 4) ? p[2] : p[1]); } if (i >= 3) for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4 + 0.6; q.elipseRot(22 + Math.cos(a) * (r + 3), 22 + Math.sin(a) * (r + 3) * 0.9, 3, 1.4, a, p[3]); } q.contorno(p[0]); }),
  fx('st-dreno', 12, 12, 4, 10, (q, i) => { const p = R.cura; q.bola(6, 6, [2, 3, 4, 3][i], p); q.contorno(p[0]); }),
  fx('st-barreira', 16, 48, 4, 10, (q, i) => { const p = R.mente; for (let y = 2; y < 46; y++) { const x = 8 + Math.sin(y * 0.13) * 3; for (let d = -3; d <= 3; d++) if ((y + d + i * 2) % 4 < 2) q.set(x + d, y, d === -3 ? p[4] : d > 1 ? p[2] : p[3]); } const y = 6 + i * 11; q.cintilar(8 + Math.sin(y * 0.13) * 3, y, 2, BR); q.contorno(p[0]); }),
  fx('st-suor', 12, 12, 3, 8, (q, i) => { const p = R.rio; q.poli([[6, 1 + i * 2], [9, 7 + i * 2], [3, 7 + i * 2]], p[3]); q.disco(6, 7 + i * 2, 2.6, p[3]); q.set(5, 6 + i * 2, BR); q.contorno(p[0]); }),

  /* ------------------------------ clima (ladrilhos que se repetem) ------------------------------ */
  fx('clima-chuva', 32, 32, 4, 16, (q, i) => { const rnd = semente(800); for (let k = 0; k < 9; k++) { const x = rnd() * 32, y = (rnd() * 32 + i * 8) % 32, L = 4 + rnd() * 3; for (let t = 0; t < L; t++) q.set((x - t * 0.5 + 32) % 32, (y + t) % 32, t > L - 2 ? '#e8ffff' : '#6fc7e8'); } }),
  fx('clima-garoa', 32, 32, 4, 8, (q, i) => { const rnd = semente(810); for (let k = 0; k < 10; k++) { const x = rnd() * 32, y = (rnd() * 32 + i * 8 * (0.5 + (k % 2) * 0.5)) % 32; if (k % 3 === 0) { q.set(x, y, '#ffffff'); q.set((x + 1) % 32, y, '#c8f0f4'); q.set(x, (y + 1) % 32, '#c8f0f4'); } else { q.set(x, y, '#c8f0f4'); q.set(x, (y + 1) % 32, '#5fc4d8'); } } }),
  fx('clima-poeira', 32, 32, 4, 12, (q, i) => { const rnd = semente(820); for (let k = 0; k < 12; k++) { const y = rnd() * 32, x = (rnd() * 32 + i * 8) % 32, L = 2 + rnd() * 5; for (let t = 0; t < L; t++) q.set((x + t) % 32, (y + (t > 3 ? 1 : 0)) % 32, k % 3 ? '#e0b080' : '#f6e6b8'); } }),
  fx('clima-nevoa', 64, 24, 4, 4, (q, i) => { for (let x = 0; x < 64; x++) { const topo = 6 + Math.sin(((x + i * 16) / 64) * TAU) * 3 + Math.sin(((x * 3 + i * 16) / 64) * TAU) * 1.5, fim = 18 + Math.sin(((x * 2 - i * 16) / 64) * TAU) * 3; for (let y = Math.round(topo); y < fim; y++) { const borda = y - topo < 2 || fim - y < 2; if (borda && (x + y) % 2) continue; q.set(x, y, y - topo < 4 ? '#f0f4f8' : '#c4c6d4'); } } }),
  fx('clima-sol', 96, 96, 4, 5, (q, i) => { for (let k = 0; k < 7; k++) { const a = 0.08 + k * 0.21 + Math.sin(i * 1.57 + k) * 0.015, L = 60 + ((k * 37) % 30) + (i % 2) * 4; for (let t = 10; t < L; t++) { const e = 1 + t * 0.045; for (let d = -e; d <= e; d++) { const x = Math.cos(a) * t - Math.sin(a) * d, y = Math.sin(a) * t + Math.cos(a) * d; if ((Math.round(x) + Math.round(y)) % 2 === 0) q.set(x, y, Math.abs(d) < e * 0.4 ? '#fffbe0' : '#fff07a'); } } } q.disco(0, 0, 12, '#fffbe0'); }),
  fx('clima-respingo', 8, 4, 3, 12, (q, i) => { const c = '#e8ffff'; if (i === 0) q.ret(3, 2, 2, 1, c); else { q.set(3 - i * 1.5, 3 - i, c); q.set(4 + i * 1.5, 3 - i, c); q.set(3.5, 2 - i, '#6fc7e8'); } }),

  /* ------------------------------ captura ------------------------------ */
  ...Object.entries(CUIAS).map(([id, cores]) => fx(id, 16, 16, 8, 10, (q, i) => quadroCuia(q, i, cores))),
  fx('cap-luz', 40, 40, 5, 14, (q, i) => { const r = [4, 10, 16, 18, 18][i]; if (i < 3) { q.disco(20, 20, r, R.ouro[3]); q.disco(20, 20, r * 0.7, R.ouro[4]); q.disco(20, 20, r * 0.4, BR); q.estrela(20, 20, r + 3, r * 0.4, 8, i * 0.3, R.ouro[4]); } else { q.anel(20, 20, r, r, i === 3 ? 2 : 1, R.ouro[3]); for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8; q.cintilar(20 + Math.cos(a) * (r - 4), 20 + Math.sin(a) * (r - 4), i === 3 ? 2 : 1, BR); } } q.contorno(R.ouro[1]); }),
  fx('cap-estrelas', 40, 20, 5, 10, (q, i) => { const p = R.ouro; for (let k = -1; k <= 1; k++) { const x = 20 + k * (4 + i * 3), y = 16 - [4, 10, 13, 12, 8][i] + Math.abs(k) * 3, r = [2, 4, 5, 4, 2][i]; q.estrela(x, y, r, r * 0.42, 5, -Math.PI / 2 + k * 0.3, p[3]); q.set(x, y, BR); } q.contorno(p[0]); }),
  fx('cap-folhas', 44, 44, 5, 12, (q, i) => { const p = R.mata, rnd = semente(900); for (let k = 0; k < 8; k++) { const a = (k * TAU) / 8 + rnd() * 0.4, d = 4 + i * 4 + rnd() * 2, ang = a + i * 0.9; q.elipseRot(22 + Math.cos(a) * d, 22 + Math.sin(a) * d + i * i * 0.3, 3.2, 1.5, ang, k % 3 ? p[2] : p[3]); q.set(22 + Math.cos(a) * d, 22 + Math.sin(a) * d + i * i * 0.3, p[4]); } if (i < 2) q.cintilar(22, 22, 4 - i * 2, BR); q.contorno(p[0]); }),
  fx('cap-fumaca', 28, 28, 5, 12, (q, i, f) => { const p = R.branco, rnd = semente(910); q.nuvem(14, 14, 5 + i * 2, 6, rnd, f * 3, [R.comum[1], p[1], p[2], BR, BR]); if (i >= 3) for (let x = 0; x < 28; x++) for (let y = 0; y < 28; y++) if ((x + y + i) % 2) q.apagar(x, y); q.contorno(R.comum[1]); }),

  /* ------------------------------ evolução ------------------------------ */
  fx('evo-raios', 96, 96, 4, 10, (q, i) => { for (let k = 0; k < 12; k++) { const a = (k * TAU) / 12 + (i * TAU) / 48, L = 30 + ((k * 17 + i * 5) % 16); q.poli(girar([[14, -1], [L, -3.5], [L + 4, 0], [L, 3.5], [14, 1]], a, 48, 48), k % 2 ? '#fff07a' : '#fffbe0'); } for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) if (q.cheio(x, y) && (x + y) % 2) q.apagar(x, y); }),
  fx('evo-particula', 8, 8, 4, 12, (q, i) => { q.cintilar(4, 4, [1, 2, 3, 2][i], i % 2 ? '#fff07a' : BR, BR); }),
  fx('evo-anel', 96, 32, 5, 14, (q, i) => { const rx = 10 + i * 9; q.anel(48, 16, rx, rx * 0.3, i < 3 ? 3 : 2, i < 4 ? BR : '#fff07a'); q.contorno('#f9c22b'); }),

  /* ------------------------------ menu de batalha ------------------------------ */
  // cartão LUTAR: patada de onça sobre um estouro — quadro 0 normal, quadro 1 em foco (brilho)
  fx('ui-lutar', 44, 40, 2, 2, (q, i) => {
    const o = R.ouro;
    q.estrela(22, 20, 19, 9, 9, 0.2 + i * 0.17, i ? o[3] : o[2]); q.estrela(22, 20, 13, 6, 9, 0.2 + i * 0.17, i ? o[4] : o[3]); q.contorno('#7a1c28');
    const pata = new Quadro(44, 40);
    pata.elipse(22, 25, 8, 6.5, '#fff8e7'); pata.elipse(22, 27, 5, 3.5, R.encanto[2]);
    for (const [x, y] of [[12, 15], [18, 11], [26, 11], [32, 15]] as const) { pata.elipse(x, y, 3.2, 3.8, '#fff8e7'); pata.elipse(x, y + 1, 1.6, 2, R.encanto[2]); pata.poli([[x - 1, y - 4], [x + (x < 22 ? -2 : 2), y - 9], [x + 1, y - 4]], '#c4c6d4'); }
    pata.contorno('#3b2a35');
    for (let k = 0; k < pata.d.length; k++) if (pata.d[k]) q.d[k] = pata.d[k];
    if (i) { q.cintilar(6, 6, 2, BR); q.cintilar(38, 33, 2, BR); }
  }),
  fx('ui-mochila', 14, 14, 1, 1, (q) => { const p = R.terra; q.ret(3, 4, 8, 9, p[2]); q.ret(3, 4, 2, 9, p[3]); q.ret(9, 6, 2, 7, p[1]); q.anel(7, 3, 3, 2.4, 1, p[1], 0.5, 1); q.ret(4, 8, 6, 3, p[3]); q.ret(6, 9, 2, 1, R.ouro[2]); q.contorno(p[0]); }),
  fx('ui-equipe', 14, 14, 1, 1, (q) => { const p = R.terra; q.elipse(7, 8.5, 5, 4, p[2]); q.elipse(5.5, 7.5, 2.4, 1.6, p[3]); q.ret(2, 5, 10, 2, R.ouro[2]); q.set(3, 5, R.ouro[4]); q.set(5, 6, R.ouro[1]); q.set(7, 5, R.ouro[4]); q.set(9, 6, R.ouro[1]); q.elipse(7, 3.5, 3.6, 1.6, R.ouro[1]); q.set(7, 1, R.brasa[2]); q.contorno(p[0]); }),
  fx('ui-fugir', 14, 14, 1, 1, (q) => { const p = R.vento; q.elipseRot(4, 9, 2.4, 1.6, -0.6, BR); q.elipseRot(10, 5, 2.4, 1.6, -0.6, BR); for (const [x, y] of [[2, 6], [4, 5], [6, 6], [8, 2], [10, 1], [12, 2]] as const) q.set(x, y, BR); q.linha(1, 12, 4, 12, p[3]); q.linha(7, 9, 10, 9, p[3]); q.contorno(p[0]); }),
  fx('ui-cuia-mini', 7, 7, 3, 1, (q, i) => { const c = [['#b0784a', '#e8c07a'], ['#4a4a5e', '#8a8aa0'], ['#3b2a35', '#3b2a35']][i]; if (i < 2) { q.elipse(3, 3.5, 2, 2, c[0]); q.ret(1, 2, 5, 1, c[1]); q.set(2, 4, c[1]); q.contorno('#1a1423'); } else q.anel(3, 3, 2, 2, 1, c[0]); }),
  // vulto de reserva para criaturas cujo sprite ainda não foi gerado: bicho arredondado que respira (2 quadros) e a miniatura dele
  fx('ui-vulto', 48, 48, 2, 2, (q, i) => {
    const p: Rampa = ['#3b2a35', '#8a8aa0', '#c4c6d4', '#f0f4f8', '#ffffff'], dy = i;
    q.elipse(24, 31 + dy, 15, 13 - dy, p[1]); q.elipse(23, 29 + dy, 13, 11 - dy, p[2]); q.elipse(20, 25 + dy, 7, 5, p[3]);
    q.elipse(13, 16 + dy, 4, 6, p[2]); q.elipse(34, 16 + dy, 4, 6, p[1]); q.elipse(13, 16 + dy, 2, 3, p[3]);
    q.elipse(15, 44, 4, 2, p[1]); q.elipse(33, 44, 4, 2, p[1]);
    q.ret(28, 27 + dy, 2, 4, '#1a1423'); q.ret(35, 27 + dy, 2, 4, '#1a1423'); q.set(28, 27 + dy, BR); q.set(35, 27 + dy, BR);
    q.contorno(p[0]);
  }),
  fx('ui-vulto-mini', 16, 16, 1, 1, (q) => { const p: Rampa = ['#3b2a35', '#8a8aa0', '#c4c6d4', '#f0f4f8', '#ffffff']; q.elipse(8, 10, 6, 5, p[1]); q.elipse(7.5, 9, 5, 4, p[2]); q.elipse(4, 4, 1.6, 2.4, p[2]); q.elipse(11, 4, 1.6, 2.4, p[1]); q.set(9, 9, '#1a1423'); q.set(12, 9, '#1a1423'); q.contorno(p[0]); }),
];
