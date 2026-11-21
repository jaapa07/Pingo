/**
 * Adventures of Pingo — apps iOS e Android (Capacitor). O projeto Xcode fica em `plataformas/ios/ios/App`;
 * o do Android (Gradle) em `plataformas/android` (`npm run android`, depois `npm run android:apk`; o CI gera o .apk
 * em .github/workflows/release.yml, docs/PLATAFORMAS.md).
 * Gerar/atualizar: `npm run ios` (build + `npx cap sync ios`). Compilar e assinar só num Mac com Xcode
 * (passo a passo em docs/JOGAR.md, "Publicar na App Store").
 *
 * Tudo vai dentro do app (`webDir: dist`): sem servidor remoto, sem navegação para fora.
 * Orientação (paisagem e retrato) e tela cheia ficam no Info.plist do projeto gerado.
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pingo.adventures',
  appName: 'Adventures of Pingo',
  webDir: 'dist',
  // sem `server.url`: o jogo é servido do pacote (capacitor://localhost); nenhum domínio externo liberado
  server: { iosScheme: 'capacitor', allowNavigation: [] },
  ios: {
    path: 'plataformas/ios/ios',
    scheme: 'App',
    contentInset: 'never',
    backgroundColor: '#211824',
    scrollEnabled: false,
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
    webContentsDebuggingEnabled: false,
  },
  android: {
    path: 'plataformas/android',
    backgroundColor: '#211824',
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
    // o .apk é gerado pelo Gradle (docs/PLATAFORMAS.md); a assinatura vem dos secrets do GitHub ou da chave de debug
  },
  plugins: {
    // o Capacitor HTTP e o de cookies ficam desligados: o jogo não fala com a rede
    CapacitorHttp: { enabled: false },
    CapacitorCookies: { enabled: false },
  },
};

export default config;
