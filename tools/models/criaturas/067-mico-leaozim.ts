/**
 * 067 · MICO-LEÃOZIM (Brasa/Ginga) — mico-leão-dourado filhote.
 * Traços únicos: juba dourada em coroa de mechas ao redor do rosto escuro · cauda fina e muito comprida
 * com pincel em brasa · mãozinhas e pés escuros · corpo miúdo de cabeça enorme.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, chama, chamaDupla, m, lz, type Mat, type Rig, type V3 } from './kits';
import { bracosCurtos } from './061-preguicim';
import { tremula } from './004-guaraxim';

export const paletaMico = {
  rampas: [
    ['#b0402c', '#f08a22', '#ffc446'], // 0 pelo dourado-alaranjado
    ['#3c2233', '#6e4048', '#a8736a'], // 1 rosto, mãos e pés
    ['#ff6418', '#ffd034', '#fff8b4'], // 2 brasa e chama
    ['#d8963c', '#ffdc8c', '#fff6d2'], // 3 dourado claro do peito e das pontas da juba
  ] as [string, string, string][],
  contorno: '#321624',
  extras: { w: '#ffffff', p: '#321624', f: '#6e4048', a: '#ffd034' },
};

export interface MicoP { k: number; cabeca: V3; bracos: number; curva: number; cauda: number; caudaAng?: number }

export function corpoMico(p: MicoP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.16 * k, 0.2 * k, 0.17 * k], curva: p.curva,
    pernas: { alt: 0.15 * k, r: 0.055 * k, pe: 0.085 * k },
    bracos: { len: p.bracos, r: 0.05 * k, mao: 0.055 * k },
    cabeca: p.cabeca, rosto: 0.5, focinho: { len: cx * 0.26, r: cy * 0.26 },
    cauda: { segs: 4, len: p.cauda, r0: 0.04 * k, r1: 0.034 * k, ang: p.caudaAng ?? 38, curva: -24 },
    olho: { r: 0.027, pos: [cx * 0.92, cy * 0.1, cz * 0.34] },
    rampas: { pelo: 0, barriga: 3, rosto: 1, maos: 1, cauda: 0 },
  });
  return kit;
}

/** Juba em coroa: `n` mechas radiais em volta do rosto (cada uma devolvida pela fábrica `mecha`). */
export function juba(rig: Rig, cab: V3, n: number, mecha: (i: number, len: number) => { osso?: string; pecas: ReturnType<typeof blob>[] }, len: number, de = -150, ate = 150) {
  const [cx, cy, cz] = cab;
  for (let i = 0; i < n; i++) {
    const g = de + ((ate - de) * i) / (n - 1), a = (g * Math.PI) / 180;
    const k = 1 - Math.abs(g) / 400;
    const { osso, pecas } = mecha(i, len * k);
    const nome = osso ?? 'juba' + i;
    rig.bone(nome, 'cabeca', [-cx * 0.05, Math.cos(a) * cy * 0.78, Math.sin(a) * cz * 0.78], [g, 0, 26]);
    rig.add(nome, ...pecas);
  }
}
export const mechaPelo = (mat: Mat, r: number) => (_: number, len: number) => ({ pecas: [chama(len, r, mat)] });

function build() {
  const cab: V3 = [0.2, 0.19, 0.2];
  const { rig } = corpoMico({ k: 0.9, cabeca: cab, bracos: 0.5, curva: 26, cauda: 0.62 });
  juba(rig, cab, 7, (i, len) => ({ pecas: [chama(len, 0.085, i % 2 ? m.luz(0) : m(0))] }), 0.2);
  rig.add('cabeca', blob([0.14, 0.18, 0.2], m(0), { pos: [-0.1, 0, 0] }));
  // pincel em brasa na ponta da cauda
  rig.bone('chama1', 'cauda4', [-0.16, 0, 0], [0, 0, 80]);
  rig.add('chama1', ...chamaDupla(0.2, 0.075, m.plano(2), m.luz(2), { curva: 14 }));
  return rig;
}

const anims = animsArboricola({ u: 0.7, hPerna: 0.13, mole: 1.3, caudaSegs: 3 }, unirExtras(bracosCurtos, {
  todas: tremula(['chama1']),
  idle: { juba3: lz([0, 3, 6, 2]) },
}));

export const micoLeaozim = criatura({
  num: 67, id: 'mico-leaozim', nome: 'Mico-Leãozim', porte: 'P', estagio: 'basico', paleta: paletaMico, build, anims,
  olho: {
    frente: ['fwwf', 'wwpp', 'wwpp', 'fwwf'],
    fechado: ['ffff', 'pffp', 'fppf', 'ffff'],
    mapa: ['w', 'p'],
  },
});
