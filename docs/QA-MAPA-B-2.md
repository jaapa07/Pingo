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
- (20/11) Piloto estendido: roda de capoeira (devolve a seta chamada na batida, lendo `data-roda-*`), Voo pelo
  mapa-múndi (toque no marcador, 2 toques + confirmação), passo `pisar` (portais do 15), roteiros dos ginásios 12–16
  (soluções dos comentários das zonas), etapas novas `tunel lab gin13 veredas serra gin14 nevoas gin15 tupa gin16 pico
  conselho`; `chegada` registra ás, média, Δ, dinheiro e remédios na entrada do ginásio E na frente do líder.
- Estimativa de referência (`npx tsx tools/estima-chegada-b.ts --limiar 5 --fator-exp 0.55 --sementes 20`), ás / média na
  frente do chefe: 9 → 52,5/48,9 · 10 → 57,0/53,2 · 11 → 60,2/56,5 · 12 → 62,3/58,7 · 13 → 66,8/63,1 · 14 → 69,3/65,5 ·
  15 → 71,1/67,5 · 16 → 73,6/70,0 · Conselho → 75,8/71,9.
- (20/11) **trem → gin9** (de `campeao`): Platô, trem, Vila Cascavel, B-R1, B-CE, B-PA norte, B2 — 0 derrotas, 5 voltas ao
  Posto por desgaste. Capturas 46, 128. Na entrada do ginásio 9: equipe 54/49/48/48/47/47 (ás −1, média 48,8 = −6,2);
  **$132** (o dinheiro acabou em remédios). **Líder 9: DERROTA na 1ª** (26 turnos; entrou com 2 desmaiadas, sem Chá),
  vitória na 2ª (12 turnos; Zefa usou 2 remédios). Checkpoint `passo-9` ($5 326).
