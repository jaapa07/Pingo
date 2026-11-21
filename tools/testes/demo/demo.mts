/**
 * DEMO num iPhone 13 emulado (só toque), o pacote dist-demo/ servido em /Pingo-demo1/ (como no GitHub Pages):
 *  1. abre, confere o selo "Demo" no título (foto) e o Service Worker (prefixo de cache próprio);
 *  2. save preparado: o da QA antes da líder 2 (tools/testes/qa/saves/mata-pre-lider-2.json), com o jogador em frente à
 *     Lia Teia e a inicial no nível 60; continua pelo menu de jogos, fala com a líder e vence a batalha na tela;
 *  3. confere a tela "Fim da demo" (foto), fecha, vê o selo no menu (foto);
 *  4. bloqueio: vai à Trilha dos Cipós e tenta entrar na Gruta do Eco (o guarda barra); `irPara` para zonas fora da lista
 *     (Gruta do Eco, Porto Sereia, mapa B, Liga) é recusado;
 *  5. salva pelo menu, exporta o código (→ tools/testes/demo/saida/demo.pingo, usado por importar.mts);
 *  6. um save do jogo completo (pós-Liga) colado na demo é recusado e não ocupa o slot.
 * Uso: npm run build:demo && npx tsx tools/testes/demo/demo.mts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { servir } from '../../verify/servidor';
import { pw, RAIZ, FOTOS, ARGS_CHROMIUM, TURBO, controle, gravarNoSlot, vigiar, livre, topo } from './lib.mts';

const SAIDA = RAIZ + 'tools/testes/demo/saida/';
mkdirSync(SAIDA, { recursive: true });
if (!existsSync(RAIZ + 'dist-demo/index.html')) throw new Error('rode `npm run build:demo` antes');
const srv = await servir(RAIZ + 'dist-demo', 5411, '/Pingo-demo1/');
const browser = await pw.chromium.launch({ args: ARGS_CHROMIUM });
const ip = pw.devices['iPhone 13'];
const ctx = await browser.newContext({ ...ip, serviceWorkers: 'allow' });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const falhas: string[] = [];
vigiar(page, falhas);
await page.addInitScript(TURBO, 3);
const c = controle(page, page, 'toque', cdp);
const log = (s: string) => console.log('  ' + s);
const foto = (n: string) => page.screenshot({ path: FOTOS + 'demo-' + n + '.png' }).catch(() => undefined);
const ev = <T,>(f: (a: any) => T, a?: unknown): Promise<T> => page.evaluate(f, a);
let ok = true;
const conferir = (cond: boolean, msg: string) => { log((cond ? 'OK  ' : 'FALHA ') + msg); if (!cond) { ok = false; falhas.push(msg); } };

try {
  console.log('== Demo no iPhone 13 (toque) — ' + srv.url);
  await page.goto(srv.url);
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  await c.avancar((s) => /titulo/.test(topo(s)), 30000, 'título').catch(() => undefined);
  await c.dormir(1500); await foto('1-titulo');
  const sw = await page.waitForFunction(() => { const o = (window as any).__pingoOffline; return o && (o.estado === 'pronto' || o.estado === 'falhou') ? o.estado : null; }, null, { timeout: 300000, polling: 500 }).then((h: any) => h.jsonValue());
  const caches_ = await ev(async () => (await caches.keys()).sort());
  conferir(sw === 'pronto', `offline (Service Worker em /Pingo-demo1/): ${sw}; caches ${caches_.join(', ')}`);
  conferir(caches_.length > 0 && caches_.every((k: string) => k.startsWith('pingodemo-')), 'caches da demo com prefixo próprio (não tocam nos do jogo completo)');

  // 2. save preparado em frente à Lia Teia
  const base = JSON.parse(readFileSync(RAIZ + 'tools/testes/qa/saves/mata-pre-lider-2.json', 'utf8')).save;
  base.jogador = { ...base.jogador, zona: 'A3-ginasio', x: 8, y: 2, dir: 'n' };
  base.equipe[0].nivel = 60; base.equipe[0].exp = 0;
  await gravarNoSlot(page, base, 0);
  await ev(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  let s = await c.continuarSlot(0);
  conferir(s.zona === 'A3-ginasio' && s.ins.join() === '1', `continuou o save preparado: ${s.zona} (${s.x},${s.y}), insígnias [${s.ins}]`);
  await ev(() => (window as any).__pingo.mundo.rodarPassos([['curar']]));
  await foto('2-antes-da-lider');
  // fala com a líder e aperta A até a tela de fim da demo (diálogos, batalha com o 1º golpe, insígnia, Amuleto)
  s = await c.avancar((q) => /tela-fim-demo/.test(topo(q)), 300000, 'fim da demo');
  conferir(s.ins.includes(2), `venceu a Lia Teia: insígnias [${s.ins}]`);
  await c.dormir(1200); await foto('3-fim-da-demo');
  conferir(true, 'a tela "Fim da demo" apareceu logo depois da 2ª insígnia');
  await c.apertar('a'); await c.dormir(600);
  s = await c.avancar(livre, 30000, 'livre depois do fim');
  conferir(s.zona === 'A3-ginasio', `fechou a tela e segue livre em ${s.zona}`);
  const flag = await ev(() => !!(window as any).__pingo.jogo.save.flags['demo-fim']);
  conferir(flag, 'flag demo-fim marcada (a tela aparece uma vez só)');
  await c.dormir(1500);
  s = await c.st(); conferir(!/fim-demo/.test(topo(s)), 'a tela não volta a abrir');
  await c.apertar('menu'); await c.dormir(700); await foto('4-menu-com-selo'); await c.apertar('b'); await c.dormir(500);

  // 4. bloqueio
  const recusas: string[] = [];
  for (const z of ['A-GE', 'A4', 'B1', 'A-LG']) {
    const r = await ev(async (zz: string) => { const m = (window as any).__pingo.mundo; await m.irPara(zz, 2, 2, 's', 'nenhuma'); return m.zona.id; }, z);
    if (r === z) recusas.push(z);
  }
  conferir(!recusas.length, `irPara recusa zonas fora da demo (A-GE, A4, B1, A-LG)${recusas.length ? ': ENTROU em ' + recusas.join(',') : ''}`);
  await c.avancar(livre, 20000, 'livre');
  const portao = await ev(async () => {
    const m = (window as any).__pingo.mundo;
    await m.irPara('A-R3', 2, 2, 's', 'nenhuma');
    const p = (m.zona.def ?? m.zona).portoes?.[0];
    await m.irPara('A-R3', p.x, p.y + 1, 'n', 'nenhuma');
    return p;
  });
  await c.avancar(livre, 20000, 'livre');
  await c.dormir(400); await foto('5-guarda');
  const antes = await c.st();
  const moveu = await c.andar('cima');
  await c.dormir(300);
  const durante = await c.st();
  await foto('6-guarda-fala');
  conferir(!moveu && /dialogo/.test(durante.telas.join(' ')), `guarda da Gruta do Eco em (${portao.x},${portao.y}) barra a passagem e fala (${antes.zona} ${antes.x},${antes.y} → ${durante.zona} ${durante.x},${durante.y})`);
  s = await c.avancar(livre, 30000, 'fim da fala');
  // tenta de novo, e pelos lados: nenhum tile leva à gruta
  const rotas: string[] = [];
  for (const d of ['esq', 'dir'] as const) { const a = await c.st(); await c.andar(d); await c.avancar(livre, 20000, 'livre'); for (let i = 0; i < 3; i++) { await c.andar('cima'); await c.avancar(livre, 20000, 'livre'); } const b = await c.st(); rotas.push(`${d}: ${b.zona} (${b.x},${b.y})`); if (b.zona !== 'A-R3') conferir(false, 'escapou pela lateral para ' + b.zona); await ev(async (q: any) => { await (window as any).__pingo.mundo.irPara('A-R3', q.x, q.y, 'n', 'nenhuma'); }, a); await c.avancar(livre, 20000, 'livre'); }
  log('tentativas pelos lados ficaram em A-R3: ' + rotas.join(' · '));

  // 5. salva pelo menu do jogo (API: igual ao "Salvar") e exporta o código
  await ev(async () => { const m = (window as any).__pingo.mundo; await m.irPara('A3', 20, 15, 's', 'nenhuma'); });
  await c.avancar(livre, 20000, 'livre');
  const exp = await ev(() => { const p = (window as any).__pingo; p.save.gravarSlot(p.jogo.slot); return { cod: p.save.exportar(p.jogo.slot), save: p.jogo.save }; });
  writeFileSync(SAIDA + 'demo.pingo', exp.cod);
  writeFileSync(SAIDA + 'demo-save.json', JSON.stringify(exp.save));
  conferir(exp.cod.length > 100, `exportou o save da demo (${exp.cod.length} letras) → tools/testes/demo/saida/demo.pingo`);
  const chaves = await ev(() => Object.keys(localStorage).sort());
  conferir(chaves.some((k: string) => k === 'pingo-demo.slot.0') && !chaves.some((k: string) => k.startsWith('pingo.')), `saves da demo em chaves próprias: ${chaves.join(', ')}`);

  // 6. save do jogo completo na demo
  const completo = existsSync(SAIDA + 'completo.pingo') ? readFileSync(SAIDA + 'completo.pingo', 'utf8') : '';
  if (!completo) log('(sem tools/testes/demo/saida/completo.pingo: rode importar.mts uma vez e repita para testar a recusa)');
  else {
    const r = await ev((cod: string) => { const p = (window as any).__pingo; try { p.save.lerExportado(cod); return 'aceitou'; } catch (e) { return String((e as Error).message); } }, completo);
    conferir(/fim da demo/.test(r), `código do jogo completo (pós-Liga) recusado: "${r}"`);
    const r2 = await ev((cod: string) => { const p = (window as any).__pingo; try { p.save.importar(cod, 2); return 'importou'; } catch (e) { return 'recusou'; } }, completo);
    const slots = await ev(() => (window as any).__pingo.save.listarSlots().map((x: any) => (x ? x.zona : null)));
    conferir(r2 === 'recusou' && slots[2] === null, `importar no Jogo 3 recusado e o slot continua vazio (${JSON.stringify(slots)})`);
  }
} catch (e) { ok = false; falhas.push('parou: ' + String((e as Error).stack ?? e).slice(0, 600)); await foto('erro'); }
console.log(falhas.length ? '\nFALHAS:\n - ' + falhas.join('\n - ') : '\nsem falhas');
console.log(`fotos em ${FOTOS}`);
await browser.close(); await srv.fechar();
process.exit(ok && !falhas.length ? 0 : 1);
