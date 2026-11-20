/**
 * Simula uma sequência de lutas a partir de um checkpoint REAL do QA 2 (equipe e mochila do save), no motor puro, com o
 * piloto esperto. Uso: npx tsx tools/testes/qa2/sim-save.mts <save> <treinador,treinador,...> [n=300] [cuidar|semcuidar] [curado|como-esta]
 */
import { readFileSync } from 'node:fs';
import { carregarDados, lutarContra, inimigosDe, itensDoTreinador, cuidarEntreLutas, pilotoEsperto, rng } from '../../equilibrio-referencia';
import { atributos } from '../../../src/battle/criatura';
const [nome, ids, nArg, cuidarArg, estadoArg] = process.argv.slice(2);
const n = Number(nArg ?? 300), cuida = cuidarArg !== 'semcuidar', curado = estadoArg !== 'como-esta';
const d = await carregarDados();
const sv = JSON.parse(readFileSync(new URL(`./saves/${nome}.json`, import.meta.url), 'utf8'));
const seq = ids.split(',');
const passou = seq.map(() => 0); let tudo = 0;
for (let i = 0; i < n; i++) {
  rng.seed(1000 + i * 7919);
  const eq = JSON.parse(JSON.stringify(sv.equipe.filter((c: { ovo?: boolean }) => !c.ovo)));
  if (curado) for (const c of eq) { c.vida = atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; }
  if (process.env.ORDEM === 'rodizio') { eq.sort((a: { nivel: number }, b: { nivel: number }) => b.nivel - a.nivel); const [x] = eq.splice(2, 1); eq.unshift(x); } else if (process.env.ORDEM !== 'save') eq.sort((a: { nivel: number }, b: { nivel: number }) => b.nivel - a.nivel);
  const itens: Record<string, number> = {}; for (const [k, v] of Object.entries(sv.mochila)) if (/garrafada|elixir|cha-|pomada|garapa|mel-puro|unguento/.test(k)) itens[k] = v as number;
  let ok = true;
  for (const [k, id] of seq.entries()) {
    const t = d.treinadores.get(id); if (!t) throw new Error('treinador desconhecido: ' + id);
    if (k > 0 && cuida) cuidarEntreLutas(eq, itens);
    const r = lutarContra(eq, itens, inimigosDe(t), t.nome, pilotoEsperto, t.ia ?? 'treinador', { itensIA: itensDoTreinador(t, sv.insignias.length), ganhaExp: true });
    if (!r.vitoria) { ok = false; break; }
    passou[k]++;
  }
  if (ok) tudo++;
}
console.log(`${nome} [${sv.equipe.map((c: { especie: number; nivel: number }) => c.especie + ':' + c.nivel).join(' ')}] × ${ids} (${cuida ? 'com' : 'sem'} remédios entre lutas): ` + seq.map((id, k) => `${id} ${(100 * passou[k] / n).toFixed(0)}%`).join(' → ') + ` | sequência ${(100 * tudo / n).toFixed(0)}%`);
