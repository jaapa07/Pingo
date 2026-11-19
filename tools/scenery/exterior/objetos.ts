/**
 * Pintores dos objetos EXTERIORES do catálogo (prédios, barcos, mobiliário de rua, natureza).
 * Cada pintor devolve o sprite inteiro de (w·16) × ((h + alto)·16) px nas cores de `dia`;
 * o compositor manda as linhas acima do rodapé para a camada alta e projeta a sombra.
 * As cores de construção vêm do tileset da zona (casario muda de cara em cada bioma).
 */
import type { ObjetoSpawn } from '../../../src/core/tipos';
import type { TilesetExterior } from '../../../src/data/tilesets/tipos';
import type { ObjetoCatalogo } from '../../../src/data/catalogo-objetos';
import { Img, VAZIO, hex } from '../../pixel/tile';
import { ARVORES, type Cores } from './arvores';
import { Tela, type Rampa } from './pintor';

export type InfoObjeto = Pick<ObjetoCatalogo, 'w' | 'h' | 'alto'>;
export interface ObjetoPintado {
  img: Img;
  /** 4 quadros (objetos animados); só o rodapé anima */
  quadros?: Img[];
  sombra?: 'caixa' | 'elipse' | 'nenhuma';
  /** pontos de luz noturna [x, y, raio] em px do sprite */
  luzes?: [number, number, number][];
}
export interface CtxObjeto { c: Cores; ts: TilesetExterior; spawn: ObjetoSpawn; info: InfoObjeto }
export type PintorObjeto = (x: CtxObjeto) => ObjetoPintado;

interface K { c: Cores; par: Rampa; tel: Rampa; det: Rampa; det2: Rampa; ped: Rampa; met: Rampa; mad: Rampa; vidro: number; luz: number; k: number; br: number; neve: boolean; W: number; H: number; t: Tela }
function kit(x: CtxObjeto): K {
  const cn = x.ts.construcao, h3 = (r: [string, string, string]) => r.map(hex);
  const W = x.info.w * 16, H = (x.info.h + x.info.alto) * 16;
  return {
    c: x.c, par: h3(cn.parede), tel: h3(cn.telhado), det: h3(cn.detalhe), det2: h3(cn.detalhe2), ped: h3(cn.pedra), met: h3(cn.metal),
    mad: ['m', 'M', 'n'].map(x.c), vidro: hex(cn.vidro), luz: hex(cn.luz), k: x.c('k'), br: hex('#ffffff'), neve: !!cn.neve, W, H, t: new Tela(W, H),
  };
}
const rampa = (a: string, b: string, c: string): Rampa => [hex(a), hex(b), hex(c)];

/* ------------------------------ peças de construção ------------------------------ */
type Estilo = 'telha' | 'zinco' | 'palha' | 'liso';
function telhado(k: K, x: number, y: number, w: number, h: number, r: Rampa, o: { recuo?: number; estilo?: Estilo } = {}) {
  const { t } = k, recuo = o.recuo ?? 3, estilo = o.estilo ?? 'telha';
  for (let j = 0; j < h; j++) {
    const ins = Math.round(recuo * (1 - j / Math.max(1, h - 1)));
    const x0 = x + ins, x1 = x + w - 1 - ins;
    for (let i = x0; i <= x1; i++) {
      let tom = 1;
      const ii = i - x;
      if (j === 0) tom = 2;
      else if (j === h - 1) tom = 0;
      else if (estilo === 'telha') {
        const jj = j - 1, fila = (jj / 4) | 0, fase = jj % 4, u = ii + fila * 2;
        tom = fase === 3 ? (u % 4 === 0 ? 1 : 0) : fase === 0 && u % 4 === 2 ? 2 : fase === 1 && u % 4 === 2 ? 2 : 1;
      } else if (estilo === 'zinco') tom = j % 9 === 8 ? 0 : ii % 3 === 0 ? 0 : ii % 3 === 1 ? 2 : 1;
      else if (estilo === 'palha') tom = (ii * 7 + j * 3) % 5 === 0 ? 0 : (ii * 5 + j * 2) % 7 === 0 ? 2 : j % 6 === 5 && ii % 2 ? 0 : 1;
      if (i >= x1 - 2 && tom > 0 && j > 0) tom--;
      if (i === x0 && j > 0 && j < h - 1) tom = 2;
      let cor = r[tom];
      if (k.neve && j < h * 0.5 - (ii * 3 % 5 < 2 ? 2 : 0) - (ii % 7 === 3 ? 3 : 0)) cor = j < 2 || i < x0 + 3 ? k.br : i >= x1 - 3 ? hex('#b9c6e6') : hex('#e8f0ff');
      t.p(i, j + y, cor);
    }
  }
}
function parede(k: K, x: number, y: number, w: number, h: number, r: Rampa, barrado?: Rampa) {
  const { t } = k;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let tom = 1;
    if (i === 0) tom = 2; else if (i >= w - 2) tom = 0;
    if (j < 2) tom = 0;
    else if ((i * 5 + j * 11) % 41 === 0 && tom === 1) tom = 0;
    t.p(x + i, y + j, r[tom]);
  }
  if (barrado) { t.ret(x, y + h - 5, w, 5, barrado[1]); t.ret(x, y + h - 5, w, 1, barrado[2]); t.ret(x, y + h - 1, w, 1, barrado[0]); t.ret(x + w - 2, y + h - 4, 2, 3, barrado[0]); }
}
/** parede de tábuas (casas de madeira) ou de tijolo */
function tabuado(k: K, x: number, y: number, w: number, h: number, r: Rampa, vertical = false) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const a = vertical ? i : j, b = vertical ? j : i;
    let tom = a % 4 === 3 ? 0 : a % 4 === 0 ? 2 : 1;
    if (tom === 2 && (b * 3 + a) % 7 > 3) tom = 1;
    if (j < 2 || i >= w - 2) tom = 0;
    k.t.p(x + i, y + j, r[tom]);
  }
}
function tijolo(k: K, x: number, y: number, w: number, h: number, r: Rampa) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const fila = (j / 4) | 0, junta = j % 4 === 3 || (i + fila * 4) % 8 === 7;
    let tom = junta ? 0 : (i * 3 + fila * 5) % 11 === 0 ? 2 : 1;
    if (j < 2 || i >= w - 2) tom = 0;
    k.t.p(x + i, y + j, r[tom]);
  }
}
function porta(k: K, x: number, y: number, w: number, h: number, r: Rampa, arco = false) {
  const { t } = k;
  t.ret(x - 1, y - 1, w + 2, h + 1, r[0]);
  t.ret(x, y, w, h, r[1]);
  t.ret(x, y, 1, h, r[2]);
  t.ret(x + (w >> 1), y, 1, h, r[0]);
  t.ret(x + 2, y + 2, (w >> 1) - 3, 1, r[2]); t.ret(x + 2, y + (h >> 1), (w >> 1) - 3, 1, r[0]);
  t.ret(x + (w >> 1) + 2, y + 2, (w >> 1) - 3, 1, r[2]); t.ret(x + (w >> 1) + 2, y + (h >> 1), (w >> 1) - 3, 1, r[0]);
  t.p(x + (w >> 1) + 2, y + (h >> 1) + 3, k.luz);
  if (arco) { t.p(x - 1, y - 1, VAZIO); t.p(x + w, y - 1, VAZIO); t.ret(x + 1, y - 2, w - 2, 1, r[0]); t.ret(x + 2, y - 1, w - 4, 1, k.vidro); }
  t.ret(x - 2, y + h, w + 4, 1, k.ped[2]);
}
function janela(k: K, x: number, y: number, w: number, h: number, mold: Rampa, o: { ven?: Rampa; arco?: boolean; floreira?: boolean } = {}) {
  const { t } = k;
  if (o.ven) for (const vx of [x - 4, x + w + 1]) { t.ret(vx, y, 3, h, o.ven[1]); for (let j = 1; j < h; j += 2) t.ret(vx, y + j, 3, 1, o.ven[0]); t.ret(vx, y, 3, 1, o.ven[2]); }
  t.ret(x, y, w, h, mold[1]); t.ret(x, y, w, 1, mold[2]); t.ret(x, y + h - 1, w, 1, mold[0]);
  t.ret(x + 1, y + 1, w - 2, h - 2, k.vidro);
  t.ret(x + (w >> 1), y + 1, 1, h - 2, mold[1]); t.ret(x + 1, y + (h >> 1), w - 2, 1, mold[1]);
  t.p(x + 2, y + 2, k.br); t.p(x + 1, y + 2, k.br);
  if (o.arco) { t.ret(x + 1, y - 1, w - 2, 1, mold[2]); t.ret(x + 2, y - 2, w - 4, 1, mold[1]); }
  t.ret(x - 1, y + h, w + 2, 1, mold[0]);
  if (o.floreira) {
    t.ret(x - 1, y + h + 1, w + 2, 2, k.mad[1]); t.ret(x - 1, y + h + 2, w + 2, 1, k.mad[0]);
    for (let i = 0; i < w + 1; i += 2) { t.p(x - 1 + i, y + h, k.c('v')); t.p(x + i, y + h - 1, i % 4 ? k.c('p') : k.c('y')); }
  }
}
function chamine(k: K, x: number, y: number, h: number, r: Rampa) {
  k.t.ret(x, y, 6, h, r[1]); k.t.ret(x, y, 1, h, r[2]); k.t.ret(x + 4, y, 2, h, r[0]);
  k.t.ret(x - 1, y - 2, 8, 3, r[1]); k.t.ret(x - 1, y - 2, 8, 1, r[2]); k.t.ret(x - 1, y, 8, 1, r[0]);
}
/** degrau de pedra na frente da porta */
const degrau = (k: K, x: number, w: number) => { k.t.ret(x, k.H - 2, w, 2, k.ped[1]); k.t.ret(x, k.H - 2, w, 1, k.ped[2]); };
function lampiao(k: K, x: number, y: number) {
  k.t.ret(x, y, 3, 1, k.met[0]); k.t.ret(x, y + 1, 3, 3, k.luz); k.t.p(x + 1, y + 2, k.br); k.t.ret(x, y + 4, 3, 1, k.met[0]);
}
const fim = (k: K, extra: Partial<ObjetoPintado> = {}): ObjetoPintado => { k.t.contornar(k.k); return { img: k.t.img, ...extra }; };

interface OpCasa {
  pAlt?: number; tAlt?: number; tel?: Rampa; estilo?: Estilo; par?: Rampa; bar?: Rampa | null; material?: 'reboco' | 'madeira' | 'tijolo';
  portaX: number; portaCor?: Rampa; janelas?: number[]; ven?: Rampa; floreira?: boolean; chamine?: number; alpendre?: boolean; recuo?: number;
}
/** casa térrea: parede, telhado de quatro águas visto de frente, porta e janelas */
function casa(k: K, o: OpCasa): { yP: number; yT: number } {
  const { t, W, H } = k;
  const pAlt = o.pAlt ?? 26, tAlt = o.tAlt ?? 36, par = o.par ?? k.par, tel = o.tel ?? k.tel;
  const yP = H - 1 - pAlt, yT = yP - tAlt + 5;
  if (o.material === 'madeira') tabuado(k, 2, yP, W - 4, pAlt, par); else if (o.material === 'tijolo') tijolo(k, 2, yP, W - 4, pAlt, par);
  else parede(k, 2, yP, W - 4, pAlt, par, o.bar === null ? undefined : o.bar ?? k.det);
  if (o.chamine !== undefined) chamine(k, o.chamine, yT - 5, 14, k.ped);
  telhado(k, 0, yT, W, tAlt, tel, { estilo: o.estilo, recuo: o.recuo ?? 4 });
  t.ret(2, yT + tAlt, W - 4, 2, par[0]);
  for (const jx of o.janelas ?? []) janela(k, jx, yP + 8, 10, 10, o.portaCor ?? k.det, { ven: o.ven, floreira: o.floreira });
  porta(k, o.portaX, H - 1 - 18, 12, 17, o.portaCor ?? k.det);
  degrau(k, o.portaX - 2, 16);
  if (o.alpendre) {
    telhado(k, 0, yP + 3, W, 8, tel, { estilo: o.estilo, recuo: 1 });
    for (const px of [3, W - 6, o.portaX - 4, o.portaX + 13]) { t.ret(px, yP + 11, 3, pAlt - 11, k.mad[1]); t.ret(px, yP + 11, 1, pAlt - 11, k.mad[2]); t.ret(px + 2, yP + 11, 1, pAlt - 11, k.mad[0]); }
  }
  return { yP, yT };
}
/** sobrado colonial: fachada colorida, cunhais e molduras brancas, sacadas de ferro, beiral */
function sobrado(k: K, cor: Rampa, o: { portaX: number; janelas: number[]; azulejo?: boolean }): void {
  const { t, W, H } = k;
  const pAlt = 50, yP = H - 1 - pAlt, tAlt = 20, yT = yP - tAlt + 4;
  parede(k, 2, yP, W - 4, pAlt, cor);
  t.ret(2, yP, 3, pAlt, k.par[1]); t.ret(W - 5, yP, 3, pAlt, k.par[0]); t.ret(2, yP, 1, pAlt, k.par[2]);
  t.ret(2, yP + 24, W - 4, 2, k.par[1]); t.ret(2, yP + 26, W - 4, 1, cor[0]);
  telhado(k, 0, yT, W, tAlt, k.tel, { recuo: 3 });
  t.ret(1, yT + tAlt, W - 2, 2, k.par[2]); t.ret(1, yT + tAlt + 2, W - 2, 1, k.par[0]); t.ret(2, yT + tAlt + 3, W - 4, 2, cor[0]);
  for (const jx of o.janelas) {
    janela(k, jx, yP + 9, 8, 13, k.par, { arco: true });
    t.ret(jx - 2, yP + 19, 12, 1, k.met[2]); for (let i = 0; i < 12; i += 2) t.ret(jx - 2 + i, yP + 20, 1, 3, k.met[0]); t.ret(jx - 2, yP + 23, 12, 1, k.met[1]);
    if (jx < o.portaX - 6 || jx > o.portaX + 10) janela(k, jx, yP + 31, 8, 11, k.par, { arco: true });
  }
  if (o.azulejo) for (let i = 5; i < W - 5; i++) for (let j = 0; j < 5; j++) t.p(i, H - 6 + j, (i + j) % 4 === 0 ? k.det[0] : (i - j + 8) % 4 === 0 ? k.det[2] : (i % 4 === 2 && j === 2) ? k.det2[1] : k.br);
  else t.ret(2, H - 5, W - 4, 4, k.ped[1]);
  porta(k, o.portaX, H - 1 - 19, 12, 18, k.det, true);
  degrau(k, o.portaX - 2, 16);
}
/** placa redonda de fachada com desenho de 5×5 */
function emblema(k: K, cx: number, cy: number, fundo: Rampa, desenho: string[], cor: number) {
  k.t.elipse(cx, cy, 6, 6, fundo[0]); k.t.elipse(cx, cy, 5, 5, fundo[1]); k.t.elipse(cx - 1, cy - 1, 3, 3, fundo[2]);
  desenho.forEach((l, j) => { for (let i = 0; i < l.length; i++) if (l[i] !== '.') k.t.p(cx - 2 + i, cy - 2 + j, cor); });
}
const FOLHA5 = ['..##.', '.###.', '####.', '.##..', '#....'];
const ENGRENAGEM5 = ['.#.#.', '#####', '.#.#.', '#####', '.#.#.'];
const ESTRELA5 = ['..#..', '.###.', '#####', '.###.', '.#.#.'];

/* ------------------------------ os pintores ------------------------------ */
const P: Record<string, PintorObjeto> = {};

P['casa-a'] = (x) => { const k = kit(x); casa(k, { portaX: 18, janelas: [40], ven: k.det }); return fim(k, { luzes: [[24, k.H - 4, 12]] }); };
P['casa-b'] = (x) => {
  const k = kit(x);
  casa(k, { par: k.det2, bar: k.par, portaX: 34, portaCor: rampa('#6a3a2a', '#a8623a', '#d89858'), janelas: [9], floreira: true, chamine: 44, tAlt: 34 });
  return fim(k, { luzes: [[40, k.H - 4, 12]] });
};
P['casa-c'] = (x) => { const k = kit(x); casa(k, { portaX: 34, janelas: [9, 60], alpendre: true, tAlt: 32, bar: k.det2 }); return fim(k, { luzes: [[40, k.H - 4, 14]] }); };
P['casa-d'] = (x) => {
  const k = kit(x);
  casa(k, { material: 'madeira', par: k.mad, tel: k.met, estilo: 'zinco', portaX: 18, portaCor: k.det2, janelas: [40], tAlt: 30, pAlt: 28 });
  return fim(k, { luzes: [[24, k.H - 4, 12]] });
};
P['casa-e'] = (x) => { const k = kit(x); casa(k, { portaX: 18, janelas: [], bar: k.det2, portaCor: k.det2, tAlt: 34, recuo: 5 }); janela(k, 34, k.H - 20, 8, 9, k.det2); return fim(k, { luzes: [[24, k.H - 4, 12]] }); };
P['casa-f'] = (x) => {
  const k = kit(x), { t } = k;
  const { yT } = casa(k, { portaX: 50, janelas: [8, 26], ven: k.det2, portaCor: k.det2, bar: null, tAlt: 34 });
  // caixa-d'água no telhado e varal com roupas na lateral
  t.ret(10, yT - 6, 12, 9, k.det[1]); t.ret(10, yT - 6, 12, 1, k.det[2]); t.ret(20, yT - 5, 2, 8, k.det[0]); t.ret(9, yT - 7, 14, 1, k.det[0]);
  t.ret(4, k.H - 10, 40, 1, k.met[2]);
  [[7, k.det2[1]], [15, k.br], [31, k.det[1]], [38, k.tel[2]]].forEach(([vx, cor]) => { t.ret(vx, k.H - 9, 5, 5, cor); t.ret(vx, k.H - 5, 5, 1, k.par[0]); });
  return fim(k, { luzes: [[56, k.H - 4, 12]] });
};
P['casa-palafita'] = (x) => {
  const k = kit(x), { t, W, H } = k;
  const palha = rampa('#a8782e', '#d8b050', '#f4dc86');
  const yPiso = H - 14;
  for (const px of [5, 24, 40, W - 8]) { t.ret(px, yPiso, 3, 13, k.mad[1]); t.ret(px, yPiso, 1, 13, k.mad[2]); t.ret(px + 2, yPiso, 1, 13, k.mad[0]); t.ret(px - 1, H - 2, 5, 1, k.c('e')); }
  t.ret(0, yPiso - 3, W, 4, k.mad[1]); t.ret(0, yPiso - 3, W, 1, k.mad[2]); t.ret(0, yPiso, W, 1, k.mad[0]);
  tabuado(k, 3, yPiso - 27, W - 6, 24, k.mad, true);
  telhado(k, 0, yPiso - 54, W, 30, palha, { estilo: 'palha', recuo: 7 });
  for (let i = 1; i < W - 1; i += 2) t.p(i, yPiso - 24, palha[0]);
  janela(k, 42, yPiso - 20, 9, 9, k.det2);
  porta(k, 18, yPiso - 20, 12, 17, k.det);
  // escada de mão até o chão
  t.ret(19, yPiso + 1, 1, 12, k.mad[2]); t.ret(28, yPiso + 1, 1, 12, k.mad[0]); for (let j = 3; j < 13; j += 3) t.ret(20, yPiso + j, 8, 1, k.mad[1]);
  return fim(k, { sombra: 'nenhuma', luzes: [[24, H - 20, 12]] });
};
P['casa-colonial-a'] = (x) => { const k = kit(x); sobrado(k, k.det2, { portaX: 18, janelas: [8, 28, 48] }); return fim(k, { luzes: [[24, k.H - 4, 12]] }); };
P['casa-colonial-b'] = (x) => { const k = kit(x); sobrado(k, k.det, { portaX: 34, janelas: [8, 28, 48], azulejo: true }); return fim(k, { luzes: [[40, k.H - 4, 12]] }); };
P['casa-colonial-c'] = (x) => { const k = kit(x); sobrado(k, rampa('#b8506a', '#ee8a9c', '#ffc2c8'), { portaX: 34, janelas: [9, 36, 63] }); return fim(k, { luzes: [[40, k.H - 4, 12]] }); };

P.posto = (x) => {
  const k = kit(x), { t, H } = k;
  const verde = rampa('#147a72', '#22b09a', '#6fe0c0');
  const { yT } = casa(k, { tel: verde, portaX: 34, portaCor: verde, janelas: [8, 62], bar: verde, tAlt: 36 });
  // frontão com o emblema da folha e lampiões na porta
  t.ret(28, yT + 16, 24, 20, k.par[1]); t.ret(28, yT + 16, 24, 1, k.par[2]); t.ret(50, yT + 17, 2, 19, k.par[0]);
  for (let j = 0; j < 8; j++) t.ret(28 + j * 1.5, yT + 15 - j, 24 - j * 3, 1, j === 7 ? verde[2] : verde[1]);
  emblema(k, 40, yT + 26, verde, FOLHA5, k.br);
  lampiao(k, 29, H - 18); lampiao(k, 48, H - 18);
  return fim(k, { luzes: [[40, H - 6, 20]] });
};
P.venda = (x) => {
  const k = kit(x), { t, W, H } = k;
  const { yP } = casa(k, { portaX: 18, janelas: [], bar: k.det2, tAlt: 32 });
  // vitrine e toldo listrado
  t.ret(36, H - 20, 22, 13, k.det[0]); t.ret(37, H - 19, 20, 11, k.vidro); t.ret(47, H - 19, 1, 11, k.det[1]); t.p(39, H - 17, k.br); t.p(40, H - 18, k.br);
  for (const [vx, cor] of [[39, k.det2[1]], [43, k.tel[2]], [50, k.c('v')], [54, k.det2[2]]] as [number, number][]) t.ret(vx, H - 12, 3, 4, cor);
  for (let i = 1; i < W - 1; i++) for (let j = 0; j < 8; j++) t.p(i + (j > 5 ? 0 : 0), yP + 2 + j, ((i / 5) | 0) % 2 ? (j > 5 ? k.par[0] : k.br) : j > 5 ? k.tel[0] : j === 0 ? k.tel[2] : k.tel[1]);
  for (let i = 1; i < W - 1; i++) if (((i / 5) | 0) % 2 === 0 || i % 5 !== 2) t.p(i, yP + 10, ((i / 5) | 0) % 2 ? k.par[0] : k.tel[0]);
  // caixotes de mercadoria
  t.caixa(2, H - 9, 8, 8, k.mad); t.ret(3, H - 10, 6, 2, k.c('X')); t.p(4, H - 10, k.c('o'));
  return fim(k, { luzes: [[24, H - 4, 12], [47, H - 6, 14]] });
};
P.ginasio = (x) => {
  const k = kit(x), { t, W, H } = k;
  const tema = typeof x.spawn.cor === 'string' ? rampa(...(x.spawn.cor as string).split(',') as [string, string, string]) : k.det;
  const yP = H - 1 - 46;
  parede(k, 3, yP, W - 6, 46, k.ped);
  for (let j = 6; j < 46; j += 6) t.ret(3, yP + j, W - 6, 1, k.ped[0]);
  telhado(k, 0, yP - 30, W, 34, k.tel, { recuo: 6 });
  // frontão triangular com medalha
  for (let j = 0; j < 20; j++) { const m = Math.round(j * 1.5); t.ret(48 - m, yP - 16 + j, m * 2, 1, j === 0 ? k.par[2] : k.par[1]); t.p(48 - m, yP - 16 + j, k.par[2]); t.p(47 + m, yP - 16 + j, k.par[0]); }
  t.ret(16, yP + 2, 64, 3, k.par[1]); t.ret(16, yP + 2, 64, 1, k.par[2]); t.ret(16, yP + 5, 64, 1, k.ped[0]);
  emblema(k, 48, yP - 5, tema, ESTRELA5, k.br);
  for (const cx of [18, 34, 58, 74]) { t.ret(cx, yP + 6, 5, 39, k.par[1]); t.ret(cx, yP + 6, 1, 39, k.par[2]); t.ret(cx + 3, yP + 6, 2, 39, k.par[0]); t.ret(cx - 1, yP + 6, 7, 2, k.par[2]); t.ret(cx - 1, H - 4, 7, 3, k.par[0]); }
  for (const bx of [25, 65]) { t.ret(bx, yP + 10, 7, 22, tema[1]); t.ret(bx, yP + 10, 1, 22, tema[2]); t.ret(bx + 5, yP + 10, 2, 22, tema[0]); t.p(bx + 3, yP + 32, tema[1]); t.ret(bx + 2, yP + 15, 3, 3, k.br); }
  porta(k, 41, H - 1 - 24, 14, 23, tema, true);
  janela(k, 6, yP + 14, 8, 12, k.par, { arco: true }); janela(k, W - 14, yP + 14, 8, 12, k.par, { arco: true });
  t.ret(36, H - 3, 24, 3, k.ped[2]); t.ret(36, H - 1, 24, 1, k.ped[0]);
  return fim(k, { luzes: [[48, H - 6, 22]] });
};
P.laboratorio = (x) => {
  const k = kit(x), { t, W, H } = k;
  const yP = H - 1 - 34;
  parede(k, 2, yP, W - 4, 34, k.par, k.det);
  // telhado plano com platibanda, claraboia e antena parabólica
  t.ret(0, yP - 20, W, 22, k.met[1]); for (let i = 0; i < W; i += 6) t.ret(i, yP - 19, 1, 20, k.met[0]);
  t.ret(0, yP - 20, W, 2, k.met[2]); t.ret(0, yP, W, 3, k.par[1]); t.ret(0, yP, W, 1, k.par[2]); t.ret(0, yP + 3, W, 1, k.par[0]);
  t.ret(10, yP - 16, 22, 11, k.det[0]); t.ret(11, yP - 15, 20, 9, k.vidro); t.ret(21, yP - 15, 1, 9, k.det[1]); t.p(13, yP - 13, k.br); t.p(14, yP - 14, k.br);
  t.ret(70, yP - 20, 2, 12, k.met[0]); t.esfera(71, yP - 24, 9, 6, [k.met[0], k.met[1], k.met[2], k.br]); t.ret(63, yP - 24, 17, 7, VAZIO); t.esfera(71, yP - 25, 8, 3, [k.met[0], k.met[1], k.met[2]]); t.p(71, yP - 29, k.c('X')); t.ret(71, yP - 28, 1, 3, k.met[0]);
  for (const jx of [6, 22, 56, 72]) { t.ret(jx, yP + 8, 14, 14, k.det[0]); t.ret(jx + 1, yP + 9, 12, 12, k.vidro); t.ret(jx + 7, yP + 9, 1, 12, k.det[1]); t.ret(jx + 1, yP + 15, 12, 1, k.det[1]); t.p(jx + 2, yP + 11, k.br); t.p(jx + 3, yP + 10, k.br); }
  porta(k, 34, H - 1 - 20, 12, 19, k.det, true);
  t.ret(30, H - 26, 20, 4, k.det2[1]); t.ret(30, H - 26, 20, 1, k.det2[2]); for (let i = 32; i < 48; i += 3) t.p(i, H - 24, k.det[0]);
  degrau(k, 32, 16);
  return fim(k, { luzes: [[40, H - 6, 18]] });
};
P.estacao = (x) => {
  const k = kit(x), { t, W, H } = k;
  const { yP, yT } = casa(k, { portaX: 66, janelas: [8, 28, 90, 110], tAlt: 30, bar: k.det2, recuo: 3 });
  // corpo central com frontão e relógio
  parede(k, 46, yT + 4, 36, yP - yT + 6, k.par);
  for (let j = 0; j < 16; j++) { const m = Math.round(j * 1.3); t.ret(64 - m, yT - 11 + j, m * 2, 1, k.tel[1]); t.p(64 - m, yT - 11 + j, k.tel[2]); t.p(63 + m, yT - 11 + j, k.tel[0]); }
  t.ret(43, yT + 5, 42, 2, k.tel[0]);
  t.elipse(64, yT + 16, 6, 6, k.det[0]); t.elipse(64, yT + 16, 5, 5, k.br); t.ret(64, yT + 12, 1, 5, k.k); t.ret(64, yT + 16, 3, 1, k.k);
  // marquise de madeira sobre a plataforma
  telhado(k, 0, yP + 2, W, 7, k.mad, { estilo: 'liso', recuo: 0 });
  for (let i = 2; i < W - 2; i += 4) t.p(i, yP + 9, k.mad[0]);
  for (const px of [3, 42, 84, W - 6]) { t.ret(px, yP + 9, 3, 16, k.met[1]); t.ret(px, yP + 9, 1, 16, k.met[2]); t.ret(px + 2, yP + 9, 1, 16, k.met[0]); }
  t.ret(50, yP - 6, 28, 7, k.det[1]); t.ret(50, yP - 6, 28, 1, k.det[2]); for (let i = 53; i < 76; i += 3) t.ret(i, yP - 4, 2, 3, k.br);
  return fim(k, { luzes: [[72, H - 6, 20], [20, H - 8, 12], [108, H - 8, 12]] });
};
P.mercado = (x) => {
  const k = kit(x), { t, W, H } = k;
  const { yP } = casa(k, { portaX: 50, janelas: [], tAlt: 30, bar: k.det2, recuo: 3 });
  const cores: Rampa[] = [k.det, k.det2];
  [[3, 40], [66, 27]].forEach(([bx, larg], n) => {
    const r = cores[n];
    for (let i = 0; i < larg; i++) for (let j = 0; j < 9; j++) t.p(bx + i, yP + 2 + j, ((i / 4) | 0) % 2 ? (j > 6 ? k.par[0] : k.br) : j > 6 ? r[0] : j === 0 ? r[2] : r[1]);
    t.caixa(bx, H - 12, larg, 11, k.mad);
    for (let i = 2; i < larg - 3; i += 5) { const cor = [k.c('X'), k.c('y'), k.c('v'), k.c('e'), k.c('o')][((i / 5) | 0 + n * 2) % 5]; t.ret(bx + i, H - 14, 4, 3, cor); t.p(bx + i + 1, H - 15, cor); t.p(bx + i, H - 14, k.br); }
    t.ret(bx, yP + 11, 1, 14, k.mad[2]); t.ret(bx + larg - 1, yP + 11, 1, 14, k.mad[0]);
  });
  return fim(k, { luzes: [[56, H - 4, 14], [22, H - 10, 14]] });
};
P.oficina = (x) => {
  const k = kit(x), { t, W, H } = k;
  const { yP, yT } = casa(k, { material: 'tijolo', par: k.tel, tel: k.met, estilo: 'zinco', portaX: 34, janelas: [], tAlt: 30, pAlt: 30 });
  // portão de enrolar no lugar da porta e janela basculante
  t.ret(28, H - 24, 24, 23, k.met[0]); for (let j = 0; j < 21; j++) t.ret(29, H - 23 + j, 22, 1, j % 3 === 2 ? k.met[0] : j % 3 === 0 ? k.met[2] : k.met[1]);
  t.ret(36, H - 9, 8, 8, k.k); t.ret(37, H - 8, 6, 7, hex('#3a2c3a'));
  janela(k, 60, yP + 8, 12, 8, k.met); janela(k, 8, yP + 8, 12, 8, k.met);
  emblema(k, 40, yT + 20, k.det2, ENGRENAGEM5, k.k);
  t.ret(5, H - 8, 6, 7, k.met[1]); t.ret(5, H - 8, 6, 1, k.met[2]); t.ret(5, H - 5, 6, 1, k.tel[0]);
  return fim(k, { luzes: [[40, H - 5, 16]] });
};
P.observatorio = (x) => {
  const k = kit(x), { t, W, H } = k;
  const yP = H - 1 - 40;
  // torre redonda: sombreamento em faixas verticais
  for (let i = 4; i < W - 4; i++) { const f = (i - 4) / (W - 9); const tom = f < 0.18 ? 2 : f > 0.7 ? 0 : 1; t.ret(i, yP, 1, 40, k.par[tom]); }
  for (let j = 8; j < 40; j += 8) for (let i = 4; i < W - 4; i += 2) t.p(i, yP + j, k.par[0]);
  t.ret(4, H - 6, W - 8, 5, k.ped[1]); t.ret(4, H - 6, W - 8, 1, k.ped[2]);
  t.esfera(W / 2, yP, W / 2 - 3, 24, [k.met[0], k.met[1], k.met[2], k.br]);
  t.ret(0, yP + 1, W, 30, VAZIO);
  for (let i = 4; i < W - 4; i++) { const f = (i - 4) / (W - 9); t.ret(i, yP, 1, 40, k.par[f < 0.18 ? 2 : f > 0.7 ? 0 : 1]); }
  t.ret(3, yP - 1, W - 6, 3, k.det[1]); t.ret(3, yP - 1, W - 6, 1, k.det[2]); t.ret(3, yP + 1, W - 6, 1, k.det[0]);
  // fenda da cúpula e luneta
  t.ret(36, yP - 22, 6, 21, k.k); t.ret(37, yP - 21, 4, 19, hex('#2a2440'));
  t.linha(39, yP - 10, 50, yP - 24, k.det2[1], 3); t.linha(38, yP - 10, 49, yP - 24, k.det2[2], 1); t.ret(49, yP - 27, 4, 3, k.det2[0]);
  for (const jx of [10, 44]) janela(k, jx, yP + 8, 8, 10, k.det, { arco: true });
  t.ret(4, H - 6, W - 8, 5, k.ped[1]); t.ret(4, H - 6, W - 8, 1, k.ped[2]);
  porta(k, 18, H - 1 - 18, 12, 17, k.det, true);
  return fim(k, { luzes: [[24, H - 4, 12]] });
};
P.forja = (x) => {
  const k = kit(x), { t, H } = k;
  const { yP, yT } = casa(k, { material: 'tijolo', par: k.ped, portaX: 18, portaCor: k.mad, janelas: [], tAlt: 32, chamine: 46 });
  chamine(k, 46, yT - 12, 20, k.ped);
  // fornalha acesa
  t.ret(38, H - 18, 18, 17, k.ped[0]); t.ret(40, H - 15, 14, 13, k.k);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 9; j++) if (j > 3 - (i % 3) || (i > 3 && i < 8)) t.p(41 + i, H - 11 + j, j > 5 ? k.luz : (i + j) % 3 ? k.c('o') : k.c('X'));
  t.ret(40, H - 15, 14, 1, k.ped[2]);
  // bigorna na frente
  t.ret(4, H - 6, 8, 2, k.met[1]); t.ret(3, H - 8, 10, 2, k.met[2]); t.ret(6, H - 4, 4, 3, k.met[0]);
  void yP;
  return fim(k, { luzes: [[47, H - 6, 20], [24, H - 4, 10]] });
};
P.igreja = (x) => {
  const k = kit(x), { t, W, H } = k;
  const yP = H - 1 - 44;
  parede(k, 3, yP, W - 6, 44, k.par);
  // frontão curvo colonial
  for (let j = 0; j < 14; j++) { const m = Math.round(29 * Math.sqrt(1 - Math.pow(1 - j / 14, 2))); t.ret(32 - m, yP - 14 + j, m * 2, 1, k.par[1]); t.p(32 - m, yP - 14 + j, k.par[2]); t.ret(31 + m - 1, yP - 14 + j, 2, 1, k.par[0]); }
  t.ret(3, yP, W - 6, 2, k.det[1]); t.ret(3, yP + 2, W - 6, 1, k.det[0]);
  t.ret(3, yP, 3, 44, k.det[1]); t.ret(W - 6, yP, 3, 44, k.det[0]);
  // torre do sino com telhadinho e cruz
  t.ret(22, yP - 42, 20, 32, k.par[1]); t.ret(22, yP - 42, 1, 32, k.par[2]); t.ret(39, yP - 42, 3, 32, k.par[0]);
  t.ret(27, yP - 36, 10, 13, k.det[0]); t.ret(28, yP - 35, 8, 12, hex('#2a2440')); t.ret(28, yP - 36, 8, 1, k.det[2]);
  t.elipse(32, yP - 29, 3, 3, k.det2[1]); t.p(31, yP - 31, k.det2[2]); t.ret(32, yP - 26, 1, 2, k.det2[0]);
  t.ret(20, yP - 22, 24, 2, k.det[1]); t.ret(20, yP - 20, 24, 1, k.det[0]);
  for (let j = 0; j < 10; j++) t.ret(21 + j, yP - 52 + j, 22 - j * 2, 1, j % 3 === 2 ? k.tel[0] : k.tel[1]);
  for (let j = 0; j < 10; j++) t.p(21 + j, yP - 43 - j + 0, k.tel[2]);
  telhado(k, 20, yP - 45, 24, 4, k.tel, { recuo: 1 });
  t.ret(31, yP - 62, 2, 10, k.det2[1]); t.ret(28, yP - 59, 8, 2, k.det2[1]); t.p(31, yP - 62, k.det2[2]);
  // óculo, porta em arco e janelas
  t.elipse(32, yP + 10, 4, 4, k.det[0]); t.elipse(32, yP + 10, 3, 3, k.vidro); t.p(31, yP + 9, k.br);
  janela(k, 8, yP + 18, 7, 12, k.det, { arco: true }); janela(k, W - 15, yP + 18, 7, 12, k.det, { arco: true });
  porta(k, 18, H - 1 - 21, 12, 20, k.det, true);
  t.ret(14, H - 3, 20, 3, k.ped[2]); t.ret(14, H - 1, 20, 1, k.ped[0]);
  return fim(k, { luzes: [[24, H - 5, 14]] });
};
P.farol = (x) => {
  const k = kit(x), { t, W, H } = k;
  const verm = k.tel;
  for (let y = 22; y < H - 6; y++) {
    const u = (y - 22) / (H - 28), meia = Math.round(8 + 5 * u);
    for (let i = -meia; i <= meia; i++) {
      const f = (i + meia) / (meia * 2), faixa = ((y - 22) / 14 | 0) % 2 === 0;
      const r = faixa ? verm : k.par;
      t.p(16 + i, y, r[f < 0.22 ? 2 : f > 0.68 ? 0 : 1]);
    }
  }
  t.ret(1, H - 7, W - 2, 6, k.ped[1]); t.ret(1, H - 7, W - 2, 1, k.ped[2]); t.ret(1, H - 2, W - 2, 1, k.ped[0]);
  // sacada, lanterna e cúpula
  t.ret(5, 20, 22, 3, k.met[1]); t.ret(5, 20, 22, 1, k.met[2]); for (let i = 5; i < 27; i += 3) t.ret(i, 16, 1, 4, k.met[0]); t.ret(5, 15, 22, 1, k.met[2]);
  t.ret(10, 8, 12, 12, k.met[0]); t.ret(11, 9, 10, 10, k.luz); t.ret(15, 9, 2, 10, k.br); t.ret(13, 9, 1, 10, k.met[1]); t.ret(18, 9, 1, 10, k.met[1]);
  for (let j = 0; j < 6; j++) t.ret(10 + j, 7 - j, 12 - j * 2, 1, j === 5 ? verm[2] : verm[1]); t.ret(15, 0, 2, 2, k.met[2]);
  janela(k, 13, 44, 6, 8, k.det, { arco: true }); janela(k, 13, 70, 6, 8, k.det, { arco: true });
  porta(k, 2, H - 1 - 17, 12, 16, k.det, true);
  return fim(k, { luzes: [[16, 14, 30], [8, H - 4, 10]] });
};
P['usina-fachada'] = (x) => {
  const k = kit(x), { t, W, H } = k;
  const yP = H - 1 - 56, tij = k.tel;
  for (const [cx, alt] of [[14, 44], [100, 34]] as [number, number][]) {
    for (let j = 0; j < alt + 20; j++) for (let i = 0; i < 10; i++) t.p(cx + i, yP - alt + j, (j % 12 < 3) ? k.par[i < 2 ? 2 : i > 6 ? 0 : 1] : tij[i < 2 ? 2 : i > 6 ? 0 : 1]);
    t.ret(cx - 1, yP - alt - 2, 12, 3, k.met[1]); t.ret(cx - 1, yP - alt - 2, 12, 1, k.met[2]);
  }
  tijolo(k, 2, yP, W - 4, 56, tij);
  // dente de serra do telhado fabril
  for (let s = 0; s < 4; s++) for (let j = 0; j < 14; j++) { t.ret(30 + s * 17, yP - 14 + j, j + 2, 1, k.met[1]); t.p(30 + s * 17, yP - 14 + j, k.met[2]); t.p(30 + s * 17 + j + 1, yP - 14 + j, k.met[0]); if (j > 3 && j < 12) t.ret(30 + s * 17 + 1, yP - 14 + j, Math.min(3, j - 2), 1, k.vidro); }
  t.ret(0, yP, W, 3, k.ped[1]); t.ret(0, yP, W, 1, k.ped[2]); t.ret(0, yP + 3, W, 1, k.ped[0]);
  for (let jx = 8; jx < W - 16; jx += 18) { if (jx > 50 && jx < 76) continue; for (const jy of [10, 30]) { t.ret(jx, yP + jy, 12, 12, k.met[0]); t.ret(jx + 1, yP + jy + 1, 10, 10, k.vidro); t.ret(jx + 4, yP + jy + 1, 1, 10, k.met[0]); t.ret(jx + 8, yP + jy + 1, 1, 10, k.met[0]); t.ret(jx + 1, yP + jy + 5, 10, 1, k.met[0]); } }
  // portão de ferro e placa de raio
  t.ret(56, H - 30, 32, 29, k.met[0]); for (let i = 0; i < 30; i++) t.ret(57 + i, H - 29, 1, 28, i % 5 === 4 ? k.met[0] : i % 5 === 0 ? k.met[2] : k.met[1]);
  t.ret(66, H - 13, 12, 12, k.k); t.ret(67, H - 12, 10, 11, hex('#2a2440'));
  t.ret(62, H - 40, 20, 8, k.det2[1]); t.ret(62, H - 40, 20, 1, k.det2[2]);
  for (const [i, j] of [[73, 0], [72, 1], [71, 2], [70, 3], [71, 3], [72, 3], [73, 3], [72, 4], [71, 5], [70, 6]]) t.p(i, H - 39 + j, k.k);
  return fim(k, { luzes: [[72, H - 6, 22]] });
};
function boca(k: K, madeira: boolean) {
  const { t, W, H } = k, r = ['r', 'R', 'q', 'Q'].map(k.c);
  t.esfera(W / 2, H - 4, W / 2 - 1, H - 10, r);
  t.esfera(10, H - 8, 9, 12, r); t.esfera(W - 10, H - 9, 9, 13, r);
  for (let j = 0; j < 22; j++) { const m = Math.round(9 * Math.sqrt(1 - Math.pow(Math.max(0, 1 - j / 9), 2))); t.ret(W / 2 - m, H - 23 + j, m * 2, 1, j < 3 ? hex('#3a2c48') : hex('#15121f')); }
  if (madeira) {
    t.ret(13, H - 25, 3, 24, k.mad[1]); t.ret(13, H - 25, 1, 24, k.mad[2]); t.ret(32, H - 25, 3, 24, k.mad[1]); t.ret(34, H - 25, 1, 24, k.mad[0]);
    t.ret(11, H - 28, 26, 4, k.mad[1]); t.ret(11, H - 28, 26, 1, k.mad[2]); t.ret(11, H - 25, 26, 1, k.mad[0]);
    for (let j = 0; j < 8; j += 3) { t.ret(19, H - 2 - j, 10, 1, k.mad[0]); } t.ret(20, H - 9, 1, 9, k.met[2]); t.ret(27, H - 9, 1, 9, k.met[2]);
    lampiao(k, 22, H - 24);
  }
  t.ret(0, H - 1, W, 1, VAZIO);
}
P['mina-entrada'] = (x) => { const k = kit(x); boca(k, true); return fim(k, { sombra: 'elipse', luzes: [[24, k.H - 16, 14]] }); };
P['caverna-entrada'] = (x) => { const k = kit(x); boca(k, false); k.t.manchar(8, k.H - 30, 8, 5, k.c('F'), ['R', 'q', 'Q'].map(k.c)); k.t.manchar(38, k.H - 28, 7, 4, k.c('v'), ['R', 'q', 'Q'].map(k.c)); return fim(k, { sombra: 'elipse' }); };
P.coreto = (x) => {
  const k = kit(x), { t, W, H } = k;
  // base de pedra, gradil, colunas finas e telhado cônico com lambrequim
  t.ret(3, H - 12, W - 6, 11, k.ped[1]); t.ret(3, H - 12, W - 6, 2, k.ped[2]); t.ret(3, H - 2, W - 6, 1, k.ped[0]); t.ret(W - 10, H - 10, 7, 9, k.ped[0]);
  t.ret(18, H - 8, 12, 7, k.ped[0]); for (let j = 0; j < 3; j++) t.ret(17 - j, H - 3 + j - 3, 14 + j * 2, 1, k.ped[2]);
  t.ret(4, H - 36, W - 8, 24, hex('#2f3350'));
  for (let i = 5; i < W - 5; i += 3) t.ret(i, H - 21, 1, 9, k.det[1]);
  t.ret(4, H - 22, W - 8, 1, k.det[2]); t.ret(4, H - 17, W - 8, 1, k.det[0]);
  for (const cx of [4, 15, 30, W - 7]) { t.ret(cx, H - 44, 3, 32, k.par[1]); t.ret(cx, H - 44, 1, 32, k.par[2]); t.ret(cx + 2, H - 44, 1, 32, k.par[0]); }
  for (let j = 0; j < 22; j++) { const m = Math.round(4 + j * 0.95); for (let i = -m; i <= m; i++) { const f = (i + m) / (m * 2); const seg = Math.floor(f * 5); t.p(24 + i, H - 66 + j, k.tel[(seg === 0 || seg === 1) ? 2 : seg === 4 ? 0 : 1]); if (Math.abs(f * 5 - Math.round(f * 5)) < 0.06 && j > 2) t.p(24 + i, H - 66 + j, k.tel[0]); } }
  for (let i = 0; i < W - 2; i++) t.ret(1 + i, H - 44, 1, i % 4 < 2 ? 3 : 2, i % 4 < 2 ? k.det2[1] : k.det2[0]);
  t.ret(1, H - 45, W - 2, 1, k.det2[2]);
  t.ret(23, H - 71, 2, 5, k.det2[1]); t.p(23, H - 72, k.det2[2]);
  lampiao(k, 22, H - 40);
  return fim(k, { luzes: [[24, H - 30, 22]] });
};
P.cais = (x) => {
  const k = kit(x), { t, W, H } = k;
  for (let j = 0; j < H - 4; j++) for (let i = 0; i < W; i++) t.p(i, j, j % 8 === 7 ? k.mad[0] : (i + ((j / 8) | 0) * 5) % 16 === 0 ? k.mad[0] : (i * 3 + j) % 13 === 0 ? k.mad[2] : k.mad[1]);
  t.ret(0, 0, W, 1, k.mad[2]); t.ret(0, H - 5, W, 2, k.mad[0]);
  for (const px of [2, 20, 40, W - 6]) { t.ret(px, H - 4, 4, 4, k.mad[0]); t.ret(px, H - 4, 1, 3, k.mad[1]); t.ret(px - 1, H - 1, 6, 1, k.c('e')); }
  for (const px of [1, W - 6]) { t.ret(px, 2, 5, 6, k.met[0]); t.ret(px, 1, 5, 2, k.met[1]); t.p(px + 1, 1, k.met[2]); }
  t.linha(6, 5, 16, 9, k.par[0]); t.linha(16, 9, 22, 6, k.par[0]);
  return { img: t.img, sombra: 'nenhuma' };
};
function casco(k: K, x0: number, y0: number, w: number, h: number, cor: Rampa, faixa: Rampa) {
  const { t } = k;
  for (let j = 0; j < h; j++) {
    const u = j / (h - 1), ins = Math.round(u * u * 5);
    for (let i = ins; i < w - ins * 0.6; i++) {
      const proa = i > w - 6 - ins ? 1 : 0;
      t.p(x0 + i, y0 + j, j < 2 ? faixa[j === 0 ? 2 : 1] : j === 2 ? k.br : cor[j > h - 4 ? 0 : (i + j) % 9 === 0 ? 2 : 1 - proa * 0 ]);
    }
  }
  for (let i = 2; i < w - 2; i += 3) t.p(x0 + i, y0 + h, k.c('E'));
}
P.saveiro = (x) => {
  const k = kit(x), { t, W, H } = k;
  // mastro, vela içada e bandeirola
  t.ret(38, 6, 2, H - 26, k.mad[1]); t.ret(38, 6, 1, H - 26, k.mad[2]);
  for (let j = 0; j < 46; j++) { const larg = Math.round(4 + j * 0.62); for (let i = 0; i < larg; i++) t.p(41 + i, 10 + j, i > larg - 3 ? k.par[0] : (j % 9 === 8) ? k.par[0] : i < 2 ? k.br : k.par[1]); }
  for (let j = 0; j < 30; j++) { const larg = Math.round(3 + j * 0.7); for (let i = 0; i < larg; i++) t.p(36 - i, 24 + j, i > larg - 3 ? k.det2[0] : j % 8 === 7 ? k.det2[0] : k.det2[1]); }
  t.ret(40, 2, 7, 4, k.c('X')); t.p(46, 3, VAZIO); t.p(46, 4, VAZIO);
  t.linha(39, 8, 8, H - 20, k.mad[0]); t.linha(40, 8, W - 6, H - 20, k.mad[0]);
  // cabine e casco
  t.caixa(16, H - 28, 18, 10, k.par); janela(k, 19, H - 26, 5, 5, k.det); janela(k, 27, H - 26, 5, 5, k.det); t.ret(15, H - 30, 20, 2, k.tel[1]); t.ret(15, H - 30, 20, 1, k.tel[2]);
  casco(k, 2, H - 19, W - 4, 17, k.det, k.det2);
  t.ret(2, H - 1, W, 1, VAZIO);
  return fim(k, { sombra: 'nenhuma', luzes: [[25, H - 22, 12]] });
};
P.barco = (x) => {
  const k = kit(x), { t, W, H } = k;
  casco(k, 2, H - 16, W - 4, 14, k.det2, k.det);
  t.ret(8, H - 15, W - 18, 3, k.mad[0]); t.ret(14, H - 15, 3, 3, k.mad[2]); t.ret(26, H - 15, 3, 3, k.mad[2]);
  t.ret(20, H - 26, 2, 12, k.mad[1]); t.ret(10, H - 22, 22, 1, k.mad[0]);
  for (let i = 0; i < 9; i++) t.ret(11 + i, H - 21, 1, 5 - (i >> 1), k.c('e'));
  t.ret(0, H - 1, W, 1, VAZIO);
  return fim(k, { sombra: 'nenhuma' });
};
P.jangada = (x) => {
  const k = kit(x), { t, W, H } = k;
  for (let j = 0; j < 9; j++) for (let i = 2 + (j % 2); i < W - 3 - (j % 2); i++) t.p(i, H - 11 + j, j % 3 === 2 ? k.mad[0] : j % 3 === 0 ? k.mad[2] : k.mad[1]);
  t.ret(8, H - 12, 3, 10, k.mad[0]); t.ret(34, H - 12, 3, 10, k.mad[0]);
  t.ret(22, 4, 2, H - 14, k.mad[1]); t.ret(22, 4, 1, H - 14, k.mad[2]);
  for (let j = 0; j < 30; j++) { const larg = Math.round(1 + j * 0.62); for (let i = 0; i < larg; i++) t.p(25 + i, 6 + j, i >= larg - 2 ? k.par[0] : j % 10 === 9 ? k.par[0] : i === 0 ? k.br : k.par[1]); }
  t.ret(24, 36, 20, 1, k.mad[0]);
  t.caixa(12, H - 15, 7, 5, k.mad); t.ret(30, H - 14, 4, 3, k.det2[1]);
  for (let i = 3; i < W - 3; i += 3) t.p(i, H - 2, k.c('E'));
  t.ret(0, H - 1, W, 1, VAZIO);
  return fim(k, { sombra: 'nenhuma' });
};
P.canoa = (x) => {
  const k = kit(x), { t, W, H } = k;
  for (let j = 0; j < 8; j++) { const ins = j < 2 ? 2 - j : j > 5 ? (j - 5) * 2 : 0; for (let i = 1 + ins; i < W - 1 - ins; i++) t.p(i, H - 10 + j, j === 0 ? k.mad[2] : j < 3 ? k.mad[0] : j > 5 ? k.mad[0] : k.mad[1]); }
  t.ret(5, H - 9, W - 10, 2, hex('#3a2a2a')); t.ret(12, H - 9, 2, 2, k.mad[2]); t.ret(20, H - 9, 2, 2, k.mad[2]);
  t.linha(8, H - 13, 24, H - 8, k.mad[2]); t.ret(23, H - 9, 3, 3, k.mad[1]);
  return fim(k, { sombra: 'nenhuma' });
};
P.trem = (x) => {
  const k = kit(x), { t, W, H } = k;
  const verde = rampa('#1c5a4a', '#2e8a62', '#62c088');
  // vagão de passageiros
  t.caixa(2, H - 26, 60, 18, k.det2); t.ret(1, H - 29, 62, 4, k.tel[1]); t.ret(1, H - 29, 62, 1, k.tel[2]); t.ret(1, H - 26, 62, 1, k.tel[0]);
  for (let i = 0; i < 5; i++) { t.ret(6 + i * 11, H - 22, 8, 7, k.det[0]); t.ret(7 + i * 11, H - 21, 6, 5, k.vidro); t.p(8 + i * 11, H - 20, k.br); }
  t.ret(2, H - 12, 60, 2, k.tel[1]);
  // locomotiva: caldeira, cabine, chaminé e limpa-trilhos
  t.caixa(66, H - 30, 20, 22, verde); t.ret(65, H - 33, 22, 4, k.tel[1]); t.ret(65, H - 33, 22, 1, k.tel[2]); t.ret(70, H - 26, 10, 8, k.det[0]); t.ret(71, H - 25, 8, 6, k.vidro); t.p(72, H - 24, k.br);
  for (let j = 0; j < 14; j++) for (let i = 0; i < 34; i++) t.p(86 + i, H - 23 + j, j < 3 ? verde[2] : j > 10 ? verde[0] : i % 11 === 10 ? k.det2[1] : verde[1]);
  t.ret(104, H - 32, 6, 10, k.met[0]); t.ret(103, H - 34, 8, 3, k.met[1]); t.ret(103, H - 34, 8, 1, k.met[2]); t.elipse(94, H - 25, 3, 2, k.det2[1]);
  t.ret(118, H - 20, 4, 6, k.luz); t.ret(120, H - 23, 3, 14, k.met[0]);
  for (let j = 0; j < 7; j++) t.ret(120, H - 9 + j, 2 + j, 1, k.met[1]);
  // rodas e truques
  t.ret(2, H - 10, W - 8, 3, k.met[0]);
  for (const rx of [10, 22, 42, 54, 72, 90, 102, 112]) { t.elipse(rx, H - 5, 4, 4, k.k); t.elipse(rx, H - 5, 3, 3, k.met[1]); t.p(rx, H - 5, k.met[2]); t.p(rx - 1, H - 6, k.met[2]); }
  t.ret(88, H - 6, 26, 1, k.tel[2]);
  return fim(k, { luzes: [[124, H - 12, 16]] });
};
P.placa = (x) => {
  const k = kit(x), { t } = k;
  t.ret(7, 8, 2, 7, k.mad[0]); t.ret(7, 8, 1, 7, k.mad[1]);
  t.caixa(2, 2, 12, 8, k.mad); t.ret(4, 4, 8, 1, k.mad[0]); t.ret(4, 6, 6, 1, k.mad[0]);
  return fim(k, { sombra: 'elipse' });
};
P.poste = (x) => {
  const k = kit(x), { t, H } = k;
  t.ret(7, 12, 2, H - 14, k.met[1]); t.ret(7, 12, 1, H - 14, k.met[2]); t.ret(5, H - 4, 6, 3, k.met[0]); t.ret(6, H - 5, 4, 1, k.met[1]);
  t.ret(6, 20, 4, 1, k.met[0]);
  t.ret(5, 3, 6, 1, k.met[0]); t.ret(4, 4, 8, 1, k.met[1]); t.ret(5, 5, 6, 6, k.luz); t.ret(7, 6, 2, 3, k.br); t.ret(5, 11, 6, 1, k.met[0]); t.ret(7, 1, 2, 2, k.met[1]);
  t.ret(5, 5, 1, 6, k.met[0]); t.ret(10, 5, 1, 6, k.met[0]);
  return fim(k, { sombra: 'elipse', luzes: [[8, H - 6, 30], [8, 8, 9]] });
};
P.banco = (x) => {
  const k = kit(x), { t, W } = k;
  t.ret(3, 3, W - 6, 2, k.mad[2]); t.ret(3, 6, W - 6, 2, k.mad[1]); t.ret(2, 9, W - 4, 3, k.mad[1]); t.ret(2, 9, W - 4, 1, k.mad[2]); t.ret(2, 11, W - 4, 1, k.mad[0]);
  for (const px of [4, W - 6]) { t.ret(px, 3, 2, 12, k.met[0]); t.p(px, 3, k.met[2]); }
  return fim(k, { sombra: 'elipse' });
};
P.fonte = (x) => {
  const k = kit(x), { W, H } = k;
  const quadros: Img[] = [];
  for (let f = 0; f < 4; f++) {
    const kk = kit(x), t = kk.t;
    t.esfera(W / 2, H - 11, 15, 9, [k.ped[0], k.ped[1], k.ped[2], k.br]);
    t.elipse(W / 2, H - 13, 12, 6, k.c('A'));
    for (let i = -10; i <= 10; i++) if ((i + f * 2 + 40) % 5 === 0) t.p(W / 2 + i, H - 13 + ((i * i) % 3) - 1, k.c('E')); else if ((i + f + 40) % 4 === 0) t.p(W / 2 + i, H - 11, k.c('e'));
    t.ret(W / 2 - 2, H - 30, 4, 18, k.ped[1]); t.ret(W / 2 - 2, H - 30, 1, 18, k.ped[2]); t.ret(W / 2 + 1, H - 30, 1, 18, k.ped[0]);
    t.esfera(W / 2, H - 30, 7, 3, [k.ped[0], k.ped[1], k.ped[2]]); t.elipse(W / 2, H - 31, 5, 1, k.c('e'));
    t.esfera(W / 2, H - 36, 2, 2, [k.ped[0], k.ped[1], k.ped[2]]);
    for (const lado of [-1, 1]) for (let j = 0; j < 16; j++) { const xx = W / 2 + lado * (6 + Math.round(Math.sqrt(j) * 1.2)); if ((j + f) % 4 !== 3) t.p(xx, H - 29 + j, (j + f) % 4 === 0 ? k.c('E') : k.c('e')); }
    t.contornar(k.k);
    quadros.push(t.img);
  }
  return { img: quadros[0], quadros, sombra: 'elipse' };
};
P.fogueira = (x) => {
  const k = kit(x);
  const quadros: Img[] = [];
  const chamas = [
    ['......o.....', '.....oX.....', '....oXXo....', '...oXyXXo...', '...XyyyXX...', '..oXywyyXo..', '..XXywwyXX..', '..XyywwyyX..', '...XyyyyX...'],
    ['.....o......', '.....Xo.....', '....XXo.....', '...oXyXo....', '..oXyyXXo...', '..XXywyXX...', '..XyywwyXo..', '..XXywwyyX..', '...XyyyyX...'],
    ['.......o....', '......oX....', '....o.XXo...', '...oXXyXo...', '...XXyyXX...', '..oXyywyXo..', '..XXywwyXX..', '..XyywwyyX..', '...XyyyyX...'],
    ['......o.....', '....o.Xo....', '....XoXX....', '...oXyyXo...', '..oXXyyXX...', '..XXyywyXo..', '..XyywwyXX..', '..XXywwyyX..', '...XyyyyX...'],
  ];
  for (let f = 0; f < 4; f++) {
    const kk = kit(x), t = kk.t;
    t.linha(2, 14, 13, 11, k.mad[1], 2); t.linha(13, 14, 2, 11, k.mad[0], 2); t.p(2, 13, k.mad[2]); t.p(12, 10, k.mad[2]);
    const cor: Record<string, number> = { o: k.c('o'), X: k.c('X'), y: k.luz, w: k.br };
    chamas[f].forEach((l, j) => { for (let i = 0; i < l.length; i++) if (cor[l[i]] !== undefined) t.p(2 + i, 3 + j, cor[l[i]]); });
    t.contornar(k.k);
    quadros.push(t.img);
  }
  return { img: quadros[0], quadros, sombra: 'elipse', luzes: [[8, 10, 30]] };
};
P.estatua = (x) => {
  const k = kit(x), { t, H } = k, r = [k.ped[0], k.ped[1], k.ped[2], k.br];
  t.caixa(2, H - 9, 12, 8, k.ped); t.ret(1, H - 10, 14, 2, k.ped[2]); t.ret(5, H - 6, 6, 1, k.det2[1]);
  // guardião de capa com um pássaro no ombro
  t.esfera(8, H - 17, 4, 7, r); t.esfera(8, H - 25, 3, 3, r); t.ret(4, H - 20, 1, 8, k.ped[0]); t.linha(11, H - 20, 14, H - 26, k.ped[1]); t.esfera(13, H - 27, 2, 1.5, r); t.p(15, H - 27, k.det2[1]);
  return fim(k, { sombra: 'elipse' });
};
P.totem = (x) => {
  const k = kit(x), { t, H } = k;
  t.ret(4, 6, 8, H - 8, k.mad[1]); t.ret(4, 6, 2, H - 8, k.mad[2]); t.ret(10, 6, 2, H - 8, k.mad[0]);
  // três rostos entalhados e asas pintadas
  [8, 15, 22].forEach((y, i) => { const cor = [k.c('X'), k.c('y'), k.c('e')][i]; t.ret(4, y + 5, 8, 1, k.mad[0]); t.ret(5, y, 2, 2, k.br); t.ret(9, y, 2, 2, k.br); t.p(6, y + 1, k.k); t.p(9, y + 1, k.k); t.ret(6, y + 3, 4, 1, cor); t.p(4, y - 1, cor); t.p(11, y - 1, cor); });
  t.ret(1, 8, 3, 2, k.c('X')); t.ret(12, 8, 3, 2, k.c('X')); t.ret(0, 7, 2, 1, k.c('y')); t.ret(14, 7, 2, 1, k.c('y'));
  t.ret(5, 3, 6, 3, k.mad[1]); t.ret(7, 1, 2, 2, k.c('y'));
  return fim(k, { sombra: 'elipse' });
};
P.ninho = (x) => {
  const k = kit(x), { t } = k;
  t.esfera(8, 11, 7, 4, [k.mad[0], k.mad[1], k.mad[2]]); t.elipse(8, 10, 5, 2, k.mad[0]);
  for (const [i, j] of [[2, 9], [5, 13], [11, 13], [13, 10], [4, 8], [12, 8]]) t.p(i, j, k.mad[2]);
  t.esfera(6, 9, 2, 2, [k.par[0], k.par[1], k.br]); t.esfera(10, 9, 2, 2, [k.par[0], k.par[1], k.br]); t.p(10, 8, k.c('e')); t.p(6, 10, k.c('e'));
  return fim(k, { sombra: 'elipse' });
};
P.cupinzeiro = (x) => {
  const k = kit(x), { t, H } = k, r = ['t', 'T', 'U'].map(k.c);
  t.esfera(8, H - 7, 6, 7, r); t.esfera(7, H - 15, 4, 8, r); t.esfera(9, H - 21, 2.5, 5, r); t.esfera(4, H - 6, 3, 4, r);
  for (const [i, j] of [[7, H - 12], [9, H - 8], [5, H - 5], [8, H - 18], [10, H - 14]]) t.p(i, j, r[0]);
  return fim(k, { sombra: 'elipse' });
};
P.bromelia = (x) => {
  const k = kit(x), { t } = k, f = ['f', 'F', 'v', 'V'].map(k.c);
  for (const [dx, dy] of [[-7, -3], [7, -3], [-5, -8], [5, -8], [-7, 2], [7, 2], [0, -10]]) t.curva([8, 12], [8 + dx * 0.4, 12 + dy * 0.9], [8 + dx, 12 + dy], (px, py, u) => { t.p(px, py, u < 0.5 ? f[1] : f[2]); t.p(px, py + 1, f[0]); });
  t.ret(7, 6, 2, 6, k.c('X')); t.p(7, 5, k.c('p')); t.p(8, 4, k.c('p')); t.p(6, 7, k.c('p')); t.p(9, 8, k.c('p')); t.p(8, 6, k.c('y'));
  return fim(k, { sombra: 'elipse' });
};
P['tronco-caido'] = (x) => {
  const k = kit(x), { t, W } = k;
  t.ret(4, 5, W - 8, 9, k.mad[1]); t.ret(4, 5, W - 8, 2, k.mad[2]); t.ret(4, 11, W - 8, 3, k.mad[0]);
  for (let i = 8; i < W - 6; i += 5) t.ret(i, 7 + (i % 3), 3, 1, k.mad[0]);
  t.esfera(4, 9, 3, 4.5, [k.mad[0], k.mad[2], k.c('U')]); t.p(4, 9, k.mad[1]); t.p(3, 8, k.mad[1]);
  t.esfera(W - 5, 9, 3, 4.5, [k.mad[0], k.mad[1], k.mad[2]]);
  t.manchar(14, 5, 5, 2, k.c('v')); t.manchar(22, 6, 3, 1, k.c('F'));
  // cogumelos
  for (const [cx, cy] of [[10, 4], [24, 3]]) { t.ret(cx, cy, 1, 2, k.br); t.ret(cx - 1, cy - 1, 3, 1, k.c('X')); t.p(cx, cy - 2, k.c('o')); }
  return fim(k, { sombra: 'elipse' });
};
P['pedra-grande'] = (x) => {
  const k = kit(x), { t, W, H } = k, r = ['r', 'R', 'q', 'Q'].map(k.c);
  t.esfera(W / 2 - 1, H - 13, 14, 12, r); t.esfera(9, H - 8, 8, 7, r); t.esfera(W - 9, H - 9, 7, 8, r);
  t.linha(12, H - 20, 16, H - 12, r[0]); t.linha(16, H - 12, 14, H - 6, r[0]); t.linha(22, H - 22, 24, H - 16, r[0]);
  t.manchar(10, H - 22, 6, 3, k.c('F'), [r[2], r[3]]); t.manchar(9, H - 23, 3, 1, k.c('v'), [k.c('F')]);
  return fim(k, { sombra: 'elipse' });
};
/* árvores do catálogo: os mesmos pintores do tileset, encaixados na célula do objeto */
function arvoreObjeto(especie: string): PintorObjeto {
  return (x) => {
    const a = ARVORES[especie](x.c, x.spawn.x + x.spawn.y);
    const W = x.info.w * 16, H = (x.info.h + x.info.alto) * 16;
    // a copa pode ser mais larga que a célula: o sprite extrapola para os lados
    const img = new Img(Math.max(W, a.img.w), Math.max(H, a.img.h));
    img.colar(a.img, (img.w - a.img.w) >> 1, img.h - a.img.h);
    return { img, sombra: 'elipse' };
  };
}
for (const [nome, especie] of [['ipe-amarelo', 'ipe-amarelo'], ['ipe-roxo', 'ipe-roxo'], ['coqueiro', 'coqueiro'], ['araucaria', 'araucaria'], ['buriti', 'buriti'], ['cacto', 'mandacaru']]) P[nome] = arvoreObjeto(especie);

export const PINTORES_EXTERIOR = P;
/** registro extra (interiores): nome → pintor; preenchido por tools/bake-maps.ts */
export const PINTORES_EXTRA: Record<string, PintorObjeto> = {};
export function pintarObjeto(nome: string, x: CtxObjeto): ObjetoPintado {
  const p = P[nome] ?? PINTORES_EXTRA[nome];
  if (!p) throw new Error(`sem pintor para o objeto "${nome}"`);
  return p(x);
}
