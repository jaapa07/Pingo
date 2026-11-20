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
- (M2) Rival semanal — `r2-rival.mjs`. Segunda: Tainá ausente; terça (13h): na Gruta do Eco (47,6); luta NA TELA com o Campeão
  como está: **vitória** 2 de 2 (24–30 turnos; equipe dela Gaviãozão 52 … Lobo-Fornalha 55, usou 2 Garrafadas); +5800 patacas;
  some depois da luta; não reaparece no mesmo dia; quinta (2 dias corridos depois): de volta. Dificuldade boa (a rival é
  vencível sem treino; os líderes não).
- (M3) Quiz do Rádio — `r3-quiz.mjs`. 4 de 5 → Cartão do Rádio; mesmo dia: "já foi ao ar"; dia seguinte 5/5 sem 2º cartão.
  Rádio com o Cartão: 10 programas (Cantiga das Lendas). As cantigas (8 linhas) também estouravam o papel: resolvido pela
  paginação do M1 (2 páginas).
- (M4) Torre de Desafios — `r4-torre.mjs`. Regras; 3 dias seguidos: 3 vitórias na tela (nível 50), +3 pontos cada,
  sequência 1→3; equipe e mochila originais voltam intactas, sem experiência; recusa no mesmo dia; troca de 3 pontos por
  Cuia de Ouro ok. Desafiantes no nível 50 são fáceis para o Campeão (que sobe de 45–48 para 50 na cópia).
- (M5) Gincana — `r5-gincana.mjs` + `humano.js` (jogador "gente": tempo real, reação 0,25 s, erro de tempo 45 ms, 10% de
  distração; só lê o que está na tela). Carreiro A-LG → A-GN ok; Seu Graviola dá 3 cajus e o suco (+15% agilidade).
  Resultados (semente 1): Corrida da Vereda 479 (1º, pódio +30), Empurra-Tora 165 (2º, +15), Salto do Riacho 214 (2º, +15);
  144 pontos da Gincana no 1º dia. Rivais fazem 90–290. Sem apertar nada a corrida ainda faz 144–203 (desvios automáticos
  não existem; os obstáculos simplesmente não acertam sempre) → **a Corrida é fácil demais** (gente chega a ~1,8× o melhor rival);
  Força e Salto estão no ponto (dá pódio sem robô, 1º lugar pede treino).
  - **CORRIGIDO** (src/ui/telas/gincana.ts): "fez 214 pontos **na** Salto do Riacho" → "no Salto do Riacho".
- (M6) **CORRIGIDO** `cartel-lago` (src/data/eventos/captura.ts): o evento usava `['batalha', 'cartel-lago', …]`, mas o
  treinador é registrado em código (registrarTreinador) e os verificadores só conhecem os de src/data/treinadores/ → erro
  "batalha com cartel-lago, que não existe". Agora o duelo é o comando `['lagoDuelo']` (mesma regra de `segue: true`: perder
  cura e segue, `batalha-perdida` diz o resultado).
- (M5b) Gincana, 2ª pessoa (semente 2): Corrida 464 (1º), Empurra-Tora 164 (3º), Salto 65 (4º — muitos tropeços seguidos);
  ranking pelo quadro ok (foto r5-ranking: "1º 464 / 3º 164 / 4º 65"); Tesouraria: 30 pontos → Vitamina de Vida ok (103 → 73).
  O Salto varia muito de pessoa para pessoa (65–214): o tempo do pulo depende da Velocidade da criatura e a janela é curta.
- (M7) Safári — `r6-safari.mjs`. Doadores (Pescador Seixo A-R3, Viveirista A10, Lenhador A-R7) dão o objeto uma vez só;
  Seu Jatobá abre os setores 2–4 na mesma conversa; porteira cobra 500 e dá 30 Cuias-Safári; 4 encontros no capim
  (setores 1 e 2) jogados pelo teclado com PERTO/PEDRA/ISCA/CUIA; saída pela porteira recolhe as cuias e desliga o passeio.
  Nenhuma captura em 4 encontros (12 cuias). Medida das regras (simulação das REGRAs com as tabelas dos setores, 400
  encontros por setor): só CUIA captura 31–43% dos encontros (~10 cuias por captura → ~3 capturas por entrada);
  PERTO,PERTO,CUIA cai para 20–27% e PEDRA,CUIA para 20–29% → **PERTO e PEDRA pioram a captura por encontro** (a fuga
  sobe mais que a chance da cuia): o jogador que segue a dica da guia ("a Pedra deixa o bicho mais fácil de pegar") se
  dá pior. Sugestão (não aplicada, é equilíbrio): `pertoFuga` [1, 1.1, 1.2] e `pedraFuga` 1.5.
- (M8) Cuieiras e Mestre Cabaceiro — `r7-cuias.mjs`. As 7 cuieiras do mapa A dão 1 cabaça e recusam no mesmo dia; o artesão
  recebe a cor, diz "secando" no mesmo dia e entrega no dia seguinte — as 7 cuias artesanais obtidas em 7 dias.
  Cada uma foi ARREMESSADA numa batalha selvagem na tela (A-R7, nv 34–37): todas saem da mochila e rodam a animação; nenhuma
  pegou (chances calculadas 12–35% com o bicho no amarelo, ×2 da Cuia de Nível = 23–70%): coerente.
- (M9) Ninho do Seu Aroeira — `r8-ninho.mjs ninho`. Casal Gaviãozão ♀ + Vampirinha ♂ (voadores, "se dão bem"); ovo depois de
  2049 passos (sorteio a cada 256, 25%); **aviso pelo Rádio Cipó** ("Trim, trim!… deixou um ovo!"); ovo recolhido (1024 passos);
  chocou andando: "Nasceu Pipirim!" (nº 10, nv 1, golpes do pai Golpe de Asa/Rasante herdados, treinador = Kauê); retirar
  custa 100 + 100/nível; com a equipe cheia avisa e não cobra. Casal incompatível (Gaviãozão ♀ + Cotiadã ♀) → "nem se olham".
  Obs.: o filhote nasce no nível 1 (nos clássicos, 5) — só registro.
- (M10) Trocas — `r8-ninho.mjs troca`. Capturas na tela de Cotiazinha (A-R1) e Caranguejim (A5) + Cupinzim do Viveiro (levado
  para a equipe direto no save, como o jogador faria pelo PC); Dona Quitéria → Pipoca nv16 (caju), Seu Maré-Cheia → Marola
  nv26 (açaí), Mestre Zé Malho → Trovoada nv30 (pequi); nenhum troca 2ª vez. Obediência: com 8 insígnias o limite é "todas"
  (não há desobediência possível no pós-Liga; a regra foi exercitada pelo agente de captura com 0 insígnias).
- (M11) Lago da Gruta Breu — `r8-ninho.mjs lago` (com o `['lagoDuelo']` novo). Capanga visível pós-Liga; duelo na tela (vitória
  em 4 turnos; numa 1ª rodada com a equipe gasta, derrota → "Rá! Volta pra casa", cura e pode tentar de novo); Mandizinho
  furta-cor nv 38 com Concha Rara capturado na tela com a Cuia de Ouro; foi para o Viveiro (equipe cheia); capanga some;
  flags `lago-raro-ok`, `rara:39`. Estrela de rara conferida (r10-estrela.mjs): painel do Viveiro, Equipe ("+" amarelo no
  cartão) e Diário (estrela no canto da figura; a figura é a da Pelagem Rara).
- (M12) TOQUE, iPhone 13 deitado (`r9-toque.mjs`; palco "paisagem", controles "fora", escala 1,67): menu → Rádio tocando no item;
  Agenda paginada fechada com o botão A; ligação para o líder tocando no contato (rolagem pelo direcional); Revanches legível;
  Corrida aberta tocando na prova e na criatura, jogada tocando nas raias: 301 pontos tocando as raias em rodízio, sem mirar
  (1º lugar — confirma que a Corrida é fácil); Safári: botões PEDRA/CUIA por toque, contador de cuias atualiza. Um toque curto
  no direcional só vira o personagem (andar pede segurar: comportamento normal).

## Pendências (não corrigidas — decisão de equilíbrio ou fora do meu escopo)
1. Revanches de líder (fase 3, ás 57) fora do alcance do Campeão recém-saído da Liga (45–48); no site não há onde treinar
   acima de ~45 fora das revanches de comuns. Níveis são decisão do autor.
2. Pontos da Gincana sem limite diário: cada Corrida rende 30–50 pontos (fora o pódio, que é 1×/dia) → dá para trocar por
   vitaminas, pedras de evolução e pergaminhos repetindo a Corrida (≈ 1 vitamina por minuto de jogo). Sugestão: só o recorde
   do dia vale pontos, ou teto diário.
3. Corrida da Vereda fácil demais (gente: 460–480; tocando à toa: 300; rivais ≤ 260). Força e Salto ok.
4. Safári: PERTO e PEDRA pioram a captura por encontro (ver M7).
5. Relógio: `diaSemana()` (src/core/estado.ts) vira à meia-noite do APARELHO (`new Date().getDay()` + `diaSemana0`), mas a
   hora do jogo e o "dia corrido" (`diaCorrido`, flags de 1×/dia) usam `deslocamentoMin`. Com o relógio do jogo adiantado
   (ex.: +18 h), o dia da semana muda às 18h do jogo: a agenda do rádio, os líderes e a Tainá trocam de dia no meio da tarde.
   Correção sugerida (dono: UI/plataforma): calcular o dia da semana da data do jogo (`new Date(Date.now()+desloc)`) e gravar
   `diaSemana0` relativo a ela em src/ui/telas/relogio.ts.
6. A Agenda do dia anuncia a "Sexta da Tartaruga" no Recife Submerso, que no site (mapa B fechado, sem Mergulho) é inalcançável.
7. "Posição no ranking de hoje: 1º lugar" aparece também depois de uma rodada pior que o recorde (fala do recorde, não da rodada).
