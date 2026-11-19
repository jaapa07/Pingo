import { carregarDados, equipeReferencia, instanciar, itensReferencia, itensDoTreinador, inimigosDe, lutarContra, INICIAIS, PILOTOS, rng } from './equilibrio-referencia';
import type { NivelIA } from '../src/battle/ia';
const d = await carregarDados();
for (const a of process.argv.slice(2)) { const [id, ps] = a.split(':'); const t = d.treinadores.get(id)!; const passo = Number(ps);
  console.log(id, (['novato', 'treinador', 'lider', 'conselho'] as NivelIA[]).map((nv) => { let v = 0, n = 0; for (const ini of INICIAIS) for (let i = 0; i < 50; i++) { rng.seed(300 + i * 7 + ini); n++; if (!lutarContra(instanciar(equipeReferencia(d, ini, passo)), itensReferencia(passo), inimigosDe(t), t.nome, PILOTOS.esperto, nv, { itensIA: itensDoTreinador(t, 8) }).vitoria) v++; } return nv + ' ' + (100 * v / n).toFixed(0) + '%'; }).join(' · ')); }
