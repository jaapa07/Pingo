// verificador do time A1: larguras, warps, NPCs/itens em tiles livres, alcance do caminho principal, tabela 6.4
import { readdirSync } from 'node:fs';
import type { ZonaDef } from '/home/user/adventures-of-pingo/src/core/tipos';
import { CATALOGO_EXTERIOR } from '/home/user/adventures-of-pingo/src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '/home/user/adventures-of-pingo/src/data/catalogo-interiores';
import { TREINADORES_A1 } from '/home/user/adventures-of-pingo/src/data/treinadores/a1';
import { EVENTOS_A1 } from '/home/user/adventures-of-pingo/src/data/eventos/a1';
import { EVENTOS_COMUNS } from '/home/user/adventures-of-pingo/src/data/eventos/comuns';
const dir = '/home/user/adventures-of-pingo/src/data/zonas/';
const MEUS = /^(A1|A2|A3|A4|A-R1|A-R2|A-R3|A-MS|A-GE)(-|\.)/;
const Z = new Map<string, ZonaDef>();
for (const f of readdirSync(dir)) { if (f.startsWith('_')) continue; try { const m = await import(dir + f); if (m.default?.mapaChars) Z.set(m.default.id, m.default); } catch (e) { if (MEUS.test(f)) console.log('ERRO ao carregar', f, String(e).slice(0, 200)); } }
const cat: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
let erros = 0; const E = (s: string) => { erros++; console.log('✗', s); };
const LIVRE = new Set('.,:;"%=glxo+');
function blocos(z: ZonaDef) {
  const h = z.mapaChars.length, w = z.mapaChars[0].length, b = new Uint8Array(w * h);
  for (const o of z.objetos ?? []) { const c = cat[o.o]; if (!c) { E(`${z.id}: objeto fora do catálogo ${o.o}`); continue; }
    for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) { const col = c.colisao; let v = 1; if (col === false) v = 0; else if (Array.isArray(col) && col[j] !== undefined) v = '#x1X'.includes(col[j][i] ?? '#') ? 1 : 0;
      const x = o.x + i, y = o.y - (c.h - 1) + j; if (x < 0 || y < 0 || x >= w || y >= h) { E(`${z.id}: objeto ${o.o} sai do mapa`); continue; }
      if (c.porta && i === c.porta[0] && j === c.h - 1 - c.porta[1]) v = 0; if (v) b[y * w + x] = 1; } }
  return { w, h, b };
}
const ehEnt = (t?: string) => !!t && t !== 'borda' && t !== 'buraco';
const meus = [...Z.values()].filter((z) => MEUS.test(z.id + '.'));
const ids = new Set(TREINADORES_A1.map((t) => t.id)), evs = new Set([...EVENTOS_A1, ...EVENTOS_COMUNS].map((e) => e.id));
for (const z of meus) {
  const { w, h, b } = blocos(z);
  z.mapaChars.forEach((l, y) => { if (l.length !== w) E(`${z.id}: linha ${y} com ${l.length} (esperado ${w})`); });
  const ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ';
  const livre = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && !b[y * w + x] && LIVRE.has(ch(x, y));
  for (const wp of z.warps) {
    if (!(livre(wp.x, wp.y) || ehEnt(wp.tipo))) E(`${z.id}: warp (${wp.x},${wp.y}) em tile bloqueado`);
    const d = Z.get(wp.para.zona);
    if (!d) { if (MEUS.test(wp.para.zona + '.') && !wp.para.zona.endsWith('-ginasio')) E(`${z.id}: warp para zona inexistente ${wp.para.zona}`); else console.log(`  (${z.id} → ${wp.para.zona}: zona de outro time ainda ausente)`); continue; }
    const B = blocos(d), c = d.mapaChars[wp.para.y]?.[wp.para.x] ?? ' ';
    if (!LIVRE.has(c) || B.b[wp.para.y * B.w + wp.para.x]) E(`${z.id}: warp (${wp.x},${wp.y}) chega em ${d.id} (${wp.para.x},${wp.para.y}) = "${c}" bloqueado`);
    if (d.warps.some((q) => q.x === wp.para.x && q.y === wp.para.y)) E(`${z.id}: warp chega em cima de outro warp em ${d.id} (${wp.para.x},${wp.para.y})`);
    if (MEUS.test(d.id + '.') && !d.warps.some((q) => q.para.zona === z.id)) E(`${z.id} → ${d.id}: sem warp de volta`);
  }
  for (const n of z.npcs ?? []) { if (!livre(n.x, n.y)) E(`${z.id}: NPC ${n.id} em (${n.x},${n.y}) "${ch(n.x, n.y)}" não livre`); if (n.treinador && !ids.has(n.treinador)) E(`${z.id}: treinador ${n.treinador} sem definição`); if (n.script && !evs.has(n.script)) E(`${z.id}: script ${n.script} inexistente`); }
  for (const o of z.objetos ?? []) if (typeof o.script === 'string' && !evs.has(o.script)) E(`${z.id}: script de objeto ${o.script} inexistente`);
  for (const g of z.gatilhos ?? []) if (!evs.has(g.script)) E(`${z.id}: gatilho ${g.script} inexistente`);
  for (const i of z.itens ?? []) if (!livre(i.x, i.y)) E(`${z.id}: item ${i.item} em (${i.x},${i.y}) "${ch(i.x, i.y)}" não livre`);
  for (const p of z.placas ?? []) if (!b[p.y * w + p.x]) E(`${z.id}: placa sem objeto em (${p.x},${p.y})`);
  if (z.pouso && !livre(z.pouso[0], z.pouso[1])) E(`${z.id}: pouso bloqueado`);
}
// alcance tile a tile: de A1 até a porta do ginásio/saída de cada passo, com os amuletos do passo
function alcance(zid: string, sx: number, sy: number, facao: boolean): Set<string> {
  const z = Z.get(zid)!, { w, h, b } = blocos(z), ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ';
  const ok = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && !b[y * w + x] && (LIVRE.has(ch(x, y)) || (facao && ch(x, y) === 'c'));
  const vis = new Set<string>([sx + ',' + sy]), fila = [[sx, sy]];
  while (fila.length) { const [x, y] = fila.shift()!;
    for (const [dx, dy, s] of [[0, 1, 'v'], [0, -1, ''], [1, 0, '>'], [-1, 0, '<']] as [number, number, string][]) {
      let nx = x + dx, ny = y + dy; if (s && ch(nx, ny) === s) { nx += dx; ny += dy; }
      const wp = z.warps.find((q) => q.x === nx && q.y === ny);
      if ((ok(nx, ny) || (wp && ehEnt(wp.tipo))) && !vis.has(nx + ',' + ny)) { vis.add(nx + ',' + ny); fila.push([nx, ny]); } } }
  return vis;
}
const rota: [string, number, number, string, boolean, boolean][] = [ // zona, início, destino (zona do warp), facão, deve alcançar
  ['A1-quarto', 5, 5, 'A1-casa-jogador', false, true], ['A1-casa-jogador', 11, 2, 'A1', false, true], ['A1', 7, 10, 'A1-lab', false, true], ['A1', 7, 10, 'A-R1', false, true],
  ['A-R1', 14, 78, 'A2', false, true], ['A2', 21, 30, 'A2-ginasio', false, true], ['A2', 21, 30, 'A2-casa-aroeira', false, true], ['A2', 21, 30, 'A-R2', false, true],
  ['A-R2', 1, 14, 'A-MS', false, true], ['A-MS', 2, 21, 'A3', false, true], ['A3', 21, 29, 'A3-ginasio', false, true], ['A3', 21, 29, 'A-R3', false, true],
  ['A-R3', 1, 15, 'A-GE', false, false], ['A-R3', 1, 15, 'A-GE', true, true], ['A-GE', 4, 29, 'A4', false, true], ['A4', 6, 5, 'A4-ginasio', false, true], ['A4', 6, 5, 'A-R4', false, true], ['A4', 6, 5, 'A-BA', false, true], ['A4', 6, 5, 'A4-estacao', false, true],
];
for (const [zid, x, y, dest, fac, deve] of rota) { const z = Z.get(zid); if (!z) { E('zona ausente ' + zid); continue; } const v = alcance(zid, x, y, fac); const chega = z.warps.some((q) => q.para.zona === dest && v.has(q.x + ',' + q.y)); if (chega !== deve) E(`alcance ${zid} (${x},${y}) → ${dest} ${fac ? 'com' : 'sem'} Facão: ${chega}, esperado ${deve}`); }
// NPCs, itens não ocultos e treinadores alcançáveis (com todos os amuletos de corte; água/rocha ficam de fora)
// tabela 6.4
const T64: Record<string, [number, string][]> = {
  'A-R1': [[10, 'grama'], [13, 'grama'], [20, 'grama'], [43, 'grama'], [45, 'grama'], [153, 'arvore']],
  'A-R2': [[10, 'grama'], [15, 'grama'], [20, 'grama'], [33, 'grama'], [41, 'grama'], [47, 'grama'], [81, 'grama'], [27, 'arvore'], [149, 'arvore']],
  'A-MS': [[13, 'grama'], [15, 'grama'], [17, 'grama'], [43, 'grama'], [59, 'grama'], [90, 'grama'], [95, 'grama'], [157, 'grama'], [16, 'arvore'], [22, 'arvore'], [49, 'arvore'], [61, 'arvore'], [63, 'arvore'], [171, 'arvore']],
  'A-R3': [[18, 'grama'], [24, 'grama'], [28, 'grama'], [57, 'grama'], [107, 'grama'], [155, 'grama'], [37, 'pesca-velha']],
  'A-GE': [[30, 'caverna'], [147, 'caverna'], [167, 'caverna'], [39, 'pesca-velha']],
};
for (const [zid, l] of Object.entries(T64)) for (const [e, m] of l) { const hb = Z.get(zid)?.habitats?.find((q) => q.metodo === m); const todas = [...(hb?.todos ?? []), ...(hb?.manha ?? []), ...(hb?.dia ?? []), ...(hb?.noite ?? [])]; if (!todas.some((q) => q.e === e)) E(`6.4: espécie ${e} ausente de ${zid} (${m})`); }
console.log(`zonas minhas: ${meus.length} → ${meus.map((z) => `${z.id} ${z.mapaChars[0].length}×${z.mapaChars.length}`).join(' · ')}`);
console.log(`treinadores: ${TREINADORES_A1.length} · eventos: ${EVENTOS_A1.length + EVENTOS_COMUNS.length} · erros: ${erros}`);
