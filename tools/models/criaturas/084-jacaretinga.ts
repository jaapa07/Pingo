/**
 * 084 · JACARETINGA (Rio/Terra) — jacaretinga do pantanal, que passa a seca enterrado na lama.
 * Mantém da linha: couro oliva, papo amarelo, olhos saltados de íris dourada, rabo de faixas, sorriso dentado.
 * Cresce: focinho comprido com "óculos" (a ponte entre os olhos) · crosta de LAMA seca rachada no lombo e no focinho ·
 * escudos altos · torrões pingando · mandíbula forte.
 */
import { criatura, animsLagarto, blob, par, m, lz, lp, type V3 } from './kits';
import { paletaJacare, corpoJacare } from './083-jacarezinho';

export const paletaTinga = { ...paletaJacare, rampas: [paletaJacare.rampas[0], paletaJacare.rampas[1], ['#48302a', '#8c5c3a', '#caa06a'], paletaJacare.rampas[3]] as [string, string, string][] }; // 2 lama

function build() {
  const { rig } = corpoJacare({ k: 1.15, tronco: [0.36, 0.14, 0.18], cabeca: [0.17, 0.105, 0.14], focinho: 0.2, rabo: 0.75, crista: 0.085, nCrista: 7, alt: 0.09, dentes: 3 });
  // "óculos": ponte clara entre os olhos
  rig.add('cabeca', blob([0.03, 0.03, 0.12], m.luz(0), { pos: [0.12, 0.11, 0], seg: 8 }));
  // crosta de lama: placas no lombo, na garupa e no focinho
  const placas: [V3, V3][] = [[[0.14, 0.13, 0.08], [0.11, 0.035, 0.08]], [[-0.06, 0.14, -0.07], [0.13, 0.035, 0.09]], [[-0.24, 0.115, 0.06], [0.1, 0.03, 0.08]]];
  for (const [pos, r] of placas) rig.add('corpo', blob(r, m(2), { pos, seg: 8 }), blob([r[0] * 0.5, r[1], r[2] * 0.5], m.luz(2), { pos: [pos[0] + 0.02, pos[1] + 0.012, pos[2]], seg: 6 }));
  rig.add('cabeca', blob([0.08, 0.03, 0.07], m(2), { pos: [0.3, 0.06, 0.0], seg: 8 }));
  rig.add('cauda2', blob([0.08, 0.03, 0.06], m(2), { pos: [-0.08, 0.07, 0], seg: 8 }));
  rig.add('pescoco', blob([0.13, 0.09, 0.15], m(1), { pos: [0.06, -0.07, 0], seg: 12 }));
  par((l, s) => { rig.add('canela_f' + l, blob([0.055, 0.04, 0.055], m(2), { pos: [0.04, -0.1, 0.03 * s], seg: 8 })); });
  // torrões pingando
  rig.bone('torrao1', 'corpo', [0.1, 0.02, 0.2]); rig.add('torrao1', blob([0.03, 0.04, 0.03], m(2), { seg: 6 }));
  rig.bone('torrao2', 'corpo', [-0.2, 0.02, -0.2]); rig.add('torrao2', blob([0.028, 0.036, 0.028], m.luz(2), { seg: 6 }));
  return rig;
}

const cai: V3[] = [[0, 0, 0], [0, -0.03, 0], [0, -0.07, 0], [0, -0.1, 0]];
const anims = animsLagarto({ u: 0.55, hPerna: 0.09, caudaSegs: 4, mole: 0.8 }, {
  idle: { torrao1: lp(cai), torrao2: lp([cai[2], cai[3], cai[0], cai[1]]), cabeca: lz([0, 2, 4, 1]) },
});

export const jacaretinga = criatura({
  num: 84, id: 'jacaretinga', nome: 'Jacaretinga', porte: 'M', estagio: 'medio', paleta: paletaTinga, build, anims,
  olho: { frente: ['pppp.', '.aaa.', 'apwpa', 'apppa', '.aaa.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['a', 'p'] },
});
