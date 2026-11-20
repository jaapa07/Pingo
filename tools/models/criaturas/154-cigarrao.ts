/**
 * 154 · CIGARRÃO (Inseto/Vento) — cigarra de canto sônico: abre as asas, canta, e as folhas caem em roda.
 * Mantém da linha: verde-oliva, escudo castanho, cabeça larga de olhos laranja nos cantos, asas de vidro, tímbalos.
 * Cresce: asas ABERTAS e erguidas, enormes, com borda verde · tímbalos grandes como tambores · ONDAS SONORAS em arcos
 * dos dois lados · crista de três espinhos no escudo · redemoinho de folhas arrancadas pelo canto.
 */
import { criatura, animsInseto, blob, ring, spike, folha3d, par, m, ls, qs, lz, lr, qr, type V3 } from './kits';
import { paletaCigarra, cigarra } from './153-cigarrim';

const paleta = { ...paletaCigarra, rampas: [['#2e5234', '#6a9c40', '#c6e080'], paletaCigarra.rampas[1], paletaCigarra.rampas[2], paletaCigarra.rampas[3]] as [string, string, string][], extras: { ...paletaCigarra.extras, f: '#6a9c40' } };

function build() {
  const rig = cigarra({ k: 1.4, alt: 0.2, asa: [0.7, 0.36], abre: 1 });
  par((l, s) => {
    // borda verde na ponta das asas e tímbalos-tambor maiores
    rig.add('asa_' + l, blob([0.12, 0.03, 0.14], m.luz(0), { pos: [-0.64, 0, 0.13 * s], seg: 10, castShadow: false }));
    rig.bones['timbalo_' + l].scale.setScalar(1.15);
    // ONDAS SONORAS: três arcos crescentes de cada lado, saindo dos tímbalos — laranja dos tímbalos e mais grossos,
    // para lerem como som (brancos, pareciam costelas da asa)
    [0.1, 0.2, 0.3].forEach((d, i) => {
      rig.bone(`onda${i + 1}_${l}`, 'abdomen', [-0.12, 0.02, (0.26 + d) * s]);
      rig.add(`onda${i + 1}_${l}`, ring(0.1 + i * 0.05, 0.032, i === 1 ? m.luz(3) : m(3), { arc: 140, rot: [0, 0, -70], pos: [0, 0, 0] }));
    });
  });
  // crista de três espinhos no escudo
  for (const [x, a] of [[0.08, 0.13], [-0.02, 0.17], [-0.12, 0.13]] as const) rig.add('corpo', spike(a, 0.05, m.luz(1), { pos: [x, 0.2, 0], rot: [0, 0, 16] }));
  // redemoinho de folhas
  const fo: [V3, number][] = [[[0.5, 0.56, 0.3], 30], [[-0.6, 0.7, -0.3], -50], [[0.1, 0.86, -0.5], 110], [[-0.3, 0.4, 0.66], 200]];
  rig.bone('roda', 'corpo', [0, 0, 0]);
  fo.forEach(([pos, g], i) => { rig.bone('folha' + (i + 1), 'roda', pos, [g, g, g]); rig.add('folha' + (i + 1), folha3d(0.14, 0.09, i % 2 ? m(0) : m.luz(0), { esp: 0.5, pos: [0, -0.07, 0] })); });
  return rig;
}

const ondas = (v: number[]) => Object.fromEntries(['d', 'e'].flatMap((l) => [1, 2, 3].map((i) => [`onda${i}_${l}`, ls(v.map((_, f) => v[(f + 4 - i) % v.length]))])));
const anims = animsInseto({ u: 0.8, alt: 0.2, mole: 0.8 }, {
  todas: { ...ondas([0.3, 0.8, 1.15, 1.35]), roda: lr([[0, 0, 0], [0, 12, 0], [0, 24, 0], [0, 12, 0]]) },
  idle: { timbalo_d: ls([1.15, 1.35, 1.05, 1.4]), timbalo_e: ls([1.35, 1.05, 1.4, 1.15]), asa_d: lr([[0, 0, 0], [-6, 0, 0], [0, 0, 0], [-6, 0, 0]]), asa_e: lr([[0, 0, 0], [6, 0, 0], [0, 0, 0], [6, 0, 0]]), folha1: lz([0, 20, 40, 20]), folha3: lz([40, 20, 0, 20]) },
  // estrondo: as asas vibram e as ondas estouram
  especial: { asa_d: qr([[0, 0, 0], [-8, 0, 0], [6, 0, 0], [-14, 0, 0], [-5, 0, 0], [0, 0, 0]]), asa_e: qr([[0, 0, 0], [8, 0, 0], [-6, 0, 0], [14, 0, 0], [5, 0, 0], [0, 0, 0]]), timbalo_d: qs([1.15, 1, 0.9, 1.7, 1.35, 1.15]), timbalo_e: qs([1.15, 1, 0.9, 1.7, 1.35, 1.15]), roda: qr([[0, 0, 0], [0, 20, 0], [0, 50, 0], [0, 110, 0], [0, 160, 0], [0, 180, 0]]) },
  fisico: { asa_d: qr([[0, 0, 0], [-6, 0, 0], [8, 0, 0], [3, 0, 0], [0, 0, 0]]), asa_e: qr([[0, 0, 0], [6, 0, 0], [-8, 0, 0], [-3, 0, 0], [0, 0, 0]]) },
  entrada: { asa_d: qr([[20, 0, 0], [-8, 0, 0], [6, 0, 0], [-2, 0, 0], [0, 0, 0]]), asa_e: qr([[-20, 0, 0], [8, 0, 0], [-6, 0, 0], [2, 0, 0], [0, 0, 0]]) },
  desmaio: { asa_d: qr([[0, 0, 0], [6, 0, 0], [16, 0, 0], [28, 0, 0], [27, 0, 0]]), asa_e: qr([[0, 0, 0], [-6, 0, 0], [-16, 0, 0], [-28, 0, 0], [-27, 0, 0]]) },
  status: { asa_d: lr([[10, 0, 0], [12, 0, 0], [10, 0, 0], [8, 0, 0]]), asa_e: lr([[-10, 0, 0], [-12, 0, 0], [-10, 0, 0], [-8, 0, 0]]) },
});

export const cigarrao = criatura({
  num: 154, id: 'cigarrao', nome: 'Cigarrão', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['aaaaa', 'aaaaa', 'paaap', '.ppp.', 'aaaaa'],
    mapa: ['p', 'p'],
  },
});
