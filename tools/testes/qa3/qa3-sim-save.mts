/**
 * [QA 3, cópia de tools/testes/qa3/qa3-sim-save.mts] Simula lutas a partir de um checkpoint REAL do QA 3 (equipe e mochila do save), no motor puro, com o
 * piloto esperto (INICIAL=mata|brasa troca o inicial de Rio do save). Uso: npx tsx tools/testes/qa3/qa3-sim-save.mts <save> <treinador,treinador,...> [n=300] [cuidar|semcuidar] [curado|como-esta]
 */
import { readFileSync } from 'node:fs';
import { carregarDados, lutarContra, inimigosDe, itensDoTreinador, cuidarEntreLutas, pilotoEsperto, rng, instanciar, formaNoNivel } from '../../equilibrio-referencia';
import { atributos, ganharExp, expParaNivel, especie } from '../../../src/battle/criatura';
const [nome, ids, nArg, cuidarArg, estadoArg] = process.argv.slice(2);
const n = Number(nArg ?? 300), cuida = cuidarArg !== 'semcuidar', curado = estadoArg !== 'como-esta';
const d = await carregarDados();
const sv = JSON.parse(readFileSync(new URL(`./saves/${nome}.json`, import.meta.url), 'utf8'));
const seq = ids.split(',');
const passou = seq.map(() => 0); let tudo = 0;
for (let i = 0; i < n; i++) {
  rng.seed(1000 + i * 7919);
  const eq = JSON.parse(JSON.stringify(sv.equipe.filter((c: { ovo?: boolean }) => !c.ovo)));
  // NIVEL_MAIS=k: experimento de sensibilidade (a equipe k níveis acima do save)
  for (let k = 0; k < Number(process.env.NIVEL_MAIS ?? 0); k++) for (const c of eq) ganharExp(c, expParaNivel(especie(c.especie).crescimento, c.nivel + 1) - c.exp);
  // NIVEL_ALVO=n: a mesma equipe (mesmas espécies) refeita com o ás no nível n e as outras na mesma distância do ás
  if (process.env.NIVEL_ALVO) { const as = Math.max(...eq.map((c: { nivel: number }) => c.nivel)), dl = as - Number(process.env.NIVEL_ALVO); const novas = instanciar(eq.map((c: { especie: number; nivel: number }) => ({ e: c.especie, nv: Math.max(1, c.nivel - dl) }))); eq.splice(0, eq.length, ...novas); }
  // INICIAL=mata|brasa: troca o inicial de Rio do save pela forma da outra linha no mesmo nível (como sim-rival5.mts)
  const ini = process.env.INICIAL, k0 = eq.findIndex((c: { especie: number }) => [7, 8, 9].includes(c.especie));
  if (ini && ini !== 'rio' && k0 >= 0) { const [novo] = instanciar([{ e: formaNoNivel(ini === 'mata' ? 1 : 4, eq[k0].nivel), nv: eq[k0].nivel }]); eq[k0] = novo; }
  if (curado) for (const c of eq) { c.vida = atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; }
  if (process.env.ORDEM === 'rodizio') { eq.sort((a: { nivel: number }, b: { nivel: number }) => b.nivel - a.nivel); const [x] = eq.splice(2, 1); eq.unshift(x); } else if (process.env.ORDEM !== 'save') eq.sort((a: { nivel: number }, b: { nivel: number }) => b.nivel - a.nivel);
  const itens: Record<string, number> = {}; for (const [k, v] of Object.entries(sv.mochila)) if (/garrafada|elixir|cha-|pomada|garapa|mel-puro|unguento/.test(k)) itens[k] = v as number;
  for (const par of (process.env.MAIS ?? '').split(',').filter(Boolean)) { const [k, q] = par.split(':'); itens[k] = (itens[k] ?? 0) + Number(q); }
  let ok = true;
  for (const [k, id] of seq.entries()) {
    const t = d.treinadores.get(id); if (!t) throw new Error('treinador desconhecido: ' + id);
    if (k > 0 && cuida) cuidarEntreLutas(eq, itens);
    const r = lutarContra(eq, itens, inimigosDe(t), t.nome, pilotoEsperto, t.ia ?? 'treinador', { itensIA: itensDoTreinador(t, sv.insignias.length), ganhaExp: true, expPartilhada: process.env.CHOCALHO !== 'nao' && !!sv.mochila['chocalho-mutirao'] });
    if (!r.vitoria) { ok = false; break; }
    passou[k]++;
  }
  if (ok) tudo++;
}
console.log(`${nome} [${sv.equipe.map((c: { especie: number; nivel: number }) => c.especie + ':' + c.nivel).join(' ')}] × ${ids} (${cuida ? 'com' : 'sem'} remédios entre lutas): ` + seq.map((id, k) => `${id} ${(100 * passou[k] / n).toFixed(0)}%`).join(' → ') + ` | sequência ${(100 * tudo / n).toFixed(0)}%`);
