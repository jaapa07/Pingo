/**
 * 085 · JACARUÇU (Rio/Lenda) — jacaré-açu colossal, o velho rei negro dos rios do Norte. Estágio final.
 * Mantém da linha: olhos saltados de íris dourada, papo claro, rabo de faixas, fileira de escudos, bocarra dentada.
 * Cresce: couro NEGRO-esverdeado · faixas douradas no queixo e nos flancos · crista de escudos altos acesos em ouro ·
 * presas enormes · cabeça comprida e alta · rabo-serra de pontas duplas · brasa dourada da lenda entre os olhos.
 */
import { criatura, animsLagarto, blob, lathe, par, m, lz, ls, qs } from './kits';
import { paletaJacare, corpoJacare } from './083-jacarezinho';

const paleta = {
  ...paletaJacare, contorno: '#0c1216', extras: { w: '#ffffff', p: '#0a0e12', f: '#2e4244', a: '#ffd24a' },
  rampas: [['#131b22', '#2e4244', '#5c7c6e'], ['#b47c1e', '#ffd24a', '#fff6b4'], ['#0e1318', '#232d32', '#465650'], paletaJacare.rampas[3]] as [string, string, string][], // 0 negro-esverdeado · 1 ouro da lenda
};

function build() {
  const { rig } = corpoJacare({ k: 1.5, tronco: [0.5, 0.2, 0.25], cabeca: [0.22, 0.14, 0.18], focinho: 0.32, rabo: 1.05, crista: 0.11, nCrista: 8, alt: 0.13, dentes: 4, faixas: 0 });
  // crista acesa: cones dourados no lombo e serra dupla no rabo
  const cone = (h: number, mat: ReturnType<typeof m>, x: number, y: number, z: number) => lathe([[h * 0.36, 0], [h * 0.22, h * 0.5], [0.001, h]], mat, { seg: 8, pos: [x, y, z], rot: [z * 60, 0, 14], deform: [(v) => { v.z *= 0.6; }] });
  for (const [x, h] of [[0.3, 0.13], [0.12, 0.18], [-0.08, 0.2], [-0.28, 0.16]] as const) rig.add('corpo', cone(h, m(1), x, 0.2 * Math.sqrt(1 - (x / 0.5) ** 2) * 0.9, 0));
  const sl = 1.05 / 4;
  for (let i = 1; i <= 4; i++) par((_, s) => rig.add('cauda' + i, cone(0.15 - i * 0.02, i % 2 ? m(1) : m.luz(0), -sl * 0.5, 0.15 - i * 0.03, 0.05 * s)));
  par((l, s) => {
    // faixas douradas no queixo e pintas no flanco
    for (const x of [0.2, 0.34, 0.47]) rig.add('mandibula', blob([0.03, 0.05, 0.03], m.plano(1), { pos: [x, 0.0, (0.2 - x * 0.16) * s], seg: 6, castShadow: false }));
    for (const x of [0.24, 0.02, -0.2]) rig.add('corpo', blob([0.05, 0.04, 0.02], m(1), { pos: [x, -0.02, 0.245 * s * Math.sqrt(1 - (x / 0.52) ** 2)], seg: 8, castShadow: false }));
    // presas grandes e sobrancelha ossuda
    rig.add('cabeca', blob([0.028, 0.07, 0.028], m.luz(1), { pos: [0.5, -0.07, 0.1 * s], seg: 8 }), blob([0.024, 0.055, 0.024], m.luz(1), { pos: [0.3, -0.06, 0.15 * s], seg: 8 }));
    rig.add('cabeca', blob([0.1, 0.03, 0.06], m(2), { pos: [0.13, 0.215, 0.13 * s], rot: [0, 0, -16], seg: 8 }));
    rig.add('canela_f' + l, blob([0.06, 0.03, 0.07], m.luz(0), { pos: [0.06, -0.16, 0.04 * s], seg: 8 }));
  });
  rig.bones.mandibula.rotation.z = -0.3; rig.bones.cabeca.rotation.z = 0.16;
  rig.add('pescoco', blob([0.17, 0.11, 0.19], m(1), { pos: [0.08, -0.09, 0], seg: 12 }));
  // brasa da lenda entre os olhos (osso próprio, pulsa)
  rig.bone('brasa', 'cabeca', [0.2, 0.18, 0]);
  rig.add('brasa', blob([0.05, 0.045, 0.05], m(1), { seg: 10 }), blob([0.025, 0.025, 0.025], m.luz(1), { pos: [0, 0.025, 0], seg: 6 }));
  return rig;
}

const anims = animsLagarto({ u: 0.8, hPerna: 0.13, caudaSegs: 4, mole: 0.5 }, {
  idle: { brasa: ls([1, 1.15, 1.35, 1.1]), cabeca: lz([0, 1, 3, 1]) },
  especial: { brasa: qs([1, 1.4, 1.8, 2.6, 1.5, 1]) },
});

export const jacarucu = criatura({
  num: 85, id: 'jacarucu', nome: 'Jacaruçu', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: { frente: ['ppppp', '.aaa.', 'aawpa', 'aappa', '.aaa.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['a', 'p'] },
});
