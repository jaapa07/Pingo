/**
 * Árvores e plantas grandes do Brasil pintadas em pixel art (coqueiro, ipê, araucária, buriti,
 * mandacaru, árvore torta do cerrado, mangue…). A base do tronco fica no centro da última linha:
 * o bake alinha esse ponto ao tile e manda para a camada alta tudo o que passa do topo do tile.
 */
import { Img } from '../../pixel/tile';
import { Tela, type Rampa } from './pintor';

/** resolve uma letra da paleta do bioma ou um hex '#rrggbb' */
export type Cores = (k: string) => number;
export interface Arvore { img: Img; /** semi-eixos da sombra elíptica projetada no chão (px) */ sombra: [number, number] }
export type PintorArvore = (c: Cores, variante: number) => Arvore;

const rp = (c: Cores, s: string): Rampa => s.split(' ').map(c);
const FOLHA = (c: Cores) => rp(c, 'f F v V');
const MAD = (c: Cores) => rp(c, 'm M n');
const ROCHA = (c: Cores) => rp(c, 'r R q Q');

type Bolha = [number, number, number, number];
interface OpFolhosa {
  w: number; h: number; troncoLarg: number; troncoTopo: number; bolhas: Bolha[][];
  copa?: Rampa; mad?: Rampa; desvio?: (t: number) => number;
  /** pontinhos de flor/fruto sobre a copa: cor e 1 em cada N pixels */
  pintas?: { cor: number; cada: number; cor2?: number }; galhos?: [number, number, number, number][];
}
function folhosa(c: Cores, variante: number, o: OpFolhosa): Arvore {
  const t = new Tela(o.w, o.h);
  const mad = o.mad ?? MAD(c), copa = o.copa ?? FOLHA(c);
  const cx = o.w >> 1;
  t.tronco(cx, o.troncoTopo, o.h - 2, o.troncoLarg, mad, o.desvio);
  for (const g of o.galhos ?? []) t.linha(g[0], g[1], g[2], g[3], mad[1], 2);
  const lista = o.bolhas[variante % o.bolhas.length];
  for (const b of lista) t.bolha(b[0], b[1], b[2], b[3], copa);
  if (o.pintas) {
    const { cor, cada, cor2 } = o.pintas;
    for (let y = 1; y < o.h; y++) for (let x = 1; x < o.w; x++) {
      const a = t.get(x, y);
      if (!copa.includes(a)) continue;
      const k = ((x * 7 + y * 13 + (x ^ y) * 3) >>> 0) % cada;
      if (k === 0 && a !== copa[0]) { t.p(x, y, cor); if (cor2 !== undefined && copa.includes(t.get(x + 1, y))) t.p(x + 1, y, cor2); }
    }
  }
  t.contornar(c('k'));
  return { img: t.img, sombra: [Math.round(o.w * 0.36), 4] };
}

const COPA_A: Bolha[] = [[18, 21, 15, 11], [8, 24, 7, 6], [28, 24, 7, 6], [12, 14, 9, 7], [25, 15, 9, 7], [18, 8, 8, 6], [19, 22, 8, 5]];
const COPA_B: Bolha[] = [[18, 20, 15, 11], [27, 25, 8, 6], [9, 22, 8, 7], [24, 13, 9, 7], [13, 12, 8, 6], [20, 7, 7, 5], [16, 22, 8, 5]];

/* ------------------------------ litoral ------------------------------ */
const coqueiro: PintorArvore = (c, variante) => {
  const t = new Tela(44, 52);
  const mad = rp(c, 'm M n'), fl = FOLHA(c);
  const inclina = variante % 2 ? -1 : 1;
  const eixo = (y: number) => 22 + inclina * Math.round(5 * Math.pow((50 - y) / 32, 2));
  for (let y = 50; y >= 18; y--) {
    const x = eixo(y), larg = y > 46 ? 4 : 3;
    for (let i = 0; i < larg; i++) t.p(x - 1 + i, y, y % 3 === 0 ? mad[0] : i === 0 ? mad[2] : i === larg - 1 ? mad[0] : mad[1]);
  }
  const cx = eixo(18), cy = 17;
  const pontas: [number, number][] = [[-9, 11], [9, 10], [-17, 3], [16, 2], [-14, -8], [13, -9], [-5, -14], [5, -14]];
  pontas.forEach(([dx, dy], i) => {
    const frente = i >= 4;
    t.curva([cx, cy], [cx + dx * 0.55, cy + dy * 0.55 - 7], [cx + dx, cy + dy], (x, y, u) => {
      const pend = Math.round(1 + 3.2 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
      for (let k = pend; k >= 1; k--) if ((x + k) % 2 === 0 || k === 1) t.p(x, y + k, k >= pend ? fl[0] : fl[1]);
      t.p(x, y, frente ? fl[3] : fl[2]);
      if (u > 0.15) t.p(x, y - 1, frente ? fl[2] : fl[1]);
    });
  });
  t.elipse(cx - 2, cy + 2, 2, 2, mad[1]); t.elipse(cx + 2, cy + 3, 2, 2, mad[0]); t.p(cx - 3, cy + 1, mad[2]);
  t.elipse(cx, cy, 2, 1.5, fl[1]);
  t.contornar(c('k'));
  return { img: t.img, sombra: [9, 3] };
};
/** cajueiro/amendoeira de praia: copa baixa e larga */
const amendoeira: PintorArvore = (c, v) => folhosa(c, v, {
  w: 40, h: 40, troncoLarg: 4, troncoTopo: 22,
  bolhas: [[[20, 17, 17, 9], [8, 19, 7, 5], [32, 19, 7, 5], [14, 11, 9, 6], [27, 12, 9, 6], [20, 18, 9, 5]]],
  pintas: { cor: c('y'), cada: 37, cor2: c('p') },
});

/* ------------------------------ matas ------------------------------ */
const jequitiba: PintorArvore = (c, v) => folhosa(c, v, { w: 36, h: 48, troncoLarg: 5, troncoTopo: 26, bolhas: [COPA_A, COPA_B] });
const embauba: PintorArvore = (c, v) => folhosa(c, v, {
  w: 36, h: 50, troncoLarg: 3, troncoTopo: 20, mad: rp(c, 'r q Q'),
  bolhas: [[[10, 18, 8, 5], [26, 16, 8, 5], [18, 10, 9, 6], [9, 9, 6, 4], [27, 8, 6, 4], [18, 20, 6, 4]]],
  galhos: [[18, 24, 10, 18], [18, 22, 26, 16]],
});
const frutifera: PintorArvore = (c, v) => folhosa(c, v, {
  w: 36, h: 44, troncoLarg: 4, troncoTopo: 24,
  bolhas: [[[18, 18, 14, 10], [9, 20, 7, 6], [27, 20, 7, 6], [18, 10, 10, 7], [18, 20, 8, 5]]],
  pintas: { cor: c('p'), cada: 19, cor2: c('y') },
});
const manaca: PintorArvore = (c, v) => folhosa(c, v, {
  w: 36, h: 46, troncoLarg: 4, troncoTopo: 24, bolhas: [COPA_B, COPA_A],
  pintas: { cor: c('p'), cada: 11 },
});
const ipe = (flor: [string, string, string, string]): PintorArvore => (c, v) => {
  const copa = flor.map(c);
  const a = folhosa(c, v, {
    w: 36, h: 48, troncoLarg: 4, troncoTopo: 24, copa, mad: rp(c, 'm M n'), bolhas: [COPA_A, COPA_B],
    galhos: [[18, 26, 11, 20], [18, 25, 26, 19]],
    pintas: { cor: c('F'), cada: 23 },
  });
  // pétalas caídas ao pé da árvore
  for (const [x, y] of [[8, 46], [12, 47], [25, 46], [29, 47], [22, 47]] as [number, number][]) a.img.set(x, y, copa[2]);
  return a;
};
const araucaria: PintorArvore = (c) => {
  const t = new Tela(44, 62);
  const mad = rp(c, 'm M n'), fl = FOLHA(c);
  t.tronco(22, 12, 60, 4, mad);
  const niveis: [number, number, number][] = [[34, 11, 3], [25, 16, 4], [16, 14, 5]];
  for (const [y, alc, sobe] of niveis) for (const lado of [-1, 1]) {
    t.curva([22, y], [22 + lado * alc * 0.6, y + 1], [22 + lado * alc, y - sobe], (x, yy) => { t.p(x, yy, mad[1]); t.p(x, yy + 1, mad[0]); });
    t.bolha(22 + lado * alc, y - sobe - 1, 6, 3.5, fl);
    t.bolha(22 + lado * (alc - 7), y - sobe + 1, 5, 3, fl);
  }
  t.bolha(22, 8, 8, 4, fl); t.bolha(22, 5, 5, 3, fl);
  t.contornar(c('k'));
  return { img: t.img, sombra: [12, 4] };
};
const pinheiro = (neve: boolean): PintorArvore => (c, v) => {
  const t = new Tela(30, 44);
  const fl = FOLHA(c), mad = MAD(c), br = c('w');
  t.tronco(15, 34, 42, 3, mad);
  const andares: [number, number][] = v % 2 ? [[30, 12], [23, 10], [16, 8], [9, 5]] : [[31, 13], [24, 11], [17, 8], [10, 6], [5, 3]];
  for (const [yb, meia] of andares) for (let k = 0; k < 9; k++) {
    const y = yb - k, m = Math.round(meia * (1 - k / 10));
    for (let x = 15 - m; x <= 15 + m; x++) {
      if (k === 0 && (x + yb) % 3 === 0) continue;
      const f = (x - (15 - m)) / Math.max(1, m * 2);
      let tom = f < 0.25 ? 2 : f > 0.6 ? 0 : 1;
      if (k <= 1) tom = Math.max(0, tom - 1);
      t.p(x, y, neve && k >= 6 && f < 0.75 ? br : fl[tom]);
    }
  }
  if (neve) { t.p(15, 2, br); t.p(14, 3, br); }
  t.contornar(c('k'));
  return { img: t.img, sombra: [9, 3] };
};

/* ------------------------------ cerrado, pantanal, chapada ------------------------------ */
const tortuosa: PintorArvore = (c, v) => folhosa(c, v, {
  w: 40, h: 42, troncoLarg: 4, troncoTopo: 16, desvio: (t) => Math.round(3 * Math.sin((1 - t) * 5)),
  bolhas: [[[11, 14, 9, 5], [29, 13, 9, 5], [20, 9, 10, 5], [20, 15, 8, 4]], [[9, 12, 8, 5], [30, 15, 8, 5], [21, 10, 10, 5], [18, 16, 8, 4]]],
  galhos: [[20, 24, 11, 16], [21, 22, 29, 15]],
});
const buriti: PintorArvore = (c) => {
  const t = new Tela(40, 56);
  const mad = rp(c, 'm M n'), fl = FOLHA(c);
  for (let y = 54; y >= 20; y--) for (let i = 0; i < 4; i++) t.p(18 + i, y, y % 4 === 0 ? mad[0] : i === 0 ? mad[2] : i === 3 ? mad[0] : mad[1]);
  // folhas secas pendentes e o cacho de frutos
  for (const [x, y, h] of [[15, 22, 7], [24, 22, 6], [17, 23, 5]] as [number, number, number][]) for (let k = 0; k < h; k++) t.p(x + (k % 3 === 2 ? 1 : 0), y + k, mad[k < 2 ? 1 : 0]);
  t.elipse(22, 27, 1.6, 3.2, c('x')); t.p(22, 26, c('X'));
  const leques: [number, number, number][] = [[8, 22, 6], [32, 21, 6], [6, 12, 6], [34, 11, 6], [13, 5, 6], [27, 5, 6], [20, 12, 7]];
  for (const [x, y, r] of leques) {
    t.linha(20, 18, x, y, fl[0], 1);
    t.bolha(x, y, r, r - 1, fl);
    for (let a = 0; a < 8; a++) { const ang = (a * Math.PI) / 4 + 0.3; t.linha(x, y, x + Math.cos(ang) * (r - 1), y + Math.sin(ang) * (r - 2), fl[0]); }
    t.p(x - 2, y - 2, fl[3]);
  }
  t.contornar(c('k'));
  return { img: t.img, sombra: [10, 3] };
};
const mangue: PintorArvore = (c, v) => {
  const t = new Tela(40, 46);
  const mad = MAD(c);
  for (const dx of [-11, -6, 6, 11, 0]) t.curva([20, 26], [20 + dx, 28], [20 + dx, 44], (x, y) => { t.p(x, y, mad[1]); t.p(x + 1, y, mad[0]); });
  t.tronco(20, 18, 30, 4, mad);
  for (const b of (v % 2 ? COPA_B : COPA_A)) t.bolha(b[0] + 2, b[1] - 2, b[2], b[3] * 0.85, FOLHA(c));
  t.contornar(c('k'));
  return { img: t.img, sombra: [13, 4] };
};
const mandacaru: PintorArvore = (c, v) => {
  const t = new Tela(28, 40);
  const fl = FOLHA(c);
  const coluna = (x: number, y0: number, y1: number, larg: number) => {
    for (let y = y0; y <= y1; y++) for (let i = 0; i < larg; i++) {
      if (y === y0 && (i === 0 || i === larg - 1)) continue;
      t.p(x + i, y, i === 0 ? fl[3] : i === larg - 1 ? fl[0] : i % 2 ? fl[2] : fl[1]);
      if (i === 1 && y % 4 === 1) t.p(x + i, y, c('w'));
    }
  };
  const esq = v % 2 ? 22 : 26, dir = v % 2 ? 26 : 20;
  t.ret(5, esq - 2, 7, 4, fl[1]); t.ret(5, esq + 1, 7, 1, fl[0]); coluna(4, esq - 10, esq, 4);
  t.ret(16, dir - 2, 7, 4, fl[1]); t.ret(16, dir + 1, 7, 1, fl[0]); coluna(20, dir - 12, dir, 4);
  coluna(11, 6, 38, 6);
  t.p(13, 5, c('w')); t.p(14, 5, c('p')); t.p(21, dir - 13, c('w')); t.p(5, esq - 11, c('p'));
  t.contornar(c('k'));
  return { img: t.img, sombra: [7, 3] };
};
const seca: PintorArvore = (c, v) => {
  const t = new Tela(36, 44);
  const mad = MAD(c), fl = FOLHA(c);
  t.tronco(18, 20, 42, 4, mad, (u) => Math.round(2 * Math.sin((1 - u) * 4)));
  const galhos: [number, number, number, number][] = v % 2
    ? [[18, 22, 8, 12], [18, 20, 27, 10], [10, 15, 5, 7], [24, 13, 31, 16], [18, 20, 18, 6]]
    : [[18, 22, 28, 13], [18, 20, 9, 9], [25, 15, 31, 8], [12, 12, 6, 14], [18, 20, 20, 5]];
  for (const g of galhos) { t.linha(g[0], g[1], g[2], g[3], mad[1], 2); t.p(g[2], g[3] - 1, mad[2]); }
  for (const g of galhos.slice(0, 3)) t.bolha(g[2], g[3] - 2, 5, 3, fl);
  t.contornar(c('k'));
  return { img: t.img, sombra: [9, 3] };
};
/** árvore de brejo com barbas-de-velho pendentes */
const barbada: PintorArvore = (c, v) => {
  const a = folhosa(c, v, { w: 36, h: 48, troncoLarg: 5, troncoTopo: 26, bolhas: [COPA_B, COPA_A], desvio: (t) => Math.round(2 * Math.sin(t * 3)) });
  const t = new Tela(36, 48); t.img = a.img;
  for (const [x, y, h] of [[5, 27, 7], [10, 30, 9], [26, 30, 8], [31, 27, 6], [14, 29, 5]] as [number, number, number][])
    for (let k = 0; k < h; k++) t.p(x + (k % 4 === 3 ? 1 : 0), y + k, c(k % 2 ? 'p' : 'y'));
  return a;
};

/* ------------------------------ subsolo e fundo do mar ------------------------------ */
const estalagmite: PintorArvore = (c, v) => {
  const t = new Tela(24, 40);
  const r = ROCHA(c);
  const topo = v % 2 ? 6 : 2;
  for (let y = topo; y <= 38; y++) {
    const u = (y - topo) / (38 - topo), meia = 1 + Math.round(6.5 * Math.pow(u, 1.4));
    for (let x = 12 - meia; x <= 12 + meia; x++) {
      const f = (x - (12 - meia)) / Math.max(1, meia * 2);
      let tom = f < 0.2 ? 3 : f < 0.45 ? 2 : f > 0.75 ? 0 : 1;
      if (y % 6 === 5 && tom > 0) tom--;
      t.p(x, y, r[tom]);
    }
  }
  t.contornar(c('k'));
  return { img: t.img, sombra: [8, 3] };
};
const cogumelo: PintorArvore = (c) => {
  const t = new Tela(28, 30);
  t.tronco(14, 14, 28, 4, rp(c, 'q Q w'));
  t.esfera(14, 11, 11, 7, rp(c, 'x X o y'));
  t.ret(4, 14, 21, 4, -1 as number);
  for (let x = 4; x <= 24; x++) if (t.get(x, 13) !== -1) t.p(x, 13, c('x'));
  for (const [x, y] of [[9, 8], [15, 6], [19, 10], [12, 11]] as [number, number][]) { t.p(x, y, c('w')); t.p(x + 1, y, c('w')); }
  t.contornar(c('k'));
  return { img: t.img, sombra: [8, 3] };
};
const coral: PintorArvore = (c, v) => {
  const t = new Tela(32, 36);
  const r = rp(c, 'x X o');
  const ramo = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    t.linha(x0, y0, x1, y1, r[1], 3);
    t.linha(x0 - 1, y0, x1 - 1, y1, r[2], 1); t.linha(x0 + 1, y0 + 1, x1 + 1, y1 + 1, r[0], 1);
    t.p(x1, y1 - 2, c('w'));
    if (n > 0) { ramo(x1, y1, x1 - 5 - n, y1 - 7, n - 1); ramo(x1, y1, x1 + 4 + n, y1 - 8, n - 1); }
  };
  ramo(16, 34, v % 2 ? 15 : 17, 24, 2);
  t.contornar(c('k'));
  return { img: t.img, sombra: [9, 3] };
};
const alga: PintorArvore = (c, v) => {
  const t = new Tela(24, 38);
  const fl = FOLHA(c);
  for (const [bx, alt, fase] of [[8, 30, 0], [12, 36, 2], [16, 26, 4]] as [number, number, number][])
    for (let k = 0; k < alt; k++) {
      const x = bx + Math.round(2 * Math.sin((k + fase + v * 3) / 3.2));
      t.p(x, 36 - k, fl[2]); t.p(x + 1, 36 - k, fl[1]); t.p(x + 2, 36 - k, fl[0]);
      if (k % 7 === 3) { t.p(x - 1, 36 - k, fl[3]); t.p(x + 3, 35 - k, fl[1]); }
    }
  t.contornar(c('k'));
  return { img: t.img, sombra: [7, 2] };
};

export const ARVORES: Record<string, PintorArvore> = {
  coqueiro, amendoeira, jequitiba, embauba, frutifera, manaca,
  'ipe-amarelo': ipe(['#a8691c', '#e8a91e', '#ffd43a', '#fff08a']),
  'ipe-roxo': ipe(['#6a2f8a', '#a04cc0', '#cf7fe0', '#f0b8f4']),
  'ipe-rosa': ipe(['#a83a6a', '#e0608e', '#f79ab4', '#ffd0dc']),
  araucaria, pinheiro: pinheiro(false), 'pinheiro-neve': pinheiro(true),
  tortuosa, buriti, mangue, mandacaru, seca, barbada, estalagmite, cogumelo, coral, alga,
};
