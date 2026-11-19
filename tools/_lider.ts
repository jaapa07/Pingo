import { carregarDados, equipeReferencia, instanciar, itensReferencia, itensDoTreinador, inimigosDe, lutarContra, asDoJogador, INICIAIS, PILOTOS, rng, type PilotoId } from './equilibrio-referencia';
import { especie } from '../src/battle/criatura';
const d = await carregarDados();
const N = Number(process.env.N ?? 150);
for (const a of process.argv.slice(2)) {
  const [id, passoS] = a.split(':'); const t = d.treinadores.get(id)!; const passo = passoS ? Number(passoS) : (t.insignia ?? 9);
  const linha: string[] = [];
  for (const pol of ['esperto', 'bobo', 'ia'] as PilotoId[]) {
    const por = INICIAIS.map((ini) => { let v = 0; for (let i = 0; i < N / 3; i++) { rng.seed(5000 + i * 17 + ini); if (lutarContra(instanciar(equipeReferencia(d, ini, passo)), itensReferencia(passo), inimigosDe(t), t.nome, PILOTOS[pol], t.ia, { itensIA: itensDoTreinador(t, passo - 1) }).vitoria) v++; } return v / (N / 3); });
    linha.push(`${pol} ${(100 * por.reduce((x, y) => x + y) / 3).toFixed(0)}% (${por.map((x) => (100 * x).toFixed(0)).join('/')})`);
  }
  console.log(`${id} [${t.equipe.map((m) => especie(m.e).nome + m.nv).join(' ')}] vs ás ${asDoJogador(d, passo)}: ${linha.join(' · ')}`);
}
