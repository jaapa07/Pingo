# EQUILIBRIO.md — equilíbrio de batalha e IA (mapa A, modo Aventureiro)

Dono: agente de equilíbrio. Ferramentas: `tools/sim-equilibrio.ts` (simulador) e `tools/equilibrio-referencia.ts` (equipe de referência, pilotos e batalha headless). Rodar: `npx tsx tools/sim-equilibrio.ts` (regrava o bloco de tabelas no fim deste arquivo; `--n`, `--rota`, `--json arquivo`, `--sem-doc`).

## 1. Sintomas investigados e causa real

| Sintoma | Causa encontrada | Correção |
|---|---|---|
| a) nível 62 perdeu para o Mestre nv 43; nv 42 perdeu para treinador nv 36–37 "só com o golpe mais forte" | **O nível não pesa pouco** — pesa muito: com as mesmas espécies e a mesma IA, +2 níveis já dão ~75% de vitória, +5 dão 99% e ±10 decidem 100% (teste novo de monotonia). As causas eram outras, somadas: **(1)** espécies de linha curta que evoluíam aos 20–32 com soma de estágio final (500–530) enfrentavam os iniciais do jogador presos em 405 até o nível 36 (o teste nv 42 usou Tamanduá-Copa/Guaraflama/Botorosa, 405, contra Tatucanastra/Mocó/Calangão, 505): reproduzido em 63% de vitória, com 6 níveis de vantagem; **(2)** "sempre o golpe de maior poder" trava em imunidade de tipo (Comum e Ginga não atingem Assombro; Terra não atinge Vento): Cotiadã/Gambarrão/Saguinete nv 62 perdem 100% para o Neblina batendo Mutirão em criaturas imunes, enquanto os três iniciais finais nv 62 ganham 99,5%; **(3)** `golpesIniciais` dava "os 4 mais recentes" sem olhar o tipo: criaturas criadas por nível nasciam com 2–3 golpes de status. | Somas rebaixadas (seção 3); `golpesIniciais` garante 2 golpes de dano e 1 do próprio tipo; fórmulas de atributos e de dano **não mudaram** (não eram a causa). |
| b) inicial nv 5 perdia para o 1º treinador da rota 1 | A rota já tinha sido rebaixada para nv 3–8 pelo time A1. No simulador a Trilha do Ipê dá 100%. O que sobrava era o 1º duelo com a rival: com nv 5 ela já usava o golpe do tipo do inicial (super-eficaz) — 7–37% de vitória. | Rival 1 com golpes à mão sem o golpe de tipo (83–98%). |
| c) criatura com 1 de vida a menos (19/20) | `criarCriatura` sempre criou com a vida cheia (teste novo: 182 espécies × 5 níveis). O ponto a menos vinha do **esforço**: ao derrotar um adversário, o esforço de Vida aumentava a vida máxima no meio da batalha e a vida atual não acompanhava. | `Batalha.darExp` soma à vida atual o que o esforço acrescentou à máxima; `criarCriatura` limita `o.vida` ao máximo. |
| d) rival "abriu" com a última da equipe | O motor sempre abre com o índice 0 (teste novo). O que acontecia: a IA `treinador` podia **trocar no primeiro turno**, antes de qualquer golpe, quando a 1ª criatura estava em desvantagem grave — na tela, a rival "abria" com outra. | Nenhuma IA troca a criatura que acabou de entrar antes de ela agir um turno. |
| e) `batalha-fim` duas vezes | Emitido por `src/battle/index.ts` e de novo por `src/world/encontros.ts`. | Um emissor só (o módulo de batalha, com `tipo`, `resultado`, `pedido`, `capturada`); o mundo só emite no modo de teste sem batalha. |
| f) IA de líder/conselho igual à de treinador | A IA `treinador` já fazia a conta exata de dano; líder e conselho só acrescentavam heurísticas que quase não mudavam o resultado (50% × 50% em equipes espelhadas). Além disso **os golpes escolhidos à mão dos líderes nunca eram usados no jogo** (`src/world/npcs.ts` criava as equipes com `criarCriatura`) e, ao contrário do spec 7A, **líderes 1–7 usavam itens de cura no Aventureiro** (`iaUsaItens` liberava para toda IA de líder). | IA refeita em escada (seção 4); `criarDeMembro` no mundo; regra de itens do spec 7A. |

## 2. Mudanças no código

- `src/battle/engine.ts`: vida atual acompanha o ganho de vida máxima por esforço.
- `src/battle/criatura.ts`: `golpesIniciais` (2 de dano + 1 do próprio tipo quando existem); `criarCriatura` limita a vida.
- `src/battle/ia.ts`: treinador simplificado (poder × eficácia × mesmo-tipo, distração de 25%); líder e conselho com o modelo de corrida; sem troca antes de agir um turno; `iaUsaItens` pela regra do spec 7A; parâmetros em `AJ`.
- `src/battle/index.ts`: regra de itens; `batalha-fim` único.
- `src/world/deps.ts`, `npcs.ts`, `encontros.ts`: `criarDeMembro` (golpes à mão valem no jogo); sem segundo `batalha-fim`.
- `src/world/zonas.ts`, `jogador.ts`, `index.ts`: zona com defeito (linhas de larguras diferentes, grade vazia, sem warps) é **pulada com `console.error`** em vez de derrubar o mundo; warp ou viagem para zona ausente mostra "Caminho em obras…" (`erroDeZona`, `zonaExiste`, `AVISO_EM_OBRAS`).
- `src/data/treinadores/ginasio-01…08.ts`: equipes/golpes dos 8 líderes (5, 6 e 7 refeitos com as formas certas para o nível); `g01-4` um nível abaixo.
- `src/data/treinadores/liga.ts`: golpes à mão dos 5; equipes de 4 criaturas; itens do Campeão = 2 Garrafadas.
- `src/data/treinadores/a1.ts`, `a2.ts`: golpes da rival 1; `A-GE-2` e `A-GB-3` um nível abaixo.
- `tools/test-batalha.ts`: 5 testes novos (vida cheia + esforço; golpes iniciais; abertura; monotonia nível × força; escada da IA) e `batalha-fim` único no teste headless. 31 testes.

## 3. Somas de atributos corrigidas (53 espécies)

Regra (spec 4.5 corrigido): a criatura aparece na forma que teria no nível; o que não pode é uma linha curta que evolui cedo ter soma de estágio final. Teto da forma final pela evolução: até o nível 12 → 420 · até 20 → 440 · até 24 → 450 · até 26 → 460 · até 28 → 470 · até 33 → 480 · 34–35 → 510 · 36+ → até 540. Os seis atributos foram reduzidos na mesma proporção (o papel de cada espécie não muda). Casulim (casulo que evolui no 7) foi de 400 para 330.

| Nº | Espécie | Evolui no nível | Soma | Vida/Atq/Def/AtqEsp/DefEsp/Vel |
|---|---|---|---|---|
| 14 | Cotiadã | 20 | 500 → 440 | 85/95/70/50/80/120 → 75/84/62/44/70/105 |
| 16 | Casulim | 7 | 400 → 330 | 60/30/120/40/110/40 → 49/25/99/33/91/33 |
| 17 | Bruxaluz | 10 | 500 → 420 | 75/50/70/110/105/90 → 63/42/59/92/88/76 |
| 19 | Saúva-Rainha | 26 | 505 → 460 | 85/110/100/60/80/70 → 77/100/91/55/73/64 |
| 21 | Gambarrão | 24 | 500 → 450 | 100/90/80/65/90/75 → 90/81/72/59/81/67 |
| 23 | Saguinete | 25 | 500 → 460 | 70/100/65/65/70/130 → 64/92/60/60/64/120 |
| 29 | Vagalampo | 27 | 500 → 470 | 70/55/65/115/85/110 → 66/52/61/108/80/103 |
| 34 | Tatucanastra | 30 | 505 → 480 | 95/105/135/45/75/50 → 90/100/128/43/71/48 |
| 36 | Guaiamuque | 28 | 505 → 470 | 80/125/120/50/70/60 → 74/116/112/47/65/56 |
| 38 | Dourado-Rei | 30 | 530 → 480 | 85/110/75/90/75/95 → 77/100/68/81/68/86 |
| 40 | Jaú-Gigante | 35 | 520 → 510 | 130/105/90/65/85/45 → 128/103/88/64/83/44 |
| 42 | Calangão | 30 | 505 → 480 | 85/100/105/85/70/60 → 81/95/100/81/66/57 |
| 44 | Corujão-Orelha | 24 | 505 → 450 | 90/65/75/110/100/65 → 80/58/67/98/89/58 |
| 46 | Quero-Guarda | 28 | 500 → 470 | 75/110/85/50/80/100 → 71/103/80/47/75/94 |
| 50 | Tucanuçu | 30 | 510 → 480 | 85/95/70/105/75/80 → 80/89/66/99/71/75 |
| 52 | Araracanga | 34 | 520 → 510 | 80/80/70/110/80/100 → 79/78/69/108/78/98 |
| 58 | Capivarona | 30 | 510 → 480 | 130/85/85/65/95/50 → 122/80/80/61/90/47 |
| 60 | Ouriçudo | 26 | 500 → 460 | 85/95/115/60/85/60 → 78/88/106/55/78/55 |
| 64 | Bugio-Trovão | 32 | 520 → 480 | 85/100/70/105/75/85 → 79/92/65/97/69/78 |
| 70 | Jaguatiricão | 32 | 508 → 480 | 78/108/68/70/72/112 → 74/102/64/66/68/106 |
| 74 | Ariranhão | 32 | 510 → 480 | 88/112/72/65/70/103 → 83/105/68/61/66/97 |
| 76 | Lontra-Veloz | 30 | 506 → 480 | 72/82/65/95/72/120 → 68/78/62/90/68/114 |
| 82 | Jabutipiranga | 34 | 515 → 510 | 90/85/135/75/100/30 → 89/84/134/74/99/30 |
| 89 | Jararacuçu | 32 | 505 → 480 | 80/115/75/75/70/90 → 76/109/71/71/67/86 |
| 92 | Cascavelão | 30 | 510 → 480 | 82/95/90/95/78/70 → 77/90/85/89/73/66 |
| 94 | Graxaim-da-Névoa | 34 | 515 → 510 | 80/65/70/115/90/95 → 79/65/69/114/89/94 |
| 96 | Quatizão | 28 | 500 → 470 | 85/105/80/60/75/95 → 80/99/75/56/71/89 |
| 98 | Antão | 34 | 525 → 510 | 125/105/95/60/85/55 → 122/102/92/58/83/53 |
| 104 | Seriemão | 30 | 500 → 480 | 78/110/72/60/70/110 → 75/106/69/58/67/105 |
| 108 | Garça-Real | 30 | 505 → 480 | 75/70/65/110/90/95 → 71/66/62/105/86/90 |
| 114 | Piranhão | 30 | 500 → 480 | 72/125/65/55/60/123 → 69/120/62/53/58/118 |
| 116 | Poraquê | 34 | 515 → 510 | 90/70/75/125/85/70 → 89/70/74/124/84/69 |
| 118 | Arraião | 32 | 515 → 480 | 100/90/105/85/95/40 → 93/84/98/79/89/37 |
| 120 | Hipocampo | 34 | 538 → 510 | 78/65/95/115/100/85 → 74/62/90/109/95/80 |
| 126 | Medusão | 30 | 510 → 480 | 90/60/65/100/125/70 → 85/56/61/94/118/66 |
| 128 | Aruazão | 32 | 500 → 480 | 95/75/140/65/95/30 → 91/72/135/62/91/29 |
| 130 | Siri-Couraça | 34 | 520 → 510 | 75/120/125/50/75/75 → 74/118/123/49/73/73 |
| 134 | Pinguimar | 32 | 515 → 480 | 80/95/80/75/85/100 → 75/88/75/70/79/93 |
| 136 | Gralha-Azul | 30 | 510 → 480 | 75/80/70/100/85/100 → 71/75/66/94/80/94 |
| 138 | Serelepão | 28 | 505 → 470 | 80/95/85/70/85/90 → 75/88/79/65/79/84 |
| 140 | Maracajá-Nevado | 34 | 530 → 510 | 75/120/75/65/80/115 → 72/115/72/63/77/111 |
| 142 | Grilão-Elétrico | 26 | 500 → 460 | 65/75/70/105/75/110 → 60/69/64/97/69/101 |
| 144 | Herculão | 34 | 535 → 510 | 85/135/120/45/85/65 → 81/129/114/43/81/62 |
| 148 | Caranguejeirão | 30 | 505 → 480 | 85/115/90/55/85/75 → 81/109/86/52/81/71 |
| 150 | Jataí-Rainha | 26 | 510 → 460 | 85/55/90/105/115/60 → 77/49/81/95/104/54 |
| 152 | Marimbondão | 28 | 500 → 470 | 70/115/65/60/70/120 → 66/108/61/56/66/113 |
| 154 | Cigarrão | 24 | 500 → 450 | 75/60/80/110/85/90 → 68/54/72/99/76/81 |
| 158 | Louva-Mestre | 30 | 525 → 480 | 75/130/80/55/80/105 → 69/119/73/50/73/96 |
| 162 | Tuco-Escavador | 32 | 505 → 480 | 80/115/105/45/70/90 → 76/109/100/43/66/86 |
| 164 | Cupinzeiro-Vivo | 34 | 525 → 510 | 110/95/140/60/95/25 → 107/93/136/58/92/24 |
| 166 | Mocó-da-Rocha | 30 | 505 → 480 | 85/95/115/55/75/80 → 81/90/110/52/71/76 |
| 168 | Andorinhão-da-Cachoeira | 32 | 515 → 480 | 70/100/70/75/70/130 → 66/93/65/70/65/121 |
| 172 | Noitão | 34 | 530 → 510 | 80/75/70/115/85/105 → 77/72/67/111/82/101 |

Não mexidos (fora do alcance desta rodada): formas finais por pedra ou amizade (Beija-Arco-Íris 520, Leão-Dourado 525, Estrelaça 520, Papagálio 510, Vampirinha 535) — o que as segura é quando a pedra aparece no mapa.

## 4. IA: a escada

- **novato**: 70% ao acaso, 30% o mais forte (igual).
- **treinador**: prefere o golpe forte e super-eficaz sem fazer conta de atributos; distrai-se 1 vez em 4; troca em desvantagem grave.
- **líder**: modelo de corrida (quem derruba quem primeiro; status, reforço, cura e troca valem pelo que mudam na corrida); 10% de deslize; remédio abaixo de ~1/3.
- **conselho**: a mesma conta sem deslize, estimativa mais fina, troca mais cedo, nocaute mais seguro, varrida, ás guardado.

Equipes espelhadas, sem itens (teste `escada da IA`, 200–300 batalhas): treinador × novato 81% · líder × treinador 52% · conselho × líder 52% · conselho × treinador 58%. Contra o jogador "esperto", com as mesmas equipes (tabela 6 abaixo), a escada é bem mais aberta porque líder e conselho também usam os remédios.

## 5. Como ler as tabelas

- **Equipe de referência**: inicial + capturas mais comuns das rotas já abertas (tabelas de habitat), com troca da captura mais fraca do passo 4 em diante; ás 2 níveis abaixo do ás do líder nos passos 1–3, 3 abaixo do 4 ao 8, 4 abaixo do Campeão; capturas 1–3 níveis abaixo do ás; golpes = 3 melhores de dano + 1 de status; um pouco de esforço.
- **Pilotos**: `bobo` (maior poder, nunca troca, sem item), `esperto` (melhor golpe por eficácia/mesmo-tipo, troca em desvantagem clara, remédio abaixo de 1/3, no máximo 2 por criatura), `ia` (a IA `treinador` do jogo pilotando o jogador).
- Cada número é a média dos três iniciais.

## 6. Antes × depois (piloto esperto, salvo indicação)

| Confronto | Antes (esperto / bobo) | Depois (esperto / bobo) | Meta (esperto / bobo) |
|---|---|---|---|
| Líder 1 Gaivota | 0% / 0% | 56% / 57% | 55–75% / 25–45% |
| Líder 2 Lia Teia | 3% / 0% | 72% / 17% | 55–75% / 25–45% |
| Líder 3 Netuno | 1% / 0% | 71% / 14% | 55–75% / 25–45% |
| Líder 4 Iracema | 45% / 5% | 66% / 38% | 55–75% / 25–45% |
| Líder 5 Volta | 99% / 91% | 56% / 19% | 55–75% / 25–45% |
| Líder 6 Benta | 98% / 33% | 54% / 23% | 55–75% / 25–45% |
| Líder 7 Bigorna | 38% / 3% | 56% / 7% | 55–75% / 25–45% |
| Líder 8 Buriti | 91% / 17% | 64% / 5% | 55–75% / 25–45% |
| Treinadores de rota e de ginásio (176) | média 85%, 48 abaixo de 90% | média 99%, 3 abaixo de 90% (80–82%) | ≥ 90% |
| Liga, sequência inteira (esperto) | 0% | 50% | 35–55% |
| +10 níveis: esperto / bobo | 100% / 41–100% (Liga inteira 3%) | 100% / 83–100% (Liga inteira 83%) | ≥ 95% |
| −10 níveis contra líder (vitórias do esperto) | 0% | 0–1% | ≤ 15% |
| Escada da IA: vitórias do adversário com novato / treinador / líder / conselho (média de 13 equipes) | 30% / 41% / 45% / 46% | 9% / 20% / 33% / 35% | crescente |
| IA espelhada sem itens: líder × treinador · conselho × líder | 49,8% · 47,4% | 52% · 52% | > 50% |

(O "antes" foi medido com a primeira versão da equipe de referência, ás 3 abaixo em todos os passos; a tabela completa do "antes" está no relatório do agente.)

## 7. Pendências honestas

1. **Piloto bobo abaixo da meta (25–45%) em quase todos os líderes**: ele não troca, não usa remédio e insiste em golpe que o tipo anula. Com o esperto na faixa, subir o bobo exigiria líderes mais fracos (o esperto sairia da faixa por cima). Só os líderes 1 e 4 ficam perto da faixa.
2. **Variação por inicial é grande** (ex.: líder 1 — Mata ~10%, Rio ~95%): a média bate a meta, mas o inicial de Mata sofre nos ginásios 1–2, como no gênero. Ajuste fino por inicial fica para o jogo honesto.
3. **Começo do jogo é letal**: nos níveis 8–12 quase tudo cai em dois golpes; por isso o líder 1 tem só 2 criaturas e o 2 tem 3. Se o autor quiser equipes maiores no começo, é preciso mexer na fórmula de vida ou de dano em nível baixo (não foi feito: a fórmula é contrato de docs/BATALHA.md).
4. **Liga com 4 criaturas por Mestre** (o Campeão também): com 5–6 a sequência não passava de 2%. O jogador de referência leva mochila cheia (15 Garrafadas, 10 Elixires, 6 Chás de Guaraná); com mochila modesta a sequência cai para ~15%.
5. **Rival 5** (depois da Liga, 6 criaturas nv 42–45, IA líder): 19–83% conforme o inicial; sem golpes à mão. Não foi ajustada.
6. **+10 níveis com o piloto bobo** contra o Campeão: ~80% (o golpe mais forte do inicial de Mata é Terra, que não atinge o Gaviãozão). Com esperto e com a IA é 100%.
7. **Conselho × líder** em equipes espelhadas sem itens é só 52%: a diferença real aparece com remédios e contra o jogador (tabela 6).
8. Faixas 4.5 a conferir pelo verificador: wild e treinadores comuns de A7/A8/A-R5/A-GB ainda usam 1ª forma nos níveis 28–34 (certo pela regra corrigida, pois essas linhas evoluem aos 34–36) e `g06-1`/`g06-3` usam Morceguim nv 28–30 (a linha evolui no 22: deveria ser Morcegão). Zonas e turmas de ginásio não foram mexidas.
9. `erroDeZona` não tem teste automático em Node (o carregador usa `import.meta.glob`, que só existe no Vite); foi conferido só por compilação.
10. Mapa B, ginásio 9 em diante e duplas não foram simulados.

<!-- sim:inicio -->
_Gerado por `npx tsx tools/sim-equilibrio.ts` (N = 300 por confronto de chefe, 80 por treinador de rota; sementes fixas)._

### 1. Equipe de referência do jogador por passo

Derivada das tabelas de habitat (grama, caverna e árvore das zonas do mapa A abertas até o passo). Ás do jogador = ás do chefe − 2 nos passos 1–3, − 3 do 4 ao 8 e − 4 na Liga.

| Passo | Ás do chefe | Inicial Mata | Inicial Brasa | Inicial Rio | Remédios |
|---|---|---|---|---|---|
| 1 | 10 | Tamanduí 8, Cotiazinha 7, Pipirim 6, Cigarrim 6 | Guaraxim 8, Cotiazinha 7, Pipirim 6, Cigarrim 6 | Botinho 8, Cotiazinha 7, Pipirim 6, Cigarrim 6 | 3× cha-cidreira |
| 2 | 17 | Tamanduí 15, Cotiazinha 14, Pipirim 13, Cigarrim 13, Tatuzim 12 | Guaraxim 15, Cotiazinha 14, Pipirim 13, Cigarrim 13, Tatuzim 12 | Botinho 15, Cotiazinha 14, Pipirim 13, Cigarrim 13, Tatuzim 12 | 4× cha-cidreira |
| 3 | 22 | Tamanduá-Copa 20, Cotiazinha 19, Bem-te-viço 18, Cigarrim 18, Tatuzim 17, Morceguim 17 | Guaraflama 20, Cotiazinha 19, Bem-te-viço 18, Cigarrim 18, Tatuzim 17, Morceguim 17 | Botorosa 20, Cotiazinha 19, Bem-te-viço 18, Cigarrim 18, Tatuzim 17, Morceguim 17 | 3× cha-cidreira, 2× garrafada |
| 4 | 26 | Tamanduá-Copa 23, Cotiadã 22, Bem-te-viço 21, Pintinhas 21, Tatuzim 20, Morceguim 20 | Guaraflama 23, Cotiadã 22, Bem-te-viço 21, Pintinhas 21, Tatuzim 20, Morceguim 20 | Botorosa 23, Cotiadã 22, Bem-te-viço 21, Pintinhas 21, Tatuzim 20, Morceguim 20 | 4× garrafada |
| 5 | 30 | Tamanduá-Copa 27, Cotiadã 26, Bem-te-viço 25, Pintinhas 25, Vagalumim 24, Morcegão 24 | Guaraflama 27, Cotiadã 26, Bem-te-viço 25, Pintinhas 25, Vagalumim 24, Morcegão 24 | Botorosa 27, Cotiadã 26, Bem-te-viço 25, Pintinhas 25, Vagalumim 24, Morcegão 24 | 5× garrafada |
| 6 | 33 | Tamanduá-Copa 30, Cotiadã 29, Capivarinha 28, Pintinhas 28, Vagalampo 27, Morcegão 27 | Guaraflama 30, Cotiadã 29, Capivarinha 28, Pintinhas 28, Vagalampo 27, Morcegão 27 | Botorosa 30, Cotiadã 29, Tatuzim 28, Pintinhas 28, Vagalampo 27, Morcegão 27 | 6× garrafada |
| 7 | 36 | Tamanduá-Copa 33, Cotiadã 32, Capivarona 31, Pintinhas 31, Vagalampo 30, Jararaquinha 30 | Guaraflama 33, Cotiadã 32, Capivarona 31, Pintinhas 31, Vagalampo 30, Jararaquinha 30 | Botorosa 33, Cotiadã 32, Tatucanastra 31, Pintinhas 31, Vagalampo 30, Jararaquinha 30 | 6× garrafada, 1× elixir-andiroba |
| 8 | 40 | Bandeirão 37, Urubu-Rei 36, Capivarona 35, Pintinhas 35, Vagalampo 34, Jararacuçu 34 | Lobo-Fornalha 37, Urubu-Rei 36, Capivarona 35, Pintinhas 35, Vagalampo 34, Jararacuçu 34 | Iaraboto 37, Urubu-Rei 36, Tatucanastra 35, Pintinhas 35, Vagalampo 34, Jararacuçu 34 | 6× garrafada, 2× elixir-andiroba |
| Liga | 46 | Bandeirão 42, Urubu-Rei 41, Capivarona 40, Pintinhas 40, Vagalampo 39, Jararacuçu 39 | Lobo-Fornalha 42, Urubu-Rei 41, Capivarona 40, Pintinhas 40, Vagalampo 39, Jararacuçu 39 | Iaraboto 42, Urubu-Rei 41, Tatucanastra 40, Pintinhas 40, Vagalampo 39, Jararacuçu 39 | 15× garrafada, 10× elixir-andiroba, 6× cha-guarana, 4× pomada-copaiba, 6× garapa |

### 2. Líderes 1–8 (meta: esperto 55–75%, bobo 25–45%)

| Líder | Equipe do líder | Esperto | Bobo | IA do jogo | Meta |
|---|---|---|---|---|---|
| 1 Mestre Gaivota | Garcinha 7, Tucaninho 10 | 12% | 16% | 10% | FORA |
| 2 Lia Teia | Cupinzim 15, Vagalumim 16, Caranguejeirinha 17 | 72% | 17% | 62% | FORA |
| 3 Marujo Netuno Silva | Medusim 20, Caranguejim 21, Poraquim 21, Botorosa 22 | 71% | 14% | 33% | FORA |
| 4 Iracema Lua | Beija-florzim 24, Manatim 24, Catingueirinho 24, Coralzinha 26 | 66% | 38% | 35% | ok |
| 5 Faroleiro Volta | Poraquim 28, Ararinha 28, Vagalampo 28, Grilão-Elétrico 30 | 56% | 19% | 38% | FORA |
| 6 Dona Benta Sombra | Urubuzim 31, Urutauzim 31, Corujão-Orelha 31, Noitim 32, Jaguatiricão 33 | 54% | 23% | 20% | FORA |
| 7 Engenheira Bigorna | Tatucanastra 34, Siri-Couraça 34, Preguinho 35, Tuco-Escavador 36 | 56% | 7% | 23% | FORA |
| 8 Dona Buriti | Jabutipiranga 38, Antão 38, Jataí-Rainha 38, Serelepão 38, Bandeirão 40 | 64% | 5% | 14% | FORA |

### 3. Treinadores de rota e de ginásio (meta: esperto ≥ 90%)

| Zona | Treinadores | Esperto (média) | Pior caso | Bobo (média) | Abaixo de 90% |
|---|---|---|---|---|---|
| Trilha do Ipê | 6 | 100% | A-R1-4 99% | 100% | — |
| Campos de Restinga | 8 | 79% | A-R2-3 5% | 73% | A-R2-3 5%, A-R2-4 86%, A-R2-5 41% |
| Mata dos Sabiás | 8 | 100% | A-MS-4 98% | 100% | — |
| Bosque Alto | 2 | 100% | A3-1 100% | 99% | — |
| Trilha dos Cipós | 8 | 99% | A-R3-8 95% | 90% | — |
| Gruta do Eco | 7 | 95% | A-GE-2 80% | 88% | A-GE-2 80% |
| Porto Sereia | 3 | 99% | A4-2 98% | 99% | — |
| Estrada do Buriti | 7 | 100% | A-R7-1 100% | 99% | — |
| Rival Tainá | 12 | 96% | rival-1-mata 81% | 82% | rival-1-mata 81% |
| Estrada da Usina | 7 | 100% | A-R4-3 99% | 99% | — |
| Usina Velha — Salão dos Geradores | 4 | 100% | A-US-1 100% | 99% | — |
| Usina Velha — Passarelas | 3 | 100% | A-US-5 100% | 100% | — |
| Usina Velha — Porão das Turbinas | 3 | 100% | A-US-8 100% | 100% | — |
| Baía Azul | 6 | 100% | A-BA-1 100% | 100% | — |
| Cidade Coral | 2 | 100% | A5-1 100% | 100% | — |
| Ilha do Farol | 6 | 100% | A6-1 100% | 100% | — |
| Farol — Térreo | 2 | 100% | A6-FA-1 100% | 100% | — |
| Farol — 2º andar | 3 | 100% | A6-FA-3 99% | 99% | — |
| Farol — 3º andar | 2 | 100% | A6-FA-6 100% | 100% | — |
| Farol — Sala da Lanterna | 2 | 100% | A6-FA-8 100% | 100% | — |
| Gruta Breu | 5 | 96% | A-GB-3 84% | 95% | A-GB-3 84% |
| Gruta Breu — Lago do Fundo | 4 | 100% | A-GB-6 100% | 100% | — |
| Serra Fumaça | 5 | 100% | A7-1 100% | 100% | — |
| Encosta da Fumaça | 7 | 100% | A-R5-1 100% | 100% | — |
| Vila Ferrugem | 5 | 100% | A8-1 100% | 100% | — |
| Praia das Tartarugas | 4 | 100% | A-PR-1 100% | 100% | — |
| Manguezal | 5 | 99% | A-MG-5 96% | 98% | — |
| Ginásio de Vila Caiçara | 4 | 98% | g01-4 94% | 98% | — |
| Ginásio de Bosque Alto | 4 | 97% | g02-4 91% | 84% | — |
| Ginásio de Porto Sereia | 5 | 100% | g03-1 100% | 95% | — |
| Ginásio de Cidade Coral | 5 | 100% | g04-5 98% | 99% | — |
| Ginásio da Ilha do Farol | 4 | 100% | g05-1 100% | 100% | — |
| Ginásio de Serra Fumaça | 4 | 100% | g06-1 100% | 100% | — |
| Ginásio de Vila Ferrugem | 5 | 100% | g07-1 100% | 98% | — |
| Ginásio de Vila Buriti | 5 | 100% | g08-1 100% | 97% | — |
| Ginásio de Chapada Rubra | 4 | 100% | g09-1 100% | 90% | — |

Total: 176 treinadores · média 98% · 6 abaixo de 90%.

Chefes de história com IA de líder (sem meta própria; esperado entre treinador de rota e líder):

| Chefe | Equipe | Esperto | Bobo |
|---|---|---|---|
| A-US-lata Lata | Grilinho 23, Poraquim 24, Besourim 24, Morcegão 25 | 59% | 25% |
| A6-rebite Rebite | Besourim 26, Morcegão 26, Poraquim 27, Jacaretinga 28 | 87% | 61% |
| rival-5-brasa Tainá | Gaviãozão 42, Vagalampo 42, Sapo-Cururuí 42, Bugio-Trovão 43, Garça-Real 43, Lobo-Fornalha 45 | 15% | 0% |
| rival-5-rio Tainá | Gaviãozão 42, Vagalampo 42, Bruxaluz 42, Bugio-Trovão 43, Garça-Real 43, Iaraboto 45 | 34% | 3% |
| rival-5-mata Tainá | Gaviãozão 42, Vagalampo 42, Calangão 42, Bugio-Trovão 43, Garça-Real 43, Bandeirão 45 | 85% | 0% |

### 4. Liga dos Guardiões — 5 lutas seguidas, sem cura grátis, com os remédios da mochila (meta: esperto 35–55% na sequência)

| Piloto | Passou da 1ª | da 2ª | da 3ª | da 4ª | Sequência inteira |
|---|---|---|---|---|---|
| esperto | 96% | 96% | 92% | 88% | **50%** |
| bobo | 45% | 2% | 0% | 0% | **0%** |
| ia | 62% | 55% | 23% | 5% | **0%** |

Cada luta da Liga isolada (equipe inteira e curada, mesmos remédios):

| Luta | Equipe | Esperto | Bobo |
|---|---|---|---|
| Mestra Maré | Medusão 40, Jararacuçu 40, Sapo-Cururuí 40, Jaú-Gigante 41 | 92% | 44% |
| Ferreiro Brasa-Viva | Calangão 41, Tucanuçu 41, Siri-Couraça 41, Escorpião-Rei 42 | 100% | 6% |
| Pajé Neblina | Corujão-Orelha 42, Polvão 42, Jaguatiricão 42, Noitão 43 | 96% | 35% |
| Domadora Pampa | Seriemão 43, Emaçu 43, Capivarona 43, Pintada 44 | 99% | 48% |
| Campeão Cacique Aracê | Gaviãozão 42, Poraquê 43, Leão-Dourado 44, Pirarucão 46 | 66% | 10% |

### 5. Peso do nível (meta: 10+ níveis acima vence ≥ 95% de qualquer coisa; 10 abaixo perde ≥ 85% contra líder)

| Chefe | +10 esperto | +10 bobo | −10 esperto (vitórias) | Meta |
|---|---|---|---|---|
| Líder Mestre Gaivota | 100% | 100% | n/a (nível < 5) | ok |
| Líder Lia Teia | 100% | 100% | 0% | ok |
| Líder Marujo Netuno Silva | 100% | 100% | 0% | ok |
| Líder Iracema Lua | 100% | 100% | 0% | ok |
| Líder Faroleiro Volta | 100% | 100% | 0% | ok |
| Líder Dona Benta Sombra | 100% | 95% | 0% | FORA |
| Líder Engenheira Bigorna | 100% | 100% | 0% | ok |
| Líder Dona Buriti | 100% | 99% | 0% | ok |
| Mestra Maré | 100% | 100% | 0% | ok |
| Ferreiro Brasa-Viva | 100% | 100% | 1% | ok |
| Pajé Neblina | 100% | 100% | 0% | ok |
| Domadora Pampa | 100% | 99% | 0% | ok |
| Campeão Cacique Aracê | 100% | 83% | 0% | FORA |
| Liga inteira (5 lutas) | 100% | 83% | 0% | ok |
| Treinadores de rota (176), bobo com ás +10 | — | média 100%, pior  100% | — | ok |

### 6. Escada da IA — mesmas equipes, só muda quem pilota o adversário (taxa de vitória DO ADVERSÁRIO contra o jogador esperto)

| Equipe adversária | novato | treinador | lider | conselho |
|---|---|---|---|---|
| Líder Mestre Gaivota | 36% | 76% | 95% | 97% |
| Líder Lia Teia | 9% | 29% | 52% | 51% |
| Líder Marujo Netuno Silva | 16% | 49% | 62% | 65% |
| Líder Iracema Lua | 13% | 27% | 43% | 40% |
| Líder Faroleiro Volta | 18% | 34% | 55% | 55% |
| Líder Dona Benta Sombra | 20% | 44% | 50% | 55% |
| Líder Engenheira Bigorna | 12% | 27% | 45% | 56% |
| Líder Dona Buriti | 3% | 4% | 32% | 35% |
| Mestra Maré | 0% | 0% | 7% | 10% |
| Ferreiro Brasa-Viva | 0% | 0% | 0% | 0% |
| Pajé Neblina | 0% | 0% | 5% | 6% |
| Domadora Pampa | 0% | 1% | 0% | 2% |
| Campeão Cacique Aracê | 2% | 8% | 28% | 26% |
| **Média** | **10%** | **23%** | **37%** | **38%** |

<!-- sim:fim -->
