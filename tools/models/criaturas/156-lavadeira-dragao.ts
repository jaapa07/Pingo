/**
 * 156 · LAVADEIRA-DRAGÃO (Inseto/Lenda) — libélula do tamanho das de 300 milhões de anos atrás; a luz que atravessa
 * suas asas de vitral pinta o chão como dentro de uma igreja. Estágio final.
 * Mantém da linha: azul-céu de juntas azul-noite, olhões verde-limão, quatro asas em "X", rabo comprido de gomos.
 * Cresce: ASAS DE VITRAL (painéis rubi, ouro e azul entre nervuras escuras) · chifres e barbilhões de dragão ·
 * crista de espinhos pelo rabo · ponta do rabo em leque de vitral · papo dourado · manchas de luz colorida no ar.
 */
import { criatura, animsInseto, blob, spike, tube, par, m, ls, lz, qs, type V3 } from './kits';
import { paletaLibelula, libelula, voaLib, pousaLib } from './155-lavadeirim';

const paleta = {
  ...paletaLibelula,
  rampas: [['#183e8c', '#3486de', '#9cd8ff'], paletaLibelula.rampas[1], ['#a02a6c', '#f262a2', '#ffc4de'], ['#c08a10', '#ffd83a', '#fffab4']] as [string, string, string][], // 2 vidro rubi · 3 vidro ouro (e os olhos)
  extras: { ...paletaLibelula.extras, f: '#ffd83a', a: '#f262a2' },
};

// painéis do vitral: três vidros por asa em cores alternadas, sobre a asa escura (a nervura é o que sobra entre eles)
const vitral = (len: number, larg: number, i: number, s: number) => {
  const cores = i === 0 ? [m.plano(2), m.plano(3), m.luz(0), m.plano(2)] : [m.plano(3), m.luz(0), m.plano(2), m.plano(3)];
  return [0.16, 0.39, 0.62, 0.84].map((x, j) => blob([len * (j === 3 ? 0.1 : 0.112), larg * 0.1, larg * (j === 3 ? 0.34 : 0.45)], cores[j], { pos: [-len * x, 0, larg * 0.03 * s], seg: 10, castShadow: false }));
};

function build() {
  const rig = libelula({ k: 1.5, flutua: 0.56, rabo: { segs: 6, len: 1.0, r: 0.07 }, asa: [0.9, 0.36], pinta: vitral, matAsa: m(1) });
  par((l, s) => {
    // chifres de dragão para trás e barbilhões
    rig.add('cabeca', tube([[0.02, 0.14, 0.09 * s], [-0.1, 0.26, 0.13 * s], [-0.24, 0.3, 0.14 * s]], (u) => 0.04 * (1 - u * 0.7), m.luz(3), { seg: 10, radial: 8 }));
    rig.bone('barba_' + l, 'cabeca', [0.2, -0.08, 0.07 * s]);
    rig.add('barba_' + l, tube([[0, 0, 0], [0.1, -0.06, 0.05 * s], [0.12, -0.2, 0.08 * s]], (u) => 0.024 * (1 - u * 0.5), m(3), { seg: 8, radial: 6 }));
  });
  // focinho de dragão e papo dourado
  rig.add('cabeca', blob([0.12, 0.09, 0.11], m(0), { pos: [0.2, -0.04, 0], seg: 12 }), blob([0.03, 0.025, 0.03], m.sombra(0), { pos: [0.3, 0.0, 0.04], seg: 6 }), blob([0.03, 0.025, 0.03], m.sombra(0), { pos: [0.3, 0.0, -0.04], seg: 6 }));
  rig.add('corpo', blob([0.14, 0.12, 0.14], m(3), { pos: [0.08, -0.1, 0], seg: 12 }));
  // crista de espinhos pelo rabo e leque de vitral na ponta
  for (let i = 1; i <= 5; i++) rig.add('rabo' + i, spike(0.12 - i * 0.012, 0.035, i % 2 ? m.plano(2) : m.plano(3), { pos: [-0.08, 0.05, 0], rot: [0, 0, 24] }));
  rig.bone('leque', 'rabo6', [-0.17, 0, 0]);
  const pn: [number, number][] = [[-40, 2], [0, 3], [40, 2]];
  for (const [a, c] of pn) rig.add('leque', blob([0.12, 0.03, 0.06], m(1), { pos: [-0.09, 0, a * 0.0028], rot: [0, -a, 0], seg: 10 }), blob([0.09, 0.035, 0.04], c === 2 ? m.plano(2) : m.plano(3), { pos: [-0.1, 0.003, a * 0.0028], rot: [0, -a, 0], seg: 8, castShadow: false }));
  // manchas de luz colorida do vitral flutuando
  const lu: [V3, number][] = [[[0.5, -0.2, 0.4], 2], [[-0.3, -0.3, -0.5], 3], [[0.2, 0.7, -0.6], 2], [[-0.9, 0.5, 0.3], 3]];
  lu.forEach(([pos, c], i) => { rig.bone('luz' + (i + 1), 'corpo', pos, [0, 0, 45]); rig.add('luz' + (i + 1), blob([0.05, 0.05, 0.02], c === 2 ? m.luz(2) : m.luz(3), { seg: 4, castShadow: false })); });
  return rig;
}

const v = voaLib(6);
const anims = animsInseto({ u: 0.9, alt: 0.2, flutua: 0.56, asas: true, mole: 0.8, mapa: { comp: 0.6, larg: 1.1 } }, {
  ...v,
  todas: { luz1: ls([1, 0.3, 0.9, 1.4]), luz2: ls([0.9, 1.4, 1, 0.3]), luz3: ls([0.3, 0.9, 1.4, 1]), luz4: ls([1.4, 1, 0.3, 0.9]) },
  idle: { ...v.idle, barba_d: lz([0, 8, 14, 5]), barba_e: lz([14, 5, 0, 8]), leque: lz([0, 6, 12, 4]) },
  especial: { ...v.especial, luz1: qs([1, 1.4, 1.8, 2.6, 1.6, 1]), luz2: qs([1, 1.4, 1.8, 2.6, 1.6, 1]), luz3: qs([1, 1.4, 1.8, 2.6, 1.6, 1]), luz4: qs([1, 1.4, 1.8, 2.6, 1.6, 1]) },
  desmaio: { ...v.desmaio, corpo: pousaLib(0.56, 0.2) },
});

export const lavadeiraDragao = criatura({
  num: 156, id: 'lavadeira-dragao', nome: 'Lavadeira-Dragão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
