/**
 * 043 · CORUJINHA (Vento/Mente) — caburé, a menor coruja da mata, de olhar que hipnotiza.
 * Traços únicos: cabeçona redonda sem "orelhas" · olhões amarelos num disco facial creme ·
 * "olhos falsos" na nuca (a marca do caburé, vista de costas) · espiral lilás na testa · peito riscado.
 */
import { criatura, ave, animsAve, blob, calota, ring, par, m, lz, ls, qs } from './kits';

export const paletaCabure0 = {
  rampas: [
    ['#5e3a3e', '#a8663c', '#dca060'], // 0 penas ferrugem
    ['#bfa390', '#f6e6c8', '#fffbf0'], // 1 creme do disco facial, peito e pintas
    ['#b86a1c', '#f6c02e', '#fff0a0'], // 2 amarelo do bico, dos pés e da íris
    ['#33234a', '#7a55b0', '#c9a6f0'], // 3 lilás da mente: olhos falsos e espiral
  ] as [string, string, string][],
  contorno: '#2c1a30',
  extras: { w: '#ffffff', p: '#23142a', f: '#f6e6c8', a: '#f6c02e' },
};
export const paletaCabure = paletaCabure0;

function build() {
  const { rig, ref } = ave({
    corpo: [0.19, 0.2, 0.19], ergue: 62,
    pescoco: { len: 0.07, ang: 80, r: 0.15 },
    cabeca: [0.21, 0.2, 0.23],
    bico: { len: 0.09, r: 0.05, y: -0.3, gancho: 50, inferior: 0.4 },
    asa: { len: 0.27, larg: 0.17, cai: 30, ponta: 0.4 },
    cauda: { len: 0.16, larg: 0.09, ang: -30, penas: 3, abre: 16 },
    pernas: { alt: 0.07, r: 0.03, z: 0.5, dedo: 0.08 },
    olho: { r: 0.03, pos: [0.2, 0.02, 0.1] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  // disco facial creme (dois discos que se encostam) e sobrancelhas
  par((_, s) => {
    rig.add('cabeca', blob([0.06, 0.105, 0.105], m.plano(1), { pos: [0.145, 0.01, 0.1 * s], seg: 16 }));
    rig.add('cabeca', blob([0.05, 0.03, 0.1], m.sombra(0), { pos: [0.17, 0.125, 0.1 * s], rot: [-14 * s, 0, 0], seg: 12 }));
    // olhos falsos na nuca
    rig.add('cabeca', blob([0.04, 0.07, 0.065], m.plano(1), { pos: [-0.17, 0.03, 0.09 * s], seg: 12 }));
    rig.add('cabeca', blob([0.04, 0.048, 0.042], m.sombra(3), { pos: [-0.185, 0.03, 0.09 * s], seg: 10 }));
    // barras claras na asa
    rig.add('asa_' + (s > 0 ? 'd' : 'e'), blob([0.03, 0.03, 0.03], m.plano(1), { pos: [-0.1, 0.0, 0.05 * s], seg: 8 }), blob([0.03, 0.03, 0.03], m.plano(1), { pos: [-0.19, -0.02, 0.05 * s], seg: 8 }));
  });
  // pintinhas creme no cocuruto
  for (const [x, z] of [[0.02, 0.09], [0.0, -0.08], [-0.08, 0.02], [0.07, 0.0]] as const)
    rig.add('cabeca', blob([0.022, 0.016, 0.022], m.plano(1), { pos: [x, 0.19 - Math.abs(x) * 0.15, z], seg: 8, castShadow: false }));
  // riscas ferrugem no peito
  for (const [y, z] of [[0.0, 0.07], [0.0, -0.07], [-0.09, 0.0], [0.07, 0.0]] as const)
    rig.add('tronco', blob([0.022, 0.05, 0.022], m(0), { pos: [0.185, y, z], rot: [0, 0, 0], seg: 8, castShadow: false }));
  // espiral lilás da mente na testa (osso próprio, pulsa)
  rig.bone('espiral', 'cabeca', [ref.testa[0] + 0.04, ref.testa[1] + 0.0, 0], [0, 0, -35]);
  rig.add('espiral', blob([0.02, 0.045, 0.045], m.plano(3), { seg: 10 }), blob([0.022, 0.02, 0.02], m.luz(3), { pos: [0.01, 0, 0], seg: 8 }));
  rig.add('cauda1', blob([0.025, 0.02, 0.1], m.plano(1), { pos: [-0.09, 0, 0], seg: 8 }));
  return rig;
}

export const pulsa = {
  idle: { espiral: ls([1, 1.1, 1.3, 1.1]) },
  especial: { espiral: qs([1, 1.4, 1.8, 2.4, 1.5, 1]) },
};
const anims = animsAve({ u: 0.6, hPerna: 0.07, mole: 1.3 }, pulsa);

export const corujinha = criatura({
  num: 43, id: 'corujinha', nome: 'Corujinha', porte: 'P', estagio: 'basico', paleta: paletaCabure, build, anims,
  olho: {
    frente: ['.ppp.', 'paapp', 'papwp', 'paapp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['a', 'p'],
  },
});
