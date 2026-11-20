# REGRAS-10A.md — diário do agente das regras clássicas (spec 10A: itens 25, 26, 27, 31, 39, 35 e o enxame do item 4)

## Arquivos
- `src/data/revancha.ts` — fases 1–4 (`faseDoProgresso`), alvos de nível (`ALVO_COMUM` 28/48/64, `ALVO_LIDER` 54/68, `ALVO_RIVAL` 52/68), agenda dos 16 líderes (dia/período/lugar/reforços), agenda dos comuns (hash do id + costume da classe), rival semanal, enxame do dia, `equipeDaFase`/`treinadorDaFase`/`premioDaFase`.
- `src/data/quiz.ts` — 31 perguntas Sim/Não sobre fauna brasileira, cada uma com explicação; `src/data/torre.ts` — Torre de Desafios (rodízio de desafiantes, prêmios).
- `src/data/eventos/regras.ts` — comandos `agendaTreino`, `revPreparar`, `revLutar`, `revFim`, `rivalPreparar`, `rivalFim`, `quizRadio`, `torre`; eventos `treino-guia`, `treino-recepcao`, `treino-lider-NN` (16), `treino-saida`, `rival-semanal`, `quiz-radio`, `torre-desafios`; enxame pelo hook `ajustesDeEncontro`; flags recalculadas a cada troca de zona.
- `src/data/zonas/A4-treino.ts` — Ginásio de Treino (tileset ginasio, tema g03; assado com `npx tsx tools/bake-maps.ts A4-treino`). Entrada pelo Guia do Treino em A4 (17,17); saída por gatilho na porta (9,16) → A4 (17,18).
- Edições mínimas em arquivos de outros: A4 (NPC guia), A-GE (Tainá em 47,6), A6 (Locutora Sabiá em 29,26), A-LG (Juiz da Torre em 4,53); `src/world/registro.ts` (+`ajustesDeEncontro`), `src/world/encontros.ts` (aplica os ajustes em `tabela()`); `src/battle/index.ts` + `src/world/deps.ts` (`semExp` no pedido de batalha → `ganhaExp: false`); `src/data/itens.ts` (+`cartao-radio` no fim); `src/data/radio.ts` (falas novas, `CANTIGAS_LENDAS`, `agendaDoDia`); `src/ui/telas/radio.ts` (Agenda do dia, Revanches, Cantiga das Lendas, ligação por agenda e fase, músicas dos lugares visitados e dica de captura com o Cartão); `tools/verifica-zonas-a1.mts`/`a2.mts` (conhecem `EVENTOS_REGRAS`); `tools/test-batalha.ts` (+1 teste `semExp`).
- Testes: `tools/testes/regras/t1-lideres.mjs`, `t2-rival-quiz.mjs`, `t3-comum-enxame-torre.mjs`, `t4-salao.mjs` (Vite em `tools/testes/regras/vite.mjs`, porta 5202, sem HMR — reinicie o Vite depois de editar: ele não vigia arquivos). Simulador: `npx tsx tools/sim-revancha.ts [--n 60]`.

## Flags
`treino:<lider>` (dia corrido em que a revanche foi marcada pelo rádio) · `treino-hoje:<lider>` e `rival-semana-hoje` (NPC visível; recalculadas a cada troca de zona) · `revanche:<id>` (dia da última revanche, igual ao rádio) · `revanche-venceu:<id>` · `revanches-vencidas` · `rival-semanal-dia`, `rival-semanal-vitorias` · `quiz-dia`, `quiz-acertos` · `torre-dia`, `torre-pontos`, `torre-seguidas`, `torre-vitorias`.

## Marcos
- [x] código dos 5 itens (+ enxame) escrito; tsc limpo
- [x] bake A4-treino
- [x] t1 líderes (dia errado, dia certo, salão, vitória, 1 por dia, derrota) — 8/8
- [x] t2 rival semanal (segunda ausente, terça presente, vitória, 1 por dia) e quiz (4 acertos → cartão; 1 por dia; 3 acertos → sem cartão) — 9/9
- [x] t3 comum pelo rádio (dia errado/certo, fase 3), tabela de Revanches, enxame 40%, Torre (nível 50, sem exp, 3 pontos, 1 por dia) — 7/7
- [x] t4 recepção, fase 4 com 16 insígnias, porta de saída — 4/4
- [x] simulador das fases (tools/sim-revancha.ts)
- [x] `npm test`: 32/33 (a falha restante é "nº de cuias 16 ≠ 8", das cuias artesanais de outro agente)
- [x] `npm run check -- --rapido`: nenhum erro novo das regras (só "dist/assets/zonas/A4-treino ausente", que some no build, como A-GN/A-SF de outros agentes)
