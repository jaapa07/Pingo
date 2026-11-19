/**
 * 180 · ONÇA-GUARACI (Brasa/Lenda) — a onça que Guaraci, o sol, solta para andar ao meio-dia. Lendário.
 * Traços: onça-pintada enorme de pelo ouro-claro · juba-sol: arco de nove raios de fogo em volta dos ombros ·
 * rosetas de borda carmim com miolo em brasa · disco solar na testa · presas à mostra ·
 * cauda longa em S terminando em tocha · brasas nos tornozelos · peito alto e olhar de meio-dia.
 */
import { criatura, animsQuadrupede, blob, ring, chama, chamaDupla, listra, spike, par, m, lz, qz, lx, qx, qs, type V3 } from './kits';
import { pintas, dosDois } from './069-jaguatirim';
import { corpoOnca } from './071-oncinha';
import { tremula } from './004-guaraxim';

const paleta = {
  rampas: [
    ['#c0621e', '#ffb42c', '#ffe88a'], // 0 pelo ouro-claro
    ['#48122a', '#7c2030', '#b43a30'], // 1 rosetas carmim, orelhas, ponta da cauda
    ['#d6ae88', '#fff2d2', '#ffffff'], // 2 creme do focinho, peito e presas
    ['#b42a1a', '#f4621a', '#ffbc3a'], // 3 fogo do sol: raios, tocha, miolo das rosetas
  ] as [string, string, string][],
  contorno: '#33101c',
  extras: { w: '#ffffff', p: '#33101c', f: '#ffb42c', a: '#ffe88a', o: '#f4621a' },
};

const N = 9;
const RAIOS = Array.from({ length: N }, (_, i) => 'raio' + (i + 1));
const BRASAS = ['brasa1', 'brasa2', 'brasa3', 'brasa4', 'tocha'];

function build() {
  const tr: V3 = [0.44, 0.25, 0.23];
  const { rig, ref } = corpoOnca({ k: 1.5, tronco: tr, peito: 1.26, pernas: 0.4, rPerna: 0.1, cabeca: [0.27, 0.24, 0.26], pesc: [0.24, 50], cauda: { len: 0.8, ang: 24, curva: 26, r: 0.06 } });
  pintas(rig, 'corpo', [0, 0, 0], tr, dosDois([[0.3, 38], [-0.02, 46], [-0.35, 38], [-0.68, 50], [0.12, 86], [-0.2, 84, 0.9], [-0.52, 86], [-0.05, 0, 0.8], [-0.4, 0, 0.8]]), 0.062, m.plano(1), m.luz(3));
  par((l, s) => {
    rig.add('perna_f' + l, blob([0.14, 0.18, 0.11], m(0), { pos: [0, 0, 0.01 * s] }), blob([0.04, 0.04, 0.03], m.plano(1), { pos: [0.02, -0.03, 0.11 * s], seg: 8 }), blob([0.022, 0.022, 0.03], m.luz(3), { pos: [0.02, -0.03, 0.125 * s], seg: 8 }));
    rig.add('perna_t' + l, blob([0.16, 0.2, 0.12], m(0), { pos: [-0.01, 0, 0.01 * s] }), blob([0.042, 0.042, 0.03], m.plano(1), { pos: [0, -0.03, 0.12 * s], seg: 8 }), blob([0.024, 0.024, 0.03], m.luz(3), { pos: [0, -0.03, 0.135 * s], seg: 8 }), blob([0.034, 0.034, 0.03], m.plano(1), { pos: [-0.07, 0.08, 0.11 * s], seg: 8 }));
    // presas e sobrancelha de meio-dia
    const pf = ref.pontaFocinho as V3;
    rig.add('cabeca', spike(0.1, 0.03, m.luz(2), { pos: [pf[0] - 0.04, pf[1] - 0.04, 0.06 * s], rot: [0, 0, 180] }));
    rig.add('cabeca', blob([0.1, 0.035, 0.05], m.sombra(0), { pos: [0.24, 0.12, 0.15 * s], rot: [0, 14 * s, -22], seg: 10 }));
    // pulseiras de brasa nos tornozelos
    for (const q of ['f', 't']) rig.add('canela_' + q + l, listra(0.1, 0.03, m.plano(3), { pos: [0, -0.1, 0] }));
  });
  rig.add('cabeca', blob([0.16, 0.085, 0.17], m(2), { pos: [0.21, -0.2, 0] }));
  // disco solar na testa
  rig.add('cabeca', blob([0.03, 0.06, 0.06], m.luz(3), { pos: [0.265, 0.13, 0], rot: [0, 0, -28], seg: 10 }), ring(0.075, 0.02, m.plano(1), { pos: [0.255, 0.125, 0], rot: [0, 90, -28] }));
  // JUBA-SOL: aro e nove raios de fogo em volta dos ombros
  rig.bone('sol', 'corpo', [0.3, 0.16, 0], [0, 0, -14]);
  rig.add('sol', ring(0.41, 0.05, m.luz(3), { rot: [0, 90, 0] }));
  for (let i = 0; i < N; i++) {
    const g = -112 + (224 * i) / (N - 1), a = (g * Math.PI) / 180, R = 0.42, grande = i % 2 === 0;
    rig.bone(RAIOS[i], 'sol', [0, Math.cos(a) * R, Math.sin(a) * R], [g, 0, 0]);
    rig.add(RAIOS[i], ...chamaDupla(grande ? 0.42 : 0.28, grande ? 0.11 : 0.09, m(3), m.luz(0), {}));
  }
  // tocha na ponta da cauda e brasas nos tornozelos de trás
  rig.bone('tocha', 'cauda3', [-0.27, 0, 0], [0, 0, 20]);
  rig.add('tocha', ...chamaDupla(0.4, 0.14, m(3), m.luz(0), { curva: 20 }), chama(0.22, 0.08, m(3), { pos: [0.06, 0, 0], rot: [0, 0, -40] }));
  let n = 0;
  par((l) => { for (const q of ['f', 't']) { rig.bone(BRASAS[n], 'canela_' + q + l, [-0.04, -0.06, 0], [0, 0, 36]); rig.add(BRASAS[n++], chama(0.2, 0.07, m.luz(3), { curva: 20 })); } });
  for (const c of [1, 2]) rig.add('cauda' + c, blob([0.03, 0.074, 0.074], m.plano(1), { pos: [-0.16, 0, 0], seg: 10 }));
  return rig;
}

const anims = animsQuadrupede({ u: 1.35, hPerna: 0.4, mole: 0.55, cauda: 0.5 }, {
  todas: tremula([...RAIOS, ...BRASAS]),
  idle: { sol: lx([0, 5, 10, 5]), cauda3: lz([0, -6, -10, -4]) },
  especial: { sol: [...qx([0, 12, 24, 40, 20, 0]), ...qs([1, 1.03, 1.06, 1.14, 1.06, 1])], cauda3: qz([0, 8, 12, -16, -6, 0]) },
  desmaio: { sol: qs([1, 0.9, 0.7, 0.5, 0.45]) },
});

export const oncaGuaraci = criatura({
  num: 180, id: 'onca-guaraci', nome: 'Onça-Guaraci', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['pp...', 'paap.', '.owpp', '.oapp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
