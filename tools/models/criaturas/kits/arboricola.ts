/**
 * Anatomia MAMÍFERO ARBORÍCOLA (macaco-prego, bugio, sagui, mico-leão, preguiça, quati trepador).
 * Agachado sobre as pernas curtas, braços compridos que tocam o chão, cauda longa (preênsil ou não),
 * rosto em disco claro. `garras` troca as mãos por ganchos de preguiça.
 * Ossos iguais aos do bípede (braco_d/e → antebraco_d/e, perna_d/e → canela_d/e, pescoco, cabeca, orelha_d/e, cauda1..N),
 * então as animações partem das do bípede e somam braçadas longas e o balanço da cauda.
 */
import { blob, type V3 } from '../../../render/sculpt';
import { novoRig, membro2, cauda, segmento, olhos, par, tom, calota, type Kit, type CaudaP } from './base';
import { garra } from './partes';
import { animsBipede, type AnimBipedeP } from './bipede';
import { lz, lr, qz, qr, unirExtras, type Mov, type Faixas, type AnimsCriatura } from './animacao';

export interface ArboricolaP {
  /** semi-eixos do tronco [profundidade, altura, largura] */ tronco: V3;
  /** graus que o tronco se inclina para a frente (macaco ~35, preguiça ~15) */ curva?: number;
  /** pernas curtas dobradas: altura do quadril ao chão */ pernas: { alt: number; r: number; pe?: number };
  /** braços longos: comprimento total, raio e mão */ bracos: { len: number; r: number; mao?: number; /** nº de garras-gancho (preguiça: 2 ou 3) */ garras?: number };
  cabeca: V3;
  /** disco do rosto: fração da cabeça coberta (0 = sem) e focinho curto */ rosto?: number; focinho?: { len: number; r: number };
  orelha?: { r: number; z?: number; y?: number };
  cauda?: Omit<CaudaP, 'mat' | 'matPonta'>;
  olho: { r: number; pos: V3 };
  rampas: { pelo: number; barriga?: number; rosto?: number; maos?: number; cauda?: number; caudaPonta?: number; orelha?: number; garras?: number };
}
export type RefArboricola = 'costas' | 'peito' | 'topo' | 'testa' | 'ombro' | 'mao' | 'nuca';

export function arboricola(p: ArboricolaP): Kit<RefArboricola> {
  const [tx, ty, tz] = p.tronco, [cx, cy, cz] = p.cabeca, R = p.rampas, t = (i: number | undefined) => tom(i ?? R.pelo);
  const cv = ((p.curva ?? 30) * Math.PI) / 180;
  const rig = novoRig(p.pernas.alt + ty * 0.8);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, -(p.curva ?? 30)]);
  rig.add('tronco', blob([tx, ty, tz], t(R.pelo), { deform: [(v) => { if (v.y < 0) { v.x *= 1.12; v.z *= 1.1; } }] }));
  if (R.barriga !== undefined) rig.add('tronco', blob([tx * 0.75, ty * 0.75, tz * 0.8], t(R.barriga), { pos: [tx * 0.35, -ty * 0.05, 0] }));
  // ponto do ombro e do pescoço já no espaço de `corpo` (o tronco está inclinado)
  const giro = (x: number, y: number): [number, number] => [x * Math.cos(cv) + y * Math.sin(cv), -x * Math.sin(cv) + y * Math.cos(cv)];
  const [ox, oy] = giro(tx * 0.1, ty * 0.65), [nx, ny] = giro(tx * 0.1, ty * 0.9);
  const altOmbro = p.pernas.alt + ty * 0.8 + oy;
  par((l, s) => {
    // pernas curtas dobradas, pés para a frente
    const q = p.pernas, pe = q.pe ?? q.r * 1.6;
    const c = membro2(rig, 'perna_' + l, 'canela_' + l, 'corpo', [-tx * 0.2, -ty * 0.7, tz * 0.6 * s], [q.alt * 0.7, -q.alt * 0.25, q.r * 0.8 * s], [-q.alt * 0.25, -q.alt * 0.75 + ty * 0.1 + q.r * 0.2, 0], [q.r * 1.25, q.r, q.r * 0.85], t(R.pelo));
    rig.add(c, blob([pe, pe * 0.4, pe * 0.7], t(R.maos ?? R.pelo), { pos: [-q.alt * 0.25 + pe * 0.6, -q.alt * 0.75 + ty * 0.1 + q.r * 0.2, 0], seg: 12 }));
    // braços longos: descem do ombro até o chão, cotovelo para fora
    const b = p.bracos, mao = b.mao ?? b.r * 1.3, desce = altOmbro - mao * 0.7, h = desce / 2;
    const frente = Math.sqrt(Math.max(0.0004, (b.len / 2) ** 2 - h ** 2));
    const a = membro2(rig, 'braco_' + l, 'antebraco_' + l, 'corpo', [ox, oy, tz * 0.9 * s], [frente * 0.3, -h, b.r * 1.2 * s], [frente * 0.9, -h, -b.r * 0.4 * s], [b.r * 1.1, b.r, b.r * 0.9], t(R.pelo));
    rig.add(a, blob([mao * 1.2, mao * 0.7, mao], t(R.maos ?? R.pelo), { pos: [frente * 0.9 + mao * 0.3, -h, -b.r * 0.4 * s], seg: 12 }));
    for (let i = 0; i < (b.garras ?? 0); i++) rig.add(a, garra(mao * 2.2, mao * 0.3, tom(R.garras ?? R.maos ?? R.pelo), { pos: [frente * 0.9 + mao, -h + mao * 0.2, -b.r * 0.4 * s + (i - ((b.garras ?? 1) - 1) / 2) * mao * 0.7], curva: 0.8 }));
  });
  rig.bone('pescoco', 'corpo', [nx, ny, 0]);
  rig.add('pescoco', segmento([-nx * 0.3, -ty * 0.2, 0], [0, 0, 0], cx * 0.6, cx * 0.55, t(R.pelo)));
  rig.bone('cabeca', 'pescoco', [cx * 0.25, cy * 0.5, 0]);
  rig.add('cabeca', blob([cx, cy, cz], t(R.pelo)));
  if (p.rosto) rig.add('cabeca', calota([cx * 1.04, cy * 1.02, cz * 1.02], t(R.rosto ?? R.barriga), { de: 0, ate: p.rosto * 90, rot: [0, 0, -82] }));
  if (p.focinho) rig.add('cabeca', blob([p.focinho.len, p.focinho.r, p.focinho.r * 1.15], t(R.rosto ?? R.barriga), { pos: [cx * 0.85, -cy * 0.3, 0], seg: 14 }));
  olhos(rig, 'cabeca', p.olho.r, p.olho.pos);
  if (p.orelha) par((l, s) => {
    rig.bone('orelha_' + l, 'cabeca', [-cx * 0.1, cy * (p.orelha!.y ?? 0.2), cz * (p.orelha!.z ?? 0.95) * s]);
    rig.add('orelha_' + l, blob([p.orelha!.r * 0.5, p.orelha!.r, p.orelha!.r * 0.7], t(R.orelha ?? R.rosto), { seg: 12 }));
  });
  if (p.cauda) cauda(rig, 'corpo', [-tx * 0.9, -ty * 0.6, 0], { ...p.cauda, mat: t(R.cauda), matPonta: t(R.caudaPonta ?? R.cauda) });
  return { rig, ref: { costas: giro(-tx, ty * 0.2).concat(0) as V3, peito: giro(tx, ty * 0.2).concat(0) as V3, topo: [0, cy, 0], testa: [cx * 0.9, cy * 0.5, 0], ombro: [ox, oy, tz * 0.9], mao: [0, -altOmbro, 0], nuca: [-cx * 0.8, cy * 0.3, 0] } };
}

/** Animações do arborícola: as do bípede + braçada longa no ataque e cauda que enrola/balança. */
export function animsArboricola(o: AnimBipedeP & { caudaSegs?: number }, extra?: Partial<Record<Mov | 'todas', Faixas>>): AnimsCriatura {
  const n = o.caudaSegs ?? 3;
  const rabo = (q: typeof lz, v: number[]) => Object.fromEntries(Array.from({ length: n }, (_, i) => ['?cauda' + (i + 1), q(v.map((x) => x * (0.6 + i * 0.3)))]));
  return animsBipede({ mapa: { comp: 0.9, larg: 1.2, cabeca: 1.3, frontal: 1.1 }, ...o }, unirExtras({
    idle: { ...rabo(lz, [0, -4, -8, -3]), braco_e: lr([[0, 0, 0], [0, 0, 2], [0, 0, 4], [0, 0, 1]]), '?orelha_d': lz([0, 0, 10, 0]) },
    // braçada de cima para baixo com o braço da frente
    fisico: { braco_e: qr([[0, 0, -40], [0, 0, -110], [0, 0, 60], [0, 0, 30], [0, 0, 0]]), antebraco_e: qz([-30, -60, 20, 8, 0]), tronco: qz([8, 14, -16, -6, 0]), ...rabo(qz, [6, 12, -14, -5, 0]) },
    especial: { tronco: qz([-4, -8, -8, 18, 6, 0]), ...rabo(qz, [0, -10, -14, 20, 8, 0]) },
    andar: { ...rabo(lz, [0, -6, 0, 6]), tronco: lz([0, -3, 0, -3]) },
  }, extra));
}
