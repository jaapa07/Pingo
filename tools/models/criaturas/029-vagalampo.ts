/**
 * 029 · VAGALAMPO (Inseto/Trovão) — pirilampo-lanterna elétrico. Estágio final.
 * Mantém da linha: azul-noite, laranja, luz verde-limão, escudo em aba, antenas em raio.
 * Cresce: abdômen virou LAMPIÃO (gaiola de três aros escuros com a luz por dentro e alça) ·
 * dois "faróis" acesos no escudo (como o pirilampo de verdade) · élitros abertos em capa ·
 * três faíscas em raio orbitando · antenas-raio compridas.
 */
import { criatura, inseto, animsInseto, blob, calota, ring, lathe, par, m, ls, qs, lz, qz, lp, type V3 } from './kits';
import { paletaVaga, raio } from './028-vagalumim';

function build() {
  const { rig } = inseto({
    torax: [0.19, 0.17, 0.18], abdomen: [0.16, 0.13, 0.14], cabeca: [0.15, 0.14, 0.16], alt: 0.2, flutua: 0.4, caiAbdomen: 44,
    patas: { abre: 0.14, r: 0.03 }, elitros: true, asas: { len: 0.5, larg: 0.26, pares: 2 },
    olho: { r: 0.034, pos: [0.15, 0.0, 0.115] },
    rampas: { torax: 1, abdomen: 0, cabeca: 0, patas: 0, elitros: 0, asas: 3 },
  });
  // escudo em aba com os dois FARÓIS
  rig.add('corpo', calota([0.26, 0.19, 0.24], m(1), { de: 0, ate: 82, pos: [0.08, 0.0, 0], rot: [0, 0, -38] }));
  par((l, s) => {
    rig.bone('farol_' + l, 'corpo', [0.14, 0.15, 0.13 * s]);
    rig.add('farol_' + l, blob([0.065, 0.06, 0.065], m.plano(2), { seg: 12 }), blob([0.03, 0.03, 0.03], m.luz(2), { pos: [0.02, 0.03, 0], seg: 8 }));
    // élitros abertos em capa, com borda laranja
    rig.bones['elitro_' + l].rotation.set(-0.35 * s, 0.5 * s, 0.25);
    rig.add('elitro_' + l, blob([0.17, 0.03, 0.035], m.plano(1), { pos: [-0.15, -0.02, 0.15 * s], seg: 12, castShadow: false }));
    rig.bone('antena_' + l, 'cabeca', [0.11, 0.11, 0.07 * s], [-22 * s, 0, -30]);
    rig.add('antena_' + l, raio(0.34, m.plano(2), 0.04));
  });
  // LAMPIÃO: luz em gota dentro de três aros, tampa e fundo escuros, alça
  rig.bone('lanterna', 'abdomen', [-0.4, 0, 0], [0, 0, -44]);
  rig.add('lanterna',
    lathe([[0.001, -0.22], [0.13, -0.18], [0.2, -0.04], [0.19, 0.1], [0.11, 0.2], [0.001, 0.23]], m.plano(2), { seg: 20 }),
    blob([0.1, 0.12, 0.1], m.luz(2), { pos: [0, -0.02, 0], seg: 12 }));
  rig.add('lanterna',
    ring(0.205, 0.04, m(0), { pos: [0, 0.03, 0], rot: [90, 0, 0] }), ring(0.15, 0.04, m(0), { pos: [0, 0.17, 0], rot: [90, 0, 0] }), ring(0.16, 0.04, m(0), { pos: [0, -0.14, 0], rot: [90, 0, 0] }),
    blob([0.1, 0.06, 0.1], m(1), { pos: [0, -0.23, 0], seg: 12 }), blob([0.09, 0.05, 0.09], m(1), { pos: [0, 0.23, 0], seg: 12 }));
  // faíscas orbitando
  // (mais grossas e mais perto do corpo: finas e longe, viravam riscos soltos e encolhiam o sprite na célula)
  const fa: [string, V3, number, number][] = [['faisca1', [0.28, 0.36, -0.24], 0.24, 20], ['faisca2', [-0.34, 0.36, 0.24], 0.22, -30], ['faisca3', [-0.06, 0.52, -0.22], 0.2, 160]];
  for (const [nome, pos, alt, rz] of fa) { rig.bone(nome, 'corpo', pos, [0, 0, rz]); rig.add(nome, raio(alt, m.plano(2), 0.06)); rig.bones[nome].scale.set(1.8, 1, 1); }
  return rig;
}

const pisca = (i: number) => { const v = [1, 1.35, 0.6, 1.15]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const sobe = (a: number): V3[] => [[0, 0, 0], [0, a, 0], [0, a * 1.6, 0], [0, a * 0.6, 0]];
const anims = animsInseto({ u: 0.9, alt: 0.2, flutua: 0.4, asas: true, mole: 0.8 }, {
  todas: { lanterna: ls([1, 1.06, 1.12, 1.04]), farol_d: pisca(0), farol_e: pisca(2), faisca1: pisca(0), faisca2: pisca(1), faisca3: pisca(3) },
  idle: { abdomen: lz([0, 3, 6, 2]), faisca1: [...pisca(0), ...lp(sobe(0.04))], faisca2: [...pisca(1), ...lp(sobe(-0.03))] },
  especial: { lanterna: qs([1, 0.85, 0.75, 1.4, 1.2, 1]), farol_d: qs([1, 0.7, 0.6, 1.8, 1.3, 1]), farol_e: qs([1, 0.7, 0.6, 1.8, 1.3, 1]), abdomen: qz([4, 10, 12, -26, -8, 0]) },
  dano: { lanterna: qs([0.7, 0.85, 1]) },
  desmaio: { lanterna: qs([1, 0.9, 0.75, 0.6, 0.6]), farol_d: qs([1, 0.8, 0.5, 0.3, 0.3]), farol_e: qs([1, 0.8, 0.5, 0.3, 0.3]) },
});

export const vagalampo = criatura({
  num: 29, id: 'vagalampo', nome: 'Vagalampo', porte: 'M', estagio: 'final', paleta: paletaVaga, build, anims,
  olho: {
    frente: ['wwww.', 'wwppw', 'wappw', '.www.'],
    fechado: ['fffff', 'wfffw', '.www.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
