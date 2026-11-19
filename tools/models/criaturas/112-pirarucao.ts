/**
 * 112 · PIRARUCÃO (Rio/Lenda) — pirarucu ancião de escamas vermelhas antigas. Estágio final.
 * Mantém da linha: cabeça chata de placa clara, escamas de borda vermelha, dorsal e anal longas junto à cauda-leque.
 * Cresce: corpo enorme de armadura · escamas grandes em fileiras que tomam o flanco inteiro ·
 * elmo ósseo com crista e barbelas de ancião · nadadeiras vermelhas de véu · língua-lixa clara na boca.
 */
import { criatura, peixe, animsPeixe, blob, calota, pinta, slab, segmento, par, m, lz, qz, ly } from './kits';
import { paletaPirarucu } from './111-pirarucinho';

function build() {
  const { rig } = peixe({
    corpo: [0.6, 0.2, 0.18], flutua: 0.42, ergue: 10,
    boca: { len: 0.16, r: 0.07, queixo: 0.05 },
    cauda: { len: 0.16, r: 0.1, alt: 0.4, larg: 0.24, forma: 'redonda' },
    dorsal: { alt: 0.13, len: 0.46, x: -0.6, espinhos: 4 },
    anal: { alt: 0.12, len: 0.4, x: -0.6 },
    nad: { len: 0.24, larg: 0.13, x: 0.4, y: -0.55 },
    olho: { r: 0.028, pos: [0.42, 0.05, 0.14] },
    rampas: { corpo: 0, barriga: 2, nadadeiras: 1, cauda: 1, boca: 2 },
  });
  // elmo ósseo: placa clara, crista e sobrancelha
  rig.add('tronco', calota([0.26, 0.15, 0.17], m(2), { de: 0, ate: 66, pos: [0.38, 0.07, 0], rot: [0, 0, -20] }));
  rig.add('tronco', slab([[0.2, 0], [0.08, 0.07], [-0.1, 0.05], [-0.16, 0]], 0.04, m(2), { pos: [0.34, 0.19, 0] }));
  par((_, s) => {
    rig.add('tronco', blob([0.09, 0.025, 0.03], m.sombra(0), { pos: [0.42, 0.1, 0.125 * s], rot: [0, 0, -16], seg: 10 }));
    // barbelas de ancião
    rig.add('mandibula', segmento([0.08, -0.02, 0.04 * s], [0.02, -0.16, 0.07 * s], 0.022, 0.012, m(2)));
    // fileiras de escamas grandes de borda vermelha em todo o flanco
    for (let i = 0; i < 6; i++) {
      const x = 0.16 - i * 0.12, k = 1 - Math.abs(x) * 0.5;
      rig.add('tronco', pinta(0.05 + i * 0.004, m(1), [x, 0.07, 0.185 * k * s]), pinta(0.045 + i * 0.004, m(1), [x - 0.06, -0.035, 0.19 * k * s]));
      if (i > 1) rig.add('tronco', pinta(0.03, m.luz(1), [x + 0.01, 0.075, 0.2 * k * s]));
    }
    rig.add('cauda1', blob([0.16, 0.11, 0.075], m(1), { pos: [-0.06, 0, 0.014 * s], seg: 12 }));
    rig.add('nad_' + (s > 0 ? 'd' : 'e'), blob([0.06, 0.06, 0.03], m.luz(1), { pos: [-0.19, 0, 0], seg: 10 }));
  });
  rig.add('cauda2', blob([0.04, 0.18, 0.035], m.luz(1), { pos: [-0.23, 0, 0], seg: 10 }), blob([0.03, 0.13, 0.04], m(3), { pos: [-0.1, 0, 0], seg: 10 }));
  rig.add('mandibula', blob([0.07, 0.025, 0.05], m.luz(2), { pos: [0.12, 0.05, 0], seg: 10 }));
  return rig;
}

const anims = animsPeixe({ u: 0.9, flutua: 0.42, mole: 0.6, mapa: { comp: 0.6, larg: 1.6 } }, {
  idle: { tronco: lz([0, 1, 3, 1]), cauda2: ly([-14, 10, 14, -10]) },
  especial: { tronco: qz([-4, -8, -8, 16, 6, 0]) },
});

export const pirarucao = criatura({
  num: 112, id: 'pirarucao', nome: 'Pirarucão', porte: 'G', estagio: 'final', paleta: paletaPirarucu, build, anims,
  olho: {
    frente: ['ppp..', 'pwpp.', 'pppp.', '.pp..'],
    fechado: ['ffff.', 'pffp.', '.pp..', 'ffff.'],
    mapa: ['p', 'p'],
  },
  enquadre: {},
});
