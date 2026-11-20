/**
 * Apoio das zonas do time B1 (Sertão das Névoas: Vila Cascavel → Arraial Brasa, passos 9–11). Não é zona.
 * As grades são escritas à mão em linhas de texto; prédios, pessoas, itens e passagens são MARCADOS na própria grade
 * com caracteres fora da legenda de docs/ZONAS.md, e `grade()` troca cada marca pelo chão indicado e devolve as
 * coordenadas — nenhuma coordenada é digitada duas vezes. `|` é só régua visual (blocos de 10 colunas).
 *
 * Regra de ouro do time: uma zona com defeito NUNCA derruba o jogo. Nada aqui lança exceção na carga do módulo
 * (o mundo importa todas as zonas de uma vez): os defeitos vão para `ERROS_B1` (lido por tools/verifica-zonas-b1.mts)
 * e para o console; a linha torta é completada/cortada e a marca ausente vira (0, 0).
 */
import type { Dir, NpcDef, ObjetoSpawn, Warp, ItemChao, ZonaDef, Encontro } from '../../core/tipos';
import { CATALOGO_EXTERIOR } from '../catalogo-objetos';
import { CATALOGO_INTERIOR } from '../catalogo-interiores';

export const ERROS_B1: string[] = [];
const erro = (s: string) => { ERROS_B1.push(s); console.error('[zonas B1] ' + s); };

const LEGENDA = new Set('.,:;"%~dw=#Ttbfcprev<>glxCo+M ');
export type Ponto = [number, number];
export interface Grade {
  id: string; mapa: string[]; w: number; h: number;
  /** posição única da marca */
  p(m: string): Ponto;
  /** todas as posições da marca, em ordem de leitura */
  todos(m: string): Ponto[];
}
/** `marcas`: marca → chão que fica no lugar dela */
export function grade(id: string, bruto: string[], marcas: Record<string, string>): Grade {
  const linhas = bruto.map((l) => l.split('|').join(''));
  const w = linhas[0]?.length ?? 1, onde = new Map<string, Ponto[]>();
  const mapa = linhas.map((l0, y) => {
    let l = l0;
    if (l.length !== w) { erro(`${id}: linha ${y} tem ${l.length} colunas (esperado ${w})`); l = (l + ' '.repeat(w)).slice(0, w); }
    let s = '';
    for (let x = 0; x < w; x++) {
      const c = l[x];
      if (c in marcas) { const a = onde.get(c) ?? []; a.push([x, y]); onde.set(c, a); s += marcas[c]; }
      else if (LEGENDA.has(c)) s += c;
      else { erro(`${id}: caractere sem legenda "${c}" em (${x}, ${y})`); s += '.'; }
    }
    return s;
  });
  for (const m of Object.keys(marcas)) if (!onde.has(m)) erro(`${id}: marca "${m}" não aparece na grade`);
  for (const m of Object.keys(marcas)) if (LEGENDA.has(m)) erro(`${id}: a marca "${m}" é um caractere da legenda de docs/ZONAS.md`);
  return {
    id, mapa, w, h: linhas.length,
    p(m) { const a = onde.get(m); if (!a || a.length !== 1) { erro(`${id}: marca "${m}" aparece ${a?.length ?? 0} vezes (esperado 1)`); return a?.[0] ?? [0, 0]; } return a[0]; },
    todos(m) { const a = onde.get(m); if (!a) { erro(`${id}: marca "${m}" ausente`); return []; } return a; },
  };
}
/**
 * Pincel de régua e compasso para as zonas grandes: retângulos, molduras, trilhas e carimbos em coordenadas
 * escritas à mão (nada sorteado). `fim()` devolve as linhas, que depois passam por `grade()` para ler as marcas.
 */
export class Pincel {
  g: string[][];
  constructor(public w: number, public h: number, fundo = '.') { this.g = Array.from({ length: h }, () => Array.from({ length: w }, () => fundo)); }
  private pt(x: number, y: number, c: string) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = c; }
  /** retângulo cheio */
  r(x: number, y: number, w: number, h: number, c: string): this { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pt(x + i, y + j, c); return this; }
  /** moldura de retângulo */
  q(x: number, y: number, w: number, h: number, c: string): this { return this.r(x, y, w, 1, c).r(x, y + h - 1, w, 1, c).r(x, y, 1, h, c).r(x + w - 1, y, 1, h, c); }
  /** pontos soltos: p('T', x1, y1, x2, y2, …) */
  p(c: string, ...xy: number[]): this { for (let i = 0; i + 1 < xy.length; i += 2) this.pt(xy[i], xy[i + 1], c); return this; }
  /** trilha de largura `l` por pontos (trechos retos, primeiro na horizontal): via(':', 2, x1, y1, x2, y2, …) */
  via(c: string, l: number, ...xy: number[]): this {
    for (let i = 0; i + 3 < xy.length; i += 2) {
      const [x1, y1, x2, y2] = [xy[i], xy[i + 1], xy[i + 2], xy[i + 3]];
      this.r(Math.min(x1, x2), y1, Math.abs(x2 - x1) + l, l, c);
      this.r(x2, Math.min(y1, y2), l, Math.abs(y2 - y1) + l, c);
    }
    return this;
  }
  /** carimbo de linhas literais a partir de (x, y); `_` deixa o que já estava */
  t(x: number, y: number, ...linhas: string[]): this { linhas.forEach((l, j) => [...l].forEach((c, i) => { if (c !== '_') this.pt(x + i, y + j, c); })); return this; }
  /** troca caracteres dentro de um retângulo (ex.: grama alta só onde ainda é chão) */
  troca(x: number, y: number, w: number, h: number, de: string, para: string): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = this.g[y + j]?.[x + i]; if (v !== undefined && de.includes(v)) this.g[y + j][x + i] = para; }
    return this;
  }
  /** borda de árvores em volta do mapa inteiro */
  borda(c = 'T', l = 1): this { for (let k = 0; k < l; k++) this.q(k, k, this.w - 2 * k, this.h - 2 * k, c); return this; }
  fim(): string[] { return this.g.map((l) => l.join('')); }
}

const cat = (o: string) => CATALOGO_EXTERIOR[o] ?? CATALOGO_INTERIOR[o];
/** objeto do catálogo com o canto inferior esquerdo na marca */
export function obj(g: Grade, m: string, o: string, extra: Record<string, unknown> = {}): ObjetoSpawn {
  const [x, y] = g.p(m);
  if (!cat(o)) erro(`${g.id}: objeto fora do catálogo: ${o}`);
  return { o, x, y, ...extra };
}
/** um objeto em cada posição da marca repetida */
export function objs(g: Grade, m: string, o: string, extra: Record<string, unknown> = {}): ObjetoSpawn[] {
  if (!cat(o)) erro(`${g.id}: objeto fora do catálogo: ${o}`);
  return g.todos(m).map(([x, y]) => ({ o, x, y, ...extra }));
}
/** tile da porta de um prédio colocado na marca */
export function porta(g: Grade, m: string, o: string): Ponto {
  const [x, y] = g.p(m), c = cat(o);
  if (!c?.porta) { erro(`${g.id}: objeto sem porta: ${o}`); return [x, y]; }
  return [x + c.porta[0], y - c.porta[1]];
}
/** warp de porta do prédio da marca para dentro de uma zona interior */
export function entrada(g: Grade, m: string, o: string, zona: string, x: number, y: number, extra: Partial<Warp> = {}): Warp {
  const [px, py] = porta(g, m, o);
  return { x: px, y: py, para: { zona, x, y, dir: 'n' }, tipo: 'porta', ...extra };
}
/** um warp por tile marcado (bordas, capachos, bocas de caverna) */
export function saidas(g: Grade, m: string, zona: string, x: number, y: number, dir: Dir, tipo: Warp['tipo'] = 'borda', extra: Partial<Warp> = {}): Warp[] {
  return g.todos(m).map(([wx, wy]) => ({ x: wx, y: wy, para: { zona, x, y, dir }, tipo, ...extra }));
}
/** saídas pareadas tile a tile (borda larga): cada tile i da marca leva a (x + i·dx, y + i·dy) */
export function bordas(g: Grade, m: string, zona: string, x: number, y: number, dir: Dir, dx: number, dy: number): Warp[] {
  return g.todos(m).map(([wx, wy], i) => ({ x: wx, y: wy, para: { zona, x: x + i * dx, y: y + i * dy, dir }, tipo: 'borda' }));
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
export function item(g: Grade, m: string, it: string, qtd = 1, oculto = false): ItemChao {
  const [x, y] = g.p(m);
  return { x, y, item: it, ...(qtd > 1 ? { qtd } : {}), ...(oculto ? { oculto } : {}), flag: `item:${g.id}:${x},${y}` };
}
/** placa de madeira (objeto + texto) na marca */
export function placa(g: Grade, m: string, texto: string): { objeto: ObjetoSpawn; placa: { x: number; y: number; texto: string } } {
  const [x, y] = g.p(m);
  return { objeto: { o: 'placa', x, y }, placa: { x, y, texto } };
}
/** encontro: espécie, nível mínimo, nível máximo, peso */
export const E = (e: number, a: number, b: number, peso: number): Encontro => ({ e, nv: [a, b], peso });

/* ------------------------------ serviços de cidade (planta comum do Sertão) ------------------------------ */
interface Visita { sprite: string; nome: string; fala: string[]; mov?: NpcDef['mov'] }
/** Posto Guardião: atendente (script `posto`), máquina de cura, Viveiro, rádio e mural. Entrada em (6, 8). */
export function postoGuardiao(cidade: string, nomeCidade: string, passo: number, arena: string, volta: Ponto, mural: string[], visitas: [Visita, Visita]): ZonaDef {
  const id = `${cidade}-posto`;
  const g = grade(id, [
    '##############',
    '###K######W###',
    '#R..hh.1...V.#',
    '#.....BBB....#',
    '#Q...........#',
    '#.ss.......2.#',
    '#..3..aa.....#',
    '#.....aa....R#',
    '#............#',
    '######DD######',
  ], { K: '#', W: '#', R: '.', h: '.', V: '.', B: '.', s: '.', a: ',', D: '+', Q: '.', '1': '.', '2': '.', '3': '.' });
  return {
    id, nome: `Posto Guardião de ${nomeCidade}`, mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'posto', arena, passo,
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: 'posto' },
      obj(g, 'K', 'quadro', { texto: mural }), obj(g, 'W', 'janela'),
      ...objs(g, 'R', 'planta'),
      { o: 'maquina-cura', x: g.todos('h')[0]?.[0] ?? 4, y: g.todos('h')[0]?.[1] ?? 2, texto: ['A máquina de cura do Posto: seis berços de cuia e uma luz verde que dá sono só de olhar.'] },
      { o: 'balcao', x: g.todos('B')[0]?.[0] ?? 6, y: g.todos('B')[0]?.[1] ?? 3 },
      obj(g, 'V', 'viveiro', { script: 'viveiro' }),
      obj(g, 'Q', 'radio', { script: 'radio' }),
      { o: 'banco-estacao', x: g.todos('s')[0]?.[0] ?? 2, y: g.todos('s')[0]?.[1] ?? 5 },
      { o: 'tapete-a', x: g.todos('a')[2]?.[0] ?? 6, y: g.todos('a')[2]?.[1] ?? 7 },
    ],
    warps: saidas(g, 'D', cidade, volta[0], volta[1], 's', 'porta'),
    npcs: [
      gente(g, '1', 'atendente', 'npc-atendente-posto', 'Guardiã do Posto', { dir: 's', script: 'posto' }),
      gente(g, '2', `${id}-a`, visitas[0].sprite, visitas[0].nome, { fala: visitas[0].fala, mov: visitas[0].mov ?? 'olhar' }),
      gente(g, '3', `${id}-b`, visitas[1].sprite, visitas[1].nome, { fala: visitas[1].fala, mov: visitas[1].mov }),
    ],
  };
}
/** Venda: vendedor atrás do balcão; `estoques` = [condição, itens] em ordem (vale o primeiro que cumprir). Entrada em (5, 7). */
export function venda(cidade: string, nomeCidade: string, passo: number, arena: string, volta: Ponto, vendedor: { nome: string; fala: string }, estoques: [string, string[]][], fregues: Visita): ZonaDef {
  const id = `${cidade}-venda`;
  const g = grade(id, [
    '############',
    '##K#####W###',
    '#PP.PP..1.J#',
    '#......BBB.#',
    '#..........#',
    '#.Js.....2.#',
    '#.G..aa....#',
    '#....aa..PP#',
    '#####DD#####',
  ], { K: '#', W: '#', P: '.', B: '.', J: '.', s: '.', G: '.', a: ',', D: '+', '1': '.', '2': '.' });
  const pr = g.todos('P'), [vx, vy] = g.p('1');
  return {
    id, nome: `Venda de ${nomeCidade}`, mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'venda', arena, passo,
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: 'venda' },
      obj(g, 'K', 'quadro'), obj(g, 'W', 'janela'),
      ...[pr[0], pr[2], pr[4]].filter(Boolean).map(([x, y]) => ({ o: 'prateleira', x, y, texto: ['Prateleiras cheias: cuias, chás, rapadura e um vidro de pequi em conserva que ninguém tem coragem de abrir.'] })),
      { o: 'balcao', x: g.todos('B')[0]?.[0] ?? 7, y: g.todos('B')[0]?.[1] ?? 3 },
      ...objs(g, 'J', 'caixote'), obj(g, 's', 'saco-graos'), obj(g, 'G', 'barril'),
      { o: 'tapete-b', x: g.todos('a')[2]?.[0] ?? 5, y: g.todos('a')[2]?.[1] ?? 7 },
    ],
    warps: saidas(g, 'D', cidade, volta[0], volta[1], 's', 'porta'),
    npcs: [
      ...estoques.map(([se, loja], i) => ({ id: `vendedor-${i + 1}`, sprite: 'npc-vendedor', x: vx, y: vy, dir: 's', nome: vendedor.nome, fala: [vendedor.fala], loja, ...(se ? { se } : {}) } as NpcDef)),
      gente(g, '2', `${id}-a`, fregues.sprite, fregues.nome, { fala: fregues.fala, mov: fregues.mov ?? 'olhar' }),
    ],
  };
}
type Morador = Partial<NpcDef> & { id: string; sprite: string; nome: string };
/**
 * Casa de morador do Sertão: dois moradores, móveis com textos próprios. Entrada em (5, 7).
 * `canto` = objeto do canto direito (fogão, rede, oratório, máquina de costura…), `parede` = o da parede do meio.
 */
export function casa(o: {
  id: string; nome: string; tema: string; musica: string; arena: string; passo: number; volta: Ponto; parede?: string; canto?: string;
  estante: string[]; bau: string[]; cantoTexto?: string[]; moradores: [Morador, Morador?];
}): ZonaDef {
  const g = grade(o.id, [
    '############',
    '##W###K##N##',
    '#EE..Y..FF.#',
    '#..........#',
    '#.1...hmmh.#',
    '#..........#',
    '#B...aa..2.#',
    '#....aa....#',
    '#####DD#####',
  ], { W: '#', K: '#', N: '#', E: '.', Y: '.', F: '.', h: '.', m: '.', B: '.', a: ',', D: '+', '1': '.', '2': '.' });
  const h = g.todos('h'), [m1, m2] = o.moradores;
  const pessoa = (marca: string, m: Morador): NpcDef => { const [x, y] = g.p(marca); return { ...m, x, y } as NpcDef; };
  const canto = o.canto ?? 'fogao-lenha';
  const [fx, fy] = g.todos('F')[0] ?? [8, 2];
  return {
    id: o.id, nome: o.nome, mapa: 'B', tipo: 'interior', tileset: 'casa', musica: o.musica, arena: o.arena, passo: o.passo,
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: o.tema },
      obj(g, 'W', 'janela'), obj(g, 'K', o.parede ?? 'quadro'), obj(g, 'N', 'relogio'),
      { o: 'estante', x: g.todos('E')[0]?.[0] ?? 1, y: g.todos('E')[0]?.[1] ?? 2, texto: o.estante },
      obj(g, 'Y', 'filtro-barro', { texto: ['Água fresca do filtro de barro. No Sertão, água fresca é tesouro.'] }),
      { o: canto, x: canto === 'fogao-lenha' || canto === 'rede' ? fx : fx + 1, y: fy, ...(o.cantoTexto ? { texto: o.cantoTexto } : {}) },
      { o: 'cadeira', x: h[0]?.[0] ?? 6, y: h[0]?.[1] ?? 4 }, { o: 'mesa', x: (h[0]?.[0] ?? 6) + 1, y: h[0]?.[1] ?? 4 }, { o: 'cadeira', x: h[1]?.[0] ?? 9, y: h[1]?.[1] ?? 4 },
      obj(g, 'B', 'bau', { texto: o.bau }),
      { o: 'tapete-a', x: g.todos('a')[2]?.[0] ?? 5, y: g.todos('a')[2]?.[1] ?? 7 },
    ],
    warps: saidas(g, 'D', o.id.split('-')[0], o.volta[0], o.volta[1], 's', 'porta'),
    npcs: [pessoa('1', m1), ...(m2 ? [pessoa('2', m2)] : [])],
  };
}
