// Vite do time B2-norte para os roteiros jogados: porta 5199, sem HMR nem vigia; MAPA_B_ABERTO ligado SÓ aqui (em memória)
export default {
  root: '/home/user/adventures-of-pingo', base: './', cacheDir: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/b2n/.vite',
  server: { host: true, port: 5199, strictPort: true, hmr: false, watch: null },
  plugins: [{ name: 'mapa-b-aberto', enforce: 'pre', transform(code, id) { if (id.endsWith('/src/core/progresso.ts')) return code.replace('export const MAPA_B_ABERTO = false', 'export const MAPA_B_ABERTO = true'); } }],
};
