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
