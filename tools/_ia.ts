import { carregarDados, inimigosDe, rng } from './equilibrio-referencia';
import { Batalha } from '../src/battle/engine';
import { resolverComIA, AJ, type NivelIA } from '../src/battle/ia';
for (const kv of (process.env.AJ ?? '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); (AJ as any)[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
const d = await carregarDados();
const ids = (process.argv[4] ?? 'liga-1,liga-2,liga-3,liga-4,liga-5,rival-5-brasa,rival-5-rio,rival-5-mata,lider-08,lider-07').split(',');
const [a1, a2] = [process.argv[2] as NivelIA, process.argv[3] as NivelIA];
const N = Number(process.argv[5] ?? 20);
let v = 0, n = 0, emp = 0;
for (const x of ids) for (const y of ids) {
  if (x === y) continue;
  for (let i = 0; i < N; i++) {
    rng.seed(77 + i * 131 + n);
    const tx = d.treinadores.get(x)!, ty = d.treinadores.get(y)!;
    const b = new Batalha({ tipo: 'treinador', lados: [{ equipe: inimigosDe(tx), itens: {}, nome: 'X' }, { equipe: inimigosDe(ty), itens: {}, nome: 'Y' }], trocaGratis: false, ganhaExp: false });
    // metade das vezes a IA 1 fica no lado 0, metade no lado 1
    const inv = i % 2 === 1;
    try { resolverComIA(b, inv ? [a2, a1] : [a1, a2], { maxTurnos: 400 }); } catch { emp++; n++; continue; }
    const ganhou0 = b.resultado === 'vitoria';
    if (ganhou0 !== inv) v++;
    n++;
  }
}
console.log(`${a1} × ${a2}: ${(100 * v / n).toFixed(1)}% de vitórias de ${a1} em ${n} batalhas (${emp} empacadas)`);
