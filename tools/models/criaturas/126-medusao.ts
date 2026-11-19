/**
 * 126 · MEDUSÃO (Rio/Veneno) — água-viva-juba que arrasta a cabeleira luminosa pela baía. Estágio final.
 * Mantém da linha: sino lilás com babados, trevo rosa, tentáculos de gota verde, braços orais rosa.
 * Cresce: JUBA farta de mechas rosa em volta do sino · sino alto com gomos e coroa de calombos ·
 * LAMPIÃO verde-veneno aceso por baixo (o "lampião afogado") · oito tentáculos longos · olhar bravo.
 */
import { criatura, blob, tube, calota, m, ls, qs, lr, type V3 } from './kits';
import { paletaMedusa, medusa, animsMedusa, trevo } from './125-medusim';

const paleta = { ...paletaMedusa, rampas: [['#3a2e8c', '#7478e0', '#c8d2ff'], paletaMedusa.rampas[1], paletaMedusa.rampas[2], paletaMedusa.rampas[3]] as [string, string, string][], extras: { ...paletaMedusa.extras, f: '#7478e0', a: '#7ce048' } };
const R = 0.4, H = 0.42, NJ = 9;

function build() {
  const rig = medusa({ R, H, flutua: 0.66, tent: { n: 8, len: 0.6, r: 0.04 }, oral: { len: 0.4, r: 0.085 }, olho: 0.03, babados: 12 });
  trevo(rig, R, H, 0.075);
  // gomos do sino: meridianos mais claros
  for (const a of [-60, -20, 20, 60, 120, 180, 240]) rig.add('sino', calota([R * 1.02, H * 1.02, R * 1.02], m.luz(0), { de: 28, ate: 78, arco0: a + 90 - 7, arco: 14 }));
  // coroa de calombos no alto
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; rig.add('sino', blob([0.05, 0.055, 0.05], m.luz(0), { pos: [Math.cos(a) * R * 0.6, H * 0.76, Math.sin(a) * R * 0.6], seg: 8 })); }
  // JUBA: mechas rosa grossas e onduladas penduradas na barra, cada uma num osso
  for (let i = 0; i < NJ; i++) {
    const ang = (360 / NJ) * i + 10, a = ang * Math.PI / 180, L = 0.3 + (i % 3) * 0.05;
    rig.bone('juba' + (i + 1), 'corpo', [Math.cos(a) * R * 0.86, -H * 0.03, -Math.sin(a) * R * 0.86], [0, ang, 14]);
    rig.add('juba' + (i + 1), tube([[0, 0, 0], [0.05, -L * 0.3, 0.03], [-0.03, -L * 0.65, -0.02], [0.03, -L, 0]], (u) => 0.075 * (1 - u * 0.6), i % 2 ? m(1) : m.luz(1), { seg: 12, radial: 8 }));
  }
  // LAMPIÃO: bulbo verde aceso entre os braços orais
  rig.bone('lampiao', 'oral', [0, -0.06, 0]);
  rig.add('lampiao', blob([0.13, 0.15, 0.13], m.plano(2), { seg: 14, castShadow: false }), blob([0.07, 0.08, 0.07], m.luz(2), { pos: [0.05, 0.03, -0.05], seg: 10, castShadow: false }));
  // sobrancelhas grossas e bochechas
  for (const s of [1, -1]) rig.add('sino', blob([0.04, 0.03, 0.08], m.sombra(0), { pos: [R * 0.84, H * 0.56, R * 0.36 * s], rot: [-20 * s, 0, 0], seg: 8, castShadow: false }), blob([0.035, 0.04, 0.06], m.plano(1), { pos: [R * 0.93, H * 0.24, R * 0.24 * s], seg: 10, castShadow: false }));
  const gotas: V3[] = [[0.5, 0.1, 0.3], [-0.1, 0.0, -0.56]];
  gotas.forEach((pos, i) => { rig.bone('gota' + (i + 1), 'corpo', pos); rig.add('gota' + (i + 1), blob([0.04, 0.05, 0.04], m.luz(2), { seg: 8, castShadow: false })); });
  return rig;
}

const juba = (v: number[]) => Object.fromEntries(Array.from({ length: NJ }, (_, i) => ['juba' + (i + 1), lr(v.map((_, f) => [0, 0, v[(f + i) % v.length]] as V3))]));
const anims = animsMedusa({ u: 1.2, flutua: 0.66, n: 8, mole: 1.1 }, {
  todas: { ...juba([0, 6, 12, 4]), lampiao: ls([1, 1.08, 1.16, 1.05]), gota1: ls([1, 0.5, 0.9, 1.3]), gota2: ls([0.9, 1.3, 1, 0.5]) },
  especial: { lampiao: qs([1, 0.8, 0.7, 1.7, 1.3, 1]) },
  desmaio: { lampiao: qs([1, 0.9, 0.7, 0.5, 0.5]) },
});

export const medusao = criatura({
  num: 126, id: 'medusao', nome: 'Medusão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.awpp', '.appp', '..pp.'],
    fechado: ['fffff', 'fffff', 'ppppp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
