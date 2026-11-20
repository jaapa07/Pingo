# VERIFICACAO.md — diário da verificação geral e integração (20/11)

Objetivo: `npm run check` completo com 0 erros, verificador cobrindo mapas A e B, Pico, pós-jogo e visitantes
(incluindo a progressão do mapa B aberto), pacote publicado e pré-cache medidos, teste offline/atualização.

## Marco 1 — linha de base e verificador atualizado
`npm run build` + `npm run check -- --tudo` (build limpo) ANTES: 13 de 15 checagens, **5 erros**:
- `src/data/eventos/captura.ts`: evento `cartel-lago` "batalha com cartel-lago, que não existe". Causa real: o
  treinador nasce no arquivo de eventos (`registrarTreinador`) e o verificador só lia `src/data/treinadores/`
  (o jogo acha o treinador pelo registro). Enquanto isso o QA pós-Liga trocou a batalha pelo comando `lagoDuelo`.
- Build limpo: 4 imports absolutos em `tools/testes/qa3|qa4/*-sim-lider.mts`. Causa real: a checagem de imports
  lia pastas que o `tsconfig` exclui (roteiros locais dos QAs, nem o tsc nem o CI os tocam).

Corrigido no verificador (sem mexer em dados de outros times):
- `tools/verify/dados.ts`: coleta treinadores/eventos como o jogo (`coletar` de src/world/deps.ts: exports soltos
  ou em listas, + `registrarTreinador`/`registrarEvento`); comandos registrados por telas (Gincana/Safári em
  `src/ui/telas`) passam a ser conhecidos; NPCs e gatilhos de `PONTOS_VISITANTES` entram nas zonas como no jogo;
  pontos de colheita de `src/world/mecanicas/x-ea.ts` (frascos) viram dados da simulação.
- `tools/verify/build-limpo.ts`: a checagem de imports pula as pastas do `exclude` do tsconfig.
- `tools/verify/integridade.ts`: mapa B, Pico e pós-jogo deixam de ser "pendente": referência quebrada é erro
  em qualquer mapa; warp que chega fora do mapa de destino também é erro.
- `tools/verify/progressao.ts`: **simulação do mapa B aberto** (o termo `mapa-b` vale verdadeiro só na
  simulação): insígnias 9–16 uma a uma, Amuletos mergulho=9, escalar=10, cachoeira=12, voo=14, marcos
  `mina-ok` (9), `rival-6` (9–11), `laboratorio-ok` (12), `rival-7` (12–14), `garrote-vencido`/`rival-8`/
  `conselho-vencido` (16), depois o pós-jogo; toda zona do jogo tem de ser alcançada. Mergulho: warp sobre água
  funda (`d`) ou de zona submersa só com o Amuleto (antes A-RS era dada como alcançável com 3 insígnias).
  Visão de treinador: linha reta sem parede (antes atravessava paredes: A-MT-1/2 apareciam com 6 insígnias).
- `tools/verify/niveis.ts`: treinadores do mapa B e das áreas de retorno conferidos contra o ás do líder do
  passo da zona (erro se passar; aviso se ficam alcançáveis antes do passo com ás acima do líder seguinte).
- `tools/verify/niveis.ts` (sprites) e `tools/verify/pacote.ts`: todas as espécies, zonas, treinadores, NPCs e
  eventos (A, B, Pico, pós-jogo, visitantes) — sprite faltando é erro, não aviso.
- `tools/verify.ts`: linha nova "Progressão do mapa B aberto" no check normal; `--mapa-b` roda só as duas
  progressões com todos os passos.

Resultado da simulação do mapa B aberto: PASSA (do quarto até `conselho-vencido` e o pós-jogo, 193 zonas).
Avisos de desenho (não mudados): B9 (passo 10) alcançável com 8 insígnias pelo Saveiro; B-TA/B-TA-gruta
(passo 13) com 11.

## Marco 2 — pacote publicado e pré-cache
Medido no `dist` (build local e build limpo, iguais): **15 655 arquivos, 41,6–42,6 MB** de conteúdo (≈80 MB no
`du`, blocos de 4 KB). Por pasta: zonas 13 532 arq. 21,0 MB (mapa A 5 819 arq. 9,0 MB · mapa B/Pico 6 556 arq.
10,1 MB · X-EA 217 arq. 0,3 MB · demos `_*` 940 arq. 1,6 MB) · sprites 1 537 arq. 17,5 MB (criaturas 12,7 MB +
pelagens raras 549 arq. 3,9 MB + gente 0,9 MB) · arenas 0,35 MB · tiles 0,4 MB · interface/FX 0,2 MB · código
~1,3 MB. Áudio sintetizado em código (sem arquivos).

Pré-cache ANTES: núcleo 317 arq. 2,7 MB (instalação) + resto **14 396 arq. 37,2 MB** (em lotes logo depois de
abrir) · por demanda 940 arq. 1,6 MB (só as demos). Metade dos arquivos do resto eram zonas do mapa B, que
ninguém alcança com `MAPA_B_ABERTO = false`.

Mudança (`tools/build-sw.ts`): enquanto `MAPA_B_ABERTO = false`, os bakes de B*, PP* e X-EA vão para "por
demanda"; quando a chave virar `true`, voltam ao resto e a atualização com o jogo aberto os baixa antes de
oferecer o recarregamento. Pelagens raras continuam no pré-cache (aparecem de surpresa numa batalha, sem rede
não dá para buscar), mas descem para o fim da fila do download. DEPOIS: núcleo 317 arq. 2,7 MB + resto
**7 623 arq. 26,8 MB** · por demanda 7 713 arq. 12,0 MB. Primeiro download do iPhone: −47 % de arquivos,
−28 % de bytes.

Verificador: `integridade` passa a conferir se o bake está velho (tamanho, capim alto e obstáculos c/p/r do
`zona.json` contra o `mapaChars` atual): 0 de 193 zonas com bake velho. Nenhuma zona sem bake em public/.
`docs/JOGAR.md` atualizado (tamanho do pacote, `--mapa-b`).
