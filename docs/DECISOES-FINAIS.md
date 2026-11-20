# DECISOES-FINAIS.md — diário do agente das decisões do autor antes de abrir o mapa B

Origem: relatórios docs/QA-MAPA-B-2.md, docs/QA-POSLIGA.md, docs/EQUILIBRIO-MAPA-B.md, docs/REGRAS-10A.md,
docs/GINCANA-SAFARI.md. `MAPA_B_ABERTO` continua `false` (o coordenador abre depois).
Testes de navegador: `tools/testes/decisoes/` (Vite próprio na porta 5211, sem HMR/vigia, mapa B ligado SÓ em memória
por plugin — mesmo método do docs/ZONAS-B1.md; `run.sh <roteiro> <seg> [args]`, `run.sh parar` desliga pelo PID).

## Marcos
- (20/11) Leitura dos relatórios; ferramentas: `tools/testes/decisoes/lib.mjs` (cópia da qa4-lib na porta 5211), `vite.mjs`, `run.sh`.

### 1. Líder 15 → experiência com 12+ insígnias (MUDANÇA DO AUTOR: subir a equipe do jogador, não baixar a líder)
- 1ª tentativa (DESFEITA a pedido do autor): baixar os membros da Jaci. Medição com o checkpoint real `b8`
  (`qa4-sim-save.mts b8 lider-15`): membros 68 → 3% · 67 → 6% · 66 → 9% · 65 → 12% · 64 → 25% · 63 → 42%. O exemplo
  "66–67" não saía de 6–9%. `ginasio-15.ts` voltou ao original (cinco membros 68, ás 70).
- APLICADO: `fatorExpDoProgresso(flags, insignias)` (src/battle/index.ts) = 1 até a Liga, `FATOR_EXP_POS_LIGA` 0,55 depois
  dela até 11 insígnias e **`FATOR_EXP_INSIGNIA_12` = 1,0** (src/battle/engine.ts) com 12 ou mais. Teste unitário (fator
  por faixa + a mesma derrubada rendendo ~1,8× com 12 insígnias). `tools/estima-chegada-b.ts` ganhou `--fator-exp-12` e
  `--motor`; `tools/sim-mapa-b.ts` usa o fator novo no Conselho.
- Por que 1,0 e não ~0,65: o estimador superestima a chegada do 13 em diante em 4–6 níveis (QA: −3/−4/−5 medidos contra
  +0,8/+1,3/+1,1 estimados). Calibrei com a experiência REAL que a equipe do QA ganhou em cada trecho (checkpoints
  passo-12 → b8 → a9 → pico, exp × fator/0,55; script de projeção em scratchpad, sem o treino extra do 15):
  | Fator com 12+ | Chegada ao 15 (ás/média; Jaci 70) | Ginásio 16 (a9; ás 72) | Pico/Conselho (ás 77) |
  |---|---|---|---|
  | 0,55 (antes) | 65 / 62,8 (Δ −5, o que o QA mediu) | 67 / 64,3 | 69 / 66,5 |
  | 0,65 | 66 / 63,5 | 68 / 65,7 | 70 / 68,2 |
  | 0,85 | 68 / 65,2 | 70 / 67,5 | 72 / 70,2 |
  | 0,95 | 69 / 65,7 | 71 / 68,3 | 74 / 71,7 |
  | **1,0** | **70 / 66,5 (Δ 0)** | **72 / 69,0** | **74 / 72,2** |
  | QA real (com ~250 selvagens de treino no 15) | — | 73 / 69,0 | 75 / 71,2 |
  Com 1,0 o jogador chega ao 16, ao Garrote e ao Conselho no MESMO nível que o QA só alcançou moendo 216–252 selvagens no
  15 — e lá o QA venceu o 16 em 1/2, o Garrote em 1/2 e o Conselho em 1 de 3 (na meta). O estimador com o motor novo
  (`--limiar 5 --motor`): Δ 13 +3,9 · 14 +5,7 · 15 +6,7 · 16 +8,8 · Conselho +6,7; descontado o erro medido (−4 a −6,7),
  dá ≈ 0 no 13–15, ≈ +2 no 16 e ≈ 0 no Conselho.
- Líder 15 com a equipe projetada (b8 com a exp do trecho × fator/0,55; 400 lutas, piloto esperto):
  | Fator | b8 como está (sem remédio de vida) | + 4 Garrafadas Fortes + 1 Chá ($7 500 — o b8 tinha $8 721) | + 6 GF + 2 Chás |
  |---|---|---|---|
  | 0,55 (antes) | **2–3%** | 4% | — |
  | 0,85 | 8% | 16% | 16% |
  | 0,95 | 12% | 24% | 24% |
  | **1,0** | 20% | **35%** | 35% |
  (Com a equipe refeita no nível pelo `NIVEL_ALVO`, que dá golpes do nível: ás 68 → 36/58%, ás 69 → 50/66%, ás 70 → 67/78%.
  A equipe do QA tem dois membros fracos contra Mente — Pintinhas e Cotiadã 4–5 abaixo do ás —, por isso o fator teve
  de ir a 1,0 para a faixa 35–55%.)
- O 16, o Garrote e o Conselho continuam na faixa com os checkpoints reais (equipe no nível que o fator 1,0 projeta):
  `a9 → lider-16` 54% · `passo-16 → garrote` 47% (rival 8 em seguida 24%) · `pico → Conselho` seguido: mochila do save
  2% · +4 Garrafadas Fortes +2 Chás 30% · +8 GF +4 Chás +2 Elixires 73% · +6 Elixires +4 Chás +6 Garrafadas 84%.
