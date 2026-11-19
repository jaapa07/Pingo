/**
 * 173 · BOITATÁ (Lenda/Brasa) — a serpente de fogo que guarda os campos. Lendário.
 * Traços: corpo de obsidiana em duas voltas largas com veios de magma na barriga · crista de sete labaredas
 * da testa ao pescoço · coroa de chifres de brasa · olhos de fogo enormes (a lenda diz que ela comeu os olhos
 * de quem a viu) · fileira de "olhos" incandescentes pelos flancos · boca de fornalha com presas claras ·
 * cauda-tocha erguida atrás das voltas.
 */
import { criatura, serpente, animsSerpente, blob, calota, chama, chamaDupla, spike, ring, par, m, lz, qz, ls, type V3 } from './kits';
import { voltaCobra, extrasCobra } from './086-sucurizinha';
import { tremula } from './004-guaraxim';

const paleta = {
  rampas: [
    ['#2a1836', '#4b2a45', '#7a4352'], // 0 obsidiana arroxeada do corpo
    ['#a3201f', '#e8501c', '#ff8c2a'], // 1 magma: barriga, veios, boca
    ['#f08a1c', '#ffc93a', '#fff3a8'], // 2 labaredas
    ['#b58a6a', '#f1dcb4', '#fffbe6'], // 3 marfim das presas e chifres
  ] as [string, string, string][],
  contorno: '#1d0f26',
  extras: { w: '#ffffff', p: '#1d0f26', f: '#4b2a45', a: '#ffc93a', o: '#ff6a1c' },
};

const CURVA = [100, -4, -36, -42];
const CHAMAS = Array.from({ length: 14 }, (_, i) => 'chama' + (i + 1));

function build() {
  const r = 0.15;
  const { rig } = serpente({
    r, pescoco: { segs: 4, len: 0.26, curva: CURVA, rFim: 0.135 },
    cauda: { segs: 3, len: 0.22, curva: [-24, -44, -40], rFim: 0.06 },
    cabeca: [0.33, 0.2, 0.26],
    olho: { r: 0.04, pos: [0.22, 0.135, 0.19] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  rig.bones.corpo.position.set(-0.06, 0.6, 0);
  rig.bones.cauda1.position.set(-0.5, r - 0.6 + 0.02, -0.12);
  // DUAS VOLTAS largas com filete de magma e "olhos" de brasa nos flancos
  const voltas: [number, number, number, [number, number]][] = [[0.17, 0.43, 0.17, [4, 3]], [0.45, 0.31, 0.155, [-6, -4]]];
  voltas.forEach(([y, R, e, incl], k) => {
    voltaCobra(rig, 'base', [-0.08, y, 0], R, e, m(0), m(1), incl);
    const n = k ? 7 : 9;
    for (let i = 0; i < n; i++) {
      const a = ((i + k * 0.5) / n) * Math.PI * 2, rr = R + e * 0.74;
      const p: V3 = [-0.08 + Math.cos(a) * rr, y + e * 0.18, Math.sin(a) * rr];
      rig.add('base', blob([e * 0.42, e * 0.42, e * 0.42], m.plano(1), { pos: p, seg: 10, castShadow: false }), blob([e * 0.22, e * 0.22, e * 0.22], m.luz(2), { pos: [-0.08 + Math.cos(a) * (rr + e * 0.24), y + e * 0.2, Math.sin(a) * (rr + e * 0.24)], seg: 8, castShadow: false }));
    }
  });
  // miolo incandescente entre as voltas
  rig.add('base', blob([0.25, 0.2, 0.25], m.plano(1), { pos: [-0.08, 0.36, 0], seg: 14 }));
  // labaredas sobre a volta de baixo (para fora da silhueta)
  const borda: [number, number, number][] = [[150, 0.3, 0.1], [205, 0.36, 0.12], [255, 0.26, 0.09], [95, 0.24, 0.09]];
  borda.forEach(([g, alt, rc], i) => {
    const a = (g * Math.PI) / 180;
    rig.bone('chama' + (i + 8), 'base', [-0.08 + Math.cos(a) * 0.45, 0.3, Math.sin(a) * 0.45], [Math.sin(a) * 22, 0, Math.cos(a) * -22]);
    rig.add('chama' + (i + 8), ...chamaDupla(alt, rc, m.luz(1), m.luz(2), { curva: 18 }));
  });
  // crista de labaredas: testa, nuca e pescoço
  const crista: [string, V3, number, number, number][] = [
    ['cabeca', [0.3, 0.16, 0], 0.2, 0.075, 30],
    ['cabeca', [0.14, 0.19, 0], 0.32, 0.105, 44],
    ['cabeca', [-0.04, 0.16, 0], 0.4, 0.13, 58],
    ['pescoco4', [0.12, 0.13, 0], 0.4, 0.13, 30],
    ['pescoco3', [0.12, 0.14, 0], 0.38, 0.13, 20],
    ['pescoco2', [0.12, 0.14, 0], 0.32, 0.115, 14],
    ['pescoco1', [0.14, 0.15, 0], 0.26, 0.1, 10],
  ];
  crista.forEach(([pai, pos, alt, rc, tomba], i) => {
    rig.bone('chama' + (i + 1), pai, pos, [0, 0, tomba]);
    rig.add('chama' + (i + 1), ...chamaDupla(alt, rc, m.luz(1), m.luz(2), { curva: 26 }));
  });
  // cabeça: placa escura, sobrancelhas de brasa, chifres, narinas, presas e fornalha na boca
  rig.add('cabeca', calota([0.23, 0.2, 0.22], m.sombra(0), { de: 0, ate: 54, pos: [0.06, 0.03, 0], rot: [0, 0, 24] }));
  rig.add('cabeca', blob([0.17, 0.05, 0.15], m.plano(1), { pos: [0.24, -0.075, 0], seg: 14 }));
  rig.add('mandibula', blob([0.15, 0.04, 0.13], m.luz(2), { pos: [0.16, 0.055, 0], seg: 12 }));
  par((_, s) => {
    rig.add('cabeca', blob([0.085, 0.07, 0.06], m.plano(1), { pos: [0.19, 0.125, 0.125 * s], seg: 12 }));
    rig.add('cabeca', blob([0.13, 0.035, 0.06], m.sombra(0), { pos: [0.21, 0.205, 0.13 * s], rot: [0, 10 * s, -20], seg: 10 }));
    rig.add('cabeca', spike(0.44, 0.075, m.luz(3), { pos: [0.02, 0.12, 0.17 * s], rot: [38 * s, 0, 26], curve: -0.35 }));
    rig.add('cabeca', spike(0.2, 0.05, m(3), { pos: [-0.08, 0.02, 0.22 * s], rot: [70 * s, 0, 70], curve: -0.25 }));
    rig.add('cabeca', blob([0.026, 0.02, 0.02], m.plano(1), { pos: [0.43, 0.09, 0.055 * s], seg: 8 }));
    rig.add('cabeca', spike(0.13, 0.034, m.luz(3), { pos: [0.36, -0.05, 0.085 * s], rot: [0, 0, 180] }));
    rig.add('cabeca', spike(0.08, 0.026, m.luz(3), { pos: [0.24, -0.06, 0.13 * s], rot: [0, 0, 180] }));
    rig.add('mandibula', spike(0.08, 0.026, m.luz(3), { pos: [0.3, 0.02, 0.07 * s] }));
    // veios de magma descendo o pescoço
    for (const o of ['pescoco1', 'pescoco2', 'pescoco3', 'pescoco4']) rig.add(o, blob([0.045, 0.06, 0.03], m.plano(1), { pos: [0.13, 0.02, 0.135 * s], seg: 8, castShadow: false }));
  });
  // colar de brasa na base do pescoço
  rig.add('pescoco1', ring(0.16, 0.04, m.plano(1), { pos: [0.02, 0, 0], rot: [0, 90, 0] }));
  // cauda-tocha
  rig.bone('ponta', 'cauda3', [-0.2, 0.06 - r, 0], [0, 0, -40]);
  rig.add('ponta', blob([0.08, 0.07, 0.07], m.plano(1), { pos: [-0.02, 0.02, 0], seg: 10 }));
  rig.bone('chama12', 'ponta', [-0.04, 0.04, 0], [0, 0, 30]);
  rig.add('chama12', ...chamaDupla(0.46, 0.15, m.luz(1), m.luz(2), { curva: 22 }), chama(0.26, 0.09, m.plano(2), { pos: [0.08, 0, 0], rot: [0, 0, -36] }));
  // fagulhas soltas
  rig.bone('chama13', 'base', [0.42, 1.0, -0.3]); rig.add('chama13', chama(0.1, 0.045, m.luz(2)));
  rig.bone('chama14', 'base', [-0.62, 0.92, 0.2]); rig.add('chama14', chama(0.09, 0.04, m.plano(2)));
  return rig;
}

const ex = extrasCobra(CURVA, 3);
const anims = animsSerpente({ u: 1.6, pescoco: 4, cauda: 3, mole: 0.4, mapa: { comp: 1, larg: 1, frontal: 1.05, cabeca: 1.2 } }, {
  todas: tremula(CHAMAS),
  fisico: ex.fisico,
  desmaio: { pescoco1: qz([4, -8, -24, -46, -44]), pescoco2: qz([0, -4, -20, -36, -34]), pescoco3: qz([0, -4, -14, -26, -24]), pescoco4: qz([0, -2, -8, -14, -12]), cabeca: qz([0, 4, 14, 28, 26]), ...Object.fromEntries(CHAMAS.map((c) => ['?' + c, ls([1, 0.85, 0.6, 0.35, 0.3])])) },
  idle: { ponta: lz([0, 8, 14, 5]) },
  especial: { ...ex.especial, ponta: qz([0, 20, 30, -30, -10, 0]), ...Object.fromEntries(CHAMAS.slice(0, 7).map((c) => [c, ls([1, 1.15, 1.35, 1.7, 1.3, 1])])) },
});

export const boitata = criatura({
  num: 173, id: 'boitata', nome: 'Boitatá', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['ppppp.', 'paawwp', 'oapwap', 'ooaaap', '.oooo.'],
    fechado: ['oooooo', 'oooooo', 'poooop', 'oppppo', 'oooooo'],
    mapa: ['a', 'w'],
  },
});
