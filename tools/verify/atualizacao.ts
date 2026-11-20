/**
 * Teste da ATUALIZAÇÃO do pacote offline (`npm run test:atualizacao [pasta do dist]`): instala a versão atual
 * do `dist/` numa cópia (tools/.cache/), grava um save, gera uma versão nova por cima e confere que: a página
 * aberta continua funcionando e mostra o aviso "Atualização disponível", a abertura seguinte já é a versão nova,
 * o núcleo antigo sai do cache, quase nada é baixado de novo, o save continua igual e o jogo abre sem rede na
 * versão nova. (O aviso durante uma batalha e o toque nele são testados em tools/verify/offline.ts.)
 */
import { appendFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { servir } from './servidor';
import { gerar } from '../build-sw';
import { launch } from '../lib/pw';

const RAIZ = new URL('../..', import.meta.url).pathname, D = RAIZ + 'tools/.cache/dist-atualizacao';
const ORIGEM = process.argv[2] ?? RAIZ + 'dist';
if (!existsSync(ORIGEM + '/sw.js')) throw new Error(ORIGEM + '/sw.js não existe: rode `npm run build` antes.');
mkdirSync(RAIZ + 'tools/.cache', { recursive: true }); rmSync(D, { recursive: true, force: true }); cpSync(ORIGEM, D, { recursive: true });
const srv = await servir(D, Number(process.env.PORTA_ATUALIZACAO ?? 5321));
const b = await launch(), ctx = await b.newContext({ viewport: { width: 800, height: 450 } }), page = await ctx.newPage();
const falhas: string[] = [];
/* eslint-disable @typescript-eslint/no-explicit-any */
const ver = async () => { try { return await page.evaluate(async () => { const o = (window as any).__pingoOffline; return { e: o?.estado as string, v: o?.versao as string, nova: o?.versaoNova as string, aviso: !!document.getElementById('aviso-atualizacao'), save: localStorage.getItem('pingo.slot.0'), caches: await caches.keys(), dados: (await (await caches.open('pingo-dados')).keys()).length, jogo: !!(window as any).__pingo?.telas?.pilha?.length }; }); } catch { return null; } };
const abrir = async (espera: number) => { const p0 = srv.pedidos; await page.goto(srv.url, { waitUntil: 'commit', timeout: 20000 }); let s = await ver(); for (let i = 0; i < espera * 2 || (i < 400 && !(s?.e === 'pronto' && s.jogo)); i++) { await page.waitForTimeout(500); s = await ver(); } return { s, pedidos: srv.caminhos.slice(p0) }; };
try {
  const a0 = await abrir(1); const v1 = a0.s?.v ?? '';
  console.log(`versão ${v1} instalada: ${a0.pedidos.length} pedidos, ${a0.s?.dados} arquivos de dados no cache`);
  const save = await page.evaluate(() => { const p = (window as any).__pingo; p.jogo.save.jogador.nome = 'Teste'; p.save.gravarSlot(0); return localStorage.getItem('pingo.slot.0'); });
  if (!save) falhas.push('não consegui gravar o save de teste');
  appendFileSync(D + '/index.html', '\n<!-- versão de teste da atualização -->\n');
  appendFileSync(D + '/assets/sprites/pessoa/ayra/retrato.png', Buffer.from([0]));
  const v2 = gerar(D).versao; console.log(`versão ${v2} publicada (mudaram o index.html e um sprite)`);
  const iPub = srv.caminhos.length;
  const a1 = await abrir(12);
  // até 2 min: com a máquina carregada (outros testes e builds em paralelo) o SW novo demora a instalar
  for (let i = 0; i < 240 && !(a1.s?.nova === v2 && a1.s.aviso); i++) { await page.waitForTimeout(500); a1.s = await ver(); }
  if (a1.s?.nova !== v2 || !a1.s.aviso) falhas.push(`o aviso "Atualização disponível" não apareceu na página aberta (versão nova conhecida: "${a1.s?.nova}")`);
  console.log(`1ª abertura: página na versão ${a1.s?.v}, jogo aberto: ${a1.s?.jogo}; pedidos: ${a1.pedidos.join(', ')}`);
  if (!a1.s?.jogo) falhas.push('o jogo não abriu na sessão em que a atualização chegou');
  if (!a1.s?.caches.includes('pingo-n-' + v2)) falhas.push('a versão nova não foi instalada em segundo plano');
  const a2 = await abrir(6);
  console.log(`2ª abertura: página na versão ${a2.s?.v}; caches: ${a2.s?.caches.join(', ')}; pedidos: ${a2.pedidos.join(', ')}`);
  if (a2.s?.v !== v2) falhas.push(`a 2ª abertura deveria estar na versão ${v2}, está na ${a2.s?.v}`);
  if (a2.s?.caches.some((c: string) => c === 'pingo-n-' + v1)) falhas.push('o núcleo da versão antiga não foi apagado');
  if (a2.s?.dados !== a0.s?.dados) falhas.push(`o cache de dados mudou de ${a0.s?.dados} para ${a2.s?.dados} arquivos`);
  if (a2.s?.save !== save) falhas.push('o save mudou ou sumiu com a atualização');
  if (a2.s?.aviso) falhas.push('o aviso de atualização continua na tela depois de recarregar na versão nova');
  const baixados = srv.caminhos.slice(iPub).filter((c) => c !== 'sw.js');
  if (baixados.length > 20) falhas.push(`a atualização baixou ${baixados.length} arquivos; só o que mudou deveria vir`);
  const novo = await page.evaluate(async () => (await (await fetch('index.html')).text()).includes('versão de teste da atualização'));
  if (!novo) falhas.push('o index.html servido não é o da versão nova');
  await ctx.setOffline(true);
  await page.goto(srv.url, { waitUntil: 'commit', timeout: 20000 });
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 30000 }).catch(() => falhas.push('o jogo não abriu sem rede depois da atualização'));
  console.log('sem rede, na versão nova: ' + (falhas.length ? 'ver falhas' : 'abre'));
  console.log(`· ${v1} → ${v2}: aviso na página aberta, ${baixados.length} arquivo(s) baixado(s) (${baixados.join(', ')}), save intacto, núcleo antigo apagado, abre sem rede`);
} catch (e) { falhas.push(String((e as Error).message ?? e).slice(0, 300)); }
await b.close(); await srv.fechar(); rmSync(D, { recursive: true, force: true });
for (const f of falhas) console.log('✗ ' + f);
console.log(falhas.length ? 'FALHA no teste de atualização' : 'OK   teste de atualização');
process.exit(falhas.length ? 1 : 0);
