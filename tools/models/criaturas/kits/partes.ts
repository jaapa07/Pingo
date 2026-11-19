/**
 * Peças de enfeite reutilizáveis (traços únicos): folhas, chamas, espuma, penas, tufos, listras, garras.
 * Todas devolvem malhas prontas para `rig.add(osso, ...)`. Formas volumosas de propósito: detalhe fino
 * (menos de ~1,5 px no sprite) some ou vira ruído na pixelização.
 */
import { blob, lathe, slab, tube, ring, bend, type V2, type V3, type PartOpts } from '../../../render/sculpt';
import type { Mat } from './base';

/** Folha chata com ponta, nascendo na origem e crescendo em +Y. `curva` dobra a folha (graus). */
export function folha(len: number, larg: number, mat: Mat, o: PartOpts & { curva?: number; esp?: number } = {}) {
  const w = larg / 2;
  const pts: V2[] = [[0, 0], [w * 0.8, len * 0.22], [w, len * 0.48], [w * 0.55, len * 0.8], [0, len], [-w * 0.55, len * 0.8], [-w, len * 0.48], [-w * 0.8, len * 0.22]];
  return slab(pts, o.esp ?? larg * 0.22, mat, { ...o, deform: [...(o.curva ? [bend(o.curva, len)] : []), ...(o.deform ?? [])] });
}

/** Folha gordinha em 3D (lê bem de qualquer câmera): gota achatada crescendo em +Y. */
export function folha3d(len: number, larg: number, mat: Mat, o: PartOpts & { curva?: number; esp?: number } = {}) {
  const w = larg / 2;
  const perfil: V2[] = [[0.001, 0], [w * 0.75, len * 0.2], [w, len * 0.45], [w * 0.7, len * 0.75], [w * 0.25, len * 0.94], [0.001, len]];
  const g = lathe(perfil, mat, { seg: 14, ...o, deform: [(p) => { p.z *= (o.esp ?? 0.4); }, ...(o.curva ? [bend(o.curva, len)] : []), ...(o.deform ?? [])] });
  return g;
}

/** Língua de fogo em 3D: gota com a ponta puxada, crescendo em +Y. `curva` inclina a ponta para +X (graus). */
export function chama(alt: number, r: number, mat: Mat, o: PartOpts & { curva?: number } = {}) {
  const perfil: V2[] = [[0.001, -r * 0.55], [r * 0.7, -r * 0.3], [r, alt * 0.14], [r * 0.82, alt * 0.38], [r * 0.45, alt * 0.66], [r * 0.16, alt * 0.88], [0.001, alt]];
  return lathe(perfil, mat, { seg: 14, ...o, deform: [...(o.curva ? [bend(-o.curva, alt)] : []), ...(o.deform ?? [])] });
}

/**
 * Chama dupla: língua externa + miolo claro. O miolo é mais baixo e mais "gordo" em Z, então aflora
 * dos dois lados e aparece como núcleo claro nas câmeras de batalha. Devolve as duas malhas.
 */
export function chamaDupla(alt: number, r: number, fora: Mat, dentro: Mat, o: PartOpts & { curva?: number } = {}) {
  const a = chama(alt, r, fora, o);
  const b = chama(alt * 0.6, r * 0.62, dentro, { ...o, scale: [1, 1, 1.95] });
  return [a, b];
}

/** Floco de espuma: cacho de 3 bolhas achatadas. `r` = raio da bolha maior. */
export function espuma(r: number, mat: Mat, o: PartOpts = {}) {
  const g = blob([r, r * 0.85, r], mat, { ...o, seg: 14 });
  g.add(blob([r * 0.7, r * 0.62, r * 0.7], mat, { pos: [r * 0.75, r * 0.2, r * 0.25], seg: 12 }));
  g.add(blob([r * 0.6, r * 0.55, r * 0.6], mat, { pos: [-r * 0.6, r * 0.3, -r * 0.35], seg: 12 }));
  return g;
}

/** Pena/lâmina: placa alongada de ponta arredondada, da origem para −X (cauda, asa). */
export function pena(len: number, larg: number, mat: Mat, o: PartOpts & { esp?: number; ponta?: number } = {}) {
  const w = larg / 2, pt = o.ponta ?? 0.6;
  const pts: V2[] = [[0, w * 0.6], [-len * 0.5, w], [-len * 0.9, w * pt], [-len, 0], [-len * 0.9, -w * pt], [-len * 0.5, -w], [0, -w * 0.6]];
  return slab(pts, o.esp ?? larg * 0.18, mat, o);
}

/** Tufo: leque de `n` gomos pontudos em volta do eixo +Y (cristas, topetes, pincel de cauda). */
export function tufo(n: number, alt: number, r: number, mat: Mat, o: PartOpts & { abre?: number } = {}) {
  const g = blob([r, r * 0.8, r], mat, { ...o, seg: 12 });
  const abre = o.abre ?? 28;
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? 0 : -abre + (2 * abre * i) / (n - 1);
    g.add(lathe([[r * 0.75, 0], [r * 0.6, alt * 0.45], [r * 0.25, alt * 0.85], [0.001, alt]], mat, { seg: 10, rot: [0, 0, -a] }));
  }
  return g;
}

/** Listra/pulseira: anel em volta de um membro vertical (eixo Y). */
export function listra(raio: number, esp: number, mat: Mat, o: PartOpts = {}) {
  return ring(raio, esp, mat, { ...o, rot: o.rot ?? [90, 0, 0] });
}

/** Garra/unha curva apontando para +X. */
export function garra(len: number, r: number, mat: Mat, o: PartOpts & { curva?: number } = {}) {
  const c = o.curva ?? 0.35;
  return tube([[0, 0, 0], [len * 0.5, -len * c * 0.3, 0], [len, -len * c, 0]], (t) => r * (1 - t * 0.85), mat, { seg: 8, radial: 8, ...o });
}

/** Bico/cone de torno apontando para +X, base na origem. `gancho` curva a ponta para baixo (graus). */
export function bico(len: number, r: number, mat: Mat, o: PartOpts & { gancho?: number; achata?: number } = {}) {
  const perfil: V2[] = [[r, 0], [r * 0.82, len * 0.3], [r * 0.5, len * 0.68], [r * 0.2, len * 0.92], [0.001, len]];
  const rot: V3 = o.rot ?? [0, 0, -90];
  return lathe(perfil, mat, { seg: 14, ...o, rot, deform: [(p) => { p.z *= (o.achata ?? 1); }, ...(o.gancho ? [bend(-o.gancho, len)] : []), ...(o.deform ?? [])] });
}

/** Gota/pinta chapada colada numa superfície (pintas, sardas, rosetas): blob bem achatado. */
export function pinta(r: number, mat: Mat, pos: V3, rot: V3 = [0, 0, 0]) {
  return blob([r, r, r * 0.35], mat, { pos, rot, seg: 10, castShadow: false });
}
