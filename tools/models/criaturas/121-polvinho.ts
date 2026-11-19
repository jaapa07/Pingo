/**
 * 121 · POLVINHO (Rio/Mente) — polvo filhote que resolve um enigma com cada braço.
 * Traços únicos: manto bojudo caído para trás com anéis violeta · oito braços de ponta enrolada e ventosas creme ·
 * um braço erguido acenando · terceiro olho violeta na testa (o tipo Mente) · sifão de lado.
 * Anatomia própria (não há kit de polvo): `polvo` + `animsPolvo`, reutilizadas pelo Polvão.
 */
import { criatura, novoRig, olhos, segmento, blob, ring, par, m, movBase, somar, montar, lz, qz, ls, qs, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi, type Mat } from './kits';

export const paletaPolvo = {
  rampas: [
    ['#7c2a52', '#de5a6e', '#ffab94'], // 0 pele coral
    ['#b98f88', '#f8e0cc', '#fffaf0'], // 1 ventosas e barriga creme
    ['#3c2a8c', '#8460e4', '#d6c0ff'], // 2 violeta da mente
    ['#1c6470', '#34b8a8', '#c0f6d8'], // 3 água / padrão mutante
  ] as [string, string, string][],
  contorno: '#34163c',
  extras: { w: '#ffffff', p: '#2a1234', f: '#de5a6e', a: '#ffd84a' },
};

export interface PolvoP { /** semi-eixos do manto e da cabeça */ manto: V3; cabeca: V3; alt: number; /** braços: comprimentos dos 2 segmentos e raio na base */ braco: { l1: number; l2: number; r: number }; /** índices (0..7) dos braços erguidos e quanto sobem */ erguidos: number[]; sobe?: number; olho: number; pele?: Mat }

/** Monta o polvo. Ossos: corpo → cabeca → manto · corpo → t1..t8 → t1b..t8b (o +X local de cada braço aponta para fora). */
export function polvo(p: PolvoP): Rig {
  const [mx, my, mz] = p.manto, [hx, hy, hz] = p.cabeca, b = p.braco, pele = p.pele ?? m(0);
  const rig = novoRig(p.alt);
  rig.bone('cabeca', 'corpo', [0, 0, 0]);
  rig.add('cabeca', blob([hx, hy, hz], pele), blob([hx * 0.8, hy * 0.5, hz * 0.8], m(1), { pos: [0, -hy * 0.6, 0], seg: 16 }));
  rig.bone('manto', 'cabeca', [-hx * 0.2, hy * 0.6, 0], [0, 0, 24]);
  rig.add('manto', blob([mx, my, mz], pele, { pos: [-mx * 0.1, my * 0.7, 0] }));
  // sifão: canudinho de lado
  rig.add('cabeca', segmento([0, -hy * 0.1, hz * 0.8], [hx * 0.3, -hy * 0.1, hz * 1.25], hy * 0.3, hy * 0.24, m.sombra(0)));
  olhos(rig, 'cabeca', p.olho, [hx * 0.74, hy * 0.2, hz * 0.6]);
  // calombos das sobrancelhas
  par((_, s) => rig.add('cabeca', blob([hx * 0.26, hy * 0.24, hz * 0.26], pele, { pos: [hx * 0.6, hy * 0.62, hz * 0.56 * s], seg: 12 })));
  for (let i = 0; i < 8; i++) {
    const ang = 22.5 + 45 * i, ergue = p.erguidos.includes(i), n = 't' + (i + 1);
    const y0 = -hy * 0.5, chao = -(p.alt + y0) + b.r * 0.5;
    rig.bone(n, 'corpo', [Math.cos(ang * Math.PI / 180) * hx * 0.6, y0, -Math.sin(ang * Math.PI / 180) * hz * 0.6], [0, ang, ergue ? (p.sobe ?? 34) : 0]);
    const j: V3 = ergue ? [b.l1, 0, 0] : [b.l1, chao, 0];
    rig.add(n, segmento([0, 0, 0], j, b.r, b.r * 0.72, pele));
    rig.bone(n + 'b', n, j, [0, 0, ergue ? 42 : 0]);
    rig.add(n + 'b', segmento([0, 0, 0], [b.l2, 0, 0], b.r * 0.72, b.r * 0.42, pele),
      // ponta enrolada para cima e ventosas creme por baixo
      blob([b.r * 0.62, b.r * 0.62, b.r * 0.62], pele, { pos: [b.l2 + b.r * 0.1, b.r * 0.55, 0], seg: 10 }),
      blob([b.l2 * 0.45, b.r * 0.3, b.r * 0.5], m.plano(1), { pos: [b.l2 * 0.5, -b.r * 0.42, 0], seg: 10, castShadow: false }));
  }
  return rig;
}

export function animsPolvo(o: BaseP & { alt: number; erguidos: number[]; mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  // onda(v): levanta as pontas dos braços em rodízio (graus por quadro, defasados pelo índice do braço)
  const onda = (q: typeof lz, v: number[], k = 1) => Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`t${i + 1}b`, q(v.map((_, f) => v[(f + i * 3) % v.length] * (o.erguidos.includes(i) ? 2 * k : k)))]));
  const todos = (q: typeof qz, v: number[]) => Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`t${i + 1}`, q(v.map((x) => (o.erguidos.includes(i) ? x * 1.6 : x * 0.5)))]));
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { manto: qz([-20, 14, -10, 4, 0]), ...onda(qz, [20, -10, 14, -4, 0]) },
    idle: { manto: [...lz([0, 2, 4, 1]), ...ls([1, [1.03, 0.97, 1.03], [1.05, 0.95, 1.05], [1.02, 0.98, 1.02]])], ...onda(lz, [0, 8, 14, 5]) },
    fisico: { manto: qz([8, 16, -14, -5, 0]), cabeca: qz([4, 8, -8, -3, 0]), ...todos(qz, [10, 22, -26, -8, 0]) },
    especial: { manto: [...qz([4, 8, 10, -10, -4, 0]), ...qs([1, [1.1, 0.9, 1.1], [1.14, 0.86, 1.14], [0.92, 1.12, 0.92], [0.98, 1.03, 0.98], 1])], ...todos(qz, [4, 10, 14, -12, -4, 0]), ...onda(qz, [0, 10, 16, -20, -6, 0]) },
    dano: { manto: qz([18, 6, 0]), ...onda(qz, [24, 8, 0]) },
    desmaio: { corpo: [{ t: 0, p: [0, 0, 0] }, { t: 0.5, p: [0, -o.alt * 0.2, 0] }, { t: 1, p: [0, -o.alt * 0.42, 0] }], manto: qz([0, 8, 20, 34, 32]), ...todos(qz, [0, -6, -14, -22, -20]) },
    status: { manto: lz([8, 12, 8, 4]), ...onda(lz, [-4, 0, 4, 0]) },
    andar: { manto: lz([0, 4, 0, -4]), ...onda(lz, [0, 14, 0, -8]) },
    parado: { ...onda(lz, [0, 8]) },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 1, larg: 1, cabeca: 1.1, frontal: 1.1, olho: 1.5, ...o.mapa });
}

function build() {
  const rig = polvo({ manto: [0.21, 0.2, 0.2], cabeca: [0.19, 0.14, 0.19], alt: 0.17, braco: { l1: 0.15, l2: 0.14, r: 0.062 }, erguidos: [7], olho: 0.034 });
  // anéis violeta no manto
  const aneis: [V3, number][] = [[[0.06, 0.3, 0.13], 0.045], [[-0.12, 0.3, -0.12], 0.05], [[-0.06, 0.36, 0.04], 0.04], [[0.04, 0.2, -0.17], 0.04], [[-0.2, 0.2, 0.1], 0.04]];
  for (const [pos, r] of aneis) rig.add('manto', blob([r, r, r], m.plano(2), { pos, seg: 10, castShadow: false }), blob([r * 0.5, r * 0.5, r * 0.5], m.luz(2), { pos: [pos[0] * 1.08, pos[1] * 1.05, pos[2] * 1.12], seg: 8, castShadow: false }));
  // terceiro olho: gema violeta na testa, num osso para pulsar
  rig.bone('gema', 'cabeca', [0.15, 0.13, 0]);
  rig.add('gema', blob([0.05, 0.06, 0.055], m.plano(2), { seg: 12 }), blob([0.025, 0.03, 0.03], m.luz(2), { pos: [0.03, 0.015, -0.015], seg: 8 }), ring(0.062, 0.016, m.sombra(0), { rot: [0, 90, 0], pos: [-0.01, 0, 0] }));
  return rig;
}

export const pulsa = (n: string) => ({ [n]: ls([1, 1.15, 1.3, 1.1]) });
const anims = animsPolvo({ u: 0.55, alt: 0.17, erguidos: [7], mole: 1.4 }, {
  idle: pulsa('gema'),
  especial: { gema: qs([1, 1.3, 1.6, 2.1, 1.4, 1]) },
});

export const polvinho = criatura({
  num: 121, id: 'polvinho', nome: 'Polvinho', porte: 'P', estagio: 'basico', paleta: paletaPolvo, build, anims,
  olho: {
    frente: ['.ppp.', 'pwwpp', 'pwppp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
