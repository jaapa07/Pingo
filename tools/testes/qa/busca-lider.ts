/** Busca de equipe de líder: testa combinações e lista as que deixam os três iniciais na faixa. `npx tsx tools/testes/qa/busca-lider.ts <passo> <arquivo-de-candidatos.json> [--n 150] [--min 45] [--max 75]` */
import { readFileSync } from 'node:fs';
import { carregarDados, formaNoNivel, equipeReferencia, instanciar, itensReferencia, lutarContra, INICIAIS, NOME_INICIAL, pilotoEsperto, rng } from '../../equilibrio-referencia';
import { criarDeMembro } from '../../../src/battle/criatura';
const arg = (k: string, d: string) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const passo = Number(process.argv[2]), N = Number(arg('n', '150')), MIN = Number(arg('min', '45')), MAX = Number(arg('max', '75'));
const cands: string[] = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const d = await carregarDados();
// --equipe "X:10,10:5,13:4" troca a equipe de referência por uma equipe "honesta" (X = o inicial, na forma do nível)
const dada = arg('equipe', '');
const eqs = INICIAIS.map((ini) => dada ? dada.split(',').map((x) => { const [e, nv] = x.split(':'); return e === 'X' ? { e: formaNoNivel(ini, Number(nv)), nv: Number(nv) } : { e: Number(e), nv: Number(nv) }; }) : equipeReferencia(d, ini, passo));
const itens = arg('itens', '') ? Object.fromEntries(arg('itens', '').split(',').map((x) => { const [id, q] = x.split(':'); return [id, Number(q)]; })) : itensReferencia(passo);
const linhas: [number, string][] = [];
for (const c of cands) {
  const equipe = c.split(',').map((x) => { const [e, nv, ...g] = x.split(':'); return { e: Number(e), nv: Number(nv), ...(g.length ? { golpes: g } : {}) }; });
  const r = eqs.map((eq, k) => { let v = 0; for (let i = 0; i < N; i++) { rng.seed(1000 + i * 7919 + k * 31); if (lutarContra(instanciar(eq), { ...itens }, equipe.map((m) => criarDeMembro(m as never, 'L')), 'L', pilotoEsperto, 'lider', {}).vitoria) v++; } return Math.round((100 * v) / N); });
  const fora = r.reduce((a, x) => a + Math.max(0, MIN - x, x - MAX), 0);
  linhas.push([fora, `${r.map((x, k) => NOME_INICIAL[INICIAIS[k]] + ' ' + String(x).padStart(3)).join('  ')}  fora ${String(fora).padStart(3)}  ${c}`]);
}
linhas.sort((a, b) => a[0] - b[0]);
console.log(linhas.slice(0, Number(arg('top', '25'))).map((l) => l[1]).join('\n'));
