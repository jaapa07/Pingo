// verificador do time B2-sul (Sertão das Névoas, passos 12–14): grades e marcas, objetos, warps em pares, tiles livres,
// scripts/treinadores, linha de visão, alcance tile a tile com e sem Amuletos (caminho principal, portões, a cascata do
// Túnel Alagado que segura o Brejo Roxo até a insígnia 12 e as áreas de Amuleto), tabela 6.4 (espécie citada ou a
// forma em que ela está no nível do passo), a Queixada-Caipora errante e a faixa de níveis da curva nova
// (líderes 12/13/14 com ás 55/57/59; revanches depois da insígnia 14 contam para o líder 15, ás 61).
// Rodar: npx tsx tools/verifica-zonas-b2-sul.mts
import { asDoPassoB } from './verify/curva-b';
import { readdirSync } from 'node:fs';
import type { ZonaDef, Encontro, Habitat, TreinadorDef } from '../src/core/tipos';
import { CATALOGO_EXTERIOR } from '../src/data/catalogo-objetos';
import { CATALOGO_INTERIOR } from '../src/data/catalogo-interiores';
import { ESPECIES } from '../src/data/criaturas';
import { ERROS_B2S } from '../src/data/zonas/_b2s-lib';
import { TREINADORES_B2S } from '../src/data/treinadores/b2-sul';
import { EVENTOS_B2S } from '../src/data/eventos/b2-sul';
import { EVENTOS_COMUNS } from '../src/data/eventos/comuns';

const dir = new URL('../src/data/zonas/', import.meta.url).pathname;
const MEUS = /^(B-R3|B5|B-TA|B6|B-VV|B-R4|B7)(-|$)/;
const Z = new Map<string, ZonaDef>();
let erros = 0, avisos = 0; const E = (s: string) => { erros++; console.log('✗', s); }; const A = (s: string) => { avisos++; console.log('·', s); };
for (const f of readdirSync(dir)) { if (f.startsWith('_') || !f.endsWith('.ts')) continue; try { const m = await import(dir + f); if (m.default?.mapaChars) Z.set(m.default.id, m.default); } catch (e) { (MEUS.test(f.replace('.ts', '')) ? E : A)(`${f}: não carrega (${(e as Error).message})`); } }
for (const s of ERROS_B2S) E(`grade: ${s}`);
const cat: Record<string, any> = { ...CATALOGO_EXTERIOR, ...CATALOGO_INTERIOR };
const LIVRE = new Set('.,:;"%=glxo+');
const meu = (id: string) => MEUS.test(id) && !id.endsWith('-ginasio');
const meus = [...Z.values()].filter((z) => meu(z.id));
const ESPERADAS = ['B-R3', 'B5', 'B5-posto', 'B5-venda', 'B5-feira', 'B5-casa-1', 'B5-casa-2', 'B5-casa-3', 'B5-casa-4', 'B-TA', 'B-TA-gruta', 'B6', 'B6-posto', 'B6-venda', 'B6-casa-1', 'B6-casa-2', 'B6-casa-3', 'B6-lab-1', 'B6-lab-2', 'B6-lab-3', 'B-VV', 'B-R4', 'B7', 'B7-posto', 'B7-venda', 'B7-casa-1', 'B7-casa-2', 'B7-ctg'];
for (const id of ESPERADAS) if (!Z.has(id)) E(`zona ${id} ausente`);

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
const ids = new Map(TREINADORES_B2S.map((t) => [t.id, t])), evs = new Set([...EVENTOS_B2S, ...EVENTOS_COMUNS].map((e) => e.id));
if (ids.size !== TREINADORES_B2S.length) E('treinadores com id repetido');
if (new Set(EVENTOS_B2S.map((e) => e.id)).size !== EVENTOS_B2S.length) E('eventos com id repetido');

/* ---------- estrutura ---------- */
const usados = new Set<string>();
const chamados = new Set<string>(); // treinadores chamados por evento
const varrer = (p: unknown): void => { if (Array.isArray(p)) { if (p[0] === 'batalha' && typeof p[1] === 'string') chamados.add(p[1]); p.forEach(varrer); } };
for (const ev of EVENTOS_B2S) varrer(ev.passos);
for (const id of chamados) if (!ids.has(id)) E(`evento: batalha com ${id}, que não existe`);
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
    // chegar num poço de mergulho (`d`) que também é warp é o normal de quem sobe à tona
    if (d.warps.some((q) => q.x === wp.para.x && q.y === wp.para.y) && c !== 'd') E(`${z.id}: warp chega em cima de outro warp em ${d.id} (${wp.para.x},${wp.para.y})`);
    const volta = d.warps.filter((q) => q.para.zona === z.id);
    if (!volta.length) E(`${z.id} → ${d.id}: sem warp de volta`);
    else if (!volta.some((q) => Math.abs(q.para.x - wp.x) + Math.abs(q.para.y - wp.y) <= 4)) (meu(d.id) ? E : A)(`${z.id} (${wp.x},${wp.y}) → ${d.id}: a volta não chega perto do warp de ida`);
  }
  for (const n of z.npcs ?? []) {
    if (!livre(n.x, n.y)) E(`${z.id}: NPC ${n.id} em (${n.x},${n.y}) "${ch(n.x, n.y)}" não livre`);
    if (n.treinador) { usados.add(n.treinador); if (!ids.has(n.treinador)) E(`${z.id}: treinador ${n.treinador} sem definição`); }
    if (n.script && !evs.has(n.script)) E(`${z.id}: script ${n.script} inexistente`);
    if (!n.script && !n.treinador && !n.fala?.length && !n.loja) E(`${z.id}: NPC ${n.id} sem fala, script, loja ou treinador`);
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
  if (z.passo === undefined || z.passo < 12 || z.passo > 14) E(`${z.id}: passo ${z.passo} (esperado 12–14)`);
  if (z.mapa !== 'B') E(`${z.id}: mapa ${z.mapa} (esperado B)`);
  const txt = JSON.stringify(z);
  if (new RegExp(['TO' + 'DO', 'FIX' + 'ME'].join('|')).test(txt) || new RegExp(['place' + 'holder', 'lo' + 'rem'].join('|'), 'i').test(txt)) E(`${z.id}: palavra proibida`);
}
const POR_EVENTO = /^(B6-porteiro|B6-lab-zinabre|B6-lab-lata|B5-mare|rival-7-)/;
for (const t of TREINADORES_B2S) if (!usados.has(t.id) && !(POR_EVENTO.test(t.id) && chamados.has(t.id))) E(`treinador ${t.id} não está em nenhuma zona nem é chamado por evento`);

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
const P12: Cap[] = ['facao', 'remo', 'quebra', 'forca', 'escalar'];
const P13: Cap[] = [...P12, 'cachoeira'];
// caminho principal (passos 12–14): [zona, x, y, destino, Amuletos/portões, deve chegar]
const R: [string, number, number, string, Cap[], boolean][] = [
  ['B-R3', 1, 14, 'B5', [], true], ['B-R3', 1, 14, 'B4', [], true],
  ['B5', 1, 20, 'B5-ginasio', [], true], ['B5', 1, 20, 'B5-posto', [], true], ['B5', 1, 20, 'B5-feira', [], true], ['B5', 1, 20, 'B5-casa-3', [], true],
  ['B5', 1, 20, 'B-TA', ['facao', 'quebra', 'forca', 'escalar'], false], ['B5', 1, 20, 'B-TA', ['remo'], true],
  ['B-TA', 5, 6, 'B-TA-gruta', [], true], ['B-TA', 5, 6, 'B6', P13, false], ['B-TA', 36, 9, 'B6', [], true],
  ['B6', 16, 18, 'B-VV', [], true], ['B6', 16, 18, 'B6-posto', [], true], ['B6', 16, 18, 'B-TA', ['remo'], true],
  ['B6', 16, 18, 'B6-ginasio', P13, false], ['B6', 16, 18, 'B6-ginasio', ['portoes'], true],
  ['B6', 16, 18, 'B-R4', P13, false], ['B6', 16, 18, 'B-R4', ['portoes'], true],
  ['B6', 16, 18, 'B6-lab-1', ['remo', 'quebra', 'forca', 'escalar', 'cachoeira', 'portoes'], false], ['B6', 16, 18, 'B6-lab-1', ['facao'], true],
  ['B6-lab-1', 15, 20, 'B6-lab-2', P13, false], ['B6-lab-1', 15, 20, 'B6-lab-2', ['portoes'], true],
  ['B6-lab-2', 3, 5, 'B6-lab-3', P13, false], ['B6-lab-2', 3, 5, 'B6-lab-3', ['portoes'], true],
  ['B-VV', 1, 20, 'B6', [], true],
  ['B-R4', 24, 68, 'B7', ['facao', 'remo', 'quebra', 'cachoeira', 'escalar'], false], ['B-R4', 24, 68, 'B7', ['facao', 'remo', 'quebra', 'cachoeira', 'forca'], false],
  ['B-R4', 24, 68, 'B7', ['escalar', 'forca'], true], ['B-R4', 24, 68, 'B6', [], true],
  ['B-R4', 24, 68, 'PP', P13, false], ['B-R4', 24, 68, 'PP', [...P13, 'portoes'], true],
  ['B7', 24, 38, 'B7-ginasio', [], true], ['B7', 24, 38, 'B7-ctg', [], true], ['B7', 24, 38, 'B-SG', [], true], ['B7', 24, 38, 'B-LG', [], true],
  ['B7', 24, 38, 'B-R5', P13, false], ['B7', 24, 38, 'B-R5', ['portoes'], true], ['B7', 24, 38, 'B-R4', [], true],
];
let nRotas = 0;
for (const [zid, x, y, dest, caps, deve] of R) { const z = Z.get(zid); if (!z) { E(`rota: zona ${zid} não existe`); continue; } nRotas++;
  const v = alcance(z, caps, [[x, y]]); if (chegaA(z, v, dest, caps) !== deve) E(`alcance ${zid} (${x},${y}) → ${dest} com [${caps.join(', ')}]: esperado ${deve ? 'chegar' : 'NÃO chegar'}`); }
// a cascata da Gruta do Fôlego: sem Cachoeira, a piscina do leste (e o Brejo Roxo) fica fora de alcance
{ const z = Z.get('B-TA-gruta');
  if (z) { const leste = z.warps.filter((q) => q.para.zona === 'B-TA' && q.para.x > 30);
    const sem = alcance(z, P12, [[11, 15]]), com = alcance(z, P13, [[11, 15]]); nRotas += 2;
    if (!leste.length) E('B-TA-gruta: sem o poço da piscina do leste');
    if (leste.some((q) => sem.has(q.x + ',' + q.y))) E('B-TA-gruta: a piscina do leste é alcançável sem a Cachoeira (o Brejo Roxo abriria antes da insígnia 12)');
    if (!leste.some((q) => com.has(q.x + ',' + q.y))) E('B-TA-gruta: a piscina do leste não é alcançável nem com a Cachoeira'); } }

/** Amuletos que o jogador já tem ao chegar a cada zona; os itens que pedem mais que isso são as áreas de Amuleto */
const base = (z: ZonaDef): Cap[] => ((z.passo ?? 12) >= 13 ? P13 : P12);
const TODAS: Cap[] = ['facao', 'remo', 'forca', 'quebra', 'escalar', 'cachoeira', 'portoes'];
let nFechados = 0, nVisao = 0, nItens = 0; const fechados: string[] = [], deAmuleto: string[] = [];
const perto = (v: Set<string>, x: number, y: number) => v.has(x + ',' + y) || [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => v.has(x + dx + ',' + (y + dy)));
for (const z of meus) {
  const ini = chegadas(z); if (!ini.length) { E(`${z.id}: nenhuma chegada (zona isolada)`); continue; }
  const bs = base(z), tudo = alcance(z, TODAS, ini), pe = alcance(z, [...bs, 'portoes'], ini), nada = alcance(z, ['portoes'], ini);
  for (const i of z.itens ?? []) { nItens++;
    const k = i.x + ',' + i.y;
    if (!perto(tudo, i.x, i.y)) { E(`${z.id}: item ${i.item} (${k}) inalcançável mesmo com todos os Amuletos`); continue; }
    if (!perto(pe, i.x, i.y)) { nFechados++; fechados.push(`${z.id} ${i.item} → cachoeira`); }
    else if (!perto(nada, i.x, i.y)) deAmuleto.push(`${z.id} ${i.item}`);
  }
  for (const n of z.npcs ?? []) if (!perto(tudo, n.x, n.y)) E(`${z.id}: NPC ${n.id} (${n.x},${n.y}) inalcançável`);
  const gente = (z.npcs ?? []).filter((n) => !n.se).map((n) => [n.x, n.y] as [number, number]);
  for (const p of ini) { if (gente.some(([gx, gy]) => gx === p[0] && gy === p[1])) { E(`${z.id}: NPC parado na chegada (${p})`); continue; }
    const livreDeGente = alcance(z, TODAS, [p]), comGente = alcance(z, TODAS, [p], undefined, gente);
    for (const wp of z.warps) if (livreDeGente.has(wp.x + ',' + wp.y) && !comGente.has(wp.x + ',' + wp.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o warp (${wp.x},${wp.y}) → ${wp.para.zona}`);
    for (const i of z.itens ?? []) if (perto(livreDeGente, i.x, i.y) && !perto(comGente, i.x, i.y)) E(`${z.id}: um NPC tapa o caminho de (${p}) até o item ${i.item} (${i.x},${i.y})`); }
  for (const o of z.objetos ?? []) if ((o.script || o.texto) && cat[o.o] && !perto(tudo, o.x, o.y) && !perto(tudo, o.x, o.y + 1)) E(`${z.id}: objeto interativo ${o.o} (${o.x},${o.y}) inalcançável`);
  for (const pl of z.placas ?? []) if (!perto(tudo, pl.x, pl.y)) E(`${z.id}: placa (${pl.x},${pl.y}) inalcançável`);
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
if (!fechados.length) E('nenhuma área visível e fora de alcance até a Cachoeira (spec 4.5: áreas de retorno)');

/* ---------- tabela 6.4: a espécie citada (ou a forma que ela tem no nível do passo) no método indicado ---------- */
type L = [number, Habitat['metodo'][]];
const G: Habitat['metodo'][] = ['grama'], AR: Habitat['metodo'][] = ['arvore'], Q: Habitat['metodo'][] = ['rocha'], S: Habitat['metodo'][] = ['agua'], M: Habitat['metodo'][] = ['mergulho'], P: Habitat['metodo'][] = ['pesca-velha', 'pesca-boa', 'pesca-mestra'];
const T64: Record<string, [string[], L[]]> = {
  'B-R3': [['B-R3'], [[14, G], [19, G], [46, G], [50, G], [53, G], [64, AR], [65, G], [66, G], [96, G], [143, AR], [154, AR], [157, G]]],
  'B-TA': [['B-TA', 'B-TA-gruta'], [[26, M], [40, P], [87, M], [112, M], [116, M], [160, M]]],
  'B-VV': [['B-VV'], [[21, G], [26, G], [84, G], [86, G], [87, S], [89, G], [90, G], [114, S], [128, G], [147, G], [148, G], [152, AR]]],
  'B-R4': [['B-R4'], [[161, G], [162, Q], [166, Q]]],
};
const esp = new Map(ESPECIES.map((e) => [e.num, e]));
/** a espécie e as formas seguintes por nível (Sucurizinha → Sucurião…) até o nível dado */
const formas = (e: number, nv: number): number[] => { const l = [e]; let s = esp.get(e); while (s) { const v = (s.evolui ?? []).find((q) => q.nivel && q.nivel <= nv); if (!v) break; l.push(v.para); s = esp.get(v.para); } return l; };
const tabelas = (hb: Habitat) => [hb, ...(hb.camadas ?? [])];
let n64 = 0;
for (const [nome, [zonas, l]] of Object.entries(T64)) {
  const hs = zonas.flatMap((zid) => { const z = Z.get(zid); if (!z) { E(`6.4: ${zid} não existe`); return []; } return z.habitats ?? []; });
  for (const [e, ms] of l) { n64++;
    const ok = hs.filter((hb) => ms.includes(hb.metodo)).some((hb) => tabelas(hb).some((t) => [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])].some((q) => formas(e, q.nv[1]).includes(q.e))));
    if (!ok) E(`6.4: espécie ${e} (${esp.get(e)?.nome}) ausente de ${nome} (${ms.join('/')}), nem na forma do nível`);
  }
}
// Queixada-Caipora (176): errante no mapa B depois da insígnia 13, nível 63 (curva de docs/EQUILIBRIO-MAPA-B.md)
const solta = EVENTOS_B2S.find((e) => e.id === 'b2-caipora-solta');
if (!JSON.stringify(solta?.passos ?? []).includes('["errante",176,63]')) E('b2-caipora-solta: não solta a Queixada-Caipora (176) no nível 63');
if (!(Z.get('B6')?.gatilhos ?? []).some((g) => g.script === 'b2-caipora-solta' && /insignia:13/.test(g.se ?? ''))) E('B6: a Queixada-Caipora não passa a vagar depois da insígnia 13');
if (!JSON.stringify(EVENTOS_B2S.find((e) => e.id === 'b2-lab-final')?.passos ?? []).includes('["flag","laboratorio-ok"]')) E('b2-lab-final: não marca laboratorio-ok');

/* ---------- coerência de níveis (spec 4.5, curva nova) ---------- */
const evoluiDe = new Map<number, number>(); for (const e of ESPECIES) for (const v of e.evolui ?? []) if (v.nivel) evoluiDe.set(v.para, v.nivel);
/** ás do líder por passo (tools/verify/curva-b.ts): 12 → 63, 13 → 66, 14 → 68, 15 → 70, 16 → 72; depois o Garrote (74) */
const ASL = (p: number) => asDoPassoB(p);
function confere(onde: string, e: number, nv: number, basicoPermitido = false) {
  const s = esp.get(e); if (!s) { E(`${onde}: espécie ${e} inexistente`); return; }
  if (s.lendario) return;
  const de = evoluiDe.get(e); if (de && nv < de) E(`${onde}: ${s.nome} no nível ${nv}, abaixo da evolução (nv ${de})`);
  const para = (s.evolui ?? []).find((v) => v.nivel); if (para?.nivel && nv >= para.nivel && !basicoPermitido) E(`${onde}: ${s.nome} no nível ${nv} já devia ter evoluído (nv ${para.nivel})`);
}
let nTab = 0;
const FAIXA = ['grama', 'caverna', 'agua', 'arvore', 'rocha', 'mergulho'];
for (const z of meus) {
  const as = ASL(z.passo ?? 12);
  for (const hb of z.habitats ?? []) tabelas(hb).forEach((t, ci) => {
    const camada = ci > 0 ? (hb.camadas ?? [])[ci - 1] : undefined;
    for (const q of [...(t.todos ?? []), ...(t.manha ?? []), ...(t.dia ?? []), ...(t.noite ?? [])] as Encontro[]) {
      confere(`${z.id} ${hb.metodo}${camada ? ` (camada ${camada.apos})` : ''}`, q.e, q.nv[0], hb.metodo === 'pesca-velha');
      if (q.nv[0] > q.nv[1]) E(`${z.id} ${hb.metodo}: faixa invertida da espécie ${q.e}`);
      if (!camada && FAIXA.includes(hb.metodo) && (q.nv[0] < as - 6 || q.nv[1] > as - 2)) E(`${z.id} ${hb.metodo}: espécie ${q.e} nv ${q.nv[0]}–${q.nv[1]} fora de ${as - 6}–${as - 2} (ás do líder do passo −6 a −2)`);
      if (!camada && hb.metodo.startsWith('pesca') && hb.metodo !== 'pesca-velha' && q.nv[1] > as - 2) E(`${z.id} ${hb.metodo}: espécie ${q.e} nv ${q.nv[1]} acima de ${as - 2}`);
      if (camada) { const teto = ASL(camada.apos + 1) - 2; if (camada.apos <= (z.passo ?? 12) || q.nv[1] > teto || q.nv[0] < teto - 6) E(`${z.id} ${hb.metodo}: camada pós-insígnia ${camada.apos} com nv ${q.nv[0]}–${q.nv[1]} fora de ${teto - 6}–${teto}`); }
    }
    if (!camada && ['grama', 'caverna', 'agua', 'mergulho'].includes(hb.metodo)) {
      for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { nTab++;
        const p = l.reduce((a, c) => a + c.peso, 0), media = l.reduce((a, c) => a + ((c.nv[0] + c.nv[1]) / 2) * c.peso, 0) / (p || 1);
        if (media > as - 2) E(`${z.id} ${hb.metodo}: média ${media.toFixed(1)} acima de ${as - 2}`);
        if (l.length < 6 && ['grama', 'caverna', 'mergulho'].includes(hb.metodo)) E(`${z.id} ${hb.metodo}: só ${l.length} espécies no período (spec 6.4: 6 a 16)`);
      }
    }
    for (const l of [t.todos, t.manha, t.dia, t.noite].filter(Boolean) as Encontro[][]) { const p = l.reduce((a, c) => a + c.peso, 0); if (l.length && (p < 80 || p > 125)) A(`${z.id} ${hb.metodo}: pesos somam ${p}`); }
  });
}
/** passo em que cada treinador é enfrentado (as revanches de depois da insígnia 14 contam para o líder 15) */
const passoDo = (t: TreinadorDef): number => {
  if (/^B5-mare-2/.test(t.id)) return 15;
  if (/^(B-R4|B7|rival-7)/.test(t.id)) return 14;
  if (/^(B-TA|B6|B-VV)/.test(t.id)) return 13;
  return 12;
};
for (const t of TREINADORES_B2S) {
  const p = passoDo(t), as = ASL(p), chefe = /zinabre|lata|rival/.test(t.id), topo = Math.max(...t.equipe.map((m) => m.nv));
  for (const m of t.equipe) confere(`treinador ${t.id}`, m.e, m.nv, /^rival/.test(t.id) && [3, 6, 9].includes(m.e));
  if (chefe) { if (topo > as - 1 || topo < as - 3) E(`treinador ${t.id}: ás ${topo} fora de ${as - 3}–${as - 1} (chefe antes do líder com ás ${as})`); if (Math.min(...t.equipe.map((m) => m.nv)) < as - 6) E(`treinador ${t.id}: membro abaixo de ${as - 6}`); }
  else if (topo > as - 2 || Math.min(...t.equipe.map((m) => m.nv)) < as - 6) E(`treinador ${t.id}: níveis fora de ${as - 6}–${as - 2} (ás do líder ${as})`);
  if (!t.desafio || !t.derrota || t.premio <= 0) E(`treinador ${t.id}: falta fala ou prêmio`);
  if (t.itens?.length && !chefe) E(`treinador ${t.id}: treinador comum com item de cura (spec 7A)`);
  if (t.equipe.length > 6) E(`treinador ${t.id}: mais de 6 criaturas`);
}
const comuns = TREINADORES_B2S.filter((t) => !/^rival-7-(rio|mata)$/.test(t.id)).length;
if (comuns < 40) E(`só ${comuns} treinadores distintos (o time precisa de ≥ 40)`);
// missões paralelas (≥ 5) e eventos de história
const MISSOES = ['b2-cabaca', 'b2-dende', 'b2-feira-quinta', 'b2-roda-sabado', 'b2-filhotes', 'b2-carta', 'b2-troca-b7', 'b2-pinhoes', 'b2-payada', 'b2-chimarrao'];
for (const m of MISSOES) if (!evs.has(m)) E(`missão ${m} sem evento`);
const usadosEv = new Set<string>(); for (const z of meus) { for (const n of z.npcs ?? []) if (n.script) usadosEv.add(n.script); for (const o of z.objetos ?? []) if (typeof o.script === 'string') usadosEv.add(o.script); for (const g of z.gatilhos ?? []) usadosEv.add(g.script); }
for (const ev of EVENTOS_B2S) if (!usadosEv.has(ev.id)) E(`evento ${ev.id} não é disparado por nenhuma zona`);
console.log(`\nÁreas visíveis e fora de alcance até a Cachoeira: ${fechados.join(' · ')}`);
console.log(`Itens em áreas de Amuleto já obtido (Facão, Remo, Força, Quebra-pedra, Escalar): ${deAmuleto.length}`);
console.log(`${meus.length} zonas · ${TREINADORES_B2S.length} treinadores (${comuns} distintos, ${nVisao} com linha de visão) · ${EVENTOS_B2S.length} eventos · ${nRotas} rotas de alcance · ${nItens} itens (${nFechados} atrás da Cachoeira) · ${n64} linhas da 6.4 · ${nTab} tabelas de selvagens`);
console.log(erros ? `FALHOU: ${erros} erro(s), ${avisos} aviso(s)` : `OK: 0 erros, ${avisos} aviso(s)`);
process.exit(erros ? 1 : 0);
