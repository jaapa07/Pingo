/**
 * 008 · BOTOROSA (Rio) — boto jovem, já cor-de-rosa, com nadadeiras de espuma.
 * Mantém do Botinho: gota azul na testa, bochechas, anel de bolhas na cauda, manto lilás (agora só no dorso).
 * Cresce: peitorais e lobos da cauda viraram espuma batida · gola de espuma no pescoço ·
 * bico mais longo · crista dorsal lilás em onda.
 */
import { criatura, aquatico, animsAquatico, blob, calota, espuma, par, m, type V3 } from './kits';
import { paletaBoto, borbulha } from './007-botinho';

function build() {
  const { rig, ref } = aquatico({
    tronco: [0.29, 0.2, 0.185], flutua: 0.6, ergue: 52,
    cabeca: { r: [0.2, 0.19, 0.18], x: 0.8, y: 0.1, gira: -44 },
    rostro: { len: 0.36, r0: 0.05, r1: 0.03, cai: 12, y: -0.52 },
    cauda: { len: 0.34, r0: 0.125, r1: 0.055, cai: -12 },
    lobos: { len: 0.24, larg: 0.18, abre: 50 },
    nad: { len: 0.26, larg: 0.15, x: 0.36, cai: 50, abre: 54 },
    dorsal: { alt: 0.1, base: 0.26, x: -0.2 },
    olho: { r: 0.024, pos: [0.1, -0.03, 0.148] },
    rampas: { pele: 1, cabeca: 1, rostro: 1, cauda: 1, lobos: 2, nad: 2, dorsal: 0 },
  });
  // manto lilás do filhote, agora só no dorso e no alto do melão
  rig.add('tronco', calota([0.3, 0.21, 0.195], m(0), { de: 0, ate: 62, pos: [-0.02, 0, 0] }));
  rig.add('cabeca', calota([0.205, 0.197, 0.186], m(0), { de: 0, ate: 50, rot: [0, 0, 20] }));
  rig.add('cauda1', calota([0.2, 0.125, 0.12], m(0), { de: 0, ate: 70, pos: [-0.06, 0.01, 0] }));
  // gota azul e bochechas
  rig.add('cabeca', blob([0.055, 0.07, 0.055], m.plano(3), { pos: [ref.melao[0] + 0.075, ref.melao[1] - 0.065, 0], rot: [0, 0, -45], seg: 12 }),
    blob([0.022, 0.022, 0.022], m.luz(2), { pos: [ref.melao[0] + 0.105, ref.melao[1] - 0.05, 0.02], seg: 8 }));
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.03], m.sombra(1), { pos: [0.1, -0.09, 0.155 * s], seg: 10 })));
  // nadadeiras de espuma: flocos na ponta dos remos e dos lobos
  par((l) => {
    rig.add('nad_' + l, espuma(0.07, m.luz(2), { pos: [-0.03, -0.23, 0] }), espuma(0.05, m.luz(2), { pos: [0.05, -0.12, 0] }));
    rig.add('lobo_' + l, espuma(0.065, m.luz(2), { pos: [-0.2, 0, 0] }));
  });
  // gola de espuma (5 flocos em volta do pescoço) e anel de bolhas na cauda
  const gola: [number, number, number][] = [[0.0, 0.17, 0], [0.02, 0.08, 0.16], [0.02, 0.08, -0.16], [0.04, -0.1, 0.13], [0.04, -0.1, -0.13]];
  gola.forEach(([x, y, z], i) => { rig.bone('gola' + (i + 1), 'tronco', [0.17 + x, y, z]); rig.add('gola' + (i + 1), espuma(0.062, m.luz(2))); });
  const flocos: [string, V3, number][] = [['bolha1', [-0.02, 0.075, 0.075], 0.055], ['bolha2', [-0.03, 0.065, -0.085], 0.05], ['bolha3', [-0.04, -0.075, 0.0], 0.055]];
  for (const [nome, pos, r] of flocos) { rig.bone(nome, 'cauda2', pos); rig.add(nome, espuma(r, m.luz(2))); }
  return rig;
}

const anims = animsAquatico({ u: 0.95, flutua: 0.12, mole: 1.0 }, { todas: borbulha(['bolha1', 'bolha2', 'bolha3', 'gola1', 'gola2', 'gola3', 'gola4', 'gola5']) });

export const botorosa = criatura({
  num: 8, id: 'botorosa', nome: 'Botorosa', porte: 'M', estagio: 'medio', paleta: paletaBoto, build, anims,
  olho: {
    frente: ['.pp.', 'ppwp', 'pppp', 'pppp', '.pp.'],
    fechado: ['rrrr', 'rrrr', 'prrp', '.pp.', 'rrrr'],
    mapa: ['p', 'p'],
  },
});
