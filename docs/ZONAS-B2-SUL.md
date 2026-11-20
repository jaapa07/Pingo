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
