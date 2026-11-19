import { carregarDados, inimigosDe, lutarContra, PILOTOS, rng, instanciar, equipeReferencia, itensReferencia, asDoJogador, itensDoTreinador, type PilotoId } from './equilibrio-referencia';
import { especie, atributos } from '../src/battle/criatura';
import { golpe } from '../src/data/golpes';
import { Batalha } from '../src/battle/engine';
const d = await carregarDados();
const [alvo, passoS, deltaS, pol, iniS, seedS] = process.argv.slice(2);
const passo = Number(passoS), delta = Number(deltaS), ini = Number(iniS ?? 1);
const t = d.treinadores.get(alvo)!;
const ref = equipeReferencia(d, ini, passo, asDoJogador(d, passo) + delta);
let v = 0; const N = 200;
for (let i = 0; i < N; i++) { rng.seed(1000 + i); if (lutarContra(instanciar(ref), itensReferencia(passo), inimigosDe(t), t.nome, PILOTOS[pol as PilotoId], t.ia, { itensIA: itensDoTreinador(t, passo - 1) }).vitoria) v++; }
console.log(alvo, 'vitórias', v / N);
rng.seed(1);
for (const c of instanciar(ref)) console.log(especie(c.especie).nome, especie(c.especie).tipos.join('/'), c.nivel, JSON.stringify(atributos(c)), c.golpes.map((g) => { const x = golpe(g.id); return `${g.id}(${x.tipo} ${x.cat[0]} ${x.poder}/${x.precisao} pg${x.pg}${x.efeitos.map((e) => ' ' + e.t).join('')})`; }).join(', '));
for (const c of inimigosDe(t)) console.log('  ini', especie(c.especie).nome, especie(c.especie).tipos.join('/'), c.nivel, JSON.stringify(atributos(c)), c.golpes.map((g) => { const x = golpe(g.id); return `${g.id}(${x.tipo} ${x.cat[0]} ${x.poder})`; }).join(','));
if (seedS) {
  const orig = Batalha.prototype.executarTurno;
  Batalha.prototype.executarTurno = function (a) { const r = orig.call(this, a); for (const e of r) if (e.t === 'msg') console.log('   ' + e.texto); return r; };
  for (let s = Number(seedS); s < Number(seedS) + 40; s++) { rng.seed(s); const eq = instanciar(ref); const st = rng.estado(); void st; const logs: string[] = []; const cl = console.log; console.log = (x: string) => { logs.push(x); }; const r = lutarContra(eq, itensReferencia(passo), inimigosDe(t), t.nome, PILOTOS[pol as PilotoId], t.ia, { itensIA: itensDoTreinador(t, passo - 1) }); console.log = cl; if (!r.vitoria) { console.log(logs.join('\n')); console.log(r); break; } }
}
