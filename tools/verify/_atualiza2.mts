import { appendFileSync } from 'node:fs';
import { servir } from './servidor';
import { gerar } from '../build-sw';
import { launch } from '../lib/pw';
const D = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/distA';
const srv = await servir(D, 5321);
const b = await launch(); const ctx = await b.newContext({ viewport: { width: 800, height: 450 } }); const page = await ctx.newPage();
let nav = 0; page.on('framenavigated', () => nav++);
page.on('pageerror', (e: any) => console.log('  ERRO', String(e).slice(0, 150)));
const ver = async () => { try { return JSON.stringify(await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); const o = (window as any).__pingoOffline; return { e: o?.estado, v: o?.versao, f: o?.feitos, inst: r?.installing?.state, wait: r?.waiting?.state, act: r?.active?.state, ctrl: !!navigator.serviceWorker.controller, caches: (await caches.keys()).join(','), jogo: !!(window as any).__pingo?.telas?.pilha?.length }; })); } catch (e) { return 'ERR ' + String(e).slice(0, 80); } };
await page.goto(srv.url);
for (let i = 0; i < 120; i++) { await page.waitForTimeout(500); if ((await ver()).includes('"e":"pronto"')) break; }
console.log('v1', await ver(), 'pedidos', srv.pedidos);
appendFileSync(D + '/index.html', '\n<!-- versão de teste -->\n'); console.log('nova', gerar(D).versao);
for (let abertura = 1; abertura <= 3; abertura++) {
  const p0 = srv.pedidos; nav = 0;
  try { await page.goto(srv.url, { waitUntil: 'commit', timeout: 15000 }); } catch (e) { console.log('  goto:', String(e).slice(0, 100)); }
  for (let i = 0; i < 16; i++) { await page.waitForTimeout(1000); if (i % 3 === 0 || i === 15) console.log(' abertura', abertura, 't=' + (i + 1) + 's', 'nav', nav, await ver(), 'pedidos', srv.caminhos.slice(p0).length, srv.caminhos.slice(p0).slice(0, 5).join(',')); }
}
await b.close(); await srv.fechar();
