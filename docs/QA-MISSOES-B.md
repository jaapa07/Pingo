# QA-MISSOES-B.md — diário do QA das missões paralelas e eventos secundários do mapa B

## Como roda
- Vite próprio na porta 5207 (`--strictPort`, sem HMR/vigia; `MAPA_B_ABERTO` ligado só nele por plugin em memória):
  `tools/testes/qa-missoes-b/run.sh <roteiro.mjs> [segundos]` (`run.sh parar` desliga). Reinicie o Vite depois de editar o jogo.
- Apoio: `tools/testes/qa-missoes-b/lib.mjs` (cópia do `qa3-lib.mjs` + saves montados com `montar()`, equipe forte,
  hora/dia do relógio do jogo, leitura das falas novas). Usa o piloto `tools/testes/qa3/qa3-piloto.js` (joga pelo teclado).
- Capturas em scratchpad/qamb/.

## Marcos
- (20/11) leitura dos diários B1, B2-sul, B2-norte, MOTOR, HISTORIA e eventos b1/b2-sul/b2-norte; infraestrutura montada.
- (20/11) B1 jogado (roteiro `b1.mjs`): carta, ninho (dia seguinte), órfãos, 5 fotos, São João (sábado; erro e acerto), troca, pepitas, doce, raízes, forja — todos dão a recompensa e marcam as flags; repetir é recusado.
  Corrigido: fala do violeiro ("Bem-te-viço está na sua mochila" × "desce do seu ombro") e da raizeira (Dona Buriti "lutava aqui" → antes de abrir o ginásio na Vila Buriti).
- (20/11) Órfãos (`orfaos.mjs`): um por dia confere; `b1-orfao-crescer` leva o filhote a média−4 (teto 60) com golpes do nível novo e `localCaptura` do Centro.
- (20/11) ANDARILHO DO CUME (`andarilho.mjs`): CAUSA achada. `pp-misterioso` terminava com `['esconder', 'pp-misterioso']`, que grava `oculto:PP:pp-misterioso` para sempre; na 2ª vitória no Conselho `misterioso-pode` volta a true mas o NPC continua oculto. Corrigido em b2-norte.ts (some pela condição; `mostrar` limpa o oculto).
- (20/11) B2-sul jogado (`b2sul.mjs`): alunos, Dendê, banca de quinta, Roda de Sábado (revanche só no sábado; 2ª no mesmo sábado recusada; sábado seguinte volta), Dona Rã (ovo de Pererequinha), carta B6↔B7, troca Azulina, pinhões, payada (erro → volta amanhã; acerto → prenda; repetição → Cuia de Ouro), chimarrão (causo só de noite). Corrigido: fala duplicada no início da Roda de Sábado.
- (20/11) B2-norte jogado (`b2norte.mjs`): carta do Lume, constelações (só de noite), escrivã, troca do pastor, neve 20/11 (1×/ano), Jubartão (1×/dia), 3 ninhos (forma certa por período; 1 visita/dia).
- (20/11) LENDÁRIOS QUE NÃO VOLTAVAM: spec 6.4 ("se o jogador soltar ou perder um lendário, ele reaparece no mesmo lugar depois do Conselho") e as próprias falas ("dorme até o Conselho cair", "volta ao mirante depois do Conselho", "volta quando a lua troca") não tinham efeito: Boitatá, Uirapuru e Mapinguari vencidos sumiam para sempre (flag `-ok` + `esconder`). Corrigido em b1.ts e b2-norte.ts: a derrota grava o dia em `boitata-dormiu`/`uirapuru-dormiu`/`mapinguari-dormiu`; ao entrar na zona com `conselho-vencido` e a partir do dia seguinte, o lendário volta (limpa `-ok`, `-dormiu` e o oculto). Jogado (`lendarios.mjs`): Boitatá vencido antes do Conselho dorme e volta depois; Mapinguari não volta no mesmo dia e volta no seguinte; Uirapuru idem; capturado não volta.
- (20/11) Escrivã: "Bandeirão: encontrada…" (gênero) → "registro em …". Boitatá: "Insígnia do Cristal" → "Insígnia Cristal" (nome da insígnia 10).
