/**
 * Carga do catálogo EN (docs/I18N.md): só acontece se o idioma escolhido for inglês. Cada área do catálogo
 * (src/i18n/en/<área>.json) vira um pedaço de JS próprio no build (o plugin `pingo-i18n` de vite.config.ts deixa nele só
 * os pares PT → EN já traduzidos). Os pedaços ficam em `assets/`, então o Service Worker (tools/build-sw.ts) e os
 * pacotes do itch/PC/Android os levam junto, e o jogo em inglês funciona offline.
 */
import { definirIdioma, instalarCatalogo, type Idioma } from './index';

const AREAS = import.meta.glob<Record<string, string>>('./en/[!_]*.json', { import: 'default' });
let carregado: Promise<void> | null = null;

/** baixa (uma vez) todas as áreas do catálogo EN; uma área que falhar só deixa os textos dela em português */
function carregarIngles(): Promise<void> {
  return (carregado ??= Promise.all(Object.entries(AREAS).map(async ([nome, f]) => {
    try { instalarCatalogo(await f()); } catch (e) { console.warn('[i18n] não carregou', nome, e); }
  })).then(() => undefined));
}
/** define o idioma do jogo; em inglês espera o catálogo chegar */
export async function aplicarIdioma(i: Idioma): Promise<void> {
  if (i === 'en') await carregarIngles();
  definirIdioma(i);
  document.documentElement.lang = i === 'en' ? 'en' : 'pt-BR';
}
