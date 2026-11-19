/**
 * 086 · SUCURIZINHA (Rio/Terra) — sucuri filhote, gorducha e preguiçosa.
 * Traços únicos: olhos no alto da cabeça (como quem espia da água) · pintas escuras redondas no dorso ·
 * barriga estufada de quem acabou de almoçar · boné de lama na cabeça e ponta da cauda enlameada.
 */
import { criatura, serpente, animsSerpente, blob, calota, par, m, lz, ls, qz, qr, type V3, type Rig, type Mat } from './kits';

export const paletaSucuri = {
  rampas: [
    ['#34504c', '#6c8f48', '#a8c268'], // 0 verde-oliva do corpo (sombra azulada)
    ['#b08748', '#eccb66', '#fff3b4'], // 1 amarelo da barriga
    ['#1e2434', '#343b47', '#565c62'], // 2 pintas e risca do olho (grafite azulado)
    ['#5a3840', '#96623f', '#cf9a62'], // 3 lama e casca de tronco
  ] as [string, string, string][],
  contorno: '#1c2630',
  extras: { w: '#ffffff', p: '#1c2630', f: '#6c8f48', a: '#f08a3c' },
};

/**
 * Sela: mancha que abraça só o dorso de um gomo da cobra (elipsoide mais alto e mais estreito que o gomo).
 * `x` = centro ao longo do gomo, `y` = altura do eixo do gomo no osso, `r` = raio do gomo ali.
 */
export function sela(rig: Rig, osso: string, x: number, y: number, r: number, mat: Mat, comp = 0.6, larg = 0.72) {
  rig.add(osso, blob([r * comp, r * 1.07, r * larg], mat, { pos: [x, y + r * 0.08, 0], seg: 14, castShadow: false }));
}
/** Raio do gomo `i` (1..n) da cauda do kit serpente, no meio do gomo, e a altura do eixo no osso. */
export const gomo = (r: number, rFim: number, n: number, i: number) => { const rm = r + (rFim - r) * ((i - 0.5) / n); return { rm, y: rm - r }; };
/** Pinta redonda no flanco de um gomo: `ang` em graus a partir do topo (+ = lado direito). */
export function pintaFlanco(rig: Rig, osso: string, x: number, y: number, r: number, ang: number, mat: Mat, k = 0.46) {
  const a = (ang * Math.PI) / 180;
  rig.add(osso, blob([r * k, r * k, r * k], mat, { pos: [x, y + Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72], seg: 10, castShadow: false }));
}
/** Bote mais contido que o do kit (para a silhueta não estourar a célula). */
export const boteCurto = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => ['pescoco' + (i + 1), qz([8, 15, -15, -6, 0])]));
/** Desmaio da cobra: o pescoço tomba de lado em vez de se esticar para a frente. */
export const tomboLado = (n: number) => ({
  pescoco1: qr([[0, 0, 4], [8, 0, -4], [38, 0, -10], [78, 0, -16], [74, 0, -14]]),
  ...Object.fromEntries(Array.from({ length: n - 1 }, (_, i) => ['pescoco' + (i + 2), qz([0, -4, -10, -14, -12])])),
  cabeca: qz([0, 4, 10, 16, 14]),
});

function build() {
  const r = 0.1, rF = 0.035, N = 6, len = 0.17;
  const { rig } = serpente({
    r, pescoco: { segs: 3, len: 0.14, curva: [56, 30, -16], rFim: 0.095 },
    cauda: { segs: N, len, curva: [30, -62, -52, 60, 70, 44], rFim: rF },
    cabeca: [0.19, 0.13, 0.155],
    olho: { r: 0.03, pos: [0.115, 0.125, 0.092] },
    rampas: { corpo: 0, barriga: 1, cabeca: 0 },
  });
  // olhos saltados no alto da cabeça + risca escura atrás do olho + narinas
  par((_, s) => {
    rig.add('cabeca', blob([0.05, 0.045, 0.045], m(0), { pos: [0.1, 0.105, 0.082 * s], seg: 12 }));
    rig.add('cabeca', blob([0.08, 0.028, 0.02], m.plano(2), { pos: [0.0, 0.05, 0.132 * s], rot: [0, 10 * s, 14], seg: 10 }));
    rig.add('cabeca', blob([0.018, 0.014, 0.014], m.plano(2), { pos: [0.26, 0.075, 0.035 * s], seg: 8 }));
  });
  // boné de lama escorrendo pela nuca
  rig.add('cabeca', calota([0.135, 0.14, 0.145], m(3), { de: 0, ate: 58, pos: [0.0, 0.02, 0], rot: [0, 0, 34] }));
  rig.add('cabeca', blob([0.045, 0.06, 0.045], m(3), { pos: [-0.07, 0.05, 0.08], seg: 10 }));
  // barriga estufada no segundo gomo da cauda (almoço recente)
  const g2 = gomo(r, rF, N, 2);
  rig.add('cauda2', blob([0.13, 0.135, 0.145], m(0), { pos: [-len / 2, g2.y + 0.035, 0] }));
  rig.add('cauda2', blob([0.11, 0.09, 0.13], m(1), { pos: [-len / 2, g2.y - 0.02, 0] }));
  for (const a of [-55, 0, 55]) pintaFlanco(rig, 'cauda2', -len / 2, g2.y + 0.035, 0.14, a, m.plano(2), 0.4);
  // pintas escuras alternadas nos flancos
  for (const i of [1, 3, 4, 5]) { const g = gomo(r, rF, N, i); for (const a of [-50, 50]) pintaFlanco(rig, 'cauda' + i, -len * (a > 0 ? 0.3 : 0.7), g.y, g.rm, a, m.plano(2)); }
  for (const a of [-70, 70]) pintaFlanco(rig, 'pescoco1', 0.08, 0, 0.1, a, m.plano(2));
  // ponta da cauda enlameada, erguida num osso próprio
  rig.bone('ponta', 'cauda' + N, [-len, rF - r, 0], [0, 0, -60]);
  rig.add('ponta', blob([0.06, 0.05, 0.05], m(3), { pos: [-0.03, 0, 0], seg: 12 }), blob([0.035, 0.035, 0.035], m.luz(3), { pos: [-0.085, 0.01, 0], seg: 10 }));
  return rig;
}

const anims = animsSerpente({ u: 0.5, pescoco: 3, cauda: 6, mole: 1.1 }, {
  desmaio: tomboLado(3),
  fisico: boteCurto(3),
  idle: { ponta: lz([0, 12, 20, 6]), cauda2: ls([1, [1, 1.04, 1.05] as V3, [1, 1.07, 1.08] as V3, [1, 1.03, 1.03] as V3]) },
  especial: { ponta: qz([0, 20, 30, -30, -10, 0]) },
  dano: { ponta: qz([30, 12, 0]) },
});

export const sucurizinha = criatura({
  num: 86, id: 'sucurizinha', nome: 'Sucurizinha', porte: 'P', estagio: 'basico', paleta: paletaSucuri, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
