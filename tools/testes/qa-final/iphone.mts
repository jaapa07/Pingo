/**
 * QA FINAL — o build publicado (dist/) num iPhone 13 emulado (só toque), SEM rede depois do pré-cache:
 *  1. jogo novo pela interface → inicial (Brasa ou Mata, pelo evento real da cuia) → salvar pelo menu → recarregar → continuar;
 *  2. save avançado (checkpoint pós-Liga do QA 4) gravado no Jogo 2 → recarregar → escolher o Jogo 2 → continuar →
 *     Estação de Porto Sereia → embarca no trem andando → Vila Cascavel (mapa B);
 *  3. visita TODAS as zonas do mapa B / Pico / X-EA sem rede (nenhum pedido pode falhar) e uma batalha selvagem no B.
 * Uso: npx tsx tools/testes/qa-final/iphone.mts [brasa|mata] [checkpoint]   (precisa de `npm run build` antes)
 */
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { servir } from '../../verify/servidor';

const RAIZ = new URL('../../..', import.meta.url).pathname;
const INI = (process.argv[2] ?? 'brasa') as 'brasa' | 'mata';
const CK = process.argv[3] ?? 'campeao';
const FOTOS = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qafinal/';
mkdirSync(FOTOS, { recursive: true });
const req = createRequire(import.meta.url);
let pw: any; try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }
const servido = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qafinal/dist';
rmSync(servido, { recursive: true, force: true }); cpSync(RAIZ + 'dist', servido, { recursive: true });
const srv = await servir(servido, 5310, '/Pingo/');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ip = pw.devices['iPhone 13'];
const ctx = await browser.newContext({ ...ip, serviceWorkers: 'allow' });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const falhas: string[] = []; let semRede = false;
page.on('pageerror', (e: unknown) => falhas.push('erro na página: ' + String(e).slice(0, 300)));
page.on('console', (m: any) => { if (m.type() === 'error') falhas.push('console: ' + m.text().slice(0, 300)); });
page.on('requestfailed', (q: any) => { if (semRede) falhas.push('requisição falhou sem rede: ' + q.url().replace(srv.url, '')); });
page.on('response', (q: any) => { if (q.status() >= 400) falhas.push(`resposta ${q.status()}${semRede ? ' sem rede' : ''}: ` + q.url().replace(srv.url, '')); });
const K = 3;
await page.addInitScript((k: number) => {
  const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
  const st = window.setTimeout.bind(window); (window as any).setTimeout = (f: TimerHandler, ms?: number, ...a: unknown[]) => st(f, (ms || 0) / k, ...a);
}, K);
const log = (s: string) => console.log('  ' + s);
const dormir = (ms: number) => page.waitForTimeout(ms);
const foto = async (n: string) => { try { await page.screenshot({ path: FOTOS + INI + '-' + n + '.png', timeout: 8000 }); } catch { /* registro */ } };
const st = () => page.evaluate(() => {
  const p = (window as any).__pingo, m = p?.mundo, s = p?.jogo?.save;
  return { telas: (p?.telas?.pilha ?? []).map((t: any) => String(t.el.className)) as string[], cortina: !!p?.telas?.ocupada,
    pronto: !!m?.pronto, oc: !!m?.ocupado, zona: m?.pronto ? (m.zona?.id as string) : '', x: m?.jogador?.x as number, y: m?.jogador?.y as number, mov: !!m?.jogador?.movendo,
    equipe: (s?.equipe ?? []).map((c: any) => `${c.especie}:${c.nivel}`) as string[], nome: s?.jogador?.nome as string, flags: Object.keys(s?.flags ?? {}).length, ins: (s?.insignias ?? []).length };
});
type St = Awaited<ReturnType<typeof st>>;
const topo = (s: St) => s.telas[s.telas.length - 1] ?? '';
type Acao = 'a' | 'b' | 'menu' | 'select' | 'cima' | 'baixo' | 'esq' | 'dir';
const alvo = async (a: Acao): Promise<[number, number]> => page.evaluate((acao: string) => {
  const idx: Record<string, number> = { a: 1, b: 2, menu: 3, select: 4 };
  const q = (document.querySelectorAll('#toque > .tq')[acao in idx ? idx[acao] : 0] as HTMLElement).getBoundingClientRect();
  const d: Record<string, [number, number]> = { cima: [0, -0.32], baixo: [0, 0.32], esq: [-0.32, 0], dir: [0.32, 0] };
  const [dx, dy] = d[acao] ?? [0, 0];
  return [q.left + q.width / 2 + dx * q.width, q.top + q.height / 2 + dy * q.height] as [number, number];
}, a);
const baixar = async (a: Acao) => { const [x, y] = await alvo(a); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); };
const soltar = async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
const apertar = async (a: Acao, ms = 50) => { await baixar(a); await dormir(ms); await soltar(); await dormir(60); };
const foco = () => page.evaluate(() => { const f = document.querySelector('.tecla.foco'); return f ? [...document.querySelectorAll('.tecla')].indexOf(f) : -1; });
const confirmarNome = async () => {
  const total = await page.evaluate(() => document.querySelectorAll('.tecla').length);
  for (let i = 0; i < 6 && (await foco()) < total - 4; i++) await apertar('cima');
  for (let i = 0; i < 5 && (await foco()) !== total - 1; i++) await apertar('dir');
  await dormir(120); await apertar('a'); await dormir(200);
};
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
  await soltar();
  for (let i = 0; i < 40; i++) { b = await st(); if (!b.mov) break; await dormir(20); }
  return b.x !== a.x || b.y !== a.y || b.zona !== a.zona;
};
const focoMenu = () => page.evaluate(() => { const f = document.querySelector('.tela-menu .foco'); return f?.parentElement ? [...f.parentElement.children].indexOf(f) : -1; });
const textoMenu = () => page.evaluate(() => [...document.querySelectorAll('.tela-menu .foco')].map((e) => e.textContent).join('|'));
async function salvarPeloMenu() {
  const zonaAoSalvar = (await st()).zona;
  await apertar('menu'); await dormir(500);
  if (!/menu/.test(topo(await st()))) throw new Error('o menu não abriu');
  // mesma conta do tools/verify/offline.ts: Diário?, Equipe?, Mochila, Rádio?, Perfil → Salvar
  const idx = await page.evaluate(() => { const v = (window as any).__pingo.jogo.save; let n = 0; if (v.mochila['diario-de-campo'] || v.flags['ovo-entregue'] || v.diario.visto.length) n++; if (v.equipe.length) n++; n++; if (v.mochila['radio-cipo'] || v.flags['intro-ok']) n++; return n + 1; });
  for (let i = 0; i < 16 && (await focoMenu()) !== idx; i++) { await apertar('baixo'); await dormir(150); }
  if ((await focoMenu()) !== idx) throw new Error('cursor não chegou ao Salvar');
  await foto('menu-salvar');
  await apertar('a'); await dormir(500); await apertar('a'); await dormir(600);
  const salvo = await page.evaluate(() => { const p = (window as any).__pingo; const l = p.save.listarSlots()[p.jogo.slot]; return l ? { zona: l.zona, idade: Date.now() - l.quando, slot: p.jogo.slot } : null; });
  if (!salvo || salvo.idade > 20000 || salvo.zona !== zonaAoSalvar) throw new Error('Salvar não gravou: ' + JSON.stringify(salvo));
  for (let i = 0; i < 6; i++) { const q = await st(); if (livre(q)) break; await apertar(/menu/.test(topo(q)) ? 'b' : 'a'); await dormir(250); }
  return salvo;
}
async function continuarSlot(slot: number) {
  await page.reload();
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  await avancar((k) => /tela-saves/.test(topo(k)) && !k.cortina, 30000, 'tela de jogos');
  await dormir(300);
  for (let i = 0; i < slot; i++) { await apertar('baixo'); await dormir(200); }
  await foto(`jogos-slot${slot + 1}`);
  await apertar('a'); await dormir(500);
  // o 1º item do menu do jogo é "Retomar" (se houver) ou "Continuar"; registra qual está em foco
  const opc = await page.evaluate(() => [...document.querySelectorAll('.foco')].map((e) => (e.textContent ?? '').trim()).join(' | '));
  log(`menu do Jogo ${slot + 1}: item em foco = "${opc}"`);
  return avancar((k) => livre(k) && k.zona !== '', 60000, 'continuar');
}

try {
  console.log(`== QA final iPhone 13 (toque), inicial ${INI}, checkpoint ${CK}`);
  const t0 = Date.now();
  await page.goto(srv.url);
  await page.waitForFunction(() => { const o = (window as any).__pingoOffline; return o && (o.estado === 'pronto' || o.estado === 'falhou'); }, null, { timeout: 600000, polling: 500 });
  const off = await page.evaluate(() => ({ ...(window as any).__pingoOffline }));
  log(`pré-cache: ${JSON.stringify(off).slice(0, 200)} em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  // o cache contém as zonas do mapa B?
  const cacheB = await page.evaluate(async () => {
    const lista = await (await fetch('pingo-arquivos.json')).json();
    const b = lista.arquivos.filter((a: any) => /^assets\/zonas\/(B|PP|X-)/.test(a[0]));
    const c = await caches.open('pingo-dados'); const ks = new Set((await c.keys()).map((r) => new URL(r.url).pathname.replace(/^\/Pingo\//, '')));
    const falta = b.filter((a: any) => !ks.has(a[0]));
    return { total: b.length, grupos: [...new Set(b.map((a: any) => a[3]))], falta: falta.length, ex: falta.slice(0, 3).map((a: any) => a[0]) };
  });
  log(`zonas do mapa B no pacote: ${cacheB.total} arquivos, grupos ${cacheB.grupos}, fora do cache: ${cacheB.falta} ${cacheB.ex.join(' ')}`);
  if (cacheB.falta) falhas.push(`${cacheB.falta} arquivos do mapa B fora do cache offline`);

  await ctx.setOffline(true); semRede = true;
  await page.reload();
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  log('sem rede: abriu do cache');
  await avancar((s) => /tela-saves/.test(topo(s)) && !s.cortina, 30000, 'tela de jogos');
  const sNome = await avancar((s) => /tela-nome/.test(topo(s)) || (livre(s) && s.zona === 'A1-quarto' && s.flags > 2), 180000, 'nome');
  if (/tela-nome/.test(topo(sNome))) { await dormir(300); await confirmarNome(); for (let i = 0; i < 20 && /tela-nome/.test(topo(await st())); i++) { await dormir(150); if (i === 8) await confirmarNome(); } }
  let s = await avancar((q) => livre(q) && q.zona === 'A1-quarto', 180000, 'quarto');
  log(`jogo novo: ${s.nome} em ${s.zona}`);
  let n = 0; for (const d of ['esq', 'baixo', 'dir', 'dir', 'cima'] as Acao[]) { if (!livre(await st())) await avancar(livre, 20000, 'livre'); if (await andar(d)) n++; }
  log(`andou ${n} passos pelo direcional de toque`);
  void page.evaluate((ini: string) => { void (window as any).__pingo.mundo.rodarEvento('lab-cuia-' + ini); }, INI);
  await dormir(300);
  s = await avancar((q) => q.equipe.length > 0 && livre(q), 120000, 'inicial');
  const flagsIni = await page.evaluate(() => Object.keys((window as any).__pingo.jogo.save.flags).filter((k) => /^inicial/.test(k)));
  log(`inicial: ${s.equipe.join(' ')} flags ${flagsIni.join(',')}`);
  if (!flagsIni.includes('inicial-' + INI)) falhas.push('flag inicial-' + INI + ' não marcada');
  const sv1 = await salvarPeloMenu(); log(`salvou no Jogo ${sv1.slot + 1} em ${sv1.zona}`);
  const esp = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' ') };
  s = await continuarSlot(0);
  const volta = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' ') };
  log(`recarregou e continuou: ${JSON.stringify(volta)}`);
  if (JSON.stringify(volta) !== JSON.stringify(esp)) falhas.push(`continuar não bate: ${JSON.stringify(volta)} ≠ ${JSON.stringify(esp)}`);
  await foto('continuou');

  /* 2. save avançado no Jogo 2 */
  const sv = JSON.parse(readFileSync(RAIZ + `tools/testes/qa4/saves/${CK}.json`, 'utf8'));
  await page.evaluate((x: any) => { const p = (window as any).__pingo; const atual = p.jogo.slot; p.jogo.carregar(x); p.jogo.slot = 1; p.save.gravarSlot(1); p.jogo.slot = atual; }, sv);
  s = await continuarSlot(1);
  log(`Jogo 2 (${CK}): ${s.nome} em ${s.zona} (${s.x},${s.y}), ${s.ins} insígnias, equipe ${s.equipe.join(' ')}`);
  if (s.zona !== sv.jogador.zona) falhas.push('o Jogo 2 abriu em ' + s.zona);
  await page.evaluate(async () => { await (window as any).__pingo.mundo.irPara('A4-estacao', 8, 4, 'n', 'fade'); });
  await avancar(livre, 20000, 'estação');
  await foto('estacao');
  await andar('cima');
  s = await avancar((q) => livre(q) && q.zona !== 'A4-estacao', 120000, 'embarcar e chegar');
  log(`embarcou no trem andando: chegou a ${s.zona} (${s.x},${s.y})`);
  if (!/^B1/.test(s.zona)) falhas.push('o trem não levou ao B1: ' + s.zona);
  await foto('b1-estacao');
  // desce da plataforma para a cidade (eventos de chegada)
  for (let i = 0; i < 8; i++) { if (!livre(await st())) await avancar(livre, 60000, 'livre'); await andar('baixo'); }
  s = await avancar(livre, 60000, 'livre'); log(`desceu: ${s.zona} (${s.x},${s.y})`); await foto('b1');

  /* 3. todas as zonas do B sem rede */
  const ids = readdirSync(RAIZ + 'dist/assets/zonas').filter((z) => /^(B|PP|X-)/.test(z)).map((id) => ({ id, x: 2, y: 2 }));
  log(`zonas do mapa B no dist: ${ids.length}`);
  const ruins: string[] = [];
  for (const z of ids) {
    const nf = falhas.length;
    const ok = await page.evaluate(async (zz: any) => {
      const m = (window as any).__pingo.mundo;
      try { await Promise.race([m.irPara(zz.id, zz.x, zz.y, 's', 'nenhuma'), new Promise((_, f) => setTimeout(() => f(new Error('demorou')), 30000))]); } catch (e) { return String(e); }
      return m.pronto && m.zona?.id === zz.id ? 'ok' : 'zona ' + m.zona?.id;
    }, z);
    await dormir(150);
    if (ok !== 'ok' || falhas.length > nf) ruins.push(`${z.id}: ${ok} ${falhas.slice(nf).join('; ').slice(0, 200)}`);
  }
  log(`visitou ${ids.length} zonas sem rede; com problema: ${ruins.length ? ruins.join(' | ') : 'nenhuma'}`);
  // batalha selvagem no B (sprites de criatura do mapa B + arena)
  await page.evaluate(async () => { await (window as any).__pingo.mundo.irPara('B-R1', 10, 10, 's', 'nenhuma'); });
  await dormir(500);
  void page.evaluate(() => { void (window as any).__pingo.mundo.batalhaSelvagem(130, 50); });
  await page.waitForFunction(() => (window as any).__pingo.telas.pilha.some((t: any) => /batalha/.test(t.el.className)), null, { timeout: 60000 });
  await dormir(1500); await foto('batalha-b');
  const tb = Date.now();
  for (;;) { const q = await st(); if (!q.telas.some((t) => /batalha/.test(t)) && livre(q)) break; if (Date.now() - tb > 240000) throw new Error('batalha não terminou'); if (!q.cortina) await apertar('a'); await dormir(120); }
  log('batalha selvagem no mapa B jogada até o fim sem rede');
  const vaz = srv.caminhos.filter((c) => c !== 'sw.js').length;
  void vaz;
} catch (e) { falhas.push('ERRO: ' + String(e).slice(0, 500)); }
await foto('fim');
console.log(falhas.length ? 'FALHAS:\n - ' + [...new Set(falhas)].join('\n - ') : 'OK: nenhuma falha');
await browser.close(); await srv.fechar();
process.exit(falhas.length ? 1 : 0);
