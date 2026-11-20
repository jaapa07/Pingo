# QA-MAPA-B-2 — jogo honesto do mapa B INTEIRO com a curva nova (Platô → … → Conselho → créditos), Aventureiro

Diário vivo do QA (o contêiner pode reiniciar: retomar daqui).
Curva medida: líderes 9–16 = 55/58/61/63/66/68/70/72, Garrote 74, rival 8 75, Conselho 73–77; Chocalho só puxa
quem está 5+ atrás depois da Liga; `FATOR_EXP_POS_LIGA = 0.55`. Estimativa (tools/estima-chegada-b.ts --fator-exp 0.55):
−2 no líder 9, 0 nos 10–12, +2 nos 13–15, +3 no 16, 0 no Conselho.

Ferramentas em `tools/testes/qa4/` (cópia do QA 3 com nomes `qa4-*`):
- `qa4-run.sh <roteiro> <seg> [args]`: Vite próprio em **5209** (`--strictPort`, sem HMR/vigia) com o plugin `qa4-vite.mjs`
  que liga `MAPA_B_ABERTO` SÓ em memória; `qa4-run.sh parar` desliga o Vite que ele ligou (PID em scratchpad/qa4/vite.pid).
- `qa4-lib.mjs` + `qa4-piloto.js`: piloto que joga pelo teclado NA TELA (política esperta de tools/equilibrio-referencia.ts).
- `qa4-jogar.mjs <etapa> [etapa-final]`, `qa4-ginasios.mjs` (roteiros dos ginásios).
- Checkpoints em `tools/testes/qa4/saves/` (partida `campeao.json` = checkpoint do QA 2; daí em diante nada injetado).

## Marcos
- (20/11) leitura dos contratos; ferramentas do QA 3 copiadas para qa4.
- (20/11) Piloto estendido: roda de capoeira (devolve a seta chamada na batida, lendo `data-roda-*`), Voo pelo
  mapa-múndi (toque no marcador, 2 toques + confirmação), passo `pisar` (portais do 15), roteiros dos ginásios 12–16
  (soluções dos comentários das zonas), etapas novas `tunel lab gin13 veredas serra gin14 nevoas gin15 tupa gin16 pico
  conselho`; `chegada` registra ás, média, Δ, dinheiro e remédios na entrada do ginásio E na frente do líder.
- Estimativa de referência (`npx tsx tools/estima-chegada-b.ts --limiar 5 --fator-exp 0.55 --sementes 20`), ás / média na
  frente do chefe: 9 → 52,5/48,9 · 10 → 57,0/53,2 · 11 → 60,2/56,5 · 12 → 62,3/58,7 · 13 → 66,8/63,1 · 14 → 69,3/65,5 ·
  15 → 71,1/67,5 · 16 → 73,6/70,0 · Conselho → 75,8/71,9.
- (20/11) **trem → gin9** (de `campeao`): Platô, trem, Vila Cascavel, B-R1, B-CE, B-PA norte, B2 — 0 derrotas, 5 voltas ao
  Posto por desgaste. Capturas 46, 128. Na entrada do ginásio 9: equipe 54/49/48/48/47/47 (ás −1, média 48,8 = −6,2);
  **$132** (o dinheiro acabou em remédios). **Líder 9: DERROTA na 1ª** (26 turnos; entrou com 2 desmaiadas, sem Chá),
  vitória na 2ª (12 turnos; Zefa usou 2 remédios). Checkpoint `passo-9` ($5 326).
- (20/11) **ninhal → gin12** (de `passo-9`), 0 treino extra exceto 8 selvagens depois da 2ª derrota no Arame:
  - Tenente Arame (ás 57): equipe 55/51/50/49/49/49 → **1/3** (derrotas em 19 e 15 turnos; nas duas o ás entrou desmaiado:
    o piloto andava pela grama do ninhal entre a cura e o Arame — corrigido no piloto: agora prepara a equipe já ao lado do chefe).
  - Tenente Rebite (ás 56): 1/1, 33 turnos, 1 Elixir.
  - Líder 10 Topázio (ás 58): na frente dele 58/54/54/54/54/54 (Δ 0, média −3,3) → **1/2** (derrota em 16 turnos, vitória em 13; ele usou 2 remédios).
  - B-CH-4 (treinador de rota, 57–58) derrotou a equipe uma vez (entrou com 1 desmaiada). Boitatá vencido (não capturado).
  - Rival 6 (ás 59): 59/57/55/55/54/54 (Δ 0) → **derrota** (12 turnos; a história segue, flag marcada).
  - Líder 11 Labareda (ás 61): na frente 59/57/56/55/55/55 (Δ −2, média −4,8) → 1/1 (15 turnos, ela usou 3 remédios).
  - Ginásio 12: **roda de capoeira jogada na tela pelo piloto (3 rodas, sem tropeço)**; g12-5 derrotou a equipe uma vez
    (entrou com 3 desmaiadas). Líder 12 Gingado (ás 63): na frente 62/58/58/57/57/57 (Δ −1, média −4,8) → 1/1 (16 turnos).
  - Dinheiro oscilando entre $246 e $14 k (derrota corta metade); remédios comprados sempre que dá.
- (20/11) **túnel → lab → gin13 → veredas**. Piloto: subir/descer poço de mergulho (A em cima do poço), Força na Gruta do
  Fôlego, trecho leste do túnel sem volta ao Posto (segue em frente). Captura 112.
  - Laboratório: 8 capangas 0 derrotas; Zinabre 1/1 (11 t); **Lata (ás 65) 1/2** com a equipe 62/60/60/58/58/58 (derrota
    em 11 t entrando com 2 desmaiadas depois do Zinabre — a sequência é seguida; vitória em 19 t).
  - **BUG CORRIGIDO** `src/data/zonas/B6-ginasio.ts`: g13-5 (27, 7) com visão 2 vinha até (26, 7) e ficava ali, TAPANDO a
    única passagem para a boca do tanque C (26, 6): jogador preso no ginásio. Visão 1 (ele só enxerga (26, 7), ao lado).
  - Líder 13 Peçonha (ás 66): na frente 63/61/61/59/59/59 (Δ −3, média −5,7) → **1/3** (7 t entrando com 3 desmaiadas e
    sem Chá; 15 t; vitória em 23 t, ela usou 2 remédios). Dinheiro caiu a **$244** depois das duas derrotas.
  - B-VV: 8 treinadores 0 derrotas (2 voltas ao Posto). Queixada-Caipora (63) apareceu e o piloto fugiu.
- (20/11) **serra** (B-R4 → B7): travessia de mão única (2 pedregulhos de Força, 2 paredões, saliências), 9 treinadores,
  1 derrota (B-R4-5, equipe gasta sem Posto no meio). **Rival 7**: perdida em 1 turno com 5 desmaiadas — o gatilho
  (24..25, 36) fica na estrada logo na chegada de B7, depois de uma subida de mão única sem Posto; o piloto foi direto ao
  Posto e passou pelo gatilho (ver Propostas). Simulador com a equipe curada (save `b-vv`): 84%.
- Ginásio 14: pistas 1–3 pela solução, sem tropeço. Líder 14 Pinhão (ás 68): na frente 64/64/62/60/60/60 (Δ −4, média
  −6,3) → 1ª mão **1/2** (+ derrota para g14-5), 2ª mão **1/3** (11 t com o ás desmaiado; 17 t; vitória em 25 t).
  **Volta do salão da líder:** o salão só se liga à porta pelas três pistas de gelo (row 7 é parede) e o Voo não funciona
  dentro do ginásio; existe caminho de volta (busca com os blocos, ~90 movimentos: pista 3 ao contrário com 3 empurrões,
  pista 2, pista 1) — o piloto fez a volta na tela até o saguão. Não é trava, mas é longo e sem aviso (ver Propostas).
- Simulador com as equipes REAIS dos checkpoints (`qa4-sim-save.mts`, 200 lutas, equipe curada, remédios do save):
  líder 9 91% · Arame 87% · líder 10 61% · rival 6 90% · líder 11 84% · líder 12 79% · Zinabre→Lata 99%→12% (seguidas) ·
  líder 13 34% · rival 7 84% · líder 14 52%.
- (20/11) **gin14 (3ª mão) → névoas → gin15**: líder 14 **1/2** (5 t com 3 desmaiadas; vitória em 26 t) e a volta pelo
  gelo feita na tela até a porta (checkpoint `passo-14`). B-R5: 8 treinadores, 0 derrotas, 4 voltas ao Posto de B7.
  Portais do ginásio 15 pela solução (7 saltos + 3 giros) sem erro.
  - **Líder 15 Jaci (ás 70, seis criaturas 68–70): 0/8** com a equipe 65/65/64/61/61/61 (Δ −5 na entrada, média −7),
    sempre entrando CURADA (15–26 turnos, ela usa 1–3 remédios). Entre as derrotas o piloto treinou 8 selvagens (+1 nível
    no ás em 7 derrotas). Dinheiro: $8 401 → **$15** (cada derrota corta metade; sem dinheiro para Chá/Elixir).
  - Simulador com a equipe real (`b8`): **3%**; a mesma equipe com o ás 68: 37%; com o ás 70: 70%; 72: 85%.
  - 2ª mão com treino de jogador (blocos de 6 selvagens + Posto, 36 por derrota): vitória na **8ª** tentativa, depois de
    **216 selvagens** de treino, com a equipe 70/67/65/65/65/65 (Δ 0), 21 turnos. Volta da ilha da líder por portais
    (P15 → P10, P11 → P5, P6 → P0; busca em ilha × hora).
- Contagem de batalhas por trecho: ~metade dos selvagens termina em FUGA (o piloto foge com equipe gasta ou com o
  selvagem 4+ acima da da frente, como um jogador cuidadoso). O estimador conta 7 selvagens VENCIDOS por zona: é a
  principal diferença entre a chegada medida e a estimada do 13 em diante.
