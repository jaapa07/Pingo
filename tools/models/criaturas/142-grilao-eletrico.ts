/**
 * 142 · GRILÃO-ELÉTRICO (Inseto/Trovão) — grilo de asas-capacitor que acende sozinho os postes da Usina. Estágio final.
 * Mantém da linha: castanho-dourado, escudo escuro, pás creme, coxas de saltador, cercos, faíscas em raio.
 * Cresce: ASAS-CAPACITOR erguidas em duas placas com lâminas amarelas e escuras alternadas · ARCO elétrico saltando
 * entre as pontas das asas · antenas em raio · espinhos nas coxas · peitoral amarelo.
 */
import { criatura, animsInseto, blob, roundBox, spike, par, m, ls, qs, lz, qz, type V3 } from './kits';
import { paletaGrilo, grilo, raioGrilo, piscaGrilo } from './141-grilinho';

const paleta = { ...paletaGrilo, rampas: [['#623230', '#a86a3a', '#e6b068'], paletaGrilo.rampas[1], paletaGrilo.rampas[2], paletaGrilo.rampas[3]] as [string, string, string][], extras: { ...paletaGrilo.extras, f: '#a86a3a' } };

function build() {
  const rig = grilo({ k: 1.3, alt: 0.24, antena: 0.2 });
  par((l, s) => {
    // ASAS-CAPACITOR: o élitro vira uma placa erguida, com cinco lâminas alternadas
    const e = rig.bones['elitro_' + l];
    e.clear(); e.position.set(-0.08, 0.2, 0.1 * s); e.rotation.set(-0.3 * s, 0.25 * s, -1.05);
    rig.add('elitro_' + l, roundBox([0.5, 0.05, 0.26], 0.02, m(3), { pos: [-0.27, 0, 0.04 * s] }));
    [-0.44, -0.33, -0.22, -0.11].forEach((x, i) => rig.add('elitro_' + l, roundBox([0.06, 0.075, 0.29], 0.015, i % 2 ? m.luz(2) : m.plano(2), { pos: [x, 0, 0.04 * s] })));
    rig.add('elitro_' + l, blob([0.05, 0.05, 0.05], m.luz(2), { pos: [-0.54, 0, 0.04 * s], seg: 8 }));
    // antenas em raio (no lugar das do kit)
    const a = rig.bones['antena_' + l]; a.clear(); a.rotation.set(-0.4 * s, 0, -0.5);
    rig.add('antena_' + l, raioGrilo(0.36, 0.045));
    // espinhos nas coxas e joelheira
    rig.add('pata3_' + l, spike(0.1, 0.03, m(3), { pos: [-0.07, 0.2, 0.15 * s], rot: [0, 0, 40] }), spike(0.09, 0.028, m(3), { pos: [-0.04, 0.13, 0.12 * s], rot: [0, 0, 40] }));
  });
  // peitoral amarelo e listras do abdômen
  rig.add('corpo', blob([0.08, 0.1, 0.16], m.plano(2), { pos: [0.16, -0.04, 0], seg: 10 }));
  for (const x of [-0.14, -0.28]) rig.add('abdomen', blob([0.035, 0.19, 0.2], m(3), { pos: [x, 0.0, 0], seg: 12, castShadow: false }));
  // ARCO elétrico entre as pontas das asas: três contas num osso que pulsa
  rig.bone('arco', 'corpo', [-0.36, 0.66, 0]);
  const pts: V3[] = [[0, 0, -0.14], [0.02, 0.05, -0.05], [-0.02, 0.0, 0.05], [0, 0.04, 0.14]];
  pts.forEach((pos, i) => rig.add('arco', blob([0.05, 0.05, 0.065], i % 2 ? m.luz(2) : m.plano(2), { pos, seg: 8, castShadow: false })));
  rig.bone('faisca1', 'corpo', [0.1, 0.5, -0.36], [0, 0, 20]); rig.add('faisca1', raioGrilo(0.2, 0.05));
  rig.bone('faisca2', 'corpo', [-0.66, 0.3, 0.2], [0, 0, 100]); rig.add('faisca2', raioGrilo(0.18, 0.05));
  return rig;
}

const anims = animsInseto({ u: 0.75, alt: 0.24, mole: 0.9 }, {
  todas: { ...piscaGrilo(['faisca1', 'faisca2']), arco: ls([1, [1, 1.3, 0.8], [1, 0.7, 1.1], [1, 1.2, 1]]) },
  // canta raspando uma asa na outra
  idle: { elitro_d: lz([0, -5, 0, -5]), elitro_e: lz([-5, 0, -5, 0]) },
  especial: { elitro_d: qz([0, -8, 6, -12, -4, 0]), elitro_e: qz([0, 6, -8, -12, -4, 0]), arco: qs([1, 1.3, 1.6, 2.4, 1.5, 1]), faisca1: qs([1, 1.4, 0.4, 2.2, 1.4, 1]), faisca2: qs([1, 0.4, 1.6, 2.2, 1.4, 1]) },
  desmaio: { arco: qs([1, 0.7, 0.4, 0.1, 0.1]), elitro_d: qz([0, 10, 24, 40, 38]), elitro_e: qz([0, 10, 24, 40, 38]) },
});

export const grilaoEletrico = criatura({
  num: 142, id: 'grilao-eletrico', nome: 'Grilão-Elétrico', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.awpp', '.appp', '..pp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
