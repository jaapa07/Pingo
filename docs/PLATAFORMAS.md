# Diário: versões PC (Electron) e iOS (Capacitor)

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

## Pendências conhecidas

- **Assinatura**: nenhum executável é assinado (Windows: aviso do SmartScreen; macOS: botão direito → Abrir).
- **macOS**: o `.dmg` depende do `hdiutil`, que só existe no Mac; configurado, não gerado aqui.
- **Instalador NSIS do Windows**: precisa de `wine` no Linux (ou gerar no Windows); configurado, não gerado aqui.
- **iOS só com `movel/`** (spec 15A.3): os assets ainda não têm dois níveis (`hd/` e `movel/`), então o app iOS
  leva o mesmo `dist/` do PWA (~42 MB de arquivos), bem dentro do orçamento de 300 MB.
