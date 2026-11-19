/**
 * 132 · JUBARTÃO (Rio/Geada) — jubarte cantora cujo canto traz o frio da Antártida e embaça as vidraças do farol. Estágio final.
 * Mantém da linha: couro azul-noite, barriga clara, calombos na cabeça, esguicho em "V".
 * Cresce: nadadeiras peitorais ENORMES e brancas de borda ondulada · PREGAS da garganta riscando a barriga ·
 * corcova com dorsal baixa · cauda larga erguida de borda de gelo · cristais de geada no dorso · esguicho de gelo ·
 * ondas do canto saindo da boca.
 */
import { criatura, aquatico, animsAquatico, blob, tube, ring, spike, par, m, ls, qs, qr, qz, type V3 } from './kits';
import { paletaBaleia, esguicho, animJato } from './131-baleiazinha';

const paleta = { ...paletaBaleia, rampas: [['#161c40', '#32447a', '#7c94c4'], paletaBaleia.rampas[1], paletaBaleia.rampas[2], paletaBaleia.rampas[3]] as [string, string, string][], extras: { ...paletaBaleia.extras, f: '#32447a' } };

function build() {
  const { rig, ref } = aquatico({
    tronco: [0.46, 0.33, 0.33], flutua: 0.62, ergue: 34,
    cabeca: { r: [0.36, 0.27, 0.3], x: 0.7, y: -0.02, gira: -14 },
    cauda: { len: 0.44, r0: 0.22, r1: 0.08, cai: 16 },
    lobos: { len: 0.36, larg: 0.26, abre: 50 },
    nad: { len: 0.6, larg: 0.22, esp: 0.04, x: 0.36, cai: 24, abre: 34 },
    dorsal: { alt: 0.11, base: 0.24, x: -0.42 },
    olho: { r: 0.034, pos: [0.08, -0.06, 0.28] },
    rampas: { pele: 0, barriga: 1, nad: 1 },
  });
  // queixo largo e claro, com as PREGAS da garganta (riscos escuros ao comprido)
  rig.add('cabeca', blob([0.32, 0.18, 0.28], m(1), { pos: [0.04, -0.15, 0], seg: 18 }));
  for (const z of [-0.2, -0.1, 0, 0.1, 0.2]) {
    rig.add('cabeca', tube([[0.3, -0.2, z * 0.7], [0.1, -0.3 + Math.abs(z) * 0.3, z * 1.1], [-0.16, -0.26 + Math.abs(z) * 0.3, z * 1.2]], 0.014, m.sombra(1), { seg: 8, radial: 5 }));
    rig.add('tronco', tube([[0.5, -0.27 + Math.abs(z) * 0.25, z * 1.1], [0.2, -0.3 + Math.abs(z) * 0.25, z * 1.25], [-0.1, -0.27 + Math.abs(z) * 0.25, z * 1.1]], 0.014, m.sombra(1), { seg: 8, radial: 5 }));
  }
  // linha da boca e calombos (tubérculos) no focinho
  par((l, s) => {
    rig.add('cabeca', tube([[0.35, -0.04, 0.03 * s], [0.2, -0.03, 0.25 * s], [0.0, -0.01, 0.3 * s], [-0.12, -0.08, 0.28 * s]], 0.02, m.sombra(0), { seg: 10, radial: 5 }));
    for (const [x, y, z] of [[0.26, 0.11, 0.08], [0.16, 0.18, 0.1], [0.3, 0.03, 0.04]] as const) rig.add('cabeca', blob([0.04, 0.035, 0.04], m.luz(0), { pos: [x, y, z * s], seg: 7 }));
    // borda ondulada das peitorais: nós brancos na aresta da frente e ponta com geada
    for (const y of [-0.16, -0.32, -0.46]) rig.add('nad_' + l, blob([0.05, 0.05, 0.035], m.luz(1), { pos: [0.065, y, 0], seg: 8 }));
    rig.add('nad_' + l, blob([0.07, 0.07, 0.04], m.luz(3), { pos: [-0.03, -0.56, 0], seg: 8 }));
    // borda de gelo nos lobos da cauda
    rig.add('lobo_' + l, blob([0.16, 0.03, 0.05], m.luz(3), { pos: [-0.3, 0.01, 0.06 * s], rot: [0, 20 * s, 0], seg: 8 }));
  });
  rig.add('cabeca', blob([0.05, 0.04, 0.05], m.luz(0), { pos: [0.31, 0.06, 0], seg: 7 }));
  // cristais de GEADA em fila pelo dorso
  const cr: [V3, number, number][] = [[[0.08, 0.3, 0], 0.22, 0], [[-0.1, 0.31, 0.07], 0.16, -14], [[-0.24, 0.28, -0.06], 0.19, 10], [[0.26, 0.26, -0.05], 0.14, 16]];
  cr.forEach(([pos, alt, g], i) => rig.add('tronco', spike(alt, alt * 0.3, i % 2 ? m(3) : m.luz(3), { pos, rot: [g, 0, g] })));
  esguicho(rig, 'cabeca', [ref.respiro[0] - 0.06, ref.respiro[1], 0], 1.3, m.luz(3));
  // ONDAS DO CANTO: três arcos saindo da boca
  [0.1, 0.19, 0.28].forEach((x, i) => { rig.bone('nota' + (i + 1), 'cabeca', [0.4 + x, -0.08, 0]); rig.add('nota' + (i + 1), ring(0.07 + i * 0.035, 0.018, m.plano(3), { rot: [0, 90, 0], arc: 150, pos: [0, 0, 0] })); });
  return rig;
}

const canta = (i: number) => { const v = [0.2, 0.7, 1.1, 1.3]; return ls([...v.slice(4 - i), ...v.slice(0, 4 - i)]); };
// animações contidas: o corpo empinado já enche a célula
const nd = (v: number[]) => ({ nad_d: qr(v.map((a) => [-a, 0, a * 0.4] as V3)), nad_e: qr(v.map((a) => [a, 0, a * 0.4] as V3)) });
const anims = animsAquatico({ u: 1, flutua: 0.62, mole: 0.8 }, {
  entrada: { tronco: qz([14, 5, -6, 2, 0]), cauda1: qz([-14, 10, 12, -4, 0]), cauda2: qz([-14, 14, 10, -5, 0]), ...nd([16, 4, 12, 3, 0]) },
  fisico: { tronco: qz([6, 10, -14, -6, 0]), ...nd([8, 14, -6, 0, 0]) },
  ...animJato,
  idle: { ...animJato.idle, nota1: canta(0), nota2: canta(1), nota3: canta(2) },
  especial: { ...animJato.especial, tronco: qz([-4, -8, -8, 10, 4, 0]), cauda1: qz([4, 10, 12, -12, -4, 0]), cauda2: qz([4, 12, 14, -14, -4, 0]), ...nd([4, 10, 12, 20, 8, 0]), nota1: qs([0.3, 0.5, 0.8, 1.6, 1.9, 1]), nota2: qs([0.2, 0.3, 0.6, 1.5, 2, 1]), nota3: qs([0.1, 0.2, 0.4, 1.4, 2.1, 1]) },
  desmaio: { ...animJato.desmaio, tronco: qr([[0, 0, 4], [8, 0, -8], [20, 0, -20], [34, 0, -32], [32, 0, -30]]), corpo: [{ t: 0, p: [0, 0, 0] }, { t: 0.5, p: [0, -0.1, 0] }, { t: 1, p: [0, -0.2, 0] }], ...nd([4, 8, 12, 16, 15]), nota1: qs([1, 0.6, 0.3, 0.1, 0.1]), nota2: qs([1, 0.5, 0.2, 0.1, 0.1]), nota3: qs([1, 0.4, 0.2, 0.1, 0.1]) },
  status: { ...animJato.status, nota1: ls([0.2, 0.3, 0.2, 0.1]), nota2: ls([0.1, 0.2, 0.3, 0.2]), nota3: ls([0.1, 0.1, 0.2, 0.1]) },
});

export const jubartao = criatura({
  num: 132, id: 'jubartao', nome: 'Jubartão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['..ppp', '.pppp', 'ppwpp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
