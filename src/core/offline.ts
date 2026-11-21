/**
 * Jogo sem internet no navegador e no PWA (PC e iPhone):
 *  - registra o Service Worker gerado no build (`sw.js`, ao lado do index.html, em qualquer subpasta);
 *  - baixa em lotes o resto do pacote (sprites, arenas, zonas) para o cache, com retomada;
 *  - pede ao navegador para não apagar o save (`navigator.storage.persist()`);
 *  - mostra um aviso discreto com o andamento e some quando termina;
 *  - quando o site publica uma versão nova: baixa o que mudou em segundo plano e mostra
 *    "Atualização disponível: toque para recarregar" (nunca recarrega sozinho nem aparece durante uma batalha).
 * Nos empacotamentos nativos (iOS/desktop) e no `vite dev` este módulo não faz nada.
 */
import { plataforma } from './plataforma';
import { gravarRetomada } from './save';
import { DEMO } from './progresso';

type Entrada = [caminho: string, hash: string, bytes: number, grupo: 'n' | 'r' | 'd'];
interface Lista { v: string; arquivos: Entrada[] }

export const offline = {
  /** 'desligado' (dev/nativo), 'instalando', 'baixando', 'pronto' ou 'falhou' (tenta de novo na próxima abertura) */
  estado: 'desligado' as 'desligado' | 'instalando' | 'baixando' | 'pronto' | 'falhou',
  /** versão do pacote com que esta página abriu */
  versao: '',
  /** versão mais nova já baixada e pronta para valer no próximo recarregamento ('' se não há) */
  versaoNova: '',
  feitos: 0, total: 0,
  /** ms gastos no download do pacote nesta sessão (0 se já estava completo) */
  tempoMs: 0,
  persistente: null as boolean | null,
};

const LOTE = 24;
// o mesmo nome usado pelo Service Worker (tools/build-sw.ts). A demo (docs/DEMO.md) usa outro prefixo, que NÃO começa
// com 'pingo-': no GitHub Pages ela divide o domínio com o jogo completo e a faxina de um não pode apagar o cache do outro
const CACHE_DADOS = DEMO ? 'pingodemo-dados' : 'pingo-dados';
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

async function lerLista(): Promise<Lista> {
  const r = await fetch('pingo-arquivos.json');
  if (!r.ok) throw new Error('lista de arquivos indisponível');
  return (await r.json()) as Lista;
}

/** guarda no cache o resto do pacote da lista dada; `atualizacao`: download de uma versão nova com o jogo aberto */
async function baixarResto(lista: Lista, atualizacao = false): Promise<boolean> {
  // sprites, arenas e zonas ficam num cache só, com o hash na chave: o que não muda entre versões não é baixado de novo
  const chave = (a: Entrada) => new URL(a[0], location.href).href + '?h=' + a[1];
  const alvo = lista.arquivos.filter((a) => a[3] === 'r');
  const nucleo = lista.arquivos.filter((a) => a[3] === 'n').length;
  offline.total = alvo.length + nucleo;
  const cache = await caches.open(CACHE_DADOS);
  const ja = new Set((await cache.keys()).map((q) => q.url));
  const falta = alvo.filter((a) => !ja.has(chave(a)));
  offline.feitos = offline.total - falta.length;
  if (falta.length && !atualizacao) offline.estado = 'baixando';
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
    if (!atualizacao) avisar(`Guardando o jogo para jogar sem internet: ${Math.floor((offline.feitos / offline.total) * 100)}%`);
    if (falhas > 20) break; // a rede caiu: continua na próxima abertura
  }
  // a página aberta continua na versão antiga: os arquivos dela ficam no cache até o recarregamento
  if (atualizacao) return falhas === 0;
  if (falta.length) offline.tempoMs = Math.round(performance.now() - t0);
  if (falhas) { offline.estado = 'falhou'; avisar('Sem rede: o download continua na próxima abertura.', 5000); return false; }
  // faxina: chaves de versões antigas (hash que não está mais na lista) saem do cache
  const validas = new Set(lista.arquivos.map(chave));
  for (const q of ja) if (!validas.has(q)) void cache.delete(q).catch(() => undefined);
  offline.estado = 'pronto';
  if (falta.length) avisar('Pronto: o jogo já funciona sem internet.', 5000);
  return true;
}

/* ------------------------------ versão nova com o jogo aberto ------------------------------ */
let botao: HTMLElement | null = null, conferindo = false, ultimaBusca = 0;
const emBatalha = () => !!document.querySelector('.tela.batalha');

function mostrarAtualizacao() {
  if (botao || typeof document === 'undefined') return;
  const b = botao = document.createElement('div'); b.id = 'aviso-atualizacao';
  b.setAttribute('role', 'button');
  b.textContent = 'Atualização disponível: toque para recarregar';
  b.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top, 0px) + 6px);transform:translateX(-50%);z-index:1100;'
    + 'padding:4px 12px;background:#1a1423;color:#ffe9a8;border:2px solid #ffc94d;font:bold 11px/16px ui-monospace,Menlo,Consolas,monospace;'
    + 'white-space:nowrap;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;display:none';
  // o toque é do aviso: não chega aos controles do jogo
  for (const ev of ['pointerdown', 'touchstart', 'mousedown'] as const) b.addEventListener(ev, (e) => e.stopPropagation());
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (emBatalha()) return;
    b.textContent = 'Recarregando...';
    try { gravarRetomada(); } catch { /* fora de um jogo não há o que guardar */ }
    location.reload();
  });
  document.body.append(b);
  // some durante as batalhas e volta quando elas terminam; nunca cobre o relógio do HUD do mapa
  const acertar = () => { b.style.display = emBatalha() ? 'none' : 'block'; if (b.style.display === 'block') posicionarAviso(b); };
  acertar(); window.setInterval(acertar, 1000);
  window.addEventListener('resize', acertar); window.addEventListener('orientationchange', () => window.setTimeout(acertar, 120));
}
/**
 * Lugar do aviso: no alto, centralizado. Se ali ele cobrir o relógio do HUD (iPhone em pé: a tela do jogo ocupa a
 * largura toda), desce para logo abaixo da tela do jogo, no espaço livre acima dos controles de toque; sem espaço
 * embaixo, encosta à esquerda do relógio.
 */
function posicionarAviso(b: HTMLElement) {
  b.style.top = 'calc(env(safe-area-inset-top, 0px) + 6px)'; b.style.left = '50%'; b.style.transform = 'translateX(-50%)';
  const rel = document.querySelector('.hud-mapa > .mol')?.getBoundingClientRect();
  const tela = document.getElementById('tela')?.getBoundingClientRect();
  const cruza = (a: DOMRect, c: DOMRect) => a.left < c.right + 4 && c.left < a.right + 4 && a.top < c.bottom + 4 && c.top < a.bottom + 4;
  let r = b.getBoundingClientRect();
  // sem HUD visível (título, menus), confere com o canto do relógio na tela do jogo
  const alvo = rel && rel.width ? rel : tela ? new DOMRect(tela.left + tela.width * (268 / 320), tela.top, tela.width * (52 / 320), tela.height * (20 / 180)) : null;
  if (!alvo || !cruza(r, alvo)) return;
  // o espaço livre embaixo vai até o primeiro controle de toque (ou até o fim da janela)
  const fim = tela?.bottom ?? window.innerHeight;
  const limite = Math.min(window.innerHeight, ...[...document.querySelectorAll<HTMLElement>('#toque.ativo .tq, #toque.ativo .tq-zona')].map((e) => e.getBoundingClientRect().top).filter((y) => y > fim));
  if (tela && limite - tela.bottom >= r.height + 12) { b.style.top = Math.round(tela.bottom + 8) + 'px'; return; }
  b.style.left = Math.max(4, Math.round(alvo.left - 8 - r.width)) + 'px'; b.style.transform = 'none';
  r = b.getBoundingClientRect();
  if (cruza(r, alvo)) b.style.top = Math.round(alvo.bottom + 6) + 'px';
}
/** mostra o aviso de versão nova (usado pelos testes de interface; no jogo ele aparece sozinho) */
export const mostrarAvisoAtualizacao = mostrarAtualizacao;

/** confere se o Service Worker já serve uma versão diferente da desta página; se sim, baixa o que mudou e avisa */
async function conferirVersao() {
  if (conferindo || offline.versaoNova || !offline.versao) return;
  conferindo = true;
  try {
    const lista = await lerLista();
    if (lista.v !== offline.versao && (await baixarResto(lista, true))) { offline.versaoNova = lista.v; mostrarAtualizacao(); }
  } catch { /* sem rede: tenta de novo na próxima conferência */ }
  conferindo = false;
}

export async function iniciarOffline(): Promise<void> {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || typeof window === 'undefined') return;
  if (plataforma.alvo !== 'web' && plataforma.alvo !== 'pwa') return;
  // pacotes do itch.io (VITE_SEM_SW=1, docs/DEMO.md): o jogo roda num iframe de outro domínio; sem Service Worker
  if (import.meta.env.VITE_SEM_SW === '1') return;
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
    // o Service Worker de uma versão nova assume o controle assim que instala: é o sinal de que há atualização
    sw.addEventListener('controllerchange', () => void conferirVersao());
    const lista = await lerLista();
    // se a lista já não cita o código desta página, o Service Worker trocou de versão enquanto ela abria
    const eu = decodeURIComponent(new URL(import.meta.url).href.slice(new URL('./', location.href).href.length));
    const antiga = !lista.arquivos.some((q) => q[0] === eu);
    offline.versao = antiga ? 'anterior a ' + lista.v : lista.v;
    if ((await baixarResto(lista)) && antiga) { offline.versaoNova = lista.v; mostrarAtualizacao(); }
    // procura versão nova nesta sessão e sempre que o jogo volta ao primeiro plano (o PWA do iPhone fica dias aberto)
    const buscar = () => {
      if (!navigator.onLine || performance.now() - ultimaBusca < 60000 && ultimaBusca) return;
      ultimaBusca = performance.now();
      void reg.update().then(() => conferirVersao()).catch(() => undefined);
    };
    buscar();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') buscar(); });
    void conferirVersao();
  } catch (e) {
    offline.estado = 'falhou';
    console.warn('[pingo] modo sem internet indisponível:', e);
  }
}
void iniciarOffline();
