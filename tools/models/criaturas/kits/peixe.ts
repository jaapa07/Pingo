/**
 * Anatomia PEIXE (piranha, pirarucu, tucunaré, cascudo, baiacu, arraia com corpo achatado...).
 * Paira sobre o chão; nadadeira caudal VERTICAL (ondula para os lados, em Ry).
 * Ossos: base → corpo → tronco → mandibula · tronco → cauda1 → cauda2 · tronco → nad_d/e · tronco → dorsal · tronco → anal.
 */
import { blob, slab, taper, type V2, type V3 } from '../../../render/sculpt';
import { novoRig, segmento, olhos, par, tom, type Kit } from './base';
import { movBase, somar, montar, ly, lr, lz, qy, qz, qr, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface PeixeP {
  /** semi-eixos do corpo [comprimento, altura, largura] (peixe é alto e estreito) */ corpo: V3;
  flutua: number;
  /** graus de inclinação (nariz para cima) */ ergue?: number;
  /** boca: tamanho da mandíbula e prognatismo (piranha > 0) */ boca?: { len: number; r: number; queixo?: number };
  /** pedúnculo + nadadeira caudal: `forma` furcada/redonda/lua */ cauda: { len: number; r: number; alt: number; larg: number; forma?: 'furcada' | 'redonda' | 'lua' };
  dorsal?: { alt: number; len: number; x?: number; espinhos?: number };
  anal?: { alt: number; len: number; x?: number };
  nad: { len: number; larg: number; x?: number; y?: number };
  olho: { r: number; pos: V3 };
  rampas: { corpo: number; barriga?: number; nadadeiras?: number; cauda?: number; boca?: number };
}
export type RefPeixe = 'dorso' | 'ventre' | 'testa' | 'boca' | 'flanco' | 'fimCauda';

export function peixe(p: PeixeP): Kit<RefPeixe> {
  const [cx, cy, cz] = p.corpo, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.corpo);
  const rig = novoRig(p.flutua);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, p.ergue ?? 0]);
  rig.add('tronco', blob([cx, cy, cz], t(R.corpo), { deform: [taper('x', -cx, cx, 0.6, 1.05)] }));
  if (R.barriga !== undefined) rig.add('tronco', blob([cx * 0.85, cy * 0.7, cz * 0.92], t(R.barriga), { pos: [cx * 0.08, -cy * 0.36, 0] }));
  const b = p.boca ?? { len: cx * 0.25, r: cy * 0.22 };
  rig.bone('mandibula', 'tronco', [cx * 0.72, -cy * 0.3, 0]);
  rig.add('mandibula', segmento([0, 0, 0], [b.len + (b.queixo ?? 0), -b.len * 0.1, 0], b.r, b.r * 0.75, t(R.boca ?? R.barriga ?? R.corpo)));
  olhos(rig, 'tronco', p.olho.r, p.olho.pos);
  // pedúnculo + caudal
  const c = p.cauda, sl = c.len;
  rig.bone('cauda1', 'tronco', [-cx * 0.8, 0, 0]);
  rig.add('cauda1', segmento([cx * 0.25, 0, 0], [-sl, 0, 0], c.r * 1.5, c.r, t(R.corpo), [(v) => { v.z *= 0.7; }]));
  rig.bone('cauda2', 'cauda1', [-sl, 0, 0]);
  const A = c.alt / 2, L = c.larg;
  const formas: Record<string, V2[]> = {
    furcada: [[0, c.r], [-L * 0.5, A * 0.8], [-L, A], [-L * 0.75, A * 0.35], [-L * 0.45, 0], [-L * 0.75, -A * 0.35], [-L, -A], [-L * 0.5, -A * 0.8], [0, -c.r]],
    redonda: [[0, c.r], [-L * 0.4, A * 0.85], [-L * 0.85, A * 0.7], [-L, 0], [-L * 0.85, -A * 0.7], [-L * 0.4, -A * 0.85], [0, -c.r]],
    lua: [[0, c.r], [-L * 0.6, A * 0.7], [-L, A], [-L * 0.6, A * 0.3], [-L * 0.5, 0], [-L * 0.6, -A * 0.3], [-L, -A], [-L * 0.6, -A * 0.7], [0, -c.r]],
  };
  rig.add('cauda2', slab(formas[c.forma ?? 'furcada'], cz * 0.22, t(R.cauda ?? R.nadadeiras)));
  if (p.dorsal) {
    const d = p.dorsal, n = d.espinhos ?? 0;
    rig.bone('dorsal', 'tronco', [cx * (d.x ?? -0.05), cy * 0.9, 0]);
    const pts: V2[] = [[d.len * 0.5, 0], [d.len * 0.3, d.alt], ...Array.from({ length: n }, (_, i) => [d.len * (0.3 - (0.7 * (i + 1)) / (n + 1)), d.alt * (i % 2 ? 0.95 : 0.7)] as V2), [-d.len * 0.5, d.alt * 0.45], [-d.len * 0.5, 0]];
    rig.add('dorsal', slab(pts, cz * 0.2, t(R.nadadeiras), { smooth: n === 0 }));
  }
  if (p.anal) {
    const d = p.anal;
    rig.bone('anal', 'tronco', [cx * (d.x ?? -0.4), -cy * 0.85, 0]);
    rig.add('anal', slab([[d.len * 0.5, 0], [d.len * 0.1, -d.alt], [-d.len * 0.5, -d.alt * 0.5], [-d.len * 0.5, 0]], cz * 0.2, t(R.nadadeiras)));
  }
  par((l, s) => {
    rig.bone('nad_' + l, 'tronco', [cx * (p.nad.x ?? 0.25), cy * (p.nad.y ?? -0.35), cz * 0.9 * s], [0, 35 * s, 20]);
    rig.add('nad_' + l, blob([p.nad.len * 0.5, p.nad.larg * 0.5, cz * 0.12], t(R.nadadeiras), { pos: [-p.nad.len * 0.45, 0, 0], seg: 14, deform: [taper('x', -p.nad.len * 0.5, p.nad.len * 0.5, 1.2, 0.5)] }));
  });
  return { rig, ref: { dorso: [0, cy, 0], ventre: [0, -cy, 0], testa: [cx * 0.7, cy * 0.6, 0], boca: [cx, -cy * 0.2, 0], flanco: [0, 0, cz], fimCauda: [-c.larg, 0, 0] } };
}

export interface AnimPeixeP extends BaseP { flutua: number; mapa?: MapaChibi }

export function animsPeixe(o: AnimPeixeP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const nd = (q: typeof qr, v: number[]) => ({ nad_d: q(v.map((a) => [0, a, 0] as V3)), nad_e: q(v.map((a) => [0, -a, 0] as V3)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { tronco: qz([24, 8, -10, 3, 0]), cauda1: qy([30, -24, 16, -6, 0]), cauda2: qy([30, -30, 20, -8, 0]), ...nd(qr, [40, 10, 26, 8, 0]) },
    idle: { cauda1: ly([0, 12, 0, -12]), cauda2: ly([-10, 8, 10, -8]), ...nd(lr, [0, 14, 22, 8]), '?dorsal': lz([0, -3, -5, -2]), mandibula: lz([0, -4, -6, -2]) },
    fisico: { tronco: qz([8, 14, -14, -6, 0]), mandibula: qz([-10, -34, 6, 0, 0]), cauda1: qy([-20, -34, 30, 12, 0]), cauda2: qy([-20, -30, 34, 12, 0]), ...nd(qr, [20, 36, -10, 0, 0]) },
    especial: { tronco: qz([-6, -12, -12, 20, 8, 0]), mandibula: qz([0, 0, 0, -36, -14, 0]), cauda1: qy([14, -14, 14, -24, 10, 0]), cauda2: qy([18, -18, 18, -28, 12, 0]), ...nd(qr, [10, 30, 36, 60, 24, 0]), '?dorsal': qz([0, 8, 10, -14, -5, 0]) },
    dano: { tronco: qz([14, 5, 0]), cauda1: qy([-28, -10, 0]), cauda2: qy([-24, -8, 0]), ...nd(qr, [44, 16, 0]), mandibula: qz([-20, -8, 0]) },
    desmaio: { tronco: qr([[0, 0, 6], [20, 0, -4], [60, 0, -8], [88, 0, -6], [84, 0, -6]]), cauda1: qy([-8, 4, 10, 14, 12]), ...nd(qr, [10, 24, 40, 56, 52]), mandibula: qz([0, -6, -12, -18, -16]) },
    status: { tronco: lr([[8, 0, -4], [0, 0, -6], [-8, 0, -4], [0, 0, -2]]), cauda1: ly([6, 0, -6, 0]), ...nd(lr, [8, 12, 8, 4]) },
    andar: { cauda1: ly([-18, 0, 18, 0]), cauda2: ly([-24, -12, 24, 12]), tronco: lr([[0, 5, 0], [0, 0, 0], [0, -5, 0], [0, 0, 0]]), ...nd(lr, [0, 16, 24, 8]) },
    parado: { cauda1: ly([0, 12]), cauda2: ly([0, 14]), ...nd(lr, [0, 14]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 0.9, larg: 1.6, cabeca: 1, frontal: 1.3, ...o.mapa });
}
