/**
 * 129 · SIRIZIM (Rio) — siri-azul filhote que levanta as pinças para qualquer um, até para a própria sombra.
 * Traços únicos: carapaça larga oliva com um ESPINHO comprido de cada lado · pinças azuis ERGUIDAS de ponta vermelha ·
 * último par de patas em REMO (é isso que faz dele um siri) · olhos em pedúnculo · dentinhos na testa.
 */
import { criatura, aracnideo, animsAracnideo, blob, spike, par, m, lz, lr, qr, type Rig } from './kits';

export const paletaSiri = {
  rampas: [
    ['#3a5640', '#7c9e4e', '#cce08c'], // 0 carapaça oliva
    ['#1e3a8e', '#3c7ee2', '#a2d2ff'], // 1 azul das patas e pinças
    ['#b79880', '#f4e2c0', '#fffaf0'], // 2 creme do ventre
    ['#a02a30', '#f2603a', '#ffba78'], // 3 vermelho das pontas
  ] as [string, string, string][],
  contorno: '#1e2440',
  extras: { w: '#ffffff', p: '#1a1830', f: '#7c9e4e' },
};

/** Desmaio de pernas menos abertas (o do kit espalha os tarsos além da célula). */
/** graus que o siri vira para encarar a câmera de batalha (ele anda de lado); o mapa desfaz */
export const FRONTAL = 34;
export const deLado = { andar: { corpo: [{ t: 0, r: [0, -FRONTAL, 0] as [number, number, number] }] }, parado: { corpo: [{ t: 0, r: [0, -FRONTAL, 0] as [number, number, number] }] } };
export const tarsosSiri = { desmaio: { pinca_d: qr([[0, 0, 0], [0, -4, -10], [0, -8, -24], [0, -12, -40], [0, -12, -38]]), pinca_e: qr([[0, 0, 0], [0, 4, -10], [0, 8, -24], [0, 12, -40], [0, 12, -38]]), ...Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3, 4].map((i) => [`tarso${i}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? -12 : 12, 0, 0], [l === 'd' ? -24 : 24, 0, 0], [l === 'd' ? -22 : 22, 0, 0]])]))) } };

/** Traços comuns da linha: espinhos laterais, remos, pinças erguidas com ponta vermelha, dentes da testa. `k` = escala. */
export function tracosSiri(rig: Rig, c: [number, number, number], k: number, matEspinho = m.luz(0)) {
  const [cx, cy, cz] = c;
  rig.bones.corpo.rotation.y = FRONTAL * Math.PI / 180;
  par((l, s) => {
    rig.add('corpo', spike(0.24 * k, 0.08 * k, matEspinho, { pos: [-cx * 0.1, cy * 0.4, cz * 0.8 * s], rot: [78 * s, 0, 0] }));
    // remo: pá chata azul-clara na ponta do último par, virada para trás
    rig.bones['pata4_' + l].rotation.y = -0.5 * s;
    rig.add('tarso4_' + l, blob([0.085 * k, 0.1 * k, 0.03 * k], m.luz(1), { pos: [-0.02 * k, -0.1 * k, 0.05 * k * s], rot: [0, 30 * s, 20], seg: 12 }));
    // pinças erguidas
    rig.bones['pinca_' + l].rotation.z = 1.0; rig.bones['garra_' + l].rotation.z = 0.3;
    rig.add('garra_' + l, blob([0.05 * k, 0.04 * k, 0.04 * k], m.plano(3), { pos: [0.31 * k, 0.07 * k, 0], seg: 8 }));
    rig.add('dedo_' + l, blob([0.045 * k, 0.035 * k, 0.04 * k], m.plano(3), { pos: [0.13 * k, -0.01 * k, 0], seg: 8 }));
    // dentes da testa
    for (const z of [0.12, 0.3]) rig.add('corpo', blob([0.04 * k, 0.035 * k, 0.04 * k], m.luz(0), { pos: [cx * 0.9, cy * 0.2, cz * z * s], seg: 8 }));
  });
}

function build() {
  const c: [number, number, number] = [0.21, 0.19, 0.36];
  const { rig } = aracnideo({
    corpo: c, alt: 0.14, patas: { pares: 4, abre: 0.2, r: 0.05, joelho: 0.05 },
    pincas: { braco: 0.15, r: 0.06, garra: [0.14, 0.11, 0.09], abre: 40 }, pedunculo: 0.1,
    olho: { r: 0.04, pos: [0, 0, 0] },
    rampas: { corpo: 0, barriga: 2, patas: 1, pontas: 1, pincas: 1 },
  });
  tracosSiri(rig, c, 1);
  // desenho em "V" mais escuro na carapaça e boca
  par((_, s) => rig.add('corpo', blob([0.1, 0.03, 0.03], m.sombra(0), { pos: [0.0, 0.145, 0.1 * s], rot: [0, 28 * s, 0], seg: 8, castShadow: false })));
  rig.add('corpo', blob([0.03, 0.035, 0.1], m.sombra(2), { pos: [0.2, -0.05, 0], seg: 8 }));
  return rig;
}

const anims = animsAracnideo({ u: 0.5, alt: 0.14, pares: 4, mole: 0.8 }, {
  ...tarsosSiri, ...deLado,
  idle: { garra_d: lz([0, 6, 12, 4]), garra_e: lz([12, 4, 0, 6]), tarso4_d: lr([[0, 0, 0], [0, 10, 0], [0, 0, 0], [0, -10, 0]]), tarso4_e: lr([[0, 0, 0], [0, -10, 0], [0, 0, 0], [0, 10, 0]]) },
});

export const sirizim = criatura({
  num: 129, id: 'sirizim', nome: 'Sirizim', porte: 'P', estagio: 'basico', paleta: paletaSiri, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pppp', 'ffff', 'ffff'],
    mapa: ['p', 'p'],
  },
});
