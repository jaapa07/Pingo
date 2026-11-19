/**
 * 123 · ESTRELINHA (Rio/Encanto) — estrela-do-mar que brilha fraquinho na areia molhada para imitar o céu.
 * Traços únicos: fica EM PÉ em duas pontas, de braços abertos · pontas acesas em amarelo-luz ·
 * fileiras de calombos creme · bochechas rosadas · estrelinhas de brilho cintilando em volta.
 * Anatomia própria (não há kit de estrela): `estrela` + `animsEstrela`, reutilizadas pela Estrelaça.
 */
import { criatura, novoRig, olhos, blob, lathe, par, m, movBase, somar, montar, lr, qr, ls, qs, type Rig, type V3, type BaseP, type Mov, type Faixas, type MapaChibi } from './kits';

export const paletaEstrela = {
  rampas: [
    ['#a83458', '#f47658', '#ffc48c'], // 0 pele coral-alaranjada
    ['#c8947c', '#fbe6c4', '#fffbee'], // 1 calombos e ventre creme
    ['#d08a28', '#ffe060', '#fffbd0'], // 2 luz das pontas e dos brilhos
    ['#4a2c92', '#9468e8', '#dcc8ff'], // 3 violeta (bochecha fria e os olhos da Estrelaça)
  ] as [string, string, string][],
  contorno: '#4a1838',
  extras: { w: '#ffffff', p: '#3a1430', f: '#f47658' },
};

/** ângulos dos cinco braços em volta do eixo X (0 = para cima); os dois últimos são as "pernas" */
export const ANG = [0, 72, -72, 144, -144];
export interface EstrelaP { /** raio do miolo e espessura */ miolo: number; esp: number; /** braço: comprimento e raio na base */ braco: { len: number; r: number }; olho: number; /** graus que o corpo vira para a câmera de batalha */ giro?: number }

/** Monta a estrela em pé. Ossos: corpo → giro → b1..b5 (o +Y local de cada braço aponta para a ponta) → p1..p5 (ponta). */
export function estrela(p: EstrelaP): { rig: Rig; alt: number } {
  const b = p.braco, R = p.miolo;
  const alt = (R * 0.55 + b.len) * Math.cos(36 * Math.PI / 180) - b.r * 0.1;
  const rig = novoRig(alt);
  rig.bone('giro', 'corpo', [0, 0, 0], [0, p.giro ?? 22, 0]);
  rig.add('giro', blob([p.esp, R, R], m(0)), blob([p.esp * 0.8, R * 0.72, R * 0.72], m.luz(0), { pos: [p.esp * 0.4, 0, 0], seg: 16 }));
  ANG.forEach((a, i) => {
    const n = 'b' + (i + 1), r = a * Math.PI / 180;
    rig.bone(n, 'giro', [0, Math.cos(r) * R * 0.55, Math.sin(r) * R * 0.55], [a, 0, 0]);
    rig.add(n, lathe([[b.r, 0], [b.r * 0.86, b.len * 0.3], [b.r * 0.6, b.len * 0.62]], m(0), { seg: 16, deform: [(v) => { v.x *= p.esp / b.r; }] }));
    rig.bone('p' + (i + 1), n, [0, b.len * 0.62, 0]);
    rig.add('p' + (i + 1), lathe([[b.r * 0.6, 0], [b.r * 0.46, b.len * 0.2], [b.r * 0.24, b.len * 0.34], [0.001, b.len * 0.38]], m(2), { seg: 14, deform: [(v) => { v.x *= p.esp / b.r; }] }));
    // calombos creme em fila pelo meio do braço, na frente e nas costas
    for (const y of [0.12, 0.36]) for (const s of [1, -1]) rig.add(n, blob([p.esp * 0.4, b.r * 0.2, b.r * 0.2], m(1), { pos: [p.esp * 0.86 * s, b.len * y, 0], seg: 8, castShadow: false }));
  });
  olhos(rig, 'giro', p.olho, [p.esp * 0.9, R * 0.16, R * 0.42]);
  return { rig, alt };
}

export function animsEstrela(o: BaseP & { mapa?: MapaChibi }, extra?: Partial<Record<Mov | 'todas', Faixas>>) {
  // braços laterais (b2, b3) acenam no plano da estrela; o de cima (b1) balança; as pernas (b4, b5) pisam
  const acena = (q: typeof qr, v: number[]): Faixas => ({ b2: q(v.map((a) => [-a, 0, 0] as V3)), b3: q(v.map((a) => [a, 0, 0] as V3)), p2: q(v.map((a) => [-a * 0.8, 0, 0] as V3)), p3: q(v.map((a) => [a * 0.8, 0, 0] as V3)) });
  const topo = (q: typeof qr, v: number[]): Faixas => ({ b1: q(v.map((a) => [a, 0, 0] as V3)), p1: q(v.map((a) => [a * 1.4, 0, 0] as V3)) });
  const dobra = (q: typeof qr, v: number[]): Faixas => Object.fromEntries([1, 2, 3].map((i) => ['p' + i, q(v.map((a) => [0, 0, a] as V3))]));
  const membros: Partial<Record<Mov, Faixas>> = {
    entrada: { ...acena(qr, [-30, 24, -12, 4, 0]), ...topo(qr, [0, 10, -8, 3, 0]), giro: qr([[0, -90, 0], [0, 40, 0], [0, -14, 0], [0, 5, 0], [0, 0, 0]]) },
    idle: { ...acena(lr, [0, 8, 14, 5]), ...topo(lr, [0, 5, 0, -5]) },
    fisico: { giro: qr([[0, 0, 8], [0, 0, 14], [0, 0, -20], [0, 0, -8], [0, 0, 0]]), ...acena(qr, [10, 22, -18, -6, 0]), ...dobra(qr, [10, 20, -30, -10, 0]) },
    especial: { giro: qr([[0, 20, 0], [0, 60, 0], [0, 140, 0], [0, 260, 0], [0, 340, 0], [0, 360, 0]]), ...acena(qr, [6, 14, 18, 18, 8, 0]) },
    dano: { giro: qr([[0, 0, 14], [0, 0, 5], [0, 0, 0]]), ...acena(qr, [-24, -8, 0]), ...dobra(qr, [24, 8, 0]) },
    desmaio: { giro: qr([[0, 0, 4], [0, 0, 0], [0, 0, -4], [0, 0, -8], [0, 0, -7]]), ...acena(qr, [0, -10, -24, -36, -34]), ...dobra(qr, [0, -8, -20, -34, -32]), b1: qr([[0, 0, 0], [0, 0, -6], [0, 0, -14], [0, 0, -22], [0, 0, -20]]) },
    status: { ...acena(lr, [-14, -18, -14, -10]), ...topo(lr, [-6, 0, 6, 0]), ...dobra(lr, [-10, -14, -10, -6]) },
    andar: { b4: lr([[0, 0, 22], [0, 0, 0], [0, 0, -22], [0, 0, 0]]), b5: lr([[0, 0, -22], [0, 0, 0], [0, 0, 22], [0, 0, 0]]), ...acena(lr, [8, 0, -8, 0]), giro: [{ t: 0, r: [0, -22, 0] }] },
    parado: { ...acena(lr, [0, 10]), giro: [{ t: 0, r: [0, -22, 0] }] },
  };
  return montar(somar(movBase(o), membros, extra), {}, { comp: 1, larg: 1, cabeca: 1, frontal: 1, olho: 1.5, ...o.mapa });
}

/** Brilho de quatro pontas (duas gotas cruzadas). */
export const brilho = (r: number) => [blob([r * 0.3, r, r * 0.3], m.luz(2), { seg: 8, castShadow: false }), blob([r * 0.3, r * 0.3, r], m.luz(2), { seg: 8, castShadow: false })];
export const cintila = (nomes: string[]) => Object.fromEntries(nomes.map((n, i) => { const v = [1, 0.3, 0.8, 1.3]; return [n, ls([...v.slice(i % 4), ...v.slice(0, i % 4)])]; }));

function build() {
  const { rig } = estrela({ miolo: 0.17, esp: 0.085, braco: { len: 0.27, r: 0.125 }, olho: 0.034 });
  par((_, s) => rig.add('giro', blob([0.03, 0.04, 0.05], m.plano(3), { pos: [0.075, -0.04, 0.125 * s], seg: 10, castShadow: false }))); // bochechas
  rig.add('giro', blob([0.02, 0.022, 0.04], m.sombra(0), { pos: [0.088, -0.045, 0], seg: 8, castShadow: false })); // boquinha
  const pos: V3[] = [[0.1, 0.36, 0.36], [0.0, 0.42, -0.34], [0.1, -0.02, 0.48]];
  pos.forEach((q, i) => { rig.bone('brilho' + (i + 1), 'corpo', q); rig.add('brilho' + (i + 1), ...brilho([0.06, 0.05, 0.04][i])); });
  return rig;
}

const anims = animsEstrela({ u: 0.7, mole: 1.3 }, {
  todas: cintila(['brilho1', 'brilho2', 'brilho3']),
  especial: { brilho1: qs([1, 1.4, 1.8, 2.2, 1.4, 1]), brilho2: qs([1, 1.4, 1.8, 2.2, 1.4, 1]) },
});

export const estrelinha = criatura({
  num: 123, id: 'estrelinha', nome: 'Estrelinha', porte: 'P', estagio: 'basico', paleta: paletaEstrela, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', 'pppp', '.pp.'],
    fechado: ['ffff', 'ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
