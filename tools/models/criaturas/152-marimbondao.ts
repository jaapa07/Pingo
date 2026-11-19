/**
 * 152 · MARIMBONDÃO (Inseto/Veneno) — marimbondo-caboclo que avisa três vezes com um zumbido grave; ninguém espera a quarta.
 * Mantém da linha: castanho-avermelhado de cintas amarelas, cintura fina, asas âmbar, gota roxa no ferrão, chapéu de palha.
 * Cresce: chapéu de ABA LARGA com fita e pena roxa · ferrão comprido em lança pingando veneno · mandíbulas em tesoura ·
 * abdômen longo de três cintas · pernas traseiras compridas penduradas · sobrancelha brava · três gotas de veneno no ar.
 */
import { criatura, animsInseto, blob, folha3d, spike, segmento, par, m, ls, lz, qz, qs, type V3 } from './kits';
import { paletaVespa, vespa, chapeu, pousa } from './151-marimbinho';

const paleta = { ...paletaVespa, rampas: [['#5a1628', '#a8362a', '#ec7c48'], paletaVespa.rampas[1], paletaVespa.rampas[2], paletaVespa.rampas[3]] as [string, string, string][], extras: { ...paletaVespa.extras, f: '#a8362a' } };

function build() {
  const rig = vespa({ k: 1.35, flutua: 0.52, abd: [0.32, 0.16, 0.16], cintura: 0.14, ferrao: 0.2, asa: [0.56, 0.2] });
  chapeu(rig, [0.08, 0.15, 0], 0.15, 0.36, -14);
  // pena roxa na fita do chapéu
  rig.add('chapeu', folha3d(0.24, 0.1, m(3), { pos: [-0.12, 0.08, 0.1], rot: [20, 0, 34], esp: 0.5, curva: -20 }));
  // terceira cinta e ponta escura do abdômen
  rig.add('abdomen', blob([0.04, 0.115, 0.115], m(1), { pos: [-0.62, 0, 0], seg: 12, castShadow: false }));
  par((l, s) => {
    // mandíbulas em tesoura, amarelas
    rig.add('cabeca', spike(0.13, 0.04, m(1), { pos: [0.22, -0.13, 0.06 * s], rot: [-30 * s, 0, -120] }));
    // sobrancelha brava
    rig.add('cabeca', blob([0.07, 0.03, 0.07], m.sombra(0), { pos: [0.17, 0.09, 0.13 * s], rot: [24 * s, 0, -20], seg: 8 }));
    // pernas traseiras compridas penduradas, com meia amarela
    rig.add('tarso3_' + l, segmento([-0.04, -0.2, 0.06 * s], [-0.14, -0.42, 0.08 * s], 0.035, 0.028, m(0)), blob([0.04, 0.05, 0.04], m(1), { pos: [-0.14, -0.43, 0.08 * s], seg: 8 }));
  });
  // gotas de veneno no ar
  const g: V3[] = [[-0.5, -0.1, 0.24], [0.4, 0.5, -0.36], [-0.7, 0.2, -0.2]];
  g.forEach((pos, i) => { rig.bone('gota' + (i + 1), 'corpo', pos); rig.add('gota' + (i + 1), blob([0.04, 0.055, 0.04], i % 2 ? m.luz(3) : m.plano(3), { seg: 8, castShadow: false })); });
  return rig;
}

const anims = animsInseto({ u: 0.85, alt: 0.19, flutua: 0.52, asas: true, mole: 0.9 }, {
  todas: { gota1: ls([1, 0.5, 0.9, 1.3]), gota2: ls([0.9, 1.3, 1, 0.5]), gota3: ls([0.5, 0.9, 1.3, 1]) },
  idle: { ferrao: ls([1, 1.06, 1.12, 1.04]), chapeu: lz([0, 2, 4, 1]), abdomen: lz([0, 4, 8, 3]) },
  desmaio: pousa(0.4),
  dano: { chapeu: [...qz([20, 7, 0]), { t: 0, p: [0, 0.06, 0] }, { t: 1, p: [0, 0, 0] }] },
  // estocada: o abdômen dobra por baixo e a lança vem para a frente
  fisico: { abdomen: qz([-8, -18, 36, 12, 0]), ferrao: qs([1, 1, 1.3, 1.1, 1]) },
  especial: { ferrao: qs([1, 1.1, 1.2, 1.6, 1.2, 1]), gota1: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), gota2: qs([1, 1.3, 1.6, 2.2, 1.4, 1]), gota3: qs([1, 1.3, 1.6, 2.2, 1.4, 1]) },
});

export const marimbondao = criatura({
  num: 152, id: 'marimbondao', nome: 'Marimbondão', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['pp...', 'pppp.', '.awpp', '.appp', '..pp.'],
    fechado: ['fffff', 'fffff', 'ppppp', '.ppp.', 'fffff'],
    mapa: ['p', 'p'],
  },
});
