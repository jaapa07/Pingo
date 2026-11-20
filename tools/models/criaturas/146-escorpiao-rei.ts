/**
 * 146 · ESCORPIÃO-REI (Veneno/Ferro) — escorpião de couraça forjada no calor do vulcão; o ferrão tine como sino. Estágio final.
 * Mantém da linha: amarelo-palha por baixo, cauda de cinco gomos erguida, brilho verde-água no ferrão e nas pinças.
 * Cresce: COURAÇA de ferro escuro em placas com frestas em brasa · COROA de três pontas douradas · pinças-tenaz de ferro ·
 * ferrão em SINO de ferro com a gota de veneno pendurada · cravos nas juntas da cauda · ombreiras.
 */
import { criatura, animsAracnideo, blob, calota, lathe, spike, par, m, lz, qz, ls, type V3 } from './kits';
import { paletaEscorpiao, escorpiao, brilhaEsc } from './145-escorpim';
import { deFrente } from './035-caranguejim';

const paleta = { ...paletaEscorpiao, rampas: [paletaEscorpiao.rampas[0], ['#201e2e', '#4a4a64', '#9094b0'], paletaEscorpiao.rampas[2], ['#a02a1c', '#f2702a', '#ffd25c']] as [string, string, string][], contorno: '#16121e', extras: { ...paletaEscorpiao.extras, f: '#4a4a64', a: '#f2702a' } };

function build() {
  const { rig, seg } = escorpiao({ k: 1.5, alt: 0.21, cauda: { len: 0.9, r: 0.085, ferrao: 0.07 } });
  // cauda desenrolada para o alto (como no 1º quadro do ataque): o sino fica acima do lombo, fora do bolo de pinças
  // POSE (2ª rodada): cauda mais desenrolada, em arco alto atrás do corpo; com a câmera quase frontal o sino fica acima da coroa
  rig.bones.cauda2.rotation.z -= 0.15; rig.bones.cauda3.rotation.z -= 0.05; rig.bones.cauda4.rotation.z += 0.35; rig.bones.cauda5.rotation.z += 0.45;
  // COURAÇA: carapaça de ferro cobrindo o lombo, com frestas em brasa entre as placas
  rig.add('corpo', calota([0.43, 0.2, 0.275], m(1), { de: 0, ate: 76 }));
  for (const x of [-0.24, -0.06, 0.12]) rig.add('corpo', blob([0.022, 0.19, 0.25], m.plano(3), { pos: [x + 0.09, 0.02, 0], seg: 10, castShadow: false }));
  rig.add('corpo', blob([0.1, 0.075, 0.1], m(1), { pos: [0.22, 0.12, 0], seg: 12 }));
  // COROA dourada de três pontas
  // (atrás dos olhos, mais baixa: os olhos ficam na frente dela)
  // 3ª rodada: a coroa virava uma mancha amarela. Agora o aro é de ferro escuro e as três pontas são altas, grossas e
  // separadas (a do meio maior, as dos lados abertas para fora), com uma brasa no meio: lê as três pontas contra o sino.
  for (const [z, a] of [[-0.17, 0.22], [0, 0.3], [0.17, 0.22]] as const) rig.add('corpo', spike(a, 0.05, m.plano(0), { pos: [0.19, 0.2, z], rot: [z * 230, 0, 4] }));
  rig.add('corpo', blob([0.05, 0.045, 0.2], m.sombra(1), { pos: [0.19, 0.2, 0], seg: 10 }), blob([0.035, 0.035, 0.03], m.luz(3), { pos: [0.235, 0.21, 0], seg: 8 }));
  par((l, s) => {
    // braços bem abertos e BAIXOS, tenazes apontando para a frente ao lado do rosto (nunca na frente dele)
    rig.bones['pinca_' + l].rotation.set(0, -1.2 * s, -0.12); rig.bones['garra_' + l].rotation.set(0, 0.95 * s, -0.1);
    // pinças-tenaz de ferro: palma chapeada e ombreira
    rig.add('garra_' + l, blob([0.215, 0.14, 0.125], m(1), { pos: [0.13, 0.0, 0], seg: 12 }), blob([0.035, 0.035, 0.035], m.plano(3), { pos: [0.12, 0.14, 0.03 * s], seg: 6 }));
    rig.add('pinca_' + l, blob([0.09, 0.08, 0.08], m(1), { pos: [0.04, 0.03, 0], seg: 10 }));
    // joelheiras de ferro
    for (const i of [1, 2, 3, 4]) rig.add(`pata${i}_${l}`, blob([0.055, 0.055, 0.055], m(1), { pos: [(0.45 - 0.9 * (i - 1) / 3) * 0.15, 0.135, 0.15 * s], seg: 8 }));
  });
  // cauda: anel de ferro e cravo em cada junta
  for (let i = 1; i <= 5; i++) rig.add('cauda' + i, blob([0.05, 0.1, 0.1], m(1), { pos: [-seg * 0.5, 0, 0], seg: 10 }), spike(0.1, 0.035, m.luz(1), { pos: [-seg * 0.5, 0.07, 0], rot: [0, 0, 0] }));
  // SINO de ferro em volta do ferrão (boca para a frente), com a gota de veneno de badalo
  rig.add('brilho', lathe([[0.001, 0.1], [0.07, 0.09], [0.1, 0.0], [0.13, -0.12], [0.16, -0.15], [0.12, -0.13], [0.001, -0.02]], m(1), { seg: 14, rot: [0, 0, -100], pos: [0.03, 0.02, 0] }),
    blob([0.06, 0.07, 0.06], m.plano(2), { pos: [-0.16, -0.03, 0], seg: 10, castShadow: false }), blob([0.03, 0.03, 0.03], m.luz(2), { pos: [-0.17, 0, -0.03], seg: 6, castShadow: false }));
  // brasas pingando da couraça
  const br: V3[] = [[0.06, 0.24, 0.2], [-0.2, 0.22, -0.2]];
  br.forEach((pos, i) => { rig.bone('brasa' + (i + 1), 'corpo', pos); rig.add('brasa' + (i + 1), blob([0.03, 0.04, 0.03], m.luz(3), { seg: 6, castShadow: false })); });
  return rig;
}

const anims = deFrente(animsAracnideo({ u: 0.8, alt: 0.21, pares: 4, mole: 0.5 }, {
  ...brilhaEsc,
  todas: { ...brilhaEsc.todas, brasa1: ls([1, 0.4, 1.2, 0.8]), brasa2: ls([0.8, 1.2, 0.4, 1]) },
  idle: { cauda3: lz([0, -2, -4, -1]), cauda5: lz([0, 3, 6, 2]) },
  // badalada: a cauda inteira chicoteia para a frente
  fisico: { cauda3: qz([-6, -12, 20, 8, 0]), cauda4: qz([-6, -12, 22, 8, 0]) },
}), -30, 18);

export const escorpiaoRei = criatura({
  num: 146, id: 'escorpiao-rei', nome: 'Escorpião-Rei', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.kkk.', 'kwaak', 'kaapk', 'kaapk', '.kkk.'],
    fechado: ['fffff', 'fffff', 'ppppp', 'fffff', 'fffff'],
    mapa: ['a', 'p'],
  },
});
