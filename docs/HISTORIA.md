# HISTORIA.md — roteiro, flags e ligações entre times (contrato de level design)

Base: spec seções 4.5 (ordem), 9 (personagens e eventos), 10. Tom: aventura ensolarada, humor brasileiro, conservação.

## Flags e marcos (nomes exatos)
| Flag | Quando |
|---|---|
| `intro-ok` | terminou a abertura (nome, relógio com a mãe, Rádio Cipó) |
| `inicial` = 1 \| 4 \| 7 | espécie escolhida no laboratório |
| `ovo-entregue` | entregou o Ovo Pintado ao Seu Aroeira (A-R1/A2) e voltou; a Profª dá 5 Cuias e o Diário de Campo (`item:diario`) |
| `rival-1` … `rival-8` | encontros com a Tainá: 1 lab/A1 (após o ovo), 2 A3, 3 A4 (antes do trem), 4 B2, 5 A6 (farol), 6 B4, 7 B7, 8 Pico (antes do Conselho) |
| `faro-ok` | missão do Seu Aroeira após a insígnia 1 → amuleto `faro` |
| `usina-ok` | Cartel derrotado na Usina Velha (tenente Lata) → `item:passe-trem` |
| `pantanal-ok` | ninhos do Pantanal salvos (3º evento, tenente Arame; após insígnia 5) |
| `farol-ok` | Cartel derrotado no Farol (tenente Rebite) → amuleto `lampiao` + `item:bilhete-saveiro` |
| `mina-ok` | Mina de Chapada Rubra libertada (antes da insígnia 9) |
| `laboratorio-ok` | laboratório secreto do Brejo Roxo destruído (antes da insígnia 13); Queixada-Caipora (176) passa a vagar |
| `garrote-vencido` | Coronel Garrote derrotado no Pico (antes do Conselho) |
| `conselho-vencido` | créditos; libera pós-jogo (`pos-jogo`), B-FA, Lobo-Jaci e Onça-Guaraci errantes |
| `venceu:<idTreinador>` | marcada pelo motor ao vencer um treinador |
| `inicial-extra-1`, `inicial-extra-2` | Drª Buriti (B1, após insígnia 4) e ovo da Praia das Tartarugas (A-PR, após insígnia 6) — regra do spec 6.2 |

Amuletos: dados pelo líder junto com a insígnia conforme a tabela 4.4 (facao=2, remo=4, forca=5, quebra-pedra=8, escalar=9, cachoeira=11, mergulho=12, voo=14), exceto `faro` e `lampiao` (eventos acima).
Portões narrativos obrigatórios: saída de A1 só com criatura (`flag:inicial`); A4→estação exige `item:passe-trem`; cais de A5 exige `item:bilhete-saveiro`; guardião do Monte Tupã (A-MT) exige `insignias:15`; Portão dos Guardiões (PP) exige `insignias:16`; B-FA exige `pos-jogo`.

## Convenções de zonas
- Ids: `A1`, `A-R1`, `B-PA`, `PP`… (tabelas 4.1/4.2). Interiores: `<zona>-<nome>` (`A1-quarto`, `A1-casa-jogador`, `A1-lab`, `A2-posto`, `A2-venda`, `A2-casa-1`…). Dungeons com andares: `A-US-1`, `A-US-2`.
- **Ginásios**: a zona interior `<cidade>-ginasio` é do time de ginásios. O time da cidade coloca o prédio `ginasio` e um warp de porta para `{ zona: '<cidade>-ginasio', x: 8, y: 17, dir: 'n' }`; o ginásio devolve para o tile logo abaixo da porta — declare esse tile em `docs/PORTAS-GINASIO.md` (uma linha por cidade: `A2: x, y`).
- Posto Guardião: atendente com `script: 'posto'` (cura + salva `ultimoPosto`), `objetos` `maquina-cura` e `pc` (`script: 'viveiro'`). Venda: NPC com `loja`. Estes scripts genéricos (`posto`, `viveiro`, `pc-quarto`, `radio`) são do time do mapa A parte 1 em `src/data/eventos/comuns.ts`.
- Treinadores: `src/data/treinadores/<time>.ts` exportando `TreinadorDef[]` (ids `<zona>-<n>`); sprites = ids de classe de `docs/MODELOS.md`; níveis conforme o `passo` da zona (tabela 4.5: nível do líder − 2 a − 6 nas rotas anteriores a ele). ≥ 150 no jogo: cada time ≥ 40.
- Eventos de história que acontecem numa zona são do time dono da zona (`src/data/eventos/<time>.ts`).

## Ligações entre times (coordenadas fixas de chegada)
| Ligação | Chegada |
|---|---|
| A4 → A-R4 (borda leste de A4) | A-R4 em (1, 12) olhando 'l'; volta: A4 em (58, 20) olhando 'o' |
| A4 estação ↔ B1 estação (trem) | zona `A4-estacao` (time A1) plataforma em (8, 6); `B1-estacao` (time B1) plataforma em (8, 6); o warp `trem` fica no vagão |
| A5 cais ↔ B9 cais (saveiro) | A5 em (30, 34) olhando 'n'; B9 em (10, 24) olhando 'n' |
| A-BA ↔ A4 (cais sul de A4, exige remo) | A-BA em (4, 20); A4 em (30, 43) |
| B4 → B-R3 (borda leste) | B-R3 em (1, 14) 'l'; volta: B4 em (48, 16) 'o' |
| A-MT topo → PP (lado A) | PP em (6, 52) 'n'; volta: A-MT em (20, 3) 's' |
| B-R4 → PP (lado B) | PP em (34, 52) 'n'; volta: B-R4 em (24, 3) 's' |
| B5 ↔ B-TA, B-TA ↔ B6 | mesmo time (B2) |

## Times de zonas
- **A1**: A1 (+quarto, casa, lab, casas), A-R1, A2, A-R2, A-MS, A3, A-R3, A-GE, A4 (+estação) e a ABERTURA completa do jogo.
- **A2**: A-R4, A-US, A-BA, A5, A6 (+farol), A-PR, A-MG, A-GB, A7, A-R5, A-R6, A8, A-RS, A-MT, A9.
- **B1**: B1 (+estação), B-R1, B-CE, B-PA, B2, B9, B-R2, B3 (+mina), B-CH, B-CV, B4.
- **B2**: B-R3, B5, B-TA, B6 (+laboratório do Cartel), B-VV, B-R4, B7, B-SG, B-LG, B-R5, B8, B-FA, PP (Pico Pindorama: Portão, Garrote, salas do Conselho, créditos).
