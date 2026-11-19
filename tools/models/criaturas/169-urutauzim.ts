/**
 * 169 · URUTAUZIM (Assombro/Vento) — filhote de urutau, que finge ser a ponta de um toco.
 * Traços: corpo em pé, esticado, da cor de casca · olhões amarelos de pires · bocarra de sapo que vai de
 * orelha a orelha · empoleirado num toco seco de que parece continuação · penugem arrepiada no cocuruto.
 */
import { criatura, ave, animsAve, blob, lathe, tufo, par, m, lz, qz, D2R } from './kits';

export const paletaUrutau = {
  rampas: [
    ['#3c3044', '#74685e', '#b0a488'], // 0 plumagem de casca
    ['#a89a8c', '#e6dcc4', '#fffaec'], // 1 manchas de líquen
    ['#2a1e30', '#4c3a40', '#786058'], // 2 toco seco, riscas e bico
    ['#5a3a9c', '#a888ec', '#e8d8ff'], // 3 névoa de assombro
  ] as [string, string, string][],
  contorno: '#20182a',
  extras: { w: '#ffffff', p: '#20182a', f: '#74685e', a: '#ffd23c', o: '#e89a1c' },
};

/** Toco seco de ponta quebrada, no osso base. */
export const toco = (r: number, h: number) => lathe([[r * 1.5, 0], [r * 1.15, h * 0.16], [r, h * 0.5], [r * 0.95, h * 0.94], [r * 0.6, h], [0.001, h * 0.96]], m(2), { seg: 9 });

function build() {
  const H = 0.36;
  const { rig, ref } = ave({
    corpo: [0.24, 0.17, 0.17], ergue: 74,
    pescoco: { len: 0.06, ang: 84, r: 0.15 },
    cabeca: [0.2, 0.18, 0.2],
    bico: { len: 0.07, r: 0.04, y: -0.1, achata: 2.2, inferior: 1 },
    asa: { len: 0.36, larg: 0.17, cai: 30, ponta: 0.5 },
    cauda: { len: 0.24, larg: 0.1, ang: 66, penas: 2, abre: 8 },
    pernas: { alt: 0.07, r: 0.03, z: 0.5, dedo: 0.07 },
    olho: { r: 0.045, pos: [0.15, 0.04, 0.12] },
    rampas: { corpo: 0, peito: 0, cabeca: 0, asa: 0, asaPonta: 2, cauda: 0, bico: 2, perna: 2 },
  });
  rig.bones.corpo.position.y += H;
  rig.add('base', toco(0.17, H + 0.05));
  rig.add('base', blob([0.06, 0.03, 0.05], m.luz(1), { pos: [0.14, 0.2, -0.1], seg: 8 }), blob([0.05, 0.03, 0.05], m.luz(1), { pos: [-0.04, 0.12, -0.17], seg: 8 }));
  // bocarra larga (risco escuro de orelha a orelha) e manchas de líquen
  rig.add('cabeca', blob([0.13, 0.022, 0.18], m.plano(2), { pos: [0.1, -0.1, 0], seg: 12 }));
  par((_, s) => rig.add('tronco', blob([0.05, 0.035, 0.03], m(1), { pos: [0.08, 0.04, 0.16 * s], seg: 8 }), blob([0.04, 0.03, 0.03], m(1), { pos: [-0.06, -0.02, 0.15 * s], seg: 8 })));
  rig.bone('penugem', 'cabeca', [ref.topo[0], ref.topo[1] - 0.03, 0], [0, 0, 10]);
  rig.add('penugem', tufo(3, 0.12, 0.05, m.luz(0), { abre: 34 }));
  rig.bones.cabeca.rotation.z = 10 * D2R;
  return rig;
}

const anims = animsAve({ u: 0.7, hPerna: 0.07, mole: 1.1 }, { idle: { penugem: lz([0, 5, 9, 3]) }, especial: { penugem: qz([0, 12, 18, -20, -6, 0]) } });

export const urutauzim = criatura({
  num: 169, id: 'urutauzim', nome: 'Urutauzim', porte: 'P', estagio: 'basico', paleta: paletaUrutau, build, anims,
  olho: { frente: ['.aaaa.', 'aaawwa', 'aappwa', 'aappaa', 'oaaaao', '.oooo.'], fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff', 'ffffff'], mapa: ['a', 'p'] },
});
