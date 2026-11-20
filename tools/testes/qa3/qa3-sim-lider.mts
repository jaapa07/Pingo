/** mede líderes/treinadores 9–12 com a base do simulador (tools/equilibrio-referencia.ts) */
import { carregarDados, equipeReferencia, instanciar, itensDoTreinador, inimigosDe, lutarContra, INICIAIS, PASSO_LIGA, PILOTOS, rng, asDe } from '/home/user/adventures-of-pingo/tools/equilibrio-referencia';
import { especie } from '/home/user/adventures-of-pingo/src/battle/criatura';
const d = await carregarDados();
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const N = Number(process.argv.find((a) => a.startsWith('--n='))?.slice(4) ?? 150);
const deltas = (process.argv.find((a) => a.startsWith('--d='))?.slice(4) ?? '2,3,4').split(',').map(Number);
const semente = (t: string, i: number) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) + i * 7919) >>> 0 || 1; };
const ITENS = { garrafada: 6, 'elixir-andiroba': 2 };
if (process.argv.includes('--eq')) for (const ini of INICIAIS) console.log(equipeReferencia(d, ini, PASSO_LIGA, 46).map((m) => `${especie(m.e).nome} ${m.nv}`).join(', '));
for (const id of ids) {
  const t = d.treinadores.get(id); if (!t) { console.log('sem', id); continue; }
  const as = asDe(t), lider = t.ia === 'lider';
  const linha: string[] = [];
  for (const piloto of ['esperto', 'bobo'] as const) {
    for (const dl of (lider ? deltas : [Number(process.argv.find((a) => a.startsWith('--rd='))?.slice(5) ?? -1)])) {
      let v = 0, n = 0;
      for (const ini of INICIAIS) for (let i = 0; i < Math.ceil(N / 3); i++) {
        rng.seed(semente(`b|${id}|${ini}|${piloto}|${dl}`, i));
        const eq = equipeReferencia(d, ini, PASSO_LIGA, as - dl);
        const r = lutarContra(instanciar(eq), lider ? { ...ITENS } : { garrafada: 2 }, inimigosDe(t), t.nome, PILOTOS[piloto], t.ia, { itensIA: itensDoTreinador(t, 9) });
        n++; if (r.vitoria) v++;
      }
      linha.push(`${piloto}-${dl}: ${(100 * v / n).toFixed(0)}%`);
    }
  }
  console.log(`${id} (ás ${as}) ${linha.join(' · ')}`);
}
