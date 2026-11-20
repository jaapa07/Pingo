# ZONAS-B2-NORTE.md — diário do time B2-norte (Serra da Geada para cima, Planalto Lume, Floresta Ancestral e Pico Pindorama)

## Decisões
- Régua própria `src/data/zonas/_b2n-lib.ts` (cópia do método do B1, com a lista de defeitos `ERROS_B2N` e os serviços aceitando o mapa `PP`). Nenhuma zona lança exceção na carga.
- Coordenadas das zonas dos outros times em um só lugar: `src/data/zonas/_b2n-ligacoes.ts` (B7 e B-R4 / A-MT).
- B7 é do B2-sul e ficou com B-R5 ao NORTE, B-SG a OESTE e B-LG a LESTE (docs/HISTORIA.md). Nossas chegadas: B-R5 (1, 16) 'l' · B-SG (6, 38) 'n' · B-LG (24, 42) 'n'. Escrito na tabela de ligações do HISTORIA.md em 20/11 — o B2-sul ainda precisa trocar os números dos warps de B7 (hoje apontam para B-R5 (15, 78), B-SG (58, 20) e B-LG (1, 20)).
- "B-PL" da tabela 6.4 (Beija-Arco-Íris, Papagálio, Urubu-Rei, Jataí-Rainha, Louva-Mestre) = os **Campos do Lume**, capim e ipês dentro de B8.
- Níveis: B-SG/B-LG (passo 14, antes do ás 59) 55–57 · B-R5/B8 (passo 15, antes do ás 61) 55–59 · Pico 62–65 · Garrote 62–64 · rival 8 63–65 · Conselho 64–70 · Floresta Ancestral (pós-jogo) 65–75 · Andarilho do Cume 75–80.
- Expedição Boreal (182): fica com o agente dos lendários 181/182 (aviso do coordenador). **Ponto reservado no Pico para o evento noturno das Lanternas Boreais: a "Pedra das Lanternas", área livre de neve no oeste do Cume, tiles (8..11, 3..6) da zona `PP` (centro (10, 5)), depois da muralha do Garrote.** Nada foi colocado ali.

## Zonas (prontas e assadas com --previa)
- **B-R5 Caminho das Névoas** 90×34, serra, `nevoa`, passo 15: Guarda da Névoa (`insignia:14&amuleto:lampiao`), cânion com ponte, Loca do Nevoeiro (Quebra-pedra, chão de gruta), degrau de mão única, Mirante do Guardião Velho (`pos-jogo`).
- **B8 Planalto Lume** 50×40, planalto, passo 15, `pouso` (10, 18): ginásio (porta → `B8-ginasio` (8, 17); volta (23, 9) em docs/PORTAS-GINASIO.md), posto, venda, observatório (`B8-observatorio`), 2 casas, Campos do Lume, mirante do cânion, estrada da B-FA fechada pela Guardiã da Floresta (`pos-jogo`).
- **B-SG Campos de Altitude** 70×40, geada, passo 14: Açude Congelado (gelo), Mirante do Uirapuru (Escalar), Trilha Velha (`pos-jogo`), pastor da troca.
- **B-LG Lagoa Gelada** 50×44, geada, passo 14: Ilha do Joca (`B-LG-cabana`, Remo), praia dos juncos (só de canoa), Poça de Cima (Cachoeira), Trapiche Comprido (Jubartão, pós-jogo).
- **B-FA Floresta Ancestral** 64×60, mata, passo 17 (pós-jogo): 3 Ninhos Raros, Lagoa Escura, Coração da Floresta (Mapinguari).
- **PP Pico Pindorama** 40×54, pico, passo 17: Acampamento (chegadas (6, 52) de A-MT e (34, 52) de B-R4; `PP-posto`, `PP-venda`), Portão dos Guardiões (`insignias:16`, oferenda de 2 Elixires + 2 Chás), Subida (8 treinadores), campo de gelo, `PP-gruta` (escura) com saída secreta no Beiral Escondido, muralha do Cume com o Garrote, porta do Salão (exige `garrote-vencido`), rival 8, Andarilho do Cume, neve brilhante.
- **PP-conselho** 30×57: vestíbulo, sala de espera (porta sem volta), 5 salas, Sala da Memória.
- Interiores: B8-posto, B8-venda, B8-casa-1, B8-casa-2, B8-observatorio, B-LG-cabana, PP-posto, PP-venda, PP-gruta.

## Marcos
- (20/11) Leitura; zonas, treinadores (`treinadores/b2-norte.ts`: 36 de rota/cidade + Andarilho; `treinadores/conselho.ts`: Garrote, rival-8 ×3, conselho-1..5), eventos (`eventos/b2-norte.ts`, `eventos/conselho.ts`).
- (20/11) `tools/verifica-zonas-b2-norte.mts` (npx tsx tools/verifica-zonas-b2-norte.mts): OK, 0 erros; ligado ao `npm run check` (linha `zonas-b2-norte` em tools/verify.ts).
