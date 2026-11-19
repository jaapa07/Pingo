/**
 * 077 · MANATIM (Rio/Encanto) — filhote de peixe-boi, manso de dar dó, que pasta capim-d'água o dia inteiro.
 * Traços únicos: corpo de pão-doce cinza-azulado · beição de cerdas · rabo redondo de remo ·
 * flor lilás de aguapé no cocuruto · barriga rosada · bolhas subindo.
 */
import { criatura, aquatico, animsAquatico, blob, folha3d, par, m, lz, ls, lp, qs, type V3 } from './kits';

export const paletaManati = {
  rampas: [
    ['#454f6c', '#8796ae', '#c9d5dd'], // 0 couro cinza-azulado
    ['#a78a96', '#eccfc6', '#fff3ea'], // 1 barriga e beiço rosados
    ['#25664a', '#58b650', '#b9e87a'], // 2 algas e folha de aguapé
    ['#8848b0', '#d08ae8', '#ffdcff'], // 3 flor lilás do encanto · bolhas
  ] as [string, string, string][],
  contorno: '#232a44',
  extras: { w: '#ffffff', p: '#1c2036', f: '#8796ae' },
};

export interface ManatiP { k: number; flutua: number; /** graus que o corpo empina (padrão 8) */ ergue?: number }

/** Corpo comum da linha: barril sem dorsal, beição, remo redondo. */
export function corpoManati(p: ManatiP) {
  const k = p.k;
  const kit = aquatico({
    tronco: [0.36 * k, 0.24 * k, 0.24 * k], flutua: p.flutua, ergue: p.ergue ?? 8,
    cabeca: { r: [0.2 * k, 0.185 * k, 0.19 * k], x: 0.78, y: 0.06, gira: -4 },
    cauda: { len: 0.24 * k, r0: 0.16 * k, r1: 0.1 * k, cai: 8 },
    lobos: { len: 0.26 * k, larg: 0.22 * k, abre: 16 },
    nad: { len: 0.24 * k, larg: 0.13 * k, x: 0.36, cai: 34, abre: 34 },
    dorsal: null,
    olho: { r: 0.026, pos: [0.1 * k, 0.07 * k, 0.165 * k] },
    rampas: { pele: 0, barriga: 1 },
  });
  const rig = kit.rig;
  // beição de cerdas: dois gomos rosados + narinas
  par((_, s) => {
    rig.add('cabeca', blob([0.1 * k, 0.1 * k, 0.095 * k], m(1), { pos: [0.15 * k, -0.07 * k, 0.07 * k * s], seg: 14 }));
    rig.add('cabeca', blob([0.018 * k, 0.022 * k, 0.018 * k], m.sombra(0), { pos: [0.21 * k, 0.03 * k, 0.045 * k * s], seg: 6, castShadow: false }));
    // unhas claras na ponta da nadadeira
    rig.add('nad_' + (s > 0 ? 'd' : 'e'), blob([0.05 * k, 0.03 * k, 0.03 * k], m.luz(0), { pos: [-0.02 * k, -0.22 * k, 0], seg: 8 }));
  });
  // remo: disco que une os dois lobos
  rig.add('cauda2', blob([0.2 * k, 0.05 * k, 0.24 * k], m(0), { pos: [-0.22 * k, 0, 0], seg: 18 }));
  // dobrinhas do pescoço
  rig.add('tronco', blob([0.04 * k, 0.2 * k, 0.22 * k], m.sombra(0), { pos: [0.2 * k, 0.03 * k, 0], seg: 12 }));
  return kit;
}

/** Flor de aguapé num osso próprio: três pétalas lilás e miolo claro. */
export function florAguape(rig: ReturnType<typeof corpoManati>['rig'], nome: string, pai: string, pos: V3, r: number, tomba = 0) {
  rig.bone(nome, pai, pos, [0, 0, tomba]);
  rig.add(nome, folha3d(r * 1.6, r * 1.5, m(2), { rot: [0, 0, 70], pos: [0, -r * 0.2, 0], esp: 0.35 }));
  for (const [a, b] of [[-40, 0], [40, 0], [0, 40]] as const) rig.add(nome, folha3d(r * 1.5, r, m(3), { rot: [b, 0, a], esp: 0.5 }));
  rig.add(nome, blob([r * 0.3, r * 0.3, r * 0.3], m.luz(1), { pos: [0, r * 0.5, 0], seg: 8 }));
}
export const bolhasSobem = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => {
  const y: V3[] = [[0, 0, 0], [0, 0.03, 0], [0, 0.06, 0], [0, 0.09, 0]], s = [1, 1.2, 1.4, 0.4];
  return [n, [...lp([...y.slice(i % 4), ...y.slice(0, i % 4)]), ...ls([...s.slice(i % 4), ...s.slice(0, i % 4)])]];
}));
export function bolha(rig: ReturnType<typeof corpoManati>['rig'], nome: string, pos: V3, r: number) {
  rig.bone(nome, 'corpo', pos); rig.add(nome, blob([r, r, r], m.luz(3), { seg: 10 }), blob([r * 0.4, r * 0.4, r * 0.4], m.luz(1), { pos: [r * 0.2, r * 0.3, -r * 0.5], seg: 6 }));
}

function build() {
  const { rig, ref } = corpoManati({ k: 0.9, flutua: 0.34, ergue: 40 });
  // barrigão rosado bem à mostra, agora que ele flutua empinado
  rig.add('tronco', blob([0.2, 0.17, 0.19], m(1), { pos: [0.1, -0.09, 0], seg: 14 }));
  florAguape(rig, 'flor', 'cabeca', [ref.melao[0] - 0.08, ref.melao[1] + 0.0, 0], 0.11, 10);
  bolha(rig, 'bolha1', [0.4, 0.5, 0.12], 0.045); bolha(rig, 'bolha2', [0.24, 0.62, -0.1], 0.032);
  return rig;
}

const anims = animsAquatico({ u: 0.6, flutua: 0.12, mole: 1.3 }, {
  idle: { ...bolhasSobem(['bolha1', 'bolha2']), flor: lz([0, 4, 8, 3]) },
  especial: { flor: qs([1, 1.3, 1.6, 2, 1.3, 1]) },
});

export const manatim = criatura({
  num: 77, id: 'manatim', nome: 'Manatim', porte: 'P', estagio: 'basico', paleta: paletaManati, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
