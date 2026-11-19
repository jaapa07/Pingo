# AUDIO.md — catálogo de áudio (dono: Áudio)

Tudo é sintetizado em tempo real (Web Audio); não há arquivos de som. Timbre: ondas de portátil clássico (pulso 50/25/12,5 %, triângulo, ruído) somadas a instrumentos brasileiros sintetizados (sanfona, viola caipira, cavaquinho, violão, flauta/pífano, berimbau, zabumba, triângulo, pandeiro, alfaia, gonguê, atabaque, reco-reco, palmas e sapateado).

## API (`import { audio } from 'src/audio'`)
| Chamada | O que faz |
|---|---|
| `audio.unlock()` | libera o áudio; já é chamado sozinho no primeiro toque/tecla/clique. Lê `jogo.opcoes.musica/sfx` se ninguém chamou `setVolumes` |
| `audio.playMusic(id, { fade? })` / `stopMusic(fade?)` / `currentMusic()` | música em laço com crossfade; pedir a faixa que já toca não reinicia. Antes do primeiro gesto o pedido fica guardado |
| `audio.jingle(id)` → ms | toca uma faixa curta por cima (a música abaixa e volta); devolve a duração. Use com `captura` |
| `audio.playSfx(id, { vol?, pitch?, pan? })` | efeito |
| `audio.grito(especie, { vol?, pitch?, pan? })` → ms | grito da espécie (nº do Diário, 1–180); devolve a duração. Para desmaio use `pitch: 0.8` |
| `audio.babble(voz, texto)` | fala balbuciada (chame uma vez por caixa de texto) |
| `audio.playAmbience(id \| null)` | leito de ambiente em laço |
| `audio.setVolumes({ musica?, sfx?, ambiente? })` | 0–1 |
| `audio.setReverb(preset)` | `mata` (padrão) · `gruta` · `recife` · `fabrica` · `cristal` · `copa` · `seco` |
| `audio.setUnderwater(bool)` | filtro abafado para mergulho |
| `audio.duckMusic(ms)`, `audio.setMusicTempo(mult)`, `onBeat(cb)` | utilidades |
| `audio.suspender()` / `audio.retomar()` | pausa/retoma tudo; já ligado a `visibilitychange`, `pagehide` e `pageshow` |

### Pelo barramento (`bus.emit`)
`'sfx' { id, vol?, pitch?, pan?, x? }` (x = 0–320 vira panorama) · `'musica' id | { id, fade? } | null` (null para parar; `'music'` também vale) · `'jingle' id` · `'babble' { voz, texto }` · `'grito' numero | { especie, vol?, pitch?, pan? }` · `'ambiente' id | null` · `'volumes' { musica?, sfx?, ambiente? }`.

## Músicas (39)
| id | título | compassos | compasso · andamento | modo |
|---|---|---|---|---|
| `tema-titulo` | Adventures of Pingo | 32 (intro 4) | 4/4 · 116 bpm | laço |
| `vila-jacaranda` | Vila Jacarandá | 32 | 4/4 · 96 bpm | laço |
| `cidade-forro` | Arraial em Festa (forró) | 32 | 4/4 · 128 bpm | laço |
| `cidade-frevo` | Ladeiras do Porto (frevo) | 32 | 4/4 · 144 bpm | laço |
| `cidade-samba` | Roda na Praça (samba de roda) | 32 | 4/4 · 100 bpm | laço |
| `cidade-baiao` | Feira da Chapada (baião) | 32 | 4/4 · 108 bpm | laço |
| `cidade-maracatu` | Cortejo de Coral (maracatu) | 32 | 4/4 · 100 bpm | laço |
| `cidade-choro` | Sobrados da Serra (choro) | 32 | 4/4 · 92 bpm | laço |
| `cidade-catira` | Varanda do Buriti (catira) | 32 | 4/4 · 112 bpm | laço |
| `cidade-gaucha` | Galpão da Geada (rancheira gaúcha) | 40 | 3/4 · 138 bpm | laço |
| `rota-dia-A` | Trilhas da Costa do Sol | 32 | 4/4 · 132 bpm | laço |
| `rota-noite-A` | Costa do Sol ao Luar | 32 | 4/4 · 96 bpm | laço |
| `rota-dia-B` | Veredas do Sertão | 32 | 4/4 · 124 bpm | laço |
| `rota-noite-B` | Sertão das Névoas à Noite | 32 | 4/4 · 84 bpm | laço |
| `caverna` | Grutas e Túneis | 32 | 4/4 · 76 bpm | laço |
| `agua` | Remando na Baía | 32 | 4/4 · 100 bpm | laço |
| `mergulho` | Recife Submerso | 32 | 4/4 · 72 bpm | laço |
| `pico` | Pico Pindorama | 32 | 4/4 · 80 bpm | laço |
| `posto` | Posto Guardião | 16 | 4/4 · 96 bpm | laço |
| `venda` | A Venda (xote) | 16 | 4/4 · 104 bpm | laço |
| `laboratorio` | Laboratório da Profª Ipê | 16 | 4/4 · 112 bpm | laço |
| `ginasio` | Salão do Ginásio | 16 | 4/4 · 120 bpm | laço |
| `batalha-selvagem` | Encontro na Grama Alta | 28 (intro 4) | 4/4 · 168 bpm | laço |
| `batalha-treinador` | Desafio de Treinador | 28 (intro 4) | 4/4 · 160 bpm | laço |
| `batalha-rival` | Tainá Quer Revanche | 28 (intro 4) | 4/4 · 172 bpm | laço |
| `batalha-lider` | Pela Insígnia! | 36 (intro 4) | 4/4 · 152 bpm | laço |
| `batalha-cartel` | Cartel Ferrugem Ataca | 26 (intro 2) | 4/4 · 148 bpm | laço |
| `batalha-conselho` | Conselho dos Guardiões | 36 (intro 4) | 4/4 · 164 bpm | laço |
| `batalha-lendario` | Diante da Lenda | 36 (intro 4) | 4/4 · 138 bpm | laço |
| `vitoria-selvagem` | Vitória na Trilha | 10 (intro 2) | 4/4 · 140 bpm | laço |
| `vitoria-treinador` | Vitória de Treinador | 10 (intro 2) | 4/4 · 132 bpm | laço |
| `vitoria-lider` | Insígnia Conquistada | 12 (intro 4) | 4/4 · 126 bpm | laço |
| `derrota` | De Volta ao Posto | 6 | 4/4 · 72 bpm | toca uma vez |
| `evolucao` | Metamorfose | 16 | 4/4 · 120 bpm | laço |
| `captura` | Cuia Fechada! | 3 | 4/4 · 140 bpm | toca uma vez |
| `trem` | Trem da Serra | 24 | 4/4 · 132 bpm | laço |
| `saveiro` | Travessia de Saveiro | 24 | 3/4 · 96 bpm | laço |
| `cartel-tema` | Sombras do Cartel Ferrugem | 16 | 4/4 · 100 bpm | laço |
| `creditos` | Até a Próxima Trilha | 48 | 4/4 · 104 bpm | laço |

Apelidos aceitos: `game-over` → `derrota` · `titulo` → `tema-titulo` · `vila` → `vila-jacaranda` · `casa` → `vila-jacaranda` · `submerso` → `mergulho` · `cartel` → `cartel-tema` · `rota-1` → `rota-dia-A` · `rota` → `rota-dia-A` · `conselho` → `batalha-conselho` · `vitoria` → `vitoria-selvagem`.

Faixas de batalha e vitória têm introdução que toca uma vez; o laço volta para depois dela.

### Tema sugerido por cidade (`MUSICA_DA_CIDADE` em `src/data/music/index.ts`)
A1 `vila-jacaranda` · A2 `cidade-samba` · A3 `cidade-choro` · A4 `cidade-frevo` · A5 `cidade-maracatu` · A6 `cidade-samba` · A7 `cidade-choro` · A8 `cidade-baiao` · A9 `cidade-catira` · B1 `cidade-catira` · B2 `cidade-baiao` · B3 `cidade-baiao` · B4 `cidade-forro` · B5 `cidade-samba` · B6 `cidade-maracatu` · B7 `cidade-gaucha` · B8 `cidade-choro` · B9 `cidade-frevo`

Sugestões de uso: rotas e florestas do mapa A `rota-dia-A`/`rota-noite-A`; do mapa B `rota-dia-B`/`rota-noite-B`; cavernas, Usina e mina `caverna`; Baía Azul, Pantanal e Lagoa `agua`; Recife e Túnel Alagado `mergulho`; Pico Pindorama e Floresta Ancestral `pico`; cenas do Cartel `cartel-tema`; casas `vila-jacaranda` ou a música da cidade.

## SFX (184)
**interface (18):** `ui-mover` `ui-ok` `ui-voltar` `ui-erro` `ui-abrir` `ui-fechar` `ui-aba` `ui-confirmar` `ui-negar` `ui-pausa` `ui-digitar` `ui-apagar` `ui-limite` `ui-pagina` `ui-alternar` `texto` `texto-fim` `salvar`

**passos (12):** `passo-grama` `passo-grama-alta` `passo-terra` `passo-madeira` `passo-agua` `passo-areia` `passo-pedra` `passo-neve` `passo-lama` `passo-ponte` `passo-metal` `passo-gelo`

**outros (100):** `porta` `porta-fechar` `porta-correr` `escada` `pulo-saliencia` `batida` `bau` `placa` `sacudir-arvore` `fruta-cair` `pesca-lancar` `pesca-fisgada` `pesca-puxar` `bike-sino` `pc-ligar` `pc-desligar` `telefone` `relogio` `exclamacao` `interrogacao` `emote-coracao` `emote-raiva` `emote-zzz` `emote-nota` `dinheiro` `compra` `item-obtido` `item-raro` `amuleto-obtido` `insignia` `diario-registro` `foto` `conquista` `repelente` `repelente-fim` `lampiao` `faro` `tremor` `queda` `gelo-deslize` `correnteza` `warp` `ovo-rachar` `ovo-nascer` `curar-tom` `cura-posto` `sino-igreja` `galo` `fogueira` `vento` `onda-praia` `chuva` `trovao` `radio` `radio-chiado` `facao` `remo` `empurrar` `quebrar` `escalar` `cachoeira` `mergulho` `emergir` `voo` `trem` `trem-apito` `saveiro` `saveiro-sino` `vela` `encontro` `encontro-treinador` `lendario-aparece` `entrada-criatura` `retorno-criatura` `troca` `fuga` `fuga-falha` `xp-barra` `vida-baixa` `subir-nivel` `aprender-golpe` `esquecer-golpe` `pergaminho` `evolucao` `evolucao-cancelada` `desmaio` `item-usar` `golpe-fraco` `golpe-normal` `golpe-forte` `critico` `super-eficaz` `pouco-eficaz` `sem-efeito` `errou` `cura` `cura-total` `protecao` `drenar` `carga`

**captura (7):** `cuia-arremesso` `cuia-abrir` `cuia-quique` `cuia-balanco` `cuia-sucesso` `cuia-falha` `cuia-estrelas`

**status, atributos e clima (13):** `atrib-sobe` `atrib-desce` `status-veneno` `status-queimadura` `status-paralisia` `status-sono` `status-congelado` `status-confusao` `status-curado` `clima-sol` `clima-chuva` `clima-geada` `clima-areia`

**golpes (`g-`) (34):** `g-corte` `g-arranhao` `g-mordida` `g-pancada` `g-chicote` `g-canto` `g-rugido` `g-explosao` `g-pisao` `g-investida` `g-bicada` `g-raio` `g-sopro` `g-pedrada` `g-po` `g-teia` `g-giro` `g-comum` `g-mata` `g-brasa` `g-rio` `g-trovao` `g-geada` `g-ginga` `g-veneno` `g-terra` `g-vento` `g-mente` `g-inseto` `g-pedra` `g-assombro` `g-lenda` `g-ferro` `g-encanto`

Sons pontuais de ambiente (também tocam por `playSfx`): `amb-passaro` `amb-sabia` `amb-bem-te-vi` `amb-grilo` `amb-cigarra` `amb-sapo` `amb-coruja` `amb-gota` `amb-onda` `amb-gaivota` `amb-rajada` `amb-trovao-longe` `amb-bolhas` `amb-faisca` `amb-bugio` `amb-pingo-lata`

## Ambientes em laço (12)
`mata-dia` `mata-noite` `cerrado` `praia` `pantanal` `caverna` `serra` `chuva` `submerso` `usina` `cidade` `floresta-ancestral`

## Vozes balbuciadas (25)
`jogador` `jogador-kaue` `jogador-ayra` `mae` `prof-ipe` `dra-buriti` `seu-aroeira` `taina` `coronel-garrote` `tenente-lata` `tenente-arame` `tenente-rebite` `capanga` `lider-m` `lider-f` `guardiao` `crianca-m` `crianca-f` `idoso` `idosa` `treinador-m` `treinador-f` `atendente` `radio` `assobio`

Apelidos: `kaue`, `ayra`, `ipe`, `buriti`, `aroeira`, `rival`, `garrote`, `lata`, `arame`, `rebite`, `cartel`, `lider`, `conselho`, `crianca`, `menino`, `menina`, `velho`, `velha`, `homem`, `mulher`, `enfermeira`, `vendedor`. Qualquer outro id recebe sempre a mesma voz genérica (escolhida por hash do nome).

## Gritos
`src/data/gritos.ts` tem 180 entradas, uma por espécie, com parâmetros escritos à mão (timbre, altura, contorno, pulsação, ruído, formante, repetições). Evoluções derivam do grito da forma anterior, mais grave, mais longo e com suboitava.

## Notação e ferramentas
- Formato das faixas: `src/data/music/types.ts` (notas `nome+oitava:passos`, 16 passos por compasso 4/4, cifra por compasso, baixo escrito ou derivado da cifra com `@grade`, bateria em grades).
- Bancada: `npx vite --port 5184` e abrir `/src/audio/teste.html` (botões para tudo e medição offline de pico/RMS).
- Níveis: `src/audio/niveis.ts` guarda os ajustes por item calculados a partir dessa medição.
- Acaso: só `mulberry32` com semente fixa (`src/audio/rng.ts`).
