# GINCANA-SAFARI.md — diário do agente (spec 10A itens 32 e 33)

## Plano (20/11)
- **Onde:** carreiro no terreiro do Platô (`A-LG`, NPC `carreiro-gincana`, só com `flag:liga-vencida`) leva ao **Vale do Buriti-Alto** (`A-GN`, Gincana). A borda leste de `A-GN` dá na **Portaria do Safári** (`A-SF`, casa do dono `A-SF-casa`); a porteira leva ao **Parque** (`A-SF-parque`, 4 setores).
- **Gincana:** tela `gincana` (3 minijogos: `agilidade`, `forca`, `salto`), `gincana-ranking`; dados em `src/data/gincana.ts`; eventos em `src/data/eventos/posliga.ts`. Pontos = flag `gincana-pontos`; troca na tela `loja` (args `moeda`).
- **Safári:** tela `safari-encontro` (sem golpes: cuia, isca, pedra, aproximar, fugir) em `src/ui/telas/gincana-safari.ts`; mecânica em `src/world/mecanicas/safari.ts` (passos, encontros por setor, fim do passeio); dados em `src/data/safari.ts`.

## Marcos
- **M1 (código escrito, tsc limpo):** zonas `A-GN`, `A-SF`, `A-SF-casa`, `A-SF-parque` (assadas com prévia); dados `src/data/gincana.ts`, `src/data/safari.ts`; itens novos no fim de `itens.ts` (cuia-safari, pedra-de-rio, muda-de-buriti, tronco-oco, 6 vitaminas com `uso.esforco` por fusão de interface; efeito em `usarItemEm` de `src/ui/telas/comum.ts`); `loja` aceita `moeda` (pontos); telas `gincana`, `gincana-ranking`, `safari-encontro`; mecânica `src/world/mecanicas/safari.ts`; eventos `src/data/eventos/posliga.ts`. NPCs acrescentados: `carreiro-gincana` (A-LG 28,55), `safari-pescador-seixo` (A-R3 35,6), `safari-viveirista` (A10 19,21), `safari-lenhador` (A-R7 6,11), todos com `se: flag:liga-vencida`.
