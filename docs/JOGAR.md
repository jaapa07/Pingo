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

## 1A. Versão PC instalável (Electron): Windows, Linux e macOS

O mesmo jogo, empacotado num aplicativo que abre sem navegador e **nunca usa a rede** (todo pedido para fora
é bloqueado; os arquivos do jogo vão dentro do pacote). Janela de 1280×720 (escala 4× da tela do jogo),
redimensionável: o jogo sempre escolhe a maior escala inteira que cabe. **F11** ou **Alt+Enter** alternam a
tela cheia (também em Opções → Tela cheia e no menu **Jogo**). No título aparece a opção **Sair**.

### Gerar
    npm ci
    npm run desktop            # build + pasta pronta para o sistema atual: plataformas/desktop/out/linux-unpacked/
                               # (no Windows: out/win-unpacked/, no Mac: out/mac*/)
    npm run desktop:pacotes    # build + Linux AppImage + Windows portátil (.exe) + instalador NSIS (.exe)
    npm run desktop:mac        # build + macOS .dmg e .zip (rode num Mac)
    npm run desktop:abrir      # abre o jogo pelo Electron direto do código (usa o dist/ atual)
    xvfb-run -a npm run test:desktop   # teste do app empacotado (num PC com tela, sem o xvfb-run)

Os pacotes ficam em `plataformas/desktop/out/` (fora do Git):

| Arquivo | Para quê |
|---|---|
| `Adventures-of-Pingo-1.0.0-linux-x86_64.AppImage` | Linux: `chmod +x` e dois cliques (sem instalar) |
| `Adventures-of-Pingo-1.0.0-portatil.exe` | Windows: roda direto, de pendrive inclusive |
| `Adventures-of-Pingo-1.0.0-instalador.exe` | Windows: instala no menu Iniciar, com atalho na área de trabalho |
| `Adventures-of-Pingo-1.0.0-mac.dmg` | macOS (gerado num Mac) |

Os executáveis **não são assinados**: no Windows o SmartScreen mostra "O Windows protegeu o computador" na
primeira vez (**Mais informações → Executar assim mesmo**); no macOS, abra com **botão direito → Abrir**. Para
distribuir sem esses avisos é preciso um certificado de assinatura de código (Windows) ou uma conta de
desenvolvedor Apple (macOS) e os campos `win.signtoolOptions`/`mac.identity` do
`plataformas/desktop/electron-builder.yml`.

Gerar no Linux: o AppImage e o **.exe portátil** saem direto (com ícone e versão gravados no .exe). O
**instalador NSIS** precisa do `wine` instalado (`sudo apt install wine64`, ou gere no próprio Windows com
`npm run desktop:pacotes`); sem ele o comando para nesse alvo depois de gerar os outros dois. O `.dmg` só sai
num Mac. Tamanhos da versão 1.0.0: AppImage ~152 MB, portátil ~121 MB (Electron + ~42 MB de jogo).

### Onde fica o save no PC
Um arquivo JSON por jogo (`pingo.slot.0.json` a `pingo.slot.2.json`, com a reserva do próprio jogo em
`pingo.slot.N.bak.json`), mais `pingo.opcoes.json` e `pingo.retomada.json`. Cada arquivo guarda ainda a sua
versão anterior em `<nome>.json.bak`, usada se o principal estiver danificado:

- Windows: `%APPDATA%\Adventures of Pingo\saves\`
- Linux: `~/.config/Adventures of Pingo/saves/`
- macOS: `~/Library/Application Support/Adventures of Pingo/saves/`

Menu **Jogo → Abrir pasta dos saves** abre essa pasta. Copiar a pasta para outro PC leva os jogos junto. Para
levar o jogo do PC ao iPhone (e vice-versa), use **Exportar arquivo .pingo** / **Importar** na tela de jogos.
O save do aplicativo é separado do save do navegador.

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

Atualizações: ao abrir com internet (e sempre que o app volta ao primeiro plano), o jogo procura versão
nova, baixa só o que mudou em segundo plano e mostra no alto da tela o aviso **"Atualização disponível:
toque para recarregar"**. O aviso nunca aparece durante uma batalha e o jogo nunca recarrega sozinho: quem
não tocar segue jogando na versão antiga e recebe a nova na abertura seguinte. O save não é tocado (o toque
no aviso ainda guarda um ponto de retomada antes de recarregar).

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
- O pacote publicado tem ~42 MB em ~15,7 mil arquivos pequenos (os mapas são fatiados em blocos). O `du` mostra
  ~80 MB para a mesma pasta: é o espaço em blocos de 4 KB no disco, não o tamanho do que é enviado.
- Para jogar sem internet o aparelho guarda ~30 MB (núcleo 2,7 MB na instalação + ~27 MB em lotes logo depois).
  Enquanto o mapa B estiver fechado (`MAPA_B_ABERTO = false`), as zonas do Sertão, do Pico e do Encontro das
  Águas (~10 MB) ficam fora desse download; quando a chave virar `true`, a atualização as baixa sozinha.

## 4. Conferir antes de publicar

    npm run check                # verificador único (~2 min): tsc, batalha, zonas, palavras proibidas, dados,
                                 # progressão até a Liga e do mapa B aberto até o Conselho, níveis, sprites,
                                 # BUILD LIMPO, arquivos do pacote, dist
    npm run check -- --mapa-b    # só as duas progressões, passo a passo (quarto → Liga → Conselho → pós-jogo)
    npm run check -- --rapido    # sem o build limpo (~15 s), para o dia a dia
    npm run check -- --offline   # + Playwright sobre o build limpo: PC + iPhone em pé e deitado, rede cortada,
                                 # e a atualização de versão com o jogo aberto (capturas em docs/capturas/offline/)
    npm run check -- --tudo      # lista todos os avisos

O **build limpo** repete o que o GitHub faz: `git clone` do HEAD numa pasta temporária, mais os arquivos
alterados/novos que um commit levaria, `node_modules` por link e `npm run build`. Ele falha se o jogo usa
arquivo ignorado pelo `.gitignore`, pacote fora do `package.json` ou `package-lock.json` fora de sincronia —
erros que nesta máquina não aparecem e no GitHub param a publicação. Rode antes de cada push.

`npm run icones` refaz os ícones do aplicativo (`public/icones/`) a partir da arte do jogo.

## 5. O que esta versão cobre

Do quarto em Vila Jacarandá até a **Liga dos Guardiões** (8 insígnias, mapa A — Costa do Sol). O Trem
Serra-Sol e o Saveiro para o mapa B aparecem como "em obras" depois da Liga.

## 6. Publicar na App Store (app iOS nativo, Capacitor)

O projeto Xcode já está no repositório em `plataformas/ios/ios/App` (Capacitor 8, appId
`com.pingo.adventures`, nome "Adventures of Pingo", paisagem e retrato, tela cheia sem barra de status, sem
rede: o jogo é servido de dentro do app). Ele usa **Swift Package Manager** (não precisa de CocoaPods). O que
não dá para fazer fora de um Mac: compilar, assinar e enviar. Passo a passo no Mac:

### Requisitos
- Um Mac com macOS recente e o **Xcode** da Mac App Store (abra uma vez para instalar os componentes).
- **Node.js 22** (`brew install node@22` ou o instalador do nodejs.org) e Git.
- Uma conta no **Apple Developer Program** (US$ 99/ano) para TestFlight e App Store. Sem ela, dá para
  instalar só no seu próprio iPhone pela conta gratuita (o app expira em 7 dias).

### Gerar e abrir o projeto
    git clone <repositório> && cd adventures-of-pingo
    npm ci
    npm run ios              # build do jogo + npx cap sync ios (copia o dist/ para dentro do app)
    npx cap open ios         # abre plataformas/ios/ios/App/App.xcodeproj no Xcode

Rode `npm run ios` de novo sempre que o jogo mudar (o `dist/` copiado para o app não é versionado).

### Assinar
1. No Xcode, selecione o projeto **App** → alvo **App** → aba **Signing & Capabilities**.
2. Marque **Automatically manage signing** e escolha o seu **Team** (entre com o Apple ID em
   Xcode → Settings → Accounts, se ainda não entrou).
3. Confira o **Bundle Identifier** `com.pingo.adventures` (se já estiver em uso por outra conta, troque aqui e
   em `capacitor.config.ts` pelo seu, ex. `com.seunome.pingo`).
4. Em **General**, ajuste **Version** (ex. 1.0.0) e **Build** (1, 2, 3… — cada envio precisa de um número novo).

### Testar
- Conecte o iPhone por cabo (ou na mesma rede Wi-Fi), escolha-o no topo do Xcode e aperte **Run** (⌘R).
  No iPhone, autorize o desenvolvedor em Ajustes → Geral → VPN e Gerenciamento de Dispositivos e ative o
  **Modo de Desenvolvedor** (Ajustes → Privacidade e Segurança) se o iOS pedir.
- Também roda no Simulador (escolha um iPhone na lista).

### TestFlight e App Store
1. Em https://appstoreconnect.apple.com → **Apps** → **+** → Novo app: plataforma iOS, nome
   "Adventures of Pingo", idioma principal Português (Brasil), o Bundle ID acima, um SKU qualquer (ex. pingo-ios).
2. No Xcode, escolha o destino **Any iOS Device (arm64)** → menu **Product → Archive**.
3. Na janela Organizer: **Distribute App** → **App Store Connect** → **Upload**. O `Info.plist` já declara que o app
   não usa criptografia própria (`ITSAppUsesNonExemptEncryption = NO`), então não há pergunta de exportação.
4. Depois de 10 a 30 minutos o build aparece no App Store Connect, aba **TestFlight**. Adicione testadores
   internos (até 100, sem revisão) ou crie um grupo externo (passa por uma revisão rápida da Apple).
5. Para publicar: aba **Distribuição** (App Store) → preencha descrição, palavras-chave, categoria **Jogos →
   RPG**, classificação etária, URL de suporte, **política de privacidade** (o jogo não coleta nada: diga isso),
   capturas de tela (iPhone 6,9" e 6,5"; dá para tirar no Simulador com ⌘S) → escolha o build → **Enviar
   para revisão**. A revisão costuma levar de 1 a 3 dias.

### Observações
- Ícone (1024×1024) e tela de abertura ficam em `plataformas/ios/ios/App/App/Assets.xcassets/`.
- O save do app iOS usa Capacitor Preferences (não é apagado pela limpeza do Safari) e é separado do save do
  PWA da Tela de Início. Para levar o jogo do PWA para o app: Exportar arquivo .pingo → Importar.
- `npx cap add ios` já foi feito; não rode de novo (apagaria os ajustes do `Info.plist` e do ícone). Para
  recriar do zero: apague `plataformas/ios/ios` e rode `npx cap add ios`, depois refaça os ajustes listados
  em `docs/PLATAFORMAS.md`.
