/**
 * 157 · LOUVADEUZIM (Inseto/Ginga) — louva-a-deus filhote que treina golpes com as foices.
 * Traços únicos: foices dobradas em guarda com lâmina clara · cabeça triangular de olhões nos cantos ·
 * cordão de ginga na cintura com pontas ao vento · abdômen arrebitado de folha.
 * O construtor `louva` é reaproveitado pelo estágio final (158).
 */
import { criatura, inseto, animsInseto, blob, calota, pena, ring, segmento, folha3d, par, m, lz, qz, qr, type Rig, type V3 } from './kits';

export const paletaLouva = {
  rampas: [
    ['#256652', '#58ad48', '#b6e267'], // 0 verde-folha (sombra azulada, luz amarelada)
    ['#a9a060', '#eee59c', '#fffbd8'], // 1 creme do ventre e das lâminas
    ['#8f2a52', '#dc4b5c', '#ff9c84'], // 2 faixa de ginga
    ['#2a2342', '#4b4268', '#807aa6'], // 3 olhos, antenas e pontas das patas
  ] as [string, string, string][],
  contorno: '#231d38',
  extras: { w: '#ffffff', p: '#231d38', f: '#58ad48', a: '#eee59c' },
};

export interface LouvaP { /** escala geral */ k: number; /** altura do protórax */ pro: number; /** comprimento da lâmina */ foice: number; /** comprimento das pontas da faixa */ faixa: number; alt: number }

/** Louva-a-deus: tórax do kit + protórax erguido, foices nos ossos do 1º par de patas e cordão na cintura. */
export function louva(p: LouvaP): { rig: Rig; topo: V3 } {
  const k = p.k;
  const { rig } = inseto({
    torax: [0.11 * k, 0.09 * k, 0.09 * k], abdomen: [0.2 * k, 0.095 * k, 0.11 * k], cabeca: [0.115 * k, 0.11 * k, 0.17 * k],
    alt: p.alt, caiAbdomen: -22,
    patas: { abre: 0.2 * k, r: 0.026 * k, joelho: 0.09 * k },
    antenas: { len: 0.16 * k, r: 0.014 * k, abre: 30 },
    olho: { r: 0.024 * k, pos: [0.115 * k, 0.04 * k, 0.158 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 0, antenas: 3, barriga: 1 },
  });
  // protórax erguido: a cabeça sobe e vai para a frente
  const cab: V3 = [0.14 * k, p.pro, 0];
  rig.bones.cabeca.position.set(...cab);
  rig.add('corpo', segmento([0.04 * k, 0.02 * k, 0], [cab[0] - 0.01 * k, cab[1] - 0.03 * k, 0], 0.075 * k, 0.06 * k, m(0)),
    segmento([0.09 * k, 0, 0], [cab[0] + 0.03 * k, cab[1] - 0.08 * k, 0], 0.05 * k, 0.04 * k, m(1)));
  // queixo fino (cabeça triangular) e olhões escuros nos cantos
  rig.add('cabeca', blob([0.07 * k, 0.07 * k, 0.07 * k], m(0), { pos: [0.09 * k, -0.07 * k, 0], seg: 14 }));
  par((_, s) => rig.add('cabeca', blob([0.055 * k, 0.066 * k, 0.05 * k], m.plano(3), { pos: [0.08 * k, 0.035 * k, 0.122 * k * s], seg: 14 })));
  // FOICES: reaproveitam os ossos pata1/tarso1 (as animações do kit já golpeiam com eles)
  par((l, s) => {
    const a = rig.bones['pata1_' + l], b = rig.bones['tarso1_' + l];
    a.clear(); b.clear(); a.add(b);
    a.position.set(cab[0] - 0.03 * k, cab[1] - 0.15 * k, 0.1 * k * s);
    const cot: V3 = [0.13 * k, -0.1 * k, 0.03 * k * s];
    b.position.set(...cot);
    rig.add('pata1_' + l, segmento([0, 0, 0], cot, 0.04 * k, 0.05 * k, m(0)));
    rig.add('tarso1_' + l,
      segmento([0, 0, 0], [0.03 * k, p.foice, 0], 0.055 * k, 0.03 * k, m(0)),
      blob([0.026 * k, p.foice * 0.48, 0.03 * k], m(1), { pos: [0.055 * k, p.foice * 0.5, 0], seg: 10 }),
      blob([0.03 * k, 0.03 * k, 0.03 * k], m.plano(3), { pos: [0.035 * k, p.foice + 0.01 * k, 0], seg: 8 }));
  });
  // abdômen de folha: nervura clara e ponta arrebitada
  rig.add('abdomen', folha3d(0.2 * k, 0.15 * k, m.luz(0), { pos: [-0.25 * k, 0.03 * k, 0], rot: [0, 0, 78], esp: 0.6 }),
    calota([0.205 * k, 0.1 * k, 0.115 * k], m.sombra(0), { de: 0, ate: 50, pos: [-0.16 * k, 0.004, 0] }));
  // pontas escuras das patas de andar
  par((l) => { for (const i of [2, 3]) rig.add(`tarso${i}_${l}`, blob([0.03 * k, 0.022 * k, 0.03 * k], m.plano(3), { pos: [0, -(0.09 * k + p.alt - 0.027 * k) + 0.015, 0.09 * k * (l === 'd' ? 1 : -1)], seg: 8 })); });
  // CORDÃO de ginga na cintura (entre tórax e abdômen) + duas pontas num osso próprio
  rig.add('corpo', ring(0.1 * k, 0.034 * k, m(2), { pos: [-0.07 * k, 0, 0], rot: [0, 90, 0] }));
  rig.bone('faixa', 'corpo', [-0.08 * k, 0.02 * k, -0.1 * k], [0, 0, 60]);
  rig.add('faixa', pena(p.faixa, 0.075 * k, m(2), { esp: 0.035 * k, rot: [0, 0, -10] }), pena(p.faixa * 0.75, 0.065 * k, m.luz(2), { esp: 0.035 * k, rot: [0, 0, 30] }),
    blob([0.045 * k, 0.045 * k, 0.045 * k], m.luz(2), { seg: 8 }));
  return { rig, topo: [0.06 * k, 0.1 * k, 0] };
}

/** Animações comuns da linha: foices em guarda que respiram, faixa ao vento. */
export const gingaLouva = {
  idle: { faixa: lz([0, 8, 14, 5]), tarso1_e: lz([0, -5, -9, -3]), tarso1_d: lz([0, -3, -6, -2]) },
  fisico: { faixa: qz([10, 20, -24, -8, 0]), pata1_e: qr([[0, 0, 30], [0, 0, 50], [0, 0, -40], [0, 0, -20], [0, 0, 0]]), tarso1_e: qz([-10, -20, -70, -30, 0]), pata1_d: qr([[0, 0, 10], [0, 0, 16], [0, 0, -10], [0, 0, -4], [0, 0, 0]]) },
  especial: { faixa: qz([0, 10, 14, -26, -10, 0]), pata1_e: qz([10, 30, 40, -30, -10, 0]), pata1_d: qz([10, 30, 40, -30, -10, 0]), tarso1_e: qz([0, -10, -10, -60, -20, 0]), tarso1_d: qz([0, -10, -10, -60, -20, 0]) },
  dano: { faixa: qz([30, 12, 0]) },
  desmaio: { abdomen: qz([0, -8, -24, -44, -40]), cabeca: qz([0, 10, 30, 50, 46]), pata1_e: qz([0, 10, 30, 60, 56]), pata1_d: qz([0, 10, 30, 60, 56]), faixa: qz([0, 10, 30, 50, 46]) },
  andar: { faixa: lz([0, 10, 0, 10]), pata1_d: lz([0, 4, 0, 4]), pata1_e: lz([4, 0, 4, 0]) },
};

const anims = animsInseto({ u: 0.6, alt: 0.2, mole: 1.2 }, gingaLouva);

export const louvadeuzim = criatura({
  num: 157, id: 'louvadeuzim', nome: 'Louvadeuzim', porte: 'P', estagio: 'basico', paleta: paletaLouva, anims,
  build: () => louva({ k: 1, pro: 0.27, foice: 0.18, faixa: 0.2, alt: 0.2 }).rig,
  olho: {
    frente: ['.aa.', 'aawa', 'aapa', '.aa.'],
    fechado: ['pppp', 'pppp', 'appa', 'pppp'],
    mapa: ['a', 'p'],
  },
});
