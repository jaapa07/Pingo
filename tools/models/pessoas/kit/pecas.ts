/**
 * Peças trocáveis do kit de pessoas: cabelos, barbas, chapéus, sobreposições de roupa,
 * itens de costas e objetos de mão. Coordenadas no espaço do osso onde a peça é presa.
 * Cabeça: centro em [0, HY, 0], raio ~0.28; o rosto olha para +X.
 */
import { blob, limb, lathe, tube, slab, roundBox, ring, spike, flattenBelow, taper, wobble, tom, THREE } from '../../../render/sculpt';
import type { V3 } from '../../../render/sculpt';

export const HY = 0.25;
type Mat = THREE.Material;
type Obj = THREE.Object3D;
const h = (x: number, y: number, z: number): V3 => [x, HY + y, z];

/* ------------------------------ cabelos ------------------------------ */
export type Cabelo =
  | 'careca' | 'raspado' | 'curto' | 'crespo' | 'black' | 'topete' | 'espetado' | 'tigela' | 'calvo'
  | 'longo' | 'ondulado' | 'rabo' | 'rabo-alto' | 'tranca' | 'trancas' | 'coque' | 'chanel' | 'chiquinhas' | 'cachos';

function casco(m: Mat, o: { corte?: number; dx?: number; e?: number; dy?: number; w?: number } = {}) {
  const e = o.e ?? 1;
  const d = o.corte !== undefined ? [flattenBelow(o.corte)] : [];
  if (o.w) d.unshift(wobble(o.w, 15));
  return blob([0.283 * e, 0.252 * e, 0.312 * e], m, { pos: h(o.dx ?? -0.045, 0.045 + (o.dy ?? 0), 0), deform: d });
}

/** `sob` = há chapéu por cima (some com volumes no topo). */
export function cabelo(tipo: Cabelo, m: Mat, sob: boolean, laco?: Mat): Obj[] {
  const o: Obj[] = [];
  const franja = (w = 0.2, y = 0.16) => blob([0.06, 0.05, w], m, { pos: h(0.2, y + 0.03, 0) });
  /** mechas soltas na testa: linha do cabelo recortada */
  const mechas = (n: number, len = 0.085, y = 0.15) => { if (sob) return; for (let i = 0; i < n; i++) { const z = n === 1 ? 0 : -0.19 + (0.38 * i) / (n - 1); o.push(blob([0.055, len * (i % 2 ? 0.75 : 1), 0.38 / n * 0.62 + 0.02], m, { pos: h(0.262 * Math.sqrt(1 - (z / 0.3) ** 2) - 0.045, y, z), rot: [z * 60, 0, -14] })); } };
  /** risca no meio: duas ondas que abrem a testa em triângulo */
  const meio = (y = 0.17) => { if (sob) return; for (const s of [1, -1]) o.push(blob([0.065, 0.07, 0.15], m, { pos: h(0.175, y, 0.14 * s), rot: [-30 * s, 0, 0] })); };
  /** franja jogada para um lado */
  const lado = (y = 0.17) => { if (!sob) o.push(blob([0.07, 0.075, 0.2], m, { pos: h(0.185, y, 0.05), rot: [-20, 0, 0] })); };
  const costeletas = () => { for (const s of [1, -1]) o.push(blob([0.05, 0.1, 0.04], m, { pos: h(0.07, -0.03, 0.285 * s) })); };
  switch (tipo) {
    case 'careca': break;
    case 'raspado': o.push(casco(m, { corte: 0.0, dx: -0.045, e: 0.99 })); break;
    case 'curto': o.push(casco(m, { corte: -0.06 })); mechas(3); break;
    case 'tigela': o.push(casco(m, { corte: -0.06, dx: -0.01, e: 1.03 }), franja(0.24, 0.1)); break;
    case 'crespo': o.push(casco(m, { corte: -0.04, e: 1.03, w: 0.008 }), blob([0.06, 0.055, 0.19], m, { pos: h(0.185, 0.21, 0) })); break;
    case 'black': o.push(sob ? casco(m, { e: 1.08 }) : blob([0.36, 0.33, 0.4], m, { pos: h(-0.075, 0.16, 0), deform: [wobble(0.012, 16)] }), franja(0.2, 0.18)); break;
    case 'topete': o.push(casco(m, { corte: -0.06 })); costeletas(); if (!sob) o.push(blob([0.13, 0.1, 0.17], m, { pos: h(0.17, 0.24, 0), rot: [0, 0, 20] })); else o.push(franja()); break;
    case 'espetado': {
      o.push(casco(m, { corte: -0.06 })); mechas(4, 0.08);
      if (!sob) for (const [x, z, rz, rx] of [[0.1, 0, -30, 0], [-0.02, 0.14, 0, 30], [-0.02, -0.14, 0, -30], [-0.16, 0, 35, 0], [0.06, 0.1, -20, 20], [0.06, -0.1, -20, -20]] as const) o.push(spike(0.2, 0.09, m, { pos: h(x, 0.2, z), rot: [rx, 0, rz] }));
      break;
    }
    case 'calvo': o.push(blob([0.17, 0.11, 0.07], m, { pos: h(-0.07, 0.0, 0.265) }), blob([0.17, 0.11, 0.07], m, { pos: h(-0.07, 0.0, -0.265) }), blob([0.08, 0.13, 0.27], m, { pos: h(-0.235, 0.0, 0) })); break;
    case 'longo': o.push(casco(m), blob([0.15, 0.3, 0.3], m, { pos: h(-0.17, -0.17, 0) })); meio(); break;
    case 'ondulado': o.push(casco(m, { e: 1.04 }), blob([0.17, 0.3, 0.33], m, { pos: h(-0.17, -0.16, 0), deform: [wobble(0.02, 18)] }), blob([0.13, 0.16, 0.09], m, { pos: h(0.0, -0.14, 0.28) }), blob([0.13, 0.16, 0.09], m, { pos: h(0.0, -0.14, -0.28) }), ); lado(); break;
    case 'cachos': {
      o.push(casco(m, { e: 1.03 })); mechas(4, 0.07, 0.17);
      for (const [x, y, z] of [[-0.2, -0.1, 0.2], [-0.2, -0.1, -0.2], [-0.27, -0.05, 0], [-0.02, -0.12, 0.3], [-0.02, -0.12, -0.3], [-0.2, -0.28, 0.12], [-0.2, -0.28, -0.12], [-0.06, 0.02, 0.33], [-0.06, 0.02, -0.33]] as const) o.push(blob([0.12, 0.12, 0.12], m, { pos: h(x, y, z) }));
      break;
    }
    case 'rabo': lado(); o.push(casco(m, { corte: -0.08 }), tube([h(-0.27, 0.08, 0), h(-0.42, 0.02, 0), h(-0.43, -0.22, 0)], (t) => 0.085 - t * 0.045, m, { seg: 12, radial: 8 })); if (laco) o.push(blob([0.06, 0.07, 0.08], laco, { pos: h(-0.31, 0.08, 0) })); break;
    case 'rabo-alto': o.push(casco(m, { corte: -0.08 })); mechas(3, 0.09); if (!sob) o.push(blob([0.09, 0.08, 0.1], m, { pos: h(-0.24, 0.2, 0) }), tube([h(-0.24, 0.2, 0), h(-0.37, 0.2, 0), h(-0.42, 0.02, 0), h(-0.38, -0.2, 0)], (t) => 0.095 - t * 0.055, m, { seg: 14, radial: 8 })); else o.push(tube([h(-0.27, 0.0, 0), h(-0.4, -0.05, 0), h(-0.4, -0.25, 0)], (t) => 0.08 - t * 0.04, m, { seg: 12, radial: 8 })); if (laco && !sob) o.push(blob([0.06, 0.08, 0.1], laco, { pos: h(-0.3, 0.2, 0) })); break;
    case 'tranca': meio(); costeletas(); o.push(casco(m, { corte: -0.1 }), tube([h(-0.26, -0.02, 0), h(-0.33, -0.2, 0), h(-0.27, -0.42, 0), h(-0.3, -0.58, 0)], (t) => 0.085 - t * 0.03, m, { seg: 14, radial: 8 })); if (laco) o.push(blob([0.055, 0.05, 0.055], laco, { pos: h(-0.3, -0.6, 0) })); break;
    case 'trancas': {
      o.push(casco(m, { corte: -0.1 })); meio();
      for (const s of [1, -1]) { o.push(tube([h(-0.08, -0.04, 0.3 * s), h(-0.06, -0.22, 0.31 * s), h(-0.02, -0.45, 0.27 * s)], (t) => 0.075 - t * 0.02, m, { seg: 12, radial: 8 })); if (laco) o.push(blob([0.055, 0.05, 0.055], laco, { pos: h(-0.02, -0.47, 0.27 * s) })); }
      break;
    }
    case 'coque': o.push(casco(m, { corte: -0.08 })); meio(0.19); if (!sob) o.push(blob([0.13, 0.12, 0.14], m, { pos: h(-0.17, 0.33, 0) })); else o.push(blob([0.1, 0.1, 0.12], m, { pos: h(-0.31, -0.02, 0) })); if (laco && !sob) o.push(ring(0.09, 0.025, laco, { pos: h(-0.15, 0.27, 0), rot: [90, 0, 25] })); break;
    case 'chanel': o.push(casco(m, { dx: -0.02, e: 1.02 }), blob([0.2, 0.2, 0.09], m, { pos: h(-0.03, -0.12, 0.27) }), blob([0.2, 0.2, 0.09], m, { pos: h(-0.03, -0.12, -0.27) }), blob([0.1, 0.2, 0.28], m, { pos: h(-0.22, -0.1, 0) }), franja(0.24, 0.1)); break;
    case 'chiquinhas': o.push(casco(m, { corte: -0.08 })); mechas(3, 0.08); for (const s of [1, -1]) { o.push(blob([0.11, 0.13, 0.11], m, { pos: h(-0.08, 0.0, 0.35 * s) })); if (laco) o.push(blob([0.05, 0.06, 0.05], laco, { pos: h(-0.07, 0.07, 0.29 * s) })); } break;
  }
  return o;
}

/* ------------------------------ barbas ------------------------------ */
export type Barba = 'bigode' | 'barba' | 'cavanhaque' | 'longa' | 'costeleta';
export function barba(tipo: Barba, m: Mat): Obj[] {
  switch (tipo) {
    case 'bigode': return [blob([0.035, 0.03, 0.11], m, { pos: h(0.255, -0.105, 0) })];
    case 'cavanhaque': return [blob([0.035, 0.03, 0.09], m, { pos: h(0.255, -0.105, 0) }), blob([0.06, 0.075, 0.075], m, { pos: h(0.2, -0.22, 0) })];
    case 'barba': return [blob([0.17, 0.13, 0.27], m, { pos: h(0.11, -0.18, 0) }), blob([0.035, 0.03, 0.11], m, { pos: h(0.255, -0.105, 0) })];
    case 'longa': return [blob([0.17, 0.13, 0.27], m, { pos: h(0.11, -0.18, 0) }), blob([0.1, 0.2, 0.16], m, { pos: h(0.17, -0.34, 0) }), blob([0.035, 0.03, 0.12], m, { pos: h(0.255, -0.105, 0) })];
    case 'costeleta': return [blob([0.06, 0.13, 0.04], m, { pos: h(0.06, -0.1, 0.285) }), blob([0.06, 0.13, 0.04], m, { pos: h(0.06, -0.1, -0.285) })];
  }
}

/* ------------------------------ chapéus ------------------------------ */
export type Chapeu =
  | 'palha' | 'couro' | 'pantaneiro' | 'pescador' | 'bone' | 'lenco' | 'lenco-queixo' | 'capacete' | 'quepe' | 'boina' | 'cocar' | 'cocar-grande'
  | 'gorro' | 'faixa' | 'flor' | 'goggles' | 'marinheiro' | 'touca' | 'turbante' | 'coroa-folhas' | 'explorador' | 'tiara' | 'viseira' | 'aba-larga' | 'pena';

/** altura extra acima do topo da cabeça, para enquadrar as vistas */
export const TOPO: Record<Chapeu, number> = {
  palha: 0.1, couro: 0.1, pantaneiro: 0.14, pescador: 0.06, bone: 0.03, lenco: 0.03, 'lenco-queixo': 0.03, capacete: 0.06, quepe: 0.1, boina: 0.05, cocar: 0.28, 'cocar-grande': 0.3,
  gorro: 0.14, faixa: 0, flor: 0.02, goggles: 0, marinheiro: 0.08, touca: 0.05, turbante: 0.14, 'coroa-folhas': 0.08, explorador: 0.1, tiara: 0.02, viseira: 0.02, 'aba-larga': 0.12, pena: 0.2,
};
/** chapéus que cobrem o topo do cabelo */
export const COBRE: Record<Chapeu, boolean> = {
  palha: true, couro: true, pantaneiro: true, pescador: true, bone: true, lenco: true, 'lenco-queixo': true, capacete: true, quepe: true, boina: true, cocar: false, 'cocar-grande': false,
  gorro: true, faixa: false, flor: false, goggles: false, marinheiro: true, touca: true, turbante: true, 'coroa-folhas': false, explorador: true, tiara: false, viseira: false, 'aba-larga': true, pena: false,
};

const pena = (len: number, w: number, m: Mat, pos: V3, rot: V3) => slab([[0, 0], [w, len * 0.35], [w * 0.8, len * 0.8], [0, len], [-w * 0.8, len * 0.8], [-w, len * 0.35]], 0.02, m, { pos, rot, bevel: 0.008 });

/** m = cor principal, f = faixa/detalhe, e = escuro */
export function chapeu(tipo: Chapeu, m: Mat, f: Mat, e: Mat): Obj[] {
  const aba = (r: number, y: number, sobe = 0, esp = 0.03) => lathe([[0.2, y + 0.01], [r * 0.7, y + esp * 0.5], [r, y + sobe], [r + 0.01, y + sobe - esp], [r * 0.7, y - esp], [0.2, y - esp]], m, { pos: h(-0.02, 0, 0), seg: 24 });
  const faixaAro = (r: number, y: number, mm: Mat = f, t = 0.035) => ring(r, t, mm, { pos: h(r < 0.27 ? -0.045 : -0.02, y, 0), rot: [90, 0, 0], scale: [1, 1.09, 1] });
  switch (tipo) {
    case 'palha': return [lathe([[0.001, 0.37], [0.14, 0.36], [0.24, 0.3], [0.285, 0.16], [0.29, 0.1], [0.001, 0.1]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), aba(0.46, 0.12, -0.02), faixaAro(0.29, 0.15)];
    case 'aba-larga': return [lathe([[0.001, 0.4], [0.12, 0.39], [0.22, 0.32], [0.285, 0.16], [0.29, 0.1], [0.001, 0.1]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), aba(0.45, 0.12, -0.05), faixaAro(0.29, 0.15)];
    case 'couro': return [lathe([[0.001, 0.36], [0.16, 0.35], [0.27, 0.28], [0.3, 0.14], [0.3, 0.09], [0.001, 0.09]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), aba(0.4, 0.1, 0.09, 0.035), blob([0.03, 0.05, 0.05], f, { pos: h(0.26, 0.23, 0) }), faixaAro(0.3, 0.13, e, 0.02)];
    case 'pantaneiro': return [lathe([[0.001, 0.38], [0.2, 0.4], [0.26, 0.34], [0.27, 0.14], [0.29, 0.09], [0.001, 0.09]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), aba(0.47, 0.11, 0.04, 0.03), faixaAro(0.285, 0.15)];
    case 'pescador': return [lathe([[0.001, 0.33], [0.2, 0.32], [0.29, 0.2], [0.38, 0.06], [0.37, 0.03], [0.28, 0.1], [0.001, 0.1]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), faixaAro(0.3, 0.19)];
    case 'explorador': return [lathe([[0.001, 0.38], [0.18, 0.36], [0.28, 0.24], [0.3, 0.14], [0.41, 0.06], [0.4, 0.03], [0.28, 0.09], [0.001, 0.09]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), faixaAro(0.3, 0.16)];
    case 'bone': return [blob([0.3, 0.25, 0.33], m, { pos: h(-0.025, 0.07, 0), deform: [flattenBelow(0.02)] }), blob([0.17, 0.03, 0.21], f, { pos: h(0.3, 0.1, 0), rot: [0, 0, -8] }), blob([0.03, 0.03, 0.03], f, { pos: h(-0.02, 0.33, 0) })];
    case 'viseira': return [faixaAro(0.29, 0.1, m, 0.04), blob([0.17, 0.03, 0.22], m, { pos: h(0.31, 0.09, 0), rot: [0, 0, -10] })];
    case 'lenco': return [blob([0.3, 0.25, 0.33], m, { pos: h(-0.03, 0.07, 0), deform: [flattenBelow(-0.02)] }), blob([0.07, 0.06, 0.09], m, { pos: h(-0.33, 0.0, 0) }), blob([0.05, 0.09, 0.05], f, { pos: h(-0.37, -0.1, 0.04) })];
    case 'lenco-queixo': return [blob([0.3, 0.27, 0.335], m, { pos: h(-0.045, 0.06, 0), deform: [flattenBelow(-0.2)] }), blob([0.06, 0.06, 0.08], m, { pos: h(0.2, -0.27, 0) }), blob([0.07, 0.05, 0.2], f, { pos: h(0.21, 0.14, 0) })];
    case 'touca': return [blob([0.3, 0.26, 0.33], m, { pos: h(-0.05, 0.1, 0), deform: [flattenBelow(-0.0)] }), faixaAro(0.29, 0.1, f, 0.04)];
    case 'capacete': return [blob([0.31, 0.27, 0.34], m, { pos: h(-0.02, 0.07, 0), deform: [flattenBelow(0.02)] }), aba(0.36, 0.1, 0, 0.03), blob([0.05, 0.06, 0.07], f, { pos: h(0.29, 0.2, 0) })];
    case 'quepe': return [lathe([[0.001, 0.36], [0.3, 0.36], [0.33, 0.31], [0.28, 0.16], [0.28, 0.1], [0.001, 0.1]], m, { pos: h(-0.02, 0, 0), scale: [1, 1, 1.08], seg: 24 }), blob([0.15, 0.03, 0.2], e, { pos: h(0.29, 0.1, 0), rot: [0, 0, -12] }), faixaAro(0.285, 0.15), blob([0.03, 0.045, 0.045], f, { pos: h(0.27, 0.26, 0) })];
    case 'marinheiro': return [lathe([[0.001, 0.34], [0.24, 0.34], [0.31, 0.26], [0.29, 0.14], [0.28, 0.1], [0.001, 0.1]], m, { pos: h(-0.03, 0, 0), scale: [1, 1, 1.08], seg: 24 }), faixaAro(0.29, 0.14)];
    case 'boina': return [blob([0.33, 0.11, 0.36], m, { pos: h(-0.05, 0.24, 0.04), rot: [8, 0, 6] }), faixaAro(0.285, 0.15, m, 0.04), blob([0.03, 0.04, 0.03], f, { pos: h(-0.05, 0.36, 0.04) })];
    case 'gorro': return [blob([0.3, 0.3, 0.33], m, { pos: h(-0.03, 0.09, 0), deform: [flattenBelow(0.0)] }), faixaAro(0.295, 0.12, f, 0.055), blob([0.08, 0.08, 0.08], f, { pos: h(-0.05, 0.42, 0) })];
    case 'turbante': return [blob([0.31, 0.24, 0.34], m, { pos: h(-0.04, 0.16, 0), deform: [flattenBelow(-0.08)] }), blob([0.2, 0.14, 0.24], m, { pos: h(-0.06, 0.34, 0) }), blob([0.07, 0.08, 0.1], f, { pos: h(0.2, 0.28, 0.04) })];
    case 'faixa': return [faixaAro(0.268, 0.13, m, 0.03), blob([0.04, 0.09, 0.04], m, { pos: h(-0.32, 0.04, 0.05), rot: [0, 0, 20] })];
    case 'tiara': return [ring(0.3, 0.03, m, { pos: h(-0.03, 0.02, 0), rot: [0, 90, 0], arc: 180, scale: [1.06, 1, 1] })];
    case 'flor': { const o: Obj[] = [blob([0.045, 0.045, 0.04], f, { pos: h(0.12, 0.2, 0.275) })]; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; o.push(blob([0.05, 0.05, 0.03], m, { pos: h(0.12 + Math.cos(a) * 0.07, 0.2 + Math.sin(a) * 0.07, 0.26) })); } return o; }
    case 'goggles': return [faixaAro(0.262, 0.14, e, 0.028), blob([0.045, 0.065, 0.075], f, { pos: h(0.255, 0.15, 0.1) }), blob([0.045, 0.065, 0.075], f, { pos: h(0.255, 0.15, -0.1) }), ring(0.07, 0.022, m, { pos: h(0.265, 0.15, 0.1), rot: [0, 90, 0] }), ring(0.07, 0.022, m, { pos: h(0.265, 0.15, -0.1), rot: [0, 90, 0] })];
    case 'pena': return [faixaAro(0.262, 0.13, f, 0.035), pena(0.22, 0.06, m, h(-0.2, 0.14, 0.12), [0, 90, 0]), pena(0.18, 0.05, f, h(-0.2, 0.14, -0.02), [0, 90, 0])];
    case 'coroa-folhas': { const o: Obj[] = [faixaAro(0.262, 0.14, f, 0.03)]; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; o.push(pena(0.17, 0.06, i % 2 ? m : f, h(-0.02 + Math.cos(a) * 0.28, 0.13, Math.sin(a) * 0.31), [0, 90 - (a * 180) / Math.PI, 0])); } return o; }
    case 'cocar': case 'cocar-grande': {
      const g = tipo === 'cocar-grande';
      const o: Obj[] = [faixaAro(0.262, 0.13, f, 0.04)];
      const n = g ? 5 : 4;
      for (let i = -n; i <= n; i++) {
        const a = (i / n) * (g ? 78 : 70), len = (g ? 0.25 : 0.2) - Math.abs(i) * 0.022;
        const s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180);
        o.push(pena(len, g ? 0.062 : 0.055, i % 2 === 0 ? m : f, h(-0.05, 0.02 + c * 0.24, s * 0.29), [a, 90, 0]));
        if (g && i % 2 === 0) o.push(blob([0.03, 0.04, 0.04], e, { pos: h(-0.04, 0.02 + c * (0.24 + len), s * (0.29 + len)) }));
      }
      return o;
    }
  }
}

/* ------------------------- roupas por cima do tronco ------------------------- */
export type Sobre = 'jaleco' | 'colete' | 'poncho' | 'avental' | 'macacao' | 'capa' | 'xale' | 'faixa-peito' | 'ombreiras' | 'jardineira' | 'pala';
/** peças presas ao osso `tronco` (origem na cintura; ombros em y≈0.27) */
export function sobre(tipo: Sobre, m: Mat, f: Mat): Obj[] {
  switch (tipo) {
    case 'jaleco': return [lathe([[0.001, 0.36], [0.17, 0.35], [0.215, 0.2], [0.21, 0.0], [0.235, -0.17], [0.001, -0.17]], m, { scale: [0.74, 1, 1], seg: 20 }), blob([0.03, 0.16, 0.045], f, { pos: [0.15, 0.17, 0] }), blob([0.04, 0.05, 0.13], m, { pos: [0.12, 0.3, 0] })];
    case 'colete': return [blob([0.15, 0.2, 0.1], m, { pos: [0.005, 0.15, 0.125] }), blob([0.15, 0.2, 0.1], m, { pos: [0.005, 0.15, -0.125] }), blob([0.06, 0.2, 0.2], m, { pos: [-0.1, 0.15, 0] })];
    case 'poncho': return [lathe([[0.001, 0.37], [0.1, 0.36], [0.24, 0.24], [0.33, 0.03], [0.32, -0.01], [0.001, 0.0]], m, { scale: [0.72, 1, 1], seg: 24 }), lathe([[0.275, 0.17], [0.31, 0.09], [0.3, 0.075], [0.265, 0.155]], f, { scale: [0.73, 1, 1.01], seg: 24 })];
    case 'pala': return [lathe([[0.001, 0.37], [0.1, 0.36], [0.23, 0.26], [0.3, -0.12], [0.29, -0.15], [0.001, -0.14]], m, { scale: [0.7, 1, 1], seg: 24 }), lathe([[0.265, 0.1], [0.285, -0.02], [0.275, -0.035], [0.255, 0.09]], f, { scale: [0.71, 1, 1.01], seg: 24 })];
    case 'avental': return [roundBox([0.05, 0.36, 0.27], 0.02, m, { pos: [0.125, 0.03, 0] }), blob([0.03, 0.03, 0.2], f, { pos: [0.13, 0.02, 0] })];
    case 'macacao': return [roundBox([0.05, 0.2, 0.22], 0.02, m, { pos: [0.115, 0.1, 0] }), blob([0.14, 0.03, 0.035], m, { pos: [0, 0.3, 0.1] }), blob([0.14, 0.03, 0.035], m, { pos: [0, 0.3, -0.1] }), blob([0.02, 0.025, 0.025], f, { pos: [0.14, 0.18, 0.08] }), blob([0.02, 0.025, 0.025], f, { pos: [0.14, 0.18, -0.08] })];
    case 'jardineira': return [roundBox([0.05, 0.18, 0.2], 0.02, m, { pos: [0.115, 0.1, 0] }), blob([0.14, 0.03, 0.035], m, { pos: [0, 0.3, 0.1] }), blob([0.14, 0.03, 0.035], m, { pos: [0, 0.3, -0.1] }), blob([0.02, 0.04, 0.05], f, { pos: [0.14, 0.1, 0] })];
    case 'capa': return [blob([0.07, 0.3, 0.31], m, { pos: [-0.15, 0.02, 0], deform: [taper('y', -0.3, 0.3, 1.15, 0.75)] }), blob([0.15, 0.06, 0.24], m, { pos: [-0.01, 0.3, 0] }), blob([0.035, 0.04, 0.04], f, { pos: [0.13, 0.29, 0] })];
    case 'xale': return [blob([0.185, 0.1, 0.27], m, { pos: [0, 0.265, 0] }), blob([0.05, 0.1, 0.07], m, { pos: [0.14, 0.18, 0] }), blob([0.19, 0.03, 0.275], f, { pos: [0, 0.2, 0] })];
    case 'faixa-peito': return [tube([[0.02, 0.33, 0.17], [0.15, 0.18, 0.02], [0.05, 0.02, -0.19], [-0.14, 0.18, -0.02], [0.02, 0.33, 0.17]], 0.04, m, { seg: 20, radial: 8, closed: true }), blob([0.03, 0.045, 0.045], f, { pos: [0.16, 0.19, 0.03] })];
    case 'ombreiras': return [blob([0.085, 0.045, 0.085], m, { pos: [0, 0.3, 0.215] }), blob([0.085, 0.045, 0.085], m, { pos: [0, 0.3, -0.215] }), blob([0.03, 0.03, 0.03], f, { pos: [0.14, 0.24, 0.08] }), blob([0.03, 0.03, 0.03], f, { pos: [0.14, 0.17, 0.08] })];
  }
}

export type Pescoco = 'lenco' | 'colar' | 'gravata' | 'cachecol' | 'binoculo' | 'gola' | 'apito' | 'laco';
export function pescoco(tipo: Pescoco, m: Mat, f: Mat): Obj[] {
  switch (tipo) {
    case 'lenco': return [blob([0.15, 0.055, 0.2], m, { pos: [0.01, 0.31, 0] }), blob([0.05, 0.075, 0.07], m, { pos: [0.14, 0.25, 0] })];
    case 'cachecol': return [blob([0.16, 0.07, 0.21], m, { pos: [0.01, 0.32, 0] }), blob([0.04, 0.13, 0.055], m, { pos: [0.13, 0.2, 0.08] }), blob([0.04, 0.03, 0.055], f, { pos: [0.13, 0.08, 0.08] })];
    case 'colar': return [ring(0.15, 0.025, m, { pos: [0.03, 0.29, 0], rot: [90, 0, 0], scale: [1, 1.2, 1] }), blob([0.035, 0.045, 0.045], f, { pos: [0.16, 0.24, 0] })];
    case 'gravata': return [blob([0.02, 0.1, 0.035], m, { pos: [0.14, 0.2, 0] }), blob([0.025, 0.03, 0.04], m, { pos: [0.135, 0.3, 0] })];
    case 'laco': return [blob([0.03, 0.045, 0.06], m, { pos: [0.135, 0.29, 0.05] }), blob([0.03, 0.045, 0.06], m, { pos: [0.135, 0.29, -0.05] })];
    case 'gola': return [blob([0.16, 0.05, 0.21], m, { pos: [0.01, 0.31, 0] })];
    case 'binoculo': return [blob([0.05, 0.055, 0.045], m, { pos: [0.16, 0.16, 0.045] }), blob([0.05, 0.055, 0.045], m, { pos: [0.16, 0.16, -0.045] }), ring(0.155, 0.012, f, { pos: [0.02, 0.26, 0], rot: [65, 0, 0], scale: [1, 1.15, 1] })];
    case 'apito': return [ring(0.15, 0.012, f, { pos: [0.03, 0.28, 0], rot: [75, 0, 0], scale: [1, 1.2, 1] }), blob([0.03, 0.035, 0.035], m, { pos: [0.16, 0.19, 0] })];
  }
}

/* ------------------------------ costas ------------------------------ */
export type Costas = 'mochila' | 'cesto' | 'cilindro' | 'aljava' | 'bolsa' | 'saco' | 'rede';
export function costas(tipo: Costas, m: Mat, f: Mat): Obj[] {
  switch (tipo) {
    case 'mochila': return [roundBox([0.14, 0.26, 0.28], 0.06, m, { pos: [-0.17, 0.15, 0] }), roundBox([0.06, 0.1, 0.2], 0.03, f, { pos: [-0.24, 0.1, 0] })];
    case 'cesto': return [lathe([[0.001, -0.13], [0.09, -0.13], [0.13, 0.1], [0.14, 0.13], [0.11, 0.13], [0.001, 0.1]], m, { pos: [-0.21, 0.15, 0], seg: 16 }), ring(0.135, 0.022, f, { pos: [-0.21, 0.27, 0], rot: [90, 0, 0] }), ring(0.115, 0.016, f, { pos: [-0.21, 0.13, 0], rot: [90, 0, 0] })];
    case 'cilindro': return [limb(0.26, 0.075, 0.075, m, { pos: [-0.2, 0.3, 0] }), blob([0.03, 0.04, 0.03], f, { pos: [-0.2, 0.39, 0] })];
    case 'aljava': return [limb(0.3, 0.055, 0.05, m, { pos: [-0.17, 0.36, 0.05], rot: [20, 0, 0] }), blob([0.03, 0.06, 0.03], f, { pos: [-0.17, 0.42, 0.07] }), blob([0.03, 0.06, 0.03], f, { pos: [-0.15, 0.41, 0.01] })];
    case 'bolsa': return [roundBox([0.16, 0.16, 0.08], 0.035, m, { pos: [-0.04, -0.02, 0.2] }), tube([[-0.04, 0.05, 0.2], [0.1, 0.24, 0.08], [0, 0.34, -0.14], [-0.12, 0.22, -0.05], [-0.1, 0.05, 0.17]], 0.02, f, { seg: 16, radial: 6 })];
    case 'saco': return [blob([0.15, 0.2, 0.2], m, { pos: [-0.2, 0.2, 0.02], deform: [taper('y', -0.2, 0.2, 1.1, 0.6)] }), blob([0.04, 0.04, 0.05], f, { pos: [-0.2, 0.4, 0.02] })];
    case 'rede': return [tube([[-0.16, 0.34, 0.14], [-0.2, 0.2, 0], [-0.16, 0.04, -0.16]], 0.05, m, { seg: 10, radial: 8 })];
  }
}

/* ------------------------------ objetos de mão ------------------------------ */
export type Prop =
  | 'vara' | 'pipa' | 'remo' | 'martelo' | 'picareta' | 'lamparina' | 'cajado' | 'puca' | 'chave' | 'viola' | 'luneta' | 'gancho' | 'laco' | 'prancha'
  | 'berimbau' | 'bateia' | 'bilro' | 'livro' | 'maraca' | 'cuia' | 'prancheta' | 'bengala' | 'lanca' | 'facao' | 'corda' | 'pinha' | 'chimarrao' | 'chicote' | 'arpao' | 'cesta' | 'bandeja';

/** Objeto preso à mão (origem na palma; o braço aponta para −Y). m = principal, f = detalhe, e = escuro. */
export function prop(tipo: Prop, m: Mat, f: Mat, e: Mat): Obj[] {
  const cabo = (len: number, r = 0.022, mm: Mat = m, y0 = -0.12) => tube([[0, y0, 0], [0, y0 + len, 0]], r, mm, { seg: 4, radial: 8 });
  switch (tipo) {
    case 'vara': return [tube([[0, -0.1, 0], [0.08, 0.4, 0], [0.3, 0.85, 0]], (t) => 0.026 - t * 0.012, m, { seg: 12, radial: 6 }), tube([[0.3, 0.85, 0], [0.36, 0.5, 0], [0.38, 0.25, 0]], 0.012, e, { seg: 8, radial: 5 }), blob([0.035, 0.045, 0.035], f, { pos: [0.38, 0.22, 0] })];
    case 'pipa': return [slab([[0, 0.3], [0.2, 0.04], [0, -0.26], [-0.2, 0.04]], 0.03, m, { pos: [0.02, 0.62, 0], rot: [0, 90, 0], smooth: false, bevel: 0.01 }), slab([[0, 0.13], [0.09, 0.03], [0, -0.1], [-0.09, 0.03]], 0.04, f, { pos: [0.02, 0.63, 0], rot: [0, 90, 0], smooth: false, bevel: 0.01 }), tube([[0, 0, 0], [0.02, 0.36, 0]], 0.012, e, { seg: 4, radial: 5 }), tube([[0.02, 0.36, 0], [0.02, 0.24, 0.1], [0.02, 0.12, 0.02], [0.02, 0.02, 0.12]], 0.02, f, { seg: 12, radial: 5 })];
    case 'remo': return [cabo(0.75, 0.024, m, -0.3), blob([0.025, 0.13, 0.075], f, { pos: [0, 0.5, 0] }), blob([0.03, 0.03, 0.05], m, { pos: [0, -0.3, 0] })];
    case 'martelo': return [cabo(0.42, 0.024, m, -0.08), roundBox([0.11, 0.11, 0.2], 0.03, f, { pos: [0, 0.36, 0] })];
    case 'picareta': return [cabo(0.5, 0.024, m, -0.1), tube([[-0.2, 0.3, 0], [0, 0.41, 0], [0.2, 0.3, 0]], (t) => 0.014 + Math.sin(t * Math.PI) * 0.026, f, { seg: 10, radial: 6 })];
    case 'lamparina': return [lathe([[0.001, -0.17], [0.06, -0.17], [0.07, -0.1], [0.045, -0.03], [0.001, -0.02]], m, {}), blob([0.045, 0.06, 0.045], f, { pos: [0, -0.1, 0] }), ring(0.045, 0.012, e, { pos: [0, 0.01, 0] })];
    case 'cajado': return [cabo(0.95, 0.026, m, -0.4), blob([0.06, 0.07, 0.06], f, { pos: [0, 0.57, 0] }), pena(0.16, 0.04, f, [0, 0.44, 0.02], [150, 0, 0]), pena(0.14, 0.035, e, [0, 0.44, -0.02], [-150, 0, 0])];
    case 'puca': return [cabo(0.62, 0.02, m, -0.12), ring(0.12, 0.018, m, { pos: [0, 0.62, 0], rot: [0, 90, 0] }), blob([0.03, 0.1, 0.1], f, { pos: [-0.05, 0.6, 0] })];
    case 'chave': return [cabo(0.36, 0.028, m, -0.08), ring(0.055, 0.026, m, { pos: [0, 0.32, 0], rot: [0, 90, 0], arc: 270 })];
    case 'viola': return [blob([0.05, 0.12, 0.1], m, { pos: [0.06, 0.0, 0] }), blob([0.05, 0.09, 0.075], m, { pos: [0.06, 0.14, 0] }), blob([0.02, 0.035, 0.035], e, { pos: [0.1, 0.05, 0] }), tube([[0.06, 0.2, 0], [0.06, 0.48, 0]], 0.022, f, { seg: 4, radial: 6 }), blob([0.03, 0.045, 0.04], f, { pos: [0.06, 0.5, 0] })];
    case 'luneta': return [tube([[0, -0.05, 0], [0.1, 0.3, 0]], (t) => 0.03 + t * 0.022, m, { seg: 6, radial: 8 }), ring(0.05, 0.015, f, { pos: [0.1, 0.3, 0], rot: [90, 0, 0] }), ring(0.036, 0.012, f, { pos: [0.04, 0.09, 0], rot: [90, 0, 0] })];
    case 'gancho': return [cabo(0.7, 0.02, m, -0.15), tube([[0, 0.55, 0], [0.02, 0.63, 0], [0.09, 0.62, 0], [0.1, 0.54, 0]], 0.018, f, { seg: 10, radial: 6 })];
    case 'laco': return [ring(0.11, 0.022, m, { pos: [0.02, -0.08, 0], rot: [0, 90, 0] }), ring(0.09, 0.02, m, { pos: [0.04, -0.1, 0.02], rot: [10, 90, 0] })];
    case 'chicote': return [cabo(0.2, 0.024, e, -0.05), tube([[0, 0.15, 0], [0.1, 0.3, 0], [0.2, 0.15, 0], [0.26, -0.1, 0]], 0.016, m, { seg: 12, radial: 5 })];
    case 'prancha': return [slab([[0, 0.62], [0.13, 0.4], [0.15, 0], [0.11, -0.4], [0, -0.52], [-0.11, -0.4], [-0.15, 0], [-0.13, 0.4]], 0.035, m, { pos: [-0.02, 0.25, 0.07], rot: [0, 90, 0] }), blob([0.01, 0.45, 0.025], f, { pos: [-0.02, 0.25, 0.1] })];
    case 'berimbau': return [tube([[0, -0.4, 0], [0.1, 0.1, 0], [0, 0.62, 0]], 0.022, m, { seg: 12, radial: 6 }), tube([[0, -0.4, 0], [0, 0.62, 0]], 0.01, e, { seg: 3, radial: 4 }), blob([0.085, 0.085, 0.085], f, { pos: [-0.07, -0.2, 0] })];
    case 'bateia': return [lathe([[0.001, -0.07], [0.05, -0.065], [0.2, 0.0], [0.2, 0.02], [0.05, -0.035], [0.001, -0.04]], m, { pos: [0.1, 0, 0], rot: [0, 0, -20] }), blob([0.05, 0.02, 0.05], f, { pos: [0.09, -0.02, 0] })];
    case 'bilro': return [blob([0.1, 0.09, 0.13], m, { pos: [0.08, 0.02, 0] }), blob([0.085, 0.02, 0.1], f, { pos: [0.1, 0.09, 0] }), blob([0.015, 0.04, 0.015], e, { pos: [0.17, 0.02, 0.05] }), blob([0.015, 0.04, 0.015], e, { pos: [0.17, 0.02, -0.03] })];
    case 'livro': return [roundBox([0.07, 0.2, 0.16], 0.015, m, { pos: [0.05, 0.02, 0] }), roundBox([0.075, 0.17, 0.13], 0.01, f, { pos: [0.055, 0.02, 0.012] })];
    case 'maraca': return [cabo(0.2, 0.02, m, -0.05), blob([0.08, 0.09, 0.08], f, { pos: [0, 0.22, 0] }), pena(0.12, 0.03, m, [0, 0.29, 0], [0, 90, 0])];
    case 'cuia': return [blob([0.085, 0.08, 0.085], m, { pos: [0.02, -0.03, 0] }), ring(0.08, 0.02, f, { pos: [0.02, -0.02, 0], rot: [90, 0, 0] })];
    case 'prancheta': return [roundBox([0.03, 0.22, 0.17], 0.01, m, { pos: [0.06, 0.04, 0] }), roundBox([0.035, 0.17, 0.13], 0.008, f, { pos: [0.065, 0.03, 0] })];
    case 'bengala': return [cabo(0.34, 0.024, m, -0.3), tube([[0, 0.04, 0], [0.01, 0.08, 0], [0.07, 0.07, 0]], 0.024, m, { seg: 6, radial: 6 })];
    case 'lanca': return [cabo(1.0, 0.022, m, -0.4), pena(0.16, 0.05, f, [0, 0.58, 0], [0, 90, 0]), blob([0.03, 0.04, 0.04], e, { pos: [0, 0.55, 0] })];
    case 'arpao': return [cabo(0.9, 0.02, m, -0.35), spike(0.14, 0.035, f, { pos: [0, 0.55, 0] })];
    case 'facao': return [cabo(0.1, 0.026, e, -0.03), slab([[0, 0], [0.05, 0.02], [0.06, 0.34], [0, 0.4], [-0.02, 0.2]], 0.015, f, { pos: [0, 0.07, 0], bevel: 0.006 })];
    case 'corda': return [ring(0.1, 0.03, m, { pos: [0.02, -0.1, 0], rot: [0, 90, 0] })];
    case 'pinha': return [blob([0.08, 0.1, 0.08], m, { pos: [0.02, 0.0, 0], deform: [wobble(0.012, 40)] }), blob([0.03, 0.04, 0.03], f, { pos: [0.02, 0.1, 0] })];
    case 'chimarrao': return [blob([0.065, 0.075, 0.065], m, { pos: [0.02, 0.0, 0] }), tube([[0.02, 0.04, 0], [0.07, 0.17, 0]], 0.012, f, { seg: 3, radial: 5 }), ring(0.05, 0.014, f, { pos: [0.02, 0.06, 0], rot: [90, 0, 0] })];
    case 'cesta': return [lathe([[0.001, -0.16], [0.09, -0.16], [0.13, -0.04], [0.1, -0.04], [0.001, -0.08]], m, { seg: 14 }), ring(0.09, 0.016, m, { pos: [0, -0.02, 0], arc: 180 }), blob([0.07, 0.04, 0.07], f, { pos: [0, -0.05, 0] })];
    case 'bandeja': return [lathe([[0.001, 0.0], [0.16, 0.0], [0.17, 0.03], [0.001, 0.02]], m, { pos: [0.08, 0.02, 0] }), blob([0.05, 0.06, 0.05], f, { pos: [0.1, 0.08, 0.04] }), blob([0.04, 0.04, 0.04], f, { pos: [0.06, 0.07, -0.06] })];
  }
}
