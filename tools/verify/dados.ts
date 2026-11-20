/** Carrega os dados do jogo em Node para os verificadores (zonas, treinadores, eventos, catálogos). */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import type { ZonaDef, TreinadorDef, EventoDef, Comando, NpcDef, Gatilho } from '../../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../../src/data/catalogo-interiores';

export const RAIZ = new URL('../..', import.meta.url).pathname;
export interface Achado { erros: string[]; avisos: string[]; pendentes: string[]; info: string[] }
export const novoAchado = (): Achado => ({ erros: [], avisos: [], pendentes: [], info: [] });

async function modulos(pasta: string): Promise<[string, Record<string, unknown>][]> {
  const dir = RAIZ + pasta, saida: [string, Record<string, unknown>][] = [];
  for (const f of readdirSync(dir).sort()) { if (!f.endsWith('.ts')) continue; saida.push([pasta + f, (await import(dir + f)) as Record<string, unknown>]); }
  return saida;
}
export interface Dados {
  zonas: Map<string, ZonaDef>; arquivoDaZona: Map<string, string>; falhasDeCarga: string[];
  treinadores: Map<string, TreinadorDef>; arquivoDoTreinador: Map<string, string>;
  eventos: Map<string, EventoDef>; arquivoDoEvento: Map<string, string>;
  /** zonas com quebra-cabeça em código (src/world/mecanicas): o interior é tratado como todo alcançável */
  zonasComMecanica: Set<string>;
  /** ids de eventos/comandos registrados em código (mecânicas) */
  eventosEmCodigo: Set<string>; comandosEmCodigo: Set<string>;
  /** pontos de colheita em código (src/world/mecanicas/x-ea.ts: frascos do Encontro das Águas): zona, tile, flag e item que dão */
  colheitas: { zona: string; x: number; y: number; flagOk: string; item: string }[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coletar<T>(m: Record<string, unknown>, ok: (v: any) => boolean): T[] {
  const out: T[] = [];
  const ver = (v: unknown, fundo: number) => {
    if (!v || typeof v !== 'object') return;
    if (ok(v)) { out.push(v as T); return; }
    if (fundo > 0) for (const x of Array.isArray(v) ? v : Object.values(v)) ver(x, fundo - 1);
  };
  ver(m, 2);
  return out;
}
let cache: Promise<Dados> | undefined;
export function carregar(): Promise<Dados> { return (cache ??= carregarAgora()); }
async function carregarAgora(): Promise<Dados> {
  const d: Dados = { zonas: new Map(), arquivoDaZona: new Map(), falhasDeCarga: [], treinadores: new Map(), arquivoDoTreinador: new Map(), eventos: new Map(), arquivoDoEvento: new Map(), zonasComMecanica: new Set(), eventosEmCodigo: new Set(), comandosEmCodigo: new Set(), colheitas: [] };
  const dirZ = RAIZ + 'src/data/zonas/';
  for (const f of readdirSync(dirZ).sort()) {
    if (f.startsWith('_') || !f.endsWith('.ts')) continue;
    try { const m = (await import(dirZ + f)) as Record<string, unknown>; for (const v of Object.values(m)) { const z = v as ZonaDef; if (z && typeof z === 'object' && Array.isArray(z.mapaChars)) { d.zonas.set(z.id, z); d.arquivoDaZona.set(z.id, 'src/data/zonas/' + f); } } }
    catch (e) { d.falhasDeCarga.push(`src/data/zonas/${f}: não carrega (${String(e).slice(0, 160)})`); }
  }
  // mesma coleta do jogo (src/world/deps.ts, `coletar`): export solto ou dentro de lista/objeto, até 2 níveis
  for (const [arq, m] of await modulos('src/data/treinadores/')) for (const t of coletar<TreinadorDef>(m, (v) => typeof v.id === 'string' && Array.isArray(v.equipe))) if (!d.treinadores.has(t.id)) { d.treinadores.set(t.id, t); d.arquivoDoTreinador.set(t.id, arq); }
  const fontesEv: [string, string][] = [];
  for (const [arq, m] of await modulos('src/data/eventos/')) {
    fontesEv.push([arq, readFileSync(RAIZ + arq, 'utf8')]);
    for (const e of coletar<EventoDef>(m, (v) => typeof v.id === 'string' && Array.isArray(v.passos))) if (!d.eventos.has(e.id)) { d.eventos.set(e.id, e); d.arquivoDoEvento.set(e.id, arq); }
  }
  // treinadores e eventos registrados em código pelos arquivos de eventos (registrarTreinador / registrarEvento), como o jogo os acha
  const { treinadoresExtras, eventosExtras } = await import('../../src/world/registro');
  const donoDe = (id: string) => fontesEv.find(([, t]) => t.includes(`'${id}'`))?.[0] ?? 'src/data/eventos';
  for (const t of treinadoresExtras.values()) if (!d.treinadores.has(t.id) && !t.id.startsWith('teste-')) { d.treinadores.set(t.id, t); d.arquivoDoTreinador.set(t.id, donoDe(t.id)); }
  for (const e of eventosExtras.values()) if (!d.eventos.has(e.id)) { d.eventos.set(e.id, e); d.arquivoDoEvento.set(e.id, donoDe(e.id)); }
  // NPCs e gatilhos das missões dos visitantes (src/data/eventos/visitantes.ts) entram na zona por coordenada, como no
  // jogo (`encaixar`): no tile livre mais próximo do ponto pedido
  try {
    const { PONTOS_VISITANTES } = (await import('../../src/data/eventos/visitantes')) as { PONTOS_VISITANTES?: { zona: string; npc?: NpcDef; gatilho?: Gatilho }[] };
    const LIVRE_V = new Set('.,:;"%=+');
    const chao = (z: ZonaDef, x: number, y: number, ocupados: Set<string>): [number, number] | null => {
      const h = z.mapaChars.length, w = z.mapaChars[0]?.length ?? 0;
      const ok = (a: number, b: number) => a > 0 && b > 0 && a < w - 1 && b < h - 1 && LIVRE_V.has(z.mapaChars[b][a]) && !ocupados.has(a + ',' + b) && !(z.warps ?? []).some((q) => q.x === a && q.y === b);
      for (let r = 0; r <= 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && ok(x + dx, y + dy)) return [x + dx, y + dy];
      return null;
    };
    for (const p of PONTOS_VISITANTES ?? []) {
      const z = d.zonas.get(p.zona); if (!z) continue;
      const ocupados = new Set([...(z.npcs ?? []).map((n) => n.x + ',' + n.y), ...(z.objetos ?? []).map((o) => o.x + ',' + o.y)]);
      if (p.npc && !(z.npcs ?? []).some((n) => n.id === p.npc!.id)) { const pos = chao(z, p.npc.x, p.npc.y, ocupados); if (pos) (z.npcs ??= []).push({ ...p.npc, x: pos[0], y: pos[1] }); else d.falhasDeCarga.push(`src/data/eventos/visitantes.ts: NPC ${p.npc.id} sem chão livre perto de (${p.npc.x}, ${p.npc.y}) em ${p.zona}`); }
      if (p.gatilho && !(z.gatilhos ?? []).some((g) => g.script === p.gatilho!.script)) { const pos = chao(z, p.gatilho.x, p.gatilho.y, new Set()); if (pos) (z.gatilhos ??= []).push({ ...p.gatilho, x: pos[0], y: pos[1] }); }
    }
  } catch (e) { d.falhasDeCarga.push(`src/data/eventos/visitantes.ts: PONTOS_VISITANTES não carrega (${String(e).slice(0, 160)})`); }
  // mecânicas de zona (src/world/mecanicas) e telas que registram comandos de evento (Gincana, Safári): lidas como texto,
  // porque dependem do DOM e não carregam em Node
  for (const dir of ['src/world/mecanicas/', 'src/ui/telas/']) {
    const dirM = RAIZ + dir; if (!existsSync(dirM)) continue;
    for (const f of readdirSync(dirM)) {
      if (!/\.ts$/.test(f)) continue;
      const txt = readFileSync(dirM + f, 'utf8');
      if (dir.includes('mecanicas')) {
        for (const m of txt.matchAll(/const ZONA = '([^']+)'/g)) d.zonasComMecanica.add(m[1]);
        for (const m of txt.matchAll(/registrarMecanica\(\s*'([^']+)'/g)) d.zonasComMecanica.add(m[1]);
        for (const m of txt.matchAll(/\{\s*zona:\s*'([^']+)',\s*x:\s*(\d+),\s*y:\s*(\d+),\s*flagOk:\s*'([^']+)',\s*item:\s*'([^']+)'/g)) d.colheitas.push({ zona: m[1], x: Number(m[2]), y: Number(m[3]), flagOk: m[4], item: m[5] });
      }
      for (const m of txt.matchAll(/registrarEvento\(\s*\{\s*id:\s*[`']([^`']+)[`']/g)) d.eventosEmCodigo.add(m[1]);
      for (const m of txt.matchAll(/registrarComando\(\s*[`']([^`']+)[`']/g)) d.comandosEmCodigo.add(m[1]);
    }
  }
  return d;
}

/* ------------------------------ grade e colisão (legenda de docs/ZONAS.md) ------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CAT: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
export const temObjeto = (id: string) => !!CAT[id];
export const LIVRE = new Set('.,:;"%=glxo+');
export interface Blocos { w: number; h: number; b: Uint8Array }
const memoBlocos = new Map<string, Blocos>();
export function blocos(z: ZonaDef): Blocos {
  const m = memoBlocos.get(z.id); if (m) return m;
  const h = z.mapaChars.length, w = z.mapaChars[0].length, b = new Uint8Array(w * h);
  for (const o of z.objetos ?? []) {
    const c = CAT[o.o]; if (!c) continue;
    for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) {
      const col = c.colisao; let v = 1;
      if (col === false) v = 0; else if (Array.isArray(col) && col[j] !== undefined) v = '#x1X'.includes(String(col[j][i] ?? '#')) ? 1 : 0;
      const x = o.x + i, y = o.y - (c.h - 1) + j; if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (c.porta && i === c.porta[0] && j === c.h - 1 - c.porta[1]) v = 0;
      if (v) b[y * w + x] = 1;
    }
  }
  const r = { w, h, b }; memoBlocos.set(z.id, r); return r;
}
/** percorre os comandos de um evento, entrando nos ramos de `se` */
export function cadaComando(passos: Comando[], f: (c: Comando) => void) {
  for (const c of passos) { if (!Array.isArray(c)) continue; f(c); if (c[0] === 'se') { if (Array.isArray(c[2])) cadaComando(c[2] as Comando[], f); if (Array.isArray(c[3])) cadaComando(c[3] as Comando[], f); } }
}
export const ehMapaA = (z: ZonaDef) => z.mapa === 'A' && /^A/.test(z.id);
