/**
 * 150 · JATAÍ-RAINHA (Inseto/Encanto) — rainha de coroa de cera que nunca derrete; uma gota do seu mel adoça um rio inteiro.
 * Mantém da linha: dourado-mel, cintas castanhas, gola felpuda, bochechas rosa, flor, antenas de bolinha, brilhos.
 * Cresce: COROA de cera rosa de três pontas · abdômen de rainha, comprido e pesado, com cinta rosa ·
 * CETRO pega-mel com a gota dourada · asas grandes de borda rosa · manto de gola dupla · anel de brilhos.
 */
import { criatura, animsInseto, blob, lathe, ring, segmento, par, m, ls, lz, qs, qz, qp, type V3 } from './kits';
import { paletaJatai, abelha, florzinha, cintilaJ, brilhoJ } from './149-jatai';

function build() {
  const rig = abelha({ k: 1.3, flutua: 0.52, abd: [0.28, 0.2, 0.2], asa: [0.5, 0.3], cai: 72 });
  // COROA de cera rosa-encanto (branca sumia nas asas de véu; cor de mel sumia no corpo): aro e três pontas altas com pingo claro
  rig.bone('coroa', 'cabeca', [0.08, 0.17, 0], [0, 0, -6]);
  rig.add('coroa', ring(0.15, 0.055, m.sombra(3), { rot: [90, 0, 0] }));
  for (let i = 0; i < 3; i++) {
    const z = (i - 1) * 0.12, h = i === 1 ? 0.3 : 0.22;
    rig.add('coroa', lathe([[0.065, 0], [0.055, h * 0.6], [0.001, h]], m(3), { seg: 8, pos: [0.02, 0.03, z] }), blob([0.035, 0.04, 0.035], m.luz(2), { pos: [0.02, h + 0.03, z], seg: 8 }));
  }
  rig.add('coroa', blob([0.05, 0.05, 0.05], m.plano(3), { pos: [0.17, 0.0, 0], seg: 8 }));
  // cinta rosa na cintura da rainha (uma faixa limpa no lugar dos babados, que viravam ruído)
  rig.add('abdomen', blob([0.06, 0.205, 0.205], m(3), { pos: [-0.06, 0, 0], seg: 14, castShadow: false }));
  rig.add('abdomen', blob([0.045, 0.2, 0.2], m(1), { pos: [-0.36, 0, 0], seg: 14, castShadow: false }));
  par((l, s) => {
    // borda rosa nas asas
    rig.add('asa_' + l, blob([0.2, 0.03, 0.05], m(3), { pos: [-0.3, 0.005, 0.13 * s], rot: [0, 12 * s, 0], seg: 10, castShadow: false }));
  });
  // CETRO pega-mel: haste, cabeça canelada e a gota dourada, num osso que a pata dianteira segura
  rig.bone('cetro', 'corpo', [0.24, -0.1, -0.2], [-14, 0, -24]);
  rig.add('cetro', segmento([0, -0.16, 0], [0, 0.26, 0], 0.03, 0.03, m(1)), lathe([[0.001, 0.24], [0.07, 0.27], [0.04, 0.31], [0.085, 0.35], [0.045, 0.39], [0.075, 0.43], [0.001, 0.48]], m.luz(0), { seg: 10 }));
  rig.bone('gota', 'cetro', [0, 0.2, 0]);
  rig.add('gota', lathe([[0.001, 0.05], [0.03, 0], [0.04, -0.04], [0.001, -0.08]], m.plano(0), { seg: 8 }));
  florzinha(rig, 'flor', 'abdomen', [-0.02, 0.2, 0], 0.07);
  // anel de brilhos
  const pos: V3[] = [[0.46, 0.34, 0.22], [-0.44, 0.5, -0.3], [0.1, 0.62, -0.42], [-0.5, 0.1, 0.36]];
  pos.forEach((q, i) => { rig.bone('brilho' + (i + 1), 'corpo', q); rig.add('brilho' + (i + 1), ...brilhoJ([0.07, 0.055, 0.05, 0.045][i])); });
  return rig;
}

const anims = animsInseto({ u: 0.8, alt: 0.16, flutua: 0.52, asas: true, mole: 1 }, {
  todas: cintilaJ(['brilho1', 'brilho2', 'brilho3', 'brilho4']),
  idle: { flor: lz([0, 5, 8, 3]), cetro: lz([0, 3, 6, 2]), gota: ls([1, [1, 1.3, 1], [1, 1.6, 1], [1, 0.8, 1]]), coroa: lz([0, 1, 2, 1]) },
  desmaio: { corpo: qp([[0, 0.01, 0], [0, -0.03, 0], [0, -0.07, 0], [0, -0.1, 0], [0, -0.09, 0]]), abdomen: qz([0, -4, -8, -12, -11]) },
  // a rainha bate o cetro e o mel espirra
  fisico: { cetro: qz([10, 24, -40, -14, 0]) },
  especial: { cetro: qz([0, 10, 16, -20, -6, 0]), gota: qs([1, 1.4, 1.8, 2.6, 1.6, 1]), coroa: qs([1, 1.04, 1.08, 1.2, 1.06, 1]) },
});

export const jataiRainha = criatura({
  num: 150, id: 'jatai-rainha', nome: 'Jataí-Rainha', porte: 'M', estagio: 'final', paleta: paletaJatai, build, anims,
  olho: {
    frente: ['..www', '.wwpw', 'wwppw', 'wwppw', '.www.'],
    fechado: ['fffff', 'fffff', 'wfffw', '.www.', 'fffff'],
    mapa: ['w', 'p'],
  },
});
