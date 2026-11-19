/**
 * 143 · BESOURIM (Inseto/Ferro) — besouro-rinoceronte filhote que lustra o toquinho de chifre na casca das árvores.
 * Traços únicos: casco redondo castanho-brilhante com costura no meio · TOQUINHO de chifre de aço arrebitado ·
 * escudo do tórax escuro com calombo · patas grossas de ganchinho · antenas em leque · brilho de lustro no casco.
 * O construtor `besouro` é reaproveitado pelo Herculão.
 */
import { criatura, inseto, animsInseto, blob, calota, tube, par, m, lz, qz, ls, type Rig } from './kits';

export const paletaBesouro = {
  rampas: [
    ['#5c2434', '#ac4c3a', '#f29a64'], // 0 casco castanho
    ['#1e1a32', '#3e3858', '#726c98'], // 1 corpo e patas escuros
    ['#46526e', '#9aaac6', '#f0f6fc'], // 2 aço do chifre
    ['#a8481c', '#f09230', '#ffd474'], // 3 pelinhos alaranjados
  ] as [string, string, string][],
  contorno: '#1c1428',
  extras: { w: '#ffffff', p: '#16101e', f: '#3e3858' },
};

export interface BesouroP { k: number; alt: number }

/** Besouro de casco alto: inseto do kit + escudo, costura, ganchos e antenas em leque. */
export function besouro(p: BesouroP): Rig {
  const k = p.k;
  const { rig } = inseto({
    torax: [0.17 * k, 0.16 * k, 0.19 * k], abdomen: [0.21 * k, 0.19 * k, 0.21 * k], cabeca: [0.12 * k, 0.11 * k, 0.13 * k], alt: p.alt, caiAbdomen: 4,
    patas: { abre: 0.17 * k, r: 0.042 * k, joelho: 0.04 * k }, elitros: true,
    olho: { r: 0.03 * Math.min(k, 1.2), pos: [0.13 * k, 0.03 * k, 0.1 * k] },
    rampas: { torax: 1, abdomen: 1, cabeca: 1, patas: 1, elitros: 0, barriga: 3 },
  });
  // escudo do tórax (pronoto) alto e escuro com aba clara
  rig.add('corpo', calota([0.19 * k, 0.185 * k, 0.21 * k], m(1), { de: 0, ate: 84 }), blob([0.05 * k, 0.03 * k, 0.2 * k], m.luz(1), { pos: [-0.13 * k, 0.07 * k, 0], seg: 10, castShadow: false }));
  // costura do casco e brilho de lustro
  rig.add('abdomen', blob([0.2 * k, 0.03 * k, 0.03 * k], m.sombra(0), { pos: [-0.2 * k, 0.15 * k, 0], seg: 8, castShadow: false }));
  par((l, s) => {
    rig.add('elitro_' + l, blob([0.07 * k, 0.03 * k, 0.04 * k], m.luz(0), { pos: [-0.16 * k, 0.1 * k, 0.12 * k * s], rot: [0, 0, 10], seg: 8, castShadow: false }));
    // antenas curtas em leque alaranjado
    rig.add('cabeca', tube([[0.1 * k, 0.03 * k, 0.1 * k * s], [0.15 * k, 0.03 * k, 0.17 * k * s], [0.17 * k, 0.06 * k, 0.2 * k * s]], 0.018 * k, m(1), { seg: 6, radial: 6 }), blob([0.035 * k, 0.045 * k, 0.03 * k], m(3), { pos: [0.18 * k, 0.08 * k, 0.21 * k * s], seg: 8 }));
    // ganchinhos claros nos pés
    for (const i of [1, 2, 3]) { const dx = [0.5, 0, -0.6][i - 1] * 0.17 * k * 0.5; rig.add(`tarso${i}_${l}`, blob([0.04 * k, 0.03 * k, 0.04 * k], m.luz(1), { pos: [dx, -(0.04 * k + p.alt - 0.048 * k) + 0.02, 0.0765 * k * s], seg: 8 })); }
  });
  return rig;
}

function build() {
  const rig = besouro({ k: 1, alt: 0.13 });
  // TOQUINHO de chifre de aço, arrebitado, num osso para lustrar
  rig.bone('chifre', 'cabeca', [0.13, 0.05, 0], [0, 0, 0]);
  rig.add('chifre', tube([[0, 0, 0], [0.09, 0.06, 0], [0.12, 0.17, 0]], (u) => 0.055 * (1 - u * 0.45), m(2), { seg: 10, radial: 10 }), blob([0.045, 0.04, 0.05], m.luz(2), { pos: [0.12, 0.18, 0], seg: 10 }));
  // calombo do escudo (o futuro segundo chifre)
  rig.add('corpo', blob([0.06, 0.05, 0.06], m.luz(1), { pos: [0.08, 0.17, 0], seg: 10 }));
  return rig;
}

const anims = animsInseto({ u: 0.5, alt: 0.13, mole: 0.8 }, {
  idle: { chifre: lz([0, 4, 8, 3]) },
  fisico: { chifre: qz([-10, -20, 30, 10, 0]) },
  especial: { chifre: [...qz([0, -10, -14, 24, 8, 0]), ...ls([1])] },
});

export const besourim = criatura({
  num: 143, id: 'besourim', nome: 'Besourim', porte: 'P', estagio: 'basico', paleta: paletaBesouro, build, anims,
  olho: {
    frente: ['.ww.', 'wwpw', 'wppw', '.ww.'],
    fechado: ['ffff', 'wffw', '.ww.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
