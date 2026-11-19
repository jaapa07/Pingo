/**
 * 044 · CORUJÃO-ORELHA (Vento/Mente) — corujão-orelhudo (jacurutu), senhor da noite. Estágio final.
 * Mantém da linha: disco facial creme, olhões amarelos, olhos falsos na nuca, espiral lilás, peito riscado.
 * Cresce: dois penachos-"orelha" altos e móveis · peito carijó de barras · gola branca · asas-capa com
 * barras lilás · pés emplumados com garras grandes · cauda larga barrada.
 */
import { criatura, ave, animsAve, blob, calota, pena, garra, bico, par, m, lz, qz } from './kits';
import { paletaCabure, pulsa } from './043-corujinha';

const paleta = { ...paletaCabure, rampas: [['#4e353e', '#8e5e42', '#c79462'], ...paletaCabure.rampas.slice(1)] as [string, string, string][] };

function build() {
  const { rig, ref } = ave({
    corpo: [0.3, 0.25, 0.25], ergue: 66,
    pescoco: { len: 0.1, ang: 82, r: 0.17 },
    cabeca: [0.22, 0.2, 0.25],
    bico: { len: 0.11, r: 0.055, y: -0.3, gancho: 55, inferior: 0.4 },
    asa: { len: 0.5, larg: 0.28, cai: 26, ponta: 0.45 },
    cauda: { len: 0.3, larg: 0.12, ang: -40, penas: 5, abre: 24 },
    pernas: { alt: 0.14, r: 0.04, z: 0.5, dedo: 0.11 },
    olho: { r: 0.03, pos: [0.215, 0.02, 0.11] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  rig.bones.asa_d.rotation.y = 0.25; rig.bones.asa_e.rotation.y = -0.25;
  par((l, s) => {
    // disco facial com aro escuro e sobrancelha franzida
    rig.add('cabeca', blob([0.06, 0.125, 0.125], m.sombra(0), { pos: [0.14, 0.01, 0.11 * s], seg: 16 }));
    rig.add('cabeca', blob([0.06, 0.105, 0.105], m.plano(1), { pos: [0.155, 0.0, 0.11 * s], seg: 16 }));
    rig.add('cabeca', blob([0.06, 0.03, 0.12], m.sombra(0), { pos: [0.19, 0.125, 0.1 * s], rot: [-24 * s, 0, 0], seg: 12 }));
    // PENACHOS-ORELHA em ossos próprios
    rig.bone('orelha_' + l, 'cabeca', [0.04, 0.14, 0.16 * s], [42 * s, 0, 16]);
    rig.add('orelha_' + l, bico(0.24, 0.075, m.sombra(0), { rot: [0, 0, 0], achata: 0.6 }), bico(0.13, 0.05, m.plano(3), { rot: [0, 0, 0], achata: 0.5, pos: [0.03, 0.02, 0] }));
    // olhos falsos na nuca
    rig.add('cabeca', blob([0.04, 0.075, 0.07], m.plano(1), { pos: [-0.18, 0.03, 0.1 * s], seg: 12 }));
    rig.add('cabeca', blob([0.04, 0.05, 0.045], m.sombra(3), { pos: [-0.195, 0.03, 0.1 * s], seg: 10 }));
    // asas-capa: duas barras lilás e pontas escuras
    rig.add('asa_' + l, blob([0.17, 0.03, 0.04], m.plano(3), { pos: [-0.22, 0.02, 0.06 * s], rot: [0, 0, 8], seg: 10 }), blob([0.16, 0.028, 0.04], m.plano(1), { pos: [-0.25, -0.08, 0.06 * s], rot: [0, 0, 8], seg: 10 }));
    rig.add('asa2_' + l, pena(0.2, 0.1, m.sombra(0), { esp: 0.05, pos: [-0.1, -0.02, 0.02 * s] }));
    // pés emplumados e garras
    rig.add('perna_' + l, blob([0.09, 0.11, 0.09], m(1), { pos: [0, -0.05, 0], seg: 14 }));
    for (const g of [-32, 0, 32]) rig.add('canela_' + l, garra(0.055, 0.02, m.sombra(3), { pos: [Math.cos((g * Math.PI) / 180) * 0.1 - 0.008, -0.075, -Math.sin((g * Math.PI) / 180) * 0.1], rot: [0, g, 0], curva: 0.9 }));
  });
  // gola branca e peito carijó
  rig.add('pescoco', calota([0.19, 0.12, 0.2], m.luz(1), { de: 50, ate: 110, rot: [0, 0, -70], pos: [0.0, 0.0, 0] }));
  for (const [x, y, w] of [[0.2, 0.06, 0.17], [0.23, -0.02, 0.2], [0.24, -0.1, 0.2], [0.2, -0.18, 0.17]] as const)
    rig.add('tronco', blob([0.03, 0.026, w], m(0), { pos: [x * 1.1 + 0.02, y, 0], rot: [0, 0, -20], seg: 12, castShadow: false }));
  // pintas no cocuruto e espiral da mente, maior
  for (const [x, z] of [[0.03, 0.07], [0.0, -0.08], [-0.09, 0.0]] as const)
    rig.add('cabeca', blob([0.025, 0.016, 0.025], m.plano(1), { pos: [x, 0.19 - Math.abs(x) * 0.15, z], seg: 8, castShadow: false }));
  rig.bone('espiral', 'cabeca', [ref.testa[0] + 0.045, ref.testa[1] + 0.01, 0], [0, 0, -35]);
  rig.add('espiral', blob([0.02, 0.055, 0.05], m.plano(3), { seg: 10 }), blob([0.024, 0.024, 0.022], m.luz(3), { pos: [0.01, 0, 0], seg: 8 }));
  // cauda barrada
  for (const [x, mat] of [[-0.12, m.sombra(0)], [-0.2, m.plano(1)], [-0.27, m.sombra(0)]] as const)
    rig.add('cauda1', blob([0.03, 0.03, 0.15 + x * -0.1], mat, { pos: [x, 0, 0], seg: 10 }));
  return rig;
}

const anims = animsAve({ u: 1.0, hPerna: 0.14, mole: 0.7 }, {
  idle: { ...pulsa.idle, orelha_d: lz([0, 0, -10, 4]), orelha_e: lz([0, 4, -10, 0]) },
  especial: { ...pulsa.especial, orelha_d: qz([0, 12, 18, -26, -8, 0]), orelha_e: qz([0, 12, 18, -26, -8, 0]) },
  dano: { orelha_d: qz([34, 12, 0]), orelha_e: qz([34, 12, 0]) },
  desmaio: { orelha_d: qz([0, 10, 30, 50, 46]), orelha_e: qz([0, 10, 30, 50, 46]) },
});

export const corujaoOrelha = criatura({
  num: 44, id: 'corujao-orelha', nome: 'Corujão-Orelha', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp...', 'paapp.', 'papwap', '.pappp', '..ppp.'],
    fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
