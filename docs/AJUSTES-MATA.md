# Ajustes para o inicial de Mata (começo do jogo) — diário

Três decisões do autor (20/11) a partir de docs/QA-TRECHO-1.md: (1) líder 1 a 31–55% só para Mata; (2) criatura de Rio
antes do Remo (pesca + troca); (3) tenente Lata +15 pontos para Mata.

## Como medir / retomar
- Motor puro: `npx tsx tools/testes/qa/busca-honesta.ts <candidatos.json> <equipes.json> --n 300 [--itens ...] [--cura-livre]`
  e `npx tsx tools/testes/qa/sim-inicial.ts A-US-lata --passo 4 --equipe ... --itens ... --insignias 3`.
- Equipes honestas do líder 1 (QA-TRECHO-1, 4ª mão): Mata `1:11,10:6,13:2,45:5` e `1:10,10:4,13:2,45:5`; Brasa `4:10,13:7,13:2,10:2`
  e `4:9,13:9,13:2,10:2`; Rio `7:11,13:3,10:2,45:2` e `7:10,13:3,10:2,45:2`. Com o presente: Mata `+81:6`.
- Navegador: Vite próprio na porta 5210 (`--strictPort`, sem HMR/watch: reiniciar depois de editar `src/`); o piloto do QA
  aceita `QA_BASE=http://localhost:5210/` (tools/testes/qa/piloto.mjs). Roteiros desta rodada ficaram no scratchpad
  (item1.mjs, item23.mjs, lata.mjs, baia2.mjs). Checkpoints novos em tools/testes/qa/saves: `mata-jabutim-pre-lider-1`,
  `mata-rio-pre-usina`, `mata-rio-pre-lata`, `mata-rio-pos-usina`.

## 1. Líder 1 só para Mata — Jabutim do Seu Aroeira
- Medido antes (Garcinha 7 Esguicho/Faro Fino + Tucaninho 10, 2 chás, n=300): esperto / cura livre Mata 21/39%, Brasa 44/83%, Rio 46/45%.
- Mais chás não resolvem (Mata 3→6 chás: 21/46 → 21/51%): o esperto nem bebe. É preciso uma criatura que aguente Bicada ou bata em Vento.
- Candidatos (5ª criatura da equipe de Mata, esperto / cura livre):
  - Vagalumim (Inseto/Trovão) nv 5: 68/76% e Grilinho nv 5: 66/75% — fortes demais já no nível mais baixo.
  - Andorim (Vento/Pedra) nv 5/6/7/8: 27/44, 41/54, 68/65, 95/90% — degrau grande e é do próprio tipo do ginásio.
  - **Jabutim (Mata/Pedra)** nv 5/6/7/8/9: 29/51, **34/55**, 40/61, 70/80, 100/100% (Estilingue no nv 9).
- Escolhido: **Jabutim nv 6**, presente do Seu Aroeira (viveiro de Vila Caiçara) só com `flag:inicial-mata`, logo depois da
  entrega do Ovo Pintado (ou em qualquer visita seguinte; `flag:jabutim-aroeira`). Por que: é a fauna da vizinhança (tabela 6.4: A-R2 G i),
  combina com o viveiro, é Mata/Pedra (Bicada neutra), cresce devagar (curva lenta: chega ao líder em 6–7) e não mexe em nada
  que Brasa e Rio veem. Nenhuma mudança no Mestre Gaivota (ás 10, Garcinha 7 dentro da faixa 7–10).
- Depois (n=300): **Mata 35/54%** (com o Jabutim 7: 42/62%); Brasa 44/83% e Rio 46/45% sem mudança.
- Risco anotado: quem treinar o Jabutim até o nv 9 antes do ginásio ganha o Estilingue e passa fácil (como no gênero, o treino é escolha do jogador).
- **Jogado** (`mata-pre-lider-1` → viveiro → ginásio 1, 3 sementes): a fala do Aroeira aparece, o Jabutim entra na equipe (apelido
  oferecido); líder 1: 1 vitória em 3 (antes 1/4). O piloto do QA só põe o Jabutim quando o Tamanduí cai (ele aguentou 2–3 Bicadas do
  Tucaninho e o deixou com 4–13 de 32). Nenhum erro de console.
- Arquivos: src/data/eventos/a1.ts (evento `aroeira`), comentário em src/data/treinadores/ginasio-01.ts, tabela 6.4 no GAME_SPEC.

## 2. Criatura de Rio antes do Remo
- Conferido: a Vara Velha é do Pescador Raimundo, em Vila Caiçara, numa conversa opcional (o piloto honesto chegou à insígnia 3 sem ela).
  A Piabinha (Rio) JÁ era pescável com ela na Trilha do Ipê (5–8), Campos de Restinga (6–9), Mata dos Sabiás (8–11), Trilha dos Cipós
  (10–14) e Estrada da Usina (10–15); Porto Sereia não tinha pesca nenhuma (quem tentava no cais ouvia sempre "Nada mordeu a isca").
- Feito:
  - **Pesca no cais de Porto Sereia** (A4): Vara Velha Piabinha nv 11–15, Vara Boa nv 20–24 (A-BA já tinha Piabinha "P c"; tabela 6.4 atualizada com "A4 P c").
  - **Troca com o Seu Arraia** (praia do cais, (22,37)): um Pipirim (comum na Trilha do Ipê e nos Campos de Restinga) pelo
    Mandizinho "Bigode" nv 18 com Caju, a partir de 2 insígnias (limite de obediência 30). `troca-a4` em src/data/trocas.ts; o evento
    sai sozinho do roteiro único `troca` (src/data/eventos/captura.ts, sem edição). Tabela 6.4: Mandizinho "troca em A4".
  - Fala do Netuno (src/data/eventos/ginasio-03.ts) ao entregar o Remo: aponta a pesca no cais e o Seu Arraia.
  - Pescador Raimundo (A2), ao falar de novo: "canoa só sai do cais puxada por criatura do tipo Rio. Uma Piabinha da beira d'água já dá conta".
  - src/world/campo.ts: com o Remo e sem criatura de Rio, de frente para a água, o jogo agora diz "O Remo precisa de uma criatura do tipo
    Rio na equipe." antes de perguntar "Pescar com a Vara Velha?" (antes só perguntava da vara, sem explicar por que não remava).
- **Jogado** (`mata-passo-8`, equipe cheia e sem Rio): foi até Vila Caiçara buscar a Vara Velha, voltou ao cais; na água: aviso do
  Remo + pesca; 2 tentativas sem fisgada e na 3ª uma Piabinha nv 11 (o Tamanduá-Copa 30 a derrubou antes da cuia). 2ª passada com a Cotiazinha na
  frente: Piabinha nv 15 fisgada (de dentro da canoa também se pesca) e **capturada** na 1ª cuia; com a equipe cheia foi para o Viveiro.
  Troca com o Seu Arraia: Pipirim 8 → Bigode 18. De frente para a água: "Usar o Remo?" → "Bigode puxa a canoa!" (modo remo). Depois da
  Usina: cais → Baía Azul, "Usar o Remo?" no píer, remou na baía e chegou à Cidade Coral. Sem erros de console. Textos longos conferidos na caixa de diálogo.

## 3. Tenente Lata (+15 para Mata)
- Equipe da Lata: Grilinho 23, Poraquim 24, Besourim 24, Morcegão 25 (acerola), IA de líder.
- Antes (motor, IA de líder, equipe de mata-passo-8 com Capivarinha, 2 Garrafadas, n=400): Mata 5%, Brasa 74%, Rio 63%.
  `sim-inicial` com a mochila do checkpoint (3 Garrafadas + 2 Chás): Mata 9%, Brasa 86%, Rio 74%.
- Variantes do Besourim (2 Garrafadas): sem Mordida de Saúva → Cara Feia: Mata **20%** (+15), Brasa 74, Rio 65; → Casulo: Mata 26 (+21);
  Besourim 22–23: Mata 4–7. Morcegão (Golpe de Asa e Presa Dupla, ×2 no Mata) também pesa, mas mexer nele subia Brasa a 84–96%.
- Escolhido: **Besourim 24 com Unha de Aço, Cabeçada, Pião de Ferro, Cara Feia** (sem o Inseto ×2). `sim-inicial`: Mata 9 → **26%**,
  Brasa 86 → 86%, Rio 74 → 74%.
- Remédio: o jogador honesto chegou à Lata SEM remédio nas duas passadas (a de 4ª mão do QA e a desta rodada: as 3 Garrafadas + 2 Chás
  de mata-passo-8 foram na A-R4 e no capanga A-US-2). Já havia no chão: Garrafada no pátio da A-R4, 2 Chás no salão da A-US-1, Garrafada
  na passarela da A-US-2 (ramal sem saída). Sem remédio a mudança do Besourim só leva Mata de 3% a 8%. Por isso: **2 Garrafadas à vista
  na antessala da tenente** (A-US-2, (17,3), `item:A-US-2:antessala`). Equipe da passada (com o Bigode), sem remédio → com as duas:
  antes (tenente antiga, sem remédio) Mata 3, Brasa 68, Rio 42 → depois **Mata 27**, Brasa 83, Rio 72 (nenhum trivial).
- **Jogado**: passada completa de mata-passo-8 → A-R4 → Usina (1 derrota no capanga A-US-8 e 2 no A-US-2, revanches vencidas): com a
  tenente nova e SEM as Garrafadas da antessala (antes de existirem) a Lata venceu 4/4; com as 2 Garrafadas da antessala, a partir de
  `mata-rio-pre-lata` (Tamanduá-Copa 34, Bigode 19, Cotiazinha 7, Quero-querinho 8, Gambazinho 8, Corujinha 18): **2 vitórias em 6**.
  O que derruba o Tamanduá-Copa agora é o Morcegão (Golpe de Asa).

## Verificações
- `npx tsc --noEmit` limpo depois de cada edição.
- `npm test`: 37 de 37 no fim (no meio da rodada o teste "errante foge" falhou por uma mudança de outro time na regra das errantes; já corrigida por eles).
- `npm run check -- --rapido`: 15 de 15, 0 erro, os mesmos 5 avisos de antes; curva de níveis ok (líder 1 ás 10, Garcinha 7 na faixa 7–10).
- Vite da porta 5210 encerrado no fim; nenhum processo deixado rodando.
