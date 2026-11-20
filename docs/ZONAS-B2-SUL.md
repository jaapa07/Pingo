# ZONAS-B2-SUL.md — diário do time B2-sul (mapa B: Trilha da Roda → Serra da Geada)

## Decisões
- Zonas do time: B-R3, B5 (+posto, venda, feira, casas), B-TA, B-TA-gruta, B6 (+posto, venda, casas, laboratório do Cartel em 3 andares B6-lab-1/2/3), B-VV, B-R4, B7 (+posto, venda, casas). Ginásios `B5/B6/B7-ginasio` são do time de ginásios (porta → (8, 17); saída em docs/PORTAS-GINASIO.md).
- Apoio próprio `src/data/zonas/_b2s-lib.ts` (cópia do método do B1: grade com marcas que nunca lança exceção; erros em `ERROS_B2S`). O `_b2-lib.ts` antigo fica intocado (pode ser usado pelo B2-norte).
- Curva (spec 4.5): líder 12 ás 55 → passo 12 (B-R3, B5) selvagens e treinadores 49–53 · líder 13 ás 57 → passo 13 (B-TA, B-TA-gruta, B6, laboratório, B-VV) 51–55, tenentes 54–56 · líder 14 ás 59 → passo 14 (B-R4, B7) 53–57, rival-7 com ás 58.
- Portões: B4 → B-R3 `insignia:11` (B1). **B6 só depois da insígnia 12**: no Túnel Alagado a passagem da Gruta do Fôlego para a piscina do leste sobe uma cascata (Cachoeira). B6 → B-R4 `insignia:13`. B7 → B-R5 `insignia:14`. Ginásio de B6 fechado até `laboratorio-ok`.
- Queixada-Caipora (176): foge da jaula no fim do laboratório (`laboratorio-ok`) e passa a vagar (`['errante', 176, 55]`) quando o jogador sai do ginásio de Brejo Roxo com a insígnia 13 (spec 6.4: "errante no mapa B depois da insígnia 13 (nv 55)").
- Ligações publicadas em docs/HISTORIA.md (seção "Ligações entre times"): B7 ↔ B-R5 / B-SG / B-LG.

## Marcos
- (20/11) leitura do spec/contratos; ligações de B7 publicadas no HISTORIA.md antes de desenhar o resto; `_b2s-lib.ts` criado.
- (20/11) Zonas escritas/adaptadas (ordem nova, passos 12–14): B-R3 100×32, B5 52×40 (+posto, venda, feira, casa-1..4), B-TA 60×30, B-TA-gruta 44×26, B6 50×38 (+posto, venda, casa-1..3, lab-1 30×22, lab-2 32×24, lab-3 26×18), B-VV 64×40 (nova), B-R4 50×70 (nova), B7 50×40 (nova, +posto, venda, casa-1, casa-2, ctg). Interiores antigos migrados para `_b2s-lib` (arena "campo" inexistente trocada pela da cidade).
- (20/11) `src/data/treinadores/b2-sul.ts`: 55 treinadores (51 distintos; a rival tem 3 versões por inicial). `src/data/eventos/b2-sul.ts`: 32 eventos (laboratório, Queixada, rival 7, rival semanal, 11 missões/serviços).
- (20/11) B2-norte respondeu no HISTORIA.md: B-R5 chega em (1, 16) 'l', B-SG em (6, 38) 'n', B-LG em (24, 42) 'n' — warps de B7 ajustados. Pedido deles atendido: warp B-R4 → PP com `requer: 'insignias:16'` + recusa (e o Guia do Pico ao pé da trepadeira pede o mesmo).
- (20/11) `tools/verifica-zonas-b2-sul.mts` OK (0 erros); linha acrescentada em tools/verify.ts (igual à do B1).
