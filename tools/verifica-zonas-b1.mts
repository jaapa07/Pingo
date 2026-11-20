// verificador do time B1 (Sertão das Névoas, passos 9–11): grades e marcas, objetos, warps em pares, tiles livres,
// scripts/treinadores, linha de visão, alcance tile a tile com e sem Amuletos (caminho principal, portões e áreas
// fechadas), tabela 6.4 (espécie citada ou a forma em que ela está no nível do Sertão), filhotes do Centro de
// Reabilitação para as linhas que só existem no Sertão, e a faixa de níveis da curva nova (Liga 46 → líderes 49/51/53).
import { readdirSync } from 'node:fs';
import type { ZonaDef, Encontro, Habitat, TreinadorDef } from '../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { ESPECIES } from '../src/data/criaturas';
import { ERROS_B1 } from '../src/data/zonas/_b1-lib';
import { TREINADORES_B1 } from '../src/data/treinadores/b1';
import { EVENTOS_B1 } from '../src/data/eventos/b1';
import { EVENTOS_COMUNS } from '../src/data/eventos/comuns';
import { EVENTOS_CAPTURA } from '../src/data/eventos/captura'; // captura e criação: cuieiras, artesão, ninho, trocas, lago (docs/CAPTURA-CRIACAO.md)

const dir = new URL('../src/data/zonas/', import.meta.url).pathname;
const MEUS = /^(B1|B2|B3|B4|B9|B-R1|B-CE|B-PA|B-R2|B-CH|B-CV)(-|$)/;
const Z = new Map<string, ZonaDef>();
let erros = 0, avisos = 0; const E = (s: string) => { erros++; console.log('✗', s); }; const A = (s: string) => { avisos++; console.log('·', s); };
for (const f of readdirSync(dir)) { if (f.startsWith('_') || !f.endsWith('.ts')) continue; try { const m = await import(dir + f); if (m.default?.mapaChars) Z.set(m.default.id, m.default); } catch (e) { (MEUS.test(f.replace('.ts', '')) ? E : A)(`${f}: não carrega (${(e as Error).message})`); } }
for (const s of ERROS_B1) E(`grade: ${s}`);
const cat: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
const LIVRE = new Set('.,:;"%=glxo+');
const meu = (id: string) => MEUS.test(id) && !id.endsWith('-ginasio');
const meus = [...Z.values()].filter((z) => meu(z.id));
if (Z.has('B1-ginasio')) E('B1-ginasio ainda existe: Vila Cascavel não tem ginásio (o prédio é o Salão da Raizeira)');

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
const ids = new Map(TREINADORES_B1.map((t) => [t.id, t])), evs = new Set([...EVENTOS_B1, ...EVENTOS_COMUNS, ...EVENTOS_CAPTURA].map((e) => e.id));
if (ids.size !== TREINADORES_B1.length) E('treinadores com id repetido');
if (new Set(EVENTOS_B1.map((e) => e.id)).size !== EVENTOS_B1.length) E('eventos com id repetido');

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
  if (z.mapa !== 'B') E(`${z.id}: mapa ${z.mapa} (esperado B)`);
  const txt = JSON.stringify(z);
  if (new RegExp(['TO' + 'DO', 'FIX' + 'ME'].join('|')).test(txt) || new RegExp(['place' + 'holder', 'lo' + 'rem'].join('|'), 'i').test(txt)) E(`${z.id}: palavra proibida`);
  if (/Vila Buriti/.test(z.nome + JSON.stringify(z.placas ?? [])) && z.id.startsWith('B1')) E(`${z.id}: ainda fala "Vila Buriti" (a B1 agora é Vila Cascavel)`);
}
const POR_EVENTO = /^(B-PA-arame|B3-rebite|rival-6-)/;
for (const t of TREINADORES_B1) if (!usados.has(t.id) && !POR_EVENTO.test(t.id)) E(`treinador ${t.id} não está em nenhuma zona`);

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
const MAPA_B: Cap[] = ['facao', 'remo', 'quebra', 'forca'];
// caminho principal (passos 9–11): [zona, x, y, destino, Amuletos/portões, deve chegar]
const R: [string, number, number, string, Cap[], boolean][] = [
  ['B1-estacao', 8, 6, 'B1', [], true], ['B1', 6, 6, 'B-R1', [], true], ['B1', 6, 6, 'B1-salao', [], true], ['B1', 6, 6, 'B-PA', [], false], ['B1', 6, 6, 'B-PA', ['remo'], true],
  ['B-R1', 14, 78, 'B-CE', [], true], ['B-CE', 29, 38, 'B-PA', [], true],
  ['B-PA', 1, 7, 'B2', [], true], ['B-PA', 1, 7, 'B9', ['remo'], false], ['B-PA', 1, 7, 'B9', ['remo', 'portoes'], true], ['B-PA', 1, 7, 'B1', ['remo'], true],
  ['B2', 1, 15, 'B2-ginasio', [], true], ['B2', 1, 15, 'B2-centro', [], true],
  ['B9', 10, 24, 'B-R2', MAPA_B, false], ['B9', 10, 24, 'B-R2', ['portoes'], true], ['B9', 10, 24, 'B-PA', ['remo'], true], ['B9', 10, 24, 'A5', [], false], ['B9', 10, 24, 'A5', ['portoes'], true],
  ['B-PA', 26, 54, 'B2', ['remo'], false],
  ['B-R2', 1, 14, 'B3', ['facao', 'remo', 'forca'], false], ['B-R2', 1, 14, 'B3', ['quebra'], true],
  ['B3', 1, 17, 'B3-mina-1', [], true], ['B3', 1, 17, 'B3-ginasio', MAPA_B, false], ['B3', 1, 17, 'B3-ginasio', ['portoes'], true],
  ['B3', 1, 17, 'B-CH', MAPA_B, false], ['B3', 1, 17, 'B-CH', ['escalar'], true], ['B3-mina-1', 15, 22, 'B3-mina-2', [], true],
  ['B-CH', 20, 68, 'B4', MAPA_B, false], ['B-CH', 20, 68, 'B4', ['escalar'], true], ['B-CH', 20, 68, 'B-CV', ['escalar'], true],
  ['B4', 24, 32, 'B4-ginasio', [], true], ['B4', 24, 32, 'B-R3', [...MAPA_B, 'escalar'], false], ['B4', 24, 32, 'B-R3', ['portoes'], true],
];
let nRotas = 0;
for (const [zid, x, y, dest, caps, deve] of R) { const z = Z.get(zid); if (!z) { E(`rota: zona ${zid} não existe`); continue; } nRotas++;
  const v = alcance(z, caps, [[x, y]]); if (chegaA(z, v, dest, caps) !== deve) E(`alcance ${zid} (${x},${y}) → ${dest} com [${caps.join(', ')}]: esperado ${deve ? 'chegar' : 'NÃO chegar'}`); }

/** Amuletos que o jogador já tem ao chegar a cada zona; os itens que pedem mais que isso são as áreas de Amuleto */
const P11 = /^(B-CH|B-CV|B4)/;
const base = (id: string): Cap[] => (P11.test(id) ? [...MAPA_B, 'escalar'] : MAPA_B);
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

/* ---------- tabela 6.4: a espécie citada (ou a forma que ela tem no nível do Sertão) no método e período indicados ---------- */
type L = [number, Habitat['metodo'], ('n' | 'd')?];
const T64: Record<string, L[]> = {
  'B-R1': [[45, 'grama'], [46, 'grama'], [49, 'grama'], [51, 'grama', 'd'], [71, 'grama'], [93, 'grama', 'n'], [97, 'grama'], [103, 'grama'], [149, 'arvore']],
  'B-CE': [[11, 'grama', 'd'], [17, 'grama', 'n'], [18, 'grama'], [19, 'rocha'], [28, 'grama', 'n'], [29, 'grama', 'n'], [33, 'grama'], [41, 'grama', 'd'], [44, 'grama', 'n'], [69, 'grama', 'n'], [81, 'grama'], [91, 'grama'], [99, 'grama', 'd'], [101, 'grama', 'd'], [103, 'grama'], [142, 'grama', 'n'], [153, 'arvore'], [159, 'rocha'], [163, 'rocha'], [164, 'rocha'], [169, 'arvore', 'n']],
  'B-PA': [[25, 'grama'], [37, 'pesca-velha'], [38, 'pesca-mestra'], [39, 'pesca-velha'], [40, 'pesca-mestra'], [57, 'agua'], [58, 'grama'], [71, 'grama'], [73, 'agua'], [74, 'agua'], [83, 'grama'], [84, 'grama'], [85, 'agua'], [86, 'agua'], [98, 'grama'], [100, 'grama', 'd'], [105, 'grama', 'd'], [106, 'grama'], [108, 'grama'], [111, 'pesca-boa'], [112, 'pesca-mestra'], [113, 'agua'], [114, 'agua'], [115, 'agua'], [117, 'agua'], [127, 'grama'], [155, 'grama']],
  'B-R2': [[34, 'grama'], [55, 'grama'], [82, 'grama'], [88, 'grama'], [91, 'grama'], [104, 'grama'], [145, 'grama'], [151, 'arvore'], [159, 'rocha'], [165, 'grama']],
  'B-CH': [[12, 'grama', 'd'], [34, 'grama'], [42, 'grama'], [51, 'grama'], [52, 'grama'], [56, 'grama'], [82, 'grama'], [92, 'grama'], [102, 'grama'], [104, 'grama'], [165, 'grama'], [166, 'rocha']],
  'B-CV': [[31, 'caverna'], [32, 'caverna', 'n'], [42, 'caverna'], [145, 'caverna'], [146, 'caverna']],
};
const esp = new Map(ESPECIES.map((e) => [e.num, e]));
/** a espécie e as formas seguintes por nível (Pererecão → Sapo-Cururuí…) até o nível dado */
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
// linhas que só nascem no Sertão: a forma básica tem de chegar ao jogador em nível de filhote (pesca de Vara Velha ou o Centro de Reabilitação)
const ORFAOS = [105, 101, 103, 51, 71, 73, 86, 91, 97, 165, 145, 159];
const orfaosEv = EVENTOS_B1.find((e) => e.id === 'b1-orfaos'); const txtOrf = JSON.stringify(orfaosEv?.passos ?? []);
for (const n of ORFAOS) if (!txtOrf.includes(`["darCriatura",${n},`)) E(`filhote ${n} sem entrega no Centro de Reabilitação`);
for (const z of Z.values()) for (const hb of z.habitats ?? []) for (const t of tabelas(hb)) for (const q of [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])]) if (ORFAOS.includes(q.e) && z.mapa === 'B' && !meu(z.id)) A(`${z.id}: ${q.e} também aparece selvagem (conferir nível)`);

/* ---------- coerência de níveis (spec 4.5, curva nova) ---------- */
const evoluiDe = new Map<number, number>(); for (const e of ESPECIES) for (const v of e.evolui ?? []) if (v.nivel) evoluiDe.set(v.para, v.nivel);
/** ás do próximo líder por passo e faixa dos treinadores comuns (ás −2 a −6) */
const ASL: Record<number, number> = { 9: 49, 10: 51, 11: 53 };
function confere(onde: string, e: number, nv: number, basicoPermitido = false) {
  const s = esp.get(e); if (!s) { E(`${onde}: espécie ${e} inexistente`); return; }
  if (s.lendario) return;
  const de = evoluiDe.get(e); if (de && nv < de) E(`${onde}: ${s.nome} no nível ${nv}, abaixo da evolução (nv ${de})`);
  const para = (s.evolui ?? []).find((v) => v.nivel); if (para?.nivel && nv >= para.nivel && !basicoPermitido) E(`${onde}: ${s.nome} no nível ${nv} já devia ter evoluído (nv ${para.nivel})`);
}
let nTab = 0;
for (const z of meus) {
  const as = ASL[z.passo ?? 0]; if (!as && z.habitats?.length) E(`${z.id}: passo ${z.passo} fora de 9–11 com habitats`);
  for (const hb of z.habitats ?? []) tabelas(hb).forEach((t, ci) => {
    const camada = ci > 0 ? (hb.camadas ?? [])[ci - 1] : undefined;
    for (const q of [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])] as Encontro[]) {
      confere(`${z.id} ${hb.metodo}${camada ? ` (camada ${camada.apos})` : ''}`, q.e, q.nv[0], hb.metodo === 'pesca-velha');
      if (q.nv[0] > q.nv[1]) E(`${z.id} ${hb.metodo}: faixa invertida da espécie ${q.e}`);
      if (!camada && as && ['grama', 'caverna', 'agua', 'arvore', 'rocha'].includes(hb.metodo) && (q.nv[0] < 44 || q.nv[1] > as - 2)) E(`${z.id} ${hb.metodo}: espécie ${q.e} nv ${q.nv[0]}–${q.nv[1]} fora de 44–${as - 2} (ás do líder do passo − 2)`);
      if (camada && (camada.apos < 11 || q.nv[1] > 57 || q.nv[0] < 48)) E(`${z.id} ${hb.metodo}: camada pós-insígnia ${camada.apos} com nv ${q.nv[0]}–${q.nv[1]} fora de 48–57`);
    }
    if (!camada && as && ['grama', 'caverna', 'agua'].includes(hb.metodo)) {
      for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { nTab++;
        const p = l.reduce((a, c) => a + c.peso, 0), media = l.reduce((a, c) => a + ((c.nv[0] + c.nv[1]) / 2) * c.peso, 0) / (p || 1);
        if (media > as - 2) E(`${z.id} ${hb.metodo}: média ${media.toFixed(1)} acima de ${as - 2}`);
        if (l.length < 6 && hb.metodo !== 'agua') E(`${z.id} ${hb.metodo}: só ${l.length} espécies no período (spec 6.4: 6 a 16)`);
      }
    }
    for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { const p = l.reduce((a, c) => a + c.peso, 0); if (l.length && (p < 80 || p > 125)) A(`${z.id} ${hb.metodo}: pesos somam ${p}`); }
  });
}
/** passo em que cada treinador é enfrentado (o do ninhal, da mina e a rival ficam além do passo da zona) */
const passoDo = (t: TreinadorDef): number => {
  if (/^(B-PA-[5-8]|B-PA-arame|B3|B9|B-R2)/.test(t.id)) return 10;
  if (/^(B-CH|B-CV|B4|rival-6)/.test(t.id)) return 11;
  return 9;
};
for (const t of TREINADORES_B1) {
  const p = passoDo(t), as = ASL[p], chefe = /arame|rebite|rival/.test(t.id), topo = Math.max(...t.equipe.map((m) => m.nv));
  for (const m of t.equipe) confere(`treinador ${t.id}`, m.e, m.nv, /^rival/.test(t.id) && [6, 9, 3].includes(m.e));
  if (chefe) { if (topo > as - 1 || topo < as - 3) E(`treinador ${t.id}: ás ${topo} fora de ${as - 3}–${as - 1} (chefe antes do líder com ás ${as})`); }
  else if (topo > as - 2 || Math.min(...t.equipe.map((m) => m.nv)) < as - 6) E(`treinador ${t.id}: níveis fora de ${as - 6}–${as - 2} (ás do líder ${as})`);
  if (!t.desafio || !t.derrota || t.premio <= 0) E(`treinador ${t.id}: falta fala ou prêmio`);
  if (t.itens?.length && !chefe) E(`treinador ${t.id}: treinador comum com item de cura (spec 7A)`);
}
console.log(`\nÁreas de Amuleto (fora de alcance na chegada): ${fechados.join(' · ')}`);
console.log(`${meus.length} zonas · ${TREINADORES_B1.length} treinadores (${nVisao} com linha de visão) · ${EVENTOS_B1.length} eventos · ${nRotas} rotas de alcance · ${nItens} itens (${nFechados} em áreas de Amuleto) · ${n64} linhas da 6.4 · ${nTab} tabelas de selvagens`);
console.log(erros ? `FALHOU: ${erros} erro(s), ${avisos} aviso(s)` : `OK: 0 erros, ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
