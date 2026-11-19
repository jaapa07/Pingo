/**
 * Anatomia INSETO de 6 patas (besouro, formiga, joaninha, vaga-lume, louva-a-deus, borboleta, libélula).
 * `asas` liga as asas membranosas; `elitros` liga as capas duras do besouro; `flutua` faz voar.
 * Ossos: base → corpo (tórax) → cabeca → antena_d/e · corpo → abdomen · corpo → pata1..3_d/e → tarso1..3_d/e ·
 *        corpo → asa_d/e · corpo → elitro_d/e.
 */
import { blob, tube, type V3 } from '../../../render/sculpt';
import { novoRig, membro2, olhos, par, tom, type Kit } from './base';
import { movBase, somar, montar, ly, lz, lr, qy, qz, qr, qp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface InsetoP {
  /** semi-eixos do tórax, do abdômen e da cabeça */ torax: V3; abdomen: V3; cabeca: V3;
  /** altura do tórax sobre o chão (as patas alcançam o chão; se `flutua`, ficam penduradas) */ alt: number;
  /** voo: altura extra sobre o chão */ flutua?: number;
  /** graus que o abdômen cai (+) ou levanta (−) */ caiAbdomen?: number;
  patas: { /** alcance lateral */ abre: number; r: number; /** altura do joelho acima do tórax */ joelho?: number };
  antenas?: { len: number; r?: number; abre?: number; bola?: number };
  /** asas membranosas [comprimento, largura]; em repouso ficam abertas para trás em V */ asas?: { len: number; larg: number; pares?: 1 | 2 };
  /** élitros: capas duras cobrindo o abdômen */ elitros?: boolean;
  /** mandíbulas/pinças na frente da cabeça */ mandibulas?: number;
  olho: { r: number; pos: V3 };
  rampas: { torax: number; abdomen?: number; cabeca?: number; patas?: number; antenas?: number; asas?: number; elitros?: number; barriga?: number };
}
export type RefInseto = 'dorso' | 'testa' | 'topo' | 'fimAbdomen' | 'costasAbdomen' | 'boca';

export function inseto(p: InsetoP): Kit<RefInseto> {
  const [tx, ty, tz] = p.torax, [ax, ay, az] = p.abdomen, [hx, hy, hz] = p.cabeca, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.torax);
  const f = p.flutua ?? 0;
  const rig = novoRig(p.alt + f);
  rig.add('corpo', blob([tx, ty, tz], t(R.torax)));
  rig.bone('abdomen', 'corpo', [-tx * 0.7, 0, 0], [0, 0, p.caiAbdomen ?? 8]);
  rig.add('abdomen', blob([ax, ay, az], t(R.abdomen), { pos: [-ax * 0.8, 0, 0] }));
  if (R.barriga !== undefined) rig.add('abdomen', blob([ax * 0.85, ay * 0.7, az * 0.85], t(R.barriga), { pos: [-ax * 0.8, -ay * 0.36, 0] }));
  rig.bone('cabeca', 'corpo', [tx * 0.8, ty * 0.1, 0]);
  rig.add('cabeca', blob([hx, hy, hz], t(R.cabeca), { pos: [hx * 0.6, 0, 0] }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  if (p.mandibulas) par((_, s) => rig.add('cabeca', tube([[hx * 1.3, -hy * 0.4, hz * 0.4 * s], [hx * 1.3 + p.mandibulas! * 0.7, -hy * 0.5, hz * 0.5 * s], [hx * 1.3 + p.mandibulas!, -hy * 0.5, hz * 0.1 * s]], (u) => p.mandibulas! * 0.22 * (1 - u * 0.7), t(R.patas), { seg: 8, radial: 8 })));
  if (p.antenas) {
    const a = p.antenas;
    par((l, s) => {
      rig.bone('antena_' + l, 'cabeca', [hx * 0.9, hy * 0.7, hz * 0.4 * s], [-(a.abre ?? 24) * s, 0, 0]);
      rig.add('antena_' + l, tube([[0, 0, 0], [a.len * 0.3, a.len * 0.6, 0], [a.len * 0.8, a.len * 0.8, 0]], a.r ?? 0.012, t(R.antenas ?? R.patas), { seg: 8, radial: 6 }));
      if (a.bola) rig.add('antena_' + l, blob([a.bola, a.bola, a.bola], t(R.antenas ?? R.patas), { pos: [a.len * 0.8, a.len * 0.8, 0], seg: 10 }));
    });
  }
  // três pares de patas: dianteiro aponta para a frente, traseiro para trás
  const J = p.patas.joelho ?? ty * 0.6;
  par((l, s) => {
    [0.55, 0, -0.55].forEach((fx, i) => {
      const dx = [0.5, 0, -0.6][i] * p.patas.abre;
      membro2(rig, `pata${i + 1}_${l}`, `tarso${i + 1}_${l}`, 'corpo', [tx * fx, -ty * 0.3, tz * 0.8 * s],
        [dx * 0.5, J, p.patas.abre * 0.55 * s], [dx * 0.5, -(J + p.alt - ty * 0.3) + (f ? p.alt * 0.5 : 0), p.patas.abre * 0.45 * s],
        [p.patas.r, p.patas.r * 0.85, p.patas.r * 0.5], t(R.patas));
    });
  });
  if (p.elitros) par((l, s) => {
    rig.bone('elitro_' + l, 'corpo', [-tx * 0.5, ty * 0.5, az * 0.12 * s]);
    rig.add('elitro_' + l, blob([ax * 1.08, ay * 0.9, az * 0.6], t(R.elitros), { pos: [-ax * 0.95, -ay * 0.25, az * 0.42 * s] }));
  });
  if (p.asas) {
    const w = p.asas;
    par((l, s) => {
      rig.bone('asa_' + l, 'corpo', [-tx * 0.1, ty * 0.85, tz * 0.4 * s], [-20 * s, 40 * s, 0]);
      rig.add('asa_' + l, blob([w.len * 0.5, w.larg * 0.08, w.larg * 0.5], t(R.asas), { pos: [-w.len * 0.5, 0, 0], seg: 16, castShadow: false }));
      if (w.pares === 2) rig.add('asa_' + l, blob([w.len * 0.36, w.larg * 0.07, w.larg * 0.4], t(R.asas), { pos: [-w.len * 0.4, -w.larg * 0.1, -w.larg * 0.45 * s], rot: [0, -30 * s, 0], seg: 14, castShadow: false }));
    });
  }
  return { rig, ref: { dorso: [0, ty, 0], testa: [hx * 1.4, hy * 0.5, 0], topo: [hx * 0.6, hy, 0], fimAbdomen: [-ax * 1.8, 0, 0], costasAbdomen: [-ax * 0.8, ay, 0], boca: [hx * 1.6, -hy * 0.3, 0] } };
}

export interface AnimInsetoP extends BaseP { /** altura do tórax (quanto arria no desmaio) */ alt: number; /** tem asas que batem */ asas?: boolean; mapa?: MapaChibi }

export function animsInseto(o: AnimInsetoP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  // tripé A = pata1_d, pata3_d, pata2_e · tripé B = os outros três
  const tripe = (q: typeof ly, v: number[]) => {
    const A = ['pata1_d', 'pata3_d', 'pata2_e'], B = ['pata1_e', 'pata3_e', 'pata2_d'];
    return Object.fromEntries([...A.map((n) => [n, q(v.map((x) => (n.endsWith('_d') ? x : -x)))]), ...B.map((n) => [n, q(v.map((x) => (n.endsWith('_d') ? -x : x)))])]);
  };
  // batida de asa: D sobe com Rx −, E com Rx +
  const bate = (q: typeof qr, v: number[]): Faixas => (o.asas ? { '?asa_d': q(v.map((a) => [-a, 0, 0] as V3)), '?asa_e': q(v.map((a) => [a, 0, 0] as V3)) } : {});
  const ant = (q: typeof qz, v: number[]) => ({ '?antena_d': q(v), '?antena_e': q(v.map((x) => x * 0.8)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { abdomen: qz([-16, 10, 14, -4, 0]), ...ant(qz, [20, -14, 10, -3, 0]), ...bate(qr, [50, -20, 40, -10, 0]) },
    idle: { ...ant(lz, [0, 8, 14, 4]), abdomen: lz([0, 2, 4, 1]), cabeca: lr([[0, 0, 0], [0, 0, 0], [8, 0, 0], [0, 0, 0]]), ...bate(lr, [0, 40, 0, 40]) },
    fisico: { cabeca: qz([8, 14, -18, -6, 0]), abdomen: qz([-6, -12, 14, 5, 0]), pata1_d: qr([[0, 20, 20], [0, 30, 34], [0, -30, -10], [0, -10, 0], [0, 0, 0]]), pata1_e: qr([[0, -20, 20], [0, -30, 34], [0, 30, -10], [0, 10, 0], [0, 0, 0]]), ...ant(qz, [10, 20, -24, -8, 0]), ...bate(qr, [30, 50, -20, 10, 0]) },
    especial: { abdomen: qz([4, 10, 12, -22, -8, 0]), cabeca: qz([-4, -8, -8, 10, 4, 0]), ...ant(qz, [-8, -16, -16, 24, 8, 0]), ...bate(qr, [20, 60, -20, 60, -20, 0]), '?elitro_d': qr([[0, 0, 0], [0, 10, 0], [0, 14, 0], [-20, 50, 0], [-8, 20, 0], [0, 0, 0]]), '?elitro_e': qr([[0, 0, 0], [0, -10, 0], [0, -14, 0], [20, -50, 0], [8, -20, 0], [0, 0, 0]]) },
    dano: { cabeca: qz([16, 6, 0]), abdomen: qz([-12, -4, 0]), ...ant(qz, [30, 10, 0]), ...tripe(qy, [14, 5, 0]) },
    // arria e encolhe as patas
    desmaio: { corpo: qp([[0, 0.02 * o.alt, 0], [0, 0, 0], [0, -0.4 * o.alt, 0], [0, -0.75 * o.alt - (o.flutua ?? 0), 0], [0, -0.72 * o.alt - (o.flutua ?? 0), 0]]), ...ant(qz, [0, -10, -24, -40, -38]), abdomen: qz([0, 4, 8, 12, 10]), ...Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3].map((i) => [`tarso${i}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? -30 : 30, 0, 0], [l === 'd' ? -60 : 60, 0, 0], [l === 'd' ? -56 : 56, 0, 0]])]))) },
    status: { ...ant(lz, [-20, -24, -20, -16]), cabeca: lr([[8, 0, -6], [0, 0, -8], [-8, 0, -6], [0, 0, -4]]), abdomen: lz([6, 8, 6, 4]), ...bate(lr, [0, 20, 0, 20]) },
    andar: { ...tripe(ly, [22, 0, -22, 0]), ...ant(lz, [0, 6, 0, 6]), abdomen: lr([[0, 4, 0], [0, 0, 0], [0, -4, 0], [0, 0, 0]]), ...bate(lr, [40, -10, 40, -10]) },
    parado: { ...ant(lz, [0, 10]), ...bate(lr, [0, 40]) },
  };
  // o desmaio de quem voa é tratado aqui (queda até o chão), então não repasse `flutua` ao movBase
  return montar(somar(movBase({ ...o, flutua: 0 }), o.flutua ? { idle: { corpo: [{ t: 0, p: [0, 0, 0] }, { t: 0.5, p: [0, 0.05 * o.u, 0] }, { t: 1, p: [0, 0, 0] }] } } : undefined, membros, extra), {}, { comp: 0.9, larg: 1.2, cabeca: 1.2, frontal: 1.15, ...o.mapa });
}
