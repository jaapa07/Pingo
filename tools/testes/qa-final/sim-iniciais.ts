/**
 * QA FINAL — chefes que dependem do inicial (rivais 1–8, cada variante contra o inicial que a provoca) e os líderes 9–16,
 * Garrote e Conselho com a equipe de referência de CADA inicial (Mata, Brasa, Rio), ás do jogador Δ abaixo do ás do chefe.
 * Uso: npx tsx tools/testes/qa-final/sim-iniciais.ts [--n 120] [--d 2]
 */
import { carregarDados, equipeReferencia, instanciar, inimigosDe, lutarContra, cuidarEntreLutas, itensDoTreinador, PILOTOS, rng, asDe, NOME_INICIAL, PASSO_LIGA } from '../../equilibrio-referencia';
import { LIMIAR_CHOCALHO, FATOR_EXP_INSIGNIA_12 } from '../../../src/battle/engine';
const arg = (k: string, p: number) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? Number(process.argv[i + 1]) : p; };
const N = arg('n', 120), D = arg('d', 2);
const d = await carregarDados();
const semente = (t: string, i: number) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) + i * 7919) >>> 0 || 1; };
const VAR: Record<number, string> = { 1: 'brasa', 4: 'rio', 7: 'mata' }; // inicial do jogador → variante da rival
const t = (id: string) => { const x = d.treinadores.get(id); if (!x) throw new Error('sem ' + id); return x; };
/** passo (insígnias do jogador + 1) em que cada rival acontece */
const PASSO_RIVAL: Record<number, number> = { 1: 1, 2: 3, 3: 4, 4: 5, 5: 9, 6: 11, 7: 14, 8: 17 };
function taxa(seq: string[], ini: number, dl: number, passo: number, itens: () => Record<string, number>) {
  const ts = seq.map(t), as = Math.max(...ts.map(asDe)) - dl; let v = 0;
  for (let i = 0; i < N; i++) {
    rng.seed(semente(seq.join('+') + '|' + ini + '|' + dl, i));
    const eq = instanciar(equipeReferencia(d, ini, Math.min(passo, PASSO_LIGA), as)), it = itens(); let ok = true;
    for (const [k, x] of ts.entries()) {
      if (k > 0) cuidarEntreLutas(eq, it);
      const r = lutarContra(eq, it, inimigosDe(x), x.nome, PILOTOS.esperto, x.ia ?? 'treinador', { itensIA: itensDoTreinador(x, passo - 1), ganhaExp: seq.length > 1, expPartilhada: seq.length > 1, limiarPartilha: LIMIAR_CHOCALHO.depoisDaLiga, fatorExp: FATOR_EXP_INSIGNIA_12 });
      if (!r.vitoria) { ok = false; break; }
    }
    if (ok) v++;
  }
  return Math.round((100 * v) / N) + '%';
}
const SEM = () => ({ garrafada: 3 }), LID = () => ({ garrafada: 6, 'elixir-andiroba': 2 });
console.log(`N=${N}, Δ=${D} (ás do chefe − ás do jogador), piloto esperto`);
console.log('| Chefe | Mata | Brasa | Rio |\n|---|---|---|---|');
for (let r = 1; r <= 8; r++) {
  const linha = [1, 4, 7].map((ini) => { const id = r === 1 && !d.treinadores.has(`rival-1-${VAR[ini]}`) ? 'rival-1' : `rival-${r}-${VAR[ini]}`; return d.treinadores.has(id) ? `${taxa([id], ini, D, PASSO_RIVAL[r], r <= 2 ? () => ({}) : SEM)} (${id}, ás ${asDe(t(id))})` : `— (${id} não existe)`; });
  console.log(`| rival ${r} | ${linha.join(' | ')} |`);
}
for (let n = 9; n <= 16; n++) { const id = `lider-${String(n).padStart(2, '0')}`; console.log(`| líder ${n} (ás ${asDe(t(id))}) | ${[1, 4, 7].map((ini) => taxa([id], ini, D, n, LID)).join(' | ')} |`); }
console.log(`| Garrote | ${[1, 4, 7].map((ini) => taxa(['garrote'], ini, D, 17, LID)).join(' | ')} |`);
console.log(`| Conselho (5 seguidas, mochila cheia) | ${[1, 4, 7].map((ini) => taxa(['conselho-1', 'conselho-2', 'conselho-3', 'conselho-4', 'conselho-5'], ini, D, 17, () => ({ garrafada: 8, 'garrafada-forte': 6, 'cha-guarana': 4, 'elixir-andiroba': 4 }))).join(' | ')} |`);
void NOME_INICIAL;
