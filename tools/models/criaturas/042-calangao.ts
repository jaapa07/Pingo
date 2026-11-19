/**
 * 042 · CALANGÃO (Brasa/Pedra) — teiú parrudo de escamas vulcânicas. Estágio final.
 * Mantém da linha: listras claras do lombo, papo de brasa, anéis na cauda, chama na ponta.
 * Cresce: corpo de basalto escuro com faixas areia (o desenho do teiú) · fileira de placas de pedra no dorso ·
 * rachaduras de lava nos flancos · língua bifurcada de fogo · papada de brasa · cauda grossa de três chamas.
 */
import { criatura, lagarto, animsLagarto, blob, calota, chamaDupla, tube, par, m, qp, qs, lz, D2R } from './kits';
import { tremula } from './004-guaraxim';
import { paletaCalango } from './041-calanguinho';

const paleta = {
  ...paletaCalango,
  rampas: [
    ['#6a5248', '#b0905a', '#e6d394'], // 0 faixas areia (o couro do filhote)
    paletaCalango.rampas[1],
    paletaCalango.rampas[2],
    ['#261c2e', '#4a3a4e', '#7a6878'], // 3 basalto do corpo e das placas
  ] as [string, string, string][],
  extras: { w: '#ffffff', p: '#1a121e', f: '#4a3a4e', a: '#ffb02e' },
};

function build() {
  const { rig } = lagarto({
    tronco: [0.36, 0.17, 0.21], alt: 0.12,
    pernas: { abre: 0.24, r: 0.065, pe: 0.1 },
    pescoco: { len: 0.17, r: 0.14, ang: 34 },
    cabeca: [0.19, 0.12, 0.15], focinho: 0.1,
    cauda: { segs: 4, len: 0.68, r0: 0.13, r1: 0.05, ang: -6, curva: 17 },
    crista: { n: 6, alt: 0.13 },
    olho: { r: 0.026, pos: [0.15, 0.09, 0.115] },
    rampas: { pele: 3, barriga: 1, pernas: 3, cabeca: 3, cauda: 3, crista: 3, dentro: 2 },
  });
  rig.bones.corpo.rotation.z = 7 * D2R;
  // faixas areia atravessando o corpo (desenho do teiú) e listras claras herdadas
  for (const x of [0.2, 0.04, -0.13, -0.27]) rig.add('corpo', blob([0.035, 0.168 * Math.sqrt(1 - (x / 0.4) ** 2), 0.215 * Math.sqrt(1 - (x / 0.4) ** 2)], m(0), { pos: [x, 0.012, 0], seg: 14, castShadow: false }));
  par((_, s) => {
    rig.add('corpo', blob([0.26, 0.022, 0.022], m.plano(1), { pos: [-0.02, 0.15, 0.085 * s], seg: 10, castShadow: false }));
    // rachaduras de lava nos flancos
    rig.add('corpo', tube([[0.22, 0.05, 0.19 * s], [0.12, -0.02, 0.215 * s], [0.03, 0.05, 0.22 * s], [-0.08, -0.01, 0.215 * s]], 0.017, m.plano(2), { seg: 12, radial: 6 }));
    rig.add('corpo', tube([[-0.16, 0.06, 0.2 * s], [-0.22, 0.0, 0.19 * s], [-0.3, 0.03, 0.15 * s]], 0.015, m.plano(2), { seg: 8, radial: 6 }));
    // ombreiras de pedra e garras claras
    rig.add('perna_f' + (s > 0 ? 'd' : 'e'), blob([0.085, 0.07, 0.085], m.luz(3), { pos: [0.02, 0.03, 0.05 * s], seg: 6 }));
    rig.add('cabeca', blob([0.08, 0.028, 0.02], m.plano(0), { pos: [0.08, 0.035, 0.15 * s], seg: 10 }));
    rig.add('cabeca', blob([0.07, 0.03, 0.03], m.luz(3), { pos: [0.13, 0.13, 0.09 * s], rot: [0, 0, -18], seg: 8 })); // sobrancelha de pedra
  });
  // papada de brasa e língua bifurcada de fogo (osso próprio, escondida em repouso)
  rig.add('pescoco', blob([0.11, 0.1, 0.12], m(2), { pos: [0.1, -0.04, 0], seg: 14 }));
  rig.bone('lingua', 'mandibula', [0.3, 0.04, 0]);
  rig.add('lingua', tube([[0, 0, 0], [0.09, 0.01, 0], [0.16, 0.0, 0.04]], 0.02, m.luz(2), { seg: 8, radial: 6 }), tube([[0.09, 0.01, 0], [0.16, 0.0, -0.04]], 0.02, m.luz(2), { seg: 6, radial: 6 }));
  // anéis areia na cauda e três chamas
  rig.add('cauda2', blob([0.035, 0.105, 0.105], m(0), { pos: [-0.08, 0, 0], seg: 12 }));
  rig.add('cauda3', blob([0.03, 0.08, 0.08], m(0), { pos: [-0.08, 0, 0], seg: 12 }));
  rig.bone('chama1', 'cauda4', [-0.15, 0, 0], [0, 0, 60]);
  rig.add('chama1', ...chamaDupla(0.3, 0.11, m.plano(2), m.luz(2), { curva: 18 }));
  rig.bone('chama2', 'cauda3', [-0.1, 0.07, 0], [0, 0, 30]);
  rig.add('chama2', ...chamaDupla(0.17, 0.07, m.plano(2), m.luz(2), { curva: 18 }));
  rig.bone('chama3', 'cauda2', [-0.08, 0.1, 0], [0, 0, 24]);
  rig.add('chama3', ...chamaDupla(0.14, 0.06, m.plano(2), m.luz(2), { curva: 18 }));
  rig.add('cabeca', calota([0.2, 0.13, 0.12], m.luz(3), { de: 0, ate: 45, pos: [0.095, 0.012, 0] }));
  return rig;
}

const anims = animsLagarto({ u: 0.7, hPerna: 0.12, caudaSegs: 4, mole: 0.6 }, {
  todas: tremula(['chama1', 'chama2', 'chama3']),
  idle: { lingua: [...qs([0.01, 0.01, 1, 0.01]), ...lz([0, 0, 0, 0])] },
  fisico: { lingua: qs([0.01, 0.01, 1, 0.6, 0.01]) },
  especial: { lingua: [...qs([0.01, 0.01, 0.01, 1.3, 1, 0.01]), ...qp([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0.03, 0, 0], [0, 0, 0], [0, 0, 0]])] },
  entrada: { lingua: qs([0.01, 0.01, 0.01, 0.01, 0.01]) }, dano: { lingua: qs([0.01, 0.01, 0.01]) }, desmaio: { lingua: qs([0.01, 0.4, 0.8, 1, 1]) },
  status: { lingua: qs([0.01, 0.01, 0.01, 0.01]) }, andar: { lingua: qs([0.01, 0.01, 0.01, 0.01]) }, parado: { lingua: qs([0.01, 0.01]) },
});

export const calangao = criatura({
  num: 42, id: 'calangao', nome: 'Calangão', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['aaa..', 'awpa.', '.appa', '..aa.'],
    fechado: ['fffff', 'afffa', 'faaaf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
