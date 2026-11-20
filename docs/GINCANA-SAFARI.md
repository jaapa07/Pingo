# GINCANA-SAFARI.md — diário do agente (spec 10A itens 32 e 33)

## Plano (20/11)
- **Onde:** carreiro no terreiro do Platô (`A-LG`, NPC `carreiro-gincana`, só com `flag:liga-vencida`) leva ao **Vale do Buriti-Alto** (`A-GN`, Gincana). A borda leste de `A-GN` dá na **Portaria do Safári** (`A-SF`, casa do dono `A-SF-casa`); a porteira leva ao **Parque** (`A-SF-parque`, 4 setores).
- **Gincana:** tela `gincana` (3 minijogos: `agilidade`, `forca`, `salto`), `gincana-ranking`; dados em `src/data/gincana.ts`; eventos em `src/data/eventos/posliga.ts`. Pontos = flag `gincana-pontos`; troca na tela `loja` (args `moeda`).
- **Safári:** tela `safari-encontro` (sem golpes: cuia, isca, pedra, aproximar, fugir) em `src/ui/telas/gincana-safari.ts`; mecânica em `src/world/mecanicas/safari.ts` (passos, encontros por setor, fim do passeio); dados em `src/data/safari.ts`.

## Marcos
