/**
 * 128 · ARUAZÃO (Rio/Pedra) — caramujo de concha-fortaleza: ameias, seteiras e uma porta que ninguém viu aberta. Estágio final.
 * Mantém da linha: corpo cinza-azulado, concha dourado-oliva em espiral, ovos cor-de-rosa, antenas compridas.
 * Cresce: TORRE de pedra com ameias no alto da concha · muralha de pedra com merlões na base · seteiras escuras ·
 * portão de pedra em arco (o opérculo) na boca da concha · papada e barbelas no pé.
 */
import { criatura, blob, lathe, roundBox, par, m, ls, lz, qz, type V3 } from './kits';
import { paletaArua, caramujo, animsCaramujo } from './127-arua';

const paleta = { ...paletaArua, rampas: [['#2c2a58', '#58648e', '#a2b4d2'], ['#603a24', '#ac7a2c', '#e8c868'], paletaArua.rampas[2], paletaArua.rampas[3]] as [string, string, string][], extras: { ...paletaArua.extras, f: '#58648e' } };

function build() {
  const { rig, centro: c } = caramujo({ pe: [0.46, 0.11, 0.25], cabeca: [0.17, 0.15, 0.16], antena: 0.24, concha: 0.33, larg: 0.23, olho: 0.03 });
  const R = 0.33;
  // TORRE no alto: tambor de pedra, parapeito e quatro ameias; seteira escura na frente
  rig.bone('torre', 'concha', [c[0] - 0.06, c[1] + R * 0.8, 0], [0, 0, -12]);
  rig.add('torre', lathe([[0.15, -0.06], [0.14, 0.2], [0.18, 0.22], [0.18, 0.28], [0.001, 0.28]], m(2), { seg: 12 }));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.5; rig.add('torre', roundBox([0.09, 0.09, 0.09], 0.015, i % 2 ? m.luz(2) : m(2), { pos: [Math.cos(a) * 0.15, 0.32, Math.sin(a) * 0.15], rot: [0, -a * 180 / Math.PI, 0] })); }
  for (const a of [-0.9, 0.9]) rig.add('torre', blob([0.03, 0.06, 0.03], m.sombra(2), { pos: [Math.cos(a) * 0.14, 0.1, Math.sin(a) * 0.14], seg: 8, castShadow: false }));
  // MURALHA: merlões de pedra pelo dorso da volta maior
  for (const g of [-70, -35, 35, 70, 105]) { const a = (g + 90) * Math.PI / 180; rig.add('concha', roundBox([0.11, 0.1, 0.2], 0.02, g % 2 ? m(2) : m.luz(2), { pos: [c[0] + Math.cos(a) * R * 1.02, c[1] + Math.sin(a) * R * 1.02, 0], rot: [0, 0, g] })); }
  // seteiras escuras nas duas faces e tijolos soltos de pedra
  par((_, s) => {
    for (const [x, y] of [[0.2, 0.14], [-0.22, 0.1]] as const) rig.add('concha', blob([0.035, 0.07, 0.03], m.sombra(1), { pos: [c[0] + x, c[1] + y, 0.19 * s], seg: 8, castShadow: false }));
    rig.add('concha', roundBox([0.1, 0.07, 0.05], 0.015, m(2), { pos: [c[0] - 0.02, c[1] - 0.26, 0.19 * s] }), roundBox([0.09, 0.07, 0.05], 0.015, m.luz(2), { pos: [c[0] + 0.14, c[1] - 0.2, 0.2 * s] }));
    // barbelas no pé
    rig.add('corpo', blob([0.06, 0.05, 0.05], m.luz(0), { pos: [0.2, -0.02, 0.24 * s], seg: 8 }), blob([0.06, 0.05, 0.05], m.luz(0), { pos: [-0.08, -0.02, 0.26 * s], seg: 8 }));
  });
  // PORTÃO: opérculo de pedra em arco, com tranca
  rig.add('concha', blob([0.07, 0.19, 0.17], m(2), { pos: [c[0] + R * 0.95, c[1] - R * 0.46, 0], rot: [0, 0, 24], seg: 14 }), blob([0.05, 0.03, 0.18], m.sombra(2), { pos: [c[0] + R * 1.08, c[1] - R * 0.5, 0], rot: [0, 0, 24], seg: 8, castShadow: false }));
  // ovos cor-de-rosa aninhados ao pé da torre
  rig.bone('ovos', 'concha', [c[0] + 0.14, c[1] + R * 0.86, 0.0]);
  const ov: V3[] = [[0, 0, 0.06], [0.05, -0.02, -0.03], [0.0, 0.04, -0.01], [0.07, -0.05, 0.07], [0.06, -0.06, -0.1]];
  ov.forEach((pos, i) => rig.add('ovos', blob([0.05, 0.05, 0.05], i % 2 ? m.luz(3) : m(3), { pos, seg: 10 })));
  // sobrancelhas pesadas
  par((_, s) => rig.add('cabeca', blob([0.07, 0.035, 0.06], m.sombra(0), { pos: [0.15, 0.115, 0.1 * s], rot: [0, 0, -24], seg: 8 })));
  return rig;
}

const anims = animsCaramujo({ u: 0.9, mole: 0.5 }, {
  idle: { ovos: ls([1, 1.03, 1.06, 1.02]), torre: lz([0, 1, 2, 1]) },
  fisico: { torre: qz([4, 8, -10, -4, 0]) },
});

export const aruazao = criatura({
  num: 128, id: 'aruazao', nome: 'Aruazão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
