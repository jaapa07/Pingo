/**
 * Corpo "chibi" de RPG portátil: cabeça grande, corpo pequeno, esqueleto padrão.
 * Ossos: root > escala > ajuste > corpo > (pernaD, pernaE, tronco > (cabeca, bracoD > maoD > prop, bracoE > maoE)).
 * Ossos de visibilidade (escala 1 em repouso; as animações os encolhem quando não são usados):
 * bocaN/bocaF/bocaB, sobrD/sobrE, oculos, prop, e — só no jogador — vBike, vCanoa, vRemo, vCuia, vMascara.
 */
import { Rig, blob, limb, lathe, tube, slab, ring, olho, taper, tom } from '../../../render/sculpt';
import { R_PELE, R_CAB, R_A, R_B, R_D } from './paletas';
import { HY, cabelo, barba, chapeu, sobre, pescoco, costas, prop, COBRE } from './pecas';
import type { Cabelo, Barba, Chapeu, Sobre, Pescoco, Costas, Prop } from './pecas';

export type Porte = 'crianca' | 'jovem' | 'adulto' | 'forte' | 'idoso' | 'magro';
export const HIP = 0.3;

export interface PorteDef { e: [number, number, number]; cab: number; perna: number; tronco: number; cabBat: number; curva: number }
/** e = escala [prof, alt, larg]; cab = escala da cabeça; proporções de batalha: perna/tronco esticam, cabBat encolhe a cabeça */
export const PORTES: Record<Porte, PorteDef> = {
  crianca: { e: [0.92, 0.86, 0.95], cab: 1.08, perna: 1.3, tronco: 1.15, cabBat: 0.9, curva: 0 },
  jovem: { e: [0.94, 0.94, 0.94], cab: 1.04, perna: 1.36, tronco: 1.22, cabBat: 0.84, curva: 0 },
  adulto: { e: [1, 1, 1], cab: 1, perna: 1.42, tronco: 1.3, cabBat: 0.8, curva: 0 },
  magro: { e: [0.92, 1.03, 0.9], cab: 1.02, perna: 1.5, tronco: 1.3, cabBat: 0.8, curva: 0 },
  forte: { e: [1.12, 1.02, 1.17], cab: 0.92, perna: 1.36, tronco: 1.34, cabBat: 0.82, curva: 0 },
  idoso: { e: [1, 0.93, 1], cab: 1.04, perna: 1.3, tronco: 1.22, cabBat: 0.84, curva: -7 },
};

export interface Visual {
  porte?: Porte;
  cabelo?: Cabelo; rCabelo?: number; laco?: number;
  barba?: Barba; rBarba?: number;
  sobrancelha?: 'fina' | 'grossa' | 'nenhuma';
  oculos?: number; // rampa da armação
  brinco?: number;
  chapeu?: Chapeu; rChapeu?: number; rChapeuFaixa?: number;
  chapeu2?: Chapeu; rChapeu2?: number; rChapeu2Faixa?: number;
  manga?: 'curta' | 'longa' | 'sem'; rTorso?: number; rManga?: number;
  /** faixa horizontal no peito (rampa) */
  listra?: number;
  luvas?: number;
  baixo?: 'calca' | 'short' | 'saia' | 'saia-longa' | 'bombacha' | 'sunga'; rBaixo?: number; rBarra?: number;
  pes?: 'sapato' | 'bota' | 'sandalia' | 'descalco'; rPes?: number;
  cinto?: number;
  sobre?: Sobre; rSobre?: number; rSobreFaixa?: number;
  sobre2?: Sobre; rSobre2?: number; rSobre2Faixa?: number;
  pescoco?: Pescoco; rPescoco?: number; rPescocoFaixa?: number;
  costas?: Costas; rCostas?: number; rCostasFaixa?: number;
  prop?: Prop; rProp?: number; rPropFaixa?: number; propNoMapa?: boolean;
  /** pose de repouso do braço que segura o objeto (graus para a frente) */
  propBraco?: number;
}

export function construir(v: Visual, escuro: number, jogador: boolean): Rig {
  const r = new Rig('root');
  const P = PORTES[v.porte ?? 'adulto'];
  const pele = tom(R_PELE), peleS = tom(R_PELE, { vies: -1 });
  const esc = tom(escuro, { vies: -1 });
  const rT = v.rTorso ?? R_A, rB = v.rBaixo ?? R_B;
  const longa = v.manga === 'longa' || v.sobre === 'jaleco';
  const rM = v.rManga ?? (v.sobre === 'jaleco' ? (v.rSobre ?? R_D) : rT);
  const baixo = v.baixo ?? 'calca';
  const pes = v.pes ?? 'sapato';
  const rPes = v.rPes ?? escuro;

  r.bone('escala', 'root').scale.set(...P.e);
  r.bone('ajuste', 'escala');
  r.bone('corpo', 'ajuste', [0, HIP, 0]);
  r.bone('tronco', 'corpo', [0, 0.02, 0], [0, 0, P.curva]);
  r.bone('cabeca', 'tronco', [0, 0.31, 0], [0, 0, -P.curva]).scale.set(P.cab / P.e[0], P.cab / P.e[1], P.cab / P.e[2]);
  for (const [L, s] of [['D', 1], ['E', -1]] as const) {
    r.bone('perna' + L, 'corpo', [0, 0, 0.088 * s]);
    r.bone('braco' + L, 'tronco', [0, 0.25, 0.21 * s], [-9 * s, 0, 0]);
    r.bone('mao' + L, 'braco' + L, [0, -0.235, 0]);
  }
  r.bone('prop', 'maoD', [0, 0, 0], [0, 0, -(v.propBraco ?? 0)]);

  /* tronco e quadril */
  r.add('tronco', blob([0.135, 0.2, 0.212], tom(rT), { pos: [0, 0.14, 0], deform: [taper('y', -0.2, 0.2, 1.04, 0.9)] }));
  if (v.listra !== undefined) r.add('tronco', lathe([[0.205, 0.2], [0.21, 0.13], [0.2, 0.13], [0.195, 0.2]], tom(v.listra), { scale: [0.69, 1, 1.01], seg: 20 }));
  r.add('corpo', blob([0.13, 0.105, 0.188], tom(baixo === 'sunga' ? rB : baixo === 'saia' || baixo === 'saia-longa' ? rB : rB), { pos: [0, 0.005, 0] }));
  if (v.cinto !== undefined) r.add('corpo', lathe([[0.2, 0.1], [0.205, 0.045], [0.19, 0.045], [0.19, 0.1]], tom(v.cinto), { scale: [0.7, 1, 1], seg: 20 }), blob([0.02, 0.03, 0.035], tom(R_D, { vies: 1 }), { pos: [0.14, 0.07, 0] }));
  if (baixo === 'saia') r.add('corpo', lathe([[0.001, 0.08], [0.175, 0.07], [0.26, -0.13], [0.25, -0.15], [0.001, -0.13]], tom(rB), { scale: [0.74, 1, 1], seg: 20 }));
  if (baixo === 'saia-longa') r.add('corpo', lathe([[0.001, 0.08], [0.175, 0.07], [0.27, -0.23], [0.26, -0.25], [0.001, -0.22]], tom(rB), { scale: [0.74, 1, 1], seg: 20 }));
  if ((baixo === 'saia' || baixo === 'saia-longa') && v.rBarra !== undefined) { const y = baixo === 'saia' ? -0.1 : -0.2; r.add('corpo', lathe([[0.25, y + 0.03], [0.272, y - 0.03], [0.262, y - 0.05], [0.24, y + 0.02]], tom(v.rBarra), { scale: [0.75, 1, 1.01], seg: 20 })); }

  /* pernas e pés */
  for (const L of ['D', 'E']) {
    const b = 'perna' + L;
    if (baixo === 'calca') r.add(b, limb(0.2, 0.08, 0.072, tom(rB)));
    else if (baixo === 'bombacha') r.add(b, limb(0.17, 0.085, 0.1, tom(rB)));
    else { r.add(b, limb(0.2, 0.066, 0.06, pele)); if (baixo === 'short') r.add(b, limb(0.07, 0.083, 0.082, tom(rB))); }
    if (pes === 'bota') r.add(b, limb(0.1, 0.08, 0.078, tom(rPes), { pos: [0, -0.12, 0] }));
    const pe = pes === 'descalco' || pes === 'sandalia' ? pele : tom(rPes);
    r.add(b, blob([0.1, 0.058, 0.078], pe, { pos: [0.035, -0.242, 0] }));
    if (pes === 'sandalia') r.add(b, blob([0.105, 0.025, 0.082], tom(rPes), { pos: [0.035, -0.28, 0] }), blob([0.035, 0.03, 0.08], tom(rPes), { pos: [0.05, -0.215, 0] }));
  }

  /* braços */
  for (const L of ['D', 'E']) {
    const b = 'braco' + L;
    if (longa) r.add(b, limb(0.19, 0.066, 0.06, tom(rM)));
    else {
      r.add(b, limb(0.19, 0.058, 0.054, pele));
      if (v.manga !== 'sem') r.add(b, blob([0.076, 0.085, 0.076], tom(rM), { pos: [0, -0.025, 0] }));
    }
    r.add(b, blob([0.062, 0.062, 0.062], v.luvas !== undefined ? tom(v.luvas) : pele, { pos: [0, -0.225, 0] }));
  }

  /* cabeça */
  const cb = 'cabeca';
  r.add(cb, blob([0.275, 0.27, 0.3], pele, { pos: [0, HY, 0] }),
    blob([0.045, 0.065, 0.035], pele, { pos: [-0.02, HY - 0.03, 0.3] }), blob([0.045, 0.065, 0.035], pele, { pos: [-0.02, HY - 0.03, -0.3] }),
    blob([0.035, 0.03, 0.035], pele, { pos: [0.268, HY - 0.075, 0] }),
    olho('D', 0.033, [0.252, HY - 0.05, 0.108]), olho('E', 0.033, [0.252, HY - 0.05, -0.108]));
  if (v.brinco !== undefined) r.add(cb, blob([0.03, 0.04, 0.03], tom(v.brinco, { vies: 1 }), { pos: [-0.02, HY - 0.11, 0.31] }), blob([0.03, 0.04, 0.03], tom(v.brinco, { vies: 1 }), { pos: [-0.02, HY - 0.11, -0.31] }));
  const rCab = v.rCabelo ?? R_CAB;
  // sobrancelhas (giram nas expressões) e bocas (uma visível por expressão)
  const sob = v.sobrancelha ?? 'fina';
  for (const [L, s] of [['D', 1], ['E', -1]] as const) {
    r.bone('sobr' + L, cb, [0.266, HY + 0.045, 0.108 * s]);
    if (sob !== 'nenhuma') r.add('sobr' + L, blob([0.02, sob === 'grossa' ? 0.021 : 0.015, 0.062], tom(v.cabelo === 'careca' ? escuro : rCab, { vies: -1 })));
  }
  r.bone('bocaN', cb, [0.262, HY - 0.15, 0]);
  r.bone('bocaF', cb, [0.262, HY - 0.15, 0]);
  r.bone('bocaB', cb, [0.262, HY - 0.15, 0]);
  r.add('bocaN', blob([0.02, 0.016, 0.05], peleS));
  r.add('bocaF', tube([[-0.012, 0.014, -0.062], [0.004, -0.014, 0], [-0.012, 0.014, 0.062]], 0.013, esc, { seg: 8, radial: 6 }));
  r.add('bocaB', blob([0.02, 0.017, 0.062], esc, { pos: [0, -0.01, 0] }));
  r.bone('oculos', cb);
  if (v.oculos !== undefined) {
    const mo = tom(v.oculos, { plano: true });
    r.add('oculos', ring(0.066, 0.014, mo, { pos: [0.268, HY - 0.035, 0.118], rot: [0, 78, 0] }), ring(0.066, 0.014, mo, { pos: [0.268, HY - 0.035, -0.118], rot: [0, 102, 0] }), blob([0.012, 0.012, 0.05], mo, { pos: [0.285, HY - 0.03, 0] }));
  }
  const cobre = v.chapeu ? COBRE[v.chapeu] : false;
  if (v.cabelo !== 'careca') r.add(cb, ...cabelo(v.cabelo ?? 'curto', tom(rCab), cobre, v.laco !== undefined ? tom(v.laco) : undefined));
  if (v.barba) r.add(cb, ...barba(v.barba, tom(v.rBarba ?? rCab)));
  if (v.chapeu) r.add(cb, ...chapeu(v.chapeu, tom(v.rChapeu ?? R_D), tom(v.rChapeuFaixa ?? R_A), esc));
  if (v.chapeu2) r.add(cb, ...chapeu(v.chapeu2, tom(v.rChapeu2 ?? R_D), tom(v.rChapeu2Faixa ?? R_A), esc));

  /* roupas por cima, pescoço, costas, mão */
  if (v.sobre) r.add('tronco', ...sobre(v.sobre, tom(v.rSobre ?? R_D), tom(v.rSobreFaixa ?? rT)));
  if (v.sobre2) r.add('tronco', ...sobre(v.sobre2, tom(v.rSobre2 ?? R_D), tom(v.rSobre2Faixa ?? rT)));
  if (v.pescoco) r.add('tronco', ...pescoco(v.pescoco, tom(v.rPescoco ?? R_D), tom(v.rPescocoFaixa ?? R_D, { vies: 1 })));
  if (v.costas) r.add('tronco', ...costas(v.costas, tom(v.rCostas ?? R_D), tom(v.rCostasFaixa ?? R_B)));
  if (v.prop) r.add('prop', ...prop(v.prop, tom(v.rProp ?? R_D), tom(v.rPropFaixa ?? R_A), esc));

  if (jogador) veiculos(r, escuro);
  // sem sombra projetada: o sombreado vem só da forma (faixas limpas, sem manchas no rosto)
  r.root.traverse((o) => { o.castShadow = false; });
  return r;
}

/** Bicicleta de bambu, canoa, remo, cuia na mão e máscara de mergulho do jogador. */
function veiculos(r: Rig, escuro: number) {
  const bambu = tom(R_D), no = tom(R_D, { vies: -1 }), pneu = tom(escuro), cor = tom(R_A);
  r.bone('vBike', 'root');
  for (const x of [0.3, -0.3]) r.add('vBike', ring(0.125, 0.038, pneu, { pos: [x, 0.165, 0] }), blob([0.035, 0.035, 0.05], no, { pos: [x, 0.165, 0] }));
  const q = (a: [number, number, number], b: [number, number, number], rr = 0.028) => tube([a, b], rr, bambu, { seg: 3, radial: 7 });
  r.add('vBike', q([-0.3, 0.165, 0], [-0.1, 0.42, 0]), q([-0.1, 0.42, 0], [0.2, 0.44, 0]), q([0.2, 0.5, 0], [0.3, 0.165, 0]), q([-0.1, 0.42, 0], [0.02, 0.17, 0]), q([0.02, 0.17, 0], [0.2, 0.44, 0]), q([-0.3, 0.165, 0], [0.02, 0.17, 0]),
    tube([[0.2, 0.52, -0.17], [0.2, 0.52, 0.17]], 0.026, no, { seg: 3, radial: 7 }), blob([0.09, 0.03, 0.06], pneu, { pos: [-0.11, 0.45, 0] }),
    blob([0.04, 0.04, 0.02], cor, { pos: [0.02, 0.17, 0.06] }), blob([0.04, 0.04, 0.02], cor, { pos: [0.02, 0.17, -0.06] }));

  r.bone('vCanoa', 'root', [0, 0.05, 0]);
  const casco = (p: { x: number; y: number }) => { if (p.y > 0.03) p.y = 0.03 + (p.y - 0.03) * 0.12; p.y += (p.x / 0.5) ** 2 * 0.09; };
  const borda: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, x = Math.cos(a) * 0.46; borda.push([x, 0.2 + (x / 0.5) ** 2 * 0.09, Math.sin(a) * 0.175]); }
  r.add('vCanoa', blob([0.5, 0.17, 0.2], bambu, { pos: [0, 0.16, 0], deform: [casco] }), tube(borda, 0.034, tom(R_B), { seg: 36, radial: 6, closed: true }), blob([0.36, 0.02, 0.12], no, { pos: [0, 0.2, 0] }));

  r.bone('vRemo', 'tronco', [0.14, 0.12, 0]);
  r.add('vRemo', tube([[0, -0.24, 0], [0, 0.3, 0]], 0.024, bambu, { seg: 3, radial: 7 }), blob([0.03, 0.1, 0.075], cor, { pos: [0, -0.3, 0] }), blob([0.035, 0.03, 0.05], no, { pos: [0, 0.3, 0] }));

  r.bone('vCuia', 'maoD', [0.02, -0.05, 0]);
  r.add('vCuia', blob([0.08, 0.075, 0.08], bambu), ring(0.076, 0.02, cor, { rot: [90, 0, 0], pos: [0, 0.01, 0] }), blob([0.025, 0.03, 0.025], no, { pos: [0, 0.075, 0] }));

  r.bone('vMascara', 'cabeca');
  r.add('vMascara', blob([0.05, 0.085, 0.2], tom(R_B, { vies: 1 }), { pos: [0.26, HY - 0.02, 0] }), ring(0.29, 0.03, pneu, { pos: [-0.01, HY - 0.0, 0], rot: [90, 0, 0], scale: [1, 1.08, 1] }),
    tube([[0.1, HY - 0.1, 0.31], [0.08, HY + 0.2, 0.33], [0.05, HY + 0.38, 0.33]], 0.028, cor, { seg: 8, radial: 6 }));
}
