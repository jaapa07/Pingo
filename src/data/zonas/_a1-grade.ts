/**
 * Apoio das zonas do time A1 (Costa do Sol, passos 1–3): a grade é desenhada à mão em linhas de texto e as
 * posições de prédios, pessoas, itens e passagens são marcadas NA PRÓPRIA grade com um caractere de marca
 * (qualquer caractere fora da legenda de docs/ZONAS.md). `grade()` troca cada marca pelo chão indicado e
 * devolve as coordenadas — assim nenhuma coordenada é digitada duas vezes.
 */
import type { Dir, NpcDef, ObjetoSpawn, Warp, ItemChao } from '../../core/tipos';
import { CATALOGO_EXTERIOR } from '../catalogo-objetos';
import { CATALOGO_INTERIOR } from '../catalogo-interiores';

const LEGENDA = new Set('.,:;"%~dw=#Ttbfcprev<>glxCo+M ');
export type Ponto = [number, number];
export interface Grade {
  mapa: string[]; w: number; h: number;
  /** posição única da marca */
  p(m: string): Ponto;
  /** todas as posições da marca, em ordem de leitura */
  todos(m: string): Ponto[];
}
export function grade(id: string, linhas: string[], marcas: Record<string, string>): Grade {
  const w = linhas[0].length, onde = new Map<string, Ponto[]>();
  const mapa = linhas.map((l, y) => {
    if (l.length !== w) throw new Error(`${id}: linha ${y} tem ${l.length} colunas (esperado ${w})`);
    let s = '';
    for (let x = 0; x < w; x++) {
      const c = l[x];
      if (c in marcas) { const a = onde.get(c) ?? []; a.push([x, y]); onde.set(c, a); s += marcas[c]; }
      else if (LEGENDA.has(c)) s += c;
      else throw new Error(`${id}: caractere sem legenda "${c}" em (${x}, ${y})`);
    }
    return s;
  });
  for (const m of Object.keys(marcas)) if (!onde.has(m)) throw new Error(`${id}: marca "${m}" não aparece na grade`);
  return {
    mapa, w, h: linhas.length,
    p(m) { const a = onde.get(m); if (!a || a.length !== 1) throw new Error(`${id}: marca "${m}" aparece ${a?.length ?? 0} vezes`); return a[0]; },
    todos(m) { const a = onde.get(m); if (!a) throw new Error(`${id}: marca "${m}" ausente`); return a; },
  };
}
const cat = (o: string) => CATALOGO_EXTERIOR[o] ?? CATALOGO_INTERIOR[o];
/** objeto do catálogo com o canto inferior esquerdo na marca */
export function obj(g: Grade, m: string, o: string, extra: Record<string, unknown> = {}): ObjetoSpawn {
  const [x, y] = g.p(m);
  if (!cat(o)) throw new Error(`objeto fora do catálogo: ${o}`);
  return { o, x, y, ...extra };
}
/** tile da porta de um prédio colocado na marca */
export function porta(g: Grade, m: string, o: string): Ponto {
  const [x, y] = g.p(m), c = cat(o);
  if (!c?.porta) throw new Error(`objeto sem porta: ${o}`);
  return [x + c.porta[0], y - c.porta[1]];
}
/** warp de porta do prédio da marca para dentro de uma zona interior */
export function entrada(g: Grade, m: string, o: string, zona: string, x: number, y: number, extra: Partial<Warp> = {}): Warp {
  const [px, py] = porta(g, m, o);
  return { x: px, y: py, para: { zona, x, y, dir: 'n' }, tipo: 'porta', ...extra };
}
/** um warp por tile marcado (bordas e capachos de saída) */
export function saidas(g: Grade, m: string, zona: string, x: number, y: number, dir: Dir, tipo: Warp['tipo'] = 'borda', extra: Partial<Warp> = {}): Warp[] {
  return g.todos(m).map(([wx, wy]) => ({ x: wx, y: wy, para: { zona, x, y, dir }, tipo, ...extra }));
}
/** pessoa na marca; `nome` aparece na caixa de fala */
export function gente(g: Grade, m: string, id: string, sprite: string, nome: string, resto: Partial<NpcDef> = {}): NpcDef {
  const [x, y] = g.p(m);
  return { id, sprite, x, y, nome, ...resto } as NpcDef;
}
/** treinador na marca (id do NPC = id do treinador) */
export function duelista(g: Grade, m: string, id: string, sprite: string, dir: Dir, visao = 4, resto: Partial<NpcDef> = {}): NpcDef {
  const [x, y] = g.p(m);
  return { id, sprite, x, y, dir, treinador: id, visao, ...resto };
}
export function item(g: Grade, m: string, zona: string, it: string, qtd = 1, oculto = false): ItemChao {
  const [x, y] = g.p(m);
  return { x, y, item: it, ...(qtd > 1 ? { qtd } : {}), ...(oculto ? { oculto } : {}), flag: `item:${zona}:${x},${y}` };
}
/** placa de madeira (objeto + texto) na marca */
export function placa(g: Grade, m: string, texto: string): { objeto: ObjetoSpawn; placa: { x: number; y: number; texto: string } } {
  const [x, y] = g.p(m);
  return { objeto: { o: 'placa', x, y }, placa: { x, y, texto } };
}
