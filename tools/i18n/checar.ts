/**
 * Conferência do catálogo EN (docs/I18N.md), usada por `npm run i18n:faltando` e pela checagem "i18n" de `npm run check`.
 *  - ERRO: marcadores `{x}` diferentes entre PT e EN (o EN pode deixar de fora só os gramaticais `{art…}`), caractere
 *    sem glifo na fonte bitmap, `{c:…}` sem `{/c}`, JSON ilegível, o mesmo texto em duas áreas;
 *  - AVISO (por enquanto): entradas sem tradução, cores diferentes, texto em inglês mais largo que o PT (pode estourar
 *    uma caixa de tamanho fixo) e fala que passa a ocupar mais caixas.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AREAS, PASTA_EN, arquivoDaArea, coresDe, fechaCores, largura, paginasDeFala, palavras, semGlifo, type Area, type Catalogo } from './comum';

export interface Problema { area: Area; pt: string; en: string; ctx: string; motivo: string }
export interface ResultadoI18n {
  porArea: { area: Area; entradas: number; palavras: number; traduzidas: number; faltam: number; palavrasFaltam: number }[];
  erros: Problema[]; largos: (Problema & { px: number })[]; avisos: Problema[]; faltando: Problema[]; montagens: string[];
}

const marcas = (s: string) => [...s.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((x) => x[1]);
/** compara os marcadores: o EN tem de ter os mesmos do PT (os `{art…}` gramaticais podem faltar) e nenhum a mais */
export function marcadoresBatem(pt: string, en: string): string | null {
  const a = marcas(pt), b = marcas(en);
  const sobra = [...new Set(b)].filter((x) => !a.includes(x)), falta = [...new Set(a)].filter((x) => !b.includes(x) && !/^art/.test(x));
  if (!sobra.length && !falta.length) return null;
  return [falta.length ? `falta ${falta.map((x) => `{${x}}`).join(' ')}` : '', sobra.length ? `sobra ${sobra.map((x) => `{${x}}`).join(' ')}` : ''].filter(Boolean).join('; ');
}

export function checarCatalogo(): ResultadoI18n {
  const r: ResultadoI18n = { porArea: [], erros: [], largos: [], avisos: [], faltando: [], montagens: [] };
  const onde = new Map<string, Area>();
  for (const area of AREAS) {
    const arq = arquivoDaArea(area);
    if (!existsSync(arq)) { r.erros.push({ area, pt: '', en: '', ctx: '', motivo: `${arq} não existe (rode npm run i18n:extrair)` }); continue; }
    let cat: Catalogo;
    try { cat = JSON.parse(readFileSync(arq, 'utf8')) as Catalogo; } catch (e) { r.erros.push({ area, pt: '', en: '', ctx: '', motivo: `JSON ilegível: ${(e as Error).message}` }); continue; }
    let pal = 0, trad = 0, palF = 0;
    for (const [pt, v] of Object.entries(cat)) {
      const en = v?.en ?? '', ctx = v?.ctx ?? '', p = palavras(pt);
      pal += p;
      const outra = onde.get(pt); if (outra) r.erros.push({ area, pt, en, ctx, motivo: `o mesmo texto também está em ${outra}.json` }); else onde.set(pt, area);
      if (!en) { palF += p; r.faltando.push({ area, pt, en, ctx, motivo: 'sem tradução' }); continue; }
      trad++;
      const m = marcadoresBatem(pt, en); if (m) r.erros.push({ area, pt, en, ctx, motivo: `marcadores diferentes: ${m}` });
      const g = semGlifo(en); if (g.length) r.erros.push({ area, pt, en, ctx, motivo: `caractere sem glifo na fonte do jogo: ${g.map((c) => JSON.stringify(c)).join(' ')}` });
      if (!fechaCores(en)) r.erros.push({ area, pt, en, ctx, motivo: '{c:…} sem o {/c} correspondente' });
      else if (coresDe(pt) !== coresDe(en)) r.avisos.push({ area, pt, en, ctx, motivo: `cores diferentes do PT (${coresDe(pt) || 'nenhuma'} × ${coresDe(en) || 'nenhuma'})` });
      // largura: só para rótulos de uma linha (as falas quebram e paginam sozinhas)
      const umaLinha = !/[\n\f]/.test(pt) && largura(pt, 8) <= 180;
      if (umaLinha) { const d = largura(en, 8) - largura(pt, 8); if (d > 0) r.largos.push({ area, pt, en, ctx, motivo: `+${d} px`, px: d }); }
      else if (/[\n\f]/.test(pt) || largura(pt, 12) > 280) { const a = paginasDeFala(pt), b = paginasDeFala(en); if (b > a) r.avisos.push({ area, pt, en, ctx, motivo: `fala ocupa ${b} caixa(s) em inglês (${a} em português)` }); }
    }
    r.porArea.push({ area, entradas: Object.keys(cat).length, palavras: pal, traduzidas: trad, faltam: Object.keys(cat).length - trad, palavrasFaltam: palF });
  }
  const mont = join(PASTA_EN, '_montagens.txt');
  if (existsSync(mont)) r.montagens = readFileSync(mont, 'utf8').split('\n').filter(Boolean);
  r.largos.sort((a, b) => b.px - a.px);
  return r;
}
