/**
 * 061 · PREGUICIM (Comum/Mente) — preguiça-de-três-dedos filhote, sempre meio sonhando.
 * Traços únicos: máscara escura em faixa descendo dos olhos · três garras-gancho claras em cada braço ·
 * espiral lilás na testa (o "sonho" do tipo Mente) · topete despenteado e um tufinho de musgo nas costas.
 */
import { criatura, arboricola, animsArboricola, blob, calota, tufo, ring, par, m, lz, qz, ls, qs, D2R, type Rig, type V3 } from './kits';

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
    olho: { r: 0.028, pos: [cx * 0.8, cy * 0.08, cz * 0.5] },
    rampas: { pelo: 0, barriga: 1, rosto: 1, maos: 0, garras: 1 },
  });
  const rig = kit.rig;
  // máscara: faixa escura que desce do olho para a bochecha, e nariz
  par((_, s) => rig.add('cabeca', blob([cx * 0.2, cy * 0.18, cz * 0.34], m.sombra(0), { pos: [cx * 0.7, -cy * 0.02, cz * 0.6 * s], rot: [0, -34 * s, -18], seg: 12 })));
  rig.add('cabeca', blob([cx * 0.13, cy * 0.11, cz * 0.16], m.plano(0), { pos: [cx * 1.1, -cy * 0.22, 0], seg: 10 }));
  // espiral do sonho na testa
  rig.add('cabeca', ring(cy * 0.2, cy * 0.075, m.plano(3), { pos: [cx * 0.86, cy * 0.52, 0], rot: [0, 90, 28] }),
    blob([cy * 0.07, cy * 0.07, cy * 0.07], m.luz(3), { pos: [cx * 0.93, cy * 0.5, 0], seg: 8 }));
  return kit;
}

export const sonha = (rig: Rig) => { rig.bones.cabeca.rotation.x = 8 * D2R; rig.bones.cabeca.rotation.z = -6 * D2R; };

function build() {
  const { rig, ref } = corpoPreguica({ k: 1, cabeca: [0.2, 0.19, 0.21], bracos: 0.62, garras: 3, curva: 16 });
  // topete despenteado
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.03, ref.topo[1] - 0.03, 0], [0, 0, 20]);
  rig.add('topete', tufo(3, 0.11, 0.05, m(0), { abre: 34 }));
  // tufinho de musgo nas costas com um broto
  rig.add('tronco', calota([0.21, 0.25, 0.22], m(2), { de: 0, ate: 42, rot: [0, 0, 62] }));
  rig.bone('musgo', 'tronco', [-0.14, 0.17, 0], [0, 0, 40]);
  rig.add('musgo', tufo(2, 0.1, 0.04, m.luz(2), { abre: 30 }));
  sonha(rig);
  return rig;
}

const anims = animsArboricola({ u: 0.7, hPerna: 0.13, mole: 1.3 }, {
  idle: { topete: lz([0, 5, 9, 3]), musgo: lz([0, -5, -8, -2]) },
  especial: { topete: qz([0, 12, 16, -22, -8, 0]) },
  andar: { topete: lz([0, 8, 0, -8]) },
});

export const preguicim = criatura({
  num: 61, id: 'preguicim', nome: 'Preguicim', porte: 'P', estagio: 'basico', paleta: paletaPreguica, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', 'fppf'],
    fechado: ['ffff', 'ffff', 'pppp', 'ffff'],
    mapa: ['p', 'p'],
  },
});
void ls; void qs;
