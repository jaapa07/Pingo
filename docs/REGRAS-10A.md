# REGRAS-10A.md — diário do agente das regras clássicas (spec 10A: itens 25, 26, 27, 31, 39, 35 e o enxame do item 4)

## Arquivos
- `src/data/revancha.ts` — fases 1–4, alvos de nível, agenda dos 16 líderes (dia/período/lugar/reforços), agenda dos comuns (hash do id), rival semanal, enxame do dia, `equipeDaFase`/`treinadorDaFase`.
- `src/data/quiz.ts` — 31 perguntas Sim/Não com explicação; `src/data/torre.ts` — Torre de Desafios.
- `src/data/eventos/regras.ts` — comandos `agendaTreino`, `revPreparar`, `revFim`, `rivalPreparar`, `rivalFim`, `quizRadio`, `torre`; eventos `treino-guia`, `treino-recepcao`, `treino-lider-NN`, `rival-semanal`, `quiz-radio`, `torre-desafios`; enxame (hook `ajustesDeEncontro`).
- `src/data/zonas/A4-treino.ts` — Ginásio de Treino (tileset ginasio, tema g03). Bake: `npx tsx tools/bake-maps.ts A4-treino`.
- Edições mínimas: A4 (NPC guia em 17,17), A-GE (Tainá em 47,6), A6 (Locutora em 29,26), A-LG (Juiz da Torre em 4,53); `src/world/registro.ts` (+`ajustesDeEncontro`), `src/world/encontros.ts` (aplica os ajustes); `src/battle/index.ts` + `src/world/deps.ts` (`semExp` no pedido de batalha); `src/data/itens.ts` (+`cartao-radio` no fim); `src/data/radio.ts` (falas, cantigas, `agendaDoDia`); `src/ui/telas/radio.ts` (Agenda do dia, Revanches, Cantiga das Lendas, ligação por agenda).

## Marcos
- [x] código dos 5 itens escrito, tsc limpo (exceto x-ea.ts de outro agente)
- [ ] bake A4-treino
- [ ] testes no navegador
- [ ] simulador das fases

## Recado do agente de captura e criação (docs/CAPTURA-CRIACAO.md)
- Enxame (item 4): vi que o seu `enxameDoDia` + `ajustesDeEncontro` já cobre tudo — NÃO criei um segundo enxame. `src/world/enxames.ts` é só uma fachada sobre o seu: `enxameDeHoje()` → `{ zona, zonaNome, especie, especieNome, nv, metodo }` e `anuncioEnxame()` (frase pronta do locutor). Se mudar a assinatura de `enxameDoDia`/`diaCorrido`, me avise aqui (ou ajuste a fachada, são 10 linhas).
- Ninhos (10A-11): quando aparece um ovo no Viveiro do Seu Aroeira, `bus.emit('criadouro-ovo', { especie })`; eu mesmo faço a "ligação" do casal pelo Rádio Cipó no mundo (src/data/eventos/captura.ts). Se o rádio quiser listar recados, `jogo.save.criadouro?.ovo` diz se há ovo esperando.
- Acrescentei uma notícia (`criadouro`, depois de 6 insígnias) em `NOTICIAS` por `push` em tempo de execução, sem editar src/data/radio.ts.
