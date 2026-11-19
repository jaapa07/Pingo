/**
 * Teste de verdade do pacote offline (`npm run test:offline`): serve `dist/` em http://localhost:5300/Pingo/
 * (subpasta, como no GitHub Pages) e, em três aparelhos (PC com teclado; iPhone 13 em pé e deitado, só toque):
 *  1. abre com rede, espera o Service Worker instalar e o pacote inteiro entrar no cache (mede o tempo);
 *  2. corta a rede (`context.setOffline(true)`) e recarrega;
 *  3. começa um jogo novo pela interface (título → jogos → dificuldade → abertura → nome → quarto);
 *  4. anda pelo quarto; recebe o inicial pelo evento real da cuia; vai à Rota 1 e anda no capim até um
 *     encontro; luta até o fim; salva pelo menu;
 *  5. recarrega (ainda sem rede), continua o jogo salvo e confere lugar e equipe.
 * Nenhuma requisição pode falhar sem rede. Atalhos assumidos (para o teste caber em minutos): relógio
 * acelerado 3×, o evento da cuia é chamado direto (em vez de andar até o laboratório) e a ida à Rota 1 usa
 * `mundo.irPara`. Capturas em docs/capturas/offline/.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { servir } from './servidor';

const RAIZ = new URL('../..', import.meta.url).pathname;
const CAPTURAS = RAIZ + 'docs/capturas/offline/';
const PORTA = Number(process.env.PORTA_OFFLINE ?? 5300);
const TURBO = 3;
/* eslint-disable @typescript-eslint/no-explicit-any */
const req = createRequire(import.meta.url);
let pw: any;
try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }

interface Perfil { id: string; nome: string; toque: boolean; opcoes: Record<string, unknown> }
const iphone = pw.devices['iPhone 13'];
const PERFIS: Perfil[] = [
  { id: 'pc', nome: 'PC (1280×720, teclado)', toque: false, opcoes: { viewport: { width: 1280, height: 720 } } },
  { id: 'iphone-pe', nome: 'iPhone 13 em pé (toque)', toque: true, opcoes: { ...iphone } },
  { id: 'iphone-deitado', nome: 'iPhone 13 deitado (toque)', toque: true, opcoes: { ...iphone, viewport: { width: iphone.viewport.height, height: iphone.viewport.width }, screen: { width: iphone.viewport.height, height: iphone.viewport.width } } },
];
export interface ResultadoOffline { perfil: string; ok: boolean; passos: string[]; falhas: string[]; precacheMs: number; arquivos: number; bytes: number; pedidosSemRede: number }

type Acao = 'a' | 'b' | 'menu' | 'select' | 'cima' | 'baixo' | 'esq' | 'dir';
const TECLA: Record<Acao, string> = { a: 'KeyZ', b: 'KeyX', menu: 'Escape', select: 'KeyV', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' };

async function rodarPerfil(browser: any, url: string, perfil: Perfil, srv: { pedidos: number; bytes: number; caminhos: string[] }): Promise<ResultadoOffline> {
  const r: ResultadoOffline = { perfil: perfil.nome, ok: false, passos: [], falhas: [], precacheMs: 0, arquivos: 0, bytes: 0, pedidosSemRede: 0 };
  const ctx = await browser.newContext({ ...perfil.opcoes, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const cdp = perfil.toque ? await ctx.newCDPSession(page) : null;
  let semRede = false;
  page.on('pageerror', (e: unknown) => r.falhas.push('erro na página: ' + String(e).slice(0, 200)));
  page.on('console', (m: any) => { if (m.type() === 'error') r.falhas.push('console: ' + m.text().slice(0, 200)); });
  page.on('requestfailed', (q: any) => { if (semRede) r.falhas.push('requisição falhou sem rede: ' + q.url().replace(url, '')); });
  page.on('response', (q: any) => { if (semRede && q.status() >= 400) r.falhas.push(`resposta ${q.status()} sem rede: ` + q.url().replace(url, '')); });
  await page.addInitScript((k: number) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    (window as any).setTimeout = (f: TimerHandler, ms?: number, ...a: unknown[]) => st(f, (ms || 0) / k, ...a);
  }, TURBO);
  // a captura é registro, não critério: se o navegador demorar (acontece com a rede cortada), tenta pelo CDP e segue
  const foto = async (nome: string) => {
    const arq = `${CAPTURAS}${perfil.id}-${nome}.png`;
    try { await page.screenshot({ path: arq, timeout: 8000 }); return; } catch { /* tenta pelo CDP */ }
    try { const c = cdp ?? (await ctx.newCDPSession(page)); const r = await c.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(arq, Buffer.from(r.data, 'base64')); }
    catch { console.log(`  [${perfil.id}] (captura ${nome} não saiu)`); }
  };
  const passo = (t: string) => { r.passos.push(t); console.log(`  [${perfil.id}] ${t}`); };
  const dormir = (ms: number) => page.waitForTimeout(ms);
  const st = () => page.evaluate(() => {
    const p = (window as any).__pingo, m = p?.mundo, s = p?.jogo?.save;
    return {
      telas: (p?.telas?.pilha ?? []).map((t: any) => String(t.el.className)) as string[], cortina: !!p?.telas?.ocupada,
      pronto: !!m?.pronto, oc: !!m?.ocupado, zona: m?.pronto ? (m.zona?.id as string) : '', x: m?.jogador?.x as number, y: m?.jogador?.y as number, mov: !!m?.jogador?.movendo,
      equipe: (s?.equipe ?? []).map((c: any) => `${c.especie}:${c.nivel}:${c.exp}`) as string[], nome: s?.jogador?.nome as string, flags: Object.keys(s?.flags ?? {}).length,
    };
  });
  type St = Awaited<ReturnType<typeof st>>;
  const topo = (s: St) => s.telas[s.telas.length - 1] ?? '';

  /* ----- controles: teclado no PC; dedo (CDP) nos botões virtuais no iPhone ----- */
  const alvo = async (a: Acao): Promise<[number, number]> => {
    // (sem funções nomeadas aqui dentro: o tsx embrulha funções nomeadas com um auxiliar que não existe na página)
    const cx = await page.evaluate((acao: string) => {
      const idx: Record<string, number> = { a: 1, b: 2, menu: 3, select: 4 };
      const q = (document.querySelectorAll('#toque > .tq')[acao in idx ? idx[acao] : 0] as HTMLElement).getBoundingClientRect();
      const d: Record<string, [number, number]> = { cima: [0, -0.32], baixo: [0, 0.32], esq: [-0.32, 0], dir: [0.32, 0] };
      const [dx, dy] = d[acao] ?? [0, 0];
      return [q.left + q.width / 2 + dx * q.width, q.top + q.height / 2 + dy * q.height];
    }, a);
    return [cx[0], cx[1]];
  };
  const baixar = async (a: Acao) => { if (cdp) { const [x, y] = await alvo(a); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); } else await page.keyboard.down(TECLA[a]); };
  const soltar = async (a: Acao) => { if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.keyboard.up(TECLA[a]); };
  const apertar = async (a: Acao, ms = 50) => { await baixar(a); await dormir(ms); await soltar(a); await dormir(60); };
  /** tela de nome/apelido: leva o foco ao botão "Fim" com o direcional e confirma com A (no PC, Enter: a tecla Z escreveria a letra z) */
  const foco = () => page.evaluate(() => { const f = document.querySelector('.tecla.foco'); return f ? [...document.querySelectorAll('.tecla')].indexOf(f) : -1; });
  const confirmarNome = async () => {
    const total = await page.evaluate(() => document.querySelectorAll('.tecla').length);
    for (let i = 0; i < 6 && (await foco()) < total - 4; i++) await apertar('cima');
    for (let i = 0; i < 5 && (await foco()) !== total - 1; i++) await apertar('dir');
    await dormir(120);
    if (cdp) await apertar('a'); else { await page.keyboard.down('Enter'); await dormir(60); await page.keyboard.up('Enter'); }
    await dormir(200);
  };
  /** aperta A até a condição valer (falas, confirmações, cenas) */
  const avancar = async (ate: (s: St) => boolean, max = 120000, oque = '') => {
    const t0 = Date.now();
    for (;;) {
      const s = await st(); if (ate(s)) return s;
      if (Date.now() - t0 > max) throw new Error(`tempo esgotado esperando ${oque}: ${JSON.stringify(s)}`);
      if (s.cortina) await dormir(80); else if (/tela-nome/.test(topo(s))) await confirmarNome(); else await apertar('a');
      await dormir(90);
    }
  };
  const livre = (s: St) => s.pronto && !s.oc && !s.cortina && s.telas.length === 1 && /mundo/.test(topo(s)) && !s.mov;
  const andar = async (d: Acao): Promise<boolean> => {
    const a = await st(); await baixar(d);
    const t0 = Date.now(); let b = a;
    while (Date.now() - t0 < 900) { b = await st(); if (b.x !== a.x || b.y !== a.y || b.zona !== a.zona || !livre({ ...b, mov: false })) break; await dormir(15); }
    await soltar(d);
    for (let i = 0; i < 40; i++) { b = await st(); if (!b.mov) break; await dormir(20); }
    return b.x !== a.x || b.y !== a.y;
  };

  try {
    /* 1. com rede: instala e guarda tudo */
    const p0 = srv.pedidos, b0 = srv.bytes, t0 = Date.now();
    await page.goto(url);
    await page.waitForFunction(() => { const o = (window as any).__pingoOffline; return o && (o.estado === 'pronto' || o.estado === 'falhou'); }, null, { timeout: 420000, polling: 250 });
    const off = await page.evaluate(() => ({ ...(window as any).__pingoOffline }));
    if (off.estado !== 'pronto') throw new Error('o pacote não terminou de entrar no cache: ' + JSON.stringify(off));
    r.precacheMs = Date.now() - t0; r.arquivos = srv.pedidos - p0; r.bytes = srv.bytes - b0;
    const controlada = await page.evaluate(() => !!navigator.serviceWorker.controller);
    passo(`SW instalado e pacote no cache: ${off.total} arquivos em ${(r.precacheMs / 1000).toFixed(1)} s (${r.arquivos} pedidos, ${(r.bytes / 1048576).toFixed(1)} MB); página controlada: ${controlada}; armazenamento persistente: ${off.persistente}`);
    const manifesto = await page.evaluate(async () => { const l = document.querySelector('link[rel=manifest]') as HTMLLinkElement | null; if (!l) return null; const j = await (await fetch(l.href)).json(); return { nome: j.name, display: j.display, icones: j.icons.length, apple: !!document.querySelector('link[rel=apple-touch-icon]') }; });
    if (!manifesto || !manifesto.apple || manifesto.icones < 4) r.falhas.push('manifest ou ícone da Apple ausente'); else passo(`manifest: "${manifesto.nome}", display ${manifesto.display}, ${manifesto.icones} ícones + apple-touch-icon`);

    /* 2. sem rede */
    await ctx.setOffline(true); semRede = true;
    const pedidosAntes = srv.pedidos;
    await page.reload();
    await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 30000 });
    passo('rede cortada; recarregou e o jogo abriu do cache');
    await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
    await avancar((s) => /titulo/.test(topo(s)) && !s.cortina, 30000, 'o título'); await dormir(400); await foto('1-titulo');

    /* 3. jogo novo pela interface */
    await avancar((s) => /tela-saves/.test(topo(s)) && !s.cortina, 30000, 'a tela de jogos'); await foto('2-jogos');
    const sNome = await avancar((s) => /tela-nome/.test(topo(s)) || (livre(s) && s.zona === 'A1-quarto' && s.flags > 2), 180000, 'a abertura chegar ao nome');
    if (/tela-nome/.test(topo(sNome))) {
      // o nome já vem sugerido; no toque, escreve mais duas letras no teclado da tela antes de confirmar
      await dormir(300);
      if (cdp) { await apertar('dir'); await apertar('a'); await apertar('baixo'); await apertar('a'); }
      await foto('3-nome');
      await confirmarNome();
      for (let i = 0; i < 20 && /tela-nome/.test(topo(await st())); i++) { await dormir(150); if (i === 8) await confirmarNome(); }
      if (/tela-nome/.test(topo(await st()))) throw new Error('a tela de nome não fechou');
    }
    let s = await avancar((q) => livre(q) && q.zona === 'A1-quarto' && !/tela-nome/.test(topo(q)), 180000, 'acordar no quarto');
    if (!s.nome) r.falhas.push('o nome do jogador ficou vazio');
    passo(`jogo novo começado pela interface; ${s.nome} acordou em ${s.zona} (${s.x},${s.y})`);
    await dormir(300); await foto('4-quarto');

    /* 4. andar */
    let passosDados = 0;
    for (const d of ['esq', 'esq', 'baixo', 'dir', 'dir', 'dir', 'cima', 'esq'] as Acao[]) { if (!livre(await st())) await avancar(livre, 20000, 'ficar livre'); if (await andar(d)) passosDados++; }
    s = await st();
    if (passosDados < 3) r.falhas.push(`o jogador quase não andou no quarto (${passosDados} passos)`);
    passo(`andou ${passosDados} passos no quarto com ${perfil.toque ? 'o direcional de toque' : 'as setas'} → (${s.x},${s.y})`);

    /* inicial pelo evento real da cuia */
    void page.evaluate(() => { void (window as any).__pingo.mundo.rodarEvento('lab-cuia-mata'); });
    await dormir(300);
    s = await avancar((q) => q.equipe.length > 0 && livre(q), 120000, 'receber o inicial');
    passo(`recebeu o inicial pelo evento da cuia: equipe ${s.equipe.join(' ')}`);

    /* Rota 1: capim até um encontro */
    const capim = await page.evaluate(async () => {
      const m = (window as any).__pingo.mundo;
      await m.irPara('A-R1', 14, 78, 'n', 'nenhuma');
      for (let y = 1; y < 80; y++) for (let x = 1; x < 29; x++) if (m.tile(x, y) === '"' && m.tile(x + 1, y) === '"' && m.tile(x + 2, y) === '"') return [x, y];
      return null;
    });
    if (!capim) throw new Error('não achei capim alto na Rota 1');
    await page.evaluate(async (c: number[]) => { await (window as any).__pingo.mundo.irPara('A-R1', c[0] + 1, c[1], 'l', 'fade'); }, capim);
    await avancar(livre, 20000, 'chegar à Rota 1'); await dormir(300); await foto('5-rota');
    const emBatalha = (q: St) => q.telas.some((t: string) => /batalha/.test(t));
    let encontro = false, tentativas = 0;
    for (; tentativas < 160 && !encontro; tentativas++) {
      await andar(tentativas % 2 ? 'esq' : 'dir');
      const q = await st(); if (emBatalha(q) || q.oc || q.cortina) { for (let i = 0; i < 60 && !encontro; i++) { encontro = emBatalha(await st()); if (!encontro) await dormir(50); } }
    }
    let forcado = false;
    if (!encontro) { forcado = true; void page.evaluate(() => { void (window as any).__pingo.mundo.batalhaSelvagem(10, 3); }); await page.waitForFunction(() => (window as any).__pingo.telas.pilha.some((t: any) => /batalha/.test(t.el.className)), null, { timeout: 20000 }); }
    passo(forcado ? `sem encontro em ${tentativas} passos no capim: batalha selvagem chamada direto` : `encontro selvagem no capim depois de ${tentativas} passos`);
    await dormir(2500 / TURBO + 600); await foto('6-batalha');
    const antes = (await st()).equipe.join(' ');
    let fotoMeio = false; const tb = Date.now();
    for (;;) {
      const q = await st();
      if (!emBatalha(q) && livre(q)) break;
      if (Date.now() - tb > 240000) throw new Error('a batalha não terminou: ' + JSON.stringify(q));
      if (!q.cortina) await apertar('a');
      if (!fotoMeio && Date.now() - tb > 6000) { fotoMeio = true; await foto('7-batalha-golpe'); }
      await dormir(120);
    }
    const fim = await page.evaluate(() => { const b = (window as any).__pingo.mundo.ultimaBatalha; return b ? JSON.stringify(b).slice(0, 160) : ''; });
    s = await st();
    // perder também vale: o jogo leva o jogador de volta para casa (a batalha é de verdade, com o acaso do jogo)
    passo(`batalha jogada até o fim com ${perfil.toque ? 'o botão A de toque' : 'a tecla A'}: equipe ${antes} → ${s.equipe.join(' ')}; depois dela, ${s.zona} (${s.x},${s.y})${s.zona === 'A-R1' ? '' : ' — a criatura desmaiou e o jogo voltou para casa'} ${fim.slice(0, 60)}`);
    if (!s.equipe.length) r.falhas.push('a equipe sumiu depois da batalha');

    /* salvar pelo menu */
    const idx = await page.evaluate(() => { const v = (window as any).__pingo.jogo.save; let n = 0; if (v.mochila['diario-de-campo'] || v.flags['ovo-entregue'] || v.diario.visto.length) n++; if (v.equipe.length) n++; n++; if (v.mochila['radio-cipo'] || v.flags['intro-ok']) n++; return n + 1; });
    const zonaAoSalvar = (await st()).zona;
    await apertar('menu'); await dormir(500);
    let q = await st(); if (!/menu/.test(topo(q))) throw new Error('o menu não abriu: ' + JSON.stringify(q.telas));
    for (let i = 0; i < idx; i++) { await apertar('baixo'); await dormir(120); }
    await foto('8-menu-salvar');
    await apertar('a'); await dormir(500); await apertar('a'); await dormir(600);
    const salvo = await page.evaluate(() => { const p = (window as any).__pingo; const l = p.save.listarSlots()[p.jogo.slot]; return l ? { zona: l.zona, equipe: l.equipe, idade: Date.now() - l.quando, slot: p.jogo.slot } : null; });
    if (!salvo || salvo.idade > 20000 || salvo.zona !== zonaAoSalvar) throw new Error(`o Salvar do menu não gravou o jogo (estava em ${zonaAoSalvar}): ` + JSON.stringify(salvo));
    await foto('9-salvou');
    for (let i = 0; i < 6; i++) { q = await st(); if (livre(q)) break; await apertar(/menu/.test(topo(q)) ? 'b' : 'a'); await dormir(250); }
    s = await st();
    const guardado = await page.evaluate(async () => { const idb = await new Promise<string | null>((ok) => { const p = indexedDB.open('pingo', 1); p.onsuccess = () => { try { const g = p.result.transaction('kv', 'readonly').objectStore('kv').get('pingo.slot.0'); g.onsuccess = () => ok(typeof g.result === 'string' ? g.result : null); g.onerror = () => ok(null); } catch { ok(null); } }; p.onerror = () => ok(null); }); return { ls: !!localStorage.getItem('pingo.slot.0'), idb: !!idb }; });
    passo(`salvou pelo menu (jogo ${salvo.slot + 1}, ${salvo.zona}); gravado em localStorage: ${guardado.ls}, IndexedDB: ${guardado.idb}`);
    if (!guardado.ls || !guardado.idb) r.falhas.push('o save não está nos dois armazenamentos (localStorage e IndexedDB)');

    /* 5. recarrega sem rede e continua */
    const esperado = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' '), nome: s.nome };
    await page.reload();
    await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 30000 });
    await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
    await avancar((k) => /tela-saves/.test(topo(k)) && !k.cortina, 30000, 'a tela de jogos na volta'); await dormir(300); await foto('10-continuar');
    s = await avancar((k) => livre(k) && k.zona !== '', 60000, 'continuar o jogo salvo');
    const voltou = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' '), nome: s.nome };
    if (JSON.stringify(voltou) !== JSON.stringify(esperado)) r.falhas.push(`o jogo continuado não bate com o salvo: ${JSON.stringify(voltou)} ≠ ${JSON.stringify(esperado)}`);
    const andou = (await andar('dir')) || (await andar('esq')) || (await andar('baixo')) || (await andar('cima'));
    await dormir(300); await foto('11-continuou');
    passo(`recarregou sem rede e continuou: ${voltou.nome} em ${voltou.zona} (${voltou.x},${voltou.y}), equipe ${voltou.equipe}; voltou a andar: ${andou}`);
    // o navegador ainda confere se há sw.js novo a cada abertura (essa checagem não passa pelo corte de rede do
    // Playwright e, sem rede de verdade, apenas falha em silêncio); qualquer outro pedido é erro
    const vazou = srv.caminhos.slice(pedidosAntes).filter((c) => c !== 'sw.js');
    r.pedidosSemRede = vazou.length;
    if (vazou.length) r.falhas.push(`${vazou.length} pedido(s) chegaram ao servidor com a rede cortada: ${vazou.slice(0, 5).join(', ')}`);
    // nada atrás do entalhe: a tela do jogo fica dentro da área segura
    const dentro = await page.evaluate(() => { const p = (window as any).__pingo.palco; return p.x >= p.seguro.l - 0.5 && p.y >= p.seguro.t - 0.5 && p.x + p.w <= window.innerWidth - p.seguro.r + 0.5 && p.y + p.h <= window.innerHeight - p.seguro.b + 0.5 && document.documentElement.scrollHeight <= window.innerHeight && document.documentElement.scrollWidth <= window.innerWidth; });
    if (!dentro) r.falhas.push('a tela do jogo sai da área segura ou a página rola');
  } catch (e) {
    r.falhas.push(String((e as Error).message ?? e).slice(0, 600));
    try { await foto('erro'); } catch { /* página fechada */ }
  }
  r.ok = r.falhas.length === 0;
  await ctx.close();
  return r;
}

export async function testarOffline(so?: string[]): Promise<ResultadoOffline[]> {
  if (!existsSync(RAIZ + 'dist/sw.js')) throw new Error('dist/sw.js não existe: rode `npm run build` antes.');
  mkdirSync(CAPTURAS, { recursive: true });
  const srv = await servir(RAIZ + 'dist', PORTA, '/Pingo/');
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const res: ResultadoOffline[] = [];
  try {
    for (const p of PERFIS) { if (so?.length && !so.includes(p.id)) continue; console.log(`▶ ${p.nome} em ${srv.url}`); res.push(await rodarPerfil(browser, srv.url, p, srv)); }
  } finally { await browser.close(); await srv.fechar(); }
  writeFileSync(CAPTURAS + 'resultado.json', JSON.stringify(res, null, 1));
  return res;
}

if (process.argv[1]?.endsWith('offline.ts')) {
  const res = await testarOffline(process.argv.slice(2));
  console.log('\n===== teste offline =====');
  for (const r of res) { console.log(`${r.ok ? 'OK   ' : 'FALHA'} ${r.perfil}: pré-cache ${(r.precacheMs / 1000).toFixed(1)} s, ${r.arquivos} arquivos, ${(r.bytes / 1048576).toFixed(1)} MB`); for (const f of r.falhas) console.log('   ✗ ' + f); }
  process.exit(res.every((r) => r.ok) && res.length ? 0 : 1);
}
