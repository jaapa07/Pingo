/**
 * `npx tsx tools/i18n/aplicar.ts`: grava traduções no catálogo EN (src/i18n/en/*.json) a partir de um arquivo de pares,
 * sem editar o JSON à mão (docs/I18N.md, "Como traduzir").
 *
 * 1) Listar o que falta, com um id curto por entrada (8 hex do sha1 do texto PT):
 *      npx tsx tools/i18n/aplicar.ts --pendentes=src/data/treinadores/a1.ts [--area=eventos-a] [--todas]
 *    Imprime blocos "@id  ctx" + "PT" (com \n e \f escritos como \n e \f). `--todas` inclui as já traduzidas
 *    (e mostra o EN atual), útil para revisar. O filtro casa com qualquer trecho do `ctx`.
 * 2) Escrever um arquivo de pares, uma tradução por linha (linhas vazias e as que começam com "#" são ignoradas):
 *      @1a2b3c4d => Hello, {JOGADOR}!\fNice to meet you.
 *      Texto PT exato => English text
 *    `\n` e `\f` escritos como barra + letra viram a quebra/caixa nova. O lado esquerdo é o id ou o texto PT exato.
 * 3) Aplicar:   npx tsx tools/i18n/aplicar.ts pares.txt [--forcar] [--seco]
 *    Confere marcadores ({x}, {JOGADOR}…), glifos da fonte e {c:…}{/c}; recusa a linha com problema e segue. Só
 *    preenche entradas vazias, a não ser com `--forcar` (sobrescreve). `--seco` só confere.
 * Depois rode `npm run i18n:faltando` (avisos de largura/caixas) e `npm run check -- --rapido`.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { AREAS, fechaCores, gravarArea, lerArea, semGlifo, type Area, type Catalogo } from './comum';
import { marcadoresBatem } from './checar';

process.stdout.on('error', () => undefined);
const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
export const idDe = (pt: string) => createHash('sha1').update(pt).digest('hex').slice(0, 8);
const escapar = (s: string) => s.replace(/\n/g, '\\n').replace(/\f/g, '\\f');
const desescapar = (s: string) => s.replace(/\\n/g, '\n').replace(/\\f/g, '\f');

const cats = new Map<Area, Catalogo>();
for (const a of AREAS) cats.set(a, lerArea(a));

const PEND = opt('pendentes');
if (PEND !== undefined) {
  const AREA = opt('area'), TODAS = args.includes('--todas');
  let n = 0;
  for (const [area, cat] of cats) {
    if (AREA && area !== AREA) continue;
    for (const [pt, v] of Object.entries(cat)) {
      if (!TODAS && v.en) continue;
      if (PEND && !v.ctx.includes(PEND)) continue;
      n++;
      console.log(`@${idDe(pt)}  ${v.ctx.split(' | ')[0]}${v.obs ? `  (obs: ${v.obs})` : ''}\n${escapar(pt)}${TODAS && v.en ? `\n= ${escapar(v.en)}` : ''}\n`);
    }
  }
  console.log(`# ${n} entrada(s)`);
  process.exit(0);
}

const arqs = args.filter((a) => !a.startsWith('--'));
if (!arqs.length) { console.error('uso: aplicar.ts pares.txt [--forcar] [--seco]  |  aplicar.ts --pendentes=<trecho do ctx>'); process.exit(2); }
const FORCAR = args.includes('--forcar'), SECO = args.includes('--seco');

const porId = new Map<string, [Area, string][]>(), porPt = new Map<string, Area>();
for (const [area, cat] of cats) for (const pt of Object.keys(cat)) {
  porPt.set(pt, area);
  const id = idDe(pt); porId.set(id, [...(porId.get(id) ?? []), [area, pt]]);
}

let ok = 0, ja = 0, ruins = 0;
const mudou = new Set<Area>();
for (const arq of arqs) {
  readFileSync(arq, 'utf8').split('\n').forEach((linha, i) => {
    if (!linha.trim() || linha.startsWith('#')) return;
    const onde = `${arq}:${i + 1}`;
    const k = linha.indexOf(' => ');
    if (k < 0) { console.log(`✗ ${onde}: falta " => "`); ruins++; return; }
    const esq = linha.slice(0, k).trim(), en = desescapar(linha.slice(k + 4).trim());
    let area: Area | undefined, pt: string;
    if (/^@[0-9a-f]{8}$/.test(esq)) {
      const l = porId.get(esq.slice(1)) ?? [];
      if (l.length !== 1) { console.log(`✗ ${onde}: id ${esq} ${l.length ? 'ambíguo (use o texto PT)' : 'não existe'}`); ruins++; return; }
      [area, pt] = l[0];
    } else { pt = desescapar(esq); area = porPt.get(pt); }
    if (!area) { console.log(`✗ ${onde}: texto PT não está no catálogo: ${JSON.stringify(pt.slice(0, 60))}`); ruins++; return; }
    if (!en) { console.log(`✗ ${onde}: tradução vazia`); ruins++; return; }
    const prob = [marcadoresBatem(pt, en), semGlifo(en).length ? `sem glifo: ${semGlifo(en).join(' ')}` : '', fechaCores(en) ? '' : '{c:…} sem {/c}',
      (pt.match(/\f/g) ?? []).length !== (en.match(/\f/g) ?? []).length ? 'número de \\f diferente' : ''].filter(Boolean);
    if (prob.length) { console.log(`✗ ${onde}: ${prob.join('; ')}  ${JSON.stringify(pt.slice(0, 50))}`); ruins++; return; }
    const e = cats.get(area)![pt];
    if (e.en && !FORCAR) { if (e.en !== en) ja++; return; }
    e.en = en; ok++; mudou.add(area);
  });
}
if (!SECO) for (const a of mudou) gravarArea(a, cats.get(a)!);
console.log(`${SECO ? '(seco) ' : ''}${ok} gravada(s) · ${ja} já tinham outra tradução (use --forcar) · ${ruins} com problema`);
process.exit(ruins ? 1 : 0);
