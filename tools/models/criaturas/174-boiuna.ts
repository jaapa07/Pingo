/**
 * 174 · BOIÚNA (Lenda/Rio) — a cobra-grande que dorme no fundo dos rios. Lendário.
 * Traços: corpo azul-noite que rompe a água em arcos (pescoço alto + dois dorsos + cauda de remo) ·
 * olhos-lanterna dourados (a lenda diz que brilham como faróis de barco) · leques de nadadeira nas faces ·
 * vela dorsal turquesa do alto da cabeça aos dorsos · barbilhões compridos, um deles com lanterna de navio-fantasma ·
 * anéis de espuma onde o corpo fura a água · pintas de luz pelos flancos.
 */
import { criatura, serpente, animsSerpente, blob, calota, slab, ring, tube, espuma, folha3d, par, m, lz, ly, qz, lp, qs, D2R, type V3, type V2, type Rig } from './kits';
import { extrasCobra } from './086-sucurizinha';

const paleta = {
  rampas: [
    ['#161a3d', '#27356b', '#41609a'], // 0 azul-noite do couro
    ['#1d7a86', '#3fc6b8', '#a8f2d6'], // 1 turquesa: barriga, velas e leques
    ['#7fa8d6', '#cfe6f6', '#ffffff'], // 2 espuma
    ['#c9801c', '#ffd24a', '#fff6b8'], // 3 ouro das lanternas e pintas de luz
  ] as [string, string, string][],
  contorno: '#10122e',
  extras: { w: '#ffffff', p: '#10122e', f: '#27356b', a: '#ffd24a', o: '#c9801c' },
};

const CURVA = [92, 0, -8, -24];

/** Vela dorsal: placa de pontas (raios) crescendo em +Y ao longo de +X. */
function vela(len: number, alt: number, mat: ReturnType<typeof m>, pontas = 3): ReturnType<typeof slab> {
  const pts: V2[] = [[0, 0]];
  for (let i = 0; i < pontas; i++) { const x0 = (i / pontas) * len, x1 = ((i + 0.45) / pontas) * len, x2 = ((i + 1) / pontas) * len; pts.push([x0 + (x1 - x0) * 0.2, alt * 0.5], [x1, alt * (0.8 + 0.2 * Math.sin(i * 2.1))], [x2, alt * 0.38]); }
  pts.push([len, 0]);
  return slab(pts, 0.035, mat);
}

/** Dorso em arco saindo da água, com vela, barriga clara e anéis de espuma nas duas pontas. */
function dorso(rig: Rig, nome: string, pos: V3, giro: number, R: number, e: number) {
  rig.bone(nome, 'base', pos, [0, giro, 0]);
  rig.add(nome, ring(R, e, m(0), { arc: 180 }), ring(R * 0.985, e * 0.8, m(1), { arc: 180, pos: [0, -e * 0.3, 0] }));
  const v = vela(R * 1.5, R * 0.62, m(1), 3); v.position.set(-R * 0.75, R + e * 0.5, 0); rig.add(nome, v);
  for (const sx of [-1, 1]) rig.add(nome, ring(e * 1.25, e * 0.42, m.luz(2), { pos: [R * sx, 0.02, 0], rot: [90, 0, 0] }));
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) / 5) * Math.PI;
    for (const sz of [-1, 1]) rig.add(nome, blob([e * 0.26, e * 0.26, e * 0.2], m.luz(3), { pos: [Math.cos(a) * R, Math.sin(a) * R, e * 0.9 * sz], seg: 8, castShadow: false }));
  }
}

function build() {
  const r = 0.2;
  const { rig } = serpente({
    r, pescoco: { segs: 4, len: 0.32, curva: CURVA, rFim: 0.17 },
    cauda: { segs: 1, len: 0.06, curva: [0], rFim: 0.12 },
    cabeca: [0.38, 0.22, 0.3],
    olho: { r: 0.045, pos: [0.22, 0.14, 0.225] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  rig.bones.corpo.position.set(0.3, 0.02, -0.06);
  rig.bones.cabeca.rotation.z = -54 * D2R;
  // dois dorsos e a cauda de remo, em zigue-zague atrás do pescoço
  dorso(rig, 'dorso1', [-0.3, 0, -0.2], 18, 0.3, 0.17);
  dorso(rig, 'dorso2', [-0.6, 0, 0.26], -30, 0.22, 0.14);
  rig.bone('remo', 'base', [-0.84, 0, -0.12], [0, 20, 30]);
  rig.add('remo', tube([[0, 0, 0], [-0.03, 0.2, 0], [-0.1, 0.42, 0]], (t) => 0.1 - t * 0.04, m(0), { seg: 8, radial: 10 }));
  rig.add('remo', folha3d(0.42, 0.24, m(1), { pos: [-0.1, 0.4, 0], rot: [0, 0, 44], esp: 0.3 }), folha3d(0.36, 0.2, m.luz(1), { pos: [-0.1, 0.4, 0], rot: [0, 0, -30], esp: 0.3 }));
  rig.add('base', ring(0.14, 0.055, m.luz(2), { pos: [-0.84, 0.02, -0.12], rot: [90, 0, 0] }));
  // espuma na base do pescoço e flocos soltos
  rig.add('base', ring(0.29, 0.085, m.luz(2), { pos: [0.3, 0.02, -0.06], rot: [90, 0, 0] }), ring(0.42, 0.045, m(2), { pos: [0.3, 0.0, -0.06], rot: [90, 0, 0] }));
  const flocos: V3[] = [[0.6, 0.05, 0.2], [0.1, 0.05, -0.46], [0.56, 0.05, -0.36], [-0.44, 0.04, 0.02], [-0.7, 0.04, -0.3]];
  flocos.forEach((p, i) => { rig.bone('floco' + (i + 1), 'base', p); rig.add('floco' + (i + 1), espuma(0.06 - i * 0.005, m.luz(2))); });
  // vela dorsal e pintas de luz no pescoço
  for (const [o, alt] of [['pescoco2', 0.18], ['pescoco3', 0.24], ['pescoco4', 0.26]] as const) {
    const v = vela(0.27, alt, m(1), 2); v.scale.x = -1; v.position.set(0.3, 0.14, 0); rig.add(o, v);
  }
  par((_, s) => { for (const o of ['pescoco1', 'pescoco2', 'pescoco3', 'pescoco4']) rig.add(o, blob([0.04, 0.04, 0.03], m.luz(3), { pos: [0.15, 0.03, 0.18 * s], seg: 8, castShadow: false })); });
  // CABEÇA: testa larga, sobrancelha, leques laterais, crista, narinas, presas e barbilhões
  rig.add('cabeca', calota([0.29, 0.235, 0.28], m.sombra(0), { de: 0, ate: 52, pos: [0.08, 0.03, 0], rot: [0, 0, 24] }));
  const cr = vela(0.4, 0.26, m(1), 3); cr.scale.x = -1; cr.position.set(0.3, 0.17, 0); rig.add('cabeca', cr);
  par((l, s) => {
    rig.add('cabeca', blob([0.085, 0.075, 0.06], m.plano(3), { pos: [0.21, 0.135, 0.175 * s], seg: 12 }));
    rig.add('cabeca', blob([0.14, 0.035, 0.06], m.sombra(0), { pos: [0.24, 0.23, 0.17 * s], rot: [0, 10 * s, -20], seg: 10 }));
    rig.add('cabeca', blob([0.028, 0.022, 0.022], m.plano(1), { pos: [0.5, 0.08, 0.06 * s], seg: 8 }));
    rig.add('cabeca', blob([0.025, 0.065, 0.025], m.luz(2), { pos: [0.42, -0.07, 0.09 * s], seg: 8 }));
    // leque de três raios atrás da face
    rig.bone('leque_' + l, 'cabeca', [-0.04, 0.06, 0.22 * s], [58 * s, 0, 24]);
    for (const [g, len] of [[40, 0.34], [2, 0.44], [-36, 0.32]] as const) rig.add('leque_' + l, folha3d(len, 0.19, g === 2 ? m.luz(1) : m(1), { rot: [0, 0, g], esp: 0.3 }));
    rig.add('leque_' + l, blob([0.06, 0.07, 0.04], m(0), { seg: 10 }));
  });
  // barbilhões: o da frente da câmera leva a lanterna
  rig.bone('barb_d', 'mandibula', [0.28, -0.02, 0.1]); rig.bone('barb_e', 'mandibula', [0.28, -0.02, -0.1]);
  rig.add('barb_d', tube([[0, 0, 0], [0.08, -0.14, 0.04], [0.02, -0.28, 0.06]], 0.022, m(1), { seg: 8, radial: 8 }));
  rig.add('barb_e', tube([[0, 0, 0], [0.1, -0.16, -0.05], [0.06, -0.36, -0.07]], 0.024, m(1), { seg: 8, radial: 8 }));
  rig.bone('lanterna', 'barb_e', [0.06, -0.38, -0.07]);
  rig.add('lanterna', blob([0.075, 0.085, 0.075], m.plano(3), { pos: [0, -0.06, 0], seg: 12 }), blob([0.045, 0.05, 0.05], m.luz(3), { pos: [0.02, -0.05, -0.03], seg: 10 }), ring(0.06, 0.02, m.sombra(0), { pos: [0, 0.01, 0], rot: [90, 0, 0] }), blob([0.05, 0.022, 0.05], m.sombra(0), { pos: [0, -0.145, 0], seg: 10 }));
  rig.add('mandibula', blob([0.2, 0.05, 0.16], m.luz(1), { pos: [0.16, -0.03, 0], seg: 12 }));
  return rig;
}

const ex = extrasCobra(CURVA, 1);
const FL = ['floco1', 'floco2', 'floco3', 'floco4', 'floco5'];
const anims = animsSerpente({ u: 1.7, pescoco: 4, cauda: 1, mole: 0.35, mapa: { comp: 1, larg: 1, frontal: 1.05, cabeca: 1.15 } }, {
  todas: Object.fromEntries(FL.map((f, i) => ['?' + f, lp([[0, 0, 0], [0, 0.03, 0], [0, 0.05, 0], [0, 0.02, 0]].map((_, k, v) => v[(k + i) % 4] as V3))])),
  fisico: ex.fisico,
  desmaio: { pescoco1: qz([4, -4, -8, -12, -11]), pescoco2: qz([0, -4, -8, -10, -9]), pescoco3: qz([0, -4, -10, -16, -15]), pescoco4: qz([0, -4, -12, -20, -19]), cabeca: qz([0, 6, 16, 30, 28]), corpo: qs([1, [1, 0.9, 1], [1, 0.66, 1], [1, 0.4, 1], [1, 0.43, 1]]), remo: qz([0, -10, -30, -60, -58]) },
  idle: { remo: lz([0, 6, 12, 4]), leque_d: lz([0, 5, 9, 3]), leque_e: lz([0, 5, 9, 3]), lanterna: lz([0, 6, 0, -6]), dorso1: lp([[0, 0, 0], [0, 0.015, 0], [0, 0.03, 0], [0, 0.01, 0]]), dorso2: lp([[0, 0.03, 0], [0, 0.015, 0], [0, 0, 0], [0, 0.015, 0]]) },
  especial: { remo: qz([0, 20, 30, -34, -10, 0]), leque_d: qz([0, -10, -14, 22, 8, 0]), leque_e: qz([0, -10, -14, 22, 8, 0]), lanterna: qz([0, 12, 18, -24, -8, 0]) },
  dano: { lanterna: qz([24, 10, 0]) },
  andar: { remo: lz([0, 14, 0, -14]), dorso1: lp([[0, 0, 0], [0, 0.04, 0], [0, 0, 0], [0, -0.03, 0]]), dorso2: lp([[0, 0, 0], [0, -0.03, 0], [0, 0, 0], [0, 0.04, 0]]) },
});

export const boiuna = criatura({
  num: 174, id: 'boiuna', nome: 'Boiúna', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['ppppp.', 'paawwp', 'oapwap', 'oaapap', '.oooo.'],
    fechado: ['oooooo', 'oooooo', 'poooop', 'oppppo', 'oooooo'],
    mapa: ['a', 'w'],
  },
});
