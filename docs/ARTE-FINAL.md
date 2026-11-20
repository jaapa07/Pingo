# ARTE-FINAL.md — diário da arte final das criaturas

Tarefa: auditar as 182 criaturas (180 + 2 visitantes) e retocar as ~30 mais fracas. Arquivos meus: `tools/models/criaturas/<nnn>-*.ts` que eu retocar + PNG/meta gerados. Não mexo em kits/, tools/render/, src/**.

## Marco 1 — auditoria (20/11)
- Folhas: `docs/capturas/todas-frente.png` (frente, idle q0, 3×, célula desenhada) e `docs/capturas/todas-mapa.png` (mapa idle-s, 4×).
- Cópia de segurança dos sprites de antes: scratchpad da sessão (`antes/criatura`).
- `checar.ts` em todas: 37 avisos (repouso < 68% em ~28; olho grande demais em noitim 6,1 px, noitao 6,3 px, urutau-fantasma 4,5 px).

### Lista priorizada (mais fracas primeiro)
1. 035 caranguejim / 036 guaiamuque — massa baixa e confusa; patas roxas viram franja; não lê caranguejo.
2. 171 noitim / 172 noitao — bolota cinza, olho grande demais, não lê macaco-da-noite.
3. 169 urutauzim / 170 urutau-fantasma — toco marrom chapado, asas como manchas.
4. 167 andorim / 168 andorinhão — preto chapado, asas tortas, pedestal confuso.
5. 129 sirizim / 130 siri-couraça — baixo e chato; casco verde/azul sem leitura de siri.
6. 145 escorpim / 146 escorpião-rei — fino (escorpim) e caótico (rei).
7. 149 jataí / 150 jataí-rainha — bolota com manchas; rainha sem leitura.
8. 153 cigarrim / 154 cigarrão — cigarra achatada; cigarrão com asas soltas.
9. 155 lavadeirim / 156 lavadeira-dragão — pequena na célula / confusa.
10. 101 ema-mirim / 102 emaçu — filhote minúsculo e fino.
11. 105 tuiuiuzim — minúsculo, fino.
12. 109 harpinha / 110 harpia — bolota branca sem rapina / penacho embolado.
13. 141 grilinho / 142 grilão-elétrico — chato, marrom.
14. 143 besourim — chato e escuro.
15. 165 mocozim — cinza chapado.
16. 119 hipocampim / 120 hipocampo.
17. 182 borealce — pequeno na célula.
18. 181 galo-manaó — divisão das cores (rio Negro × Solimões) não lê.
19. 028 vagalumim / 029 vagalampo — pequeno, peças soltas.
20. 077 manatim — pequeno, sem leitura de peixe-boi.
21. 055 urubuzim — branco demais para urubu.
22. 061 preguicim — pálido, sem contraste.
23. 027 pintinhas — pequena, confusa.
24. 147 caranguejeirinha / 148 caranguejeirão.
25. 079 tartaruí — chata.
26. 018 formigaço — pequeno na célula (58%).
27. 115 poraquim — pequeno.
28. 093 graxaim — pequeno, escuro.
29. 015 lagartim — pequeno.
30. 107 garcinha — pequena.

## Marco 2 — retoques em andamento (20/11)
Ferramentas no scratchpad: folha de contato (`folha.py`), antes/depois por id (`ver.py`), checagem de borda (`borda.py`).
- 035 caranguejim: câmera de batalha quase de frente (yaw −34 por animação, permitido no contrato), pinças roxas erguidas
  dos lados em "punho" (antes laranja sobre laranja), pedúnculos mais altos, desmaio que não abre as pinças → ocupa 75% da célula (era 64%).
- 036 guaiamuque: mesma câmera; garra gigante de PEDRA (cinza, contrasta com o azul) do lado de lá, rosto e olhos à mostra.
- 171 noitim / 172 noitão: cabeça virada para a câmera na batalha (`cabecaRetaNoMapa` desfaz no mapa), os dois olhões
  aparecem; barriga laranja grande no peito; sobrancelhas brancas.
- 169 urutauzim / 170 urutau-fantasma: cabeça para a câmera (dois olhos de pires), riscas de casca e líquen, plumagem mais clara que o toco.
- 167 andorim (e a paleta do 168): asas-foice varridas para trás (antes pareciam orelhas), fuligem mais clara com volume, sobrancelha e queixo brancos.
- 150 jataí-rainha: coroa de cera ROSA de três pontas (branca sumia nas asas; mel sumia no corpo), cinta rosa limpa no lugar dos babados.
- 154 cigarrão: ondas sonoras laranja e mais grossas (brancas pareciam costelas da asa).
- 101 ema-mirim / 105 tuiuiuzim: proporção de filhote (corpo e cabeça maiores, pernas e pescoço mais curtos, olho maior): antes eram fiapos na célula.
- 109 harpinha: bico maior e mais curvo, sobrancelha escura franzida, penacho maior. 110 harpia: barriga branca grande sob o colar negro.
- 181 galo-manaó: o corte das duas águas virou um plano vertical que contém as câmeras de batalha (fase da calota girada 50°) e a asa da frente
  ficou escura: na batalha o corpo lê metade areia / metade rio Negro, lado a lado.
- 182 borealce: chifrada do ataque físico mais curta (o zoom manual cortava a galhada; o tamanho é limitado pela própria galhada — fica assim).
- 165 mocozim (e paleta do 166): cinza puxado ao pardo, garupa ruiva descendo pelos flancos, bochechas maiores.
- 029 vagalampo: lampião sem aros (os aros escuros listravam como abelha), faíscas mais largas e perto do corpo (+3 pts de célula).
- 155 lavadeirim (e 156 pela animação compartilhada `voaLib`): bater de asas do especial/físico mais curto; 156 com enquadre de costas 0.96.
- 027 pintinhas: abdômen vermelho — a fresta entre os élitros deixou de ser uma risca escura; lê como cúpula de joaninha.
- 148 caranguejeirão: patas mais finas e articuladas; enquadre 0.92/0.94 para nenhum quadro encostar na borda.
- 146 escorpião-rei: cauda um pouco desenrolada para cima (pouca diferença). 145 escorpim: testei cauda erguida, piorou (enrolava sobre o corpo) — revertido.

## Marco 3 — fechamento (20/11)
- 25 sprites mudaram (lista no aviso em docs/CAPTURA-CRIACAO.md). `npx tsc --noEmit` limpo; `checar.ts` nos retocados: só restam
  olho grande em noitim/noitão (6 px, é o traço "olhos de coruja"), urutau-fantasma (4,6 px), e repouso < 68% em vagalampo (64%),
  tuiuiuzim costas (66%), lavadeirim costas (59%). Nenhum quadro novo encosta na borda (cigarrão físico#1 e escorpião-rei desmaio#3 já encostavam antes).
- Atlas: 252 entradas, as 182 criaturas presentes, meta dos retocados coerente.
- Folhas: docs/capturas/todas-frente.png, docs/capturas/todas-mapa.png (finais) e docs/capturas/retoques-2.png (antes rosado × depois verde: frente, costas, mapa).

### Continua fraco (pendências honestas)
- 036 guaiamuque e 146 escorpião-rei: melhoraram pouco; pedem remodelagem da pose (garra/cauda) com mais tempo.
- 148 caranguejeirão: ainda embolado (tufos salmão + perna erguida que parece chifre).
- 129 sirizim / 130 siri-couraça, 141 grilinho, 143 besourim, 153 cigarrim: legíveis, mas chatos e baixos — não mexidos.
- 119/120 hipocampo, 055 urubuzim (filhote de urubu é branco mesmo), 061 preguicim: revistos, aceitáveis — não mexidos.
- Pequenos na célula por animação larga (desmaio/ataque do kit): 015 lagartim, 018 formigaço, 028 vagalumim, 093 graxaim, 115 poraquim, 107 garcinha — não mexidos.

## 2ª rodada — Marco 1: pessoas novas (20/11)
Arquivo novo `tools/models/pessoas/sertao.ts` (registrado em `pessoas/index.ts`), mesmo esquema da Liga: ficha do kit + peças
esculpidas. Todas com `mapa`, `batalha` (idle/derrota) e `retrato` (neutro/feliz/bravo). Folha: `docs/capturas/pessoas-novas.png`.
- `guardiao-tibirica`: cocar alto de penas de gavião (pardas e creme, pontas escuras), faixa de urucum, túnica creme com listra,
  faixa trançada a tiracolo, braçadeiras, cajado de madeira com cabaça e penas. Sem pintura de "guerra", sem caricatura.
- `andarilho-cume`: chapéu de aba larga, poncho de lã azul-noite até o quadril com listras e franja, cavanhaque grisalho, cajado
  com tira de pano, trouxa nas costas. (Testei cachecol alto e barba cheia: lia como máscara de bandido — trocado.)
- `guarda-nevoa`: chapéu de feltro escuro com fita laranja, cachecol laranja (visível na cerração), pala de lã, cajado ferrado
  com lampião pendurado, fiapos de névoa nos pés (somem no mapa).
- `guardia-floresta`: manto verde-escuro nas costas e leques de folhas novas nos ombros, folhas e flor no cabelo, pinturas de
  jenipapo nos braços, lança de taquara com gomos e ponta de folha.
- `dra-solveig`: parka azul-petróleo (a 1ª versão vermelha com gola branca lia como Papai Noel — trocada), gorro de tricô
  vermelho, cachecol vermelho, trança loira, caderno vermelho com lápis, luvas e botas de pelo.
- `pesquisador-boreal` (os quatro da expedição): parka azul com capuz levantado e borda de pelo, faixa refletiva verde-aurora,
  mochila, lanterna boreal acesa na mão (a lanterna que cada um guarda na missão).
- `seu-taruma`: idoso, chapéu de palha, camisa clara, calça arregaçada, descalço, bigode grisalho, remo de pá larga, paneiro nas costas.
Trocas de `sprite` (só esse campo; nos diálogos dos visitantes e do Andarilho, também o `retrato`): PP.ts (portão e NPC do Tibiriçá,
NPC do Andarilho), treinadores/b2-norte.ts (`PP-andarilho`), B-R5.ts (portão e NPC da Guarda), B8.ts (portão e NPC da Guardiã),
eventos/visitantes.ts (Tarumã, Solveig, 4 pesquisadores, consts de retrato), X-EA.ts (Tarumã na volta), treinadores/visitantes.ts
(B-EXP-1..4), eventos/b2-norte.ts (`ANDARILHO` ganhou retrato). Não troquei: "Guarda da Serra Minuano" (B7) e a Guardiã-Mirim
Jurema (B-FA), que são outros personagens.

## 2ª rodada — Marco 2: pose nova das três que não resolveram (20/11)
Cópia dos sprites de antes desta rodada: scratchpad da sessão (`antes3/criatura`). Pelagem rara regenerada (`build-raras.ts <ids>`).
- 036 guaiamuque: a garra gigante deixou de ficar erguida na vertical (de perfil para a câmera, lia como um chifre/triângulo
  creme). Agora o braço sai para o LADO do lado de lá e a tenaz fica de perfil para a câmera quase frontal: dedo azul em cima,
  dedo creme embaixo, abertos em "C" à esquerda do corpo — lê como pinça, e o rosto com os dois olhos em pedúnculo fica livre.
  Palma de pedra maior. Custo: o bicho ficou baixo e largo (repouso 64×31 na célula 80); o quadro 1 da `entrada` (do kit) ainda ergue a garra.
- 146 escorpião-rei: câmera quase frontal (yaw −30, como os caranguejos), cabeça de ferro recuada e menor, coroa baixa e
  ATRÁS dos olhos, pinças abertas e baixas ao lado do rosto. A cauda estava girada para o lado errado (enrolava mais):
  desenrolada nos gomos 4–5 — o sino de ferro com a gota verde aparece acima do lombo no repouso. Olhos (âmbar) agora à
  mostra no meio do rosto, ainda pequenos (4 px).
- 148 caranguejeirão: o primeiro par de patas sobe para FORA e dobra para a frente em arco ao lado da cabeça (antes subia reto
  e lia como chifre); seis tufos salmão soltos (pareciam bolhas) viraram uma mancha salmão limpa no alto do abdômen + um só
  topete (traço do filhote) + franja castanho-clara. Rosto, olhos verdes e presas pingando ficam à mostra.
- 079 tartaruí: casco mais abaulado e cabeça erguida em pescoço mais longo (de olho na arrebentação): 52×21 → 52×29 px.
- 018 formigaço: no desmaio a folha deitava para a frente e alargava o quadro (o sprite inteiro encolhia, 67%); agora tomba
  pouco para trás — repouso passou de 43×41 para 45×43 e o aviso do `checar.ts` sumiu.

## 2ª rodada — Marco 3: fechamento (20/11)
- Folhas: `docs/capturas/pessoas-novas.png` (por pessoa: batalha idle e derrota, retrato neutro/feliz/bravo, mapa s/l/n/o, 4×)
  e `docs/capturas/retoques-3.png` (antes rosado × depois verde: frente, costas, mapa).
- Atlas: 259 entradas (todas as pastas de sprites, 183 criaturas, as 7 pessoas novas com retrato). `tsc` limpo; no `verify.ts`
  a integridade de sprites passa (as falhas atuais são de outros agentes: `cartel-lago` em captura.ts e caminhos absolutos em
  tools/testes/qa3).
### Continua fraco (pendências honestas)
- 036 guaiamuque: a pinça lê, mas o bicho ficou baixo e largo na célula (64×31 de 80); o 1º quadro da `entrada` ainda ergue a garra.
- 146 escorpião-rei: rosto à mostra, mas os olhos são pequenos (4 px) e a coroa vira uma mancha amarela, sem as três pontas.
- 148 caranguejeirão: a mancha salmão do abdômen sai clara demais (quase creme) na luz de cima.
- Sem retoque nesta rodada: 107 garcinha, 149 jataí, 119 hipocampim (revistos, aceitáveis) e 142 grilão-elétrico (costas 65% por
  causa do especial).
- Pessoas: guardiã da floresta tem retrato escuro (pele castanha + cabelo azeviche + folhas escuras); guarda da névoa é
  correto mas genérico; os quatro pesquisadores dividem um sprite só (duas mulheres e dois homens no texto) — o capuz deixa neutro.
