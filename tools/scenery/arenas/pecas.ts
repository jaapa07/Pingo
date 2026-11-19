/** Peças de cenário pintadas em pixel art: vegetação, terreno, céu, água, rochas e arquitetura. */
import { Tela, Rampa, Cor, VAZIO, h, ruido, fbm, Seq, W, H } from './nucleo';

/* ============================== folhagem ============================== */
/** Um tufo de folhas: massa arredondada com luz em cima à esquerda e sombra recortada embaixo. */
export function tufoFolha(t: Tela, cx: number, cy: number, rad: number, r: Rampa, s: number, achat = 0.78) {
  const rx = rad, ry = rad * achat;
  for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, ang = Math.atan2(dy, dx);
    const lim = 1 + 0.16 * Math.sin(ang * 3 + s) + 0.09 * Math.sin(ang * 5 + s * 2.3);
    const d = Math.sqrt(dx * dx + dy * dy) / lim;
    if (d > 1) continue;
    const l = -dy * 0.85 - dx * 0.4 + (h(x >> 1, y >> 1, s) - 0.5) * 0.34;
    let c = l > 0.52 ? r[3] : l > 0.02 ? r[2] : l > -0.6 ? r[1] : r[0];
    if (d > 0.84 && dy > 0.2) c = r[0];
    t.p(x, y, c);
  }
}
/** Copa: vários tufos sobrepostos de cima para baixo (os de baixo ficam na frente). */
export function copa(t: Tela, cx: number, cy: number, rx: number, ry: number, r: Rampa, s: number, raio = 7, n?: number) {
  const q = new Seq(s * 7919 + 17);
  const tufos: [number, number, number][] = [];
  const total = n ?? Math.max(4, Math.round((rx * ry) / (raio * raio * 0.55)));
  for (let i = 0; i < total; i++) {
    const a = q.n() * Math.PI * 2, d = Math.sqrt(q.n());
    tufos.push([cx + Math.cos(a) * d * (rx - raio * 0.5), cy + Math.sin(a) * d * (ry - raio * 0.4), raio * q.entre(0.7, 1.25)]);
  }
  t.elipse(cx, cy, Math.max(1, rx - raio * 0.6), Math.max(1, ry - raio * 0.5), r[1]);
  tufos.sort((a, b) => a[1] - b[1]);
  tufos.forEach(([x, y, rad], i) => tufoFolha(t, x, y, rad, r, s + i * 3));
}
/** Faixa contínua de copas (dossel ao fundo ou moitas). */
export function faixaCopas(t: Tela, x0: number, x1: number, yc: number, alt: number, raio: number, r: Rampa, s: number, passo = 0.8) {
  const q = new Seq(s * 104729 + 3);
  const linhas = Math.max(1, Math.round(alt / (raio * 0.9)));
  for (let l = 0; l < linhas; l++) {
    const y = yc - alt / 2 + (alt * (l + 0.5)) / linhas;
    for (let x = x0 - raio; x <= x1 + raio; x += raio * passo * q.entre(0.8, 1.3)) tufoFolha(t, x + q.entre(-2, 2), y + q.entre(-raio * 0.3, raio * 0.3), raio * q.entre(0.8, 1.25), r, s + Math.round(x) + l * 31);
  }
}
/** Tronco com luz à esquerda, casca riscada e raízes abrindo na base. */
export function tronco(t: Tela, x: number, yTopo: number, yBase: number, larg: number, r: Rampa, s: number, o: { curva?: number; raiz?: number; casca?: boolean; afina?: number } = {}) {
  const len = Math.max(1, yBase - yTopo), raiz = o.raiz ?? Math.min(8, larg);
  for (let y = Math.round(yTopo); y <= yBase; y++) {
    const k = (y - yTopo) / len, cx = x + (o.curva ?? 0) * Math.sin(k * Math.PI);
    let w = larg * ((o.afina ?? 0.8) + (1 - (o.afina ?? 0.8)) * k);
    const b = yBase - y;
    if (raiz > 0 && b < raiz) w += (1 - b / raiz) ** 2 * larg * 0.9;
    const x0 = Math.round(cx - w / 2), x1 = Math.round(cx + w / 2);
    for (let px = x0; px <= x1; px++) {
      const u = (px - x0) / Math.max(1, x1 - x0);
      let c = u < 0.2 ? r[3] : u < 0.6 ? r[2] : r[1];
      if (o.casca !== false && u > 0.08 && u < 0.92 && h(px, Math.floor((y + px * 3) / 5), s) < 0.2) c = c === r[3] ? r[2] : c === r[2] ? r[1] : r[0];
      if (px === x1 && w > 2) c = r[0];
      t.p(px, y, c);
    }
  }
}
export function galho(t: Tela, x0: number, y0: number, x1: number, y1: number, esp: number, r: Rampa) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) {
    const k = i / n, e = Math.max(1, Math.round(esp * (1 - k * 0.6)));
    const x = Math.round(x0 + (x1 - x0) * k), y = Math.round(y0 + (y1 - y0) * k);
    for (let j = 0; j < e; j++) t.p(x, y + j, j === 0 ? r[2] : j === e - 1 && e > 1 ? r[0] : r[1]);
  }
}
/** Árvore completa de floresta: tronco, 2 galhos e copa. */
export function arvore(t: Tela, x: number, yBase: number, alt: number, larg: number, tr: Rampa, fo: Rampa, s: number, o: { copaRx?: number; copaRy?: number; raio?: number; curva?: number } = {}) {
  const topo = yBase - alt, rx = o.copaRx ?? alt * 0.42, ry = o.copaRy ?? alt * 0.26;
  tronco(t, x, topo, yBase, larg, tr, s, { curva: o.curva ?? (h(s, 3) - 0.5) * 6 });
  galho(t, x, topo + alt * 0.35, x - rx * 0.6, topo + 2, Math.max(2, larg * 0.4), tr);
  galho(t, x, topo + alt * 0.28, x + rx * 0.65, topo + 4, Math.max(2, larg * 0.4), tr);
  copa(t, x, topo, rx, ry, fo, s, o.raio ?? Math.max(5, alt * 0.09));
}
/** Capim em tufo: lâminas em leque. */
export function capim(t: Tela, x: number, y: number, n: number, alt: number, r: Rampa, s: number) {
  for (let i = 0; i < n; i++) {
    const bx = x + Math.round((i - (n - 1) / 2) * 1.6), a = Math.max(2, Math.round(alt * (0.55 + 0.45 * h(i, s, 5))));
    const tomba = i < n / 2 - 0.5 ? -1 : i > n / 2 - 0.5 ? 1 : 0;
    for (let k = 0; k < a; k++) {
      const dx = Math.round(tomba * (k / a) ** 2 * (alt * 0.45));
      t.p(bx + dx, y - k, k === a - 1 ? r[3] : k === 0 ? r[1] : (i + k) % 3 === 0 ? r[3] : r[2]);
    }
  }
}
/** Fronde (folha de palmeira/samambaia): eixo curvo com folíolos pendentes. */
export function fronde(t: Tela, x: number, y: number, ang: number, comp: number, queda: number, r: Rampa, foliolo = 4) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  let ax = Math.round(x), ay = Math.round(y);
  for (let i = 0; i <= comp; i++) {
    const k = i / comp, px = Math.round(x + ca * i), py = Math.round(y - sa * i + queda * k * k * comp);
    // folha cheia que afina na ponta, com recortes no lado de baixo
    const f = Math.max(1, Math.round(foliolo * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.1)) ** 0.7));
    const passos = Math.max(Math.abs(px - ax), Math.abs(py - ay), 1);
    for (let p = 1; p <= passos; p++) {
      const qx = Math.round(ax + ((px - ax) * p) / passos), qy = Math.round(ay + ((py - ay) * p) / passos);
      const dente = (qx + qy) % 3 === 0 ? Math.max(1, f - 2) : f;
      for (let j = 0; j <= dente; j++) t.p(qx, qy + j, j === 0 ? r[3] : j >= dente && dente > 1 ? r[0] : j > dente * 0.55 ? r[1] : r[2]);
    }
    ax = px; ay = py;
  }
}
export function samambaia(t: Tela, x: number, y: number, tam: number, r: Rampa, s: number) {
  const n = 5 + Math.floor(h(s, 1) * 3);
  for (let i = 0; i < n; i++) { const a = Math.PI * (0.12 + (0.76 * i) / (n - 1)); fronde(t, x, y, a, tam * (0.7 + 0.3 * h(i, s)), 0.5, r, 2); }
}
/** Bromélia: roseta de folhas pontudas com miolo colorido. */
export function bromelia(t: Tela, x: number, y: number, tam: number, r: Rampa, miolo: Rampa) {
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (0.84 * i) / 6);
    for (let k = 0; k <= tam; k++) {
      const q = k / tam, px = x + Math.cos(a) * k, py = y - Math.sin(a) * k + q * q * tam * 0.45;
      t.p(px, py, i % 2 ? r[2] : r[3]); if (k < tam * 0.6) t.p(px, py + 1, r[1]);
    }
  }
  t.ret(x - 1, y - 3, 3, 3, miolo[2]); t.p(x, y - 4, miolo[3]); t.p(x - 1, y - 1, miolo[1]); t.p(x + 1, y - 1, miolo[1]);
}
export function flor(t: Tela, x: number, y: number, r: Rampa, miolo: Cor) {
  t.p(x - 1, y, r[2]); t.p(x + 1, y, r[2]); t.p(x, y - 1, r[3]); t.p(x, y + 1, r[1]); t.p(x, y, miolo);
}
export function canteiroFlores(t: Tela, cx: number, cy: number, rx: number, ry: number, n: number, r: Rampa, miolo: Cor, s: number) {
  const q = new Seq(s);
  for (let i = 0; i < n; i++) { const a = q.n() * 6.283, d = Math.sqrt(q.n()); flor(t, Math.round(cx + Math.cos(a) * d * rx), Math.round(cy + Math.sin(a) * d * ry), r, miolo); }
}
export function cogumelo(t: Tela, x: number, y: number, chapeu: Rampa, pe: Rampa, grande = false) {
  const g = grande ? ['..aaa..', '.abbba.', 'abbcbba', 'ddddddd', '..pq...', '..pq...'] : ['.aa.', 'abca', 'dddd', '.pq.'];
  t.carimbo(x - (grande ? 3 : 2), y - g.length + 1, g, { a: chapeu[2], b: chapeu[3], c: pe[3], d: chapeu[0], p: pe[3], q: pe[1] });
}

/* ============================== terreno ============================== */
/** Preenche do horizonte para baixo. */
export function terreno(t: Tela, yh: (x: number) => number, cor: (x: number, y: number) => Cor) {
  for (let x = 0; x < t.w; x++) for (let y = Math.round(yh(x)); y < t.h; y++) t.p(x, y, cor(x, y));
}
/** Mancha orgânica (elipse com borda de ruído). Por padrão só pinta sobre o que já existe. */
export function mancha(t: Tela, cx: number, cy: number, rx: number, ry: number, c: Cor, s: number, irr = 0.35, esc = 14, livre = false) {
  t.campo(cx - rx * 1.5, cy - ry * 1.5, cx + rx * 1.5, cy + ry * 1.5, (x, y) => {
    if (!livre && t.g(x, y) === VAZIO) return VAZIO;
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    return dx * dx + dy * dy < 1 + (fbm(x, y * 1.8, esc, s) - 0.5) * 2 * irr ? c : VAZIO;
  });
}
/** Borda de grama serrilhada no topo do chão. */
export function franja(t: Tela, yh: (x: number) => number, r: Rampa, s: number, alt = 3) {
  for (let x = 0; x < t.w; x++) {
    const y = Math.round(yh(x)), a = Math.floor(h(x, 0, s) * (alt + 1));
    for (let k = 1; k <= a; k++) t.p(x, y - k, k === a ? r[3] : r[2]);
  }
}
/** Tufinhos espalhados sobre uma região do chão. */
export function salpico(t: Tela, x0: number, y0: number, x1: number, y1: number, n: number, s: number, fn: (x: number, y: number, i: number, k: number) => void, dentro?: (x: number, y: number) => boolean) {
  const q = new Seq(s);
  for (let i = 0; i < n; i++) {
    const x = q.int(x0, x1), y = q.int(y0, y1), k = q.n();
    if (!dentro || dentro(x, y)) fn(x, y, i, k);
  }
}
/** Pedra facetada. */
export function pedra(t: Tela, cx: number, cy: number, rx: number, ry: number, r: Rampa, s: number) {
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, ang = Math.atan2(dy, dx);
    const lim = 1 + 0.12 * Math.sin(ang * 4 + s) + 0.07 * Math.sin(ang * 7 + s * 1.7);
    const d = (Math.abs(dx) ** 2.6 + Math.abs(dy) ** 2.6) ** (1 / 2.6) / lim;
    if (d > 1) continue;
    const faceta = Math.floor((dx * 0.9 + dy * 1.3 + 2) * 2.2 + Math.sin(dx * 3 + s) * 0.5);
    let c = faceta <= 2 ? r[3] : faceta <= 4 ? r[2] : r[1];
    if (d > 0.86 && (dy > 0.1 || dx > 0.5)) c = r[0];
    t.p(x, y, c);
  }
}
/** Tronco caído com boca oca virada para a esquerda. */
export function troncoCaido(t: Tela, x: number, y: number, comp: number, esp: number, r: Rampa, s: number) {
  for (let i = 0; i < comp; i++) for (let j = 0; j < esp; j++) {
    const v = j / (esp - 1);
    let c = v < 0.25 ? r[3] : v < 0.65 ? r[2] : r[1];
    if (h(Math.floor((i + j) / 4), j, s) < 0.22) c = c === r[3] ? r[2] : r[1];
    if (j === esp - 1) c = r[0];
    t.p(x + i, y + j + Math.round(Math.sin(i / 9) * 1), c);
  }
  t.elipse(x, y + esp / 2, esp * 0.42, esp / 2, (_x, _y, nx, ny) => (nx * nx + ny * ny > 0.55 ? r[3] : nx * nx + ny * ny > 0.2 ? r[1] : r[0]));
  galho(t, x + comp * 0.6, y, x + comp * 0.7, y - 6, 2, r);
}

/* ============================== céu e distância ============================== */
/** Céu em faixas chapadas; entre faixas, uma linha de transição quadriculada desenhada. */
export function ceu(t: Tela, faixas: [number, Cor][]) {
  let y0 = 0;
  faixas.forEach(([y1, c], i) => {
    t.ret(0, y0, t.w, y1 - y0, c);
    if (i > 0) { const ant = faixas[i - 1][1]; for (let x = 0; x < t.w; x += 2) t.p(x, y0, ant); }
    y0 = y1;
  });
}
export function nuvem(t: Tela, x: number, y: number, w: number, r: Rampa, s: number) {
  const q = new Seq(s);
  const bolas: [number, number, number][] = [];
  for (let i = 0; i < Math.max(3, w / 7); i++) { const k = q.n(); bolas.push([x + k * w, y - Math.sin(k * Math.PI) * w * 0.12, 3 + Math.sin(k * Math.PI) * w * 0.14 * q.entre(0.7, 1.2)]); }
  for (let py = y - w * 0.4; py <= y + 2; py++) for (let px = x - 8; px <= x + w + 8; px++) {
    let dentro = false, luz = false;
    for (const [bx, by, br] of bolas) {
      const d = Math.hypot(px - bx, (py - by) * 1.25);
      if (d <= br) dentro = true;
      if (Math.hypot(px - bx + 1, (py - by + 1.5) * 1.25) <= br * 0.72) luz = true;
    }
    if (!dentro || py > y) continue;
    t.p(px, py, luz ? r[2] : py >= y - 1 ? r[0] : r[1]);
  }
}
export function estrelas(t: Tela, y1: number, n: number, r: Rampa, s: number) {
  const q = new Seq(s);
  for (let i = 0; i < n; i++) { const x = q.int(0, t.w - 1), y = q.int(0, y1), g = q.n(); t.p(x, y, g > 0.8 ? r[r.length - 1] : r[r.length - 2]); if (g > 0.93) { t.p(x - 1, y, r[r.length - 2]); t.p(x + 1, y, r[r.length - 2]); t.p(x, y - 1, r[r.length - 2]); t.p(x, y + 1, r[r.length - 2]); } }
}
export function astro(t: Tela, x: number, y: number, rad: number, r: Rampa, lua = false) {
  t.elipse(x, y, rad, rad, (_x, _y, nx, ny) => (lua && (nx - 0.35) ** 2 + (ny + 0.2) ** 2 < 0.55 ? r[r.length - 2] : r[r.length - 1]));
  if (lua) { t.p(x - rad * 0.4, y + rad * 0.3, r[r.length - 2]); t.p(x - rad * 0.1, y - rad * 0.4, r[r.length - 2]); }
}
/** Serra/morros: perfil de ruído com encostas iluminadas à esquerda. */
export function serra(t: Tela, yBase: number, amp: number, esc: number, r: Rampa, s: number, o: { estratos?: boolean; neve?: Rampa; perfil?: (x: number) => number; ate?: number } = {}) {
  const perfil = o.perfil ?? ((x: number) => yBase - amp * fbm(x, 0, esc, s));
  for (let x = 0; x < t.w; x++) {
    const y0 = Math.round(perfil(x)), sobe = perfil(x + 2) < perfil(x) - 0.4, desce = perfil(x + 2) > perfil(x) + 0.4;
    for (let y = y0; y <= (o.ate ?? yBase + 4); y++) {
      const prof = y - y0;
      let c = r[2];
      if (sobe && prof < 9 + ruido(x, y, 6, s) * 8) c = r[3] ?? r[2];
      if (desce && prof < 12 + ruido(x, y, 7, s + 3) * 10) c = r[1];
      if (ruido(x * 0.7 + y * 0.9, y, 9, s + 5) > 0.66) c = c === r[2] ? r[1] : c;
      if (o.estratos && (y + Math.round(ruido(x, 0, 30, s + 9) * 3)) % 7 === 0) c = r[1];
      if (prof === 0) c = sobe ? (r[3] ?? r[2]) : r[2];
      if (o.neve && prof < 2 + ruido(x, 0, 5, s + 11) * 5 && y0 < yBase - amp * 0.55) c = prof < 2 || sobe ? o.neve[2] : o.neve[1];
      t.p(x, y, c);
    }
  }
}
/** Mar/rio visto de longe: faixas com brilhos horizontais. */
export function agua(t: Tela, y0: number, y1: number, r: Rampa, s: number, o: { x0?: number; x1?: number; so?: boolean } = {}) {
  for (let y = y0; y <= y1; y++) {
    const k = (y - y0) / Math.max(1, y1 - y0);
    for (let x = o.x0 ?? 0; x <= (o.x1 ?? t.w - 1); x++) {
      if (o.so && t.g(x, y) === VAZIO) continue;
      let c = k < 0.18 ? r[2] : r[1];
      const lar = 3 + Math.floor(k * 9), lin = Math.floor(y / (1 + Math.floor(k * 2)));
      const v = h(Math.floor((x + lin * 5) / lar), lin, s);
      if (v > 0.88) c = r[2]; if (v > 0.965) c = r[3]; if (v < 0.07 && k > 0.2) c = r[0];
      t.p(x, y, c);
    }
  }
  t.hl(o.x0 ?? 0, o.x1 ?? t.w - 1, y0, r[3]);
}
/** Brilhos de água de um quadro de animação (dashes que deslizam). */
export function brilhosAgua(t: Tela, q: number, x0: number, y0: number, w: number, hh: number, r: Rampa, s: number, dens = 0.1) {
  for (let y = 0; y < hh; y++) {
    const k = y / Math.max(1, hh - 1), lar = 3 + Math.floor(k * 8);
    for (let x = 0; x < w; x++) {
      const cel = Math.floor((x + q * (1 + Math.floor(k * 2)) + y * 5) / lar);
      const v = h(cel, y, s);
      if (v < dens && ((x + q + y * 5) % lar) < lar - 1 && (y + cel) % 2 === 0) t.p(x0 + x, y0 + y, v < dens * 0.35 ? r[3] : r[2]);
    }
  }
}

/* ============================== árvores brasileiras ============================== */
export function coqueiro(t: Tela, x: number, yBase: number, alt: number, incl: number, tr: Rampa, fo: Rampa, s: number, coco?: Rampa) {
  let tx = x, ty = yBase;
  for (let i = 0; i <= alt; i++) {
    const k = i / alt; tx = x + incl * k * k; ty = yBase - i;
    const w = k < 0.1 ? 5 : k < 0.7 ? 4 : 3;
    for (let j = 0; j < w; j++) t.p(tx + j, ty, j === w - 1 ? tr[0] : i % 4 === 0 ? tr[1] : j === 0 ? tr[3] : j >= w - 2 ? tr[1] : tr[2]);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (-0.12 + (1.24 * i) / (n - 1)) + (h(i, s) - 0.5) * 0.2;
    fronde(t, tx + 1, ty, a, alt * (0.34 + 0.1 * h(i, s, 2)), 0.3 + Math.abs(Math.cos(a)) * 0.3, fo, 5);
  }
  if (coco) { t.ret(tx - 1, ty + 1, 2, 2, coco[1]); t.ret(tx + 2, ty + 1, 2, 2, coco[2]); t.p(tx + 2, ty + 1, coco[3]); }
}
/** Araucária: tronco reto e copa em taça, com patamares de galhos virados para cima. */
export function araucaria(t: Tela, x: number, yBase: number, alt: number, tr: Rampa, fo: Rampa, s: number, neve?: Rampa) {
  tronco(t, x, yBase - alt + 4, yBase, Math.max(2, alt * 0.06), tr, s, { raiz: 3, afina: 0.7 });
  const niveis = 3;
  for (let n = 0; n < niveis; n++) {
    const y = yBase - alt + 6 + n * alt * 0.13, lar = alt * (0.34 - n * 0.07);
    for (const lado of [-1, 1]) {
      for (let i = 0; i <= lar; i++) {
        const k = i / lar, px = x + lado * i, py = y + 3 - Math.round(k * k * 7);
        t.p(px, py, tr[1]);
        if (k > 0.45) { const g = Math.round(3 * Math.sin(((k - 0.45) / 0.55) * Math.PI * 0.9) + 1); for (let j = 0; j <= g; j++) { t.p(px, py - 1 - j, j === g ? (neve ? neve[2] : fo[3]) : j > g / 2 ? fo[2] : fo[1]); t.p(px, py + 1, fo[0]); } }
      }
    }
  }
  copa(t, x, yBase - alt + 3, alt * 0.14, 3, fo, s, 3.5, 4);
  if (neve) for (let i = -3; i <= 3; i++) t.p(x + i, yBase - alt - 1 + Math.abs(i % 2), neve[2]);
}
/** Buriti/carandá: palmeira de leque no alto de um tronco anelado. */
export function buriti(t: Tela, x: number, yBase: number, alt: number, tr: Rampa, fo: Rampa, s: number) {
  for (let i = 0; i <= alt; i++) { const w = 3; for (let j = 0; j < w; j++) t.p(x + j - 1, yBase - i, i % 3 === 0 ? tr[0] : j === 0 ? tr[3] : j === 2 ? tr[1] : tr[2]); }
  const ty = yBase - alt;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (-0.2 + (1.4 * i) / 8), len = alt * 0.3 * (0.8 + 0.3 * h(i, s));
    const ex = x + Math.cos(a) * len * 0.55, ey = ty - Math.sin(a) * len * 0.55;
    t.linha(x, ty, ex, ey, tr[2]);
    for (let j = -3; j <= 3; j++) { const b = a + j * 0.2; t.linha(ex, ey, ex + Math.cos(b) * len * 0.5, ey - Math.sin(b) * len * 0.5 + Math.abs(j), j < 0 ? fo[3] : j === 0 ? fo[2] : fo[1]); }
  }
  t.ret(x - 2, ty, 5, 3, fo[0]); t.p(x - 1, ty + 3, tr[1]); t.p(x + 1, ty + 4, tr[1]);
}
/** Árvore retorcida do cerrado/restinga (ipê, cajueiro): tronco em S e copas em tufos separados. */
export function retorcida(t: Tela, x: number, yBase: number, alt: number, tr: Rampa, fo: Rampa, s: number, raio = 6) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= alt; i++) { const k = i / alt, px = x + Math.sin(k * 5 + s) * alt * 0.09 + (h(s, 1) - 0.5) * alt * 0.3 * k, py = yBase - i; pts.push([px, py]); const w = Math.max(2, Math.round((1 - k * 0.6) * alt * 0.09)); for (let j = 0; j < w; j++) t.p(px + j, py, j === 0 ? tr[3] : j === w - 1 ? tr[0] : (i + j) % 5 === 0 ? tr[1] : tr[2]); }
  const pontas: [number, number][] = [];
  [0.5, 0.65, 0.8, 0.95].forEach((k, i) => {
    const [bx, by] = pts[Math.floor(k * alt)], lado = i % 2 ? 1 : -1, len = alt * (0.42 - i * 0.06);
    const ex = bx + lado * len * 0.9, ey = by - len * 0.45;
    galho(t, bx, by, (bx + ex) / 2, by - len * 0.1, 2, tr); galho(t, (bx + ex) / 2, by - len * 0.1, ex, ey, 2, tr);
    pontas.push([ex, ey]);
  });
  pontas.push([pts[alt][0], pts[alt][1]]);
  pontas.sort((a, b) => a[1] - b[1]).forEach(([px, py], i) => copa(t, px, py - 2, alt * 0.22, alt * 0.12, fo, s + i * 11, raio));
}
export function cupinzeiro(t: Tela, x: number, yBase: number, alt: number, r: Rampa, s: number) {
  for (let i = 0; i <= alt; i++) {
    const k = i / alt, w = (1 - k) ** 0.6 * alt * 0.36 + 1 + Math.sin(i * 0.9 + s) * 1;
    for (let px = Math.round(x - w); px <= Math.round(x + w); px++) {
      const u = (px - (x - w)) / (2 * w);
      let c = u < 0.3 ? r[3] : u < 0.68 ? r[2] : r[1];
      if (h(px >> 1, i >> 1, s) < 0.16) c = c === r[3] ? r[2] : r[1];
      if (px === Math.round(x + w)) c = r[0];
      t.p(px, yBase - i, c);
    }
  }
}
export function mandacaru(t: Tela, x: number, yBase: number, alt: number, r: Rampa, florC?: Cor) {
  const braco = (bx: number, y0: number, y1: number) => { for (let y = y0; y >= y1; y--) { t.p(bx - 1, y, r[3]); t.p(bx, y, r[2]); t.p(bx + 1, y, y % 3 === 0 ? r[0] : r[1]); } t.p(bx, y1 - 1, r[3]); };
  braco(x, yBase, yBase - alt);
  t.hl(x - 5, x, yBase - alt * 0.45, r[2]); t.hl(x - 5, x, yBase - alt * 0.45 + 1, r[0]); braco(x - 5, Math.round(yBase - alt * 0.45), Math.round(yBase - alt * 0.85));
  t.hl(x, x + 5, yBase - alt * 0.6, r[2]); t.hl(x, x + 5, yBase - alt * 0.6 + 1, r[0]); braco(x + 5, Math.round(yBase - alt * 0.6), Math.round(yBase - alt * 1.05));
  if (florC !== undefined) { t.p(x, yBase - alt - 2, florC); t.p(x + 5, Math.round(yBase - alt * 1.05) - 2, florC); }
}
/** Mangue: copa baixa sobre raízes-escora em arco. */
export function mangue(t: Tela, x: number, yBase: number, alt: number, tr: Rampa, fo: Rampa, s: number) {
  const topo = yBase - alt;
  tronco(t, x, topo, yBase - alt * 0.35, Math.max(3, alt * 0.1), tr, s, { raiz: 0, curva: (h(s, 2) - 0.5) * 5 });
  for (let i = 0; i < 7; i++) {
    const lado = i % 2 ? 1 : -1, abre = (3 + i * 2.2) * lado, y0 = yBase - alt * (0.38 + 0.04 * (i % 3));
    for (let k = 0; k <= 12; k++) { const q = k / 12, px = x + abre * Math.sin(q * Math.PI * 0.5), py = y0 + (yBase - y0) * q * q; t.p(px, py, tr[2]); t.p(px + 1, py, tr[0]); if (k % 3 === 0) t.p(px, py, tr[3]); }
  }
  copa(t, x, topo, alt * 0.55, alt * 0.24, fo, s, Math.max(5, alt * 0.11));
}
export function heliconia(t: Tela, x: number, yBase: number, alt: number, fo: Rampa, fl: Rampa) {
  t.vl(x, yBase - alt, yBase, fo[1]);
  for (let i = 0; i < 3; i++) { const y = yBase - alt + i * 4; t.linha(x, y, x + (i % 2 ? 4 : -4), y + 2, fl[2]); t.p(x + (i % 2 ? 4 : -4), y + 1, fl[3]); t.p(x + (i % 2 ? 2 : -2), y + 2, fl[1]); }
  for (const lado of [-1, 1]) for (let k = 0; k < alt * 0.8; k++) { const px = x + lado * (2 + k * 0.5), py = yBase - k - Math.round(Math.sin((k / (alt * 0.8)) * 3) * 2); t.p(px, py, lado < 0 ? fo[3] : fo[2]); t.p(px + lado, py + 1, fo[1]); t.p(px, py + 1, fo[2]); }
}

/* ============================== arquitetura e interiores ============================== */
/** Piso em perspectiva: tipo 'xadrez' (2 cores), 'tabuas' ou 'lajes'. */
export function piso(t: Tela, y0: number, a: Cor, b: Cor, junta: Cor, tipo: 'xadrez' | 'tabuas' | 'lajes' | 'liso', o: { fuga?: number; tam?: number; x0?: number; x1?: number; y1?: number } = {}) {
  const yv = y0 - (o.fuga ?? 26), tam = o.tam ?? 22;
  for (let y = y0; y <= (o.y1 ?? t.h - 1); y++) {
    const z = (t.h - yv) / (y - yv); // 1 na base, cresce para o fundo
    const linha = Math.floor(z * 4.2), fz = z * 4.2 - linha, altL = 4.2 * (t.h - yv) / ((y - yv) * (y - yv));
    for (let x = o.x0 ?? 0; x <= (o.x1 ?? t.w - 1); x++) {
      const wx = (x - t.w / 2) * z, col = Math.floor(wx / tam + 100), fx = wx / tam + 100 - col;
      let c: Cor;
      if (tipo === 'xadrez') c = (col + linha) & 1 ? a : b;
      else if (tipo === 'tabuas') { if (tam / z < 5) c = linha % 3 === 0 ? b : a; else { c = (col * 7 + Math.floor(linha / 2)) % 3 === 0 ? b : a; if (fx * tam < z) c = junta; else if (fz < altL && (col + Math.floor(linha / 2)) % 2 === 0 && linha % 2 === 0) c = junta; } }
      else if (tipo === 'lajes') { const f2 = (wx / tam + 100 + (linha & 1) * 0.5) % 1; c = h(Math.floor(wx / tam + 100 + (linha & 1) * 0.5), linha, 5) < 0.3 ? b : a; if (f2 * tam < z || fz < altL) c = junta; }
      else c = a;
      t.p(x, y, c);
    }
  }
}
/** Parede de blocos/tijolos com fiadas alternadas. */
export function parede(t: Tela, x: number, y: number, w: number, hh: number, r: Rampa, bw = 12, bh = 6, s = 0) {
  for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) {
    const fi = Math.floor(j / bh), ox = (fi & 1) * (bw >> 1), bi = Math.floor((i + ox) / bw);
    let c = h(bi, fi, s) < 0.22 ? r[1] : h(bi, fi, s) > 0.86 ? r[3] : r[2];
    if (j % bh === 0 || (i + ox) % bw === 0) c = r[0];
    else if (j % bh === 1 && c === r[2]) c = r[3];
    t.p(x + i, y + j, c);
  }
}
/** Parede de tábuas verticais. */
export function tabuado(t: Tela, x: number, y: number, w: number, hh: number, r: Rampa, lar = 8, s = 0, horizontal = false) {
  for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) {
    const u = horizontal ? j : i, v = horizontal ? i : j, bi = Math.floor(u / lar);
    let c = h(bi, 0, s) < 0.3 ? r[1] : r[2];
    if (u % lar === 0) c = r[0]; else if (u % lar === 1) c = r[3];
    else if (h(bi, Math.floor(v / 9), s + 4) < 0.1 && u % lar === (lar >> 1)) c = r[0];
    t.p(x + i, y + j, c);
  }
}
/** Caixa sombreada com borda clara em cima/esquerda e escura embaixo/direita. */
export function caixa(t: Tela, x: number, y: number, w: number, hh: number, r: Rampa) {
  t.ret(x, y, w, hh, r[2]); t.hl(x, x + w - 1, y, r[3]); t.vl(x, y, y + hh - 1, r[3]);
  t.hl(x, x + w - 1, y + hh - 1, r[0]); t.vl(x + w - 1, y, y + hh - 1, r[1]);
}
export function coluna(t: Tela, x: number, y0: number, y1: number, larg: number, r: Rampa) {
  for (let y = y0; y <= y1; y++) for (let i = 0; i < larg; i++) { const u = i / (larg - 1); t.p(x + i, y, u < 0.25 ? r[3] : u < 0.65 ? r[2] : u < 0.95 ? r[1] : r[0]); }
  caixa(t, x - 2, y0, larg + 4, 4, r); caixa(t, x - 2, y1 - 3, larg + 4, 4, r);
}
/** Janela em arco ou reta com céu/luz atrás. */
export function janela(t: Tela, x: number, y: number, w: number, hh: number, mold: Rampa, vidro: Rampa, arco = true) {
  for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) {
    const dx = (i - (w - 1) / 2) / (w / 2), topo = arco ? (1 - Math.sqrt(Math.max(0, 1 - dx * dx))) * (w / 2) : 0;
    if (j < topo) continue;
    const borda = i === 0 || i === w - 1 || j === hh - 1 || j - topo < 1.2;
    t.p(x + i, y + j, borda ? mold[1] : i === (w >> 1) || j === Math.round(hh * 0.5) ? mold[2] : j < hh * 0.5 ? vidro[2] : vidro[1]);
  }
  t.hl(x - 1, x + w, y + hh, mold[3]); t.hl(x - 1, x + w, y + hh + 1, mold[0]);
}
/** Varal de bandeirinhas (festa junina) entre dois pontos. */
export function bandeirinhas(t: Tela, x0: number, y0: number, x1: number, y1: number, barriga: number, cores: Cor[], fio: Cor) {
  const n = Math.abs(x1 - x0);
  for (let i = 0; i <= n; i++) {
    const k = i / n, x = Math.round(x0 + (x1 - x0) * k), y = Math.round(y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * barriga);
    t.p(x, y, fio);
    if (i % 7 === 3) { const c = cores[Math.floor(i / 7) % cores.length]; t.ret(x - 2, y + 1, 5, 3, c); t.p(x - 2, y + 4, c); t.p(x + 2, y + 4, c); t.p(x - 1, y + 4, c); t.p(x + 1, y + 4, c); t.p(x - 2, y + 5, c); t.p(x + 2, y + 5, c); }
  }
}
/** Anel de apoio pintado no piso (arenas de ginásio). */
export function anelApoio(t: Tela, cx: number, cy: number, rx: number, ry: number, borda: Cor, dentro: Cor | null, luz: Cor) {
  t.elipse(cx, cy, rx, ry, (_x, _y, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.78 ? (ny < -0.1 ? luz : borda) : dentro ?? VAZIO; });
}
/** Clareira de apoio natural: mancha clara + miolo mais claro. */
export function clareiraApoio(t: Tela, cx: number, cy: number, rx: number, ry: number, base: Cor, luz: Cor, s: number) {
  mancha(t, cx, cy, rx, ry, base, s, 0.3, 12);
  mancha(t, cx - rx * 0.1, cy - ry * 0.15, rx * 0.62, ry * 0.55, luz, s + 1, 0.4, 9);
}
export { W, H };
