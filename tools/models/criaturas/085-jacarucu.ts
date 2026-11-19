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
  const { rig } = corpoJacare({ k: 1.5, tronco: [0.42, 0.25, 0.28], cabeca: [0.25, 0.17, 0.21], focinho: 0.3, rabo: 0.95, crista: 0.12, nCrista: 6, alt: 0.18, dentes: 4, faixas: 0, raboAng: 30, raboCurva: 26, pescAng: 48, pescLen: 0.26 });
  // crista acesa: cones dourados no lombo e serra dupla no rabo
  const cone = (h: number, mat: ReturnType<typeof m>, x: number, y: number, z: number) => lathe([[h * 0.36, 0], [h * 0.22, h * 0.5], [0.001, h]], mat, { seg: 8, pos: [x, y, z], rot: [z * 60, 0, 14], deform: [(v) => { v.z *= 0.6; }] });
  for (const [x, h] of [[0.26, 0.15], [0.09, 0.21], [-0.09, 0.23], [-0.26, 0.18]] as const) rig.add('corpo', cone(h, m(1), x, 0.25 * Math.sqrt(1 - (x / 0.42) ** 2) * 0.9, 0));
  const sl = 0.95 / 4;
  for (let i = 1; i <= 4; i++) par((_, s) => rig.add('cauda' + i, cone(0.16 - i * 0.02, i % 2 ? m(1) : m.luz(0), -sl * 0.5, 0.19 - i * 0.04, 0.05 * s)));
  par((l, s) => {
    // faixas douradas no queixo e pintas no flanco
    for (const x of [0.2, 0.34, 0.47]) rig.add('mandibula', blob([0.03, 0.05, 0.03], m.plano(1), { pos: [x, 0.0, (0.2 - x * 0.16) * s], seg: 6, castShadow: false }));
    for (const x of [0.24, 0.02, -0.2]) rig.add('corpo', blob([0.05, 0.04, 0.02], m(1), { pos: [x * 0.84, -0.02, 0.275 * s * Math.sqrt(1 - (x / 0.52) ** 2)], seg: 8, castShadow: false }));
    // presas grandes e sobrancelha ossuda
    rig.add('cabeca', blob([0.034, 0.085, 0.034], m.luz(1), { pos: [0.52, -0.085, 0.12 * s], seg: 8 }), blob([0.03, 0.07, 0.03], m.luz(1), { pos: [0.33, -0.075, 0.17 * s], seg: 8 }));
    rig.add('cabeca', blob([0.1, 0.03, 0.06], m(2), { pos: [0.15, 0.255, 0.15 * s], rot: [0, 0, -16], seg: 8 }));
    rig.add('canela_f' + l, blob([0.06, 0.03, 0.07], m.luz(0), { pos: [0.06, -0.16, 0.04 * s], seg: 8 }));
  });
  rig.bones.mandibula.rotation.z = -0.42; rig.bones.cabeca.rotation.z = 0.2;
  rig.add('pescoco', blob([0.2, 0.17, 0.22], m(1), { pos: [0.1, -0.02, 0], seg: 12 }));
  // brasa da lenda entre os olhos (osso próprio, pulsa)
  rig.bone('brasa', 'cabeca', [0.22, 0.215, 0]);
  rig.add('brasa', blob([0.05, 0.045, 0.05], m(1), { seg: 10 }), blob([0.025, 0.025, 0.025], m.luz(1), { pos: [0, 0.025, 0], seg: 6 }));
  return rig;
}

const anims = animsLagarto({ u: 0.95, hPerna: 0.18, caudaSegs: 4, mole: 0.5 }, {
  idle: { brasa: ls([1, 1.15, 1.35, 1.1]), cabeca: lz([0, 1, 3, 1]) },
  especial: { brasa: qs([1, 1.4, 1.8, 2.6, 1.5, 1]) },
});

export const jacarucu = criatura({
  num: 85, id: 'jacarucu', nome: 'Jacaruçu', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: { frente: ['ppppp', '.aaa.', 'aawpa', 'aappa', '.aaa.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['a', 'p'] },
});
