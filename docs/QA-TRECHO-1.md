# QA jogado — trecho 1 (novo jogo → 4º ginásio, Aventureiro, jogador honesto)

Diário vivo da 3ª mão do QA do trecho 1. Atualizado a cada marco: se o contêiner reiniciar, é daqui que se retoma.

## Como retomar
- Ferramentas em `tools/testes/qa/`: `run.sh <roteiro.mjs> …` sobe o Vite do QA (porta 5194, sem HMR; `RESTART=1` para ele reler `src/`).
  - `jogar.mjs <mata|brasa|rio> [--de N] [--ate N]`: joga as etapas de `etapas.mjs`, checkpoint em `saves/<inicial>-passo-N.json`.
  - `lider1.mjs <inicial> [--n 6] [--gin G] [--de checkpoint]`: G-ésimo ginásio várias vezes a partir de `saves/<inicial>-pre-lider-G.json`, cada vez com outra semente.
  - `sim-inicial.ts`, `busca-lider.ts`: motor puro (sem navegador) para medir/ajustar um chefe.
- Checkpoints alcançados JOGANDO (nada injetado): `saves/*-passo-1..3` e `*-pre-lider-1` dos três iniciais (2ª mão).
- Atalhos declarados do piloto (não são trapaça de estado de jogo, mas não passam pelo teclado): cura "ida e volta ao Posto" no meio do ginásio e remédio fora de batalha aplicados direto no save (contados em `idasAoPosto`/`remediosFora`).

## 3ª mão — o que foi feito (ordem cronológica)

### 1. Começo do jogo (líder 1)
- **Achado no piloto (não no jogo):** o líder é NPC de script e não entrava em `__qa.treinadores`; depois do 4º treinador do ginásio o piloto ia ao líder SEM curar (inicial caído ou pela metade). As taxas baixas da 2ª mão (Mata 0/3, Brasa 0/1) vinham em parte disso. Corrigido em `etapas.mjs` (`seq`): antes do líder exige ninguém caído e vida média ≥ 70%.
- **Motor puro, equipes honestas que chegam ao líder** (inicial nv 10–11 + capturas nv 2–7, 2 chás), ás do líder nv 10 (Garcinha 7 Esguicho/Faro Fino + Tucaninho 10): Mata 3–26%, Brasa 23%, Rio 25%. Fora da meta 45–75%.
- **Ajuste:** `lider-01` = Garcinha 7 (Bicada, Esguicho) + Tucaninho **9** (Bicada, Sorver Seiva, Cara Feia). Motor puro: Mata 65%, Brasa 58%, Rio 75%. Faixa do verificador para o líder 1 já era 7–10: nada a reconciliar em níveis.

(continua abaixo conforme os marcos)

## 4ª mão (20/11) — líder 1 com ás nv 10 (decisão do autor)
- Ferramenta nova: `tools/testes/qa/busca-honesta.ts <candidatos.json> <equipes.json> [--n] [--itens] [--cura-livre]` — busca de equipe de líder contra as equipes HONESTAS que o piloto levou ao líder (não a de referência). `--cura-livre` = jogador que guarda os chás para o chefe e bebe abaixo de 40% (até 3 por criatura); o piloto esperto do motor só cura quando "aguenta dois golpes depois", e por isso nunca bebe chá no nv 10 (os chás não mudavam nada).
- Equipes honestas medidas (depois dos 4 treinadores do ginásio): Mata `1:11,10:6,13:2,45:5` e `1:10,10:4,13:2,45:5`; Brasa `4:10,13:7,13:2,10:2` e `4:9,13:9,13:2,10:2`; Rio `7:11,13:3,10:2,45:2` e `7:10,13:3,10:2,45:2`.
- **Remedição com ás 10** (Garcinha 7 Bicada/Esguicho + Tucaninho 10 Bicada/Sorver Seiva/Cara Feia), motor puro, piloto esperto, 2 chás: Mata 1–18%, Brasa 20–69% (depende do nível da Cotiazinha), Rio 17–50%. Com cura livre: Mata 23%, Brasa 86%, Rio 47%.
- Jogando (lider1.mjs, a partir de `mata-pre-lider-1`, ás 10): derrotas no líder com Tamanduí 11 (Tucaninho 10 sobra com 14/33) e uma derrota antes, no g01-3 (Corujinha 6 + Tucaninho 7).
- Tamanduí 11 × Tucaninho 10 sozinho: 2% (Bicada 2× com Atq 22 contra Def 19; o melhor golpe do Tamanduí contra Vento é o Arranhão). Para Mata, o que muda o resultado é a Garcinha não bicar (ele vence a Garcinha inteiro) e os chás bebidos no ás.
- **Ajuste (4ª mão), ás mantido no nv 10:** Garcinha nv 7 (Bicada, Esguicho) → **nv 6 (Esguicho, Jogar Areia)**. Motor puro contra as equipes honestas, esperto / cura livre com 2 chás: antes Mata 10/23%, Brasa 45/86%, Rio 34/47%; depois Mata 29/42%, Brasa 51/80%, Rio 44/55%. Nenhuma troca só de golpes do Tucaninho tira Mata de ~33% (ele perde 1×1 sempre); itens/capturas das rotas mexem nos três por igual.
- Piloto: `seq` agora guarda 2 remédios para o líder (`t.remedios(2)`) e, contra líder, bebe o remédio abaixo de 40% (napagina `decidir0`), como um jogador esperto. Antes ele gastava os chás entre os treinadores e chegava ao líder com 0.
- **Achado (jogo):** depois de vencer o Mestre Gaivota não há caminho a pé para a porta — o deque do líder só tem corrente para o leste e a prancha do meio sopra para o norte. A única volta é cair no mar (rajada depois do 2º mastro). Não é trava (o mar devolve à entrada), mas nada dizia isso: a fala pós-vitória do líder agora ensina a descer. O piloto ganhou `saida` por ginásio (era isso o `irAte (8,18)` que derrubou a 3ª mão logo depois da insígnia).
- **Fala desatualizada corrigida:** o Mestre Gaivota mandava "siga pela Rota 2 e atravesse a Mata do Sagui"; as zonas se chamam Campos de Restinga e Mata dos Sabiás (src/data/eventos/ginasio-01.ts).
- Piloto (ajuste 2): o Tamanduí ia de 15/35 a 0 numa Bicada sem nunca passar de 40% na hora de decidir; a regra virou "abaixo da metade" e vale contra QUALQUER treinador (Mata também perdia para o g01-3 Corujinha 6 + Tucaninho 7 e o g01-4 Andorim 7 + Ararinha 7). A ida ao Posto do atalho agora também repõe até 2 chás na Venda ao lado, se houver dinheiro (contado no log). Com cura abaixo da metade, motor puro: Mata 46%, Brasa 84%, Rio 47% (Garcinha 6 Esguicho/Jogar Areia).
- **Vite do QA não vê arquivo mudado** (nem `src/` nem `tools/testes/qa/napagina.js`): sempre `RESTART=1` depois de editar.
- **Medição jogando (lider1.mjs, 4 sementes por inicial, Garcinha 6 + ás 10, piloto que bebe chá abaixo da metade):** Mata 1/4 (uma das derrotas no g01-4 Andorim 7 + Ararinha 7, antes do líder), Brasa 2/4, Rio 2/4. Motor puro (mesmas regras): Mata 46%, Brasa 84%, Rio 47%; esperto conservador: 29/51/44%. Mata fica no limite de baixo; subir Mata sem subir os outros pede ajuda só para ele (não há captura anti-Vento antes do ginásio 1) — decisão do autor.
- **BUG CORRIGIDO (trava depois da insígnia 1):** a g01-3 ficava em (12,4), justo onde a corrente leste do deque do líder deixa o jogador. Com ela ali o vento parava o jogador no tile (11,4) — água ao norte e ao sul, a corrente de volta a oeste e a treinadora a leste: preso para sempre depois de vencer o Mestre Gaivota (a 3ª mão caiu aqui). g01-3 foi para (14,5), olhando para oeste (ainda desafia quem sobe a prancha direita em (13,5)). src/data/zonas/A2-ginasio.ts.
- **Passada por toque (iPhone 13 em pé, `toque.mjs abertura`, 713 toques):** tela de nome (B-i-a-z, apagar com B, Fim) → "Bia" gravado; direcional anda; MENU abre; Salvar → confirmação → grava `pingo.slot.0` (+ `.bak`); recarregar → Continuar volta ao quarto com "Bia". Sem erros de console. Achados: tecla da tela de nome 21×18 px CSS → agora cada tecla ocupa a célula inteira da grade (LH 16→17): **23×20 px** (src/ui/telas/nome.ts; o limite real é a tela de 320×180 com 13 colunas). Item do menu principal tem 50×16 px de alvo (src/ui/telas/menu.ts, fora do meu escopo: anotado).

### 4ª mão — jogo honesto com Mata (o inicial de pior desempenho)
- **Ginásio 1 (Mata):** venceu na 1ª tentativa desta passada (a anterior desta mão perdeu no líder; na amostra lider1 1/4). Equipe no líder: Tamanduí 11→12, Pipirim 3, Cotiazinha 2, Quero-querinho 4. Treino extra 0, idas ao Posto 2 (atalho), $1449 depois. Saiu do ginásio pela rajada → mar → entrada. Checkpoint `mata-passo-4` (insígnia 1).
- Piloto: golpe novo pendente aparece antes da oferta de troca (o motor já está na fase 'oferta'): o piloto respondia a lista de aprender como se fosse a oferta e travava na A-R2 (A-R2-2). Corrigido em piloto.mjs.
- Faro: o piloto fala com o Seu Aroeira (pega a missão da Paçoca) mas não vai buscá-la; o caminho principal não depende do Faro.
- Piloto: o mesmo caso no FIM da batalha (golpe novo pendente na fase 'fim' era respondido como "apelido da capturada") travava em A-R2; corrigido.
- **Rota 2 → Mata dos Sabiás (Mata), checkpoint `mata-passo-5`:** 8 treinadores da A-R2 e 8 da A-MS vencidos; Tamanduí evoluiu (Tamanduá-Copa 16) e chegou a 19; capturas: Gambazinho 8 (A-R2), Corujinha 13 (A-MS). Derrotas: 1 selvagem (Quatinho 13 na A-MS: o Tamanduí entrou com 26/45 e o piloto insistiu em cuia com a equipe fraca até acabar as cuias) e 1 treinador (A-MS-8, revanche vencida). Dinheiro $2533. A reserva (Pipirim 3, Cotiazinha 4, Quero-querinho 8) quase não sobe: o selvagem da A-MS já é nv 10–14, contra nv 2–4 da Trilha do Ipê.
- Rota do ginásio 2 no piloto estava com um 'n' a menos (a plataforma central é a fila 10, não a 11: a 3ª mão copiou do g2.mjs, que começa da rede em (8,16)). Rotas 3 e 4 conferidas passo a passo com g3.mjs/e4.mjs.
