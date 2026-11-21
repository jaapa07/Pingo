# QA-FINAL.md — QA de ponta a ponta com o mapa B aberto (`MAPA_B_ABERTO = true`)

Data: 20–21/11. Base: HEAD `2909536a` (Versão para PC 1.1.0). Regras lidas: ESTADO, HISTORIA, DECISOES-FINAIS e os
diários QA-*. Ferramentas novas em `tools/testes/qa-final/`:
- `iphone.mts [brasa|mata] [checkpoint]` — o `dist/` servido em `/Pingo/` (como o GitHub Pages), iPhone 13 emulado (só
  toque), pré-cache do Service Worker, rede cortada, jogo novo → inicial → salvar pelo menu → recarregar → continuar; save
  avançado no Jogo 2 → continuar → trem andando até Vila Cascavel; visita às 90 zonas do mapa B/Pico/X-EA e batalha no B.
- `sim-iniciais.ts [--n] [--d]` — rivais 1–8 (variante certa para cada inicial) e líderes 9–16/Garrote/Conselho com a
  equipe de referência de Mata, Brasa e Rio.
- `trocar-inicial.mts <save> <mata|brasa> <saída>` — converte um checkpoint do QA (jogado com Rio) para Mata/Brasa.
- `fluxos.mjs` (roda com `tools/testes/decisoes/run.sh ../qa-final/fluxos.mjs <seg>`) — rival 5–8 por inicial, presentes
  do inicial (Drª Buriti e ovo da Praia), Borealce e Gavião-Tupã vencidos, Cuia Guardiã da Profª Ipê.

## O que passou
- `npx tsc --noEmit` limpo · `npm test` 38/38 · `npm run check -- --tudo` 16/16, 0 erros, 5 avisos conhecidos (B9 e
  B-TA alcançáveis cedo, A-GE água 24,5, A-MT) · progressão A (quarto → Liga) e B (Liga → Conselho → pós-jogo) sem erro;
  as duas Cuias Guardiãs do chão (A-RS, A9) são alcançadas na simulação; a 3ª (Profª Ipê, 100 espécies) sai uma vez só
  (no navegador: 1 → 2 → 2). Total possível: 3.
- **iPhone 13 (toque), build publicado, sem rede** — `iphone.mts brasa campeao` e `iphone.mts mata campeao-b`: pré-cache
  completo (14 717 arquivos, 33–45 s), **6 773 arquivos do mapa B no grupo "resto" e todos no cache**; sem rede: jogo novo
  pela interface, inicial Brasa/Mata (flag certa), salvar pelo menu, recarregar e continuar no mesmo lugar e equipe; save
  pós-Liga e save pós-Conselho no Jogo 2 → continuar → Estação de Porto Sereia → **subir no vagão andando leva a
  B1-estacao** → Vila Cascavel; as **90 zonas do mapa B/Pico/X-EA abrem sem nenhum pedido falhar**; batalha selvagem no
  Pantanal Grande jogada até o fim. Nenhum erro de console.
- **Fim de jogo jogado na tela (piloto do QA 4) com Mata e com Brasa** (checkpoint `passo-16` convertido):
  Garrote vencido nos dois; rival 8 usa `rival-8-brasa` (Mata; perdida, a história segue) e `rival-8-rio` (Brasa; vencida);
  Conselho: derrota → volta ao Portão com `conselho-1..4` zerados e a equipe curada; **Mata venceu na 3ª sequência, Brasa
  só na 7ª** (≈ 64 selvagens de treino entre as tentativas). Créditos, `conselho-vencido`, `pos-jogo`, `misterioso-pode`,
  errantes 179/180 soltos. Sem erro de console.
- **Fluxos** (`fluxos.mjs`, tudo OK): rivais 5, 6, 7 e 8 usam a variante que vence o inicial (Mata → `-brasa`, Brasa →
  `-rio`); Drª Buriti dá Brasa (4) ao jogador de Mata e Mata (1) ao de Brasa; o ovo da Praia é Rio (7) para os dois;
  Borealce vencido → `borealce-sumiu`; Gavião-Tupã vencido → `gaviao-ok` + fala, e não volta a lutar.
- **Lendários** (`tools/testes/qa-missoes-b/lendarios.mjs`, agora com o mapa B aberto de verdade): Boitatá fuga → continua,
  vencido → some e não volta; Mapinguari vencido some; Uirapuru capturado some; Boiúna vencida some; Queixada fugiu →
  continua vagando; Galo-Manaó vencido → `galo-manao-sumiu`; Borealce fuga → continua; Mandizinho raro vencido → some.
  (As 2 falhas do roteiro no Borealce "vencido" eram do piloto, que fugiu da luta; o `fluxos.mjs` venceu o Borealce e a
  regra funcionou.) Errante vencido: o motor marca `fim` (código conferido; o errante foge no 1º turno, então não dá para
  vencê-lo na tela sem prender/adormecer).
- Revanches: `revancheLiderLiberada` (1–8 com `liga-vencida`, 9–16 com 16 insígnias) usada no Rádio, na recepção, no salão e
  no `revPreparar`; testes de fluxo do agente das decisões (`decisoes/fluxos.mjs revanche`) e teste unitário cobrem.
- O pedregulho da Subida da Serra (B-R4 (36, 45)) volta ao lugar a cada visita: perder no meio da subida de mão única e
  voltar pelo Posto de B6 não tranca o caminho.

## Bugs corrigidos
Nenhum: não achei bug de progressão, save ou trava no que testei.

## Pendências (não corrigidas)
1. **Equilíbrio por inicial (decisão do autor).** Rio é bem mais fácil no fim do jogo. `sim-iniciais.ts` (equipe de
   referência, Δ 0, 60 lutas): Conselho em sequência com mochila cheia **Mata 20% · Brasa 10% · Rio 75%**; rivais 5–8
   Mata 40–72% · Brasa 55–62% · Rio 85–98%. Trocando só o inicial na MESMA equipe (capturas da referência do Rio):
   Conselho Mata 38% · Brasa 33% · Rio 68%; rival 7: 87/68/100%. Na tela: Conselho com Rio em 2 sequências (QA 4), Mata
   em 3, Brasa em 7. Todos os QAs honestos anteriores usaram Rio. Sugestão: medir o Arandu e o Moacir contra Lobo-Fornalha/
   Bandeirão, ou baixar 1–2 níveis das variantes `rival-N-rio` e `rival-N-brasa`.
2. **Interface (do outro agente):** o aviso com o nome da zona (`avisar(def.nome)` em src/world/index.ts) continua por cima
   da batalha quando ela começa logo ao entrar na zona: no iPhone, "Pantanal Grande" cobriu a caixa de nome/nível do
   selvagem (`scratchpad/qafinal/brasa-batalha-b.png`). Sugestão: esconder o aviso quando a batalha abre.
3. **Texto (história):** a fala da Tainá depois da rival 5 (src/data/eventos/liga.ts, `rival-5`) ainda diz "quando a linha
   da serra reabrir, eu pego o trem" — com o mapa B aberto, a linha já está aberta. O Cacique e o Rádio já têm a versão
   `mapa-b`. O ovo da Praia diz "é quente" e "irmão da criatura que ela te confiou" mesmo quando é o Botinho (Rio).
4. **Enxame do dia:** com o mapa B aberto, o rodízio do Rádio inclui as rotas do B desde o começo do jogo; antes da Liga o
   jogador ouve "Enxame em …" num lugar onde não pode ir (já acontecia com A-R6/A-MT). Sugestão: só zonas do B depois de
   `liga-vencida` (cuidar do cache diário em src/data/eventos/regras.ts).
5. `rival-5` não tem o ramo "sem flag de inicial" que as rivais 4, 6, 7 e 8 têm (inofensivo: todo save tem `inicial-*`).
6. Remo, Mergulho e Cachoeira pedem criatura de Rio na equipe: quem joga de Mata/Brasa precisa capturar uma antes da Remo
   (Garcinha no capim de A-R3, ou pescar); o jogo avisa ("O Remo precisa de uma criatura do tipo Rio"). Só registro.

## Não coberto
Jogo honesto do zero até o Conselho com Mata/Brasa em uma só partida (os trechos foram cobertos por checkpoints convertidos;
o piloto do QA 4 se perde sem criatura de Rio na equipe convertida e na volta à Subida da Serra depois de duas derrotas —
limitação do piloto, conferida à mão), PC/Electron, iPhone deitado nesta rodada (o teste offline do check já cobre).
