/**
 * SIMULADOR DE EQUILÍBRIO — `npx tsx tools/sim-equilibrio.ts [--n 300] [--rota 80] [--json saida.json] [--sem-doc]`
 * Roda batalhas sem interface (motor puro, `rng` com sementes fixas) entre a equipe de referência do jogador
 * (tools/equilibrio-referencia.ts) e cada treinador do mapa A, com três pilotos de jogador: "bobo", "esperto" e a IA do jogo.
 * Grava as tabelas em docs/EQUILIBRIO.md, entre os marcadores `<!-- sim:inicio -->` e `<!-- sim:fim -->`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { TreinadorDef } from '../src/core/tipos';
import { especie } from '../src/battle/criatura';
import type { NivelIA } from '../src/battle/ia';
import {
  carregarDados, equipeReferencia, instanciar, itensReferencia, itensDeRota, itensDoTreinador, inimigosDe, lutarContra, cuidarEntreLutas,
  asDoJogador, asDoChefe, asDe, lider, INICIAIS, NOME_INICIAL, PASSO_LIGA, IDS_LIGA, PILOTOS, pilotoEsperto, rng, type Dados, type PilotoId, type MembroRef,
} from './equilibrio-referencia';

const arg = (nome: string, padrao: number) => { const i = process.argv.indexOf('--' + nome); return i > 0 ? Number(process.argv[i + 1]) : padrao; };
const N = arg('n', 300), N_ROTA = arg('rota', 80);
const d = await carregarDados();
const pct = (x: number) => (100 * x).toFixed(0) + '%';
const nomeEq = (eq: readonly { e: number; nv: number }[]) => eq.map((m) => `${especie(m.e).nome} ${m.nv}`).join(', ');
const semente = (texto: string, i: number) => { let h = 2166136261; for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) + i * 7919) >>> 0 || 1; };

interface Confronto { equipe: MembroRef[] | { e: number; nv: number }[]; itens: Record<string, number>; t: TreinadorDef; insignias: number; ia?: NivelIA; semItensIA?: boolean }
/** taxa de vitória do jogador em `n` batalhas com sementes fixas */
function taxa(c: Confronto, piloto: PilotoId, n: number, chave: string): number {
  let v = 0;
  for (let i = 0; i < n; i++) {
    rng.seed(semente(chave + '|' + c.t.id + '|' + piloto, i));
    const r = lutarContra(instanciar(c.equipe), { ...c.itens }, inimigosDe(c.t), c.t.nome, PILOTOS[piloto], c.ia ?? c.t.ia, { itensIA: c.semItensIA ? {} : itensDoTreinador(c.t, c.insignias) });
    if (r.vitoria) v++;
  }
  return v / n;
}
const media = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / Math.max(1, xs.length);
const saida: string[] = [], json: Record<string, unknown> = {};
const out = (s = '') => { saida.push(s); };

/* ------------------------------ 1. equipes de referência ------------------------------ */
out('### 1. Equipe de referência do jogador por passo');
out();
out('Derivada das tabelas de habitat (grama, caverna e árvore das zonas do mapa A abertas até o passo). Ás do jogador = ás do chefe − 2 nos passos 1–3, − 3 do 4 ao 8 e − 4 na Liga.');
out();
out('| Passo | Ás do chefe | Inicial Mata | Inicial Brasa | Inicial Rio | Remédios |');
out('|---|---|---|---|---|---|');
for (let k = 1; k <= PASSO_LIGA; k++) {
  const it = Object.entries(itensReferencia(k)).map(([id, q]) => `${q}× ${id}`).join(', ');
  out(`| ${k === PASSO_LIGA ? 'Liga' : k} | ${asDoChefe(d, k)} | ${INICIAIS.map((ini) => nomeEq(equipeReferencia(d, ini, k))).join(' | ')} | ${it} |`);
}
out();

/* ------------------------------ 2. líderes ------------------------------ */
const POL: PilotoId[] = ['esperto', 'bobo', 'ia'];
function contraChefe(t: TreinadorDef, passo: number, delta = 0, pol: PilotoId[] = POL, n = N): Record<PilotoId, number> {
  const r = {} as Record<PilotoId, number>;
  for (const p of pol) r[p] = media(INICIAIS.map((ini) => taxa({ equipe: equipeReferencia(d, ini, passo, Math.max(2, asDoJogador(d, passo) + delta)), itens: itensReferencia(passo), t, insignias: passo - 1 }, p, Math.ceil(n / 3), `chefe${delta}|${ini}`)));
  return r;
}
out('### 2. Líderes 1–8 (meta: esperto 55–75%, bobo 25–45%)');
out();
out('| Líder | Equipe do líder | Esperto | Bobo | IA do jogo | Meta |');
out('|---|---|---|---|---|---|');
const lideres: Record<string, Record<PilotoId, number>> = {};
for (let k = 1; k <= 8; k++) {
  const t = lider(d, k); if (!t) { out(`| ${k} | (sem dados) | | | | |`); continue; }
  const r = contraChefe(t, k); lideres[t.id] = r;
  const ok = r.esperto >= 0.55 && r.esperto <= 0.75 && r.bobo >= 0.25 && r.bobo <= 0.45;
  out(`| ${k} ${t.nome} | ${nomeEq(t.equipe)} | ${pct(r.esperto)} | ${pct(r.bobo)} | ${pct(r.ia)} | ${ok ? 'ok' : 'FORA'} |`);
}
json.lideres = lideres;
out();

/* ------------------------------ 3. treinadores de rota ------------------------------ */
/** passo em que o treinador é enfrentado */
function passoDoTreinador(t: TreinadorDef): number {
  const g = /^g(\d\d)-/.exec(t.id); if (g) return Number(g[1]); // turma do ginásio N: enfrentada logo antes do líder N
  const m = asDe(t);
  // rota: quem tem o ás já no nível do ás de um líder está no trecho DEPOIS dele
  for (let k = 1; k <= 8; k++) if (m < asDoChefe(d, k)) return k;
  return m <= asDoChefe(d, PASSO_LIGA) ? PASSO_LIGA : 99;
}
const inicialContraRival = (id: string): number | null => (id.endsWith('-brasa') ? 1 : id.endsWith('-rio') ? 4 : id.endsWith('-mata') ? 7 : null);
function equipeDeRota(t: TreinadorDef, ini: number, passo: number): { e: number; nv: number }[] {
  const as = Math.max(5, Math.min(asDoJogador(d, passo), asDe(t) + 1));
  const eq = equipeReferencia(d, ini, passo, as);
  if (t.id.startsWith('rival-1')) return eq.slice(0, 1);
  return passo === 1 ? eq.slice(0, Math.max(1, as - 3)) : eq;
}
out('### 3. Treinadores de rota e de ginásio (meta: esperto ≥ 90%)');
out();
const rota: Record<string, number> = {}, porZona = new Map<string, { id: string; v: number; bobo: number }[]>(), chefes: TreinadorDef[] = [];
for (const t of d.treinadores.values()) {
  if (t.insignia || IDS_LIGA.includes(t.id)) continue;
  const passo = passoDoTreinador(t); if (passo > PASSO_LIGA) continue;
  if (t.ia === 'lider' || t.ia === 'conselho') { chefes.push(t); continue; }
  const fixo = inicialContraRival(t.id), inis = fixo ? [fixo] : [...INICIAIS];
  const um = (p: PilotoId) => media(inis.map((ini) => taxa({ equipe: equipeDeRota(t, ini, passo), itens: itensDeRota(passo), t, insignias: passo - 1 }, p, Math.ceil(N_ROTA / inis.length), `rota|${ini}`)));
  const v = um('esperto'), bobo = um('bobo'); rota[t.id] = v;
  const z = t.id.startsWith('rival') ? 'Rival Tainá' : (d.zonaDoTreinador.get(t.id)?.nome ?? t.id.replace(/-\d+$/, ''));
  if (!porZona.has(z)) porZona.set(z, []); porZona.get(z)!.push({ id: t.id, v, bobo });
}
out('| Zona | Treinadores | Esperto (média) | Pior caso | Bobo (média) | Abaixo de 90% |');
out('|---|---|---|---|---|---|');
for (const [z, l] of porZona) { const pior = l.reduce((a, x) => (x.v < a.v ? x : a)); out(`| ${z} | ${l.length} | ${pct(media(l.map((x) => x.v)))} | ${pior.id} ${pct(pior.v)} | ${pct(media(l.map((x) => x.bobo)))} | ${l.filter((x) => x.v < 0.9).map((x) => `${x.id} ${pct(x.v)}`).join(', ') || '—'} |`); }
const todosRota = Object.values(rota);
out();
out(`Total: ${todosRota.length} treinadores · média ${pct(media(todosRota))} · ${todosRota.filter((x) => x < 0.9).length} abaixo de 90%.`);
json.rota = rota;
out();
if (chefes.length) {
  out('Chefes de história com IA de líder (sem meta própria; esperado entre treinador de rota e líder):');
  out();
  out('| Chefe | Equipe | Esperto | Bobo |');
  out('|---|---|---|---|');
  const jc: Record<string, unknown> = {};
  for (const t of chefes) {
    const passo = passoDoTreinador(t), fixo = inicialContraRival(t.id), inis = fixo ? [fixo] : [...INICIAIS];
    const um = (p: PilotoId) => media(inis.map((ini) => taxa({ equipe: equipeReferencia(d, ini, passo, Math.min(asDoJogador(d, passo), asDe(t) - 2)), itens: itensReferencia(Math.min(passo, 8)), t, insignias: passo === PASSO_LIGA ? 8 : passo - 1 }, p, Math.ceil(N / 2 / inis.length), `chefe-h|${ini}`)));
    const e = um('esperto'), b = um('bobo'); jc[t.id] = { esperto: e, bobo: b };
    out(`| ${t.id} ${t.nome} | ${nomeEq(t.equipe)} | ${pct(e)} | ${pct(b)} |`);
  }
  json.chefes = jc;
  out();
}

/* ------------------------------ 4. Liga ------------------------------ */
function liga(piloto: PilotoId, n: number, delta = 0): { completa: number; porLuta: number[] } {
  const venceu = [0, 0, 0, 0, 0]; let completa = 0, total = 0;
  for (const ini of INICIAIS) for (let i = 0; i < Math.ceil(n / 3); i++) {
    total++;
    rng.seed(semente(`liga${delta}|${ini}|${piloto}`, i));
    const equipe = instanciar(equipeReferencia(d, ini, PASSO_LIGA, asDoJogador(d, PASSO_LIGA) + delta)), itens = itensReferencia(PASSO_LIGA);
    let ok = true;
    for (let k = 0; k < IDS_LIGA.length && ok; k++) {
      const t = d.treinadores.get(IDS_LIGA[k]); if (!t) { ok = false; break; }
      if (k > 0) cuidarEntreLutas(equipe, itens);
      ok = lutarContra(equipe, itens, inimigosDe(t), t.nome, PILOTOS[piloto], t.ia, { itensIA: itensDoTreinador(t, 8), ganhaExp: true }).vitoria;
      if (ok) venceu[k]++;
    }
    if (ok) completa++;
  }
  return { completa: completa / total, porLuta: venceu.map((x) => x / total) };
}
out('### 4. Liga dos Guardiões — 5 lutas seguidas, sem cura grátis, com os remédios da mochila (meta: esperto 35–55% na sequência)');
out();
out('| Piloto | Passou da 1ª | da 2ª | da 3ª | da 4ª | Sequência inteira |');
out('|---|---|---|---|---|---|');
const jl: Record<string, unknown> = {};
for (const p of POL) { const r = liga(p, N); jl[p] = r; out(`| ${p} | ${r.porLuta.slice(0, 4).map(pct).join(' | ')} | **${pct(r.completa)}** |`); }
out();
out('Cada luta da Liga isolada (equipe inteira e curada, mesmos remédios):');
out();
out('| Luta | Equipe | Esperto | Bobo |');
out('|---|---|---|---|');
for (const id of IDS_LIGA) { const t = d.treinadores.get(id); if (!t) continue; const r = contraChefe(t, PASSO_LIGA, 0, ['esperto', 'bobo'], N); jl[id] = r; out(`| ${t.classe} ${t.nome} | ${nomeEq(t.equipe)} | ${pct(r.esperto)} | ${pct(r.bobo)} |`); }
json.liga = jl;
out();

/* ------------------------------ 5. dez níveis acima e abaixo ------------------------------ */
out('### 5. Peso do nível (meta: 10+ níveis acima vence ≥ 95% de qualquer coisa; 10 abaixo perde ≥ 85% contra líder)');
out();
out('| Chefe | +10 esperto | +10 bobo | −10 esperto (vitórias) | Meta |');
out('|---|---|---|---|---|');
const jn: Record<string, unknown> = {};
for (let k = 1; k <= PASSO_LIGA + 4; k++) {
  const t = k <= 8 ? lider(d, k) : d.treinadores.get(IDS_LIGA[k - PASSO_LIGA]); if (!t) continue;
  const passo = Math.min(k, PASSO_LIGA);
  const mais = contraChefe(t, passo, 10, ['esperto', 'bobo'], N / 2);
  const cabeMenos = asDoJogador(d, passo) - 10 >= 5;
  const menos = cabeMenos ? contraChefe(t, passo, -10, ['esperto'], N / 2).esperto : NaN;
  jn[t.id] = { mais, menos };
  const ok = mais.esperto >= 0.95 && mais.bobo >= 0.95 && (!cabeMenos || menos <= 0.15);
  out(`| ${t.classe} ${t.nome} | ${pct(mais.esperto)} | ${pct(mais.bobo)} | ${cabeMenos ? pct(menos) : 'n/a (nível < 5)'} | ${ok ? 'ok' : 'FORA'} |`);
}
{ const mais = liga('esperto', N / 2, 10), maisB = liga('bobo', N / 2, 10), menos = liga('esperto', N / 2, -10); jn.liga = { mais, maisB, menos }; out(`| Liga inteira (5 lutas) | ${pct(mais.completa)} | ${pct(maisB.completa)} | ${pct(menos.completa)} | ${mais.completa >= 0.95 && menos.completa <= 0.15 ? 'ok' : 'FORA'} |`); }
{
  // rota: +10 níveis sobre o ás do treinador, piloto bobo
  let piorId = '', pior = 1; const todas: number[] = [];
  for (const t of d.treinadores.values()) {
    if (t.insignia || IDS_LIGA.includes(t.id) || t.ia === 'lider' || t.ia === 'conselho') continue;
    const passo = passoDoTreinador(t); if (passo > PASSO_LIGA) continue;
    const ini = inicialContraRival(t.id) ?? INICIAIS[todas.length % 3];
    const eq = equipeReferencia(d, ini, Math.min(8, passo), asDe(t) + 10);
    const v = taxa({ equipe: t.id.startsWith('rival-1') ? eq.slice(0, 1) : eq, itens: {}, t, insignias: passo - 1 }, 'bobo', 30, 'rota+10');
    todas.push(v); if (v < pior) { pior = v; piorId = t.id; }
  }
  jn.rotaMais10 = { media: media(todas), pior, piorId };
  out(`| Treinadores de rota (${todas.length}), bobo com ás +10 | — | média ${pct(media(todas))}, pior ${piorId} ${pct(pior)} | — | ${pior >= 0.95 ? 'ok' : 'FORA'} |`);
}
json.nivel = jn;
out();

/* ------------------------------ 6. escada da IA ------------------------------ */
out('### 6. Escada da IA — mesmas equipes, só muda quem pilota o adversário (taxa de vitória DO ADVERSÁRIO contra o jogador esperto)');
out();
out('| Equipe adversária | novato | treinador | lider | conselho |');
out('|---|---|---|---|---|');
const NIVEIS: NivelIA[] = ['novato', 'treinador', 'lider', 'conselho'], somaIA = [0, 0, 0, 0]; let linhasIA = 0;
const ji: Record<string, number[]> = {};
for (let k = 1; k <= PASSO_LIGA + 4; k++) {
  const t = k <= 8 ? lider(d, k) : d.treinadores.get(IDS_LIGA[k - PASSO_LIGA]); if (!t) continue;
  const passo = Math.min(k, PASSO_LIGA);
  const linha = NIVEIS.map((nv) => 1 - media(INICIAIS.map((ini) => taxa({ equipe: equipeReferencia(d, ini, passo), itens: itensReferencia(passo), t, insignias: 8, ia: nv }, 'esperto', Math.ceil(N / 3), `ia|${nv}|${ini}`))));
  linha.forEach((x, i) => { somaIA[i] += x; }); linhasIA++; ji[t.id] = linha;
  out(`| ${t.classe} ${t.nome} | ${linha.map(pct).join(' | ')} |`);
}
out(`| **Média** | ${somaIA.map((x) => '**' + pct(x / Math.max(1, linhasIA)) + '**').join(' | ')} |`);
json.ia = { porEquipe: ji, media: somaIA.map((x) => x / Math.max(1, linhasIA)) };
out();
void pilotoEsperto;

/* ------------------------------ saída ------------------------------ */
const texto = saida.join('\n');
console.log(texto);
const iJson = process.argv.indexOf('--json');
if (iJson > 0) writeFileSync(process.argv[iJson + 1], JSON.stringify(json, null, 1));
if (!process.argv.includes('--sem-doc')) {
  const caminho = new URL('../docs/EQUILIBRIO.md', import.meta.url), INI = '<!-- sim:inicio -->', FIM = '<!-- sim:fim -->';
  const atual = existsSync(caminho) ? readFileSync(caminho, 'utf8') : `# EQUILIBRIO.md\n\n${INI}\n${FIM}\n`;
  const a = atual.indexOf(INI), b = atual.indexOf(FIM);
  const bloco = `${INI}\n_Gerado por \`npx tsx tools/sim-equilibrio.ts\` (N = ${N} por confronto de chefe, ${N_ROTA} por treinador de rota; sementes fixas)._\n\n${texto}\n${FIM}`;
  writeFileSync(caminho, a >= 0 && b > a ? atual.slice(0, a) + bloco + atual.slice(b + FIM.length) : atual + '\n' + bloco + '\n');
}
