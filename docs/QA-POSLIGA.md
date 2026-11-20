# QA-POSLIGA.md — diário do QA do conteúdo pós-Liga no mapa A (jogado na tela)

Partida: `tools/testes/qa2/saves/campeao.json` (Campeão honesto: Gaviãozão 48, Cotiadã 46, Iaraboto 45, Pintinhas 45,
Tatucanastra 45, Vampirinha 46; $31 132; 8 insígnias; sem injeção de itens). Relógio mudado só pelo save (`relogio.diaSemana0`
e `relogio.deslocamentoMin`, como a tela Relógio faz).
Roteiros: `tools/testes/posliga/` (Vite `vite.sh` na porta 5208, sem HMR; `run.sh <roteiro> <seg> [args]`; biblioteca =
cópia da do QA 2 com o piloto por teclado `tools/testes/qa2/piloto-pagina.js`, batalhas na TELA com o piloto "esperto").
Capturas em `/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/posliga/`.

## Marcos
- (M1) Rádio Cipó + Ginásio de Treino — `r1-radio.mjs`, `r1b-medida.mjs`.
  - Rádio abre pelo menu; Agenda do dia; Contatos (líder 6 no dia errado recusa e diz "sábado, à noite"; líder 5 na sexta de
    manhã marca o treino; ligar de novo lembra); tabela de Revanches (verde = hoje, fase "depois da Liga", 5 criaturas, nível até 57);
    guia de A4 leva ao salão; no salão só o líder marcado; recepção fala a agenda da semana inteira (1 dia por caixa).
  - **CORRIGIDO** (src/ui/telas/radio.ts): a carta da Agenda do dia (e qualquer texto longo do rádio: cantigas, notícias) passava
    da borda de baixo do papel ("Azul. Só hoje!" saía por cima da faixa de dicas). Agora o texto é quebrado na largura do papel e
    mostrado em páginas "(1/4)", "(2/4)"… (A passa a página).
  - Revanche do Faroleiro Volta (fase 3: Poraquê 55, Araracanga 55, Vagalampo 55, Bugio-Trovão 56, Grilão-Elétrico 57) jogada
    na tela com a equipe do Campeão curada no Posto: **derrota 6×0 em 13 turnos**; perdeu metade das patacas ($31 132 → $15 566),
    voltou ao Posto. Funciona do começo ao fim (flag `revanche:lider-05` = hoje; líder some do salão).
  - DIFICULDADE (medida, não honesta: equipe do Campeão subida +k níveis; com "+k golpes" = golpes que ela saberia no nível):
    | Líder (ás) | Campeão como está (45–48) | +9 sem golpes novos (54–57) | +9 com golpes do nível | +12 |
    |---|---|---|---|---|
    | 5 Volta (57) | derrota (2 sementes) | derrota (2 sementes) | vitória apertada | vitória |
    | 6 Benta Sombra (57) | — | — | vitória apertada | — |
    | 7 Bigorna (57) | — | derrota | derrota | — |
    | 8 Dona Buriti (57) | derrota (35 turnos) | derrota | vitória apertada | — |
    Leitura: revanche de líder pede equipe NO MESMO NÍVEL do ás (≈ 55–57) e com golpes atualizados; aí é dura mas vencível (3 de 4).
    O Campeão recém-saído da Liga está ~10 níveis abaixo e perde sempre. No site (mapa B fechado) o maior selvagem alcançável
    pós-Liga é nível 39 (A-R7); A-R6/A-MT/A9 (64–70) estão fechados. O único treino acima de 45 são as revanches de comuns
    (fase 3, ás 50) — dá, mas é longo. Os níveis-alvo são decisão do autor: não mexi.
