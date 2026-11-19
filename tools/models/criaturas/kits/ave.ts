/**
 * Anatomia AVE (pardal, bem-te-vi, gavião, tucano, coruja, garça, arara...). Pousada, de pé.
 * Ossos: base → corpo → pescoco → cabeca → mandibula · corpo → asa_d/e → asa2_d/e · corpo → cauda1 ·
 *        corpo → perna_d/e → canela_d/e.
 * Asas: Rz = caída, Ry = abrir (D: +, E: −), Rx = bater (D: − sobe, E: + sobe).
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, perna, segmento, olhos, par, tom, type Kit } from './base';
import { bico, garra, pena } from './partes';
import { movBase, somar, montar, lz, lr, ls, qz, qr, qp, lp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface AveP {
  /** semi-eixos do corpo [comprimento, altura, largura] */ corpo: V3;
  /** graus que o peito levanta (0 = horizontal, 50 = bem empinada) */ ergue: number;
  pescoco: { len: number; ang: number; r: number };
  cabeca: V3;
  bico: { len: number; r: number; gancho?: number; /** altura na cabeça (fração) */ y?: number; achata?: number; inferior?: number };
  asa: { len: number; larg: number; esp?: number; /** caída em repouso (graus) */ cai?: number; /** ponta (primárias): fração do comprimento */ ponta?: number };
  cauda: { len: number; larg: number; /** graus acima da horizontal */ ang?: number; penas?: number; abre?: number };
  pernas: { alt: number; r: number; z?: number; x?: number; dedo?: number };
  olho: { r: number; pos: V3 };
  rampas: { corpo: number; peito?: number; cabeca?: number; asa?: number; asaPonta?: number; cauda?: number; bico: number; perna: number };
}
export type RefAve = 'dorso' | 'peito' | 'topo' | 'testa' | 'nuca' | 'bochecha' | 'pontaBico' | 'ombro' | 'pontaCauda';

export function ave(p: AveP): Kit<RefAve> {
  const [cx, cy, cz] = p.corpo, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.corpo);
  const e = (p.ergue * Math.PI) / 180;
  const rig = novoRig(p.pernas.alt + cy * 0.75);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, p.ergue]);
  rig.add('tronco', blob([cx, cy, cz], t(R.corpo), { deform: [(v) => { if (v.x < 0) { const k = 1 + (v.x / cx) * 0.35; v.y *= k; v.z *= k; } }] }));
  if (R.peito !== undefined) rig.add('tronco', blob([cx * 0.72, cy * 0.8, cz * 0.88], t(R.peito), { pos: [cx * 0.3, -cy * 0.26, 0] }));
  // pescoço e cabeça (fora do osso inclinado, para a cabeça ficar nivelada)
  const pp: V3 = [Math.cos(e) * cx * 0.62 - Math.sin(e) * cy * 0.3, Math.sin(e) * cx * 0.62 + Math.cos(e) * cy * 0.3, 0];
  const a = (p.pescoco.ang * Math.PI) / 180, fim: V3 = [Math.cos(a) * p.pescoco.len, Math.sin(a) * p.pescoco.len, 0];
  rig.bone('pescoco', 'corpo', pp);
  rig.add('pescoco', segmento([-fim[0] * 0.4, -fim[1] * 0.4, 0], fim, p.pescoco.r * 1.2, p.pescoco.r, t(R.cabeca ?? R.corpo)));
  rig.bone('cabeca', 'pescoco', fim);
  const [hx, hy, hz] = p.cabeca;
  rig.add('cabeca', blob([hx, hy, hz], t(R.cabeca ?? R.corpo)));
  const by = hy * (p.bico.y ?? -0.12);
  rig.add('cabeca', bico(p.bico.len, p.bico.r, t(R.bico), { pos: [hx * 0.8, by, 0], gancho: p.bico.gancho, achata: p.bico.achata ?? 0.85 }));
  rig.bone('mandibula', 'cabeca', [hx * 0.8, by - p.bico.r * 0.45, 0]);
  rig.add('mandibula', bico(p.bico.len * (p.bico.inferior ?? 0.72), p.bico.r * 0.62, tom(R.bico, { vies: -1 }), { achata: p.bico.achata ?? 0.85 }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  // asas dobradas ao lado do corpo
  const esp = p.asa.esp ?? cz * 0.22, cai = p.asa.cai ?? 28, pt = p.asa.ponta ?? 0.55;
  const ombro: V3 = [Math.cos(e) * cx * 0.3 - Math.sin(e) * cy * 0.25, Math.sin(e) * cx * 0.3 + Math.cos(e) * cy * 0.25, cz * 0.86];
  par((l, s) => {
    rig.bone('asa_' + l, 'corpo', [ombro[0], ombro[1], ombro[2] * s], [0, 0, cai + p.ergue * 0.5]);
    rig.add('asa_' + l, blob([p.asa.len * 0.5, p.asa.larg * 0.5, esp], t(R.asa), { pos: [-p.asa.len * 0.42, -p.asa.larg * 0.12, esp * 0.3 * s], seg: 20 }));
    rig.bone('asa2_' + l, 'asa_' + l, [-p.asa.len * 0.72, -p.asa.larg * 0.1, esp * 0.2 * s]);
    rig.add('asa2_' + l,
      pena(p.asa.len * pt, p.asa.larg * 0.62, t(R.asaPonta ?? R.asa), { esp: esp * 0.9, pos: [0, 0, 0] }),
      pena(p.asa.len * pt * 0.75, p.asa.larg * 0.5, t(R.asaPonta ?? R.asa), { esp: esp * 0.9, pos: [p.asa.len * 0.12, -p.asa.larg * 0.3, 0], rot: [0, 0, 14] }));
  });
  // cauda em leque
  const n = p.cauda.penas ?? 3, ab = p.cauda.abre ?? 16;
  rig.bone('cauda1', 'corpo', [-Math.cos(e) * cx * 0.85, -Math.sin(e) * cx * 0.85, 0], [0, 0, -(p.cauda.ang ?? 10)]);
  for (let i = 0; i < n; i++) {
    const g = n === 1 ? 0 : -ab + (2 * ab * i) / (n - 1);
    rig.add('cauda1', pena(p.cauda.len * (1 - Math.abs(g) / 90), p.cauda.larg, t(R.cauda), { esp: p.cauda.larg * 0.3, rot: [90, g, 0], pos: [cx * 0.1, 0, 0] }));
  }
  // pernas finas com 3 dedos
  const d = p.pernas.dedo ?? p.pernas.r * 2.6;
  par((l, s) => {
    const c = perna(rig, 'perna_' + l, 'corpo', [cx * (p.pernas.x ?? -0.05), -cy * 0.7, cz * (p.pernas.z ?? 0.5) * s],
      { alt: p.pernas.alt + cy * 0.05, r0: p.pernas.r * 1.8, r1: p.pernas.r, r2: p.pernas.r, dobra: -24, coxa: 0.42, pe: null, mCoxa: t(R.corpo), mCanela: t(R.perna) });
    const y = -(p.pernas.alt + cy * 0.05) * 0.58 + p.pernas.r * 0.4;
    for (const g of [-32, 0, 32]) rig.add(c, garra(d, p.pernas.r * 0.95, t(R.perna), { pos: [-(p.pernas.alt) * 0.06, y, 0], rot: [0, g, 0], curva: 0.12 }));
  });
  return {
    rig,
    ref: {
      dorso: [-Math.sin(e) * cy, Math.cos(e) * cy, 0], peito: [Math.cos(e) * cx * 0.8, Math.sin(e) * cx * 0.5 - cy * 0.3, 0],
      topo: [0, hy, 0], testa: [hx * 0.7, hy * 0.65, 0], nuca: [-hx * 0.8, hy * 0.4, 0], bochecha: [hx * 0.3, -hy * 0.3, hz * 0.9],
      pontaBico: [hx * 0.8 + p.bico.len, by, 0], ombro, pontaCauda: [-p.cauda.len, 0, 0],
    },
  };
}

export interface AnimAveP extends BaseP { /** altura das pernas: quanto arria no desmaio */ hPerna: number; mapa?: MapaChibi }

export function animsAve(o: AnimAveP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const h = o.hPerna;
  // asa(abrir, bater): devolve as rotações [x, y, z] dos dois lados
  const D = (ab: number, bt: number): V3 => [-bt, ab, 0], E = (ab: number, bt: number): V3 => [bt, -ab, 0];
  const asas = (q: typeof qr, v: [number, number][]) => ({ asa_d: q(v.map(([a, b]) => D(a, b))), asa_e: q(v.map(([a, b]) => E(a, b))) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...asas(qr, [[70, 40], [80, -10], [60, 30], [20, 5], [0, 0]]), pescoco: qz([10, -6, -12, 4, 0]), cauda1: qz([-20, 10, 18, -6, 0]) },
    idle: {
      pescoco: lz([0, -2, -3, 0]), cabeca: lr([[0, 0, 0], [0, 0, 0], [0, 0, 0], [14, -10, 0]]),
      cauda1: lz([0, 0, -10, 4]), ...asas(lr, [[0, 0], [3, 0], [6, 2], [2, 0]]),
    },
    fisico: {
      pescoco: qz([14, 22, -30, -14, 0]), cabeca: qz([6, 12, -18, -6, 0]), mandibula: qz([0, -14, -22, -6, 0]),
      ...asas(qr, [[20, 10], [40, 30], [30, -10], [12, 0], [0, 0]]), cauda1: qz([8, 14, -22, -8, 0]),
      perna_d: qz([-8, -14, 22, 8, 0]), perna_e: qz([-4, -8, 12, 4, 0]),
    },
    especial: {
      ...asas(qr, [[30, 10], [60, 45], [75, 60], [85, -25], [60, 20], [0, 0]]),
      pescoco: qz([-6, -10, -12, 16, 6, 0]), mandibula: qz([0, 0, 0, -26, -10, 0]), cauda1: qz([0, 10, 14, -24, -8, 0]),
    },
    dano: { pescoco: qz([18, 6, 0]), ...asas(qr, [[55, 30], [20, 8], [0, 0]]), cauda1: qz([20, 8, 0]), mandibula: qz([-18, -6, 0]) },
    desmaio: {
      corpo: qp([[0, 0.02 * h, 0], [0, 0, 0], [0, -0.4 * h, 0], [0, -0.85 * h, 0], [0, -0.8 * h, 0]]),
      perna_d: qz([0, 0, 30, 70, 66]), perna_e: qz([0, 0, 40, 80, 76]),
      pescoco: qz([8, -8, -22, -36, -32]), ...asas(qr, [[10, 0], [30, 10], [50, 4], [62, -6], [60, -4]]), cauda1: qz([0, 6, 12, 18, 16]),
    },
    status: { pescoco: lz([-10, -13, -10, -7]), cabeca: lr([[8, 0, -6], [0, 0, -8], [-8, 0, -6], [0, 0, -4]]), ...asas(lr, [[6, 0], [8, 0], [6, 0], [4, 0]]) },
    andar: {
      perna_d: lz([26, 0, -26, 0]), perna_e: lz([-26, 0, 26, 0]), canela_d: lz([0, 0, 0, -30]), canela_e: lz([0, -30, 0, 0]),
      pescoco: lz([4, -4, 4, -4]), cauda1: lz([0, -6, 0, -6]), ...asas(lr, [[4, 0], [10, 4], [4, 0], [10, 4]]),
    },
    parado: { pescoco: lz([0, -3]), cauda1: lz([0, -8]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 0.9, larg: 1.15, cabeca: 1.15, frontal: 1.1, ...o.mapa });
}

