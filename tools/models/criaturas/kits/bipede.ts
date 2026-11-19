/**
 * Anatomia BÍPEDE (bichos que lutam de pé: quati erguido, tatu de pé, ema-lutadora, criaturas de folclore).
 * Ossos: base → corpo → pescoco → cabeca → orelha_d/e · corpo → braco_d/e → antebraco_d/e ·
 *        corpo → perna_d/e → canela_d/e · corpo → cauda1..N.
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, perna, cauda, segmento, olhos, par, tom, type Kit, type CaudaP } from './base';
import { movBase, somar, montar, lz, lr, qz, qr, qp, type BaseP, type Mov, type Faixas, type AnimsCriatura, type MapaChibi } from './animacao';

export interface BipedeP {
  /** semi-eixos do tronco [profundidade, altura, largura] */ tronco: V3;
  pernas: { alt: number; r: number; z?: number; dobra?: number; pe?: V3 };
  bracos: { len: number; r: number; /** graus de abertura lateral em repouso */ abre?: number; mao?: number; dobra?: number };
  pescoco: { len: number; r: number; /** avanço em graus (0 = reto para cima) */ ang?: number };
  cabeca: V3;
  focinho?: { len: number; r0: number; r1: number; cai?: number; y?: number; nariz?: number };
  orelha?: { alt: number; larg: number; z?: number; abre?: number };
  cauda?: Omit<CaudaP, 'mat' | 'matPonta'>;
  olho: { r: number; pos: V3 };
  rampas: { pelo: number; barriga?: number; cabeca?: number; focinho?: number; nariz?: number; braco?: number; mao?: number; perna?: number; pe?: number; orelha?: number; cauda?: number; caudaPonta?: number };
}
export type RefBipede = 'peito' | 'costas' | 'ombro' | 'topo' | 'testa' | 'nuca' | 'pontaFocinho' | 'mao' | 'cintura';

export function bipede(p: BipedeP): Kit<RefBipede> {
  const [tx, ty, tz] = p.tronco, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pelo);
  const rig = novoRig(p.pernas.alt + ty * 0.85);
  rig.add('corpo', blob([tx, ty, tz], t(R.pelo), { deform: [(v) => { if (v.y < 0) { v.x *= 1.08; v.z *= 1.08; } }] }));
  if (R.barriga !== undefined) rig.add('corpo', blob([tx * 0.8, ty * 0.78, tz * 0.82], t(R.barriga), { pos: [tx * 0.3, -ty * 0.1, 0] }));
  const pe = p.pernas.pe ?? [p.pernas.r * 1.5, p.pernas.r * 0.6, p.pernas.r * 1.1];
  par((l, s) => {
    perna(rig, 'perna_' + l, 'corpo', [0, -ty * 0.85, tz * (p.pernas.z ?? 0.55) * s],
      { alt: p.pernas.alt, r0: p.pernas.r * 1.15, r1: p.pernas.r, r2: p.pernas.r * 0.85, dobra: p.pernas.dobra ?? 10, pe: { r: pe, x: pe[0] * 0.4 }, mCoxa: t(R.perna), mCanela: t(R.perna), mPe: t(R.pe ?? R.perna) });
    const b = p.bracos, ab = ((b.abre ?? 14) * Math.PI) / 180;
    rig.bone('braco_' + l, 'corpo', [tx * 0.1, ty * 0.6, tz * 0.92 * s], [-(b.abre ?? 14) * s, 0, 0]);
    const c = ((b.dobra ?? 12) * Math.PI) / 180, h = b.len / 2;
    rig.add('braco_' + l, segmento([0, 0, 0], [-Math.sin(c) * h * 0.3, -h, 0], b.r, b.r * 0.9, t(R.braco)));
    rig.bone('antebraco_' + l, 'braco_' + l, [-Math.sin(c) * h * 0.3, -h, 0]);
    rig.add('antebraco_' + l, segmento([0, 0, 0], [Math.sin(c) * h, -h, 0], b.r * 0.9, b.r * 0.8, t(R.braco)),
      blob([(b.mao ?? b.r * 1.25), (b.mao ?? b.r * 1.25), (b.mao ?? b.r * 1.25) * 0.9], t(R.mao ?? R.braco), { pos: [Math.sin(c) * h, -h, 0], seg: 14 }));
    void ab;
  });
  const a = ((p.pescoco.ang ?? 10) * Math.PI) / 180, fim: V3 = [Math.sin(a) * p.pescoco.len, Math.cos(a) * p.pescoco.len, 0];
  rig.bone('pescoco', 'corpo', [tx * 0.1, ty * 0.8, 0]);
  rig.add('pescoco', segmento([0, -ty * 0.2, 0], fim, p.pescoco.r * 1.1, p.pescoco.r, t(R.pelo)));
  rig.bone('cabeca', 'pescoco', fim);
  const [cx, cy, cz] = p.cabeca;
  rig.add('cabeca', blob([cx, cy, cz], t(R.cabeca), { pos: [cx * 0.15, cy * 0.6, 0] }));
  let ponta: V3 = [cx * 1.15, cy * 0.5, 0];
  if (p.focinho) {
    const f = p.focinho, c = ((f.cai ?? 8) * Math.PI) / 180, b0: V3 = [cx * 0.7, cy * (0.6 + (f.y ?? -0.25)), 0];
    ponta = [b0[0] + Math.cos(c) * f.len, b0[1] - Math.sin(c) * f.len, 0];
    rig.add('cabeca', segmento(b0, ponta, f.r0, f.r1, t(R.focinho ?? R.cabeca)));
    if (f.nariz) rig.add('cabeca', blob([f.nariz, f.nariz * 0.85, f.nariz], tom(R.nariz ?? R.pe ?? R.pelo, { plano: true }), { pos: [ponta[0] + f.r1 * 0.5, ponta[1] + f.r1 * 0.2, 0], seg: 12 }));
  }
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  if (p.orelha) {
    const o = p.orelha;
    par((l, s) => {
      rig.bone('orelha_' + l, 'cabeca', [-cx * 0.1, cy * 1.35, cz * (o.z ?? 0.65) * s], [(o.abre ?? 22) * s, 0, 8]);
      rig.add('orelha_' + l, blob([o.larg * 0.5, o.alt * 0.5, o.larg * 0.28], t(R.orelha), { pos: [0, o.alt * 0.4, 0], seg: 16 }));
    });
  }
  if (p.cauda) cauda(rig, 'corpo', [-tx * 0.8, -ty * 0.6, 0], { ...p.cauda, mat: t(R.cauda), matPonta: t(R.caudaPonta ?? R.cauda) });
  return {
    rig,
    ref: {
      peito: [tx, ty * 0.2, 0], costas: [-tx, ty * 0.2, 0], ombro: [tx * 0.1, ty * 0.6, tz * 0.92], cintura: [0, -ty * 0.6, 0],
      topo: [cx * 0.15, cy * 1.6, 0], testa: [cx, cy * 1.0, 0], nuca: [-cx * 0.8, cy * 0.8, 0], pontaFocinho: ponta, mao: [0, -p.bracos.len / 2, 0],
    },
  };
}

export interface AnimBipedeP extends BaseP { hPerna: number; mapa?: MapaChibi; cauda?: number }

export function animsBipede(o: AnimBipedeP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const h = o.hPerna;
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { braco_d: qz([-60, -120, 30, -10, 0]), braco_e: qz([-60, -120, 30, -10, 0]), perna_d: qz([30, -10, 20, 0, 0]), perna_e: qz([30, -10, 20, 0, 0]), pescoco: qz([-8, 8, -10, 3, 0]) },
    idle: { braco_d: lz([0, 3, 6, 2]), braco_e: lz([0, -3, -6, -2]), pescoco: lz([0, -1, -3, 0]), cabeca: lr([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, -10, 0]]), '?cauda1': lr([[0, 0, 0], [0, 8, -4], [0, 0, -8], [0, -8, -4]]) },
    // soco: recolhe o braço esquerdo (o da frente na câmera) e estica
    fisico: {
      braco_e: qz([-30, -50, 80, 60, 0]), antebraco_e: qz([70, 100, 5, 10, 0]), braco_d: qz([20, 30, -30, -10, 0]),
      pescoco: qz([4, 8, -10, -4, 0]), perna_e: qz([-6, -10, 22, 10, 0]), perna_d: qz([4, 8, -16, -6, 0]), '?cauda1': qz([6, 12, -18, -6, 0]),
    },
    especial: {
      braco_d: qr([[0, 0, 20], [20, 0, 40], [20, 0, 40], [-40, 0, 150], [-20, 0, 80], [0, 0, 0]]), braco_e: qr([[0, 0, 20], [-20, 0, 40], [-20, 0, 40], [40, 0, 150], [20, 0, 80], [0, 0, 0]]),
      antebraco_d: qz([30, 70, 70, 10, 20, 0]), antebraco_e: qz([30, 70, 70, 10, 20, 0]), pescoco: qz([-6, -12, -12, 14, 5, 0]),
    },
    dano: { pescoco: qz([16, 6, 0]), braco_d: qz([60, 20, 0]), braco_e: qz([70, 24, 0]), perna_e: qz([14, 5, 0]) },
    // senta e tomba para trás
    desmaio: {
      corpo: [...qp([[0, 0.02 * h, 0], [0, 0, 0], [0, -0.45 * h, 0], [0, -0.85 * h, 0], [0, -0.8 * h, 0]]), ...qz([4, -4, 14, 34, 30])],
      perna_d: qz([0, 10, 50, 100, 96]), perna_e: qz([0, 10, 55, 106, 102]), braco_d: qz([0, -10, -30, -50, -46]), braco_e: qz([0, -10, -36, -56, -52]), pescoco: qz([6, -6, -16, -28, -24]),
    },
    status: { pescoco: lz([-10, -12, -10, -8]), cabeca: lr([[8, 0, -4], [0, 0, -6], [-8, 0, -4], [0, 0, -2]]), braco_d: lz([4, 6, 4, 2]), braco_e: lz([4, 6, 4, 2]) },
    andar: {
      perna_d: lz([28, 0, -28, 0]), perna_e: lz([-28, 0, 28, 0]), canela_d: lz([0, 0, 0, -36]), canela_e: lz([0, -36, 0, 0]),
      braco_d: lz([-24, 0, 24, 0]), braco_e: lz([24, 0, -24, 0]), '?cauda1': lr([[0, 8, 0], [0, 0, 0], [0, -8, 0], [0, 0, 0]]),
    },
    parado: { pescoco: lz([0, -3]), braco_d: lz([0, 4]), braco_e: lz([0, -4]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 1.1, larg: 1.15, cabeca: 1.25, frontal: 1, ...o.mapa });
}
