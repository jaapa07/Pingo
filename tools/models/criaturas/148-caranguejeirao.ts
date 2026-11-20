/**
 * 148 · CARANGUEJEIRÃO (Inseto/Veneno) — caranguejeira peluda gigante que anda macio sobre as folhas. Estágio final.
 * Mantém da linha: pelo castanho-escuro, joelhos salmão, presas verde-veneno, palpos, olhinhos extras.
 * Cresce: POSE DE AMEAÇA com o primeiro par de patas erguido · abdômen enorme e eriçado de pelos salmão ·
 * presas grandes pingando veneno · crina de pelos no dorso · listras claras nas canelas · nuvem de pelos urticantes.
 */
import { criatura, animsAracnideo, blob, calota, spike, tufo, segmento, par, m, lz, ls, qs, qr, type V3 } from './kits';
import { paletaAranha, aranha, tarsosAranha } from './147-caranguejeirinha';

const paleta = { ...paletaAranha, rampas: [['#241628', '#50323e', '#8a6460'], paletaAranha.rampas[1], paletaAranha.rampas[2], paletaAranha.rampas[3]] as [string, string, string][], extras: { ...paletaAranha.extras, f: '#50323e' } };

function build() {
  // patas mais finas e articuladas (grossas, viravam tocos e o bicho lia como um móvel)
  const { rig, c } = aranha({ k: 1.45, alt: 0.3, r: 0.052, abre: 0.46, presa: 0.17 });
  // POSE DE AMEAÇA (2ª rodada): o primeiro par sobe para FORA e dobra para a frente, em arco ao lado da cabeça
  // (antes subia reto por cima da cabeça e lia como chifre)
  par((l, s) => {
    const a = rig.bones['pata1_' + l], b = rig.bones['tarso1_' + l];
    a.clear(); b.clear(); a.add(b);
    const j: V3 = [0.1, 0.3, 0.26 * s], f: V3 = [0.3, -0.02, 0.08 * s];
    b.position.set(...j);
    rig.add('pata1_' + l, segmento([0, 0, 0], j, 0.06, 0.065, m(0)), blob([0.1, 0.095, 0.1], m(1), { pos: j, seg: 10 }));
    rig.add('tarso1_' + l, segmento([0, 0, 0], f, 0.065, 0.04, m(0)), blob([0.075, 0.05, 0.075], m(1), { pos: [f[0] * 0.55, f[1] * 0.55, f[2] * 0.55], seg: 8 }), blob([0.05, 0.05, 0.05], m.luz(0), { pos: f, seg: 8 }));
    // listras claras nas canelas
    for (const i of [2, 3, 4]) rig.add(`tarso${i}_${l}`, blob([0.085, 0.05, 0.085], m(1), { pos: [[0.04, -0.09, -0.19][i - 2] * 0.5, -0.24, [0.225, 0.21, 0.12][i - 2] * 0.5 * s], seg: 8 }));
    // gota de veneno na ponta das presas
    rig.bone('gota_' + l, 'corpo', [c[0] * 0.95, -c[1] * 0.7 - 0.2, 0.072 * s]);
    rig.add('gota_' + l, blob([0.035, 0.045, 0.035], m.luz(2), { seg: 8, castShadow: false }));
  });
  // abdômen (2ª rodada): uma MANCHA salmão grande e limpa no alto (em vez de seis tufos soltos, que liam como bolhas),
  // um só topete salmão no cume (o traço do filhote) e uma franja de pelo castanho-claro em volta
  // 3ª rodada: a mancha em m(1) caía quase toda no tom de luz (creme) com a luz de cima; agora é salmão chapado (base),
  // com a borda de baixo em sombra, e o topete no tom base — o salmão volta a ser salmão
  rig.add('abdomen', calota([0.355, 0.31, 0.325], m.sombra(1), { de: 0, ate: 46, pos: [-0.3, 0.0, 0], rot: [0, 0, 18] }));
  rig.add('abdomen', calota([0.36, 0.312, 0.33], m.plano(1), { de: 0, ate: 38, pos: [-0.3, 0.0, 0], rot: [0, 0, 18] }));
  const tf: [V3, number, number, boolean][] = [[[-0.3, 0.3, 0], 0.2, 14, true], [[-0.5, 0.17, 0.17], 0.12, 60, false], [[-0.5, 0.17, -0.17], 0.12, 60, false], [[-0.12, 0.2, 0.22], 0.1, -10, false], [[-0.12, 0.2, -0.22], 0.1, -10, false], [[-0.6, 0.02, 0], 0.12, 80, false]];
  tf.forEach(([pos, alt, g, sal], i) => { rig.bone('tufo' + (i + 1), 'abdomen', pos, [0, 0, g]); rig.add('tufo' + (i + 1), tufo(3, alt, sal ? 0.07 : 0.05, sal ? m.plano(1) : m.luz(0), { abre: 30 })); });
  for (const x of [-0.08, 0.04, 0.14]) rig.add('corpo', spike(0.12, 0.045, m.luz(0), { pos: [x, 0.22, 0], rot: [0, 0, 20] }));
  // nuvem de pelos urticantes
  const nu: V3[] = [[-0.5, 0.62, 0.2], [-0.72, 0.5, -0.16], [-0.3, 0.7, -0.24]];
  nu.forEach((pos, i) => { rig.bone('pelo' + (i + 1), 'corpo', pos, [0, 0, 30 * i]); rig.add('pelo' + (i + 1), blob([0.07, 0.018, 0.018], m.luz(1), { seg: 6, castShadow: false }), blob([0.018, 0.07, 0.018], m.luz(1), { seg: 6, castShadow: false })); });
  return rig;
}

const anims = animsAracnideo({ u: 0.85, alt: 0.3, pares: 4, mole: 0.6 }, {
  desmaio: { ...tarsosAranha.desmaio, tarso1_d: qr([[0, 0, 0], [0, 0, -10], [0, 0, -30], [0, 0, -50], [0, 0, -48]]), tarso1_e: qr([[0, 0, 0], [0, 0, -10], [0, 0, -30], [0, 0, -50], [0, 0, -48]]) },
  todas: { pelo1: ls([1, 0.4, 0.9, 1.3]), pelo2: ls([0.9, 1.3, 1, 0.4]), pelo3: ls([0.4, 0.9, 1.3, 1]) },
  idle: { palpo_d: lz([0, 8, 14, 5]), palpo_e: lz([14, 5, 0, 8]), tufo1: lz([0, 4, 8, 3]), tufo6: lz([0, -4, -8, -3]), gota_d: ls([1, 1.2, 1.4, 0.6]), gota_e: ls([1.4, 0.6, 1, 1.2]), tarso1_d: lz([0, 5, 10, 4]), tarso1_e: lz([10, 4, 0, 5]) },
  especial: { abdomen: qs([1, 1.06, 1.1, 0.92, 0.98, 1]), pelo1: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), pelo2: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), pelo3: qs([1, 1.3, 1.6, 2.2, 1.4, 1]) },
  // o kit marcha com as patas da frente: aqui elas batem para baixo no golpe
  fisico: { tarso1_d: qr([[0, 0, 8], [0, 0, 16], [0, 0, -50], [0, 0, -18], [0, 0, 0]]), tarso1_e: qr([[0, 0, 8], [0, 0, 16], [0, 0, -50], [0, 0, -18], [0, 0, 0]]) },
});

export const caranguejeirao = criatura({
  num: 148, id: 'caranguejeirao', nome: 'Caranguejeirão', porte: 'G', estagio: 'final', paleta, build, anims,
  enquadre: { frente: { zoom: 0.92, dx: 2 }, costas: { zoom: 0.94, dy: -1 } },
  olho: {
    frente: ['pp...', 'pppp.', '.aapp', '.aapp', '..pp.'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['a', 'p'],
  },
});
