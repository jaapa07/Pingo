/**
 * 141 · GRILINHO (Inseto/Trovão) — grilo-paquinha que carrega as asas esfregando-as no tapete e dá choque em quem pega.
 * Traços únicos: patas dianteiras em PÁ de cavar, creme e dentadas · coxas traseiras gordas de saltador ·
 * escudo escuro no tórax · asinhas curtas com faixa amarela e faíscas em raio · antenas compridas · dois cercos no rabo.
 * O construtor `grilo` é reaproveitado pelo Grilão-Elétrico.
 */
import { criatura, inseto, animsInseto, blob, calota, slab, spike, segmento, par, m, ls, qs, lz, type Rig, type V2 } from './kits';

export const paletaGrilo = {
  rampas: [
    ['#6c3a30', '#ba7a40', '#f0c074'], // 0 castanho-dourado
    ['#b49470', '#f4e0b4', '#fffbe6'], // 1 creme do ventre e das pás
    ['#d08a0c', '#ffe23a', '#fffcb4'], // 2 amarelo-trovão
    ['#2a2244', '#54466e', '#9088b0'], // 3 escudo, patas e antenas escuras
  ] as [string, string, string][],
  contorno: '#241a34',
  extras: { w: '#ffffff', p: '#241a34', f: '#ba7a40', a: '#ffe23a' },
};

/** Raio em zigue-zague (placa), crescendo em +Y. */
export const raioGrilo = (alt: number, esp = 0.04) => {
  const k = alt / 0.22;
  const pts: V2[] = ([[0, 0], [0.05, 0.1], [0.012, 0.1], [0.06, 0.22], [-0.035, 0.085], [0.008, 0.085], [-0.03, 0]] as V2[]).map(([x, y]) => [x * k, y * k]);
  return slab(pts, esp, m.plano(2), { smooth: false, bevel: esp * 0.3 });
};
export const piscaGrilo = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => { const v = [1, 0.2, 1.25, 0.6]; return [n, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])]; }));

export interface GriloP { k: number; alt: number; antena: number }

/** Grilo-paquinha: inseto do kit + pás, coxas de saltador, escudo, cercos. */
export function grilo(p: GriloP): Rig {
  const k = p.k, abre = 0.19 * k, ty = 0.15 * k, J = ty * 0.6;
  const { rig, ref } = inseto({
    torax: [0.17 * k, ty, 0.155 * k], abdomen: [0.2 * k, 0.14 * k, 0.15 * k], cabeca: [0.15 * k, 0.14 * k, 0.15 * k], alt: p.alt, caiAbdomen: 10,
    patas: { abre, r: 0.036 * k }, antenas: { len: p.antena, r: 0.016 * k, abre: 26 }, elitros: true,
    olho: { r: 0.032 * k, pos: [0.16 * k, 0.035 * k, 0.11 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 3, antenas: 3, elitros: 0, barriga: 1 },
  });
  // escudo escuro do tórax com aba clara
  rig.add('corpo', calota([0.185 * k, 0.166 * k, 0.17 * k], m(3), { de: 0, ate: 78 }), blob([0.19 * k, 0.03 * k, 0.175 * k], m.luz(0), { pos: [0, 0.01 * k, 0], seg: 14, castShadow: false }));
  // bochecha creme e boquinha
  rig.add('cabeca', blob([0.08 * k, 0.07 * k, 0.12 * k], m(1), { pos: [0.15 * k, -0.06 * k, 0], seg: 12 }));
  par((l, s) => {
    // PÁS de cavar: lâmina creme com três dentes, no pé do primeiro par
    const pe: [number, number, number] = [0.25 * abre, -(J + p.alt - ty * 0.3), abre * 0.45 * s];
    rig.add('tarso1_' + l, blob([0.085 * k, 0.07 * k, 0.04 * k], m(1), { pos: [pe[0] + 0.03 * k, pe[1] + 0.06 * k, pe[2]], rot: [0, 20 * s, 0], seg: 12 }));
    for (const dz of [-0.03, 0, 0.03]) rig.add('tarso1_' + l, spike(0.07 * k, 0.022 * k, m.luz(1), { pos: [pe[0] + 0.09 * k, pe[1] + 0.05 * k, pe[2] + dz * k], rot: [0, 0, -110] }));
    // COXAS de saltador: fêmur gordo castanho no terceiro par
    const j: [number, number, number] = [-0.3 * abre, J, abre * 0.55 * s];
    rig.add('pata3_' + l, segmento([0.02 * k, -0.02 * k, 0], [j[0] * 1.5, j[1] + 0.12 * k, j[2] * 1.1], 0.085 * k, 0.045 * k, m(0)), blob([0.04 * k, 0.04 * k, 0.04 * k], m.luz(0), { pos: [j[0] * 1.5, j[1] + 0.13 * k, j[2] * 1.1], seg: 8 }));
    // faixa amarela nas asinhas e cercos no rabo
    rig.add('elitro_' + l, blob([0.15 * k, 0.03 * k, 0.03 * k], m.plano(2), { pos: [-0.2 * k, 0.085 * k, 0.07 * k * s], seg: 10, castShadow: false }));
    rig.add('abdomen', spike(0.14 * k, 0.03 * k, m(3), { pos: [ref.fimAbdomen[0] + 0.03 * k, 0, 0.06 * k * s], rot: [20 * s, 0, 70] }));
  });
  return rig;
}

function build() {
  const rig = grilo({ k: 1, alt: 0.17, antena: 0.26 });
  // faíscas saindo das asas
  rig.bone('faisca1', 'corpo', [-0.2, 0.2, 0.12], [20, 0, 30]); rig.add('faisca1', raioGrilo(0.16));
  rig.bone('faisca2', 'corpo', [-0.36, 0.16, -0.1], [-20, 0, 60]); rig.add('faisca2', raioGrilo(0.13));
  return rig;
}

const anims = animsInseto({ u: 0.5, alt: 0.17, mole: 1.1 }, {
  todas: piscaGrilo(['faisca1', 'faisca2']),
  idle: { elitro_d: lz([0, -6, 0, -6]), elitro_e: lz([-6, 0, -6, 0]) },
  especial: { faisca1: qs([1, 1.4, 0.4, 2.2, 1.4, 1]), faisca2: qs([1, 0.4, 1.6, 2.2, 1.4, 1]) },
});

export const grilinho = criatura({
  num: 141, id: 'grilinho', nome: 'Grilinho', porte: 'P', estagio: 'basico', paleta: paletaGrilo, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
