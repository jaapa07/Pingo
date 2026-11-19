/**
 * 130 · SIRI-COURAÇA (Rio/Ferro) — siri que forjou a casca nova com sucata de naufrágio. Estágio final.
 * Mantém da linha: patas e pinças azuis de ponta vermelha, espinhos laterais, remos, olhos em pedúnculo, pose frontal.
 * Cresce: COURAÇA de chapas de aço rebitadas, com costura no meio · espinhos laterais de aço compridos ·
 * pinça-tenaz gigante chapeada de um lado · escotilha redonda no dorso · manchas de ferrugem · ombreiras.
 */
import { criatura, aracnideo, animsAracnideo, blob, calota, ring, garra, par, m, lz, lr, qr, type V3 } from './kits';
import { paletaSiri, tracosSiri, tarsosSiri, deLado } from './129-sirizim';

const paleta = { ...paletaSiri, rampas: [['#38425e', '#8494b2', '#e0e8f2'], paletaSiri.rampas[1], paletaSiri.rampas[2], ['#8c2c28', '#e0623a', '#ffb070']] as [string, string, string][], extras: { ...paletaSiri.extras, f: '#8494b2' } };

function build() {
  const c: [number, number, number] = [0.3, 0.27, 0.5];
  const { rig } = aracnideo({
    corpo: c, alt: 0.2, patas: { pares: 4, abre: 0.3, r: 0.07, joelho: 0.08 },
    pincas: { braco: 0.2, r: 0.085, garra: [0.17, 0.13, 0.11], abre: 40 }, pedunculo: 0.13,
    olho: { r: 0.036, pos: [0, 0, 0] },
    rampas: { corpo: 0, barriga: 2, patas: 1, pontas: 1, pincas: 1 },
  });
  tracosSiri(rig, c, 1.45, m.luz(0));
  // COURAÇA: duas chapas com costura escura no meio, borda grossa e rebites
  rig.add('corpo', blob([0.3, 0.03, 0.035], m.sombra(0), { pos: [0, 0.262, 0], seg: 8, castShadow: false }));
  rig.add('corpo', calota([0.315, 0.283, 0.525], m.sombra(0), { de: 80, ate: 92 }));
  par((_, s) => {
    for (const [x, z] of [[0.16, 0.14], [-0.14, 0.16], [0.05, 0.33], [-0.12, 0.36]] as const) rig.add('corpo', blob([0.03, 0.03, 0.03], m.luz(0), { pos: [x, 0.275 * Math.sqrt(Math.max(0.05, 1 - (x / 0.3) ** 2 - (z / 0.5) ** 2)), z * s], seg: 7 }));
    // ombreiras de chapa sobre o braço da pinça e joelheiras
    rig.add('pinca_' + s2l(s), blob([0.1, 0.09, 0.1], m(0), { pos: [0.08, 0.04, 0], seg: 10 }));
    for (const i of [1, 2, 3]) rig.add(`pata${i}_${s2l(s)}`, blob([0.075, 0.075, 0.075], m.luz(0), { pos: [0, 0.08, 0.15 * s], seg: 8 }));
  });
  // ferrugem: duas manchas quentes
  const fer: [V3, V3][] = [[[0.12, 0.2, -0.26], [0.08, 0.05, 0.1]], [[-0.1, 0.22, 0.24], [0.09, 0.05, 0.08]]];
  for (const [pos, r] of fer) rig.add('corpo', blob(r, m.plano(3), { pos, seg: 8, castShadow: false }));
  // ESCOTILHA no dorso: aro de aço com vidro azul
  rig.add('corpo', ring(0.085, 0.028, m.luz(0), { pos: [-0.06, 0.262, 0], rot: [90, 0, 0] }), blob([0.07, 0.03, 0.07], m.plano(1), { pos: [-0.06, 0.265, 0], seg: 10, castShadow: false }), blob([0.025, 0.02, 0.03], m.luz(1), { pos: [-0.04, 0.29, -0.02], seg: 6, castShadow: false }));
  // PINÇA-TENAZ gigante do lado de lá, chapeada: palma de aço e dois dedos compridos
  rig.bones.garra_d.scale.setScalar(1.4);
  par((l, s) => { rig.bones['pinca_' + l].rotation.z = 0.8; rig.bones['pinca_' + l].rotation.y = -0.8 * s; });
  rig.add('garra_d', blob([0.13, 0.12, 0.1], m(0), { pos: [0.1, 0, 0], seg: 10 }), blob([0.03, 0.03, 0.03], m.luz(0), { pos: [0.1, 0.07, 0.08], seg: 6 }),
    garra(0.3, 0.07, m.luz(0), { pos: [0.16, 0.07, 0], rot: [0, 0, 22], curva: 0.7 }), blob([0.04, 0.035, 0.035], m.plano(3), { pos: [0.44, 0.1, 0], seg: 7 }));
  rig.add('dedo_d', garra(0.26, 0.06, m(0), { pos: [0, 0, 0], curva: -0.6 }));
  // boca gradeada
  rig.add('corpo', blob([0.03, 0.06, 0.16], m.sombra(2), { pos: [0.285, -0.08, 0], seg: 8 }));
  return rig;
}
function s2l(s: number) { return s > 0 ? 'd' : 'e'; }

const anims = animsAracnideo({ u: 0.75, alt: 0.2, pares: 4, mole: 0.5 }, {
  ...tarsosSiri, ...deLado,
  idle: { garra_d: lz([0, 5, 10, 3]), garra_e: lz([6, 2, 0, 4]), tarso4_d: lr([[0, 0, 0], [0, 10, 0], [0, 0, 0], [0, -10, 0]]), tarso4_e: lr([[0, 0, 0], [0, -10, 0], [0, 0, 0], [0, 10, 0]]) },
  // marretada com a tenaz
  fisico: { pinca_d: qr([[0, 6, 14], [0, 10, 30], [0, -8, -40], [0, -3, -14], [0, 0, 0]]) },
});

export const siriCouraca = criatura({
  num: 130, id: 'siri-couraca', nome: 'Siri-Couraça', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', '.ppp.', 'ppwpp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['p', 'p'],
  },
});
