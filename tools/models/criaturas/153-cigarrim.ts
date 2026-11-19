/**
 * 153 · CIGARRIM (Inseto/Comum) — cigarra recém-saída da terra, cuja casca vazia continua cantando baixinho na árvore.
 * Traços únicos: cabeça LARGA com olhos de conta laranja nos cantos · asas de vidro compridas fechadas em telhado ·
 * corpo atarracado verde com escudo castanho · pedaço da CASCA de muda ainda preso na cabeça, feito gorro · tímbalos laranja.
 * O construtor `cigarra` é reaproveitado pelo Cigarrão.
 */
import { criatura, inseto, animsInseto, blob, calota, par, m, lz, qz, ls, lr, type Rig } from './kits';

export const paletaCigarra = {
  rampas: [
    ['#365a30', '#78a844', '#d2e68a'], // 0 verde-oliva
    ['#3c2a2e', '#705242', '#b09268'], // 1 castanho do escudo e da casca
    ['#7eaec0', '#cef0ec', '#ffffff'], // 2 asas de vidro
    ['#a8481c', '#f2902c', '#ffda84'], // 3 laranja dos olhos e dos tímbalos
  ] as [string, string, string][],
  contorno: '#22202e',
  extras: { w: '#ffffff', p: '#1e1a28', f: '#78a844', a: '#f2902c' },
};

export interface CigarraP { k: number; alt: number; /** asas: comprimento, largura e quanto abrem (0 = telhado fechado, 1 = abertas) */ asa: [number, number]; abre: number }

/** Cigarra: inseto do kit + cabeça larga de olhos nos cantos, asas de vidro em telhado e tímbalos. */
export function cigarra(p: CigarraP): Rig {
  const k = p.k;
  const { rig } = inseto({
    torax: [0.17 * k, 0.15 * k, 0.18 * k], abdomen: [0.2 * k, 0.14 * k, 0.15 * k], cabeca: [0.1 * k, 0.12 * k, 0.2 * k], alt: p.alt, caiAbdomen: 6,
    patas: { abre: 0.13 * k, r: 0.03 * k, joelho: 0.03 * k }, asas: { len: 0.1, larg: 0.1, pares: 1 },
    olho: { r: 0.036 * Math.min(k, 1.15), pos: [0.11 * k, 0.04 * k, 0.185 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 1, asas: 2, barriga: 1 },
  });
  // escudo castanho do tórax com um "W" claro e focinho (rostro) claro
  rig.add('corpo', calota([0.18 * k, 0.165 * k, 0.19 * k], m(1), { de: 0, ate: 66 }), blob([0.06 * k, 0.03 * k, 0.12 * k], m.luz(0), { pos: [0.06 * k, 0.15 * k, 0], seg: 10, castShadow: false }));
  rig.add('cabeca', blob([0.07 * k, 0.08 * k, 0.09 * k], m.luz(0), { pos: [0.13 * k, -0.05 * k, 0], seg: 12 }));
  par((l, s) => {
    // olhos de conta nos cantos: órbita laranja saltada
    rig.add('cabeca', blob([0.07 * k, 0.075 * k, 0.065 * k], m(3), { pos: [0.07 * k, 0.04 * k, 0.17 * k * s], seg: 12 }));
    // tímbalos: discos laranja nos flancos do abdômen
    rig.bone('timbalo_' + l, 'abdomen', [-0.08 * k, -0.01 * k, 0.13 * k * s]);
    rig.add('timbalo_' + l, blob([0.07 * k, 0.075 * k, 0.045 * k], m.plano(3), { seg: 12 }), blob([0.035 * k, 0.04 * k, 0.05 * k], m.luz(3), { seg: 8, castShadow: false }));
    // ASAS de vidro: refaz o osso do kit em telhado (ou abertas), com raiz verde e nervura
    const a = rig.bones['asa_' + l]; a.clear();
    a.position.set(-0.02 * k, 0.15 * k, 0.07 * k * s);
    a.rotation.set((0.85 - p.abre * 1.45) * s, (0.14 + p.abre * 0.96) * s, -0.06);
    const [len, larg] = p.asa;
    rig.add('asa_' + l, blob([len * 0.5, larg * 0.07, larg * 0.5], m(2), { pos: [-len * 0.5, 0, larg * 0.36 * s], seg: 18, castShadow: false }),
      blob([len * 0.44, larg * 0.09, larg * 0.07], m.sombra(2), { pos: [-len * 0.48, 0, larg * 0.04 * s], seg: 10, castShadow: false }),
      blob([len * 0.14, larg * 0.1, larg * 0.24], m(0), { pos: [-len * 0.12, 0, larg * 0.2 * s], seg: 10, castShadow: false }));
  });
  // cintas do abdômen
  for (const x of [-0.16, -0.27]) rig.add('abdomen', blob([0.025 * k, 0.13 * k * (x < -0.2 ? 0.86 : 1), 0.14 * k * (x < -0.2 ? 0.86 : 1)], m.sombra(0), { pos: [x * k, 0.005, 0], seg: 12, castShadow: false }));
  return rig;
}

function build() {
  const rig = cigarra({ k: 1, alt: 0.13, asa: [0.52, 0.2], abre: 0 });
  // GORRO de casca: metade da muda, rachada, ainda presa no alto da cabeça
  rig.bone('casca', 'cabeca', [0.04, 0.1, 0], [0, 0, 14]);
  rig.add('casca', calota([0.1, 0.1, 0.17], m.luz(1), { de: 0, ate: 86 }), blob([0.05, 0.045, 0.045], m(1), { pos: [0.02, 0.09, 0.06], seg: 8 }), blob([0.045, 0.04, 0.045], m(1), { pos: [-0.02, 0.09, -0.07], seg: 8 }), blob([0.02, 0.06, 0.02], m.sombra(1), { pos: [0.06, 0.05, 0], seg: 6, castShadow: false }));
  return rig;
}

export const canto = { idle: { timbalo_d: ls([1, 1.2, 0.9, 1.25]), timbalo_e: ls([1.2, 0.9, 1.25, 1]), asa_d: lr([[0, 0, 0], [-4, 0, 0], [0, 0, 0], [-4, 0, 0]]), asa_e: lr([[0, 0, 0], [4, 0, 0], [0, 0, 0], [4, 0, 0]]) } };
const anims = animsInseto({ u: 0.5, alt: 0.13, mole: 1 }, {
  idle: { ...canto.idle, casca: lz([0, 3, 6, 2]) },
  dano: { casca: qz([20, 7, 0]) },
});

export const cigarrim = criatura({
  num: 153, id: 'cigarrim', nome: 'Cigarrim', porte: 'P', estagio: 'basico', paleta: paletaCigarra, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['aaaa', 'paap', '.pp.', 'aaaa'],
    mapa: ['p', 'p'],
  },
});
