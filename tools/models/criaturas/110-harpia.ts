/**
 * 110 · HARPIA (Vento/Ginga) — gavião-real de penacho imponente. Estágio final.
 * Mantém da linha: cabeça clara, penacho duplo de pontas escuras, faixa de ardósia no peito, pés amarelos de lutador.
 * Cresce: penacho em coroa de cinco penas · colar negro largo · asas-capa de ardósia com barras claras ·
 * calções listrados · garras escuras gigantes, uma erguida em guarda de capoeira · cauda de faixas.
 */
import { criatura, ave, animsAve, blob, calota, pena, tufo, garra, par, m, lz, qz, D2R } from './kits';
import { paletaHarpia } from './109-harpinha';

const paleta = { ...paletaHarpia, extras: { ...paletaHarpia.extras, f: '#99a3bf' } };

function build() {
  const { rig, ref } = ave({
    corpo: [0.3, 0.25, 0.23], ergue: 62,
    pescoco: { len: 0.15, ang: 78, r: 0.15 },
    cabeca: [0.18, 0.165, 0.165],
    bico: { len: 0.25, r: 0.1, y: -0.08, achata: 0.75, gancho: 72, inferior: 0.5 },
    asa: { len: 0.56, larg: 0.3, cai: 24, ponta: 0.5 },
    cauda: { len: 0.4, larg: 0.12, ang: -38, penas: 5, abre: 24 },
    pernas: { alt: 0.26, r: 0.06, z: 0.6, x: -0.08, dedo: 0.22 },
    olho: { r: 0.024, pos: [0.115, 0.035, 0.15] },
    rampas: { corpo: 1, peito: 0, cabeca: 1, asa: 1, asaPonta: 1, cauda: 1, bico: 3, perna: 2 },
  });
  for (const o of ['canela_d', 'canela_e']) rig.bones[o].traverse((x) => { const mesh = x as { isMesh?: boolean; material?: unknown }; if (mesh.isMesh) mesh.material = m.plano(2); });
  rig.bones.asa_d.rotation.y = 0.62; rig.bones.asa_e.rotation.y = -0.62;
  // cabeça cinza-clara e disco facial
  rig.add('cabeca', blob([0.185, 0.17, 0.17], m.luz(1), { pos: [0.005, 0, 0] }));
  rig.add('cabeca', blob([0.08, 0.07, 0.085], m.plano(2), { pos: [0.16, 0.0, 0], seg: 10 }));
  // barras de ardósia no peito branco
  for (const [x, y, w] of [[0.3, -0.02, 0.17], [0.27, -0.12, 0.15]] as const) rig.add('tronco', blob([0.03, 0.028, w], m.plano(1), { pos: [x, y, 0], rot: [0, 0, -30], seg: 10, castShadow: false }));
  // sobrancelha escura franzida
  par((_, s) => rig.add('cabeca', blob([0.11, 0.03, 0.035], m.sombra(2), { pos: [0.08, 0.09, 0.125 * s], rot: [0, 12 * s, -18], seg: 12 })));
  // colar negro largo
  rig.add('pescoco', calota([0.19, 0.17, 0.2], m.sombra(2), { de: 35, ate: 110, rot: [0, 0, 72], pos: [0, 0.0, 0] }));
  rig.add('tronco', blob([0.09, 0.12, 0.235], m.sombra(2), { pos: [0.22, 0.1, 0], rot: [0, 0, -25], seg: 14, castShadow: false }));
  // coroa de cinco penas em dois ossos
  par((l, s) => {
    rig.bone('penacho_' + l, 'cabeca', [ref.topo[0] - 0.05, ref.topo[1] - 0.04, 0.05 * s], [-40 * s, 0, 20]);
    rig.add('penacho_' + l, tufo(3, 0.4, 0.075, m.luz(1), { abre: 24 }), blob([0.055, 0.075, 0.045], m.sombra(2), { pos: [0, 0.37, 0], seg: 8 }));
  });
  rig.bone('penacho_m', 'cabeca', [ref.topo[0] - 0.07, ref.topo[1] - 0.03, 0], [0, 0, 34]);
  rig.add('penacho_m', tufo(1, 0.36, 0.07, m(1)), blob([0.05, 0.065, 0.045], m.sombra(2), { pos: [0, 0.34, 0], seg: 8 }));
  // asas: barras claras e pontas escuras
  par((l, s) => {
    rig.add('asa_' + l, blob([0.045, 0.15, 0.05], m.plano(0), { pos: [-0.2, -0.04, 0.05 * s], rot: [0, 0, 8], seg: 10, castShadow: false }), blob([0.04, 0.14, 0.05], m.plano(0), { pos: [-0.36, -0.06, 0.05 * s], rot: [0, 0, 8], seg: 10, castShadow: false }), blob([0.12, 0.06, 0.06], m.sombra(2), { pos: [-0.04, 0.06, 0.04 * s], seg: 10 }));
    rig.add('asa2_' + l, pena(0.24, 0.11, m.sombra(2), { esp: 0.055, pos: [-0.1, -0.02, 0.02 * s] }), pena(0.18, 0.1, m.sombra(2), { esp: 0.055, pos: [-0.02, -0.13, 0.02 * s], rot: [0, 0, 14] }));
  });
  // cauda de faixas
  for (const [x, mat] of [[-0.14, m.sombra(2)], [-0.26, m.sombra(2)], [-0.36, m(0)]] as const)
    rig.add('cauda1', blob([0.035, 0.032, 0.17], mat, { pos: [x, 0, 0], seg: 10 }));
  // calções listrados e garras gigantes
  par((l) => {
    rig.add('perna_' + l, blob([0.1, 0.14, 0.095], m(0), { pos: [0, -0.05, 0], seg: 14 }), blob([0.085, 0.022, 0.1], m(1), { pos: [0.01, -0.04, 0], seg: 10 }), blob([0.075, 0.022, 0.09], m(1), { pos: [0.01, -0.11, 0], seg: 10 }));
    for (const g of [-34, 0, 34]) rig.add('canela_' + l, garra(0.12, 0.042, m.sombra(2), { pos: [Math.cos(g * D2R) * 0.2 - 0.014, -0.135, -Math.sin(g * D2R) * 0.2], rot: [0, g, 0], curva: 0.9 }));
  });
  // guarda de luta: a perna direita fica erguida, de garra aberta
  rig.bones.perna_d.rotation.z = 58 * D2R; rig.bones.canela_d.rotation.z = -50 * D2R;
  return rig;
}

const anims = animsAve({ u: 1.15, hPerna: 0.26, mole: 0.6 }, {
  idle: { penacho_d: lz([0, 4, 8, -5]), penacho_e: lz([0, 6, 5, -3]), penacho_m: lz([0, 3, 7, -4]), perna_d: lz([0, 3, 6, 2]) },
  fisico: { perna_d: qz([10, 30, -40, -12, 0]), canela_d: qz([-10, -30, 46, 14, 0]) },
  especial: { penacho_d: qz([0, 12, 16, -24, -8, 0]), penacho_e: qz([0, 12, 16, -24, -8, 0]), penacho_m: qz([0, 12, 16, -24, -8, 0]) },
  dano: { penacho_m: qz([24, 10, 0]) },
  desmaio: { perna_d: qz([0, -10, -20, 12, 8]) },
  andar: { perna_d: lz([-32, -58, -84, -58]) },
});

export const harpia = criatura({
  num: 110, id: 'harpia', nome: 'Harpia', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pppp.', 'fappf', 'fapwf', '.fff.'],
    fechado: ['fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
