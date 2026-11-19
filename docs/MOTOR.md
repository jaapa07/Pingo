# MOTOR.md — arquitetura do runtime (contrato)

Stack: Vite + TypeScript strict, **DOM/CSS puro**. Proibido no runtime: `<canvas>`, WebGL, engines. Proibido `Math.random` (use `rng` de `src/core/rng.ts`; `cosmetico()` para partículas). Proibidas as palavras TODO/FIXME (maiúsculas), placeholder e lorem em `src/`, `tools/`, `assets-src/` (inclusive comentários). Nada depende de rede.

## Tela
- Palco nativo **320×180** (`#tela`), ampliado por **escala inteira** via CSS `transform: scale(N)` (N = maior inteiro que cabe), `image-rendering: pixelated`. Todo elemento é posicionado em **px nativos inteiros**. Fonte bitmap autoral (8×8 e 8×12) — texto é desenhado com `src/ui/fonte.ts` (`texto(str, opts) → HTMLElement`), nunca com fontes do sistema.
- Camadas dentro de `#tela`: `.mundo` (chunks + sprites), `.batalha`, `.ui` (caixas, menus), `.toque` (controles de celular, fora da área 320×180 no modo retrato), `.cortina` (transições).
- Sprites: `src/render/sprite.ts` (`new Sprite(modeloId, vista, pai)`, `.tocar(anim)`, `.tocarAte(anim)`, `.atualizar(dt)`, `.desenhar()`, `.x/.y/.z/.dx/.dy/.espelho/.visivel/.opacidade`). Atlas: `src/core/assets.ts`.

## Núcleo (já existe)
`core/tipos.ts` (contrato de dados), `core/loop.ts` (60 Hz fixo; `setLoopTarget`, `startLoop`, `hitStop`), `core/events.ts` (`bus.on/emit`), `core/rng.ts`, `core/estado.ts` (`jogo.save`, `jogo.opcoes`, flags, itens, `receberCriatura`, relógio/`periodo()`, `cond()`), `core/assets.ts`, `ui/telas.ts` (`telas.empilhar/desempilhar/trocar/cortina`, `registrarTela(id, fab)`, `criarTela(id, args)`).

## Donos dos módulos
| Módulo | Dono | Conteúdo |
|---|---|---|
| `src/core/input.ts`, `src/core/save.ts`, `src/core/plataforma.ts`, `src/main.ts`, `index.html`, `src/styles/*`, `src/ui/**` (menos batalha) | **UI/plataforma** | entrada (teclado, gamepad, toque), saves (3 slots, adaptadores), telas e menus |
| `src/world/**`, `src/data/eventos/_motor*.ts` | **Mundo** | zonas, movimento, NPCs, eventos, encontros, Amuletos, relógio/clima no mapa |
| `src/battle/**`, `src/data/golpes.ts`, `tabela-tipos.ts`, `itens.ts`, `personalidades.ts` | **Batalha** | motor, IA, view, animações de golpe, captura, evolução |
| `src/data/criaturas.ts` | **Dados de criaturas** | 180 espécies |
| `src/data/zonas/**`, `src/data/treinadores/**`, `src/data/eventos/**` | **Level design** | zonas, treinadores, scripts |
| `src/audio/**`, `src/data/music/**`, `src/data/sfx.ts`, `src/data/gritos.ts` | **Áudio** | |
| `tools/models/**`, `tools/scenery/**`, `tools/bake-maps.ts`, `src/data/tilesets/**`, `src/data/catalogo-objetos.ts` | **Arte** | |

## Entrada (`src/core/input.ts`)
Ações: `cima baixo esq dir a b menu select`. API: `input.apertou(a)`, `input.segurando(a)`, `input.soltou(a)`, `input.eixo()` → Dir | null (última direção apertada tem prioridade), `pollInput(dt)` chamado 1× por passo, buffer de toques entre passos. Teclado: setas/WASD, Z/Enter = a, X/Shift = b, Esc/C = menu, V = select. Gamepad API. Toque: direcional virtual + botões (mesmas ações) e toque direto em itens de menu (cada item clicável chama o mesmo handler do `a`).

## Diálogo e UI compartilhada (`src/ui/dialogo.ts`, dono: UI)
```ts
falar(texto: string, quem?: { nome?: string; retrato?: string; expressao?: 'neutro'|'feliz'|'bravo'; voz?: string }): Promise<void>; // caixa de texto letra a letra; `\n` quebra, `\f` nova caixa; {JOGADOR} e {RIVAL} são substituídos
escolher(pergunta: string, opcoes: string[], padrao?: number): Promise<number>; // −1 = cancelou com B
simNao(pergunta: string): Promise<boolean>;
pedirNome(titulo: string, max: number, padrao?: string): Promise<string>; // teclado em grade
avisar(texto: string): void; // faixa curta (nome da zona, item obtido)
abrirTela(id: string, args?: unknown): Promise<unknown>; // empilha a tela e resolve quando ela fecha
```
Telas registradas (ids): `splash`, `intro`, `titulo`, `saves`, `nome`, `relogio`, `mundo` (dono: Mundo), `batalha`, `evolucao` (dono: Batalha), `menu`, `equipe`, `resumo`, `mochila`, `diario`, `viveiro`, `pc-quarto`, `radio`, `insignias`, `mapa-mundi`, `perfil`, `opcoes`, `loja`, `creditos`, `foto`.

## Mundo (`src/world/index.ts`, dono: Mundo)
```ts
irPara(zona: string, x: number, y: number, dir?: Dir, transicao?: string): Promise<void>;
mundo: { zona: ZonaDef; jogador: { x, y, dir, modo }; npc(id): NpcVivo | undefined; pausar(b: boolean): void; recarregar(): void };
rodarEvento(id: string): Promise<void>; rodarPassos(passos: Comando[]): Promise<void>;
registrarComando(nome: string, fn: (args: unknown[]) => Promise<void> | void): void; // extensões (ginásios)
registrarMecanica(zonaId: string, m: { entrar?(): void; passo?(x, y): boolean | void; interagir?(x, y): boolean | void; sair?(): void }): void; // quebra-cabeças de ginásio
```
- Render: chunks do bake (`chao`, `anim`, `alto`) + sprites ordenados por `y`. Câmera centrada no jogador, presa aos limites, em px inteiros. Grama alta: sprite de passagem sobre os pés. Período: crossfade de 1 s entre conjuntos de chunks. Clima: camadas de sprites. Escuro/névoa: máscara em tiles de sombra (pixel art, sem blur).
- Movimento: andar 16 px em 16 quadros (correr com B: 8 quadros; bike: 5), colisão pela legenda de `docs/ZONAS.md` + catálogo de objetos + NPCs; saliências; gelo; correnteza; Amuletos (pergunta "Usar o Facão?" e animação da criatura da equipe do tipo certo — spec 4.4).
- Encontros (spec 6.3): por passo em `"`/`%`/água; pesca; árvore; rocha; repelente; lendários errantes.
- Treinadores: linha de visão, "!" e aproximação; derrotados ficam marcados por flag.
- Derrota em batalha: volta ao `ultimoPosto` com a equipe curada e metade do dinheiro.

## Eventos (scripts declarativos em `src/data/eventos/*.ts`, exportando `EventoDef[]`)
Comandos (tuplas): `['falar', quem|null, texto]` · `['escolha', pergunta, opcoes[], flagDoResultado]` · `['simnao', pergunta, flag]` · `['mover', 'jogador'|npcId, Dir[]]` · `['virar', quem, Dir]` · `['esperar', ms]` · `['emote', quem, '!'|'?'|'coracao'|'zzz'|'raiva'|'nota']` · `['dar', item, qtd?]` · `['tirar', item, qtd?]` · `['dinheiro', n]` · `['darCriatura', especie, nivel, { apelidar?: boolean }]` · `['darOvo', especie]` · `['batalha', treinadorId]` · `['selvagem', especie, nivel, { lendario?, semFuga?, semCaptura? }]` · `['flag', nome, valor?]` · `['insignia', n]` · `['amuleto', id]` · `['se', cond, passos[], senao?[]]` · `['musica', id]` · `['sfx', id]` · `['tela', id, args?]` · `['fade', 'fora'|'dentro']` · `['warp', zona, x, y, dir?]` · `['camera', x, y, ms]` · `['camera', 'jogador']` · `['tremor', ms]` · `['curar']` · `['loja', itens[]]` · `['mostrar'|'esconder', npcId]` · `['cinematica', id]` · `['salvar']` · `['chamar', eventoId]` · `['pedirNome', 'jogador'|'rival']`.
`quem` em `falar`: id de NPC da zona, `'jogador'`, ou objeto `{ nome, retrato }`.

## Save e plataforma (dono: UI/plataforma)
`save.ts`: `listarSlots()`, `carregarSlot(i)`, `gravarSlot(i)`, `apagarSlot(i)`, `exportar(): string` (arquivo `.pingo` com checksum), `importar(str)`, autosave ao trocar de zona/entrar em Posto. Adaptadores por plataforma (`plataforma.ts`: `web`/`pwa` = localStorage+IndexedDB, `ios` = Capacitor Preferences/Filesystem, `desktop` = arquivo via preload do Electron). Spec seção 15A.

## Áudio
`import { audio } from 'src/audio'`: `audio.unlock()`, `playMusic(id)`, `stopMusic()`, `playSfx(id)`, `babble(voz, texto)`, `grito(especie: number)`, `setVolumes()`. Também via `bus.emit('sfx', { id })`, `bus.emit('musica', id)`.
SFX mínimos usados pelos motores: `ui-mover ui-ok ui-voltar ui-erro texto passo-grama passo-terra passo-madeira passo-agua porta escada pulo-saliencia batida encontro cuia-arremesso cuia-balanco cuia-sucesso cuia-falha golpe-fraco golpe-normal golpe-forte critico desmaio subir-nivel evolucao cura-posto item-obtido insignia salvar facao remo empurrar quebrar escalar cachoeira mergulho voo trem saveiro radio chuva trovao` + um por tipo de golpe (`g-<tipo>`).

## Testes
`npx vite --port <sua porta>` e Playwright (`createRequire` em `/opt/node-tools/node_modules/playwright`), viewport 1280×720 e emulação de iPhone. `window.__pingo` expõe `{ jogo, telas, mundo, bus }` para inspeção. `?zona=A1&x=10&y=8` abre direto numa zona (com save de teste); `?batalha=10,5` inicia batalha selvagem contra a espécie 10 nível 5.
