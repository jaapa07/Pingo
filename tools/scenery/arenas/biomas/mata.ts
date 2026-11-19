import { APOIO, h, type ArenaDef } from '../nucleo';
import { arvore, tronco, galho, copa, faixaCopas, samambaia, bromelia, heliconia, cogumelo, canteiroFlores, troncoCaido, pedra, mancha, capim } from '../pecas';
import { chaoNatural, animQueda, animPisca, yhOnda } from '../comum';

/** Mata Atlântica: clareira entre troncos escuros, dossel em camadas, bromélias e helicônias. */
export const mata: ArenaDef = {
  id: 'mata', nome: 'Mata Atlântica', sombra: 'grama',
  paleta: {
    rampas: {
      longe: ['#0b1e2b', '#102f36', '#17443f', '#215c46', '#2c7550'],
      folha: ['#113a36', '#1d6a40', '#34994a', '#74c653'],
      tronco: ['#2b1b31', '#4d2f37', '#73483a', '#a06f44'],
      grama: ['#14463a', '#1f6e42', '#31964b', '#58b852', '#93d860'],
      flor: ['#8f2a60', '#d9508c', '#f790b2', '#ffd3da'],
      quente: ['#7c2b20', '#cc4f2c', '#f28b3d', '#ffd47c'],
      pedra: ['#2d2c46', '#4c506b', '#7b8296', '#aeb8bb'],
    },
    emissivas: [],
  },
  pintar({ fundo, cenario, chao, P, noite }) {
    const yh = yhOnda(66, 2.5, 40, 3);
    // ---------- fundo: parede de mata distante ----------
    fundo.ret(0, 0, 320, 180, P.longe[1]);
    fundo.campo(0, 0, 319, 70, (x, y) => (Math.abs(((x * 0.9 + Math.sin(y / 9) * 3) % 37) - 18) < 3 + h(Math.floor(x / 37), 0, 2) * 6 ? P.longe[0] : -1));
    for (let i = 0; i < 9; i++) tronco(fundo, 14 + i * 37 + h(i, 5) * 14, -4, 70, 5 + h(i, 6) * 6, [P.longe[0], P.longe[0], P.longe[2], P.longe[3]], i, { casca: false, raiz: 3 });
    faixaCopas(fundo, 0, 320, 14, 30, 8, [P.longe[0], P.longe[1], P.longe[2], P.longe[3]], 5);
    faixaCopas(fundo, 0, 320, 56, 16, 6, [P.longe[0], P.longe[1], P.longe[2], P.longe[3]], 9);
    fundo.ret(0, 66, 320, 114, P.grama[1]);
    // ---------- cenário: troncos médios, dossel e moitas ----------
    const tl = [P.longe[0], P.tronco[0], P.tronco[1], P.tronco[2]];
    [[38, 70, 9], [112, 66, 7], [176, 64, 8], [262, 68, 9]].forEach(([x, yb, l], i) => { tronco(cenario, x, -6, yb, l, tl, 20 + i, { curva: (i % 2 ? 3 : -3) }); galho(cenario, x, 30 + i * 3, x + (i % 2 ? 16 : -16), 14, 3, tl); });
    faixaCopas(cenario, 0, 320, 16, 26, 9, [P.longe[1], P.longe[3], P.longe[4], P.folha[2]], 31, 0.75);
    [[76, 76, 11], [214, 72, 10]].forEach(([x, yb, l], i) => { tronco(cenario, x, -6, yb, l, P.tronco, 40 + i, { curva: i ? -4 : 4, raiz: 9 }); galho(cenario, x, 34, x + (i ? 24 : -22), 16, 4, P.tronco); galho(cenario, x, 44, x + (i ? -18 : 20), 26, 3, P.tronco); });
    faixaCopas(cenario, 0, 320, 6, 20, 10, P.folha, 51, 0.7);
    copa(cenario, 60, 22, 34, 12, P.folha, 61, 8); copa(cenario, 232, 20, 38, 12, P.folha, 62, 8); copa(cenario, 150, 16, 26, 9, P.folha, 63, 8);
    faixaCopas(cenario, 0, 320, 66, 6, 5, [P.longe[0], P.longe[2], P.longe[3], P.longe[4]], 71, 0.9);
    copa(cenario, 16, 64, 24, 11, P.folha, 72, 6); copa(cenario, 138, 63, 20, 8, P.folha, 73, 6); copa(cenario, 304, 62, 24, 12, P.folha, 74, 6); copa(cenario, 196, 66, 12, 6, P.folha, 75, 5);
    // ---------- chão ----------
    chaoNatural(chao, { yh, r: P.grama, s: 100 });
    // árvores mais próximas, já pisando a clareira
    tronco(chao, 286, -6, 88, 15, P.tronco, 76, { curva: -3, raiz: 10 }); galho(chao, 286, 40, 262, 22, 4, P.tronco);
    tronco(chao, 52, -6, 84, 13, P.tronco, 77, { curva: 3, raiz: 10 }); galho(chao, 52, 46, 74, 26, 4, P.tronco);
    copa(chao, 276, 18, 40, 14, P.folha, 78, 9); copa(chao, 50, 20, 36, 13, P.folha, 79, 9);
    // tronco grande à direita em primeiro plano e raízes
    tronco(chao, 312, -6, 122, 30, P.tronco, 81, { curva: -5, raiz: 14 });
    copa(chao, 300, 4, 44, 14, P.folha, 82, 10);
    tronco(chao, 2, -6, 96, 20, P.tronco, 83, { curva: 4, raiz: 12 });
    copa(chao, 14, 2, 40, 13, P.folha, 84, 10);
    // tronco caído, cogumelos, pedras
    troncoCaido(chao, 6, 110, 62, 12, P.tronco, 85);
    mancha(chao, 40, 123, 36, 3, P.grama[0], 86, 0.3, 8);
    cogumelo(chao, 58, 108, P.quente, P.flor, true); cogumelo(chao, 66, 110, P.quente, P.flor); cogumelo(chao, 22, 109, P.quente, P.flor);
    pedra(chao, 276, 118, 11, 6, P.pedra, 3); pedra(chao, 290, 124, 7, 4, P.pedra, 5);
    cogumelo(chao, 262, 122, P.quente, P.flor);
    // flores e plantas
    canteiroFlores(chao, 150, 96, 16, 4, 6, P.flor, P.quente[3], 91);
    canteiroFlores(chao, 196, 150, 14, 5, 7, P.flor, P.quente[3], 92);
    canteiroFlores(chao, 120, 164, 12, 4, 5, P.flor, P.quente[3], 93);
    bromelia(chao, 100, 80, 7, P.folha, P.quente); bromelia(chao, 286, 104, 8, P.folha, P.flor);
    heliconia(chao, 14, 96, 16, P.folha, P.quente); heliconia(chao, 180, 76, 11, P.folha, P.quente);
    samambaia(chao, 128, 76, 9, P.folha, 4); samambaia(chao, 250, 80, 10, P.folha, 6);
    // primeiro plano: samambaias escuras nos cantos de baixo
    const esc = [P.longe[0], P.longe[0], P.longe[2], P.folha[1]];
    samambaia(chao, 22, 184, 38, esc, 7); samambaia(chao, 296, 186, 42, esc, 8); samambaia(chao, 170, 188, 22, esc, 9);
    capim(chao, 232, 176, 7, 9, esc, 3);
    if (noite) { /* à noite os cogumelos brilham de leve */ chao.p(58, 104, P.quente[3]); chao.p(APOIO.inimigo.x + 30, 122, P.quente[3]); }
  },
  anims: [
    animQueda('folhas', 40, 20, 240, 120, 9, 5, (c) => [c.P.folha[3], c.P.folha[2], c.P.quente[2]], { fps: 5 }),
    animPisca('vagalumes', 20, 40, 280, 110, 12, 9, () => [0xc8e85a, 0xf6ffb0], { so: 'noite' }),
  ],
};
