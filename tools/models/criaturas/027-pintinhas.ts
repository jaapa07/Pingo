/**
 * 027 · PINTINHAS (Inseto/Encanto) — joaninha brasileira multicolor. Não evolui.
 * Traços únicos: cúpula vermelha com pintas de TRÊS cores (azul, amarela, branca) e uma em coração rosa ·
 * escudo escuro com duas "bochechas" brancas · antenas de bolinha rosa · asinhas de véu rosado espiando
 * por baixo dos élitros · três confetes encantados orbitando.
 */
import { criatura, inseto, animsInseto, blob, par, m, lp, ls, lz, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#8a1f44', '#e23a3c', '#ff8a5c'], // 0 élitros vermelho-coral
    ['#241a32', '#42304c', '#6c5672'], // 1 corpo e patas (berinjela)
    ['#2f9ae0', '#ffd23a', '#fff8e4'], // 2 trio chapado das pintas: azul · amarelo · branco
    ['#a8468e', '#f07cc2', '#ffc6e6'], // 3 rosa encantado (coração, antenas, véu)
  ] as [string, string, string][],
  contorno: '#2a1430',
  extras: { w: '#ffffff', p: '#1c1226', f: '#42304c' },
};

function build() {
  const A: V3 = [0.27, 0.27, 0.27];
  const { rig } = inseto({
    torax: [0.15, 0.15, 0.19], abdomen: A, cabeca: [0.14, 0.14, 0.17], alt: 0.13, caiAbdomen: 0,
    patas: { abre: 0.17, r: 0.04, joelho: 0.02 }, antenas: { len: 0.17, r: 0.018, abre: 36, bola: 0.04 }, elitros: true,
    olho: { r: 0.038, pos: [0.15, 0.02, 0.115] },
    rampas: { torax: 1, abdomen: 0, cabeca: 1, patas: 1, antenas: 3, elitros: 0 }, // abdômen vermelho: a fresta entre os élitros não vira uma risca escura (lê como cúpula de joaninha)
  });
  // bochechas brancas no escudo e na cabeça
  par((_, s) => {
    rig.add('corpo', blob([0.06, 0.07, 0.05], m.luz(2), { pos: [0.08, 0.07, 0.14 * s], seg: 12 }));
  });
  // pintas: bolhas chapadas sobre a casca do élitro (centro e semi-eixos iguais aos do kit)
  const E: V3 = [A[0] * 1.08, A[1] * 0.9, A[2] * 0.6];
  const pintas: [number, number, number, 'sombra' | 'plano' | 'luz' | 'rosa'][] = [
    // [ângulo ao longo do corpo, elevação, raio, cor]
    [40, 44, 0.075, 'plano'], [100, 20, 0.08, 'sombra'], [152, 44, 0.07, 'luz'], [96, 66, 0.07, 'rosa'],
  ];
  par((l, s) => {
    for (const [u, v, r, c] of pintas) {
      const cu = Math.cos((u * Math.PI) / 180), su = Math.sin((u * Math.PI) / 180), cv = Math.cos((v * Math.PI) / 180), sv = Math.sin((v * Math.PI) / 180);
      const pos: V3 = [-A[0] * 0.95 + E[0] * cu * cv, -A[1] * 0.25 + E[1] * sv, (A[2] * 0.42 + E[2] * su * cv * 0.98) * s];
      const mat = c === 'rosa' ? m.plano(3) : c === 'sombra' ? m.sombra(2) : c === 'luz' ? m.luz(2) : m.plano(2);
      rig.add('elitro_' + l, blob([r, r, r], mat, { pos, seg: 12, castShadow: false }));
      if (c === 'rosa') rig.add('elitro_' + l, blob([r * 0.75, r * 0.75, r * 0.75], mat, { pos: [pos[0] - 0.05, pos[1] - 0.02, pos[2]], seg: 10, castShadow: false })); // segundo lóbulo do coração
    }
    // véu rosado espiando atrás
    rig.add('abdomen', blob([0.12, 0.02, 0.08], m.luz(3), { pos: [-0.44, -0.06, 0.09 * s], rot: [0, 20 * s, -14], seg: 12, castShadow: false }));
  });
  // confetes encantados
  const conf: [string, V3, number, number][] = [['conf1', [0.2, 0.36, -0.3], 0.045, 3], ['conf2', [-0.3, 0.42, 0.2], 0.04, 2], ['conf3', [-0.5, 0.2, -0.28], 0.04, 3]];
  for (const [nome, pos, r, rp] of conf) { rig.bone(nome, 'corpo', pos); rig.add(nome, blob([r, r, r], rp === 2 ? m.plano(2) : m.luz(3), { seg: 10 })); }
  return rig;
}

const sobe = (a: number): V3[] => [[0, 0, 0], [0, a, 0], [0, a * 1.6, 0], [0, a * 0.6, 0]];
const pisca = (i: number) => { const v = [1, 1.3, 0.7, 1.1]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsInseto({ u: 0.55, alt: 0.2, mole: 1.2, mapa: { comp: 0.9, larg: 1.1, cabeca: 1.15 } }, {
  todas: { conf1: pisca(0), conf2: pisca(1), conf3: pisca(2) },
  idle: { conf1: [...pisca(0), ...lp(sobe(0.04))], conf2: [...pisca(1), ...lp(sobe(-0.03))], conf3: [...pisca(2), ...lp(sobe(0.03))], abdomen: lz([0, -2, -3, -1]) },
});

export const pintinhas = criatura({
  num: 27, id: 'pintinhas', nome: 'Pintinhas', porte: 'P', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.ww.', 'wwpw', 'wppw', 'wppw', '.ww.'],
    fechado: ['ffff', 'ffff', 'wffw', '.ww.', 'ffff'],
    mapa: ['w', 'p'],
  },
});
