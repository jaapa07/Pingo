/** As 16 arenas de ginásio: salões temáticos com piso em perspectiva e anéis de apoio pintados. */
import { APOIO, VAZIO, h, fbm, Seq, type ArenaDef, type Tela, type Rampa, type Cor, type Ctx, type PaletaDef, type AnimDef } from './nucleo';
import { parede, tabuado, caixa, coluna, janela, bandeirinhas, anelApoio, piso, mancha, pedra, copa, samambaia, capim, cogumelo, tronco, galho, agua, brilhosAgua, nuvem, canteiroFlores, heliconia } from './pecas';
import { animPisca, animQueda, chama, bolhas, fumaca } from './comum';

interface Salao { c: Ctx; rodape: Rampa; piso: [Cor, Cor, Cor, 'xadrez' | 'tabuas' | 'lajes' | 'liso']; anel: [Cor, Cor | null, Cor]; tam?: number }
/** Base comum: rodapé, piso em perspectiva, sombra da parede e os dois anéis de apoio. */
function salao({ c, rodape, piso: p, anel, tam }: Salao) {
  const { fundo, chao } = c;
  fundo.ret(0, 68, 320, 112, p[0]);
  fundo.ret(0, 63, 320, 6, rodape[1]); fundo.hl(0, 319, 63, rodape[3]); fundo.hl(0, 319, 68, rodape[0]);
  piso(chao, 69, p[0], p[1], p[2], p[3], { fuga: 30, tam: tam ?? 28 });
  chao.campo(0, 69, 319, 72, (_x, y) => (y < 71 ? p[2] : VAZIO));
  anelApoio(chao, APOIO.inimigo.x, APOIO.inimigo.y + 1, 34, 8, anel[0], anel[1], anel[2]);
  anelApoio(chao, APOIO.jogador.x, APOIO.jogador.y + 1, 46, 11, anel[0], anel[1], anel[2]);
}
const gin = (n: number, nome: string, paleta: PaletaDef, sombra: string, pintar: (c: Ctx) => void, anims: AnimDef[]): ArenaDef => ({ id: `ginasio-${String(n).padStart(2, '0')}`, nome, interna: true, paleta, sombra, apoio: { inimigo: [34, 8], jogador: [46, 11] }, pintar, anims });
const fogo = (id: string, pts: [number, number, number][], rampa: string, x: number, y: number, w: number, hh: number, sobre: AnimDef['sobre'] = 'chao'): AnimDef => ({ id, x, y, w, h: hh, sobre, fps: 7, pintar(t, q, c) { for (const [px, py, a] of pts) chama(t, q, px, py, a, c.P[rampa], px); } });

/* ---------- peças temáticas ---------- */
function pipa(t: Tela, x: number, y: number, a: Rampa, b: Rampa, rabo: Cor, q = 0) {
  for (let j = -7; j <= 9; j++) { const w = j < 0 ? 7 + j : Math.round(7 * (1 - j / 9)); for (let i = -w; i <= w; i++) t.p(x + i, y + j, i < 0 ? (j < 0 ? a[3] : a[2]) : j < 0 ? b[2] : b[1]); }
  t.vl(x, y - 7, y + 9, a[0]); t.hl(x - 6, x + 6, y, a[0]);
  for (let k = 0; k < 14; k++) { const px = x + Math.round(Math.sin((k + q * 2) / 2.5) * 3), py = y + 10 + k; t.p(px, py, rabo); if (k % 4 === 2) { t.p(px - 1, py, a[2]); t.p(px + 1, py, b[2]); } }
}
function teia(t: Tela, cx: number, cy: number, rad: number, cor: Cor, a0 = 0, a1 = Math.PI * 2) {
  const n = 8;
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; t.linha(cx, cy, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, cor); }
  for (let r = rad * 0.3; r <= rad; r += rad * 0.23) for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / n, b = a0 + ((a1 - a0) * (i + 1)) / n, m = (a + b) / 2; const p0: [number, number] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r], p1: [number, number] = [cx + Math.cos(m) * r * 0.86, cy + Math.sin(m) * r * 0.86], p2: [number, number] = [cx + Math.cos(b) * r, cy + Math.sin(b) * r]; t.linha(p0[0], p0[1], p1[0], p1[1], cor); t.linha(p1[0], p1[1], p2[0], p2[1], cor); }
}
function casulo(t: Tela, x: number, y: number, a: number, r: Rampa, fio: Cor) {
  t.vl(x, y - 10, y, fio);
  t.elipse(x, y + a / 2, a * 0.32, a / 2, (px, py, nx, ny) => (ny > 0.8 ? r[0] : (py + Math.round(nx * 2)) % 3 === 0 ? r[1] : nx < -0.3 ? r[3] : r[2]));
}
function vaso(t: Tela, x: number, y: number, r: Rampa, folha: Rampa, s: number) {
  t.carimbo(x - 3, y - 5, ['aaaaaaa', '.abbbc.', '.abbbc.', '.abbbc.', '..bbc..', '..ccc..'], { a: r[3], b: r[2], c: r[1] });
  capim(t, x, y - 6, 4, 6, folha, s);
}
function engrenagem(t: Tela, cx: number, cy: number, rad: number, r: Rampa, giro = 0, dentes = 10) {
  t.elipse(cx, cy, rad + 2, rad + 2, (px, py, nx, ny) => { const d = Math.hypot(px - cx, py - cy), a = Math.atan2(py - cy, px - cx) + giro; const dente = Math.floor(((a + Math.PI * 4) / (Math.PI * 2)) * dentes * 2) % 2 === 0; if (d > rad + 2 || (d > rad - 1 && !dente)) return VAZIO; if (d < rad * 0.22) return r[0]; if (d < rad * 0.38) return r[3]; if (d > rad * 0.62 && d < rad * 0.7) return r[1]; return nx + ny < -0.3 ? r[3] : nx + ny > 0.6 ? r[1] : r[2]; });
}
function berimbau(t: Tela, x: number, y: number, mad: Rampa, cab: Rampa) {
  for (let j = 0; j < 34; j++) { const px = x + Math.round(Math.sin((j / 33) * Math.PI) * 5); t.p(px, y + j, mad[2]); t.p(px + 1, y + j, mad[1]); }
  t.vl(x, y, y + 33, mad[3]); t.elipse(x + 5, y + 24, 4, 4, (_x, _y, nx, ny) => (nx + ny < -0.3 ? cab[3] : nx + ny > 0.6 ? cab[1] : cab[2]));
}
function atabaque(t: Tela, x: number, y: number, mad: Rampa, couro: Rampa, faixa: Cor) {
  for (let j = 0; j < 20; j++) { const w = Math.round(5 - (j / 19) * 2 + Math.sin((j / 19) * Math.PI) * 1.5); for (let i = -w; i <= w; i++) t.p(x + i, y + j, j === 6 || j === 14 ? faixa : i < -w * 0.4 ? mad[3] : i > w * 0.5 ? mad[1] : mad[2]); }
  t.elipse(x, y, 5, 1.6, couro[3]); t.hl(x - 5, x + 5, y + 1, couro[1]); t.ret(x - 4, y + 20, 2, 3, mad[0]); t.ret(x + 3, y + 20, 2, 3, mad[0]);
}
function lamparina(t: Tela, x: number, y: number, metal: Rampa, luz: Rampa, halo?: Cor) {
  if (halo !== undefined) t.elipse(x + 1, y + 2, 9, 8, (px, py) => ((px + py) % 2 ? halo : VAZIO));
  t.carimbo(x - 2, y - 4, ['..m..', '.mmm.', '.lhl.', '.lhl.', '.lll.', 'mmmmm', '.mmm.'], { m: metal[2], l: luz[2], h: luz[3] });
}
function espelho(t: Tela, x: number, y: number, w: number, hh: number, mold: Rampa, vidro: Rampa) {
  t.elipse(x, y, w / 2 + 2, hh / 2 + 2, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.72 ? ((px + py) % 3 === 0 ? mold[3] : mold[2]) : (px - py + 200) % 9 < 2 ? vidro[3] : ny < -0.2 ? vidro[2] : vidro[1]; });
}
/** Cortina de renda: malha vazada com barra de bicos. */
function renda(t: Tela, x: number, y: number, w: number, hh: number, r: Rampa) {
  for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) { const bico = j > hh - 4 && (i % 6 < 3 ? j - (hh - 4) > i % 6 : j - (hh - 4) > 5 - (i % 6)); if (bico) continue; const furo = (i % 4 === 1 && j % 4 === 1) || (i % 8 === 5 && j % 8 === 5); t.p(x + i, y + j, furo ? r[0] : (i + j) % 4 === 0 ? r[1] : i % 6 === 0 ? r[3] : r[2]); }
}
function bobina(t: Tela, x: number, yb: number, a: number, metal: Rampa, cobre: Rampa, raio: Rampa) {
  caixa(t, x - 7, yb - 6, 15, 6, metal);
  for (let j = 0; j < a; j++) { const w = 4; for (let i = -w; i <= w; i++) t.p(x + i, yb - 7 - j, j % 3 === 0 ? cobre[0] : i < -1 ? cobre[3] : i > 2 ? cobre[1] : cobre[2]); }
  t.elipse(x, yb - a - 11, 7, 4, (_x, _y, nx, ny) => (nx + ny < -0.3 ? metal[3] : ny > 0.4 ? metal[1] : metal[2])); t.p(x - 3, yb - a - 13, raio[3]);
}
function vagonete(t: Tela, x: number, y: number, r: Rampa, carga: Rampa) {
  for (let i = 0; i < 7; i++) pedra(t, x + 4 + i * 3, y - 14 - (i % 2) * 2, 3, 2.5, carga, i);
  for (let j = 0; j < 12; j++) { const rec = Math.round(j * 0.25); for (let i = rec; i < 28 - rec; i++) t.p(x + i, y - 12 + j, j === 0 ? r[3] : i === rec ? r[3] : i >= 27 - rec ? r[0] : j % 4 === 0 ? r[1] : r[2]); }
  for (const dx of [6, 21]) t.elipse(x + dx, y + 1, 3, 3, (_x, _y, nx, ny) => (nx * nx + ny * ny < 0.2 ? r[3] : r[0]));
}
function trilhos(t: Tela, pts: [number, number][], ferro: Rampa, dorm: Rampa) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n, lar = 3 + (y - 70) * 0.09; if (k % 5 === 0) t.hl(x - lar - 2, x + lar + 2, y, dorm[1]); t.p(x - lar, y, ferro[3]); t.p(x + lar, y, ferro[3]); t.p(x - lar, y + 1, ferro[0]); t.p(x + lar, y + 1, ferro[0]); }
  }
}
function fogueira(t: Tela, x: number, y: number, lenha: Rampa) {
  for (let i = 0; i < 4; i++) { t.linha(x - 8, y - i * 3, x + 8, y - i * 3 - 1, lenha[i % 2 ? 2 : 1], 2); t.linha(x - 5 + i, y + 1, x - 2 + i, y - 12, lenha[3]); t.linha(x + 5 - i, y + 1, x + 2 - i, y - 12, lenha[1]); }
  t.hl(x - 9, x + 9, y + 2, lenha[0]);
}
function esteira(t: Tela, x: number, y: number, w: number, r: Rampa, seta: Cor, q = 0) {
  caixa(t, x, y, w, 7, r);
  for (let i = 2; i < w - 2; i++) if ((i + q * 2) % 8 < 2) t.vl(x + i, y + 1, y + 5, r[0]); else if ((i + q * 2) % 8 === 5) { t.p(x + i, y + 3, seta); t.p(x + i - 1, y + 2, seta); t.p(x + i - 1, y + 4, seta); }
  t.elipse(x + 3, y + 9, 3, 2, r[1]); t.elipse(x + w - 4, y + 9, 3, 2, r[1]);
}
function terrario(t: Tela, x: number, y: number, w: number, hh: number, metal: Rampa, vidro: Rampa, folha: Rampa, liq?: Rampa) {
  caixa(t, x, y, w, hh, metal); t.ret(x + 2, y + 2, w - 4, hh - 4, vidro[1]); t.ret(x + 2, y + 2, w - 4, 3, vidro[2]); t.linha(x + 3, y + hh - 4, x + 7, y + 3, vidro[3]);
  if (liq) { t.ret(x + 2, y + hh * 0.45, w - 4, hh * 0.55 - 2, liq[1]); t.hl(x + 2, x + w - 3, y + hh * 0.45, liq[3]); } else { capim(t, x + w / 2, y + hh - 3, 5, hh * 0.5, folha, x); t.hl(x + 2, x + w - 3, y + hh - 3, folha[0]); }
}
function pingentes(t: Tela, y0: number, n: number, r: Rampa, s: number, amax = 12) {
  const sq = new Seq(s);
  for (let i = 0; i < n; i++) { const x = sq.int(0, 319), a = sq.int(4, amax); for (let j = 0; j < a; j++) { const w = Math.round((1 - j / a) * 2); for (let k = -w; k <= w; k++) t.p(x + k, y0 + j, k < 0 ? r[3] : k === 0 ? r[2] : r[1]); } }
}
function totem(t: Tela, x: number, yb: number, pedraR: Rampa, cor: Rampa, simbolo: string[]) {
  coluna(t, x - 6, yb - 46, yb, 12, pedraR);
  caixa(t, x - 9, yb - 52, 18, 6, pedraR); t.ret(x - 6, yb - 55, 12, 3, cor[1]); t.hl(x - 6, x + 5, yb - 55, cor[3]);
  t.carimbo(x - 3, yb - 36, simbolo, { a: cor[2], b: cor[3] });
  for (let y = yb - 24; y < yb - 6; y += 5) { t.hl(x - 4, x + 3, y, pedraR[0]); t.p(x - 1, y + 2, cor[2]); t.p(x, y + 2, cor[2]); }
}
const escamas = (t: Tela, x0: number, y0: number, w: number, hh: number, r: Rampa) => t.campo(x0, y0, x0 + w - 1, y0 + hh - 1, (x, y) => { const li = Math.floor((y - y0) / 5), fx = (x - x0 + (li & 1) * 4) % 8, fy = (y - y0) % 5; const borda = Math.abs(fx - 3.5) > 3.6 - (fy > 2 ? (fy - 2) * 1.4 : 0); return borda || fy === 0 && false ? r[0] : fy < 2 ? r[2] : r[1]; });

/* ---------- 1 · Vento — píer da Vila Caiçara ---------- */
const g01 = gin(1, 'Ginásio do Vento', { rampas: { ceu: ['#3a86d6', '#5ca8e6', '#8fcdf0', '#c9ecf2'], nuvem: ['#9cc4e4', '#d6eaf6', '#ffffff'], mar: ['#1b56a0', '#2a7ac2', '#58aadc', '#c4eaf2'], deck: ['#4a2c38', '#7c5040', '#a87850', '#d0a468', '#ecd090'], corda: ['#8c7450', '#d8c490', '#fff4d0'], pipaA: ['#8c1c34', '#d83c44', '#f47c5c', '#ffc890'], pipaB: ['#1c5c8c', '#2c9cc4', '#6cd4dc', '#d0fcf0'], pipaC: ['#a87414', '#f0b82c', '#fce468', '#fffcc0'] } }, 'deck', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.ret(0, 0, 320, 20, P.ceu[1]); fundo.ret(0, 20, 320, 18, P.ceu[2]); fundo.ret(0, 38, 320, 12, P.ceu[3]);
  nuvem(fundo, 30, 24, 60, P.nuvem, 3); nuvem(fundo, 190, 16, 80, P.nuvem, 5);
  agua(fundo, 50, 64, P.mar, 4);
  salao({ c, rodape: [P.deck[0], P.deck[1], P.deck[2], P.deck[3]], piso: [P.deck[2], P.deck[3], P.deck[1], 'tabuas'], anel: [P.corda[1], null, P.corda[2]], tam: 18 });
  // pavilhão aberto: postes, travessa e guarda-corpo de corda
  for (const x of [8, 84, 160, 236, 306]) coluna(cenario, x, 0, 66, 6, [P.deck[0], P.deck[1], P.deck[2], P.deck[4]]);
  caixa(cenario, 0, 0, 320, 7, [P.deck[0], P.deck[1], P.deck[2], P.deck[4]]);
  for (let x = 0; x < 320; x++) { const y = 52 + Math.round(Math.sin(((x % 76) / 76) * Math.PI) * 4); cenario.p(x, y, P.corda[1]); cenario.p(x, y + 1, P.corda[0]); }
  pipa(cenario, 46, 22, P.pipaA, P.pipaC, P.corda[1]); pipa(cenario, 122, 28, P.pipaB, P.pipaA, P.corda[1]); pipa(cenario, 200, 20, P.pipaC, P.pipaB, P.corda[1]); pipa(cenario, 272, 30, P.pipaA, P.pipaB, P.corda[1]);
  // biruta, cata-ventos e rolos de corda
  for (const [x, y] of [[14, 110], [300, 100]]) { chao.vl(x, y - 44, y, P.deck[0]); chao.vl(x + 1, y - 44, y, P.deck[3]); for (let i = 0; i < 16; i++) { const w = 4 - Math.floor(i / 5); for (let j = -w; j <= w; j++) chao.p(x + 2 + i, y - 40 + j + Math.round(i * 0.2), Math.floor(i / 4) % 2 ? P.pipaA[2] : P.nuvem[2]); } }
  for (const [x, y] of [[40, 160], [270, 128]]) { chao.elipse(x, y, 9, 4, (px, py, nx, ny) => (nx * nx + ny * ny < 0.2 ? P.deck[0] : (px + py) % 3 === 0 ? P.corda[0] : P.corda[1])); chao.hl(x - 6, x + 6, y - 3, P.corda[2]); }
  // setas de vento pintadas no deck (o quebra-cabeça das correntes)
  for (const [x, y, d] of [[150, 100, 1], [200, 150, -1], [120, 170, 1]] as const) chao.carimbo(x, y, ['...a....', '....aa..', 'aaaaaaaa', '....aa..', '...a....'], { a: P.pipaB[3] }, d < 0);
}, [
  { id: 'pipas', x: 30, y: 30, w: 260, h: 26, sobre: 'cenario', fps: 5, pintar(t, q, c) { for (const [x, y, a, b] of [[46, 22, 'pipaA', 'pipaC'], [122, 28, 'pipaB', 'pipaA'], [200, 20, 'pipaC', 'pipaB'], [272, 30, 'pipaA', 'pipaB']] as const) for (let k = 0; k < 14; k++) { const px = x + Math.round(Math.sin((k + q * 1.57) / 2.5) * 3), py = y + 10 + k; t.p(px, py, c.P.corda[1]); if (k % 4 === 2) { t.p(px - 1, py, c.P[a][2]); t.p(px + 1, py, c.P[b][2]); } } } },
  animQueda('vento', 0, 60, 320, 110, 10, 4, (c) => [c.P.nuvem[2], c.P.pipaB[3]], { vx: 6, passo: 1, forma: 'folha', fps: 7 }),
]);

/* ---------- 2 · Inseto — copas do Bosque Alto ---------- */
const g02 = gin(2, 'Ginásio do Inseto', { rampas: { longe: ['#0c2028', '#143834', '#1c5040', '#2c6c4c'], folha: ['#143c34', '#246c40', '#3c9c4c', '#84cc58'], tronco: ['#2c1c30', '#4c3038', '#74483c', '#a07048'], deck: ['#3c2434', '#644038', '#8c6444', '#b48c58', '#d8b878'], teia: ['#8ca4b4', '#d4e4e8', '#ffffff'], casulo: ['#7c6c4c', '#b8a874', '#e0d49c', '#fcf8d0'], luz: ['#a8c82c', '#e8fc6c', '#fcffd0'] }, emissivas: ['luz'] }, 'deck', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.ret(0, 0, 320, 70, P.longe[1]);
  for (let i = 0; i < 7; i++) tronco(fundo, 20 + i * 48, -4, 70, 10 + h(i, 2) * 8, [P.longe[0], P.longe[0], P.longe[2], P.longe[3]], i, { casca: false, raiz: 0 });
  for (let i = 0; i < 12; i++) copa(fundo, 10 + i * 28, 8 + (i % 3) * 5, 20, 8, [P.longe[0], P.longe[1], P.longe[2], P.longe[3]], i + 3, 6);
  salao({ c, rodape: [P.tronco[0], P.tronco[1], P.tronco[2], P.tronco[3]], piso: [P.deck[2], P.deck[3], P.deck[1], 'tabuas'], anel: [P.teia[1], null, P.teia[2]], tam: 16 });
  tronco(cenario, 30, -4, 68, 34, P.tronco, 3, { raiz: 6 }); tronco(cenario, 286, -4, 68, 38, P.tronco, 5, { raiz: 6 });
  cenario.elipse(30, 40, 7, 10, (_x, _y, nx, ny) => (nx * nx + ny * ny > 0.6 ? P.tronco[0] : P.longe[0])); cenario.p(28, 38, P.luz[1]); cenario.p(32, 38, P.luz[1]);
  copa(cenario, 60, 4, 70, 10, P.folha, 7, 9); copa(cenario, 250, 4, 76, 10, P.folha, 9, 9); copa(cenario, 160, 0, 50, 7, P.folha, 11, 8);
  teia(cenario, 160, 34, 30, P.teia[1]); teia(cenario, 52, 0, 34, P.teia[1], 0, Math.PI / 2); teia(cenario, 264, 0, 36, P.teia[1], Math.PI / 2, Math.PI);
  cenario.carimbo(157, 31, ['a.bb.a', '.abba.', 'aabbaa', '.a..a.'], { a: P.tronco[0], b: P.casulo[0] });
  for (const [x, y, a] of [[100, 18, 14], [116, 14, 10], [214, 16, 16], [232, 20, 11], [78, 24, 9]]) casulo(cenario, x, y, a, P.casulo, P.teia[0]);
  // pontes de teia numeradas pela ordem (o quebra-cabeça)
  for (const [x0, y0, x1, y1] of [[0, 104, 44, 96], [276, 120, 319, 126], [130, 176, 190, 170]]) for (let k = 0; k <= 40; k++) { const u = k / 40, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 3; chao.p(x, y, P.teia[2]); chao.p(x, y + 5, P.teia[1]); if (k % 4 === 0) chao.vl(x, y, y + 5, P.teia[0]); }
  teia(chao, 0, 180, 40, P.teia[1], -Math.PI / 2, 0); teia(chao, 320, 180, 34, P.teia[1], Math.PI, Math.PI * 1.5);
  samambaia(chao, 300, 100, 14, P.folha, 3); samambaia(chao, 16, 150, 16, P.folha, 5);
  for (const [x, y] of [[250, 160], [60, 120]]) { casulo(chao, x, y, 16, P.casulo, P.teia[0]); }
}, [
  animPisca('vagalumes', 10, 10, 300, 150, 14, 5, (c) => [c.P.luz[0], c.P.luz[2]], { fps: 4 }),
  animQueda('folhas', 20, 10, 280, 120, 7, 3, (c) => [c.P.folha[3], c.P.folha[2]], { fps: 5 }),
]);

/* ---------- 3 · Rio — comportas de Porto Sereia ---------- */
const g03 = gin(3, 'Ginásio do Rio', { rampas: { azulejo: ['#1c3c7c', '#2c64b4', '#74b0e0', '#e4f4fc'], pedra: ['#2c3454', '#505c7c', '#8090a4', '#b4c4c8', '#dce8e0'], agua: ['#145094', '#1c78bc', '#44acd8', '#b4e8f0'], madeira: ['#3c2434', '#6c4438', '#9c6c48', '#c89c64'], bronze: ['#6c4418', '#b8842c', '#ecc454', '#fff8b0'], faixa: ['#a42c34', '#e8544c', '#fcb49c'] } }, 'pedra', (c) => {
  const { fundo, cenario, chao, P } = c;
  // parede de azulejos com painel de ondas
  fundo.campo(0, 0, 319, 64, (x, y) => { const cx = x % 12, cy = y % 12; if (cx === 0 || cy === 0) return P.azulejo[1]; const d = Math.hypot(cx - 6, cy - 6); return y > 30 && y < 43 ? ((x + Math.round(Math.sin(x / 5) * 3) + y) % 8 < 3 ? P.azulejo[2] : P.azulejo[1]) : d < 2 ? P.azulejo[2] : d < 4.5 && d > 3.5 ? P.azulejo[2] : P.azulejo[3]; });
  salao({ c, rodape: [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], piso: [P.pedra[2], P.pedra[3], P.pedra[1], 'lajes'], anel: [P.azulejo[1], null, P.azulejo[2]], tam: 30 });
  // três comportas: uma aberta (jorra), duas fechadas
  for (const [x, aberta] of [[40, 0], [136, 1], [232, 0]] as const) {
    caixa(cenario, x, 10, 48, 56, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]]); cenario.ret(x + 5, 16, 38, 50, P.pedra[0]);
    const yb = aberta ? 34 : 62; tabuado(cenario, x + 5, 16, 38, yb - 16, P.madeira, 9, x); cenario.hl(x + 5, x + 42, yb, P.bronze[0]); cenario.ret(x + 5, 22, 38, 3, P.bronze[1]); cenario.hl(x + 5, x + 42, 22, P.bronze[3]);
    if (aberta) cenario.campo(x + 6, yb + 1, x + 41, 66, (px, py) => (h(px >> 1, Math.floor(py / 4), 3) > 0.6 ? P.agua[3] : (px + py) % 5 === 0 ? P.agua[1] : P.agua[2]));
    cenario.elipse(x + 24, 8, 6, 6, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.6 ? P.bronze[1] : d < 0.1 ? P.bronze[3] : Math.abs(nx) < 0.18 || Math.abs(ny) < 0.18 ? P.bronze[2] : VAZIO; });
  }
  for (const x of [8, 108, 204, 298]) { cenario.linha(x, 24, x + 12, 56, P.madeira[2], 2); cenario.linha(x + 12, 24, x, 56, P.madeira[3], 2); cenario.elipse(x, 22, 2, 4, P.faixa[1]); cenario.elipse(x + 12, 22, 2, 4, P.faixa[1]); }
  // canais laterais e central com água, em níveis diferentes
  const canal = (x0: number, x1: number, y0: number, y1: number) => chao.campo(0, y0, 319, y1, (x, y) => { const z = 141 / (y - 39), wx = (x - 160) * z; if (wx < x0 || wx > x1) return VAZIO; return wx - x0 < 2.2 * z || x1 - wx < 2.2 * z ? P.pedra[0] : y - y0 < 3 ? P.agua[0] : h(Math.floor((x + y * 2) / 7), y, 3) > 0.8 ? P.agua[3] : (y & 3) === 0 ? P.agua[1] : P.agua[2]; });
  canal(-22, 22, 69, 96); canal(-400, -150, 69, 179); canal(170, 400, 100, 179);
  for (const [x, y] of [[20, 150], [296, 96]]) { caixa(chao, x - 5, y - 16, 10, 16, [P.bronze[0], P.bronze[0], P.bronze[1], P.bronze[3]]); chao.linha(x, y - 16, x + 6, y - 26, P.madeira[3], 2); chao.elipse(x + 7, y - 27, 2, 2, P.faixa[1]); }
}, [
  { id: 'agua', x: 0, y: 34, w: 320, h: 146, sobre: 'chao', fps: 5, pintar(t, q, c) { for (let py = 35; py <= 66; py++) for (let px = 142; px <= 177; px++) if (h(px >> 1, Math.floor((py - q * 4 + 400) / 4), 3) > 0.6) t.p(px, py, c.P.azulejo[3]); for (let i = 0; i < 26; i++) { const x = (i * 53 + 7) % 320, y = 74 + ((i * 29) % 100); const z = 141 / (y - 39), wx = (x - 160) * z; if ((wx > -19 && wx < 19 && y < 94) || wx < -156 || (wx > 176 && y > 104)) t.hl(x + q, x + q + 3, y, c.P.agua[3]); } for (let i = 0; i < 7; i++) t.p(140 + ((i * 7 + q * 3) % 40), 67 + (i % 2), c.P.azulejo[3]); } },
  animPisca('respingos', 130, 60, 60, 12, 6, 8, (c) => [c.P.agua[3], c.P.azulejo[3]], { fps: 6, sobre: 'chao' }),
]);

/* ---------- 4 · Mata — estufa da raizeira ---------- */
const g04 = gin(4, 'Ginásio da Mata', { rampas: { madeira: ['#2c1c2c', '#503438', '#7c5440', '#a87c50', '#d0a870'], folha: ['#143c34', '#246c40', '#3c9c4c', '#84cc58'], terra: ['#3c2830', '#5c4038', '#806044', '#a48458', '#c8a874'], vidro: ['#3c7c84', '#74b8a8', '#b8e4c4', '#f0fce0'], barro: ['#7c3420', '#b85c30', '#e08c4c', '#f8c080'], flor: ['#8c2460', '#d84c8c', '#f890b4', '#ffd4dc'], cipo: ['#3c4c1c', '#6c8428', '#a4bc3c'] } }, 'terra', (c) => {
  const { fundo, cenario, chao, P } = c;
  // estufa: vidraças com a mata lá fora
  fundo.campo(0, 0, 319, 64, (x, y) => (fbm(x, y, 16, 3) > 0.52 ? P.vidro[1] : fbm(x, y, 9, 5) > 0.6 ? P.vidro[2] : P.vidro[0]));
  for (let x = 0; x < 320; x += 32) { fundo.ret(x, 0, 3, 64, P.madeira[2]); fundo.vl(x, 0, 63, P.madeira[4]); fundo.vl(x + 2, 0, 63, P.madeira[0]); }
  for (const y of [0, 28]) { fundo.ret(0, y, 320, 3, P.madeira[2]); fundo.hl(0, 319, y, P.madeira[4]); fundo.hl(0, 319, y + 2, P.madeira[0]); }
  salao({ c, rodape: [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[4]], piso: [P.terra[2], P.terra[3], P.terra[1], 'liso'], anel: [P.folha[1], null, P.folha[3]] });
  chao.campo(0, 69, 319, 179, (x, y) => { const n = fbm(x, y * 2.6, 20, 4); return n > 0.62 ? P.terra[3] : n < 0.26 ? P.terra[1] : VAZIO; });
  anelApoio(chao, APOIO.inimigo.x, APOIO.inimigo.y + 1, 34, 8, P.folha[1], P.terra[4], P.folha[3]); anelApoio(chao, APOIO.jogador.x, APOIO.jogador.y + 1, 46, 11, P.folha[1], P.terra[4], P.folha[3]);
  // prateleiras de ervas, feixes pendurados e cipós
  for (const [x, y] of [[36, 36], [36, 54], [228, 36], [228, 54]]) { cenario.ret(x, y, 58, 3, P.madeira[2]); cenario.hl(x, x + 57, y, P.madeira[4]); cenario.hl(x, x + 57, y + 3, P.madeira[0]); for (let i = 0; i < 5; i++) { const px = x + 6 + i * 11; if ((i + y) % 3 === 0) { cenario.ret(px - 2, y - 7, 5, 7, P.vidro[2]); cenario.ret(px - 2, y - 4, 5, 4, i % 2 ? P.flor[1] : P.cipo[1]); cenario.hl(px - 2, px + 2, y - 8, P.madeira[1]); } else vaso(cenario, px, y, P.barro, P.folha, px); } }
  for (let i = 0; i < 9; i++) { const x = 104 + i * 14; cenario.vl(x, 3, 8 + (i % 3) * 2, P.madeira[1]); capim(cenario, x, 22 + (i % 3) * 2, 4, 12, i % 2 ? [P.cipo[0], P.cipo[0], P.cipo[1], P.cipo[2]] : [P.flor[0], P.flor[0], P.flor[1], P.flor[2]], i); }
  for (const x of [8, 20, 102, 214, 300, 312]) for (let y = 0; y < 44 + (x % 5) * 4; y++) { const px = x + Math.round(Math.sin(y / 6 + x) * 2); cenario.p(px, y, P.cipo[1]); if (y % 6 === 0) { cenario.p(px + 1, y, P.folha[3]); cenario.p(px + 2, y + 1, P.folha[2]); } }
  // labirinto de cipós brotando do chão, canteiros e regador
  const sq = new Seq(4);
  for (let i = 0; i < 9; i++) { let x = sq.int(0, 319), y = sq.int(78, 176); const de = ((x - APOIO.inimigo.x) / 56) ** 2 + ((y - APOIO.inimigo.y) / 18) ** 2, dj = ((x - APOIO.jogador.x) / 72) ** 2 + ((y - APOIO.jogador.y) / 22) ** 2; if (de < 1 || dj < 1) continue; for (let k = 0; k < 30; k++) { chao.p(x, y, P.cipo[1]); chao.p(x, y + 1, P.cipo[0]); if (k % 5 === 0) { chao.p(x, y - 1, P.folha[3]); chao.p(x + 1, y - 2, P.folha[2]); } x += 1; if (k % 3 === 0) y += sq.int(-1, 1); } }
  caixa(chao, 0, 138, 44, 14, P.madeira); mancha(chao, 22, 140, 19, 3, P.terra[0], 3, 0.2, 5); heliconia(chao, 10, 140, 16, P.folha, P.flor); heliconia(chao, 30, 140, 20, P.folha, P.barro); samambaia(chao, 22, 140, 9, P.folha, 4);
  caixa(chao, 276, 112, 44, 12, P.madeira); mancha(chao, 298, 114, 19, 3, P.terra[0], 5, 0.2, 5); samambaia(chao, 290, 114, 13, P.folha, 6); samambaia(chao, 308, 114, 10, P.folha, 7); canteiroFlores(chao, 298, 106, 14, 3, 5, P.flor, P.vidro[3], 8);
  vaso(chao, 250, 172, P.barro, P.folha, 3); vaso(chao, 262, 176, P.barro, P.folha, 5);
}, [
  animQueda('folhas', 20, 10, 280, 130, 8, 3, (c) => [c.P.folha[3], c.P.flor[2]], { fps: 5 }),
  animPisca('polen', 10, 60, 300, 110, 10, 7, (c) => [c.P.vidro[3], 0xffffff], { fps: 3 }),
]);

/* ---------- 5 · Terra — curral da Boiadeira Zefa ---------- */
const g05 = gin(5, 'Ginásio da Terra', { rampas: { ceu: ['#4a9cdc', '#78bce8', '#b0d8e8', '#f0e4c0'], madeira: ['#2c1c2c', '#543438', '#84583c', '#b08450', '#d8b474'], lama: ['#3c2428', '#5c3c30', '#84583c', '#a87c50', '#cca46c'], palha: ['#a87c24', '#dcb03c', '#f4dc6c', '#fff8b0'], couro: ['#5c2418', '#984828', '#c87840', '#f0b06c'], capim: ['#2c5c3c', '#4c8c48', '#84b850'] } }, 'lama', (c) => {
  const { fundo, cenario, chao, P } = c;
  tabuado(fundo, 0, 0, 320, 64, [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[3]], 10, 3);
  // porteira aberta para o pantanal
  fundo.ret(120, 14, 80, 50, P.ceu[2]); fundo.ret(120, 14, 80, 16, P.ceu[1]); fundo.ret(120, 50, 80, 14, P.capim[1]); fundo.hl(120, 199, 50, P.capim[2]);
  nuvem(fundo, 140, 28, 40, [P.ceu[2], P.ceu[3], 0xffffff], 3);
  salao({ c, rodape: [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[4]], piso: [P.lama[2], P.lama[3], P.lama[1], 'liso'], anel: [P.madeira[1], P.lama[4], P.palha[2]] });
  chao.campo(0, 69, 319, 179, (x, y) => { if (chao.g(x, y) !== P.lama[2]) return VAZIO; const n = fbm(x, y * 2.6, 22, 4); return n > 0.62 ? P.lama[3] : n < 0.26 ? P.lama[1] : VAZIO; });
  caixa(cenario, 114, 8, 92, 6, P.madeira); coluna(cenario, 114, 8, 66, 6, [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[4]]); coluna(cenario, 200, 8, 66, 6, [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[4]]);
  // berrante, laços, selas e fardos de feno
  cenario.campo(144, 0, 176, 8, (x, y) => { const u = (x - 144) / 32, yy = 2 + Math.sin(u * Math.PI) * 4; return Math.abs(y - yy) < 1 + u * 1.5 ? (y < yy ? P.palha[3] : P.couro[2]) : VAZIO; });
  for (const [x, y] of [[40, 22], [70, 26], [250, 22], [284, 28]]) cenario.elipse(x, y, 8, 9, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.62 ? ((px + py) % 3 ? P.palha[1] : P.palha[0]) : VAZIO; });
  for (const [x, y] of [[22, 44], [262, 44]]) { cenario.ret(x, y, 30, 3, P.madeira[3]); cenario.elipse(x + 9, y - 3, 8, 4, (_x, _y, nx, ny) => (ny < -0.2 ? P.couro[3] : nx > 0.5 ? P.couro[1] : P.couro[2])); cenario.ret(x + 20, y - 8, 6, 8, P.couro[1]); cenario.hl(x + 20, x + 25, y - 8, P.couro[3]); }
  const feno = (t: Tela, x: number, y: number) => { caixa(t, x, y, 22, 13, [P.palha[0], P.palha[0], P.palha[1], P.palha[3]]); for (let i = 0; i < 22; i += 3) t.vl(x + i, y + 1, y + 11, i % 2 ? P.palha[2] : P.palha[0]); t.vl(x + 7, y, y + 12, P.couro[1]); t.vl(x + 15, y, y + 12, P.couro[1]); };
  feno(cenario, 60, 53); feno(cenario, 84, 53); feno(cenario, 72, 40); feno(cenario, 226, 53);
  // cerca do curral e atoleiros que afundam (o quebra-cabeça)
  for (const [x0, y0, x1, y1] of [[0, 86, 60, 78], [319, 96, 268, 84]]) { for (const dy of [0, 7]) chao.linha(x0, y0 - dy, x1, y1 - dy, P.madeira[3], 2); for (let k = 0; k <= 3; k++) { const x = x0 + ((x1 - x0) * k) / 3, y = y0 + ((y1 - y0) * k) / 3; chao.ret(x - 1, y - 12, 3, 16, P.madeira[2]); chao.vl(x - 1, y - 12, y + 3, P.madeira[4]); } }
  for (const [cx, cy, rx, ry, s] of [[168, 108, 26, 5, 3], [266, 150, 40, 10, 5], [150, 170, 34, 6, 7], [20, 116, 18, 4, 9]]) chao.campo(cx - rx * 1.5, cy - ry * 1.6, cx + rx * 1.5, cy + ry * 1.6, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy - (fbm(x, y * 1.8, 10, s) - 0.5) * 0.7; return d > 1.1 ? VAZIO : d > 0.95 ? P.lama[4] : d > 0.6 && dy > 0 ? P.lama[1] : h(Math.floor(x / 6), y, 3) > 0.9 ? P.lama[2] : P.lama[0]; });
  for (let i = 0; i < 8; i++) { const x = 120 + i * 9 - (i % 2) * 3, y = 124 + i * 4; chao.carimbo(x, y, ['a.a', 'a.a', '...'], { a: P.lama[1] }); }
  feno(chao, 2, 154); feno(chao, 296, 108);
  capim(chao, 30, 152, 5, 7, [P.palha[0], P.palha[1], P.palha[2], P.palha[3]], 3);
}, [
  { id: 'atoleiro', x: 100, y: 96, w: 220, h: 84, sobre: 'chao', fps: 3, pintar(t, q, c) { for (const [x, y, w, hh, s] of [[146, 104, 44, 9, 3], [232, 142, 70, 16, 5], [122, 165, 56, 10, 7]]) bolhas(t, q, x, y, w, hh, 4, [c.P.lama[1], c.P.lama[2], c.P.lama[4], c.P.lama[4]], s); } },
  animQueda('poeira', 0, 60, 320, 110, 9, 6, (c) => [c.P.lama[4], c.P.palha[2]], { vx: 3, passo: 1, forma: 'ponto', fps: 6 }),
]);

/* ---------- 6 · Encanto — ateliê de renda da Cidade Coral ---------- */
const g06 = gin(6, 'Ginásio do Encanto', { rampas: { parede: ['#7c5c9c', '#a884c0', '#d4b0dc', '#f4dcf0'], renda: ['#b89cc4', '#e4d4e8', '#fcf4f8', '#ffffff'], piso: ['#9c6c94', '#d49cb4', '#f4c8cc', '#fce8e0', '#fffcf0'], ouro: ['#946414', '#d8a42c', '#fcd85c', '#fffcc0'], vidro: ['#5c8cc4', '#94c4e4', '#d4f0f8', '#ffffff'], raio: ['#fce46c', '#fffcc0', '#ffffff'], coral: ['#b43c5c', '#f0708c', '#fcb4c0'] }, emissivas: ['raio'] }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.campo(0, 0, 319, 64, (x, y) => (x % 20 < 10 ? P.parede[2] : P.parede[1]));
  for (let x = 5; x < 320; x += 20) for (let y = 8; y < 60; y += 16) { fundo.p(x, y, P.parede[3]); fundo.p(x - 1, y + 1, P.parede[3]); fundo.p(x + 1, y + 1, P.parede[3]); fundo.p(x, y + 2, P.parede[3]); }
  salao({ c, rodape: [P.parede[0], P.parede[0], P.parede[1], P.parede[3]], piso: [P.piso[2], P.piso[4], P.piso[1], 'xadrez'], anel: [P.ouro[1], null, P.ouro[3]], tam: 24 });
  // janelas com cortinas de renda, espelhos e o raio de luz que salta entre eles
  for (const x of [20, 262]) { janela(cenario, x, 6, 38, 50, P.ouro, P.vidro, true); renda(cenario, x - 4, 4, 14, 54, P.renda); renda(cenario, x + 28, 4, 14, 54, P.renda); cenario.ret(x - 6, 2, 50, 3, P.ouro[1]); cenario.hl(x - 6, x + 43, 2, P.ouro[3]); }
  renda(cenario, 78, 0, 164, 9, P.renda);
  espelho(cenario, 104, 34, 20, 30, P.ouro, P.vidro); espelho(cenario, 160, 30, 26, 36, P.ouro, P.vidro); espelho(cenario, 216, 34, 20, 30, P.ouro, P.vidro);
  cenario.linha(40, 30, 104, 34, P.raio[1]); cenario.linha(104, 34, 160, 52, P.raio[1]); cenario.linha(160, 52, 216, 34, P.raio[1]);
  // almofada de bilros, manequim e espelhos de chão
  const esp = (x: number, y: number, a: number) => { chao.ret(x - 1, y - a, 3, a, P.ouro[1]); espelho(chao, x, y - a - 12, 18, 26, P.ouro, P.vidro); chao.ret(x - 7, y, 15, 3, P.ouro[0]); chao.hl(x - 7, x + 7, y, P.ouro[2]); };
  esp(22, 126, 12); esp(300, 116, 12);
  chao.linha(31, 104, 150, 150, P.raio[1]); chao.linha(150, 150, 292, 96, P.raio[1]); chao.elipse(150, 150, 3, 2, P.raio[2]);
  chao.elipse(266, 160, 14, 8, (px, py, nx, ny) => (ny > 0.6 ? P.coral[0] : (px + py) % 4 === 0 ? P.coral[2] : P.coral[1])); for (let i = 0; i < 6; i++) { chao.linha(258 + i * 3, 156, 256 + i * 4, 166, P.renda[2]); chao.ret(255 + i * 4, 166, 2, 4, P.ouro[1]); } renda(chao, 258, 150, 18, 7, P.renda);
  for (const [x, y] of [[60, 170], [200, 174], [120, 96], [250, 100]]) { chao.p(x, y, P.raio[2]); chao.p(x - 1, y, P.ouro[2]); chao.p(x + 1, y, P.ouro[2]); chao.p(x, y - 1, P.ouro[2]); chao.p(x, y + 1, P.ouro[2]); }
}, [
  animPisca('brilhos', 10, 10, 300, 160, 16, 4, (c) => [c.P.ouro[2], c.P.raio[2]], { cruz: true, fps: 4 }),
  { id: 'raio', x: 30, y: 26, w: 270, h: 128, sobre: 'chao', fps: 6, pintar(t, q, c) { const segs: [number, number, number, number][] = [[40, 30, 104, 34], [104, 34, 160, 52], [160, 52, 216, 34], [31, 104, 150, 150], [150, 150, 292, 96]]; segs.forEach(([x0, y0, x1, y1], i) => { const u = ((q + i) % 4) / 4; for (let k = 0; k < 8; k++) { const v = u + k / 40; if (v <= 1) t.p(x0 + (x1 - x0) * v, y0 + (y1 - y0) * v, c.P.raio[2]); } }); } },
]);

/* ---------- 7 · Trovão — oficina do Faroleiro Volta ---------- */
const g07 = gin(7, 'Ginásio do Trovão', { rampas: { aco: ['#1c2440', '#34486c', '#587894', '#90b0bc', '#c8e0dc'], cobre: ['#6c2c1c', '#b05c2c', '#e4944c', '#fcd494'], raio: ['#c89414', '#fcd834', '#fff8a0', '#ffffff'], vidro: ['#143c5c', '#24747c', '#5cc4b4', '#c4fce4'], piso: ['#242c48', '#3c4c68', '#58708c', '#7c98a8'], perigo: ['#201c28', '#e8b82c'] }, emissivas: ['raio'] }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.campo(0, 0, 319, 64, (x, y) => { const cx = x % 40, cy = y % 32; return cx === 0 || cy === 0 ? P.aco[0] : cx === 1 || cy === 1 ? P.aco[2] : (cx === 4 || cx === 36) && (cy === 4 || cy === 28) ? P.aco[3] : P.aco[1]; });
  salao({ c, rodape: [P.aco[0], P.aco[1], P.aco[2], P.aco[4]], piso: [P.piso[1], P.piso[2], P.piso[0], 'lajes'], anel: [P.raio[0], null, P.raio[2]], tam: 32 });
  // janela-lanterna do farol, bobinas, medidores e cabos
  cenario.elipse(160, 30, 26, 24, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.8 ? P.aco[3] : d > 0.7 ? P.aco[0] : Math.abs(px - 160) < 1 || Math.abs(py - 30) < 1 ? P.aco[2] : d < 0.12 ? P.raio[2] : (Math.atan2(ny, nx) * 4 + 20) % 2 < 0.6 ? P.vidro[2] : P.vidro[1]; });
  bobina(cenario, 60, 66, 30, P.aco, P.cobre, P.raio); bobina(cenario, 260, 66, 30, P.aco, P.cobre, P.raio); bobina(cenario, 104, 66, 16, P.aco, P.cobre, P.raio); bobina(cenario, 216, 66, 16, P.aco, P.cobre, P.raio);
  for (const [x, y] of [[20, 20], [300, 20], [20, 44], [300, 44]]) cenario.elipse(x, y, 8, 8, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.7 ? P.cobre[1] : Math.abs(ny - nx * (x < 160 ? 1 : -1)) < 0.12 && ny < 0.1 ? P.cobre[0] : P.aco[4]; });
  for (let x = 0; x < 320; x++) { const y = 4 + Math.round(Math.sin(x / 26) * 3 + Math.sin(x / 9) * 1); cenario.p(x, y, P.aco[0]); cenario.p(x, y + 1, P.cobre[1]); }
  // circuitos no piso: trilhas, nós e duas pontes elétricas
  const trilha = (pts: [number, number][], ligado: boolean) => { for (let i = 0; i + 1 < pts.length; i++) { chao.linha(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ligado ? P.raio[1] : P.cobre[1], 2); } for (const [x, y] of pts) { chao.ret(x - 2, y - 1, 5, 4, P.aco[0]); chao.ret(x - 1, y, 3, 2, ligado ? P.raio[2] : P.cobre[2]); } };
  trilha([[0, 100], [50, 100], [50, 84], [150, 84], [150, 110], [186, 110]], true); trilha([[319, 130], [280, 130], [280, 160], [170, 160], [170, 176]], false); trilha([[20, 179], [20, 162], [120, 162]], true);
  for (const [x, y, w] of [[130, 120, 60], [222, 170, 50]]) { for (let i = 0; i < w; i += 4) chao.vl(x + i, y, y + 5, P.aco[3]); chao.hl(x, x + w, y, P.raio[1]); chao.hl(x, x + w, y + 5, P.raio[0]); }
  for (const x of [8, 300]) { caixa(chao, x, 104, 12, 30, [P.aco[0], P.aco[1], P.aco[2], P.aco[4]]); chao.ret(x + 2, 108, 8, 5, P.vidro[1]); chao.ret(x + 3, 118, 2, 8, P.cobre[2]); chao.ret(x + 7, 122, 2, 4, P.raio[1]); chao.hl(x, x + 11, 100, P.perigo[1]); }
}, [
  { id: 'arcos', x: 40, y: 0, w: 240, h: 70, sobre: 'cenario', fps: 8, pintar(t, q, c) { const R = c.P.raio; for (const [x0, x1, y] of [[60, 104, 24], [216, 260, 24]] as const) if (q % 2 === (x0 === 60 ? 0 : 1)) { let x: number = x0, yy: number = y; while (x < x1) { const nx = x + 4, ny = y + (((x * 7 + q * 13) % 9) - 4) + (x > (x0 + x1) / 2 ? 6 : 0) * ((x - x0) / (x1 - x0)); t.linha(x, yy, nx, ny, x % 3 ? R[1] : R[3]); x = nx; yy = ny; } } for (const x of [60, 260]) { t.p(x - 3, 23, q % 2 ? R[3] : R[1]); t.p(x + 5 - q, 20 + q, R[2]); } t.elipse(160, 30, 4 + (q % 2), 4 + (q % 2), R[q % 2 ? 2 : 3]); } },
  { id: 'circuito', x: 0, y: 80, w: 320, h: 100, sobre: 'chao', fps: 6, pintar(t, q, c) { const pts: [number, number][] = [[0, 100], [50, 100], [50, 84], [150, 84], [150, 110], [186, 110]]; let acc = 0; for (let i = 0; i + 1 < pts.length; i++) { const n = Math.abs(pts[i + 1][0] - pts[i][0]) + Math.abs(pts[i + 1][1] - pts[i][1]); for (let k = 0; k < n; k++) { if ((acc + k - q * 4 + 400) % 16 < 4) t.ret(pts[i][0] + ((pts[i + 1][0] - pts[i][0]) * k) / n, pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * k) / n, 2, 2, c.P.raio[3]); } acc += n; } for (const [x, y, w] of [[130, 120, 60], [222, 170, 50]]) t.hl(x + ((q * 15) % w), x + ((q * 15) % w) + 6, y, c.P.raio[3]); } },
]);

/* ---------- 8 · Assombro — sobrado de Dona Benta Sombra ---------- */
const g08 = gin(8, 'Ginásio do Assombro', { rampas: { parede: ['#140c24', '#201838', '#30284c', '#443c64'], madeira: ['#180c20', '#2c1830', '#48283c', '#683c48', '#8c5858'], luz: ['#c85c14', '#fca82c', '#ffe47c', '#fffcd8'], halo: ['#4c3058', '#74486c'], teia: ['#5c5880', '#8c8cb0', '#c4c4dc'], lua: ['#34407c', '#6478b4', '#b4c8e8', '#f0f8ff'], quadro: ['#3c1c34', '#6c2c44', '#a4485c'] }, emissivas: ['luz'] }, 'madeira', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.campo(0, 0, 319, 64, (x, y) => { const lis = x % 16; const d = ((x % 16) - 8) ** 2 + (((y + (Math.floor(x / 16) % 2) * 8) % 16) - 8) ** 2; return lis === 0 ? P.parede[0] : d < 5 ? P.parede[2] : d < 9 && d > 6 ? P.parede[0] : P.parede[1]; });
  salao({ c, rodape: [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[3]], piso: [P.madeira[1], P.madeira[2], P.madeira[0], 'tabuas'], anel: [P.halo[1], null, P.luz[1]], tam: 18 });
  // janela com lua, retratos tortos, relógio parado e teias
  janela(cenario, 140, 6, 40, 48, [P.madeira[0], P.madeira[2], P.madeira[3], P.madeira[4]], [P.lua[0], P.lua[0], P.lua[1], P.lua[2]], true); cenario.elipse(166, 22, 6, 6, P.lua[3]); cenario.elipse(168, 20, 5, 5, P.lua[1]);
  for (const [x, y, w, hh, inc] of [[40, 16, 22, 28, 2], [86, 22, 16, 20, -1], [220, 20, 18, 24, 1], [264, 14, 24, 30, -2]]) { for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) { const b = i < 2 || j < 2 || i >= w - 2 || j >= hh - 2; cenario.p(x + i + Math.round((j / hh) * inc), y + j, b ? (i < 1 || j < 1 ? P.madeira[4] : P.madeira[3]) : (i - w / 2) ** 2 / 14 + (j - hh * 0.42) ** 2 / 26 < 1 ? P.quadro[2] : j > hh * 0.6 && Math.abs(i - w / 2) < w * 0.32 ? P.quadro[1] : P.quadro[0]); } cenario.p(x + w / 2 - 2, y + hh * 0.4, P.luz[2]); cenario.p(x + w / 2 + 2, y + hh * 0.4, P.luz[2]); }
  for (const [cx, a0, a1] of [[0, 0, Math.PI / 2], [320, Math.PI / 2, Math.PI]] as const) { const n = 6; for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; cenario.linha(cx, 0, cx + Math.cos(a) * 34, Math.sin(a) * 34, P.teia[0]); } for (let r = 10; r <= 34; r += 8) for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / n, b = a0 + ((a1 - a0) * (i + 1)) / n; cenario.linha(cx + Math.cos(a) * r, Math.sin(a) * r, cx + Math.cos(b) * r, Math.sin(b) * r, P.teia[1]); } }
  for (const x of [20, 120, 200, 300]) lamparina(cenario, x, 46, [P.madeira[0], P.madeira[2], P.madeira[4], P.madeira[4]], P.luz, P.halo[0]);
  // escuridão: só os círculos das lamparinas mostram o piso verdadeiro
  chao.campo(0, 69, 319, 179, (x, y) => { const luzes: [number, number, number][] = [[84, 138, 64], [232, 86, 50], [20, 100, 22], [300, 140, 26], [160, 172, 24]]; let m = 9; for (const [lx, ly, lr] of luzes) m = Math.min(m, Math.hypot(x - lx, (y - ly) * 2.4) / lr); if (m < 1) return VAZIO; const cc = chao.g(x, y); return m < 1.25 ? ((x + y) % 2 ? P.madeira[0] : cc) : m < 1.5 && (x + y) % 2 ? cc === P.madeira[2] ? P.madeira[1] : P.madeira[0] : P.madeira[0]; });
  for (const [x, y] of [[20, 100], [300, 140], [160, 172]]) { chao.ret(x - 1, y - 10, 3, 10, P.madeira[3]); lamparina(chao, x, y - 14, [P.madeira[0], P.madeira[3], P.madeira[4], P.madeira[4]], P.luz); chao.hl(x - 3, x + 3, y, P.madeira[4]); }
  // cadeira de balanço e baú
  caixa(chao, 268, 96, 26, 14, [P.madeira[0], P.madeira[1], P.madeira[3], P.madeira[4]]); chao.hl(268, 293, 101, P.madeira[0]); chao.ret(279, 100, 4, 4, P.luz[1]);
  chao.carimbo(40, 156, ['a.......', 'a.......', 'a.......', 'abbbbbb.', 'a.....b.', 'a.....b.', 'cccccccc'], { a: P.madeira[4], b: P.madeira[3], c: P.madeira[2] });
}, [
  { id: 'lamparinas', x: 10, y: 36, w: 300, h: 130, sobre: 'chao', fps: 6, pintar(t, q, c) { const L = c.P.luz; for (const [x, y] of [[20, 46], [120, 46], [200, 46], [300, 46], [20, 86], [300, 126], [160, 158]]) { t.p(x, y - 1 - (q % 2), L[3]); t.p(x + (q === 1 ? 1 : q === 3 ? -1 : 0), y - 2 - (q % 2), L[2]); t.p(x, y, L[q % 2 ? 2 : 3]); } } },
  animPisca('olhos', 30, 20, 260, 30, 5, 13, (c) => [c.P.luz[2], c.P.luz[3]], { fps: 2, sobre: 'cenario' }),
]);

/* ---------- 9 · Pedra — mina do Garimpeiro Topázio ---------- */
const g09 = gin(9, 'Ginásio da Pedra', { rampas: { rocha: ['#2c1428', '#4c2430', '#74383c', '#9c5848', '#c48860'], madeira: ['#2c1c28', '#503430', '#7c5438', '#a88050'], chao: ['#3c2430', '#5c3c3c', '#84584c', '#a87c60', '#cca880'], ferro: ['#242838', '#48546c', '#7c8c9c', '#b8c8c8'], cristal: ['#1c6c9c', '#34b4d4', '#8cecf0', '#f0ffff'], topazio: ['#a85c14', '#f0a02c', '#fcdc6c', '#fffcd0'], luz: ['#fca82c', '#ffe47c', '#fffcd8'] }, emissivas: ['luz'] }, 'chao', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.ret(0, 0, 320, 70, P.rocha[1]);
  fundo.campo(0, 0, 319, 66, (x, y) => { const n = fbm(x + Math.sin(y / 6) * 3, y * 1.5, 22, 3); return (y + Math.round(fbm(x, 0, 30, 2) * 8)) % 13 === 0 ? P.rocha[0] : n > 0.6 ? P.rocha[2] : n < 0.36 ? P.rocha[0] : VAZIO; });
  // boca do túnel com escoramento
  fundo.elipse(160, 50, 30, 30, (_x, _y, nx, ny) => (nx * nx + ny * ny > 0.7 ? P.rocha[0] : 0x100818));
  salao({ c, rodape: [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[3]], piso: [P.chao[2], P.chao[3], P.chao[1], 'liso'], anel: [P.ferro[1], P.chao[4], P.ferro[3]] });
  chao.campo(0, 69, 319, 179, (x, y) => { if (chao.g(x, y) !== P.chao[2]) return VAZIO; const n = fbm(x, y * 2.6, 22, 4); return n > 0.62 ? P.chao[3] : n < 0.26 ? P.chao[1] : VAZIO; });
  for (const x of [124, 190]) coluna(cenario, x, 18, 68, 7, P.madeira); caixa(cenario, 116, 12, 90, 8, P.madeira);
  for (const x of [20, 76, 240, 296]) { coluna(cenario, x, 0, 68, 6, P.madeira); cenario.linha(x + 6, 12, x + 18, 0, P.madeira[2], 2); }
  for (const x of [50, 268]) lamparina(cenario, x, 24, [P.ferro[0], P.ferro[1], P.ferro[2], P.ferro[3]], P.luz, P.rocha[2]);
  const cr = (t: Tela, x: number, y: number, a: number, r: Rampa, i: number) => { for (let j = 0; j <= a; j++) { const k = j / a, w = k < 0.3 ? k * 3.3 * a * 0.2 : a * 0.2, cx = x + i * (1 - k) * a * 0.5; for (let px = Math.round(cx - w); px <= cx + w; px++) { const u = (px - (cx - w)) / (2 * w + 0.01); t.p(px, y - a + j, u < 0.35 ? r[3] : u < 0.6 ? r[2] : r[1]); } } };
  cr(cenario, 100, 66, 14, P.cristal, -0.3); cr(cenario, 106, 66, 9, P.cristal, 0.3); cr(cenario, 222, 66, 12, P.topazio, 0.3); cr(cenario, 40, 30, 8, P.topazio, 0.4); cr(cenario, 284, 50, 9, P.cristal, -0.4);
  // trilhos com desvios, alavanca e vagonete
  trilhos(chao, [[160, 70], [160, 100], [120, 126], [60, 150], [0, 160]], P.ferro, P.madeira);
  trilhos(chao, [[160, 100], [200, 120], [260, 132], [319, 136]], P.ferro, P.madeira);
  trilhos(chao, [[200, 120], [190, 150], [150, 179]], P.ferro, P.madeira);
  chao.ret(176, 100, 3, 3, P.ferro[0]); chao.linha(177, 100, 183, 90, P.ferro[3], 2); chao.elipse(184, 89, 2, 2, P.topazio[1]);
  vagonete(chao, 274, 134, P.ferro, P.topazio);
  cr(chao, 20, 132, 30, P.cristal, 0.25); cr(chao, 32, 136, 18, P.cristal, -0.3); cr(chao, 300, 174, 26, P.topazio, -0.2);
  pedra(chao, 60, 174, 16, 8, [P.rocha[0], P.chao[1], P.chao[2], P.chao[4]], 3); pedra(chao, 240, 92, 10, 5, [P.rocha[0], P.chao[1], P.chao[2], P.chao[4]], 5);
  chao.linha(96, 176, 108, 160, P.madeira[3], 2); chao.carimbo(104, 156, ['.aaaa.', 'a....a'], { a: P.ferro[3] });
}, [
  animPisca('cristais', 10, 20, 300, 150, 12, 5, (c) => [c.P.cristal[2], c.P.cristal[3]], { cruz: true, fps: 3 }),
  { id: 'lampioes', x: 40, y: 14, w: 240, h: 16, sobre: 'cenario', fps: 6, pintar(t, q, c) { for (const x of [50, 268]) { t.p(x, 23 - (q % 2), c.P.luz[2]); t.p(x + (q === 1 ? 1 : q === 3 ? -1 : 0), 22 - (q % 2), c.P.luz[1]); } } },
]);

/* ---------- 10 · Brasa — forja e São João do Arraial Brasa ---------- */
const g10 = gin(10, 'Ginásio da Brasa', { rampas: { tijolo: ['#30141c', '#582428', '#883c30', '#b85c3c'], piso: ['#4c1c20', '#7c3428', '#a85434', '#cc7c48', '#eca868'], ferro: ['#1c1c2c', '#3c4050', '#6c7480', '#a8b0b0'], fogo: ['#b8241c', '#f0641c', '#fcb42c', '#fff48c'], lenha: ['#2c1420', '#54282c', '#84483c', '#b07850'], band: ['#2c84c4', '#f4d43c', '#3cac5c', '#f0f0e8'] }, emissivas: ['fogo'] }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  parede(fundo, 0, 0, 320, 64, P.tijolo, 14, 7, 5);
  salao({ c, rodape: [P.ferro[0], P.ferro[1], P.ferro[2], P.ferro[3]], piso: [P.piso[2], P.piso[3], P.piso[1], 'lajes'], anel: [P.ferro[1], null, P.fogo[2]], tam: 26 });
  // fornalha, chaminé, bigorna e ferramentas
  caixa(cenario, 124, 14, 72, 52, [P.ferro[0], P.ferro[1], P.ferro[2], P.ferro[3]]); cenario.ret(140, 0, 40, 14, P.ferro[1]); cenario.vl(140, 0, 13, P.ferro[3]);
  cenario.elipse(160, 50, 24, 20, (px, py, nx, ny) => { if (py > 62) return VAZIO; const d = nx * nx + ny * ny; return d > 0.8 ? P.tijolo[0] : d > 0.5 ? P.fogo[0] : d > 0.22 ? P.fogo[1] : P.fogo[2]; }); cenario.ret(134, 62, 53, 4, P.ferro[0]);
  for (let i = 0; i < 5; i++) { const x = 30 + i * 13; cenario.vl(x, 20, 40 + (i % 2) * 6, P.ferro[2]); cenario.ret(x - 2, 18, 5, 3, P.lenha[2]); if (i % 2) cenario.ret(x - 2, 40, 5, 6, P.ferro[3]); else cenario.elipse(x, 44, 3, 3, P.ferro[1]); }
  cenario.carimbo(226, 50, ['aaaaaaaaaaaaaa..', '.bbbbbbbbbbbbbba', '..bbbbbbbbbbbb..', '....cccccc......', '....cccccc......', '...cccccccc.....', '..dddddddddd....'], { a: P.ferro[3], b: P.ferro[2], c: P.ferro[1], d: P.ferro[0] });
  bandeirinhas(cenario, 0, 4, 124, 6, 8, P.band, P.ferro[0]); bandeirinhas(cenario, 196, 6, 319, 4, 8, P.band, P.ferro[0]);
  // seis fogueiras de São João em arco (acender na sequência musical); 2 já acesas
  const fgs: [number, number][] = [[24, 112], [70, 92], [130, 82], [196, 112], [280, 122], [300, 164]];
  fgs.forEach(([x, y], i) => { chao.elipse(x, y + 2, 13, 4, P.piso[0]); fogueira(chao, x, y, P.lenha); chao.ret(x - 3, y + 6, 7, 5, P.ferro[1]); chao.ret(x - 2, y + 7, 5, 3, i === 0 || i === 3 ? P.fogo[2] : P.ferro[0]); });
  // sanfona e balão junino
  chao.carimbo(140, 164, ['abcbcbcbcba', 'abcbcbcbcba', 'abcbcbcbcba', 'abcbcbcbcba', 'abcbcbcbcba'], { a: P.tijolo[2], b: P.band[3], c: P.ferro[0] });
  for (let j = 0; j < 16; j++) { const w = Math.round(Math.sin((j / 17) * Math.PI) * 7 + 1); for (let i = -w; i <= w; i++) cenario.p(290 + i, 22 + j, (Math.floor((i + 8) / 3) + Math.floor(j / 4)) % 2 ? P.band[1] : P.fogo[1]); } cenario.ret(288, 38, 5, 2, P.fogo[3]);
}, [
  fogo('fogueiras', [[24, 110, 18], [196, 110, 18]], 'fogo', 0, 80, 230, 34),
  { id: 'fornalha', x: 136, y: 30, w: 48, h: 34, sobre: 'cenario', fps: 7, pintar(t, q, c) { chama(t, q, 160, 61, 22, c.P.fogo, 3); chama(t, q + 1, 150, 61, 12, c.P.fogo, 5); chama(t, q + 2, 171, 61, 13, c.P.fogo, 7); } },
  animQueda('fagulhas', 0, 10, 320, 150, 12, 3, (c) => [c.P.fogo[2], c.P.fogo[3]], { forma: 'ponto', passo: -3, vx: 1, fps: 6 }),
]);

/* ---------- 11 · Ginga — academia do Mestre Gingado ---------- */
const g11 = gin(11, 'Ginásio da Ginga', { rampas: { parede: ['#b08440', '#e4c078', '#f8e4a8', '#fff8d8'], verde: ['#145c3c', '#249c50', '#5cd06c'], amarelo: ['#b8841c', '#f4c82c', '#fcf07c'], madeira: ['#3c2030', '#6c3c34', '#a06440', '#cc9458', '#ecc480'], couro: ['#8c6c4c', '#d4b888', '#f8ecc8', '#ffffff'], cabaca: ['#6c3414', '#b46c24', '#e4a444', '#fcdc8c'], faixa: ['#1c3c94', '#e44434', '#f0f0e8'] } }, 'madeira', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.ret(0, 0, 320, 64, P.parede[2]); fundo.ret(0, 40, 320, 24, P.parede[1]);
  for (let x = 0; x < 320; x++) { const u = Math.floor((x + 400) / 10) % 2; fundo.vl(x, 36, 39, u ? P.verde[1] : P.amarelo[1]); fundo.p(x, 40, P.parede[0]); }
  // mural: sol e ondas
  fundo.elipse(160, 22, 13, 13, P.amarelo[1]); fundo.elipse(160, 22, 9, 9, P.amarelo[2]); for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; fundo.linha(160 + Math.cos(a) * 16, 22 + Math.sin(a) * 16, 160 + Math.cos(a) * 21, 22 + Math.sin(a) * 21, P.amarelo[1], 2); }
  salao({ c, rodape: [P.madeira[0], P.madeira[1], P.madeira[2], P.madeira[4]], piso: [P.madeira[3], P.madeira[4], P.madeira[2], 'tabuas'], anel: [P.verde[1], null, P.amarelo[1]], tam: 16 });
  // a roda pintada no assoalho: grande círculo verde-amarelo
  chao.campo(0, 74, 319, 179, (x, y) => { const d = ((x - 160) / 150) ** 2 + ((y - 124) / 50) ** 2; return d > 0.93 && d < 1 ? (Math.floor((Math.atan2((y - 124) * 3, x - 160) + 4) * 6) % 2 ? P.verde[1] : P.amarelo[1]) : VAZIO; });
  // berimbaus na parede, atabaques, pandeiros e bancos
  for (const x of [34, 56, 78, 236, 258, 280]) berimbau(cenario, x, 6, P.madeira, P.cabaca);
  for (const [x, y] of [[110, 20], [210, 20]]) { cenario.elipse(x, y, 8, 8, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.68 ? ((Math.floor(Math.atan2(ny, nx) * 3 + 10)) % 2 ? P.madeira[2] : P.amarelo[2]) : nx + ny < -0.3 ? P.couro[3] : P.couro[2]; }); }
  atabaque(cenario, 112, 44, P.madeira, P.couro, P.faixa[1]); atabaque(cenario, 128, 46, P.madeira, P.couro, P.verde[1]); atabaque(cenario, 196, 46, P.madeira, P.couro, P.amarelo[1]); atabaque(cenario, 212, 44, P.madeira, P.couro, P.faixa[0]);
  bandeirinhas(cenario, 0, 2, 320, 2, 5, [P.verde[1], P.amarelo[1], P.faixa[0], P.faixa[2]], P.madeira[0]);
  for (const [x, y] of [[0, 96], [286, 104]]) { caixa(chao, x, y, 34, 5, P.madeira); chao.ret(x + 3, y + 5, 3, 7, P.madeira[1]); chao.ret(x + 28, y + 5, 3, 7, P.madeira[1]); }
  berimbau(chao, 300, 68, P.madeira, P.cabaca); atabaque(chao, 14, 74, P.madeira, P.couro, P.faixa[1]);
  // cordões (graduações) pendurados e marcas de ritmo no chão
  for (let i = 0; i < 5; i++) { const cor = [P.verde[1], P.amarelo[1], P.faixa[0], P.faixa[1], P.faixa[2]][i]; chao.linha(20 + i * 6, 160, 22 + i * 6, 176, cor, 2); }
  for (let i = 0; i < 4; i++) { const a = Math.PI * (0.15 + i * 0.23); chao.elipse(160 + Math.cos(a) * 60, 124 + Math.sin(a) * 20, 4, 2, i % 2 ? P.verde[2] : P.amarelo[2]); }
}, [
  { id: 'ritmo', x: 90, y: 100, w: 140, h: 50, sobre: 'chao', fps: 4, pintar(t, q, c) { const a = Math.PI * (0.15 + q * 0.23), x = 160 + Math.cos(a) * 60, y = 124 + Math.sin(a) * 20; t.elipse(x, y, 6, 3, (px, py, nx, ny) => (nx * nx + ny * ny > 0.5 ? 0xffffff : c.P.amarelo[2])); } },
  { id: 'notas', x: 100, y: 2, w: 120, h: 44, sobre: 'cenario', fps: 4, pintar(t, q, c) { for (const [x, y, k] of [[120, 36, 0], [204, 38, 2], [144, 30, 1], [182, 32, 3]]) { const py = y - ((q + k) % 4) * 4, px = x + (((q + k) % 4) % 2); t.carimbo(px, py, ['.aa', '.a.', '.a.', 'aa.', 'aa.'], { a: (q + k) % 4 === 3 ? c.P.parede[0] : c.P.faixa[0] }); } } },
]);

/* ---------- 12 · Ferro — fábrica da Engenheira Bigorna ---------- */
const g12 = gin(12, 'Ginásio do Ferro', { rampas: { aco: ['#1c2030', '#383f54', '#606c80', '#98a4ac', '#d0d8d4'], ferrugem: ['#4c1c1c', '#843424', '#bc6030', '#e8a058'], piso: ['#282c3c', '#444c5c', '#64707c', '#8c9898'], seta: ['#c88c14', '#fcd834', '#fff8a0'], latao: ['#6c4c1c', '#b88c2c', '#ecc85c', '#fff8b8'], perigo: ['#201c28', '#e8b82c'] } }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.campo(0, 0, 319, 64, (x, y) => { const cx = x % 32, cy = y % 22; return cx === 0 || cy === 0 ? P.aco[0] : cx === 1 || cy === 1 ? P.aco[2] : (cx === 4 || cx === 28) && (cy === 4 || cy === 18) ? P.aco[4] : fbm(x, y, 12, 3) > 0.66 ? P.ferrugem[0] : P.aco[1]; });
  salao({ c, rodape: [P.perigo[0], P.perigo[0], P.perigo[1], P.perigo[1]], piso: [P.piso[1], P.piso[2], P.piso[0], 'lajes'], anel: [P.seta[0], null, P.seta[2]], tam: 30 });
  fundo.campo(0, 63, 319, 68, (x, y) => (Math.floor((x + y) / 5) % 2 ? P.perigo[1] : P.perigo[0]));
  // trem de engrenagens na parede, pistões e chaminés
  engrenagem(cenario, 70, 30, 22, P.aco, 0, 12); engrenagem(cenario, 108, 44, 12, P.latao, 0.26, 8); engrenagem(cenario, 132, 26, 14, P.ferrugem, 0.1, 9);
  engrenagem(cenario, 232, 34, 24, P.latao, 0.2, 13); engrenagem(cenario, 272, 52, 11, P.aco, 0.3, 8); engrenagem(cenario, 196, 50, 10, P.ferrugem, 0, 7);
  for (const x of [8, 160, 300]) { caixa(cenario, x - 6, 0, 13, 38, [P.aco[0], P.aco[1], P.aco[2], P.aco[4]]); cenario.ret(x - 2, 38, 5, 16, P.aco[3]); cenario.vl(x + 2, 38, 53, P.aco[1]); caixa(cenario, x - 5, 54, 11, 8, [P.ferrugem[0], P.ferrugem[1], P.ferrugem[2], P.ferrugem[3]]); }
  // esteiras cruzando o salão, com setas de direção e alavancas
  esteira(chao, 0, 100, 150, [P.aco[0], P.aco[1], P.aco[2], P.aco[4]], P.seta[1]); esteira(chao, 196, 146, 124, [P.aco[0], P.aco[1], P.aco[2], P.aco[4]], P.seta[1]); esteira(chao, 120, 168, 80, [P.aco[0], P.aco[1], P.aco[2], P.aco[4]], P.seta[1]);
  for (const [x, y] of [[20, 96], [100, 96], [290, 142]]) caixa(chao, x, y - 9, 12, 9, [P.ferrugem[0], P.ferrugem[1], P.ferrugem[2], P.ferrugem[3]]);
  engrenagem(chao, 300, 104, 18, P.aco, 0.15, 11); engrenagem(chao, 12, 150, 20, P.ferrugem, 0.4, 11); engrenagem(chao, 36, 166, 10, P.latao, 0.1, 8);
  for (const [x, y] of [[160, 96], [250, 124]]) { chao.ret(x - 4, y, 9, 4, P.aco[0]); chao.linha(x, y, x + 5, y - 10, P.aco[4], 2); chao.elipse(x + 6, y - 11, 2, 2, P.ferrugem[2]); }
  // setas pintadas no piso
  for (const [x, y, e] of [[190, 100, 0], [100, 130, 1], [240, 170, 0]] as const) chao.carimbo(x, y, ['....a...', '....aa..', 'aaaaaaa.', 'aaaaaaaa', 'aaaaaaa.', '....aa..', '....a...'], { a: P.seta[1] }, !!e);
}, [
  { id: 'engrenagens', x: 40, y: 0, w: 270, h: 68, sobre: 'cenario', fps: 6, pintar(t, q, c) { const P = c.P, g = (q * Math.PI) / 24; engrenagem(t, 70, 30, 22, P.aco, g, 12); engrenagem(t, 108, 44, 12, P.latao, 0.26 - g * 1.5, 8); engrenagem(t, 132, 26, 14, P.ferrugem, 0.1 + g * 1.33, 9); engrenagem(t, 232, 34, 24, P.latao, 0.2 - g, 13); engrenagem(t, 272, 52, 11, P.aco, 0.3 + g * 1.6, 8); engrenagem(t, 196, 50, 10, P.ferrugem, g * 1.85, 7); } },
  { id: 'esteiras', x: 0, y: 100, w: 320, h: 80, sobre: 'chao', fps: 8, pintar(t, q, c) { const r = [c.P.aco[0], c.P.aco[1], c.P.aco[2], c.P.aco[4]]; esteira(t, 0, 100, 150, r, c.P.seta[1], q); esteira(t, 196, 146, 124, r, c.P.seta[1], q); esteira(t, 120, 168, 80, r, c.P.seta[1], q); for (const [x, y] of [[20, 96], [100, 96], [290, 142]]) caixa(t, x, y - 9, 12, 9, [c.P.ferrugem[0], c.P.ferrugem[1], c.P.ferrugem[2], c.P.ferrugem[3]]); } },
]);

/* ---------- 13 · Veneno — serpentário do Doutor Peçonha ---------- */
const g13 = gin(13, 'Ginásio do Veneno', { rampas: { parede: ['#241c3c', '#3c2c5c', '#5c4480', '#8468a4'], metal: ['#242c44', '#48546c', '#7c8c9c', '#b4c4c4'], vidro: ['#1c3c4c', '#2c6c6c', '#5cac94', '#c4f4d4'], veneno: ['#4c1c74', '#8430b0', '#c058dc', '#f0a8f8'], piso: ['#2c2c48', '#484c68', '#6c7488', '#98a4a8', '#c4d0c8'], folha: ['#144434', '#24744c', '#4cac5c', '#a4e47c'], antidoto: ['#c8d8dc', '#f4fcf8', '#fcf08c'] } }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  fundo.campo(0, 0, 319, 64, (x, y) => { const cx = x % 10, cy = (y + (Math.floor(x / 10) % 2) * 5) % 10; return cx === 0 || cy === 0 ? P.parede[0] : cy === 1 ? P.parede[2] : P.parede[1]; });
  salao({ c, rodape: [P.metal[0], P.metal[1], P.metal[2], P.metal[3]], piso: [P.piso[2], P.piso[3], P.piso[1], 'xadrez'], anel: [P.folha[1], P.piso[4], P.folha[3]], tam: 24 });
  // terrários, tanque de soro e tubulação de veneno
  for (const [x, y, w, hh] of [[14, 14, 40, 22], [14, 40, 40, 22], [266, 14, 40, 22], [266, 40, 40, 22]]) terrario(cenario, x, y, w, hh, P.metal, P.vidro, P.folha);
  for (const [x, y] of [[26, 30], [282, 56], [290, 30]]) cenario.carimbo(x, y, ['.aa....', 'a..aa.b', '....aab'], { a: P.antidoto[2], b: P.veneno[2] });
  for (const x of [84, 126, 168, 210]) { terrario(cenario, x, 10, 26, 54, P.metal, P.vidro, P.folha, P.veneno); cenario.ret(x + 8, 4, 10, 6, P.metal[1]); cenario.hl(x + 8, x + 17, 4, P.metal[3]); }
  for (let x = 62; x < 262; x++) { cenario.p(x, 2, P.metal[3]); cenario.p(x, 3, P.veneno[1]); cenario.p(x, 4, P.metal[0]); }
  // piso tóxico: poças roxas; plantas-antídoto de flor branca marcam o caminho seguro
  for (const [cx, cy, rx, ry, s] of [[160, 100, 36, 6, 3], [270, 146, 46, 12, 5], [28, 110, 24, 6, 7], [170, 168, 40, 8, 9], [300, 100, 18, 4, 11]]) chao.campo(cx - rx * 1.5, cy - ry * 1.6, cx + rx * 1.5, cy + ry * 1.6, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy - (fbm(x, y * 1.8, 10, s) - 0.5) * 0.8; return d > 1.1 ? VAZIO : d > 0.94 ? P.veneno[0] : h(Math.floor((x + y * 3) / 7), y, 3) > 0.84 ? P.veneno[3] : fbm(x, y * 2, 8, s + 2) > 0.55 ? P.veneno[2] : P.veneno[1]; });
  const anti = (x: number, y: number) => { capim(chao, x, y, 5, 7, P.folha, x); chao.carimbo(x - 2, y - 10, ['.a.a.', 'aabaa', '.a.a.'], { a: P.antidoto[1], b: P.antidoto[2] }); chao.hl(x - 3, x + 3, y + 1, P.piso[1]); };
  for (const [x, y] of [[120, 116], [190, 126], [226, 108], [130, 150], [60, 168], [226, 176], [300, 120]]) anti(x, y);
  for (const [x, y] of [[4, 132], [296, 160]]) { caixa(chao, x, y, 20, 18, P.metal); chao.ret(x + 2, y - 12, 6, 12, P.vidro[2]); chao.ret(x + 2, y - 6, 6, 6, P.veneno[2]); chao.ret(x + 11, y - 9, 6, 9, P.vidro[2]); chao.ret(x + 11, y - 4, 6, 4, P.folha[2]); chao.hl(x + 2, x + 7, y - 13, P.metal[3]); }
}, [
  { id: 'borbulhas', x: 0, y: 6, w: 320, h: 174, sobre: 'chao', fps: 4, pintar(t, q, c) { const V = [c.P.veneno[1], c.P.veneno[2], c.P.veneno[3], c.P.veneno[3]]; for (const x of [84, 126, 168, 210]) bolhas(t, q, x + 3, 36, 20, 26, 3, V, x); for (const [x, y, w, hh, s] of [[132, 96, 58, 10, 3], [232, 138, 78, 18, 5], [138, 163, 66, 12, 9]]) bolhas(t, q, x, y, w, hh, 4, V, s); } },
  animPisca('vapores', 10, 60, 300, 110, 10, 7, (c) => [c.P.veneno[2], c.P.veneno[3]], { fps: 3 }),
]);

/* ---------- 14 · Geada — galpão gelado da Gaúcha Pinhão ---------- */
const g14 = gin(14, 'Ginásio da Geada', { rampas: { tora: ['#2c1c30', '#50343c', '#7c5444', '#a47c5c'], gelo: ['#3c6cac', '#6ca4d4', '#a4d4ec', '#d8f0f8', '#ffffff'], neve: ['#88a8c8', '#c0d8e8', '#f0f8fc'], vidro: ['#2c4c84', '#5c84b4', '#a4c8dc', '#e4f4f8'], pinhao: ['#5c2418', '#984024', '#c87038', '#f0b060'], la: ['#8c2c3c', '#d84c4c', '#f4d4b4'], folha: ['#143c3c', '#246850', '#449460'] } }, 'gelo', (c) => {
  const { fundo, cenario, chao, P } = c;
  tabuado(fundo, 0, 0, 320, 64, P.tora, 9, 3, true);
  salao({ c, rodape: [P.gelo[0], P.gelo[1], P.gelo[2], P.gelo[4]], piso: [P.gelo[2], P.gelo[3], P.gelo[1], 'liso'], anel: [P.gelo[1], P.neve[2], P.gelo[4]] });
  // gelo espelhado: riscos de patins e reflexos verticais
  chao.campo(0, 69, 319, 179, (x, y) => { const cc = chao.g(x, y); if (cc !== P.gelo[2]) return VAZIO; const n = fbm(x * 0.5, y * 2.5, 20, 3); return n > 0.62 ? P.gelo[3] : n < 0.34 ? P.gelo[1] : VAZIO; });
  const sq = new Seq(6); for (let i = 0; i < 12; i++) { const x = sq.int(0, 280), y = sq.int(78, 176), l = sq.int(14, 40); chao.linha(x, y, x + l, y - sq.int(-3, 3), P.gelo[4]); }
  for (const x of [30, 250]) { janela(cenario, x, 12, 40, 40, [P.tora[0], P.tora[1], P.tora[2], P.tora[3]], P.vidro, false); for (let i = 0; i < 9; i++) cenario.p(x + 4 + ((i * 7) % 32), 16 + ((i * 11) % 30), P.neve[2]); cenario.ret(x - 1, 50, 42, 3, P.neve[2]); cenario.hl(x, x + 40, 53, P.neve[1]); }
  pingentes(cenario, 0, 44, [P.gelo[1], P.gelo[1], P.gelo[3], P.gelo[4]], 3, 14);
  cenario.ret(0, 0, 320, 3, P.neve[2]);
  // lareira apagada com guirlanda de pinhões, mantas e esquis
  caixa(cenario, 126, 20, 68, 46, [P.tora[0], P.gelo[0], P.gelo[1], P.gelo[3]]); cenario.ret(138, 34, 44, 32, P.tora[0]); cenario.ret(122, 16, 76, 5, P.gelo[2]); cenario.hl(122, 197, 16, P.neve[2]);
  for (let i = 0; i < 9; i++) cenario.carimbo(128 + i * 8, 22 + Math.round(Math.sin((i / 8) * Math.PI) * 4), ['ab', 'cb'], { a: P.pinhao[3], b: P.pinhao[1], c: P.pinhao[2] });
  for (let i = 0; i < 4; i++) cenario.linha(146 + i * 8, 62, 150 + i * 8, 52, P.gelo[3 - (i % 2)], 2);
  for (const x of [90, 216]) { cenario.linha(x, 10, x + 4, 60, P.la[1], 2); cenario.linha(x + 10, 10, x + 6, 60, P.la[1], 2); cenario.p(x, 9, P.la[2]); cenario.p(x + 10, 9, P.la[2]); }
  // blocos de gelo que param o deslize, montes de neve e pinheirinho
  const bloco = (x: number, y: number, w: number, hh: number) => { caixa(chao, x, y, w, hh, [P.gelo[0], P.gelo[1], P.gelo[2], P.gelo[4]]); chao.linha(x + 2, y + hh - 3, x + w - 4, y + 2, P.gelo[4]); chao.ret(x, y - 2, w, 2, P.neve[2]); chao.hl(x + 1, x + w + 1, y + hh, P.gelo[0]); };
  bloco(150, 94, 18, 12); bloco(256, 150, 24, 16); bloco(20, 100, 16, 12); bloco(190, 164, 16, 10);
  for (const [x, y, rx] of [[30, 172, 30], [300, 110, 22], [120, 76, 16]]) { chao.elipse(x, y, rx, rx * 0.3, (_x, _y, nx, ny) => (ny < -0.3 ? P.neve[2] : nx > 0.4 ? P.neve[0] : P.neve[1])); }
  for (let n = 0; n < 4; n++) for (let j = 0; j < 7; j++) { const w = Math.round((j + 1) * (0.7 + n * 0.25)); for (let i = -w; i <= w; i++) chao.p(300 + i, 70 + n * 6 + j, j === 6 ? P.folha[0] : i < -w / 3 ? P.neve[2] : i > w / 2 ? P.folha[0] : P.folha[1]); } chao.ret(299, 100, 3, 6, P.tora[1]);
}, [
  animPisca('cintilar', 0, 70, 320, 108, 14, 5, (c) => [c.P.gelo[4], 0xffffff], { cruz: true, fps: 4, sobre: 'chao' }),
  animQueda('neve', 0, 0, 320, 180, 22, 9, (c) => [c.P.neve[2], c.P.gelo[4]], { forma: 'floco', passo: 3, vx: -1, fps: 5 }),
]);

/* ---------- 15 · Mente — cúpula do observatório ---------- */
const g15 = gin(15, 'Ginásio da Mente', { rampas: { ceu: ['#0c0c2c', '#141848', '#202864', '#34408c'], estrela: ['#8c9cdc', '#fce48c', '#ffffff'], metal: ['#242448', '#44487c', '#7480b0', '#b4c0dc'], piso: ['#14143c', '#20245c', '#30387c', '#4c589c'], portal: ['#5c2c9c', '#a44cdc', '#e494fc', '#fce4ff'], ouro: ['#946414', '#d8a42c', '#fcd85c', '#fffcc0'], rosa: ['#34407c', '#d04c8c'] }, emissivas: ['estrela', 'portal'] }, 'piso', (c) => {
  const { fundo, cenario, chao, P } = c;
  // cúpula aberta: faixas de céu, nebulosa e constelações traçadas
  fundo.campo(0, 0, 319, 64, (x, y) => { const d = Math.hypot((x - 160) / 2.3, y - 70); return d < 40 ? P.ceu[3] : d < 54 ? P.ceu[2] : d < 66 ? P.ceu[1] : P.ceu[0]; });
  fundo.campo(0, 0, 319, 60, (x, y) => (fbm(x, y * 1.6, 26, 4) > 0.66 && fundo.g(x, y) !== P.ceu[3] ? P.rosa[0] : VAZIO));
  const sq = new Seq(15); for (let i = 0; i < 60; i++) fundo.p(sq.int(0, 319), sq.int(0, 60), sq.n() > 0.7 ? P.estrela[2] : P.estrela[0]);
  const consts: [number, number][][] = [[[30, 40], [44, 28], [60, 32], [70, 18], [58, 10]], [[110, 14], [126, 24], [142, 14], [134, 36], [118, 36], [110, 14]], [[190, 30], [204, 16], [222, 22], [236, 10]], [[262, 40], [276, 26], [292, 34], [304, 20], [276, 26]]];
  for (const k of consts) { for (let i = 0; i + 1 < k.length; i++) fundo.linha(k[i][0], k[i][1], k[i + 1][0], k[i + 1][1], P.ceu[3]); for (const [x, y] of k) { fundo.p(x, y, P.estrela[2]); fundo.p(x - 1, y, P.estrela[1]); fundo.p(x + 1, y, P.estrela[1]); fundo.p(x, y - 1, P.estrela[1]); fundo.p(x, y + 1, P.estrela[1]); } }
  salao({ c, rodape: [P.metal[0], P.metal[1], P.metal[2], P.metal[3]], piso: [P.piso[1], P.piso[2], P.piso[0], 'xadrez'], anel: [P.ouro[1], null, P.ouro[3]], tam: 26 });
  // nervuras da cúpula, telescópio e astrolábio
  for (const x of [0, 80, 240, 314]) { for (let y = 0; y < 66; y++) { const px = x + Math.round(((x < 160 ? 1 : -1) * (66 - y) ** 2) / 260); cenario.ret(px, y, 5, 1, P.metal[1]); cenario.p(px, y, P.metal[3]); cenario.p(px + 4, y, P.metal[0]); } }
  for (let k = 0; k <= 44; k++) { const x = 136 + k, y = 60 - k * 0.8; for (let j = -4 + Math.floor(k / 16); j <= 4 - Math.floor(k / 16); j++) cenario.p(x, y + j, j < -1 ? P.metal[3] : j > 2 ? P.metal[0] : k % 15 === 0 ? P.ouro[1] : P.metal[2]); } cenario.elipse(182, 24, 4, 6, P.ceu[3]);
  cenario.ret(144, 56, 4, 12, P.metal[1]); cenario.linha(146, 58, 136, 68, P.metal[2], 2); cenario.linha(146, 58, 158, 68, P.metal[0], 2);
  cenario.elipse(50, 50, 12, 12, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.74 ? P.ouro[1] : Math.abs(nx) < 0.09 || Math.abs(ny * 2 - nx) < 0.14 ? P.ouro[2] : VAZIO; }); cenario.ret(48, 62, 5, 5, P.metal[1]);
  // portais de constelação no piso, ligados em pares por cor
  const portal = (x: number, y: number, rx: number, r: Rampa, pts: [number, number][]) => { chao.elipse(x, y, rx, rx * 0.3, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.76 ? r[2] : d > 0.6 ? r[0] : (px + py) % 2 ? r[0] : P.piso[0]; }); for (const [dx, dy] of pts) chao.p(x + dx, y + dy, r[3]); for (let i = 0; i + 1 < pts.length; i++) chao.linha(x + pts[i][0], y + pts[i][1], x + pts[i + 1][0], y + pts[i + 1][1], r[1]); for (const [dx, dy] of pts) chao.p(x + dx, y + dy, r[3]); };
  portal(160, 104, 22, P.portal, [[-8, 1], [-2, -2], [4, 1], [9, -1]]); portal(284, 148, 28, P.portal, [[-10, 2], [-3, -3], [5, 2], [11, -2]]);
  portal(30, 100, 18, [P.ouro[0], P.ouro[1], P.ouro[2], P.ouro[3]], [[-6, 0], [0, -2], [6, 1]]); portal(170, 168, 28, [P.ouro[0], P.ouro[1], P.ouro[2], P.ouro[3]], [[-10, 0], [0, -3], [10, 2]]);
  for (const [x, y] of [[4, 150], [300, 96]]) { caixa(chao, x, y, 16, 14, [P.metal[0], P.metal[1], P.metal[2], P.metal[3]]); chao.elipse(x + 8, y - 6, 6, 6, (_x, _y, nx, ny) => (nx + ny < -0.4 ? P.estrela[2] : nx * nx + ny * ny > 0.6 ? P.ceu[2] : P.ceu[3])); chao.hl(x + 1, x + 14, y - 6, P.ouro[1]); }
}, [
  animPisca('estrelas', 0, 0, 320, 60, 18, 3, (c) => [c.P.estrela[1], c.P.estrela[2]], { cruz: true, fps: 3, sobre: 'fundo' }),
  { id: 'portais', x: 0, y: 84, w: 320, h: 96, sobre: 'chao', fps: 5, pintar(t, q, c) { for (const [x, y, rx, k] of [[160, 104, 22, 'portal'], [284, 148, 28, 'portal'], [30, 100, 18, 'ouro'], [170, 168, 28, 'ouro']] as const) { const r = c.P[k], f = 0.35 + q * 0.14; t.elipse(x, y, rx * f, rx * 0.3 * f, (_x, _y, nx, ny) => (nx * nx + ny * ny > 0.6 ? r[3] : VAZIO)); t.p(x - rx * 0.5 + q * 2, y - 3 - q * 3, r[3]); t.p(x + rx * 0.4 - q, y - 2 - q * 4, r[2]); } } },
]);

/* ---------- 16 · Lenda — templo de pedra da Aldeia Tupã ---------- */
const g16 = gin(16, 'Ginásio da Lenda', { rampas: { pedra: ['#242844', '#444c6c', '#6c7890', '#98a4ac', '#c8d0c4'], escama: ['#144c5c', '#1c7c7c', '#3cb49c', '#94e8c4'], ouro: ['#8c5414', '#d89424', '#fcd04c', '#fff8a8'], fogo: ['#b8241c', '#f0641c', '#fcb42c', '#fff48c'], aguaE: ['#1c4c9c', '#2c84d4', '#6cc4f0', '#d4f4fc'], terraE: ['#5c3418', '#98602c', '#cc944c', '#f0cc84'], ventoE: ['#5c8c9c', '#9cc8cc', '#d4ece4', '#ffffff'], musgo: ['#1c4438', '#2c7048', '#58a458'] }, emissivas: ['fogo', 'aguaE', 'ventoE'] }, 'pedra', (c) => {
  const { fundo, cenario, chao, P } = c;
  parede(fundo, 0, 0, 320, 64, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[3]], 22, 11, 7);
  // serpente-lendária em relevo de escamas atravessando a parede
  fundo.campo(0, 0, 319, 60, (x, y) => { const m = 30 + Math.sin(x / 26) * 14, d = Math.abs(y - m); if (d > 7) return VAZIO; if (d > 6) return P.pedra[0]; const fx = (x + (Math.floor((y - m + 8) / 4) & 1) * 4) % 8; return Math.abs(fx - 3.5) > 3 || (y - Math.round(m) + 80) % 4 === 0 ? P.escama[0] : y < m - 2 ? P.escama[3] : y > m + 2 ? P.escama[1] : P.escama[2]; });
  fundo.elipse(304, 26, 12, 10, (px, py, nx, ny) => (nx * nx + ny * ny > 0.75 ? P.pedra[0] : nx > 0.2 && Math.abs(ny + 0.2) < 0.25 ? P.ouro[3] : ny > 0.5 ? P.escama[1] : P.escama[2])); fundo.linha(314, 30, 319, 32, P.fogo[1]);
  salao({ c, rodape: [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], piso: [P.pedra[2], P.pedra[3], P.pedra[1], 'lajes'], anel: [P.ouro[1], null, P.ouro[3]], tam: 30 });
  // os quatro totens das provas elementais: fogo, água, terra e vento
  totem(cenario, 50, 68, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], P.fogo, ['..a...', '.aba..', '.abba.', 'abbbba', 'abbbba', '.aaaa.']);
  totem(cenario, 120, 68, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], P.aguaE, ['..a...', '..aa..', '.abaa.', 'abbaaa', 'abaaaa', '.aaaa.']);
  totem(cenario, 200, 68, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], P.terraE, ['......', '..bb..', '.abba.', '.aaaa.', 'aaaaaa', 'aaaaaa']);
  totem(cenario, 270, 68, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], P.ventoE, ['.aaa..', 'a...a.', '..bb.a', 'aaaaa.', '......', 'aaaa..']);
  // trilha das provas no piso: quatro lajes marcadas e faixa de escamas até o altar
  escamas(chao, 150, 69, 20, 12, P.escama);
  for (const [x, y, k] of [[40, 118, 'fogo'], [130, 100, 'aguaE'], [190, 150, 'terraE'], [290, 132, 'ventoE']] as const) { const r = c.P[k]; chao.elipse(x, y, 13, 4.5, (px, py, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.72 ? r[1] : d < 0.2 ? r[3] : (px + py) % 3 === 0 ? r[2] : P.pedra[1]; }); }
  for (const [x0, y0, x1, y1] of [[40, 118, 130, 100], [130, 100, 190, 150], [190, 150, 290, 132]]) for (let k = 2; k < 12; k++) { if (k % 2) continue; chao.ret(x0 + ((x1 - x0) * k) / 13, y0 + ((y1 - y0) * k) / 13, 3, 2, P.ouro[1]); }
  for (const [x, y, rx, ry, s] of [[20, 160, 26, 6, 1], [300, 170, 24, 6, 2], [250, 84, 16, 3, 3]]) { mancha(chao, x, y, rx, ry, P.musgo[0], s, 0.6, 8); mancha(chao, x - 1, y - 1, rx * 0.6, ry * 0.5, P.musgo[1], s + 6, 0.7, 6); }
  for (const x of [8, 300]) { chao.ret(x, 86, 12, 26, P.pedra[1]); chao.vl(x, 86, 111, P.pedra[4]); chao.ret(x - 3, 80, 18, 6, P.ouro[1]); chao.hl(x - 3, x + 14, 80, P.ouro[3]); chao.hl(x - 2, x + 13, 85, P.ouro[0]); chao.ret(x - 2, 112, 16, 3, P.pedra[0]); }
  pedra(chao, 100, 172, 12, 6, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[4]], 3);
}, [
  { id: 'chamas', x: 0, y: 0, w: 320, h: 82, sobre: 'chao', fps: 7, pintar(t, q, c) { chama(t, q, 50, 12, 10, c.P.fogo, 1); chama(t, q + 1, 120, 12, 10, c.P.aguaE, 2); chama(t, q + 2, 200, 12, 10, c.P.terraE, 3); chama(t, q + 3, 270, 12, 10, c.P.ventoE, 4); chama(t, q, 14, 79, 14, c.P.fogo, 5); chama(t, q + 2, 306, 79, 14, c.P.fogo, 6); } },
  animPisca('centelhas', 10, 70, 300, 100, 10, 9, (c) => [c.P.ouro[2], c.P.ouro[3]], { cruz: true, fps: 3 }),
]);

export const GINASIOS: ArenaDef[] = [g01, g02, g03, g04, g05, g06, g07, g08, g09, g10, g11, g12, g13, g14, g15, g16];
void galho; void brilhosAgua; void cogumelo; void fumaca; void fogo;
