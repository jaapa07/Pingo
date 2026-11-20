import { defineConfig } from '/home/user/adventures-of-pingo/node_modules/vite/dist/node/index.js';
export default defineConfig({
  root: '/home/user/adventures-of-pingo',
  base: './',
  logLevel: 'warn',
  server: { port: 5201, strictPort: true, hmr: false, watch: null },
  plugins: [{
    name: 'mapa-b-aberto-so-no-teste',
    transform(code, id) { if (id.endsWith('/src/core/progresso.ts')) return code.replace('export const MAPA_B_ABERTO = false;', 'export const MAPA_B_ABERTO = true;'); },
  }],
});
