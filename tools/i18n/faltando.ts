/**
 * `npm run i18n:faltando`: relatório do catálogo EN (docs/I18N.md). Sai com erro se houver ERRO (marcadores, glifos, cores
 * abertas); entradas sem tradução são só contadas.
 * Opções: `--area=ui` (uma área) · `--lista` (mostra as entradas sem tradução) · `--largura` (lista os textos mais largos
 * que o PT) · `--avisos` (mostra todos os avisos).
 */
import { checarCatalogo } from './checar';

process.stdout.on('error', () => undefined); // saída cortada por head/tail não interrompe a gravação
const args = process.argv.slice(2);
const AREA = args.find((a) => a.startsWith('--area='))?.slice(7);
const LISTA = args.includes('--lista'), LARG = args.includes('--largura'), AV = args.includes('--avisos');
const r = checarCatalogo();
const filtra = <T extends { area: string }>(l: T[]) => (AREA ? l.filter((x) => x.area === AREA) : l);
const curto = (s: string, n = 90) => JSON.stringify(s.length > n ? s.slice(0, n) + '…' : s);

console.log('Catálogo EN — src/i18n/en/\n');
console.log('área            entradas  traduzidas  faltam   palavras (faltam)');
let tE = 0, tT = 0, tP = 0, tPF = 0;
for (const a of r.porArea) {
  if (AREA && a.area !== AREA) continue;
  tE += a.entradas; tT += a.traduzidas; tP += a.palavras; tPF += a.palavrasFaltam;
  const pct = a.entradas ? Math.floor((100 * a.traduzidas) / a.entradas) : 100;
  console.log(`${(a.area + '.json').padEnd(15)} ${String(a.entradas).padStart(8)}  ${String(a.traduzidas).padStart(6)} ${String(pct).padStart(3)}%  ${String(a.faltam).padStart(6)}   ${String(a.palavras).padStart(7)} (${a.palavrasFaltam})`);
}
console.log(`${'total'.padEnd(15)} ${String(tE).padStart(8)}  ${String(tT).padStart(6)} ${String(tE ? Math.floor((100 * tT) / tE) : 100).padStart(3)}%  ${String(tE - tT).padStart(6)}   ${String(tP).padStart(7)} (${tPF})`);

const erros = filtra(r.erros);
console.log(`\nERROS: ${erros.length}`);
for (const e of erros) console.log(`  ✗ [${e.area}] ${curto(e.pt)} → ${curto(e.en)}: ${e.motivo}  (${e.ctx})`);
const largos = filtra(r.largos);
console.log(`\nTextos mais largos que o PT (podem estourar caixas de tamanho fixo): ${largos.length}`);
for (const e of LARG ? largos : largos.slice(0, 10)) console.log(`  ! [${e.area}] ${e.motivo}  ${curto(e.pt, 50)} → ${curto(e.en, 50)}  (${e.ctx.split(' | ')[0]})`);
if (!LARG && largos.length > 10) console.log(`  … use --largura para ver todos`);
const avisos = filtra(r.avisos);
console.log(`\nOutros avisos: ${avisos.length}`);
for (const e of AV ? avisos : avisos.slice(0, 10)) console.log(`  ! [${e.area}] ${curto(e.pt, 60)}: ${e.motivo}`);
if (!AV && avisos.length > 10) console.log(`  … use --avisos para ver todos`);
if (r.montagens.length) {
  console.log(`\nFrases montadas no código fora de tr() (não seriam traduzidas): ${r.montagens.length} — src/i18n/en/_montagens.txt`);
}
if (LISTA) {
  const f = filtra(r.faltando);
  console.log(`\nSem tradução: ${f.length}`);
  for (const e of f) console.log(`  [${e.area}] ${curto(e.pt, 120)}  (${e.ctx.split(' | ')[0]})`);
}
process.exit(erros.length ? 1 : 0);
