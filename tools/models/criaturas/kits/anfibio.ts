/**
 * Anatomia ANFÍBIO saltador (sapo, rã, perereca). Agachado, cabeça fundida ao corpo, olhos saltados no alto,
 * pernas traseiras dobradas em Z. Para salamandras/cecílias use o réptil ou a serpente.
 * Ossos: base → corpo → cabeca → mandibula (→ papo) · corpo → perna_fd/fe → canela_fd/fe ·
 *        corpo → perna_td/te → canela_td/te → pe_td/te.
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, membro2, segmento, par, tom, olhos, type Kit } from './base';
import { movBase, somar, montar, lz, ls, lr, qz, qs, qp, qr, lp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface AnfibioP {
  /** semi-eixos do corpo */ corpo: V3;
  /** graus que a frente levanta (sapo sentado ~25) */ ergue?: number;
  /** cabeça larga [comp, alt, larg] */ cabeca: V3;
  /** calombo do olho: raio (os olhos ficam no topo da cabeça) */ olhoSaliente: number;
  bracos: { len: number; r: number };
  pernas: { coxa: number; canela: number; pe: number; r: number };
  /** discos adesivos na ponta dos dedos (perereca): raio; 0/ausente = sapo */ ventosa?: number;
  /** saco vocal sob o queixo: raio em repouso */ papo?: number;
  olho: { r: number };
  rampas: { pele: number; barriga?: number; pernas?: number; dedos?: number; papo?: number; olho?: number };
}
export type RefAnfibio = 'dorso' | 'testa' | 'boca' | 'topoOlho' | 'garupa';

export function anfibio(p: AnfibioP): Kit<RefAnfibio> {
  const [cx, cy, cz] = p.corpo, [hx, hy, hz] = p.cabeca, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pele);
  const e = ((p.ergue ?? 22) * Math.PI) / 180;
  const alt = cy * 0.9 + Math.sin(e) * cx * 0.3;
  const rig = novoRig(alt);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, p.ergue ?? 22]);
  rig.add('tronco', blob([cx, cy, cz], t(R.pele), { deform: [(v) => { if (v.x < 0) { v.z *= 1.1; } }] }));
  if (R.barriga !== undefined) rig.add('tronco', blob([cx * 0.85, cy * 0.75, cz * 0.9], t(R.barriga), { pos: [cx * 0.1, -cy * 0.35, 0] }));
  rig.bone('cabeca', 'tronco', [cx * 0.7, cy * 0.15, 0], [0, 0, -(p.ergue ?? 22) * 0.7]);
  rig.add('cabeca', blob([hx, hy, hz], t(R.pele), { pos: [hx * 0.4, 0, 0] }));
  rig.bone('mandibula', 'cabeca', [0, -hy * 0.35, 0]);
  rig.add('mandibula', blob([hx * 0.95, hy * 0.5, hz * 0.94], t(R.barriga ?? R.pele), { pos: [hx * 0.42, 0, 0] }));
  if (p.papo) { rig.bone('papo', 'mandibula', [hx * 0.3, -hy * 0.35, 0]); rig.add('papo', blob([p.papo, p.papo * 0.8, p.papo * 1.1], t(R.papo ?? R.barriga ?? R.pele), { seg: 16 })); }
  // olhos saltados
  const os = p.olhoSaliente;
  par((_, s) => rig.add('cabeca', blob([os, os, os], t(R.olho ?? R.pele), { pos: [hx * 0.35, hy * 0.75, hz * 0.6 * s], seg: 16 })));
  olhos(rig, 'cabeca', p.olho.r, [hx * 0.35 + os * 0.55, hy * 0.75 + os * 0.2, hz * 0.6 + os * 0.7]);
  const dedos = (osso: string, pos: V3, r: number, len: number) => {
    for (const g of [-34, 0, 34]) {
      const a = (g * Math.PI) / 180, fim: V3 = [pos[0] + Math.cos(a) * len, pos[1], pos[2] + Math.sin(a) * len];
      rig.add(osso, segmento(pos, fim, r * 0.6, r * 0.45, t(R.dedos ?? R.pernas)));
      if (p.ventosa) rig.add(osso, blob([p.ventosa, p.ventosa * 0.6, p.ventosa], t(R.dedos ?? R.pernas), { pos: fim, seg: 10 }));
    }
  };
  par((l, s) => {
    // bracinhos apoiados à frente
    const b = p.bracos, yB = -(alt + Math.sin(e) * cx * 0.45 - cy * 0.3) + b.r;
    membro2(rig, 'perna_f' + l, 'canela_f' + l, 'corpo', [Math.cos(e) * cx * 0.5, Math.sin(e) * cx * 0.5 - cy * 0.3, cz * 0.8 * s], [-b.len * 0.1, yB * 0.5, b.len * 0.2 * s], [b.len * 0.2, yB * 0.5, 0], [b.r, b.r * 0.85, b.r * 0.7], t(R.pernas));
    dedos('canela_f' + l, [b.len * 0.2, yB * 0.5, 0], b.r, b.len * 0.35);
    // pernas traseiras em Z: coxa para a frente e para fora, canela para trás, pé para a frente
    const q = p.pernas, y0 = -Math.sin(e) * cx * 0.5 - cy * 0.2, chao = -(alt + y0) + q.r * 0.8;
    rig.bone('perna_t' + l, 'corpo', [-Math.cos(e) * cx * 0.55, y0, cz * 0.75 * s]);
    rig.add('perna_t' + l, segmento([0, 0, 0], [q.coxa * 0.8, chao * 0.35 + q.r, q.coxa * 0.45 * s], q.r * 1.3, q.r, t(R.pernas)));
    rig.bone('canela_t' + l, 'perna_t' + l, [q.coxa * 0.8, chao * 0.35 + q.r, q.coxa * 0.45 * s]);
    rig.add('canela_t' + l, segmento([0, 0, 0], [-q.canela * 0.9, chao * 0.65 - q.r, q.canela * 0.1 * s], q.r, q.r * 0.75, t(R.pernas)));
    rig.bone('pe_t' + l, 'canela_t' + l, [-q.canela * 0.9, chao * 0.65 - q.r, q.canela * 0.1 * s]);
    rig.add('pe_t' + l, segmento([0, 0, 0], [q.pe * 0.6, 0, q.pe * 0.1 * s], q.r * 0.75, q.r * 0.6, t(R.pernas)));
    dedos('pe_t' + l, [q.pe * 0.6, 0, q.pe * 0.1 * s], q.r, q.pe * 0.45);
  });
  return { rig, ref: { dorso: [0, cy, 0], testa: [hx * 1.2, hy * 0.4, 0], boca: [hx * 1.4, -hy * 0.2, 0], topoOlho: [hx * 0.35, hy * 0.75 + os, hz * 0.6], garupa: [-cx * 0.8, cy * 0.5, 0] } };
}

export interface AnimAnfibioP extends BaseP { /** tem saco vocal */ papo?: boolean; mapa?: MapaChibi }

export function animsAnfibio(o: AnimAnfibioP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const u = o.u;
  const tras = (q: typeof qz, coxa: number[], canela: number[]) => ({ perna_td: q(coxa), perna_te: q(coxa), canela_td: q(canela), canela_te: q(canela) });
  const frente = (q: typeof qz, v: number[]) => ({ perna_fd: q(v), perna_fe: q(v) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...tras(qz, [-40, -60, 10, 0, 0], [50, 70, -10, 0, 0]), ...frente(qz, [30, 40, -14, 0, 0]), tronco: qz([10, 14, -8, 2, 0]) },
    // respira pelo papo: incha e murcha
    idle: { '?papo': ls([1, 1.25, 1.5, 1.2]), cabeca: lz([0, 1, 3, 1]), mandibula: lz([0, 0, -2, 0]) },
    // salto curto com a boca aberta
    fisico: { base: [...qp([[-0.04 * u, 0, 0], [-0.06 * u, -0.01 * u, 0], [0.08 * u, 0.1 * u, 0], [0.05 * u, 0.02 * u, 0], [0, 0, 0]])], tronco: qz([-4, -8, 14, 4, 0]), mandibula: qz([0, -6, -34, -10, 0]),
      ...tras(qz, [8, 14, -50, -16, 0], [-8, -14, 60, 20, 0]), ...frente(qz, [-6, -10, 34, 10, 0]) },
    // coaxo: papo enorme e corpo para cima
    especial: { '?papo': qs([1.2, 1.8, 2.3, 2.6, 1.5, 1]), tronco: qz([2, 6, 10, 14, 5, 0]), mandibula: qz([0, -4, -8, -16, -6, 0]), cabeca: qz([0, 4, 8, 10, 4, 0]) },
    dano: { tronco: qz([12, 4, 0]), mandibula: qz([-20, -6, 0]), ...frente(qz, [30, 10, 0]), '?papo': qs([0.7, 0.9, 1]) },
    desmaio: { tronco: qr([[0, 0, 6], [0, 0, -6], [20, 0, -14], [40, 0, -20], [38, 0, -19]]), ...tras(qz, [0, -10, -30, -50, -48], [0, 10, 40, 70, 66]), ...frente(qz, [0, 10, 30, 50, 46]), '?papo': qs([1, 0.9, 0.7, 0.6, 0.6]) },
    status: { '?papo': ls([1, 1.15, 1.3, 1.1]), cabeca: lr([[6, 0, -4], [0, 0, -6], [-6, 0, -4], [0, 0, -2]]) },
    // pulinhos: estica as pernas no ar
    andar: { base: lp([[0, 0, 0], [0, 0.14 * u, 0], [0, 0.08 * u, 0], [0, 0, 0]]), ...tras(lz, [0, -44, -20, 6], [0, 56, 24, -6]), ...frente(lz, [0, 26, 14, -6]), tronco: lz([0, 8, -4, -2]) },
    parado: { '?papo': ls([1, 1.4]) },
  };
  return montar(somar(movBase({ mole: 1.4, ...o }), membros, extra), {}, { comp: 0.95, larg: 1.1, cabeca: 1.1, frontal: 1.05, ...o.mapa });
}
