/**
 * Pintor de pixel art para objetos volumosos (árvores, pedras, prédios): formas com sombreamento
 * em faixas (luz de cima-esquerda), sem suavização, e contorno externo de 1 px.
 * Tudo em coordenadas inteiras; nenhuma variação por sorteio.
 */
import { Img, VAZIO, ruido } from '../../pixel/tile';

export type Rampa = number[]; // [sombra, base, luz] ou [sombra, base, luz, brilho]

export class Tela {
  img: Img;
  constructor(readonly w: number, readonly h: number) { this.img = new Img(w, h); }
  p(x: number, y: number, c: number) { this.img.set(Math.round(x), Math.round(y), c); }
  get(x: number, y: number) { return this.img.get(x, y); }
  ret(x: number, y: number, w: number, h: number, c: number) { this.img.ret(x, y, w, h, c); }
  /** retângulo com luz no topo/esquerda e sombra embaixo/direita (1 px) */
  caixa(x: number, y: number, w: number, h: number, r: Rampa) {
    this.ret(x, y, w, h, r[1]);
    this.ret(x, y, w, 1, r[2]); this.ret(x, y, 1, h, r[2]);
    this.ret(x, y + h - 1, w, 1, r[0]); this.ret(x + w - 1, y, 1, h, r[0]);
  }
  elipse(cx: number, cy: number, rx: number, ry: number, c: number) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) this.p(x, y, c);
    }
  }
  linha(x0: number, y0: number, x1: number, y1: number, c: number, esp = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
      if (esp <= 1) this.p(x, y, c); else this.ret(x - ((esp - 1) >> 1), y - ((esp - 1) >> 1), esp, esp, c);
    }
  }
  /** curva de Bézier quadrática amostrada: chama fn(x, y, t) em cada ponto */
  curva(p0: [number, number], p1: [number, number], p2: [number, number], fn: (x: number, y: number, t: number) => void) {
    const n = Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1])) * 2;
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      fn(Math.round(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]), Math.round(u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]), t);
    }
  }
  /** tufo de folhagem: elipse com brilho em cima-esquerda, sombra embaixo-direita e textura de folhas */
  bolha(cx: number, cy: number, rx: number, ry: number, r: Rampa, textura = true) {
    const topo = r.length - 1;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) continue;
      const onda = [0, 0.1, 0.16, 0.1, 0, -0.08][(((x * 2 + y) % 6) + 6) % 6];
      let lum = -(nx * 0.5 + ny * 0.8) + (textura ? onda : 0);
      if (d2 > 0.72 && ny > 0.2) lum -= 0.5;
      let tom = lum > 0.52 ? topo : lum > 0.08 ? Math.min(2, topo) : lum > -0.42 ? 1 : 0;
      if (textura) {
        const h = ruido(x, y, 11) % 17;
        if (h === 0 && tom > 0) tom--; else if (h === 1 && tom < topo && tom > 0) tom++;
      }
      this.p(x, y, r[tom]);
    }
  }
  /** volume liso (pedra, cúpula, tronco deitado): faixas limpas, sem textura */
  esfera(cx: number, cy: number, rx: number, ry: number, r: Rampa) { this.bolha(cx, cy, rx, ry, r, false); }
  /** tronco vertical com raízes abrindo na base; `desvio(y)` entorta o eixo */
  tronco(cx: number, yTopo: number, yBase: number, larg: number, r: Rampa, desvio: (t: number) => number = () => 0) {
    for (let y = yTopo; y <= yBase; y++) {
      const t = (y - yTopo) / Math.max(1, yBase - yTopo);
      const raiz = y >= yBase - 1 ? 1 : 0;
      const x0 = Math.round(cx + desvio(t) - larg / 2) - raiz, w = larg + raiz * 2;
      for (let i = 0; i < w; i++) {
        const f = i / Math.max(1, w - 1);
        let tom = f < 0.3 ? 2 : f > 0.62 ? 0 : 1;
        if (tom === 1 && ruido(i, y, 5) % 5 === 0) tom = 0;
        this.p(x0 + i, y, r[tom]);
      }
    }
  }
  /** contorno externo de 1 px (4 vizinhos) em volta de tudo o que já foi pintado */
  contornar(c: number) {
    const o = this.img.copia();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (o.get(x, y) !== VAZIO) continue;
      if (o.get(x - 1, y) !== VAZIO || o.get(x + 1, y) !== VAZIO || o.get(x, y - 1) !== VAZIO || o.get(x, y + 1) !== VAZIO) this.img.set(x, y, c);
    }
  }
  /** pinta só onde já existe a cor `sobre` (manchas, musgo, neve em cima de uma forma) */
  manchar(cx: number, cy: number, rx: number, ry: number, c: number, sobre?: number[]) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry, atual = this.get(x, y);
      if (nx * nx + ny * ny <= 1 && atual !== VAZIO && (!sobre || sobre.includes(atual))) this.p(x, y, c);
    }
  }
}
