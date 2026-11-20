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
