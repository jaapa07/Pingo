/**
 * 125 · MEDUSIM (Rio/Veneno) — água-viva filhote que se deixa levar pela maré.
 * Traços únicos: sino lilás em cúpula com barra de babados · trevo de quatro anéis rosa no alto ·
 * tentáculos finos com gota verde-veneno na ponta · braços orais rosa franzidos · carinha sonolenta no sino.
 * Anatomia própria (não há kit de água-viva): `medusa` + `animsMedusa`, reutilizadas pelo Medusão.
 */
import { criatura, novoRig, olhos, segmento, blob, tube, lathe, ring, m, movBase, somar, montar, lr, qr, ls, qs, qp, lp, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi } from './kits';

export const paletaMedusa = {
  rampas: [
    ['#44389c', '#8890f0', '#d8e2ff'], // 0 sino lilás-azulado
    ['#8a2a80', '#e264c2', '#ffbcea'], // 1 rosa dos braços orais e do trevo
    ['#267c44', '#7ce048', '#eaffa4'], // 2 verde-veneno
    ['#8c8cc0', '#e6ecff', '#ffffff'], // 3 babados e brilho quase branco
  ] as [string, string, string][],
  contorno: '#241c56',
  extras: { w: '#ffffff', p: '#201848', f: '#8890f0' },
};

export interface MedusaP { /** raio e altura do sino */ R: number; H: number; flutua: number; /** tentáculos: quantidade, comprimento total e raio */ tent: { n: number; len: number; r: number }; /** braços orais: comprimento e raio */ oral: { len: number; r: number }; olho: number; babados?: number }

/** Monta a água-viva. Ossos: corpo → sino · corpo → tn1..N → tn1b..Nb (o +X local aponta para fora) · corpo → oral → oralb. */
export function medusa(p: MedusaP): Rig {
  const { R, H } = p, t = p.tent;
  const rig = novoRig(p.flutua);
  rig.bone('sino', 'corpo', [0, 0, 0], [0, 0, -8]);
  rig.add('sino', lathe([[0.001, H], [R * 0.45, H * 0.92], [R * 0.82, H * 0.6], [R, H * 0.12], [R * 0.96, -H * 0.06], [R * 0.6, -H * 0.02], [0.001, 0]], m(0), { seg: 28 }));
  // miolo claro por dentro (aparece por baixo) e barra de babados
  rig.add('sino', blob([R * 0.6, H * 0.2, R * 0.6], m(1), { pos: [0, -H * 0.02, 0], seg: 14 }));
  const nb = p.babados ?? 10;
  for (let i = 0; i < nb; i++) { const a = (i / nb) * Math.PI * 2; rig.add('sino', blob([R * 0.2, H * 0.17, R * 0.2], m(3), { pos: [Math.cos(a) * R * 0.92, -H * 0.02, Math.sin(a) * R * 0.92], seg: 10 })); }
  olhos(rig, 'sino', p.olho, [R * 0.8, H * 0.44, R * 0.36]);
  // braços orais: dois gomos franzidos pendurados no centro
  rig.bone('oral', 'corpo', [0, -H * 0.05, 0]);
  rig.add('oral', segmento([0, 0, 0], [0, -p.oral.len * 0.5, 0], p.oral.r, p.oral.r * 0.8, m(1)), blob([p.oral.r * 1.3, p.oral.r * 0.7, p.oral.r * 1.3], m.luz(1), { pos: [0, -p.oral.len * 0.25, 0], seg: 10 }));
  rig.bone('oralb', 'oral', [0, -p.oral.len * 0.5, 0]);
  rig.add('oralb', segmento([0, 0, 0], [0, -p.oral.len * 0.5, 0], p.oral.r * 0.8, p.oral.r * 0.4, m(1)), blob([p.oral.r * 1.1, p.oral.r * 0.6, p.oral.r * 1.1], m.luz(1), { pos: [0, -p.oral.len * 0.22, 0], seg: 10 }));
  for (let i = 0; i < t.n; i++) {
    const ang = (360 / t.n) * (i + 0.5), a = ang * Math.PI / 180, n = 'tn' + (i + 1);
    // tentáculos ondulados (um S por osso), alternando compridos e curtos
    const L = t.len * (i % 2 ? 0.72 : 1), w = t.r * 1.6;
    rig.bone(n, 'corpo', [Math.cos(a) * R * 0.66, -H * 0.02, -Math.sin(a) * R * 0.66], [0, ang, 6]);
    rig.add(n, tube([[0, 0, 0], [w, -L * 0.25, 0], [0, -L * 0.5, 0]], (u) => t.r * (1 - u * 0.25), m(0), { seg: 10, radial: 8 }));
    rig.bone(n + 'b', n, [0, -L * 0.5, 0], [0, 0, -8]);
    rig.add(n + 'b', tube([[0, 0, 0], [-w, -L * 0.22, 0], [0, -L * 0.44, 0]], (u) => t.r * (0.75 - u * 0.25), m(0), { seg: 10, radial: 8 }), blob([t.r * 1.15, t.r * 1.5, t.r * 1.15], m.plano(2), { pos: [0, -L * 0.46, 0], seg: 10 }));
  }
  return rig;
}

export function animsMedusa(o: BaseP & { flutua: number; n: number; mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  const pulso = (a: number): V3 => [1 + a, 1 - a * 1.2, 1 + a];
  // abre(v): graus que os tentáculos abrem para fora (base) e a ponta acompanha com atraso
  const abre = (q: typeof qr, v: number[], k = 1): Faixas => Object.fromEntries(Array.from({ length: o.n }, (_, i) => [[`tn${i + 1}`, q(v.map((a) => [0, 0, a] as V3))], [`tn${i + 1}b`, q(v.map((_, f) => [0, 0, v[(f + v.length - 1) % v.length] * k] as V3))]]).flat());
  const f = o.flutua;
  const b = movBase({ ...o, flutua: 0 });
  b.idle.corpo = lp([[0, 0, 0], [0, 0.03 * o.u, 0], [0, 0.06 * o.u, 0], [0, 0.02 * o.u, 0]]);
  b.status.corpo = lp([[0, -0.03 * o.u, 0], [0, 0, 0], [0, -0.03 * o.u, 0], [0, -0.05 * o.u, 0]]);
  b.andar.base = lp([[0, 0, 0], [0, 0.05 * o.u, 0], [0, 0.02 * o.u, 0], [0, -0.02 * o.u, 0]]);
  // desmaio: murcha, afunda meia altura e os tentáculos se espalham no chão
  b.desmaio = { base: qr([[0, 0, 5], [0, 0, -4], [4, 0, -3], [6, 0, 0], [6, 0, 0]]), corpo: qp([[0, 0.03 * f, 0], [0, -0.08 * f, 0], [0, -0.18 * f, 0], [0, -0.28 * f, 0], [0, -0.27 * f, 0]]) };
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { sino: qs([pulso(-0.14), pulso(0.14), pulso(-0.08), pulso(0.04), 1]), ...abre(qr, [-6, 22, -8, 4, 0]) },
    idle: { sino: ls([1, pulso(0.06), pulso(0.1), pulso(-0.04)]), ...abre(lr, [0, 8, 14, -4]), oral: lr([[0, 0, 0], [0, 0, 4], [0, 0, 0], [0, 0, -4]]), oralb: lr([[0, 0, -6], [0, 0, 0], [0, 0, 6], [0, 0, 0]]) },
    fisico: { sino: [...qr([[0, 0, 8], [0, 0, 14], [0, 0, -18], [0, 0, -6], [0, 0, 0]]), ...qs([pulso(0.06), pulso(0.14), pulso(-0.12), pulso(-0.03), 1])], ...abre(qr, [8, 18, -8, -3, 0], 0.8) },
    especial: { sino: qs([pulso(0.08), pulso(0.16), pulso(0.2), pulso(-0.08), pulso(-0.03), 1]), ...abre(qr, [4, 8, 10, 16, 6, 0], 0.6) },
    dano: { sino: [...qr([[0, 0, 16], [0, 0, 6], [0, 0, 0]]), ...qs([pulso(-0.12), pulso(0.06), 1])], ...abre(qr, [26, 9, 0]) },
    desmaio: { sino: [...qs([1, pulso(0.1), pulso(0.2), pulso(0.3), pulso(0.28)]), ...qr([[0, 0, 0], [0, 0, 4], [0, 0, 10], [0, 0, 14], [0, 0, 13]])], ...abre(qr, [0, 8, 16, 22, 21], 1.2), oral: qs([1, 1, [1, 0.8, 1], [1, 0.55, 1], [1, 0.55, 1]]) },
    status: { sino: ls([pulso(0.04), 1, pulso(0.06), 1]), ...abre(lr, [4, 0, -4, 0]) },
    andar: { sino: ls([pulso(0.1), pulso(-0.06), 1, pulso(0.05)]), ...abre(lr, [16, -6, 2, 8]) },
    parado: { sino: ls([1, pulso(0.08)]), ...abre(lr, [0, 10]) },
  };
  return montar(somar(b, membros, extra), {}, { comp: 1, larg: 1, cabeca: 1, frontal: 1.05, olho: 1.5, ...o.mapa });
}

/** Trevo de anéis no alto do sino (as "ferraduras" da água-viva-da-lua). */
export function trevo(rig: Rig, R: number, H: number, r: number) {
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.6; rig.add('sino', ring(r, r * 0.34, m.plano(1), { pos: [Math.cos(a) * R * 0.3, H * 0.93, Math.sin(a) * R * 0.3], rot: [90, 0, 0] })); }
}

function build() {
  const rig = medusa({ R: 0.27, H: 0.31, flutua: 0.42, tent: { n: 6, len: 0.36, r: 0.03 }, oral: { len: 0.24, r: 0.06 }, olho: 0.034 });
  trevo(rig, 0.27, 0.31, 0.06);
  // bochechas rosa e brilho no alto do sino
  for (const s of [1, -1]) rig.add('sino', blob([0.03, 0.035, 0.05], m.plano(1), { pos: [0.25, 0.06, 0.16 * s], seg: 10, castShadow: false }));
  rig.add('sino', blob([0.05, 0.03, 0.07], m.luz(3), { pos: [0.12, 0.24, -0.12], rot: [0, 0, -30], seg: 8, castShadow: false }));
  return rig;
}

const anims = animsMedusa({ u: 0.75, flutua: 0.42, n: 6, mole: 0.8 });

export const medusim = criatura({
  num: 125, id: 'medusim', nome: 'Medusim', porte: 'P', estagio: 'basico', paleta: paletaMedusa, build, anims,
  olho: {
    frente: ['pppp', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
