/**
 * SIMULADOR DAS REVANCHES — `npx tsx tools/sim-revancha.ts [--n 60]`
 * Mede as equipes de fase (src/data/revancha.ts) com a mesma base do tools/sim-equilibrio.ts (motor puro, sementes fixas,
 * equipe de referência do jogador, pilotos "esperto" e "bobo"): treinadores comuns com contato nas fases 2–4, líderes nas
 * fases 3–4 e a rival semanal. O jogador de referência tem o ás no nível esperado para a fase (coluna "Jogador").
 */
import type { TreinadorDef } from '../src/core/tipos';
import { especie } from '../src/battle/criatura';
import { carregarDados, equipeReferencia, instanciar, itensReferencia, inimigosDe, lutarContra, INICIAIS, PASSO_LIGA, PILOTOS, rng, type PilotoId } from './equilibrio-referencia';
import { equipeDaFase, treinadorDaFase, rivalSemanalDef, type Fase } from '../src/data/revancha';

const arg = (nome: string, padrao: number) => { const i = process.argv.indexOf('--' + nome); return i > 0 ? Number(process.argv[i + 1]) : padrao; };
const N = arg('n', 60);
const d = await carregarDados();
const esp = (n: number) => { try { return especie(n); } catch { return undefined; } };
const pct = (x: number) => (100 * x).toFixed(0) + '%';
const semente = (texto: string, i: number) => { let h = 2166136261; for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) + i * 7919) >>> 0 || 1; };
const media = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / Math.max(1, xs.length);

/** mesma regra de src/world/integracao.ts (daContato), sem importar o mundo */
function daContato(t: TreinadorDef): boolean {
  if (t.contato !== undefined) return t.contato;
  if (t.ia === 'conselho' || /cartel|capang|ferrugem|recruta|mestre|campe/i.test(t.classe)) return false;
  if (t.insignia !== undefined || /rival/i.test(t.classe)) return true;
  let h = 0; for (const ch of t.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 3 === 0;
}
/** ás do jogador de referência em cada fase (o nível típico de quem está nela) */
const AS_JOGADOR: Record<Fase, number> = { 1: 0, 2: 27, 3: 48, 4: 64 };
const AS_JOGADOR_LIDER: Record<Fase, number> = { 1: 0, 2: 0, 3: 50, 4: 66 };
function taxa(t: TreinadorDef, as: number, piloto: PilotoId, n: number): number {
  let v = 0;
  for (const ini of INICIAIS) for (let i = 0; i < Math.ceil(n / 3); i++) {
    rng.seed(semente(`${t.id}|${ini}|${piloto}|${as}`, i));
    const eq = instanciar(equipeReferencia(d, ini, PASSO_LIGA, as)), itens = itensReferencia(PASSO_LIGA);
    const itensIA: Record<string, number> = {}; for (const id of t.itens ?? []) itensIA[id] = (itensIA[id] ?? 0) + 1;
    if (lutarContra(eq, itens, inimigosDe(t), t.nome, PILOTOS[piloto], t.ia, { itensIA }).vitoria) v++;
  }
  return v / (Math.ceil(n / 3) * 3);
}
const nomeEq = (eq: readonly { e: number; nv: number }[]) => eq.map((m) => `${esp(m.e)?.nome ?? m.e} ${m.nv}`).join(', ');

const contatos = [...d.treinadores.values()].filter((t) => daContato(t) && !/^rival-/.test(t.id) && !t.id.startsWith('liga-'));
const comuns = contatos.filter((t) => t.insignia === undefined), lideres = contatos.filter((t) => t.insignia !== undefined).sort((a, b) => a.insignia! - b.insignia!);
console.log(`Contatos possíveis: ${comuns.length} comuns + ${lideres.length} líderes (de ${d.treinadores.size} treinadores).\n`);

console.log('### Comuns com contato (amostra de 1 em 4; meta: esperto ≥ 85%, revanche ainda pede atenção do bobo)');
console.log('| Fase | Jogador (ás) | Treinadores | Ás das equipes (mín–máx) | Esperto | Bobo | Pior (esperto) |');
console.log('|---|---|---|---|---|---|---|');
const amostra = comuns.filter((_, i) => i % 4 === 0);
/** só entram na fase os treinadores que o jogador já pode ter vencido nela (ás original até o teto da fase) */
const TETO: Record<Fase, number> = { 1: 0, 2: 40, 3: 63, 4: 100 };
const asOrig = (t: TreinadorDef) => Math.max(...t.equipe.map((m) => m.nv));
for (const f of [2, 3, 4] as Fase[]) {
  // o jogador tem o ás da fase ou, se o treinador é de mais adiante, o nível de quem acabou de vencê-lo
  const r = amostra.filter((t) => asOrig(t) <= TETO[f]).map((t) => { const tf = treinadorDaFase(t, f, esp), j = Math.max(AS_JOGADOR[f], asOrig(t)); return { t: tf, e: taxa(tf, j, 'esperto', N / 2), b: taxa(tf, j, 'bobo', N / 2) }; });
  const ases = r.map((x) => Math.max(...x.t.equipe.map((m) => m.nv))), pior = r.reduce((a, x) => (x.e < a.e ? x : a));
  console.log(`| ${f} | ${AS_JOGADOR[f]} | ${r.length} | ${Math.min(...ases)}–${Math.max(...ases)} | ${pct(media(r.map((x) => x.e)))} | ${pct(media(r.map((x) => x.b)))} | ${pior.t.id.replace('revanche:', '')} ${pct(pior.e)} |`);
}
console.log('\nExemplo (1º da amostra):');
for (const f of [1, 2, 3, 4] as Fase[]) console.log(`- fase ${f}: ${nomeEq(equipeDaFase(amostra[0], f, esp))}`);

console.log('\n### Líderes no Ginásio de Treino (meta: esperto 45–75% — revanche de líder é luta dura)');
console.log('| Líder | Fase 3 (jogador máx(50, ás do líder − 1)) | Esperto | Bobo | Fase 4 (jogador 66) | Esperto | Bobo |');
console.log('|---|---|---|---|---|---|---|');
for (const t of lideres) {
  // fase 3: quem liga para o líder N já tem a insígnia N, então o ás do jogador é pelo menos o ás do líder − 1
  const f3 = treinadorDaFase(t, 3, esp), f4 = treinadorDaFase(t, 4, esp), j3 = Math.max(AS_JOGADOR_LIDER[3], asOrig(t) - 1);
  console.log(`| ${t.insignia} ${t.nome} | ${nomeEq(f3.equipe)} | ${pct(taxa(f3, j3, 'esperto', N))} | ${pct(taxa(f3, j3, 'bobo', N))} | ${nomeEq(f4.equipe)} | ${pct(taxa(f4, AS_JOGADOR_LIDER[4], 'esperto', N))} | ${pct(taxa(f4, AS_JOGADOR_LIDER[4], 'bobo', N))} |`);
}

console.log('\n### Rival semanal (Gruta do Eco)');
console.log('| Fase | Equipe (inicial dela: Rio) | Jogador | Esperto | Bobo |');
console.log('|---|---|---|---|---|');
for (const f of [3, 4] as Fase[]) { const t = rivalSemanalDef(f, 'rio'); console.log(`| ${f} | ${nomeEq(t.equipe)} | ${AS_JOGADOR_LIDER[f]} | ${pct(taxa(t, AS_JOGADOR_LIDER[f], 'esperto', N))} | ${pct(taxa(t, AS_JOGADOR_LIDER[f], 'bobo', N))} |`); }
