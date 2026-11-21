# UI-CORRECOES.md — diário das correções de interface apontadas pelos QAs (20–21/11)

Vite próprio em 5212 (sem HMR, config no scratchpad), roteiros Playwright no scratchpad: PC 1280×720 e iPhone 13
emulado em pé e deitado, por toque. App de PC testado com o Electron do node_modules rodando `plataformas/desktop/main.cjs`
sobre um `dist/` construído à parte (no scratchpad; o `dist/` do projeto não foi tocado).

## 0. (prioridade) Salvar e levar o save de um aparelho para outro

### O que foi testado de ponta a ponta
- **Salvar pelo menu → recarregar → Continuar** (PC, iPhone em pé e deitado): zona, posição no mapa, equipe, mochila,
  dinheiro, insígnias, flags, Diário, viveiro e relógio voltam idênticos (comparação do save inteiro, menos o tempo de
  jogo e o estado do sorteio, que mudam sozinhos). O tempo de jogo continua do valor salvo. `pingo.slot.N` e
  `pingo.slot.N.bak` gravados (localStorage + espelho IndexedDB).
- **Ponto de retomada**: ir para segundo plano (`visibilitychange`) e fechar/recarregar a página (`pagehide`) grava a
  retomada; o menu do jogo passa a oferecer "Retomar de onde parou", que devolve o momento exato; ela some depois de usada.
- **Save corrompido**: slot principal adulterado → abre pela cópia `.bak`. Principal e cópia ilegíveis → antes o
  cartão dizia "— vazio —" (e "Novo jogo" apagava o resto sem aviso).
- **Transferência** nos 4 sentidos, com comparação do save inteiro no destino:
  web PC → web iPhone, iPhone → PC, iPhone deitado → PC, PC → iPhone deitado; web → app de PC e app de PC → web iPhone.
  Por "Copiar código"/"Colar código", "Exportar arquivo .pingo"/"Importar arquivo .pingo" e "Mostrar código QR"
  (19 códigos para um save de ~6,8 mil letras; confirma "mostrar mesmo assim?").
- **Códigos ruins**: com espaços, quebras de linha (\n e \r\n), caracteres invisíveis, aspas, texto em volta e como
  link `#pingo=`; truncado (no fim e no começo), adulterado, soma trocada, `PINGO2`, lixo e vazio.

### Defeitos achados e corrigidos
1. **"Colar código" nunca funcionava no app de PC**: o Electron nega `clipboard-read` (`setPermissionRequestHandler`
   só libera tela cheia e escrita), então `navigator.clipboard.readText()` falhava sempre ("Read permission denied") e o
   jogo mandava usar o arquivo. Correção: a ponte `pingoDesktop` ganhou `copiar`/`colar` pelo processo principal
   (`clipboard` do Electron, só texto, até 4 MB) — `main.cjs`, `preload.cjs`, `PonteDesktop` em `src/core/plataforma.ts`.
2. **Sem área de transferência não havia como colar** (iPhone que nega a leitura, Safari/Firefox sem `readText`,
   WKWebView): o jogo só dizia "Não consegui ler a área de transferência". Correção: `campoCodigo('colar')` em
   `src/ui/telas/saves.ts` — quadro com um campo de texto de verdade (do sistema, texto invisível; o estado aparece na
   fonte do jogo): tocar e segurar → Colar no menu do iOS (ou Ctrl+V), botão "Colar" (novo gesto, nova chance de ler a
   área de transferência), "Usar código" (só aceita código completo, com a mensagem do problema) e "Voltar".
   O palco barrava `contextmenu`/`selectstart` no documento inteiro e o CSS tirava seleção e o menu de toque:
   o campo `textarea` ficou de fora (src/ui/palco.ts, `.campo-codigo` em src/styles/kit.css). `inputmode="none"` no
   toque: abre só o menu de colar, sem teclado virtual.
3. **"Copiar código" negado** (Safari sem gesto recente, http local): agora tenta `navigator.clipboard`, depois o
   `execCommand('copy')` e, se o aparelho negar, abre `campoCodigo('copiar')` com o código selecionado para Copiar à mão
   e um botão "Copiar" (gesto novo).
4. **Código colado com quebras/espaços era recusado** ("não é um arquivo"): `lerExportado` (src/core/save.ts) agora
   descarta espaços, quebras, invisíveis, aspas e texto em volta (inclusive "Abraço!" numa linha depois do código:
   tenta cortar nas quebras até a soma conferir). Mensagens novas: incompleto/alterado ("copie o código inteiro de
   novo"), versão mais nova ("atualize o jogo neste aparelho") e "não é um código". Nenhum caso ruim mexe nos saves.
5. **Save danificado aparecia como vazio**: `slotDanificado(i)`; o cartão mostra "— danificado — Este jogo não pôde
   ser lido." e "Novo jogo" ali pede confirmação.
6. Achado no caminho: o campo de colar no PC prendia a tecla que o abriu (o `keyup` ia para o campo) e o próximo A
   não respondia; o campo agora deixa o soltar chegar ao jogo.

Testes novos: `tools/verify/save.ts` (`npm run test:save`, e dentro de `npm test`): gravar/carregar com `.bak`, corrompido,
danificado, retomada, código limpo/sujo (7 formas), 8 códigos ruins sem mexer nos saves, save de versão nova, importar
por cima guardando `.bak`.

### O que não deu para testar aqui
- iPhone de verdade (Safari/WKWebView): não há WebKit neste contêiner; o menu "Colar" do iOS foi simulado inserindo o
  texto no campo depois do toque. No aparelho, conferir: tocar e segurar o quadro mostra "Colar"; "Copiar código" sem
  permissão abre o quadro com o código.
- O `.pingo` no app de PC foi testado com os diálogos do sistema substituídos (o caminho do arquivo vem do teste).

## 1. Menu de um jogo salvo abria com o cursor na 3ª opção
- **Causa**: o ponteiro do mouse parado no meio da janela. A janela de opções surge centralizada debaixo dele e o
  Chromium dispara `pointerenter` (e `pointermove` sintético) ao refazer o layout; `tocavel` tratava isso como
  "apontar" e movia o cursor para o item sob o mouse ("Exportar arquivo .pingo" com o mouse no centro de 1280×720).
  Não era índice herdado nem repetição da tecla A: sem mouse sobre a janela o cursor já abria na 1ª opção.
- **Correção** (`tocavel` em src/core/input.ts, vale para todas as listas): o foco pelo mouse só acontece em
  `pointermove` com movimento real (`movementX/Y` ≠ 0).
- **Testado**: PC com o mouse parado no centro, com e sem retomada, duas vezes seguidas e depois de voltar ao título →
  sempre a 1ª opção; mover o mouse sobre um item ainda o aponta; iPhone por toque → 1ª opção.

## 2. Alvos de toque do menu principal
- Faixas invisíveis `.alvo-menu` (src/ui/telas/menu.ts) por item: a altura inteira do passo da lista (16 px, a 1ª e a
  última até as bordas da moldura) e da margem 32 px à esquerda da moldura até a borda da tela. Visual igual.
- **Testado**: iPhone em pé 153×19 CSS px por item (antes 71×16), deitado 218×27 (antes 102×23), PC 524×64; sem
  sobreposição (na divisa entre duas faixas o ponto pega uma só); tocar à esquerda do texto de "Mochila" abre a mochila.

## 3. "Eficaz" encostado na borda de baixo do painel do golpe
- `fichaGolpe` (src/battle/view/menus.ts): ficha 2 px mais alta e linhas a 13/22/31 → a linha de eficácia termina 3 px
  acima da borda (antes terminava em cima da sombra de baixo, na linha 43 de 43). A ficha de aprender golpe (mesma
  função) também deixou de encostar na descrição.
- **Testado** com "Eficaz", "Super eficaz!", "Pouco eficaz", "Eficácia: ?" e categoria longa "Especial · 120", PC e
  iPhone em pé/deitado.

## 4. Aviso "Atualização disponível" cobria o relógio no iPhone em pé
- `posicionarAviso` (src/core/offline.ts): continua no alto, centralizado; se ali cruzar o relógio do HUD, desce para
  logo abaixo da tela do jogo (espaço livre acima dos controles de toque); sem espaço, encosta à esquerda do relógio.
  Reposiciona a cada segundo e ao girar/redimensionar. `mostrarAvisoAtualizacao` exportado para os testes.
- **Testado**: em pé o aviso foi para 227–255 px (abaixo da tela do jogo; relógio em 11–30), sem cobrir controles;
  deitado e PC continuam no alto, sem cruzar o relógio.

## 5. Varredura por toque (iPhone em pé e deitado)
Telas: título, saves (lista, menu de um jogo, menu de jogo vazio), mapa, menu, Diário, Equipe, Mochila, Rádio,
mapa-múndi e batalha (ações e golpes), abertas por toque. Para cada uma: alvos tocáveis medidos em px CSS, pares de alvos
que se cobrem e textos que saem da moldura ou da tela (capturas e relatório no scratchpad).
- **Textos cortados/sobrepostos**: nenhum encontrado nas telas acima (além do item 3).
- **Alvos que se cobrem**: nenhum.
- **Folga sem toque entre itens de lista**: os itens das listas (`Lista`) tinham 2 px sem resposta entre um e outro
  (tocar ali não fazia nada). `.lista-item::after` (src/styles/kit.css) cobre a folga de cima: as linhas ficam contíguas,
  sem sobreposição. Testado: tocar na folga acima de "Mostrar código QR" escolhe esse item.
- **Mapa-múndi**: marcadores com alvo fixo de 12×12 (14×14 CSS px em pé). Agora cada alvo cresce até 20×20 onde os
  vizinhos deixam (metade da distância ao mais próximo), sem cobrir outro: 12 deles passaram a 16–20 px; os 36 mais
  juntos continuam em 12 (os vizinhos estão a 12 px).
- **Ainda pequenos em pé (limite do passo da lista, não dá para crescer sem mudar o visual)**: listas de fonte 8 com
  passo de 12 px — janelas de confirmação/escolha, Diário, Mochila — ficam com 14 CSS px de altura por linha no iPhone
  em pé (largura de 137 a 177 px). Deitado, tudo passa de 20 px. Se for preciso mais, o caminho é uma escala maior em
  pé para essas janelas, decisão de visual.
- Observado e deixado como está: os avisos fora do palco (`#aviso-atualizacao`, `#aviso-offline` em src/core/offline.ts)
  usam fonte do sistema (monoespaçada); o de baixo fica por cima da área dos controles de toque no iPhone em pé, mas não
  recebe toques (`pointer-events: none`) e some sozinho.

## Fechamento
`npx tsc --noEmit` limpo; `npm test` 38 + 7 (save) passando. Vite 5212 encerrado. Nada enviado (sem commit/push).
Arquivos: src/core/input.ts, src/core/save.ts, src/core/plataforma.ts, src/core/offline.ts, src/ui/palco.ts,
src/ui/telas/saves.ts, src/ui/telas/menu.ts, src/ui/telas/mapa-mundi.ts, src/battle/view/menus.ts, src/styles/kit.css,
plataformas/desktop/main.cjs, plataformas/desktop/preload.cjs, tools/verify/save.ts (novo), package.json (`test`,
`test:save`). O app de PC empacotado (`plataformas/desktop/out/`) precisa ser refeito (`npm run desktop`) para levar a
ponte nova de copiar/colar.

## Feedback de jogador (21/11) — demo no celular

Testado com Vite próprio (5233) e, para comparar, o código anterior (82bfdd3f) em outra porta; roteiros Playwright no
scratchpad e `tools/testes/feedback/itch-lab.mts` (pacote do itch). iPhone 13 emulado em pé e deitado por toque e PC
1280×720. Rede lenta simulada pelo CDP: 400 ms de latência e 40 KB/s (≈ "3G lento").

### 1. A criatura demorava a aparecer no quadro da escolha do inicial
- **Causa**: o sprite só era pedido quando o quadro abria (`['vitrine', n]`, src/data/eventos/comuns.ts). No site, o
  quadro ficava vazio até o `frente.png` chegar (1,2 s medidos com a rede lenta); no pacote do itch.io é pior: cada
  criatura vem num `pacotes/criaturas-NN.bin` com mais 3 criaturas (~400 KB), e os três iniciais caíam em 3 pacotes
  diferentes (~1,2 MB para ver as três).
- **Correção**:
  - `src/world/precarga.ts` (novo): ao entrar em qualquer zona, enquanto o jogador não tem inicial, pede `frente` e
    `costas` dos três iniciais (desde o quarto, minutos antes de chegar ao laboratório); sempre pede a `costas` do
    avatar e da equipe e, 1,2 s depois de a zona assentar, a `frente` das 6 criaturas mais comuns da grama/caverna/água
    dela, a arena e a folha de efeitos.
  - O quadro (`vitrine`) espera a imagem (no máximo 4 s) antes de abrir: aparece junto com a criatura.
  - Pacote do itch (`tools/build-pacote.ts`): os três iniciais (sem a Pelagem Rara) num pacote só deles,
    `criaturas-iniciais.bin` (165 KB).
  - Batalha: a abertura espera só as vistas que mostra (adversário de frente, equipe de costas) e também a `costas` do
    treinador e a pose do treinador inimigo, que antes surgiam depois (`precarregarCriatura(…, vistas)` em palco.ts).
  - Diário: ao mover o cursor, as 3 vizinhas já vistas de cada lado começam a baixar.
- **Medido** (rede lenta): mesa da Profª Ipê — site: quadro sem imagem 1174 ms antes → 0 ms (PC, iPhone em pé e
  deitado); pacote do itch, chegando da rua 10 s depois de continuar: 0 ms (em pé, deitado e PC); entrando direto, o
  quadro espera o pacote dos iniciais e abre já com a criatura (2,4 s depois do toque, 0 ms sem imagem).
  1º encontro selvagem na Trilha (8 s depois de entrar): até as criaturas na tela 5,6 s antes → 1,3 s (o que sobra é o
  carregamento do módulo no servidor de desenvolvimento). Diário: ao abrir em 001, já pede 002, 003 e as vizinhas vistas.
  `tools/testes/demo/itch.mts demo` continua passando.

### 2. A Cuia aparecia em cima do protagonista no começo da batalha
- **Causa** (src/battle/view/tela.ts, `entrar`): o treinador ficava parado exatamente no lugar da criatura
  (`apoios.jogador.x`) e a cuia saía de `t.x + 12, t.y − 40` (a cabeça dele, 0,22 s depois de começar o gesto) e caía de
  volta em `a.x`, o mesmo x do treinador: voava por cima da cabeça e o clarão e a criatura surgiam sobre ele, que só saía
  de cena depois.
- **Correção**: o treinador do jogador fica 36 px atrás (à esquerda) do lugar da criatura (`xTreinador`); a cuia sai da
  mão no quadro em que o braço solta (0,28 s, `t.x + 16, t.y − 30`), voa para a frente até o lugar da criatura e o
  treinador desliza para fora enquanto ela voa (nas duplas ele fica para o 2º arremesso e sai depois). O arremesso de
  captura não mudou.
- **Testado**: sequência de quadros com o tempo 3× mais lento (PC e iPhone): a cuia nasce na mão, à frente do corpo, e
  a criatura aparece no lugar vazio.

### 3. Menu de golpes sem saída visível
- **Causa**: só o B (tecla ou botão de toque) voltava; nada na tela dizia isso no menu de golpes, na escolha de alvo,
  no menu de ações da 2ª criatura das duplas e em "Recuperar PG / Qual golpe esquecer?". Nos menus do mapa, a dica
  "B: voltar" do rodapé não era tocável.
- **Correção**: `botaoVoltar` (src/ui/componentes/voltar.ts): botão do kit "◀ Voltar" com alvo de toque invisível maior.
  - Batalha (src/battle/view/menus.ts, classe `bt-voltar`): golpes e escolha de alvo (canto esquerdo, logo acima do
    painel), ações da 2ª criatura nas duplas (volta à 1ª), golpe de (PG/esquecer), Equipe (no lugar do "Voltar" antigo)
    e Mochila (no lugar de "Sair"; a janela ficou 48 px mais larga para o botão não cobrir as abas dos bolsos).
    A ficha do golpe fica dentro do menu de golpes. Sim/Não já tinham "Não".
  - Mapa (`faixaDica`, src/ui/telas/comum.ts): o trecho "B: voltar" (ou desligar, sair, cancelar, desistir…) do rodapé
    vira um botão "◀ Voltar" tocável na ponta direita, que vale um aperto de B. Vale para Diário (lista e ficha),
    Equipe, Resumo, Mochila, Rádio Cipó ("◀ Desligar"), mapa-múndi, Estojo de insígnias, Cartão de treinador, PC do
    quarto, Viveiro, loja, câmera e as janelas de escolha. O menu de pausa já tinha "Sair" e o toque fora dele; Opções,
    "Voltar" na lista.
- **Alvos de toque** (px CSS): golpes/alvo/ações 69×26 em pé, 93×31 deitado; rodapé do mapa 64×21 em pé (a faixa fica
  na borda de baixo da tela do jogo; o alvo sobe 5 px sem cobrir as medalhas do Diário), 92×30 deitado, 220×72 no PC.
- **Testado** por toque (iPhone em pé e deitado) e mouse (PC): golpes → ◀ Voltar → ações; Mochila e Equipe → ◀ Voltar;
  duplas: alvo → ◀ Voltar, 2ª criatura → ◀ Voltar volta à 1ª, Garapa → Recuperar PG → ◀ Voltar; Diário, Equipe,
  Mochila, Rádio, mapa-múndi, Estojo e Cartão fechados pelo botão do rodapé. Teclado (B) segue igual.

`npx tsc --noEmit` limpo; `npm test` 38 + 7; `npm run check -- --rapido` 16/16. Arquivos: src/world/precarga.ts (novo),
src/world/index.ts, src/data/eventos/comuns.ts, src/ui/telas/diario.ts, src/ui/telas/comum.ts, src/ui/componentes/voltar.ts
(novo), src/battle/view/tela.ts, src/battle/view/menus.ts, src/battle/view/palco.ts, tools/build-pacote.ts,
tools/testes/feedback/itch-lab.mts (novo).

## "Usar código" não respondia depois de colar no iPhone (21/11)

Relato: iPhone (Safari, site e itch.io), jogo vazio → "Colar código" → toque e segure → Colar; o quadro mostrava
"Recebido: N letras" e "Usar código" não funcionava.

- **Causa** (reproduzida por toque no iPhone 13 emulado, Chromium com `hasTouch`, área de transferência e menu Colar do
  iOS simulados): depois de colar, o campo (`textarea`) continuava focado com o menu do iOS aberto. No iOS o 1º toque
  fora do campo só tira o foco e fecha o menu, sem chegar ao botão: "Usar código" parecia morto. O jogador colava de
  novo e o texto entrava no cursor, **somado ao que já estava lá**: o código ficava duplicado (o dobro de letras),
  `lerExportado` recusava ("incompleto ou alterado") e daí em diante "Usar código" só dava erro. Além disso, com
  o campo focado, `atualizar` ignorava o A/B da tela de toque (os botões virtuais não tiram o foco do campo), e a
  mensagem de erro de 3 linhas ficava debaixo dos botões.
- **Correção** (src/ui/telas/saves.ts, `campoCodigo`):
  - colar troca o texto inteiro do campo (evento `paste`); o texto também é conferido em `input`, `change`, `keyup`,
    `blur` e a cada 250 ms (se o aparelho não avisar a mudança);
  - assim que o texto muda, o campo solta o foco: "Usar código", "Colar" e "Voltar" respondem no 1º toque;
  - código completo: "Usar código" fica em destaque e o jogo segue sozinho 0,7 s depois (ou na hora, tocando);
  - A/B/setas da tela e do controle valem com o campo focado (as teclas digitadas nele continuam só dele);
  - quadro 4 px mais alto: o aviso de até 3 linhas fica acima dos botões e não intercepta toques;
  - COPIAR: toque e segure que selecionava só um pedaço do código volta a selecionar o código inteiro, e depois do
    Copiar do menu do sistema o campo solta o foco ("Copiado!").
  - `lerExportado` (src/core/save.ts) aceita o código colado duas vezes ou com um pedaço velho antes (3 casos novos em
    tools/verify/save.ts).
- **Testado**: iPhone 13 em pé e deitado por toque, com o 1º toque engolido: Copiar → colar → 1º toque em "Usar
  código" (200 ms depois de colar), "Voltar" no 1º toque, abertura sozinha, A da tela, colar sem dados no evento e sem
  evento nenhum, botão "Colar" do quadro, Importar arquivo .pingo. PC (Chromium, teclado): Ctrl+V. App de PC (Electron
  44 com `main.cjs` e um `dist/` novo): Copiar → área do sistema; quadro com outro texto + Ctrl+V; ponte `colar`;
  Exportar/Importar .pingo (diálogos substituídos); fechar, abrir e continuar o jogo importado; `test:desktop` (jogo
  novo, salvar, fechar, reabrir). Android (Capacitor simulado no Chromium, Pixel 5): Clipboard.write/read, quadro
  quando o plugin não lê nada, Preferences guardando os saves (reabrindo sem localStorage/IndexedDB), arquivo .pingo.
  Demo ↔ completo (Vite com `VITE_DEMO=1`): save da demo (2 insígnias) abre no completo; save do completo com 2
  insígnias numa zona da demo abre na demo; save pós-Liga é recusado na demo com o aviso e nada gravado.
- **Não deu para testar aqui**: Safari/WKWebView de verdade (sem WebKit no contêiner) e o APK num Android real.
