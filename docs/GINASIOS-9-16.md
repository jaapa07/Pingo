# GINASIOS-9-16.md — diário dos ginásios do mapa B e da Aldeia Tupã

Diário compartilhado por dois agentes: o lote 9–12 (B2/B3/B4/B5-ginasio) e o lote 13–16 (B6/B7/B8/A9-ginasio).
Cada lote escreve só na sua seção.

## 9–12

Numeração nova (docs/HISTORIA.md): ás dos líderes 9–12 = 49, 51, 53, 55; turma do ginásio = ás − 2 a − 6; líder com IA `lider` e remédios.
Sprites, temas e arenas seguem a numeração ANTIGA das artes: Zefa = `lider-05` / tema `g05` / arena `ginasio-05`; Topázio = `lider-09` / `g09`; Labareda = `lider-10` / `g10`; Gingado = `lider-11` / `g11`.
Arquivos meus: `src/data/zonas/{B2,B3,B4,B5}-ginasio.ts`, `src/world/mecanicas/ginasio-09..12.ts`, `src/data/treinadores/ginasio-09..12.ts`, `src/data/eventos/ginasio-09..12.ts`.

### Marcos
- (20/11) Pedra renumerada para o ginásio 10: os antigos `ginasio-09.*` (Pedra, ás 43) viraram `treinadores/ginasio-10.ts`, `eventos/ginasio-10.ts`, `mecanicas/ginasio-10.ts`; `B3-ginasio` com passo 10, ids `g10-*`, `lider-10`, flag `ginasio-10-vencido`, insígnia 10, Escalar. Equipe nova do Topázio com ás 51.
- (20/11) Ginásio 9 (Terra) escrito: `B2-ginasio` 19×19 (tema g05, arena ginasio-05), três cercados de lama (5×2; 7×3 com 1 fardo; 11×3 com 2 fardos), soluções por busca no comentário da zona; `mecanicas/ginasio-09.ts` (afunda ao sair, porteira abre com toda a lama pisada, firma ao passar, atolar/sair/sino = peões alisam). 5 treinadores (43–47) + Zefa (ás 49, Tatucanastra). Jogado no Vite 5197: atolar testado, 3 cercados pela solução, g09-3/4/5 + líder → insígnia 9, `amuleto-mergulho`, pt-28 no save.
- (20/11) Ginásio 10 (Pedra) jogado no Vite 5197 com a numeração nova: vagonete 1 a oeste, vagonete 2 bate no para-choque, desvio 1 a leste, desvio 2 ao norte, volta, desvio 1 a oeste, vagonete 2 sobe; g10-1..4 + líder → insígnia 10, `amuleto-escalar`, pt-40 no save. `B3-ginasio` assado (estava sem bake).
- Lição (igual à do lote 13–16): treinador que avista anda até o jogador e fica ao lado; g09-3 ficou com visão 2 para não fechar a entrada (5, 11) do cercado 2.
- (20/11) Ginásio 11 (Brasa): `B4-ginasio` 21×19 (g10, arena ginasio-10), 3 terreiros de fogueiras com nota (sfx `saveiro-sino` com `pitch`): 1º mostra a música (3 notas), 2º mostra e pede "anarriê" (4, ordem invertida), 3º só canta os nomes (5, posições embaralhadas, cada fogueira diz a sua nota). Errar apaga o terreiro; acertar esfria as brasas `x` da passagem. 5 treinadores (47–51) + Labareda (ás 53, Lobo-Fornalha). Jogado: música, erro proposital, 3 terreiros, g11-2..5 + líder → insígnia 11 e pt-10.
- (20/11) Ginásio 12 (Ginga): `B5-ginasio` 21×19 (g11, arena ginasio-11), 3 rodas com camarada na passagem; minijogo de chamada e resposta no ritmo do berimbau (Angola 2 voltas 3/4 golpes, 44 quadros/batida, janela ±13; Benguela 3 voltas 3/4/5, 36, ±11; São Bento Grande 3 voltas 4/5/6, 30, ±9; 1 tropeço por volta). Estado em `data-roda-*` do marcador (leitura do teste). 5 treinadores (49–53) + Gingado (ás 55, Pintada). Jogado: 2 erros propositais recomeçam a roda; rodas 1–3 vencidas; g12-1/2/3/5; líder (segunda rodada, equipe de teste sem Carreira em Chamas) → insígnia 12, `cachoeira`, pt-25.
- (20/11) Simulador (`g912/sim-b.mts` no scratch: base de tools/equilibrio-referencia.ts, equipe de referência da Liga com ás = ás do líder − Δ, mochila 6 Garrafadas + 2 Elixires, 90 lutas): esperto Δ2/Δ3/Δ4 — 9: 74/60/43% · 10: 78/70/43% · 11: 74/57/43% · 12: 82/47/47%. Bobo 0–42%. Ajustes: Zefa −1 nível em 5 membros e 2 Garrafadas (antes 63/51/17); Topázio com 5 criaturas (sem Tartaruga-Gigante). Turma dos 4 ginásios: esperto 97–100%.
- (20/11) Bakes de B2/B3/B4/B5-ginasio refeitos em public/assets/zonas. `tsc` limpo; `npm run check -- --rapido` sem erro nos meus arquivos (os erros da rodada são de outros times: cartel-lago, líder 1, dist sem bake, tsc por tempo esgotado com a máquina carregada).

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

### Marco 4 — fechamento do lote 13–16
- `npx tsc --noEmit -p .` limpo (repo inteiro). `npm run check -- --rapido`: nenhum erro nos meus arquivos; o único que cita um deles é `dist/assets/zonas/A9-ginasio/zona.json` ausente (o bake está em `public/assets/zonas/A9-ginasio`; entra no dist no próximo build). Os outros erros da rodada são de outros times (scripts `cuieira`/`troca-*`, `cartel-lago`, líder 1, tsc por tempo esgotado com a máquina cheia).
- Bake refeito das quatro zonas (B6/B7/B8/A9-ginasio) depois dos últimos ajustes. Vite 5200 desligado.
- Pendências: (1) reinício dos blocos da Geada ao sair da pista não foi visto no navegador (só a lógica); (2) no 15, g15-1/3/5 são opcionais e não foram enfrentados no navegador (só no simulador); (3) bobo 0–12% contra os quatro líderes, como nos líderes 1–8; (4) líder 13 com Δ 2 dá 85% (acima da meta; Δ 3–4 dá 55–57%).
