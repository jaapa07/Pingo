/**
 * Rival-5 (Tainá no terreiro, logo depois da Liga) com a equipe REAL de um checkpoint de Campeão, para os três iniciais:
 * o save foi jogado com o inicial de Rio; para Mata e Brasa troca-se só a criatura inicial pela forma final da outra linha,
 * no mesmo nível e com os golpes que um jogador teria. Uso: npx tsx tools/testes/qa2/sim-rival5.mts [save=campeao] [n=300] [curado|como-esta]
 */
import { readFileSync } from 'node:fs';
import { carregarDados, lutarContra, inimigosDe, itensDoTreinador, pilotoEsperto, instanciar, formaNoNivel, rng } from '../../equilibrio-referencia';
import { atributos } from '../../../src/battle/criatura';
const [nome = 'campeao', nArg, estado] = process.argv.slice(2);
const n = Number(nArg ?? 300), curado = estado !== 'como-esta';
const d = await carregarDados();
const sv = JSON.parse(readFileSync(new URL(`./saves/${nome}.json`, import.meta.url), 'utf8'));
const LINHA: Record<string, number> = { rio: 7, mata: 1, brasa: 4 }, DELA: Record<string, string> = { rio: 'mata', mata: 'brasa', brasa: 'rio' };
const out: string[] = [];
for (const ini of ['rio', 'mata', 'brasa']) {
  const t = d.treinadores.get(`rival-5-${DELA[ini]}`)!;
  let v = 0;
  for (let i = 0; i < n; i++) {
    rng.seed(5000 + i * 7919);
    const eq = JSON.parse(JSON.stringify(sv.equipe.filter((c: { ovo?: boolean }) => !c.ovo)));
    const k = eq.findIndex((c: { especie: number }) => [7, 8, 9].includes(c.especie));
    if (ini !== 'rio' && k >= 0) { const [novo] = instanciar([{ e: formaNoNivel(LINHA[ini], eq[k].nivel), nv: eq[k].nivel }]); novo.vida = Math.round(atributos(novo).vida * eq[k].vida / atributos(eq[k]).vida); eq[k] = novo; }
    if (curado) for (const c of eq) { c.vida = atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; }
    eq.sort((a: { nivel: number; vida: number }, b: { nivel: number; vida: number }) => (b.vida > 0 ? b.nivel : -1) - (a.vida > 0 ? a.nivel : -1));
    const itens: Record<string, number> = {}; for (const [id, q] of Object.entries(sv.mochila)) if (/garrafada|elixir|cha-|pomada|garapa|mel-puro|unguento/.test(id)) itens[id] = q as number;
    if (lutarContra(eq, itens, inimigosDe(t), t.nome, pilotoEsperto, t.ia ?? 'treinador', { itensIA: itensDoTreinador(t, 8), ganhaExp: true }).vitoria) v++;
  }
  out.push(`inicial de ${ini} × ${t.id} ${(100 * v / n).toFixed(0)}%`);
}
console.log(`${nome} [${sv.equipe.map((c: { especie: number; nivel: number; vida: number }) => `${c.especie}:${c.nivel}`).join(' ')}] ${curado ? 'curada' : 'como saiu da Liga'}: ${out.join(' · ')}`);
