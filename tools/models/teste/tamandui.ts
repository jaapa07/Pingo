/** Modelo de validação do pipeline (vira o Tamanduí definitivo nas mãos do agente de criaturas). */
import { Rig, blob, limb, lathe, tube, slab, olho, tom } from '../../render/sculpt';
import type { PixModel } from '../../render/types';
import type { AnimSet } from '../../render/anim';

function build() {
  const r = new Rig('root');
  const pelo = tom(0), claro = tom(1), folha = tom(2), escuro = tom(3);
  r.bone('corpo', 'root', [0, 0.42, 0]);
  r.bone('cabeca', 'corpo', [0.3, 0.18, 0]);
  r.bone('cauda', 'corpo', [-0.34, 0.08, 0], [0, 0, 30]);
  r.add('corpo', blob([0.4, 0.3, 0.28], pelo), blob([0.28, 0.2, 0.22], claro, { pos: [0.08, -0.1, 0] }),
    blob([0.1, 0.3, 0.3], escuro, { pos: [0.05, 0.02, 0], rot: [0, 0, -30] }));
  r.add('cabeca', blob([0.2, 0.17, 0.17], pelo), lathe([[0.09, 0], [0.07, 0.15], [0.045, 0.3], [0.001, 0.33]], claro, { rot: [0, 0, -100], pos: [0.12, -0.02, 0] }),
    blob([0.035, 0.03, 0.03], escuro, { pos: [0.45, -0.1, 0] }),
    olho('D', 0.045, [0.1, 0.05, 0.13]), olho('E', 0.045, [0.1, 0.05, -0.13]),
    slab([[0, 0], [0.07, 0.03], [0.06, 0.1], [0, 0.08]], 0.03, escuro, { pos: [-0.08, 0.12, 0.1] }), slab([[0, 0], [0.07, 0.03], [0.06, 0.1], [0, 0.08]], 0.03, escuro, { pos: [-0.08, 0.12, -0.1] }),
    // folhinha na testa
    slab([[0, 0], [0.1, 0.06], [0.2, 0.02], [0.1, -0.05]], 0.02, folha, { pos: [-0.02, 0.15, 0], rot: [0, 0, 50] }));
  r.add('cauda', blob([0.3, 0.2, 0.1], folha, { pos: [-0.2, 0.05, 0] }), tube([[0, 0, 0], [-0.25, 0.08, 0], [-0.45, 0.2, 0]], (t) => 0.06 * (1 - t) + 0.02, folha));
  for (const [n, x, z] of [['pfd', 0.2, 0.14], ['pfe', 0.2, -0.14], ['ptd', -0.2, 0.14], ['pte', -0.2, -0.14]] as const) {
    r.bone(n, 'corpo', [x, -0.12, z]);
    r.add(n, limb(0.28, 0.08, 0.07, n.startsWith('pf') ? claro : pelo), blob([0.09, 0.04, 0.07], escuro, { pos: [0.03, -0.3, 0] }));
  }
  return r;
}
const z = (t: number, v: number) => ({ t, r: [0, 0, v] as [number, number, number] });
const idle: AnimSet[string] = { frames: 4, fps: 5, keys: { corpo: [{ t: 0, p: [0, 0, 0] }, { t: 0.5, p: [0, -0.02, 0] }, { t: 1, p: [0, 0, 0] }], cauda: [z(0, 0), z(0.5, 10), z(1, 0)], cabeca: [z(0, 0), z(0.5, -4), z(1, 0)] } };
const andar: AnimSet[string] = { frames: 4, fps: 8, keys: { pfd: [z(0, 25), z(0.5, -25), z(1, 25)], pte: [z(0, 25), z(0.5, -25), z(1, 25)], pfe: [z(0, -25), z(0.5, 25), z(1, -25)], ptd: [z(0, -25), z(0.5, 25), z(1, -25)] } };

export const tamanduiTeste: PixModel = {
  id: 'teste-tamandui', categoria: 'criatura',
  paleta: { rampas: [['#6b5340', '#96785a', '#c2a37c'], ['#b89e78', '#e6d2aa', '#fff4d6'], ['#2a6b34', '#48a04a', '#8fd45e'], ['#2b2330', '#453a4a', '#6b5a6e']], contorno: '#231a2b' },
  build,
  vistas: {
    frente: { cell: [64, 64], pivot: [32, 56], altura: 1.5, yaw: -50, pitch: 12, anims: { idle }, olho: ['kk', 'wk'], olhoFechado: ['kk'] },
    costas: { cell: [64, 64], pivot: [30, 58], altura: 1.3, yaw: 140, pitch: 22, anims: { idle } },
    mapa: { cell: [24, 24], pivot: [12, 21], altura: 1.9, yaw: 0, pitch: 40, anims: { 'andar-s': { ...andar, yaw: 0 }, 'andar-l': { ...andar, yaw: 90 }, 'andar-n': { ...andar, yaw: 180 }, 'andar-o': { ...andar, yaw: -90 } }, olho: ['k'] },
  },
};
