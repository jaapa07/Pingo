# QA-TRECHO-2 — jogo honesto do 4º ginásio à Liga (modo Aventureiro)

Relatório vivo do QA que joga o trecho 2 (Cidade Coral → Ilha do Farol → Gruta Breu → Serra Fumaça → Encosta →
Vila Ferrugem → Estrada do Buriti → Vila Buriti → Platô da Liga → Liga → rival-5 → trem "em obras").
Ferramentas em `tools/testes/qa2/` (piloto que joga pelo teclado dentro da página, checkpoints em `saves/`).
Rodar: `tools/testes/qa2/run.sh jornada.mjs <seg> <etapa-inicial> [etapa-final]` e `run.sh liga.mjs <seg> [n] [semente0] [save] [compras]`.

## 1. O que os checkpoints provam (reconstruído dos saves; os registros das duas primeiras mãos se perderam)

Ponto de partida `passo-4`: save de REFERÊNCIA montado por `monta-save.mts` (equipe de `equilibrio-referencia`, inicial de
Rio, 4 insígnias, $28 080, 6 cuias, 2 garrafadas). Dali em diante tudo foi alcançado JOGANDO (piloto pelo teclado, sem
injeção): cada checkpoint é o save do anterior levado adiante.

| Checkpoint | Onde | Dinheiro | Equipe (espécie:nível) | Remédios na mochila | Treinadores vencidos |
|---|---|---|---|---|---|
| passo-4 (referência) | A5 | 28 080 | 8:25 14:23 11:22 27:22 33:21 30:21 | 2 garrafada, 1 mel, 1 unguento | 89 |
| farol-topo | A6-farol-4 | 20 643 | 8:28 11:24 14:24 27:22 33:21 30:21 | 5 garrafada, 1 elixir, 2 pomada | 102 |
| farol-ok (Rebite vencido, Lampião) | A6-farol-4 | 7 141 | 8:28 14:25 11:24 27:23 33:21 30:21 | 9 garrafada, 2 chá-guaraná, 2 pomada | 105 |
| farol-remedio (xarope entregue, Chocalho do Mutirão) | A6 | 7 141 | idem | idem | 105 |
| **passo-5** (insígnia 5) | A6 | 13 431 | 8:29 14:27 11:26 27:24 33:23 31:23 | 3 garrafada, 1 chá-guaraná | 110 |
| serra (Gruta Breu atravessada) | A7 | 4 413 | 8:34 14:33 11:30 27:29 33:29 31:28 | 3 garrafada | 123 |
| **passo-6** (insígnia 6, Quebra-pedra) | A7 | 3 726 | 8:35 14:34 11:32 27:30 34:30 31:30 | 7 garrafada | 128 |
| ferrugem (Encosta atravessada) | A8 | 5 920 | 9:37 14:37 12:35 27:33 34:32 31:32 | 12 garrafada, 1 chá-guaraná, 1 elixir | 140 |
| **passo-7** (insígnia 7, Força) | A8 | 10 620 | 9:39 14:38 12:37 27:34 34:34 31:34 | 10 garrafada, 3 chá-guaraná, 2 elixir | 146 |
| vila-buriti (Estrada do Buriti) | A10 | 4 540 | 9:42 14:41 12:41 27:37 34:37 31:36 | 12 garrafada, 3 chá-guaraná, 2 elixir | 153 |
| **passo-8** (insígnia 8) | A10 | 12 860 | 12:45 14:43 9:43 27:39 34:39 32:39 | 9 garrafada, 3 chá-guaraná | 157 |
| plato (terreiro, antes da Liga) | A-LG | 5 760 | idem | 12 garrafada, 3 chá-guaraná, 2 elixir, 1 pomada | 157 |
| campeao (Liga vencida 1×) | A-LG | 31 060 | 12:50 14:47 9:47 27:44 34:44 32:42 | 4 garrafada, 1 chá-guaraná; Passe do Trem, Bilhete do Saveiro, +1 Pedra Solar | 162 |

Nível da equipe AO CHEGAR em cada chefe (ás do jogador × ás do chefe):

| Chefe | Ás do chefe | Equipe ao chegar | Diferença do ás |
|---|---|---|---|
| Tenente Rebite (Farol) | 28 | 28 / 24 / 24 / 22 / 21 / 21 | 0 |
| Líder 5 Volta (Trovão) | 30 | 28 / 25 / 24 / 23 / 21 / 21 | −2 |
| Líder 6 Benta Sombra (Assombro) | 33 | 34 / 33 / 30 / 29 / 29 / 28 | +1 |
| Líder 7 Bigorna (Ferro) | 36 | 37 / 37 / 35 / 33 / 32 / 32 | +1 |
| Líder 8 Dona Buriti (Mata) | 40 | 42 / 41 / 41 / 37 / 37 / 36 | +2 |
| Liga (Campeão Aracê) | 46 | 45 / 43 / 43 / 39 / 39 / 39 | −1 |

Leitura:
- Do Farol ao 5º ginásio o jogador chega 2 níveis ABAIXO do líder com a reserva 7–9 níveis atrás; o dinheiro despenca de
  20 643 para 7 141 no topo do Farol (derrotas para o Rebite: metade do dinheiro se perde a cada uma, e as compras de
  remédio). Foi o que levou a mão anterior a (a) baixar a sala do Rebite (capangas 3→2 criaturas, tenente 5→4, níveis −1/−2,
  e o tenente passa a esperar o jogador se arrumar) e (b) criar o **Chocalho do Mutirão** (item-chave dado pelo Volta junto
  com as Cuias Rápidas: a reserva de pé ganha metade da experiência; `ConfigBatalha.expPartilhada`).
- Com o Chocalho, a Gruta Breu (13 treinadores) rende +5/+6 níveis à equipe inteira: daí em diante o jogador chega aos
  líderes 6–8 com o ás 1–2 níveis ACIMA do ás do líder e a reserva só 4–5 atrás. Nenhum treino extra aparece nos saves
  depois do 5º ginásio (o número de treinadores vencidos bate com a soma dos treinadores do caminho).
- Dinheiro: sempre apertado (3 700–13 000). O jogador chega ao Platô com $12 860 e sai da Venda com $5 760, 12 garrafadas,
  2 elixires, 3 chás de guaraná — muito menos que a "mochila cheia" do simulador (15 garrafadas, 10 elixires, 6 chás).
- Capturas honestas pelo caminho: 3 no viveiro (Gruta, Encosta, Estrada); evoluções em campo: 8→9, 11→12, 33→34, 31→32.

Correções já feitas pelas mãos anteriores (todas commitadas): `termo()` de `src/core/estado.ts` cortava o valor da
condição no 2º dois-pontos (`flag:venceu:A6-FA-9` nunca valia); `amuleto-lampiao` dado duas vezes; NPC que passeia parava
colado a porta/escada (`src/world/npcs.ts`); cipós do ginásio 8 cercavam o jogador depois da insígnia
(`mecanicas/ginasio-08.ts` escuta `insignia`); Rebite em dois tempos; Chocalho do Mutirão (motor + item + teste).

### 1.1 Histórico das três mãos (registros recuperados em disco; cópias em `tools/testes/qa2/saves/*.log`)

| Rodada | Regra de experiência | Farol | Gin. 5 | Gin. 6 | Encosta | Gin. 7 | Estrada | Gin. 8 | Chega ao Platô |
|---|---|---|---|---|---|---|---|---|---|
| 1ª mão (`j1`–`j6`) | sem Chocalho | 1 derrota (Rebite); antes do ajuste do Rebite: 8 derrotas e desistência | ok | 1 derrota (líder) | 1 derrota (A-R5-7) | 1 derrota (líder) | 1 derrota (A-R7-3) | **7 derrotas, 40 batalhas de treino extra, $13: não passou** (equipe 43/39/33/28/22/21) | não chegou |
| 2ª mão (`k1`–`k3`) | Chocalho: toda a reserva ganha metade | — | ok | 1 derrota (líder) | ok | ok | ok | ok | 45/43/43/39/39/39, $12 860 |
| 3ª mão, repetição da 2ª | idem | — | ok | ok | ok | ok | ok | ok (0 derrotas do 5º ao Platô) | 45/44/43/39/38/38, $18 787 |
| **3ª mão, regra final** | Chocalho: só a reserva 2+ níveis atrás da mais forte ganha metade | — | ok | 1 derrota (líder) | ok | ok | 1 derrota (A-R7-3) | 1 derrota (líder) | 39/38/38/38/38/37, $4 180 |

Leitura: sem o Chocalho o piloto (que, como muito jogador, luta com 3 e deixa 3 no banco) batia num muro no 8º ginásio;
com o Chocalho "metade para todos" as três da frente subiam em dobro (lutavam e ainda ganhavam metade quando ficavam no
banco) e o trecho 5→Liga virava passeio: líderes 6–8 em 92–100% no simulador com a equipe real, Liga em **11/12 (92%)**.
A regra final (reserva só ganha se estiver 2 ou mais níveis atrás da mais forte) mantém a equipe junta sem inflar o topo:

| Chefe | Ás do chefe | Equipe ao chegar (regra final) | Diferença do ás | Resultado jogando |
|---|---|---|---|---|
| Líder 5 Volta | 30 | 28 / 25 / 24 / 23 / 21 / 21 (ainda sem Chocalho) | −2 | venceu de primeira (1 garrafada) |
| Líder 6 Benta Sombra | 33 | 32 / 31 / 31 / 31 / 29 / 29 | −1 | 1 derrota, venceu na 2ª |
| Líder 7 Bigorna | 36 | 34 / 33 / 32 / 32 / 32 / 32 | −2 | venceu de primeira |
| Líder 8 Dona Buriti | 40 | 37 / 37 / 37 / 36 / 36 / 36 | −3 | 1 derrota, venceu na 2ª (49 turnos, 3 garrafadas; ela usou 2) |
| Liga (Campeão) | 46 | 39 / 38 / 38 / 38 / 38 / 37 ao subir o Platô → **41 / 41 / 40 / 40 / 40 / 40** depois dos Desafiantes | −5 | ver seção 2 |

Dinheiro na regra final: $13 431 depois do 5º ginásio · $4 313 em Serra Fumaça · $3 926 depois do 6º · $6 920 em Vila
Ferrugem · $14 620 depois do 7º · **$240** em Vila Buriti (derrota na Estrada leva metade; 12 garrafadas, 3 chás e 2
elixires comprados) · $4 180 depois do 8º · $680 ao pisar no Platô. Compras do 5º ginásio ao Platô: 58 garrafadas, 11 chás
de guaraná, 3 elixires. Nenhum treino extra foi necessário (só os treinadores e os encontros do caminho). Capturas: 4.

### 1.2 O buraco entre o 8º ginásio e a Liga (corrigido)

Vencido o 8º ginásio (ás do líder 40), a Liga vai de 41 a 46 e não havia NADA entre os dois: o jogador honesto subia o
Platô com o ás no 39 e $680. No simulador com esse save a Mestra Maré sozinha ficava em 12–22% e a sequência em 0%.
Correção (zona `A-LG`, treinadores em `src/data/treinadores/liga.ts`): **seis Desafiantes no terreiro**, em escada de
níveis 39–42 (4 criaturas cada, IA comum, sem itens, prêmio 2 400–2 500), ao lado do Posto; cada um ensaia o tema de um
Mestre e dá a dica dele na fala de depois. No chão do terreiro, 2 Elixires e 1 Chá de Guaraná. Jogando: 0–1 derrota
(Desafiante Tição), equipe 41/41/40/40/40/40 e $15 380 antes das compras.

## 2. Liga dos Guardiões — taxa real (em andamento)

### 2.1 Rodadas jogadas (4ª mão, 20/11) — checkpoint `plato` (depois dos Desafiantes: 42/44/42/41/42/42, $8 432)

Política: piloto esperto (`liga.mjs`), compra na Venda do Platô o que o dinheiro deixa (3 chás de guaraná + 5 garrafadas;
fica com $432), cura no Posto, entra; entre as salas usa remédios até 75% e reanima. Mochila ao entrar: 5 garrafadas,
3 elixires, 4 chás, 1 pomada, 2 mel, 3 unguentos.

| Rodada | Equipe da Liga | Tentativas | Campeão | Onde caiu |
|---|---|---|---|---|
| A (antes de mexer) | como estava (Campeão 42/43/44/46, Poraquê com Zunido) | 10 (sementes 1, 11–13, 21–23, 31–33) | **6/10** | 3× Campeão, 1× Brasa-Viva |
| B (Hall cura + rival-5 nova; Liga igual) | idem | 9 (41–43, 51–53, 61–63) | **9/9** | — |
| A+B | | 19 | **15/19 (79%)** | 3× Campeão, 1× Brasa-Viva |

Simulador com o MESMO save (`sim-save.mts plato liga-1,…,liga-5`, com as compras; `INICIAL=` troca o inicial de Rio do
save pela forma da outra linha no mesmo nível): Rio 70%, Mata 51%, Brasa 23% (antes). O jogador honesto jogado é de Rio,
o mais favorecido (Iaraboto Rio/Encanto: imune ao tipo Lenda do Pirarucão, resiste à água do Campeão e afoga o Brasa-Viva).
`sim-equilibrio.ts` (equipe de referência, mochila cheia) antes: Liga esperto **46%**, Campeão isolado 66%.

Bugs achados jogando:
- **rival-5 era luta perdida**: a Tainá desafia logo depois do Hall, e a equipe saía do Campeão sem cura (na rodada A,
  5 de 6 duelos perdidos em 2–22 turnos, com 1–2 criaturas de pé). Corrigido: o Hall da Fama cura a equipe
  (`['curar']` + fala em `liga-vitoria`).
- rival-5 com a equipe curada ficava em 96–100% para os três iniciais (simulador com o save de Campeão). Ajuste: níveis
  42–45 → 46/46/46/47/47/48 e 2 garrafadas → 75–94% conforme o inicial (antes, com a equipe de referência: 15–85%).
