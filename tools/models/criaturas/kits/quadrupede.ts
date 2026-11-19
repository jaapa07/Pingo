/**
 * Anatomia QUADRÚPEDE (tamanduá, lobo, cutia, anta, onça, capivara, tatu...).
 * Ossos: base → corpo → pescoco → cabeca → orelha_d/e · corpo → cauda1..N · corpo → perna_fd/fe/td/te → canela_*.
 */
import { blob, taper, type V3 } from '../../../render/sculpt';
import { novoRig, perna, cauda, segmento, olhos, par, tom, type Kit, type CaudaP } from './base';
import { movBase, somar, montar, type MapaChibi, lz, ly, lr, qz, qy, qr, qp, lp, amp, type BaseP, type Mov, type Faixas, type AnimsCriatura } from './animacao';

export interface QuadrupedeP {
  /** semi-eixos do tronco [comprimento, altura, largura] */ tronco: V3;
  /** peito mais cheio (>1) ou garupa mais cheia (<1): fator de afinamento ao longo de X */ peito?: number;
  pernas: {
    /** altura do quadril ao chão */ alt: number;
    /** raio no quadril e no tornozelo */ r: number; rFim?: number;
    /** posição dos pares ao longo do tronco (fração do semi-comprimento) */ xF?: number; xT?: number;
    /** afastamento lateral (fração da semi-largura) */ z?: number;
    /** dobra dos joelhos da frente e dos jarretes de trás (graus) */ dobraF?: number; dobraT?: number;
    /** pé [comp, alt, larg] */ pe?: V3;
  };
  pescoco: { /** comprimento */ len: number; /** graus acima da horizontal */ ang: number; r: number; /** de onde sai, em frações do tronco */ x?: number; y?: number };
  cabeca: V3;
  focinho?: { len: number; r0: number; r1: number; /** graus para baixo */ cai?: number; /** altura na cabeça (fração) */ y?: number; nariz?: number };
  orelha?: { tipo: 'redonda' | 'ponta'; alt: number; larg: number; /** posição na cabeça (frações) */ x?: number; z?: number; /** graus para fora / para trás */ abre?: number; deita?: number };
  cauda?: Omit<CaudaP, 'mat' | 'matPonta'>;
  /** marcador do olho direito no espaço da cabeça */ olho: { r: number; pos: V3 };
  /** índices de rampa por parte (o que faltar herda de `pelo`) */
  rampas: { pelo: number; barriga?: number; pernaF?: number; pernaT?: number; canelaF?: number; canelaT?: number; pe?: number; cabeca?: number; focinho?: number; nariz?: number; orelha?: number; orelhaDentro?: number; cauda?: number; caudaPonta?: number };
}

export type RefQuadrupede = 'dorso' | 'garupa' | 'cernelha' | 'peito' | 'ventre' | 'testa' | 'topo' | 'nuca' | 'bochecha' | 'pontaFocinho';

export function quadrupede(p: QuadrupedeP): Kit<RefQuadrupede> {
  const [tx, ty, tz] = p.tronco;
  const R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pelo);
  const rig = novoRig(p.pernas.alt + ty * 0.5);
  // tronco + barriga clara
  rig.add('corpo', blob([tx, ty, tz], t(R.pelo), { deform: [taper('x', -tx, tx, 2 - (p.peito ?? 1), p.peito ?? 1)] }));
  if (R.barriga !== undefined) rig.add('corpo', blob([tx * 0.8, ty * 0.7, tz * 0.86], t(R.barriga), { pos: [tx * 0.06, -ty * 0.4, 0] }));
  // pernas
  const pe = p.pernas.pe ?? [p.pernas.r * 1.25, p.pernas.r * 0.6, p.pernas.r * 1.1];
  const rF = p.pernas.rFim ?? p.pernas.r * 0.8;
  par((l, s) => {
    perna(rig, 'perna_f' + l, 'corpo', [tx * (p.pernas.xF ?? 0.55), -ty * 0.5, tz * (p.pernas.z ?? 0.62) * s],
      { alt: p.pernas.alt, r0: p.pernas.r, r1: (p.pernas.r + rF) / 2, r2: rF, dobra: p.pernas.dobraF ?? 8, pe: { r: pe, x: pe[0] * 0.35 }, mCoxa: t(R.pernaF), mCanela: t(R.canelaF ?? R.pernaF), mPe: t(R.pe ?? R.canelaF ?? R.pernaF) });
    perna(rig, 'perna_t' + l, 'corpo', [tx * (p.pernas.xT ?? -0.55), -ty * 0.5, tz * (p.pernas.z ?? 0.62) * s],
      { alt: p.pernas.alt, r0: p.pernas.r * 1.1, r1: (p.pernas.r + rF) / 2, r2: rF, dobra: p.pernas.dobraT ?? -22, pe: { r: pe, x: pe[0] * 0.35 }, mCoxa: t(R.pernaT), mCanela: t(R.canelaT ?? R.pernaT), mPe: t(R.pe ?? R.canelaT ?? R.pernaT) });
  });
  // pescoço e cabeça
  const a = (p.pescoco.ang * Math.PI) / 180;
  const pp: V3 = [tx * (p.pescoco.x ?? 0.6), ty * (p.pescoco.y ?? 0.25), 0];
  const fim: V3 = [Math.cos(a) * p.pescoco.len, Math.sin(a) * p.pescoco.len, 0];
  rig.bone('pescoco', 'corpo', pp);
  rig.add('pescoco', segmento([-fim[0] * 0.25, -fim[1] * 0.25, 0], fim, p.pescoco.r * 1.15, p.pescoco.r, t(R.pelo)));
  rig.bone('cabeca', 'pescoco', fim);
  const [cx, cy, cz] = p.cabeca;
  rig.add('cabeca', blob([cx, cy, cz], t(R.cabeca), { pos: [cx * 0.25, 0, 0] }));
  let ponta: V3 = [cx * 1.25, 0, 0];
  if (p.focinho) {
    const c = ((p.focinho.cai ?? 10) * Math.PI) / 180, y0 = cy * (p.focinho.y ?? -0.2);
    const b0: V3 = [cx * 0.75, y0, 0];
    ponta = [b0[0] + Math.cos(c) * p.focinho.len, y0 - Math.sin(c) * p.focinho.len, 0];
    rig.add('cabeca', segmento(b0, ponta, p.focinho.r0, p.focinho.r1, t(R.focinho ?? R.cabeca)));
    if (p.focinho.nariz) rig.add('cabeca', blob([p.focinho.nariz, p.focinho.nariz * 0.85, p.focinho.nariz], tom(R.nariz ?? R.pe ?? R.pelo, { plano: true }), { pos: [ponta[0] + p.focinho.r1 * 0.5, ponta[1] + p.focinho.r1 * 0.2, 0], seg: 12 }));
  }
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  if (p.orelha) {
    const o = p.orelha;
    par((l, s) => {
      rig.bone('orelha_' + l, 'cabeca', [cx * (o.x ?? 0), cy * 0.72, cz * (o.z ?? 0.62) * s], [(o.abre ?? 20) * s, 0, o.deita ?? 10]);
      if (o.tipo === 'redonda') {
        rig.add('orelha_' + l, blob([o.larg * 0.5, o.alt * 0.5, o.larg * 0.28], t(R.orelha), { pos: [0, o.alt * 0.4, 0], seg: 16 }));
        if (R.orelhaDentro !== undefined) rig.add('orelha_' + l, blob([o.larg * 0.3, o.alt * 0.32, o.larg * 0.2], tom(R.orelhaDentro, { plano: true }), { pos: [o.larg * 0.14, o.alt * 0.4, o.larg * 0.12 * s], seg: 12 }));
      } else {
        const perfil = (k: number): [V3, V3, number, number] => [[0, 0, 0], [0, o.alt * k, 0], o.larg * 0.5 * k, o.larg * 0.08];
        const [a0, a1, r0, r1] = perfil(1);
        const e = segmento(a1, a0, r1, r0, t(R.orelha)); e.scale.z = 0.5; rig.add('orelha_' + l, e);
        if (R.orelhaDentro !== undefined) { const [b0, b1, q0, q1] = perfil(0.72); const i = segmento(b1, b0, q1, q0, tom(R.orelhaDentro, { plano: true })); i.scale.z = 0.5; i.position.x += o.larg * 0.16; i.position.z += o.larg * 0.06 * s; rig.add('orelha_' + l, i); }
      }
    });
  }
  if (p.cauda) cauda(rig, 'corpo', [-tx * 0.88, ty * 0.15, 0], { ...p.cauda, mat: t(R.cauda), matPonta: t(R.caudaPonta ?? R.cauda) });
  return {
    rig,
    ref: {
      dorso: [0, ty, 0], garupa: [-tx * 0.6, ty * 0.8, 0], cernelha: [tx * 0.5, ty * 0.85, 0], peito: [tx * 0.9, -ty * 0.1, 0], ventre: [0, -ty, 0],
      testa: [cx * 0.95, cy * 0.5, 0], topo: [cx * 0.25, cy, 0], nuca: [-cx * 0.6, cy * 0.4, 0], bochecha: [cx * 0.5, -cy * 0.35, cz * 0.85], pontaFocinho: ponta,
    },
  };
}

export interface AnimQuadP extends BaseP {
  /** altura das pernas (a mesma de pernas.alt): quanto o corpo arria no desmaio */ hPerna: number;
  /** amplitude do passo em graus (padrão 26) */ passo?: number;
  /** quanto a cauda balança (1 = padrão) */ cauda?: number;
  /** proporções da miniatura de mapa */ mapa?: MapaChibi;
}

/** Animações do quadrúpede. `extra` soma/sobrescreve faixas por movimento (chave `todas` vale para todos). */
export function animsQuadrupede(o: AnimQuadP, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const h = o.hPerna, ps = o.passo ?? 26, c = o.cauda ?? 1;
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: {
      pescoco: qz([-10, 12, -12, 4, 0]),
      perna_fd: qz([0, 30, -14, 0, 0]), perna_fe: qz([0, 30, -14, 0, 0]), perna_td: qz([0, -30, 14, 0, 0]), perna_te: qz([0, -30, 14, 0, 0]),
      '?cauda1': qz(amp(c, [0, 12, -14, -5, 0])),
    },
    idle: {
      pescoco: lz([0, -2, -4, -1]), cabeca: lz([0, -1, -3, 1]),
      '?cauda1': ly(amp(c, [0, 10, 3, -9])), '?cauda2': lz(amp(c, [0, -5, -8, -3])),
      '?orelha_d': lz([0, 0, 0, -14]), '?orelha_e': lz([0, 0, 0, -14]),
    },
    fisico: {
      pescoco: qz([8, 16, -18, -8, 0]), cabeca: qz([4, 8, -12, -4, 0]),
      perna_fd: qz([-10, -18, 30, 16, 0]), perna_fe: qz([-6, -12, 22, 10, 0]), canela_fd: qz([10, 25, -20, -8, 0]), canela_fe: qz([10, 25, -20, -8, 0]),
      perna_td: qz([8, 16, -30, -12, 0]), perna_te: qz([8, 16, -26, -10, 0]),
      '?cauda1': qz(amp(c, [4, 9, -14, -6, 0])),
    },
    especial: {
      pescoco: qz([-8, -16, -18, 24, 10, 0]), cabeca: qz([-4, -8, -8, 14, 4, 0]),
      perna_fd: qz([6, 12, 12, -8, -3, 0]), perna_fe: qz([6, 12, 12, -8, -3, 0]), perna_td: qz([-6, -12, -12, 8, 3, 0]), perna_te: qz([-6, -12, -12, 8, 3, 0]),
      '?cauda1': qz(amp(c, [-6, -14, -18, -40, -16, 0])), '?cauda2': qz(amp(c, [0, -8, -10, -20, -8, 0])),
      '?orelha_d': qz([0, 14, 14, -18, -6, 0]), '?orelha_e': qz([0, 14, 14, -18, -6, 0]),
    },
    dano: {
      pescoco: qz([20, 8, 0]), cabeca: qz([10, 4, 0]),
      perna_fd: qz([26, 10, 0]), perna_fe: qz([18, 6, 0]), perna_td: qz([-8, -3, 0]), perna_te: qz([-8, -3, 0]),
      '?cauda1': qz(amp(c, [14, 6, 0])), '?orelha_d': qz([22, 8, 0]), '?orelha_e': qz([22, 8, 0]),
    },
    desmaio: {
      corpo: qp([[0, 0.02 * h, 0], [0, 0, 0], [0, -0.3 * h, 0], [0, -0.62 * h, 0], [0, -0.58 * h, 0]]),
      pescoco: qz([8, -8, -24, -42, -38]), cabeca: qz([4, -4, -10, -16, -14]),
      perna_fd: qr([[0, 0, 0], [0, 0, 6], [-6, 0, 24], [-12, 0, 56], [-12, 0, 52]]), perna_fe: qr([[0, 0, 0], [0, 0, 6], [6, 0, 24], [12, 0, 56], [12, 0, 52]]),
      perna_td: qr([[0, 0, 0], [0, 0, -6], [-6, 0, -24], [-12, 0, -56], [-12, 0, -52]]), perna_te: qr([[0, 0, 0], [0, 0, -6], [6, 0, -24], [12, 0, -56], [12, 0, -52]]),
      '?cauda1': qz(amp(c, [-10, 6, 18, 30, 28])), '?orelha_d': qz([0, 8, 18, 28, 26]), '?orelha_e': qz([0, 8, 18, 28, 26]),
    },
    status: {
      pescoco: lz([-12, -15, -12, -9]), cabeca: lr([[6, 0, -6], [0, 0, -8], [-6, 0, -6], [0, 0, -4]]),
      '?cauda1': lz(amp(c, [14, 16, 14, 12])), '?orelha_d': lz([16, 18, 16, 14]), '?orelha_e': lz([16, 18, 16, 14]),
    },
    andar: {
      perna_fd: lz([ps, 0, -ps, 0]), perna_te: lz([ps * 0.9, 0, -ps * 0.9, 0]),
      perna_fe: lz([-ps, 0, ps, 0]), perna_td: lz([-ps * 0.9, 0, ps * 0.9, 0]),
      // a canela dobra no quadro em que a perna passa pelo ar
      canela_fd: lz([0, 0, 0, -ps * 1.2]), canela_te: lz([0, 0, 0, -ps * 1.2]), canela_fe: lz([0, -ps * 1.2, 0, 0]), canela_td: lz([0, -ps * 1.2, 0, 0]),
      pescoco: lz([0, -3, 0, -3]), '?cauda1': ly(amp(c, [8, 0, -8, 0])),
    },
    parado: { pescoco: lz([0, -3]), '?cauda1': ly(amp(c, [0, 8])) },
  };
  return montar(somar(movBase(o), membros, extra), {}, o.mapa);
}

