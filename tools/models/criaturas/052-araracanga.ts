/**
 * 052 · ARARACANGA (Vento/Trovão) — arara-vermelha de penas que estalam eletricidade. Estágio final.
 * Mantém da linha: bico negro em gancho, cara clara pelada, azul nas asas, amarelo, cauda comprida.
 * Cresce: corpo escarlate · asa em três faixas (vermelho, amarelo, azul) · CRISTA de três raios ·
 * penas da cauda em ziguezague de raio · faíscas saltando em volta.
 */
import { criatura, ave, animsAve, blob, pena, par, m, lz, ls, qz, qs, type V3, unirExtras } from './kits';
import { raio } from './028-vagalumim';
import { paletaArara, asasContidas } from './051-ararinha';

const paleta = {
  ...paletaArara, contorno: '#2a1228', extras: { w: '#ffffff', p: '#1a1020', f: '#fffbb4', a: '#ffd830' },
  rampas: [['#8a1c3c', '#e0382e', '#ff8c4c'], ['#c8881e', '#ffd830', '#fffbb4'], paletaArara.rampas[2], paletaArara.rampas[0]] as [string, string, string][], // 0 escarlate · 1 amarelo-raio · 3 azul
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.28, 0.25, 0.23], ergue: 50,
    pescoco: { len: 0.13, ang: 76, r: 0.15 },
    cabeca: [0.2, 0.19, 0.185],
    bico: { len: 0.2, r: 0.125, y: -0.18, gancho: 66, achata: 0.7, inferior: 0.5 },
    asa: { len: 0.46, larg: 0.25, cai: 24, ponta: 0.55 },
    cauda: { len: 0.5, larg: 0.11, ang: -16, penas: 3, abre: 14 },
    pernas: { alt: 0.13, r: 0.036, z: 0.5, dedo: 0.11 },
    olho: { r: 0.026, pos: [0.115, 0.04, 0.155] },
    rampas: { corpo: 0, cabeca: 0, asa: 0, asaPonta: 3, cauda: 0, bico: 2, perna: 2 },
  });
  par((l, s) => {
    // cara clara pelada com risquinhas
    rig.add('cabeca', blob([0.1, 0.105, 0.05], m.luz(1), { pos: [0.1, 0.0, 0.14 * s], seg: 14 }));
    rig.add('cabeca', blob([0.055, 0.014, 0.03], m.plano(0), { pos: [0.08, -0.06, 0.178 * s], seg: 6, castShadow: false }));
    // faixa amarela e faixa azul na asa
    rig.add('asa_' + l, blob([0.11, 0.115, 0.06], m(1), { pos: [-0.3, -0.05, 0.035 * s], seg: 12 }));
    rig.add('asa2_' + l, pena(0.16, 0.07, m.luz(3), { esp: 0.05, pos: [-0.14, 0.03, 0.02 * s] }));
    // faíscas (ossos próprios, um de cada lado)
    rig.bone('faisca_' + l, 'corpo', [0.16 - 0.36 * (s > 0 ? 1 : 0), 0.4 + 0.1 * s, 0.26 * s]);
    rig.add('faisca_' + l, raio(0.3, m.luz(1), 0.07));
    // raio amarelo riscando a asa de ponta a ponta
    const rz = raio(0.42, m.luz(1), 0.075); rz.rotation.set(0, 0, Math.PI / 2 + 0.25); rz.position.set(-0.06, 0.03, 0.075 * s); rig.add('asa_' + l, rz);
  });
  // bico de cima claro (marca da arara-vermelha)
  rig.add('cabeca', blob([0.09, 0.05, 0.075], m.luz(1), { pos: [0.2, 0.01, 0], rot: [0, 0, -24], seg: 10 }));
  // CRISTA de três raios
  const cr: [string, V3, number, number][] = [['raio1', [0.07, 0.15, 0], 0.3, -34], ['raio2', [-0.03, 0.18, 0], 0.42, 4], ['raio3', [-0.13, 0.13, 0], 0.32, 46]];
  for (const [nome, pos, alt, tomba] of cr) { rig.bone(nome, 'cabeca', pos, [0, 0, tomba]); rig.add(nome, raio(alt, m(1), 0.06)); }
  // cauda: duas penas-raio compridas e ponta azul
  rig.bone('cauda2', 'cauda1', [-0.3, 0, 0], [0, 0, 0]);
  rig.add('cauda2', raio(0.56, m.luz(1), 0.08), raio(0.46, m.luz(3), 0.07));
  rig.bones.cauda2.children[0].rotation.set(0, 0, Math.PI / 2 + 0.12); rig.bones.cauda2.children[1].rotation.set(0.5, 0, Math.PI / 2 - 0.2);
  rig.add('cauda1', pena(0.3, 0.09, m(3), { esp: 0.04, rot: [90, 0, 0], pos: [-0.1, 0.03, 0] }));
  // babador escuro sob o bico
  rig.add('cabeca', blob([0.06, 0.05, 0.11], m.sombra(0), { pos: [0.12, -0.16, 0], seg: 10 }));
  void ref;
  return rig;
}

const pisca = (i: number) => { const v = [1, 0.3, 1.2, 0.6]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsAve({ u: 1.0, hPerna: 0.13, mole: 0.8 }, unirExtras(asasContidas, {
  todas: { faisca_d: pisca(0), faisca_e: pisca(2) },
  idle: { raio1: lz([0, 4, 8, -3]), raio2: lz([0, -3, 4, 6]), raio3: lz([0, 6, -4, 3]), cauda2: lz([0, 4, 8, 3]) },
  especial: { raio1: qs([1, 1.1, 1.2, 1.4, 1.1, 1]), raio2: qs([1, 1.1, 1.25, 1.5, 1.2, 1]), raio3: qs([1, 1.1, 1.2, 1.4, 1.1, 1]), faisca_d: qs([1, 1.4, 0.4, 1.7, 1.2, 1]), faisca_e: qs([0.4, 1.2, 1.6, 0.6, 1.5, 1]) },
  dano: { raio2: qz([24, 8, 0]) },
}));

export const araracanga = criatura({
  num: 52, id: 'araracanga', nome: 'Araracanga', porte: 'G', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['ppp..', '.ppp.', 'pawpp', 'paapp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
