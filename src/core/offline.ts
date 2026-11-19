/**
 * Jogo sem internet no navegador e no PWA (PC e iPhone):
 *  - registra o Service Worker gerado no build (`sw.js`, ao lado do index.html, em qualquer subpasta);
 *  - baixa em lotes o resto do pacote (sprites, arenas, zonas) para o cache, com retomada;
 *  - pede ao navegador para não apagar o save (`navigator.storage.persist()`);
 *  - mostra um aviso discreto com o andamento e some quando termina.
 * Nos empacotamentos nativos (iOS/desktop) e no `vite dev` este módulo não faz nada.
 */
import { plataforma } from './plataforma';

type Entrada = [caminho: string, hash: string, bytes: number, grupo: 'n' | 'r' | 'd'];
interface Lista { v: string; arquivos: Entrada[] }

export const offline = {
  /** 'desligado' (dev/nativo), 'instalando', 'baixando', 'pronto' ou 'falhou' (tenta de novo na próxima abertura) */
  estado: 'desligado' as 'desligado' | 'instalando' | 'baixando' | 'pronto' | 'falhou',
  versao: '',
  feitos: 0, total: 0,
  /** ms gastos no download do pacote nesta sessão (0 se já estava completo) */
  tempoMs: 0,
  persistente: null as boolean | null,
};

const LOTE = 24;
const CH_COMPLETO = 'pingo.offline';
let faixa: HTMLElement | null = null, somem = 0;

function avisar(texto: string, sumirEm = 0) {
  if (typeof document === 'undefined') return;
  if (!faixa) {
    faixa = document.createElement('div'); faixa.id = 'aviso-offline';
    faixa.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom, 0px) + 6px);transform:translateX(-50%);z-index:60;'
      + 'padding:3px 10px;background:#1a1423;color:#fff8e7;border:2px solid #c98f4e;font:bold 11px/16px ui-monospace,Menlo,Consolas,monospace;'
      + 'white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .3s steps(4,end)';
    document.body.append(faixa);
  }
  faixa.textContent = texto; faixa.style.opacity = '0.92';
  clearTimeout(somem);
  if (sumirEm) somem = window.setTimeout(() => { if (faixa) faixa.style.opacity = '0'; }, sumirEm);
}

async function pedirPersistencia() {
  try {
    const st = navigator.storage;
    if (!st?.persist) return;
    offline.persistente = (await st.persisted?.()) || (await st.persist());
  } catch { /* navegador sem a API: o save segue em localStorage + IndexedDB */ }
}

async function baixarResto() {
  const r = await fetch('pingo-arquivos.json');
  if (!r.ok) throw new Error('lista de arquivos indisponível');
  const lista = (await r.json()) as Lista;
  offline.versao = lista.v;
  let completo: string | null = null;
  try { completo = localStorage.getItem(CH_COMPLETO); } catch { /* modo privado */ }
  const nome = 'pingo-' + lista.v;
  const alvo = lista.arquivos.filter((a) => a[3] !== 'd');
  offline.total = alvo.length;
  if (completo === lista.v && (await caches.has(nome))) { offline.feitos = alvo.length; offline.estado = 'pronto'; return; }
  const cache = await caches.open(nome);
  const ja = new Set((await cache.keys()).map((q) => q.url));
  const falta = alvo.filter((a) => !ja.has(new URL(a[0], location.href).href));
  offline.feitos = alvo.length - falta.length;
  offline.estado = 'baixando';
  const t0 = performance.now();
  let falhas = 0;
  for (let i = 0; i < falta.length; i += LOTE) {
    await Promise.all(falta.slice(i, i + LOTE).map(async (a) => {
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        try {
          const resp = await fetch(new Request(a[0], { cache: 'reload' }));
          if (!resp.ok) throw new Error(String(resp.status));
          await cache.put(new URL(a[0], location.href).href, resp);
          offline.feitos++; return;
        } catch { await new Promise((ok) => setTimeout(ok, 400 * (tentativa + 1))); }
      }
      falhas++;
    }));
    avisar(`Guardando o jogo para jogar sem internet: ${Math.floor((offline.feitos / offline.total) * 100)}%`);
    if (falhas > 20) break; // a rede caiu: continua na próxima abertura
  }
  offline.tempoMs = Math.round(performance.now() - t0);
  if (falhas) { offline.estado = 'falhou'; avisar('Sem rede: o download continua na próxima abertura.', 5000); return; }
  try { localStorage.setItem(CH_COMPLETO, lista.v); } catch { /* confere pelo cache na próxima vez */ }
  offline.estado = 'pronto';
  if (falta.length) avisar('Pronto: o jogo já funciona sem internet.', 5000);
}

export async function iniciarOffline(): Promise<void> {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || typeof window === 'undefined') return;
  if (plataforma.alvo !== 'web' && plataforma.alvo !== 'pwa') return;
  (window as unknown as { __pingoOffline: typeof offline }).__pingoOffline = offline;
  void pedirPersistencia();
  window.addEventListener('pointerdown', () => void pedirPersistencia(), { once: true, passive: true });
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || !window.isSecureContext) return;
  offline.estado = 'instalando';
  try {
    const sw = navigator.serviceWorker;
    const tinhaControle = !!sw.controller;
    const reg = await sw.register('sw.js');
    // versão nova já baixada numa sessão anterior: ativa agora, antes de o jogo começar, e recarrega uma vez
    if (reg.waiting && tinhaControle) {
      let recarregou = false;
      sw.addEventListener('controllerchange', () => { if (!recarregou) { recarregou = true; location.reload(); } });
      reg.waiting.postMessage('ativar');
      return;
    }
    await sw.ready;
    await baixarResto();
    // procura versão nova já nesta sessão; se houver, ela instala em segundo plano e vale na próxima abertura
    if (tinhaControle && navigator.onLine) void reg.update().catch(() => undefined);
  } catch (e) {
    offline.estado = 'falhou';
    console.warn('[pingo] modo sem internet indisponível:', e);
  }
}
void iniciarOffline();
