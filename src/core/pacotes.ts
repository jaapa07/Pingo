/**
 * PACOTES DE ARQUIVOS (só nos pacotes do itch.io: `npm run build:itch` e `build:itch:completo`, `VITE_PACOTES=1`;
 * docs/DEMO.md). No build normal este módulo não faz nada (o Vite troca a condição por `false` e o código some).
 *
 * Por quê: o itch.io aceita no máximo ~1000 arquivos por .zip de jogo HTML, e o jogo tem ~15 mil (bakes das zonas,
 * sprites, arenas). tools/build-pacote.ts junta `assets/zonas/<zona>/`, `assets/arenas/` e `assets/sprites/` em poucos
 * arquivos `pacotes/*.bin` (bytes concatenados) com um índice `pacotes/indice.json` (caminho → pacote, início,
 * tamanho). Aqui, antes de o jogo começar, três pontos do navegador passam a entender esses caminhos:
 *  - `fetch('assets/…')` → responde do pacote (com o content-type certo);
 *  - `img.src = 'assets/…'` (pré-carga, fotos) → blob: do pacote;
 *  - estilos com `url(assets/…)` (`backgroundImage`, `background`, `cssText`, `setProperty`) → blob: do pacote.
 * Cada pacote é baixado uma vez, na primeira vez em que algum arquivo dele é pedido (uma zona ao entrar nela, a
 * criatura ao aparecer). Enquanto ele chega, o estilo fica com uma imagem vazia e é trocado quando o pacote termina,
 * se ninguém tiver mudado o valor nesse meio-tempo. Nada disso existe no site, no PC nem no iPhone.
 */
interface Indice { pacotes: string[]; arquivos: Record<string, [pacote: number, inicio: number, bytes: number]> }

const MIME: Record<string, string> = { png: 'image/png', json: 'application/json', webp: 'image/webp', svg: 'image/svg+xml', txt: 'text/plain' };
const VAZIA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const URL_CSS = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
/** pastas que o build do itch empacota (tools/build-pacote.ts) */
const PASTAS = /^assets\/(zonas|arenas|sprites)\//;

function instalar() {
  const BASE = new URL('./', location.href).href;
  const fetchOriginal = window.fetch.bind(window);
  let indice: Indice | null = null;
  const pronto: Promise<Indice | null> = fetchOriginal('pacotes/indice.json').then((r) => (r.ok ? (r.json() as Promise<Indice>) : null)).catch(() => null).then((i) => (indice = i));
  const pacotes = new Map<number, Promise<Blob>>(), carregados = new Map<number, Blob>(), blobs = new Map<string, string>();

  /** caminho relativo à pasta do jogo (`assets/…`) da URL; null se for de fora dela ou data:/blob: */
  const relativo = (u: string): string | null => {
    if (typeof u !== 'string' || !u || u.startsWith('data:') || u.startsWith('blob:')) return null;
    let href: string; try { href = new URL(u, document.baseURI).href; } catch { return null; }
    return href.startsWith(BASE) ? decodeURIComponent(href.slice(BASE.length).split(/[?#]/)[0]) : null;
  };
  /** o arquivo está (ou, antes de o índice chegar, pode estar) num pacote */
  const empacotado = (c: string | null): c is string => !!c && (indice ? !!indice.arquivos[c] : PASTAS.test(c));
  const tipo = (c: string) => MIME[c.slice(c.lastIndexOf('.') + 1).toLowerCase()] ?? 'application/octet-stream';
  const pacote = (n: number): Promise<Blob> => {
    let p = pacotes.get(n);
    if (!p) {
      p = fetchOriginal('pacotes/' + indice!.pacotes[n]).then((r) => { if (!r.ok) throw new Error('pacote ' + indice!.pacotes[n] + ': ' + r.status); return r.blob(); });
      p.then((b) => carregados.set(n, b), () => pacotes.delete(n)); // falhou (rede): tenta de novo no próximo pedido
      pacotes.set(n, p);
    }
    return p;
  };
  const pedaco = (b: Blob, c: string) => { const [, ini, n] = indice!.arquivos[c]; return b.slice(ini, ini + n, tipo(c)); };
  /** blob: do arquivo, se o pacote dele já chegou (síncrono) */
  const blobJa = (c: string): string | null => {
    const u = blobs.get(c); if (u) return u;
    const b = carregados.get(indice!.arquivos[c][0]); if (!b) return null;
    const novo = URL.createObjectURL(pedaco(b, c)); blobs.set(c, novo); return novo;
  };
  /** blob: do arquivo, baixando o pacote se preciso */
  const blobDe = async (c: string): Promise<string> => { await pacote(indice!.arquivos[c][0]); return blobJa(c)!; };

  /** reescreve os url(…) empacotados de um valor de CSS; os que ainda não chegaram viram uma imagem vazia marcada com o
   *  caminho (`data:…#assets/…`), trocada por `completar` quando o pacote chegar */
  const reescrever = (v: string): { agora: string; faltam: string[] } => {
    const faltam: string[] = [];
    const agora = v.replace(URL_CSS, (m, _q, u: string) => {
      const c = relativo(u); if (!empacotado(c)) return m;
      const b = indice ? blobJa(c) : null; if (b) return `url("${b}")`;
      faltam.push(c); return `url("${VAZIA}#${c}")`;
    });
    return { agora, faltam };
  };
  const PROPS_IMAGEM = ['background-image', 'mask-image', '-webkit-mask-image', 'border-image-source', 'list-style-image', 'content'];
  const setProperty = CSSStyleDeclaration.prototype.setProperty;
  /** troca as imagens vazias marcadas pelos blob: assim que os pacotes chegam (se o estilo ainda as tiver) */
  const completar = (alvo: CSSStyleDeclaration, faltam: string[]) => {
    void pronto.then(async () => {
      for (const c of new Set(faltam)) {
        if (!empacotado(c)) continue;
        const blob = await blobDe(c).catch(() => null); if (!blob) continue;
        const marca = `${VAZIA}#${c}`;
        for (const p of PROPS_IMAGEM) {
          const v = alvo.getPropertyValue(p);
          if (v.includes(marca)) setProperty.call(alvo, p, v.split(marca).join(blob), alvo.getPropertyPriority(p));
        }
      }
    });
  };
  const aplicar = (alvo: CSSStyleDeclaration, v: unknown, gravar: (x: unknown) => void) => {
    if (typeof v !== 'string' || !v.includes('url(')) { gravar(v); return; }
    const r = reescrever(v); gravar(r.agora); if (r.faltam.length) completar(alvo, r.faltam);
  };

  // estilos: no Chromium as propriedades de CSSStyleDeclaration (backgroundImage…) são do próprio objeto, sem setter
  // no protótipo; então `elemento.style` passa a devolver um Proxy (um por declaração) que reescreve os url(…) ao gravar
  const proxies = new WeakMap<CSSStyleDeclaration, CSSStyleDeclaration>();
  /** `style` original do HTMLElement (sem Proxy) */
  const estiloCru = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style')?.get;
  const ligados = new WeakMap<CSSStyleDeclaration, Map<PropertyKey, unknown>>();
  const manejo: ProxyHandler<CSSStyleDeclaration> = {
    get(t, p) {
      const v = Reflect.get(t, p, t);
      if (typeof v !== 'function') return v;
      let m = ligados.get(t); if (!m) ligados.set(t, (m = new Map()));
      let f = m.get(p); if (!f) m.set(p, (f = (v as (...a: unknown[]) => unknown).bind(t)));
      return f;
    },
    set(t, p, v) { aplicar(t, v, (x) => Reflect.set(t, p, x, t)); return true; },
  };
  for (const classe of [HTMLElement, SVGElement]) {
    const d = Object.getOwnPropertyDescriptor(classe.prototype, 'style');
    if (!d?.get || !d.configurable) continue;
    const get = d.get, set = d.set;
    Object.defineProperty(classe.prototype, 'style', {
      ...d,
      get(this: HTMLElement) { const s = get.call(this) as CSSStyleDeclaration; let px = proxies.get(s); if (!px) proxies.set(s, (px = new Proxy(s, manejo))); return px; },
      set(this: HTMLElement, v: string) { if (set) aplicar(get.call(this) as CSSStyleDeclaration, v, (x) => set.call(this, x)); },
    });
  }
  CSSStyleDeclaration.prototype.setProperty = function (this: CSSStyleDeclaration, nome: string, v: string | null, prio?: string) {
    aplicar(this, v, (x) => setProperty.call(this, nome, x as string | null, prio));
  };
  // atributo style escrito direto (setAttribute)
  const setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (this: Element, nome: string, v: string) {
    if (nome.toLowerCase() !== 'style' || typeof v !== 'string' || !v.includes('url(')) return setAttribute.call(this, nome, v);
    const r = reescrever(v); setAttribute.call(this, nome, r.agora);
    if (r.faltam.length && estiloCru && this instanceof HTMLElement) completar(estiloCru.call(this) as CSSStyleDeclaration, r.faltam);
  };

  const marcarImg = new WeakMap<HTMLImageElement, number>();
  const acharDescritor = (obj: object, prop: string): [object, PropertyDescriptor] | null => {
    for (let o: object | null = obj; o; o = Object.getPrototypeOf(o)) { const d = Object.getOwnPropertyDescriptor(o, prop); if (d) return [o, d]; }
    return null;
  };

  // imagens: src empacotado vira blob: (na hora, se o pacote já chegou; senão quando chegar)
  const dImg = acharDescritor(HTMLImageElement.prototype, 'src');
  if (dImg?.[1].set) {
    const [dono, d] = dImg, set = d.set!;
    Object.defineProperty(dono, 'src', {
      ...d,
      set(this: HTMLImageElement, v: string) {
        const n = (marcarImg.get(this) ?? 0) + 1, c = relativo(v); marcarImg.set(this, n);
        if (!empacotado(c)) { set.call(this, v); return; }
        const ja = indice ? blobJa(c) : null;
        if (ja) { set.call(this, ja); return; }
        void pronto.then(() => (empacotado(c) ? blobDe(c) : v)).then((u) => { if (marcarImg.get(this) === n) set.call(this, u); }, () => { if (marcarImg.get(this) === n) set.call(this, v); });
      },
    });
  }

  // fetch: arquivos empacotados respondem do pacote
  window.fetch = async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const u = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    if ((init?.method ?? (entrada instanceof Request ? entrada.method : 'GET')).toUpperCase() === 'GET') {
      const c = relativo(u);
      if (empacotado(c) && (await pronto) && empacotado(c)) {
        try { const b = pedaco(await pacote(indice!.arquivos[c][0]), c); return new Response(b, { status: 200, headers: { 'content-type': tipo(c), 'content-length': String(b.size) } }); }
        catch { return new Response('', { status: 504, statusText: 'pacote indisponível' }); }
      }
    }
    return fetchOriginal(entrada, init);
  };
  (window as unknown as { __pingoPacotes: unknown }).__pingoPacotes = { pronto, carregados: () => [...carregados.keys()].map((n) => indice?.pacotes[n]) };
}

if (import.meta.env.VITE_PACOTES === '1' && typeof window !== 'undefined') instalar();
export {};
