/**
 * 149 · JATAÍ (Inseto/Encanto) — abelha nativa sem ferrão, do tamanho de um grão de arroz, que só divide o mel com quem faz cafuné.
 * Traços únicos: corpinho dourado-mel de cintas castanhas · gola felpuda creme · bolotas de pólen nas patas de trás ·
 * florzinha cor-de-rosa no colo · antenas de bolinha · asas de véu · brilhos de encanto.
 * O construtor `abelha` é reaproveitado pela Jataí-Rainha.
 */
import { criatura, inseto, animsInseto, blob, par, m, ls, lz, qs, lr, type Rig, type V3 } from './kits';

export const paletaJatai = {
  rampas: [
    ['#9c5a1e', '#f2aa32', '#ffe690'], // 0 dourado-mel
    ['#3c2632', '#6e4836', '#aa8054'], // 1 castanho da cabeça e das cintas
    ['#90aed0', '#dceefa', '#ffffff'], // 2 asas de véu, gola e cera
    ['#b83c7e', '#f886b6', '#ffd6e6'], // 3 rosa do encanto
  ] as [string, string, string][],
  contorno: '#2c1a2c',
  extras: { w: '#ffffff', p: '#241424', f: '#6e4836' },
};

export interface AbelhaP { k: number; flutua: number; /** semi-eixos do abdômen */ abd: V3; asa: [number, number]; /** graus que o abdômen cai (padrão 34) */ cai?: number }

/** Abelha sem ferrão: inseto voador do kit + gola felpuda, cintas, pólen e bochechas. */
export function abelha(p: AbelhaP): Rig {
  const k = p.k, [ax, ay, az] = p.abd;
  const { rig } = inseto({
    torax: [0.15 * k, 0.15 * k, 0.15 * k], abdomen: p.abd, cabeca: [0.15 * k, 0.145 * k, 0.16 * k], alt: 0.12 * k, flutua: p.flutua, caiAbdomen: p.cai ?? 34,
    patas: { abre: 0.09 * k, r: 0.026 * k, joelho: 0.02 * k }, antenas: { len: 0.13 * k, r: 0.016 * k, abre: 28, bola: 0.03 * k },
    asas: { len: p.asa[0], larg: p.asa[1], pares: 2 },
    olho: { r: 0.034 * Math.min(k, 1.15), pos: [0.16 * k, 0.02 * k, 0.115 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 1, patas: 1, antenas: 1, asas: 2 },
  });
  // gola felpuda creme entre a cabeça e o tórax (cinco pompons)
  for (const [y, z] of [[0.13, 0], [0.07, 0.12], [0.07, -0.12], [-0.06, 0.13], [-0.06, -0.13]] as const) rig.add('corpo', blob([0.07 * k, 0.07 * k, 0.07 * k], m.luz(2), { pos: [0.1 * k, y * k, z * k], seg: 10 }));
  // cintas castanhas e a pontinha arredondada (sem ferrão)
  for (const x of [-0.5, -1.05]) rig.add('abdomen', blob([ax * 0.14, ay * (x < -1 ? 0.9 : 1.03), az * (x < -1 ? 0.9 : 1.03)], m(1), { pos: [ax * x, 0, 0], seg: 14, castShadow: false }));
  rig.add('abdomen', blob([ax * 0.3, ay * 0.4, az * 0.4], m.luz(0), { pos: [-ax * 1.62, 0, 0], seg: 10 }));
  // focinho dourado, bochechas rosa
  rig.add('cabeca', blob([0.07 * k, 0.07 * k, 0.1 * k], m(0), { pos: [0.19 * k, -0.05 * k, 0], seg: 12 }));
  par((l, s) => {
    rig.add('cabeca', blob([0.03 * k, 0.03 * k, 0.04 * k], m.plano(3), { pos: [0.19 * k, -0.035 * k, 0.11 * k * s], seg: 8, castShadow: false }));
    // bolotas de pólen nas patas de trás
    rig.add('tarso3_' + l, blob([0.055 * k, 0.065 * k, 0.05 * k], m.luz(0), { pos: [-0.03 * k, -0.07 * k, 0.045 * k * s], seg: 10 }));
  });
  return rig;
}

/** Flor de cinco pétalas num osso (crescendo em +X, de frente para quem olha). */
export function florzinha(rig: Rig, nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos, [0, 0, -20]);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; rig.add(nome, blob([r * 0.4, r * 0.62, r * 0.62], i % 2 ? m(3) : m.luz(3), { pos: [0, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8], seg: 10 })); }
  rig.add(nome, blob([r * 0.5, r * 0.5, r * 0.5], m.luz(0), { pos: [r * 0.2, 0, 0], seg: 8 }));
}
export const cintilaJ = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => { const v = [1, 0.3, 0.8, 1.3]; return [n, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])]; }));
export const brilhoJ = (r: number) => [blob([r * 0.3, r, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r, r * 0.3, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r * 0.3, r * 0.3, r], m.luz(3), { seg: 8, castShadow: false })];

function build() {
  const rig = abelha({ k: 1, flutua: 0.24, abd: [0.17, 0.145, 0.15], asa: [0.3, 0.2] });
  florzinha(rig, 'flor', 'corpo', [0.17, -0.16, 0.0], 0.075);
  const pos: V3[] = [[0.34, 0.2, 0.2], [-0.3, 0.3, -0.26]];
  pos.forEach((q, i) => { rig.bone('brilho' + (i + 1), 'corpo', q); rig.add('brilho' + (i + 1), ...brilhoJ([0.05, 0.04][i])); });
  return rig;
}

const anims = animsInseto({ u: 0.5, alt: 0.12, flutua: 0.24, asas: true, mole: 1.3 }, {
  todas: cintilaJ(['brilho1', 'brilho2']),
  idle: { flor: lz([0, 6, 10, 4]), abdomen: lz([0, 3, 6, 2]) },
  especial: { flor: [...qs([1, 1.2, 1.4, 1.8, 1.3, 1]), ...lr([[0, 0, 0]])] },
});

export const jatai = criatura({
  num: 149, id: 'jatai', nome: 'Jataí', porte: 'P', estagio: 'basico', paleta: paletaJatai, build, anims,
  olho: {
    frente: ['.ww.', 'wwpw', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', '.ww.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
