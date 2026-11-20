// Vite do QA jogado (porta 5194, sem HMR: outros agentes editam o repositório durante a partida)
import { fileURLToPath } from 'node:url';
const aqui = fileURLToPath(new URL('.', import.meta.url));
export default {
  root: fileURLToPath(new URL('../../..', import.meta.url)), base: './',
  cacheDir: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa1/.vite',
  resolve: { alias: { 'node:fs': aqui + 'stub-fs.mjs' } },
  server: { host: true, port: 5194, strictPort: true, hmr: false, watch: null },
};
