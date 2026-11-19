import { especies } from '/home/user/adventures-of-pingo/src/data/criaturas/parte-061-120';
import { temGolpe, golpe } from '/home/user/adventures-of-pingo/src/data/golpes';
import { PERGAMINHOS, temItemDef } from '/home/user/adventures-of-pingo/src/data/itens';
import { readFileSync } from 'node:fs';
const spec = readFileSync('/home/user/adventures-of-pingo/GAME_SPEC_PINGO.md', 'utf8');
const T: Record<string,string> = { Comum:'comum',Mata:'mata',Brasa:'brasa',Rio:'rio','Trovão':'trovao',Geada:'geada',Ginga:'ginga',Veneno:'veneno',Terra:'terra',Vento:'vento',Mente:'mente',Inseto:'inseto',Pedra:'pedra',Assombro:'assombro',Lenda:'lenda',Ferro:'ferro',Encanto:'encanto' };
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const tab = new Map<number, { nome: string; tipos: string[]; evo: string }>();
for (const l of spec.split('\n')) { const m = l.match(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| [^|]+ \| ([^|]+) \|/); if (m) tab.set(+m[1], { nome: m[2].trim(), tipos: m[3].trim().split('/').map((t) => T[t]), evo: m[4].trim() }); }
let err = 0; const E = (n: number, s: string) => { err++; console.log(`#${n}: ${s}`); };
if (especies.length !== 60) E(0, 'qtd ' + especies.length);
const evoluiDe = new Set<number>(); for (const e of especies) for (const v of e.evolui ?? []) evoluiDe.add(v.para);
especies.forEach((e, i) => {
  const n = 61 + i; if (e.num !== n) E(n, 'num ' + e.num);
  const t = tab.get(n)!;
  if (e.nome !== t.nome) E(n, `nome ${e.nome} != ${t.nome}`);
  if (e.id !== slug(t.nome)) E(n, `id ${e.id} != ${slug(t.nome)}`);
  if (e.tipos.join('/') !== t.tipos.join('/')) E(n, `tipos ${e.tipos} != ${t.tipos}`);
  const ev = e.evolui ?? [];
  if (t.evo === '—') { if (ev.length) E(n, 'não devia evoluir'); }
  else { const m = t.evo.match(/^→(\d+) (?:nv(\d+)|(Pedra \w+))$/); if (!m) E(n, 'evo spec? ' + t.evo); else { const v = ev[0]; if (ev.length !== 1 || v.para !== +m[1] || (m[2] ? v.nivel !== +m[2] : v.item !== slug(m[3]))) E(n, 'evo ' + JSON.stringify(ev) + ' != ' + t.evo); if (v?.item && !temItemDef(v.item)) E(n, 'item ' + v.item); } }
  const soma = Object.values(e.base).reduce((a, x) => a + x, 0);
  const basico = ev.length > 0 && !evoluiDe.has(n), final = !ev.length && evoluiDe.has(n);
  const [lo, hi] = basico ? [280, 330] : final ? [500, 540] : [400, 480];
  if (soma < lo || soma > hi) E(n, `soma ${soma} fora de ${lo}-${hi}`);
  if (e.golpes.length < 8 || e.golpes.length > 14) E(n, 'qtd golpes ' + e.golpes.length);
  const n1 = e.golpes.filter(([l]) => l === 1).length; if (n1 < 1 || n1 > 2) E(n, 'golpes nv1 ' + n1);
  e.golpes.forEach(([l, id], k) => { if (!temGolpe(id) || id === 'desespero') E(n, 'golpe ' + id); if (k && l < e.golpes[k - 1][0]) E(n, 'ordem ' + id); });
  if (new Set(e.golpes.map((g) => g[1])).size !== e.golpes.length) E(n, 'golpe repetido');
  if (!e.golpes.some(([, id]) => temGolpe(id) && golpe(id).poder > 0 && e.tipos.includes(golpe(id).tipo as never))) E(n, 'sem golpe do próprio tipo');
  if (e.pergaminhos.length < 8 || e.pergaminhos.length > 20) E(n, 'qtd perg ' + e.pergaminhos.length);
  for (const p of e.pergaminhos) if (!PERGAMINHOS[p]) E(n, 'perg ' + p);
  if (new Set(e.pergaminhos).size !== e.pergaminhos.length) E(n, 'perg repetido');
  for (const p of e.pergaminhos) if (e.golpes.some(([, id]) => id === PERGAMINHOS[p])) console.log(`  aviso #${n}: ${p} (${PERGAMINHOS[p]}) já é golpe de nível`);
  const [el, eh] = basico ? [50, 70] : final ? [180, 230] : [120, 160]; if (e.expBase < el || e.expBase > eh) E(n, 'exp ' + e.expBase);
  if (final && (e.taxaCaptura < 25 || e.taxaCaptura > 45)) E(n, 'taxa final ' + e.taxaCaptura);
  if (e.taxaCaptura < 3 || e.taxaCaptura > 255) E(n, 'taxa');
  const esf = Object.values(e.esforco).reduce((a, x) => a + (x ?? 0), 0); if (esf !== (basico ? 1 : final ? 3 : 2)) E(n, 'esforço ' + esf);
  if (e.porte !== (basico ? 'P' : final ? 'G' : 'M')) E(n, 'porte ' + e.porte);
  if ((e.diario.match(/[.!?](\s|$)/g) ?? []).length !== 2) E(n, 'diário não tem 2 frases: ' + (e.diario.match(/[.!?](\s|$)/g) ?? []).length);
  if (e.lendario || e.femeas === null) E(n, 'lendário?');
  if (!(e.altura > 0 && e.peso > 0 && e.habitat)) E(n, 'medidas');
  if (final) { const pre = especies.find((x) => x.evolui?.some((v) => v.para === n))!; const nv = pre.evolui![0].nivel ?? 1; for (const [l, id] of pre.golpes) if (l <= nv && !e.golpes.some((g) => g[1] === id)) console.log(`  aviso #${n}: não herda ${id} (nv${l})`); if (soma <= Object.values(pre.base).reduce((a, x) => a + x, 0)) E(n, 'soma não cresce'); for (const s of Object.keys(e.base) as (keyof typeof e.base)[]) if (e.base[s] < pre.base[s]) E(n, 'atributo cai: ' + s); }
  console.log(n, e.id.padEnd(20), soma, basico ? 'B' : final ? 'F' : 'M', e.golpes.length, e.pergaminhos.length);
});
const txt = readFileSync('/home/user/adventures-of-pingo/src/data/criaturas/parte-061-120.ts', 'utf8'); if (/TODO|FIXME|placeholder|lorem/i.test(txt)) E(0, 'palavra proibida');
console.log(err ? `ERROS: ${err}` : 'OK sem erros');
