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

## Retomada em Fable (19/11, início manual)
Itens 1–3 da fila relançados como agentes novos em Fable (continuam do disco): dados 61–120 (abb693e2d0ba7eb35), Zonas A1 (a6cfad1dc2bbf68c4), tela de batalha (a04be66a2a30cf5a5). Próximo da fila: 4. Menus.
- Item 1 (dados 61–120) concluído e enviado. Item 4 (menus) lançado em Fable (a9958821a48a7151e).
- **PEDIDO DO USUÁRIO: ao terminarem os 3 em andamento (Zonas A1, batalha, menus), PAUSAR — não lançar o item 5 até ele mandar.**

## PAUSADO em 19/11 (a pedido do usuário) — estado: tsc limpo, 26 testes ok, `vite build` ok
`npm run build` completo ainda falha no último passo: `tools/build-sw.ts` não existe (item 18, plataformas).
Feito nesta rodada (Fable): dados 61–120 (180 espécies completas) · tela de batalha + 96 anims + 134 FX + evolução · 10 telas de menu · Zonas A1 (31 zonas, 51 treinadores, 36 eventos, abertura).
**Falta nos itens parciais (retomar antes do item 5):**
- Zonas A1: NADA foi jogado no navegador (abertura, cuias, rival, trem); prévias de A-R2, A-MS, A3, A-R3, A-GE não conferidas a olho; itens de história sem id (Ovo Pintado etc.); tutorial de captura sem modo `tutorial`; verificador em tools/verifica-zonas-a1.mts.
- Batalha: nunca exercitados na tela — captura, item, troca, fuga, treinador, duplas, climas, evolução; toque/iPhone; só ~14 das 96 anims vistas; criatura do jogador encobre o painel de golpes e o painel corta a barra de EXP (ver docs/capturas/batalha-b.png).
- Menus: faltam `mapa-mundi` (+voo), `radio` + src/data/radio.ts, `creditos`, `foto`, src/ui/hud.ts; testar toque/iPhone e fluxos de item/loja/viveiro. Mundo ainda não lê flags['atalho'] nem save.decoracao, nem emite 'obstaculo'.
- Equilíbrio: somas de atributos das partes 1–60/121–180 (caso Bruxaluz); IA de líder/conselho.
Próximos da fila: 5 (ginásios 1–8), 6 (A2), 7 (B1)… No máximo 3 agentes, em Fable.

## Retomado em 19/11 com 2 agentes (regra nova do usuário: no máximo 2 em paralelo, em Fable)
Rodando: Zonas A1 — jogar a abertura e corrigir (a6cfad1dc2bbf68c4) · Batalha — exercitar tudo, toque e polimento (a04be66a2a30cf5a5).
Depois: menus restantes (retomar a9958821a48a7151e), então item 5 da fila em diante.
- Regra atual do usuário: até 3 agentes; trabalhar até ~90% da cota da sessão e parar com tudo compilando e enviado. Menus retomado (a9958821a48a7151e).
- Menus CONCLUÍDO (14 telas + HUD, toque testado no iPhone). Integração pendente com o mundo (fazer na fase de integração): `atalho()` em src/world/campo.ts ler flags['atalho'] → usarItemNoCampo; A1-quarto montar save.decoracao e escutar bus 'decoracao'; mundo emitir bus 'obstaculo' {amuleto,pode} e 'clima'; preencher save.contatos após batalhas; derrota em revanche do rádio; direcional de toque cobre cantos em paisagem (src/ui/toque.ts); palco em escala 1 no iPhone em pé (palco.ts).
- Ginásios 1–8 lançado em Fable (a988838ea973147d3). **PEDIDO DO USUÁRIO: quando os 3 em andamento (Zonas A1, batalha, ginásios 1–8) terminarem, PAUSAR — não lançar mais nada até ele mandar.**
- Batalha: 2ª rodada concluída (defeitos de sobreposição corrigidos; captura, item, troca, fuga, treinador, duplas, climas, evolução e modo tutorial exercitados; toque no iPhone ok). Falta: rever 48 das 96 anims (folhas em docs/capturas/vitrine/), fala de vitória do treinador, golpes de carga, clima por golpe; controles de toque cobrem cantos em paisagem (src/ui/toque.ts); conferir digitação duplicada na tela de apelido.
- Zonas A1: 2ª rodada concluída — abertura e trajeto A1→A4 JOGADOS no navegador (3 cuias, rival-1/2/3, Faro, 7 missões, trem até B1). Falta: tela `cinematica` do trem; diálogo fica por baixo da cortina no fade; não exercitados: arremesso de cuia no tutorial, compra na loja, pesca, iniciais Mata/Rio até o fim, toque. Bugs para a batalha: criarCriatura nasce com 1 de vida a menos (19/20); rival abre com o último da equipe; 'batalha-fim' emitido 2×. Equilíbrio: inicial nv 5 perde para o 1º pescador da rota 1.
- NOVO PEDIDO DO USUÁRIO (spec 6.5): 2 lendários extras de pós-jogo — 181 Galo-Manaó (Vento/Rio, ave manauara, missão "O Encontro das Águas") e 182 Borealce (Geada/Encanto, alce nórdico, missão "A Expedição Boreal"). Falta tudo: dados, modelos, zona X-EA, eventos, página "Visitantes" do Diário. Entra na fila junto com o lote 157–180 e as zonas B2/Pico.

## PAUSADO em 19/11 (2ª pausa, a pedido do usuário) — tsc limpo, 26 testes ok, vite build ok
- Ginásios 1–4 completos e jogados (Vento, Inseto, Rio, Mata); mecânicas agora carregadas pelo main.ts (gMec) — NÃO retestado no jogo normal após essa ligação. Falta: ginásios 5–8 (5 Terra tem projeto: 3 cercados de lama + sino; 6 espelhos; 7 circuitos; 8 salas escuras); retestar a volta do ginásio 4; canal vazio do g03 parece gelo; equilíbrio/IA dos líderes não avaliados. Roteiros de teste em tools/testes/ginasios-1-4/. Retomar com SendMessage a988838ea973147d3.
- Fila a partir daqui: ginásios 5–8 · Zonas A2 · B1 · B2+Pico · ginásios 9–16 · lotes de criaturas (inclui lendários 171–180 e os extras 181–182 do spec 6.5) · verificador · plataformas · integração/QA/polimento (pendências listadas acima).
