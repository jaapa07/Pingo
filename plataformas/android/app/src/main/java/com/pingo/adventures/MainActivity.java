package com.pingo.adventures;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * Adventures of Pingo no Android: o jogo inteiro roda do pacote (assets/public), sem rede.
 * Aqui ficam só as proteções de tela: tela cheia imersiva, desenho também atrás do entalhe da câmera
 * (a área segura chega ao jogo pelo SystemBars do Capacitor: env(safe-area-inset-*) ou padding nativo),
 * sem zoom e sem o tamanho de fonte do sistema mexer no layout em pixels.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window janela = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = janela.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            janela.setAttributes(lp);
        }
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) {
            WebSettings s = web.getSettings();
            s.setSupportZoom(false);
            s.setBuiltInZoomControls(false);
            s.setDisplayZoomControls(false);
            s.setTextZoom(100);
            web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
            web.setVerticalScrollBarEnabled(false);
            web.setHorizontalScrollBarEnabled(false);
        }
        telaCheia();
    }

    @Override
    public void onResume() {
        super.onResume();
        telaCheia();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) telaCheia();
    }

    /** esconde as barras do sistema; um deslize na borda mostra por um instante e elas somem de novo */
    private void telaCheia() {
        Window janela = getWindow();
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(janela, janela.getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
