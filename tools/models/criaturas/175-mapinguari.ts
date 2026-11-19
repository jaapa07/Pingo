/**
 * 175 · MAPINGUARI (Lenda/Terra) — a preguiça-gigante ancestral das lendas da mata. Lendário.
 * Traços: um olho só no meio da testa · bocarra de dentes na barriga (como contam os seringueiros) ·
 * braços compridos de três garras-foice, um erguido acima da cabeça · pelagem ruiva de megatério ·
 * manto de musgo com cogumelos e lajes de pedra brotando das costas · cipós pendendo dos braços · pés virados de terra.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, calota, tufo, spike, ring, lathe, folha3d, garra, par, m, lz, qz, D2R, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';

const paleta = {
  rampas: [
    ['#4a2434', '#8c4a34', '#c98248'], // 0 pelo ruivo (sombra vinho)
    ['#b0906e', '#efdcae', '#fffbe4'], // 1 osso: garras, dentes, rosto, cogumelos
    ['#255a44', '#4f9e48', '#a9dc62'], // 2 musgo e cipós
    ['#241528', '#473045', '#7c6272'], // 3 goela escura e pedra
  ] as [string, string, string][],
  contorno: '#22111f',
  extras: { w: '#ffffff', p: '#22111f', f: '#efdcae', a: '#ffd23e', o: '#e8742a' },
};

function build() {
  const cab: V3 = [0.27, 0.24, 0.28];
  const { rig, ref } = arboricola({
    tronco: [0.33, 0.42, 0.36], curva: 8,
    pernas: { alt: 0.2, r: 0.12, pe: 0.17 },
    bracos: { len: 1.0, r: 0.115, mao: 0.12 },
    cabeca: cab, rosto: 0.62, focinho: { len: 0.08, r: 0.07 },
    olho: { r: 0.058, pos: [cab[0] * 0.98, cab[1] * 0.2, 0] },
    rampas: { pelo: 0, rosto: 1, maos: 3, garras: 1 },
  });
  rig.bones.olho_e.clear(); // um olho só
  rig.bones.cabeca.position.y -= 0.06; // cabeça afundada entre os ombros
  // arco da sobrancelha e narinas
  rig.add('cabeca', blob([0.08, 0.05, 0.23], m.sombra(0), { pos: [0.22, 0.18, 0], rot: [0, 0, -14], seg: 12 }));
  par((_, s) => rig.add('cabeca', blob([0.02, 0.025, 0.02], m.plano(3), { pos: [0.35, -0.08, 0.03 * s], seg: 8 })));
  // BOCARRA na barriga: goela escura, lábio, língua e duas fileiras de dentes
  rig.add('tronco', blob([0.12, 0.21, 0.27], m.sombra(3), { pos: [0.26, -0.08, 0], seg: 16 }));
  rig.add('tronco', ring(0.235, 0.05, m.sombra(0), { pos: [0.3, -0.08, 0], rot: [0, 90, 0], scale: [1.12, 0.84, 1] }));
  rig.add('tronco', blob([0.07, 0.07, 0.13], m.plano(0), { pos: [0.34, -0.17, 0], seg: 12 }));
  for (let i = 0; i < 5; i++) {
    const z = -0.2 + i * 0.1, k = 1 - Math.abs(z) * 2.2;
    rig.add('tronco', spike(0.09 + k * 0.05, 0.042, m.luz(1), { pos: [0.36, 0.07 + k * 0.03, z], rot: [0, 0, 180] }));
    rig.add('tronco', spike(0.07 + k * 0.04, 0.04, m.luz(1), { pos: [0.36, -0.23 - k * 0.03, z + 0.05] }));
  }
  // garras-foice enormes por cima das do kit e cipós nos braços
  par((l, s) => {
    for (const dz of [-0.1, 0, 0.1]) rig.add('antebraco_' + l, garra(0.36, 0.062, m.luz(1), { pos: [0.4, -0.31, -0.05 * s + dz], rot: [0, dz * -160, 8], curva: 0.75 }));
    rig.bone('cipo_' + l, 'braco_' + l, [0.04, -0.2, 0.02 * s], [0, 0, 180]);
    rig.add('cipo_' + l, tufo(3, 0.3, 0.085, m(2), { abre: 26 }), blob([0.05, 0.05, 0.05], m.luz(2), { pos: [0.05, 0.26, 0], seg: 8 }));
    // ombreira de pelo
    rig.add('braco_' + l, blob([0.17, 0.16, 0.15], m(0), { pos: [0, 0.0, 0.02 * s], seg: 14 }), tufo(3, 0.16, 0.07, m.luz(0), { pos: [-0.02, 0.1, 0.06 * s], rot: [40 * s, 0, 10], abre: 34 }));
    // pés de terra
    rig.add('canela_' + l, blob([0.1, 0.05, 0.1], m(3), { pos: [0.0, -0.1, 0], seg: 10 }));
  });
  // braço da frente erguido, garras para o céu
  rig.bones.braco_e.rotation.z = 124 * D2R; rig.bones.antebraco_e.rotation.z = 44 * D2R; rig.bones.braco_e.rotation.x = 30 * D2R;
  // MANTO de musgo, pedras e cogumelos nas costas
  rig.add('tronco', calota([0.36, 0.45, 0.385], m(2), { de: 0, ate: 84, rot: [0, 0, 86] }));
  const lajes: [V3, number, number, V3][] = [[[-0.2, 0.44, 0.02], 0.4, 0.13, [0, 0, 26]], [[-0.3, 0.22, -0.16], 0.32, 0.11, [-28, 0, 58]], [[-0.3, 0.2, 0.18], 0.3, 0.11, [30, 0, 60]], [[-0.34, -0.04, 0], 0.24, 0.1, [0, 0, 84]]];
  lajes.forEach(([pos, len, r, rot], i) => {
    rig.bone('laje' + (i + 1), 'tronco', pos, rot);
    rig.add('laje' + (i + 1), lathe([[r, 0], [r * 0.9, len * 0.5], [r * 0.5, len * 0.86], [0.001, len]], m(3), { seg: 5 }), blob([r * 1.15, r * 0.5, r * 1.15], m.luz(2), { seg: 8 }));
  });
  const cogus: [V3, number][] = [[[-0.06, 0.46, 0.2], 0.075], [[-0.12, 0.44, -0.2], 0.06], [[-0.16, 0.36, 0.3], 0.05]];
  for (const [p, r] of cogus) rig.add('tronco', blob([r * 0.4, r * 0.9, r * 0.4], m(1), { pos: p, seg: 8 }), blob([r, r * 0.55, r], m.luz(1), { pos: [p[0], p[1] + r * 0.9, p[2]], seg: 10 }));
  for (const [y, z, g] of [[-0.3, 0.3, 160], [-0.3, -0.3, 160], [-0.34, 0, 170], [0.0, 0.36, 130], [0.0, -0.36, 130]] as const)
    rig.add('tronco', folha3d(0.22, 0.17, m.luz(2), { pos: [-0.22, y, z], rot: [0, 0, g], esp: 0.5 }));
  // topete de musgo e orelhas de tufo
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.04, ref.topo[1] - 0.05, 0], [0, 0, 18]);
  rig.add('topete', tufo(4, 0.22, 0.09, m(2), { abre: 46 }));
  par((_, s) => rig.add('cabeca', tufo(2, 0.16, 0.06, m(0), { pos: [-0.04, 0.06, 0.2 * s], rot: [70 * s, 0, 20], abre: 24 })));
  // garras do pé
  par((l) => { for (const z of [-0.06, 0, 0.06]) rig.add('canela_' + l, garra(0.1, 0.03, m(1), { pos: [0.16, -0.1, z], curva: 0.5 })); });
  return rig;
}

const anims = animsArboricola({ u: 1.4, hPerna: 0.2, mole: 0.5 }, unirExtras(bracosCurtos, {
  idle: { topete: lz([0, 4, 7, 2]), braco_e: lz([0, 4, 7, 3]), antebraco_e: lz([0, -6, -10, -4]), cipo_e: lz([0, -6, -10, -4]), cipo_d: lz([0, 5, 8, 3]) },
  fisico: { braco_e: qz([10, 22, -84, -36, 0]), antebraco_e: qz([10, 20, -26, -10, 0]) },
  especial: { topete: qz([0, 12, 16, -22, -8, 0]), braco_e: qz([0, 6, 8, -14, -6, 0]), laje1: qz([0, 6, 10, -12, -4, 0]) },
  desmaio: { braco_e: qz([0, -20, -60, -112, -110]) },
  andar: { topete: lz([0, 8, 0, -8]), braco_e: lz([0, 6, 0, -6]) },
}));

export const mapinguari = criatura({
  num: 175, id: 'mapinguari', nome: 'Mapinguari', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['.pppp.', 'paawwp', 'pappwp', 'oappap', 'ooaaap', '.pppp.'],
    fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
