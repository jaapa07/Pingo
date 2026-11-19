/**
 * 116 · PORAQUÊ (Rio/Trovão) — peixe-elétrico enrolado em espiral, uma bobina viva. Estágio final.
 * Mantém da linha: couro cinza-azeitona de papo laranja, cabeça chata, pilhas amarelas no lombo.
 * Cresce: corpo comprido enrolado em ESPIRAL de bobina · fileira de pilhas por toda a espiral ·
 * crista de raios na nuca e raio grande na cauda · faíscas azuladas saltando em volta · barbatana laranja.
 */
import { criatura, serpente, animsSerpente, blob, m, lz, qs, qz, lp, type V3 } from './kits';
import { paletaPoraque, raio, pisca } from './115-poraquim';

const N = 13, SOBE = 0.045;
function build() {
  const { rig, ref } = serpente({
    r: 0.14,
    pescoco: { segs: 4, len: 0.17, curva: [50, 30, 4, -14], rFim: 0.14 },
    cauda: { segs: N, len: 0.24, curva: Array.from({ length: N }, () => 56), rFim: 0.11 },
    cabeca: [0.23, 0.15, 0.2],
    olho: { r: 0.026, pos: [0.2, 0.075, 0.15] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  // a bobina sobe: cada volta fica um pouco acima da anterior
  rig.bones.corpo.position.y += SOBE * (N - 1);
  for (let i = 2; i <= N; i++) rig.bones['cauda' + i].position.y = -SOBE;
  // pilhas em toda a espiral e no pescoço
  const nomes: string[] = [];
  const poe = (nome: string, osso: string, pos: V3, k = 1) => { nomes.push(nome); rig.bone(nome, osso, pos); rig.add(nome, blob([0.06 * k, 0.045 * k, 0.06 * k], m.plano(2), { seg: 12 }), blob([0.03 * k, 0.025 * k, 0.03 * k], m.luz(2), { pos: [0, 0.03 * k, 0], seg: 8 })); };
  poe('pilha_p2', 'pescoco2', [0.1, 0.14, 0]); poe('pilha_p3', 'pescoco3', [0.1, 0.135, 0]);
  for (let i = 1; i <= N; i += 2) poe('pilha_c' + i, 'cauda' + i, [-0.12, 0.03, -0.14], 0.95);
  // crista de raios na nuca (osso próprio)
  rig.bone('crista', 'cabeca', [ref.nuca[0] + 0.06, ref.nuca[1] + 0.02, 0], [0, 0, 24]);
  rig.add('crista', raio(0.34, 0.2, m.plano(2)), raio(0.24, 0.16, m.plano(2), { pos: [-0.1, -0.05, 0], rot: [0, 0, 40] }));
  // raio grande na ponta da cauda, apontando para cima do meio da bobina
  rig.bone('faisca', 'cauda' + N, [-0.26, 0, 0], [0, 0, 70]);
  rig.add('faisca', raio(0.4, 0.24, m.plano(2)), blob([0.07, 0.07, 0.07], m.luz(2), { seg: 10 }));
  // faíscas azuladas soltas
  const fs: [string, V3, V3][] = [['solta1', [0.5, 0.75, 0.3], [0, 0, -30]], ['solta2', [-0.45, 0.6, -0.3], [0, 0, 40]], ['solta3', [0.3, 0.2, 0.7], [0, 0, 150]]];
  for (const [nome, pos, rot] of fs) { rig.bone(nome, 'corpo', pos, rot); rig.add(nome, raio(0.22, 0.15, m.plano(3))); }
  // barbelas e focinho laranja
  rig.add('cabeca', blob([0.07, 0.045, 0.18], m.plano(1), { pos: [0.14, -0.04, 0], seg: 10 }));
  // sobrancelha
  for (const s of [1, -1]) rig.add('cabeca', blob([0.09, 0.025, 0.03], m.sombra(0), { pos: [0.2, 0.13, 0.13 * s], rot: [0, 0, -18], seg: 8 }));
  return rig;
}

const todasPilhas = ['pilha_p2', 'pilha_p3', ...Array.from({ length: (N + 1) / 2 }, (_, i) => 'pilha_c' + (i * 2 + 1))];
const estouro = Object.fromEntries(todasPilhas.map((p) => [p, qs([1, 1.3, 1.6, 2, 1.3, 1])]));
const anims = animsSerpente({ u: 0.9, pescoco: 4, cauda: N, mole: 0.6, mapa: { comp: 0.9, larg: 1 } }, {
  todas: pisca(todasPilhas),
  idle: { faisca: lz([0, 8, -6, 4]), crista: lz([0, 5, 9, 2]), solta1: lp([[0, 0, 0], [0.04, 0.05, 0], [0, 0.08, 0], [-0.03, 0.03, 0]]), solta2: lp([[0, 0, 0], [-0.04, 0.04, 0], [0, 0.07, 0], [0.03, 0.02, 0]]), solta3: lp([[0, 0.05, 0], [0, 0, 0], [0.03, -0.03, 0], [0, 0.02, 0]]) },
  especial: { ...estouro, faisca: qs([1, 1.1, 1.2, 1.4, 1.2, 1]), crista: qz([0, 10, 14, -20, -6, 0]), solta1: qs([1, 0.6, 1.2, 1.5, 1.2, 1]), solta2: qs([1, 1.2, 0.6, 1.5, 1.2, 1]), solta3: qs([1, 0.6, 1.2, 1.5, 1.2, 1]) },
  dano: { crista: qz([20, 8, 0]) },
  desmaio: { solta1: qs([1, 0.7, 0.4, 0.01, 0.01]), solta2: qs([1, 0.7, 0.4, 0.01, 0.01]), solta3: qs([1, 0.7, 0.4, 0.01, 0.01]), faisca: qs([1, 0.8, 0.6, 0.4, 0.4]) },
});

export const poraque = criatura({
  num: 116, id: 'poraque', nome: 'Poraquê', porte: 'G', estagio: 'final', paleta: paletaPoraque, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.pwpp', '.pppp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
