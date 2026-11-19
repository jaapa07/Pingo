/**
 * 060 · OURIÇUDO (Comum/Veneno) — ouriço-cacheiro adulto de espinhos que ardem como urtiga. Estágio final.
 * Mantém da linha: bola castanha, narigão rosa, patas e rabo rosa, espinhos creme.
 * Cresce: espinhos compridos, um em cada três tomado de PEÇONHA lilás · leque de espinhos na nuca ·
 * gotas de peçonha pingando das pontas · sobrancelha brava · rabo comprido com espinhos na base · unhas.
 */
import { criatura, animsQuadrupede, blob, spike, garra, par, m, lz, ls, lp, qs, qz, type V3 } from './kits';
import { paletaOurico, corpoOurico, espinhos, GRADE } from './059-ourico-mirim';

const paleta = { ...paletaOurico, rampas: [paletaOurico.rampas[0], paletaOurico.rampas[1], paletaOurico.rampas[2], ['#57297e', '#a251d4', '#dba4ff']] as [string, string, string][] }; // 3 peçonha

function build() {
  const T: V3 = [0.34, 0.27, 0.28];
  const { rig } = corpoOurico({ k: 1.35, tronco: T, cabeca: [0.2, 0.17, 0.175], alt: 0.13, rabo: 0.62 });
  espinhos(rig, 'corpo', T, [...GRADE, [0.78, 0.3], [0.78, -0.3], [-0.05, 0.9], [-0.05, -0.9], [0.36, 0.8], [0.36, -0.8]], 0.3, 0.05, (i) => (i % 3 === 0 ? m(3) : i % 3 === 1 ? m.luz(1) : m(1)), 1);
  // leque de espinhos na nuca (osso próprio, eriça)
  rig.bone('leque', 'cabeca', [-0.04, 0.13, 0], [0, 0, 8]);
  for (const [z, t, mat] of [[0, 0, m(3)], [0.08, 20, m(1)], [-0.08, 20, m(1)], [0.14, 44, m.luz(1)], [-0.14, 44, m.luz(1)]] as const) rig.add('leque', spike(0.2, 0.042, mat, { pos: [-Math.abs(z) * 0.3, 0, z], rot: [z * 380, 0, t] }));
  par((l, s) => {
    // sobrancelha brava, bochecha e unhas
    rig.add('cabeca', blob([0.07, 0.022, 0.05], m.sombra(0), { pos: [0.16, 0.1, 0.11 * s], rot: [-20 * s, 0, -26], seg: 8 }));
    rig.add('cabeca', blob([0.055, 0.045, 0.035], m.luz(0), { pos: [0.13, -0.06, 0.145 * s], seg: 8 }));
    for (const z of [-0.04, 0.04]) rig.add('canela_f' + l, garra(0.07, 0.022, m.luz(1), { pos: [0.09, -0.05, z], curva: 0.5 }));
    // espinhos na base do rabo
    rig.add('cauda1', spike(0.15, 0.036, m(1), { pos: [-0.04, 0.03, 0.03 * s], rot: [40 * s, 0, 50] }));
  });
  // gotas de peçonha (ossos próprios)
  const gotas: [string, V3][] = [['gota1', [-0.2, 0.52, 0.16]], ['gota2', [0.14, 0.5, -0.12]], ['gota3', [-0.42, 0.34, -0.1]]];
  for (const [nome, pos] of gotas) { rig.bone(nome, 'corpo', pos); rig.add(nome, blob([0.032, 0.045, 0.032], m.luz(3), { seg: 8 }), blob([0.014, 0.016, 0.014], m.luz(1), { pos: [0.01, 0.015, -0.02], seg: 6 })); }
  return rig;
}

const pinga = (i: number) => { const y: V3[] = [[0, 0, 0], [0, -0.02, 0], [0, -0.06, 0], [0, -0.1, 0]], s = [1, 1.2, 1, 0.5]; return [...lp([...y.slice(i), ...y.slice(0, i)]), ...ls([...s.slice(i), ...s.slice(0, i)])]; };
const anims = animsQuadrupede({ u: 0.75, hPerna: 0.13, mole: 0.8, cauda: 0.5 }, {
  idle: { gota1: pinga(0), gota2: pinga(2), gota3: pinga(1), leque: lz([0, 3, 6, 2]) },
  especial: { corpo: qs([1, 0.95, 0.9, 1.16, 1.06, 1]), leque: qz([0, 12, 18, -24, -8, 0]) },
  dano: { leque: qz([26, 8, 0]) },
});

export const ouricudo = criatura({
  num: 60, id: 'ouricudo', nome: 'Ouriçudo', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
