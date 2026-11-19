/**
 * 137 · SERELEPIM (Comum/Geada) — serelepe (esquilo da Mata Atlântica) com pinhão.
 * Traços únicos: caudão felpudo enrolado sobre as costas com a ponta nevada · bochechas estufadas ·
 * pinhão congelado abraçado no colo · orelhas com pincel · dentinhos.
 */
import { criatura, bipede, animsBipede, blob, tufo, par, m, lz, qz, ls, D2R } from './kits';
import { pinhao } from './135-gralhinha';

export const paletaSerelepe = {
  rampas: [
    ['#7a3a34', '#c0673a', '#eda25a'], // 0 pelo ruivo-castanho
    ['#c2a996', '#f6e6cc', '#ffffff'], // 1 creme da barriga · branco de geada na luz
    ['#5fa6cf', '#a8def2', '#e8fcff'], // 2 gelo
    ['#3a2230', '#6b3a2e', '#a8683c'], // 3 pinhão, patas e nariz
  ] as [string, string, string][],
  contorno: '#2e1a2a',
  extras: { w: '#ffffff', p: '#2e1a2a', f: '#c0673a' },
};

function build() {
  const { rig, ref } = bipede({
    tronco: [0.17, 0.19, 0.18],
    pernas: { alt: 0.1, r: 0.07, z: 0.6, pe: [0.12, 0.04, 0.07] },
    bracos: { len: 0.24, r: 0.045, mao: 0.05, abre: 6 },
    pescoco: { len: 0.04, r: 0.11, ang: 16 },
    cabeca: [0.2, 0.175, 0.19],
    focinho: { len: 0.07, r0: 0.085, r1: 0.06, y: -0.3, nariz: 0.03 },
    orelha: { alt: 0.13, larg: 0.1, z: 0.6, abre: 16 },
    cauda: { segs: 4, len: 0.78, r0: 0.08, r1: 0.16, ang: 58, curva: 14 },
    olho: { r: 0.03, pos: [0.165, 0.13, 0.135] },
    rampas: { pelo: 0, barriga: 1, pe: 3, mao: 3, nariz: 3, cauda: 0 },
  });
  // braços abraçando o pinhão
  par((l) => { rig.bones['braco_' + l].rotation.z = 44 * D2R; rig.bones['antebraco_' + l].rotation.z = 50 * D2R; });
  rig.bone('pinhao', 'corpo', [0.3, -0.16, 0], [0, 0, 74]);
  rig.add('pinhao', pinhao(0.3, m.sombra(3), m(3)), blob([0.11, 0.085, 0.085], m(2), { pos: [0.22, 0, 0], seg: 12 }));
  // bochechas estufadas + dentinhos
  par((_, s) => rig.add('cabeca', blob([0.085, 0.075, 0.07], m(1), { pos: [0.1, 0.045, 0.135 * s], seg: 14 })));
  rig.add('cabeca', blob([0.02, 0.03, 0.03], m.plano(1), { pos: [ref.pontaFocinho[0] - 0.005, ref.pontaFocinho[1] - 0.05, 0], seg: 8 }));
  // pincéis nas orelhas
  par((l) => rig.add('orelha_' + l, tufo(2, 0.09, 0.03, m(3), { pos: [0, 0.1, 0], abre: 16 })));
  // ponta nevada da cauda e risca clara
  rig.add('cauda4', blob([0.15, 0.175, 0.175], m.luz(1), { pos: [-0.24, 0, 0] }));
  rig.add('cauda2', blob([0.09, 0.05, 0.125], m.luz(0), { pos: [-0.08, -0.09, 0], seg: 12 }));
  return rig;
}

const anims = animsBipede({ u: 0.6, hPerna: 0.1, mole: 1.3 }, {
  idle: { pinhao: lz([74, 76, 80, 76]), cauda3: lz([0, 4, 8, 3]), braco_d: lz([44, 45, 47, 45]), braco_e: lz([44, 45, 47, 45]) },
  andar: { braco_d: lz([44, 48, 44, 48]), braco_e: lz([44, 48, 44, 48]), cauda3: lz([0, 8, 0, 8]) },
  parado: { braco_d: lz([44, 46]), braco_e: lz([44, 46]) },
  status: { braco_d: lz([44, 46, 44, 42]), braco_e: lz([44, 46, 44, 42]) },
  especial: { pinhao: [...qz([74, 66, 62, 106, 86, 74]), ...[0, 0.33, 1].map((t, i) => ({ t, s: [1, 1.2, 1][i] }))], cauda3: qz([0, 10, 14, -20, -8, 0]) },
  dano: { cauda3: qz([20, 8, 0]) },
});
void ls;

export const serelepim = criatura({
  num: 137, id: 'serelepim', nome: 'Serelepim', porte: 'P', estagio: 'basico', paleta: paletaSerelepe, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
