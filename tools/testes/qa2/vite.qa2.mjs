// Vite do QA do trecho 2 (ginásio 4 → Liga): porta fixa 5195, sem HMR nem vigia de arquivos
export default {
  root: '/home/user/adventures-of-pingo', base: './', cacheDir: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa2/.vite',
  resolve: { alias: { 'node:fs': '/home/user/adventures-of-pingo/tools/testes/qa2/stub-fs.js' } },
  server: { host: true, port: 5195, strictPort: true, hmr: false, watch: null },
};
