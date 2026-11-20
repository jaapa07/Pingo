# QA-MAPA-B-1 — jogo honesto do mapa B, trecho 1 (Liga → trem → Vila Cascavel → … → Cidade Ginga), modo Aventureiro

Diário vivo do QA que JOGA o trecho B-1 (o contêiner pode reiniciar: retomar daqui).
Ferramentas em `tools/testes/qa3/` (cópias adaptadas do QA 2, nomes únicos `qa3-*`):
- `qa3-run.sh <roteiro> <seg> [args]` liga o Vite próprio em **5205** (`--strictPort`, sem HMR/vigia) com o plugin
  `qa3-vite.mjs` que liga `MAPA_B_ABERTO` SÓ em memória (src/core/progresso.ts não muda); `qa3-run.sh parar` desliga
  o Vite que ele mesmo ligou (PID em scratchpad/qa3/vite.pid; nada de pkill por nome).
- `qa3-lib.mjs` + `qa3-piloto.js` = lib/piloto do QA 2 (joga pelo teclado, política "esperta"); única mudança no
  piloto: `Q.viajar` atravessa também o mapa B (`Q.mapas`), nunca por trem/saveiro.
- `qa3-jogar.mjs <etapa> [etapa-final]`: etapas `trem vila pantanal-grande gin9 ninhal estrada mina gin10 chapada gin11 roda gin12`;
  `qa3-ginasios.mjs`: roteiros dos ginásios 9–11 (soluções dos comentários das zonas).
- Checkpoints em `tools/testes/qa3/saves/` (ponto de partida `campeao.json` = cópia do checkpoint do QA 2).

## Marcos
- (20/11) leitura dos contratos; ferramentas montadas. Partida: `campeao` em A-LG (15,55), $31 132, equipe
  48/46/46/45/45/45 (Gaviãozão 12, 14, 9, 27, 34, 32), mochila sem garrafada; Chocalho do Mutirão (exp partilhada).
  Ginásio 12 (`B5-ginasio`) ainda não existe.
- (20/11) **trem** (A-LG → a pé pelo mapa A → A4-estacao → trem → B1-estacao): Platô Posto+Venda (10 garrafadas,
  3 chás, 2 elixires = $16 500); evento de chegada ok (maquinista, Rádio Cipó, salvar). Checkpoint `b1` (B1, $14 632).
- (20/11) **vila** (Vila Cascavel, Vereda B-R1, Cerrado B-CE): 12 treinadores, 0 derrotas; a equipe voltou 2× ao Posto
  de B1 por desgaste no Cerrado (gastou 9 garrafadas, 4 elixires, 3 chás). Captura: 50 (Tucano). Checkpoint `cerrado`.
- (20/11) **pantanal-grande** (B-PA norte, B2): 5 treinadores, 0 derrotas. Captura: 164. Centro de Reabilitação antes do
  ninhal: fala certa (filhotes só depois). Checkpoint `b2` (B2, $24 952).
- (20/11) **gin9** (B2-ginasio): os 3 cercados de lama pela solução, g09-4, g09-5, Zefa → insígnia 9, 0 derrotas.
  Equipe AO CHEGAR: 55/53/52/51/50/50 contra ás 49 (**Δ +6**). Checkpoint `passo-9` ($33 572).
- Capturas de tela: `page.screenshot` estourava 60 s com a máquina cheia (load ~60); `qa3-lib.mjs` agora usa
  `Page.captureScreenshot` do CDP (4 s).
- (20/11) **ninhal** (B-PA sul): 4 capangas + tenente Arame (ás 50) → `pantanal-ok`, 0 derrotas (3 voltas ao Posto de B2
  por desgaste no Pantanal). Centro de Reabilitação: Tuiuiuzim (105) adotado no **nível 12** (vai ao Viveiro: equipe cheia).
  Canal sul → Porto Pantaneiro. Checkpoint `b9` (equipe 58/57/57/57/56/55, $29 972).
- (20/11) **estrada** (B-R2, B3): 9 treinadores, 0 derrotas. Captura: 89. Checkpoint `b3` ($39 192).
- (20/11) **mina** (B3-mina-1/2): 5 capangas + tenente Rebite (ás 50) → `mina-ok`, 0 derrotas. Checkpoint `mina-ok`
  (equipe 60/60/59/59/58/58, $46 252).
- (20/11) **gin10** (1ª mão): vagonetes e desvios pela solução, g10-1..4, Topázio → insígnia 10, 0 derrotas, mas a luta
  com o líder durou 30 turnos e deixou 4 de 6 desmaiadas mesmo com **Δ +9** (ás 51 contra 60). O piloto não sabia voltar
  de vagonete (não é defeito do jogo: os dois vagonetes descem pelo mesmo trilho); roteiro `volta` acrescentado e 2ª mão.
- (20/11) **gin10** (2ª mão, do checkpoint `mina-ok`): **DERROTA** para o Topázio na 1ª tentativa (34 turnos; Gaviãozão entrou
  desmaiado porque a mochila estava sem Chá de Guaraná: a Venda de B1 não vendia), vitória na 2ª (8 turnos).
  Dinheiro: $46 252 → $26 926 na derrota. Checkpoint `passo-10` (equipe 63/61/60/60/60/60, $27 026).
- (20/11) **chapada** (escalada do paredão de B3, B-CH, B-CV, B4): 11 treinadores, 0 derrotas. Boitatá (nv 50): o
  piloto gastou 10 Cuias de Ouro sem capturar e fugiu (dá para fugir; ele "continua ali, esperando" — coerente).
  Captura: 146. Rival-6 (Tainá, ás 52) com equipe 65/63/63/62/62/62 (**Δ +13**): vitória em 7 turnos.
  Mãos descartadas por defeito do PILOTO (não do jogo): (a) não sabia escalar (o BFS agora usa o Escalar); (b) a conferência
  do rival-6 era feita antes de pisar no gatilho da estrada (fila 31); (c) tentou capturar uma Araracanga nv 48 jogando
  23 cuias seguidas e perdeu a equipe (agora desiste depois de 6 cuias ou com a equipe pela metade).
  Checkpoint `b4` ($18 206).
- (20/11) **gin11** (B4-ginasio): fogueiras dos 3 terreiros pela solução, g11-2..5, Labareda → insígnia 11, 0 derrotas;
  equipe 65/64/64/64/64/63 contra ás 53 (**Δ +12**). Checkpoint `passo-11` ($31 466).
- (20/11) **roda** (Trilha da Roda B-R3 → Cidade Ginga B5): 10 treinadores, 0 derrotas. Checkpoint `b5`
  (equipe 68/67/67/67/67/66, $47 906).
- (20/11) **gin12**: `B5-ginasio` não existe; a porta de B5 (26, 7) responde "Caminho em obras: esta passagem ainda não
  leva a lugar nenhum." e o jogador continua andando (sem trava). Registrado; parei aqui.
- Capturas de conferência (`qa3-capturas.mjs`, scratchpad/qa3/cap-*.png): B1, Salão, ninhal, B2, Centro, B9, B3, mina,
  B-CH, salão do Boitatá, B4, ginásio 11, B5 e a porta do ginásio 12 — sem texto cortado, sem vulto, sem NPC tapando
  passagem, sem "Vila Buriti" no lugar de Vila Cascavel. As telas pretas/meio pretas das capturas automáticas eram só o
  fade da troca de zona (refeitas depois de assentar: normais).

## Resumo do trecho (jogo honesto, Aventureiro)
| Chefe | Ás | Equipe ao chegar | Δ | Resultado | Dinheiro ao chegar |
|---|---|---|---|---|---|
| Líder 9 Zefa | 49 | 55/53/52/51/50/50 | +6 | 1/1 | $24 952 |
| Tenente Arame | 50 | ~57 | +7 | 1/1 | — |
| Tenente Rebite (mina) | 50 | ~59 | +9 | 1/1 | — |
| Líder 10 Topázio | 51 | 60/60/59/59/58/58 | +9 | **1/2** | $46 252 |
| Rival-6 Tainá | 52 | 65/63/63/62/62/62 | +13 | 1/1 | $19 326 |
| Líder 11 Labareda | 53 | 65/64/64/64/64/63 | +12 | 1/1 | $18 206 |
| Líder 12 (ginásio ausente) | 55 | 68/67/67/67/67/66 | +13 | — | $47 906 |

Treino extra: nenhum. Capturas: 50, 164, 89, 146 + filhote 105 (Tuiuiuzim, nv 12) do Centro. Dinheiro sempre folgado
($14 k–$47 k); remédios comprados: 16 garrafadas, 8 elixires, 9 chás (+3 chás no Platô).

## Achados
1. **Curva do mapa B (para o coordenador):** jogando só o caminho (≈70 treinadores + ≈90 selvagens até B5) a equipe sobe de
   48 para 68; chega aos líderes 6–13 níveis ACIMA do ás, quando o spec 4.5 pede 2–4 abaixo. Causas: a Liga termina no
   ás 46 com o jogador já em 45–48, os líderes 9–12 só sobem 2 níveis por ginásio, e há 10–20 treinadores de 43–51 entre
   um ginásio e outro; o Chocalho do Mutirão leva a equipe inteira junto. Corrigir pede decisão de desenho (subir
   líderes/rotas do mapa B ou rarear treinadores), não um ajuste local. A fala do Pesquisador Baru em B1-lab ("Quem chega
   da Liga com equipe de 42 sente o tranco") fica desmentida na prática.
2. **Líderes 9–12 contra a equipe real** (simulador `qa3-sim-save.mts`, NIVEL_ALVO): ver "Achados do QA" em
   docs/GINASIOS-9-16.md (9 e 10 abaixo de 55% no Δ −2…−4; 10 bem mais duro no jogo do que no simulador; 11 perto).
3. **Corrigido:** Venda de Vila Cascavel (`src/data/zonas/B1-venda.ts`) não vendia Chá de Guaraná — única Venda do mapa B
   sem reanimar, e é a primeira; o jogador sai da Liga com a mochila vazia.
4. Não corrigidos (fora da minha alçada ou de desenho): o filhote do Centro vem no nível 12 (inútil numa equipe 55+;
   `src/data/eventos/b1.ts` `b1-orfaos` — decisão de desenho); carta `buriti-1` de `src/data/textos-ui.ts` (Drª Buriti, que
   mora em A10, diz "se passar por aqui, venha ver" sobre o ninhal do Pantanal); o Escalar só aceita criatura Ginga,
   Comum ou Inseto — uma equipe sem nenhuma delas fica presa em B3 até capturar uma (há Comuns e Insetos comuns no Cerrado e no Pantanal: Bem-te-viço, Formigaço, Capivarinha).
