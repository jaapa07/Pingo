# QA-MAPA-B-2 — jogo honesto do mapa B INTEIRO com a curva nova (Platô → … → Conselho → créditos), Aventureiro

Diário vivo do QA (o contêiner pode reiniciar: retomar daqui).
Curva medida: líderes 9–16 = 55/58/61/63/66/68/70/72, Garrote 74, rival 8 75, Conselho 73–77; Chocalho só puxa
quem está 5+ atrás depois da Liga; `FATOR_EXP_POS_LIGA = 0.55`. Estimativa (tools/estima-chegada-b.ts --fator-exp 0.55):
−2 no líder 9, 0 nos 10–12, +2 nos 13–15, +3 no 16, 0 no Conselho.

Ferramentas em `tools/testes/qa4/` (cópia do QA 3 com nomes `qa4-*`):
- `qa4-run.sh <roteiro> <seg> [args]`: Vite próprio em **5209** (`--strictPort`, sem HMR/vigia) com o plugin `qa4-vite.mjs`
  que liga `MAPA_B_ABERTO` SÓ em memória; `qa4-run.sh parar` desliga o Vite que ele ligou (PID em scratchpad/qa4/vite.pid).
- `qa4-lib.mjs` + `qa4-piloto.js`: piloto que joga pelo teclado NA TELA (política esperta de tools/equilibrio-referencia.ts).
- `qa4-jogar.mjs <etapa> [etapa-final]`, `qa4-ginasios.mjs` (roteiros dos ginásios).
- Checkpoints em `tools/testes/qa4/saves/` (partida `campeao.json` = checkpoint do QA 2; daí em diante nada injetado).

## Marcos
- (20/11) leitura dos contratos; ferramentas do QA 3 copiadas para qa4.
