/**
 * BAKE dos mapas: lê as zonas de src/data/zonas, aplica o autotile do tileset e grava, por zona,
 * os chunks de chão, camada alta e tiras de animação de cada período + zona.json (docs/BAKE.md).
 * Também grava o tilesheet de cada tileset em public/assets/tiles/.
 * Uso: tsx tools/bake-maps.ts [idDaZona|prefixo* ...] [--so-tiles] [--previa=pasta]
 */
import { readdirSync, existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ZonaDef } from '../src/core/tipos';
import type { TilesetExterior } from '../src/data/tilesets/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { Img, VAZIO, PERIODOS, tabelaPeriodo, corNoPeriodo, type Periodo } from './pixel/tile';
import { Compositor, QUADROS, T, completarPintada, type TilesetProprio, type ZonaPintada } from './scenery/exterior/compositor';
import { PINTORES_EXTRA, type InfoObjeto, type PintorObjeto } from './scenery/exterior/objetos';
import { gravarTilesheet } from './scenery/exterior/tilesheet';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHUNK = 10; // tiles
const args = process.argv.slice(2);
const filtros = args.filter((a) => !a.startsWith('--'));
const opcao = (k: string) => args.find((a) => a.startsWith(`--${k}`))?.split('=')[1] ?? (args.includes(`--${k}`) ? '1' : undefined);

type QualquerTileset = TilesetExterior | TilesetProprio;
const ehProprio = (t: QualquerTileset): t is TilesetProprio => typeof (t as TilesetProprio).pintarZona === 'function';

async function importar<Tm = Record<string, unknown>>(arquivo: string): Promise<Tm> { return (await import(pathToFileURL(arquivo).href)) as Tm; }
function listar(pasta: string): string[] { return existsSync(pasta) ? readdirSync(pasta).filter((f) => f.endsWith('.ts')).sort().map((f) => resolve(pasta, f)) : []; }

async function carregarTilesets(): Promise<Map<string, QualquerTileset>> {
  const mapa = new Map<string, QualquerTileset>();
  for (const f of listar(resolve(RAIZ, 'src/data/tilesets'))) {
    const m = await importar<{ default?: TilesetExterior }>(f);
    if (m.default && typeof m.default.nome === 'string' && m.default.arte) mapa.set(m.default.nome, m.default);
  }
  // tilesets com pintor próprio (interiores): tools/scenery/interior/index.ts exporta TILESETS_INTERIOR
  const interior = resolve(RAIZ, 'tools/scenery/interior/index.ts');
  if (existsSync(interior)) {
    const m = await importar<{ TILESETS_INTERIOR?: TilesetProprio[]; PINTORES_INTERIOR?: Record<string, PintorObjeto> }>(interior);
    for (const t of m.TILESETS_INTERIOR ?? []) mapa.set(t.nome, t);
    Object.assign(PINTORES_EXTRA, m.PINTORES_INTERIOR ?? {});
  }
  return mapa;
}
async function carregarCatalogo(): Promise<Record<string, InfoObjeto>> {
  const cat: Record<string, InfoObjeto> = { ...CATALOGO_EXTERIOR };
  const interior = resolve(RAIZ, 'src/data/catalogo-interiores.ts');
  if (existsSync(interior)) {
    const m = await importar<Record<string, unknown>>(interior);
    for (const v of Object.values(m)) if (v && typeof v === 'object') for (const [nome, info] of Object.entries(v as Record<string, InfoObjeto>)) if (info && typeof info.w === 'number' && typeof info.h === 'number') cat[nome] = info;
  }
  return cat;
}
async function carregarZonas(): Promise<ZonaDef[]> {
  const zonas: ZonaDef[] = [];
  for (const f of listar(resolve(RAIZ, 'src/data/zonas'))) {
    try {
      const m = await importar<{ default?: ZonaDef }>(f);
      if (m.default && Array.isArray(m.default.mapaChars)) zonas.push(m.default);
    } catch (e) { console.error(`! não consegui carregar ${f}: ${String((e as Error).message).split('\n')[0]}`); }
  }
  return zonas;
}

const mistura = (a: number, b: number, t: number) => {
  const f = (d: number) => Math.round(((a >> d) & 255) + (((b >> d) & 255) - ((a >> d) & 255)) * t);
  return (f(16) << 16) | (f(8) << 8) | f(0);
};
/** aplica a paleta do período; à noite a máscara de luz clareia o que está perto de lampiões e janelas */
function noPeriodo(img: Img, p: Periodo, z: ZonaPintada): Img {
  if (p === 'dia') return img;
  const cores = img.cores();
  const tab = tabelaPeriodo(cores, p, z.acesas);
  if (p !== 'noite' || !z.luzes.length) return img.trocar(tab);
  const claro = new Map<number, number>(), meio = new Map<number, number>();
  for (const c of cores) {
    const n = tab.get(c)!, quente = z.acesas.has(c) ? n : corNoPeriodo(c, 'tarde');
    claro.set(c, mistura(n, quente, 0.62)); meio.set(c, mistura(n, quente, 0.3));
  }
  const r = new Img(img.w, img.h);
  for (let i = 0; i < img.d.length; i++) { const c = img.d[i]; if (c !== VAZIO) r.d[i] = (z.luz[i] === 2 ? claro : z.luz[i] === 1 ? meio : tab).get(c)!; }
  return r;
}

export function assarZona(zona: ZonaDef, ts: QualquerTileset, catalogo: Record<string, InfoObjeto>, saida: string): { chunks: number; arquivos: number; previas: [Periodo, Img][] } {
  const z: ZonaPintada = ehProprio(ts) ? completarPintada(ts.pintarZona(zona, catalogo)) : new Compositor(zona, ts, catalogo).pintar();
  const soDia = !ts.periodos || ['interior', 'caverna', 'ginasio', 'dungeon'].includes(zona.tipo);
  const periodos: Periodo[] = soDia ? ['dia'] : PERIODOS;
  rmSync(saida, { recursive: true, force: true });
  mkdirSync(saida, { recursive: true });
  const cols = Math.ceil(z.larg / CHUNK), lins = Math.ceil(z.alt / CHUNK), lado = CHUNK * T;
  const chunks: { cx: number; cy: number; alto: boolean; anim: boolean }[] = [];
  let arquivos = 0;
  for (const p of periodos) {
    const quadros = z.quadros.map((f) => noPeriodo(f, p, z)), alto = noPeriodo(z.alto, p, z);
    for (let cy = 0; cy < lins; cy++) for (let cx = 0; cx < cols; cx++) {
      const chao = new Img(lado, lado, 0x0b0a14);
      chao.colar(quadros[0].recorte(cx * lado, cy * lado, lado, lado), 0, 0);
      chao.salvar(resolve(saida, `chao-${p}-${cx}_${cy}.png`)); arquivos++;
      const a = alto.recorte(cx * lado, cy * lado, lado, lado), temAlto = !a.vazia();
      if (temAlto) { a.salvar(resolve(saida, `alto-${p}-${cx}_${cy}.png`)); arquivos++; }
      const tira = new Img(lado * QUADROS, lado);
      let temAnim = false;
      for (let ty = cy * CHUNK; ty < Math.min(z.alt, (cy + 1) * CHUNK); ty++) for (let tx = cx * CHUNK; tx < Math.min(z.larg, (cx + 1) * CHUNK); tx++) {
        if (!z.animado[ty * z.larg + tx]) continue;
        temAnim = true;
        for (let f = 0; f < QUADROS; f++) tira.colar(quadros[f].recorte(tx * T, ty * T, T, T), f * lado + (tx - cx * CHUNK) * T, (ty - cy * CHUNK) * T);
      }
      if (temAnim) { tira.salvar(resolve(saida, `anim-${p}-${cx}_${cy}.png`)); arquivos++; }
      if (p === periodos[0]) chunks.push({ cx, cy, alto: temAlto, anim: temAnim });
    }
  }
  writeFileSync(resolve(saida, 'zona.json'), JSON.stringify({
    id: zona.id, tileset: zona.tileset, largura: z.larg, altura: z.alt, w: z.larg, h: z.alt, tile: T, chunk: CHUNK * T, chunkTiles: CHUNK, colunas: cols, linhas: lins,
    periodos, quadros: QUADROS, animQuadros: QUADROS, animMs: 250, chunks, gramaAlta: z.gramaAlta, dinamicos: z.dinamicos, luzes: z.luzes,
  }));
  const previas = (['dia', 'noite'] as Periodo[]).filter((p) => periodos.includes(p)).map((p) => { const i = noPeriodo(z.quadros[0], p, z).copia(); i.colar(noPeriodo(z.alto, p, z), 0, 0); return [p, i] as [Periodo, Img]; });
  return { chunks: chunks.length, arquivos: arquivos + 1, previas };
}

const tilesets = await carregarTilesets();
const dirTiles = resolve(RAIZ, 'public/assets/tiles');
for (const ts of tilesets.values()) if (!ehProprio(ts)) gravarTilesheet(ts, dirTiles);
if (!opcao('so-tiles')) {
  const catalogo = await carregarCatalogo();
  const zonas = await carregarZonas();
  const casa = (id: string) => !filtros.length || filtros.some((f) => (f.endsWith('*') ? id.startsWith(f.slice(0, -1)) : f === id));
  const t0 = Date.now();
  let erros = 0, feitas = 0;
  for (const zona of zonas) {
    if (!casa(zona.id)) continue;
    const ts = tilesets.get(zona.tileset);
    try {
      if (!ts) throw new Error(`tileset "${zona.tileset}" não existe`);
      const larg = zona.mapaChars[0]?.length ?? 0;
      if (zona.mapaChars.some((l) => l.length !== larg)) throw new Error('linhas de mapaChars com larguras diferentes');
      const r = assarZona(zona, ts, catalogo, resolve(RAIZ, 'public/assets/zonas', zona.id));
      // prévia inteira (fora de public/): chão + camada alta de dia e de noite, para conferir a olho
      const previa = opcao('previa');
      if (previa) for (const [p, img] of r.previas) img.salvar(resolve(previa === '1' ? resolve(RAIZ, 'tools/.cache/previa') : previa, `${zona.id}-${p}.png`));
      feitas++;
      console.log(`✔ ${zona.id} (${zona.tileset}) ${larg}×${zona.mapaChars.length} · ${r.chunks} chunks · ${r.arquivos} arquivos`);
    } catch (e) { erros++; console.error(`✘ ${zona.id}: ${(e as Error).message}`); }
  }
  console.log(`${feitas} zonas assadas em ${((Date.now() - t0) / 1000).toFixed(1)}s${erros ? ` · ${erros} com erro` : ''}`);
  if (erros) process.exitCode = 1;
}
