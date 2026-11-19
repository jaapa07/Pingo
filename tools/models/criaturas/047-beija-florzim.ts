/**
 * 047 · BEIJA-FLORZIM (Vento/Encanto) — beija-flor-tesoura, pairando de flor em flor.
 * Traços únicos: paira no ar com as asas erguidas batendo · bico-agulha comprido ·
 * cauda em tesoura · capuz azul-violeta sobre o corpo esmeralda · florzinha rosa que leva no bico.
 */
import { criatura, ave, animsAve, blob, calota, pena, par, m, lr, lz, qz, type V3 } from './kits';

export const paletaBeija = {
  rampas: [
    ['#1f5a5c', '#2fae7a', '#a6ec8c'], // 0 esmeralda do corpo
    ['#2c2a6e', '#5a55d0', '#a8b4ff'], // 1 azul-violeta do capuz e da tesoura
    ['#8aa6c8', '#e6f2fa', '#ffffff'], // 2 asas translúcidas e peitinho claro
    ['#a02a6a', '#f0629a', '#ffd0dc'], // 3 rosa do encanto: flor e bochecha
  ] as [string, string, string][],
  contorno: '#1e1c40',
  extras: { w: '#ffffff', p: '#15132e', f: '#5a55d0' },
};

/** Batida de asas contínua (um valor por quadro, alternando alto/baixo). */
export const bate = (amp = 1) => {
  const v: V3[] = [[-34, 0, 0], [40, 8, 0], [-30, 0, 0], [44, 8, 0]].map(([x, y, z]) => [x * amp, y * amp, z] as V3);
  return { asa_d: lr(v), asa_e: lr(v.map(([x, y, z]) => [-x, -y, z] as V3)) };
};

export function pairar(rig: ReturnType<typeof ave>['rig'], alt: number) {
  rig.bones.corpo.position.y += alt;
  // asas erguidas e abertas; perninhas recolhidas
  rig.bones.asa_d.rotation.set(-0.75, 0.7, rig.bones.asa_d.rotation.z - 0.5);
  rig.bones.asa_e.rotation.set(0.75, -0.7, rig.bones.asa_e.rotation.z - 0.5);
  rig.bones.perna_d.rotation.z = 0.9; rig.bones.perna_e.rotation.z = 0.9;
}

function build() {
  const { rig, ref } = ave({
    corpo: [0.16, 0.13, 0.125], ergue: 42,
    pescoco: { len: 0.08, ang: 55, r: 0.09 },
    cabeca: [0.135, 0.13, 0.13],
    bico: { len: 0.24, r: 0.034, y: -0.05, achata: 1, inferior: 0.9 },
    asa: { len: 0.3, larg: 0.13, cai: 0, ponta: 0.5, esp: 0.02 },
    cauda: { len: 0.34, larg: 0.07, ang: -30, penas: 2, abre: 16 },
    pernas: { alt: 0.07, r: 0.018, z: 0.4, dedo: 0.04 },
    olho: { r: 0.03, pos: [0.07, 0.025, 0.105] },
    rampas: { corpo: 0, peito: 2, cabeca: 1, asa: 2, asaPonta: 2, cauda: 1, bico: 1, perna: 1 },
  });
  pairar(rig, 0.22);
  // capuz azul descendo pela garganta, bochecha rosa
  rig.add('pescoco', blob([0.09, 0.09, 0.1], m(1), { pos: [0.04, 0.0, 0], seg: 14 }));
  par((_, s) => rig.add('cabeca', blob([0.035, 0.03, 0.02], m.plano(3), { pos: [0.06, -0.045, 0.118 * s], seg: 8 })));
  // costas com brilho esmeralda e ombro azul nas asas
  rig.add('tronco', calota([0.165, 0.136, 0.13], m.luz(0), { de: 0, ate: 40, pos: [-0.01, 0, 0] }));
  par((l, s) => rig.add('asa_' + l, blob([0.06, 0.05, 0.025], m(1), { pos: [-0.04, 0, 0.01 * s], seg: 10 })));
  // florzinha rosa na ponta do bico (osso próprio)
  rig.bone('flor', 'cabeca', [ref.pontaBico[0] + 0.02, ref.pontaBico[1], 0]);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; rig.add('flor', blob([0.03, 0.045, 0.045], m(3), { pos: [0.01, Math.cos(a) * 0.05, Math.sin(a) * 0.05], seg: 8 })); }
  rig.add('flor', blob([0.035, 0.035, 0.035], m.luz(2), { pos: [0.02, 0, 0], seg: 8 }));
  // pontas claras da tesoura
  rig.add('cauda1', blob([0.03, 0.025, 0.035], m.luz(1), { pos: [-0.3, 0, 0.08], seg: 8 }), blob([0.03, 0.025, 0.035], m.luz(1), { pos: [-0.3, 0, -0.08], seg: 8 }));
  return rig;
}

const anims = animsAve({ u: 0.5, hPerna: 0.07, mole: 1.2, flutua: 0.22 }, {
  todas: bate(),
  idle: { flor: lz([0, 8, 0, -8]) },
  especial: { flor: qz([0, 20, 40, -40, -10, 0]) },
  desmaio: { asa_d: lr([[30, 0, 0], [50, 0, 0], [60, 0, 0], [60, 0, 0]]), asa_e: lr([[-30, 0, 0], [-50, 0, 0], [-60, 0, 0], [-60, 0, 0]]) },
});

export const beijaFlorzim = criatura({
  num: 47, id: 'beija-florzim', nome: 'Beija-florzim', porte: 'P', estagio: 'basico', paleta: paletaBeija, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
