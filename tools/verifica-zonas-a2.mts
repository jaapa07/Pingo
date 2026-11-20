// verificador do time A2: grades, objetos, warps em pares, tiles livres, scripts/treinadores, linha de visão,
// alcance tile a tile com e sem Amuletos (caminho principal e áreas fechadas), tabela 6.4 e coerência de níveis.
import { readdirSync } from 'node:fs';
import type { ZonaDef, Encontro, Habitat } from '../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { ESPECIES } from '../src/data/criaturas';
import { TREINADORES_A2 } from '../src/data/treinadores/a2';
import { EVENTOS_A2 } from '../src/data/eventos/a2';
import { EVENTOS_COMUNS } from '../src/data/eventos/comuns';
import { EVENTOS_REGRAS } from '../src/data/eventos/regras'; // regras clássicas (spec 10A): Quiz do Rádio
import { EVENTOS_CAPTURA } from '../src/data/eventos/captura'; // captura e criação: cuieiras, artesão, ninho, trocas, lago (docs/CAPTURA-CRIACAO.md)

const dir = new URL('../src/data/zonas/', import.meta.url).pathname;
const MEUS = /^(A5|A6|A7|A8|A9|A-R4|A-R5|A-R6|A-US|A-BA|A-PR|A-MG|A-GB|A-RS|A-MT)(-|$)/;
const Z = new Map<string, ZonaDef>();
for (const f of readdirSync(dir)) { if (f.startsWith('_')) continue; try { const m = await import(dir + f); if (m.default?.mapaChars) Z.set(m.default.id, m.default); } catch (e) { if (MEUS.test(f.replace('.ts', ''))) console.log('ERRO ao carregar', f, String(e).slice(0, 300)); } }
const cat: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
let erros = 0, avisos = 0; const E = (s: string) => { erros++; console.log('✗', s); }; const A = (s: string) => { avisos++; console.log('·', s); };
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
const ids = new Map(TREINADORES_A2.map((t) => [t.id, t])), evs = new Set([...EVENTOS_A2, ...EVENTOS_COMUNS, ...EVENTOS_REGRAS, ...EVENTOS_CAPTURA].map((e) => e.id));

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
    if (!d) { if (meu(wp.para.zona)) E(`${z.id}: warp para zona inexistente ${wp.para.zona}`); else A(`${z.id} → ${wp.para.zona}: zona de outro time ainda ausente`); continue; }
    const B = blocos(d), c = d.mapaChars[wp.para.y]?.[wp.para.x] ?? ' ';
    if (!(LIVRE.has(c) || '~d'.includes(c)) || B.b[wp.para.y * B.w + wp.para.x]) E(`${z.id}: warp (${wp.x},${wp.y}) chega em ${d.id} (${wp.para.x},${wp.para.y}) = "${c}" bloqueado`);
    if (d.warps.some((q) => q.x === wp.para.x && q.y === wp.para.y) && c !== 'd' && !d.submerso) E(`${z.id}: warp chega em cima de outro warp em ${d.id} (${wp.para.x},${wp.para.y})`);
    if (wp.requer !== 'nunca' && !d.warps.some((q) => q.para.zona === z.id)) E(`${z.id} → ${d.id}: sem warp de volta`);
    // ida e volta coerentes: a volta deve chegar a até 2 tiles do warp de ida
    const volta = d.warps.filter((q) => q.para.zona === z.id);
    if (wp.requer !== 'nunca' && wp.tipo !== 'buraco' && volta.length && !volta.some((q) => Math.abs(q.para.x - wp.x) + Math.abs(q.para.y - wp.y) <= 4)) (meu(d.id) ? E : A)(`${z.id} (${wp.x},${wp.y}) → ${d.id}: a volta não chega perto do warp de ida`);
  }
  for (const n of z.npcs ?? []) {
    if (!livre(n.x, n.y)) E(`${z.id}: NPC ${n.id} em (${n.x},${n.y}) "${ch(n.x, n.y)}" não livre`);
    if (n.treinador) { usados.add(n.treinador); if (!ids.has(n.treinador)) E(`${z.id}: treinador ${n.treinador} sem definição`); }
    if (n.script && !evs.has(n.script)) E(`${z.id}: script ${n.script} inexistente`);
    if ((z.warps ?? []).some((q) => q.x === n.x && q.y === n.y)) E(`${z.id}: NPC ${n.id} em cima de warp`);
  }
  const vistos = new Map<string, string>();
  for (const n of z.npcs ?? []) { const k = n.x + ',' + n.y; if (vistos.has(k) && !n.se) E(`${z.id}: NPCs ${vistos.get(k)} e ${n.id} no mesmo tile sem condição`); vistos.set(k, n.id); }
  for (const o of z.objetos ?? []) if (typeof o.script === 'string' && !evs.has(o.script)) E(`${z.id}: script de objeto ${o.script} inexistente`);
  for (const g of z.gatilhos ?? []) if (!evs.has(g.script)) E(`${z.id}: gatilho ${g.script} inexistente`);
  for (const i of z.itens ?? []) if (!livre(i.x, i.y)) E(`${z.id}: item ${i.item} em (${i.x},${i.y}) "${ch(i.x, i.y)}" não livre`);
  const fl = new Set<string>(); for (const i of z.itens ?? []) { if (fl.has(i.flag)) E(`${z.id}: flag de item repetida ${i.flag}`); fl.add(i.flag); }
  for (const p of z.portoes ?? []) for (let y = p.y; y < p.y + (p.h ?? 1); y++) for (let x = p.x; x < p.x + (p.w ?? 1); x++) if (!(livre(x, y) || agua(x, y) || z.warps.some((q) => q.x === x && q.y === y))) E(`${z.id}: portão em (${x},${y}) "${ch(x, y)}" não é passagem`);
  if (z.pouso && !livre(z.pouso[0], z.pouso[1])) E(`${z.id}: pouso bloqueado`);
  if (z.tipo === 'cidade' && !z.pouso) E(`${z.id}: cidade sem pouso`);
  if (z.passo === undefined) E(`${z.id}: sem passo`);
  const txt = JSON.stringify(z); if (new RegExp(['TO' + 'DO', 'FIX' + 'ME'].join('|')).test(txt) || new RegExp(['place' + 'holder', 'lo' + 'rem'].join('|'), 'i').test(txt)) E(`${z.id}: palavra proibida`);
}
for (const t of TREINADORES_A2) if (!usados.has(t.id) && !/^(rival-4|A-US-lata|A6-rebite|A6-FA-[89])/.test(t.id)) E(`treinador ${t.id} não está em nenhuma zona`);

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
const chegadas = (z: ZonaDef): [number, number][] => { const l: [number, number][] = []; if (z.pouso) l.push(z.pouso); for (const o of Z.values()) for (const q of o.warps) if (q.para.zona === z.id && q.requer !== 'nunca') l.push([q.para.x, q.para.y]); return l; };
/** warp aberto? (os de `requer` contam como portão) */
const chegaA = (z: ZonaDef, v: Set<string>, dest: string, caps: Cap[]) => z.warps.some((q) => q.para.zona === dest && v.has(q.x + ',' + q.y) && (!q.requer || caps.includes('portoes')));

// caminho principal, na ordem nova: [zona, x, y, destino, Amuletos/portões, deve chegar]
const R: [string, number, number, string, Cap[], boolean][] = [
  ['A-R4', 1, 12, 'A-US-1', [], true], ['A-R4', 1, 12, 'A-MG', [], false], ['A-R4', 1, 12, 'A-MG', ['facao'], true],
  ['A-US-1', 15, 20, 'A-US-3', [], true], ['A-US-1', 15, 20, 'A-US-2', [], false], ['A-US-1', 15, 20, 'A-US-2', ['portoes'], true],
  ['A-BA', 4, 20, 'A5', [], false], ['A-BA', 4, 20, 'A5', ['remo'], true], ['A-BA', 4, 20, 'A6', ['remo'], false], ['A-BA', 4, 20, 'A6', ['remo', 'portoes'], true],
  ['A-BA', 4, 20, 'A-PR', ['remo'], false], ['A-BA', 4, 20, 'A-PR', ['remo', 'portoes'], true], ['A-BA', 4, 20, 'A-MG', ['remo'], true],
  ['A5', 24, 1, 'A5-ginasio', ['remo'], true], ['A5', 24, 1, 'A-GB-1', ['remo'], false], ['A5', 24, 1, 'A-GB-1', ['remo', 'portoes'], true], ['A5', 24, 1, 'B9', ['remo'], false],
  ['A6', 1, 16, 'A6-farol-1', ['remo'], true], ['A6', 1, 16, 'A6-ginasio', ['remo'], false], ['A6', 1, 16, 'A6-ginasio', ['remo', 'portoes'], true],
  ['A6-farol-1', 7, 12, 'A6-farol-2', [], true], ['A6-farol-2', 2, 2, 'A6-farol-3', [], false], ['A6-farol-2', 13, 2, 'A6-farol-3', [], true], ['A6-farol-3', 13, 11, 'A6-farol-4', [], true],
  ['A-GB-1', 5, 26, 'A-GB-2', [], true], ['A-GB-2', 2, 2, 'A7', [], true],
  ['A7', 5, 4, 'A7-ginasio', [], true], ['A7', 5, 4, 'A-R5', [], true], ['A7', 5, 4, 'A-R6', ['remo'], false], ['A7', 5, 4, 'A-R6', ['remo', 'cachoeira'], true],
  ['A-R5', 1, 14, 'A8', [], false], ['A-R5', 1, 14, 'A8', ['quebra'], true],
  ['A8', 1, 15, 'A8-ginasio', [], true], ['A8', 1, 15, 'A-R7', [], false], ['A8', 1, 15, 'A-R7', ['forca'], true], ['A8', 1, 15, 'A-MT', [], true], ['A8', 1, 15, 'A-R6', ['remo'], false], ['A8', 1, 15, 'A-R6', ['remo', 'portoes'], true],
  ['A-MG', 30, 1, 'A-BA', ['facao'], false], ['A-MG', 30, 1, 'A-BA', ['facao', 'remo'], true],
  ['A-MT', 20, 58, 'A-MT-gruta', ['remo', 'escalar', 'cachoeira'], false], ['A-MT', 20, 58, 'A-MT-gruta', ['remo', 'cachoeira', 'portoes'], false], ['A-MT', 20, 58, 'A-MT-gruta', ['escalar', 'portoes'], true],
  ['A-MT-gruta', 14, 15, 'A-MT', [], true], ['A-MT', 24, 23, 'A9', ['remo'], false], ['A-MT', 24, 23, 'A9', ['remo', 'cachoeira'], true], ['A-MT', 24, 23, 'PP', ['remo', 'cachoeira'], false], ['A-MT', 24, 23, 'PP', ['remo', 'cachoeira', 'portoes'], true],
  ['A-R6', 14, 58, 'A8', ['remo'], false], ['A-R6', 14, 58, 'A8', ['remo', 'cachoeira'], true], ['A-R6', 14, 1, 'A7', ['remo'], true], ['A9', 1, 15, 'A9-ginasio', [], true],
];
let nRotas = 0;
for (const [zid, x, y, dest, caps, deve] of R) { const z = Z.get(zid); if (!z) { A(`rota: zona ${zid} ainda não existe`); continue; } nRotas++;
  const v = alcance(z, caps, [[x, y]]); if (chegaA(z, v, dest, caps) !== deve) E(`alcance ${zid} (${x},${y}) → ${dest} com [${caps.join(', ')}]: esperado ${deve ? 'chegar' : 'NÃO chegar'}`); }
// o Farol exige a alavanca: com o portão fechado, a escada leste do térreo não se alcança
{ const z = Z.get('A6-farol-1'); if (z) { const v = alcance(z, [], [[7, 12]]); if (v.has('14,2')) E('A6-farol-1: escada leste alcançável sem a alavanca'); const v2 = alcance(z, ['portoes'], [[7, 12]]); if (!v2.has('14,2')) E('A6-farol-1: escada leste inalcançável com a grade aberta'); } }

/** Amuletos de base de cada zona (o que o jogador já tem ao chegar) e o Amuleto esperado de cada item fechado (sufixo da flag) */
const BASE: Record<string, Cap[]> = { 'A-BA': ['remo'], A5: ['remo'], A6: ['remo'], 'A-PR': ['remo'], 'A-MG': ['remo', 'facao'], 'A-GB-1': ['remo'], 'A-GB-2': ['remo'], A7: ['remo', 'facao'], 'A-R5': ['remo', 'facao', 'quebra'], A8: ['remo', 'facao', 'quebra'],
  'A-R6': ['remo', 'facao', 'forca', 'cachoeira'], 'A-RS': ['remo'], 'A-MT': ['remo', 'facao', 'quebra', 'forca', 'escalar', 'cachoeira'], 'A-MT-gruta': ['remo', 'facao', 'quebra', 'forca', 'escalar', 'cachoeira'], A9: ['remo', 'facao', 'quebra', 'forca', 'escalar', 'cachoeira'] };
const FECHADOS: Record<string, Cap> = {
  'item:A-R4:plato': 'escalar', 'item:A-R4:represa': 'remo', 'item:A-R4:furna': 'quebra', 'item:A-R4:acude': 'remo',
  'item:A-US-3:ilhota': 'remo',
  'item:A-BA:pedra': 'escalar', 'item:A6:prateleira': 'escalar', 'item:A6:loca': 'quebra',
  'item:A-GB-1:loca': 'quebra', 'item:A-GB-1:nicho': 'forca', 'item:A-GB-2:balcao': 'escalar',
  'item:A7:jazigo': 'quebra', 'item:A7:mirante': 'escalar', 'item:A7:cofre': 'forca',
  'item:A-R5:balcao': 'escalar', 'item:A-R5:cofre': 'forca', 'item:A8:balcao': 'escalar',
  'item:A-PR:pedra': 'quebra', 'item:A-PR:mirante': 'escalar', 'item:A-MG:furna': 'quebra', 'item:A-MG:tronco': 'forca',
  'item:A-R6:balcao': 'escalar', 'item:A-R6:loca': 'quebra',
};
const TODAS: Cap[] = ['facao', 'remo', 'forca', 'quebra', 'escalar', 'cachoeira', 'portoes'];
let nFechados = 0, nVisao = 0, nItens = 0;
const perto = (v: Set<string>, x: number, y: number) => v.has(x + ',' + y) || [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => v.has(x + dx + ',' + (y + dy)));
for (const z of meus) {
  const ini = chegadas(z); if (!ini.length) { A(`${z.id}: nenhuma chegada (zona isolada)`); continue; }
  const base = BASE[z.id] ?? [], tudo = alcance(z, TODAS, ini), pe = alcance(z, base, ini), comPortoes = alcance(z, [...base, 'portoes'], ini);
  for (const i of z.itens ?? []) { nItens++;
    const k = i.x + ',' + i.y, cap = FECHADOS[i.flag];
    if (!tudo.has(k)) { E(`${z.id}: item ${i.item} (${k}) inalcançável mesmo com todos os Amuletos`); continue; }
    if (cap) { nFechados++;
      if (pe.has(k)) E(`${z.id}: item ${i.item} (${k}) devia exigir ${cap}, mas abre com a base [${base.join(', ')}]`);
      else if (!alcance(z, [...base, cap], ini).has(k)) E(`${z.id}: item ${i.item} (${k}) não abre só com ${cap}`);
    } else if (!pe.has(k)) E(`${z.id}: item ${i.item} (${k}, ${i.flag}) fechado sem estar na lista de áreas de Amuleto`);
  }
  for (const n of z.npcs ?? []) if (!perto(comPortoes, n.x, n.y)) E(`${z.id}: NPC ${n.id} (${n.x},${n.y}) inalcançável`);
  // parados no lugar de origem, os NPCs (todos de uma vez) não podem tapar nenhuma passagem — só os que são barreira de propósito
  const BARREIRAS = new Set(['galho']);
  const gente = (z.npcs ?? []).filter((n) => !BARREIRAS.has(n.id)).map((n) => [n.x, n.y] as [number, number]);
  for (const p of ini) { if (gente.some(([gx, gy]) => gx === p[0] && gy === p[1])) continue;
    const livreDeGente = alcance(z, TODAS, [p]), comGente = alcance(z, TODAS, [p], undefined, gente);
    for (const wp of z.warps) if (wp.requer !== 'nunca' && livreDeGente.has(wp.x + ',' + wp.y) && !comGente.has(wp.x + ',' + wp.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o warp (${wp.x},${wp.y}) → ${wp.para.zona}`);
    for (const i of z.itens ?? []) if (livreDeGente.has(i.x + ',' + i.y) && !perto(comGente, i.x, i.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o item ${i.item} (${i.x},${i.y})`); }
  for (const o of z.objetos ?? []) if ((o.script || o.texto) && cat[o.o] && !perto(tudo, o.x, o.y) && !perto(tudo, o.x, o.y + 1)) E(`${z.id}: objeto interativo ${o.o} (${o.x},${o.y}) inalcançável`);
  for (const wp of z.warps) if (wp.requer !== 'nunca' && !tudo.has(wp.x + ',' + wp.y)) E(`${z.id}: warp (${wp.x},${wp.y}) → ${wp.para.zona} inalcançável`);
  // linha de visão: o treinador enxerga pelo menos 1 tile pisável à frente
  const { w, h, b } = blocos(z), D: Record<string, [number, number]> = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
  for (const n of z.npcs ?? []) { if (!n.treinador) continue; nVisao++;
    const [dx, dy] = D[n.dir ?? 's']; let pis = 0;
    for (let k = 1; k <= (n.visao ?? 4); k++) { const x = n.x + dx * k, y = n.y + dy * k; if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || !(LIVRE.has(z.mapaChars[y][x]) || '~d'.includes(z.mapaChars[y][x])) || (z.npcs ?? []).some((m) => m.x === x && m.y === y && !m.se)) break; if (tudo.has(x + ',' + y)) pis++; }
    if (pis < 1) E(`${z.id}: treinador ${n.id} (${n.x},${n.y}) olhando ${n.dir} não vê nenhum tile pisável`);
    // o treinador anda até o jogador e FICA lá: nenhuma parada dele pode tapar passagem (porta, corredor de 1 tile)
    const alvos = (v: Set<string>) => [...z.warps.filter((q) => q.requer !== 'nunca').map((q) => q.x + ',' + q.y), ...(z.itens ?? []).map((i) => i.x + ',' + i.y)].filter((k) => v.has(k)).length;
    for (let k = 1; k < (n.visao ?? 4); k++) { const x = n.x + dx * k, y = n.y + dy * k; if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || !LIVRE.has(z.mapaChars[y][x])) break;
      if (ini.some((p) => (p[0] !== x || p[1] !== y) && alvos(alcance(z, TODAS, [p], [x, y])) < alvos(alcance(z, TODAS, [p])))) { E(`${z.id}: treinador ${n.id} tapa passagem se parar em (${x},${y})`); break; } }
  }
}

/* ---------- tabela 6.4 (toda espécie citada nas minhas zonas, no método indicado; N/D = período) ---------- */
type L = [number, Habitat['metodo'], ('n' | 'd')?, 'fria'?];
const T64: Record<string, L[]> = {
  'A-R4': [[55, 'grama'], [88, 'grama'], [93, 'grama', 'n'], [141, 'grama', 'n'], [143, 'arvore'], [151, 'arvore'], [163, 'rocha']],
  'A-US': [[29, 'caverna'], [141, 'caverna'], [142, 'caverna'], [64, 'caverna'], [115, 'agua']],
  'A-BA': [[35, 'grama'], [37, 'pesca-velha'], [77, 'agua'], [79, 'agua'], [117, 'agua'], [121, 'agua', 'n'], [123, 'agua'], [125, 'agua'], [126, 'agua', 'n'], [131, 'agua', undefined, 'fria'], [132, 'agua']],
  'A-PR': [[36, 'grama'], [79, 'agua', 'n'], [80, 'agua', 'n'], [123, 'grama', 'n'], [125, 'agua'], [129, 'grama'], [133, 'grama', undefined, 'fria']],
  'A-MG': [[24, 'grama'], [25, 'grama', 'n'], [35, 'grama'], [36, 'grama'], [77, 'agua'], [83, 'grama'], [107, 'grama'], [108, 'grama'], [127, 'grama'], [129, 'grama']],
  'A-GB': [[30, 'caverna'], [31, 'caverna'], [171, 'caverna']],
  'A-R5': [[11, 'grama', 'd'], [14, 'grama'], [21, 'grama', 'n'], [53, 'grama'], [59, 'grama', 'n'], [65, 'grama'], [69, 'grama', 'n'], [99, 'grama', 'd'], [169, 'arvore', 'n']],
  'A-R6': [[23, 'arvore'], [38, 'pesca-mestra'], [44, 'grama', 'n'], [50, 'arvore'], [61, 'arvore'], [63, 'arvore'], [67, 'arvore', 'd'], [73, 'agua'], [75, 'agua'], [95, 'grama'], [97, 'grama'], [113, 'agua'], [137, 'arvore'], [144, 'arvore'], [167, 'grama'], [168, 'agua']],
  'A-RS': [[78, 'mergulho'], [80, 'mergulho'], [118, 'mergulho'], [119, 'mergulho'], [120, 'mergulho'], [121, 'mergulho'], [122, 'mergulho'], [124, 'mergulho'], [126, 'mergulho'], [130, 'mergulho']],
  'A-MT': [[62, 'arvore'], [68, 'arvore', 'd'], [109, 'grama'], [139, 'grama', 'n'], [156, 'grama'], [168, 'grama'], [172, 'arvore', 'n']],
};
const tabelas = (hb: Habitat) => [hb, ...(hb.camadas ?? [])];
let n64 = 0;
for (const [pref, l] of Object.entries(T64)) {
  const zs = [...Z.values()].filter((z) => z.id === pref || z.id.startsWith(pref + '-')); if (!zs.length) { A(`6.4: ${pref} ainda não existe`); continue; }
  for (const [e, m, per, est] of l) { n64++;
    const ok = zs.some((z) => (z.habitats ?? []).filter((hb) => hb.metodo === m).some((hb) => tabelas(hb).some((t) => {
      const cand = per === 'n' ? [...(t.noite ?? []), ...(t.noite ? [] : t.todos ?? [])] : per === 'd' ? [...(t.dia ?? []), ...(t.manha ?? []), ...(t.todos ?? [])] : [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])];
      return cand.some((q) => q.e === e && (!est || q.estacao === est));
    })));
    if (!ok) E(`6.4: espécie ${e} ausente de ${pref} (${m}${per ? ', ' + (per === 'n' ? 'noite' : 'dia') : ''}${est ? ', estação fria' : ''})`);
  }
}

/* ---------- coerência de níveis (spec 4.5) ---------- */
const esp = new Map(ESPECIES.map((e) => [e.num, e])), soma = (n: number) => Object.values(esp.get(n)!.base).reduce((a, c) => a + c, 0);
const evoluiDe = new Map<number, number>(); for (const e of ESPECIES) for (const v of e.evolui ?? []) if (v.nivel) evoluiDe.set(v.para, v.nivel);
/** teto (ás do próximo líder − 1) e piso por passo; retorno = 48–62 */
const FAIXA: Record<number, [number, number]> = { 3: [19, 25], 4: [19, 25], 5: [23, 29], 6: [26, 32], 7: [29, 35] };
/** zonas com treinadores de id próprio (A-MT-5 mora na gruta) */
const ZONA_DO_TREINADOR: Record<string, string> = { 'A-MT-5': 'A-MT' };
const RETORNO = /^(A-R6|A-RS|A-MT|A9)/;
function confere(onde: string, e: number, nv: number, selvagem: boolean, camada: boolean) {
  const s = esp.get(e); if (!s) { E(`${onde}: espécie ${e} inexistente`); return; }
  if (s.lendario) return;
  if (soma(e) >= 500 && nv < 36) E(`${onde}: ${s.nome} (estágio final) no nível ${nv} < 36`);
  if (soma(e) >= 500 && selvagem && !camada && !RETORNO.test(onde)) E(`${onde}: ${s.nome} (estágio final) selvagem fora de camada pós-insígnia`);
  const de = evoluiDe.get(e); if (de && nv < de) E(`${onde}: ${s.nome} no nível ${nv}, abaixo da evolução (nv ${de})`);
  const para = (s.evolui ?? []).find((v) => v.nivel); if (para?.nivel && nv >= para.nivel && !RETORNO.test(onde)) E(`${onde}: ${s.nome} no nível ${nv} já devia ter evoluído (nv ${para.nivel})`);
}
for (const z of meus) {
  const ret = RETORNO.test(z.id), fx = ret ? [48, 62] : FAIXA[z.passo ?? 0];
  for (const hb of z.habitats ?? []) tabelas(hb).forEach((t, ci) => {
    for (const q of [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])] as Encontro[]) {
      confere(`${z.id} ${hb.metodo}`, q.e, q.nv[0], true, ci > 0);
      if (q.nv[0] > q.nv[1]) E(`${z.id} ${hb.metodo}: faixa invertida da espécie ${q.e}`);
      if (ci === 0 && fx && !['pesca-mestra', 'rocha', 'pesca-velha'].includes(hb.metodo) && q.nv[1] > fx[1] + (hb.metodo === 'pesca-boa' ? 1 : 0)) E(`${z.id} ${hb.metodo}: espécie ${q.e} nv ${q.nv[1]} acima do teto ${fx[1]} do passo ${z.passo}`);
      if (ci > 0 && !ret && q.nv[1] > 44) E(`${z.id} ${hb.metodo}: camada com nv ${q.nv[1]} > 44`);
      if (ret && (q.nv[0] < 48 || q.nv[1] > 62) && hb.metodo !== 'pesca-velha') E(`${z.id} ${hb.metodo}: espécie ${q.e} fora de 48–62`);
    }
    const lista = [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][];
    for (const l of lista) { const p = l.reduce((a, c) => a + c.peso, 0); if (l.length && (p < 80 || p > 125)) A(`${z.id} ${hb.metodo}: pesos somam ${p}`); }
  });
}
for (const t of TREINADORES_A2) {
  const zid = t.id.startsWith('rival-4') ? 'A6' : t.id.replace(/-(FA-)?[0-9a-z]+$/, ''), z = Z.get(zid) ?? Z.get(zid + '-1'), ret = RETORNO.test(t.id);
  const fx = ret ? [48, 62] : FAIXA[z?.passo ?? 0]; if (!fx) { A(`treinador ${t.id}: zona ${zid} sem faixa`); continue; }
  const chefe = /lata|rebite|rival/.test(t.id);
  for (const m of t.equipe) { confere(`treinador ${t.id}`, m.e, m.nv, false, false); if (m.nv > fx[1] + (chefe ? 1 : 0)) E(`treinador ${t.id}: nv ${m.nv} acima do teto ${fx[1]}`); if (m.nv < fx[0] && m.nv === Math.max(...t.equipe.map((q) => q.nv))) E(`treinador ${t.id}: ás nv ${m.nv} abaixo do piso ${fx[0]}`); }
  if (!t.desafio || !t.derrota || t.premio <= 0) E(`treinador ${t.id}: falta fala ou prêmio`);
}
console.log(`\n${meus.length} zonas · ${TREINADORES_A2.length} treinadores (${nVisao} com linha de visão) · ${EVENTOS_A2.length} eventos · ${nRotas} rotas de alcance · ${nItens} itens (${nFechados} em áreas de Amuleto) · ${n64} linhas da 6.4`);
console.log(erros ? `FALHOU: ${erros} erro(s), ${avisos} aviso(s)` : `OK: 0 erros, ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
