/**
 * 076 · LONTRA-VELOZ (Rio/Vento) — lontra que desce as corredeiras surfando na própria onda. Estágio final.
 * Mantém da linha: castanho-claro de barriga creme, bigodão, rabo comprido, a pedrinha (agora presa no peito), o azul.
 * Cresce: ONDA azul de crista de espuma debaixo das patas · corpo esticado para a frente em prancha ·
 * rabo erguido de leme com espuma · topete penteado pelo vento · rastro de espuma atrás.
 */
import { criatura, animsQuadrupede, blob, espuma, tufo, par, m, lz, ls, lp, qz, D2R, type V3 } from './kits';
import { corpoLontra } from './073-ariranhinha';
import { paletaLontra } from './075-lontrinha';

function build() {
  const { rig, ref } = corpoLontra({ k: 1.25, cabeca: [0.2, 0.17, 0.185], rabo: 0.85, ang: 30, barriga: true, tronco: [0.44, 0.2, 0.2] });
  rig.add('pescoco', blob([0.1, 0.12, 0.12], m(1), { pos: [0.11, 0.02, 0], seg: 12 }));
  rig.add('cabeca', blob([0.1, 0.055, 0.14], m(1), { pos: [0.12, -0.13, 0], seg: 10 }));
  rig.bones.cauda1.rotation.z = -44 * D2R; rig.bones.cauda3.rotation.z = -20 * D2R;
  // ONDA: lombada azul sob o corpo, crista de espuma na frente e rastro atrás (no osso base, não respira com o corpo)
  rig.bone('onda', 'base', [0, 0, 0]);
  rig.add('onda', blob([0.62, 0.14, 0.34], m(3), { pos: [0.02, 0.03, 0], seg: 22 }), blob([0.36, 0.1, 0.26], m.luz(3), { pos: [0.1, 0.1, 0], seg: 16 }), blob([0.5, 0.05, 0.3], m.sombra(3), { pos: [-0.1, 0.0, 0], seg: 16 }));
  const esp: [string, V3, number][] = [['crista1', [0.6, 0.12, 0.1], 0.1], ['crista2', [0.56, 0.16, -0.16], 0.085], ['rastro1', [-0.6, 0.08, 0.14], 0.085], ['rastro2', [-0.74, 0.06, -0.08], 0.06]];
  for (const [nome, pos, r] of esp) { rig.bone(nome, 'onda', pos); rig.add(nome, espuma(r, m.luz(3))); }
  // topete penteado pelo vento e pedrinha de colar
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.03, 0], [0, 0, 56]);
  rig.add('topete', tufo(3, 0.14, 0.055, m(0), { abre: 22 }));
  rig.add('pescoco', blob([0.055, 0.05, 0.055], m(3), { pos: [0.2, -0.04, 0], seg: 10 }), blob([0.022, 0.02, 0.022], m.luz(3), { pos: [0.23, -0.02, -0.02], seg: 6 }));
  par((_, s) => rig.add('cauda4', blob([0.05, 0.05, 0.03], m.luz(3), { pos: [-0.18, 0.02, 0.04 * s], seg: 8 })));
  return rig;
}

const sobe = (i: number) => { const v = [1, 1.2, 0.8, 1.1], y: V3[] = [[0, 0, 0], [0, 0.03, 0], [0, -0.01, 0], [0, 0.02, 0]]; return [...ls([...v.slice(i), ...v.slice(0, i)]), ...lp([...y.slice(i), ...y.slice(0, i)])]; };
const anims = animsQuadrupede({ u: 0.85, hPerna: 0.14, mole: 0.9, cauda: 0.4 }, {
  todas: { crista1: sobe(0), crista2: sobe(2), rastro1: sobe(1), rastro2: sobe(3) },
  idle: { topete: lz([0, 6, 12, 4]), onda: ls([1, [1.03, 0.94, 1.02], 1, [0.97, 1.06, 0.98]]) },
  especial: { topete: qz([0, 12, 18, -22, -8, 0]) },
  desmaio: { onda: [{ t: 0, s: 1, e: 'linear' }, { t: 1, s: [1.1, 0.3, 1.1], e: 'linear' }] },
});

export const lontraVeloz = criatura({
  num: 76, id: 'lontra-veloz', nome: 'Lontra-Veloz', porte: 'G', estagio: 'final', paleta: paletaLontra, build, anims,
  olho: { frente: ['.ppp.', 'pppwp', 'ppppp', 'pwppp', '.ppp.'], fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'], mapa: ['p', 'p'] },
});
