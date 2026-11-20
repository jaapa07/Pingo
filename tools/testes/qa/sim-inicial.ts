/**
 * Vitórias POR INICIAL contra um treinador (motor puro, piloto "esperto"), com a equipe de referência do passo ou com
 * uma equipe dada. `npx tsx tools/testes/qa/sim-inicial.ts <idTreinador|passo> [--n 400] [--equipe 4:10,10:6] [--itens cha-cidreira:3] [--insignias 0]`
 */
import { carregarDados, equipeReferencia, instanciar, itensReferencia, inimigosDe, lutarContra, lider, INICIAIS, NOME_INICIAL, pilotoEsperto, pilotoBobo, rng, itensDoTreinador } from '../../equilibrio-referencia';
import { especie } from '../../../src/battle/criatura';
const arg = (k: string) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : undefined; };
const d = await carregarDados(), alvo = process.argv[2] ?? '1', N = Number(arg('n') ?? 400);
const passo = /^\d+$/.test(alvo) ? Number(alvo) : Number(arg('passo') ?? 1);
const t = /^\d+$/.test(alvo) ? lider(d, passo)! : d.treinadores.get(alvo)!;
if (!t) throw new Error('treinador desconhecido: ' + alvo);
const itens = arg('itens') ? Object.fromEntries(arg('itens')!.split(',').map((x) => { const [id, q] = x.split(':'); return [id, Number(q) || 1]; })) : itensReferencia(passo);
const insignias = Number(arg('insignias') ?? passo - 1);
const equipes: [string, { e: number; nv: number }[]][] = arg('equipe')
  ? [['dada', arg('equipe')!.split(',').map((x) => { const [e, nv] = x.split(':').map(Number); return { e, nv }; })]]
  : INICIAIS.map((ini) => [NOME_INICIAL[ini], equipeReferencia(d, ini, passo)]);
console.log(`${t.id} ${t.nome}: ${t.equipe.map((m) => `${especie(m.e).nome} ${m.nv}`).join(', ')} · itens do jogador ${JSON.stringify(itens)} · N=${N}`);
for (const [nome, eq] of equipes) {
  const r: Record<string, number> = {};
  for (const [pn, pil] of [['esperto', pilotoEsperto], ['bobo', pilotoBobo]] as const) {
    let v = 0;
    for (let i = 0; i < N; i++) { rng.seed(1000 + i * 7919 + nome.length * 31 + pn.length); if (lutarContra(instanciar(eq), { ...itens }, inimigosDe(t), t.nome, pil, t.ia, { itensIA: itensDoTreinador(t, insignias) }).vitoria) v++; }
    r[pn] = Math.round((100 * v) / N);
  }
  console.log(`  ${nome.padEnd(6)} esperto ${String(r.esperto).padStart(3)}%  bobo ${String(r.bobo).padStart(3)}%  · ${eq.map((m) => `${especie(m.e).nome} ${m.nv}`).join(', ')}`);
}
