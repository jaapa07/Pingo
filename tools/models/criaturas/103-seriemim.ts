/**
 * 103 · SERIEMIM (Comum) — filhote de seriema, que já ensaia o canto de gargalhada do cerrado.
 * Traços únicos: penacho arrepiado na testa, em cima do bico · bico e pernas vermelhos · pernas compridas ·
 * cauda longa de faixa escura e ponta creme · olho claro de aro azul · bico aberto cantando.
 */
import { criatura, ave, animsAve, blob, tufo, pena, par, m, lz, qz, unirExtras, D2R, type V3 } from './kits';
import { asasContidas } from './051-ararinha';

export const paletaSeriema = {
  rampas: [
    ['#483c46', '#9e8e7e', '#d8ccb0'], // 0 penas cinza-areia
    ['#b5a28a', '#f4e8cc', '#fffbf0'], // 1 creme da barriga e da ponta da cauda
    ['#8a1e30', '#e0463a', '#ff9a70'], // 2 vermelho do bico e das pernas
    ['#1d1927', '#3b3547', '#69637f'], // 3 penacho, faixa da cauda e pontas das asas
  ] as [string, string, string][],
  contorno: '#231a24',
  extras: { w: '#ffffff', p: '#17121c', f: '#9e8e7e', a: '#6ab8f0' },
};

export interface SeriemaP { k: number; pescoco: number; perna: number; cabeca: V3; bico: number; cauda: number; penacho: number }

/** Corpo comum da linha: esguia, pernas e bico vermelhos, penacho na testa, cauda longa de faixa. */
export function corpoSeriema(p: SeriemaP) {
  const k = p.k, [hx, hy, hz] = p.cabeca;
  const kit = ave({
    corpo: [0.23 * k, 0.17 * k, 0.16 * k], ergue: 16,
    pescoco: { len: p.pescoco, ang: 72, r: 0.06 * k },
    cabeca: p.cabeca,
    bico: { len: p.bico, r: hy * 0.46, y: -0.1, gancho: 44, achata: 0.8, inferior: 0.7 },
    asa: { len: 0.3 * k, larg: 0.17 * k, cai: 22, ponta: 0.5 },
    cauda: { len: p.cauda, larg: 0.1 * k, ang: -8, penas: 3, abre: 10 },
    pernas: { alt: p.perna, r: 0.032 * k, z: 0.5, x: 0, dedo: 0.09 * k },
    olho: { r: 0.026, pos: [hx * 0.42, hy * 0.2, hz * 0.82] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 3, cauda: 0, bico: 2, perna: 2 },
  });
  const rig = kit.rig;
  // PENACHO na testa (osso próprio), apontando para a frente
  rig.bone('penacho', 'cabeca', [hx * 0.7, hy * 0.6, 0], [0, 0, -34]);
  rig.add('penacho', tufo(4, p.penacho, p.penacho * 0.3, m(3), { abre: 30 }));
  // cauda: faixa escura e ponta creme
  rig.add('cauda1', blob([0.04 * k, 0.03 * k, 0.11 * k], m(3), { pos: [-p.cauda * 0.68, 0.01, 0], seg: 8 }), blob([0.05 * k, 0.03 * k, 0.1 * k], m.luz(1), { pos: [-p.cauda * 0.9, 0.01, 0], seg: 8 }));
  par((l, s) => {
    // aro azul do olho e barrado fino da asa
    rig.add('cabeca', blob([hx * 0.3, hy * 0.34, hz * 0.14], m.luz(3), { pos: [hx * 0.42, hy * 0.2, hz * 0.76 * s], seg: 8 }));
    rig.add('asa_' + l, blob([0.03 * k, 0.07 * k, 0.03 * k], m.sombra(0), { pos: [-0.12 * k, -0.02 * k, 0.04 * k * s], seg: 6 }), blob([0.03 * k, 0.06 * k, 0.03 * k], m.sombra(0), { pos: [-0.2 * k, -0.03 * k, 0.04 * k * s], seg: 6 }));
  });
  return kit;
}

function build() {
  const { rig } = corpoSeriema({ k: 0.9, pescoco: 0.18, perna: 0.26, cabeca: [0.12, 0.11, 0.105], bico: 0.1, cauda: 0.26, penacho: 0.09 });
  // cantando: cabeça jogada para trás e bico aberto
  rig.bones.cabeca.rotation.z = 22 * D2R; rig.bones.mandibula.rotation.z = -24 * D2R;
  // penugem do peito
  rig.add('tronco', blob([0.09, 0.09, 0.11], m.luz(1), { pos: [0.16, 0.0, 0], seg: 10 }));
  void pena;
  return rig;
}

const anims = animsAve({ u: 0.7, hPerna: 0.26, mole: 1.2 }, unirExtras(asasContidas, {
  idle: { penacho: lz([0, 6, 12, -4]), mandibula: lz([0, 14, 0, 14]) },
  especial: { penacho: qz([0, 14, 20, -26, -8, 0]) },
  dano: { penacho: qz([28, 10, 0]) },
}));

export const seriemim = criatura({
  num: 103, id: 'seriemim', nome: 'Seriemim', porte: 'P', estagio: 'basico', paleta: paletaSeriema, build, anims,
  olho: { frente: ['.aa.', 'apwa', 'appa', '.aa.'], fechado: ['.aa.', 'afff', 'appa', '.aa.'], mapa: ['a', 'p'] },
});
