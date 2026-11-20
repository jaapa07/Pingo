# ZONAS-B1.md — diário do time B1 (mapa B: Vila Cascavel → Arraial Brasa)

## Decisões
- **Nome da B1: Vila Cascavel** (decisão do usuário, 20/11). "Vila Buriti" agora é a A10. Trocado em `src/ui/telas/mapa-dados.ts` (só o texto do local B1) e em docs/HISTORIA.md.
- B1 sem ginásio: o prédio vira o **Salão da Raizeira** (interior `B1-salao`, sem insígnia). `B1-ginasio.ts` não deve existir.
- Mapa B começa depois da Liga (Campeão ás 46). Líderes 9/10/11 com ás 49/51/53.

## Plano de progressão (passos 9–11)
- Passo 9 (antes do líder 9, ás 49): B1, B1-estacao, B-R1, B-CE, B-PA (lado norte), B2. Selvagens 44–47; treinadores 43–47.
- Pantanal (`pantanal-ok`, tenente Arame): só depois da insígnia 9; abre o canal sul de B-PA → B9 e a porteira B9 → B-R2.
- Passo 10 (ás 51): B-PA sul, B9, B-R2, B3 (+mina). Selvagens 46–49; treinadores 45–49. Porta do ginásio de B3 exige `flag:mina-ok`.
- Passo 11 (ás 53): B-CH (Escalar), B4, B-CV (Lampião; Boitatá após a insígnia 10). Selvagens 48–51; treinadores 47–51.
- B4 → B-R3 (borda leste) exige insígnia 11.

## Marcos
- (20/11) leitura do spec/contratos; nome Vila Cascavel aplicado.
