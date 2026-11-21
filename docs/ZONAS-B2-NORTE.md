# ZONAS-B2-NORTE.md — diário do time B2-norte (Serra da Geada para cima, Planalto Lume, Floresta Ancestral e Pico Pingorama)

## Decisões
- Régua própria `src/data/zonas/_b2n-lib.ts` (cópia do método do B1, com a lista de defeitos `ERROS_B2N` e os serviços aceitando o mapa `PP`). Nenhuma zona lança exceção na carga.
- Coordenadas das zonas dos outros times em um só lugar: `src/data/zonas/_b2n-ligacoes.ts` (B7 e B-R4 / A-MT).
- B7 é do B2-sul e ficou com B-R5 ao NORTE, B-SG a OESTE e B-LG a LESTE (docs/HISTORIA.md). Nossas chegadas: B-R5 (1, 16) 'l' · B-SG (6, 38) 'n' · B-LG (24, 42) 'n'. Escrito na tabela de ligações do HISTORIA.md em 20/11; o B2-sul já ajustou B7 e pôs `insignias:16` no warp B-R4 → PP. Jogado: B7 norte → B-R5 (1, 16), B7 oeste → B-SG (6, 38), B7 leste → B-LG (24, 42).
- "B-PL" da tabela 6.4 (Beija-Arco-Íris, Papagálio, Urubu-Rei, Jataí-Rainha, Louva-Mestre) = os **Campos do Lume**, capim e ipês dentro de B8.
- Níveis: B-SG/B-LG (passo 14, antes do ás 59) 55–57 · B-R5/B8 (passo 15, antes do ás 61) 55–59 · Pico 62–65 · Garrote 62–64 · rival 8 63–65 · Conselho 64–70 · Floresta Ancestral (pós-jogo) 65–75 · Andarilho do Cume 75–80.
- Expedição Boreal (182): fica com o agente dos lendários 181/182 (aviso do coordenador). **Ponto reservado no Pico para o evento noturno das Lanternas Boreais: a "Pedra das Lanternas", área livre de neve no oeste do Cume, tiles (8..11, 3..6) da zona `PP` (centro (10, 5)), depois da muralha do Garrote.** Nada foi colocado ali.

## Zonas (prontas e assadas com --previa)
- **B-R5 Caminho das Névoas** 90×34, serra, `nevoa`, passo 15: Guarda da Névoa (`insignia:14&amuleto:lampiao`), cânion com ponte, Loca do Nevoeiro (Quebra-pedra, chão de gruta), degrau de mão única, Mirante do Guardião Velho (`pos-jogo`).
- **B8 Planalto Lume** 50×40, planalto, passo 15, `pouso` (10, 18): ginásio (porta → `B8-ginasio` (8, 17); volta (23, 9) em docs/PORTAS-GINASIO.md), posto, venda, observatório (`B8-observatorio`), 2 casas, Campos do Lume, mirante do cânion, estrada da B-FA fechada pela Guardiã da Floresta (`pos-jogo`).
- **B-SG Campos de Altitude** 70×40, geada, passo 14: Açude Congelado (gelo), Mirante do Uirapuru (Escalar), Trilha Velha (`pos-jogo`), pastor da troca.
- **B-LG Lagoa Gelada** 50×44, geada, passo 14: Ilha do Joca (`B-LG-cabana`, Remo), praia dos juncos (só de canoa), Poça de Cima (Cachoeira), Trapiche Comprido (Jubartão, pós-jogo).
- **B-FA Floresta Ancestral** 64×60, mata, passo 17 (pós-jogo): 3 Ninhos Raros, Lagoa Escura, Coração da Floresta (Mapinguari).
- **PP Pico Pingorama** 40×54, pico, passo 17: Acampamento (chegadas (6, 52) de A-MT e (34, 52) de B-R4; `PP-posto`, `PP-venda`), Portão dos Guardiões (`insignias:16`, oferenda de 2 Elixires + 2 Chás), Subida (8 treinadores), campo de gelo, `PP-gruta` (escura) com saída secreta no Beiral Escondido, muralha do Cume com o Garrote, porta do Salão (exige `garrote-vencido`), rival 8, Andarilho do Cume, neve brilhante.
- **PP-conselho** 30×57: vestíbulo, sala de espera (porta sem volta), 5 salas, Sala da Memória.
- Interiores: B8-posto, B8-venda, B8-casa-1, B8-casa-2, B8-observatorio, B-LG-cabana, PP-posto, PP-venda, PP-gruta.

## Marcos
- (20/11) Leitura; zonas, treinadores (`treinadores/b2-norte.ts`: 36 de rota/cidade + Andarilho; `treinadores/conselho.ts`: Garrote, rival-8 ×3, conselho-1..5), eventos (`eventos/b2-norte.ts`, `eventos/conselho.ts`).
- (20/11) `tools/verifica-zonas-b2-norte.mts` (npx tsx tools/verifica-zonas-b2-norte.mts): OK, 0 erros; ligado ao `npm run check` (linha `zonas-b2-norte` em tools/verify.ts).
- (20/11) JOGADO no navegador (Vite próprio na 5199, sem HMR/vigia, `MAPA_B_ABERTO` ligado só por plugin em memória; roteiros Playwright no scratchpad da sessão, pasta `b2n/`):
  - B-R5 com 13 insígnias: o Guarda da Névoa barra em (4, 16); B-R5 oeste → B7 (24, 1). Com 14: travessia inteira até B8 (1, 19), batalha real com B-R5-8 vencida.
  - B8: observatório (Vega, de noite: missão das constelações), escrivã (lê o registro da equipe), aprendiz (carta), Posto (cura), Venda, casa 1; a Guardiã da Floresta barra em (44, 4) antes do Conselho.
  - Missões: carta entregue ao Joca (`m-carta-lume-resposta`), troca do pastor (Gralha-Azul → Maracajá-Nevado "Geadinha" nv 57 com Buriti), totem do Uirapuru sem as 150 (fala de espera), Ninho Raro da Mata de manhã (batalha) e recusa na 2ª visita do dia, Mapinguari (batalha; vencido → `mapinguari-dormiu`), Jubartão no Trapiche Comprido, neve brilhante (hoje é 20/11: Pedra Lunar, Rapadura, 3 Penas).
  - Pico: Portão (oferenda recolhida), subida com batalha real (PP-3), Garrote (`garrote-vencido`, capangas presos, Rádio), rival 8, porta do Salão, sala de espera (porta sem volta), 5 Guardiões em sequência (batalhas no modo sem tela do motor, `definirHeadless`): derrota no Arandu → volta ao Portão (19, 41) com a equipe curada e `conselho-1..4` zerados; vitória → Sala da Memória, créditos, `conselho-vencido`, `pos-jogo`, `misterioso-pode`, errantes 179/180, Rádio, volta ao Cume (20, 7). Andarilho do Cume aparece com `misterioso-pode` e some depois do duelo.
  - Sem erros de console em nenhum roteiro.
- (20/11) EQUILÍBRIO do Conselho (simulador `tools/equilibrio-referencia.ts`, piloto esperto, 6 Elixires, 4 Chás, 6 Garrafadas, cuidados entre lutas): equipes cortadas para 3/3/3/4/4 criaturas (64–65 · 64–65 · 64–66 · 65–67 · 67–70). Equipe do Sertão no nv 63–65 (inicial final, Harpia, Emaçu, Maracajá-Nevado, Poraquê, Cascavelão): 44–74% de vitória na sequência inteira; equipe de referência só com capturas do mapa A: 4–24% (o Arandu segura). Com 4–5 criaturas por Guardião dava 0%.

## Pendências
- `B8-ginasio` (time de ginásios): a porta já leva a (8, 17); volta (23, 9).
- Expedição Boreal (182) e Galo-Manaó (181): outro agente; ponto reservado no Cume (8..11, 3..6).
- Sprites que faltam (hoje usam classes parecidas): Guardião Tibiriçá do Portão (usa `npc-homem-4`), Andarilho do Cume (usa `cl-montanhista`), Guarda da Névoa (`cl-montanhista`), Guardiã da Floresta (`cl-mateira`), Drª Solveig (se o agente dos visitantes precisar). Conselho, Garrote e Tainá já têm sprite próprio.
- Revanche do Conselho com equipes mais fortes (spec 5: pelo Rádio Cipó) não foi feita: a porta reabre com as mesmas equipes.
- Neve brilhante: só texto e itens (não há tiles de neve cintilante; o bake não muda por data).
