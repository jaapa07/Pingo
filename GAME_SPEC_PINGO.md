# GAME_SPEC_PINGO.md — Adventures of Pingo
### RPG de captura e batalha de criaturas · 2 mapas · 16 insígnias · 180 criaturas · PC e celular (iOS), 100% offline

> **Para a IA que vai ler este arquivo:** este documento é a especificação **completa e obrigatória** de um jogo.
> Construa o projeto **inteiro, do zero, em uma única execução**, seguindo a ordem da seção 16.
> Nada aqui é sugestão: tudo que está listado precisa existir no projeto final, funcionando e com arte final.
> Leia o arquivo inteiro antes de escrever a primeira linha de código.

---

## 0. Origem e limites de propriedade intelectual

O jogo foi especificado a partir de **gravações de gameplay de um RPG portátil clássico de captura de monstros** (2ª geração do gênero, começo da aventura, jogado num iPhone). **A jogabilidade base do Adventures of Pingo é a desse clássico**: movimento em grade, encontros aleatórios na grama alta, batalha 1×1 por turnos com 4 golpes, captura, ginásios, insígnias, PC, telefone e relógio. Do vídeo foram extraídos **apenas padrões de jogabilidade e de interface**; todo o conteúdo é autoral.

**Regras de originalidade (absolutas):**

- **Proibido** usar nomes, criaturas, golpes, itens, cidades, personagens, logotipos, sons, músicas, interfaces ou visuais de franquias existentes. Isso inclui monstros de bolso, esferas vermelho-e-brancas, "Pokédex", "Pokémon Center", "HM/TM" e líderes conhecidos.
- Todas as criaturas são **animais da fauna brasileira estilizados**, definidos neste documento (seção 6). O folclore aparece só nos lendários, sempre em forma de animal.
- O dispositivo de captura é a **Cuia de Captura**, uma cuia de cabaça entalhada com trançado de palha.
- A enciclopédia é o **Diário de Campo**. O centro de cura é o **Posto Guardião**. A loja é a **Venda**. O armazenamento é o **Viveiro de Cuias**.
- Na dúvida entre "parecido com o jogo X" e original, escolha **sempre** o original.

### O que foi observado nas gravações (jogabilidade → como entra no Adventures of Pingo)

| Observado | No Adventures of Pingo |
|---|---|
| Tela de nome do jogador com grade de letras (maiúsculas/minúsculas, apagar, fim) | **Teclado em grade** autoral (A–Z, acentos do português, apagar, fim), navegável por direcional **e por toque** |
| Quarto do jogador com PC: guardar/retirar item, jogar item fora, caixa de cartas, decoração, desligar | **PC do Quarto** com Guardar/Retirar/Descartar item, **Cartas** (mensagens de NPCs) e **Decoração do Quarto** (tapetes, pôsteres, bonecos de pelúcia das criaturas, plantas) |
| Mãe na cozinha entrega o aparelho de telefone e pergunta o dia da semana | Mãe entrega o **Rádio Cipó** e o jogador ajusta **dia da semana e hora**; ela oferece guardar parte do dinheiro |
| Laboratório do professor com 3 esferas na mesa e confirmação "Você vai escolher este?" | Laboratório da Profª Ipê com **3 cuias na mesa**; ao examinar, a criatura aparece com o grito e o jogador confirma |
| Apelido para a criatura recém-recebida | **Tela de apelido** (mesmo teclado em grade) depois de receber ou capturar |
| Fala do professor ("pense bem…") e saída do laboratório para a rota | Diálogos com retrato; tutorial curto ao sair da vila |
| Rota com grama alta, cercas, saliências de pulo e árvores | Rotas em grade com **grama alta**, saliências de mão única, cercas, placas e árvores sacudíveis |
| Encontro aleatório: tela pisca e escurece, criatura selvagem aparece ("Um X selvagem apareceu!") | **Encontro aleatório** na grama com transição de tela autoral (redemoinho de folhas), "Um X selvagem apareceu!" |
| Batalha: caixa do inimigo no alto à esquerda (nome, nível, vida em barra), caixa do jogador embaixo à direita (nome, nível, vida em número e barra, experiência), caixa de texto embaixo | **Layout clássico preservado**: inimigo de frente no alto à direita com a caixa à esquerda; criatura do jogador de costas embaixo à esquerda com a caixa à direita (vida numérica + barra + experiência); caixa de texto embaixo; menu LUTAR / EQUIPE / MOCHILA / FUGIR |
| Jogador arremessa a esfera, "Vai! <apelido>!" | Jogador arremessa a cuia, "Vai, <apelido>!" com animação de abertura da cuia |
| Golpes alternados com mensagens "X usou Investida!" e barra de vida caindo devagar | Mensagens por turno, **barra de vida que esvazia animada** e números que descem, piscar do sprite atingido |

---

## 1. Visão do jogo

**Adventures of Pingo** é um RPG de exploração, captura e batalha por turnos.

- **Nome:** o título do jogo é **Adventures of Pingo** (logo, tela título, ícone do app, nome no iOS e no desktop, `<title>`, manifest do PWA e créditos). **Pindorama** continua sendo o nome da terra onde a aventura se passa.

- **Cenário:** a terra de Pindorama, em dois mapas conectados de forma inteligente.
  - **Mapa A — Costa do Sol:** litoral, Mata Atlântica, baía e montanhas.
  - **Mapa B — Sertão das Névoas:** cerrado, pantanal, chapadas e serra gelada.
- **Objetivo:** conquistar as **16 insígnias dos Guardiões**, vencer o **Conselho dos Guardiões** no Pico Pindorama, completar o **Diário de Campo** (180 criaturas) e desmontar o **Cartel Ferrugem**, quadrilha de traficantes de animais.
- **Tom:** aventura ensolarada, humor brasileiro, mensagem de conservação. As criaturas são **parceiras**. A Cuia de Captura acolhe; ninguém é aprisionado: criaturas soltas voltam ao habitat com animação.
- **Duração alvo:** 25–35 h para a história, mais o pós-jogo.
- **Plataformas:** **PC** (navegador e app instalável para Windows/macOS/Linux) e **celular iOS** (app nativo via Capacitor e também PWA instalável), **jogáveis 100% offline**. Detalhes na seção 15A.
- **Tela lógica:** 1280×720 (16:9), escalada para a janela. No celular em pé, a tela do jogo fica em cima e os **controles de toque** embaixo, como nas gravações; deitado, os controles ficam nas laterais.

---

## 2. Stack e regras técnicas (obrigatórias)

### 2.1 Proibido no runtime
- ❌ `<canvas>` (2D, WebGL, OffscreenCanvas), inclusive para leitura de pixels.
- ❌ Three.js, Pixi, Phaser ou qualquer engine dentro de `src/`.
- ❌ Formas cruas como sprite provisório, emojis no lugar de arte, telas "em construção".
- ❌ `TODO`, `FIXME`, `placeholder`, `lorem`, funções vazias.
- ❌ Conteúdo procedural: mapas, encontros, treinadores, criaturas, estatísticas e golpes são **dados escritos à mão**.
- ❌ Assets baixados da internet.

### 2.2 Permitido / obrigatório
- ✅ **Vite + TypeScript strict**, DOM puro, **CSS 3D** (`perspective`, `preserve-3d`, `translateZ`), Web Animations API e SVG.
- ✅ **Pipeline offline de pré-renderização 3D** (`tools/`): Three.js dentro do Chromium headless do Playwright, **só no build**, gerando spritesheets WebP e atlas JSON. Os modelos são esculpidos em código (biblioteca própria de primitivas orgânicas, deformadores, materiais com texturas SVG autorais e rim light, esqueleto com keyframes escritos à mão). O jogo instalado **nunca** executa WebGL nem canvas.
- ✅ **Empacotamento multiplataforma:** PWA (Service Worker + manifest), **Capacitor** para iOS e **Electron** (electron-builder) para desktop. Mesmo código-fonte para todas as plataformas.
- ✅ Áudio **Web Audio API**: músicas compostas nota por nota em dados, SFX como presets autorais, vozes balbuciadas por personagem.
- ✅ `Math.random` só em: rolagem de batalha (precisão, crítico, captura, dano ±15%), variação de partículas e escolha de falas. As tabelas e pesos são autorais. Todo `Math.random` passa por **um único gerador** `src/core/rng.ts` com semente salva, para permitir replay e testes.
- ✅ Loop de **60 Hz com passo fixo**.

### 2.3 Estrutura de pastas
```
adventures-of-pingo/
├─ tools/
│  ├─ render/        (sculpt, materials com rim light, anim, presets, client)
│  ├─ models/
│  │  ├─ criaturas/  (180 arquivos + kits/ anatomias)
│  │  ├─ pessoas/    (jogador ×2, rival, profª, líderes ×16, Conselho ×5, Cartel, NPCs)
│  │  ├─ objetos/    (cuias, itens, props de mapa)
│  │  └─ fx/         (efeitos de golpes por tipo, captura, evolução)
│  ├─ scenery/       (tiles 3/4, prédios, interiores, arenas de batalha, mapas-mundo)
│  ├─ bake-maps.ts   (compõe chunks de cada zona)
│  └─ verify.ts      (seção 16.2)
├─ assets-src/ui/    (fonte autoral, ícones de tipos, insígnias SVG, molduras)
├─ public/assets/    (gerado; dois níveis de qualidade: hd/ e movel/)
├─ public/sw.js, public/manifest.webmanifest  (gerados no build)
├─ plataformas/
│  ├─ ios/           (projeto Capacitor, ícones, splash, Info.plist)
│  └─ desktop/       (Electron: main.ts, preload.ts, electron-builder.yml)
└─ src/
   ├─ core/      (loop, input + toque, rng, save com adaptadores por plataforma, events, assets, plataforma.ts)
   ├─ render/    (palco 3D, sprite, chunks, fx, luz dia/noite, clima)
   ├─ world/     (zonas, colisão, NPCs, eventos, encontros, lendários errantes, warps, habilidades de campo)
   ├─ battle/    (motor de batalha, IA, fórmulas, animações de golpe, captura, evolução)
   ├─ data/      (criaturas.ts, golpes.ts, tipos.ts, itens.ts, zonas/*.ts, treinadores.ts, ginasios.ts, eventos/*.ts, musica/*, sfx.ts, textos.ts)
   ├─ ui/        (telas, HUD, menus, Diário, Viveiro, Rádio Cipó)
   └─ audio/
```

---

## 3. Direção de arte e renderização

### 3.1 Estilo (ver 3A: a pixel art premium prevalece)
- **Visual:** "pré-renderizado 3D em miniatura", com dioramas ensolarados e luz de contorno (rim light) forte.
- **Mapa:** câmera **ortográfica 3/4** (inclinação de −50°, guinada de 0°). Tile lógico de **48 px**; células renderizadas com 16 px de margem para encaixe.
- **Profundidade em CSS 3D (diferencial):** o plano do mapa fica num contêiner com `perspective` e uma inclinação leve, de 6° a 10°. Personagens e criaturas são *billboards* contra-rotacionados.
  - Desfoque CSS (`filter: blur`) nas bordas superior e inferior imita profundidade de campo, como um diorama.
  - Nuvens fazem sombras em movimento sobre o mapa (camada de sombra animada).
- **Celular:** a mesma tela lógica 1280×720 é escalada; a caixa de texto e os menus usam fonte mínima de 28 px lógicos para continuar legíveis num iPhone.
- **Paleta (tokens CSS):** `--jacaranda #6B4FA0`, `--ipe #F2C230`, `--mata #2E8B3E`, `--rio #1F7FBF`, `--terra #A0522D`, `--brasa #E0552B`, `--areia #E9D3A0`, `--noite #141026`, `--creme #FFF6E0`.

### 3.2 Pré-renderização (finalizada em pixel art pela seção 3A)
- **Escala global:** **96 px por unidade** no mapa.
- **Cada criatura tem dois conjuntos de sprites:**
  1. **Batalha:** célula de 384×384, modelo grande e detalhado.
     - **Frente** (inimigo): `entrada`, `idle` (24 quadros), `ataque-fisico`, `ataque-especial`, `dano`, `desmaio`, `status` (atordoado ou dormindo, em loop).
     - **Costas** (seu lado): `idle`, `ataque-fisico`, `ataque-especial`, `dano`, `desmaio`.
  2. **Mapa:** célula de 96×96, câmera 3/4, nas 4 direções (`andar-n/s/l/o`, 4 quadros cada), mais `idle`. Serve para a **criatura parceira que segue o jogador** (opção), para os lendários errantes que fogem pelo mapa (como no clássico, aparecem em rotas aleatórias e fogem no 1º turno) e para cenas de evento.
- **Pessoas:**
  - **Jogador:** andar, correr, bicicleta (de bambu), remar na canoa, escalar, mergulhar e planar (montado na criatura de Vento), nas 4 direções, mais as poses de arremesso de cuia para a batalha.
  - **NPCs:** andar nas 4 direções e `idle`.
  - **Retratos** para os diálogos (busto 3D com 3 expressões).
- **Presets de luz:** `manha`, `dia`, `tarde`, `noite`, `caverna`, `subaquatico`, `geada`, `vulcao`, `ginasio-*` (um por ginásio).
  - As criaturas de batalha são renderizadas nos presets das **arenas** onde aparecem.
  - No mapa, dia e noite são **sobreposições CSS** (multiply/screen) sobre os tiles, mais **luzes pontuais em CSS** (janelas, postes e vaga-lumes acesos à noite).

### 3.3 Criaturas: modelagem autoral em escala
Para 180 criaturas, crie em `tools/models/criaturas/kits/` uma biblioteca de **anatomias** esculpidas: quadrúpede, bípede, ave, peixe, serpente, inseto, anfíbio, réptil, mamífero arborícola e aquático.

- **Cada criatura** é um arquivo próprio com valores autorais: proporções, cores, padrões de pelagem/escama/pena, olhos e expressão, partes exclusivas (cristas, folhas, chamas, conchas, cristais, cipós) e animações ajustadas.
  - **Proibido** gerar criaturas por sorteio ou variação automática: a anatomia é só o esqueleto.
  - Cada uma precisa de **silhueta distinta** e de pelo menos **3 traços únicos**.
- **Evoluções** mantêm a identidade (cores e traços) e ficam maiores e mais elaboradas a cada estágio.
- **Mínimo de malhas:** 25 por criatura básica, 40 por estágio final, 60 por lendário.

### 3.4 Arenas de batalha
Uma arena 3D pré-renderizada por bioma:
- restinga, mata atlântica, praia, baía (sobre a água), caverna, usina, manguezal, cerrado, pantanal, chapada, vulcão, brejo tóxico, araucárias nevadas, planalto, recife submerso;
- 16 arenas de ginásio temáticas;
- Pico Pindorama.

**Cada arena:**
- Fundo de 1280×720 com 3 camadas (céu/fundo, cenário, chão com plataformas circulares para as duas criaturas), versões dia e noite.
- Na entrada da batalha, a câmera faz um leve **"dolly" em CSS 3D**.

### 3A. Estética final: PIXEL ART PREMIUM (prevalece sobre a seção 3 onde houver conflito)

**Meta:** a sensação de um RPG portátil clássico que recebeu uma evolução visual cuidadosa — **mais bonito que o clássico do vídeo, mantendo o charme retrô**. Prioridade: **legibilidade, personalidade e qualidade artística**. Nada de estética 3D realista, filtros borrados ou excesso de efeitos modernos.

**Referência de qualidade** (imagem enviada pelo autor; se estiver junto deste arquivo, copie para `docs/referencias/qualidade-batalha.jpg`): batalha numa clareira de floresta em pixel art.
- O que ela tem e o jogo deve alcançar:
  - cenário em camadas: troncos escuros ao fundo, copas com 3 a 4 tons de verde, raízes e tronco caído, cogumelos, flores rosadas, capim em tufos e uma clareira mais clara onde as criaturas lutam;
  - criaturas com **contorno de 1 px** escuro, sombreamento em 3 a 4 tons, brilho pontual e **sombra elíptica** no chão;
  - paleta saturada, mas harmônica, com luz vinda de cima;
  - interface com caixas de cantos chanfrados, cor de destaque, nome e nível, barra de vida com rótulo, e menu de batalha com uma **ação principal grande e ilustrada** ao lado das secundárias, mais um **cursor de mão**.
- **Use só como régua de qualidade.** Não copie criaturas, cenário, cores nem o desenho da interface: tudo no Adventures of Pingo continua autoral e com identidade brasileira.

**Resolução e escala (substitui os 48 px das seções 3.1, 4.6 e 15):**
- Resolução nativa de **320×180** pixels, exibida em escala **inteira ×4** (1280×720). Em telas de outro tamanho, usar o maior inteiro que couber e completar com bordas decoradas.
- **Tile de 16×16 px** nativos (64 px na tela).
- **Tamanhos nativos dos sprites:**
  - jogador e NPCs: 16×24, com 4 direções e animações de andar, correr, remar, escalar e mergulhar;
  - criaturas no mapa: 16×16 a 24×24;
  - **batalha, frente:** 56×56 (básicas) a 96×96 (lendários);
  - **batalha, costas:** 48×48 a 72×72;
  - retratos de diálogo: 48×48.
- **Arte e posicionamento:**
  - Desenho em **pixels inteiros**: proibido sub-pixel, rotação livre, escala não inteira e suavização. Usar `image-rendering: pixelated` em tudo.
  - As posições de sprites, câmera e partículas **arredondam para o pixel nativo** (múltiplos de 4 px na tela), para não haver tremulação.
- **Sem CSS 3D no mapa nem desfoque:** a inclinação e o `filter: blur` de profundidade da seção 3.1 ficam **desativados**. A profundidade vem da arte (sombras, camadas e oclusão de copas e telhados). O parallax só aparece nos fundos de batalha e nas transições, com deslocamentos inteiros.

**Como adaptar o pipeline pré-renderizado (sem canvas nem WebGL no jogo):**
- **Passo 1, render "toon":** o 3D é renderizado no build com sombreamento em faixas (3 a 4 tons, sem brilho especular realista) e em 8× a resolução nativa. Depois é reduzido para a nativa por **filtro de moda** (cor mais frequente do bloco), não por média.
- **Passo 2, paleta autoral:** cada criatura tem uma paleta de **6 a 12 cores** mais contorno, definida à mão nos dados. Cada bioma tem uma paleta de **24 a 32 cores**. A quantização é feita para essa paleta, sem dithering automático.
- **Passo 3, limpeza:**
  - contorno de 1 px nas silhuetas, mais escuro e na cor do lado de fora (técnica *selout*);
  - remoção de pixels órfãos e de serrilhados duplos;
  - nada de *pillow shading* (sombra em volta de tudo);
  - alfa **binário** nos sprites (só os efeitos usam translucidez).
- **Passo 4, retoque autoral:** cada sprite aceita **camadas de retoque escritas à mão** em dados, listas de pixels por quadro. Servem para os olhos, brilhos, bocas e detalhes que dão personalidade. Olhos e expressões das 180 criaturas são **sempre** retocados.
- **Passo 5, animação:**
  - de 6 a 12 quadros por segundo com quadros segurados (*holds*), *squash and stretch* em pixel e **respiração** no `idle`;
  - na batalha: `entrada`, `ataque`, `dano` (piscar e recuo de 2 px), `desmaio` e **evolução** (silhueta branca pulsando e troca de forma);
  - no mapa: andar em 4 quadros por direção.
- **Formato:** PNG ou WebP **sem perdas**, nunca WebP com perdas (cria artefatos em pixel art). A paleta indexada reduz o tamanho, o que ajuda o pacote do celular.
- **Para o verificador:** os sprites são checados quanto a resolução nativa, alfa binário, número de cores ≤ paleta e presença de contorno.

**Mundo vivo em pixel art (tudo em quadros desenhados, sem filtro):**
- Copas de árvore com **sombra projetada** e balanço sutil de 2 a 3 quadros.
- **Água** com 4 a 8 quadros, brilhos e **reflexo** do jogador e das árvores da margem.
- **Grama alta** que reage à passagem: dobra e volta, solta folhinhas e fica meio por cima do jogador.
- Flores, borboletas, poeira, vaga-lumes à noite e pegadas na areia.
- **Clima** em camadas de sprites repetidos: chuva com respingos no chão, neblina em faixas animadas, vento empurrando folhas e garoa.

**Horário do dia por paleta, não por filtro:** os tiles e os fundos de batalha têm variações de paleta pré-calculadas para **manhã, dia, tarde e noite**. À noite:
- janelas e postes acesos são sprites próprios;
- a troca entre períodos é um *crossfade* curto de 1 segundo entre as duas variações.

**Biomas com identidade brasileira e paleta própria:**
- **Vilas:** casario colonial, azulejos, igrejinha e coreto.
- **Litoral:** jangadas, coqueiros, restinga.
- **Mata Atlântica:** bromélias e helicônias.
- **Pantanal:** palafitas, aguapés, tuiuiús ao fundo.
- **Cerrado:** ipês, cupinzeiros, veredas de buriti.
- **Chapada:** paredões avermelhados.
- **Serra da Geada:** araucárias e geada.
- **Interiores:** móveis e objetos únicos por casa (fogão a lenha, rede, filtro de barro, oratório, máquina de costura, quadro de ex-voto), nunca cômodos repetidos.

**Batalha (qualidade da referência):**
- Fundo de cada bioma em pixel art de 320×180 com 3 camadas e um ou dois elementos animados (folhas, água, fumaça).
- As criaturas ficam sobre a **clareira e as sombras elípticas**.
- **Caixas de status autorais** em pixel, com cantos chanfrados e a cor do tipo da criatura. A barra de vida esvazia em passos de 1 px e muda de cor de verde para amarelo e vermelho.
- **Menu de batalha** com **LUTAR** como cartão grande ilustrado e MOCHILA, EQUIPE e FUGIR como botões menores, além de um cursor de mão animado. As posições continuam as do layout clássico da seção 11.

**Interface:**
- **Fonte bitmap autoral** de 8×8 e 8×12 com os acentos do português. Substitui a fonte SVG entalhada da seção 11 no jogo; a versão entalhada fica para o logo.
- Molduras em 9-slice de pixel art (madeira, cipó e azulejo) e ícones de tipo em 12×12.

---

## 4. Os dois mapas e a montagem da progressão

### 4.1 Mapa A — COSTA DO SOL
| Id | Local | Tipo | Observação |
|---|---|---|---|
| A1 | **Vila Jacarandá** | cidade | casa do jogador, laboratório da Profª Ipê |
| A-R1 | Trilha do Ipê | rota | A1→A2 |
| A2 | **Vila Caiçara** | cidade · **Ginásio Vento** | |
| A-R2 | Campos de Restinga | rota | A2→A-MS; dunas, cajueiros |
| A-MS | Mata dos Sabiás | floresta | labirinto de árvores; sacudir árvores |
| A3 | **Bosque Alto** | cidade · **Ginásio Inseto** | cidade nas copas, pontes de corda |
| A-R3 | Trilha dos Cipós | rota | cipós bloqueiam (Facão); riacho com pesca |
| A-GE | Gruta do Eco | caverna | A-R3→A4 |
| A4 | **Porto Sereia** | cidade · **Ginásio Rio** | estação de trem, cais, mercado de peixe |
| A-R4 | Estrada da Usina | rota | A4→A-US |
| A-US | Usina Velha | dungeon | 1º evento do Cartel; criaturas Trovão |
| A-BA | Baía Azul | água (Remar) | liga A4, A5, A6 e A-PR |
| A5 | **Cidade Coral** | cidade · **Ginásio Encanto** | ilha; cais do **Saveiro** |
| A6 | **Ilha do Farol** | cidade · **Ginásio Trovão** | 2º evento do Cartel no farol |
| A-PR | Praia das Tartarugas | praia | ninhos noturnos; inicial extra (seção 6.2) |
| A-MG | Manguezal | pântano (Remar + Facão) | opcional cedo; caranguejos, jacarés |
| A-GB | Gruta Breu | caverna escura (Lampião) | A5→A7 |
| A7 | **Serra Fumaça** | cidade · **Ginásio Assombro** | casario colonial na neblina |
| A-R5 | Encosta da Fumaça | rota | arredores de A7 |
| A-R6 | Rio Cachoeira-Véu | rio (Cachoeira) | A7→A8 |
| A8 | **Vila Ferrugem** | cidade · **Ginásio Ferro** | antiga cidade operária |
| A-RS | Recife Submerso | mergulho | sob a Baía Azul (Mergulho) |
| A-MT | Monte Tupã | montanha (Escalar + Lampião + Cachoeira) | A8→A9 |
| A9 | **Aldeia Tupã** | cidade · **Ginásio Lenda** | no topo do monte |

### 4.2 Mapa B — SERTÃO DAS NÉVOAS
| Id | Local | Tipo | Observação |
|---|---|---|---|
| B1 | **Vila Buriti** | cidade · **Ginásio Mata** | estação de trem; Drª Buriti (inicial extra) |
| B-R1 | Vereda dos Buritis | rota | B1→B-CE |
| B-CE | Cerrado Aberto | savana | cupinzeiros, ipês, emas |
| B-PA | Pantanal Alagado | água rasa/funda (Remar) | B1↔B2↔B9; 3º evento do Cartel (ninhos) |
| B2 | **Pantanal Grande** | cidade · **Ginásio Terra** | palafitas |
| B9 | **Porto Pantaneiro** | cidade sem ginásio | cais do Saveiro (ligação com A5) |
| B-R2 | Estrada Vermelha | rota (Quebra-pedra) | B9→B3 |
| B3 | **Chapada Rubra** | cidade · **Ginásio Pedra** | mina abandonada (4º evento do Cartel) |
| B-CH | Chapada dos Paredões | montanha (Escalar) | B3→B4 |
| B-CV | Caverna Vulcânica | caverna (Lampião) | opcional; lendário Boitatá |
| B4 | **Arraial Brasa** | cidade · **Ginásio Brasa** | forjas, fogueira de São João |
| B-R3 | Trilha da Roda | rota | B4→B5 |
| B5 | **Cidade Ginga** | cidade · **Ginásio Ginga** | rodas de capoeira, mercado |
| B-TA | Túnel Alagado | mergulho | B5→B6 |
| B6 | **Brejo Roxo** | cidade · **Ginásio Veneno** | laboratório secreto do Cartel (5º evento) |
| B-VV | Vale do Veneno | pântano tóxico | arredores de B6 |
| B-R4 | Subida da Serra | montanha (Escalar + Força) | B6→B7 |
| B7 | **Serra da Geada** | cidade · **Ginásio Geada** | araucárias, geada |
| B-SG | Campos de Altitude | rota | arredores de B7 |
| B-LG | Lagoa Gelada | água (Remar) | B7 |
| B-R5 | Caminho das Névoas | rota (Lampião dissipa a névoa) | B7→B8 |
| B8 | **Planalto Lume** | cidade · **Ginásio Mente** | observatório, cânions |
| B-FA | Floresta Ancestral | pós-jogo | ninhos raros, Mapinguari |

**Fronteira:** **PP Pico Pindorama** fica no topo da serra entre os dois mapas, com trilha de Escalar a partir de A-MT e de B-R4. O **Portão dos Guardiões** só abre com as 16 insígnias. O Conselho dos Guardiões fica no Pico.

### 4.3 Ligações entre os mapas (transições com animação)
1. **Trem Serra-Sol:** A4 Porto Sereia ↔ B1 Vila Buriti.
   - Liberado depois da insígnia 3 **e** do evento da Usina, quando a energia é restaurada e o jogador ganha o *Passe do Trem*.
   - A viagem mostra uma cinemática curta com a paisagem passando em parallax CSS 3D.
2. **Saveiro (barco fluvial):** A5 Cidade Coral ↔ B9 Porto Pantaneiro.
   - Liberado depois de vencer o Cartel no Farol (insígnia 7), quando o jogador ganha o *Bilhete do Saveiro*.
3. **Voo:** depois da insígnia 14, o jogador viaja montado numa criatura do tipo Vento entre **quaisquer cidades já visitadas dos dois mapas**, numa tela de "mapa duplo".
4. **Pico Pindorama:** acessível dos dois lados (seção 4.2).

### 4.4 Habilidades de Campo: Amuletos + parceria (diferencial)
Cada obstáculo exige um **Amuleto de Campo**, que é um item-chave. Ele **só funciona se houver na equipe uma criatura de um dos tipos indicados**: a criatura faz a ação no mapa, numa animação própria. Nenhum golpe ocupa espaço na lista de golpes.

| Amuleto | Obstáculo | Tipos que ajudam | Como se obtém |
|---|---|---|---|
| **Facão** | cipós grossos | Mata · Inseto · Ginga | insígnia 2 |
| **Remo** | água (canoa puxada pela criatura) | Rio | insígnia 4 |
| **Força** | empurrar pedregulhos | Terra · Pedra · Ginga | insígnia 5 |
| **Lampião** | cavernas escuras e névoa | Brasa · Trovão · Encanto | derrotar o Cartel no Farol (antes da insígnia 7) |
| **Quebra-pedra** | rochas rachadas | Pedra · Terra · Ferro · Ginga | insígnia 8 |
| **Escalar** | paredões com trepadeiras | Ginga · Comum · Inseto | insígnia 9 |
| **Cachoeira** | subir cascatas | Rio · Lenda | insígnia 11 |
| **Mergulho** | águas fundas marcadas | Rio | insígnia 12 |
| **Voo** | viagem rápida | Vento | insígnia 14 |
| **Faro** | itens e criaturas ocultas brilham | qualquer criatura com amizade alta | missão do Seu Aroeira, depois da insígnia 1 |

### 4.5 Ordem de progressão (montagem com idas e voltas)
| Passo | Onde | Insígnia / evento | Nível do líder | Liberado depois |
|---|---|---|---|---|
| 1 | A2 | **1 · Vento (Pena)** | 10–12 | Faro (missão) |
| 2 | A3 | **2 · Inseto (Casulo)** | 15–17 | Facão → A-R3, A-MG parcial |
| 3 | A4 | **3 · Rio (Concha)** | 20–22 | A-R4 → evento da Usina → **Trem** |
| 4 | B1 (trem) | **4 · Mata (Folha)** | 24–26 | Remo → B-PA |
| 5 | B2 | **5 · Terra (Barro)** | 28–30 | Força; a líder conta que o Cartel está no Farol → volta de trem |
| 6 | A5 (via Baía, Remo) | **6 · Encanto (Estrela)** | 31–33 | A-PR (inicial extra), A-MG completo |
| 7 | A6 | evento do Farol → **7 · Trovão (Raio)** | 34–36 | Lampião + Bilhete do Saveiro |
| 8 | A7 (via A-GB, Lampião) | **8 · Assombro (Lamparina)** | 38–40 | Quebra-pedra |
| 9 | B3 (Saveiro → B9 → B-R2) | evento da Mina → **9 · Pedra (Cristal)** | 41–43 | Escalar |
| 10 | B4 (via B-CH) | **10 · Brasa (Chama)** | 44–46 | B-CV (Boitatá) |
| 11 | B5 | **11 · Ginga (Berimbau)** | 47–49 | Cachoeira → volta ao mapa A |
| 12 | A8 (via A-R6, Cachoeira) | **12 · Ferro (Engrenagem)** | 50–52 | Mergulho (A-RS, B-TA) |
| 13 | B6 (via B-TA) | evento do Laboratório → **13 · Veneno (Espinho)** | 52–54 | Queixada-Caipora começa a vagar |
| 14 | B7 (via B-R4) | **14 · Geada (Floco)** | 54–56 | **Voo** |
| 15 | B8 (via B-R5, Lampião) | **15 · Mente (Olho)** | 56–58 | o guardião do Monte Tupã abre o caminho |
| 16 | A9 (via A-MT) | **16 · Lenda (Escama)** | 58–60 | Portão do Pico Pindorama |
| Final | PP | **Conselho dos Guardiões** (4 + Guardião-Mor) e Coronel Garrote do Cartel | 62–68 | créditos e pós-jogo |

**Regras de montagem (obrigatórias):**
- **Sem atalhos que pulem etapas:** cada transição exige o Amuleto ou o evento indicado.
- Os **portões narrativos** são diálogos com motivo na história, nunca paredes invisíveis. Exemplos: o guardião do Monte Tupã só abre com 15 insígnias; a ponte de B-R5 guarda a névoa.
- **Áreas visíveis, mas inalcançáveis**, ficam espalhadas desde cedo com recompensas raras: ilhas, prateleiras de rocha, poças de mergulho. É o "metroidvania" do gênero, que dá motivo para voltar.
- **Curva de nível:** cada zona define faixas de nível coerentes com o passo em que fica acessível. As zonas antigas ganham uma **"camada pós-insígnia X"** com criaturas evoluídas: a mesma rota, revisitada, tem novas espécies em níveis maiores.

### 4.6 Formato das zonas (`src/data/zonas/<id>.ts`, escrito à mão)
- **`tilemap`:** grade de caracteres com tile de 48 px e camadas `chao`, `objetos` e `alto` (copas e telhados que passam na frente do jogador). A legenda de cada tileset fica documentada em `docs/ZONAS.md`.
- **`colisao`:** derivada dos caracteres, com bordas de um sentido para pulos de saliência.
- **`warps`:** portas, escadas, cavernas e bordas que ligam a outra zona.
- **`npcs`:** com rota, diálogo, batalha ou loja.
- **`eventos`:** scripts declarativos (seção 9.3).
- **`habitats`:** áreas de grama, água, árvores e rochas, cada uma com tabela de encontro por período e camada de progresso, mais `spawnsVisiveis` (seção 6.3).
- **`obstaculos`:** cipó, pedra, rocha rachada, paredão, cascata, água funda, escuridão ou névoa, com o Amuleto exigido.
- **`musica`, `preset`, `arena`:** trilha da zona, preset de luz e arena de batalha.
- **Tamanhos:** cidades de 40×30 a 60×45 tiles; rotas de 30×80 a 120×40 tiles; dungeons com 2 a 4 andares.

---

## 5. As 16 insígnias e os ginásios

Cada ginásio tem um **quebra-cabeça temático**, de 4 a 7 treinadores e um líder com 4 a 6 criaturas e golpes planejados. A insígnia é um **SVG autoral** com uma animação de brilho ao ser recebida.

| # | Insígnia | Tipo | Cidade | Líder (nome e conceito) | Quebra-cabeça |
|---|---|---|---|---|---|
| 1 | Pena | Vento | Vila Caiçara | **Mestre Gaivota**, velho pescador de pipa | correntes de vento empurram o jogador sobre o píer |
| 2 | Casulo | Inseto | Bosque Alto | **Lia Teia**, bióloga de copa | pontes de teia que só se atravessam na ordem certa |
| 3 | Concha | Rio | Porto Sereia | **Marujo Netuno Silva**, ex-campeão de remo | comportas mudam o nível da água |
| 4 | Folha | Mata | Vila Buriti | **Dona Buriti**, raizeira | labirinto de cipós que cresce a cada passo |
| 5 | Barro | Terra | Pantanal Grande | **Boiadeira Zefa**, peoa | pisos de lama que afundam |
| 6 | Estrela | Encanto | Cidade Coral | **Iracema Lua**, rendeira | espelhos de renda refletem raios de luz |
| 7 | Raio | Trovão | Ilha do Farol | **Faroleiro Volta**, inventor | circuitos ligam pontes elétricas |
| 8 | Lamparina | Assombro | Serra Fumaça | **Dona Benta Sombra**, contadora de causos | salas escuras; só a lamparina mostra o caminho real |
| 9 | Cristal | Pedra | Chapada Rubra | **Garimpeiro Topázio** | trilhos de vagonete para desviar |
| 10 | Chama | Brasa | Arraial Brasa | **Ferreira Labareda** | fogueiras de São João a acender em sequência musical |
| 11 | Berimbau | Ginga | Cidade Ginga | **Mestre Gingado**, capoeirista | roda de capoeira: duelos no ritmo do berimbau (minijogo) |
| 12 | Engrenagem | Ferro | Vila Ferrugem | **Engenheira Bigorna** | esteiras e engrenagens que mudam de direção |
| 13 | Espinho | Veneno | Brejo Roxo | **Doutor Peçonha**, herpetólogo | piso tóxico; plantas antídoto marcam o caminho |
| 14 | Floco | Geada | Serra da Geada | **Gaúcha Pinhão** | gelo escorregadio (o jogador desliza até bater) |
| 15 | Olho | Mente | Planalto Lume | **Astrônoma Jaci** | teletransportes entre constelações |
| 16 | Escama | Lenda | Aldeia Tupã | **Pajé Trovão-Velho** | trilha das 4 provas elementais |

**Conselho dos Guardiões (Pico Pindorama):**
- **Guardiã do Mar Iara Costa:** Rio e Encanto.
- **Guardião da Mata Cauã:** Mata e Inseto.
- **Guardiã do Céu Jandaia:** Vento e Trovão.
- **Guardião da Terra Moacir:** Terra, Pedra e Ferro.
- **Guardião-Mor Arandu:** equipe mista com 1 lendário.

**Revanches:** pelo Rádio Cipó, com equipes de nível mais alto no pós-jogo.

---

## 6. Diário de Campo: 180 criaturas

### 6.1 Tipos (17) e tabela de eficácia
Tipos: **Comum, Mata, Brasa, Rio, Trovão, Geada, Ginga, Veneno, Terra, Vento, Mente, Inseto, Pedra, Assombro, Lenda, Ferro, Encanto.**

Multiplicadores: ×2 (forte), ×0,5 (fraco) e ×0 (nulo). Nas criaturas de dois tipos, os multiplicadores se multiplicam.

| Ataque ↓ | Forte (×2) contra | Fraco (×0,5) contra | Nulo (×0) contra |
|---|---|---|---|
| Comum | — | Pedra, Ferro | Assombro |
| Mata | Rio, Terra, Pedra | Brasa, Mata, Veneno, Vento, Inseto, Lenda, Ferro | — |
| Brasa | Mata, Geada, Inseto, Ferro | Brasa, Rio, Pedra, Lenda | — |
| Rio | Brasa, Terra, Pedra | Rio, Mata, Lenda | — |
| Trovão | Rio, Vento | Trovão, Mata, Lenda | Terra |
| Geada | Mata, Terra, Vento, Lenda | Brasa, Rio, Geada, Ferro | — |
| Ginga | Comum, Geada, Pedra, Ferro | Veneno, Vento, Mente, Inseto, Encanto | Assombro |
| Veneno | Mata, Encanto | Veneno, Terra, Pedra, Assombro | Ferro |
| Terra | Brasa, Trovão, Veneno, Pedra, Ferro | Mata, Inseto | Vento |
| Vento | Mata, Ginga, Inseto | Trovão, Pedra, Ferro | — |
| Mente | Ginga, Veneno | Mente, Ferro, Assombro | — |
| Inseto | Mata, Mente | Brasa, Ginga, Veneno, Vento, Assombro, Ferro, Encanto | — |
| Pedra | Brasa, Geada, Vento, Inseto | Ginga, Terra, Ferro | — |
| Assombro | Mente, Assombro | Encanto | Comum |
| Lenda | Lenda | Ferro | Encanto |
| Ferro | Geada, Pedra, Encanto | Brasa, Rio, Trovão, Ferro | — |
| Encanto | Ginga, Lenda, Assombro | Brasa, Veneno, Ferro | — |

### 6.2 Regras do Diário
- As **180 criaturas são capturáveis dentro dos mapas.** Os estágios evoluídos dos iniciais aparecem como **Ninhos Raros** na Floresta Ancestral, no pós-jogo.
- **Iniciais extras:** os 2 iniciais não escolhidos chegam ao jogador assim:
  - o **primeiro da ordem Mata → Brasa → Rio** é presente da Drª Buriti em B1, depois da insígnia 4;
  - o **outro** nasce de um ovo achado no ninho da Praia das Tartarugas, depois da insígnia 6.
- **Formato dos dados:** cada criatura em `src/data/criaturas.ts` traz:
  - número e nome;
  - tipo(s);
  - **estatísticas base escritas à mão** (Vida, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade), com soma de 280 a 330 no estágio básico, 400 a 480 no médio, 500 a 540 no final e 580 a 620 nos lendários;
  - lista de golpes por nível (de 8 a 14) e compatibilidade com Pergaminhos de Técnica;
  - evolução, taxa de captura, experiência base e ganho de esforço;
  - **texto do Diário** (2 frases, em português, com informação real e curiosa sobre o animal);
  - altura, peso e habitat.
- **Legenda da tabela:** G = grama/habitat terrestre; A = sacudir árvore; Q = quebrar rocha; C = caverna; S = sobre a água; P = pesca; M = mergulho; E = evento. Raridade: c = comum, i = incomum, r = rara, mr = muito rara. Período: (D) dia, (N) noite, (M) manhã.

### 6.3 Encontros (jogabilidade clássica)
- **Grama alta, cavernas e áreas escuras:** encontro aleatório por passo, com taxa por zona (padrão 10%, de 5% a 20% conforme a zona, escrita nos dados). A grama alta balança e o jogador fica meio encoberto nela.
- **Água:** encontros ao remar (taxa própria); **pesca** com 3 varas (Vara Velha, Vara Boa, Vara Mestra), cada uma com tabela própria por zona.
- **Árvores sacudíveis** (marcadas por um tronco mais grosso): sacudir pode derrubar uma criatura.
- **Rochas rachadas:** quebrar pode revelar uma criatura.
- **Tabelas de encontro escritas à mão** por zona, período (manhã, dia, noite) e método, com nível mínimo e máximo e peso; as zonas antigas ganham uma **camada pós-insígnia** com novas espécies.
- **Repelente** (Fumaça de Andiroba) evita encontros de nível menor que o da primeira criatura da equipe.
- **Transição de batalha:** redemoinho de folhas (selvagem), listras diagonais (treinador), relâmpago e escurecimento (lendário).
- **Opcional nas opções:** a criatura que está na frente da equipe **segue o jogador** no mapa (desligado por padrão, como no clássico).

### 6.4 Tabela das 180 criaturas
| # | Nome | Tipo | Inspiração | Evolução | Onde capturar |
|---|---|---|---|---|---|
| 1 | Tamanduí | Mata | tamanduá-mirim com pelagem de folhas | →2 nv16 | Inicial (A1) · Ninho Raro B-FA |
| 2 | Tamanduá-Copa | Mata | tamanduá com copa de folhas no dorso | →3 nv36 | Ninho Raro B-FA (r) |
| 3 | Bandeirão | Mata/Terra | tamanduá-bandeira com cauda-bandeira de folhagem | — | Ninho Raro B-FA (mr) |
| 4 | Guaraxim | Brasa | filhote de lobo-guará de crina em brasa | →5 nv16 | Inicial (A1) · Ninho Raro B-FA |
| 5 | Guaraflama | Brasa | lobo-guará jovem com pernas de chama | →6 nv36 | Ninho Raro B-FA (r) |
| 6 | Lobo-Fornalha | Brasa/Ginga | lobo-guará de pernas longas em postura de luta | — | Ninho Raro B-FA (mr) |
| 7 | Botinho | Rio | filhote de boto-cor-de-rosa | →8 nv16 | Inicial (A1) · Ninho Raro B-FA |
| 8 | Botorosa | Rio | boto jovem com nadadeiras de espuma | →9 nv36 | Ninho Raro B-FA (r) |
| 9 | Iaraboto | Rio/Encanto | boto encantado com chapéu de espuma | — | Ninho Raro B-FA (mr) |
| 10 | Pipirim | Comum/Vento | pardal-do-mato | →11 nv18 | A-R1 G c (D) · A-R2 G c (D) |
| 11 | Bem-te-viço | Comum/Vento | bem-te-vi de máscara negra | →12 nv34 | A-R5 G i (D) · B-CE G c (D) |
| 12 | Gaviãozão | Comum/Vento | gavião-carijó altivo | — | B-CH G r (D) · PP G i |
| 13 | Cotiazinha | Comum | cutia filhote | →14 nv20 | A-R1 G c · A-MS G c |
| 14 | Cotiadã | Comum | cutia com sementes guardadas nas bochechas | — | A-R5 G i · B-R3 G c |
| 15 | Lagartim | Inseto | lagarta de borboleta-coruja | →16 nv7 | A-R2 G c (D) · A-MS G c |
| 16 | Casulim | Inseto | crisálida dourada | →17 nv10 | A-MS A i |
| 17 | Bruxaluz | Inseto/Encanto | mariposa-bruxa de olhos nas asas | — | A-MS G r (N) · B-CE G i (N) |
| 18 | Formigaço | Inseto/Terra | saúva cortadeira | →19 nv26 | B-CE G c · A-R3 G i |
| 19 | Saúva-Rainha | Inseto/Terra | rainha alada de formigueiro | — | B-R3 G r · B-CE Q i |
| 20 | Gambazinho | Comum/Veneno | gambá-de-orelha-branca filhote | →21 nv24 | A-R1 G c (N) · A-R2 G c (N) |
| 21 | Gambarrão | Comum/Veneno | gambá adulto com filhotes nas costas | — | A-R5 G i (N) · B-VV G c |
| 22 | Saguinho | Comum | sagui-de-tufo-branco | →23 nv25 | A-MS A c (D) |
| 23 | Saguinete | Comum/Ginga | sagui acrobata | — | A-R6 A i |
| 24 | Pererequinha | Rio | perereca-verde | →25 nv22 | A-R3 G c (N) · A-MG G c |
| 25 | Pererecão | Rio | perereca-macaco gigante | →26 nv38 | B-PA G c · A-MG G i (N) |
| 26 | Sapo-Cururuí | Rio/Veneno | sapo-cururu de glândulas reluzentes | — | B-VV G i · B-TA M r |
| 27 | Pintinhas | Inseto/Encanto | joaninha brasileira multicolor | — | A-R2 A i (D) |
| 28 | Vagalumim | Inseto/Trovão | vaga-lume | →29 nv27 | A-R3 G c (N) · B-CE G c (N) |
| 29 | Vagalampo | Inseto/Trovão | pirilampo-lanterna elétrico | — | A-US G c · B-CE G r (N) |
| 30 | Morceguim | Vento/Assombro | morcego-de-fruta filhote | →31 nv22 | A-GE C c · A-GB C c |
| 31 | Morcegão | Veneno/Vento | morcego-vampiro | →32 por amizade | A-GB C i · B-CV C c |
| 32 | Vampirinha | Veneno/Vento | morcego-vampiro de capa membranosa | — | B-CV C r (N) · PP C r |
| 33 | Tatuzim | Terra | tatu-bola filhote | →34 nv30 | A-R2 G i · B-CE G c |
| 34 | Tatucanastra | Terra/Ferro | tatu-canastra de placas metálicas | — | B-CH G i · B-R2 G c |
| 35 | Caranguejim | Rio | caranguejo-uçá | →36 nv28 | A-MG G c · A-BA G c (praia) |
| 36 | Guaiamuque | Rio/Pedra | guaiamum de garra azul gigante | — | A-MG G i · A-PR G c |
| 37 | Piabinha | Rio | piaba prateada | →38 nv30 | A-R3 P c · A-BA P c · B-PA P c |
| 38 | Dourado-Rei | Rio/Brasa | peixe dourado com escamas de brasa | — | B-PA P r · A-R6 P i |
| 39 | Mandizinho | Rio | bagre-mandi de bigodes | →40 nv35 | A-GE P c · B-PA P c |
| 40 | Jaú-Gigante | Rio/Terra | bagre jaú colossal | — | B-PA P mr · B-TA P r |
| 41 | Calanguinho | Brasa | calango da restinga | →42 nv30 | A-R2 G c (D) · B-CE G c (D) |
| 42 | Calangão | Brasa/Pedra | teiú de escamas vulcânicas | — | B-CV C c · B-CH G i |
| 43 | Corujinha | Vento/Mente | caburé | →44 nv24 | A-MS G c (N) · A-R1 G i (N) |
| 44 | Corujão-Orelha | Vento/Mente | corujão-orelhudo | — | B-CE G i (N) · A-R6 G r (N) |
| 45 | Quero-querinho | Vento | quero-quero filhote | →46 nv28 | A-R1 G i · B-R1 G c |
| 46 | Quero-Guarda | Vento/Ginga | quero-quero de esporões nas asas | — | B-R1 G r · B-R3 G i |
| 47 | Beija-florzim | Vento/Encanto | beija-flor-tesoura | →48 Pedra Solar | A-R2 G r (D) · B-SG G c (D) |
| 48 | Beija-Arco-Íris | Vento/Encanto | beija-flor iridescente | — | B-PL G mr (D) |
| 49 | Tucaninho | Vento | tucano-de-bico-verde filhote | →50 nv30 | A-MS A i (D) · B-R1 G c |
| 50 | Tucanuçu | Vento/Brasa | tucano-toco com bico em chamas | — | A-R6 A r · B-R3 G i |
| 51 | Ararinha | Vento | arara-canindé filhote | →52 nv34 | B-R1 G c (D) · B-CH G c |
| 52 | Araracanga | Vento/Trovão | arara-vermelha de penas elétricas | — | B-CH G r · PP G i |
| 53 | Papagaiozim | Comum/Vento | papagaio-verdadeiro | →54 por amizade | A-R5 G c · B-R3 G c |
| 54 | Papagálio | Comum/Mente | papagaio que imita golpes ouvidos | — | B-PL G r |
| 55 | Urubuzim | Vento/Assombro | urubu filhote | →56 nv36 | A-R4 G c · B-R2 G c |
| 56 | Urubu-Rei | Vento/Assombro | urubu-rei de cabeça colorida | — | B-CH G mr · B-PL G r |
| 57 | Capivarinha | Comum/Rio | capivara filhote | →58 nv30 | A-R3 G c · B-PA S c |
| 58 | Capivarona | Comum/Rio | capivara zen com aves pousadas | — | B-PA G i · B-LG S r |
| 59 | Ouriço-Mirim | Comum | ouriço-cacheiro filhote | →60 nv26 | A-MS G i (N) · A-R5 G c (N) |
| 60 | Ouriçudo | Comum/Veneno | ouriço de espinhos venenosos | — | B-SG G i (N) |
| 61 | Preguicim | Comum/Mente | preguiça-de-três-dedos filhote | →62 nv34 | A-MS A r (D) · A-R6 A i |
| 62 | Preguiçona | Comum/Mente | preguiça com musgo e flores no pelo | — | A-MT A r · B-FA A r |
| 63 | Bugiozinho | Ginga | bugio filhote | →64 nv32 | A-MS A i · A-R6 A c |
| 64 | Bugio-Trovão | Ginga/Trovão | bugio de uivo trovejante | — | A-US G r · B-R3 A r |
| 65 | Preguinho | Ginga | macaco-prego que usa pedras | →66 nv36 | A-R5 G c · B-R3 G c |
| 66 | Prego-Mestre | Ginga/Ferro | macaco-prego com martelo de pedra-ferro | — | B-R3 G r · PP G i |
| 67 | Mico-Leãozim | Brasa/Ginga | mico-leão-dourado filhote | →68 Pedra Solar | A-R6 A r (D) |
| 68 | Leão-Dourado | Brasa/Ginga | mico-leão de juba flamejante | — | A-MT A mr (D) |
| 69 | Jaguatirim | Comum | jaguatirica filhote | →70 nv32 | A-R5 G r (N) · B-CE G i (N) |
| 70 | Jaguatiricão | Comum/Assombro | jaguatirica de rosetas que somem | — | B-R5 G r (N) |
| 71 | Onçinha | Comum | onça-pintada filhote | →72 nv40 | B-PA G r · B-R1 G mr |
| 72 | Pintada | Comum/Ginga | onça-pintada majestosa | — | B-FA G r · PP G r |
| 73 | Ariranhinha | Rio/Ginga | ariranha filhote | →74 nv32 | B-PA S i · A-R6 S r |
| 74 | Ariranhão | Rio/Ginga | ariranha de bando | — | B-PA S r |
| 75 | Lontrinha | Rio | lontra neotropical | →76 nv30 | A-R6 S c · B-LG S c |
| 76 | Lontra-Veloz | Rio/Vento | lontra que surfa nas corredeiras | — | B-LG S i |
| 77 | Manatim | Rio/Encanto | peixe-boi filhote | →78 nv40 | A-MG S r · A-BA S r |
| 78 | Manatão | Rio/Encanto | peixe-boi gentil com algas | — | A-RS M r |
| 79 | Tartaruí | Rio | tartaruga-verde filhote | →80 nv38 | A-PR S c (N) · A-BA S c |
| 80 | Tartaruga-Gigante | Rio/Pedra | tartaruga-de-couro com casco de recife | — | A-PR S r (N) · A-RS M i |
| 81 | Jabutim | Mata/Pedra | jabuti-piranga filhote | →82 nv34 | A-R2 G i · B-CE G i |
| 82 | Jabutipiranga | Mata/Pedra | jabuti com jardim de pedras no casco | — | B-R2 G r · B-CH G i |
| 83 | Jacarezinho | Rio | jacaré-de-papo-amarelo filhote | →84 nv28 | A-MG G c · B-PA G c |
| 84 | Jacaretinga | Rio/Terra | jacaretinga do pantanal | →85 nv45 | B-PA G i · B-VV G c |
| 85 | Jacaruçu | Rio/Lenda | jacaré-açu colossal | — | B-PA S mr · B-FA S r |
| 86 | Sucurizinha | Rio/Terra | sucuri filhote | →87 nv38 | B-PA S i · B-VV G i |
| 87 | Sucurião | Rio/Terra | sucuri gigante enrolada em tronco | — | B-VV S r · B-TA M r |
| 88 | Jararaquinha | Veneno | jararaca filhote | →89 nv32 | A-R4 G c · B-R2 G c |
| 89 | Jararacuçu | Veneno/Terra | jararacuçu de escamas foscas | — | B-VV G i |
| 90 | Coralzinha | Veneno/Encanto | cobra-coral de anéis luminosos | — | A-MS G mr · B-VV G r |
| 91 | Cascavelzim | Veneno/Terra | cascavel filhote | →92 nv30 | B-CE G c · B-R2 G i |
| 92 | Cascavelão | Veneno/Terra | cascavel de chocalho-tambor | — | B-CH G i |
| 93 | Graxaim | Comum/Assombro | graxaim-do-mato | →94 nv34 | A-R4 G i (N) · B-R1 G c (N) |
| 94 | Graxaim-da-Névoa | Assombro | graxaim feito de neblina | — | B-R5 G i |
| 95 | Quatinho | Comum | quati filhote | →96 nv28 | A-MS G c · A-R6 G c |
| 96 | Quatizão | Comum/Ginga | quati de cauda anelada erguida | — | B-R3 G i |
| 97 | Tapirinho | Terra | anta filhote listrada | →98 nv34 | B-R1 G i · A-R6 G r |
| 98 | Antão | Terra/Mata | anta com plantas no lombo | — | B-PA G r · B-FA G i |
| 99 | Catingueirinho | Comum/Encanto | veado-catingueiro | →100 nv36 | A-R5 G i (D) · B-CE G c (D) |
| 100 | Cervo-do-Pantanal | Rio/Encanto | cervo de galhada aquática | — | B-PA G r (D) |
| 101 | Ema-Mirim | Comum/Ginga | ema filhote | →102 nv34 | B-CE G c (D) |
| 102 | Emaçu | Terra/Ginga | ema de passadas sísmicas | — | B-CH G i |
| 103 | Seriemim | Comum | seriema filhote | →104 nv30 | B-CE G c · B-R1 G i |
| 104 | Seriemão | Ginga/Comum | seriema que golpeia com o bico | — | B-R2 G i · B-CH G r |
| 105 | Tuiuiuzim | Vento/Rio | tuiuiú filhote | →106 nv36 | B-PA G c (D) |
| 106 | Tuiuiú | Vento/Rio | tuiuiú de papo vermelho | — | B-PA G i · B-LG G r |
| 107 | Garcinha | Vento/Rio | garça-branca-pequena | →108 nv30 | A-MG G c · A-R3 G c |
| 108 | Garça-Real | Vento/Rio | garça-real elegante | — | A-MG G i · B-PA G i |
| 109 | Harpinha | Vento/Ginga | filhote de gavião-real | →110 nv45 | A-MT G r · B-FA G r |
| 110 | Harpia | Vento/Ginga | harpia de penacho imponente | — | B-FA G mr · PP G r |
| 111 | Pirarucinho | Rio | pirarucu filhote | →112 nv40 | B-PA P i |
| 112 | Pirarucão | Rio/Lenda | pirarucu de escamas vermelhas antigas | — | B-PA P mr · B-TA M r |
| 113 | Piranhinha | Rio | piranha-vermelha | →114 nv30 | B-PA S c · A-R6 S c |
| 114 | Piranhão | Rio/Ginga | piranha de cardume | — | B-PA S i · B-VV S i |
| 115 | Poraquim | Rio/Trovão | poraquê filhote | →116 nv34 | A-US S i · B-PA S r |
| 116 | Poraquê | Rio/Trovão | peixe-elétrico em espiral | — | B-TA M i |
| 117 | Arraiazinha | Rio/Veneno | arraia-de-fogo | →118 nv32 | A-BA S i · B-PA S i |
| 118 | Arraião | Rio/Veneno | arraia gigante de ferrão | — | A-RS M i |
| 119 | Hipocampim | Rio/Lenda | cavalo-marinho | →120 nv34 | A-RS M r |
| 120 | Hipocampo | Rio/Lenda | cavalo-marinho com crina de algas | — | A-RS M mr |
| 121 | Polvinho | Rio/Mente | polvo filhote | →122 nv36 | A-BA S r (N) · A-RS M c |
| 122 | Polvão | Rio/Mente | polvo que muda de padrão | — | A-RS M r |
| 123 | Estrelinha | Rio/Encanto | estrela-do-mar | →124 Pedra Maré | A-PR G c (N) · A-BA S c |
| 124 | Estrelaça | Rio/Mente | estrela-do-mar de 5 olhos | — | A-RS M mr |
| 125 | Medusim | Rio/Veneno | água-viva | →126 nv30 | A-BA S c · A-PR S c |
| 126 | Medusão | Rio/Veneno | água-viva-juba | — | A-BA S i (N) · A-RS M i |
| 127 | Aruá | Rio/Pedra | caramujo-aruá | →128 nv32 | A-MG G c · B-PA G c |
| 128 | Aruazão | Rio/Pedra | caramujo de concha-fortaleza | — | B-VV G i |
| 129 | Sirizim | Rio | siri-azul | →130 nv34 | A-PR G c · A-MG G c |
| 130 | Siri-Couraça | Rio/Ferro | siri de carapaça metálica | — | A-RS M i |
| 131 | Baleiazinha | Rio | filhote de baleia-franca | →132 nv40 | A-BA S r (estação fria do relógio) |
| 132 | Jubartão | Rio/Geada | jubarte cantora | — | A-BA S mr · B-LG S r (pós-jogo) |
| 133 | Pinguinzinho | Geada/Rio | pinguim-de-magalhães visitante | →134 nv32 | A-PR G r (estação fria) · B-LG S c |
| 134 | Pinguimar | Geada/Rio | pinguim surfista | — | B-LG S i |
| 135 | Gralhinha | Vento/Geada | gralha-azul filhote | →136 nv30 | B-SG G c (D) |
| 136 | Gralha-Azul | Vento/Geada | gralha que planta pinheiros | — | B-SG G i (D) · PP G i |
| 137 | Serelepim | Comum/Geada | serelepe com pinhão | →138 nv28 | B-SG A c · A-R6 A i |
| 138 | Serelepão | Geada/Mata | serelepe guardião de araucárias | — | B-SG A i |
| 139 | Maracajim | Geada/Ginga | gato-maracajá filhote | →140 nv34 | B-SG G i (N) · A-MT G r (N) |
| 140 | Maracajá-Nevado | Geada/Ginga | maracajá de pelagem de geada | — | B-SG G r (N) · PP G r |
| 141 | Grilinho | Inseto/Trovão | grilo-paquinha | →142 nv26 | A-R4 G c (N) · A-US G c |
| 142 | Grilão-Elétrico | Inseto/Trovão | grilo de asas-capacitor | — | A-US G i · B-CE G i (N) |
| 143 | Besourim | Inseto/Ferro | besouro-rinoceronte filhote | →144 nv34 | A-R4 A i · B-R3 A c |
| 144 | Herculão | Inseto/Ferro | besouro-hércules de chifre de aço | — | A-R6 A r · B-FA A i |
| 145 | Escorpim | Veneno/Terra | escorpião-amarelo | →146 nv36 | B-CV C c · B-R2 G i |
| 146 | Escorpião-Rei | Veneno/Ferro | escorpião de couraça forjada | — | B-CV C r |
| 147 | Caranguejeirinha | Inseto/Veneno | aranha-caranguejeira filhote | →148 nv30 | A-GE C i (N) · B-VV G c |
| 148 | Caranguejeirão | Inseto/Veneno | caranguejeira peluda gigante | — | B-VV G i |
| 149 | Jataí | Inseto/Encanto | abelha-jataí | →150 nv26 (só fêmeas) | A-R2 A c (D) · B-R1 A c |
| 150 | Jataí-Rainha | Inseto/Encanto | rainha com coroa de cera | — | B-PL A r (D) |
| 151 | Marimbinho | Inseto/Veneno | marimbondo filhote | →152 nv28 | A-R4 A c · B-R2 A c |
| 152 | Marimbondão | Inseto/Veneno | marimbondo-caboclo | — | B-VV A i |
| 153 | Cigarrim | Inseto/Comum | cigarra | →154 nv24 | A-R1 A c (D) · B-CE A c |
| 154 | Cigarrão | Inseto/Vento | cigarra de canto sônico | — | B-R3 A i |
| 155 | Lavadeirim | Inseto/Vento | libélula | →156 nv38 | A-R3 G c · B-PA G c |
| 156 | Lavadeira-Dragão | Inseto/Lenda | libélula de asas de vitral | — | B-LG G r · A-MT G r |
| 157 | Louvadeuzim | Inseto/Ginga | louva-a-deus | →158 nv30 | A-MS G r · B-R3 G i |
| 158 | Louva-Mestre | Inseto/Ginga | louva-a-deus mestre de kata | — | B-PL G r |
| 159 | Minhocuçu | Terra | minhoca-gigante | →160 nv40 | B-R2 Q c · B-CE Q i |
| 160 | Minhocão | Terra/Lenda | minhocão das lendas | — | B-FA Q mr · B-TA M r |
| 161 | Tuquim | Terra | tuco-tuco | →162 nv32 | B-SG G c · B-R4 G c |
| 162 | Tuco-Escavador | Terra/Ferro | tuco-tuco de garras-pá | — | B-R4 Q i |
| 163 | Cupinzim | Inseto/Pedra | cupim-soldado | →164 nv34 | B-CE Q c · A-R4 Q i |
| 164 | Cupinzeiro-Vivo | Pedra/Inseto | cupinzeiro andante | — | B-CE Q r |
| 165 | Mocozim | Pedra/Comum | mocó das rochas | →166 nv30 | B-CH G c · B-R2 G c |
| 166 | Mocó-da-Rocha | Pedra | mocó de pelagem mineral | — | B-CH Q i · B-R4 Q i |
| 167 | Andorim | Vento/Pedra | andorinhão-de-coleira | →168 nv32 | A-GE C c · A-R6 G i |
| 168 | Andorinhão-da-Cachoeira | Vento/Rio | andorinhão que mora atrás das cascatas | — | A-R6 S r · A-MT G i |
| 169 | Urutauzim | Assombro/Vento | urutau filhote | →170 nv36 | A-R5 A r (N) · B-CE A i (N) |
| 170 | Urutau-Fantasma | Assombro/Mente | mãe-da-lua de olhos enormes | — | B-R5 A r (N) |
| 171 | Noitim | Assombro/Mente | macaco-da-noite | →172 nv34 | A-GB C c · A-MS A r (N) |
| 172 | Noitão | Assombro/Mente | macaco-da-noite de olhos-lua | — | A-MT A i (N) · B-R5 A i (N) |
| 173 | **Boitatá** | Lenda/Brasa | serpente de fogo | — | B-CV E (depois da insígnia 10, nv 50) |
| 174 | **Boiúna** | Lenda/Rio | cobra-grande das águas | — | A-RS E (fundo do recife, depois da insígnia 12, nv 52) |
| 175 | **Mapinguari** | Lenda/Terra | preguiça-gigante ancestral | — | B-FA E (pós-jogo, nv 65) |
| 176 | **Queixada-Caipora** | Lenda/Mata | queixada guardião da mata | — | errante no mapa B depois da insígnia 13 (nv 55) |
| 177 | **Uirapuru** | Encanto/Vento | pássaro cujo canto silencia a mata | — | B-SG E ao amanhecer, com 150 no Diário |
| 178 | **Gavião-Tupã** | Lenda/Trovão | gavião do trovão | — | A9 E (topo do Monte Tupã, depois da insígnia 16, nv 60) |
| 179 | **Lobo-Jaci** | Mente/Assombro | lobo da lua | — | errante noturno nos 2 mapas depois do Conselho (lua cheia do relógio) |
| 180 | **Onça-Guaraci** | Brasa/Lenda | onça do sol | — | errante diurno nos 2 mapas depois do Conselho |

**Exigências da tabela:**
- Cada zona lista nos dados de **6 a 16 espécies** por período, com faixa de nível e peso.
- Toda criatura da tabela aparece em **pelo menos um habitat** ou evento acessível.
- Se o jogador **soltar ou perder um lendário**, ele reaparece no mesmo lugar depois do Conselho.

### 6.5 Lendários extras do pós-jogo (pedido do autor: fora do esquema da fauna brasileira)
Duas criaturas **secretas**, numeradas 181 e 182. Não contam para os 180 do Diário (o Diário continua "completo" com 180); aparecem numa página extra, "Visitantes", que só surge depois do primeiro encontro. Cada uma é o prêmio de uma **missão extra** liberada com as **16 insígnias**.

| Nº | Nome | Tipos | Inspiração | Onde capturar |
|---|---|---|---|---|
| 181 | **Galo-Manaó** | Vento/Rio | galo-da-serra, ave símbolo dos arredores de Manaus; metade da plumagem é escura como o rio Negro e metade cor de areia como o Solimões, sem se misturar, como no Encontro das Águas | missão "O Encontro das Águas" (nv 60) |
| 182 | **Borealce** | Geada/Encanto | alce nórdico europeu com galhada que acende em aurora boreal; um visitante de terras distantes, trazido por uma expedição de pesquisadores do norte | missão "A Expedição Boreal" (nv 65) |

**Missão "O Encontro das Águas" (181):** com as 16 insígnias, um canoeiro em A4 Porto Sereia conta que uma ave rara só dança onde duas águas correm lado a lado. O jogador leva ao canoeiro um frasco de **água escura** (colhida de noite num rio do mapa A, com Mergulho) e um de **água barrenta** (colhida de dia num rio do mapa B, com Cachoeira). O canoeiro abre a rota para a zona nova `X-EA` (ilhota fluvial de duas cores, exige Remo). Ali há um quebra-cabeça de correnteza: remar sempre na linha em que as duas águas se encontram, sem cruzar para um lado só. No fim, o Galo-Manaó faz a dança de corte numa arena de pedra; a batalha só começa se o jogador assistir à dança sem se mexer.

**Missão "A Expedição Boreal" (182):** depois de vencer o Conselho, um navio de pesquisa de bandeira estrangeira encalha no cais de B9. A pesquisadora-chefe, a **Drª Solveig**, perdeu o animal que estudava: ele subiu a serra atrás de frio. O jogador recolhe 4 **Lanternas Boreais** espalhadas pelas zonas geladas (cada uma guardada por um treinador da expedição, com criaturas de Geada) e as acende no alto do Pico Pindorama, de noite. O céu da zona ganha a aurora (camada de fundo animada exclusiva) e o Borealce aparece. É o único encontro do jogo com música e arena próprias de fora do Brasil; a Drª Solveig explica no Diário que ele é um visitante e não pertence à fauna local.

**Regras:** atributos de lendário (soma 580–620), `taxaCaptura` 3, sem sexo, sem evolução; modelo, sprite, grito e animação próprios como os demais; se o jogador soltar ou perder, a missão permite reencontro. A verificação da progressão (`npm run check`) confere as duas missões além das 180.

---

## 7. Batalha

- **Formato:**
  - 1×1 por padrão.
  - 2×2 em certos treinadores, nos líderes 11 a 16 e no Conselho.
  - Selvagens podem vir em **dupla** à noite em B-PA (diferencial).
- **Fluxo:**
  - **Entrada:** cortina diagonal, dolly de câmera, e o treinador arremessa a cuia (animação do jogador).
  - **Menu:** Lutar, Equipe, Mochila, Fugir/Capturar.
  - **Golpes:** até 4 por criatura, com Pontos de Golpe (PG).
- **Estatísticas e fórmulas:**
  - **Ordem dos turnos:** prioridade, depois Velocidade; empate decidido pelo RNG.
  - **Precisão** e **crítico** (1/16).
  - **Dano:** `((2·Nv/5+2)·Poder·A/D)/50+2`, × eficácia × mesmo-tipo 1,5 × variação de 0,85 a 1,0.
  - **Experiência e esforço** por vitória; **personalidades** (10 autorais) dão +10%/−10% em atributos.
- **Status:**
  - **Principais:** queimado, envenenado, paralisado, dormindo, congelado e **encantado**. O encantado é original: 50% de chance de imitar o último golpe do alvo.
  - **Voláteis:** confusão, preso, atordoado.
  - **Climas:** sol forte, chuva, garoa gelada, névoa e poeira; vêm da zona ou de golpes.
- **Golpes:** **≥ 220 golpes autorais** em `golpes.ts`, com nome, tipo, categoria (físico/especial/status), poder, precisão, PG, prioridade, efeito e **animação própria**. Os efeitos visuais são compostos de FX pré-renderizados por tipo (seção 12).
- **Captura:**
  - **Fórmula:** `chance = (3·VidaMáx − 2·VidaAtual)·taxa·bônusCuia·bônusStatus / (3·VidaMáx·255)`.
  - **Animação:** a cuia tampa a criatura e balança 1 a 3 vezes, entre folhas e brilhos; o resultado aparece como **"Parceria firmada!"** ou com a criatura escapando.
  - **Cuias (8 tipos autorais):** Cuia, Cuia Trançada, Cuia de Ouro, Cuia de Rede (bônus contra Rio e Inseto), Cuia Noturna (bônus à noite), Cuia Rápida (bônus no 1º turno), Cuia de Mel (amizade), Cuia Guardiã (100%, uma única no jogo).
- **IA dos treinadores (4 níveis):**
  - **novato:** golpes aleatórios entre os válidos;
  - **treinador:** prefere super-efetivo e troca quando está em desvantagem grave;
  - **líder:** usa status e clima, cura com itens e troca para pressionar a vantagem;
  - **Conselho:** prevê trocas, usa combos de clima e golpes, guarda o lendário para o fim.
  - A **equipe de cada líder** é planejada à mão, com estratégia descrita num comentário no arquivo de dados.
- **Evolução:** cinemática com silhueta piscando e brilho crescente; pode ser cancelada com B. Gatilhos: nível, item (Pedra Solar, Pedra Maré, Pedra Lunar, Folha Ancestral, Engrenagem Velha), amizade, horário ou local.
- **Amizade:** cresce andando juntos, vencendo e com cafuné no menu (minianimação). Afeta evoluções e a criatura que segue o jogador.

---

## 8. Itens, economia e serviços
- **Mochila em bolsos:** Itens, Remédios, Cuias, Pergaminhos de Técnica (golpes ensináveis, 50 autorais, reutilizáveis), Frutos (frutas brasileiras: caju, pitanga, jabuticaba, cupuaçu, pequi, buriti, açaí, acerola) e Itens-chave.
- **Remédios autorais:**
  - **Vida:** Chá de Erva-Cidreira (20), Garrafada (50), Elixir de Andiroba (total).
  - **Status:** Mel Puro, Unguento, Pomada de Copaíba.
- **Posto Guardião:** cura grátis, Viveiro de Cuias (PC), Rádio Cipó e o mural de missões.
- **Venda:** o estoque cresce com as insígnias.
- **Mercados especiais:** Feira de Porto Sereia, Feira da Cidade Ginga.
- **Dinheiro:** **Patacas**.
- **Frutos:** plantados em **canteiros** espalhados pelos mapas. Crescem pelo relógio do jogo; dão itens de cura ou ingredientes para chás.

---

## 9. Personagens, treinadores e roteiro

### 9.1 Personagens principais
- **Jogador:** 2 avatares (Kauê e Ayra).
- **Mãe** e **Profª Ipê Amarelo**.
- **Rival Tainá:** competitiva, que amadurece ao longo da história. 8 encontros com equipe que evolui.
- **Seu Aroeira:** guia, dá o Faro.
- **Drª Buriti:** pesquisadora do sertão.
- **Coronel Garrote:** chefe do Cartel Ferrugem.
- **3 tenentes do Cartel:** Lata, Arame e Rebite.

### 9.2 Treinadores
- **≥ 150 treinadores autorais**, com classe (Pescador, Escoteira, Capoeirista, Vaqueiro, Rendeira, Surfista, Mateira, Garimpeiro, Observadora de Aves, Bióloga, Repentista…), sprite, equipe, frase de desafio, frase de derrota e prêmio.
- Distribuídos pelas rotas segundo a curva de nível.
- **Linha de visão:** o treinador avista o jogador, um "!" salta sobre a cabeça e ele vem andando até ele.

### 9.3 Eventos (scripts declarativos em `src/data/eventos/*.ts`)
- **Comandos:** falar, mover, virar, esperar, dar item, batalha, câmera, tela, música, condição de flag, escolha.
- **Eventos da história (≥ 30):**
  - a entrega do Ovo Pintado;
  - roubo do inicial pela rival;
  - Usina, Pantanal, Farol, Mina, Laboratório e Pico;
  - resgate das criaturas traficadas, que são devolvidas aos habitats;
  - lendários;
  - a sequência final.
- **Missões paralelas (≥ 20):** por exemplo, devolver 5 filhotes perdidos às mães, consertar o rádio da Ilha do Farol, ajudar o festival de São João no Arraial Brasa e fotografar 10 aves para a observadora.

---

## 10. Sistemas e diferenciais (não genéricos)
1. **Decoração do Quarto** pelo PC: tapetes, pôsteres, plantas, consoles e bonecos de pelúcia das criaturas ganhos em eventos e na Venda; o quarto muda visualmente.
2. **Parceira que segue o jogador** (opção), com balões de emoção e achados.
3. **Amuletos de Campo + parceria de tipo** (seção 4.4): sem golpes de campo ocupando espaço.
4. **Relógio do jogo:**
   - 4 períodos (manhã, dia, tarde, noite), com transições suaves de cor;
   - semana com eventos fixos (feira às quintas, festival no sábado);
   - **estações**: a fria traz baleias e pinguins.
5. **Clima por zona:** chuva tropical, garoa, névoa e geada. Afeta encontros e batalhas.
6. **Rádio Cipó:**
   - **Contatos:** registro de treinadores e líderes para revanches.
   - **Programas de rádio:** dicas de onde estão as raras hoje, música e notícias do Cartel.
7. **Diário de Campo completo:**
   - **Por espécie:** habitat em mapa, pegadas, sons (toca a voz sintetizada da criatura), comparação de tamanho com o jogador, entradas de dia e de noite.
   - **Medalhas de pesquisador** a cada 30 espécies registradas.
8. **Resgates:** depois de cada evento do Cartel, as criaturas libertadas voltam ao habitat em cinemática. As áreas ficam **visualmente renovadas**: tiles alternativos com mais flores e animais no fundo.
9. **Ninhos e ovos (pós-insígnia 6):** deixando duas criaturas compatíveis no Viveiro do Seu Aroeira, aparecem ovos com golpes herdados.
10. **Fotografia:** a câmera de bolso tira foto de qualquer cena (modo foto com filtros CSS). As melhores vão para o álbum.

---

### 10A. Regrinhas clássicas do gênero (pedido do autor: adicionar o que tiver lógica, sem perder a essência)
Regras de jogabilidade herdadas dos RPGs de captura de portátil, reescritas para o mundo de Pingo (nomes, textos e conteúdo próprios). Fonte: conhecimento geral do gênero; o site de detonados indicado pelo autor não pôde ser consultado (rede bloqueada) e deve ser conferido depois para completar esta lista.

**Tempo e calendário**
1. **Criaturas do dia da semana:** em cada dia, um "irmão da semana" (7 NPCs espalhados pelos 2 mapas) aparece num lugar fixo e dá um item de reforço de tipo diferente; reunir os 7 rende um prêmio.
2. **Eventos semanais:** concurso de captura de insetos no Parque (terças, quintas e sábados: 20 min, vence o maior exemplar, prêmio em pedras de evolução); feira às quintas; uma rara das águas que só aparece às sextas numa gruta; cabeleireiro de criaturas (aumenta a amizade) em dias alternados.
3. **Encontros por período:** manhã, dia e noite com tabelas diferentes (já no 6.3); corujas e morcegos só à noite, borboletas só de manhã.
4. **Enxames:** o Rádio Cipó anuncia um enxame do dia: numa zona, uma espécie rara passa a ter 40% de chance.

**Captura e criaturas**
5. **Variante rara de cor ("Pelagem Rara"):** 1 chance em 4096 em qualquer encontro, com brilho ao entrar em batalha e paleta alternativa por criatura; uma é garantida na história (a do Lago, evento do Cartel).
6. **Cuias artesanais:** frutos de cuieira coloridos colhidos em árvores (voltam a cada dia) viram cuias especiais com o artesão — um dia de espera: cuia rápida (para as que fogem), cuia pesada (para as grandes), cuia da lua (para as que evoluem com pedra lunar), cuia amiga (amizade inicial alta), cuia de isca (para pescadas), cuia de nível (se o seu nível for maior), cuia do amor (sexo oposto da mesma espécie).
7. **Sacudir árvores e quebrar rochas** revelam criaturas e itens (já previsto); **pesca em 3 varas**; **criaturas errantes** que mudam de zona a cada troca de rota e aparecem no mapa-múndi depois de vistas.
8. **Febre da Mata:** condição raríssima e benéfica (1 em ~20 000 após batalha) que dobra o esforço ganho por 1–4 dias e passa para vizinhos da equipe; a enfermeira do Posto comenta.
9. **Item segurado:** cada criatura segura 1 item; selvagens às vezes vêm segurando um (5%/1%); frutos se usam sozinhos em batalha (cura, status).
10. **Amizade:** sobe ao andar, subir de nível, cafuné e cabeleireiro; cai ao desmaiar e com remédios amargos (baratos e fortes, mas a criatura não gosta); golpes cujo poder depende da amizade; evoluções por amizade (com variação dia/noite).
11. **Ovos e ninhos:** compatibilidade por "grupos de ninho", passos para chocar, golpes herdados do pai, genes herdados; o casal de Seu Aroeira avisa pelo rádio; filhotes exclusivos de ovo (pré-estágios).
12. **Trocas com NPCs:** 6 moradores trocam uma criatura específica por outra, que vem com apelido, item e ganha experiência extra, mas só obedece conforme o nº de insígnias.
13. **Obediência:** criatura recebida em troca acima do nível permitido pelas insígnias pode desobedecer (limites 20/30/50/70/todas).

**Mundo e serviços**
14. **Mãe poupadora:** guarda parte do dinheiro ganho e às vezes compra itens e pelúcias por conta própria (telefona avisando).
15. **Telefone dos treinadores:** depois de vencidos, alguns pedem o número; ligam para revanche (equipes que crescem com as insígnias), avisam de enxames e dão itens.
16. **Repelente, corda de fuga, doce de nível** (rapadura) e **mochila por bolsos** (já previstos); **item registrado no Select**.
17. **Cassino → "Barraca de Prendas":** minijogos de habilidade (memória de cartas e roda), sem aposta de dinheiro real nem caça-níqueis; fichas trocam por pergaminhos e uma criatura rara.
18. **Sorteio da semana no rádio:** um número é sorteado às sextas; quem tiver criatura com id que termine igual ganha prêmio (2, 3 ou 5 dígitos).
19. **Ruínas com enigmas de painel deslizante** que liberam criaturas-símbolo (variantes de forma por letra não entram; em Pingo são 4 pinturas rupestres que liberam câmaras com itens).
20. **Arvoredos de frutos:** cada árvore dá 1 fruto por dia; canteiros para replantar (já previsto).
21. **Torre de Desafios (pós-jogo):** 7 batalhas seguidas com níveis nivelados e sem itens, por faixas de nível; prêmios em vitaminas.
22. **Segunda região e "chefe final secreto":** já é a estrutura do jogo (mapa B + Pico); no topo do Pico, depois dos 2 lendários extras, espera um treinador misterioso com a equipe mais forte do jogo.
23. **Medidor de bicicleta e atalhos**, **cortar/empurrar/iluminar/atravessar água** pelos Amuletos (já previsto, sem ocupar golpes).
24. **Golpes e batalha:** divisão físico/especial por golpe (já), clima em batalha, golpes de preparo em 2 turnos, armadilhas de entrada, golpes de prioridade, acerto crítico, congelar/dormir/paralisar/queimar/envenenar, confusão e encanto, fuga garantida por velocidade, experiência dividida com o "Amuleto de Partilha" e experiência extra para criaturas trocadas.

**O que NÃO entra (perderia a essência ou é específico demais da franquia):** caça-níqueis, troca/batalha por cabo, criaturas de evento de distribuição, variantes por letra e qualquer nome, texto, mapa ou enigma copiado.

## 11. Interface (identidade própria)
- **Fonte:** autoral "Pindorama Talha", em SVG, com letras entalhadas em madeira.
- **Molduras:** de madeira e cipó, em 9-slice SVG.
- **Ícones:** os 17 tipos têm ícone SVG próprio (folha, chama, gota, raio, floco, berimbau, frasco, torrão, pena, olho, besouro, cristal, véu, escama, engrenagem, estrela, círculo).
- **Telas:**
  - **Nome e apelido:** teclado em grade autoral (maiúsculas, minúsculas, acentos, apagar, fim) navegável por direcional e por toque.
  - **Abertura:** splash, abertura cinemática, título com o logo **ADVENTURES OF PINGO** em camadas CSS 3D ("Adventures of" menor em cima, "PINGO" grande em madeira entalhada dourada).
  - **Saves:** 3 slots.
  - **Batalha (layout clássico):** inimigo no alto à direita com a caixa (nome, sexo, nível, barra de vida) à esquerda; criatura do jogador de costas embaixo à esquerda com a caixa à direita (nome, nível, vida em números e barra, barra de experiência); caixa de texto embaixo; menu de 4 opções (LUTAR, EQUIPE, MOCHILA, FUGIR) e lista dos 4 golpes com tipo e PG.
  - **Navegação e gestão:** mapa-mundi duplo (A + B lado a lado com o trem e o Saveiro animados), menu, Equipe (arrastar para reordenar), Resumo da criatura (status, golpes, Diário, amizade), Mochila, Viveiro de Cuias (16 caixas de 30), Diário, Rádio Cipó, Insígnias (estojo 3D com as 16 em CSS 3D), Opções, Créditos.
- **Caixa de texto:**
  - **Retrato e voz:** retrato 3D do personagem que fala, com expressão, e voz balbuciada por personagem.
  - **Ritmo:** texto letra a letra com velocidade ajustável.
- **HUD de mapa:** discreto, com nome da zona ao entrar (placa entalhada), relógio e clima no canto, e ícone do Amuleto quando há um obstáculo à frente.

---

## 12. Efeitos visuais (pré-renderizados ou SVG autorais)
- **FX por tipo** (mínimo 3 cada; total ≥ 60): folhas cortantes, sementes, raízes; chamas, brasas, labaredas; jatos, ondas, bolhas; raios, faíscas, esfera elétrica; cristais de gelo, nevasca; impactos de golpe, chutes de ginga; nuvem tóxica, gotas; terremoto, lama; rajadas, penas; ondas mentais; enxame; pedras; véus; escamas brilhantes; metal; estrelas e pétalas.
- **Captura e evolução:** cuia tampando e balançando, faísca de sucesso; evolução com silhueta, brilho e explosão de luz.
- **Mapa:** grama balançando quando passam criaturas, ondulação da água, cascatas animadas, partículas de folhas, vaga-lumes à noite, chuva, névoa, neve, poeira, pegadas na areia e marcas na lama.
- **Impacto:**
  - **Tremor** de tela em golpes fortes, **hit-stop** de 60 ms no crítico e **flash branco** no sprite atingido.
  - **Números de dano** opcionais nas opções.

---

## 13. Áudio
- **Músicas (≥ 30), compostas nota por nota**, com loop sem emenda:
  - **Cenário:** tema-título, Vila Jacarandá, cidades de cada mapa (8 variações regionais: forró, frevo, samba de roda, baião, maracatu, choro, catira, música gaúcha), rotas dia e noite, cavernas, água, mergulho.
  - **Batalhas:** selvagem, treinador, rival, líder, Cartel, Conselho, lendários, vitória (3 variações).
  - **Eventos:** evolução, captura, Posto Guardião, trem, Saveiro, créditos.
- **SFX (≥ 120):**
  - menu, passos por piso, golpes por tipo, captura, evolução;
  - Amuletos: facão, remo, empurrar, quebrar, escalar, cachoeira, mergulho, voo;
  - portas, rádio, clima.
- **Vozes:** **180 gritos de criatura** sintetizados com parâmetros autorais por espécie; vozes balbuciadas para cerca de 20 personagens.

---

## 14. Controles
| Ação | Teclado | Gamepad |
|---|---|---|
| Mover | setas / WASD | direcional |
| Confirmar / interagir | Z / Enter | A |
| Voltar / correr (segurar) | X / Shift | B |
| Menu | Esc / C | Start |
| Bicicleta / atalho de item | V | Y |
| Câmera de foto | F | Select |

**Toque (celular):** direcional virtual de 8 direções (arrastar o polegar), botões **A** e **B** grandes, **Menu** e **Select** pequenos, todos desenhados em SVG autoral com o estilo de madeira entalhada.
- Em pé: tela do jogo em cima, controles embaixo. Deitado: direcional à esquerda, A/B à direita, sobre a imagem com transparência.
- Tocar diretamente em opções de menu, golpes e itens também funciona; segurar B corre.
- Tamanho mínimo dos alvos de toque: 48 px; respeitar `safe-area-inset-*` do iPhone (entalhe e barra inicial).
- **Vibração** (Capacitor Haptics) em golpes críticos, captura e insígnias; desligável.
- Controles de gamepad Bluetooth também funcionam no iOS.

---

## 15. Arquitetura de batalha e mundo (resumo técnico)
- **Mundo:** grade de tiles de 48 px, movimento tile a tile com interpolação suave e corrida, colisão por camada, profundidade por linha (`z-index = y`), câmera que segue com limites da zona e chunks pré-compostos no bake (camadas `chao`, `objetos` e `alto`).
- **Batalha:** máquina de estados determinística (`src/battle/engine.ts`), separada da apresentação (`src/battle/view.ts`).
  - O motor gera uma **fila de eventos** (dano, status, mensagem, animação) que a view reproduz.
  - Isso permite **testes automatizados** de batalha em Node, sem DOM.
- **Save:** `localStorage` com try/catch e fallback em memória; 3 slots; inclui semente do RNG, relógio, flags de eventos, Viveiro e Diário.

---

## 15A. Versões PC e celular (iOS), 100% offline

### 15A.1 Um só código, três empacotamentos
| Alvo | Como | Offline |
|---|---|---|
| **Navegador / PWA** (PC e iPhone) | `vite build` + `manifest.webmanifest` + Service Worker gerado no build | o Service Worker pré-cacheia **todos** os arquivos do jogo na primeira abertura; depois funciona sem internet. No iPhone: Safari → Compartilhar → "Adicionar à Tela de Início" |
| **iOS nativo** | **Capacitor** (`plataformas/ios`), projeto Xcode gerado por `npx cap sync ios` | todos os assets vão **dentro do app**; nada é baixado. Distribuição via TestFlight ou App Store (exige um Mac com Xcode e conta de desenvolvedor Apple — documentar no README) |
| **Desktop** (Windows, macOS, Linux) | **Electron** + electron-builder (`plataformas/desktop`) | assets locais dentro do instalador |

- `src/core/plataforma.ts` detecta o alvo (`web`, `pwa`, `ios`, `desktop`) e fornece: armazenamento, vibração, tela cheia, saída do jogo e caminho dos assets.
- **Nada no jogo depende de rede.** Proibido CDN, fontes remotas ou chamadas a APIs. O relógio do jogo usa o relógio do aparelho.

### 15A.2 Save e transferência entre PC e celular
- **Adaptadores de save:** `localStorage`/IndexedDB no navegador e PWA; **Capacitor Preferences + Filesystem** no iOS (sobrevive à limpeza de dados do Safari); arquivo JSON na pasta do usuário no desktop. Gravação automática ao entrar num Posto Guardião e ao trocar de zona, além do "Salvar" manual.
- **Exportar/Importar save:** gera um arquivo `.pingo` (JSON compactado e com checksum) para levar o jogo do PC para o celular e vice-versa (Compartilhar do iOS, arquivos no desktop). Também gera um **código de transferência em SVG** (QR desenhado como SVG, sem canvas) para leitura pela câmera de outro aparelho.

### 15A.3 Desempenho e tamanho no celular
- **Dois níveis de assets** gerados no build: `hd/` (PC, sprites de batalha 384 px) e `movel/` (sprites de batalha 256 px, chunks de mapa em WebP mais compactos). O app iOS empacota só `movel/`; o PWA escolhe pelo aparelho.
- **Orçamento:** pacote iOS ≤ 300 MB; abertura até o título em ≤ 4 s num iPhone de 3 anos; **60 fps** no mapa e na batalha.
- **Carregamento por demanda:** cada zona carrega só os seus chunks e as criaturas das suas tabelas; a batalha pré-carrega os sprites das duas criaturas e os FX dos golpes conhecidos.
- **Regras de CSS para iOS:** só animar `transform` e `opacity`; evitar `backdrop-filter` e `filter: blur` grandes no modo celular (a configuração "Qualidade: celular" troca por imagens pré-desfocadas); `touch-action: none` na área de jogo; impedir zoom por toque duplo e o "rebote" de rolagem.
- **Áudio no iOS:** destravar o `AudioContext` no primeiro toque; respeitar o botão de silencioso (opção "tocar mesmo no silencioso"); pausar ao ir para segundo plano e retomar ao voltar (`visibilitychange` e eventos do Capacitor App).
- **Ciclo de vida:** ao ir para segundo plano, o jogo **pausa e salva** um ponto de retomada; ao voltar, continua exatamente de onde estava.

---

## 16. Ordem de execução e critérios de aceite

### 16.1 Ordem obrigatória
1. Estrutura, tokens, loop, RNG, save, input.
2. Pipeline de pré-renderização (adaptar o de referência) e kits de anatomia de criatura.
3. **Todas as 180 criaturas** (batalha frente e costas, mais o sprite de mapa em 4 direções), pessoas, objetos e FX.
4. Tilesets 3/4, prédios, interiores, arenas e mapas-mundi.
5. Motor de mundo: zonas, warps, NPCs, eventos, encontros na grama/água/pesca/árvores/rochas, lendários errantes, Amuletos.
6. Motor de batalha, mais os dados de tipos, golpes, criaturas, itens e IA.
7. **Todas as zonas dos 2 mapas** (seção 4), com habitats, treinadores, eventos e bake.
8. 16 ginásios com quebra-cabeças, Conselho, eventos do Cartel, lendários, pós-jogo.
9. UI completa, Diário, Viveiro, Rádio Cipó, relógio, clima, ninhos, fotos.
10. Áudio completo.
11. **Plataformas:** controles de toque, layouts em pé e deitado, adaptadores de save, exportar/importar, Service Worker, Capacitor iOS e Electron.
12. Polimento (FX, transições, balanceamento) e verificação.

**Trabalho em paralelo (recomendado):** divida em agentes com contratos escritos antes, em `docs/`:
- criaturas 1–60, 61–120 e 121–180;
- pessoas;
- cenários e arenas;
- motor de batalha;
- motor de mundo;
- zonas do mapa A e do mapa B;
- ginásios e eventos;
- UI;
- áudio;
- plataformas (toque, PWA, iOS, desktop);
- QA.

Cada agente escreve só nos próprios arquivos. Os renders são paralelos e seguros: metadados por modelo e por variante, depois mesclados.

### 16.2 `npm run check` (tools/verify.ts) precisa passar com 0 erros
- [ ] Nenhum `<canvas`, `getContext`, `webgl`, `three`, `pixi`, `phaser` em `src/` e `index.html`.
- [ ] Nenhum `TODO`/`FIXME` (maiúsculos), `placeholder` ou `lorem`.
- [ ] **180 criaturas** em `criaturas.ts`, com nome único, tipo(s), estatísticas na faixa da seção 6.2, ≥ 8 golpes por nível, texto do Diário e, nos modelos, ≥ 25/40/60 malhas conforme o estágio.
- [ ] Cada criatura com sprites de **batalha** (frente: 7 animações; costas: 5) e de **mapa** (4 direções); arquivos > 2 KB.
- [ ] **Toda criatura capturável:** aparece em ≥ 1 habitat, evento ou ninho, numa zona alcançável.
- [ ] **Simulação de progressão:** busca em grafo sobre as zonas dos 2 mapas, aplicando os obstáculos e o conjunto de Amuletos e flags depois de cada insígnia. Ela comprova:
  - cada ginásio N fica **alcançável depois do N−1** e **inalcançável antes**, sem quebra de sequência;
  - todas as zonas são alcançáveis no pós-jogo;
  - os Amuletos funcionam com pelo menos uma espécie capturável **antes** do obstáculo onde é exigido;
  - a curva de nível das zonas é coerente: a média do nível selvagem fica ≤ nível do próximo líder − 2.
- [ ] **16 insígnias** com SVG, líder, equipe, ginásio com quebra-cabeça e recompensa; Conselho com 5 integrantes.
- [ ] ≥ 220 golpes, cada um com animação válida; ≥ 150 treinadores; ≥ 30 eventos de história; ≥ 20 missões paralelas.
- [ ] Tabela de tipos completa (17×17).
- [ ] **Testes de batalha em Node:**
  - 50 batalhas simuladas entre equipes de exemplo terminam sem exceção;
  - a captura respeita a fórmula;
  - as evoluções disparam nos níveis certos.
- [ ] ≥ 30 músicas, ≥ 120 SFX e 180 gritos.
- [ ] `tsc --noEmit` limpo; `vite build` sem avisos.
- [ ] **Teste visual com Playwright**, com screenshots de: título, escolha do inicial, tela de nome, PC do quarto com decoração, rota com grama alta, transição de encontro, batalha selvagem, captura, ginásio, uso de 3 Amuletos, viagem de trem, Saveiro, mapa-mundi duplo, Diário, Viveiro, evolução e Conselho. **Analise cada screenshot**; se algo estiver quebrado, provisório ou genérico, corrija e repita.
- [ ] FPS médio ≥ 55 no mapa e na batalha (máquina com GPU).
- [ ] **Offline:** teste Playwright abre o PWA, espera o Service Worker instalar, corta a rede (`context.setOffline(true)`), recarrega e joga do título até uma batalha sem nenhuma requisição falhando.
- [ ] **Celular:** screenshots com emulação de iPhone (Playwright `devices['iPhone 13']`), em pé e deitado: mapa, batalha, menu, teclado de nome; os controles de toque funcionam (toques simulados movem o jogador e escolhem golpes); nada fica atrás do entalhe.
- [ ] **Save:** exportar no "PC" e importar no "iPhone" (dois contextos de navegador) restaura o mesmo jogo.
- [ ] `npx cap sync ios` e `electron-builder --dir` rodam sem erro; tamanho do pacote `movel/` dentro do orçamento.

### 16.3 Definição de "pronto"
No PC e no iPhone, **sem internet**, o jogador consegue fazer tudo isto sem nenhum asset genérico, forma provisória ou tela vazia:
1. Começar, escolher o inicial e explorar os 2 mapas indo e voltando de trem e de Saveiro.
2. Capturar as 180 criaturas.
3. Conquistar as 16 insígnias na ordem montada.
4. Derrotar o Cartel e o Conselho dos Guardiões.
5. Ver os créditos e jogar o pós-jogo.

O progresso fica salvo.

---

## 17. Instruções finais para a IA
1. **Não pergunte, não resuma, não pare no meio.** Execute a seção 16.1 até o fim.
2. **Cuidados técnicos que evitam travamentos conhecidos:**
   - **`__name` no navegador:** o `tsx` injeta `__name` em funções passadas a `page.evaluate` do Playwright. Defina `window.__name = f => f` no init da página de render.
   - **Metadados de render:** grave por modelo e por variante, para renders paralelos não se sobrescreverem.
   - **Pré-carga e ordem de destruição:** pré-carregue sprites antes de trocar de cena e zere referências do mundo antigo antes de qualquer `await`.
   - **Teclas e toques rápidos:** guarde em buffer os toques entre passos do loop, para não se perderem em quadros lentos.
   - **Loop resiliente:** agende o próximo quadro em `finally`, para uma exceção não congelar o jogo.
3. **Validação dos modelos:** antes de renderizar em massa, renderize 1 quadro de cada modelo e **olhe a imagem**. Se parecer um bloco de primitivas, refine a escultura.
4. **Entrega final:** comandos para rodar no PC (`npm install && npm run dev`), gerar o PWA (`npm run build`), o app desktop (`npm run desktop`) e o projeto iOS (`npm run ios`, depois abrir no Xcode); lista do que foi criado; screenshots de PC e iPhone; resultado do `npm run check`.
