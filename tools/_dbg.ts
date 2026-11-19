import { carregarDados, inimigosDe, lutarContra, pilotoBobo, pilotoEsperto, rng, instanciar, equipeReferencia, itensReferencia } from './equilibrio-referencia';
import { criarCriatura, especie, atributos } from '../src/battle/criatura';
import { golpe } from '../src/data/golpes';
import { Batalha } from '../src/battle/engine';
const d = await carregarDados();
const alvo = process.argv[2] ?? 'liga-3', nums = (process.argv[3] ?? '3,6,9').split(',').map(Number), nv = Number(process.argv[4] ?? 62), pol = process.argv[5] === 'esperto' ? pilotoEsperto : pilotoBobo;
const t = d.treinadores.get(alvo)!;
let v = 0; const N = 200; let turnos = 0;
for (let i = 0; i < N; i++) { rng.seed(1000 + i); const eq = nums.map((n) => criarCriatura(n, nv)); const r = lutarContra(eq, {}, inimigosDe(t), t.nome, pol, t.ia, {}); if (r.vitoria) v++; turnos += r.turnos; }
console.log(alvo, nums, nv, 'vitórias', v / N, 'turnos médios', turnos / N);
rng.seed(1003);
const eq = nums.map((n) => criarCriatura(n, nv));
for (const c of eq) console.log(especie(c.especie).nome, c.nivel, JSON.stringify(atributos(c)), c.golpes.map((g) => { const x = golpe(g.id); return `${g.id}(${x.tipo} ${x.cat} ${x.poder}/${x.precisao} pg${x.pg}${x.efeitos.map((e) => ' ' + e.t).join('')})`; }).join(', '));
const ini = inimigosDe(t);
for (const c of ini) console.log('  ini', especie(c.especie).nome, especie(c.especie).tipos.join('/'), c.nivel, JSON.stringify(atributos(c)), c.golpes.map((g) => g.id).join(','));
if (process.argv[6]) {
  const orig = Batalha.prototype.executarTurno;
  Batalha.prototype.executarTurno = function (a) { const r = orig.call(this, a); for (const e of r) if (e.t === 'msg') console.log('   ' + e.texto); return r; };
  rng.seed(Number(process.argv[6])); const eq2 = nums.map((n) => criarCriatura(n, nv)); console.log(lutarContra(eq2, {}, inimigosDe(t), t.nome, pol, t.ia, {}));
}
