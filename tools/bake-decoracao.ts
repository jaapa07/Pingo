/**
 * BAKE da Decoração do Quarto: pinta o quarto (`A1-quarto`) vazio e com cada peça de decoração na sua vaga,
 * e grava só a diferença de cada peça (chão e camada alta) numa folha única:
 *   public/assets/tiles/decoracao.png + decoracao.json  { pecas: { <id>: { chao?: Ret, alto?: Ret } } }
 * `Ret` = { sx, sy, w, h, dx, dy } → recorte na folha e deslocamento em px a partir do canto superior esquerdo
 * do tile da vaga. O mundo (src/world/decoracao.ts) desenha as peças por cima do bake do quarto.
 * Uso: tsx tools/bake-decoracao.ts   (depois de `tsx tools/bake-maps.ts A1-quarto`)
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZonaDef } from '../src/core/tipos';
import quarto, { VAGAS_DECORACAO } from '../src/data/zonas/A1-quarto';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { Img, VAZIO } from './pixel/tile';
import { TILESETS_INTERIOR, PINTORES_INTERIOR } from './scenery/interior/index';
import { PINTORES_EXTRA, type InfoObjeto } from './scenery/exterior/objetos';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T = 16;
Object.assign(PINTORES_EXTRA, PINTORES_INTERIOR);
const ts = TILESETS_INTERIOR.find((t) => t.nome === quarto.tileset);
if (!ts) throw new Error('tileset do quarto não encontrado: ' + quarto.tileset);
const catalogo = CATALOGO_INTERIOR as unknown as Record<string, InfoObjeto>;
const pintar = (extra: ZonaDef['objetos'] = []) => { const z = ts.pintarZona({ ...quarto, objetos: [...(quarto.objetos ?? []), ...extra] }, catalogo); return { chao: z.quadros[0], alto: z.alto }; };
const base = pintar();

interface Ret { sx: number; sy: number; w: number; h: number; dx: number; dy: number }
/** pixels de `com` que diferem de `sem`, recortados na caixa mínima */
function diferenca(sem: Img, com: Img): { img: Img; x: number; y: number } | null {
  let x0 = com.w, y0 = com.h, x1 = -1, y1 = -1;
  for (let y = 0; y < com.h; y++) for (let x = 0; x < com.w; x++) if (com.get(x, y) !== sem.get(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (x1 < 0) return null;
  const img = new Img(x1 - x0 + 1, y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = com.get(x, y); if (c !== sem.get(x, y) && c !== VAZIO) img.set(x - x0, y - y0, c); }
  return { img, x: x0, y: y0 };
}

const recortes: { id: string; camada: 'chao' | 'alto'; img: Img; dx: number; dy: number }[] = [];
// a categoria `movel` sem peça escolhida mostra a cama simples do catálogo
const alvos: [string, string | undefined][] = [...Object.entries(CATALOGO_INTERIOR).map(([id, o]) => [id, o.decoracao] as [string, string | undefined]), ['cama', 'movel']];
for (const [id, categoria] of alvos) {
  const vaga = categoria ? VAGAS_DECORACAO[categoria] : undefined;
  if (!vaga) continue;
  const com = pintar([{ o: id, x: vaga[0], y: vaga[1] }]);
  for (const camada of ['chao', 'alto'] as const) {
    const d = diferenca(base[camada], com[camada]);
    if (d) recortes.push({ id, camada, img: d.img, dx: d.x - vaga[0] * T, dy: d.y - vaga[1] * T });
  }
}
// folha em prateleiras de até 256 px de largura
const LARG = 256;
let x = 0, y = 0, linha = 0;
const pecas: Record<string, { chao?: Ret; alto?: Ret }> = {};
const postos: { r: (typeof recortes)[number]; x: number; y: number }[] = [];
for (const r of recortes) {
  if (x + r.img.w > LARG) { x = 0; y += linha + 1; linha = 0; }
  postos.push({ r, x, y });
  (pecas[r.id] ??= {})[r.camada] = { sx: x, sy: y, w: r.img.w, h: r.img.h, dx: r.dx, dy: r.dy };
  x += r.img.w + 1; linha = Math.max(linha, r.img.h);
}
const folha = new Img(LARG, y + linha);
for (const p of postos) folha.colar(p.r.img, p.x, p.y);
const dir = resolve(RAIZ, 'public/assets/tiles');
folha.salvar(resolve(dir, 'decoracao.png'));
writeFileSync(resolve(dir, 'decoracao.json'), JSON.stringify({ zona: quarto.id, pecas }));
console.log(`decoração: ${Object.keys(pecas).length} peças, folha ${folha.w}×${folha.h}`);
