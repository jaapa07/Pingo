/**
 * Plataforma: detecta o alvo (web, pwa, ios, desktop) e entrega armazenamento, vibração, tela cheia,
 * saída do jogo e troca de arquivos. Nada aqui depende de rede.
 *
 * Pontes esperadas (fornecidas pelos empacotamentos em `plataformas/`):
 *  - iOS (Capacitor): `window.Capacitor.Plugins.{Preferences, Filesystem, Share, Haptics, App}`.
 *  - Desktop (Electron, preload): `window.pingoDesktop` com a interface `PonteDesktop` abaixo.
 */
export type Alvo = 'web' | 'pwa' | 'ios' | 'desktop';

export interface Armazenamento {
  ler(chave: string): Promise<string | null>;
  gravar(chave: string, valor: string): Promise<void>;
  apagar(chave: string): Promise<void>;
}
export interface PonteDesktop {
  lerSave(chave: string): Promise<string | null>;
  gravarSave(chave: string, valor: string): Promise<void>;
  apagarSave(chave: string): Promise<void>;
  salvarArquivo(nome: string, conteudo: string): Promise<boolean>;
  abrirArquivo(): Promise<string | null>;
  /** área de transferência do sistema pelo processo principal (o Chromium do app nega a leitura direta) */
  copiar?(txt: string): Promise<boolean>;
  colar?(): Promise<string | null>;
  telaCheia(ligar: boolean): void;
  sair(): void;
}
interface PluginsCapacitor {
  Preferences?: { get(o: { key: string }): Promise<{ value: string | null }>; set(o: { key: string; value: string }): Promise<void>; remove(o: { key: string }): Promise<void> };
  Filesystem?: { writeFile(o: { path: string; data: string; directory: string; encoding: string }): Promise<{ uri: string }> };
  Share?: { share(o: { title?: string; url?: string; text?: string }): Promise<unknown> };
  Haptics?: { impact(o: { style: string }): Promise<void>; vibrate(o: { duration: number }): Promise<void> };
  App?: { exitApp?(): void; addListener?(ev: string, fn: (d: { isActive: boolean }) => void): void };
}
type Janela = Window & { Capacitor?: { isNativePlatform?(): boolean; Plugins?: PluginsCapacitor }; pingoDesktop?: PonteDesktop };
const jan = (typeof window === 'undefined' ? {} : window) as Janela;

function detectar(): Alvo {
  if (jan.pingoDesktop) return 'desktop';
  if (jan.Capacitor?.isNativePlatform?.()) return 'ios';
  const solto = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches;
  if (solto || (typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone)) return 'pwa';
  return 'web';
}

/* ------------------------------ armazenamentos ------------------------------ */
/** IndexedDB como espelho do localStorage: se o navegador limpar um, o outro devolve o save. */
function espelhoIdb() {
  let banco: Promise<IDBDatabase | null> | null = null;
  const abrir = () => (banco ??= new Promise<IDBDatabase | null>((res) => {
    try {
      const p = indexedDB.open('pingo', 1);
      p.onupgradeneeded = () => p.result.createObjectStore('kv');
      p.onsuccess = () => res(p.result); p.onerror = () => res(null); p.onblocked = () => res(null);
    } catch { res(null); }
  }));
  const op = async <T>(modo: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | null> => {
    const b = await abrir(); if (!b) return null;
    return new Promise((res) => { try { const r = f(b.transaction('kv', modo).objectStore('kv')); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch { res(null); } });
  };
  return {
    ler: (k: string) => op<string | undefined>('readonly', (s) => s.get(k)).then((v) => (typeof v === 'string' ? v : null)),
    gravar: (k: string, v: string) => op('readwrite', (s) => s.put(v, k)).then(() => undefined),
    apagar: (k: string) => op('readwrite', (s) => s.delete(k)).then(() => undefined),
  };
}
function armazenamentoWeb(): Armazenamento {
  const memoria = new Map<string, string>();
  const idb = espelhoIdb();
  const ls = () => { try { return jan.localStorage ?? null; } catch { return null; } };
  return {
    async ler(k) {
      try { const v = ls()?.getItem(k); if (v != null) return v; } catch { /* modo privado: segue para o espelho */ }
      const esp = await idb.ler(k);
      if (esp != null) { try { ls()?.setItem(k, esp); } catch { /* sem espaço: fica só no espelho */ } return esp; }
      return memoria.get(k) ?? null;
    },
    async gravar(k, v) {
      memoria.set(k, v);
      try { ls()?.setItem(k, v); } catch { /* cota cheia ou bloqueado: o espelho e a memória seguram */ }
      await idb.gravar(k, v);
    },
    async apagar(k) { memoria.delete(k); try { ls()?.removeItem(k); } catch { /* nada a remover */ } await idb.apagar(k); },
  };
}
function armazenamentoIos(reserva: Armazenamento): Armazenamento {
  const pref = jan.Capacitor?.Plugins?.Preferences;
  if (!pref) return reserva;
  return {
    ler: (k) => pref.get({ key: k }).then((r) => r.value, () => reserva.ler(k)),
    gravar: (k, v) => pref.set({ key: k, value: v }).catch(() => reserva.gravar(k, v)),
    apagar: (k) => pref.remove({ key: k }).catch(() => reserva.apagar(k)),
  };
}
function armazenamentoDesktop(p: PonteDesktop): Armazenamento {
  return { ler: (k) => p.lerSave(k), gravar: (k, v) => p.gravarSave(k, v), apagar: (k) => p.apagarSave(k) };
}

const alvo = detectar();
const web = armazenamentoWeb();

export const plataforma = {
  alvo,
  /** aparelho de toque (mostra os controles virtuais); `?toque=1` força, `?toque=0` esconde */
  toque: (() => {
    if (typeof location !== 'undefined') { const q = new URLSearchParams(location.search).get('toque'); if (q === '1') return true; if (q === '0') return false; }
    return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  })(),
  armazenamento: (alvo === 'desktop' ? armazenamentoDesktop(jan.pingoDesktop!) : alvo === 'ios' ? armazenamentoIos(web) : web) as Armazenamento,
  /** prefixo dos assets (igual em todos os alvos: tudo vai dentro do pacote) */
  caminhoAssets: 'assets/',
  podeSair: alvo === 'desktop',

  /** vibração curta; `forte` para crítico, captura e insígnia. Quem chama decide se a opção está ligada. */
  vibrar(ms = 12, forte = false) {
    try {
      const h = jan.Capacitor?.Plugins?.Haptics;
      if (h) { void (forte ? h.vibrate({ duration: ms }) : h.impact({ style: 'LIGHT' })); return; }
      navigator.vibrate?.(ms);
    } catch { /* aparelho sem vibração */ }
  },
  telaCheia(ligar: boolean) {
    try {
      if (jan.pingoDesktop) { jan.pingoDesktop.telaCheia(ligar); return; }
      if (ligar) void document.documentElement.requestFullscreen?.().catch(() => undefined);
      else if (document.fullscreenElement) void document.exitFullscreen?.();
    } catch { /* sem suporte */ }
  },
  sair() { if (jan.pingoDesktop) jan.pingoDesktop.sair(); else jan.Capacitor?.Plugins?.App?.exitApp?.(); },

  /** entrega um arquivo ao usuário (download no navegador, Compartilhar no iOS, diálogo no desktop) */
  async salvarArquivo(nome: string, conteudo: string): Promise<boolean> {
    try {
      if (jan.pingoDesktop) return await jan.pingoDesktop.salvarArquivo(nome, conteudo);
      const cap = jan.Capacitor?.Plugins;
      if (alvo === 'ios' && cap?.Filesystem) {
        const r = await cap.Filesystem.writeFile({ path: nome, data: conteudo, directory: 'DOCUMENTS', encoding: 'utf8' });
        await cap.Share?.share({ title: nome, url: r.uri });
        return true;
      }
      const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/octet-stream' }));
      const a = document.createElement('a'); a.href = url; a.download = nome; a.style.display = 'none';
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return true;
    } catch { return false; }
  },
  /** pede um arquivo .pingo ao usuário e devolve o texto (null se desistiu) */
  abrirArquivo(): Promise<string | null> {
    if (jan.pingoDesktop) return jan.pingoDesktop.abrirArquivo().catch(() => null);
    return new Promise((res) => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pingo,text/plain'; inp.style.display = 'none';
      let feito = false; const fim = (v: string | null) => { if (feito) return; feito = true; inp.remove(); res(v); };
      inp.onchange = () => { const f = inp.files?.[0]; if (!f) return fim(null); f.text().then(fim, () => fim(null)); };
      inp.addEventListener('cancel', () => fim(null));
      document.body.append(inp); inp.click();
      // navegadores sem o evento `cancel`: desiste quando a janela volta ao foco sem arquivo
      window.addEventListener('focus', () => setTimeout(() => { if (!inp.files?.length) fim(null); }, 1500), { once: true });
    });
  },
  /** copia para a área de transferência do sistema; false se o aparelho/navegador negou (aí a tela oferece o campo de texto) */
  async copiar(txt: string): Promise<boolean> {
    if (jan.pingoDesktop?.copiar) { try { return await jan.pingoDesktop.copiar(txt); } catch { /* segue para o navegador */ } }
    try { await navigator.clipboard.writeText(txt); return true; } catch { /* sem permissão ou sem contexto seguro */ }
    // recurso antigo (Safari sem gesto recente, http local): seleciona um campo escondido e pede "copiar"
    try {
      const ta = document.createElement('textarea'); ta.value = txt; ta.readOnly = true;
      ta.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
      document.body.append(ta); ta.select(); ta.setSelectionRange(0, txt.length);
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  },
  /** lê a área de transferência; null se negou ou não há suporte (aí a tela oferece o campo para colar) */
  async colar(): Promise<string | null> {
    if (jan.pingoDesktop?.colar) { try { return await jan.pingoDesktop.colar(); } catch { /* segue para o navegador */ } }
    try { return await navigator.clipboard.readText(); } catch { return null; }
  },
  /** avisa quando o app vai para segundo plano ou volta (visibilitychange + Capacitor App) */
  aoMudarVisibilidade(fn: (visivel: boolean) => void) {
    document.addEventListener('visibilitychange', () => fn(document.visibilityState === 'visible'));
    window.addEventListener('pagehide', () => fn(false));
    jan.Capacitor?.Plugins?.App?.addListener?.('appStateChange', (d) => fn(d.isActive));
  },
};
