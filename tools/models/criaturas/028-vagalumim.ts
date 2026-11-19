/**
 * 028 · VAGALUMIM (Inseto/Trovão) — vaga-lume.
 * Traços únicos: lanterna verde-limão no fim do abdômen, pulsando · escudo laranja em aba sobre a cabeça ·
 * élitros azul-noite de borda laranja · antenas em raio · voa com as patinhas penduradas.
 */
import { criatura, inseto, animsInseto, blob, slab, calota, par, m, ls, qs, lz, type V2 } from './kits';

export const paletaVaga = {
  rampas: [
    ['#221f40', '#3c3c62', '#686c94'], // 0 azul-noite dos élitros e da cabeça
    ['#a8402c', '#f07a30', '#ffbc5c'], // 1 laranja do escudo e das bordas
    ['#9ccc1c', '#e8ff58', '#ffffd4'], // 2 luz verde-limão
    ['#7c9cc4', '#bedaf0', '#f4fcff'], // 3 asas de véu azulado
  ] as [string, string, string][],
  contorno: '#1c1830',
  extras: { w: '#ffffff', p: '#151226', f: '#3c3c62', a: '#e8ff58' },
};

/** raio de desenho animado: placa em ziguezague crescendo em +Y */
export const raio = (alt: number, mat: ReturnType<typeof m>, esp = 0.035) => {
  const k = alt / 0.22;
  const pts: V2[] = ([[0, 0], [0.05, 0.1], [0.01, 0.1], [0.06, 0.22], [-0.035, 0.085], [0.008, 0.085], [-0.03, 0]] as V2[]).map(([x, y]) => [x * k, y * k]);
  return slab(pts, esp, mat, { smooth: false, bevel: esp * 0.3 });
};

function build() {
  const { rig } = inseto({
    torax: [0.14, 0.13, 0.14], abdomen: [0.19, 0.13, 0.14], cabeca: [0.13, 0.13, 0.14], alt: 0.16, flutua: 0.2, caiAbdomen: 26,
    patas: { abre: 0.1, r: 0.024 }, elitros: true, asas: { len: 0.36, larg: 0.2 },
    olho: { r: 0.036, pos: [0.13, 0.0, 0.1] },
    rampas: { torax: 1, abdomen: 0, cabeca: 0, patas: 0, elitros: 0, asas: 3 },
  });
  // escudo laranja em aba sobre a cabeça, com mancha escura
  rig.add('corpo', calota([0.2, 0.15, 0.19], m(1), { de: 0, ate: 80, pos: [0.07, 0.0, 0], rot: [0, 0, -38] }), blob([0.07, 0.03, 0.08], m(0), { pos: [0.08, 0.135, 0], rot: [0, 0, -30], seg: 12 }));
  // borda laranja dos élitros
  par((l, s) => rig.add('elitro_' + l, blob([0.19, 0.03, 0.035], m.plano(1), { pos: [-0.18, -0.02, 0.155 * s], rot: [0, 4 * s, 0], seg: 12, castShadow: false })));
  // LANTERNA: ponta do abdômen acesa (osso próprio que pulsa) com halo
  rig.bone('lanterna', 'abdomen', [-0.26, -0.02, 0]);
  rig.add('lanterna', blob([0.13, 0.125, 0.135], m.plano(2), { seg: 18 }), blob([0.07, 0.07, 0.08], m.luz(2), { pos: [-0.04, 0.03, 0], seg: 12 }), blob([0.03, 0.13, 0.14], m(0), { pos: [0.1, 0, 0], seg: 12 }));
  // antenas em raio
  par((l, s) => {
    rig.bone('antena_' + l, 'cabeca', [0.1, 0.1, 0.06 * s], [-20 * s, 0, -24]);
    rig.add('antena_' + l, raio(0.2, m.plano(2)));
  });
  return rig;
}

export const pulsa = (osso: string) => ({ [osso]: ls([1, 1.12, 1.25, 1.08]) });
const anims = animsInseto({ u: 0.55, alt: 0.16, flutua: 0.2, asas: true, mole: 1.2 }, {
  todas: pulsa('lanterna'),
  especial: { lanterna: qs([1, 0.8, 0.7, 1.6, 1.3, 1]) },
  dano: { lanterna: qs([0.6, 0.8, 1]) },
  desmaio: { lanterna: qs([1, 0.9, 0.7, 0.5, 0.5]) },
  idle: { abdomen: lz([0, 3, 6, 2]) },
});

export const vagalumim = criatura({
  num: 28, id: 'vagalumim', nome: 'Vagalumim', porte: 'P', estagio: 'basico', paleta: paletaVaga, build, anims,
  olho: {
    frente: ['.ww.', 'wwpw', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', '.ww.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
