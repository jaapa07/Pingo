/**
 * Teste de verdade da versão PC (`npm run test:desktop`, depois de `npm run desktop`): abre o app Electron
 * EMPACOTADO (plataformas/desktop/out/linux-unpacked) pelo Playwright `_electron`, com uma pasta de dados
 * temporária, e confere:
 *  1. janela de conteúdo 1280×720, palco em escala inteira, ponte `pingoDesktop` presente, sem Service Worker;
 *  2. sem rede: um `fetch` para fora é bloqueado;
 *  3. título → jogos → jogo novo → nome → acordar no quarto → andar → Salvar pelo menu;
 *  4. o save virou arquivo JSON em <dados>/saves/;
 *  5. fecha o app, abre de novo, continua o jogo e confere lugar, equipe e nome;
 *  6. Alt+Enter liga e desliga a tela cheia (F11 é o atalho do menu "Jogo").
 * Sem tela (contêiner), rode com `xvfb-run -a npm run test:desktop`. Capturas em docs/capturas/desktop/.
 * `PINGO_APP=<executável>` testa outro binário; sem pacote, `PINGO_APP=codigo` roda main.cjs com o Electron do node_modules.
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RAIZ = new URL('../..', import.meta.url).pathname;
const CAPTURAS = RAIZ + 'docs/capturas/desktop/';
/* eslint-disable @typescript-eslint/no-explicit-any */
const req = createRequire(import.meta.url);
let pw: any;
try { pw = req('playwright'); } catch { try { pw = req('playwright-core'); } catch { pw = req('/opt/node-tools/node_modules/playwright-core'); } }

type Acao = 'a' | 'b' | 'menu' | 'cima' | 'baixo' | 'esq' | 'dir';
const TECLA: Record<Acao, string> = { a: 'KeyZ', b: 'KeyX', menu: 'Escape', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' };

const passos: string[] = [], falhas: string[] = [];
const passo = (t: string) => { passos.push(t); console.log('  ' + t); };

function opcoesLancar(dados: string) {
  const env = { ...process.env, PINGO_DADOS: dados } as Record<string, string>;
  const app = process.env.PINGO_APP ?? join(RAIZ, 'plataformas/desktop/out/linux-unpacked/adventures-of-pingo');
  // como root (contêiner) o Chromium exige --no-sandbox; num PC normal o app roda com a sandbox
  const extra = process.getuid?.() === 0 ? ['--no-sandbox'] : [];
  if (app === 'codigo') return { executablePath: req(join(RAIZ, 'node_modules/electron')) as string, args: [...extra, join(RAIZ, 'plataformas/desktop/main.cjs')], env };
  if (!existsSync(app)) throw new Error(`app não encontrado em ${app}: rode "npm run desktop" antes`);
  return { executablePath: app, args: extra, env };
}

async function abrir(dados: string) {
  const app = await pw._electron.launch({ ...opcoesLancar(dados), timeout: 60000 });
  const page = await app.firstWindow();
  page.on('pageerror', (e: unknown) => falhas.push('erro na página: ' + String(e).slice(0, 200)));
  page.on('console', (m: any) => { if (m.type() === 'error' && !/ERR_BLOCKED_BY_CLIENT|exemplo\.invalid|github\.com/.test(m.text())) falhas.push('console: ' + m.text().slice(0, 200)); });
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 60000 });
  await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  return { app, page };
}

async function principal() {
  mkdirSync(CAPTURAS, { recursive: true });
  const manter = process.env.PINGO_TESTE_DADOS;
  const dados = manter ? (mkdirSync(manter, { recursive: true }), manter) : mkdtempSync(join(tmpdir(), 'pingo-desktop-'));
  let atual: any = null;
  try {
    let { app, page } = await abrir(dados); atual = app;
    const dormir = (ms: number) => page.waitForTimeout(ms);
    const foto = async (nome: string) => {
      // captura pelo próprio Electron (webContents.capturePage): é o que a janela mostra
      const b64: string = await app.evaluate(async ({ BrowserWindow }: any) => (await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString('base64'));
      writeFileSync(CAPTURAS + nome + '.png', Buffer.from(b64, 'base64'));
    };
    const st = () => page.evaluate(() => {
      const p = (window as any).__pingo, m = p?.mundo, s = p?.jogo?.save;
      return {
        telas: (p?.telas?.pilha ?? []).map((t: any) => String(t.el.className)) as string[], cortina: !!p?.telas?.ocupada,
        pronto: !!m?.pronto, oc: !!m?.ocupado, zona: m?.pronto ? (m.zona?.id as string) : '', x: m?.jogador?.x as number, y: m?.jogador?.y as number, mov: !!m?.jogador?.movendo,
        equipe: (s?.equipe ?? []).map((c: any) => `${c.especie}:${c.nivel}`) as string[], nome: s?.jogador?.nome as string, flags: Object.keys(s?.flags ?? {}).length,
      };
    });
    type St = Awaited<ReturnType<typeof st>>;
    const topo = (s: St) => s.telas[s.telas.length - 1] ?? '';
    const apertar = async (a: Acao, ms = 50) => { await page.keyboard.down(TECLA[a]); await dormir(ms); await page.keyboard.up(TECLA[a]); await dormir(60); };
    const foco = () => page.evaluate(() => { const f = document.querySelector('.tecla.foco'); return f ? [...document.querySelectorAll('.tecla')].indexOf(f) : -1; });
    const confirmarNome = async () => {
      const total = await page.evaluate(() => document.querySelectorAll('.tecla').length);
      for (let i = 0; i < 6 && (await foco()) < total - 4; i++) await apertar('cima');
      for (let i = 0; i < 5 && (await foco()) !== total - 1; i++) await apertar('dir');
      await dormir(120); await page.keyboard.down('Enter'); await dormir(60); await page.keyboard.up('Enter'); await dormir(200);
    };
    const avancar = async (ate: (s: St) => boolean, max: number, oque: string) => {
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
      const a = await st(); await page.keyboard.down(TECLA[d]);
      const t0 = Date.now(); let b = a;
      while (Date.now() - t0 < 900) { b = await st(); if (b.x !== a.x || b.y !== a.y || b.zona !== a.zona) break; await dormir(15); }
      await page.keyboard.up(TECLA[d]);
      for (let i = 0; i < 40; i++) { b = await st(); if (!b.mov) break; await dormir(20); }
      return b.x !== a.x || b.y !== a.y;
    };

    /* 1. janela, palco e plataforma */
    const jan = await page.evaluate(() => {
      const p = (window as any).__pingo;
      return { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, escala: p.palco.escala, alvo: p.plataforma.alvo, ponte: typeof (window as any).pingoDesktop?.lerSave, node: typeof (window as any).require, sw: 'serviceWorker' in navigator ? !!navigator.serviceWorker.controller : false, origem: location.origin };
    });
    const versao = await app.evaluate(({ app: a }: any) => a.getVersion());
    passo(`app ${versao} abriu em ${jan.origem}: conteúdo ${jan.w}×${jan.h}, escala do palco ${jan.escala * jan.dpr}× (inteira), alvo "${jan.alvo}", ponte ${jan.ponte}, require no renderer: ${jan.node}, Service Worker: ${jan.sw}`);
    if (jan.w !== 1280 || jan.h !== 720) falhas.push(`janela com ${jan.w}×${jan.h} em vez de 1280×720`);
    if (!Number.isInteger(jan.escala * jan.dpr)) falhas.push('escala do palco não é inteira');
    if (jan.alvo !== 'desktop' || jan.ponte !== 'function') falhas.push('a plataforma não detectou o desktop');
    if (jan.node !== 'undefined') falhas.push('o renderer enxerga o require do Node');
    if (jan.sw) falhas.push('há Service Worker controlando a página no desktop');

    /* 2. sem rede */
    const rede = await page.evaluate(async () => { try { await fetch('https://exemplo.invalid/'); return 'passou'; } catch { return 'bloqueado'; } });
    const rede2 = await page.evaluate(async () => { try { await fetch('https://github.com/'); return 'passou'; } catch { return 'bloqueado'; } });
    passo(`fetch para fora: ${rede}, ${rede2}`);
    if (rede2 !== 'bloqueado') falhas.push('o app alcançou a rede externa');

    /* 3. jogo novo pela interface */
    await avancar((s) => /titulo/.test(topo(s)) && !s.cortina, 30000, 'o título'); await dormir(400); await foto('1-titulo');
    passo('título aberto');
    await avancar((s) => /tela-saves/.test(topo(s)) && !s.cortina, 30000, 'a tela de jogos'); await foto('2-jogos');
    const sNome = await avancar((s) => /tela-nome/.test(topo(s)) || (livre(s) && s.zona === 'A1-quarto' && s.flags > 2), 180000, 'a abertura chegar ao nome');
    if (/tela-nome/.test(topo(sNome))) {
      await dormir(300); await foto('3-nome'); await confirmarNome();
      for (let i = 0; i < 20 && /tela-nome/.test(topo(await st())); i++) { await dormir(150); if (i === 8) await confirmarNome(); }
    }
    let s = await avancar((q) => livre(q) && q.zona === 'A1-quarto' && !/tela-nome/.test(topo(q)), 180000, 'acordar no quarto');
    passo(`jogo novo: ${s.nome} acordou em ${s.zona} (${s.x},${s.y})`);
    let dados0 = 0;
    for (const d of ['esq', 'esq', 'baixo', 'dir', 'baixo'] as Acao[]) { if (!livre(await st())) await avancar(livre, 20000, 'ficar livre'); if (await andar(d)) dados0++; }
    s = await st(); await foto('4-quarto');
    passo(`andou ${dados0} passos com as setas → (${s.x},${s.y})`);
    if (dados0 < 3) falhas.push('o jogador quase não andou');

    /* salvar pelo menu */
    const idx = await page.evaluate(() => { const v = (window as any).__pingo.jogo.save; let n = 0; if (v.mochila['diario-de-campo'] || v.flags['ovo-entregue'] || v.diario.visto.length) n++; if (v.equipe.length) n++; n++; if (v.mochila['radio-cipo'] || v.flags['intro-ok']) n++; return n + 1; });
    await apertar('menu'); await dormir(500);
    const focoMenu = () => page.evaluate(() => { const f = document.querySelector('.tela-menu .foco'); return f?.parentElement ? [...f.parentElement.children].indexOf(f) : -1; });
    for (let i = 0; i < 16 && (await focoMenu()) !== idx; i++) { await apertar('baixo'); await dormir(150); }
    if ((await focoMenu()) !== idx) throw new Error('o cursor do menu não chegou a "Salvar"');
    await apertar('a'); await dormir(500); await apertar('a'); await dormir(800); await foto('5-salvou');
    for (let i = 0; i < 6; i++) { const q = await st(); if (livre(q)) break; await apertar(/menu/.test(topo(q)) ? 'b' : 'a'); await dormir(250); }
    s = await st();
    const esperado = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' '), nome: s.nome };

    /* 4. o save no disco */
    const pasta = join(dados, 'saves');
    const arquivos = existsSync(pasta) ? readdirSync(pasta) : [];
    const slot = arquivos.includes('pingo.slot.0.json') ? JSON.parse(readFileSync(join(pasta, 'pingo.slot.0.json'), 'utf8')) : null;
    passo(`saves no disco (${pasta}): ${arquivos.filter((f) => f.endsWith('.json')).join(', ')}; slot 0 com ${slot ? slot.valor.length : 0} caracteres`);
    if (!slot) falhas.push('o Salvar não gerou pingo.slot.0.json');

    /* 5. fecha e abre de novo */
    await app.close(); atual = null;
    ({ app, page } = await abrir(dados)); atual = app;
    await avancar((k) => /tela-saves/.test(topo(k)) && !k.cortina, 30000, 'a tela de jogos na volta'); await dormir(300); await foto('6-continuar');
    // abre o jogo 1 e escolhe "Continuar" com o direcional (o cursor da lista pode abrir em outra linha, e
    // "Exportar arquivo .pingo" abriria o diálogo nativo do sistema, que o teste não enxerga)
    await apertar('a');
    await page.waitForSelector('.confirmacao .lista-item.foco', { state: 'attached', timeout: 10000 }); await dormir(300);
    const linhas = () => page.evaluate(() => { const it = [...document.querySelectorAll('.confirmacao .lista-item')]; return { n: it.length, foco: it.findIndex((e) => e.classList.contains('foco')) }; });
    const l0 = await linhas(); const alvoLinha = l0.n === 7 ? 1 : 0; // com ponto de retomada, a 1ª linha é "Retomar de onde parou"
    for (let i = 0; i < 10 && (await linhas()).foco !== alvoLinha; i++) { await apertar((await linhas()).foco > alvoLinha ? 'cima' : 'baixo'); await dormir(120); }
    passo(`menu do jogo salvo: ${l0.n} opções (${l0.n === 7 ? 'com' : 'sem'} ponto de retomada gravado ao fechar), escolhido "Continuar"`);
    await apertar('a');
    s = await avancar((k) => livre(k) && k.zona !== '', 60000, 'continuar o jogo salvo');
    const voltou = { zona: s.zona, x: s.x, y: s.y, equipe: s.equipe.join(' '), nome: s.nome };
    passo(`fechou, abriu de novo e continuou: ${voltou.nome} em ${voltou.zona} (${voltou.x},${voltou.y})`);
    if (JSON.stringify(voltou) !== JSON.stringify(esperado)) falhas.push(`o jogo continuado não bate com o salvo: ${JSON.stringify(voltou)} ≠ ${JSON.stringify(esperado)}`);
    await dormir(300); await foto('7-continuou');

    /* 6. tela cheia */
    const cheia = () => app.evaluate(({ BrowserWindow }: any) => BrowserWindow.getAllWindows()[0].isFullScreen());
    const esperarCheia = async (v: boolean) => { for (let i = 0; i < 30 && (await cheia()) !== v; i++) await dormir(100); return cheia(); };
    // teclas pelo caminho de entrada do próprio Electron (sendInputEvent): as do CDP não passam pelo before-input-event
    const tecla = (keyCode: string, modifiers: string[] = []) => app.evaluate(({ BrowserWindow }: any, a: { keyCode: string; modifiers: string[] }) => {
      const wc = BrowserWindow.getAllWindows()[0].webContents;
      wc.sendInputEvent({ type: 'keyDown', keyCode: a.keyCode, modifiers: a.modifiers }); wc.sendInputEvent({ type: 'keyUp', keyCode: a.keyCode, modifiers: a.modifiers });
    }, { keyCode, modifiers });
    const zonaAntes = (await st()).telas.length;
    await tecla('Enter', ['alt']);
    const ligou = await esperarCheia(true);
    if (ligou) { await dormir(500); await foto('8-tela-cheia'); }
    const escCheia = await page.evaluate(() => { const p = (window as any).__pingo.palco; return { w: innerWidth, h: innerHeight, e: p.escala * devicePixelRatio }; });
    const vazouEnter = (await st()).telas.length !== zonaAntes;
    await tecla('F11');
    let desligou = !(await esperarCheia(false)), como = 'F11';
    if (!desligou) { await tecla('Enter', ['alt']); desligou = !(await esperarCheia(false)); como = 'Alt+Enter (o F11 do menu não recebe teclas simuladas)'; }
    const menuF11 = await app.evaluate(({ Menu }: any) => Menu.getApplicationMenu()?.items.flatMap((i: any) => i.submenu?.items ?? []).find((i: any) => i.accelerator === 'F11')?.label ?? '');
    passo(`Alt+Enter: tela cheia ${ligou ? 'ligou' : 'não ligou'} (${escCheia.w}×${escCheia.h}, escala ${escCheia.e}×; o Enter ${vazouEnter ? 'CHEGOU' : 'não chegou'} ao jogo); ${como}: ${desligou ? 'desligou' : 'não desligou'}; menu Jogo → "${menuF11}" com F11`);
    if (!ligou || !desligou) falhas.push('a tela cheia não alternou');
    if (vazouEnter) falhas.push('o Enter do Alt+Enter chegou ao jogo');
    if (!menuF11) falhas.push('o menu não tem o atalho F11');
    await app.close(); atual = null;
  } catch (e) {
    falhas.push('interrompido: ' + String(e).slice(0, 400));
  } finally {
    if (atual) await atual.close().catch(() => undefined);
    if (!manter) rmSync(dados, { recursive: true, force: true });
  }
  console.log(falhas.length ? `\nFALHOU (${falhas.length}):\n - ${falhas.join('\n - ')}` : '\nOK: versão PC aberta, jogo novo, salvar e continuar depois de fechar o app.');
  process.exitCode = falhas.length ? 1 : 0;
}
void principal();
