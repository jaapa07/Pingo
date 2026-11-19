# ESTADO.md — registro de progresso (atualizado pelo coordenador)

## Feito
- Base: scaffold, pipeline 3D→pixel art validado (`tools/render/*`, `tools/render-sprites.ts`), tipos centrais (`src/core/tipos.ts`), núcleo (`loop`, `events`, `rng`, `estado`, `assets`, `sprite`, `telas`), motor de áudio copiado (falta conteúdo), contratos em `docs/`.

## Ondas de agentes (atualizado 19/11 ~06:20 de Brasília)
- **Concluídos:** motor de batalha + golpes/itens/tipos (26 testes) · cenário exterior + bake · interiores, 32 arenas e catálogo · kits de anatomia + criaturas 1–12.
- **Rodando (onda 1):** motor de mundo · pessoas · UI base/plataforma · áudio.
- **Rodando (onda 2):** dados das espécies (3 partes) · zonas A1, A2, B1, B2 · criaturas em 7 lotes (13–180; tarefa em docs/TAREFA-LOTE-CRIATURAS.md).
- **Falta lançar:** view de batalha + FX de golpes · telas restantes (menu, equipe, mochila, diário, viveiro, rádio, mapa-múndi…) · 16 ginásios (2 agentes) · plataformas (PWA, iOS, desktop) · verify · QA.
