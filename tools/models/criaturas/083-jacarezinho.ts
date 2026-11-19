/**
 * 083 · JACAREZINHO (Rio) — filhote de jacaré-de-papo-amarelo, só cabeça e dentinhos.
 * Traços únicos: papo amarelo-ouro · olhões no alto da cabeça · focinho curto e largo de sorriso dentado ·
 * rabo de faixas escuras · fileira de escudos no lombo.
 * Este arquivo guarda o corpo comum dos três jacarés (084 e 085 reaproveitam).
 */
import { criatura, lagarto, animsLagarto, blob, par, m, lz, type V3 } from './kits';

export const paletaJacare = {
  rampas: [
    ['#263a32', '#587842', '#a2ba68'], // 0 couro verde-oliva
    ['#b6882a', '#f0cc58', '#fff3aa'], // 1 papo amarelo · dentes
    ['#1d2327', '#39453f', '#616f5d'], // 2 escudos e faixas escuras
    ['#983848', '#e87878', '#ffc9b8'], // 3 boca por dentro
  ] as [string, string, string][],
  contorno: '#172026',
  extras: { w: '#ffffff', p: '#10161a', f: '#587842', a: '#f0cc58' },
};

export interface JacareP { k: number; tronco: V3; cabeca: V3; focinho: number; rabo: number; crista: number; nCrista: number; alt: number; faixas?: number; dentes?: number; /** pose: rabo em arco para cima e cabeça erguida */ raboAng?: number; raboCurva?: number; pescAng?: number; pescLen?: number }

/** Corpo comum: baixo e comprido, olhos saltados, papo claro, rabo de faixas, dentes. */
export function corpoJacare(p: JacareP) {
  const [hx, hy, hz] = p.cabeca, k = p.k;
  const kit = lagarto({
    tronco: p.tronco, alt: p.alt, pernas: { abre: 0.19 * k, r: 0.05 * k }, pescoco: { len: p.pescLen ?? 0.1 * k, r: hy * 0.95, ang: p.pescAng ?? 30 },
    cabeca: p.cabeca, focinho: p.focinho,
    cauda: { segs: 4, len: p.rabo, r0: p.tronco[1] * 0.9, r1: 0.025 * k, ang: p.raboAng ?? 2, curva: p.raboCurva ?? 13 },
    crista: { n: p.nCrista, alt: p.crista },
    olho: { r: Math.max(0.028, hz * 0.19), pos: [hx * 0.52, hy * 1.08, hz * 0.76] },
    rampas: { pele: 0, barriga: 1, crista: 2, dentro: 3 },
  });
  const rig = kit.rig, sl = p.rabo / 4;
  par((_, s) => {
    // calombo do olho e narinas
    rig.add('cabeca', blob([hx * 0.36, hy * 0.5, hz * 0.34], m(0), { pos: [hx * 0.42, hy * 0.86, hz * 0.6 * s], seg: 12 }));
    rig.add('cabeca', blob([hy * 0.2, hy * 0.2, hy * 0.2], m(0), { pos: [hx * 1.1 + p.focinho, hy * 0.36, hz * 0.3 * s], seg: 8 }));
    // dentes à mostra
    for (let i = 0; i < (p.dentes ?? 2); i++) rig.add('cabeca', blob([hy * 0.11, hy * 0.2, hy * 0.11], m.luz(1), { pos: [hx * 0.9 + (p.focinho * (i + 0.6)) / (p.dentes ?? 2), -hy * 0.34, hz * 0.62 * s * (1 - i * 0.12)], seg: 6 }));
  });
  // faixas escuras no rabo
  for (let i = 1; i <= 4; i++) { const r = (p.tronco[1] * 0.9 * (1 - (i - 0.5) / 4) + 0.025 * k * ((i - 0.5) / 4)) * 1.08; if (i <= (p.faixas ?? 4)) rig.add('cauda' + i, blob([sl * 0.2, r, r], m(2), { pos: [-sl * 0.5, 0, 0], seg: 10 })); }
  return kit;
}

function build() {
  const { rig } = corpoJacare({ k: 0.9, tronco: [0.2, 0.125, 0.15], cabeca: [0.2, 0.14, 0.18], focinho: 0.1, rabo: 0.42, crista: 0.07, nCrista: 4, alt: 0.075, raboAng: 28, raboCurva: 24, pescAng: 50, pescLen: 0.12 });
  // papo amarelo bem cheio
  rig.add('pescoco', blob([0.12, 0.1, 0.13], m(1), { pos: [0.07, -0.02, 0], seg: 12 }));
  rig.bones.mandibula.rotation.z = -0.16;
  return rig;
}

const anims = animsLagarto({ u: 0.45, hPerna: 0.075, caudaSegs: 4, mole: 1.1 }, { idle: { cabeca: lz([0, 2, 5, 2]) } });

export const jacarezinho = criatura({
  num: 83, id: 'jacarezinho', nome: 'Jacarezinho', porte: 'P', estagio: 'basico', paleta: paletaJacare, build, anims,
  olho: { frente: ['.aa.', 'apwa', 'appa', '.aa.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['a', 'p'] },
});
