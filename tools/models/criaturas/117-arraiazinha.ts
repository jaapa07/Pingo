/**
 * 117 · ARRAIAZINHA (Rio/Veneno) — arraia-de-fogo filhote, disco escuro salpicado de brasas.
 * Traços únicos: asas em "V" no meio da batida, com ocelos laranja de miolo amarelo ·
 * olhinhos em dois calombos no alto · cauda erguida com ferrão verde-veneno · barriga creme sorridente.
 * Anatomia própria (não há kit de arraia): disco + asa_d/e + asa2_d/e + cauda1..3; animações em `animsArraia`.
 */
import { criatura, novoRig, cauda, olhos, blob, spike, par, m, movBase, somar, montar, lr, qr, lz, qz, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi } from './kits';

export const paletaArraia = {
  rampas: [
    ['#231a36', '#44325c', '#71568c'], // 0 couro ameixa-escuro
    ['#b4361e', '#f58a22', '#ffe26a'], // 1 brasas: laranja com miolo amarelo
    ['#ad9aa0', '#f2e2cc', '#fffaf0'], // 2 creme da barriga
    ['#2c8440', '#7fe04a', '#e8ffa0'], // 3 verde-veneno do ferrão
  ] as [string, string, string][],
  contorno: '#1a1430',
  extras: { w: '#ffffff', p: '#140f24', f: '#44325c' },
};

export interface ArraiaP { /** semi-eixos do disco */ disco: V3; flutua: number; /** envergadura de cada asa e seu comprimento */ asa: { larg: number; comp: number; sobe: number }; cauda: { segs: number; len: number; r: number }; olho: number; /** ocelos por asa: [x, z, raio] */ ocelos: [number, number, number][] }

/** Monta a arraia: devolve o rig e o nome do último osso da cauda. */
export function arraia(p: ArraiaP): { rig: Rig; fim: string; seg: number } {
  const [dx, dy, dz] = p.disco;
  const rig = novoRig(p.flutua);
  rig.bone('tronco', 'corpo', [0, 0, 0], [0, 0, -12]);
  rig.add('tronco', blob([dx, dy, dz], m(0)), blob([dx * 0.9, dy * 0.7, dz * 0.92], m(2), { pos: [0.01, -dy * 0.45, 0] }));
  // focinho pontudo e sorriso da barriga
  rig.add('tronco', blob([dx * 0.4, dy * 0.6, dz * 0.5], m(0), { pos: [dx * 0.8, 0, 0], seg: 16 }), blob([dx * 0.1, dy * 0.2, dz * 0.4], m.sombra(2), { pos: [dx * 0.72, -dy * 0.85, 0], seg: 10 }));
  // calombos dos olhos
  par((_, s) => rig.add('tronco', blob([dx * 0.2, dy * 0.6, dz * 0.24], m(0), { pos: [dx * 0.5, dy * 0.75, dz * 0.42 * s], seg: 14 })));
  olhos(rig, 'tronco', p.olho, [dx * 0.6, dy * 0.95, dz * 0.56]);
  const a = p.asa;
  par((l, s) => {
    rig.bone('asa_' + l, 'tronco', [0, 0, dz * 0.6 * s], [-a.sobe * s, 0, 0]);
    rig.add('asa_' + l, blob([a.comp, dy * 0.5, a.larg * 0.6], m(0), { pos: [-a.comp * 0.05, 0, a.larg * 0.45 * s], seg: 24, deform: [(v) => { const t = Math.abs(v.z) / (a.larg * 0.6); v.x = v.x * (1 - t * 0.55) - t * a.comp * 0.3; }] }),
      blob([a.comp * 0.85, dy * 0.3, a.larg * 0.52], m(2), { pos: [-a.comp * 0.08, -dy * 0.28, a.larg * 0.42 * s], seg: 16, deform: [(v) => { const t = Math.abs(v.z) / (a.larg * 0.52); v.x = v.x * (1 - t * 0.55) - t * a.comp * 0.3; }] }));
    rig.bone('asa2_' + l, 'asa_' + l, [-a.comp * 0.3, 0, a.larg * 0.9 * s], [-a.sobe * 0.5 * s, 0, 0]);
    rig.add('asa2_' + l, blob([a.comp * 0.42, dy * 0.4, a.larg * 0.3], m(0), { pos: [0, 0, a.larg * 0.12 * s], seg: 14, deform: [(v) => { v.x -= Math.abs(v.z) * 0.6; }] }));
    // ocelos de brasa: disco laranja + miolo amarelo, deitados sobre a asa
    for (const [x, z, r] of p.ocelos) rig.add('asa_' + l, blob([r, dy * 0.22, r], m.plano(1), { pos: [x, dy * 0.42, z * s], seg: 12, castShadow: false }), blob([r * 0.5, dy * 0.2, r * 0.5], m.luz(1), { pos: [x, dy * 0.5, z * s], seg: 8, castShadow: false }));
  });
  const c = cauda(rig, 'tronco', [-dx * 0.85, 0, 0], { segs: p.cauda.segs, len: p.cauda.len, r0: p.cauda.r, r1: p.cauda.r * 0.45, ang: 34, curva: 24, mat: m(0) });
  return { rig, fim: c.ultimo, seg: c.seg };
}

export function animsArraia(o: BaseP & { flutua: number; mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  // asas(v): graus a mais (ou a menos) de subida das duas asas, um valor por quadro
  const asas = (q: typeof qr, v: number[]) => ({ asa_d: q(v.map((a) => [-a, 0, 0] as V3)), asa_e: q(v.map((a) => [a, 0, 0] as V3)), asa2_d: q(v.map((a) => [-a * 0.7, 0, 0] as V3)), asa2_e: q(v.map((a) => [a * 0.7, 0, 0] as V3)) });
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...asas(qr, [30, -30, 16, -6, 0]), tronco: qz([24, 8, -10, 3, 0]), cauda1: qz([-30, 20, -10, 4, 0]) },
    idle: { ...asas(lr, [0, -14, -26, -10]), cauda1: lz([0, -4, -8, -3]), cauda2: lz([0, -6, -10, -4]) },
    fisico: { ...asas(qr, [10, 24, -30, -10, 0]), tronco: qz([-8, -16, 14, 6, 0]), cauda1: qz([10, 20, -50, -20, 0]), cauda2: qz([10, 20, -40, -16, 0]) },
    especial: { ...asas(qr, [-10, 14, 26, -40, -14, 0]), tronco: qz([-6, -12, -12, 18, 6, 0]), cauda1: qz([0, 10, 16, -36, -12, 0]), cauda2: qz([0, 14, 20, -30, -10, 0]) },
    dano: { ...asas(qr, [34, 12, 0]), tronco: qz([14, 5, 0]), cauda1: qz([24, 8, 0]) },
    desmaio: { ...asas(qr, [10, -6, -22, -34, -32]), tronco: qz([6, -2, -6, -8, -8]), cauda1: qz([0, 10, 20, 28, 26]), cauda2: qz([0, 8, 16, 22, 20]) },
    status: { ...asas(lr, [-18, -22, -18, -14]), tronco: lr([[6, 0, -4], [0, 0, -6], [-6, 0, -4], [0, 0, -2]]), cauda1: lz([10, 12, 10, 8]) },
    andar: { ...asas(lr, [10, -14, -30, -8]), cauda1: lz([-6, 0, 6, 0]) },
    parado: { ...asas(lr, [0, -16]), cauda1: lz([0, -6]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 0.9, larg: 1, cabeca: 1, frontal: 1, olho: 1.5, ...o.mapa });
}

function build() {
  const { rig, fim, seg } = arraia({
    disco: [0.2, 0.085, 0.16], flutua: 0.2, asa: { larg: 0.3, comp: 0.22, sobe: 44 }, cauda: { segs: 3, len: 0.36, r: 0.04 }, olho: 0.028,
    ocelos: [[0.05, 0.1, 0.05], [-0.09, 0.19, 0.045], [0.0, 0.28, 0.04]],
  });
  // brasa grande no meio do dorso
  rig.add('tronco', blob([0.06, 0.03, 0.06], m.plano(1), { pos: [-0.04, 0.07, 0], seg: 12 }), blob([0.03, 0.03, 0.03], m.luz(1), { pos: [-0.04, 0.08, 0], seg: 8 }));
  // ferrão verde-veneno com gota
  rig.bone('ferrao', fim, [-seg, 0, 0], [0, 0, 70]);
  rig.add('ferrao', spike(0.14, 0.035, m.plano(3)), blob([0.035, 0.035, 0.035], m.luz(3), { seg: 8 }));
  return rig;
}

const anims = animsArraia({ u: 0.45, flutua: 0.2, mole: 1.2 }, {
  idle: { ferrao: lz([0, 8, 14, 4]) },
  fisico: { ferrao: qz([0, 20, -30, -10, 0]) },
});

export const arraiazinha = criatura({
  num: 117, id: 'arraiazinha', nome: 'Arraiazinha', porte: 'P', estagio: 'basico', paleta: paletaArraia, build, anims,
  olho: {
    frente: ['.ww.', 'wppw', 'wppw', '.ww.'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
