/**
 * 090 · CORALZINHA (Veneno/Encanto) — cobra-coral de anéis luminosos. Estágio único.
 * Traços únicos: tríades de anéis (preto · claro luminoso · preto) sobre o vermelho ·
 * cauda enrolada e erguida como uma segunda cabeça (o truque da coral) ·
 * dois aros de luz flutuando em volta do pescoço e da cauda · estrelinhas de encanto.
 */
import { criatura, serpente, animsSerpente, blob, ring, par, m, lz, ls, lp, qz, qs, type V3, type Rig } from './kits';
import { gomo, extrasCobra } from './086-sucurizinha';

const paleta = {
  rampas: [
    ['#8a1f45', '#e23a3f', '#ff8660'], // 0 vermelho-coral (sombra vinho)
    ['#1a1730', '#302b48', '#56507c'], // 1 anéis pretos azulados e focinho
    ['#ff9ad8', '#fff3cc', '#ffffff'], // 2 anéis luminosos (halo rosado)
    ['#6a58d2', '#9fe9ff', '#ecffff'], // 3 aros de luz e estrelinhas
  ] as [string, string, string][],
  contorno: '#2a1430',
  extras: { w: '#ffffff', p: '#1a1730', f: '#e23a3f' },
};

const CURVA = [70, 34, -52];

/** Tríade preto-claro-preto abraçando o gomo inteiro. */
function triade(rig: Rig, osso: string, x: number, y: number, r: number, k = 1) {
  rig.add(osso, blob([r * 0.62 * k, r * 1.07, r * 1.07], m(1), { pos: [x, y, 0], seg: 14 }));
  rig.add(osso, blob([r * 0.24 * k, r * 1.15, r * 1.15], m.luz(2), { pos: [x, y, 0], seg: 14, castShadow: false }));
}

function estrela(rig: Rig, nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos);
  rig.add(nome, blob([r, r * 0.3, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r * 0.3, r, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r * 0.45, r * 0.45, r * 0.45], m.luz(2), { seg: 8, castShadow: false }));
}

function build() {
  const r = 0.085, rF = 0.045, N = 7, len = 0.15;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.15, curva: CURVA, rFim: 0.078 },
    cauda: { segs: N, len, curva: [40, -75, -65, 70, 60, 0, 0], rFim: rF },
    cabeca: [0.15, 0.1, 0.115],
    olho: { r: 0.026, pos: [0.085, 0.06, 0.085] },
    rampas: { corpo: 0, cabeca: 0 },
  });
  // cauda-isca: os três últimos gomos sobem e se enrolam
  rig.bones.cauda5.rotation.z = -1.0; rig.bones.cauda6.rotation.z = -1.1; rig.bones.cauda7.rotation.z = -1.3;
  rig.add('cauda7', blob([0.06, 0.055, 0.055], m(1), { pos: [-len, rF - r, 0], seg: 12 }));
  // tríades no corpo e no pescoço
  for (let i = 1; i <= N; i++) { const g = gomo(r, rF, N, i); triade(rig, 'cauda' + i, -len / 2, g.y, g.rm, i > 4 ? 0.8 : 1); }
  triade(rig, 'pescoco1', 0.09, 0, 0.084); triade(rig, 'pescoco2', 0.08, 0, 0.081); triade(rig, 'pescoco3', 0.07, 0, 0.078, 0.8);
  // cabeça: focinho preto, faixa clara atrás do olho
  rig.add('cabeca', blob([0.09, 0.085, 0.1], m(1), { pos: [0.17, 0.005, 0], seg: 14 }));
  rig.add('cabeca', blob([0.03, 0.108, 0.125], m.luz(2), { pos: [0.03, 0.012, 0], seg: 14, castShadow: false }));
  par((_, s) => rig.add('cabeca', blob([0.03, 0.03, 0.02], m(0), { pos: [0.085, 0.06, 0.07 * s], seg: 8 })));
  // aros de luz flutuando
  rig.bone('aro1', 'pescoco2', [0.08, 0, 0]); rig.add('aro1', ring(0.17, 0.022, m.luz(3), { rot: [0, 90, 0] }));
  rig.bone('aro2', 'cauda6', [-0.08, rF - r + 0.02, 0]); rig.add('aro2', ring(0.14, 0.02, m.luz(3), { rot: [0, 90, 0] }));
  estrela(rig, 'estrela1', 'base', [0.42, 0.62, -0.1], 0.06);
  estrela(rig, 'estrela2', 'base', [-0.3, 0.2, -0.3], 0.045);
  estrela(rig, 'estrela3', 'base', [-0.05, 0.75, 0.2], 0.04);
  return rig;
}

const ex = extrasCobra(CURVA, 7);
const pisca = (f: number) => { const v = [1, 0.4, 1.2, 0.7]; return ls([...v.slice(f), ...v.slice(0, f)]); };
const anims = animsSerpente({ u: 0.55, pescoco: 3, cauda: 7, mole: 0.9 }, {
  todas: { estrela1: pisca(0), estrela2: pisca(1), estrela3: pisca(2) },
  fisico: ex.fisico, desmaio: { ...ex.desmaio, aro1: qs([1, 0.9, 0.6, 0.2, 0.01]), aro2: qs([1, 0.9, 0.6, 0.2, 0.01]) },
  idle: { cauda5: lz([0, 8, 0, -8]), aro1: [...ls([1, 1.08, 1.15, 1.05]), ...lp([[0, 0, 0], [0.02, 0, 0], [0.03, 0, 0], [0.01, 0, 0]])], aro2: ls([1.1, 1, 0.92, 1.02]) },
  especial: { ...ex.especial, aro1: qs([1, 0.7, 0.5, 1.9, 1.4, 1]), aro2: qs([1, 0.7, 0.5, 1.8, 1.3, 1]), cauda5: qz([0, 10, 14, -20, -8, 0]) },
});

export const coralzinha = criatura({
  num: 90, id: 'coralzinha', nome: 'Coralzinha', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
