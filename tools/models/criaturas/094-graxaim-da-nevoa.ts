/**
 * 094 · GRAXAIM-DA-NÉVOA (Assombro) — graxaim feito de neblina: quem o segue no campo nunca mais acha o caminho. Estágio final.
 * Mantém da linha: silhueta de raposa esguia, orelhas pontudas, bochechas creme, lombo escuro, a névoa azulada.
 * Cresce: pelo azul-cinza de fantasma · PERNAS que se desfazem em neblina (não tocam o chão) · rabo aberto em três
 * plumas de névoa · juba de fumaça no pescoço · olhos acesos sem pupila · banco de neblina aos pés.
 */
import { criatura, animsQuadrupede, blob, chama, par, m, lz, ls, qs, type V3 } from './kits';
import { paletaGraxaim, corpoGraxaim, nevoa, nevoaAnda } from './093-graxaim';

const paleta = { ...paletaGraxaim, extras: { w: '#ffffff', p: '#f0f8ff', f: '#6a7696', a: '#a8c0f0' },
  rampas: [['#2e3050', '#6a7696', '#b4c0d4'], paletaGraxaim.rampas[1], paletaGraxaim.rampas[2], paletaGraxaim.rampas[3]] as [string, string, string][] }; // 0 pelo de fantasma

function build() {
  const { rig, ref } = corpoGraxaim({ k: 1.4, cabeca: [0.2, 0.18, 0.18], rabo: 0.5, nevoa: true });
  // três plumas de névoa no lugar do rabo
  const plumas: [string, number, number, number][] = [['pluma1', 60, 0, 0.46], ['pluma2', 96, 26, 0.38], ['pluma3', 100, -26, 0.38]];
  for (const [nome, tz, ty, alt] of plumas) { rig.bone(nome, 'cauda2', [-0.1, 0, 0], [0, ty, tz - 60]); rig.add(nome, chama(alt, alt * 0.3, m(3), { curva: 30, rot: [0, 0, 60] }), chama(alt * 0.6, alt * 0.18, m.luz(3), { curva: 30, rot: [0, 0, 60], scale: [1, 1, 1.9] })); }
  // juba de fumaça e sobrancelha
  rig.bone('juba', 'pescoco', [-0.06, 0.1, 0], [0, 0, 30]);
  for (const [z, t] of [[0, 0], [0.09, 20], [-0.09, 20]] as const) rig.add('juba', chama(0.24, 0.07, m(3), { pos: [0, 0, z], rot: [z * 200, 0, t], curva: 20 }));
  par((_, s) => rig.add('cabeca', blob([0.07, 0.022, 0.05], m(2), { pos: [0.16, 0.11, 0.1 * s], rot: [-20 * s, 0, -22], seg: 8 })));
  // banco de neblina: quatro flocos onde as patas somem + dois soltos
  const nv: [string, V3, number][] = [['nevoa1', [0.24, 0.07, 0.14], 0.11], ['nevoa2', [0.2, 0.06, -0.14], 0.1], ['nevoa3', [-0.22, 0.07, 0.14], 0.11], ['nevoa4', [-0.26, 0.06, -0.14], 0.1], ['nevoa5', [0.5, 0.05, 0.0], 0.07], ['nevoa6', [-0.54, 0.05, 0.04], 0.08]];
  for (const [nome, pos, r] of nv) nevoa(rig, nome, 'base', pos, r);
  void ref;
  return rig;
}

const onda = (i: number) => { const v = [0, 6, 12, 4]; return lz([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsQuadrupede({ u: 0.95, hPerna: 0.2, mole: 0.9, flutua: 0.06 }, {
  todas: { ...nevoaAnda(['nevoa1', 'nevoa2', 'nevoa3', 'nevoa4', 'nevoa5', 'nevoa6']), pluma1: onda(0), pluma2: onda(1), pluma3: onda(3) },
  idle: { juba: ls([1, 1.06, 1.14, 1.05]) },
  especial: { juba: qs([1, 1.2, 1.4, 1.8, 1.3, 1]) },
});

export const graxaimDaNevoa = criatura({
  num: 94, id: 'graxaim-da-nevoa', nome: 'Graxaim-da-Névoa', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: { frente: ['aa...', 'awaa.', '.awwa', '.awwa', '..aa.'], fechado: ['fffff', 'fffff', 'afffa', 'faaaf', 'fffff'], mapa: ['w', 'a'] },
});
