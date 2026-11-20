/**
 * 055 · URUBUZIM (Vento/Assombro) — filhote de urubu, uma bola de penugem creme de cara pelada.
 * Traços únicos: corpo de penugem creme · cabeça pelada escura com um tufinho no cocuruto · gola fofa ·
 * pescoço pelado esticado para a frente e ombros corcundas · asas creme de pontas pretas · bico e pés alaranjados · fogo-fátuo lilás que o segue.
 */
import { asasContidas } from './051-ararinha';
import { criatura, ave, animsAve, blob, tufo, chamaDupla, par, m, lz, lp, ls, qz, qs, type V3, unirExtras } from './kits';

export const paletaUrubu = {
  rampas: [
    ['#a3938f', '#efe5d4', '#ffffff'], // 0 penugem creme
    ['#1b1725', '#3a3447', '#655f7b'], // 1 penas e pele negras
    ['#b62f2a', '#f07a2a', '#ffd040'], // 2 laranja do bico e dos pés · cabeça do rei
    ['#4a2a7c', '#8b58d2', '#d2b2ff'], // 3 assombro lilás
  ] as [string, string, string][],
  contorno: '#1a1424',
  extras: { w: '#ffffff', p: '#120e1a', f: '#3a3447', a: '#d2b2ff' },
};

/** Fogo-fátuo num osso próprio. */
export function fatuo(rig: ReturnType<typeof ave>['rig'], nome: string, pai: string, pos: V3, alt: number, tomba = 0) {
  rig.bone(nome, pai, pos, [0, 0, tomba]);
  rig.add(nome, ...chamaDupla(alt, alt * 0.36, m(3), m.luz(3), { curva: 26 }));
}
export const fatuoAnda = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const v: V3[] = [[1, 1, 1], [0.9, 1.2, 0.9], [1.08, 0.86, 1.08], [0.94, 1.1, 0.94]], y: V3[] = [[0, 0, 0], [0, 0.02, 0], [0, 0.04, 0], [0, 0.015, 0]];
  return [n, [...ls([...v.slice(i % 4), ...v.slice(0, i % 4)]), ...lp([...y.slice(i % 4), ...y.slice(0, i % 4)])]];
}));

function build() {
  const { rig, ref } = ave({
    corpo: [0.23, 0.19, 0.19], ergue: 26,
    pescoco: { len: 0.2, ang: 52, r: 0.065 },
    cabeca: [0.125, 0.115, 0.115],
    bico: { len: 0.2, r: 0.062, y: -0.1, gancho: 70, achata: 0.75, inferior: 0.55 },
    asa: { len: 0.3, larg: 0.19, cai: 30, ponta: 0.5 },
    cauda: { len: 0.14, larg: 0.1, ang: -6, penas: 3, abre: 16 },
    pernas: { alt: 0.17, r: 0.034, z: 0.5, dedo: 0.1 },
    olho: { r: 0.026, pos: [0.075, 0.03, 0.095] },
    rampas: { corpo: 0, peito: 0, cabeca: 1, asa: 0, asaPonta: 1, cauda: 1, bico: 2, perna: 2 },
  });
  // corcunda de urubu: ombros da asa acima da linha da cabeça
  par((l, s) => {
    rig.add('asa_' + l, blob([0.11, 0.1, 0.07], m(0), { pos: [-0.02, 0.07, 0.02 * s], seg: 12 }), blob([0.13, 0.03, 0.05], m(1), { pos: [-0.2, -0.1, 0.03 * s], rot: [0, 0, 8], seg: 10 }));
  });
  rig.add('pescoco', blob([0.06, 0.07, 0.06], m(1), { pos: [0.06, 0.08, 0], seg: 10 }));
  // gola fofa: cacho de penugem em volta do pescoço
  for (const [x, z, r] of [[0.06, 0, 0.075], [0.01, 0.08, 0.07], [0.01, -0.08, 0.07], [-0.06, 0.04, 0.07], [-0.06, -0.04, 0.07]] as const)
    rig.add('pescoco', blob([r, r * 0.8, r], m.luz(0), { pos: [x, -0.03, z], seg: 12 }));
  // penugem do corpo: flocos saltados
  rig.add('tronco', blob([0.08, 0.07, 0.09], m(0), { pos: [-0.2, -0.02, 0], seg: 10 }));
  // tufinho do cocuruto e ponta escura do bico
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.02, 0], [0, 0, 16]);
  rig.add('topete', tufo(3, 0.08, 0.04, m(0), { abre: 36 }));
  rig.add('cabeca', blob([0.035, 0.035, 0.035], m.sombra(1), { pos: [ref.pontaBico[0] - 0.03, ref.pontaBico[1] - 0.04, 0], seg: 8 }));
  fatuo(rig, 'fatuo', 'corpo', [-0.3, 0.3, 0.1], 0.17, 10);
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.17, mole: 1.4 }, unirExtras(asasContidas, {
  todas: fatuoAnda(['fatuo']),
  idle: { topete: lz([0, 6, 12, -4]) },
  especial: { topete: qz([0, 16, 22, -28, -10, 0]), fatuo: qs([1, 1.2, 1.4, 1.7, 1.3, 1]) },
  dano: { topete: qz([28, 10, 0]) },
}));

// 3ª rodada: asas do especial e do desmaio abertas demais apertavam o enquadre (64–66%)
for (const v of [anims.frente, anims.costas]) { const a = v['ataque-especial']; v['ataque-especial'] = { ...a, keys: Object.fromEntries(Object.entries(a.keys).map(([o, ks]) => [o, /^asa/.test(o) ? ks.map((q) => (q.r ? { ...q, r: q.r.map((x) => x * 0.6) as [number, number, number] } : q)) : ks])) }; }
for (const v of [anims.frente, anims.costas]) { const a = v['desmaio']; v['desmaio'] = { ...a, keys: Object.fromEntries(Object.entries(a.keys).map(([o, ks]) => [o, /^asa/.test(o) ? ks.map((q) => (q.r ? { ...q, r: q.r.map((x) => x * 0.55) as [number, number, number] } : q)) : ks])) }; }

export const urubuzim = criatura({
  num: 55, id: 'urubuzim', nome: 'Urubuzim', porte: 'P', estagio: 'basico', paleta: paletaUrubu, build, anims,
  olho: {
    frente: ['.aa.', 'apwa', 'appa', '.aa.'],
    fechado: ['ffff', 'afff', 'faaf', 'ffff'],
    mapa: ['a', 'p'],
  },
});
