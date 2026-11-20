# CAPTURA-CRIACAO.md — diário dos sistemas de captura e criação (spec 6.2, 6.3, 7, 8, 10-9, 10A-4/5/6/9/11/12/13)

Arquivos deste time: `src/battle/cuias.ts` (regras puras: rara, cuias artesanais, obediência, item segurado selvagem),
`src/data/ninhos.ts`, `src/data/trocas.ts`, `src/world/ninhos.ts`, `src/world/enxames.ts`, `src/data/eventos/captura.ts`,
`tools/build-raras.ts` (+ `public/assets/sprites/criatura/*/*-rara.png` e `public/assets/raras.json`).

## Marcos
- (início) leitura do spec, docs e código; plano abaixo.
- [x] código dos 5 itens escrito; `tsc` limpo (fora x-ea.ts de outro agente); `npm test` 37/37 (4 testes novos: cuias artesanais, Pelagem Rara + item segurado, obediência, ninhos).
- [x] 183 sprites raros gerados (`npx tsx tools/build-raras.ts --previa` → tools/.cache/raras-previa-*.png conferidas a olho).
- [x] 8 cuieiras assadas: A-R2 verde, A-R3 amarela, A-R4 vermelha, A-R5 preta, A-R7 branca, A-MG azul, A-PR rosa, B-R1 preta.
- [ ] testes no navegador.

## O que existe (por item)
- **Pelagem Rara**: `CriaturaInst.rara`; `prepararSelvagem()` (src/battle/cuias.ts) em `batalhaSelvagem` e nos errantes (src/world/encontros.ts) = 1/4096 + item segurado 5% fruto do tipo / 1% achado. Sprites: `tools/build-raras.ts` troca a paleta (receita por tipo + receitas à mão; criaturas quase sem cor são tingidas) e grava `*-rara.png` + `public/assets/raras.json`; `vista(id, 'frente-rara')` em src/core/assets.ts deriva o meta da vista normal (o atlas não muda). Batalha: palco usa a vista rara e `brilhoRaro()` (estrelas) em src/battle/view/tela.ts. Telas: estrela em Equipe, Resumo, Viveiro; Diário marca a espécie (flag `rara:<nº>`, posta ao ver uma rara em batalha ou ao chocar) e a estrela alterna a figura comum/rara. Parceira que segue usa `mapa-rara.png`. **Rara garantida**: o spec cita "a do Lago, evento do Cartel" sem zona definida → pós-Liga no Lago do Fundo da Gruta Breu (A-GB-2): capanga Ferrolho (NPC `cartel-lago` em 26,8, `se: liga-vencida & !lago-raro-ok`), batalha e depois um Mandizinho nv 38 raro (com Concha Rara). Se fugir, conversar de novo com o capanga chama o bicho outra vez.
- **Cuias artesanais**: objeto de catálogo `cuieira` (campo `cor`) com pintor próprio em tools/scenery/exterior/objetos.ts; evento `cuieira` (1 cabaça por árvore por dia, flag `cuieira:<zona>:<x>,<y>` = dia corrido). Artesão **Mestre Cabaceiro** em A2 (37,7): recebe todas as cabaças de uma cor e entrega as cuias no dia seguinte. 7 cabaças + 7 cuias no fim de src/data/itens.ts (`uso.cuia.artesanal`). Fórmula: `bonusArtesanal()` — ligeira ×4 (Velocidade base ≥ 100) · pesada ×1,5/2,5/4 (10/100/300 kg) · lua ×4 (evolui com pedra/objeto ou à noite; nenhuma espécie usa Pedra Lunar) · amiga ×1 + amizade 220 · isca ×3 (pesca, `PedidoBatalha.pescada`) · nível ×2/4/8 · amor ×8.
- **Ovos e ninhos**: src/data/ninhos.ts (11 grupos, 180 espécies + lendários sem ninho), src/world/ninhos.ts (regras puras), `SaveData.criadouro`. Ninho do meio da sala de A2-casa-aroeira (`script: 'criadouro-aroeira'`), abre com 6 insígnias. Deixar até 2, retirar por 100 + 100/nível ganho, 1 exp por passo, sorteio a cada 256 passos (50% mesma espécie, 25% mesmo grupo), ovo da forma base da mãe, 3 genes dos pais, golpes do pai que o filhote aprende (nível ou pergaminho), 1/4096 rara, choca em 1024/1536/2560 passos (curva). Aviso pelo Rádio Cipó (casal Aroeira/Jurema) via `bus 'criadouro-ovo'` se o jogador tem o rádio.
- **Enxames**: já estavam implementados pelo agente das regras 10A (src/data/revancha.ts + hook `ajustesDeEncontro`). Para não haver dois enxames, `src/world/enxames.ts` é só a fachada `enxameDeHoje()` / `anuncioEnxame()` sobre `enxameDoDia` dele (recado em docs/REGRAS-10A.md).
- **Trocas e obediência**: src/data/trocas.ts — Dona Quitéria (A3 8,17: Cotiazinha → Saguinho "Pipoca" nv 16, caju, 1+ insígnia), Seu Maré-Cheia (A5 39,27: Caranguejim → Ariranhinha "Marola" nv 26, açaí, 3+), Mestre Zé Malho (A8 20,9: Cupinzim → Bugiozinho "Trovoada" nv 30, pequi, 5+); as 3 do mapa B já existiam (b1, b2-sul, b2-norte). Obediência no motor (`ConfigBatalha.obediencia`, `chanceObedecer` = limite ÷ nível acima de 20/30/50/70/todas por 0–1/2–3/4–5/6–7/8+ insígnias, só para `treinadorOriginal` ≠ jogador); quem desobedece faz corpo mole (60%) ou usa outro golpe (40%). Trocadas ganham experiência ×1,5.

## Edições fora dos meus arquivos (mínimas)
src/core/tipos.ts (`rara?`, `criadouro?`) · src/core/assets.ts (vistas `-rara`, `vistaCriatura`) · src/battle/engine.ts (cuia artesanal, obediência, exp de troca) · src/battle/index.ts (`pescada`, `obediencia`) · src/battle/view/{palco,tela}.ts · src/world/{encontros,campo,deps,parceira}.ts · src/ui/telas/{comum,resumo,equipe,viveiro,diario}.ts · src/data/itens.ts (fim da lista + campo `artesanal`) · src/data/catalogo-objetos.ts (`cuieira`) · tools/scenery/exterior/objetos.ts (pintor) · zonas: `objetos` de A-R2/A-R3/A-R4/A-R5/A-R7/A-MG/A-PR/B-R1 e A2-casa-aroeira (ninho), `npcs` de A2/A3/A5/A8/A-GB-2 (um NPC cada) · tools/test-batalha.ts.

## Plano
1. Pelagem Rara: 1/4096 por encontro selvagem (`rng`), `CriaturaInst.rara`; sprites `*-rara.png` gerados no build por troca de paleta; brilho na entrada; marca no Resumo e no Diário; rara garantida no Lago (evento do Cartel, spec 10A-5).
2. Cuias artesanais: cuieiras (objeto `cuieira` nas zonas), artesão, 7 cuias novas na fórmula.
3. Ovos e ninhos no Viveiro do Seu Aroeira (pós-insígnia 6).
4. Enxames do dia: `enxameDeHoje()` em `src/world/enxames.ts`.
5. Trocas com 6 moradores + obediência (20/30/50/70/todas).

## Aviso da arte final (agente de retoque das criaturas, 20/11) — REGENERAR AS RARAS destes
Os PNG `frente/costas/mapa` destas 25 criaturas mudaram (diário em docs/ARTE-FINAL.md); as `*-rara.png` delas estão
desatualizadas e precisam ser geradas de novo com `tools/build-raras.ts`:
andorim, andorinhao-da-cachoeira, borealce, caranguejeirao, caranguejim, cigarrao, ema-mirim, escorpiao-rei, escorpim,
galo-manao, guaiamuque, harpia, harpinha, jatai-rainha, lavadeira-dragao, lavadeirim, moco-da-rocha, mocozim, noitao,
noitim, pintinhas, tuiuiuzim, urutau-fantasma, urutauzim, vagalampo.
Atenção: algumas paletas mudaram (andorim/andorinhão, urutauzim/urutau-fantasma, mocozim/mocó-da-rocha, caranguejim:
rampa 2) e os sprites de frente de caranguejim/guaiamuque/noitim/noitão/urutaus usam câmera/pose novas — se a troca de
paleta das raras for por cor exata, confira esses ids. Ids, nomes de animação e número de quadros NÃO mudaram.
