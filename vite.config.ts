import { defineConfig, type Plugin } from 'vite';
/**
 * Catálogo de idiomas (docs/I18N.md): os arquivos src/i18n/en/<área>.json guardam, para quem traduz, `{ en, ctx, obs }`
 * de cada texto. No jogo só interessa o par PT → EN já traduzido: este plugin enxuga o JSON antes de ele virar módulo.
 */
function catalogoEnxuto(): Plugin {
  return {
    name: 'pingo-i18n', enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]src[\\/]i18n[\\/][a-z]{2}[\\/][^\\/]+\.json$/.test(id.split('?')[0])) return null;
      const cat = JSON.parse(code) as Record<string, { en?: string } | string>;
      const par: Record<string, string> = {};
      for (const [k, v] of Object.entries(cat)) { const en = typeof v === 'string' ? v : v.en; if (en) par[k] = en; }
      return { code: JSON.stringify(par), map: null };
    },
  };
}
export default defineConfig({
  base: './',
  plugins: [catalogoEnxuto()],
  build: { target: 'es2022', chunkSizeWarningLimit: 4000, assetsInlineLimit: 0 },
  server: { host: true, port: 5173 },
});
