/**
 * 177 · UIRAPURU (Encanto/Vento) — o pássaro cujo canto faz a mata inteira se calar para ouvir. Lendário.
 * Traços: plumagem castanho-fogo do uirapuru-verdadeiro com o colar branco riscado de preto no pescoço ·
 * bico aberto cantando · asas erguidas em concha, de pontas rosadas · cauda-lira de duas fitas longas que
 * se enrolam em espiral · crista de três penas · notas de canto flutuando em volta · poleiro de galho florido.
 */
import { criatura, ave, animsAve, blob, calota, pena, tube, ring, folha3d, segmento, par, m, lz, qz, lp, D2R, type V3, type Rig } from './kits';

const paleta = {
  rampas: [
    ['#7a2c3c', '#cf5a2c', '#f79a3a'], // 0 castanho-fogo da plumagem
    ['#b9a6a6', '#f6ead6', '#ffffff'], // 1 colar branco, peito claro
    ['#b0408c', '#f27ab8', '#ffd0e8'], // 2 rosa do encanto: fitas, pontas das asas, notas
    ['#2a2440', '#4a5a4a', '#7fc06a'], // 3 riscas escuras, galho e folhas (trio: anil, casca, folha)
  ] as [string, string, string][],
  contorno: '#2a1630',
  extras: { w: '#ffffff', p: '#2a1630', f: '#cf5a2c', a: '#f27ab8' },
};

/** Nota de canto: cabeça oval inclinada + haste + bandeirola. */
function nota(rig: Rig, nome: string, pos: V3, k: number, dupla = false) {
  rig.bone(nome, 'base', pos);
  rig.add(nome, blob([0.07 * k, 0.052 * k, 0.05 * k], m.luz(2), { rot: [0, 0, 24], seg: 10 }), segmento([0.055 * k, 0.01, 0], [0.055 * k, 0.22 * k, 0], 0.028 * k, 0.028 * k, m.luz(2)));
  if (dupla) rig.add(nome, blob([0.07 * k, 0.052 * k, 0.05 * k], m.luz(2), { pos: [0.16 * k, 0.03 * k, 0], rot: [0, 0, 24], seg: 10 }), segmento([0.215 * k, 0.04 * k, 0], [0.215 * k, 0.25 * k, 0], 0.028 * k, 0.028 * k, m.luz(2)), segmento([0.055 * k, 0.22 * k, 0], [0.215 * k, 0.25 * k, 0], 0.036 * k, 0.036 * k, m.luz(2)));
  else rig.add(nome, pena(0.12 * k, 0.08 * k, m.luz(2), { pos: [0.055 * k, 0.21 * k, 0], rot: [0, 180, -30], esp: 0.05 }));
}

function build() {
  const { rig, ref } = ave({
    corpo: [0.3, 0.27, 0.25], ergue: 44,
    pescoco: { len: 0.12, ang: 70, r: 0.14 },
    cabeca: [0.25, 0.23, 0.23],
    bico: { len: 0.16, r: 0.06, y: -0.1, achata: 0.8, inferior: 0.8 },
    asa: { len: 0.6, larg: 0.34, cai: 10, ponta: 0.6 },
    cauda: { len: 0.3, larg: 0.11, ang: 20, penas: 3, abre: 22 },
    pernas: { alt: 0.17, r: 0.032, z: 0.5, x: -0.02, dedo: 0.11 },
    olho: { r: 0.036, pos: [0.15, 0.03, 0.2] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 2, cauda: 0, bico: 3, perna: 3 },
  });
  // POLEIRO: galho florido que sobe do chão; o pássaro pousa em cima
  const H = 0.34;
  rig.bones.corpo.position.y += H;
  rig.add('base', tube([[-0.4, 0, 0.16], [-0.36, 0.2, 0.1], [-0.2, H - 0.03, 0.02], [0.2, H - 0.04, 0], [0.42, H + 0.04, -0.04]], (t) => 0.075 - t * 0.03, m(3), { seg: 14, radial: 10 }));
  rig.add('base', tube([[0.3, H - 0.03, 0], [0.38, H - 0.16, 0.12], [0.42, H - 0.2, 0.2]], 0.03, m(3), { seg: 6, radial: 8 }));
  rig.add('base', folha3d(0.2, 0.13, m.luz(3), { pos: [0.42, H + 0.04, -0.04], rot: [0, 0, -50], esp: 0.45 }), folha3d(0.18, 0.12, m.luz(3), { pos: [0.42, H - 0.2, 0.2], rot: [20, 0, -110], esp: 0.45 }), folha3d(0.18, 0.12, m.luz(3), { pos: [-0.38, 0.16, 0.1], rot: [0, 0, 70], esp: 0.45 }));
  // flor do poleiro (cinco pétalas rosa, miolo claro)
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; rig.add('base', blob([0.055, 0.05, 0.03], m(2), { pos: [-0.3 + Math.cos(a) * 0.065, 0.3 + Math.sin(a) * 0.065, 0.14], seg: 8 })); }
  rig.add('base', blob([0.035, 0.035, 0.035], m.luz(1), { pos: [-0.3, 0.3, 0.16], seg: 8 }));
  // bico aberto cantando
  rig.bones.mandibula.rotation.z = -30 * D2R; rig.bones.cabeca.rotation.z = 16 * D2R;
  rig.add('cabeca', blob([0.05, 0.03, 0.04], m.plano(2), { pos: [0.2, -0.045, 0], seg: 8 }));
  // colar branco riscado de preto + bochecha clara
  rig.add('pescoco', calota([0.215, 0.2, 0.225], m(1), { de: 40, ate: 115, rot: [0, 0, 64] }));
  par((l, s) => {
    for (const [x, y] of [[0.0, 0.02], [0.05, -0.05], [-0.04, -0.07]] as const) rig.add('pescoco', blob([0.022, 0.06, 0.02], m.sombra(3), { pos: [0.03 + x, 0.05 + y, 0.205 * s], rot: [0, 0, 30], seg: 8, castShadow: false }));
    rig.add('cabeca', blob([0.07, 0.055, 0.04], m.luz(0), { pos: [0.07, -0.08, 0.19 * s], seg: 10 }));
    // asas erguidas em concha, com barra rosa
    rig.bones['asa_' + l].rotation.z = -52 * D2R; rig.bones['asa_' + l].rotation.y = 38 * s * D2R; rig.bones['asa2_' + l].rotation.z = -16 * D2R;
    rig.add('asa_' + l, blob([0.2, 0.035, 0.05], m.luz(0), { pos: [-0.24, -0.02, 0.05 * s], rot: [0, 0, 6], seg: 10 }));
    // CAUDA-LIRA: fita longa que sobe e se enrola em espiral
    rig.bone('fita_' + l, 'cauda1', [-0.2, 0, 0.07 * s], [0, -34 * s, -24]);
    const pts: V3[] = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16, a = t * Math.PI * 2.4, R = 0.2 * (1 - t * 0.55); pts.push([-0.12 - t * 0.34 - Math.sin(a) * R * 0.5, 0.06 + t * 0.5 + (1 - Math.cos(a)) * R * 0.4, (0.05 + t * 0.26) * s]); }
    rig.add('fita_' + l, tube(pts, (t) => 0.055 - t * 0.014, m(2), { seg: 28, radial: 8 }));
    rig.add('fita_' + l, blob([0.085, 0.085, 0.05], m.luz(2), { pos: pts[16], seg: 10 }), blob([0.045, 0.045, 0.055], m(0), { pos: pts[16], seg: 8 }));
  });
  // crista de três penas
  for (const [i, g, len] of [[1, 10, 0.2], [2, 34, 0.26], [3, 58, 0.2]] as const) {
    rig.bone('crista' + i, 'cabeca', [ref.topo[0] - 0.02 - i * 0.03, ref.topo[1] - 0.03, 0], [0, 0, g]);
    rig.add('crista' + i, folha3d(len, 0.09, i === 2 ? m.luz(2) : m.luz(0), { esp: 0.5 }));
  }
  // riscas escuras na ponta da cauda e sobrancelha clara
  rig.add('cauda1', blob([0.03, 0.03, 0.14], m.sombra(3), { pos: [-0.2, 0, 0], seg: 8 }));
  par((_, s) => rig.add('cabeca', blob([0.08, 0.02, 0.03], m(1), { pos: [0.12, 0.11, 0.18 * s], rot: [0, 10 * s, -10], seg: 8 })));
  // NOTAS do canto
  nota(rig, 'nota1', [0.62, 1.2, -0.1], 1.05, true);
  nota(rig, 'nota2', [0.64, 0.9, 0.12], 0.9);
  nota(rig, 'nota3', [0.46, 1.5, -0.3], 0.9);
  return rig;
}

const sobe = (f: number): V3[] => [[0, 0, 0], [0, 0.03, 0], [0, 0.06, 0], [0, 0.025, 0]].map((_, k, v) => v[(k + f) % 4] as V3);
const anims = animsAve({ u: 1.2, hPerna: 0.17, mole: 0.9 }, {
  todas: { nota1: lp(sobe(0)), nota2: lp(sobe(2)), nota3: lp(sobe(1)) },
  idle: { fita_d: lz([0, 4, 8, 3]), fita_e: lz([0, 6, 5, 2]), mandibula: lz([0, 10, 0, 8]), crista2: lz([0, 4, 8, 2]) },
  fisico: { fita_d: qz([8, 14, -18, -6, 0]), fita_e: qz([8, 14, -18, -6, 0]) },
  especial: { fita_d: qz([0, 10, 14, -22, -8, 0]), fita_e: qz([0, 10, 14, -22, -8, 0]), crista1: qz([0, 10, 14, -18, -6, 0]), crista2: qz([0, 10, 14, -18, -6, 0]), crista3: qz([0, 10, 14, -18, -6, 0]) },
  dano: { fita_d: qz([20, 8, 0]), fita_e: qz([20, 8, 0]) },
  desmaio: { mandibula: qz([0, 10, 20, 28, 28]), fita_d: qz([0, 6, 14, 22, 20]), fita_e: qz([0, 6, 14, 22, 20]) },
});

export const uirapuru = criatura({
  num: 177, id: 'uirapuru', nome: 'Uirapuru', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['.ppp.', 'ppwwp', 'ppppp', 'pwppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
