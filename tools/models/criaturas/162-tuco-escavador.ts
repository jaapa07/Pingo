/**
 * 162 · TUCO-ESCAVADOR (Terra/Ferro) — tuco-tuco adulto de garras-pá. Estágio final.
 * Mantém da linha: pelo castanho-areia, dentões laranja, garras de aço, areia no corpo.
 * Cresce: duas PÁS de aço no lugar das garras da frente · capacete de chapa rebitada com viseira ·
 * placas de aço no lombo · carrega um monte de areia na garupa · dentes maiores e olhar decidido.
 */
import { criatura, quadrupede, animsQuadrupede, blob, calota, slab, ring, par, m, lz, qz, D2R, type V2 } from './kits';
import { paletaTuco } from './161-tuquim';

function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.42, 0.29, 0.29], peito: 1.06,
    pernas: { alt: 0.2, r: 0.1, rFim: 0.085, xF: 0.55, xT: -0.52, z: 0.72, dobraF: 6, dobraT: -14, pe: [0.12, 0.055, 0.1] },
    pescoco: { len: 0.14, ang: 22, r: 0.22, x: 0.6, y: 0.1 },
    cabeca: [0.26, 0.23, 0.24],
    focinho: { len: 0.1, r0: 0.14, r1: 0.1, cai: 4, y: -0.25, nariz: 0.05 },
    orelha: { tipo: 'redonda', alt: 0.07, larg: 0.08, x: -0.4, z: 0.85, abre: 34 },
    cauda: { segs: 1, len: 0.14, r0: 0.06, r1: 0.04, ang: 24 },
    olho: { r: 0.024, pos: [0.25, 0.06, 0.165] },
    rampas: { pelo: 0, barriga: 1, pe: 0, nariz: 2, orelha: 0, focinho: 1 },
  });
  const pf = ref.pontaFocinho;
  for (const z of [-0.036, 0.036]) rig.add('cabeca', blob([0.034, 0.1, 0.038], m.plano(2), { pos: [pf[0] + 0.02, pf[1] - 0.12, z], seg: 10 }));
  par((_, s) => rig.add('cabeca', blob([0.1, 0.09, 0.07], m(1), { pos: [0.17, -0.1, 0.165 * s], seg: 14 })));
  rig.add('corpo', calota([0.43, 0.3, 0.19], m.sombra(0), { de: 0, ate: 60 }));
  // CAPACETE de chapa: calota de aço, aba/viseira e rebite
  rig.add('cabeca', calota([0.275, 0.245, 0.255], m(3), { de: 0, ate: 62, pos: [0.065, 0, 0], rot: [0, 0, 8] }),
    blob([0.2, 0.03, 0.22], m.luz(3), { pos: [0.17, 0.115, 0], rot: [0, 0, -14], seg: 14 }), blob([0.045, 0.045, 0.045], m.luz(2), { pos: [0.08, 0.25, 0], seg: 8 }));
  // PÁS: lâmina larga de aço em cada pata da frente, com nervura
  const pa: V2[] = [[0, 0.1], [0.12, 0.13], [0.26, 0.09], [0.3, 0], [0.26, -0.09], [0.12, -0.13], [0, -0.1]];
  par((l, s) => {
    rig.bone('pa_' + l, 'canela_f' + l, [0.06, -0.06, 0.02 * s], [0, -12 * s, -22]);
    rig.add('pa_' + l, slab(pa, 0.05, m(3), { rot: [90, 0, 0] }), blob([0.12, 0.022, 0.03], m.luz(3), { pos: [0.14, 0.03, 0], seg: 8 }), ring(0.085, 0.03, m.sombra(3), { pos: [-0.02, 0.03, 0], rot: [0, 90, 0] }));
  });
  rig.bones.perna_fe.rotation.z = 18 * D2R; rig.bones.perna_fd.rotation.z = 6 * D2R;
  // placas de aço no lombo e monte de areia na garupa
  for (const [x, w] of [[0.14, 0.2], [-0.04, 0.22], [-0.21, 0.2]] as const) rig.add('corpo', blob([0.075, 0.05, w], m(3), { pos: [x, 0.27, 0], seg: 12 }));
  rig.bone('areia', 'corpo', [-0.3, 0.2, 0]);
  rig.add('areia', blob([0.17, 0.11, 0.2], m.luz(2), { pos: [0, 0.03, 0], seg: 12 }), blob([0.09, 0.09, 0.1], m.luz(2), { pos: [0.02, 0.13, 0.02], seg: 10 }), blob([0.05, 0.04, 0.05], m(2), { pos: [-0.13, -0.02, 0.1], seg: 8 }), blob([0.04, 0.04, 0.04], m(2), { pos: [0.1, 0.0, -0.14], seg: 8 }));
  rig.add('cauda1', blob([0.065, 0.06, 0.06], m(1), { pos: [-0.14, 0.01, 0], seg: 10 }));
  // pulseiras de aço nas patas de trás
  par((l) => rig.add('canela_t' + l, ring(0.085, 0.03, m(3), { pos: [0, -0.03, 0], rot: [90, 0, 0] })));
  return rig;
}

const anims = animsQuadrupede({ u: 0.85, hPerna: 0.2, mole: 0.7, passo: 22, mapa: { comp: 0.75, larg: 1.25, frontal: 1.25 } }, {
  idle: { areia: lz([0, 1, 3, 1]), pa_e: lz([0, 4, 8, 3]) },
  fisico: { pa_e: qz([-10, -30, 40, 20, 0]), pa_d: qz([-6, -20, 30, 14, 0]) },
  especial: { areia: qz([0, 6, 8, -12, -4, 0]), perna_fd: qz([10, 44, -34, 44, -20, 0]), perna_fe: qz([10, -34, 44, -34, 30, 0]), pa_d: qz([0, -30, 20, -30, 10, 0]), pa_e: qz([0, 20, -30, 20, -10, 0]) },
  dano: { areia: qz([16, 6, 0]) },
});

export const tucoEscavador = criatura({
  num: 162, id: 'tuco-escavador', nome: 'Tuco-Escavador', porte: 'M', estagio: 'final', paleta: paletaTuco, build, anims,
  olho: {
    frente: ['pp..', 'pppp', 'pwpp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.'],
    mapa: ['p', 'p'],
  },
});
