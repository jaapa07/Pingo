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
- (20/11) DECISÃO DO AUTOR (substitui a correção "dorme e volta" acima, que foi DESFEITA): cada lendário aparece UMA vez. Derrotado sem captura → some para sempre, com fala curta; fuga (ou derrota do jogador) → continua lá; capturado → não volta.
  Aplicado: Boitatá (b1.ts), Uirapuru e Mapinguari (b2-norte.ts; Jubartão não é lendário, segue 1×/dia), Boiúna e Gavião-Tupã (a2.ts: `a2-lenda-vencida` para a fala), errantes Queixada/Lobo-Jaci/Onça-Guaraci (src/world/encontros.ts: aviso "…fugiu ferida e não foi mais vista" ao vencer; `errante:<n>`='fim' já existia), Galo-Manaó (`galo-manao-sumiu`; src/world/mecanicas/x-ea.ts `galoDisponivel` lê as flags em vez de "não possui") e Borealce (`borealce-sumiu`; aurora e Drª Solveig com falas novas) em visitantes.ts, Mandizinho raro do lago (captura.ts). Spec 6.4/6.5 e HISTORIA.md atualizados.
  Jogado (`lendarios.mjs`): Boitatá fuga → continua; vencido → fala e some, não volta dias depois com o Conselho vencido; Mapinguari vencido não volta; Uirapuru capturado some do totem; Boiúna vencida some; Queixada fugiu → continua vagando; Galo vencido → `galo-manao-sumiu` e não é desenhado na X-EA; Borealce fuga → continua, vencido → não volta à aurora; Mandizinho vencido → fala e `lago-raro-ok`. Sem erros de console.
  Não coberto no navegador: vencer um errante (ele foge no 1º turno; só a fala nova no código), Gavião-Tupã (mesmo comando da Boiúna).
- (20/11) Saveiro A5 ↔ B9 (`extra.mjs`): sem bilhete recusa; com bilhete chega a B9 (10,24) e volta a A5 (30,34). Banca de cuias: quarta 2 itens, quinta 6.
- (20/11) Noite em B7: a captura preta do chimarrão era só o crossfade de período no meio (relógio virtual); aberta de noite a cena está certa.
- FINAL: tsc limpo, 37 testes, verificadores B1/B2-sul/B2-norte 0 erros. Vite parado.

## Não corrigido (fora do meu escopo)
- `src/data/treinadores/b2-sul.ts` B5-mare/B5-mare-2: `nome: 'Contramestra Maré'` com `classe: 'Contramestra'` → aviso "Contramestra Contramestra Maré deixou o número no seu Rádio Cipó!". E a fala de derrota de B5-mare manda voltar "quando o Mestre Gingado já tiver te batizado" (insígnia 12), mas o evento exige a insígnia 14 (Floco).
- Ninhos Raros da B-FA (pós-jogo, 65–75): fora da manhã dão a forma do meio no nível 34 (b2-norte.ts `ninho`, nível fixo) — fora da curva; decisão de equilíbrio.
