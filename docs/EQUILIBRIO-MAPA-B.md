# EQUILIBRIO-MAPA-B.md — curva de níveis dos líderes 9–16, Garrote, rival e Conselho

Diário do agente de equilíbrio do mapa B (o contêiner pode reiniciar: retomar daqui).
Pedido do autor: "pode ajustar o nível dos líderes". Problema (docs/QA-MAPA-B-1.md): o jogador honesto chega aos
líderes 9–12 de 6 a 13 níveis ACIMA do ás, e o spec 4.5 pede 2–4 ABAIXO.
Regra da tarefa: se subir os líderes empurrar o Conselho para perto de 100, PARAR e propor a alternativa (reduzir
experiência / tornar treinadores opcionais / limitar o Chocalho) em vez de aplicar.

## Ferramenta: `tools/estima-chegada-b.ts`
Soma a experiência do caminho do mapa B com as fórmulas do motor (`expDerrota` = base × nível / 7, ×1,5 de treinador;
`expParaNivel` pela curva de cada espécie), partindo da equipe real do Campeão do QA
(`tools/testes/qa3/saves/campeao.json`, 48/46/46/45/45/45). Caminho por passo (zonas com `passo` k, chefes de
evento, turma do ginásio, líder); 7 selvagens por zona com habitat; opcionais (A-RS, A-R6, B-SG, B-LG, g15-1/3/5)
só com `--opcionais`.

**Chocalho do Mutirão e calibração.** Os checkpoints do QA mostram quanto a equipe inteira ganhou por ponto de
experiência bruta do caminho: campeão → B2 = 261 mil pontos para ~120 mil brutos (treinadores 89 mil + selvagens);
ginásio 9 + líder: 74 mil para 39 mil; chapada: 220 mil para ~90 mil; ginásio 11 + líder: 106 mil para 44 mil; roda:
118 mil para ~60 mil. Ou seja, a equipe ganha **2,0–2,5×** a experiência de cada derrubada: o Chocalho dá metade a
toda reserva 2+ níveis atrás da que lutou, e o piloto (como o jogador) gira a equipe, então quase sempre 2–3 estão
"atrás". O modelo usa FATOR 2,1 repartido por igual (a equipe do QA andou sempre a 1–3 níveis do ás) e reproduz o
QA: na cidade do ginásio 9 → 54 (QA 55), 10 → 61 (QA 60), 11 → 66 (QA 65), Cidade Ginga → 69 (QA 68).

## Marco 1 (20/11) — chegada esperada com os níveis atuais (`npx tsx tools/estima-chegada-b.ts --sementes 20`)

| Chefe | Treinadores no caminho | Selvagens | Ás atual | Na cidade, antes da turma (ás / média) | **Chegada ao chefe (ás da equipe)** | Média da equipe | Δ |
|---|---|---|---|---|---|---|---|
| Líder 9 Zefa | 27 | 21 | 49 | 54 / 52 | **56** (QA: 55) | 53 | +7 |
| Líder 10 Topázio | 22 | 21 | 51 | 61 / 58 | **62** (QA: 60) | 59 | +11 |
| Líder 11 Labareda | 19 | 14 | 53 | 66 / 63 | **67** (QA: 65) | 64 | +14 |
| Líder 12 Gingado | 15 | 7 | 55 | 69 / 66 | **70** (QA: 68 na cidade) | 67 | +15 |
| Líder 13 Peçonha | 32 | 21 | 57 | 75 / 72 | **76** | 72 | +19 |
| Líder 14 Pinhão | 17 | 7 | 59 | 78 / 75 | **79** | 75 | +20 |
| Líder 15 Jaci | 13 | 14 | 61 | 81 / 77 | **81** | 77 | +20 |
| Líder 16 Trovão-Velho | 14 | 21 | 63 | 84 / 80 | **84** | 80 | +21 |
| Conselho (antes da 1ª luta) | 10 + Garrote + rival 8 | 14 | 70 | 87 / 83 | **87** | 83 | +17 |

Com as zonas e treinadores opcionais (`--opcionais`): 56 / 63 / 68 / 71 / 77 / 82 / 85 / 88 / Conselho 90.

## Marco 2 — por que não dá para só subir os líderes (curva autoconsistente)
Subir líderes, turmas e rotas aumenta a experiência do próprio caminho: a chegada sobe junto. `--ajustar 3` procura,
passo a passo, a curva em que o ás de cada chefe = chegada + 3 com a turma e as rotas do passo subindo junto:

| Cenário (`--ajustar 3`) | Ás do líder 9 | 12 | 16 | Conselho (ás) | Chegada ao Conselho |
|---|---|---|---|---|---|
| **Regras atuais** (Chocalho 2,1×, treinador ×1,5) | 60 | 77 | 95 | **98** | 95 |
| idem, selvagens subindo 70% junto | 60 | 78 | 96 | **99** | 96 |
| só 50% dos treinadores de rota (opcionais) | 57 | 71 | 85 | 88 | 85 |
| experiência ÷10 em vez de ÷7 | 57 | 70 | 84 | 87 | 84 |
| treinador ×1,0 em vez de ×1,5 | 57 | 70 | 85 | 87 | 84 |
| Chocalho pela metade (fator ~1,3) | 57 | 68 | 81 | 83 | 80 |
| **Chocalho sem efeito numa equipe já nivelada (fator 1,0)** | **55** | **65** | **75** | **77** | 74 |
| idem + selvagens subindo 60% junto | 55 | 65 | 76 | 77 | 74 |
| Chocalho 1,3 + treinador ×1,0 | 55 | 64 | 74 | 76 | 73 |
| Chocalho 1,0 + treinador ×1,0 | 54 | 61 | 69 | 71 | 68 |
| Chocalho 1,0 + 60% dos treinadores de rota | 54 | 62 | 71 | 72 | 69 |

**Decisão (regra da tarefa): PAREI.** Com as regras atuais a curva autoconsistente põe o Conselho em 98 (o
Guardião-Mor no teto 100) e as revanches de fase 4, que têm de ficar acima, não cabem. A subida dos líderes 9–16,
Garrote, rival, Conselho, rotas e revanches **não foi aplicada**; a proposta para o autor está no fim deste arquivo.

## Marco 3 (20/11) — simulador dos líderes e do Conselho (`npx tsx tools/sim-mapa-b.ts --n 150`)
Ferramenta nova: `tools/sim-mapa-b.ts` (piloto esperto; `ref` = equipe de referência da Liga, média dos 3 iniciais;
`qa` = a equipe real do QA — Iaraboto, Gaviãozão, Cotiadã, Pintinhas, Tatucanastra, Vampirinha — com o ás Δ abaixo;
líder com 6 Garrafadas + 2 Elixires; Conselho com a mochila da Liga, 5 lutas seguidas, ganhando experiência).
Níveis ATUAIS (nada subiu). Meta: esperto 55–75% com Δ 2–4.

| Chefe | Ás | ref Δ2 | ref Δ3 | ref Δ4 | qa Δ2 | qa Δ3 | qa Δ4 |
|---|---|---|---|---|---|---|---|
| 9 Zefa | 49 | 67% | 55% | 40% | 40% | 23% | 17% |
| 10 Topázio (antes) | 51 | 82% | 75% | 54% | 43% | 34% | 27% |
| **10 Topázio (depois)** | 51 | 85% | 77% | 65% | 51% | 40% | 60% |
| 11 Labareda | 53 | 65% | 57% | 39% | 45% | 32% | 34% |
| 12 Gingado | 55 | 82% | 59% | 48% | 90% | 84% | 69% |
| 13 Peçonha | 57 | 80% | 63% | 51% | 14% | 7% | 4% |
| 14 Pinhão | 59 | 86% | 67% | 64% | 89% | 79% | 68% |
| 15 Jaci | 61 | 78% | 61% | 55% | 67% | 65% | 37% |
| 16 Trovão-Velho | 63 | 77% | 73% | 61% | 97% | 96% | 91% |
| Garrote | 64 | 89% | 86% | 76% | 21% | 21% | 12% |
| Rival 8 (Rio) | 65 | 59% | 54% | 40% | 83% | 81% | 74% |
| **Conselho, sequência inteira** | 70 | 74% | 57% | 51% | 86% | 82% | 74% |

Leitura: na referência os oito ficam na faixa ou um pouco acima no Δ2; com a equipe do QA (muito Rio) a taxa depende do
tipo: 9, 10, 11, 13 (Veneno: Pintinhas/Cotiadã sofrem) e Garrote são duros; 12, 14 e 16 fáceis. O Conselho com a
mochila cheia passa da meta 35–55% (51–86%): fica no limite de baixo só com Δ4 na referência.

**Líder 10 (aplicado):** Couraça de Pedra só no Cupinzeiro-Vivo (escudeiro) e no ás Mocó-da-Rocha; Aruazão e
Jabutipiranga trocaram por Soterrar, Calangão por Dentada (todos golpes da lista de cada espécie). Equipe do QA:
27–43% → 40–60%; referência 54–82% → 65–85% (src/data/treinadores/ginasio-10.ts).

**Correções de passagem (aplicadas):**
- Filhotes do Centro de Reabilitação (`b1-orfaos`, src/data/eventos/b1.ts): nascem no nível 44 (faixa do Pantanal) e o
  comando novo `b1-orfao-crescer` sobe o filhote recém-adotado (na equipe ou no Viveiro) até a média da equipe − 4
  (teto 60), com os golpes do caminho; evolui na primeira subida em batalha. A veterinária avisa ("saem quase no passo
  da sua equipe"). Era nível 12.
- Pesquisador Baru (src/data/zonas/B1-lab.ts): "Quem chega da Liga com equipe de 45 sente o tranco nos primeiros dias,
  mas a Vereda e o Cerrado treinam ligeiro: no Pantanal você já está no passo." (o QA chegou da Liga com 45–48 e já
  estava 6 acima do líder 9).
- Conferido: `npx tsc --noEmit` limpo, `npm test` 37/37, `tools/verifica-zonas-b1.mts` 0 erros; `npm run check --
  --rapido` só com os erros alheios da rodada (cartel-lago em eventos/captura.ts; zonas sem bake no dist).

## PROPOSTA PARA O AUTOR (não aplicada — decisão dele)
O que infla a curva é o **Chocalho do Mutirão**: com ele a equipe inteira ganha 2,0–2,5× a experiência de cada
derrubada. Opções, com a curva autoconsistente que cada uma permite (líderes = chegada + 3, `--ajustar 3`):

| Opção | Ás dos líderes 9 / 10 / 11 / 12 / 13 / 14 / 15 / 16 | Conselho (ás) | Revanche fase 4 (ás) | Mexe em |
|---|---|---|---|---|
| 0. Só subir os líderes (pedido original) | 60 / 66 / 70 / 77 / 82 / 86 / 89 / 95 | **98** | não cabe (teto 100) | — |
| **A. Chocalho só puxa quem está 5+ níveis atrás** (recomendada) | 55 / 59 / 62 / 65 / 69 / 71 / 73 / 76 | ~79 (membros 74–78) | ~82–84 | `src/battle/engine.ts` (limiar do Chocalho: `topo − 2` → `topo − 5`, ou só depois de `liga-vencida` para não mexer no mapa A) |
| B. Chocalho pela metade (reserva ganha 1/4) + treinador ×1,0 | 55 / 59 / 62 / 64 / 68 / 70 / 72 / 74 | ~77 | ~80 | `expDerrota` e `darExp` (vale para o jogo todo) |
| C. Chocalho como está, mas 50% dos treinadores de rota opcionais (sem linha de visão) | 57 / … / 85 | 88 | ~91 | zonas do mapa B (visão dos treinadores) |
| D. Chocalho 1,0 + treinador ×1,0 | 54 / 57 / 59 / 61 / 64 / 66 / 67 / 69 | ~71 (curva atual do spec) | 73 (como está) | engine + fórmula |

Com A: turmas dos ginásios e rotas acompanham (ás do líder − 2 a − 6), selvagens do mapa B sobem ~60% do mesmo
passo (B-R1 ~48–51 … A9 ~66), Garrote ~77, rival 8 ~78, Conselho 74–79, revanches de líder/rival fase 4 ~83, comuns
~77. O Chocalho continua fazendo o que promete (pôr uma captura nova em dia com a equipe), mas deixa de levar a equipe
nivelada inteira junto. A chegada ao líder 9 cai de ~56 para ~52 (o QA ganhou os 6–7 níveis extras já entre a Liga e
o ginásio 9). Ao aprovar: aplicar o limiar, rodar `npx tsx tools/estima-chegada-b.ts --fator 1.0 --ajustar 3
--selvagem-acompanha 0.6` (com fator medido de novo pelo QA), refazer as equipes 9–16/Garrote/rival 6–8/Conselho
nas formas do nível, atualizar spec 4.5, bloco do topo do HISTORIA.md, `tools/verify/niveis.ts` (pendência dos
líderes 9+ e faixas novas), `ASL` dos verificadores `tools/verifica-zonas-b1.mts` / `-b2-sul` / `-b2-norte`,
`src/data/revancha.ts` (ALVO_LIDER/ALVO_RIVAL fase 4 acima do Conselho novo) e medir com `tools/sim-mapa-b.ts`.

Pendências honestas: o modelo de chegada é uma média (equipe por igual, FATOR calibrado em 4 checkpoints de UM jogo do
QA com inicial de Rio); do 13 em diante é só estimativa (ninguém jogou B6→Pico honesto); o FATOR com a opção A
(~1,0–1,2) é dedução da regra, não medida — o QA do mapa B trecho 2 deve medir.
