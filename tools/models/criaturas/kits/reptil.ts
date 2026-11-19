/**
 * Anatomia RÉPTIL: `lagarto()` (teiú, calango, iguana, jacaré — corpo baixo, patas abertas, cauda longa) e
 * `tartaruga()` (jabuti, cágado, tartaruga-marinha — casco, cabeça retrátil, patas ou nadadeiras).
 * Os ossos das patas têm os mesmos nomes do quadrúpede (perna_fd/fe/td/te → canela_*), então as animações
 * partem das do quadrúpede e somam o rebolado lateral, a mordida e o recolher no casco.
 * Lagarto: base → corpo → pescoco → cabeca → mandibula · corpo → cauda1..N · corpo → pernas.
 * Tartaruga: base → corpo (casco) → pescoco → cabeca → mandibula · corpo → cauda1 · corpo → pernas.
 */
import { blob, lathe, taper, type V3 } from '../../../render/sculpt';
import { novoRig, membro2, cauda, segmento, olhos, par, tom, calota, type Kit, type CaudaP } from './base';
import { animsQuadrupede, type AnimQuadP } from './quadrupede';
import { ly, lz, lr, qy, qz, qp, unirExtras, type Mov, type Faixas, type AnimsCriatura } from './animacao';

export interface LagartoP {
  /** semi-eixos do tronco (baixo e comprido) */ tronco: V3;
  /** altura da barriga ao chão */ alt: number;
  pernas: { abre: number; r: number; pe?: number };
  pescoco: { len: number; r: number; ang?: number };
  /** cabeça [comp, alt, larg]; `focinho` alonga as mandíbulas (jacaré) */ cabeca: V3; focinho?: number;
  cauda: Omit<CaudaP, 'mat' | 'matPonta'>;
  /** crista dorsal: nº de pontas e altura (iguana) / fileira de placas (jacaré) */ crista?: { n: number; alt: number };
  olho: { r: number; pos: V3 };
  rampas: { pele: number; barriga?: number; pernas?: number; cabeca?: number; cauda?: number; crista?: number; dentro?: number };
}
export type RefLagarto = 'dorso' | 'topo' | 'focinho' | 'garupa' | 'papada';

export function lagarto(p: LagartoP): Kit<RefLagarto> {
  const [tx, ty, tz] = p.tronco, [hx, hy, hz] = p.cabeca, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pele);
  const rig = novoRig(p.alt + ty);
  rig.add('corpo', blob([tx, ty, tz], t(R.pele), { deform: [taper('x', -tx, tx, 0.8, 1)] }));
  if (R.barriga !== undefined) rig.add('corpo', blob([tx * 0.9, ty * 0.7, tz * 0.9], t(R.barriga), { pos: [0, -ty * 0.4, 0] }));
  // patas abertas: braço sai para o lado, antebraço desce
  const chao = -(p.alt + ty * 0.7), pe = p.pernas.pe ?? p.pernas.r * 1.5;
  par((l, s) => {
    for (const [q, fx, dx] of [['f', 0.6, 0.25], ['t', -0.6, -0.2]] as const) {
      const c = membro2(rig, `perna_${q}${l}`, `canela_${q}${l}`, 'corpo', [tx * fx, -ty * 0.3, tz * 0.8 * s],
        [p.pernas.abre * dx, p.pernas.r, p.pernas.abre * 0.7 * s], [p.pernas.abre * dx * 0.6, chao - p.pernas.r + ty * 0.3 + pe * 0.4, p.pernas.abre * 0.3 * s],
        [p.pernas.r * 1.1, p.pernas.r, p.pernas.r * 0.8], t(R.pernas));
      rig.add(c, blob([pe, pe * 0.4, pe * 0.85], t(R.pernas), { pos: [p.pernas.abre * dx * 0.6 + pe * 0.5, chao - p.pernas.r + ty * 0.3 + pe * 0.4, p.pernas.abre * 0.3 * s], seg: 12 }));
    }
  });
  const a = ((p.pescoco.ang ?? 12) * Math.PI) / 180, fim: V3 = [Math.cos(a) * p.pescoco.len, Math.sin(a) * p.pescoco.len, 0];
  rig.bone('pescoco', 'corpo', [tx * 0.75, ty * 0.1, 0]);
  rig.add('pescoco', segmento([-tx * 0.15, 0, 0], fim, p.pescoco.r * 1.15, p.pescoco.r, t(R.pele)));
  rig.bone('cabeca', 'pescoco', fim);
  const f = p.focinho ?? 0;
  rig.add('cabeca', blob([hx, hy, hz], t(R.cabeca), { pos: [hx * 0.5, hy * 0.1, 0] }));
  if (f) rig.add('cabeca', segmento([hx * 0.8, hy * 0.15, 0], [hx * 1.2 + f, hy * 0.0, 0], hy * 0.62, hy * 0.42, t(R.cabeca), [(v) => { v.z *= 1.5; }]));
  rig.bone('mandibula', 'cabeca', [hx * 0.1, -hy * 0.4, 0]);
  rig.add('mandibula', segmento([0, 0, 0], [hx * 1.1 + f, hy * 0.05, 0], hy * 0.45, hy * 0.3, t(R.barriga ?? R.cabeca), [(v) => { v.z *= 1.6; }]));
  if (R.dentro !== undefined) rig.add('mandibula', blob([(hx + f) * 0.5, hy * 0.12, hz * 0.5], tom(R.dentro, { plano: true }), { pos: [(hx + f) * 0.55, hy * 0.28, 0], seg: 10 }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  cauda(rig, 'corpo', [-tx * 0.85, 0, 0], { ...p.cauda, mat: t(R.cauda) });
  if (p.crista) for (let i = 0; i < p.crista.n; i++) {
    const u = p.crista.n === 1 ? 0.5 : i / (p.crista.n - 1), x = tx * (0.75 - 1.5 * u), k = 1 - Math.abs(u - 0.4) * 0.8;
    rig.add('corpo', lathe([[p.crista.alt * 0.4 * k, 0], [p.crista.alt * 0.25 * k, p.crista.alt * 0.5 * k], [0.001, p.crista.alt * k]], t(R.crista), { seg: 8, pos: [x, ty * Math.sqrt(Math.max(0.05, 1 - (x / tx) ** 2)) * 0.92, 0], rot: [0, 0, 14], deform: [(v) => { v.z *= 0.5; }] }));
  }
  return { rig, ref: { dorso: [0, ty, 0], topo: [hx * 0.4, hy * 1.1, 0], focinho: [hx * 1.3 + f, 0, 0], garupa: [-tx * 0.7, ty * 0.7, 0], papada: [0, -p.pescoco.r, 0] } };
}

/** Animações do lagarto/jacaré: quadrúpede + rebolado lateral da cauda e mordida. `cauda` = nº de ossos. */
export function animsLagarto(o: AnimQuadP & { caudaSegs?: number }, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const n = o.caudaSegs ?? 3, gira = (v: number[], i: number) => [...v.slice(i % v.length), ...v.slice(0, i % v.length)];
  const onda = (v: number[]) => Object.fromEntries(Array.from({ length: n }, (_, i) => ['?cauda' + (i + 1), ly(gira(v, i))]));
  return animsQuadrupede({ mole: 0.7, passo: 30, mapa: { comp: 0.6, larg: 1.3, frontal: 1.4, cabeca: 1.3 }, ...o }, unirExtras({
    idle: { ...onda([0, 8, 0, -8]), '?mandibula': lz([0, 0, -6, 0]), pescoco: lr([[0, 0, 0], [0, 4, -2], [0, 0, -3], [0, -4, -1]]) },
    fisico: { '?mandibula': qz([-10, -44, 4, 0, 0]), '?cauda1': qy([10, 20, -26, -10, 0]) },
    especial: { '?mandibula': qz([0, -8, -12, -50, -20, 0]) },
    dano: { '?mandibula': qz([-22, -8, 0]) },
    andar: { ...onda([14, 0, -14, 0]), corpo: lr([[0, 5, 0], [0, 0, 0], [0, -5, 0], [0, 0, 0]]) },
  }, extra));
}

export interface TartarugaP {
  /** semi-eixos do casco [comp, alt, larg] */ casco: V3;
  /** altura do plastrão ao chão (jabuti alto, cágado baixo) */ alt: number;
  /** patas: `nadadeira` achata e alonga (tartaruga-marinha) */ pernas: { len: number; r: number; nadadeira?: boolean };
  pescoco: { len: number; r: number; ang?: number };
  cabeca: V3;
  cauda?: number;
  /** nº de escudos pintados em anel no casco (0 = liso) */ escudos?: number;
  olho: { r: number; pos: V3 };
  rampas: { casco: number; borda?: number; plastrao?: number; pele: number; escudos?: number };
}
export type RefTartaruga = 'topoCasco' | 'topo' | 'bico' | 'traseira';

export function tartaruga(p: TartarugaP): Kit<RefTartaruga> {
  const [kx, ky, kz] = p.casco, [hx, hy, hz] = p.cabeca, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pele);
  const rig = novoRig(p.alt + ky * 0.35);
  // casco: domo + aba + plastrão
  rig.add('corpo', blob([kx, ky, kz], tom(R.casco), { deform: [(v) => { if (v.y < 0) v.y *= 0.35; }] }),
    blob([kx * 1.06, ky * 0.2, kz * 1.06], tom(R.borda ?? R.casco), { pos: [0, -ky * 0.05, 0] }),
    blob([kx * 0.9, ky * 0.25, kz * 0.88], tom(R.plastrao ?? R.pele), { pos: [0, -ky * 0.3, 0] }));
  if (p.escudos) {
    rig.add('corpo', calota([kx * 0.5, ky * 1.03, kz * 0.5], tom(R.escudos ?? R.borda ?? R.casco), { de: 0, ate: 60, pos: [0, 0.0, 0] }));
    for (let i = 0; i < p.escudos; i++) {
      const a = (i / p.escudos) * Math.PI * 2 + 0.3;
      rig.add('corpo', blob([kx * 0.24, ky * 0.14, kz * 0.24], tom(R.escudos ?? R.borda ?? R.casco), { pos: [Math.cos(a) * kx * 0.62, ky * 0.62, Math.sin(a) * kz * 0.62], rot: [Math.sin(a) * 38, 0, -Math.cos(a) * 38], seg: 10, castShadow: false }));
    }
  }
  const a = ((p.pescoco.ang ?? 25) * Math.PI) / 180, fim: V3 = [Math.cos(a) * p.pescoco.len, Math.sin(a) * p.pescoco.len, 0];
  rig.bone('pescoco', 'corpo', [kx * 0.8, -ky * 0.05, 0]);
  rig.add('pescoco', segmento([-kx * 0.25, 0, 0], fim, p.pescoco.r * 1.1, p.pescoco.r, t(R.pele)));
  rig.bone('cabeca', 'pescoco', fim);
  rig.add('cabeca', blob([hx, hy, hz], t(R.pele), { pos: [hx * 0.5, hy * 0.1, 0] }));
  rig.bone('mandibula', 'cabeca', [hx * 0.3, -hy * 0.45, 0]);
  rig.add('mandibula', blob([hx * 0.6, hy * 0.3, hz * 0.75], t(R.plastrao ?? R.pele), { pos: [hx * 0.4, 0, 0], seg: 12 }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  const q = p.pernas, chao = -(p.alt + ky * 0.35) + q.r * 0.9;
  par((l, s) => {
    for (const [n, fx, dx] of [['f', 0.6, 0.5], ['t', -0.6, -0.45]] as const) {
      const fimP: V3 = q.nadadeira ? [q.len * dx * 1.6, chao * 0.5, q.len * 0.9 * s] : [q.len * dx * 0.5, chao, q.len * 0.35 * s];
      rig.bone(`perna_${n}${l}`, 'corpo', [kx * fx, -ky * 0.12, kz * 0.72 * s]);
      rig.bone(`canela_${n}${l}`, `perna_${n}${l}`, [fimP[0] * 0.5, fimP[1] * 0.5, fimP[2] * 0.5]);
      rig.add(`perna_${n}${l}`, segmento([0, 0, 0], [fimP[0] * 0.5, fimP[1] * 0.5, fimP[2] * 0.5], q.r * 1.1, q.r, t(R.pele)));
      rig.add(`canela_${n}${l}`, segmento([0, 0, 0], [fimP[0] * 0.5, fimP[1] * 0.5, fimP[2] * 0.5], q.r, q.r * (q.nadadeira ? 0.7 : 0.95), t(R.pele), q.nadadeira ? [(v) => { v.x *= 1.9; }] : []));
    }
  });
  if (p.cauda) { rig.bone('cauda1', 'corpo', [-kx * 0.95, -ky * 0.1, 0], [0, 0, 20]); rig.add('cauda1', segmento([0.02, 0, 0], [-p.cauda, 0, 0], p.cauda * 0.3, p.cauda * 0.08, t(R.pele))); }
  return { rig, ref: { topoCasco: [0, ky, 0], topo: [hx * 0.5, hy * 1.1, 0], bico: [hx * 1.5, 0, 0], traseira: [-kx, 0, 0] } };
}

/** Animações da tartaruga: quadrúpede lento + cabeça que recolhe no casco ao levar dano e ao desmaiar. */
export function animsTartaruga(o: AnimQuadP & { /** comprimento do pescoço (quanto recolhe) */ pescoco: number }, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const k = o.pescoco;
  return animsQuadrupede({ mole: 0.35, passo: 18, mapa: { comp: 0.9, larg: 1.1, frontal: 1.1, cabeca: 1.3 }, ...o }, unirExtras({
    idle: { pescoco: [...lz([0, 2, 4, 1]), ...ly([0, 0, 0, 0])], '?mandibula': lz([0, 0, -8, 0]) },
    fisico: { pescoco: [...qz([-4, -8, 6, 2, 0]), ...qp([[-k * 0.3, 0, 0], [-k * 0.6, 0, 0], [k * 0.5, 0, 0], [k * 0.2, 0, 0], [0, 0, 0]])], '?mandibula': qz([0, -10, -40, -12, 0]) },
    dano: { pescoco: [...qz([-10, -4, 0]), ...qp([[-k * 0.9, -k * 0.1, 0], [-k * 0.5, 0, 0], [0, 0, 0]])] },
    desmaio: { pescoco: [...qz([0, -6, -14, -20, -20]), ...qp([[0, 0, 0], [-k * 0.3, 0, 0], [-k * 0.7, -k * 0.1, 0], [-k * 0.95, -k * 0.15, 0], [-k * 0.95, -k * 0.15, 0]])] },
  }, extra));
}
