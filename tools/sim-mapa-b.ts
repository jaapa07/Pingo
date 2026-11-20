/**
 * SIMULADOR DO MAPA B (docs/EQUILIBRIO-MAPA-B.md): líderes 9–16, chefes do Pico e o Conselho (5 lutas seguidas).
 *
 * Duas equipes do jogador, ambas com o ás Δ níveis abaixo do ás do chefe (spec 4.5: chegar 2 a 4 abaixo):
 *  - `ref`: a equipe de referência da Liga (tools/equilibrio-referencia.ts, capturas do mapa A, média dos 3 iniciais);
 *  - `qa`:  a equipe real do QA do mapa B (Iaraboto, Gaviãozão, Cotiadã, Pintinhas, Tatucanastra, Vampirinha), na forma
 *           que teria no nível, as outras 1–2 níveis abaixo do ás.
 * Piloto esperto; líder com 6 Garrafadas + 2 Elixires; Conselho com a mochila cheia da Liga, sem cura grátis entre as
 * lutas e ganhando experiência (com o Chocalho). Acaso só pelo `rng` (sementes fixas).
 *
 * Uso: npx tsx tools/sim-mapa-b.ts [--n 150] [--d 2,3,4] [--so lider-10,conselho] [--equipe ref|qa|ambas]
 */
import { carregarDados, equipeReferencia, instanciar, itensDoTreinador, inimigosDe, lutarContra, cuidarEntreLutas, itensReferencia, INICIAIS, PASSO_LIGA, PILOTOS, rng, asDe } from './equilibrio-referencia';
import type { CriaturaInst, TreinadorDef } from '../src/core/tipos';

const arg = (k: string) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('n') ?? 150), DELTAS = (arg('d') ?? '2,3,4').split(',').map(Number), SO = arg('so')?.split(','), EQUIPE = arg('equipe') ?? 'ambas';
const d = await carregarDados();
const semente = (t: string, i: number) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) + i * 7919) >>> 0 || 1; };

/** espécies da equipe do QA (todas já na forma final no nível 45+) e a distância de cada uma ao ás */
const QA = [[9, 0], [12, 1], [14, 1], [27, 1], [34, 2], [32, 2]] as const;
function equipe(tipo: 'ref' | 'qa', ini: number, as: number): CriaturaInst[] {
  if (tipo === 'qa') return instanciar(QA.map(([e, k]) => ({ e, nv: as - k })));
  return instanciar(equipeReferencia(d, ini, PASSO_LIGA, as));
}
const t = (id: string) => { const x = d.treinadores.get(id); if (!x) throw new Error('treinador desconhecido: ' + id); return x; };
const tipos = EQUIPE === 'ambas' ? (['ref', 'qa'] as const) : ([EQUIPE] as unknown as readonly ('ref' | 'qa')[]);

/** taxa de vitória numa sequência de lutas (1 = luta isolada) */
function taxa(seq: TreinadorDef[], tipo: 'ref' | 'qa', dl: number, itens: () => Record<string, number>): number[] {
  const as = Math.max(...seq.map(asDe)) - dl, passou = seq.map(() => 0);
  const inis = tipo === 'qa' ? [7] : INICIAIS, porIni = Math.ceil(N / inis.length);
  for (const ini of inis) for (let i = 0; i < porIni; i++) {
    rng.seed(semente(`mb|${seq.map((x) => x.id).join('+')}|${tipo}|${ini}|${dl}`, i));
    const eq = equipe(tipo, ini, as), it = itens();
    for (const [k, x] of seq.entries()) {
      if (k > 0) cuidarEntreLutas(eq, it);
      const r = lutarContra(eq, it, inimigosDe(x), x.nome, PILOTOS.esperto, x.ia ?? 'treinador', { itensIA: itensDoTreinador(x, 15), ganhaExp: seq.length > 1, expPartilhada: seq.length > 1, limiarPartilha: 5 });
      if (!r.vitoria) break;
      passou[k]++;
    }
  }
  return passou.map((v) => Math.round((100 * v) / (porIni * inis.length)));
}

const LIDER = () => ({ garrafada: 6, 'elixir-andiroba': 2 });
const quer = (id: string) => !SO || SO.includes(id);
console.log(`N = ${N} por célula · piloto esperto · Δ = ás do chefe − ás do jogador`);
console.log(`| Chefe | Ás | ${tipos.flatMap((q) => DELTAS.map((x) => `${q} Δ${x}`)).join(' | ')} |`);
console.log(`|---|---|${tipos.flatMap(() => DELTAS.map(() => '---')).join('|')}|`);
for (let n = 9; n <= 16; n++) {
  const id = `lider-${String(n).padStart(2, '0')}`; if (!quer(id)) continue;
  const x = t(id);
  console.log(`| ${n} ${x.nome} | ${asDe(x)} | ${tipos.flatMap((q) => DELTAS.map((dl) => taxa([x], q, dl, LIDER)[0] + '%')).join(' | ')} |`);
}
for (const id of ['garrote', 'rival-8-rio']) if (quer(id)) { const x = t(id); console.log(`| ${x.nome} (${id}) | ${asDe(x)} | ${tipos.flatMap((q) => DELTAS.map((dl) => taxa([x], q, dl, LIDER)[0] + '%')).join(' | ')} |`); }
if (quer('conselho')) {
  const seq = [1, 2, 3, 4, 5].map((k) => t('conselho-' + k));
  console.log('\nConselho, 5 lutas seguidas, mochila da Liga (15 Garrafadas, 10 Elixires, 6 Chás, 4 Pomadas, 6 Garapas), sem cura grátis:');
  for (const q of tipos) for (const dl of DELTAS) { const r = taxa(seq, q, dl, () => itensReferencia(PASSO_LIGA)); console.log(`  ${q} Δ${dl} (ás ${Math.max(...seq.map(asDe)) - dl}): ` + r.map((v, k) => `passou da ${k + 1}ª ${v}%`).join(' · ') + ` → sequência ${r[4]}%`); }
}
