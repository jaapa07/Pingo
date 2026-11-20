/**
 * Arena "boreal": a do encontro com o Borealce (visitante 182, spec 6.5) no alto do Pico Pindorama, debaixo da aurora
 * que as Lanternas Boreais acendem. Céu de noite funda com cortinas de aurora verdes e violeta, montanha nevada,
 * abetos cobertos de neve, as quatro lanternas da expedição fincadas na neve e flocos caindo.
 * O encontro só acontece de noite: os dois períodos usam a mesma paleta (todas as rampas são emissivas).
 */
import { VAZIO, h, fbm, ruido, Seq, APOIO, type ArenaDef, type Tela, type Rampa, type Ctx } from '../nucleo';
import { ceu, pedra, mancha } from '../pecas';
import { chaoNatural, animQueda, animPisca, yhOnda } from '../comum';

const RAMPAS: Record<string, string[]> = {
  ceu: ['#050818', '#0a1230', '#101c44', '#18285a', '#22386e'],
  astro: ['#9fb4e8', '#e8f0ff', '#ffffff'],
  verde: ['#145a4a', '#1f9a6e', '#3fd68e', '#a8ffd0'],
  violeta: ['#3a1f6a', '#6a3aa8', '#9a6ae0', '#d8b8ff'],
  rocha: ['#141a34', '#1f2a4c', '#2e3e66', '#4a5c88'],
  neve: ['#3c5080', '#5a74a8', '#86a0cc', '#b8cce8', '#e8f2ff'],
  abeto: ['#08121e', '#0f2030', '#183244', '#24485a'],
  lanterna: ['#1a1423', '#7a5a34', '#c98f4e', '#2fa87a', '#6ff0b8', '#e8fff4'],
  halo: ['#4a7c9c', '#6aa8b8'],
};

/** perfil do pico principal (cume à esquerda do centro, longe do apoio do inimigo) e de um morro à direita */
const cume = (x: number) => {
  const pico = x < 112 ? 86 - (x - 24) * (68 / 88) : 18 + (x - 112) * (68 / 118);
  const morro = 86 - Math.max(0, 30 - Math.abs(x - 292) * 0.55);
  return Math.min(Math.max(pico, 18), morro) + (fbm(x, 0, 9, 41) - 0.5) * 5;
};
const CUME_X = 112;

/** abeto nevado: camadas em degraus, neve no alto de cada camada */
function abeto(t: Tela, x: number, yBase: number, alt: number, r: Rampa, neve: Rampa) {
  t.ret(x - 1, yBase - 3, 2, 4, r[0]);
  const camadas = Math.max(3, Math.round(alt / 7));
  for (let k = 0; k < camadas; k++) {
    const topo = yBase - 3 - alt + Math.round((k * alt) / camadas), alto = Math.round(alt / camadas) + 3;
    for (let j = 0; j < alto; j++) {
      const lar = Math.round(((k + 1) / camadas) * (alt * 0.32) * ((j + 1) / alto) + j * 0.3);
      for (let i = -lar; i <= lar; i++) {
        const borda = Math.abs(i) >= lar - 1;
        let c = i < 0 ? r[2] : r[1];
        if (borda) c = r[0];
        if (j === 0 || (j === 1 && Math.abs(i) < lar - 1)) c = i < 1 ? neve[4] : neve[3];
        else if (j === 2 && h(x + i, topo, 5) > 0.55) c = neve[2];
        t.p(x + i, topo + j, c);
      }
    }
  }
  t.p(x, yBase - 4 - alt, neve[4]);
}

/** lanterna boreal fincada na neve (poste, gaiola e vidro aceso) */
function lanterna(t: Tela, x: number, y: number, L: Rampa, aceso: number) {
  t.vl(x, y - 14, y, L[1]); t.vl(x + 1, y - 14, y, L[0]);
  t.carimbo(x - 2, y - 22, ['.kk..', 'kyyk.', 'kgGgk', 'kGwGk', 'kgGgk', '.kkk.'], { k: L[0], y: L[2], g: L[3], G: L[aceso], w: L[5] });
}
const LANTERNAS: [number, number][] = [[22, 150], [300, 150], [150, 100], [292, 104]];

export const boreal: ArenaDef = {
  id: 'boreal', nome: 'Aurora no Pico', sombra: 'neve',
  paleta: { rampas: RAMPAS, emissivas: Object.keys(RAMPAS) },
  apoio: { inimigo: [30, 8], jogador: [40, 11] },
  pintar(c) {
    const { fundo, cenario, chao, P } = c, yh = yhOnda(88, 2, 60, 77);
    ceu(fundo, [[14, P.ceu[0]], [30, P.ceu[1]], [48, P.ceu[2]], [66, P.ceu[3]], [92, P.ceu[4]]]);
    // estrelas (as maiores em cruz)
    const sq = new Seq(1821);
    for (let i = 0; i < 74; i++) {
      const x = sq.int(0, 319), y = sq.int(0, 74), g = sq.n();
      fundo.p(x, y, g > 0.75 ? P.astro[2] : g > 0.4 ? P.astro[1] : P.astro[0]);
      if (g > 0.95) { fundo.p(x - 1, y, P.astro[0]); fundo.p(x + 1, y, P.astro[0]); fundo.p(x, y - 1, P.astro[0]); fundo.p(x, y + 1, P.astro[0]); }
    }
    // brilho parado da aurora no céu (as cortinas vivas são a animação)
    for (let x = 0; x < 320; x++) {
      const y0 = Math.round(26 + Math.sin(x / 37) * 8 + fbm(x, 0, 30, 3) * 8);
      for (let y = y0 + 4; y < y0 + 16; y++) if ((x + y) % 2 === 0) fundo.p(x, y, P.verde[0]);
    }
    // cordilheira distante
    for (let x = 0; x < 320; x++) {
      const y0 = Math.round(80 - fbm(x, 0, 46, 17) * 20);
      for (let y = y0; y <= 90; y++) fundo.p(x, y, y - y0 < 2 ? P.neve[1] : ruido(x, y, 7, 19) > 0.62 ? P.rocha[1] : P.rocha[0]);
    }
    // pico nevado: face da esquerda acesa pela aurora, face da direita na sombra, faixas de rocha à mostra
    for (let x = 0; x < 320; x++) {
      const y0 = Math.round(cume(x)), esq = x < CUME_X && cume(x + 2) < cume(x) - 0.3;
      for (let y = y0; y <= 90; y++) {
        const prof = y - y0, alt = (90 - y) / 72;
        let cor = esq ? P.neve[3] : P.neve[1];
        if (esq && prof < 3) cor = P.neve[4];
        if (!esq && prof < 2) cor = P.neve[2];
        const rocha = ruido(x * 0.6 + y * 0.8, y * 1.4, 8, 23) + (1 - alt) * 0.25;
        if (rocha > 0.78) cor = esq ? P.rocha[3] : P.rocha[2];
        else if (rocha > 0.7) cor = esq ? P.neve[2] : P.rocha[1];
        if (y > 80 && ruido(x, y, 10, 29) > 0.55) cor = esq ? P.neve[2] : P.neve[0];
        fundo.p(x, y, cor);
      }
    }
    fundo.ret(0, 88, 320, 92, P.neve[2]);
    // abetos nevados no horizonte (fora do apoio do inimigo)
    for (const [x, y, a] of [[10, 94, 30], [30, 92, 22], [52, 95, 36], [76, 92, 18], [176, 91, 16], [192, 92, 20], [284, 93, 30], [304, 95, 38]] as const) abeto(cenario, x, y, a, P.abeto, P.neve);
    chaoNatural(chao, { yh, r: P.neve, s: 1400, liso: true, textura: 'g', tufos: 0, aberto: true });
    // halos verdes das lanternas na neve e as quatro lanternas
    for (const [x, y] of LANTERNAS) {
      mancha(chao, x, y + 1, 14, 3, P.halo[0], x + y, 0.3, 6);
      mancha(chao, x, y + 1, 8, 2, P.halo[1], x + y + 3, 0.3, 5);
      lanterna(chao, x, y, P.lanterna, 4);
    }
    pedra(chao, 56, 164, 13, 6, [P.rocha[0], P.rocha[1], P.rocha[2], P.neve[4]], 3);
    pedra(chao, 254, 166, 9, 4, [P.rocha[0], P.rocha[1], P.rocha[2], P.neve[4]], 6);
    pedra(chao, 118, 98, 6, 3, [P.rocha[0], P.rocha[1], P.rocha[2], P.neve[4]], 8);
    // pegadas de cascos subindo para o apoio do inimigo
    for (let i = 0; i < 7; i++) { const x = 176 + i * 8, y = 118 - i * 4; chao.p(x, y, P.neve[1]); chao.p(x + 1, y, P.neve[1]); chao.p(x + 3, y + 1, P.neve[1]); chao.p(x + 4, y + 1, P.neve[1]); }
  },
  anims: [
    {
      id: 'aurora', x: 0, y: 0, w: 320, h: 80, sobre: 'fundo', fps: 4,
      pintar(t: Tela, q: number, c: Ctx) {
        const ceuOk = (x: number, y: number) => { const k = c.fundo.g(x, y); return k !== VAZIO && (c.P.ceu.includes(k) || c.P.astro.includes(k) || k === c.P.verde[0]); };
        const fase = (q * Math.PI) / 2;
        /** cortina em colunas de 2 px: topo aceso, corpo, pé que se desfaz em xadrez; `vazio` abre falhas entre as dobras */
        const cortina = (cores: Rampa, base: number, amp: number, onda: number, comp: number, s: number, vazio: number) => {
          for (let x = 0; x < 320; x += 2) {
            if (ruido(x + q * 6, 0, 14, s) < vazio) continue;
            const topo = Math.round(base + Math.sin(x / onda + fase) * amp + Math.sin(x / (onda * 0.43) - fase) * (amp * 0.4) + fbm(x, 0, 24, s) * 6);
            const L = comp + Math.round(Math.sin(x / 9 + fase * 2 + s) * 3 + ruido(x, q, 7, s + 1) * 5);
            for (let j = 0; j < L; j++) {
              const y = topo + j;
              const cor = j === 0 ? cores[3] : j < 3 ? cores[2] : j < L - 5 ? cores[1] : cores[0];
              if (j >= L - 4 && (x / 2 + y + q) % 2) continue;
              for (const dx of [0, 1]) if (ceuOk(x + dx, y)) t.p(x + dx, y, cor);
            }
          }
        };
        cortina(c.P.violeta, 5, 4, 23, 8, 7, 0.42);
        cortina(c.P.verde, 17, 9, 41, 13, 11, 0.28);
      },
    },
    {
      id: 'lanternas', x: 0, y: 70, w: 320, h: 90, sobre: 'chao', fps: 3,
      pintar(t: Tela, q: number, c: Ctx) {
        LANTERNAS.forEach(([x, y], i) => {
          const k = (q + i) % 4, vidro = k === 1 ? 5 : k === 3 ? 3 : 4;
          lanterna(t, x, y, c.P.lanterna, vidro);
          if (k === 1) { t.p(x, y - 23, c.P.lanterna[4]); t.p(x - 3, y - 19, c.P.lanterna[4]); t.p(x + 3, y - 19, c.P.lanterna[4]); }
        });
      },
    },
    animPisca('brilho-neve', 0, 92, 320, 86, 10, 5, (c) => [c.P.neve[4], c.P.verde[3]], { cruz: true, sobre: 'chao', fps: 3 }),
    animQueda('neve', 0, 0, 320, 180, 26, 21, (c) => [c.P.neve[4], c.P.neve[3]], { forma: 'floco', passo: 3, vx: -1, fps: 4 }),
  ],
};
void APOIO;
