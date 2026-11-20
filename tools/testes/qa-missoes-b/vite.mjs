// Vite do QA das missões do mapa B: porta fixa 5207, sem HMR nem vigia; mapa B ligado SÓ aqui (progresso.ts não muda no disco)
export default {
  root: '/home/user/adventures-of-pingo', base: './', cacheDir: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qamb/.vite',
  resolve: { alias: { 'node:fs': '/home/user/adventures-of-pingo/tools/testes/qa3/qa3-stub-fs.js' } },
  server: { host: '127.0.0.1', port: 5207, strictPort: true, hmr: false, watch: null },
  plugins: [{
    name: 'qamb-mapa-b-aberto-so-no-teste',
    transform(code, id) { if (id.endsWith('/src/core/progresso.ts')) return code.replace('export const MAPA_B_ABERTO = false;', 'export const MAPA_B_ABERTO = true;'); },
  }],
};
