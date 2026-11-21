/**
 * Feedback de jogador (docs/UI-CORRECOES.md): no pacote do itch.io (`npm run build:itch`, arquivos em `pacotes/*.bin`),
 * com a rede lenta, a criatura da mesa da Profª Ipê tem de aparecer junto com o quadro.
 * Serve dist-itch/ em http://127.0.0.1:5421/jogo/, grava um save na porta do laboratório antes da escolha, liga a rede
 * lenta (400 ms de latência, 40 KB/s ≈ "3G lento"), continua o jogo, espera `ESPERA` s (o caminho de casa até ali),
 * entra, anda até a mesa e examina a cuia do meio. Mede quanto tempo o quadro fica sem a criatura.
 * Uso: npm run build:itch && npx tsx tools/testes/feedback/itch-lab.mts [pc|empe|deitado]
 */
import { readFileSync } from 'node:fs';
import { servir } from '../../verify/servidor';
import { pw, RAIZ, ARGS_CHROMIUM, controle, gravarNoSlot, livre } from '../demo/lib.mts';

const modo = (process.argv[2] ?? 'empe') as 'pc' | 'empe' | 'deitado';
const ESPERA = Number(process.argv[3] ?? 10);
const srv = await servir(RAIZ + 'dist-itch', 5421, '/jogo/');
const browser = await pw.chromium.launch({ args: ARGS_CHROMIUM });
try {
  const ctx = await browser.newContext(modo === 'pc' ? { viewport: { width: 1280, height: 720 } } : { ...pw.devices['iPhone 13' + (modo === 'deitado' ? ' landscape' : '')] });
  const page = await ctx.newPage();
  await page.addInitScript(() => performance.setResourceTimingBufferSize(100000));
  const cdp = await ctx.newCDPSession(page);
  await page.goto('http://127.0.0.1:5421/jogo/index.html');
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  await page.evaluate(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  const save = JSON.parse(readFileSync(RAIZ + 'tools/testes/demo/saida/demo-save.json', 'utf8'));
  for (const k of Object.keys(save.flags)) if (/^(inicial|cuia-)/.test(k)) delete save.flags[k];
  Object.assign(save.jogador, { zona: 'A1', x: 26, y: 15, dir: 'n' });
  save.equipe = []; save.flags['prof-conheceu'] = true;
  await gravarNoSlot(page, save, 0);
  const c = controle(page, page, modo === 'pc' ? 'teclado' : 'toque', cdp);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 40 * 1024, uploadThroughput: 20 * 1024 });
  const s = await c.continuarSlot(0);
  if (s.zona !== 'A1') throw new Error('não chegou à Vila: ' + s.zona);
  await c.dormir(ESPERA * 1000);
  await c.andar('cima'); let e = await c.avancar(livre, 120000, 'laboratório');
  if (e.zona !== 'A1-lab') throw new Error('não entrou no laboratório: ' + e.zona);
  for (let i = 0; i < 12 && (e.x !== 7 || e.y !== 6); i++) { await c.andar(e.x > 7 ? 'esq' : e.x < 7 ? 'dir' : 'cima'); e = await c.st(); }
  await c.andar('cima'); // vira para a mesa (bloqueada: só vira)
  e = await c.st(); if (e.x !== 7 || e.y !== 6) throw new Error(`não chegou à mesa: ${e.x},${e.y}`);
  const t0 = Date.now(); await c.apertar('a');
  let tQuadro = -1, tImg = -1;
  for (let i = 0; i < 600 && tImg < 0; i++) {
    const r = await page.evaluate(() => {
      const v = document.querySelector('.vitrine-criatura .spr') as HTMLElement | null; if (!v) return null;
      const u = getComputedStyle(v).backgroundImage.replace(/^url\("?|"?\)$/g, '');
      // no pacote a imagem é um blob: feito do pacote já baixado; vazia = data: de 1×1 à espera do pacote
      return { u: u.slice(0, 30), pronto: u.startsWith('blob:') };
    });
    if (r && tQuadro < 0) tQuadro = Date.now() - t0;
    if (r?.pronto) tImg = Date.now() - t0;
    await c.dormir(50);
  }
  const pac = await page.evaluate(() => (window as any).__pingoPacotes.carregados());
  console.log(JSON.stringify({ modo, quadroAposToque_ms: tQuadro, imagemAposToque_ms: tImg, semImagem_ms: tImg - tQuadro, pacotes: pac }));
  if (tImg < 0 || tImg - tQuadro > 100) { console.log('FALHA: a imagem não apareceu junto com o quadro'); process.exitCode = 1; } else console.log('OK  imagem junto com o quadro');
} finally { await browser.close(); await srv.fechar(); }
