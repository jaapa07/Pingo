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
