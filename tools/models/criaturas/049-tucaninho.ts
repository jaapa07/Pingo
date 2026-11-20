/**
 * 049 · TUCANINHO (Vento) — filhote de tucano-de-bico-verde, bicudo e desajeitado.
 * Traços únicos: bicão verde maior que a cabeça, de ponta alaranjada · papo amarelo-ouro ·
 * faixa vermelha na barriga · anel azul em volta do olho · cauda curta empinada.
 */
import { criatura, ave, animsAve, blob, calota, par, m, lz, qz } from './kits';

export const paletaTucano = {
  rampas: [
    ['#1c1830', '#35304e', '#5c5a7e'], // 0 penas negras azuladas
    ['#c9781e', '#f8c62e', '#fff2a8'], // 1 papo amarelo-ouro
    ['#3f7a2c', '#8cc63c', '#dff07a'], // 2 verde do bico
    ['#a82a2a', '#f0622a', '#ffb040'], // 3 vermelho da barriga · laranja da ponta do bico
  ] as [string, string, string][],
  contorno: '#191428',
  extras: { w: '#ffffff', p: '#120e1e', f: '#35304e', a: '#4aa8e8' },
};

function build() {
  const { rig, ref } = ave({
    corpo: [0.2, 0.19, 0.18], ergue: 44,
    pescoco: { len: 0.1, ang: 66, r: 0.13 },
    cabeca: [0.16, 0.155, 0.155],
    bico: { len: 0.5, r: 0.12, y: -0.02, achata: 0.6, gancho: 30, inferior: 0.88 },
    asa: { len: 0.27, larg: 0.17, cai: 20, ponta: 0.4 },
    cauda: { len: 0.2, larg: 0.1, ang: 40, penas: 3, abre: 12 },
    pernas: { alt: 0.1, r: 0.028, z: 0.5, dedo: 0.08 },
    olho: { r: 0.026, pos: [0.085, 0.045, 0.135] },
    rampas: { corpo: 0, peito: 1, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 2, perna: 2 },
  });
  // papo amarelo subindo pela garganta até a bochecha
  rig.add('pescoco', blob([0.1, 0.12, 0.125], m(1), { pos: [0.06, 0.02, 0], rot: [0, 0, -20], seg: 14 }));
  rig.add('cabeca', blob([0.08, 0.07, 0.14], m(1), { pos: [0.08, -0.08, 0], seg: 14 }));
  // faixa vermelha na barriga e debaixo da cauda
  rig.add('tronco', blob([0.05, 0.05, 0.16], m(3), { pos: [0.13, -0.15, 0], rot: [0, 0, -30], seg: 12 }));
  rig.add('cauda1', blob([0.05, 0.035, 0.06], m(3), { pos: [0.04, -0.04, 0], seg: 10 }));
  // bico: risca escura na base, ponta alaranjada
  rig.add('cabeca', blob([0.024, 0.125, 0.085], m.sombra(0), { pos: [0.135, -0.02, 0], seg: 12 }));
  rig.add('cabeca', blob([0.09, 0.065, 0.05], m.luz(3), { pos: [ref.pontaBico[0] - 0.06, ref.pontaBico[1] - 0.045, 0], rot: [0, 0, -30], seg: 10 }));
  // anel azul do olho (pele nua)
  par((_, s) => rig.add('cabeca', blob([0.05, 0.05, 0.02], m.plano(2), { pos: [0.085, 0.045, 0.128 * s], seg: 10 })));
  // penugem arrepiada no cocuruto (osso próprio)
  rig.bone('topete', 'cabeca', [ref.topo[0] - 0.03, ref.topo[1] - 0.02, 0], [0, 0, 30]);
  rig.add('topete', blob([0.04, 0.07, 0.04], m(0), { pos: [0, 0.04, 0], seg: 8 }), blob([0.03, 0.05, 0.03], m(0), { pos: [-0.04, 0.02, 0], rot: [0, 0, 30], seg: 8 }));
  return rig;
}

const anims = animsAve({ u: 0.6, hPerna: 0.1, mole: 1.3 }, {
  idle: { topete: lz([0, 6, 12, -6]) },
  especial: { topete: qz([0, 16, 22, -28, -10, 0]) },
  dano: { topete: qz([28, 10, 0]) },
});

// 3ª rodada: no desmaio as asas abriam 62° e de costas o tucano encolhia (63%); agora caem mais junto do corpo
for (const v of [anims.frente, anims.costas]) { const a = v['desmaio']; v['desmaio'] = { ...a, keys: Object.fromEntries(Object.entries(a.keys).map(([o, ks]) => [o, /^asa/.test(o) ? ks.map((q) => (q.r ? { ...q, r: q.r.map((x) => x * 0.55) as [number, number, number] } : q)) : ks])) }; }

export const tucaninho = criatura({
  num: 49, id: 'tucaninho', nome: 'Tucaninho', porte: 'P', estagio: 'basico', paleta: paletaTucano, build, anims,
  olho: {
    frente: ['.aa.', 'appa', 'apwa', '.aa.'],
    fechado: ['.aa.', 'affa', 'appa', '.aa.'],
    mapa: ['a', 'p'],
  },
});
