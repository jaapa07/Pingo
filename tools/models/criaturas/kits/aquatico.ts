/**
 * Anatomia MAMÍFERO AQUÁTICO (boto, peixe-boi, ariranha nadando, baleia...). Paira sobre o chão como
 * se nadasse; nadadeira caudal HORIZONTAL (ondula para cima e para baixo).
 * Ossos: base → corpo → tronco (inclinado) → cabeca → mandibula · tronco → cauda1 → cauda2 → lobo_d/e ·
 *        tronco → nad_d/e · tronco → dorsal.
 */
import { blob, taper, type V3 } from '../../../render/sculpt';
import { novoRig, segmento, olhos, par, tom, type Kit } from './base';
import { movBase, somar, montar, lz, lr, qz, qr, qp, lp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface AquaticoP {
  /** semi-eixos do tronco [comprimento, altura, largura] */ tronco: V3;
  /** altura do centro do corpo sobre o chão */ flutua: number;
  /** graus que a cabeça levanta em repouso */ ergue?: number;
  /** cabeça/melão: semi-eixos e avanço (fração do tronco) */ cabeca: { r: V3; x?: number; y?: number; /** graus que a cabeça gira em relação ao tronco (− = abaixa o bico) */ gira?: number };
  /** rostro (bico): comprimento e raios; 0 = focinho rombudo */ rostro?: { len: number; r0: number; r1: number; cai?: number; y?: number };
  /** pedúnculo da cauda (2 ossos) */ cauda: { len: number; r0: number; r1: number; cai?: number };
  /** lobos da nadadeira caudal [comprimento, largura] */ lobos: { len: number; larg: number; abre?: number };
  /** nadadeiras peitorais */ nad: { len: number; larg: number; esp?: number; x?: number; cai?: number; abre?: number };
  /** dorsal: altura e base; null = sem dorsal */ dorsal?: { alt: number; base: number; x?: number } | null;
  olho: { r: number; pos: V3 };
  rampas: { pele: number; barriga?: number; cabeca?: number; rostro?: number; cauda?: number; lobos?: number; nad?: number; dorsal?: number };
}
export type RefAquatico = 'dorso' | 'melao' | 'respiro' | 'pontaRostro' | 'ventre' | 'pontaNad' | 'fimCauda' | 'nuca';

export function aquatico(p: AquaticoP): Kit<RefAquatico> {
  const [tx, ty, tz] = p.tronco, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pele);
  const rig = novoRig(p.flutua);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, p.ergue ?? 0]);
  rig.add('tronco', blob([tx, ty, tz], t(R.pele), { deform: [taper('x', -tx, tx, 0.72, 1.08)] }));
  if (R.barriga !== undefined) rig.add('tronco', blob([tx * 0.86, ty * 0.75, tz * 0.9], t(R.barriga), { pos: [tx * 0.08, -ty * 0.34, 0] }));
  // cabeça com melão e rostro
  const [hx, hy, hz] = p.cabeca.r;
  rig.bone('cabeca', 'tronco', [tx * (p.cabeca.x ?? 0.72), ty * (p.cabeca.y ?? 0.1), 0], [0, 0, p.cabeca.gira ?? 0]);
  rig.add('cabeca', blob([hx, hy, hz], t(R.cabeca)));
  let ponta: V3 = [hx, -hy * 0.2, 0];
  if (p.rostro) {
    const c = ((p.rostro.cai ?? 8) * Math.PI) / 180, y0 = hy * (p.rostro.y ?? -0.38), b0: V3 = [hx * 0.62, y0, 0];
    ponta = [b0[0] + Math.cos(c) * p.rostro.len, y0 - Math.sin(c) * p.rostro.len, 0];
    rig.add('cabeca', segmento(b0, ponta, p.rostro.r0, p.rostro.r1, t(R.rostro ?? R.cabeca)));
    rig.bone('mandibula', 'cabeca', [b0[0], y0 - p.rostro.r0 * 0.7, 0]);
    rig.add('mandibula', segmento([0, 0, 0], [Math.cos(c) * p.rostro.len * 0.9, -Math.sin(c) * p.rostro.len * 0.9, 0], p.rostro.r0 * 0.7, p.rostro.r1 * 0.8, t(R.barriga ?? R.rostro ?? R.cabeca)));
  }
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  // pedúnculo em 2 ossos + lobos horizontais
  const sl = p.cauda.len / 2, rm = (p.cauda.r0 + p.cauda.r1) / 2, cai = p.cauda.cai ?? 14;
  rig.bone('cauda1', 'tronco', [-tx * 0.78, 0, 0], [0, 0, cai]);
  rig.add('cauda1', segmento([tx * 0.2, 0, 0], [-sl, 0, 0], p.cauda.r0 * 1.15, rm, t(R.cauda)));
  rig.bone('cauda2', 'cauda1', [-sl, 0, 0], [0, 0, cai]);
  rig.add('cauda2', segmento([0, 0, 0], [-sl, 0, 0], rm, p.cauda.r1, t(R.cauda)));
  par((l, s) => {
    rig.bone('lobo_' + l, 'cauda2', [-sl * 0.9, 0, 0], [0, (p.lobos.abre ?? 38) * s, 0]);
    rig.add('lobo_' + l, blob([p.lobos.len * 0.5, p.cauda.r1 * 0.7, p.lobos.larg * 0.5], t(R.lobos ?? R.cauda), { pos: [-p.lobos.len * 0.42, 0, 0], seg: 18, deform: [taper('x', -p.lobos.len * 0.5, p.lobos.len * 0.5, 0.45, 1)] }));
  });
  // peitorais
  const n = p.nad;
  par((l, s) => {
    rig.bone('nad_' + l, 'tronco', [tx * (n.x ?? 0.3), -ty * 0.45, tz * 0.78 * s], [(n.abre ?? 40) * -s, 0, n.cai ?? 30]);
    rig.add('nad_' + l, blob([n.larg * 0.5, n.len * 0.5, n.esp ?? n.larg * 0.22], t(R.nad), { pos: [-n.larg * 0.15, -n.len * 0.42, 0], seg: 18, deform: [taper('y', -n.len * 0.5, n.len * 0.5, 0.6, 1)] }));
  });
  if (p.dorsal) {
    const dz = p.dorsal;
    rig.bone('dorsal', 'tronco', [tx * (dz.x ?? -0.1), ty * 0.9, 0]);
    rig.add('dorsal', blob([dz.base * 0.5, dz.alt, tz * 0.16], t(R.dorsal), { pos: [-dz.base * 0.1, 0, 0], seg: 16, deform: [(v) => { if (v.y > 0) v.x -= v.y * 0.5; }] }));
  }
  return {
    rig,
    ref: {
      dorso: [0, ty, 0], melao: [hx * 0.35, hy * 0.85, 0], respiro: [-hx * 0.2, hy * 0.98, 0], pontaRostro: ponta, ventre: [0, -ty, 0],
      pontaNad: [-n.larg * 0.15, -n.len * 0.9, 0], fimCauda: [-sl, 0, 0], nuca: [-hx * 0.8, hy * 0.5, 0],
    },
  };
}

export interface AnimAquaP extends BaseP { /** altura de flutuação (obrigatória aqui) */ flutua: number; mapa?: MapaChibi }

export function animsAquatico(o: AnimAquaP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const nd = (q: typeof qr, v: number[]) => ({ nad_d: q(v.map((a) => [-a, 0, a * 0.4] as V3)), nad_e: q(v.map((a) => [a, 0, a * 0.4] as V3)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { tronco: qz([30, 10, -14, 4, 0]), cauda1: qz([-30, 20, 26, -8, 0]), cauda2: qz([-30, 30, 20, -10, 0]), ...nd(qr, [40, 10, 30, 8, 0]) },
    idle: { cauda1: lz([0, 8, 12, 2]), cauda2: lz([-6, 6, 16, 8]), cabeca: lz([0, -2, -4, -1]), ...nd(lr, [0, 10, 18, 6]) },
    fisico: { tronco: qz([10, 18, -22, -10, 0]), cabeca: qz([6, 10, -12, -4, 0]), cauda1: qz([-14, -24, 30, 12, 0]), cauda2: qz([-10, -20, 30, 10, 0]), ...nd(qr, [20, 34, -10, 0, 0]) },
    especial: { tronco: qz([-8, -14, -14, 24, 10, 0]), cabeca: qz([0, -6, -6, 14, 4, 0]), '?mandibula': qz([0, 0, 0, -24, -10, 0]), cauda1: qz([10, 22, 26, -28, -10, 0]), cauda2: qz([10, 26, 30, -30, -10, 0]), ...nd(qr, [10, 30, 36, 60, 24, 0]) },
    dano: { tronco: qz([16, 6, 0]), cauda1: qz([-26, -10, 0]), cauda2: qz([-20, -8, 0]), ...nd(qr, [44, 16, 0]) },
    desmaio: { tronco: qr([[0, 0, 8], [20, 0, -6], [70, 0, -16], [150, 0, -22], [146, 0, -20]]), cauda1: qz([-8, 4, 10, 14, 12]), cauda2: qz([-8, 6, 12, 16, 14]), ...nd(qr, [10, 24, 40, 56, 52]) },
    status: { tronco: lr([[6, 0, -4], [0, 0, -6], [-6, 0, -4], [0, 0, -2]]), cauda1: lz([10, 12, 10, 8]), ...nd(lr, [8, 12, 8, 4]) },
    andar: { cauda1: lz([-12, 4, 14, 0]), cauda2: lz([-18, -6, 18, 10]), tronco: lz([3, 0, -3, 0]), ...nd(lr, [0, 16, 24, 8]) },
    parado: { cauda1: lz([0, 10]), cauda2: lz([0, 12]), ...nd(lr, [0, 14]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 0.85, larg: 1.25, cabeca: 1.15, frontal: 1.2, ...o.mapa });
}

