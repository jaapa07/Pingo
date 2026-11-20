/**
 * Adventures of Pingo — app iOS (Capacitor). O projeto Xcode fica em `plataformas/ios/ios/App`.
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
  plugins: {
    // o Capacitor HTTP e o de cookies ficam desligados: o jogo não fala com a rede
    CapacitorHttp: { enabled: false },
    CapacitorCookies: { enabled: false },
  },
};

export default config;
