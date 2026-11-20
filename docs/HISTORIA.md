# HISTORIA.md — roteiro, flags e ligações entre times (contrato de level design)

> ## ⚠ REESTRUTURA DA LIGA (vale sobre qualquer linha antiga deste arquivo e sobre arquivos já escritos)
> O mapa B só abre depois da **Liga dos Guardiões**, vencida após a 8ª insígnia (spec 4.5, 5 e "Liga dos Guardiões").
> - **Ordem:** 1 Vento A2 · 2 Inseto A3 · 3 Rio A4 · 4 Encanto A5 · 5 Trovão A6 · 6 Assombro A7 · 7 Ferro A8 · 8 Mata **A10 Vila Buriti (zona nova)** · **Liga em `A-LG` Platô da Liga** · 9 Terra B2 · 10 Pedra B3 · 11 Brasa B4 · 12 Ginga B5 · 13 Veneno B6 · 14 Geada B7 · 15 Mente B8 · 16 Lenda A9 · Garrote + Conselho no PP.
> - **Níveis do ás:** 10 (era 12; ajuste do jogo honesto, ver docs/EQUILIBRIO.md), 17, 22, 26, 30, 33, 36, 40 · Liga 41–46 · 49, 51, 53, 55, 57, 59, 61, 63 · Conselho 64–70. Selvagens do mapa B começam em 44–48. Estágio final só em equipes de nível ≥ 36.
> - **Amuletos:** faro (missão, após 1) · facao=2 · **remo=3** · lampiao = evento do Farol (antes da 5) · **quebra-pedra=6** · **forca=7** · **mergulho=9** · escalar=10 · cachoeira=12 · voo=14.
> - **Caminho do mapa A:** A4 —cais sul (exige `amuleto:remo` **e** `flag:usina-ok`)→ A-BA → A5 (4) → A6 (Farol, 5) → A-GB (Lampião) → A7 (6) → A-R5 (Quebra-pedra) → A8 (7) → **A-R7 Estrada do Buriti (Força)** → **A10** (8) → **A-LG** (portão: `insignias:8`). A-R6 (Cachoeira) e A-RS (Mergulho) viram áreas de retorno depois do mapa B.
> - **Usina (`usina-ok`, após a insígnia 3):** religa a energia do cais e da estação; **não dá mais o Passe do Trem**. A estação reabre, mas o maquinista só embarca quem tem `flag:liga-vencida` ("linha da serra só para Campeões").
> - **Liga (`liga-vencida`):** dá `item:passe-trem` e `item:bilhete-saveiro`. Trem A4↔B1, Saveiro A5↔B9 e a trilha do Pico exigem `flag:liga-vencida`. O Farol dá só o Lampião.
> - **Rival:** 1 lab · 2 A3 · 3 A4 (gatilho: `flag:usina-ok&!flag:rival-3`, antes de zarpar) · **4 Farol A6** · **5 Platô, logo depois da Liga** · 6 B4 · 7 B7 · 8 Pico.
> - **Times:** A1 fica com A10 (+ginásio é do time de ginásios: `A10-ginasio`), A-R7 e A-LG (zona, 5 treinadores da Liga em `src/data/treinadores/liga.ts`, evento em `src/data/eventos/liga.ts`). Ligação **A8 ↔ A-R7**: A-R7 chega em (1, 15) vindo de A8; A8 recebe em (58, 15) (saída leste de A8, bloqueada por pedregulhos de Força). B1 passa a se chamar **Vila Cascavel** (decisão do usuário; "Vila Buriti" é a A10), não tem mais ginásio (o prédio vira o "Salão da Raizeira", sem insígnia) e `inicial-extra-1` passa para a Drª Buriti em A10 (após a insígnia 8).
> - Arquivos de ginásio são numerados pela **insígnia nova** (`ginasio-04` = Encanto … `ginasio-08` = Mata).

Base: spec seções 4.4, 4.5 (ordem), 5 (ginásios e Liga dos Guardiões), 7A, 9 (personagens e eventos), 10. Tom: aventura ensolarada, humor brasileiro, conservação.
Dono deste arquivo: time A1. O bloco acima é o resumo da reestrutura; as tabelas abaixo já estão atualizadas e valem junto com ele.

## Flags e marcos (nomes exatos)
| Flag | Quando |
|---|---|
| `intro-ok` | terminou a abertura (nome, relógio com a mãe, Rádio Cipó) |
| `inicial` = 1 \| 4 \| 7 | espécie escolhida no laboratório; junto vai `inicial-mata` \| `inicial-brasa` \| `inicial-rio` (para usar em `se`) |
| `ovo-pintado` → `ovo-no-aroeira` → `ovo-entregue` | recebeu o Ovo Pintado (`item:ovo-pintado`) → entregou ao Seu Aroeira (A2) → voltou ao laboratório; a Profª dá 5 Cuias e o Diário de Campo (`item:diario-de-campo`, flag `diario`) |
| `rival-1` … `rival-8` | encontros com a Tainá: 1 lab/A1 (após o ovo) · 2 A3 (após a insígnia 2) · 3 A4, no cais (`flag:usina-ok&!flag:rival-3`, antes de zarpar) · 4 Farol A6 · 5 Platô da Liga, logo depois da Liga · 6 B4 · 7 B7 · 8 Pico (antes do Conselho). A flag é marcada ao fim do duelo, vença ou perca (`['batalha', id, { segue: true }]`); `batalha-perdida` diz o resultado do último duelo |
| `tutorial-captura` | fez o tutorial de captura com a Mateira Jurema (A-R1) |
| `faro-missao` → `faro-achou` → `faro-ok` | missão do Seu Aroeira após a insígnia 1 → achou a Paçoca (A-R2) → amuleto `faro` |
| `usina-ok` | Cartel derrotado na Usina Velha (tenente Lata), após a insígnia 3: religa o guincho do cais sul de A4 e a estação. **Não dá o Passe do Trem** |
| `farol-ok` | Cartel derrotado no Farol (tenente Rebite), antes da insígnia 5 → amuleto `lampiao` (só o Lampião) |
| `inicial-extra-1`, `inicial-extra-2` | Drª Buriti em `A10-lab` (após a insígnia 8) e ovo da Praia das Tartarugas (A-PR) — regra do spec 6.2 |
| `liga-em-curso`, `liga-1` … `liga-4` | dentro da Liga (a porta da sala de espera fecha) e Mestres já vencidos nesta tentativa; a derrota zera tudo |
| `liga-vencida` | venceu o Campeão Cacique Aracê em `A-LG`: Hall da Fama, `item:passe-trem`, `item:bilhete-saveiro`, pedra de evolução à escolha, aviso do Rádio Cipó; libera o mapa B |
| `pantanal-ok` | ninhos do Pantanal salvos (tenente Arame; mapa B) |
| `mina-ok` | Mina de Chapada Rubra libertada (antes da insígnia 10) |
| `laboratorio-ok` | laboratório secreto do Brejo Roxo destruído (antes da insígnia 13); Queixada-Caipora (176) passa a vagar |
| `garrote-vencido` | Coronel Garrote derrotado no Pico (antes do Conselho) |
| `conselho-vencido` | créditos; libera pós-jogo (`pos-jogo`), B-FA, Lobo-Jaci e Onça-Guaraci errantes |
| `venceu:<idTreinador>` | marcada pelo motor ao vencer um treinador |
| missões e marcos do time B1 | `b1-chegou`, `rival-6`, `boitata-ok` (`boitata-dormiu` se derrotado), `m-raizes(-ok)`, `m-doce-ok`, `m-carta-b1(-resposta/-ok)`, `m-ninho(-dia/-ok)`, `m-orfaos(-dia)`, `orfao-<nº>`, `m-fotos(-ok)`, `m-foto-1..5`, `m-sao-joao-ok`, `m-troca-b1-ok`, `m-pepitas-ok`, `m-forja-ok` (detalhes em docs/ZONAS-B1.md) |
| marcos e missões do time B2-norte | `garrote-vencido`, `rival-8`, `conselho-em-curso`, `conselho-1`…`conselho-4`, `conselho-memoria`, `conselho-vencido` + `pos-jogo` (marcado junto; a condição `pos-jogo` continua lendo `conselho-vencido`), `misterioso-pode` (Andarilho do Cume volta a cada vitória no Conselho), `uirapuru-ok`, `mapinguari-ok` (`mapinguari-dormiu`), `m-carta-lume(-resposta/-ok)`, `m-constelacoes(-ok)`, `m-troca-sg-ok`, `b2n-neve-ano`, `b2n-ninho-<linha>-dia`, `b2n-jubarte-dia` (detalhes em docs/ZONAS-B2-NORTE.md) |
| missões paralelas do time A1 | `m-chapeu(-achou/-ok)`, `m-pintinhas(-ok)`, `m-carta(-resposta/-ok)`, `m-perdido(-ok)`, `m-ponte(-ok)`, `m-eco(-achou/-ok)`, `m-peixe(-ok)`, `vara-velha-ok` |
| missões dos visitantes 181 (spec 6.5) | `ea-missao` (Seu Tarumã, A4, com 16 insígnias: 2 frascos vazios) → `ea-frasco-escuro` (A-R6, Poço do Breu, de noite, Mergulho) e `ea-frasco-barrento` (B-R2, poço da cascata seca, de dia) → `ea-rota` (frascos entregues; canoa para a zona `X-EA`) → `galo-manao-ok` (Galo-Manaó capturado). Reencontro enquanto o jogador não tiver um 181 (detalhes em docs/VISITANTES.md) |
| missões dos visitantes 182 (spec 6.5) | `boreal-missao` (Drª Solveig em B9, depois de `conselho-vencido`) → `boreal-lanterna-1..4` (pesquisadores B-EXP-1..4 em B7, B-SG, B-LG, B-R5) → `boreal-acesa` (lanternas acesas no alto do PP, de noite) → `borealce-ok` (capturado) → `borealce-nota` (nota da Drª Solveig no Diário). Auxiliares de roteiro: `vis-*` (derivadas, recalculadas a cada evento) |

Amuletos: dados pelo líder junto com a insígnia (tabela 4.4): facao=2, **remo=3**, **quebra-pedra=6**, **forca=7**, **mergulho=9**, escalar=10, cachoeira=12, voo=14; `faro` (missão do Seu Aroeira, após a 1) e `lampiao` (evento do Farol, antes da 5) vêm de eventos.
Portões narrativos obrigatórios: saída de A1 só com criatura (`flag:inicial`); A2→A-R2 `insignia:1`; A4→A-R4 `insignia:3`; porta da estação de A4 `flag:usina-ok`; cais sul de A4 `amuleto:remo&flag:usina-ok`; vagão do trem (A4-estacao e B1-estacao) `flag:liga-vencida&item:passe-trem`; cais do Saveiro de A5 `flag:liga-vencida&item:bilhete-saveiro`; Portão das Oito Insígnias em A-LG `insignias:8`; guardião do Monte Tupã (A-MT) `insignias:15`; Portão dos Guardiões (PP) `insignias:16`; B-FA `pos-jogo`.
Itens de cura em batalha (spec 7A): rival, líderes e chefes só usam do 8º ginásio em diante (Liga inclusive).

## Convenções de zonas
- Ids: `A1`, `A-R1`, `B-PA`, `PP`… (tabelas 4.1/4.2). Interiores: `<zona>-<nome>` (`A1-quarto`, `A1-casa-jogador`, `A1-lab`, `A2-posto`, `A2-venda`, `A2-casa-1`…). Dungeons com andares: `A-US-1`, `A-US-2`.
- **Ginásios**: a zona interior `<cidade>-ginasio` é do time de ginásios. O time da cidade coloca o prédio `ginasio` e um warp de porta para `{ zona: '<cidade>-ginasio', x: 8, y: 17, dir: 'n' }`; o ginásio devolve para o tile logo abaixo da porta — declare esse tile em `docs/PORTAS-GINASIO.md` (uma linha por cidade: `A2: x, y`). Arquivos de ginásio são numerados pela insígnia nova.
- Posto Guardião: atendente com `script: 'posto'` (cura + salva `ultimoPosto`), `objetos` `maquina-cura` e `viveiro` (`script: 'viveiro'`). Venda: NPC com `loja`. Scripts genéricos (`posto`, `viveiro`, `pc-quarto`, `radio`, `mae-poupanca`) e comandos extras (`opcao`, `temEspecie`, `temItens`, `temDinheiro`, `poupar`, `sacar`, `contato`, `grito`, `vitrine`) ficam em `src/data/eventos/comuns.ts` (time A1).
- Treinadores: `src/data/treinadores/<time>.ts` exportando `TreinadorDef[]` (ids `<zona>-<n>`); sprites = ids de classe de `docs/MODELOS.md`. **Níveis: ás do líder do passo −2 a −6** nas rotas anteriores a ele (ás: 12, 17, 22, 26, 30, 33, 36, 40 · Liga 41–46 · 49…63). Exceção assumida: a Trilha do Ipê (A-R1) vai de 3 a 8, porque o inicial sai do laboratório no nível 5. Estágio final só em equipes de nível ≥ 36. ≥ 150 treinadores no jogo: cada time ≥ 40.
- Eventos de história que acontecem numa zona são do time dono da zona (`src/data/eventos/<time>.ts`).
- Duelo de história que não pode travar o roteiro: `['batalha', id, { segue: true }]` (derrota cura a equipe e segue; `batalha-perdida` marca o resultado). Sequência que recomeça (Liga): acrescente `semMarca: true`.

## Ligações entre times (coordenadas fixas de chegada)
| Ligação | Chegada |
|---|---|
| A4 → A-R4 (borda leste de A4, `insignia:3`) | A-R4 em (1, 12) olhando 'l'; volta: A4 em (58, 20) olhando 'o' |
| A-BA ↔ A4 (cais sul de A4; exige `amuleto:remo&flag:usina-ok`) | A-BA em (4, 20); A4 em (30, 43) |
| A8 ↔ A-R7 (saída leste de A8, fechada por pedregulhos de Força) | A-R7 em (1, 15) olhando 'l'; volta: A8 em (58, 15) olhando 'o' |
| A-R7 ↔ A10 ↔ A-LG | mesmo time (A1): A10 em (1, 15) vindo da estrada; A-LG em (15, 68) vindo de A10; A10 em (21, 1) descendo do Platô |
| A4 estação ↔ B1 estação de Vila Cascavel (trem; `flag:liga-vencida&item:passe-trem`) | zona `A4-estacao` (time A1) plataforma em (8, 6); `B1-estacao` (time B1) plataforma em (8, 6); o warp `trem` fica no vagão |
| A5 cais ↔ B9 cais (saveiro; `flag:liga-vencida&item:bilhete-saveiro`) | A5 em (30, 34) olhando 'n'; B9 em (10, 24) olhando 'n' |
| B4 → B-R3 (borda leste) | B-R3 em (1, 14) 'l'; volta: B4 em (48, 16) 'o' |
| A-MT topo → PP (lado A) | PP em (6, 52) 'n'; volta: A-MT em (20, 3) 's' |
| B-R4 → PP (lado B) | PP em (34, 52) 'n'; volta: B-R4 em (24, 3) 's' |
| B5 ↔ B-TA, B-TA ↔ B6 | mesmo time (B2-sul) |
| **B7 ↔ B-R5** (borda norte de B7, tiles (24..25, 0); portão `insignia:14` do lado de B7) | **B-R5 em (1, 16) 'l'** (B2-norte, 20/11: o B-R5 é 90×34 e corre de oeste para leste; a entrada é a borda oeste, tiles (0, 16..17), e o Guarda da Névoa repete o portão `insignia:14&amuleto:lampiao` em (5, 16..17)); volta: B7 em (24, 1) 's' |
| **B7 ↔ B-SG** (borda oeste de B7, tiles (0, 19..20)) | **B-SG em (6, 38) 'n'** (B2-norte, 20/11: o B-SG é 70×40 e a saída para B7 é a borda sul, tiles (6..7, 39)); volta: B7 em (1, 19) 'l' |
| **B7 ↔ B-LG** (borda leste de B7, tiles (49, 19..20)) | **B-LG em (24, 42) 'n'** (B2-norte, 20/11: a B-LG é 50×44 e a saída para B7 é a borda sul, tiles (24..25, 43)); volta: B7 em (48, 19) 'o' |
| B-SG ↔ B-LG, B-R5 ↔ B8 ↔ B-FA, PP ↔ PP-conselho/PP-gruta | mesmo time (B2-norte); B8 recebe de B-R5 em (1, 19); B-FA recebe de B8 em (30..31, 58) |
| **B-R4 → PP: pedido do B2-norte** | ponha `requer: 'insignias:16'` (com `recusa`) no warp de B-R4 para o Pico, como o A-MT já faz: sem isso, quem tem 14 insígnias sobe ao acampamento (o Portão dos Guardiões segura, e a descida do Pico para A-MT exige 16, então não há atalho; é só coerência) — **feito pelo B2-sul (20/11)**: o warp de B-R4 (24, 2) → PP tem `requer: 'insignias:16'` + `recusa`, e o Guia do Pico (portão em (24, 9), ao pé da trepadeira) pede o mesmo |
| B6 → B-R4 → B7 | mesmo time (B2-sul): B6 (24, 0) ↔ B-R4 (24, 68); B-R4 borda norte (38..39, 0) ↔ B7 (24..25, 38) |

## Times de zonas
- **A1**: A1 (+quarto, casa, lab, casas), A-R1, A2, A-R2, A-MS, A3, A-R3, A-GE, A4 (+estação, mercado), **A-R7, A10 (+posto, venda, lab da Drª Buriti, casas), A-LG (+posto, venda)**, a ABERTURA completa do jogo e a **Liga dos Guardiões** (`treinadores/liga.ts`, `eventos/liga.ts`).
- **A2**: A-R4, A-US, A-BA, A5, A6 (+farol), A-PR, A-MG, A-GB, A7, A-R5, A-R6, A8, A-RS, A-MT, A9.
- **B1**: B1 **Vila Cascavel** (+estação; sem ginásio — o prédio é o "Salão da Raizeira"), B-R1, B-CE, B-PA, B2, B9, B-R2, B3 (+mina), B-CH, B-CV, B4.
- **B2**: B-R3, B5, B-TA, B6 (+laboratório do Cartel), B-VV, B-R4, B7, B-SG, B-LG, B-R5, B8, B-FA, PP (Pico Pindorama: Portão, Garrote, salas do Conselho, créditos).

## Gincana e Safári do pós-Liga (spec 10A itens 32 e 33; diário em docs/GINCANA-SAFARI.md)
| Ligação | Chegada |
|---|---|
| A-LG terreiro ↔ A-GN Vale do Buriti-Alto (carro de boi: NPC `carreiro-gincana` em A-LG (28, 55), `se: flag:liga-vencida`; evento `carreiro-ida`) | A-GN em (3, 11) 'l'; volta (`carreiro-volta`, NPC em A-GN (2, 11)): A-LG em (27, 55) 'o' |
| A-GN borda leste (31, 10..11) ↔ A-SF Portaria do Safári (borda oeste (0, 9..10)) | A-SF em (1, 9) 'l'; A-GN em (30, 10) 'o' |
| A-SF casa-c (porta 19, 8) ↔ A-SF-casa (Seu Jatobá) | A-SF-casa em (5, 7) 'n'; volta A-SF (19, 9) 's' |
| A-SF porteira → A-SF-parque (só pelo evento `safari-porteira`, pago) | parque em (10, 32) 'n'; saída pela borda sul (10..11, 33) → A-SF (13, 3) 's' |

| Flag | Quando |
|---|---|
| `gincana-aberta`, `carreiro-sim` | conversou com o carreiro do Platô / resposta do sim-ou-não do carreiro |
| `gincana-visitou`, `gincana-sucos-presente` | ouviu as regras da Juíza Bia / ganhou os 3 cajus do Seu Graviola |
| `gincana-pontos` (nº), `gincana-provas` (nº) | saldo de pontos da Gincana (troca na Tesouraria) / provas jogadas |
| `gincana-recorde:<prova>`, `gincana-podio:<prova>` = `"<dia>:<valor>"` | melhor pontuação do dia e melhor pódio já premiado no dia (`agilidade`, `forca`, `salto`) |
| `gincana-suco:<uid da criatura>` = `"<dia>:<fruto>"` | suco tomado hoje (vale até o fim do dia do relógio do jogo) |
| `safari-visitou`, `safari-tem-dinheiro`, `safari-op(-0..2)` | auxiliares da porteira |
| `safari-ativo`, `safari-passos` (nº), `safari-visitas` (nº), `safari-capturas` (nº) | passeio em curso e passos que restam / contadores |
| `safari-dono-conheceu`, `safari-setor-2`, `safari-setor-3`, `safari-setor-4` | setores do parque montados (Lagoa, Mata, Toca); o dono pede na ordem: Pedra de Rio → Muda de Buriti → Tronco Oco |
| `safari-pedra-dada`, `safari-muda-dada`, `safari-tronco-dado`, `safari-<item>-entregue` | doadores dos objetos de ambiente (A-R3 (35, 6) Pescador Seixo; A10 (19, 21) Viveirista Carnaúba; A-R7 (6, 11) Lenhador Seu Angico, todos com `se: flag:liga-vencida`) / objeto entregue ao dono |
