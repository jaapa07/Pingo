/**
 * 079 · TARTARUÍ (Rio) — filhote de tartaruga-verde, recém-saído do ninho e já de olho na arrebentação.
 * Traços únicos: nadadeirões maiores que o corpo · casco verde-oliva de escudos claros com borda creme ·
 * pele azul-petróleo · casquinha de ovo de chapéu · estrelinha-do-mar rosa de carona.
 */
import { criatura, tartaruga, animsTartaruga, blob, calota, par, m, lz, qz, qp, type V3 } from './kits';

export const paletaTartaruga = {
  rampas: [
    ['#2c5648', '#58985a', '#a9d882'], // 0 casco verde-oliva
    ['#b3a184', '#f3e6c4', '#fffbf0'], // 1 creme do plastrão, da borda e da casca de ovo
    ['#274760', '#488898', '#99d1c8'], // 2 pele azul-petróleo
    ['#ae3e60', '#f0786e', '#ffd0a2'], // 3 coral e estrela-do-mar
  ] as [string, string, string][],
  contorno: '#18283a',
  extras: { w: '#ffffff', p: '#14202e', f: '#488898' },
};

/** estrela-do-mar de cinco pontas num osso próprio */
export function estrela(rig: ReturnType<typeof tartaruga>['rig'], nome: string, pai: string, pos: V3, r: number, rot: V3 = [0, 0, 0]) {
  rig.bone(nome, pai, pos, rot);
  rig.add(nome, blob([r * 0.5, r * 0.3, r * 0.5], m(3), { seg: 10 }));
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; rig.add(nome, blob([r * 0.6, r * 0.2, r * 0.26], m(3), { pos: [Math.cos(a) * r * 0.6, 0, Math.sin(a) * r * 0.6], rot: [0, -(a * 180) / Math.PI, 0], seg: 8 })); }
  rig.add(nome, blob([r * 0.2, r * 0.16, r * 0.2], m.luz(3), { pos: [0, r * 0.25, 0], seg: 6 }));
}

function build() {
  const { rig, ref } = tartaruga({
    // 2ª rodada: casco mais abaulado e cabeça ERGUIDA, de olho na arrebentação (antes lia como uma panqueca: 52×21 px)
    casco: [0.25, 0.2, 0.22], alt: 0.08, pernas: { len: 0.22, r: 0.05, nadadeira: true },
    pescoco: { len: 0.21, r: 0.075, ang: 68 }, cabeca: [0.155, 0.135, 0.135], cauda: 0.09, escudos: 6,
    olho: { r: 0.028, pos: [0.1, 0.05, 0.1] },
    rampas: { casco: 0, borda: 1, plastrao: 1, pele: 2, escudos: 0 },
  });
  // escudos claros por cima (o kit pinta com a mesma rampa: aqui clareamos o do meio)
  rig.add('corpo', calota([0.11, 0.206, 0.1], m.luz(0), { de: 0, ate: 50 }));
  // casquinha de ovo de chapéu, com borda serrilhada
  rig.bone('casca', 'cabeca', [ref.topo[0] - 0.02, ref.topo[1] - 0.04, 0], [0, 0, 12]);
  rig.add('casca', calota([0.12, 0.11, 0.11], m(1), { de: 0, ate: 80 }));
  for (const a of [0, 72, 144, 216, 288]) rig.add('casca', blob([0.03, 0.035, 0.03], m.luz(1), { pos: [Math.cos((a * Math.PI) / 180) * 0.105, 0.0, Math.sin((a * Math.PI) / 180) * 0.095], seg: 6 }));
  // escamas claras nas nadadeiras
  par((l, s) => { rig.add('canela_f' + l, blob([0.05, 0.02, 0.035], m.luz(2), { pos: [0.06, -0.01, 0.05 * s], seg: 8, castShadow: false })); });
  estrela(rig, 'estrela', 'corpo', [-0.14, 0.155, 0.08], 0.07, [20, 0, 24]);
  return rig;
}

const rema = { perna_fd: lz([0, 10, 20, 8]), perna_fe: lz([0, 10, 20, 8]) };
const anims = animsTartaruga({ u: 0.45, hPerna: 0.07, pescoco: 0.12, mole: 0.8 }, {
  idle: { ...rema, casca: lz([0, 3, 6, 2]) },
  especial: { perna_fd: qz([0, 20, 30, -30, -10, 0]), perna_fe: qz([0, 20, 30, -30, -10, 0]) },
  dano: { casca: qp([[-0.02, 0.06, 0], [-0.01, 0.02, 0], [0, 0, 0]]) },
});

export const tartarui = criatura({
  num: 79, id: 'tartarui', nome: 'Tartaruí', porte: 'P', estagio: 'basico', paleta: paletaTartaruga, build, anims,
  olho: { frente: ['.pp.', 'ppwp', 'pppp', '.pp.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
