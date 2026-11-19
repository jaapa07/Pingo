/**
 * 171 · NOITIM (Assombro/Mente) — macaco-da-noite filhote, o único macaco noturno das Américas.
 * Traços: olhões redondos de coruja · máscara branca com três riscas escuras subindo pela testa ·
 * barriga alaranjada · cauda comprida e grossa de ponta escura, com um fiapo de assombro lilás ·
 * mãos juntas no peito, de quem acabou de acordar.
 */
import { criatura, arboricola, animsArboricola, unirExtras, blob, chama, par, m, lz, qz, ls, D2R, type V3, type Rig } from './kits';
import { bracosCurtos } from './061-preguicim';

export const paletaNoite = {
  rampas: [
    ['#342d4e', '#6b6788', '#a9a7c0'], // 0 pelo cinza-noite
    ['#b4abc2', '#f5efe6', '#ffffff'], // 1 máscara branca
    ['#a44e2e', '#ee923e', '#ffd27c'], // 2 barriga alaranjada e íris
    ['#1e1734', '#3a2e5c', '#9a78e0'], // 3 riscas escuras e assombro lilás (a luz é o brilho)
  ] as [string, string, string][],
  contorno: '#1b1530',
  extras: { w: '#ffffff', p: '#1b1530', f: '#a9a7c0', a: '#ee923e', l: '#ffd27c' },
};

export interface NoiteP { k: number; cabeca: V3; bracos: number; cauda: number; olho: number }

/** Corpo comum da linha: agachado, cabeça redonda, máscara branca de três riscas, barriga laranja, caudão. */
export function corpoNoite(p: NoiteP) {
  const k = p.k, [cx, cy, cz] = p.cabeca;
  const kit = arboricola({
    tronco: [0.17 * k, 0.2 * k, 0.18 * k], curva: 22,
    pernas: { alt: 0.12 * k, r: 0.06 * k, pe: 0.085 * k },
    bracos: { len: p.bracos, r: 0.05 * k, mao: 0.055 * k },
    cabeca: p.cabeca, rosto: 0.7, focinho: { len: cx * 0.22, r: cy * 0.2 },
    orelha: { r: cy * 0.22, z: 0.92, y: 0.1 },
    cauda: { segs: 3, len: p.cauda, r0: 0.065 * k, r1: 0.055 * k, ang: 24, curva: 52 },
    olho: { r: p.olho, pos: [cx * 0.86, cy * 0.12, cz * 0.44] },
    rampas: { pelo: 0, barriga: 2, rosto: 1, maos: 3, cauda: 0, caudaPonta: 3, orelha: 0 },
  });
  const rig = kit.rig;
  // três riscas escuras: uma no meio da testa, duas pelos lados dos olhos
  rig.add('cabeca', blob([cx * 0.3, cy * 0.4, cz * 0.1], m.plano(3), { pos: [cx * 0.5, cy * 0.74, 0], rot: [0, 0, -38], seg: 10 }));
  par((_, s) => rig.add('cabeca', blob([cx * 0.26, cy * 0.4, cz * 0.1], m.plano(3), { pos: [cx * 0.3, cy * 0.6, cz * 0.78 * s], rot: [18 * s, 0, -30], seg: 10 })));
  rig.add('cabeca', blob([cx * 0.1, cy * 0.08, cz * 0.12], m.plano(3), { pos: [cx * 1.06, -cy * 0.26, 0], seg: 8 }));
  return kit;
}

/** Fiapo de assombro na ponta da cauda. */
export function fiapo(rig: Rig, nome: string, pai: string, pos: V3, alt: number, r: number, rot: V3 = [0, 0, 60]) {
  rig.bone(nome, pai, pos, rot);
  rig.add(nome, chama(alt, r, m.luz(3), { curva: 30 }), chama(alt * 0.5, r * 0.55, m(1), { scale: [1, 1, 1.9] }));
}
export const treme = (f: number) => ls([[1, 1, 1], [0.9, 1.16, 0.9], [1.06, 0.88, 1.06], [0.95, 1.08, 0.95]].map((_, i, v) => v[(i + f) % 4] as V3));

function build() {
  const { rig } = corpoNoite({ k: 1, cabeca: [0.25, 0.23, 0.25], bracos: 0.5, cauda: 0.42, olho: 0.05 });
  // mãos juntas no peito
  rig.bones.braco_e.rotation.z = 50 * D2R; rig.bones.antebraco_e.rotation.z = 70 * D2R;
  rig.bones.braco_d.rotation.z = 50 * D2R; rig.bones.antebraco_d.rotation.z = 70 * D2R;
  fiapo(rig, 'fiapo', 'cauda3', [-0.14, 0, 0], 0.22, 0.075, [0, 0, -40]);
  return rig;
}

const anims = animsArboricola({ u: 0.65, hPerna: 0.12, mole: 1.3 }, unirExtras(bracosCurtos, {
  todas: { fiapo: treme(0) },
  idle: { cabeca: lz([0, 2, 4, 1]) },
  especial: { fiapo: ls([1, 1.2, 1.5, 1.9, 1.3, 1]) },
}));

export const noitim = criatura({
  num: 171, id: 'noitim', nome: 'Noitim', porte: 'P', estagio: 'basico', paleta: paletaNoite, build, anims,
  olho: {
    frente: ['.aaaa.', 'aappwa', 'appppa', 'appppa', 'aappaa', '.aaaa.'],
    fechado: ['ffffff', 'ffffff', 'pffffp', 'fppppf', 'ffffff', 'ffffff'],
    mapa: ['a', 'p'],
  },
});
void qz;
