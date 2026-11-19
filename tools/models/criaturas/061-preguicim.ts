/**
 * 061 · PREGUICIM (Comum/Mente) — preguiça-de-três-dedos filhote, sempre meio sonhando.
 * Traços únicos: máscara escura em faixa descendo dos olhos · três garras-gancho claras em cada braço ·
 * espiral lilás na testa (o "sonho" do tipo Mente) · topete despenteado e um tufinho de musgo nas costas.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, tufo, ring, par, m, lz, qz, qr, D2R, type Rig, type V3 } from './kits';

export const paletaPreguica = {
  rampas: [
    ['#5b4a5e', '#9c8676', '#cdbb9a'], // 0 pelo cinza-castanho (sombra arroxeada)
    ['#b9a48c', '#f1e2c2', '#fffaf0'], // 1 creme do rosto, peito e garras
    ['#2f6b4a', '#5fae4e', '#b4e06a'], // 2 musgo
    ['#7a4fa8', '#c08af0', '#f0d2ff'], // 3 lilás do sonho e das flores
  ] as [string, string, string][],
  contorno: '#2c2136',
  extras: { w: '#ffffff', p: '#2c2136', f: '#f1e2c2', a: '#c08af0' },
};

export interface PreguicaP { k: number; cabeca: V3; bracos: number; garras: number; curva: number }

/** Corpo comum da linha: sentada, braços compridos de ganchos, rosto em disco com máscara e sorriso. */
export function corpoPreguica(p: PreguicaP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.2 * k, 0.24 * k, 0.21 * k], curva: p.curva,
    pernas: { alt: 0.13 * k, r: 0.065 * k, pe: 0.09 * k },
    bracos: { len: p.bracos, r: 0.062 * k, mao: 0.06 * k, garras: p.garras },
    cabeca: p.cabeca, rosto: 0.78, focinho: { len: cx * 0.3, r: cy * 0.28 },
    olho: { r: 0.03, pos: [cx * 0.82, cy * 0.1, cz * 0.48] },
    rampas: { pelo: 0, barriga: 1, rosto: 1, maos: 0, garras: 1 },
  });
  const rig = kit.rig;
  // máscara: faixa escura que desce do olho para a bochecha, e nariz
  par((_, s) => rig.add('cabeca', blob([cx * 0.16, cy * 0.2, cz * 0.4], m.sombra(0), { pos: [cx * 0.72, -cy * 0.0, cz * 0.62 * s], rot: [0, -36 * s, -22], seg: 12 })));
  rig.add('cabeca', blob([cx * 0.13, cy * 0.11, cz * 0.16], m.plano(0), { pos: [cx * 1.1, -cy * 0.22, 0], seg: 10 }));
  // espiral do sonho na testa
  rig.add('cabeca', ring(cy * 0.15, cy * 0.06, m.plano(3), { pos: [cx * 0.84, cy * 0.56, 0], rot: [0, 90, 30] }),
    blob([cy * 0.06, cy * 0.06, cy * 0.06], m.luz(3), { pos: [cx * 0.9, cy * 0.55, 0], seg: 8 }));
  return kit;
}

export const sonha = (rig: Rig) => { rig.bones.cabeca.rotation.x = 8 * D2R; rig.bones.cabeca.rotation.z = -6 * D2R; };

/** Braçadas contidas para braços compridos (as do kit estouram a célula) — vale para a linha toda e para os macacos. */
export const bracosCurtos = {
  fisico: { braco_e: qr([[0, 0, -16], [0, 0, -40], [0, 0, 44], [0, 0, 20], [0, 0, 0]]), antebraco_e: qz([-20, -40, 16, 6, 0]) },
  especial: {
    braco_d: qr([[0, 0, 8], [10, 0, 20], [10, 0, 20], [-16, 0, 70], [-8, 0, 34], [0, 0, 0]]), braco_e: qr([[0, 0, 8], [-10, 0, 20], [-10, 0, 20], [16, 0, 70], [8, 0, 34], [0, 0, 0]]),
    antebraco_d: qz([14, 34, 34, 6, 10, 0]), antebraco_e: qz([14, 34, 34, 6, 10, 0]),
  },
  entrada: { braco_d: qz([-24, -50, 14, -5, 0]), braco_e: qz([-24, -50, 14, -5, 0]) },
  dano: { braco_d: qz([30, 10, 0]), braco_e: qz([36, 12, 0]) },
};

function build() {
  const { rig, ref } = corpoPreguica({ k: 0.92, cabeca: [0.25, 0.225, 0.25], bracos: 0.6, garras: 3, curva: 14 });
  // topete despenteado
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.04, 0], [0, 0, 14]);
  rig.add('topete', tufo(3, 0.17, 0.075, m(0), { abre: 38 }));
  // tufo de musgo nas costas, com dois brotos para fora da silhueta
  rig.bone('musgo', 'tronco', [-0.16, 0.1, 0], [0, 0, 62]);
  rig.add('musgo', blob([0.1, 0.07, 0.13], m(2)), tufo(3, 0.15, 0.06, m.luz(2), { abre: 40 }));
  sonha(rig);
  return rig;
}

const anims = animsArboricola({ u: 0.7, hPerna: 0.12, mole: 1.3 }, unirExtras(bracosCurtos, {
  idle: { topete: lz([0, 5, 9, 3]), musgo: lz([0, -5, -8, -2]) },
  especial: { topete: qz([0, 12, 16, -22, -8, 0]) },
  andar: { topete: lz([0, 8, 0, -8]) },
}));

export const preguicim = criatura({
  num: 61, id: 'preguicim', nome: 'Preguicim', porte: 'P', estagio: 'basico', paleta: paletaPreguica, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['....', 'p..p', '.pp.', '....'],
    mapa: ['p', 'p'],
  },
});
