import { APOIO, VAZIO, h, fbm, Seq, type ArenaDef, type Tela, type Rampa } from '../nucleo';
import { pedra, mancha, serra, parede, caixa, piso, janela, cogumelo } from '../pecas';
import { chaoNatural, animPisca, animQueda, chama, fumaca, yhOnda } from '../comum';

function estalactites(t: Tela, y0: number, n: number, r: Rampa, s: number, amax = 26) {
  const sq = new Seq(s);
  for (let i = 0; i < n; i++) {
    const x = sq.int(0, 319), a = sq.int(6, amax), l = 2 + a * 0.22;
    for (let j = 0; j < a; j++) { const w = l * (1 - j / a) ** 0.8; for (let px = Math.round(x - w); px <= x + w; px++) { const u = (px - (x - w)) / (2 * w + 0.01); t.p(px, y0 + j, u < 0.3 ? r[3] : u < 0.7 ? r[2] : r[1]); } }
  }
}
function estalagmite(t: Tela, x: number, yb: number, a: number, r: Rampa) {
  for (let j = 0; j < a; j++) { const w = (2 + a * 0.2) * (j / a) ** 0.8; for (let px = Math.round(x - w); px <= x + w; px++) { const u = (px - (x - w)) / (2 * w + 0.01); t.p(px, yb - a + j, u < 0.3 ? r[3] : u < 0.7 ? r[2] : px >= Math.round(x + w) ? r[0] : r[1]); } }
}
function cristal(t: Tela, x: number, yb: number, a: number, r: Rampa, incl = 0) {
  for (let j = 0; j <= a; j++) { const k = j / a, w = k < 0.25 ? k * 4 * a * 0.22 : a * 0.22; const cx = x + incl * (1 - k) * a * 0.5; for (let px = Math.round(cx - w); px <= cx + w; px++) { const u = (px - (cx - w)) / (2 * w + 0.01); t.p(px, yb - a + j, u < 0.35 ? r[3] : u < 0.6 ? r[2] : r[1]); } }
  t.p(x + incl * a * 0.5, yb - a - 1, r[3]);
}

export const caverna: ArenaDef = {
  id: 'caverna', nome: 'Gruta', interna: true, sombra: 'chao',
  paleta: { rampas: { rocha: ['#14122c', '#221f44', '#34305c', '#4c4878', '#686898'], chao: ['#1c1a38', '#343054', '#544c70', '#74708c', '#9c9ca8'], cristal: ['#1c5c9c', '#34a4d4', '#84e4f0', '#e8ffff'], agua: ['#143c64', '#1c5c88', '#3c8cac', '#8cd0d8'], musgo: ['#143c3c', '#1c6450', '#3c9460', '#84c874'], fungo: ['#a84c1c', '#f08c34', '#ffd074', '#fff8d0'] } },
  pintar({ fundo, cenario, chao, P }) {
    const yh = yhOnda(68, 3, 40, 131);
    fundo.ret(0, 0, 320, 180, P.rocha[1]);
    fundo.campo(0, 0, 319, 72, (x, y) => { const n = fbm(x + Math.sin(y / 7) * 4, y * 1.6, 26, 3); return n > 0.62 ? P.rocha[2] : n < 0.36 ? P.rocha[0] : VAZIO; });
    // boca de galeria ao fundo com claridade azul
    fundo.elipse(160, 56, 34, 22, (x, y, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.8 ? P.rocha[0] : d > 0.45 ? P.agua[0] : P.agua[1]; });
    fundo.ret(0, 68, 320, 112, P.chao[1]);
    serra(cenario, 72, 30, 30, [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[3]], 5, { perfil: (x) => 72 - Math.max(0, 40 - x * 0.7) - Math.max(0, (x - 250) * 0.6) - fbm(x, 0, 16, 4) * 8, ate: 72 });
    estalactites(cenario, 0, 30, [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[3]], 3, 30);
    estalactites(cenario, 0, 14, [P.rocha[0], P.rocha[2], P.rocha[3], P.rocha[4]], 9, 18);
    cenario.ret(0, 0, 320, 4, P.rocha[0]);
    for (const [x, a] of [[96, 14], [132, 9], [204, 16], [238, 10]]) estalagmite(cenario, x, 70, a, [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[3]]);
    cristal(cenario, 60, 70, 16, P.cristal, -0.3); cristal(cenario, 66, 70, 10, P.cristal, 0.3); cristal(cenario, 270, 70, 14, P.cristal, 0.2);
    chaoNatural(chao, { yh, r: P.chao, s: 1300, liso: true, textura: 'g', tufos: 0 });
    // poça com reflexo
    chao.campo(180, 130, 319, 172, (x, y) => { const dx = (x - 256) / 50, dy = (y - 150) / 12, d = dx * dx + dy * dy - (fbm(x, y * 2, 12, 5) - 0.5) * 0.7; return d > 1.12 ? VAZIO : d > 1 ? P.chao[0] : h(Math.floor((x + y * 3) / 7), y, 3) > 0.84 ? P.agua[3] : dy < -0.2 ? P.agua[2] : P.agua[1]; });
    estalagmite(chao, 20, 112, 40, [P.rocha[0], P.rocha[2], P.rocha[3], P.rocha[4]]); estalagmite(chao, 38, 120, 22, [P.rocha[0], P.rocha[2], P.rocha[3], P.rocha[4]]); estalagmite(chao, 304, 118, 46, [P.rocha[0], P.rocha[2], P.rocha[3], P.rocha[4]]);
    cristal(chao, 286, 122, 22, P.cristal, -0.25); cristal(chao, 294, 124, 14, P.cristal, 0.3); cristal(chao, 54, 126, 12, P.cristal, 0.3); cristal(chao, 140, 80, 8, P.cristal, -0.2);
    pedra(chao, 110, 160, 16, 8, [P.rocha[0], P.chao[1], P.chao[2], P.chao[4]], 3); pedra(chao, 132, 168, 8, 5, [P.rocha[0], P.chao[1], P.chao[2], P.chao[4]], 5); pedra(chao, 200, 96, 9, 5, [P.rocha[0], P.chao[1], P.chao[2], P.chao[4]], 7);
    for (const [x, y, rx, ry, s] of [[70, 150, 18, 4, 1], [180, 172, 16, 4, 2]]) { mancha(chao, x, y, rx, ry, P.musgo[1], s, 0.6, 7); mancha(chao, x, y - 1, rx * 0.6, ry * 0.5, P.musgo[2], s + 4, 0.7, 5); }
    cogumelo(chao, 76, 146, P.fungo, P.chao, true); cogumelo(chao, 84, 150, P.fungo, P.chao); cogumelo(chao, 176, 170, P.fungo, P.chao);
    // moldura escura de rocha em primeiro plano
    chao.campo(0, 150, 319, 179, (x, y) => (y > 172 + Math.sin(x / 13) * 3 - Math.max(0, 40 - Math.abs(x - 160) * 0.1) * 0 + fbm(x, 0, 20, 8) * 5 ? P.rocha[0] : VAZIO));
  },
  anims: [
    animPisca('cristais', 40, 50, 270, 80, 9, 5, (c) => [c.P.cristal[2], c.P.cristal[3]], { cruz: true, fps: 3, sobre: 'chao' }),
    animQueda('goteira', 60, 20, 200, 60, 4, 3, (c) => [c.P.agua[3]], { forma: 'ponto', passo: 9, vx: 0, fps: 5 }),
  ],
};

/** Canos, turbinas e passarelas da Usina Velha. */
function cano(t: Tela, x0: number, y0: number, x1: number, y1: number, esp: number, r: Rampa) {
  const horiz = y0 === y1;
  for (let i = 0; i <= (horiz ? x1 - x0 : y1 - y0); i++) for (let j = 0; j < esp; j++) { const u = j / (esp - 1); const c = (i % 14 === 0) ? r[0] : u < 0.25 ? r[3] : u < 0.6 ? r[2] : r[1]; if (horiz) t.p(x0 + i, y0 + j, c); else t.p(x0 + j, y0 + i, c); }
}
function turbina(t: Tela, x: number, yb: number, rad: number, r: Rampa, luz: Rampa) {
  t.ret(x - rad - 3, yb - 5, rad * 2 + 6, 5, r[1]); t.hl(x - rad - 3, x + rad + 2, yb - 5, r[3]);
  t.elipse(x, yb - rad - 4, rad, rad, (px, py, nx, ny) => { const d = Math.hypot(nx, ny); if (d > 0.88) return r[0]; if (d < 0.22) return r[3]; const a = Math.atan2(ny, nx); return Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8 + d * 1.5) % 2 ? r[2] : r[1]; });
  t.ret(x - 2, yb - rad * 2 - 9, 5, 5, r[1]); t.ret(x - 1, yb - rad * 2 - 8, 3, 2, luz[2]);
}

export const usina: ArenaDef = {
  id: 'usina', nome: 'Usina Velha', interna: true, sombra: 'piso',
  paleta: { rampas: { tijolo: ['#241c30', '#44303c', '#644444', '#845c50'], aco: ['#1c2438', '#38485c', '#607888', '#98b0b4'], piso: ['#242838', '#3c4450', '#586068', '#7c8480', '#a4a898'], ferrugem: ['#5c2418', '#984424', '#cc7434', '#f0b05c'], raio: ['#c88c14', '#fcd834', '#fff8a0', '#ffffff'], vidro: ['#1c3c54', '#346c7c', '#6cb0a8', '#c4ecd0'], faixa: ['#201c28', '#e8b82c', '#fce468'] }, emissivas: ['raio'] },
  pintar({ fundo, cenario, chao, P }) {
    parede(fundo, 0, 0, 320, 72, P.tijolo, 14, 7, 3);
    for (const x of [22, 96, 170, 244]) { janela(fundo, x, 8, 44, 34, P.aco, P.vidro, true); for (let i = 1; i < 4; i++) fundo.vl(x + i * 11, 12, 41, P.aco[1]); fundo.hl(x + 2, x + 41, 24, P.aco[1]);
      // vidros quebrados
      fundo.ret(x + 12, 25, 10, 8, P.tijolo[0]); fundo.p(x + 13, 26, P.vidro[3]); fundo.ret(x + 34, 14, 8, 9, P.tijolo[0]); }
    fundo.ret(0, 70, 320, 110, P.piso[1]);
    // viga-ponte rolante, canos e turbinas
    caixa(cenario, 0, 0, 320, 6, P.aco); for (let x = 6; x < 320; x += 16) { cenario.linha(x, 5, x + 8, 0, P.aco[0]); cenario.linha(x + 8, 0, x + 16, 5, P.aco[0]); }
    cenario.vl(206, 6, 22, P.aco[0]); cenario.ret(202, 22, 9, 4, P.ferrugem[1]); cenario.carimbo(204, 26, ['.a.', '.a.', 'a.a', 'aa.'], { a: P.aco[3] });
    cano(cenario, 0, 46, 319, 46, 6, P.ferrugem); cano(cenario, 80, 0, 80, 46, 5, P.aco); cano(cenario, 290, 6, 290, 70, 6, P.ferrugem);
    turbina(cenario, 40, 72, 16, P.aco, P.raio); turbina(cenario, 122, 72, 13, P.aco, P.raio); turbina(cenario, 250, 72, 17, P.aco, P.raio);
    // painel de controle
    caixa(cenario, 156, 44, 46, 28, P.aco); cenario.ret(160, 48, 16, 9, P.vidro[0]); cenario.linha(161, 54, 165, 50, P.raio[1]); cenario.linha(165, 50, 169, 55, P.raio[1]); cenario.linha(169, 55, 174, 49, P.raio[1]);
    for (let i = 0; i < 4; i++) { cenario.ret(180 + i * 5, 48, 3, 3, i % 2 ? P.ferrugem[2] : P.vidro[2]); cenario.ret(180 + i * 5, 54, 3, 3, i === 1 ? P.raio[1] : P.aco[0]); cenario.vl(161 + i * 10, 62, 67, P.aco[0]); cenario.p(161 + i * 10, 61 + (i % 3), P.ferrugem[3]); }
    piso(chao, 68, P.piso[2], P.piso[3], P.piso[1], 'lajes', { fuga: 30, tam: 30 });
    // desgaste, poças de óleo e faixa de segurança
    chao.campo(0, 68, 319, 179, (x, y) => { const n = fbm(x, y * 2, 24, 4), c = chao.g(x, y); return y - 68 < 4 + n * 5 ? P.piso[0] : n > 0.74 && c !== P.piso[1] ? P.piso[1] : VAZIO; });
    chao.campo(0, 72, 319, 76, (x, y) => (Math.floor((x + y) / 5) % 2 ? P.faixa[1] : P.faixa[0]));
    for (const p of [APOIO.inimigo, APOIO.jogador]) { const rx = p === APOIO.inimigo ? 34 : 46, ry = p === APOIO.inimigo ? 8 : 11; chao.elipse(p.x, p.y + 1, rx, ry, (x, y, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.8 ? (Math.floor((x + y * 2) / 5) % 2 ? P.faixa[1] : P.faixa[0]) : d > 0.7 ? P.piso[0] : P.piso[4]; }); mancha(chao, p.x + 4, p.y + 2, rx * 0.6, ry * 0.5, P.piso[3], p.x, 0.5, 7); }
    mancha(chao, 170, 150, 22, 5, P.aco[0], 4, 0.5, 8); mancha(chao, 168, 149, 10, 2, P.vidro[1], 5, 0.5, 5);
    // caixotes, tambor e cabos em primeiro plano
    caixa(chao, 2, 128, 30, 26, P.ferrugem); chao.linha(4, 130, 29, 151, P.ferrugem[0]); chao.linha(29, 130, 4, 151, P.ferrugem[0]); caixa(chao, 10, 108, 22, 20, P.ferrugem); chao.hl(12, 29, 118, P.ferrugem[0]);
    for (let j = 0; j < 30; j++) for (let i = 0; i < 18; i++) { const u = i / 17; chao.p(290 + i, 120 + j, j % 10 === 0 ? P.aco[0] : u < 0.25 ? P.aco[3] : u < 0.7 ? P.aco[2] : P.aco[1]); } chao.elipse(298.5, 120, 9, 3, P.aco[1]); chao.ret(294, 130, 9, 7, P.faixa[1]); chao.carimbo(297, 131, ['.a.', 'aa.', '.aa', '.a.'], { a: P.faixa[0] });
    for (let x = 0; x < 120; x++) { const y = 172 + Math.round(Math.sin(x / 14) * 3); chao.p(x + 180, y, P.aco[0]); chao.p(x + 180, y - 1, P.ferrugem[1]); }
  },
  anims: [
    { id: 'faiscas', x: 150, y: 20, w: 150, h: 60, sobre: 'cenario', fps: 8, pintar(t, q, c) {
      const R = c.P.raio;
      if (q === 0 || q === 2) { let x = 206, y = 30; for (let i = 0; i < 9; i++) { const nx = x + ((i * 7 + q * 3) % 5) - 2, ny = y + 3; t.linha(x, y, nx, ny, i % 3 ? R[1] : R[3]); x = nx; y = ny; } }
      for (let i = 0; i < 6; i++) { const a = i * 1.1 + q, d = 3 + q * 2; t.p(206 + Math.cos(a) * d, 58 + Math.sin(a) * d * 0.6, q < 2 ? R[2] : R[0]); }
      t.ret(185, 54, 3, 3, q % 2 ? R[1] : R[0]);
    } },
    { id: 'turbinas', x: 20, y: 30, w: 250, h: 44, sobre: 'cenario', fps: 6, pintar(t, q, c) { for (const [x, rad] of [[40, 16], [122, 13], [250, 17]]) { const cy = 72 - rad - 4; for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + (q * Math.PI) / 8; for (let d = rad * 0.3; d < rad * 0.82; d++) t.p(x + Math.cos(a) * d, cy + Math.sin(a) * d, c.P.aco[3]); } t.ret(x - 1, 72 - rad * 2 - 8, 3, 2, q % 2 ? c.P.raio[2] : c.P.raio[0]); } } },
  ],
};

export const vulcao: ArenaDef = {
  id: 'vulcao', nome: 'Caverna Vulcânica', interna: true, sombra: 'basalto',
  paleta: { rampas: { rocha: ['#180c1c', '#2c1424', '#481c28', '#682c2c', '#8c4434'], basalto: ['#1c1420', '#342430', '#503840', '#705458', '#947870'], lava: ['#a41c14', '#e84c14', '#fc9c24', '#ffe46c', '#ffffd0'], brilho: ['#6c1c1c', '#a43020', '#d0502c'], cinza: ['#4c3c48', '#7c686c', '#b09c94'] }, emissivas: ['lava'] },
  pintar({ fundo, cenario, chao, P }) {
    const yh = yhOnda(68, 3, 40, 141);
    fundo.ret(0, 0, 320, 180, P.rocha[1]);
    fundo.campo(0, 0, 319, 72, (x, y) => { const n = fbm(x + Math.sin(y / 7) * 4, y * 1.6, 26, 5); const brilho = y > 40 + fbm(x, 0, 30, 2) * 14; return brilho ? (n > 0.55 ? P.brilho[1] : P.brilho[0]) : n > 0.62 ? P.rocha[2] : n < 0.36 ? P.rocha[0] : VAZIO; });
    // cascata de lava ao fundo e rio incandescente
    for (const [x, w] of [[110, 12], [214, 8]]) fundo.campo(x - w, 0, x + w, 66, (px, py) => { const m = x + Math.sin(py / 22 + x) * 1.5, d = Math.abs(px - m) / (w * 0.5 + py * 0.03); return d > 1 ? VAZIO : d > 0.8 ? P.lava[0] : h(px >> 1, Math.floor(py / 5), 3) > 0.72 ? P.lava[3] : d > 0.45 ? P.lava[1] : P.lava[2]; });
    fundo.campo(0, 58, 319, 72, (x, y) => { const n = fbm(x, y * 3, 14, 7); return y > 60 + Math.sin(x / 30) * 2 ? (n > 0.62 ? P.lava[3] : n > 0.4 ? P.lava[2] : P.lava[1]) : VAZIO; });
    fundo.ret(0, 70, 320, 110, P.basalto[1]);
    serra(cenario, 72, 30, 30, [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[3]], 5, { perfil: (x) => 72 - Math.max(0, 44 - x * 0.8) - Math.max(0, (x - 256) * 0.7) - Math.max(0, 10 - Math.abs(x - 160) * 0.3) - fbm(x, 0, 14, 4) * 5, ate: 72 });
    estalactites(cenario, 0, 26, [P.rocha[0], P.rocha[1], P.rocha[2], P.rocha[4]], 6, 26);
    cenario.ret(0, 0, 320, 4, P.rocha[0]);
    chaoNatural(chao, { yh, r: P.basalto, s: 1400, liso: true, textura: 'g', tufos: 0 });
    // fendas de lava no piso
    const sq = new Seq(11);
    for (let i = 0; i < 9; i++) {
      let x = sq.int(0, 300), y = sq.int(84, 172);
      const de = ((x - APOIO.inimigo.x) / 50) ** 2 + ((y - APOIO.inimigo.y) / 16) ** 2, dj = ((x - APOIO.jogador.x) / 70) ** 2 + ((y - APOIO.jogador.y) / 22) ** 2;
      if (de < 1 || dj < 1) continue;
      for (let k = 0; k < 26; k++) { chao.p(x, y, k % 6 === 0 ? P.lava[3] : P.lava[2]); chao.p(x, y + 1, P.lava[0]); chao.p(x, y - 1, P.basalto[0]); x += 1; if (k % 4 === 3) y += sq.int(-1, 1); }
    }
    // poça de lava em primeiro plano
    chao.campo(190, 140, 319, 179, (x, y) => { const dx = (x - 268) / 54, dy = (y - 162) / 14, d = dx * dx + dy * dy - (fbm(x, y * 2, 12, 5) - 0.5) * 0.7; return d > 1.2 ? VAZIO : d > 1.06 ? P.basalto[0] : d > 0.92 ? P.lava[0] : fbm(x, y * 2.5, 10, 9) > 0.58 ? P.lava[3] : d > 0.5 ? P.lava[1] : P.lava[2]; });
    pedra(chao, 26, 122, 22, 13, [P.rocha[0], P.basalto[1], P.basalto[2], P.basalto[4]], 3); pedra(chao, 52, 132, 10, 6, [P.rocha[0], P.basalto[1], P.basalto[2], P.basalto[4]], 5); pedra(chao, 300, 112, 18, 12, [P.rocha[0], P.basalto[1], P.basalto[2], P.basalto[4]], 7); pedra(chao, 150, 170, 12, 6, [P.rocha[0], P.basalto[1], P.basalto[2], P.basalto[4]], 9);
    chao.campo(0, 150, 319, 179, (x, y) => (x < 180 && y > 173 + fbm(x, 0, 20, 8) * 5 ? P.rocha[0] : VAZIO));
  },
  anims: [
    { id: 'lava', x: 0, y: 0, w: 320, h: 72, sobre: 'fundo', fps: 5, pintar(t, q, c) { const L = c.P.lava; for (const [x, w] of [[110, 12], [214, 8]]) for (let py = 0; py < 60; py++) for (let px = x - w; px <= x + w; px++) { const m = x + Math.sin(py / 22 + x) * 1.5, d = Math.abs(px - m) / (w * 0.5 + py * 0.03); if (d < 0.7 && h(px >> 1, Math.floor((py - q * 5 + 400) / 5), 3) > 0.72) t.p(px, py, L[4]); } for (let x = 0; x < 320; x++) if (h(Math.floor((x + q * 2) / 6), 3, 4) > 0.7) t.p(x, 64 + Math.round(Math.sin(x / 30) * 2) + (Math.floor((x + q * 2) / 6) % 4), L[4]); } },
    animQueda('brasas', 0, 30, 320, 150, 16, 7, (c) => [c.P.lava[2], c.P.lava[3]], { forma: 'ponto', passo: -3, vx: 1, fps: 6 }),
  ],
};
void chama; void fumaca;
