# QA jogado — trecho 1 (novo jogo → 4º ginásio, Aventureiro, jogador honesto)

Diário vivo da 3ª mão do QA do trecho 1. Atualizado a cada marco: se o contêiner reiniciar, é daqui que se retoma.

## Como retomar
- Ferramentas em `tools/testes/qa/`: `run.sh <roteiro.mjs> …` sobe o Vite do QA (porta 5194, sem HMR; `RESTART=1` para ele reler `src/`).
  - `jogar.mjs <mata|brasa|rio> [--de N] [--ate N]`: joga as etapas de `etapas.mjs`, checkpoint em `saves/<inicial>-passo-N.json`.
  - `lider1.mjs <inicial> [--n 6] [--gin G] [--de checkpoint]`: G-ésimo ginásio várias vezes a partir de `saves/<inicial>-pre-lider-G.json`, cada vez com outra semente.
  - `sim-inicial.ts`, `busca-lider.ts`: motor puro (sem navegador) para medir/ajustar um chefe.
- Checkpoints alcançados JOGANDO (nada injetado): `saves/*-passo-1..3` e `*-pre-lider-1` dos três iniciais (2ª mão).
- Atalhos declarados do piloto (não são trapaça de estado de jogo, mas não passam pelo teclado): cura "ida e volta ao Posto" no meio do ginásio e remédio fora de batalha aplicados direto no save (contados em `idasAoPosto`/`remediosFora`).

## 3ª mão — o que foi feito (ordem cronológica)

### 1. Começo do jogo (líder 1)
- **Achado no piloto (não no jogo):** o líder é NPC de script e não entrava em `__qa.treinadores`; depois do 4º treinador do ginásio o piloto ia ao líder SEM curar (inicial caído ou pela metade). As taxas baixas da 2ª mão (Mata 0/3, Brasa 0/1) vinham em parte disso. Corrigido em `etapas.mjs` (`seq`): antes do líder exige ninguém caído e vida média ≥ 70%.
- **Motor puro, equipes honestas que chegam ao líder** (inicial nv 10–11 + capturas nv 2–7, 2 chás), ás do líder nv 10 (Garcinha 7 Esguicho/Faro Fino + Tucaninho 10): Mata 3–26%, Brasa 23%, Rio 25%. Fora da meta 45–75%.
- **Ajuste:** `lider-01` = Garcinha 7 (Bicada, Esguicho) + Tucaninho **9** (Bicada, Sorver Seiva, Cara Feia). Motor puro: Mata 65%, Brasa 58%, Rio 75%. Faixa do verificador para o líder 1 já era 7–10: nada a reconciliar em níveis.

(continua abaixo conforme os marcos)
