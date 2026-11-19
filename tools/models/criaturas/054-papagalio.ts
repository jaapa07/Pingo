/**
 * 054 · PAPAGÁLIO (Comum/Mente) — papagaio sabido que imita qualquer golpe que escuta. Estágio final.
 * Mantém da linha: verde, testa azul, cara amarela, ombro vermelho, bico negro, cabeça de lado.
 * Cresce: cocar de três penas amarelas de ponta vermelha · ONDAS DE ECO azuis saindo do bico ·
 * pedra azul da mente na testa · colar de penas amarelas · cauda longa em leque vermelho e azul.
 */
import { criatura, ave, animsAve, blob, ring, pena, par, m, lz, ls, qs, qz, D2R, unirExtras } from './kits';
import { paletaPapagaio, pintaPapagaio } from './053-papagaiozim';
import { asasContidas } from './051-ararinha';

function build() {
  const { rig, ref } = ave({
    corpo: [0.27, 0.25, 0.23], ergue: 56,
    pescoco: { len: 0.11, ang: 76, r: 0.16 },
    cabeca: [0.21, 0.2, 0.2],
    bico: { len: 0.16, r: 0.11, y: -0.16, gancho: 64, achata: 0.72, inferior: 0.5 },
    asa: { len: 0.42, larg: 0.24, cai: 24, ponta: 0.5 },
    cauda: { len: 0.4, larg: 0.12, ang: -26, penas: 5, abre: 30 },
    pernas: { alt: 0.11, r: 0.035, z: 0.5, dedo: 0.1 },
    olho: { r: 0.027, pos: [0.125, 0.04, 0.165] },
    rampas: { corpo: 0, peito: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  pintaPapagaio(rig, 0.2, 0.42);
  rig.add('tronco', blob([0.17, 0.19, 0.18], m.luz(0), { pos: [0.1, -0.04, 0], seg: 14 }));
  rig.bones.cabeca.rotation.x = -10 * D2R;
  // cocar de três penas (ossos próprios)
  const cocar: [string, number, number][] = [['cocar1', -30, 0.22], ['cocar2', 4, 0.28], ['cocar3', 38, 0.22]];
  for (const [nome, tomba, len] of cocar) {
    rig.bone(nome, 'cabeca', [ref.topo[0] - 0.03, ref.topo[1] - 0.03, 0], [0, 0, tomba]);
    rig.add(nome, pena(len, 0.075, m(1), { esp: 0.04, rot: [0, 0, -90] }), blob([0.04, 0.05, 0.035], m.plano(3), { pos: [0, len * 0.9, 0], seg: 8 }));
  }
  // pedra azul da mente na testa
  rig.bone('pedra', 'cabeca', [0.17, 0.11, 0]);
  rig.add('pedra', blob([0.045, 0.055, 0.055], m.sombra(3), { seg: 10 }), blob([0.02, 0.025, 0.025], m.luz(2), { pos: [0.03, 0.02, -0.02], seg: 6 }));
  // colar de penas amarelas
  for (const z of [-0.13, -0.045, 0.045, 0.13]) rig.add('pescoco', pena(0.11, 0.08, m(1), { esp: 0.04, rot: [0, 0, -100], pos: [0.1 - Math.abs(z) * 0.4, 0.02, z] }));
  // penas azuis de fora na cauda
  par((_, s) => rig.add('cauda1', pena(0.3, 0.07, m.sombra(3), { esp: 0.035, rot: [90, 34 * s, 0], pos: [0.02, 0.012, 0] })));
  // ONDAS DE ECO: três arcos azuis crescentes à frente do bico
  const ecos: [string, number][] = [['eco1', 0.1], ['eco2', 0.19], ['eco3', 0.28]];
  for (const [nome, r] of ecos) { rig.bone(nome, 'cabeca', [ref.pontaBico[0] - 0.02, ref.pontaBico[1] - 0.04, 0]); rig.add(nome, ring(r, 0.022, m.sombra(3), { arc: 76, rot: [0, 0, -38] })); }
  return rig;
}

const onda = (i: number) => { const v = [0.8, 0.95, 1.1, 0.6]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsAve({ u: 0.95, hPerna: 0.11, mole: 0.9 }, unirExtras(asasContidas, {
  idle: { eco1: onda(0), eco2: onda(3), eco3: onda(2), cocar1: lz([0, -4, -8, -2]), cocar3: lz([0, 4, 8, 2]), pedra: ls([1, 1.1, 1.3, 1.1]) },
  status: { eco1: ls([0.2, 0.2, 0.2, 0.2]), eco2: ls([0.2, 0.2, 0.2, 0.2]), eco3: ls([0.2, 0.2, 0.2, 0.2]) },
  especial: { eco1: qs([0.4, 0.8, 1.2, 1.6, 1.2, 1]), eco2: qs([0.2, 0.5, 1, 1.6, 1.2, 1]), eco3: qs([0.2, 0.2, 0.6, 1.5, 1.2, 1]), pedra: qs([1, 1.4, 1.8, 2.2, 1.4, 1]), cocar2: qz([0, 10, 14, -20, -8, 0]) },
  desmaio: { eco1: qs([1, 0.6, 0.2, 0.05, 0.05]), eco2: qs([1, 0.6, 0.2, 0.05, 0.05]), eco3: qs([1, 0.6, 0.2, 0.05, 0.05]) },
}));

export const papagalio = criatura({
  num: 54, id: 'papagalio', nome: 'Papagálio', porte: 'M', estagio: 'final', paleta: paletaPapagaio, build, anims,
  olho: {
    frente: ['.ppp.', 'pawpp', 'paapp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
