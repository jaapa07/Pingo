# QA-MISSOES-B.md — diário do QA das missões paralelas e eventos secundários do mapa B

## Como roda
- Vite próprio na porta 5207 (`--strictPort`, sem HMR/vigia; `MAPA_B_ABERTO` ligado só nele por plugin em memória):
  `tools/testes/qa-missoes-b/run.sh <roteiro.mjs> [segundos]` (`run.sh parar` desliga). Reinicie o Vite depois de editar o jogo.
- Apoio: `tools/testes/qa-missoes-b/lib.mjs` (cópia do `qa3-lib.mjs` + saves montados com `montar()`, equipe forte,
  hora/dia do relógio do jogo, leitura das falas novas). Usa o piloto `tools/testes/qa3/qa3-piloto.js` (joga pelo teclado).
- Capturas em scratchpad/qamb/.

## Marcos
- (20/11) leitura dos diários B1, B2-sul, B2-norte, MOTOR, HISTORIA e eventos b1/b2-sul/b2-norte; infraestrutura montada.
