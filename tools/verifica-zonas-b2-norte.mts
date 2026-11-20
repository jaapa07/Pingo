// verificador do time B2-norte (Campos de Altitude, Lagoa Gelada, Caminho das Névoas, Planalto Lume, Floresta Ancestral,
// Pico Pindorama e o Salão do Conselho; passos 14–17). Mesmo método do verificador do B1: grades e marcas, objetos, warps
// em pares, tiles livres, scripts/treinadores, linha de visão, alcance tile a tile com e sem Amuletos e portões, tabela 6.4
// (espécie citada ou a forma em que ela está no nível), curva de níveis (líder 14 = 59, 15 = 61, Pico 62–65, Conselho
// 64–70, pós-jogo 65–75) e a estrutura da sequência final (Garrote, rival 8, cinco Guardiões, créditos, pós-jogo).
// Rodar: npx tsx tools/verifica-zonas-b2-norte.mts
import { readdirSync } from 'node:fs';
import type { ZonaDef, Encontro, Habitat, TreinadorDef } from '../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { ESPECIES } from '../src/data/criaturas';
import { ERROS_B2N } from '../src/data/zonas/_b2n-lib';
import { TREINADORES_B2_NORTE, ANDARILHO_DO_CUME } from '../src/data/treinadores/b2-norte';
import { TREINADORES_CONSELHO } from '../src/data/treinadores/conselho';
import { EVENTOS_B2_NORTE } from '../src/data/eventos/b2-norte';
import { EVENTOS_CONSELHO } from '../src/data/eventos/conselho';
import { EVENTOS_COMUNS } from '../src/data/eventos/comuns';

const dir = new URL('../src/data/zonas/', import.meta.url).pathname;
const MEUS = /^(B-SG|B-LG|B-R5|B8|B-FA|PP)(-|$)/;
const TREINADORES = [...TREINADORES_B2_NORTE, ANDARILHO_DO_CUME, ...TREINADORES_CONSELHO];
const EVENTOS = [...EVENTOS_B2_NORTE, ...EVENTOS_CONSELHO];
const Z = new Map<string, ZonaDef>();
let erros = 0, avisos = 0; const E = (s: string) => { erros++; console.log('✗', s); }; const A = (s: string) => { avisos++; console.log('·', s); };
for (const f of readdirSync(dir)) { if (f.startsWith('_') || !f.endsWith('.ts')) continue; try { const m = await import(dir + f); if (m.default?.mapaChars) Z.set(m.default.id, m.default); } catch (e) { (MEUS.test(f.replace('.ts', '')) ? E : A)(`${f}: não carrega (${(e as Error).message})`); } }
for (const s of ERROS_B2N) E(`grade: ${s}`);
const cat: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
const LIVRE = new Set('.,:;"%=glxo+');
const meu = (id: string) => MEUS.test(id) && !id.endsWith('-ginasio');
const meus = [...Z.values()].filter((z) => meu(z.id));

function blocos(z: ZonaDef) {
  const h = z.mapaChars.length, w = z.mapaChars[0].length, b = new Uint8Array(w * h);
  for (const o of z.objetos ?? []) { const c = cat[o.o]; if (!c) { E(`${z.id}: objeto fora do catálogo ${o.o}`); continue; }
    for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) {
      let v = '#x1X'.includes(c.colisao?.[j]?.[i] ?? '#') ? 1 : 0;
      const x = o.x + i, y = o.y - (c.h - 1) + j; if (x < 0 || y < 0 || x >= w || y >= h) { E(`${z.id}: objeto ${o.o} (${o.x},${o.y}) sai do mapa`); continue; }
      if (c.porta && i === c.porta[0] && j === c.h - 1 - c.porta[1]) v = 0; if (v) b[y * w + x] = 1; } }
  return { w, h, b };
}
const ehEnt = (t?: string) => !!t && t !== 'borda' && t !== 'buraco';
const ids = new Map(TREINADORES.map((t) => [t.id, t])), evs = new Set([...EVENTOS, ...EVENTOS_COMUNS].map((e) => e.id));
if (ids.size !== TREINADORES.length) E('treinadores com id repetido');
if (new Set(EVENTOS.map((e) => e.id)).size !== EVENTOS.length) E('eventos com id repetido');

/* ---------- estrutura ---------- */
const usados = new Set<string>();
for (const z of meus) {
  const { w, h, b } = blocos(z);
  z.mapaChars.forEach((l, y) => { if (l.length !== w) E(`${z.id}: linha ${y} com ${l.length} (esperado ${w})`); });
  const ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ';
  const livre = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && !b[y * w + x] && LIVRE.has(ch(x, y));
  const agua = (x: number, y: number) => '~dw'.includes(ch(x, y)) && !b[y * w + x];
  for (const wp of z.warps) {
    if (!(livre(wp.x, wp.y) || agua(wp.x, wp.y) || ehEnt(wp.tipo))) E(`${z.id}: warp (${wp.x},${wp.y}) em tile bloqueado "${ch(wp.x, wp.y)}"`);
    const d = Z.get(wp.para.zona);
    if (!d) { if (meu(wp.para.zona)) E(`${z.id}: warp para zona inexistente ${wp.para.zona}`); else A(`${z.id} → ${wp.para.zona}: zona de outro time ainda ausente (caminho em obras)`); continue; }
    const B = blocos(d), c = d.mapaChars[wp.para.y]?.[wp.para.x] ?? ' ';
    if (!(LIVRE.has(c) || '~d'.includes(c)) || B.b[wp.para.y * B.w + wp.para.x]) E(`${z.id}: warp (${wp.x},${wp.y}) chega em ${d.id} (${wp.para.x},${wp.para.y}) = "${c}" bloqueado`);
    if (d.warps.some((q) => q.x === wp.para.x && q.y === wp.para.y)) E(`${z.id}: warp chega em cima de outro warp em ${d.id} (${wp.para.x},${wp.para.y})`);
    const volta = d.warps.filter((q) => q.para.zona === z.id);
    if (!volta.length) E(`${z.id} → ${d.id}: sem warp de volta`);
    else if (!volta.some((q) => Math.abs(q.para.x - wp.x) + Math.abs(q.para.y - wp.y) <= 4)) (meu(d.id) ? E : A)(`${z.id} (${wp.x},${wp.y}) → ${d.id}: a volta não chega perto do warp de ida`);
  }
  for (const n of z.npcs ?? []) {
    if (!livre(n.x, n.y)) E(`${z.id}: NPC ${n.id} em (${n.x},${n.y}) "${ch(n.x, n.y)}" não livre`);
    if (n.treinador) { usados.add(n.treinador); if (!ids.has(n.treinador)) E(`${z.id}: treinador ${n.treinador} sem definição`); }
    if (n.script && !evs.has(n.script)) E(`${z.id}: script ${n.script} inexistente`);
    if (z.warps.some((q) => q.x === n.x && q.y === n.y)) E(`${z.id}: NPC ${n.id} em cima de warp`);
  }
  const vistos = new Map<string, string>();
  for (const n of z.npcs ?? []) { const k = n.x + ',' + n.y; if (vistos.has(k) && !n.se) E(`${z.id}: NPCs ${vistos.get(k)} e ${n.id} no mesmo tile sem condição`); vistos.set(k, n.id); }
  for (const o of z.objetos ?? []) if (typeof o.script === 'string' && !evs.has(o.script)) E(`${z.id}: script de objeto ${o.script} inexistente`);
  for (const g of z.gatilhos ?? []) if (!evs.has(g.script)) E(`${z.id}: gatilho ${g.script} inexistente`);
  for (const i of z.itens ?? []) if (!livre(i.x, i.y)) E(`${z.id}: item ${i.item} em (${i.x},${i.y}) "${ch(i.x, i.y)}" não livre`);
  const fl = new Set<string>(); for (const i of z.itens ?? []) { if (fl.has(i.flag)) E(`${z.id}: flag de item repetida ${i.flag}`); fl.add(i.flag); }
  for (const p of z.portoes ?? []) for (let y = p.y; y < p.y + (p.h ?? 1); y++) for (let x = p.x; x < p.x + (p.w ?? 1); x++) if (!(livre(x, y) || agua(x, y))) E(`${z.id}: portão em (${x},${y}) sobre tile bloqueado`);
  if (z.pouso && !livre(z.pouso[0], z.pouso[1])) E(`${z.id}: pouso bloqueado`);
  if (z.tipo === 'cidade' && !z.pouso) E(`${z.id}: cidade sem pouso`);
  if (z.passo === undefined) E(`${z.id}: sem passo`);
  if (z.mapa !== (z.id.startsWith('PP') ? 'PP' : 'B')) E(`${z.id}: mapa ${z.mapa} (esperado ${z.id.startsWith('PP') ? 'PP' : 'B'})`);
  const txt = JSON.stringify(z);
  if (new RegExp(['TO' + 'DO', 'FIX' + 'ME'].join('|')).test(txt) || new RegExp(['place' + 'holder', 'lo' + 'rem'].join('|'), 'i').test(txt)) E(`${z.id}: palavra proibida`);
}
const POR_EVENTO = /^(garrote|rival-8-|conselho-[1-5]|PP-andarilho)$|^rival-8-/;
for (const t of TREINADORES) if (!usados.has(t.id) && !POR_EVENTO.test(t.id)) E(`treinador ${t.id} não está em nenhuma zona`);

/* ---------- alcance com Amuletos ---------- */
type Cap = 'facao' | 'remo' | 'forca' | 'quebra' | 'escalar' | 'cachoeira' | 'portoes';
function alcance(z: ZonaDef, caps: Cap[], ini: [number, number][], tapa?: [number, number], tapas: [number, number][] = []): Set<string> {
  const { w, h, b } = blocos(z); if (tapa) b[tapa[1] * w + tapa[0]] = 1; for (const [tx, ty] of tapas) b[ty * w + tx] = 1;
  const ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ', tem = (c: Cap) => caps.includes(c);
  const portao = (x: number, y: number) => !tem('portoes') && (z.portoes ?? []).some((p) => x >= p.x && y >= p.y && x < p.x + (p.w ?? 1) && y < p.y + (p.h ?? 1));
  const ok = (x: number, y: number, dy: number, dx: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || portao(x, y)) return false;
    const c = ch(x, y);
    if (c === 'w') return tem('remo') && dx === 0 && (dy > 0 || tem('cachoeira'));
    if (c === 'e') return tem('escalar') && dx === 0;
    return LIVRE.has(c) || (c === 'c' && tem('facao')) || ('~d'.includes(c) && tem('remo')) || (c === 'p' && tem('forca')) || (c === 'r' && tem('quebra'));
  };
  const vis = new Set<string>(), fila: [number, number][] = [];
  for (const [x, y] of ini) if (!vis.has(x + ',' + y)) { vis.add(x + ',' + y); fila.push([x, y]); }
  while (fila.length) { const [x, y] = fila.shift()!;
    for (const [dx, dy, s] of [[0, 1, 'v'], [0, -1, ''], [1, 0, '>'], [-1, 0, '<']] as [number, number, string][]) {
      let nx = x + dx, ny = y + dy; if (s && ch(nx, ny) === s) { nx += dx; ny += dy; if (b[ny * w + nx] || !LIVRE.has(ch(nx, ny))) continue; }
      const wp = z.warps.find((q) => q.x === nx && q.y === ny);
      const passa = ok(nx, ny, dy, dx);
      if (!passa && !(wp && ehEnt(wp.tipo) && !portao(nx, ny))) continue;
      if (vis.has(nx + ',' + ny)) continue;
      vis.add(nx + ',' + ny); if (passa) fila.push([nx, ny]); } }
  return vis;
}
const chegadas = (z: ZonaDef): [number, number][] => { const l: [number, number][] = []; if (z.pouso) l.push(z.pouso); for (const o of Z.values()) for (const q of o.warps) if (q.para.zona === z.id) l.push([q.para.x, q.para.y]); return l; };
const chegaA = (z: ZonaDef, v: Set<string>, dest: string, caps: Cap[]) => z.warps.some((q) => q.para.zona === dest && v.has(q.x + ',' + q.y) && (!q.requer || caps.includes('portoes')));
const TODOS_AMULETOS: Cap[] = ['facao', 'remo', 'quebra', 'forca', 'escalar', 'cachoeira'];
// caminho principal e portões (passos 14–17): [zona, x, y, destino, Amuletos/portões, deve chegar]
const R: [string, number, number, string, Cap[], boolean][] = [
  ['B-R5', 1, 16, 'B8', TODOS_AMULETOS, false], ['B-R5', 1, 16, 'B8', ['portoes'], true], ['B-R5', 88, 16, 'B7', ['portoes'], true],
  ['B8', 1, 19, 'B8-ginasio', [], true], ['B8', 1, 19, 'B8-posto', [], true], ['B8', 1, 19, 'B8-observatorio', [], true],
  ['B8', 1, 19, 'B-FA', TODOS_AMULETOS, false], ['B8', 1, 19, 'B-FA', ['portoes'], true],
  ['B-SG', 6, 38, 'B-LG', [], true], ['B-SG', 6, 38, 'B7', [], true], ['B-LG', 24, 42, 'B-SG', [], true],
  ['B-LG', 24, 42, 'B-LG-cabana', ['facao', 'quebra', 'forca', 'escalar'], false], ['B-LG', 24, 42, 'B-LG-cabana', ['remo'], true],
  ['PP', 6, 52, 'PP-posto', [], true], ['PP', 34, 52, 'PP-venda', [], true], ['PP', 34, 52, 'A-MT', ['portoes'], true],
  ['PP', 6, 52, 'PP-conselho', TODOS_AMULETOS, false], ['PP', 6, 52, 'PP-conselho', ['portoes'], true], ['PP', 6, 52, 'PP-gruta', ['portoes'], true],
  ['PP-gruta', 4, 14, 'PP', [], true], ['PP-conselho', 15, 55, 'PP', [], true],
  ['B-FA', 30, 58, 'B8', [], true],
];
let nRotas = 0;
for (const [zid, x, y, dest, caps, deve] of R) { const z = Z.get(zid); if (!z) { E(`rota: zona ${zid} não existe`); continue; } nRotas++;
  const v = alcance(z, caps, [[x, y]]); if (chegaA(z, v, dest, caps) !== deve) E(`alcance ${zid} (${x},${y}) → ${dest} com [${caps.join(', ')}]: esperado ${deve ? 'chegar' : 'NÃO chegar'}`); }

/** Amuletos que o jogador já tem ao chegar a cada zona; os itens que pedem mais que isso são as áreas de Amuleto */
const base = (_id: string): Cap[] => ['facao', 'remo', 'quebra', 'forca'];
const TODAS: Cap[] = ['facao', 'remo', 'forca', 'quebra', 'escalar', 'cachoeira', 'portoes'];
let nFechados = 0, nVisao = 0, nItens = 0; const fechados: string[] = [];
const perto = (v: Set<string>, x: number, y: number) => v.has(x + ',' + y) || [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => v.has(x + dx + ',' + (y + dy)));
for (const z of meus) {
  const ini = chegadas(z); if (!ini.length) { E(`${z.id}: nenhuma chegada (zona isolada)`); continue; }
  const bs = base(z.id), tudo = alcance(z, TODAS, ini), pe = alcance(z, [...bs, 'portoes'], ini);
  for (const i of z.itens ?? []) { nItens++;
    const k = i.x + ',' + i.y;
    if (!tudo.has(k)) { E(`${z.id}: item ${i.item} (${k}) inalcançável mesmo com todos os Amuletos`); continue; }
    if (!pe.has(k)) { nFechados++; const precisa = (['escalar', 'cachoeira'] as Cap[]).filter((c) => alcance(z, [...bs, 'portoes', c], ini).has(k)); fechados.push(`${z.id} ${i.item} → ${precisa.join('/') || 'escalar+cachoeira'}`); }
  }
  for (const n of z.npcs ?? []) if (!perto(tudo, n.x, n.y)) E(`${z.id}: NPC ${n.id} (${n.x},${n.y}) inalcançável`);
  const gente = (z.npcs ?? []).filter((n) => !n.se).map((n) => [n.x, n.y] as [number, number]);
  for (const p of ini) { if (gente.some(([gx, gy]) => gx === p[0] && gy === p[1])) { E(`${z.id}: NPC parado na chegada (${p})`); continue; }
    const livreDeGente = alcance(z, TODAS, [p]), comGente = alcance(z, TODAS, [p], undefined, gente);
    for (const wp of z.warps) if (livreDeGente.has(wp.x + ',' + wp.y) && !comGente.has(wp.x + ',' + wp.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o warp (${wp.x},${wp.y}) → ${wp.para.zona}`);
    for (const i of z.itens ?? []) if (livreDeGente.has(i.x + ',' + i.y) && !perto(comGente, i.x, i.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o item ${i.item} (${i.x},${i.y})`); }
  for (const o of z.objetos ?? []) if ((o.script || o.texto) && cat[o.o] && !perto(tudo, o.x, o.y) && !perto(tudo, o.x, o.y + 1)) E(`${z.id}: objeto interativo ${o.o} (${o.x},${o.y}) inalcançável`);
  for (const wp of z.warps) if (!tudo.has(wp.x + ',' + wp.y)) E(`${z.id}: warp (${wp.x},${wp.y}) → ${wp.para.zona} inalcançável`);
  for (const gt of z.gatilhos ?? []) { let algum = false; for (let y = gt.y; y < gt.y + (gt.h ?? 1); y++) for (let x = gt.x; x < gt.x + (gt.w ?? 1); x++) if (tudo.has(x + ',' + y)) algum = true; if (!algum) E(`${z.id}: gatilho ${gt.script} (${gt.x},${gt.y}) inalcançável`); }
  // linha de visão: o treinador enxerga pelo menos 1 tile pisável e não tapa passagem quando para no caminho
  const { w, h, b } = blocos(z), D: Record<string, [number, number]> = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
  for (const n of z.npcs ?? []) { if (!n.treinador) continue; nVisao++;
    const [dx, dy] = D[n.dir ?? 's']; let pis = 0;
    for (let k = 1; k <= (n.visao ?? 4); k++) { const x = n.x + dx * k, y = n.y + dy * k; if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || !(LIVRE.has(z.mapaChars[y][x]) || '~d'.includes(z.mapaChars[y][x])) || (z.npcs ?? []).some((m) => m.x === x && m.y === y && !m.se)) break; if (tudo.has(x + ',' + y)) pis++; }
    if (pis < 1) E(`${z.id}: treinador ${n.id} (${n.x},${n.y}) olhando ${n.dir} não vê nenhum tile pisável`);
    const alvos = (v: Set<string>) => [...z.warps.map((q) => q.x + ',' + q.y), ...(z.itens ?? []).map((i) => i.x + ',' + i.y)].filter((k) => v.has(k)).length;
    for (let k = 1; k < (n.visao ?? 4); k++) { const x = n.x + dx * k, y = n.y + dy * k; if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || !LIVRE.has(z.mapaChars[y][x])) break;
      if (ini.some((p) => (p[0] !== x || p[1] !== y) && alvos(alcance(z, TODAS, [p], [x, y])) < alvos(alcance(z, TODAS, [p])))) { E(`${z.id}: treinador ${n.id} tapa passagem se parar em (${x},${y})`); break; } }
  }
}

/* ---------- tabela 6.4: a espécie citada (ou a forma que ela tem no nível) no método e período indicados ---------- */
type L = [number, Habitat['metodo'], ('n' | 'd')?];
const T64: Record<string, L[]> = {
  'B-SG': [[47, 'grama', 'd'], [60, 'grama', 'n'], [135, 'grama', 'd'], [136, 'grama', 'd'], [139, 'grama', 'n'], [140, 'grama', 'n'], [161, 'grama'], [137, 'arvore'], [138, 'arvore']],
  'B-LG': [[58, 'agua'], [75, 'agua'], [76, 'agua'], [106, 'grama'], [133, 'agua'], [134, 'agua'], [156, 'grama']],
  'B-R5': [[70, 'grama', 'n'], [94, 'grama'], [170, 'arvore', 'n'], [172, 'arvore', 'n']],
  // "B-PL" da tabela 6.4 = os Campos do Lume, dentro de B8 (Planalto Lume)
  B8: [[48, 'grama', 'd'], [54, 'grama'], [56, 'grama'], [150, 'arvore', 'd'], [158, 'grama']],
  'B-FA': [[62, 'arvore'], [72, 'grama'], [85, 'agua'], [98, 'grama'], [109, 'grama'], [110, 'grama'], [144, 'arvore'], [160, 'rocha']],
  PP: [[12, 'grama'], [52, 'grama'], [66, 'grama'], [72, 'grama'], [110, 'grama'], [136, 'grama'], [140, 'grama']],
  'PP-gruta': [[32, 'caverna']],
};
const esp = new Map(ESPECIES.map((e) => [e.num, e]));
const formas = (e: number, nv: number): number[] => { const l = [e]; let s = esp.get(e); while (s) { const v = (s.evolui ?? []).find((q) => q.nivel && q.nivel <= nv); if (!v) break; l.push(v.para); s = esp.get(v.para); } return l; };
const tabelas = (hb: Habitat) => [hb, ...(hb.camadas ?? [])];
let n64 = 0;
for (const [zid, l] of Object.entries(T64)) {
  const z = Z.get(zid); if (!z) { E(`6.4: ${zid} não existe`); continue; }
  for (const [e, m, per] of l) { n64++;
    const ok = (z.habitats ?? []).filter((hb) => hb.metodo === m).some((hb) => tabelas(hb).some((t) => {
      const cand = per === 'n' ? [...(t.noite ?? []), ...(t.noite ? [] : t.todos ?? [])] : per === 'd' ? [...(t.dia ?? []), ...(t.manha ?? []), ...(t.todos ?? [])] : [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])];
      return cand.some((q) => formas(e, q.nv[1]).includes(q.e));
    }));
    if (!ok) E(`6.4: espécie ${e} (${esp.get(e)?.nome}) ausente de ${zid} (${m}${per ? ', ' + (per === 'n' ? 'noite' : 'dia') : ''}), nem na forma do nível`);
  }
}
// espécies por evento (E da tabela 6.4 e os Ninhos Raros do spec 6.2)
const txtEv = (id: string) => JSON.stringify(EVENTOS.find((e) => e.id === id)?.passos ?? []);
for (const [id, nums] of [['b2n-uirapuru', [177]], ['b2n-jubarte', [132]], ['b2n-mapinguari', [175]], ['b2n-ninho-mata', [2, 3]], ['b2n-ninho-brasa', [5, 6]], ['b2n-ninho-rio', [8, 9]]] as [string, number[]][]) {
  for (const n of nums) { n64++; if (!txtEv(id).includes(`["selvagem",${n},`)) E(`evento ${id} não oferece a espécie ${n}`); }
}
if (!txtEv('b2n-uirapuru').includes('periodo:manha&diario:150')) E('Uirapuru: o spec pede o amanhecer e 150 no Diário');

/* ---------- coerência de níveis (spec 4.5) ---------- */
const evoluiDe = new Map<number, number>(); for (const e of ESPECIES) for (const v of e.evolui ?? []) if (v.nivel) evoluiDe.set(v.para, v.nivel);
function confere(onde: string, e: number, nv: number, basicoPermitido = false) {
  const s = esp.get(e); if (!s) { E(`${onde}: espécie ${e} inexistente`); return; }
  if (s.lendario) return;
  const de = evoluiDe.get(e); if (de && nv < de) E(`${onde}: ${s.nome} no nível ${nv}, abaixo da evolução (nv ${de})`);
  const para = (s.evolui ?? []).find((v) => v.nivel); if (para?.nivel && nv >= para.nivel && !basicoPermitido) E(`${onde}: ${s.nome} no nível ${nv} já devia ter evoluído (nv ${para.nivel})`);
}
/** faixa dos selvagens por zona e das camadas pós-insígnia */
const FAIXA: [RegExp, [number, number], number, [number, number]][] = [
  [/^(B-SG|B-LG)/, [55, 57], 15, [58, 60]],
  [/^(B-R5|B8)/, [55, 59], 16, [60, 63]],
  [/^PP/, [62, 65], 99, [0, 0]],
  [/^B-FA/, [65, 75], 99, [0, 0]],
];
let nTab = 0;
for (const z of meus) {
  const fx = FAIXA.find(([re]) => re.test(z.id)); if (!fx) { if (z.habitats?.length) E(`${z.id}: habitats sem faixa`); continue; }
  const [, [lo, hi], apos, [clo, chi]] = fx;
  for (const hb of z.habitats ?? []) tabelas(hb).forEach((t, ci) => {
    const camada = ci > 0 ? (hb.camadas ?? [])[ci - 1] : undefined;
    for (const q of [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])] as Encontro[]) {
      confere(`${z.id} ${hb.metodo}${camada ? ` (camada ${camada.apos})` : ''}`, q.e, q.nv[0], hb.metodo === 'pesca-velha');
      if (q.nv[0] > q.nv[1]) E(`${z.id} ${hb.metodo}: faixa invertida da espécie ${q.e}`);
      if (hb.metodo === 'pesca-velha') continue;
      if (!camada && (q.nv[0] < lo || q.nv[1] > hi)) E(`${z.id} ${hb.metodo}: espécie ${q.e} nv ${q.nv[0]}–${q.nv[1]} fora de ${lo}–${hi}`);
      if (camada && (camada.apos !== apos || q.nv[0] < clo || q.nv[1] > chi)) E(`${z.id} ${hb.metodo}: camada ${camada.apos} com nv ${q.nv[0]}–${q.nv[1]} (esperado camada ${apos}, ${clo}–${chi})`);
    }
    if (!camada && ['grama', 'caverna'].includes(hb.metodo)) for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { nTab++; if (l.length < 6) E(`${z.id} ${hb.metodo}: só ${l.length} espécies no período (spec 6.4: 6 a 16)`); }
    for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { const p = l.reduce((a, c) => a + c.peso, 0); if (l.length && (p < 80 || p > 125)) A(`${z.id} ${hb.metodo}: pesos somam ${p}`); }
  });
}
/** faixa dos treinadores: [regex do id, mínimo, máximo] */
const FT: [RegExp, number, number][] = [[/^(B-SG|B-LG)-/, 55, 57], [/^(B-R5|B8)-/, 55, 59], [/^PP-[1-8]$/, 62, 64], [/^B-FA-/, 65, 75], [/^garrote$/, 62, 64], [/^rival-8-/, 63, 65], [/^conselho-/, 64, 70], [/^PP-andarilho$/, 75, 80]];
for (const t of TREINADORES) {
  const fx = FT.find(([re]) => re.test(t.id)); if (!fx) { E(`treinador ${t.id} sem faixa de nível`); continue; }
  for (const m of t.equipe) { confere(`treinador ${t.id}`, m.e, m.nv, /^rival/.test(t.id) && [3, 6, 9].includes(m.e)); if (m.nv < fx[1] || m.nv > fx[2]) E(`treinador ${t.id}: ${esp.get(m.e)?.nome} nv ${m.nv} fora de ${fx[1]}–${fx[2]}`); }
  if (!t.desafio || !t.derrota || t.premio <= 0) E(`treinador ${t.id}: falta fala ou prêmio`);
  const chefe = /^(garrote|rival-8-|conselho-|PP-andarilho)/.test(t.id);
  if (t.itens?.length && !chefe) E(`treinador ${t.id}: treinador comum com item de cura (spec 7A)`);
  if (chefe && !t.itens?.length) E(`treinador ${t.id}: chefe sem item de cura (spec 7A)`);
}

/* ---------- a sequência final ---------- */
const asDe = (id: string) => Math.max(...(ids.get(id)?.equipe ?? [{ nv: 0 }]).map((m) => m.nv));
const g = ids.get('garrote'); if (!g || g.flag !== 'garrote-vencido') E('garrote: falta o treinador ou a flag garrote-vencido');
let antes = asDe('garrote');
for (const r of ['rival-8-brasa', 'rival-8-rio', 'rival-8-mata']) { const t = ids.get(r); if (!t || t.flag !== 'rival-8') E(`${r}: falta ou flag errada`); if (asDe(r) <= antes) E(`${r}: ás ${asDe(r)} não passa o do Garrote (${antes})`); }
antes = 63;
for (let n = 1; n <= 5; n++) {
  const t = ids.get(`conselho-${n}`); if (!t) { E(`conselho-${n}: não existe`); continue; }
  if (t.ia !== 'conselho') E(`conselho-${n}: IA ${t.ia} (esperado conselho)`);
  if (asDe(t.id) < antes) E(`conselho-${n}: ás ${asDe(t.id)} abaixo do anterior (${antes})`); antes = asDe(t.id);
  const lend = t.equipe.filter((m) => esp.get(m.e)?.lendario);
  if (n < 5 && lend.length) E(`conselho-${n}: só o Guardião-Mor leva lendário`);
  if (n === 5 && (lend.length !== 1 || lend[0].nv !== 70)) E('conselho-5: o Guardião-Mor leva exatamente 1 lendário, no nível 70');
  const ev = txtEv(`conselho-${n}`); if (!ev.includes(`"batalha","conselho-${n}"`) || !ev.includes('semMarca')) E(`evento conselho-${n}: sem a batalha da sequência (segue + semMarca)`);
}
if (asDe('conselho-5') !== 70) E('conselho-5: ás deve ser 70');
const vit = txtEv('conselho-vitoria');
for (const k of ['"conselho-vencido"', '"pos-jogo"', '"creditos"', '["errante",179', '["errante",180', '"misterioso-pode"']) if (!vit.includes(k)) E(`conselho-vitoria: falta ${k}`);
const der = txtEv('conselho-derrota'); const pp = Z.get('PP');
if (pp) { const m = der.match(/\["warp","PP",(\d+),(\d+)/); if (!m) E('conselho-derrota: não leva ao Portão'); else { const [x, y] = [Number(m[1]), Number(m[2])]; if (!LIVRE.has(pp.mapaChars[y]?.[x] ?? ' ')) E('conselho-derrota: o tile do Portão não é livre'); if (!(pp.portoes ?? []).some((q) => q.requer === 'insignias:16' && Math.abs(q.y - y) <= 2)) E('conselho-derrota: não cai junto do Portão dos Guardiões'); } }
if (!txtEv('pp-garrote').includes('"garrote-vencido"')) E('pp-garrote: não marca garrote-vencido');

console.log(`\nÁreas de Amuleto (fora de alcance na chegada): ${fechados.join(' · ')}`);
console.log(`${meus.length} zonas · ${TREINADORES.length} treinadores (${nVisao} com linha de visão) · ${EVENTOS.length} eventos · ${nRotas} rotas de alcance · ${nItens} itens (${nFechados} em áreas de Amuleto) · ${n64} linhas da 6.4 · ${nTab} tabelas de selvagens`);
console.log(erros ? `FALHOU: ${erros} erro(s), ${avisos} aviso(s)` : `OK: 0 erros, ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
