// verificador do time A1: larguras, warps, NPCs/itens em tiles livres, alcance do caminho principal, tabela 6.4
import { readdirSync } from 'node:fs';
import type { ZonaDef } from '../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { TREINADORES_A1 } from '../src/data/treinadores/a1';
import { EVENTOS_A1 } from '../src/data/eventos/a1';
import { EVENTOS_COMUNS } from '../src/data/eventos/comuns';
const dir = new URL('../src/data/zonas/', import.meta.url).pathname;
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
const meus = [...Z.values()].filter((z) => MEUS.test(z.id + '.') && !z.id.endsWith('-ginasio'));
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

/* ---------- alcance com Amuletos: itens/NPCs alcançáveis e áreas de Amuleto fechadas antes da hora ---------- */
type Cap = 'facao' | 'remo' | 'forca' | 'quebra' | 'escalar' | 'portoes';
function alcanceCom(z: ZonaDef, caps: Cap[]): Set<string> {
  const { w, h, b } = blocos(z), ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ', tem = (c: Cap) => caps.includes(c);
  const portao = (x: number, y: number) => !tem('portoes') && (z.portoes ?? []).some((p) => x >= p.x && y >= p.y && x < p.x + (p.w ?? 1) && y < p.y + (p.h ?? 1));
  const ok = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || portao(x, y)) return false;
    const c = ch(x, y);
    return LIVRE.has(c) || (c === 'c' && tem('facao')) || ('~dw'.includes(c) && tem('remo')) || (c === 'p' && tem('forca')) || (c === 'r' && tem('quebra')) || (c === 'e' && tem('escalar'));
  };
  // partidas: pouso, chegadas de warps de outras zonas e o tile de cada warp de borda
  const ini: [number, number][] = [];
  if (z.pouso) ini.push(z.pouso);
  for (const o of Z.values()) for (const q of o.warps) if (q.para.zona === z.id) ini.push([q.para.x, q.para.y]);
  if (z.id === 'A1-quarto') ini.push([5, 5]);
  const vis = new Set<string>(), fila: [number, number][] = [];
  for (const [x, y] of ini) if (ok(x, y) && !vis.has(x + ',' + y)) { vis.add(x + ',' + y); fila.push([x, y]); }
  while (fila.length) { const [x, y] = fila.shift()!;
    for (const [dx, dy, s] of [[0, 1, 'v'], [0, -1, ''], [1, 0, '>'], [-1, 0, '<']] as [number, number, string][]) {
      let nx = x + dx, ny = y + dy; if (s && ch(nx, ny) === s) { nx += dx; ny += dy; }
      const wp = z.warps.find((q) => q.x === nx && q.y === ny);
      if ((ok(nx, ny) || (wp && ehEnt(wp.tipo) && !b[ny * w + nx] === false)) && !vis.has(nx + ',' + ny)) { vis.add(nx + ',' + ny); if (ok(nx, ny)) fila.push([nx, ny]); } } }
  return vis;
}
const TODAS: Cap[] = ['facao', 'remo', 'forca', 'quebra', 'escalar', 'portoes'];
/** Amuleto (ou portão) esperado para cada item fechado: `zona:x,y` → capacidade. Tudo o que não está aqui tem de abrir só a pé. */
const FECHADOS: Record<string, Cap> = {};
const fechar = (zona: string, item: string, cap: Cap, n = 0) => { const it = (Z.get(zona)?.itens ?? []).filter((i) => i.item === item)[n]; if (!it) E(`esperado item ${item} em ${zona}`); else FECHADOS[`${zona}:${it.x},${it.y}`] = cap; };
fechar('A1', 'cuia-trancada', 'facao'); fechar('A1', 'pedra-mare', 'remo'); fechar('A1', 'pt-14', 'facao');
fechar('A-R1', 'pt-06', 'facao'); fechar('A-R1', 'pena-colorida', 'remo');
fechar('A2', 'cuia-rede', 'remo');
fechar('A-R2', 'pt-38', 'facao'); fechar('A-R2', 'cuia-ouro', 'remo'); fechar('A-R2', 'pepita', 'quebra'); fechar('A-R2', 'pedra-solar', 'forca');
fechar('A-MS', 'cuia-mel', 'facao'); fechar('A-MS', 'pt-07', 'facao'); fechar('A-MS', 'pedra-lunar', 'remo');
fechar('A3', 'pt-33', 'portoes'); fechar('A3', 'pedra-mare', 'remo'); fechar('A3', 'concha-rara', 'remo');
fechar('A-R3', 'folha-ancestral', 'escalar'); fechar('A-R3', 'elixir-andiroba', 'quebra'); fechar('A-R3', 'cuia-rede', 'remo'); fechar('A-R3', 'pt-28', 'forca');
fechar('A-GE', 'pt-42', 'remo'); fechar('A-GE', 'pt-41', 'quebra'); fechar('A-GE', 'pepita', 'remo'); fechar('A-GE', 'cuia-ouro', 'forca');
fechar('A4', 'pt-31', 'escalar'); fechar('A4', 'pt-15', 'facao'); fechar('A4', 'pedra-mare', 'remo');
let nFechados = 0, nVisao = 0;
for (const z of meus) {
  // na Trilha dos Cipós o Facão já é exigido na entrada: é a base da zona
  const base: Cap[] = z.id === 'A-R3' ? ['facao'] : [];
  const tudo = alcanceCom(z, TODAS), pe = alcanceCom(z, base);
  const perto = (v: Set<string>, x: number, y: number) => v.has(x + ',' + y) || [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => v.has(x + dx + ',' + (y + dy)));
  for (const i of z.itens ?? []) {
    const k = `${z.id}:${i.x},${i.y}`, cap = FECHADOS[k];
    if (!tudo.has(i.x + ',' + i.y)) { E(`${z.id}: item ${i.item} (${i.x},${i.y}) inalcançável mesmo com todos os Amuletos`); continue; }
    if (cap) {
      nFechados++;
      if (pe.has(i.x + ',' + i.y)) E(`${z.id}: item ${i.item} (${i.x},${i.y}) devia exigir ${cap}, mas abre a pé`);
      else if (!alcanceCom(z, [...base, cap]).has(i.x + ',' + i.y)) E(`${z.id}: item ${i.item} (${i.x},${i.y}) não abre só com ${cap}`);
      for (const outra of TODAS) if (outra !== cap && !base.includes(outra) && alcanceCom(z, [...base, outra]).has(i.x + ',' + i.y)) E(`${z.id}: item ${i.item} (${i.x},${i.y}) também abre com ${outra} (atalho)`);
    } else if (!pe.has(i.x + ',' + i.y)) E(`${z.id}: item ${i.item} (${i.x},${i.y}) fechado sem estar na lista de áreas de Amuleto`);
  }
  for (const n of z.npcs ?? []) if (!perto(pe, n.x, n.y) && !perto(alcanceCom(z, [...base, 'portoes']), n.x, n.y)) E(`${z.id}: NPC ${n.id} (${n.x},${n.y}) inalcançável a pé`);
  for (const o of z.objetos ?? []) if ((o.script || o.texto) && !perto(tudo, o.x, o.y) && !perto(tudo, o.x, o.y + 1)) E(`${z.id}: objeto interativo ${o.o} (${o.x},${o.y}) inalcançável`);
  for (const p of z.placas ?? []) if (!perto(pe, p.x, p.y)) E(`${z.id}: placa (${p.x},${p.y}) inalcançável a pé`);
  // linha de visão: o treinador precisa enxergar pelo menos 2 tiles livres e alcançáveis à frente
  const { w, h, b } = blocos(z), D: Record<string, [number, number]> = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
  for (const n of z.npcs ?? []) {
    if (!n.treinador) continue;
    nVisao++;
    const [dx, dy] = D[n.dir ?? 's']; let vistos = 0, pisaveis = 0;
    for (let k = 1; k <= (n.visao ?? 4); k++) { const x = n.x + dx * k, y = n.y + dy * k; if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || !LIVRE.has(z.mapaChars[y][x]) || (z.npcs ?? []).some((m) => m.x === x && m.y === y)) break; vistos++; if (pe.has(x + ',' + y)) pisaveis++; }
    if (vistos < 2 || pisaveis < 2) E(`${z.id}: treinador ${n.id} olhando '${n.dir ?? 's'}' só enxerga ${vistos} tile(s) (${pisaveis} alcançáveis)`);
    if ((z.warps ?? []).some((q) => { for (let k = 1; k <= (n.visao ?? 4); k++) if (q.x === n.x + dx * k && q.y === n.y + dy * k) return true; return false; })) E(`${z.id}: treinador ${n.id} enxerga um tile de warp`);
  }
}
console.log(`áreas de Amuleto conferidas: ${nFechados} · linhas de visão conferidas: ${nVisao}`);
console.log(`zonas minhas: ${meus.length} → ${meus.map((z) => `${z.id} ${z.mapaChars[0].length}×${z.mapaChars.length}`).join(' · ')}`);
console.log(`treinadores: ${TREINADORES_A1.length} · eventos: ${EVENTOS_A1.length + EVENTOS_COMUNS.length} · erros: ${erros}`);
