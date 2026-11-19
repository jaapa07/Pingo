/**
 * 041 · CALANGUINHO (Brasa) — calango da restinga que toma sol na areia quente.
 * Traços únicos: cabeça erguida de sentinela · duas listras claras no lombo · papo alaranjado ·
 * ponta da cauda em brasa · pintinhas de fagulha na garupa.
 */
import { criatura, lagarto, animsLagarto, blob, calota, chamaDupla, par, m, D2R } from './kits';
import { tremula } from './004-guaraxim';

export const paletaCalango = {
  rampas: [
    ['#5e4a44', '#a98a52', '#e2cf8c'], // 0 couro areia-oliva
    ['#c2a48a', '#f6e6c4', '#fffbee'], // 1 barriga e listras creme
    ['#e8521c', '#ffb02e', '#fff29a'], // 2 brasa: papo, fagulhas e chama
    ['#2e1e2e', '#55343e', '#8a5a52'], // 3 faixas escuras, dedos e máscara
  ] as [string, string, string][],
  contorno: '#2c1a26',
  extras: { w: '#ffffff', p: '#22141e', f: '#a98a52', a: '#ffb02e' },
};

function build() {
  const { rig } = lagarto({
    tronco: [0.24, 0.12, 0.15], alt: 0.09,
    pernas: { abre: 0.17, r: 0.042, pe: 0.07 },
    pescoco: { len: 0.14, r: 0.1, ang: 52 },
    cabeca: [0.15, 0.11, 0.13],
    cauda: { segs: 4, len: 0.5, r0: 0.085, r1: 0.03, ang: -4, curva: 20 },
    olho: { r: 0.03, pos: [0.11, 0.07, 0.105] },
    rampas: { pele: 0, barriga: 1, pernas: 0, cabeca: 0, cauda: 0, dentro: 2 },
  });
  rig.bones.corpo.rotation.z = 10 * D2R; // peito erguido
  // duas listras claras ladeadas de escuro ao longo do lombo
  par((_, s) => {
    rig.add('corpo', blob([0.2, 0.025, 0.022], m.plano(1), { pos: [-0.01, 0.1, 0.07 * s], seg: 10, castShadow: false }));
    rig.add('corpo', blob([0.18, 0.03, 0.03], m.plano(3), { pos: [-0.01, 0.065, 0.118 * s], seg: 10, castShadow: false }));
    // fagulhas na garupa
    rig.add('corpo', blob([0.022, 0.018, 0.022], m.plano(2), { pos: [-0.14, 0.105, 0.03 * s], seg: 8, castShadow: false }));
  });
  rig.add('corpo', blob([0.022, 0.018, 0.022], m.plano(2), { pos: [-0.05, 0.12, 0], seg: 8, castShadow: false }));
  // papo alaranjado e máscara escura atrás do olho
  rig.add('pescoco', blob([0.08, 0.09, 0.09], m(2), { pos: [0.1, 0.02, 0], seg: 14 }));
  par((_, s) => rig.add('cabeca', blob([0.07, 0.025, 0.02], m.plano(3), { pos: [0.03, 0.06, 0.125 * s], seg: 10 })));
  rig.add('cabeca', calota([0.155, 0.118, 0.1], m.luz(0), { de: 0, ate: 50, pos: [0.075, 0.012, 0] }));
  // anéis escuros na cauda e ponta em brasa
  rig.add('cauda2', blob([0.03, 0.07, 0.07], m.plano(3), { pos: [-0.06, 0, 0], seg: 10 }));
  rig.add('cauda3', blob([0.028, 0.055, 0.055], m.plano(3), { pos: [-0.06, 0, 0], seg: 10 }));
  rig.bone('chama1', 'cauda4', [-0.1, 0, 0], [0, 0, 60]);
  rig.add('chama1', ...chamaDupla(0.2, 0.075, m.plano(2), m.luz(2), { curva: 18 }));
  return rig;
}

const anims = animsLagarto({ u: 0.45, hPerna: 0.09, caudaSegs: 4, mole: 1.1 }, { todas: tremula(['chama1']) });

export const calanguinho = criatura({
  num: 41, id: 'calanguinho', nome: 'Calanguinho', porte: 'P', estagio: 'basico', paleta: paletaCalango, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
