/**
 * 107 · GARCINHA (Vento/Rio) — garça-branca-pequena, que mexe a água com o pé amarelo para espantar peixe.
 * Traços únicos: toda branca · bico-agulha negro com a base amarela · pernas negras de PÉS AMARELOS ·
 * duas plumas compridas na nuca · véu de plumas finas nas costas.
 */
import { criatura, ave, animsAve, blob, pena, par, m, lz, qz, unirExtras, D2R, type V3 } from './kits';
import { asasContidas } from './051-ararinha';

export const paletaGarca = {
  rampas: [
    ['#9aa0be', '#f2f4f6', '#ffffff'], // 0 branco
    ['#191723', '#373343', '#5f5b73'], // 1 negro do bico, das pernas e do boné
    ['#b67e1e', '#f8c832', '#fff2a2'], // 2 amarelo dos pés e do freio
    ['#2c62ac', '#58a8e6', '#d6f2ff'], // 3 azul da água · cara da garça-real
  ] as [string, string, string][],
  contorno: '#1e2038',
  extras: { w: '#ffffff', p: '#12101a', f: '#f2f4f6', a: '#f8c832' },
};

export interface GarcaP { k: number; pescoco: number; perna: number; cabeca: V3; bico: number; rBico: number; rPerna: number; pluma: number; mPluma?: number }

/** Corpo comum da linha: esguia, pescoço fino, bico-agulha, pernas compridas, plumas na nuca. */
export function corpoGarca(p: GarcaP) {
  const k = p.k, [hx, hy, hz] = p.cabeca;
  const kit = ave({
    corpo: [0.21 * k, 0.15 * k, 0.14 * k], ergue: 26,
    pescoco: { len: p.pescoco, ang: 70, r: 0.045 * k },
    cabeca: p.cabeca,
    bico: { len: p.bico, r: hy * 0.4, y: -0.05, gancho: 0, achata: 0.75, inferior: 0.95 },
    asa: { len: 0.3 * k, larg: 0.16 * k, cai: 22, ponta: 0.5 },
    cauda: { len: 0.12 * k, larg: 0.08 * k, ang: -20, penas: 3, abre: 12 },
    pernas: { alt: p.perna, r: 0.028 * k, z: 0.5, x: 0, dedo: 0.09 * k },
    olho: { r: 0.024, pos: [hx * 0.45, hy * 0.22, hz * 0.82] },
    rampas: { corpo: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: p.rBico, perna: p.rPerna },
  });
  const rig = kit.rig;
  // duas plumas na nuca (osso próprio) e véu de plumas nas costas
  rig.bone('pluma', 'cabeca', [-hx * 0.7, hy * 0.3, 0], [0, 0, -14]);
  rig.add('pluma', pena(p.pluma, 0.035 * k, m(p.mPluma ?? 0), { esp: 0.03 * k, rot: [0, 0, 0] }), pena(p.pluma * 0.8, 0.032 * k, m.luz(0), { esp: 0.03 * k, rot: [0, 0, -16] }));
  for (const [z, t] of [[0, -22], [0.06, -30], [-0.06, -30]] as const) rig.add('tronco', pena(0.26 * k, 0.045 * k, m.luz(0), { esp: 0.03 * k, pos: [-0.12 * k, 0.1 * k, z * k], rot: [0, 0, t] }));
  // curva do pescoço: papo saliente
  rig.add('pescoco', blob([0.06 * k, 0.07 * k, 0.055 * k], m(0), { pos: [0.03 * k, 0.03 * k, 0], seg: 10 }));
  return kit;
}

function build() {
  const { rig } = corpoGarca({ k: 1, pescoco: 0.26, perna: 0.34, cabeca: [0.09, 0.08, 0.075], bico: 0.19, rBico: 1, rPerna: 1, pluma: 0.2 });
  par((l, s) => {
    // PÉS AMARELOS e freio amarelo entre o bico e o olho
    rig.add('canela_' + l, blob([0.07, 0.03, 0.075], m(2), { pos: [0.03, -0.2, 0], seg: 10 }));
    rig.add('cabeca', blob([0.035, 0.03, 0.02], m.plano(2), { pos: [0.075, 0.01, 0.045 * s], seg: 6 }));
  });
  // pé da frente erguido, mexendo a água
  rig.bones.perna_e.rotation.z = 30 * D2R; rig.bones.canela_e.rotation.z = -50 * D2R;
  return rig;
}

const anims = animsAve({ u: 0.8, hPerna: 0.34, mole: 1.1 }, unirExtras(asasContidas, {
  idle: { pluma: lz([0, 6, 12, 4]), canela_e: lz([0, 14, 0, -14]) },
  especial: { pluma: qz([0, 14, 20, -26, -8, 0]) },
  dano: { pluma: qz([-28, -10, 0]) },
}));

export const garcinha = criatura({
  num: 107, id: 'garcinha', nome: 'Garcinha', porte: 'P', estagio: 'basico', paleta: paletaGarca, build, anims,
  olho: { frente: ['.aa.', 'apwa', 'appa', '.aa.'], fechado: ['ffff', 'pffp', 'fppf', 'ffff'], mapa: ['p', 'p'] },
});
