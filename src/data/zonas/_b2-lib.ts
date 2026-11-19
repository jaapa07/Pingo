/**
 * Ferramentas de desenho do time B2 (zonas do leste do Sertão das Névoas e Pico Pindorama).
 * Tudo aqui é régua e compasso: retângulos, linhas e carimbos em coordenadas escritas à mão. Nada é sorteado.
 */
import type { ZonaDef, NpcDef, Encontro, Dir, ObjetoSpawn, Warp } from '../../core/tipos';

export class Grade {
  g: string[][];
  constructor(public w: number, public h: number, fundo = '.') { this.g = Array.from({ length: h }, () => Array.from({ length: w }, () => fundo)); }
  private pt(x: number, y: number, c: string) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = c; }
  /** retângulo cheio */
  r(x: number, y: number, w: number, h: number, c: string): this { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pt(x + i, y + j, c); return this; }
  /** moldura de retângulo */
  q(x: number, y: number, w: number, h: number, c: string): this { this.r(x, y, w, 1, c).r(x, y + h - 1, w, 1, c).r(x, y, 1, h, c); return this.r(x + w - 1, y, 1, h, c); }
  /** pontos soltos: p('T', x1, y1, x2, y2, …) */
  p(c: string, ...xy: number[]): this { for (let i = 0; i + 1 < xy.length; i += 2) this.pt(xy[i], xy[i + 1], c); return this; }
  /** linha quebrada por pontos (trechos retos): via(':', x1, y1, x2, y2, …) */
  via(c: string, ...xy: number[]): this {
    for (let i = 0; i + 3 < xy.length; i += 2) {
      const [x1, y1, x2, y2] = [xy[i], xy[i + 1], xy[i + 2], xy[i + 3]];
      const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
      let x = x1, y = y1; this.pt(x, y, c);
      while (x !== x2 || y !== y2) { if (x !== x2) x += dx; else y += dy; this.pt(x, y, c); }
    }
    return this;
  }
  /** carimbo de linhas literais; `_` deixa o que já estava */
  t(x: number, y: number, ...linhas: string[]): this { linhas.forEach((l, j) => [...l].forEach((c, i) => { if (c !== '_') this.pt(x + i, y + j, c); })); return this; }
  /** troca um caractere por outro dentro de um retângulo (ex.: grama alta só onde ainda é chão) */
  troca(x: number, y: number, w: number, h: number, de: string, para: string): this { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (this.g[y + j]?.[x + i] !== undefined && de.includes(this.g[y + j][x + i])) this.g[y + j][x + i] = para; return this; }
  fim(): string[] { return this.g.map((l) => l.join('')); }
}

/** encontro: espécie, nível mínimo, nível máximo, peso */
export const E = (e: number, a: number, b: number, peso: number): Encontro => ({ e, nv: [a, b], peso });

type ExtraNpc = Partial<Omit<NpcDef, 'id' | 'sprite' | 'x' | 'y'>> & { nome?: string };
/** NPC com nome para a caixa de diálogo */
export function npc(id: string, nome: string, sprite: string, x: number, y: number, dir: Dir, fala: string[] | null, extra: ExtraNpc = {}): NpcDef {
  return { id, sprite, x, y, dir, ...(fala ? { fala } : {}), ...extra, nome } as NpcDef;
}
/** treinador de rota */
export const tr = (id: string, sprite: string, x: number, y: number, dir: Dir, extra: ExtraNpc = {}): NpcDef => ({ id, sprite, x, y, dir, treinador: id, ...extra }) as NpcDef;

/** estoque das Vendas do leste do sertão (passos 11–15) */
export const ESTOQUE_BASE = ['cuia-trancada', 'cuia-ouro', 'garrafada', 'elixir-andiroba', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'fumaca-andiroba-forte', 'corda-de-cipo'];

interface Interior { id: string; nome: string; mapa?: 'B' | 'PP'; saida: { zona: string; x: number; y: number }; passo: number }

/** sala retangular: 2 linhas de parede no alto, capacho de saída embaixo */
export function sala(w: number, h: number, porta: number): Grade {
  const g = new Grade(w, h, '.');
  g.r(0, 0, w, 2, '#').r(0, 0, 1, h, '#').r(w - 1, 0, 1, h, '#').r(0, h - 1, w, 1, '#').p('+', porta, h - 1, porta, h - 2);
  return g;
}

/** Posto Guardião: atendente, máquina de cura, Viveiro, rádio e mural; `gente` = visitantes próprios de cada cidade */
export function posto(o: Interior & { mural: string[]; gente: NpcDef[]; mimo?: ObjetoSpawn[] }): ZonaDef {
  const g = sala(14, 10, 6);
  g.r(5, 5, 3, 3, ',');
  return {
    id: o.id, nome: o.nome, mapa: o.mapa ?? 'B', tipo: 'interior', tileset: 'predio', musica: 'posto', arena: 'campo', passo: o.passo,
    mapaChars: g.fim(),
    objetos: [
      { o: 'balcao', x: 5, y: 3 }, { o: 'maquina-cura', x: 8, y: 2 }, { o: 'pc', x: 12, y: 2, script: 'viveiro' }, { o: 'radio', x: 1, y: 2, script: 'radio' },
      { o: 'quadro', x: 3, y: 1, texto: o.mural }, { o: 'janela', x: 10, y: 1 }, { o: 'planta', x: 1, y: 8 }, { o: 'banco-estacao', x: 10, y: 6 },
      ...(o.mimo ?? []),
    ],
    warps: [{ x: 6, y: 9, para: { ...o.saida, dir: 's' }, tipo: 'porta' }],
    npcs: [npc('atendente', 'Atendente', 'npc-atendente-posto', 6, 2, 's', null, { script: 'posto' }), ...o.gente],
  };
}

/** Venda: vendedor atrás do balcão e prateleiras; `gente` e `mimo` diferenciam cada loja */
export function venda(o: Interior & { loja: string[]; fala: string; gente: NpcDef[]; mimo: ObjetoSpawn[] }): ZonaDef {
  const g = sala(12, 9, 5);
  g.r(4, 6, 3, 2, ':');
  return {
    id: o.id, nome: o.nome, mapa: o.mapa ?? 'B', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'campo', passo: o.passo,
    mapaChars: g.fim(),
    objetos: [{ o: 'balcao', x: 1, y: 4 }, { o: 'prateleira', x: 5, y: 2 }, { o: 'prateleira', x: 8, y: 2 }, { o: 'janela', x: 3, y: 1 }, ...o.mimo],
    warps: [{ x: 5, y: 8, para: { ...o.saida, dir: 's' }, tipo: 'porta' }],
    npcs: [npc('vendedor', 'Vendedor', 'npc-vendedor', 2, 3, 's', [o.fala], { loja: o.loja }), ...o.gente],
  };
}

/** casa de morador: cada uma recebe sua própria mobília e gente */
export function casa(o: Interior & { w?: number; h?: number; porta?: number; tema?: string; chao?: (g: Grade) => void; objetos: ObjetoSpawn[]; gente: NpcDef[]; extra?: Partial<ZonaDef>; warps?: Warp[] }): ZonaDef {
  const w = o.w ?? 10, h = o.h ?? 8, porta = o.porta ?? 4;
  const g = sala(w, h, porta);
  o.chao?.(g);
  return {
    id: o.id, nome: o.nome, mapa: o.mapa ?? 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-samba', arena: 'campo', passo: o.passo,
    mapaChars: g.fim(),
    objetos: [...(o.tema ? [{ o: 'tema', x: 0, y: 0, tema: o.tema }] : []), ...o.objetos],
    warps: [{ x: porta, y: h - 1, para: { ...o.saida, dir: 's' }, tipo: 'porta' }, ...(o.warps ?? [])],
    npcs: o.gente,
    ...o.extra,
  };
}
