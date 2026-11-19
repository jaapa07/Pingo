/**
 * 064 · BUGIO-TROVÃO (Ginga/Trovão) — bugio de uivo trovejante. Estágio final.
 * Mantém da linha: pelo ruivo, rosto escuro de boca aberta, barba dourada, papo inflado, cauda em caracol.
 * Cresce: juba de nuvem de trovoada nos ombros · raio em zigue-zague na ponta da cauda e dois na testa ·
 * papo enorme que brilha · punhos fechados no chão em postura de ginga · presas à mostra.
 */
import { criatura, animsArboricola, unirExtras, blob, slab, espuma, par, m, lz, qz, ls, type Rig, type V2 } from './kits';
import { bracosCurtos } from './061-preguicim';
import { paletaBugio, corpoBugio, uivo } from './063-bugiozinho';

/** Raio chapado em zigue-zague crescendo em +Y. */
const raio = (h: number, w: number) => {
  const pts: V2[] = [[-w * 0.5, 0], [w * 0.3, 0], [0, h * 0.4], [w * 0.6, h * 0.4], [-w * 0.1, h], [-w * 0.1, h * 0.58], [-w * 0.7, h * 0.58]];
  return slab(pts, w * 0.45, m.plano(2));
};
const faisca = (ossos: string[]) => Object.fromEntries(ossos.map((o, i) => { const v = [1, 1.2, 0.85, 1.1]; return ['?' + o, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])]; }));

function nuvem(rig: Rig, nome: string, pai: string, pos: [number, number, number], r: number) { rig.bone(nome, pai, pos); rig.add(nome, espuma(r, m(3))); }

function build() {
  const { rig, ref } = corpoBugio({ k: 1.35, cabeca: [0.27, 0.25, 0.26], bracos: 0.95, papo: 0.15, cauda: 1.35 });
  // juba de nuvem de trovoada sobre os ombros e a nuca
  nuvem(rig, 'nuvem1', 'tronco', [-0.08, 0.3, 0.2], 0.13); nuvem(rig, 'nuvem2', 'tronco', [-0.08, 0.3, -0.2], 0.13);
  nuvem(rig, 'nuvem3', 'tronco', [-0.2, 0.2, 0], 0.15); nuvem(rig, 'nuvem4', 'cabeca', [-0.2, 0.1, 0], 0.12);
  // raios: dois na testa (sobrancelhas elétricas) e um grande na ponta da cauda
  par((l, s) => { rig.bone('raio_' + l, 'cabeca', [ref.topo[0] + 0.08, ref.topo[1] - 0.05, 0.11 * s], [18 * s, 0, 16]); rig.add('raio_' + l, raio(0.24, 0.12)); });
  rig.bone('raio_c', 'cauda4', [-0.2, 0, 0], [0, 0, 90]);
  rig.add('raio_c', raio(0.4, 0.2));
  // presas e punhos reforçados
  par((l, s) => {
    rig.add('cabeca', blob([0.022, 0.05, 0.022], m.luz(2), { pos: [0.33, -0.1, 0.045 * s], seg: 8 }));
    rig.add('antebraco_' + l, blob([0.1, 0.085, 0.1], m.sombra(1), { pos: [0.27, -0.34, -0.03 * s], seg: 12 }));
    rig.add('braco_' + l, blob([0.11, 0.13, 0.1], m.luz(0), { pos: [0, -0.02, 0.02 * s], seg: 12 }));
  });
  return rig;
}

const anims = animsArboricola({ u: 1.1, hPerna: 0.2, mole: 0.8, caudaSegs: 2 }, unirExtras(unirExtras(bracosCurtos, uivo), {
  todas: faisca(['raio_d', 'raio_e', 'raio_c']),
  idle: { nuvem3: lz([0, 3, 5, 2]) },
  especial: { raio_c: qz([0, 10, 14, -20, -8, 0]) },
}));

export const bugioTrovao = criatura({
  num: 64, id: 'bugio-trovao', nome: 'Bugio-Trovão', porte: 'M', estagio: 'final', paleta: paletaBugio, build, anims,
  olho: {
    frente: ['pp...', 'aaww.', '.awpp', '.wwpp', '..ww.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
void qz;
