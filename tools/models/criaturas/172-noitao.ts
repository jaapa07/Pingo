/**
 * 172 · NOITÃO (Assombro/Mente) — macaco-da-noite de olhos-lua. Estágio final.
 * Mantém da linha: máscara branca de três riscas, barriga alaranjada, caudão de ponta escura com fiapo lilás.
 * Cresce: olhos-lua enormes de íris clara · crescente lilás na testa · juba de pelo eriçado nos ombros ·
 * braço erguido conduzindo três fogos-fátuos que giram em volta · cauda em espiral com tocha de assombro.
 */
import { criatura, animsArboricola, unirExtras, blob, ring, tufo, par, m, lz, qz, ls, lp, D2R, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';
import { paletaNoite, corpoNoite, fiapo, treme, cabecaRetaNoMapa } from './171-noitim';

const paleta = { ...paletaNoite, extras: { ...paletaNoite.extras, a: '#ffd27c', l: '#ffffff' } };

function build() {
  const cab: V3 = [0.37, 0.34, 0.37];
  const { rig, ref } = corpoNoite({ k: 1.3, cabeca: cab, bracos: 0.62, cauda: 0.7, olho: 0.066 });
  // braço da frente erguido, regendo os fogos
  rig.bones.braco_e.rotation.z = 150 * D2R; rig.bones.antebraco_e.rotation.z = 30 * D2R; rig.bones.braco_e.rotation.x = 30 * D2R;
  rig.bones.braco_d.rotation.z = 50 * D2R; rig.bones.antebraco_d.rotation.z = 70 * D2R;
  // crescente na testa e juba eriçada nos ombros e na nuca
  rig.add('cabeca', ring(0.07, 0.03, m.luz(3), { pos: [cab[0] * 0.9, cab[1] * 0.56, 0], rot: [0, 90, 0], arc: 220 }));
  par((l, s) => {
    rig.add('tronco', tufo(2, 0.2, 0.09, m(0), { pos: [-0.06, 0.22, 0.2 * s], rot: [60 * s, 0, 30], abre: 24 }));
    rig.add('orelha_' + l, tufo(2, 0.14, 0.05, m(1), { rot: [70 * s, 0, 10], abre: 20 }));
  });
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.05, ref.topo[1] - 0.04, 0], [0, 0, 24]);
  rig.add('topete', tufo(3, 0.24, 0.08, m.plano(3), { abre: 30 }));
  rig.add('tronco', tufo(4, 0.24, 0.09, m(0), { pos: [-0.2, 0.2, 0], rot: [0, 0, 70], abre: 40 }));
  // cauda em espiral com tocha de assombro e anéis escuros
  fiapo(rig, 'fiapo', 'cauda3', [-0.23, 0, 0], 0.4, 0.13, [0, 0, -40]);
  for (const c of [1, 2]) rig.add('cauda' + c, blob([0.035, 0.092, 0.092], m.plano(3), { pos: [-0.16, 0, 0], seg: 10 }));
  // três fogos-fátuos girando
  const fogos: V3[] = [[0.42, 1.0, -0.36], [-0.1, 1.2, -0.3], [0.5, 0.55, 0.3]];
  fogos.forEach((p, i) => { fiapo(rig, 'fogo' + (i + 1), 'base', p, 0.2 - i * 0.02, 0.075 - i * 0.006, [0, 0, 0]); rig.add('fogo' + (i + 1), blob([0.03, 0.03, 0.03], m.sombra(3), { pos: [0.02, 0.03, -0.07], seg: 6 })); });
  return rig;
}

const paira = (f: number): V3[] => [[0, 0, 0], [0, 0.03, 0], [0, 0.05, 0], [0, 0.02, 0]].map((_, i, v) => v[(i + f) % 4] as V3);
const anims = cabecaRetaNoMapa(animsArboricola({ u: 1.1, hPerna: 0.17, mole: 0.8 }, unirExtras(bracosCurtos, {
  todas: { fiapo: treme(0), fogo1: [...treme(1), ...lp(paira(0))], fogo2: [...treme(2), ...lp(paira(2))], fogo3: [...treme(3), ...lp(paira(1))] },
  idle: { topete: lz([0, 4, 7, 2]), braco_e: lz([0, 5, 9, 4]), antebraco_e: lz([0, -8, -14, -6]) },
  fisico: { braco_e: qz([10, 24, -76, -30, 0]), antebraco_e: qz([10, 20, -30, -10, 0]) },
  especial: { topete: qz([0, 12, 16, -22, -8, 0]), braco_e: qz([0, 6, 8, -14, -6, 0]), fiapo: ls([1, 1.15, 1.3, 1.6, 1.2, 1]) },
  desmaio: { braco_e: qz([0, -20, -60, -112, -110]) },
})));

export const noitao = criatura({
  num: 172, id: 'noitao', nome: 'Noitão', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.aaaa.', 'aalpwa', 'alpppa', 'appppa', 'aappaa', '.aaaa.'],
    fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
