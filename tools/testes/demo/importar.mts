/**
 * Save da DEMO no jogo COMPLETO (dist/, servido em /Pingo/ como no site), num PC (teclado):
 *  1. no Jogo 1 vazio: "Colar código" → cola o código exportado por demo.mts (tools/testes/demo/saida/demo.pingo) → Enter;
 *  2. Continuar: o jogo abre onde a demo parou, com as 2 insígnias, a mesma equipe, mochila, Diário, flags e dinheiro;
 *  3. no jogo completo o guarda da Gruta do Eco não existe e a Gruta abre;
 *  4. gera tools/testes/demo/saida/completo.pingo (save pós-Liga do jogo completo) para demo.mts conferir a recusa.
 * Uso: npm run build && npx tsx tools/testes/demo/importar.mts   (depois de demo.mts)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { servir } from '../../verify/servidor';
import { pw, RAIZ, FOTOS, ARGS_CHROMIUM, TURBO, controle, gravarNoSlot, vigiar, livre, topo } from './lib.mts';

const SAIDA = RAIZ + 'tools/testes/demo/saida/';
if (!existsSync(SAIDA + 'demo.pingo')) throw new Error('rode tools/testes/demo/demo.mts antes (ele exporta o save da demo)');
const codigo = readFileSync(SAIDA + 'demo.pingo', 'utf8');
const esperado = JSON.parse(readFileSync(SAIDA + 'demo-save.json', 'utf8'));
const srv = await servir(RAIZ + 'dist', 5412, '/Pingo/');
const browser = await pw.chromium.launch({ args: ARGS_CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const falhas: string[] = [];
vigiar(page, falhas);
await page.addInitScript(TURBO, 3);
const c = controle(page, page, 'teclado');
const log = (s: string) => console.log('  ' + s);
const foto = (n: string) => page.screenshot({ path: FOTOS + 'importar-' + n + '.png' }).catch(() => undefined);
const ev = (f: any, a?: unknown): Promise<any> => page.evaluate(f, a);
const conferir = (cond: boolean, msg: string) => { log((cond ? 'OK  ' : 'FALHA ') + msg); if (!cond) falhas.push(msg); };

try {
  console.log('== Save da demo no jogo completo — ' + srv.url);
  await page.goto(srv.url);
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 120000 });
  await ev(() => { (window as any).__pingo.jogo.opcoes.velTexto = 3; });
  await c.avancar((k) => /tela-saves/.test(topo(k)) && !k.cortina, 60000, 'tela de jogos');
  await c.dormir(300);
  await c.apertar('a'); await c.dormir(500); // Jogo 1 vazio → Novo jogo / Importar / Colar código / Voltar
  await c.apertar('baixo'); await c.dormir(150); await c.apertar('baixo'); await c.dormir(150);
  await c.apertar('a'); await c.dormir(800);
  await page.waitForSelector('textarea', { timeout: 10000 });
  await page.fill('textarea', codigo);
  await c.dormir(300); await foto('1-codigo-colado');
  await page.focus('textarea'); await page.keyboard.press('Enter'); await c.dormir(800);
  await foto('2-importado');
  for (let i = 0; i < 4; i++) { if ((await ev(() => (window as any).__pingo.save.listarSlots()[0]))) break; await c.dormir(300); }
  const slot = await ev(() => (window as any).__pingo.save.listarSlots()[0]);
  conferir(!!slot && slot.insignias.join() === '1,2', `"Colar código" guardou o jogo da demo no Jogo 1: ${JSON.stringify(slot)}`);
  await c.apertar('a'); await c.dormir(500); // fecha o aviso "Jogo de … guardado"
  const s = await c.continuarSlot(0);
  await c.dormir(500); await foto('3-continuou');
  const atual = await ev(() => (window as any).__pingo.jogo.save);
  const igual = (k: string) => JSON.stringify(atual[k]) === JSON.stringify(esperado[k]);
  const campos = ['equipe', 'viveiro', 'mochila', 'diario', 'insignias', 'amuletos', 'pcItens'];
  const dif = campos.filter((k) => !igual(k));
  const flagsFalta = Object.keys(esperado.flags).filter((k) => atual.flags[k] !== esperado.flags[k]);
  conferir(s.zona === esperado.jogador.zona && s.x === esperado.jogador.x && s.y === esperado.jogador.y, `abriu onde a demo parou: ${s.zona} (${s.x},${s.y})`);
  conferir(!dif.length, `sem perda: ${campos.join(', ')} iguais${dif.length ? ' — DIFERENTES: ' + dif.join(', ') : ''}`);
  conferir(!flagsFalta.length && atual.jogador.dinheiro === esperado.jogador.dinheiro && atual.jogador.nome === esperado.jogador.nome, `flags (${Object.keys(esperado.flags).length}), nome e dinheiro iguais${flagsFalta.length ? ' — faltam ' + flagsFalta.join(',') : ''}`);
  // 3. no completo o caminho segue: o guarda não existe e a Gruta do Eco abre
  const r = await ev(async () => {
    const m = (window as any).__pingo.mundo;
    await m.irPara('A-R3', 2, 2, 's', 'nenhuma');
    const p = (m.zona.def ?? m.zona).portoes?.[0];
    await m.irPara('A-R3', p.x, p.y + 1, 'n', 'nenhuma');
    return p;
  });
  await c.avancar(livre, 20000, 'livre');
  await c.andar('cima'); await c.andar('cima');
  const g = await c.avancar(livre, 30000, 'livre');
  await foto('4-gruta-aberta');
  conferir(g.zona === 'A-GE', `sem guarda no jogo completo: andando de (${r.x},${r.y + 1}) para o norte chegou a ${g.zona}`);

  // 4. save do jogo completo (pós-Liga) para a demo recusar
  const pos = JSON.parse(readFileSync(RAIZ + 'tools/testes/posliga/saves/pos-r1-lider-05.json', 'utf8'));
  await gravarNoSlot(page, pos, 2);
  const cod = await ev(() => (window as any).__pingo.save.exportar(2));
  writeFileSync(SAIDA + 'completo.pingo', cod);
  log(`save pós-Liga exportado (${cod.length} letras) → tools/testes/demo/saida/completo.pingo`);
} catch (e) { falhas.push('parou: ' + String((e as Error).stack ?? e).slice(0, 600)); await foto('erro'); }
console.log(falhas.length ? '\nFALHAS:\n - ' + falhas.join('\n - ') : '\nsem falhas');
await browser.close(); await srv.fechar();
process.exit(falhas.length ? 1 : 0);
