/**
 * 035 · CARANGUEJIM (Rio) — caranguejo-uçá do mangue, que anda de lado e faz espuma quando fica nervoso.
 * Traços únicos: carapaça ferrugem com o "H" marcado · patas roxas peludas · olhos em pedúnculo ·
 * uma pinça maior que a outra · espuminha de bolhas na boca.
 */
import { criatura, aracnideo, animsAracnideo, blob, espuma, par, m, ls, lp, qs, qr, type V3 } from './kits';

export const paletaUca = {
  rampas: [
    ['#873838', '#d96f38', '#f9ba62'], // 0 carapaça ferrugem
    ['#b79880', '#f4e2c0', '#fffaf0'], // 1 creme do ventre e da ponta das pinças
    ['#3a2152', '#7a4f9e', '#c3a2e0'], // 2 patas e pinças roxas
    ['#3a6a82', '#74bccb', '#dcf5f9'], // 3 espuma do mangue
  ] as [string, string, string][],
  contorno: '#2a1630',
  extras: { w: '#ffffff', p: '#22122a', f: '#d96f38' },
};

export const bolhas = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const v = [1, 1.2, 1.4, 0.8], y: V3[] = [[0, 0, 0], [0, 0.015, 0], [0, 0.03, 0], [0, 0.01, 0]];
  return [n, [...ls([...v.slice(i % 4), ...v.slice(0, i % 4)]), ...lp([...y.slice(i % 4), ...y.slice(0, i % 4)])]];
}));

/** Desmaio de pernas menos abertas (o do kit espalha os tarsos além da célula). */
export const tarsos = { desmaio: Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3, 4].map((i) => [`tarso${i}_${l}`, qr([[0, 0, 0], [0, 0, 0], [l === 'd' ? -12 : 12, 0, 0], [l === 'd' ? -26 : 26, 0, 0], [l === 'd' ? -24 : 24, 0, 0]])]))) };

function build() {
  const { rig } = aracnideo({
    corpo: [0.26, 0.23, 0.36], alt: 0.2, patas: { pares: 4, abre: 0.22, r: 0.055, joelho: 0.09 },
    pincas: { braco: 0.2, r: 0.07, garra: [0.16, 0.13, 0.1], abre: 70 }, pedunculo: 0.19,
    olho: { r: 0.05, pos: [0, 0, 0] },
    rampas: { corpo: 0, barriga: 1, patas: 2, pontas: 2, pincas: 2 },
  });
  // pinça da frente (lado da câmera) maior, com ponta creme
  rig.bones.garra_e.scale.setScalar(1.05); rig.bones.garra_d.scale.setScalar(1.4);
  rig.bones.pinca_e.rotation.z = 0.2; rig.bones.pinca_d.rotation.z = 0.45;
  rig.bones.garra_e.rotation.z = 0.9; rig.bones.garra_d.rotation.z = 0.8; // pinças erguidas: o "V" de caranguejo bravo
  // carapaça mais alta e abaulada (lê como casco, não como tábua)
  rig.add('corpo', blob([0.22, 0.12, 0.3], m(0), { pos: [0.0, 0.14, 0], seg: 14 }));
  par((l, s) => {
    rig.add('dedo_' + l, blob([0.05, 0.03, 0.04], m.plano(1), { pos: [0.09, -0.012, 0], seg: 8 }));
    rig.add('garra_' + l, blob([0.06, 0.035, 0.045], m.plano(1), { pos: [0.3, 0.02, 0], seg: 8 }));
    // "H" da carapaça: dois sulcos e a travessa
    rig.add('corpo', blob([0.1, 0.03, 0.022], m.sombra(0), { pos: [-0.02, 0.213, 0.105 * s], seg: 8, castShadow: false }));
    // joelhos claros das patas
    for (const i of [1, 2, 3, 4]) rig.add(`pata${i}_${l}`, blob([0.05, 0.05, 0.05], m.luz(2), { pos: [0, 0.09, 0.1 * s], seg: 8 }));
    // dentinhos da borda da carapaça
    rig.add('corpo', blob([0.04, 0.035, 0.04], m.luz(0), { pos: [0.19, 0.07, 0.25 * s], seg: 8 }));
  });
  rig.add('corpo', blob([0.022, 0.03, 0.09], m.sombra(0), { pos: [-0.02, 0.218, 0], seg: 8, castShadow: false }));
  // boca e espuma
  rig.add('corpo', blob([0.03, 0.035, 0.09], m.sombra(1), { pos: [0.25, -0.05, 0], seg: 8 }));
  rig.bone('espuma1', 'corpo', [0.29, -0.02, -0.08]); rig.add('espuma1', espuma(0.045, m.luz(3)));
  rig.bone('espuma2', 'corpo', [0.31, 0.06, 0.03]); rig.add('espuma2', blob([0.03, 0.03, 0.03], m.luz(3), { seg: 8 }));
  return rig;
}

/** Caranguejo anda de lado e é largo: na batalha a câmera fica quase de frente (o kit usa 3/4, que esconde as pinças). */
export function deFrente(a: ReturnType<typeof animsAracnideo>, yaw = -34, pitch = 20) {
  for (const an of Object.values(a.frente)) { an.yaw = yaw; an.pitch = pitch; }
  for (const an of Object.values(a.costas)) { an.yaw = 180 + yaw * 0.6; an.pitch = 28; }
  return a;
}

/** Desmaio: patas cedem e as pinças caem para a frente (o kit as abre para fora da célula). */
export const desmaioUca = { ...tarsos.desmaio, pinca_d: qr([[0, 0, 0], [0, 6, 0], [0, 16, 0], [0, 30, 0], [0, 28, 0]]), pinca_e: qr([[0, 0, 0], [0, -6, 0], [0, -16, 0], [0, -30, 0], [0, -28, 0]]) };

const anims = deFrente(animsAracnideo({ u: 0.5, alt: 0.2, pares: 4, mole: 0.9 }, {
  ...tarsos,
  desmaio: desmaioUca,
  idle: bolhas(['espuma1', 'espuma2']),
  status: bolhas(['espuma1', 'espuma2']),
  especial: { espuma1: qs([1, 1.4, 1.8, 2.6, 1.5, 1]), espuma2: qs([1, 1.5, 2, 3, 1.6, 1]) },
}));

export const caranguejim = criatura({
  num: 35, id: 'caranguejim', nome: 'Caranguejim', porte: 'P', estagio: 'basico', paleta: paletaUca, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
