# Como jogar Adventures of Pingo (PC e iPhone, sem internet)

O jogo é uma página só (HTML + CSS + JS), sem servidor por trás. Depois da primeira abertura ele fica
guardado no aparelho e funciona **sem internet**. O save fica no próprio aparelho.

## 1. No PC

### Jogar a versão publicada
Abra o endereço do GitHub Pages no Chrome, Edge, Firefox ou Safari:

    https://<usuário>.github.io/<repositório>/      (ex.: https://jaapa07.github.io/Pingo/)

Na primeira visita aparece, no rodapé, "Guardando o jogo para jogar sem internet: N%". Quando virar
"Pronto: o jogo já funciona sem internet", pode desligar a rede. No Chrome/Edge dá para instalar como
aplicativo (ícone de instalar na barra de endereço).

Controles: setas ou WASD andam · **Z** ou Enter = A (confirmar) · **X** ou Shift = B (voltar/correr) ·
**Esc** ou C = Menu · V = Select. As teclas podem ser trocadas em Opções.

### Rodar a partir do código
    npm ci
    npm run dev            # desenvolvimento, em http://localhost:5173 (sem Service Worker)

    npm run build          # tsc + vite build + Service Worker → pasta dist/
    npm run preview        # serve o dist em http://localhost:4173

O `dist/` usa caminhos relativos (`base: './'`): pode ser copiado para qualquer pasta de qualquer servidor
estático. Só não abre direto do disco (`file://`), porque módulos e Service Worker exigem http(s).

## 2. No iPhone (Safari → Tela de Início)

1. No iPhone, abra o endereço do GitHub Pages **no Safari** (tem de ser https).
2. Espere o aviso do rodapé chegar a "Pronto: o jogo já funciona sem internet" (são ~27 MB; no Wi-Fi leva
   por volta de um minuto). Se fechar antes, o download continua de onde parou na próxima abertura.
3. Toque em **Compartilhar** (quadrado com a seta) → **Adicionar à Tela de Início** → Adicionar.
4. Abra pelo ícone do Pingo. O jogo abre em tela cheia, em pé ou deitado, com os controles de toque
   (direcional à esquerda, A e B à direita, Menu e Select). O som começa depois do primeiro toque.
5. Abra pelo ícone **uma vez ainda com internet** e espere o aviso de "Pronto" de novo: no iOS, o app da
   Tela de Início tem armazenamento próprio, separado do Safari. Depois disso, modo avião à vontade.

Sobre o save no iPhone:
- Fica gravado em dois lugares do aparelho (localStorage e IndexedDB) e o jogo pede ao sistema
  armazenamento persistente. O jogo salva sozinho ao trocar de zona e ao entrar num Posto Guardião; no menu
  há o **Salvar** manual. Se o app for para segundo plano, ele guarda um ponto de retomada.
- O save do Safari e o do ícone da Tela de Início **não são o mesmo**. Jogue sempre pelo ícone.
- O iOS pode apagar dados de sites que ficam semanas sem uso (não vale para o app da Tela de Início em
  uso normal). Para garantir, ou para levar o jogo do PC para o iPhone: tela de jogos → escolha o jogo →
  **Exportar arquivo .pingo** / **Importar** (ou o código QR).
- Apagar o ícone da Tela de Início apaga o save dele. Exporte antes.

Atualizações: ao abrir com internet, o jogo baixa a versão nova em segundo plano e passa a usá-la na
abertura seguinte. O save não é tocado.

## 3. Ativar o GitHub Pages (uma vez)

O arquivo `.github/workflows/pages.yml` já faz `npm ci`, `npm run build` e publica o `dist/` a cada push
na branch `main`. Para ligar:

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Build and deployment** → **Source**, escolha **GitHub Actions**.
3. Faça um push na `main` (ou vá em **Actions** → "Publicar no GitHub Pages" → **Run workflow**).
4. Quando o workflow terminar (2 a 4 minutos), o endereço aparece em Settings → Pages e no resumo do
   job `deploy`: `https://<usuário>.github.io/<repositório>/`.

Observações:
- Em conta gratuita, o Pages exige repositório **público** (privado só nos planos pagos).
- Os assets (sprites, zonas, arenas) já estão versionados em `public/`; o CI não roda os renders.
- O pacote publicado tem ~27 MB em ~9 mil arquivos pequenos (os mapas são fatiados em blocos).

## 4. Conferir antes de publicar

    npm run check            # verificador único: tsc, batalha, zonas, dados, progressão até a Liga, níveis, sprites, dist
    npm run build && npm run test:offline
                             # Playwright: PC + iPhone em pé e deitado, com a rede cortada (capturas em docs/capturas/offline/)
    npm run check -- --offline   # as duas coisas juntas

`npm run icones` refaz os ícones do aplicativo (`public/icones/`) a partir da arte do jogo.

## 5. O que esta versão cobre

Do quarto em Vila Jacarandá até a **Liga dos Guardiões** (8 insígnias, mapa A — Costa do Sol). O Trem
Serra-Sol e o Saveiro para o mapa B aparecem como "em obras" depois da Liga.
