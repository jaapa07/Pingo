/**
 * Anatomia SERPENTE (jiboia, coral, cascavel, sucuri, muçurana; serve também para minhocas e enguias).
 * O corpo é uma cadeia: metade de trás ondulando no chão, metade da frente erguida.
 * Ossos: base → corpo → pescoco1..N → cabeca → mandibula · corpo → cauda1..M.
 * Segmentos crescem em +X (pescoço) e −X (cauda). Rz ergue; Ry serpenteia.
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, segmento, olhos, tom, type Kit } from './base';
import { movBase, somar, montar, ly, lz, qy, qz, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface SerpenteP {
  /** raio do corpo no meio */ r: number;
  /** pescoço erguido: nº de ossos, comprimento de cada um e a curva (graus Rz) de cada junta */ pescoco: { segs: number; len: number; curva: number[]; rFim?: number };
  /** cauda no chão: nº de ossos, comprimento e a curva (graus Ry) de cada junta, alternando para fazer o S */ cauda: { segs: number; len: number; curva: number[]; rFim?: number };
  cabeca: V3;
  /** capuz/pescoço largo atrás da cabeça (0 = sem) */ capuz?: number;
  /** guizo/ponta: raio de um bulbo no fim da cauda */ ponta?: number;
  olho: { r: number; pos: V3 };
  /** rampas: `anel` pinta um segmento sim, outro não (coral, cascavel) */
  rampas: { corpo: number; barriga?: number; anel?: number; cabeca?: number; ponta?: number };
}
export type RefSerpente = 'topo' | 'focinho' | 'nuca' | 'meio' | 'fimCauda';

export function serpente(p: SerpenteP): Kit<RefSerpente> {
  const R = p.rampas, t = (i: number | undefined) => tom(i ?? R.corpo);
  const rig = novoRig(p.r);
  rig.add('corpo', blob([p.r * 1.1, p.r, p.r * 1.1], t(R.corpo), { seg: 16 }));
  const cor = (i: number) => t(R.anel !== undefined && i % 2 ? R.anel : R.corpo);
  // pescoço erguido
  let pai = 'corpo';
  const np = p.pescoco.segs, rF = p.pescoco.rFim ?? p.r * 0.8;
  for (let i = 1; i <= np; i++) {
    rig.bone('pescoco' + i, pai, i === 1 ? [0, 0, 0] : [p.pescoco.len, 0, 0], [0, 0, p.pescoco.curva[i - 1] ?? 0]);
    const ra = p.r + (rF - p.r) * ((i - 1) / np), rb = p.r + (rF - p.r) * (i / np);
    rig.add('pescoco' + i, segmento([0, 0, 0], [p.pescoco.len, 0, 0], ra, rb, cor(i)));
    if (R.barriga !== undefined) rig.add('pescoco' + i, segmento([p.pescoco.len * 0.1, -ra * 0.25, 0], [p.pescoco.len * 0.9, -rb * 0.25, 0], ra * 0.85, rb * 0.85, t(R.barriga)));
    pai = 'pescoco' + i;
  }
  const [hx, hy, hz] = p.cabeca;
  rig.bone('cabeca', pai, [p.pescoco.len, 0, 0], [0, 0, -(p.pescoco.curva.reduce((a, b) => a + b, 0)) * 0.75]);
  rig.add('cabeca', blob([hx, hy, hz], t(R.cabeca), { pos: [hx * 0.55, hy * 0.1, 0], deform: [(v) => { if (v.x > 0) { v.z *= 1 - (v.x / hx) * 0.3; v.y *= 1 - (v.x / hx) * 0.25; } }] }));
  if (p.capuz) rig.add(pai, blob([p.pescoco.len * 0.7, rF * 0.7, p.capuz], t(R.corpo), { pos: [p.pescoco.len * 0.6, 0, 0], seg: 18 }));
  rig.bone('mandibula', 'cabeca', [hx * 0.1, -hy * 0.35, 0]);
  rig.add('mandibula', blob([hx * 0.75, hy * 0.35, hz * 0.8], t(R.barriga ?? R.cabeca), { pos: [hx * 0.5, 0, 0], seg: 14 }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  // cauda em S no chão
  pai = 'corpo';
  const nc = p.cauda.segs, rC = p.cauda.rFim ?? p.r * 0.25;
  for (let i = 1; i <= nc; i++) {
    rig.bone('cauda' + i, pai, i === 1 ? [0, 0, 0] : [-p.cauda.len, 0, 0], [0, p.cauda.curva[i - 1] ?? 0, 0]);
    const ra = p.r + (rC - p.r) * ((i - 1) / nc), rb = p.r + (rC - p.r) * (i / nc);
    rig.add('cauda' + i, segmento([0, (ra - p.r), 0], [-p.cauda.len, (rb - p.r), 0], ra, rb, cor(i + np)));
    pai = 'cauda' + i;
  }
  if (p.ponta) rig.add(pai, blob([p.ponta * 1.4, p.ponta, p.ponta], t(R.ponta ?? R.anel), { pos: [-p.cauda.len - p.ponta, rC - p.r + p.ponta * 0.4, 0], seg: 12 }));
  return { rig, ref: { topo: [hx * 0.4, hy, 0], focinho: [hx * 1.5, 0, 0], nuca: [-hx * 0.3, hy * 0.6, 0], meio: [0, p.r, 0], fimCauda: [-p.cauda.len, 0, 0] } };
}

export interface AnimSerpenteP extends BaseP { /** nº de ossos do pescoço e da cauda (os mesmos do kit) */ pescoco: number; cauda: number; mapa?: MapaChibi }

export function animsSerpente(o: AnimSerpenteP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const P = (f: (i: number) => ReturnType<typeof lz>) => Object.fromEntries(Array.from({ length: o.pescoco }, (_, i) => ['pescoco' + (i + 1), f(i)]));
  const C = (f: (i: number) => ReturnType<typeof ly>) => Object.fromEntries(Array.from({ length: o.cauda }, (_, i) => ['cauda' + (i + 1), f(i)]));
  const gira = (v: number[], i: number) => [...v.slice(i % v.length), ...v.slice(0, i % v.length)];
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...P(() => qz([-20, 8, -10, 3, 0])), ...C((i) => qy(gira([14, -10, 6, 0, 0], 0).map((x) => (i % 2 ? -x : x)))) },
    // balanço hipnótico: cada junta do pescoço pende para um lado, em onda
    idle: { ...P((i) => ly(gira([0, 6, 0, -6], i))), cabeca: lz([0, -2, -4, -1]), ...C((i) => ly(gira([0, 4, 0, -4], i + 1))) },
    // bote: recolhe (S apertado) e estica de uma vez
    fisico: { ...P(() => qz([10, 20, -30, -12, 0])), cabeca: qz([0, 10, 20, 8, 0]), mandibula: qz([0, -10, -40, -14, 0]), ...C((i) => qy([4, 8, -8, -3, 0].map((x) => (i % 2 ? -x : x)))) },
    especial: { ...P(() => qz([-6, -12, -12, 14, 5, 0])), mandibula: qz([0, 0, -6, -46, -18, 0]), cabeca: qz([4, 8, 8, -6, -2, 0]), ...C((i) => qy([0, 10, -10, 12, -5, 0].map((x) => (i % 2 ? -x : x)))) },
    dano: { ...P(() => qz([14, 5, 0])), mandibula: qz([-24, -8, 0]), ...C((i) => qy([12, 4, 0].map((x) => (i % 2 ? -x : x)))) },
    // o pescoço desaba no chão
    desmaio: { ...P((i) => qz([4, -6, -22, -34, -32].map((x) => x * (i === 0 ? 1.4 : 1)))), cabeca: qz([0, 6, 30, 60, 56]), mandibula: qz([0, -6, -14, -20, -18]) },
    status: { ...P((i) => ly(gira([8, 0, -8, 0], i))), cabeca: lz([-10, -12, -10, -8]) },
    // serpenteio: onda viajando da cabeça para a cauda
    andar: { ...C((i) => ly(gira([16, 0, -16, 0], i))), ...P((i) => ly(gira([6, 0, -6, 0], i + 2))) },
    parado: { ...P((i) => ly(i % 2 ? [0, 5] : [0, -5])) },
  };
  return montar(somar(movBase({ mole: 0.5, ...o }), membros, extra), {}, { comp: 0.85, larg: 1.2, cabeca: 1.3, frontal: 1.2, ...o.mapa });
}
