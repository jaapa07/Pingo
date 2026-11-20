// Vite do QA do pós-Liga (mapa A): porta fixa 5208, sem HMR nem vigia de arquivos (reinicie depois de editar o jogo)
export default {
  root: '/home/user/adventures-of-pingo', base: './', cacheDir: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/posliga/.vite',
  resolve: { alias: { 'node:fs': '/home/user/adventures-of-pingo/tools/testes/qa2/stub-fs.js' } },
  server: { host: true, port: 5208, strictPort: true, hmr: false, watch: null },
};
