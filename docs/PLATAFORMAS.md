# Diário: versões PC/Mac (Electron), iOS e Android (Capacitor)

Spec 2.2 e 15A: um só código, três empacotamentos. A web/PWA já existia; aqui entram o PC e o iOS.
Como gerar, rodar e publicar: `docs/JOGAR.md` (seções 1A e 6).

## Arquivos

| Arquivo | Papel |
|---|---|
| `plataformas/desktop/main.cjs` | processo principal do Electron: protocolo `pingo://jogo/`, bloqueio de rede, CSP, janela, menu, saves em arquivo, diálogos de exportar/importar |
| `plataformas/desktop/preload.cjs` | ponte `window.pingoDesktop` (interface `PonteDesktop` de `src/core/plataforma.ts`) |
| `plataformas/desktop/electron-builder.yml` | alvos: Linux AppImage, Windows portátil + NSIS, macOS dmg + zip |
| `plataformas/desktop/icone.png` | cópia de `public/icones/icone-512.png` (refazer com `npm run icones` e copiar de novo) |
| `tools/verify/desktop.ts` | `npm run test:desktop`: teste de verdade do app empacotado (Playwright `_electron`) |
| `capacitor.config.ts` | app iOS: appId `com.pingo.adventures`, `webDir: dist`, projeto em `plataformas/ios/ios` |
| `plataformas/ios/ios/App/` | projeto Xcode gerado por `npx cap add ios` (Swift Package Manager, sem CocoaPods) |

Scripts novos no `package.json`: `desktop:pacotes`, `desktop:mac`, `desktop:abrir`, `test:desktop`
(os já existentes `desktop` e `ios` foram mantidos como estavam).

## Decisões (PC)

- **JavaScript puro (.cjs) no processo principal e no preload**, sem etapa de compilação: o script `desktop`
  já existente (`npm run build && electron-builder ...`) funciona sem passo extra e o `tsconfig` do jogo não
  precisa enxergar tipos do Electron. O `package.json` é `"type": "module"`, por isso a extensão `.cjs`.
- **Protocolo próprio `pingo://jogo/`** em vez de `file://`: o jogo usa módulos ES e `fetch` dos JSON de
  assets, que o Chromium bloqueia em `file://`. O esquema é registrado como `standard` + `secure` +
  `supportFetchAPI`; o handler só entrega arquivos de dentro de `dist/` (caminho resolvido e conferido;
  fora disso, 403). O HTML sai com uma CSP só `'self'` (estilos inline liberados: a interface usa `style=`).
- **Sem rede**: `session.webRequest.onBeforeRequest` cancela tudo que não for `pingo:`, `data:`, `blob:`,
  ferramentas do Chromium ou os `file://` de dentro de `dist/` (o próprio handler do protocolo lê os arquivos
  por `net.fetch(file://...)`, que passa pelo mesmo filtro: sem essa exceção a página não abre, foi o primeiro
  erro encontrado no teste). Permissões negadas, exceto tela cheia e escrita na área de transferência;
  navegação para fora e janelas novas bloqueadas.
- **Renderer isolado**: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; DevTools só fora
  do pacote (ou com `PINGO_DEVTOOLS=1`).
- **Save**: a plataforma já tinha o adaptador `armazenamentoDesktop` chamando `pingoDesktop.lerSave/gravarSave/
  apagarSave`. O main grava um JSON por chave em `<userData>/saves/<chave>.json` (`{chave, quando, valor}`),
  de forma atômica (`.tmp` + `rename`) e guardando a versão anterior em `.bak` (lida se o principal estiver
  corrompido). Chaves validadas (`[a-z0-9._-]`). `userData` = `%APPDATA%\Adventures of Pingo`,
  `~/.config/Adventures of Pingo`, `~/Library/Application Support/Adventures of Pingo`; `PINGO_DADOS` troca a
  pasta (usado pelo teste). Uma instância só (`requestSingleInstanceLock`) para dois processos não gravarem o
  mesmo save.
- **Service Worker**: `src/core/offline.ts` já não faz nada quando `plataforma.alvo` não é `web`/`pwa`, e o
  `pingoDesktop` do preload faz a plataforma detectar `desktop` antes de tudo. Nenhuma mudança em
  `plataforma.ts` nem em `offline.ts`. Além disso `sw.js` e `pingo-arquivos.json` ficam fora do pacote.
- **Janela**: 1280×720 de **conteúdo** (`useContentSize`, a barra de menu não come altura), mínimo 320×180,
  redimensionável. A escala inteira já era feita por `src/ui/palco.ts` (1280×720 → 4×).
- **Tela cheia**: F11 é o acelerador do item "Tela cheia" do menu Jogo; Alt+Enter é tratado em
  `before-input-event` e **não** chega ao jogo (Enter é o botão A). Opções → Tela cheia usa a ponte.
- **Menu** em português: Jogo (Tela cheia F11, Abrir pasta dos saves, Sair Ctrl+Q) e Ajuda (Sobre, com a pasta
  dos saves); no macOS, o menu do app com Sobre/Ocultar/Sair.
- **Pacote**: `files` leva só `package.json`, `dist/` e os três arquivos do main; nenhuma dependência do Node
  (as do Capacitor ficam de fora com `!node_modules`), `npmRebuild: false`, `electronLanguages: [pt-BR, en-US]`,
  `publish: null` (sem atualizador automático, que dependeria de rede).

## Decisões (iOS)

- `npx cap add ios` funcionou neste contêiner Linux: o Capacitor 8 usa Swift Package Manager, então não
  precisa de CocoaPods; só não compila (Xcode). O projeto fica em `plataformas/ios/ios` (a linha
  `plataformas/ios/ios/App/Pods/` do `.gitignore` já previa esse caminho). O `.gitignore` gerado pelo próprio
  Capacitor dentro do projeto exclui `App/App/public` (a cópia do `dist/`, 83 MB) e o `capacitor.config.json`.
- Ajustes feitos à mão depois do `cap add` (refazer se o projeto for recriado):
  - `Info.plist`: `CFBundleDevelopmentRegion = pt-BR`; `UIStatusBarHidden = YES` com
    `UIViewControllerBasedStatusBarAppearance = NO` (tela cheia); `UIRequiresFullScreen = NO` (iPad em
    multitarefa); `ITSAppUsesNonExemptEncryption = NO`; `UIFileSharingEnabled` e
    `LSSupportsOpeningDocumentsInPlace` (os `.pingo` exportados aparecem no app Arquivos).
    As orientações (retrato + paisagem esquerda/direita; iPad as quatro) já vinham no modelo.
  - Ícone `AppIcon-512@2x.png` (1024×1024, sem transparência) = `icone-512.png` ampliado 2× sem suavizar;
    as três imagens da tela de abertura (2732×2732) = fundo `#211824` com o ícone ampliado 1,5× no centro.
- `capacitor.config.ts`: sem `server.url` (nada remoto), `allowNavigation: []`, `CapacitorHttp` e
  `CapacitorCookies` desligados, `contentInset: never`, sem rolagem do WebView, sem pré-visualização de links,
  depuração do WebView desligada.
- A ponte do iOS em `plataforma.ts` usa `window.Capacitor.Plugins.Preferences/...`: o Capacitor iOS injeta
  esse objeto nativamente (`JSExport.swift`), sem precisar importar `@capacitor/core` no jogo.
- Os storyboards gerados (`Base.lproj/*.storyboard`) contêm o elemento XML de marcador do Interface
  Builder (é o "First Responder", parte do formato do Xcode). O verificador de palavras proibidas só lê `src/`
  e `index.html`, e o arquivo não é do jogo; ficou como o Xcode exige.

## Testes feitos neste contêiner (Linux, Xvfb)

`npm run desktop` gera `plataformas/desktop/out/linux-unpacked/` (321 MB: Electron + `app.asar` de 46 MB).
`xvfb-run -a npm run test:desktop` abre **o app empacotado** e passou inteiro (também com o AppImage:
`APPIMAGE_EXTRACT_AND_RUN=1 PINGO_APP=<AppImage>`):

- conteúdo 1280×720, palco em escala 4× inteira, plataforma `desktop`, sem `require` no renderer, sem Service Worker;
- `fetch` para fora bloqueado;
- título → jogos → jogo novo → nome → quarto → andou → **Salvar** pelo menu → arquivos em `<dados>/saves/`;
- fechou o app, abriu de novo, **Continuar**: mesmo jogador, zona e posição;
- Alt+Enter liga a tela cheia sem o Enter chegar ao jogo; F11 desliga.

Capturas em `docs/capturas/desktop/`. O que o teste ensinou:
1. O `net.fetch(file://...)` do handler do protocolo passa pelo filtro de rede da sessão: a primeira versão
   abria `chrome-error://`. Corrigido liberando só os `file://` de dentro de `dist/`.
2. Teclas do Playwright (CDP) não passam pelo `before-input-event` do Electron; o teste usa
   `webContents.sendInputEvent`, que é o caminho real do teclado.
3. O Chromium tentou baixar dicionários do corretor (`redirector.gvt1.com`, recusado pelo proxy): corretor
   desligado na sessão e chaves `disable-background-networking`/`disable-component-update`; depois disso,
   nenhuma tentativa de conexão.
4. Ao fechar o app o jogo grava o ponto de retomada (`pagehide`), então o jogo salvo aparece com "Retomar de
   onde parou". **Observação para o jogo (fora deste trabalho):** a lista de opções do jogo salvo abre com o
   cursor na 3ª linha ("Exportar arquivo .pingo") em vez da 1ª; no PC, um A distraído abre o diálogo de
   exportar. O teste leva o cursor até "Continuar" de propósito.

`npm run desktop:pacotes` gerou `Adventures-of-Pingo-1.0.0-linux-x86_64.AppImage` (152 MB) e
`Adventures-of-Pingo-1.0.0-portatil.exe` (121 MB; ícone e versão conferidos dentro do .exe). O instalador
NSIS parou em `spawn wine ENOENT`: o electron-builder usa o `wine` para gerar o desinstalador, e instalar
pacotes do sistema não foi permitido neste contêiner. Fica configurado; sai com `wine` instalado ou no Windows.

`npx cap add ios` e `npx cap sync ios` rodaram sem erro (5 plugins via Swift Package Manager).

## Android (.apk) e Mac: publicação na Release

Tudo sai do workflow `.github/workflows/release.yml` (substituiu o antigo `pc.yml`). Ele dispara quando
`plataformas/desktop/VERSAO` muda em `main` e publica **uma** Release `pc-<VERSAO>` com:

| Arquivo | Job | Como é feito |
|---|---|---|
| `Adventures-of-Pingo-<V>-portatil.exe` | `pc` (ubuntu) | electron-builder `--win portable --x64` |
| `Adventures-of-Pingo-<V>-linux-x86_64.AppImage` | `pc` (ubuntu) | electron-builder `--linux AppImage` |
| `Adventures-of-Pingo-<V>-mac.dmg` e `-mac.zip` | `mac` (macos-latest) | electron-builder `--mac`, app **universal** (Intel + Apple Silicon) |
| `Adventures-of-Pingo-<V>-android.apk` | `android` (ubuntu) | `npm run build` + `npx cap sync android` + `./gradlew assembleRelease` |

Cada job sobe seus arquivos como artifact; o job `publicar` só roda se os três derem certo e cria a Release com
todos de uma vez (com o texto de instalação por plataforma). Rodar à mão (Actions → "Versões para PC, Mac e
Android" → Run workflow) só gera os arquivos (baixáveis em "Artifacts" da execução), a não ser que se marque
"publicar". `versionName` do Android = VERSAO e `versionCode` = `MAJOR*10000 + MINOR*100 + PATCH` (1.2.1 → 10201),
lidos de `plataformas/desktop/VERSAO` pelo `app/build.gradle`.

### Android: o projeto

- Gerado com `npx cap add android` (Capacitor 8.6, `@capacitor/android`), em `plataformas/android`
  (`android.path` no `capacitor.config.ts`). O jogo vai inteiro dentro do APK (`assets/public` = cópia do `dist/`,
  fora do git, refeita por `npx cap sync android`), servido de `https://localhost` pelo próprio app: nada de servidor
  remoto. Atualizar o projeto: `npm run android` (build + sync); APK local: `npm run android:apk` (precisa de JDK 21
  e Android SDK 36; saída em `plataformas/android/app/build/outputs/apk/release/`).
- Plugins: os mesmos do iOS (App, Filesystem, Haptics, Preferences, Share) + **`@capacitor/clipboard`**.
- `plataforma.ts` passou a reconhecer o alvo `android` (`Capacitor.getPlatform()`), tratado como o iOS:
  - **save** no Preferences (SharedPreferences do app), com localStorage/IndexedDB do WebView de reserva (o
    Capacitor liga o DOM storage; ambos persistem entre aberturas). Desinstalar o app apaga o save.
  - **Copiar código**: `navigator.clipboard.writeText` (funciona no WebView, que é contexto seguro); se falhar, o
    plugin Clipboard; depois o `execCommand('copy')`. **Colar código**: no app nativo o plugin Clipboard é lido
    primeiro (o WebView do Android nega `navigator.clipboard.readText`), depois o navegador; se nada der, a tela
    abre o campo para colar à mão, como antes. Na web nada muda (o plugin não existe lá).
  - **Exportar .pingo**: grava no cache do app (sem permissão de armazenamento) e abre o Compartilhar do Android
    (FileProvider do modelo do Capacitor). **Importar**: o `<input type=file>` vai sem filtro de tipo no Android
    (o seletor filtra por MIME e `.pingo` não tem um; com filtro o arquivo ficava cinza).
  - A opção "Tela cheia" some, como no iOS: o app já é tela cheia.
- `MainActivity.java`: tela cheia imersiva (barras do sistema escondidas; um deslize na borda mostra por um
  instante), desenho também atrás do entalhe da câmera (`SHORT_EDGES`), zoom desligado, `textZoom` 100 (o tamanho
  de fonte do sistema não deforma a interface em pixels), sem overscroll. A **área segura** chega ao jogo pelo
  `SystemBars` do Capacitor 8 (modo `css`): em WebView novo repassa os recortes ao `env(safe-area-inset-*)` que o
  `base.css` já usa; em WebView antigo põe o recuo como padding nativo. **Orientação livre** (nenhuma
  `screenOrientation` no manifesto; girar não recria a Activity). O viewport do `index.html` já tem
  `user-scalable=no`.
- Ícone e abertura gerados de `public/icones` (script Python/Pillow de uso único; refazer se a arte mudar):
  `mipmap-*/ic_launcher.png` (icone-512 com cantos arredondados), `ic_launcher_round.png` (recorte redondo),
  `ic_launcher_foreground.png` (icone-maskable-512 em 108 dp, ícone adaptativo, fundo `#3FA7D6`);
  `drawable*/splash.png` (fundo `#211824` com o ícone em escala inteira, Android 11 e antes) e
  `drawable-xxxhdpi/splash_icone.png` (ícone da tela de abertura do Android 12+, `windowSplashScreen*` em `styles.xml`).
- O botão Voltar do Android segue o padrão do Capacitor (sem página anterior: o app vai para segundo plano; o
  jogo grava o ponto de retomada ao sair de foco, igual ao iPhone).
- `.gitignore` do projeto: `*.jks` e `*.keystore` descomentados, para nenhuma chave entrar no repositório.

### Android: assinatura (keystore) — o que o dono do jogo precisa fazer

Sem configurar nada, o CI assina o APK com a **chave de debug** gerada na hora pelo Android Gradle Plugin. Esse
APK instala normalmente, mas **cada versão sai com uma chave diferente**: para instalar uma atualização é preciso
**desinstalar o app antes** (o Android recusa atualizar um app com outra assinatura) — e desinstalar apaga o save.
Antes de desinstalar, exporte o jogo (Jogos → Copiar código ou Exportar arquivo .pingo) e importe depois.

Para que as atualizações instalem por cima, crie **uma** keystore fixa e guarde-a bem (perdeu = nunca mais
atualiza por cima; nunca coloque no repositório, que é público):

1. Num computador com Java (JDK 17+): 
   `keytool -genkeypair -v -keystore pingo-release.keystore -alias pingo -keyalg RSA -keysize 4096 -validity 10000`
   (ele pede uma senha e nome/organização; pode usar a mesma senha para a chave).
2. Gere o texto base64 do arquivo: Linux `base64 -w0 pingo-release.keystore > ks.txt`; Mac
   `base64 -i pingo-release.keystore -o ks.txt`; Windows (PowerShell)
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("pingo-release.keystore")) > ks.txt`.
3. No GitHub: repositório → Settings → Secrets and variables → Actions → New repository secret, e crie:
   - `ANDROID_KEYSTORE_BASE64` = conteúdo de `ks.txt`;
   - `ANDROID_KEYSTORE_PASSWORD` = senha da keystore;
   - `ANDROID_KEY_ALIAS` = `pingo` (o `-alias` usado no passo 1);
   - `ANDROID_KEY_PASSWORD` = senha da chave (se for a mesma, repita).
4. Apague o `ks.txt` e guarde a keystore + senhas num lugar seguro (dois backups).

Na próxima Release o job `android` decodifica a keystore num arquivo temporário do runner e o `build.gradle`
assina com ela (o log mostra "Assinando com a keystore dos secrets" e o certificado no `apksigner verify`).
A primeira versão com a chave fixa ainda exige desinstalar a versão assinada com debug; dali em diante, atualiza por cima.

### Mac

- `electron-builder.yml`: alvos `dmg` e `zip`, arquitetura **universal** (um app só para Intel e Apple Silicon),
  nome `Adventures-of-Pingo-<V>-mac.{dmg,zip}`. Gerado no runner `macos-latest` (o `.dmg` precisa do `hdiutil`).
- Sem conta de desenvolvedor Apple: assinatura **ad hoc** (`identity: "-"`), sem notarização. Não é uma
  assinatura "de verdade" (o Gatekeeper continua avisando), mas sem ela o macOS dos Macs Apple Silicon diz que o
  app "está danificado". O job confere `lipo -info` (x86_64 + arm64) e `codesign --verify`.
- **Como abrir no Mac** (vai no texto da Release):
  1. `.dmg`: abra e arraste "Adventures of Pingo" para Aplicativos. `.zip`: dê dois cliques para descompactar.
  2. Na primeira vez, **clique com o botão direito** (ou Control + clique) no app → **Abrir** → **Abrir**.
  3. No macOS 15 (Sequoia) ou mais novo, ou se só aparecer "Cancelar"/"Mover para o Lixo": tente abrir uma vez,
     depois vá em **Ajustes do Sistema → Privacidade e Segurança**, role até "Adventures of Pingo foi bloqueado" e
     clique em **Abrir mesmo assim** (pede a senha do Mac). Das próximas vezes abre normalmente.
  4. Último recurso, no Terminal: `xattr -cr "/Applications/Adventures of Pingo.app"`.
- O save fica em `~/Library/Application Support/Adventures of Pingo/saves`.

## Pendências conhecidas

- **Assinatura**: Windows sem certificado (aviso do SmartScreen); Mac só ad hoc, sem notarização (botão direito →
  Abrir ou "Abrir mesmo assim"); Android com chave de debug até os secrets da keystore serem cadastrados.
- **Android não compilado neste contêiner**: sem Android SDK aqui (o download do SDK é bloqueado pelo proxy);
  compilado e conferido (`apksigner verify`) no CI. O teste da ponte (`plataforma.ts` com um Capacitor Android
  simulado: copiar/colar pelo plugin com o `navigator.clipboard` negado, save no Preferences, exportar no cache)
  foi feito no Chromium do Playwright.
- **Instalador NSIS do Windows**: precisa de `wine` no Linux (ou gerar no Windows); configurado, não gerado aqui.
- **iOS só com `movel/`** (spec 15A.3): os assets ainda não têm dois níveis (`hd/` e `movel/`), então o app iOS
  leva o mesmo `dist/` do PWA (~42 MB de arquivos), bem dentro do orçamento de 300 MB.
