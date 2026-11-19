/**
 * 124 · ESTRELAÇA (Rio/Mente) — estrela-do-mar de cinco olhos, um em cada ponta, que enxerga o que o outro vai pensar.
 * Mantém da linha: pele coral, calombos creme, pontas acesas, postura em pé, brilhos.
 * Cresce: um OLHO violeta em cada ponta de braço (cinco, todos abertos) · rosto sereno · mandala violeta no miolo ·
 * braços mais longos · anel de brilhos girando em volta.
 */
import { criatura, blob, ring, par, m, ls, qs, lr, qr, type V3 } from './kits';
import { paletaEstrela, estrela, animsEstrela, brilho, ANG } from './123-estrelinha';

const paleta = { ...paletaEstrela, rampas: [['#962a5c', '#e8604e', '#ffb47c'], paletaEstrela.rampas[1], paletaEstrela.rampas[2], paletaEstrela.rampas[3]] as [string, string, string][], extras: { ...paletaEstrela.extras, f: '#e8604e' } };

function build() {
  const { rig } = estrela({ miolo: 0.24, esp: 0.1, braco: { len: 0.38, r: 0.16 }, olho: 0.034, giro: 24 });
  ANG.forEach((_, i) => {
    // OLHO da ponta: globo creme com íris violeta e pupila, olhando para a frente; pálpebra coral por cima
    rig.bone('olhoP' + (i + 1), 'p' + (i + 1), [0.035, 0.05, 0]);
    rig.add('olhoP' + (i + 1), blob([0.08, 0.1, 0.1], m.luz(1), { seg: 14, castShadow: false }), blob([0.05, 0.065, 0.065], m.plano(3), { pos: [0.05, 0, 0], seg: 12, castShadow: false }), blob([0.03, 0.035, 0.03], m.sombra(3), { pos: [0.08, 0, 0], seg: 8, castShadow: false }));
    // os mesmos olhos nas costas, fechados: uma pálpebra clara
    rig.add('p' + (i + 1), blob([0.03, 0.05, 0.07], m.luz(0), { pos: [-0.075, 0.045, 0], seg: 8, castShadow: false }));
  });
  // mandala violeta no miolo (aro + pingo na testa) e rosto sereno
  rig.add('giro', ring(0.2, 0.02, m.plano(3), { rot: [0, 90, 0], pos: [0.07, 0, 0] }), blob([0.03, 0.045, 0.045], m.plano(3), { pos: [0.1, 0.13, 0], seg: 10, castShadow: false }));
  par((_, s) => rig.add('giro', blob([0.03, 0.035, 0.05], m.plano(3), { pos: [0.09, -0.05, 0.13 * s], seg: 10, castShadow: false })));
  rig.add('giro', blob([0.02, 0.02, 0.045], m.sombra(0), { pos: [0.105, -0.06, 0], seg: 8, castShadow: false }));
  // anel de brilhos girando em volta
  rig.bone('roda', 'corpo', [0, 0, 0], [0, 24, 0]);
  const pos: V3[] = [[0.05, 0.56, 0.3], [0.05, 0.3, -0.56], [0.05, -0.26, 0.58], [0.05, 0.58, -0.22]];
  pos.forEach((q, i) => { rig.bone('brilho' + (i + 1), 'roda', q); rig.add('brilho' + (i + 1), ...brilho([0.07, 0.055, 0.05, 0.045][i])); });
  return rig;
}

const B = ['brilho1', 'brilho2', 'brilho3', 'brilho4'];
const pisca = (i: number) => { const v = [1, 0.4, 0.9, 1.3]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const olhosP = (v: number[]) => Object.fromEntries(ANG.map((_, i) => ['olhoP' + (i + 1), qs(v)]));
const anims = animsEstrela({ u: 1, mole: 1 }, {
  todas: Object.fromEntries(B.map((n, i) => [n, pisca(i)])),
  idle: { roda: lr([[0, 0, 0], [4, 0, 0], [8, 0, 0], [4, 0, 0]]) },
  especial: { ...olhosP([1, 1.15, 1.3, 1.5, 1.2, 1]), roda: qr([[0, 0, 0], [-20, 0, 0], [-60, 0, 0], [-120, 0, 0], [-170, 0, 0], [-180, 0, 0]]) },
  dano: olhosP([0.7, 0.85, 1]),
  desmaio: olhosP([1, 0.9, 0.7, 0.5, 0.5]),
});

export const estrelaca = criatura({
  num: 124, id: 'estrelaca', nome: 'Estrelaça', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.'],
    mapa: ['p'],
  },
});
