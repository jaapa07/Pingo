import { carregarDados, equipeReferencia, instanciar, itensReferencia, itensDoTreinador, inimigosDe, lutarContra, cuidarEntreLutas, asDoJogador, INICIAIS, PILOTOS, IDS_LIGA, rng, type PilotoId } from './equilibrio-referencia';
const d = await carregarDados(); const N = Number(process.env.N ?? 120);
for (const pol of (process.argv[2] ?? 'esperto,bobo').split(',') as PilotoId[]) {
  const venceu = [0, 0, 0, 0, 0]; let tot = 0; const porIni: number[] = [];
  for (const ini of INICIAIS) { let c = 0; for (let i = 0; i < N / 3; i++) { tot++; rng.seed(9000 + i * 13 + ini);
    const eq = instanciar(equipeReferencia(d, ini, 9, asDoJogador(d, 9) + Number(process.env.DELTA ?? 0))), it = itensReferencia(9); let ok = true;
    for (let k = 0; k < 5 && ok; k++) { const t = d.treinadores.get(IDS_LIGA[k])!; if (k) cuidarEntreLutas(eq, it); ok = lutarContra(eq, it, inimigosDe(t), t.nome, PILOTOS[pol], t.ia, { itensIA: itensDoTreinador(t, 8), ganhaExp: true }).vitoria; if (ok) venceu[k]++; }
    if (ok) c++; } porIni.push(c / (N / 3)); }
  console.log(pol, venceu.map((x) => (100 * x / tot).toFixed(0) + '%').join(' → '), '| por inicial', porIni.map((x) => (100 * x).toFixed(0)).join('/'));
}
