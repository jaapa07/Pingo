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
const CACHE_DADOS = 'pingo-dados'; // o mesmo nome usado pelo Service Worker (tools/build-sw.ts)
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
  // sprites, arenas e zonas ficam num cache só, com o hash na chave: o que não muda entre versões não é baixado de novo
  const chave = (a: Entrada) => new URL(a[0], location.href).href + '?h=' + a[1];
  const alvo = lista.arquivos.filter((a) => a[3] === 'r');
  const nucleo = lista.arquivos.filter((a) => a[3] === 'n').length;
  offline.total = alvo.length + nucleo;
  const cache = await caches.open(CACHE_DADOS);
  const ja = new Set((await cache.keys()).map((q) => q.url));
  const falta = alvo.filter((a) => !ja.has(chave(a)));
  offline.feitos = offline.total - falta.length;
  if (falta.length) offline.estado = 'baixando';
  const t0 = performance.now();
  let falhas = 0;
  for (let i = 0; i < falta.length; i += LOTE) {
    await Promise.all(falta.slice(i, i + LOTE).map(async (a) => {
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        try {
          const resp = await fetch(new Request(a[0], { cache: 'reload' }));
          if (!resp.ok) throw new Error(String(resp.status));
          await cache.put(chave(a), resp);
          offline.feitos++; return;
        } catch { await new Promise((ok) => setTimeout(ok, 400 * (tentativa + 1))); }
      }
      falhas++;
    }));
    avisar(`Guardando o jogo para jogar sem internet: ${Math.floor((offline.feitos / offline.total) * 100)}%`);
    if (falhas > 20) break; // a rede caiu: continua na próxima abertura
  }
  if (falta.length) offline.tempoMs = Math.round(performance.now() - t0);
  if (falhas) { offline.estado = 'falhou'; avisar('Sem rede: o download continua na próxima abertura.', 5000); return; }
  // faxina: chaves de versões antigas (hash que não está mais na lista) saem do cache
  const validas = new Set(lista.arquivos.map(chave));
  for (const q of ja) if (!validas.has(q)) void cache.delete(q).catch(() => undefined);
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
    const reg = await sw.register('sw.js');
    await sw.ready;
    // esta página já foi servida pela versão ativa: os núcleos de versões anteriores podem ser apagados
    if (!reg.installing && !reg.waiting) sw.controller?.postMessage('faxina');
    await baixarResto();
    // procura versão nova já nesta sessão; se houver, instala em segundo plano e vale na próxima abertura
    if (navigator.onLine) void reg.update().catch(() => undefined);
  } catch (e) {
    offline.estado = 'falhou';
    console.warn('[pingo] modo sem internet indisponível:', e);
  }
}
void iniciarOffline();
