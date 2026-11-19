/**
 * Pintor de zonas de INTERIOR: paredes com face de 2 tiles e topo escuro, pisos por padrão do tema,
 * peças da legenda, sombras de parede e os objetos do catálogo. Devolve o mesmo formato do compositor exterior.
 */
import type { ZonaDef } from '../../../src/core/tipos';
import type { TilesetInterior } from '../../../src/data/tilesets/casa';
import { Tela, VAZIO } from '../arenas/nucleo';
import { Img } from '../../pixel/tile';
import type { ZonaPintada } from '../exterior/compositor';
import type { InfoObjeto } from '../exterior/objetos';
import { temaDaZona, type Tema } from './tema';
import { T, PRETO, pisoPx, paredePx, PECAS, PECAS_ALTAS, type Viz } from './tiles';
import { pintarMovel } from './moveis';

const QUADROS = 4;
const MASSA = '# e';
/** caractere → peça padrão (o tema pode trocar em `pecas`) */
export const PADRAO: Record<string, string> = { ',': 'decor', '"': 'mato', '%': 'cascalho', '~': 'agua', d: 'funda', w: 'cascata', '=': 'ponte', g: 'gelo', l: 'lama', o: 'buraco', '+': 'capacho', M: 'balcao', C: 'canteiro', b: 'vaso', f: 'cerca', c: 'cipo', p: 'caixote', r: 'rachada', v: 'degrauS', '<': 'degrauO', '>': 'degrauL' };
export const ALTAS: Record<string, string> = { T: 'coluna', t: 'arvoreta' };
const paraImg = (t: Tela): Img => { const i = new Img(t.w, t.h); i.d.set(t.px); return i; };

export function pintarZonaInterior(ts: TilesetInterior, zona: ZonaDef, catalogo: Record<string, InfoObjeto>, temaFixo?: Tema, assarDinamicos = false): ZonaPintada {
  const tema = temaFixo ?? temaDaZona(ts, zona), def = tema.def;
  const W = zona.mapaChars[0].length, H = zona.mapaChars.length;
  const ch = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? ' ' : zona.mapaChars[y][x]);
  const massa = (x: number, y: number) => MASSA.includes(ch(x, y));
  const quadros = Array.from({ length: QUADROS }, () => new Tela(W * T, H * T));
  const alto = new Tela(W * T, H * T);
  const animado = new Uint8Array(W * H);
  const dinamicos: { c: string; x: number; y: number }[] = [];
  const luzes: [number, number, number][] = [];
  const gramaAlta: [number, number][] = [];
  const escurecer = (c: number): number => { for (const r of Object.values(tema.R)) { const i = r.indexOf(c); if (i > 0) return r[i - 1]; } return c; };

  for (let q = 0; q < QUADROS; q++) {
    const t = quadros[q];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = ch(x, y), ox = x * T, oy = y * T;
      const viz: Viz = { n: ch(x, y - 1), s: ch(x, y + 1), l: ch(x + 1, y), o: ch(x - 1, y) };
      if (c === ' ') { t.ret(ox, oy, T, T, PRETO); continue; }
      if (c === '#' || c === 'e') {
        // face (até 2 tiles acima do piso) ou topo
        const face1 = !massa(x, y + 1), face2 = !face1 && massa(x, y + 1) && !massa(x, y + 2) && ch(x, y + 1) !== ' ';
        if (face1 || face2) {
          const alt = face1 && !massa(x, y - 1) ? 16 : 32, base = face1 ? alt - 16 : 0;
          for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) t.p(ox + i, oy + j, paredePx(def.parede, ox + i, base + j, alt, tema));
          if (c === 'e') { const r = tema.R.madeira; for (const i of [4, 11]) { t.vl(ox + i, oy, oy + 15, r[3]); t.vl(ox + i + 1, oy, oy + 15, r[0]); } for (let j = 2; j < T; j += 4) { t.hl(ox + 4, ox + 12, oy + j, r[2]); t.hl(ox + 5, ox + 11, oy + j + 1, r[0]); } }
        } else {
          const r = tema.R.teto;
          t.ret(ox, oy, T, T, r[1]);
          const borda = (cx: number, cy: number) => !massa(cx, cy) || (massa(cx, cy) && !massa(cx, cy + 1)) || (massa(cx, cy) && massa(cx, cy + 1) && !massa(cx, cy + 2) && ch(cx, cy + 1) !== ' ');
          if (ch(x, y - 1) !== ' ' && !massa(x, y - 1)) { t.ret(ox, oy, T, 3, r[2]); t.hl(ox, ox + 15, oy + 3, r[0]); t.hl(ox, ox + 15, oy, r[3]); }
          if (ch(x + 1, y) !== ' ' && borda(x + 1, y)) { t.ret(ox + 13, oy, 3, T, r[2]); t.vl(ox + 12, oy, oy + 15, r[0]); }
          if (ch(x - 1, y) !== ' ' && borda(x - 1, y)) { t.ret(ox, oy, 3, T, r[2]); t.vl(ox + 3, oy, oy + 15, r[0]); }
          if (massa(x, y + 1) && !massa(x, y + 2) && ch(x, y + 1) === '#' && ch(x, y + 2) !== ' ') { /* topo logo acima da face de 1 tile */ }
          if (borda(x, y + 1) && massa(x, y + 1)) { t.ret(ox, oy + 12, T, 4, r[2]); t.hl(ox, ox + 15, oy + 11, r[0]); t.hl(ox, ox + 15, oy + 15, r[3]); }
        }
        continue;
      }
      // piso de base
      const tipo = c === ':' ? def.corredor : c === ';' ? def.alt : c === '%' ? def.alt : def.piso;
      const rp = c === ':' || c === ';' ? tema.R.piso2 : tema.R.piso;
      const semBase = (c === ':' && def.pecas?.[':'] === 'esteira') || c === '~' || c === 'd' || c === 'w';
      if (!semBase) for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) t.p(ox + i, oy + j, pisoPx(c === ':' && def.pecas?.[':'] ? def.piso : tipo, ox + i, oy + j, c === ':' && def.pecas?.[':'] ? tema.R.piso : rp, tema.R.piso2));
      // peça do caractere
      const nome = c === 'x' ? def.perigo ?? 'toxico' : def.pecas?.[c] ?? PADRAO[c];
      // cipó, pedregulho/caixote e rocha rachada somem ou andam no jogo: não são assados (docs/BAKE.md)
      if (nome && PECAS[nome] && (!'cpr'.includes(c) || assarDinamicos)) { if (PECAS[nome]({ t, ox, oy, gx: x, gy: y, q, tema, viz })) animado[y * W + x] = 1; }
      const altaNome = c === 'T' || c === 't' ? def.pecas?.[c] ?? ALTAS[c] : undefined;
      if (altaNome && PECAS_ALTAS[altaNome]) {
        const sp = new Tela(T + 16, T * 2 + 2); // margem para o contorno e peças largas
        const an = PECAS_ALTAS[altaNome](sp, 8, 17, tema, q, x);
        sp.contornar(tema.k);
        for (let j = 0; j < sp.h; j++) for (let i = 0; i < sp.w; i++) { const cor = sp.px[j * sp.w + i]; if (cor === VAZIO) continue; (j < 17 ? (q === 0 ? alto : null) : t)?.p(ox - 8 + i, oy - 17 + j, cor); }
        if (an) animado[y * W + x] = 1;
      }
      // sombras: sob a face da parede e ao lado de parede à esquerda
      if (!semBase && massa(x, y - 1) && ch(x, y - 1) !== ' ') for (let j = 0; j < 3; j++) for (let i = 0; i < T; i++) if (j < 2 || (i + ox) % 2 === 0) t.p(ox + i, oy + j, escurecer(t.g(ox + i, oy + j)));
      if (!semBase && massa(x - 1, y) && ch(x - 1, y) !== ' ') for (let j = 0; j < T; j++) for (let i = 0; i < 2; i++) if (i === 0 || (j + oy) % 2 === 0) t.p(ox + i, oy + j, escurecer(t.g(ox + i, oy + j)));
      if (q === 0) { if ('cpr'.includes(c)) dinamicos.push({ c, x, y }); if (c === '"') gramaAlta.push([x, y]); }
    }
    // objetos do catálogo
    for (const sp of zona.objetos ?? []) {
      const info = catalogo[sp.o];
      if (!info || !info.w) continue;
      const img = pintarMovel(sp.o, info.w, info.h, info.alto, tema, q);
      if (!img) continue;
      const x0 = sp.x * T, y0 = (sp.y + 1) * T - img.h, corte = info.alto * T;
      for (let j = 0; j < img.h; j++) for (let i = 0; i < img.w; i++) { const cor = img.px[j * img.w + i]; if (cor === VAZIO) continue; if (j < corte) { if (q === 0) alto.p(x0 + i, y0 + j, cor); } else t.p(x0 + i, y0 + j, cor); }
      const ext = info as InfoObjeto & { animado?: boolean; luz?: boolean };
      if (ext.animado) for (let ty = sp.y - info.h + 1; ty <= sp.y; ty++) for (let tx = sp.x; tx < sp.x + info.w; tx++) if (tx >= 0 && ty >= 0 && tx < W && ty < H) animado[ty * W + tx] = 1;
      if (q === 0 && ext.luz) luzes.push([x0 + (img.w >> 1), y0 + (img.h >> 1), 20]);
    }
  }
  // objetos animados com parte alta: a parte alta fica com o quadro 0 (só o rodapé anima, como no exterior)
  return { larg: W, alt: H, quadros: quadros.map(paraImg), alto: paraImg(alto), animado, luz: new Uint8Array(W * T * H * T), gramaAlta, dinamicos, luzes, acesas: new Map() };
}

/** Tileset com pintor próprio, no formato que tools/bake-maps.ts carrega. */
export function tilesetProprio(ts: TilesetInterior) {
  return { nome: ts.nome, periodos: false, pintarZona: (zona: ZonaDef, catalogo: Record<string, InfoObjeto>) => pintarZonaInterior(ts, zona, catalogo) };
}
