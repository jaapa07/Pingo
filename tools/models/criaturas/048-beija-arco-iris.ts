/**
 * 048 · BEIJA-ARCO-ÍRIS (Vento/Encanto) — beija-flor iridescente que muda de cor conforme a luz. Estágio final.
 * Mantém da linha: paira batendo as asas, bico-agulha, cauda em tesoura, capuz violeta, corpo esmeralda.
 * Cresce: cauda de SEIS fitas nas cores do arco-íris · papo-escudo magenta e ouro · topete de três gotas ·
 * asas maiores com faixa ciano · brilhos soltos em volta.
 */
import { criatura, ave, animsAve, blob, calota, pena, par, m, lz, ls, qz, qs } from './kits';
import { paletaBeija, bate, pairar } from './047-beija-florzim';

const paleta = {
  ...paletaBeija,
  rampas: [
    paletaBeija.rampas[0], paletaBeija.rampas[1],
    ['#2a9ac0', '#8ae4ee', '#ffffff'], // 2 ciano · asa clara · brilho branco
    ['#e23c8c', '#ff9a2e', '#ffe45a'], // 3 trio do arco-íris: magenta · laranja · amarelo (chapados)
  ] as [string, string, string][],
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.2, 0.16, 0.15], ergue: 48,
    pescoco: { len: 0.11, ang: 60, r: 0.1 },
    cabeca: [0.14, 0.13, 0.13],
    bico: { len: 0.3, r: 0.034, y: -0.05, achata: 1, inferior: 0.9, gancho: 10 },
    asa: { len: 0.42, larg: 0.17, cai: 0, ponta: 0.55, esp: 0.022 },
    cauda: { len: 0.3, larg: 0.07, ang: -38, penas: 2, abre: 10 },
    pernas: { alt: 0.08, r: 0.02, z: 0.4, dedo: 0.05 },
    olho: { r: 0.027, pos: [0.075, 0.025, 0.108] },
    rampas: { corpo: 0, peito: 0, cabeca: 1, asa: 2, asaPonta: 2, cauda: 1, bico: 1, perna: 1 },
  });
  pairar(rig, 0.34);
  // CAUDA ARCO-ÍRIS: seis fitas em leque vertical, cada cor num osso
  const cores = [m.sombra(3), m.plano(3), m.luz(3), m.luz(0), m.sombra(2), m.plano(1)];
  cores.forEach((mat, i) => {
    rig.bone('fita' + (i + 1), 'cauda1', [-0.02, 0, 0], [0, (i - 2.5) * 13, 0]);
    rig.add('fita' + (i + 1), pena(0.52 - Math.abs(i - 2.5) * 0.05, 0.075, mat, { rot: [90, 0, 0], esp: 0.03, ponta: 0.9 }));
  });
  // papo-escudo magenta e ouro, capuz na garganta
  rig.add('pescoco', blob([0.09, 0.1, 0.105], m(1), { pos: [0.03, 0.02, 0], seg: 14 }));
  rig.add('tronco', blob([0.07, 0.1, 0.12], m.sombra(3), { pos: [0.15, 0.03, 0], seg: 14 }), blob([0.05, 0.05, 0.09], m.luz(3), { pos: [0.18, -0.03, 0], seg: 12 }));
  rig.add('tronco', calota([0.205, 0.166, 0.155], m.luz(0), { de: 0, ate: 40, pos: [-0.01, 0, 0] }));
  // topete de três gotas (magenta, laranja, amarelo)
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.02, 0], [0, 0, 30]);
  [m.sombra(3), m.plano(3), m.luz(3)].forEach((mat, i) => rig.add('topete', blob([0.035, 0.08 - i * 0.012, 0.035], mat, { pos: [-0.05 * i, 0.06 - i * 0.012, 0], rot: [0, 0, 20 * i], seg: 10 })));
  par((l, s) => {
    rig.add('asa_' + l, blob([0.08, 0.06, 0.028], m(1), { pos: [-0.05, 0, 0.01 * s], seg: 10 }), blob([0.14, 0.03, 0.026], m.sombra(2), { pos: [-0.2, -0.03, 0.012 * s], seg: 10 }));
    rig.add('cabeca', blob([0.035, 0.03, 0.02], m.sombra(3), { pos: [0.06, -0.045, 0.118 * s], seg: 8 }));
  });
  // brilhos soltos (ossos próprios, piscam)
  const br: [number, number, number][] = [[0.3, 0.32, 0.1], [-0.3, 0.4, -0.1], [-0.42, 0.0, 0.14]];
  br.forEach(([x, y, z], i) => {
    rig.bone('brilho' + (i + 1), 'corpo', [x, y, z]);
    rig.add('brilho' + (i + 1), blob([0.012, 0.055, 0.012], m.luz(2), { seg: 6 }), blob([0.055, 0.012, 0.012], m.luz(2), { seg: 6 }), blob([0.012, 0.012, 0.055], m.luz(2), { seg: 6 }));
  });
  return rig;
}

const anims = animsAve({ u: 0.7, hPerna: 0.08, mole: 1.0, flutua: 0.34 }, {
  todas: { ...bate(0.9), brilho1: ls([1, 0.4, 0.01, 0.6]), brilho2: ls([0.01, 0.6, 1, 0.4]), brilho3: ls([0.5, 1, 0.5, 0.01]) },
  idle: { topete: lz([0, 6, 10, -4]), fita1: lz([0, 4, 8, 2]), fita6: lz([0, -4, -8, -2]) },
  especial: { topete: qz([0, 16, 22, -26, -8, 0]), ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => ['fita' + i, qz([0, (i - 3.5) * 3, (i - 3.5) * 5, (i - 3.5) * -9, (i - 3.5) * -3, 0])])) },
  desmaio: { brilho1: qs([1, 0.5, 0.01, 0.01, 0.01]), brilho2: qs([1, 0.5, 0.01, 0.01, 0.01]), brilho3: qs([1, 0.5, 0.01, 0.01, 0.01]) },
});

export const beijaArcoIris = criatura({
  num: 48, id: 'beija-arco-iris', nome: 'Beija-Arco-Íris', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['..ppp', '.pppp', 'pwppp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', 'fpppf', 'fffff'],
    mapa: ['p', 'p'],
  },
});
