/**
 * Anatomia ARACNÍDEO / CRUSTÁCEO (aranha, caranguejeira, escorpião, caranguejo, siri, aratu, camarão-de-pedra).
 * Corpo baixo e largo com 3 ou 4 pares de patas arqueadas; opcionais: abdômen (aranha), pinças (caranguejo,
 * escorpião), cauda com ferrão (escorpião) e olhos em pedúnculo (caranguejo).
 * Ossos: base → corpo → abdomen · corpo → pata1..4_d/e → tarso1..4_d/e · corpo → pinca_d/e → garra_d/e → dedo_d/e ·
 *        corpo → cauda1..N · corpo → pedunculo_d/e.
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, membro2, cauda, segmento, olhos, par, tom, type Kit } from './base';
import { garra as unha } from './partes';
import { movBase, somar, montar, ly, lz, lr, qy, qz, qr, qp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface AracnideoP {
  /** semi-eixos do corpo (carapaça/cefalotórax) */ corpo: V3;
  /** altura do corpo sobre o chão */ alt: number;
  abdomen?: { r: V3; ang?: number };
  patas: { pares: 3 | 4; abre: number; r: number; joelho?: number };
  pincas?: { braco: number; r: number; garra: V3; /** graus de abertura para os lados */ abre?: number };
  /** cauda de escorpião: curva para cima e para a frente, com ferrão */ cauda?: { segs: number; len: number; r0: number; r1: number; curva?: number; ferrao?: number };
  /** olhos em pedúnculo: altura da haste (caranguejo); sem isso os olhos ficam na frente do corpo */ pedunculo?: number;
  olho: { r: number; pos: V3 };
  rampas: { corpo: number; abdomen?: number; patas?: number; pontas?: number; pincas?: number; barriga?: number; cauda?: number };
}
export type RefAracnideo = 'dorso' | 'frente' | 'costasAbdomen' | 'pontaGarra' | 'fimCauda';

export function aracnideo(p: AracnideoP): Kit<RefAracnideo> {
  const [cx, cy, cz] = p.corpo, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.corpo);
  const rig = novoRig(p.alt);
  rig.add('corpo', blob([cx, cy, cz], t(R.corpo)));
  if (R.barriga !== undefined) rig.add('corpo', blob([cx * 0.85, cy * 0.7, cz * 0.88], t(R.barriga), { pos: [cx * 0.05, -cy * 0.4, 0] }));
  if (p.abdomen) {
    const [ax, ay, az] = p.abdomen.r;
    rig.bone('abdomen', 'corpo', [-cx * 0.7, cy * 0.1, 0], [0, 0, -(p.abdomen.ang ?? 10)]);
    rig.add('abdomen', blob([ax, ay, az], t(R.abdomen), { pos: [-ax * 0.85, 0, 0] }));
  }
  // patas arqueadas: sobem até o joelho e descem ao chão
  const n = p.patas.pares, J = p.patas.joelho ?? cy * 1.2;
  par((l, s) => {
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), fx = 0.6 - 1.2 * u, dx = (0.45 - 0.9 * u) * p.patas.abre;
      membro2(rig, `pata${i + 1}_${l}`, `tarso${i + 1}_${l}`, 'corpo', [cx * fx, -cy * 0.2, cz * 0.85 * s],
        [dx * 0.5, J, p.patas.abre * 0.5 * s], [dx * 0.5, -(J + p.alt - cy * 0.2), p.patas.abre * 0.5 * s],
        [p.patas.r, p.patas.r * 0.9, p.patas.r * 0.45], t(R.patas), t(R.pontas ?? R.patas));
    }
  });
  let pontaGarra: V3 = [cx, 0, 0];
  if (p.pincas) {
    const q = p.pincas, [gx, gy, gz] = q.garra;
    par((l, s) => {
      rig.bone('pinca_' + l, 'corpo', [cx * 0.75, 0, cz * 0.7 * s], [0, -(q.abre ?? 30) * s, 0]);
      rig.add('pinca_' + l, segmento([0, 0, 0], [q.braco, q.braco * 0.25, 0], q.r, q.r * 0.9, t(R.patas)));
      rig.bone('garra_' + l, 'pinca_' + l, [q.braco, q.braco * 0.25, 0], [0, (q.abre ?? 30) * 0.8 * s, 0]);
      rig.add('garra_' + l, blob([gx, gy, gz], t(R.pincas ?? R.corpo), { pos: [gx * 0.7, 0, 0] }),
        unha(gx * 1.1, gy * 0.5, t(R.pincas ?? R.corpo), { pos: [gx * 1.2, gy * 0.35, 0], curva: 0.25 }));
      rig.bone('dedo_' + l, 'garra_' + l, [gx * 1.1, -gy * 0.3, 0], [0, 0, -14]);
      rig.add('dedo_' + l, unha(gx * 1.0, gy * 0.4, t(R.pontas ?? R.pincas ?? R.corpo), { curva: -0.2 }));
    });
    pontaGarra = [gx * 2.2, 0, 0];
  }
  let fim: V3 = [-cx, 0, 0];
  if (p.cauda) {
    const c = p.cauda;
    const r = cauda(rig, 'corpo', [-cx * 0.85, cy * 0.2, 0], { segs: c.segs, len: c.len, r0: c.r0, r1: c.r1, ang: 30, curva: c.curva ?? 38, mat: t(R.cauda ?? R.corpo) });
    if (c.ferrao) rig.add(r.ultimo, blob([c.ferrao, c.ferrao * 0.9, c.ferrao * 0.9], t(R.pincas ?? R.cauda ?? R.corpo), { pos: [-r.seg - c.ferrao * 0.5, 0, 0], seg: 12 }),
      unha(c.ferrao * 1.8, c.ferrao * 0.45, t(R.pontas ?? R.patas), { pos: [-r.seg - c.ferrao, 0, 0], rot: [0, 0, 140], curva: 0.5 }));
    fim = [-r.seg, 0, 0];
  }
  if (p.pedunculo) {
    par((l, s) => {
      rig.bone('pedunculo_' + l, 'corpo', [cx * 0.7, cy * 0.6, cz * 0.35 * s]);
      rig.add('pedunculo_' + l, segmento([0, 0, 0], [0, p.pedunculo!, 0], p.olho.r * 0.6, p.olho.r * 0.6, t(R.patas)), blob([p.olho.r * 1.5, p.olho.r * 1.5, p.olho.r * 1.5], t(R.corpo), { pos: [0, p.pedunculo! + p.olho.r, 0], seg: 12 }));
    });
    olhos(rig, 'corpo', p.olho.r, [cx * 0.7 + p.olho.r * 1.2, cy * 0.6 + p.pedunculo + p.olho.r, cz * 0.35 + p.olho.r * 0.6]);
  } else olhos(rig, 'corpo', p.olho.r, p.olho.pos);
  return { rig, ref: { dorso: [0, cy, 0], frente: [cx, 0, 0], costasAbdomen: p.abdomen ? [-p.abdomen.r[0] * 0.85, p.abdomen.r[1], 0] : [-cx * 0.5, cy, 0], pontaGarra, fimCauda: fim } };
}

export interface AnimAracP extends BaseP { alt: number; pares: 3 | 4; mapa?: MapaChibi }

export function animsAracnideo(o: AnimAracP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  // patas alternadas: ímpares de um lado com pares do outro
  const marcha = (q: typeof ly, v: number[]) => Object.fromEntries(['d', 'e'].flatMap((l) => Array.from({ length: o.pares }, (_, i) => {
    const sinal = (i % 2 === 0) === (l === 'd') ? 1 : -1;
    return [`pata${i + 1}_${l}`, q(v.map((x) => x * sinal * (l === 'd' ? 1 : -1)))];
  })));
  const pin = (q: typeof qr, ab: number[], sobe: number[]) => ({ '?pinca_d': q(ab.map((a, i) => [0, -a, sobe[i]] as V3)), '?pinca_e': q(ab.map((a, i) => [0, a, sobe[i]] as V3)) });
  const dedo = (q: typeof qz, v: number[]) => ({ '?dedo_d': q(v), '?dedo_e': q(v) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...pin(qr, [30, -20, 20, -6, 0], [40, 60, 10, 4, 0]), '?abdomen': qz([-16, 10, 12, -4, 0]), '?cauda1': qz([20, -16, 10, -3, 0]) },
    idle: { ...pin(lr, [0, 4, 8, 3], [0, 3, 6, 2]), ...dedo(lz, [0, 0, -18, 0]), '?abdomen': lz([0, 2, 4, 1]), '?cauda1': lz([0, -3, -6, -2]), '?pedunculo_d': lz([0, 0, 8, 0]), '?pedunculo_e': lz([0, 6, 0, 0]) },
    fisico: { ...pin(qr, [20, 34, -30, -10, 0], [10, 30, -10, -4, 0]), ...dedo(qz, [-10, -30, 14, 6, 0]), '?cauda1': qz([-10, -20, 36, 14, 0]), '?cauda2': qz([-6, -12, 26, 10, 0]), '?abdomen': qz([-6, -10, 12, 4, 0]) },
    especial: { ...pin(qr, [10, 24, 24, -40, -14, 0], [20, 50, 54, 70, 24, 0]), ...dedo(qz, [0, -14, -30, -34, -10, 0]), '?cauda1': qz([0, -10, -14, 30, 10, 0]), '?abdomen': qz([4, 10, 12, -20, -6, 0]) },
    dano: { ...pin(qr, [-30, -10, 0], [40, 14, 0]), ...marcha(qy, [10, 4, 0]), '?abdomen': qz([-12, -4, 0]), '?cauda1': qz([16, 6, 0]) },
    desmaio: { corpo: qp([[0, 0.02 * o.alt, 0], [0, 0, 0], [0, -0.4 * o.alt, 0], [0, -0.75 * o.alt, 0], [0, -0.72 * o.alt, 0]]), ...pin(qr, [0, 10, 24, 40, 38], [0, -10, -24, -36, -34]), '?cauda1': qz([0, 10, 24, 40, 38]),
      ...Object.fromEntries(['d', 'e'].flatMap((l) => Array.from({ length: o.pares }, (_, i) => [`tarso${i + 1}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? -30 : 30, 0, 0], [l === 'd' ? -64 : 64, 0, 0], [l === 'd' ? -60 : 60, 0, 0]])]))) },
    status: { ...pin(lr, [-6, -8, -6, -4], [-16, -20, -16, -12]), '?abdomen': lz([6, 8, 6, 4]), '?pedunculo_d': lz([-16, -20, -16, -12]), '?pedunculo_e': lz([-16, -20, -16, -12]) },
    andar: { ...marcha(ly, [20, 0, -20, 0]), ...pin(lr, [0, 4, 0, 4], [0, 4, 0, 4]) },
    parado: { ...pin(lr, [0, 6], [0, 4]) },
  };
  return montar(somar(movBase({ mole: 0.7, ...o }), membros, extra), {}, { comp: 1, larg: 1, cabeca: 1, frontal: 1, olho: 1.6, ...o.mapa });
}
