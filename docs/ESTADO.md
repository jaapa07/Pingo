# ESTADO.md — registro de progresso (atualizado pelo coordenador)

## Feito
- Base: scaffold, pipeline 3D→pixel art validado (`tools/render/*`, `tools/render-sprites.ts`), tipos centrais (`src/core/tipos.ts`), núcleo (`loop`, `events`, `rng`, `estado`, `assets`, `sprite`, `telas`), motor de áudio copiado (falta conteúdo), contratos em `docs/`.

## Ondas de agentes (atualizado 19/11 ~06:20 de Brasília)
- **Concluídos:** motor de batalha + golpes/itens/tipos (26 testes) · cenário exterior + bake · interiores, 32 arenas e catálogo · kits de anatomia + criaturas 1–12.
- **Rodando (onda 1):** motor de mundo · pessoas · UI base/plataforma · áudio.
- **Rodando (onda 2):** dados das espécies (3 partes) · zonas A1, A2, B1, B2 · criaturas em 7 lotes (13–180; tarefa em docs/TAREFA-LOTE-CRIATURAS.md).
- **Falta lançar:** view de batalha + FX de golpes · telas restantes (menu, equipe, mochila, diário, viveiro, rádio, mapa-múndi…) · 16 ginásios (2 agentes) · plataformas (PWA, iOS, desktop) · verify · QA.

## Fila com 3 agentes (regra do usuário: no máximo 3 em paralelo)
Pausados em 19/11 às 07:15 (Brasília); retomar com SendMessage, na ordem, mantendo 3 rodando:
1. Dados das espécies 61–120 (ac4fa94e04246f0e0) — destrava zonas e testes
2. Zonas A1 — vila inicial, abertura, rotas até A4 (a8004a1c32f57454d) — marco 1
3. Tela de batalha + FX (a1aab9bb6b84455d4) — marco 1
4. Menus e telas restantes (a9ddf621f0ced2f24) — marco 1/2
5. Ginásios 1–8 (a435df26aabeadccd)
6. Zonas A2 (afcc2e32946989487)
7. Zonas B1 (ac9e4f7b62187cf74)
8. Zonas B2 + Pico (a8a468c305cf9f229)
9. Ginásios 9–16 (ae3099e43b76fee25)
10–16. Lotes de criaturas 13–36, 37–60, 61–84, 85–108, 109–132, 133–156, 157–180 (a9b67f3d5f778f584, ae8093edddce3ce4c, a06d217e9664f178d, a68c8ee4c9e9f8a37, a46f18510af2637fa, ab5b1608602fc225d, a24ea46633e46db02)
17. Verificador npm run check (a7430672cef314cb6)
18. Plataformas PC/iPhone offline (adc15d43fcaf1e641)
Depois: integração, testes jogando (QA) e polimento.
