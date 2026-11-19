/** Carrega os dados do jogo em Node para os verificadores (zonas, treinadores, eventos, catálogos). */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import type { ZonaDef, TreinadorDef, EventoDef, Comando } from '../../src/core/tipos';
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
}
let cache: Promise<Dados> | undefined;
export function carregar(): Promise<Dados> { return (cache ??= carregarAgora()); }
async function carregarAgora(): Promise<Dados> {
  const d: Dados = { zonas: new Map(), arquivoDaZona: new Map(), falhasDeCarga: [], treinadores: new Map(), arquivoDoTreinador: new Map(), eventos: new Map(), arquivoDoEvento: new Map(), zonasComMecanica: new Set(), eventosEmCodigo: new Set(), comandosEmCodigo: new Set() };
  const dirZ = RAIZ + 'src/data/zonas/';
  for (const f of readdirSync(dirZ).sort()) {
    if (f.startsWith('_') || !f.endsWith('.ts')) continue;
    try { const m = (await import(dirZ + f)) as Record<string, unknown>; for (const v of Object.values(m)) { const z = v as ZonaDef; if (z && typeof z === 'object' && Array.isArray(z.mapaChars)) { d.zonas.set(z.id, z); d.arquivoDaZona.set(z.id, 'src/data/zonas/' + f); } } }
    catch (e) { d.falhasDeCarga.push(`src/data/zonas/${f}: não carrega (${String(e).slice(0, 160)})`); }
  }
  for (const [arq, m] of await modulos('src/data/treinadores/')) for (const v of Object.values(m)) if (Array.isArray(v)) for (const t of v as TreinadorDef[]) if (t?.id && Array.isArray(t.equipe)) { d.treinadores.set(t.id, t); d.arquivoDoTreinador.set(t.id, arq); }
  for (const [arq, m] of await modulos('src/data/eventos/')) for (const v of Object.values(m)) if (Array.isArray(v)) for (const e of v as EventoDef[]) if (e?.id && Array.isArray(e.passos)) { d.eventos.set(e.id, e); d.arquivoDoEvento.set(e.id, arq); }
  const dirM = RAIZ + 'src/world/mecanicas/';
  if (existsSync(dirM)) for (const f of readdirSync(dirM)) {
    const txt = readFileSync(dirM + f, 'utf8');
    for (const m of txt.matchAll(/const ZONA = '([^']+)'/g)) d.zonasComMecanica.add(m[1]);
    for (const m of txt.matchAll(/registrarMecanica\(\s*'([^']+)'/g)) d.zonasComMecanica.add(m[1]);
    for (const m of txt.matchAll(/registrarEvento\(\s*\{\s*id:\s*[`']([^`']+)[`']/g)) d.eventosEmCodigo.add(m[1]);
    for (const m of txt.matchAll(/registrarComando\(\s*[`']([^`']+)[`']/g)) d.comandosEmCodigo.add(m[1]);
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
