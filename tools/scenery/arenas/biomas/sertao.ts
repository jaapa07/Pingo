import { APOIO, VAZIO, h, fbm, Seq, type ArenaDef, type Tela, type Rampa } from '../nucleo';
import { tronco, copa, faixaCopas, retorcida, buriti, cupinzeiro, mandacaru, araucaria, canteiroFlores, capim, pedra, mancha, serra, agua, brilhosAgua, samambaia, cogumelo, galho, coluna } from '../pecas';
import { chaoNatural, ceuBioma, animQueda, animPisca, bolhas, yhOnda } from '../comum';

const ASTRO = ['#ffe9a0', '#fff8d8'];
const NOITE = { ceu: ['#0c1030', '#141a44', '#1e2a5c', '#324478'], nuvem: ['#232c5c', '#34407a', '#4c5c98'], astro: ['#cfd8f4', '#f4f8ff'] };

/** Tuiuiú ao longe: corpo branco, cabeça preta e colar vermelho. */
function tuiuiu(t: Tela, x: number, y: number, P: Record<string, Rampa>, esp = false) {
  t.carimbo(x, y, ['.kk...', '.kk...', '.rr...', '.ww...', '.wwww.', '.wwwww', '..www.', '..k.k.', '..k.k.', '..k.k.'], { k: P.tronco[0], r: P.flor[1], w: P.nuvem[2] }, esp);
}
function palafita(t: Tela, x: number, y: number, mad: Rampa, telha: Rampa, luz: number) {
  for (const dx of [1, 9, 17]) t.vl(x + dx, y - 6, y + 3, mad[0]);
  t.ret(x, y - 16, 20, 10, mad[2]); t.hl(x, x + 19, y - 7, mad[0]); for (let i = 0; i < 20; i += 4) t.vl(x + i, y - 16, y - 8, mad[1]);
  t.ret(x + 3, y - 13, 4, 4, luz); t.ret(x + 12, y - 13, 4, 6, mad[0]);
  for (let j = 0; j < 7; j++) t.hl(x - 3 + j, x + 22 - j, y - 17 - j, j === 6 ? telha[3] : j % 2 ? telha[1] : telha[2]);
}

export const cerrado: ArenaDef = {
  id: 'cerrado', nome: 'Cerrado Aberto', sombra: 'capim',
  paleta: {
    rampas: { ceu: ['#4a9cdc', '#78bce8', '#b0d8e8', '#f0e4c0'], nuvem: ['#b8cce0', '#e8eef0', '#ffffff'], astro: ASTRO, capim: ['#7c5a30', '#a8823c', '#d0a848', '#e8cc64', '#f8e890'], terra: ['#5c2824', '#8c3c2c', '#b85c38', '#dc8850'], folha: ['#28443c', '#3c7048', '#6c9c50', '#a8c864'], tronco: ['#2c1c2c', '#4c3034', '#745040', '#a07c58'], ipe: ['#a86c14', '#e8a81c', '#fcd834', '#fff490'], longe: ['#6c84b0', '#8c9cc0', '#b0b8cc', '#d0ccc8'] },
    noite: NOITE,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(67, 2, 80, 61);
    ceuBioma(fundo, c, { ate: 56, nuvens: [[30, 20, 50], [200, 14, 80]], astro: [250, 30, 8] });
    // chapadas azuladas ao longe
    serra(fundo, 58, 22, 90, P.longe, 3, { perfil: (x) => 58 - (x > 30 && x < 140 ? 16 + Math.round(fbm(x, 0, 30, 2) * 3) : x > 190 && x < 300 ? 10 + Math.round(fbm(x, 0, 20, 5) * 2) : fbm(x, 0, 40, 7) * 5), ate: 60 });
    serra(fundo, 66, 8, 60, [P.capim[0], P.capim[0], P.capim[1], P.capim[2]], 7, { ate: 70 });
    fundo.ret(0, 66, 320, 114, P.capim[2]);
    // vereda de buritis e árvores tortas no horizonte
    for (const [x, a] of [[18, 22], [30, 28], [44, 20]]) buriti(cenario, x, 68, a, [P.tronco[0], P.tronco[0], P.tronco[1], P.tronco[2]], [P.folha[0], P.folha[0], P.folha[1], P.folha[2]], x);
    retorcida(cenario, 120, 68, 22, P.tronco, P.folha, 5, 4); retorcida(cenario, 196, 68, 26, P.tronco, P.ipe, 8, 5); retorcida(cenario, 284, 68, 18, P.tronco, P.folha, 11, 4);
    cupinzeiro(cenario, 156, 68, 9, P.terra, 2); cupinzeiro(cenario, 244, 68, 7, P.terra, 4);
    chaoNatural(chao, { yh, r: P.capim, s: 600, aberto: true, tufos: 110 });
    // manchas de terra vermelha
    for (const [x, y, rx, ry, s] of [[160, 124, 40, 6, 1], [36, 164, 30, 7, 2], [270, 92, 22, 4, 3]]) { mancha(chao, x, y, rx, ry, P.terra[2], s, 0.5, 9); mancha(chao, x + 2, y + 1, rx * 0.6, ry * 0.5, P.terra[3], s + 9, 0.6, 7); }
    // ipê-amarelo grande e cupinzeiros perto
    retorcida(chao, 300, 110, 84, P.tronco, P.ipe, 13, 9);
    canteiroFlores(chao, 286, 114, 26, 5, 14, [P.ipe[0], P.ipe[1], P.ipe[2], P.ipe[3]], P.ipe[3], 15);
    retorcida(chao, 22, 100, 60, P.tronco, P.folha, 17, 8);
    cupinzeiro(chao, 56, 118, 22, P.terra, 6); cupinzeiro(chao, 262, 150, 18, P.terra, 8); cupinzeiro(chao, 132, 82, 9, P.terra, 3);
    pedra(chao, 204, 166, 10, 5, P.terra, 4);
    mandacaru(chao, 10, 176, 26, P.folha, P.ipe[3]);
    capim(chao, 180, 178, 9, 14, P.capim, 3); capim(chao, 110, 179, 8, 12, P.capim, 6); capim(chao, 308, 178, 8, 14, P.capim, 9);
  },
  anims: [
    animQueda('petalas', 230, 20, 90, 100, 7, 3, (c) => [c.P.ipe[2], c.P.ipe[3]], { fps: 5, vx: -1 }),
    animPisca('vagalumes', 10, 50, 300, 110, 9, 13, () => [0xc8e85a, 0xf6ffb0], { so: 'noite' }),
    animQueda('capim-vento', 0, 70, 320, 100, 6, 7, (c) => [c.P.capim[4]], { vx: 4, passo: 1, forma: 'ponto', fps: 6 }),
  ],
};

export const pantanal: ArenaDef = {
  id: 'pantanal', nome: 'Pantanal Alagado', sombra: 'grama',
  paleta: {
    rampas: { ceu: ['#3c8cd0', '#68b0e0', '#a4d4e8', '#e4f0d8'], nuvem: ['#a4c4dc', '#dcecf0', '#ffffff'], astro: ASTRO, agua: ['#1c5478', '#2c7c98', '#54a8b4', '#a8dcd0'], grama: ['#1c4c3c', '#2c7444', '#4c9c4c', '#7cc054', '#b4dc68'], folha: ['#143c38', '#246848', '#449850', '#8cc85c'], tronco: ['#2c1c30', '#503438', '#7c5844', '#a88860'], flor: ['#6c3c9c', '#d43c50', '#c494e4', '#f0d4f8'], telha: ['#7c3020', '#b85030', '#e0804c', '#f4b47c'] },
    emissivas: [], noite: NOITE,
  },
  pintar(c) {
    const { fundo, cenario, chao, P, noite } = c, yh = yhOnda(68, 1.5, 60, 71);
    ceuBioma(fundo, c, { ate: 52, nuvens: [[20, 30, 90], [150, 16, 70], [250, 36, 60]], astro: [290, 14, 7] });
    faixaCopas(fundo, 0, 320, 50, 6, 4, [P.agua[0], P.agua[0], P.agua[1], P.folha[1]], 3);
    agua(fundo, 52, 72, P.agua, 4);
    fundo.ret(0, 70, 320, 110, P.grama[2]);
    for (const [x, a] of [[60, 30], [74, 22], [250, 34], [266, 24], [306, 28]]) buriti(cenario, x, 64, a, [P.agua[0], P.tronco[0], P.tronco[1], P.tronco[2]], [P.folha[0], P.folha[0], P.folha[1], P.folha[2]], x);
    palafita(cenario, 140, 60, P.tronco, P.telha, noite ? 0xffd870 : P.agua[3]);
    tuiuiu(cenario, 190, 56, P); tuiuiu(cenario, 204, 58, P, true); tuiuiu(cenario, 100, 57, P);
    // ilhas de capim na água do fundo
    for (const [x, w] of [[30, 26], [110, 18], [220, 30]]) { cenario.elipse(x, 66, w, 2.5, P.grama[1]); cenario.hl(x - w + 3, x + w - 3, 64, P.grama[3]); }
    chaoNatural(chao, { yh, r: P.grama, s: 700, aberto: true, tufos: 70 });
    // poças e corixos com aguapés
    for (const [cx, cy, rx, ry, s] of [[36, 96, 40, 8, 5], [270, 150, 56, 14, 6], [150, 174, 40, 7, 7], [296, 88, 30, 5, 8]]) {
      chao.campo(cx - rx * 1.5, cy - ry * 1.6, cx + rx * 1.5, cy + ry * 1.6, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy - (fbm(x, y * 1.8, 12, s) - 0.5) * 0.8; if (d > 1.12 || chao.g(x, y) === VAZIO) return VAZIO; return d > 1 ? P.grama[0] : h(Math.floor((x + y * 3) / 6), y, 3) > 0.8 ? P.agua[3] : dy < -0.3 ? P.agua[2] : P.agua[1]; });
      const sq = new Seq(s * 9);
      for (let i = 0; i < rx / 5; i++) { const x = cx + sq.int(-rx * 0.7, rx * 0.7), y = cy + sq.int(-ry * 0.5, ry * 0.5); chao.elipse(x, y, 3, 1.5, P.folha[2]); chao.p(x - 1, y - 1, P.folha[3]); if (i % 2) { chao.p(x, y - 2, P.flor[2]); chao.p(x, y - 3, P.flor[3]); } }
    }
    buriti(chao, 18, 126, 74, P.tronco, P.folha, 5); buriti(chao, 304, 120, 80, P.tronco, P.folha, 9);
    tuiuiu(chao, 250, 132, P, true);
    canteiroFlores(chao, 150, 96, 20, 4, 6, [P.flor[0], P.flor[0], P.flor[2], P.flor[3]], P.ceu[3], 4);
    capim(chao, 60, 178, 9, 16, P.grama, 3); capim(chao, 200, 179, 9, 14, P.grama, 5); capim(chao, 8, 150, 7, 12, P.grama, 8);
  },
  anims: [
    { id: 'agua', x: 0, y: 52, w: 320, h: 128, sobre: 'chao', fps: 3, pintar(t, q, c) {
      brilhosAgua(t, q, 0, 53, 320, 12, c.P.agua, 4, 0.1);
      for (const [cx, cy, rx, ry, s] of [[36, 96, 34, 5, 5], [270, 150, 48, 10, 6], [150, 174, 34, 4, 7]]) for (let i = 0; i < 8; i++) { const x = cx - rx + ((i * 37 + s * 11) % (rx * 2)), y = cy - ry + ((i * 13 + s * 5) % (ry * 2)); if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.7) t.hl(x + q, x + q + 3, y, c.P.agua[3]); }
    } },
    animPisca('vagalumes', 10, 40, 300, 120, 12, 17, () => [0xc8e85a, 0xf6ffb0], { so: 'noite' }),
  ],
};

export const chapada: ArenaDef = {
  id: 'chapada', nome: 'Chapada dos Paredões', sombra: 'chao',
  paleta: {
    rampas: { ceu: ['#3c84d0', '#64a8e0', '#a0cce8', '#f4dcb8'], nuvem: ['#b0c4dc', '#e4e8ec', '#ffffff'], astro: ASTRO, rocha: ['#5c2030', '#943430', '#c8543c', '#ec8850', '#fcc47c'], longe: ['#7c5c8c', '#a87c94', '#cc9c98', '#e8c4a8'], chao: ['#70342c', '#a05034', '#c87844', '#e4a05c', '#f8cc84'], folha: ['#2c4438', '#44704c', '#789c54', '#b4c86c'], tronco: ['#2c1c2c', '#4c3034', '#745040', '#a07c58'] },
    noite: NOITE,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(68, 2, 50, 81);
    ceuBioma(fundo, c, { ate: 54, nuvens: [[120, 18, 60], [240, 28, 40]], astro: [40, 18, 8] });
    serra(fundo, 60, 30, 80, P.longe, 4, { perfil: (x) => 60 - (x < 110 ? 26 + Math.round(fbm(x, 0, 24, 1) * 4) : x > 150 && x < 250 ? 18 + Math.round(fbm(x, 0, 20, 3) * 3) : 6), ate: 62, estratos: true });
    fundo.ret(0, 62, 320, 118, P.chao[2]);
    // paredões próximos, em degraus
    const par = (x: number) => 70 - (x < 70 ? 60 - Math.round(fbm(x, 0, 16, 5) * 6) - (x > 50 ? (x - 50) * 0.6 : 0) : x > 236 ? 50 + Math.round(fbm(x, 0, 14, 8) * 6) - (x < 256 ? (256 - x) * 0.8 : 0) : x > 120 && x < 180 ? 14 + Math.round(fbm(x, 0, 12, 9) * 4) : 3);
    serra(cenario, 70, 60, 20, [P.rocha[1], P.rocha[2], P.rocha[3], P.rocha[4]], 6, { perfil: par, ate: 70, estratos: true });
    cenario.campo(0, 0, 319, 70, (x, y) => (cenario.g(x, y) !== VAZIO && y - par(x) > 3 && (Math.floor((x + Math.sin(y / 6) * 3) / 11) + Math.floor(y / 30)) % 4 === 0 && h(x >> 2, y >> 4, 3) > 0.4 ? P.rocha[0] : VAZIO));
    for (const [x, y] of [[20, 12], [44, 14], [270, 22], [300, 20], [150, 54]]) copa(cenario, x, y, 9, 3, P.folha, x, 3, 3);
    chaoNatural(chao, { yh, r: P.chao, s: 800, liso: true, textura: 'g', tufos: 30, capimR: [P.folha[0], P.folha[0], P.folha[1], P.folha[2], P.folha[3]] });
    // rachaduras e lajes
    const sq = new Seq(5);
    for (let i = 0; i < 12; i++) { let x = sq.int(10, 310), y = sq.int(80, 172); for (let k = 0; k < 10; k++) { chao.p(x, y, P.chao[0]); x += 1 + sq.int(0, 1); y += sq.int(-1, 1); } }
    pedra(chao, 30, 118, 22, 12, P.rocha, 3); pedra(chao, 56, 128, 10, 6, P.rocha, 5); pedra(chao, 290, 134, 26, 16, P.rocha, 7); pedra(chao, 262, 150, 9, 5, P.rocha, 9); pedra(chao, 160, 84, 8, 4, P.rocha, 11);
    mandacaru(chao, 300, 118, 24, P.folha, P.rocha[4]); mandacaru(chao, 86, 86, 12, P.folha);
    retorcida(chao, 10, 108, 44, P.tronco, P.folha, 3, 6);
    capim(chao, 140, 178, 8, 12, P.folha, 4); capim(chao, 222, 176, 7, 10, P.folha, 6);
  },
  anims: [
    animQueda('poeira', 0, 60, 320, 115, 12, 4, (c) => [c.P.chao[4], c.P.chao[3]], { vx: 5, passo: 1, forma: 'ponto', fps: 6 }),
    animPisca('estrelas', 0, 0, 320, 40, 10, 3, (c) => [c.P.astro[0], c.P.astro[1]], { so: 'noite', cruz: true, sobre: 'fundo', fps: 3 }),
    animPisca('calor', 20, 62, 280, 10, 10, 8, (c) => [c.P.chao[4], c.P.chao[4]], { so: 'dia', sobre: 'chao', fps: 4 }),
  ],
};

export const brejo: ArenaDef = {
  id: 'brejo', nome: 'Vale do Veneno', sombra: 'lodo',
  paleta: {
    rampas: { ceu: ['#3c2c5c', '#5c3c74', '#845484', '#b47c8c'], nuvem: ['#5c4474', '#846490', '#b08ca8'], astro: ['#e4d0f0', '#fff0ff'], lodo: ['#1c1c34', '#2c3444', '#44544c', '#647454', '#8c9c64'], veneno: ['#4c1c74', '#8430b0', '#c058dc', '#f0a8f8'], folha: ['#14283c', '#1c4848', '#307058', '#64a068'], tronco: ['#18142c', '#2c2440', '#4c3c50', '#74606c'], fungo: ['#187868', '#34c8a0', '#a0f8c8', '#f0fff0'] },
    emissivas: ['fungo'], mult: [0.5, 0.5, 0.7], soma: [6, 6, 26],
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(68, 2, 50, 91);
    ceuBioma(fundo, c, { ate: 60, nuvens: [[40, 26, 80], [190, 18, 100]], astro: [230, 34, 9] });
    // árvores mortas em silhueta e névoa em faixas
    const sil = [P.ceu[0], P.ceu[0], P.ceu[1], P.ceu[1]];
    for (let i = 0; i < 8; i++) { const x = 12 + i * 42 + h(i, 3) * 16; tronco(fundo, x, 14 + h(i, 4) * 16, 66, 4 + h(i, 5) * 3, sil, i, { casca: false, raiz: 2 }); galho(fundo, x, 34, x - 14, 20, 2, sil); galho(fundo, x, 28, x + 12, 16, 2, sil); galho(fundo, x - 8, 27, x - 12, 12, 1, sil); }
    for (const y of [44, 54, 62]) fundo.campo(0, y - 2, 319, y + 3, (x, yy) => (Math.abs(yy - y - Math.sin(x / 26 + y) * 1.5) < 1.5 + fbm(x, y, 30, 3) * 1.5 ? P.ceu[2] : VAZIO));
    fundo.ret(0, 66, 320, 114, P.lodo[2]);
    const morta = (t: Tela, x: number, yb: number, a: number, r: Rampa, s: number) => { tronco(t, x, yb - a, yb, a * 0.12, r, s, { curva: (h(s, 1) - 0.5) * 10, raiz: 6 }); for (let i = 0; i < 5; i++) { const y = yb - a * (0.5 + i * 0.11), l = i % 2 ? 1 : -1, len = a * (0.34 - i * 0.04); galho(t, x, y, x + l * len, y - len * 0.5, 3, r); galho(t, x + l * len, y - len * 0.5, x + l * len * 1.3, y - len * 1.1, 2, r); galho(t, x + l * len * 0.6, y - len * 0.3, x + l * len * 0.5, y - len * 0.9, 1, r); } };
    morta(cenario, 60, 70, 50, [P.tronco[0], P.tronco[0], P.tronco[1], P.tronco[2]], 3); morta(cenario, 200, 70, 44, [P.tronco[0], P.tronco[0], P.tronco[1], P.tronco[2]], 5); morta(cenario, 264, 70, 56, [P.tronco[0], P.tronco[0], P.tronco[1], P.tronco[2]], 7);
    [[20, 8], [120, 10], [160, 7], [230, 9], [300, 10]].forEach(([x, r], i) => copa(cenario, x, 66, r * 2, r * 0.8, [P.lodo[0], P.folha[0], P.folha[1], P.folha[2]], 20 + i, 5));
    chaoNatural(chao, { yh, r: P.lodo, s: 900, textura: 'g', tufos: 40, capimR: [P.folha[0], P.folha[0], P.folha[1], P.folha[2], P.folha[3]] });
    for (const [cx, cy, rx, ry, s] of [[258, 146, 54, 13, 5], [34, 104, 34, 7, 6], [140, 170, 44, 8, 7], [290, 92, 26, 4, 8]]) {
      chao.campo(cx - rx * 1.5, cy - ry * 1.6, cx + rx * 1.5, cy + ry * 1.6, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy - (fbm(x, y * 1.8, 12, s) - 0.5) * 0.8; if (d > 1.14 || chao.g(x, y) === VAZIO) return VAZIO; return d > 1 ? P.lodo[0] : d > 0.82 ? P.veneno[0] : h(Math.floor((x + y * 3) / 7), y, 3) > 0.82 ? P.veneno[3] : fbm(x, y * 2, 9, s + 2) > 0.55 ? P.veneno[2] : P.veneno[1]; });
    }
    morta(chao, 16, 116, 92, P.tronco, 11); morta(chao, 306, 112, 100, P.tronco, 13);
    for (const [x, y, g] of [[70, 118, 1], [78, 120, 0], [196, 102, 0], [226, 170, 1], [120, 84, 0], [232, 172, 0], [28, 150, 1]] as const) cogumelo(chao, x, y, P.fungo, P.veneno, !!g);
    pedra(chao, 176, 136, 10, 5, [P.lodo[0], P.tronco[1], P.tronco[2], P.tronco[3]], 3);
    samambaia(chao, 300, 186, 30, [P.lodo[0], P.folha[0], P.folha[1], P.folha[2]], 5); samambaia(chao, 80, 186, 20, [P.lodo[0], P.folha[0], P.folha[1], P.folha[2]], 6);
  },
  anims: [
    { id: 'borbulhas', x: 0, y: 84, w: 320, h: 96, sobre: 'chao', fps: 4, pintar(t, q, c) { for (const [x, y, w, hh, s] of [[214, 136, 90, 20, 5], [8, 98, 54, 12, 6], [104, 164, 74, 12, 7]]) bolhas(t, q, x, y, w, hh, 5, [c.P.veneno[1], c.P.veneno[2], c.P.veneno[3], c.P.veneno[3]], s); } },
    animPisca('esporos', 10, 40, 300, 130, 14, 19, (c) => [c.P.fungo[1], c.P.fungo[3]], { fps: 3 }),
  ],
};

export const geada: ArenaDef = {
  id: 'geada', nome: 'Campos de Altitude', sombra: 'neve',
  paleta: {
    rampas: { ceu: ['#5c8cc4', '#88b0d8', '#b8d4e4', '#e8f0ec'], nuvem: ['#a8c0d8', '#dce8f0', '#ffffff'], astro: ['#fff4c8', '#ffffff'], neve: ['#5c7ca8', '#88a8c8', '#b8d0e0', '#dcecf0', '#ffffff'], serra: ['#44588c', '#6078a4', '#8498bc', '#b0c0d4'], folha: ['#142c3c', '#1c4c48', '#2c7050', '#5c9c60'], tronco: ['#241c30', '#44303c', '#6c4c48', '#987460'], pinhao: ['#5c2418', '#984024', '#c87038', '#f0b060'] },
    noite: NOITE,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(68, 3, 70, 101);
    ceuBioma(fundo, c, { ate: 54, nuvens: [[30, 16, 70], [170, 26, 50], [250, 12, 60]], astro: [130, 14, 6] });
    serra(fundo, 62, 40, 70, P.serra, 3, { ate: 64, neve: [P.neve[2], P.neve[3], P.neve[4]] });
    serra(fundo, 66, 14, 50, [P.neve[0], P.neve[1], P.neve[2], P.neve[3]], 8, { ate: 70 });
    fundo.ret(0, 66, 320, 114, P.neve[2]);
    const lf = [P.serra[0], P.folha[0], P.folha[1], P.folha[2]], lt = [P.serra[0], P.tronco[0], P.tronco[1], P.tronco[2]];
    for (const [x, a] of [[24, 40], [62, 30], [104, 46], [150, 28], [206, 42], [250, 32], [296, 44]]) araucaria(cenario, x, 70, a, lt, lf, x, P.neve);
    chaoNatural(chao, { yh, r: P.neve, s: 1000, liso: true, textura: 'g', tufos: 34, capimR: [P.folha[0], P.folha[1], P.folha[2], P.folha[3], P.neve[4]] });
    araucaria(chao, 26, 118, 104, P.tronco, P.folha, 5, P.neve); araucaria(chao, 300, 110, 96, P.tronco, P.folha, 7, P.neve);
    mancha(chao, 30, 120, 16, 3, P.neve[1], 3, 0.3, 6); mancha(chao, 302, 112, 16, 3, P.neve[1], 4, 0.3, 6);
    // capim queimado de geada aparecendo sob a neve, pinhas e pedras
    for (const [x, y, rx, ry, s] of [[150, 92, 18, 3, 1], [210, 160, 26, 5, 2], [40, 160, 22, 5, 3]]) { mancha(chao, x, y, rx, ry, P.folha[2], s, 0.6, 7); mancha(chao, x, y - 1, rx * 0.6, ry * 0.5, P.folha[3], s + 5, 0.7, 5); }
    for (const [x, y] of [[66, 124], [74, 128], [270, 122], [120, 150], [246, 98]]) chao.carimbo(x, y, ['.ab.', 'abca', 'accd', '.dd.'], { a: P.pinhao[2], b: P.pinhao[3], c: P.pinhao[1], d: P.pinhao[0] });
    pedra(chao, 276, 150, 14, 8, [P.serra[0], P.serra[1], P.serra[2], P.neve[4]], 3); pedra(chao, 180, 124, 7, 4, [P.serra[0], P.serra[1], P.serra[2], P.neve[4]], 6);
    // cerca de taipa de pedra
    for (let x = 96; x < 132; x += 6) pedra(chao, x, 76 + (x % 4 ? 0 : 1), 4, 2.5, [P.serra[0], P.serra[1], P.serra[2], P.neve[4]], x);
  },
  anims: [
    animQueda('neve', 0, 0, 320, 180, 30, 9, (c) => [c.P.neve[4], c.P.neve[3]], { forma: 'floco', passo: 3, vx: -1, fps: 5 }),
    animPisca('brilho-geada', 0, 74, 320, 100, 9, 5, (c) => [c.P.neve[4], 0xffffff], { cruz: true, sobre: 'chao', fps: 3 }),
  ],
};

export const planalto: ArenaDef = {
  id: 'planalto', nome: 'Planalto Lume', sombra: 'campo',
  paleta: {
    rampas: { ceu: ['#34509c', '#6074bc', '#a08cc8', '#f0b4a4'], nuvem: ['#8478b4', '#d0a0b8', '#ffd8c0'], astro: ['#ffe9a0', '#fff8d8'], campo: ['#3c4458', '#586c54', '#80985c', '#b0bc6c', '#dcd88c'], canion: ['#44284c', '#74385c', '#a85464', '#d88474', '#f4bc94'], pedra: ['#2c2c50', '#50547c', '#8088a4', '#b8c0c8'], cupula: ['#506088', '#8ca0c0', '#d0dce8', '#ffe890'], folha: ['#1c3444', '#2c5c50', '#4c8858', '#8cb868'] },
    emissivas: [], noite: { ...NOITE, cupula: ['#1c2448', '#38446c', '#6c7ca0', '#ffe890'] },
  },
  pintar(c) {
    const { fundo, cenario, chao, P, noite } = c, yh = yhOnda(68, 2, 90, 111);
    ceuBioma(fundo, c, { ate: 60, nuvens: [[10, 40, 80], [220, 34, 70]], astro: [56, 16, 6], s: 9 });
    if (noite) { // via láctea
      fundo.campo(0, 0, 319, 50, (x, y) => (Math.abs(y - 8 - x * 0.1) < 4 + fbm(x, y, 14, 3) * 6 && h(x, y, 5) > 0.9 ? P.astro[0] : VAZIO));
    }
    // cânions ao longe e o observatório numa colina
    serra(fundo, 64, 20, 60, P.canion, 4, { perfil: (x) => 64 - (x > 180 ? 14 + Math.round(fbm(x, 0, 20, 2) * 3) * 4 : x < 90 ? 8 + Math.round(fbm(x, 0, 22, 4) * 3) * 3 : 3 + fbm(x, 0, 30, 6) * 3), ate: 66 });
    fundo.ret(0, 66, 320, 114, P.campo[2]);
    serra(cenario, 70, 22, 40, [P.campo[0], P.campo[1], P.campo[2], P.campo[3]], 6, { perfil: (x) => 70 - Math.max(0, 22 - ((x - 132) / 9) ** 2), ate: 70 });
    cenario.ret(122, 38, 20, 12, P.cupula[1]); cenario.vl(141, 38, 49, P.cupula[0]);
    cenario.elipse(132, 38, 10, 9, (x, y, nx, ny) => (y > 38 ? VAZIO : nx + ny < -0.6 ? P.cupula[2] : nx > 0.5 ? P.cupula[0] : P.cupula[1]));
    cenario.linha(132, 30, 138, 34, P.pedra[0], 2); cenario.ret(126, 42, 3, 4, P.cupula[3]); cenario.ret(134, 42, 3, 4, P.cupula[3]);
    // menires com constelações gravadas
    const menir = (t: Tela, x: number, yb: number, a: number, l: number, s: number) => { for (let i = 0; i <= a; i++) { const w = l * (1 - (i / a) ** 3 * 0.6); for (let px = Math.round(x - w / 2); px <= x + w / 2; px++) { const u = (px - (x - w / 2)) / w; t.p(px, yb - i, u < 0.25 ? P.pedra[3] : u < 0.7 ? P.pedra[2] : px >= Math.round(x + w / 2) ? P.pedra[0] : P.pedra[1]); } } for (let i = 0; i < 4; i++) t.p(x - 1 + ((i * 3 + s) % 4) - 1, yb - a * 0.3 - i * a * 0.14, P.cupula[3]); };
    menir(cenario, 34, 70, 22, 7, 1); menir(cenario, 250, 70, 18, 6, 2); menir(cenario, 290, 70, 26, 8, 3);
    chaoNatural(chao, { yh, r: P.campo, s: 1100, aberto: true, tufos: 90 });
    menir(chao, 18, 124, 60, 16, 4); menir(chao, 302, 132, 72, 18, 5);
    mancha(chao, 20, 126, 16, 3, P.campo[0], 3, 0.3, 6); mancha(chao, 304, 134, 18, 3, P.campo[0], 4, 0.3, 6);
    pedra(chao, 64, 150, 12, 6, P.pedra, 3); pedra(chao, 240, 104, 8, 4, P.pedra, 5); pedra(chao, 150, 166, 9, 5, P.pedra, 7);
    canteiroFlores(chao, 180, 96, 22, 4, 7, [P.canion[1], P.canion[2], P.canion[3], P.canion[4]], P.astro[1], 3);
    canteiroFlores(chao, 110, 160, 20, 5, 6, [P.ceu[0], P.ceu[1], P.ceu[2], P.nuvem[2]], P.astro[1], 4);
    capim(chao, 200, 178, 9, 14, P.campo, 3); capim(chao, 90, 179, 8, 12, P.campo, 5);
  },
  anims: [
    animPisca('estrelas', 0, 0, 320, 56, 14, 3, (c) => [c.P.astro[0], c.P.astro[1]], { cruz: true, sobre: 'fundo', fps: 3, so: 'noite' }),
    animQueda('vento', 0, 60, 320, 110, 8, 12, (c) => [c.P.campo[4]], { vx: 5, passo: 1, forma: 'ponto', fps: 6 }),
    animPisca('lume', 10, 70, 300, 100, 8, 23, (c) => [c.P.cupula[3], 0xffffff], { fps: 3 }),
  ],
};

/** Pico Pindorama: laje de pedra acima do mar de nuvens, diante do Portão dos Guardiões. */
export const pico: ArenaDef = {
  id: 'pico', nome: 'Pico Pindorama', sombra: 'laje',
  paleta: {
    rampas: { ceu: ['#2444a4', '#3c6cc8', '#6c9ce0', '#a8ccec'], nuvem: ['#8cacd8', '#d0e0f0', '#ffffff'], astro: ASTRO, laje: ['#3c3c64', '#5c6484', '#848ca0', '#a8b4b8', '#d0dccc'], serra: ['#34488c', '#5068a8', '#7890c0', '#a8bcd8'], ouro: ['#8c5414', '#d89424', '#fcd04c', '#fff8a8'], musgo: ['#1c4444', '#2c7050', '#4ca058', '#94d068'], faixa: ['#74204c', '#c03458', '#f0607c', '#ffc0c0'] },
    noite: NOITE,
  },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(68, 1.5, 60, 121);
    ceuBioma(fundo, c, { ate: 50, astro: [270, 16, 9], s: 5 });
    serra(fundo, 58, 34, 60, P.serra, 5, { ate: 60, neve: [P.nuvem[0], P.nuvem[1], P.nuvem[2]], perfil: (x) => 58 - Math.max(0, 30 - Math.abs(x - 40) * 0.7) - Math.max(0, 22 - Math.abs(x - 290) * 0.6) - fbm(x, 0, 14, 3) * 5 });
    // mar de nuvens
    for (let i = 0; i < 9; i++) { const x = -20 + i * 40; fundo.campo(0, 44, 319, 70, () => VAZIO); }
    fundo.ret(0, 56, 320, 14, P.nuvem[1]);
    for (let x = -10; x < 330; x += 22) { const y = 56 + Math.round(h(x, 3) * 4); fundo.elipse(x, y, 16, 6, (_x, py) => (py < y - 2 ? P.nuvem[2] : P.nuvem[1])); fundo.elipse(x + 9, y + 6, 14, 3, P.nuvem[0]); }
    fundo.ret(0, 68, 320, 112, P.laje[2]);
    // Portão dos Guardiões
    const pilar = (x: number) => { coluna(cenario, x, 14, 70, 12, [P.laje[0], P.laje[1], P.laje[2], P.laje[4]]); for (let y = 24; y < 64; y += 10) { cenario.ret(x + 4, y, 4, 4, P.ouro[2]); cenario.p(x + 5, y + 1, P.ouro[3]); cenario.hl(x + 4, x + 7, y + 4, P.ouro[0]); } };
    pilar(118); pilar(190);
    cenario.ret(108, 6, 104, 10, P.laje[2]); cenario.hl(108, 211, 6, P.laje[4]); cenario.hl(108, 211, 15, P.laje[0]); cenario.ret(104, 2, 112, 5, P.laje[3]); cenario.hl(104, 215, 2, P.laje[4]); cenario.hl(104, 215, 6, P.laje[0]);
    for (let i = 0; i < 16; i++) { const x = 112 + i * 6; cenario.ret(x, 9, 3, 4, i % 2 ? P.ouro[2] : P.faixa[2]); }
    // folhas do portão com 16 marcas (as insígnias)
    cenario.ret(132, 22, 56, 48, P.laje[1]); cenario.vl(160, 22, 69, P.laje[0]); cenario.vl(159, 22, 69, P.laje[3]);
    for (let i = 0; i < 16; i++) { const x = 137 + (i % 4) * 6 + (i % 8 >= 4 ? 26 : 0), y = 28 + Math.floor(i / 8) * 18 + (i % 2) * 6; cenario.ret(x, y, 3, 3, P.ouro[1]); cenario.p(x, y, P.ouro[3]); }
    // estandartes
    for (const [x, cor] of [[86, P.faixa], [228, P.faixa], [60, P.ouro], [254, P.ouro]] as const) { cenario.vl(x, 26, 70, P.laje[0]); cenario.ret(x + 1, 28, 9, 20, cor[1]); cenario.vl(x + 1, 28, 47, cor[2]); cenario.ret(x + 4, 34, 3, 3, cor[3]); cenario.p(x + 1, 48, cor[1]); cenario.p(x + 9, 48, cor[1]); cenario.p(x + 2, 49, cor[1]); cenario.p(x + 8, 49, cor[1]); }
    chaoNatural(chao, { yh, r: P.laje, s: 1200, liso: true, textura: 'n', tufos: 12, capimR: [P.musgo[0], P.musgo[0], P.musgo[1], P.musgo[2], P.musgo[3]], aberto: true });
    // lajes em perspectiva
    chao.campo(0, 68, 319, 179, (x, y) => { if (chao.g(x, y) === VAZIO) return VAZIO; const z = 140 / (y - 40), wx = (x - 160) * z, li = Math.floor(z * 5), col = Math.floor(wx / 26 + (li & 1) * 0.5 + 50); const fx = (wx / 26 + (li & 1) * 0.5 + 50) - col; const fz = z * 5 - li; return fx * 26 < z * 1.1 || fz < 0.07 * z * z ? P.laje[1] : VAZIO; });
    for (const [x, y, rx, ry, s] of [[40, 100, 24, 5, 1], [280, 160, 30, 8, 2], [150, 172, 26, 5, 3], [300, 92, 16, 3, 4]]) { mancha(chao, x, y, rx, ry, P.musgo[1], s, 0.6, 8); mancha(chao, x - 1, y - 1, rx * 0.6, ry * 0.5, P.musgo[2], s + 6, 0.7, 6); }
    // braseiros dourados nas laterais
    for (const x of [22, 296]) { chao.ret(x, 96, 4, 22, P.laje[1]); chao.vl(x, 96, 117, P.laje[4]); chao.ret(x - 5, 90, 14, 6, P.ouro[1]); chao.hl(x - 5, x + 8, 90, P.ouro[3]); chao.hl(x - 4, x + 7, 95, P.ouro[0]); chao.ret(x - 3, 118, 10, 3, P.laje[0]); }
    pedra(chao, 60, 156, 14, 7, [P.laje[0], P.laje[1], P.laje[3], P.laje[4]], 3); pedra(chao, 246, 110, 8, 4, [P.laje[0], P.laje[1], P.laje[3], P.laje[4]], 6);
  },
  anims: [
    { id: 'braseiros', x: 8, y: 66, w: 304, h: 26, sobre: 'chao', fps: 6, pintar(t, q, c) { for (const x of [24, 298]) for (let j = 0; j < 14; j++) { const lar = Math.round((1 - j / 14) ** 0.8 * 5 + 0.5), des = Math.round(Math.sin((j + q * 2) * 1.3) * (j / 14) * 2); for (let i = -lar; i <= lar; i++) if (h(i, j + q * 3, x) > (j / 14) * 0.35) t.p(x + i + des, 89 - j, Math.abs(i) < lar * 0.4 && j < 8 ? 0xfff8a8 : Math.abs(i) < lar * 0.75 ? 0xfcd04c : 0xe86c2c); } } },
    { id: 'nuvens', x: 0, y: 50, w: 320, h: 18, sobre: 'fundo', fps: 2, pintar(t, q, c) { for (let x = -10; x < 340; x += 44) { const px = x + q * 2, y = 60 + (x % 3); t.hl(px, px + 12, y, c.P.nuvem[2]); t.hl(px + 3, px + 9, y - 1, c.P.nuvem[2]); } } },
  ],
};
void faixaCopas; void agua; void APOIO;
