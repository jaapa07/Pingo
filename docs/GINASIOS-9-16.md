# GINASIOS-9-16.md — diário dos ginásios do mapa B e da Aldeia Tupã

Diário compartilhado por dois agentes: o lote 9–12 (B2/B3/B4/B5-ginasio) e o lote 13–16 (B6/B7/B8/A9-ginasio).
Cada lote escreve só na sua seção.

## 9–12

Numeração nova (docs/HISTORIA.md): ás dos líderes 9–12 = 49, 51, 53, 55; turma do ginásio = ás − 2 a − 6; líder com IA `lider` e remédios.
Sprites, temas e arenas seguem a numeração ANTIGA das artes: Zefa = `lider-05` / tema `g05` / arena `ginasio-05`; Topázio = `lider-09` / `g09`; Labareda = `lider-10` / `g10`; Gingado = `lider-11` / `g11`.
Arquivos meus: `src/data/zonas/{B2,B3,B4,B5}-ginasio.ts`, `src/world/mecanicas/ginasio-09..12.ts`, `src/data/treinadores/ginasio-09..12.ts`, `src/data/eventos/ginasio-09..12.ts`.

### Marcos
- (20/11) Pedra renumerada para o ginásio 10: os antigos `ginasio-09.*` (Pedra, ás 43) viraram `treinadores/ginasio-10.ts`, `eventos/ginasio-10.ts`, `mecanicas/ginasio-10.ts`; `B3-ginasio` com passo 10, ids `g10-*`, `lider-10`, flag `ginasio-10-vencido`, insígnia 10, Escalar. Equipe nova do Topázio com ás 51.

## 13–16

### Marco 0 (início)
- Arquivos meus: `src/data/zonas/{B6,B7,B8,A9}-ginasio.ts`, `src/world/mecanicas/ginasio-13..16.ts`, `src/data/treinadores/ginasio-13..16.ts`, `src/data/eventos/ginasio-13..16.ts`.
- Saídas: B6 (33, 12) (porta em (33, 11) em B6.ts) · A9 (25, 12) (PORTAS-GINASIO.md) · B7 e B8 ainda sem cidade: saída provisória pela convenção; reler PORTAS-GINASIO.md antes de terminar.
- Baseline do `npm run check -- --rapido`: 1 erro alheio (líder 1, Garcinha nv 6).

### Marco 1 — ginásio 13 pronto e jogado
- `B6-ginasio` (29×19, g13): três tanques de piso tóxico; fôlego 3 (medidor sobre a cabeça), planta-antídoto devolve o fôlego e murcha (vira poça), sair do tanque faz rebrotar, desmaio devolve à boca. Soluções por busca no comentário da zona (A 4 plantas, B 7 plantas e combinação única, C 8 plantas).
- Jogado no Vite 5200 (MAPA_B_ABERTO só no plugin): entrada → 3 tanques → 6 treinadores → líder → insígnia 13 + pt-26 no save.
- Lição: treinador que avista anda até o jogador e FICA ao lado depois da luta; em corredor de 1 tile isso tranca o caminho (g13-3 virou visão 1).
- Ferramentas (scratch, podem sumir): `s/jogar.mjs` (Playwright: passos, A, falas/batalhas automáticas; troca os golpes da equipe de teste por Força do Pensamento), `s/lago.mjs`/`gera2.mjs` (tanques), `s/gelo.mjs` (pistas de gelo), `s/ger15.mjs` (portais).
- Em andamento: 14 (`B7-ginasio`, gelo do motor + blocos de gelo empurráveis com A; saída B7 (31, 11)), 15 (`B8-ginasio`, portais de constelação × 4 horas do céu; saída B8 (23, 9)).

### Marco 2 — 14 jogado, 15 e 16 escritos
- 14 (`B7-ginasio`, 33×19): jogado inteiro no Vite 5200 — 3 pistas (16 deslizes; 24 com 2 empurrões; 29 com 3 empurrões), 5 treinadores, líder → insígnia 14 + `amuleto-voo` + pt-20 no save. Lição: enfeite de objeto (`gin-bloco-gelo`) bloqueia o tile; um deles prendia o jogador entre a parede e o treinador que se aproximou (movido).
- 15 (`B8-ginasio`, 27×19): 16 portais em 7 ilhas, 4 horas do céu, 3 estrelas-guia; rótulos por hora gerados com pares e conferidos por busca (todo estado alcançável volta à entrada).
- 16 (`A9-ginasio`, 32×19): quatro alas (fogo em ondas mod 3; terra = sokoban com buracos; vento = corrente na direção do vento, penas giram; água = reflexo espelhado) + porta de taquara em (15, 4) que abre com as flags `g16-fogo/terra/vento/agua`. Piso `.` do tema g16 é igual à parede: a zona usa `;` (grama) como chão.
- Simulador: `s/sim16.mts` (mesmo molde do `sim-b.mts` do lote 9–12: `equipeReferencia(d, ini, PASSO_LIGA, ás − Δ)`, mochila 6 Garrafadas + 2 Elixires). Líder 13 antes do ajuste: esperto 89/71/70% (Δ 2/3/4).

### Marco 3 — os quatro jogados até a insígnia e medidos
- Jogado no Vite 5200 (equipe de teste nv 100, golpes trocados por Força do Pensamento só no teste): 13 (insígnia + pt-26), 14 (insígnia + `voo` + pt-20), 15 (saltos P0→P11, P10→P13, 3 giros, P13→P9, P7→P1, P0→P6, P5→P11, P10→P15 exatamente como a busca; insígnia + pt-34), 16 (as quatro provas pela solução da busca, porta de taquara abre, insígnia + pt-46). Treinadores: todos os de 13, 14 e 16 enfrentados no caminho; no 15 enfrentei g15-2 e g15-4 (os outros três são opcionais, nas ilhas). Desmaio do 13 e queimadura do 16 testados (voltam à boca/entrada com a fala).
- Saídas conferidas em PORTAS-GINASIO.md (relido): B6 (33, 12), B7 (31, 11), B8 (23, 9), A9 (25, 12).
- Simulador (`s/sim16.mts`, esperto, Δ = 2/3/4 níveis abaixo do ás, 150 lutas): 13 → 85/57/55% · 14 → 77/65/63% · 15 → 69/69/53% · 16 (IA conselho) → 75/70/59%. Bobo fica em 0–12% (mesma pendência dos líderes 1–8). Treinadores dos quatro ginásios: esperto 98–100%.
- Ajustes que o simulador pediu: 14 perdeu o Serelepão e a Friagem (estava 37–57%); 16 perdeu a Araracanga, a Estrela Cadente e o Fogo de Coivara (estava 31–48% com conselho); membros dentro da faixa 4.5 (13: 55–57, 14: 57–59, 15: 59–61, 16: 61–63).
- Lição: estátuas da entrada em (6, 17) e (10, 17) + treinador que se aproxima pela fila 16 = jogador preso no saguão (g16-1 foi para (12, 17) olhando para o norte, visão 1).
- Aviso aos outros agentes: um `pkill -f jogar.mjs` meu pode ter derrubado uma rodada do QA (o roteiro deles tem o mesmo nome); o meu piloto agora se chama `s/piloto1316.mjs`.
