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
export function grade(id: string, bruto: string[], marcas: Record<string, string>): Grade {
  // `|` é só régua visual (separa blocos de 10 colunas) e não entra na grade
  const linhas = bruto.map((l) => l.split('|').join(''));
  const w = linhas[0].length, onde = new Map<string, Ponto[]>();
  const tortas = linhas.map((l, y) => (l.length !== w ? `${y}:${l.length}` : '')).filter(Boolean);
  if (tortas.length) throw new Error(`${id}: linhas fora da largura ${w} → ${tortas.join(' ')}`);
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

/* ------------------------------ serviços de cidade (mesma planta em toda a Costa do Sol) ------------------------------ */
import type { ZonaDef } from '../../core/tipos';
interface Visita { sprite: string; nome: string; fala: string[]; mov?: NpcDef['mov'] }
/** Posto Guardião: atendente atrás do balcão (script `posto`), máquina de cura e terminal do Viveiro. Entrada em (6, 8). */
export function postoGuardiao(cidade: string, nomeCidade: string, volta: Ponto, visitas: [Visita, Visita]): ZonaDef {
  const id = `${cidade}-posto`;
  const g = grade(id, [
    '##############',
    '###K######W###',
    '#R..hh.1...V.#',
    '#.....BBB....#',
    '#............#',
    '#.ss.......2.#',
    '#..3..aa.....#',
    '#.....aa....R#',
    '#............#',
    '######DD######',
  ], { K: '#', W: '#', R: '.', h: '.', V: '.', B: '.', s: '.', a: ',', D: '+', '1': '.', '2': '.', '3': '.' });
  return {
    id, nome: `Posto Guardião de ${nomeCidade}`, mapa: 'A', tipo: 'interior', tileset: 'predio', musica: 'posto', arena: 'restinga',
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: 'posto' },
      obj(g, 'K', 'poster-a'), obj(g, 'W', 'janela'),
      ...g.todos('R').map(([x, y]) => ({ o: 'planta', x, y })),
      { o: 'maquina-cura', x: g.todos('h')[0][0], y: g.todos('h')[0][1], texto: ['A máquina de cura do Posto: seis berços de cuia e uma luz verde que dá sono só de olhar.'] },
      { o: 'balcao', x: g.todos('B')[0][0], y: g.todos('B')[0][1] },
      obj(g, 'V', 'viveiro', { script: 'viveiro' }),
      { o: 'banco-estacao', x: g.todos('s')[0][0], y: g.todos('s')[0][1] },
      { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
    ],
    warps: saidas(g, 'D', cidade, volta[0], volta[1], 's', 'porta'),
    npcs: [
      gente(g, '1', 'atendente', 'npc-atendente-posto', 'Guardiã do Posto', { script: 'posto' }),
      gente(g, '2', `${id}-a`, visitas[0].sprite, visitas[0].nome, { fala: visitas[0].fala, mov: visitas[0].mov ?? 'olhar' }),
      gente(g, '3', `${id}-b`, visitas[1].sprite, visitas[1].nome, { fala: visitas[1].fala, mov: visitas[1].mov }),
    ],
  };
}
/** Venda: vendedor atrás do balcão; `estoques` = [condição, itens] em ordem (vale o primeiro que cumprir). Entrada em (5, 7). */
export function venda(cidade: string, nomeCidade: string, volta: Ponto, vendedor: { nome: string; fala: string }, estoques: [string, string[]][], fregues: Visita): ZonaDef {
  const id = `${cidade}-venda`;
  const g = grade(id, [
    '############',
    '##K#####W###',
    '#PP.PP..1.c#',
    '#......BBB.#',
    '#..........#',
    '#.cs.....2.#',
    '#.b..aa....#',
    '#....aa..PP#',
    '#####DD#####',
  ], { K: '#', W: '#', P: '.', B: '.', c: '.', s: '.', b: '.', a: ',', D: '+', '1': '.', '2': '.' });
  const pr = g.todos('P'), cx = g.todos('c'), [vx, vy] = g.p('1');
  return {
    id, nome: `Venda de ${nomeCidade}`, mapa: 'A', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'restinga',
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: 'venda' },
      obj(g, 'K', 'quadro'), obj(g, 'W', 'janela'),
      ...[pr[0], pr[2], pr[4]].map(([x, y]) => ({ o: 'prateleira', x, y, texto: ['Prateleiras cheias: cuias, chás, mel e um pote de balas que ninguém sabe o preço.'] })),
      { o: 'balcao', x: g.todos('B')[0][0], y: g.todos('B')[0][1] },
      ...cx.map(([x, y]) => ({ o: 'caixote', x, y })), obj(g, 's', 'saco-graos'), obj(g, 'b', 'barril'),
      { o: 'tapete-b', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
    ],
    warps: saidas(g, 'D', cidade, volta[0], volta[1], 's', 'porta'),
    npcs: [
      ...estoques.map(([se, loja], i) => ({ id: `vendedor-${i + 1}`, sprite: 'npc-vendedor', x: vx, y: vy, nome: vendedor.nome, fala: [vendedor.fala], loja, se } as NpcDef)),
      gente(g, '2', `${id}-a`, fregues.sprite, fregues.nome, { fala: fregues.fala, mov: fregues.mov ?? 'olhar' }),
    ],
  };
}
/**
 * Casa de morador (planta caiçara de sala e cozinha): dois moradores, estante, fogão, mesa e baú com textos próprios.
 * Entrada em (5, 7). `parede` = objeto pendurado no meio da parede (quadro, rede de pesca, mapa…).
 */
export function casaSimples(o: {
  id: string; nome: string; tema: string; musica: string; arena?: string; passo: number; volta: Ponto; parede?: string;
  estante: string[]; tv?: string[]; bau: string[]; moradores: [Partial<NpcDef> & { id: string; sprite: string; nome: string }, (Partial<NpcDef> & { id: string; sprite: string; nome: string })?];
}): ZonaDef {
  const g = grade(o.id, [
    '############',
    '##W###K##N##',
    '#EE..T..FF.#',
    '#..........#',
    '#.1...hmmh.#',
    '#..........#',
    '#B...aa..2.#',
    '#....aa....#',
    '#####DD#####',
  ], { W: '#', K: '#', N: '#', E: '.', T: '.', F: '.', h: '.', m: '.', B: '.', a: ',', D: '+', '1': '.', '2': '.' });
  const h = g.todos('h'), [m1, m2] = o.moradores;
  const pessoa = (marca: string, m: Partial<NpcDef> & { id: string; sprite: string; nome: string }): NpcDef => { const [x, y] = g.p(marca); return { ...m, x, y } as NpcDef; };
  return {
    id: o.id, nome: o.nome, mapa: 'A', tipo: 'interior', tileset: 'casa', musica: o.musica, arena: o.arena ?? 'restinga', passo: o.passo,
    mapaChars: g.mapa,
    objetos: [
      { o: 'tema', x: 0, y: 0, tema: o.tema },
      obj(g, 'W', 'janela'), obj(g, 'K', o.parede ?? 'quadro'), obj(g, 'N', 'relogio'),
      { o: 'estante', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: o.estante },
      o.tv ? obj(g, 'T', 'tv', { texto: o.tv }) : obj(g, 'T', 'filtro-barro', { texto: ['Água fresca do filtro de barro. Não tem geladeira que faça igual.'] }),
      { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1] },
      { o: 'cadeira', x: h[0][0], y: h[0][1] }, { o: 'mesa', x: h[0][0] + 1, y: h[0][1] }, { o: 'cadeira', x: h[1][0], y: h[1][1] },
      obj(g, 'B', 'bau', { texto: o.bau }),
      { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
    ],
    warps: saidas(g, 'D', o.id.split('-')[0], o.volta[0], o.volta[1], 's', 'porta'),
    npcs: [pessoa('1', m1), ...(m2 ? [pessoa('2', m2)] : [])],
  };
}

/**
 * Sub-bosque: toda árvore `T` cuja copa encobriria um tile andável (até 2 linhas acima, 1 coluna para cada lado)
 * vira moita baixa `b`. Assim os corredores de um labirinto de mata ficam à vista: árvores altas ao fundo,
 * moitas na beira de cá do caminho. Regra fixa, sem sorteio; a colisão não muda (as duas bloqueiam).
 * `lados = false` (rotas abertas): só as árvores logo ao sul do tile andável; as paredes laterais continuam árvores.
 */
export function subBosque(mapa: string[], lados = true): string[] {
  const livre = (x: number, y: number) => '.,:;"%=+'.includes(mapa[y]?.[x] ?? ' ');
  return mapa.map((l, y) => [...l].map((c, x) => {
    if (c !== 'T') return c;
    for (let dy = 1; dy <= 2; dy++) for (let dx = lados ? -1 : 0; dx <= (lados ? 1 : 0); dx++) if (livre(x + dx, y - dy)) return 'b';
    return c;
  }).join(''));
}
