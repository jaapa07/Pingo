import { APOIO, VAZIO, h, fbm, Seq, type ArenaDef, type Tela, type Rampa } from '../nucleo';
import { tronco, copa, faixaCopas, retorcida, coqueiro, mangue as arvMangue, mandacaru, bromelia, canteiroFlores, capim, pedra, mancha, serra, agua, brilhosAgua, terreno, samambaia, fronde } from '../pecas';
import { chaoNatural, ceuBioma, animQueda, animPisca, bolhas, yhOnda } from '../comum';

const CEU = { ceu: ['#3a86d6', '#5ca8e6', '#8fcdf0', '#c9ecf2'], nuvem: ['#9cc4e4', '#d6eaf6', '#ffffff'], astro: ['#ffe9a0', '#fff8d8'] };
const NOITE_CEU = { ceu: ['#0c1030', '#141a44', '#1e2a5c', '#324478'], nuvem: ['#232c5c', '#34407a', '#4c5c98'], astro: ['#cfd8f4', '#f4f8ff'] };

/** Jangada de paus com vela triangular. */
function jangada(t: Tela, x: number, y: number, mad: Rampa, vela: Rampa) {
  for (let i = 0; i < 30; i++) { t.p(x + i, y, mad[3]); t.p(x + i, y + 1, i % 5 === 0 ? mad[0] : mad[2]); t.p(x + i, y + 2, mad[1]); t.p(x + i + 1, y + 3, mad[0]); }
  t.vl(x + 12, y - 26, y, mad[1]);
  for (let j = 0; j < 22; j++) { const w = Math.round(j * 0.75); for (let i = 0; i <= w; i++) t.p(x + 13 + i, y - 25 + j, i === w ? vela[0] : i > w * 0.55 ? vela[1] : vela[2]); }
  t.ret(x + 20, y - 3, 5, 3, mad[1]); t.hl(x + 20, x + 24, y - 3, mad[3]);
}
function concha(t: Tela, x: number, y: number, r: Rampa) { t.carimbo(x, y, ['.ab.', 'abab', 'cccc'], { a: r[3], b: r[2], c: r[1] }); }
function estrelaMar(t: Tela, x: number, y: number, r: Rampa) { t.carimbo(x, y, ['..a..', 'aabaa', '.aba.', '.a.a.'], { a: r[2], b: r[3] }); }

export const restinga: ArenaDef = {
  id: 'restinga', nome: 'Campos de Restinga', sombra: 'areia',
  paleta: {
    rampas: { ...CEU, mar: ['#1b56a0', '#2a7ac2', '#58aadc', '#c4eaf2'], areia: ['#a67c50', '#c89f66', '#e2c283', '#f1dba0', '#fcf0c6'], folha: ['#1c4a3c', '#2f7a48', '#58a850', '#a2d260'], tronco: ['#3a2434', '#644038', '#906244', '#b88a58'], flor: ['#a02c50', '#e05478', '#f79aa8', '#ffd8d0'], caju: ['#a03a1c', '#e0702a', '#f6b03c', '#fff0a0'] },
    noite: NOITE_CEU,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(66, 3, 70, 12);
    ceuBioma(fundo, c, { ate: 52, nuvens: [[24, 24, 52], [140, 14, 70], [236, 32, 44]], astro: [276, 16, 7] });
    agua(fundo, 50, 60, P.mar, 3);
    serra(fundo, 66, 12, 80, [P.areia[0], P.areia[1], P.areia[2], P.areia[3]], 4, { ate: 72 });
    fundo.ret(0, 68, 320, 112, P.areia[2]);
    // moitas baixas e cajueiros retorcidos ao fundo
    const lf = [P.folha[0], P.folha[0], P.folha[1], P.folha[2]];
    [[20, 9], [70, 6], [118, 10], [200, 7], [250, 11], [305, 8]].forEach(([x, r], i) => copa(cenario, x, 64 - r * 0.2, r * 2.2, r * 0.8, lf, 20 + i, 5));
    retorcida(cenario, 160, 68, 26, P.tronco, P.folha, 3, 5);
    mandacaru(cenario, 96, 68, 14, P.folha, P.flor[3]); mandacaru(cenario, 226, 68, 11, P.folha);
    chaoNatural(chao, { yh, r: P.areia, s: 200, liso: true, aberto: true, textura: 'g', tufos: 26, capimR: [P.folha[0], P.folha[0], P.folha[1], P.folha[2], P.folha[3]] });
    // cajueiros maiores nas laterais
    retorcida(chao, 34, 96, 58, P.tronco, P.folha, 7, 7); retorcida(chao, 292, 104, 66, P.tronco, P.folha, 9, 8);
    for (const [x, y] of [[20, 44], [44, 52], [280, 46], [304, 56], [270, 60]]) { chao.ret(x, y, 2, 3, P.caju[2]); chao.p(x, y, P.caju[3]); chao.p(x, y + 3, P.tronco[1]); }
    // vegetação rasteira sobre a areia
    [[120, 80, 16, 4], [196, 104, 20, 5], [26, 150, 26, 7], [250, 160, 30, 7], [150, 172, 22, 5]].forEach(([x, y, rx, ry], i) => { mancha(chao, x, y, rx, ry, P.folha[1], 30 + i, 0.5, 8); mancha(chao, x - 1, y - 1, rx * 0.7, ry * 0.6, P.folha[2], 40 + i, 0.6, 6); canteiroFlores(chao, x, y, rx * 0.7, ry * 0.6, 4, P.flor, P.caju[3], 50 + i); });
    bromelia(chao, 132, 78, 7, P.folha, P.flor); bromelia(chao, 300, 132, 10, P.folha, P.caju); bromelia(chao, 12, 124, 9, P.folha, P.flor);
    pedra(chao, 268, 112, 9, 5, [P.tronco[0], P.areia[0], P.areia[1], P.areia[3]], 4);
    mandacaru(chao, 306, 176, 30, P.folha, P.flor[3]);
    capim(chao, 60, 178, 8, 12, P.folha, 3); capim(chao, 200, 179, 7, 10, P.folha, 5);
  },
  anims: [
    { id: 'mar', x: 0, y: 51, w: 320, h: 9, sobre: 'fundo', fps: 4, pintar(t, q, c) { brilhosAgua(t, q, 0, 51, 320, 9, c.P.mar, 5, 0.12); } },
    animPisca('vagalumes', 10, 60, 300, 100, 9, 21, () => [0xc8e85a, 0xf6ffb0], { so: 'noite' }),
    animQueda('areia-vento', 0, 70, 320, 100, 8, 4, (c) => [c.P.areia[4]], { vx: 4, passo: 1, forma: 'ponto', fps: 6 }),
  ],
};

export const praia: ArenaDef = {
  id: 'praia', nome: 'Praia das Tartarugas', sombra: 'areia',
  paleta: {
    rampas: { ...CEU, mar: ['#1668a8', '#1f8cc4', '#4cb8d8', '#c8f2f0'], areia: ['#b89060', '#d6b278', '#ecd294', '#f8e8b4', '#fff8d8'], folha: ['#14483c', '#22784a', '#44a850', '#96d45c'], tronco: ['#3c2a38', '#6a4a3c', '#98704c', '#c49c64'], vela: ['#b05a3c', '#e8d8b4', '#fff8e4'], coral: ['#a03048', '#e85c64', '#f9a08c', '#ffe0c8'] },
    noite: NOITE_CEU,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c;
    const yh = (x: number) => 70 + Math.round(Math.sin(x / 50 + 1) * 2 + (x / 320) * 3);
    ceuBioma(fundo, c, { ate: 40, nuvens: [[10, 18, 60], [120, 26, 48], [214, 12, 76]], astro: [60, 14, 8] });
    agua(fundo, 40, 76, P.mar, 8);
    // ilha distante com farolzinho
    serra(fundo, 42, 9, 40, [P.folha[0], P.folha[0], P.folha[1], P.folha[2]], 6, { perfil: (x) => 42 - Math.max(0, 9 - ((x - 236) / 9) ** 2) - Math.max(0, 5 - ((x - 262) / 7) ** 2), ate: 42 });
    fundo.ret(234, 26, 3, 8, P.nuvem[2]); fundo.p(235, 25, P.coral[1]); fundo.hl(234, 236, 29, P.coral[1]);
    fundo.ret(0, 76, 320, 104, P.areia[2]);
    // arrebentação: espuma junto da areia
    cenario.campo(0, 60, 319, 78, (x, y) => { const b = yh(x) - 2 + Math.round(Math.sin(x / 11) * 1.5); return y >= b - 1 && y <= b + 3 ? (y === b - 1 || (x + y) % 5 === 0 ? P.mar[2] : P.mar[3]) : VAZIO; });
    chaoNatural(chao, { yh, r: P.areia, s: 300, liso: true, aberto: true, textura: 'g', tufos: 0 });
    // areia molhada junto à água
    chao.campo(0, 66, 319, 80, (x, y) => (chao.g(x, y) !== VAZIO && y - yh(x) < 3 + fbm(x, 0, 16, 4) * 3 ? P.areia[0] : VAZIO));
    jangada(chao, 118, 82, P.tronco, P.vela);
    coqueiro(chao, 30, 112, 86, 22, P.tronco, P.folha, 3, P.tronco); coqueiro(chao, 58, 92, 60, -10, P.tronco, P.folha, 5, P.tronco);
    coqueiro(chao, 298, 118, 94, -26, P.tronco, P.folha, 7, P.tronco);
    mancha(chao, 34, 114, 18, 3, P.areia[1], 9, 0.3, 6); mancha(chao, 298, 120, 18, 3, P.areia[1], 10, 0.3, 6);
    concha(chao, 150, 122, P.coral); concha(chao, 252, 142, P.vela); concha(chao, 24, 160, P.coral); estrelaMar(chao, 198, 100, P.coral); estrelaMar(chao, 132, 166, P.coral);
    pedra(chao, 286, 150, 12, 6, [P.tronco[0], P.tronco[1], P.areia[0], P.areia[2]], 2); pedra(chao, 300, 158, 7, 4, [P.tronco[0], P.tronco[1], P.areia[0], P.areia[2]], 6);
    // pegadas de tartaruga rumo ao mar
    for (let i = 0; i < 9; i++) { chao.p(206 + i * 5, 128 - i * 5, P.areia[1]); chao.p(210 + i * 5, 129 - i * 5, P.areia[1]); }
    capim(chao, 8, 178, 8, 13, P.folha, 3); capim(chao, 312, 179, 8, 11, P.folha, 5); capim(chao, 70, 120, 5, 6, P.folha, 7);
  },
  anims: [
    { id: 'ondas', x: 0, y: 40, w: 320, h: 40, sobre: 'cenario', fps: 4, pintar(t, q, c) {
      brilhosAgua(t, q, 0, 42, 320, 24, c.P.mar, 9, 0.1);
      const d = [0, 1, 2, 1][q];
      for (let x = 0; x < 320; x++) { const b = 70 + Math.round(Math.sin(x / 50 + 1) * 2 + (x / 320) * 3) + Math.round(Math.sin(x / 11) * 1.5) + d; if ((x + q * 3) % 7 < 5) t.p(x, b + 1, c.P.mar[3]); if (d === 2 && x % 4 === 0) t.p(x, b + 2, c.P.areia[4]); }
    } },
    animPisca('brilhos', 0, 80, 320, 90, 7, 8, (c) => [c.P.areia[4], 0xffffff], { cruz: true, fps: 3, sobre: 'chao' }),
  ],
};

/** Baía Azul: batalha sobre a água, entre estacas de píer, com a Ilha do Farol ao fundo. */
export const baia: ArenaDef = {
  id: 'baia', nome: 'Baía Azul', sombra: 'mar', apoio: { inimigo: [32, 7], jogador: [42, 10] },
  paleta: {
    rampas: { ...CEU, mar: ['#124a94', '#1a6cba', '#2c92d4', '#66c4e4', '#d0f4f4'], folha: ['#14483c', '#22784a', '#44a850', '#96d45c'], tronco: ['#33243a', '#5c4040', '#8a644a', '#b89060'], pedra: ['#2c3050', '#525c7c', '#8894a8', '#c4d0d0'], farol: ['#a03038', '#e45448', '#f4f0e4', '#ffe890'] },
    emissivas: ['farol'], noite: NOITE_CEU,
  },
  pintar(c) {
    const { fundo, cenario, chao, P, noite } = c;
    ceuBioma(fundo, c, { ate: 46, nuvens: [[40, 20, 64], [180, 12, 52], [262, 28, 50]], astro: [150, 12, 7] });
    fundo.ret(0, 46, 320, 134, P.mar[1]);
    // costa distante e a ilha do farol
    serra(cenario, 47, 12, 70, [P.folha[0], P.folha[0], P.folha[1], P.folha[2]], 5, { ate: 47 });
    serra(cenario, 47, 16, 30, [P.pedra[0], P.pedra[1], P.pedra[2], P.pedra[3]], 9, { perfil: (x) => 47 - Math.max(0, 14 - ((x - 70) / 5.5) ** 2), ate: 47 });
    cenario.ret(66, 12, 7, 22, P.farol[2]); cenario.vl(72, 12, 33, P.pedra[2]); cenario.ret(66, 18, 7, 4, P.farol[1]); cenario.ret(66, 27, 7, 3, P.farol[1]);
    cenario.ret(65, 8, 9, 4, P.pedra[0]); cenario.ret(67, 9, 5, 2, P.farol[3]); cenario.ret(67, 5, 5, 3, P.farol[0]); cenario.p(69, 4, P.farol[0]);
    if (noite) for (let i = 0; i < 40; i++) { cenario.p(73 + i, 10 + Math.round(i * 0.12), P.farol[3]); if (i % 2) cenario.p(73 + i, 9 - Math.round(i * 0.1), P.farol[3]); }
    // veleiros
    for (const [x, y] of [[196, 44], [286, 43]]) { cenario.hl(x, x + 6, y, P.tronco[1]); cenario.carimbo(x + 1, y - 6, ['..a', '.aa', '.aa', 'aaa', 'aab', 'aab'], { a: P.farol[2], b: P.pedra[3] }); }
    // água em faixas, mais clara perto
    agua(chao, 47, 179, [P.mar[0], P.mar[1], P.mar[2], P.mar[3]], 12);
    chao.campo(0, 47, 319, 179, (x, y) => (y > 47 && y < 58 + fbm(x, 0, 30, 3) * 6 && chao.g(x, y) === P.mar[1] ? P.mar[2] : VAZIO));
    chao.campo(0, 120, 319, 179, (x, y) => { const n = fbm(x, y * 2.2, 26, 8); return n > 0.7 && chao.g(x, y) === P.mar[1] ? P.mar[0] : VAZIO; });
    // apoios: águas calmas com anéis de ondulação
    for (const [p, rx, ry] of [[APOIO.inimigo, 34, 8], [APOIO.jogador, 46, 11]] as const) {
      chao.elipse(p.x, p.y + 1, rx, ry, (x, y, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.8 ? ((x + y) % 4 ? P.mar[3] : P.mar[2]) : d > 0.42 && d < 0.55 ? (x % 5 ? P.mar[3] : P.mar[2]) : P.mar[2]; });
      chao.hl(p.x - rx * 0.5, p.x - rx * 0.1, p.y - ry * 0.4, P.mar[4]);
    }
    // estacas do píer, bóia e canoa em primeiro plano
    const estaca = (x: number, y0: number, y1: number, l: number) => { tronco(chao, x, y0, y1, l, P.tronco, x, { raiz: 0, afina: 1 }); chao.hl(x - l / 2 - 1, x + l / 2 + 1, y1 + 1, P.mar[4]); chao.hl(x - l / 2, x + l / 2, y0, P.tronco[3]); chao.hl(x - l / 2 + 1, x + l / 2 + 2, y1 + 3, P.mar[0]); };
    estaca(18, 60, 104, 6); estaca(40, 66, 96, 5); estaca(300, 86, 150, 8); estaca(276, 78, 122, 6);
    for (let i = 0; i < 34; i++) { chao.p(8 + i, 62 + Math.round(i * 0.17), P.tronco[3]); chao.p(8 + i, 63 + Math.round(i * 0.17), P.tronco[1]); }
    chao.elipse(170, 66, 3, 3, P.farol[1]); chao.hl(168, 172, 66, P.farol[2]); chao.vl(170, 59, 63, P.pedra[0]); chao.hl(166, 174, 69, P.mar[4]);
    // canoa
    chao.campo(150, 160, 260, 179, (x, y) => { const u = (x - 205) / 52, v = y - 166; if (Math.abs(u) > 1) return VAZIO; const b = (1 - u * u) * 9; return v >= -1 && v <= b ? (v === -1 ? P.tronco[3] : v < 2 ? P.tronco[0] : v < b - 2 ? P.tronco[2] : P.tronco[1]) : VAZIO; });
    chao.linha(190, 150, 226, 172, P.tronco[3], 2); chao.elipse(188, 148, 3, 5, P.tronco[2]);
    pedra(chao, 14, 168, 16, 9, P.pedra, 3); pedra(chao, 36, 176, 10, 6, P.pedra, 5);
  },
  anims: [
    { id: 'agua', x: 0, y: 48, w: 320, h: 132, sobre: 'chao', fps: 4, pintar(t, q, c) {
      brilhosAgua(t, q, 0, 48, 320, 132, [c.P.mar[1], c.P.mar[2], c.P.mar[3], c.P.mar[4]], 14, 0.07);
      // canoa, pedras e estacas não recebem brilho
      t.campo(0, 48, 319, 179, (x, y) => (t.g(x, y) !== VAZIO && ((y > 158 && x > 150 && x < 262) || (y > 156 && x < 50) || Math.abs(x - 300) < 6 || Math.abs(x - 276) < 5 || Math.abs(x - 18) < 5 || Math.abs(x - 40) < 4) ? -2 : VAZIO));
      for (let i = 0; i < t.px.length; i++) if (t.px[i] === -2) t.px[i] = VAZIO;
    } },
    animPisca('gaivotas', 90, 6, 150, 30, 3, 5, (c) => [c.P.nuvem[2], c.P.nuvem[2]], { fps: 3, sobre: 'fundo', so: 'dia' }),
  ],
};

export const mangue: ArenaDef = {
  id: 'mangue', nome: 'Manguezal', sombra: 'lama',
  paleta: {
    rampas: { ceu: ['#6aa8c0', '#8cc0c8', '#b4d8cc', '#dcecd0'], nuvem: ['#a8c8cc', '#d4e4dc', '#f4f8ec'], astro: ['#ffe9a0', '#fff8d8'], agua: ['#24403c', '#356050', '#4e8464', '#8cb888'], lama: ['#2c2630', '#4a3c3c', '#6c5848', '#8c7858', '#b09c70'], folha: ['#143c34', '#24684a', '#3c9454', '#84c45c'], tronco: ['#2a1c30', '#4c3438', '#786048', '#a89068'], caranguejo: ['#8c2420', '#d84c2c', '#f8904c', '#ffd8a0'] },
    noite: NOITE_CEU,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(68, 2, 50, 31);
    ceuBioma(fundo, c, { ate: 50, nuvens: [[60, 22, 70], [220, 16, 60]], astro: [34, 16, 7] });
    faixaCopas(fundo, 0, 320, 44, 14, 7, [P.agua[0], P.agua[0], P.agua[1], P.agua[2]], 3);
    agua(fundo, 50, 70, P.agua, 6);
    fundo.ret(0, 68, 320, 112, P.lama[2]);
    [[44, 30], [128, 26], [204, 30], [270, 24]].forEach(([x, a], i) => arvMangue(cenario, x, 70, a, [P.agua[0], P.tronco[0], P.tronco[1], P.tronco[2]], [P.agua[0], P.folha[0], P.folha[1], P.folha[2]], 40 + i));
    chaoNatural(chao, { yh, r: P.lama, s: 400, liso: true, textura: 'g', tufos: 14, capimR: [P.folha[0], P.folha[0], P.folha[1], P.folha[2], P.folha[3]] });
    // canais de maré
    for (const [cx, cy, rx, ry, s] of [[250, 140, 60, 12, 5], [40, 100, 34, 6, 6], [150, 172, 50, 8, 7]]) {
      mancha(chao, cx, cy, rx + 3, ry + 2, P.lama[0], s, 0.4, 12);
      chao.campo(cx - rx * 1.5, cy - ry * 1.5, cx + rx * 1.5, cy + ry * 1.5, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry; return dx * dx + dy * dy < 1 + (fbm(x, y * 1.8, 12, s) - 0.5) * 0.8 && chao.g(x, y) !== VAZIO ? (h(Math.floor((x + y * 3) / 6), y, 3) > 0.78 ? P.agua[3] : y - cy < -ry * 0.3 ? P.agua[2] : P.agua[1]) : VAZIO; });
    }
    arvMangue(chao, 16, 112, 78, P.tronco, P.folha, 51); arvMangue(chao, 304, 106, 84, P.tronco, P.folha, 52);
    // tocas e caranguejos
    for (const [x, y] of [[120, 92], [176, 126], [60, 150], [214, 100]]) { chao.elipse(x, y, 3, 1.4, P.lama[0]); chao.hl(x - 3, x + 3, y - 2, P.lama[4]); }
    for (const [x, y, e] of [[126, 90, 0], [66, 148, 1]] as const) chao.carimbo(x, y, ['a...a', '.bbb.', 'cbbbc', '.c.c.'], { a: P.caranguejo[2], b: P.caranguejo[1], c: P.caranguejo[0] }, !!e);
    // pneumatóforos (raízes que respiram)
    const sq = new Seq(77);
    for (let i = 0; i < 46; i++) { const x = sq.int(4, 316), y = sq.int(78, 176); if (chao.g(x, y) === P.agua[1] || ((x - APOIO.inimigo.x) / 34) ** 2 + ((y - APOIO.inimigo.y) / 10) ** 2 < 1 || ((x - APOIO.jogador.x) / 46) ** 2 + ((y - APOIO.jogador.y) / 13) ** 2 < 1) continue; const a = 2 + sq.int(0, 3); chao.vl(x, y - a, y, P.tronco[1]); chao.p(x, y - a, P.tronco[3]); chao.p(x + 1, y, P.lama[0]); }
    samambaia(chao, 300, 186, 30, [P.agua[0], P.folha[0], P.folha[1], P.folha[2]], 4);
  },
  anims: [
    { id: 'mare', x: 0, y: 50, w: 320, h: 130, sobre: 'chao', fps: 3, pintar(t, q, c) {
      brilhosAgua(t, q, 0, 51, 320, 16, c.P.agua, 4, 0.1);
      for (const [cx, cy, rx, ry, s] of [[250, 140, 52, 9, 5], [40, 100, 28, 4, 6], [150, 172, 42, 5, 7]]) for (let i = 0; i < 7; i++) { const x = cx - rx + ((i * 37 + s * 11) % (rx * 2)), y = cy - ry + ((i * 13 + s * 5) % (ry * 2)); if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.8) t.hl(x + q, x + q + 3, y, c.P.agua[3]); }
    } },
    animPisca('vagalumes', 10, 30, 300, 120, 10, 31, () => [0xc8e85a, 0xf6ffb0], { so: 'noite' }),
  ],
};

/** Recife Submerso: fundo de areia entre corais, com raios de luz e cardume ao longe. */
export const recife: ArenaDef = {
  id: 'recife', nome: 'Recife Submerso', interna: true, sombra: 'areia',
  paleta: {
    rampas: { agua: ['#0c2c6c', '#12449c', '#1a64bc', '#2c8cd4', '#5cbce4'], areia: ['#2c5c94', '#4c84a8', '#84b4b8', '#bcdcc4', '#e8f4d4'], coral: ['#8c2458', '#d84874', '#f8849c', '#ffccd0'], laranja: ['#a43c20', '#e87430', '#fcb44c', '#fff0a8'], alga: ['#0c3c4c', '#146c5c', '#2ca464', '#7cdc74'], pedra: ['#1c2460', '#34449c', '#5c74b8', '#94b4d4'] },
  },
  pintar({ fundo, cenario, chao, P }) {
    const yh = yhOnda(68, 3, 60, 51);
    fundo.campo(0, 0, 319, 179, (x, y) => { const k = y + Math.sin(x / 40) * 4; return k < 14 ? P.agua[3] : k < 30 ? P.agua[2] : k < 52 ? P.agua[1] : P.agua[0]; });
    // raios de luz oblíquos
    fundo.campo(0, 0, 319, 70, (x, y) => { const u = (x + y * 0.55) % 64; const c = fundo.g(x, y); const i = P.agua.indexOf(c); return (u < 9 || (u > 22 && u < 27)) && y < 62 - (x % 64) * 0.2 && i >= 0 && i < 4 ? P.agua[i + 1] : VAZIO; });
    // superfície ondulada vista de baixo
    for (let x = 0; x < 320; x++) { const y = Math.round(2 + Math.sin(x / 9) * 1.5 + Math.sin(x / 23) * 2); fundo.vl(x, 0, y, P.agua[4]); fundo.p(x, y + 1, P.agua[3]); }
    // recifes distantes
    serra(fundo, 70, 26, 46, [P.agua[0], P.agua[0], P.agua[1], P.agua[2]], 8, { ate: 74 });
    fundo.ret(0, 70, 320, 110, P.areia[1]);
    // cardume
    for (let i = 0; i < 9; i++) cenario.carimbo(180 + ((i * 17) % 50), 22 + ((i * 7) % 16), ['a.aa.', '.aaab', 'a.aa.'], { a: P.agua[4], b: P.areia[4] });
    serra(cenario, 72, 20, 34, P.pedra, 14, { ate: 74, perfil: (x) => 72 - 22 * Math.max(0, fbm(x, 0, 40, 14) - 0.35) * 1.6 - (x < 40 || x > 280 ? 14 : 0) });
    const coralRamo = (t: Tela, x: number, y: number, a: number, r: Rampa, s: number) => { const rec = (px: number, py: number, ang: number, len: number, n: number) => { const ex = px + Math.cos(ang) * len, ey = py - Math.sin(ang) * len; t.linha(px, py, ex, ey, r[2], n > 1 ? 2 : 1); t.linha(px + 1, py, ex + 1, ey, r[1]); t.p(ex, ey, r[3]); if (n > 0) { rec(ex, ey, ang + 0.5 + h(n, s) * 0.3, len * 0.72, n - 1); rec(ex, ey, ang - 0.5 - h(n, s + 1) * 0.3, len * 0.72, n - 1); } }; rec(x, y, Math.PI / 2, a * 0.4, 3); };
    const coralCerebro = (t: Tela, x: number, y: number, rad: number, r: Rampa) => t.elipse(x, y, rad, rad * 0.7, (px, py, nx, ny) => { if (ny > 0.75) return r[0]; const m = (Math.floor(px + Math.sin(py * 0.9) * 2) % 4 === 0); return m ? r[1] : nx + ny < -0.4 ? r[3] : r[2]; });
    const alga = (t: Tela, x: number, y: number, a: number, r: Rampa, f = 0) => { for (let k = 0; k < a; k++) { const px = x + Math.round(Math.sin(k / 3 + x + f * 1.57) * (1 + k / a * 2)); t.p(px, y - k, r[2]); t.p(px + 1, y - k, k % 3 ? r[1] : r[3]); } };
    coralRamo(cenario, 30, 72, 34, P.coral, 2); coralRamo(cenario, 290, 72, 30, P.laranja, 4); coralRamo(cenario, 150, 70, 18, P.coral, 6);
    chaoNatural(chao, { yh, r: P.areia, s: 500, liso: true, textura: 'g', tufos: 0 });
    // ondas de areia
    chao.campo(0, 70, 319, 179, (x, y) => { const c = chao.g(x, y), i = P.areia.indexOf(c); return i > 1 && (y + Math.round(Math.sin(x / 14 + y / 9) * 2)) % 9 === 0 && h(x >> 3, y, 4) > 0.3 ? P.areia[i - 1] : VAZIO; });
    coralCerebro(chao, 24, 118, 16, P.laranja); coralCerebro(chao, 296, 138, 20, P.coral); coralCerebro(chao, 196, 76, 8, P.coral);
    coralRamo(chao, 12, 100, 40, P.coral, 9); coralRamo(chao, 306, 116, 50, P.laranja, 11); coralRamo(chao, 262, 172, 36, P.coral, 13);
    for (const [x, y, a] of [[52, 112, 22], [58, 114, 16], [270, 132, 26], [140, 80, 10], [146, 82, 14], [222, 176, 22], [92, 176, 18], [98, 178, 24]]) alga(chao, x, y, a, P.alga);
    pedra(chao, 150, 158, 14, 7, P.pedra, 3); pedra(chao, 60, 174, 12, 7, P.pedra, 7);
    chao.carimbo(170, 150, ['..a..', 'aabaa', '.aba.', '.a.a.'], { a: P.laranja[2], b: P.laranja[3] });
    chao.carimbo(120, 100, ['.ab.', 'abab', 'cccc'], { a: P.coral[3], b: P.coral[2], c: P.coral[1] });
  },
  anims: [
    { id: 'bolhas', x: 0, y: 10, w: 320, h: 160, sobre: 'frente', fps: 4, pintar(t, q, c) { bolhas(t, q, 0, 10, 320, 160, 14, [c.P.agua[2], c.P.agua[3], c.P.agua[4], c.P.areia[4]], 6); } },
    { id: 'algas', x: 40, y: 80, w: 250, h: 100, sobre: 'chao', fps: 3, pintar(t, q, c) { for (const [x, y, a] of [[52, 112, 22], [58, 114, 16], [270, 132, 26], [140, 80, 10], [146, 82, 14], [222, 176, 22], [92, 176, 18], [98, 178, 24]]) for (let k = Math.floor(a * 0.4); k < a; k++) { const px = x + Math.round(Math.sin(k / 3 + x + q * 1.57) * (1 + (k / a) * 2)); t.p(px, y - k, c.P.alga[2]); t.p(px + 1, y - k, k % 3 ? c.P.alga[1] : c.P.alga[3]); } } },
  ],
};
void tronco; void terreno; void fronde;
