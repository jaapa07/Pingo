/**
 * 090 · CORALZINHA (Veneno/Encanto) — cobra-coral de anéis luminosos. Estágio único.
 * Traços únicos: tríades de anéis (preto · claro luminoso · preto) sobre o vermelho ·
 * cauda enrolada e erguida como uma segunda cabeça (o truque da coral) ·
 * dois aros de luz flutuando em volta do pescoço e da cauda · estrelinhas de encanto.
 */
import { criatura, serpente, animsSerpente, blob, lathe, par, m, lz, ls, lp, qz, qs, type V3, type Rig } from './kits';
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
  // faixas em cilindro (um elipsoide só aflora num fio): preto largo e, por cima, o anel claro bem visível
  const faixa = (meio: number, raio: number, mat: ReturnType<typeof m>) => lathe([[0.001, -meio], [raio * 0.94, -meio], [raio, -meio * 0.6], [raio, meio * 0.6], [raio * 0.94, meio], [0.001, meio]], mat, { pos: [x, y, 0], rot: [0, 0, 90], seg: 16, castShadow: false });
  rig.add(osso, faixa(r * 0.6 * k, r * 1.12, m(1)), faixa(r * 0.2 * k, r * 1.2, m.luz(2)));
}

function estrela(rig: Rig, nome: string, pai: string, pos: V3, r: number) {
  rig.bone(nome, pai, pos);
  rig.add(nome, blob([r, r * 0.3, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r * 0.3, r, r * 0.3], m.luz(3), { seg: 8, castShadow: false }), blob([r * 0.45, r * 0.45, r * 0.45], m.luz(2), { seg: 8, castShadow: false }));
}

function build() {
  const r = 0.1, rF = 0.055, N = 7, len = 0.15;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.15, curva: CURVA, rFim: 0.09 },
    cauda: { segs: N, len, curva: [40, -75, -65, 70, 60, 0, 0], rFim: rF },
    cabeca: [0.17, 0.115, 0.135],
    olho: { r: 0.03, pos: [0.095, 0.068, 0.1] },
    rampas: { corpo: 0, cabeca: 0 },
  });
  // cauda-isca: os três últimos gomos sobem e se enrolam
  rig.bones.cauda5.rotation.z = -1.0; rig.bones.cauda6.rotation.z = -1.1; rig.bones.cauda7.rotation.z = -1.3;
  rig.add('cauda7', blob([0.075, 0.068, 0.068], m(1), { pos: [-len, rF - r, 0], seg: 12 }), blob([0.025, 0.074, 0.074], m.luz(2), { pos: [-len + 0.045, rF - r, 0], seg: 10, castShadow: false }));
  // tríades no corpo e no pescoço
  for (let i = 1; i <= N; i++) { const g = gomo(r, rF, N, i); triade(rig, 'cauda' + i, -len / 2, g.y, g.rm, i > 4 ? 0.8 : 1); }
  triade(rig, 'pescoco1', 0.09, 0, 0.098); triade(rig, 'pescoco2', 0.08, 0, 0.095); triade(rig, 'pescoco3', 0.07, 0, 0.092, 0.8);
  // cabeça: focinho preto, faixa clara atrás do olho
  rig.add('cabeca', blob([0.1, 0.098, 0.115], m(1), { pos: [0.195, 0.005, 0], seg: 14 }));
  rig.add('cabeca', blob([0.035, 0.124, 0.145], m.luz(2), { pos: [0.03, 0.012, 0], seg: 14, castShadow: false }));
  // aros de luz flutuando
  // (os antigos aros soltos viravam um arco branco confuso: agora são dois brilhos de encanto, um na nuca e um na ponta da cauda-isca)
  estrela(rig, 'aro1', 'cabeca', [-0.02, 0.2, 0], 0.05);
  estrela(rig, 'aro2', 'cauda7', [-len - 0.02, rF - r + 0.13, 0], 0.045);
  estrela(rig, 'estrela1', 'base', [0.3, 0.6, -0.1], 0.06);
  estrela(rig, 'estrela2', 'base', [-0.2, 0.34, -0.2], 0.045);
  estrela(rig, 'estrela3', 'base', [-0.05, 0.7, 0.15], 0.04);
  return rig;
}

const ex = extrasCobra(CURVA, 7);
const pisca = (f: number) => { const v = [1, 0.4, 1.2, 0.7]; return ls([...v.slice(f), ...v.slice(0, f)]); };
const anims = animsSerpente({ u: 0.55, pescoco: 3, cauda: 7, mole: 0.9 }, {
  todas: { estrela1: pisca(0), estrela2: pisca(1), estrela3: pisca(2) },
  fisico: ex.fisico, desmaio: { ...ex.desmaio, aro1: qs([1, 0.9, 0.6, 0.2, 0.01]), aro2: qs([1, 0.9, 0.6, 0.2, 0.01]) },
  idle: { cauda5: lz([0, 8, 0, -8]), aro1: [...ls([1, 0.5, 1.2, 0.8]), ...lp([[0, 0, 0], [0, 0.02, 0], [0, 0.03, 0], [0, 0.01, 0]])], aro2: ls([0.6, 1.2, 0.8, 1]) },
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
