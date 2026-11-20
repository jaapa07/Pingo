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
- (20/11) Helper `src/data/zonas/_b1-lib.ts` (grade com marcas que NÃO lança exceção: erros em `ERROS_B1`; `Pincel` de régua; posto/venda/casa do Sertão).
- (20/11) Prontas e assadas com --previa: B1 Vila Cascavel 44×34 (+estacao, posto, venda, casa-1..3, salao, lab), B-R1 30×80 e B-CE 60×40 (mapas antigos adaptados: passo 9, níveis 44–47, saída leste do B-CE para B-PA), B-PA 60×56, B2 46×34 (+posto, venda, casa-1, casa-2, centro), B9 44×32 (+posto, venda, casa-1, casa-2), B-R2 90×30, B3 46×36 (+posto, venda, casa-1, casa-2, mina-1 30×24, mina-2 30×20). `B1-ginasio.ts` apagado.
- Ligações: B1 (21..22,0) ↔ B-R1 (14..15,78/79) · B1 lagoa leste (43,28..31) ↔ B-PA (0..1,16..19) · B-CE (59,12..14) ↔ B-PA (0..1,6..8) · B-PA (59,11..12) ↔ B2 (0..1,15..16) · B-PA canal (26..29,55) ↔ B9 (20..23,0..1) · B9 (43,14..15) ↔ B-R2 (0..1,14..15) · B-R2 (89,16..17) ↔ B3 (0..1,17..18) · B3 (23,0) ↔ B-CH (20,68/69) · mina (37,10) ↔ B3-mina-1 (15,22).
- Portões: canal do ninhal em B-PA (28..30,24) `insignia:9`; rede do Cartel em B-PA (26..29,50) `flag:pantanal-ok`; porteira de B9 (41,14..15) `flag:pantanal-ok`; porta do ginásio de B3 `flag:mina-ok`.
- (20/11) Prontas e assadas: B-CH 40×70, B-CV 40×36 (escura), B4 50×34 (+posto, venda, casa-1, forja). `docs/PORTAS-GINASIO.md`: B2 (23,9) · B3 (20,20) · B4 (25,6).
- (20/11) `src/data/treinadores/b1.ts`: 56 treinadores (51 de rota/cidade/mina + tenentes Arame e Rebite + rival-6 ×3). `src/data/eventos/b1.ts`: 22 eventos (chegada, raizeira, pantanal, mina, Boitatá, rival 6 e 10 missões: carta, ninho, órfãos, fotos, São João, troca, pepitas, doce, raízes, forja).
- (20/11) `tools/verifica-zonas-b1.mts` (rodar: `npx tsx tools/verifica-zonas-b1.mts`): OK, 0 erros. Não está ligado ao `npm run check` (tools/verify.ts não é do time).
- (20/11) Jogado no navegador (Vite próprio em 5196, sem HMR, `MAPA_B_ABERTO` ligado só nele por um plugin que transforma `src/core/progresso.ts` em memória; config e roteiros Playwright em scratchpad): trem A4-estacao → B1-estacao (evento de chegada) → Vila Cascavel → Salão da Raizeira (cura) → Vereda → Cerrado → passarelas do Pantanal → Pantanal Grande (6 batalhas) · paredão de Chapada Rubra com Escalar → Chapada dos Paredões → Caverna Vulcânica com Lampião → Boitatá (insígnia 10) → Arraial Brasa (rival 6, porteira fechada sem a insígnia 11, festeira fora do sábado).
- (20/11) Também jogado: canal do ninhal com a insígnia 9 → tenente Arame (`pantanal-ok`) → canal sul → Porto Pantaneiro → Estrada Vermelha (Quebra-pedra) → Chapada Rubra → Mina Velha → tenente Rebite (`mina-ok`); Saveiro A5 ⇄ B9 com a porteira de B9 fechada antes do ninhal; Centro de Reabilitação (filhote adotado; no mesmo dia recusa). Sem erros de console.
- Pendências: ginásios `B2-ginasio` e `B4-ginasio` (time de ginásios; as portas já levam a (8, 17)); `tools/verifica-zonas-b1.mts` fora do `npm run check`; `src/data/textos-ui.ts` ainda põe a Dona Buriti em "Vila Buriti / local B1" (deve ser A10); `niveis.ts` avisa `rival-6-brasa` como "do mapa A" (regex de ids do mapa B não cobre `rival-6`).
