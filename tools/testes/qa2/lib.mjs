// Apoio do QA do trecho 2 (ginásio 4 → Liga): abre o jogo com um save (checkpoint), injeta o piloto que joga pelo
// teclado (piloto-pagina.js) e expõe atalhos de alto nível. Relógio virtual: o requestAnimationFrame da página é
// bombeado o mais depressa que a CPU deixa (5 passos de 1/60 s por quadro) — a simulação é a mesma, só passa mais rápido.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const req = createRequire(import.meta.url);
export const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa2';
export const AQUI = new URL('.', import.meta.url).pathname;
export const BASE = 'http://localhost:5195/';
mkdirSync(S, { recursive: true });
export const lerSave = (nome) => JSON.parse(readFileSync(`${AQUI}saves/${nome}.json`, 'utf8'));
export const temSave = (nome) => existsSync(`${AQUI}saves/${nome}.json`);

const RELOGIO = (o) => {
  // relógio virtual: cada "quadro" avança 1000/12 ms (5 passos fixos de 60 Hz no laço do jogo)
  let agora = 1000; const fila = [];
  const real = performance.now.bind(performance);
  if (o.rapido) {
    performance.now = () => agora;
    window.requestAnimationFrame = (cb) => { fila.push(cb); return fila.length; };
    const canal = new MessageChannel();
    let n = 0;
    canal.port1.onmessage = () => {
      if (window.__pausaRelogio) { st0(() => canal.port2.postMessage(0), 30); return; }
      agora += 1000 / 12;
      const cbs = fila.splice(0);
      for (const cb of cbs) { try { cb(agora); } catch (e) { console.error(e); } }
      // de tempos em tempos cede a vez de verdade (rede, imagens, IPC do Playwright)
      if (++n % 8 === 0) st0(() => canal.port2.postMessage(0), 0); else canal.port2.postMessage(0);
    };
    const st0 = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st0(f, (ms || 0) / o.k, ...a);
    canal.port2.postMessage(0);
  }
  window.__realNow = real;
};

/**
 * abre o jogo com o save dado (objeto SaveData). Opções: rapido (padrão true), contexto (emulação), dificuldade.
 */
export async function abrir(save, o = {}) {
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(o.contexto ?? { viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' || /desconhecid|não registrada/.test(m.text())) erros.push(m.text().slice(0, 300)); });
  await page.addInitScript(RELOGIO, { rapido: o.rapido !== false, k: o.k ?? 10 });
  await page.goto(`${BASE}?zona=${save.jogador.zona}&x=${save.jogador.x}&y=${save.jogador.y}&dir=${save.jogador.dir}&semente=${o.semente ?? 7}`);
  await page.waitForFunction(() => window.__pingo?.mundo?.pronto, null, { timeout: 60000 });
  await page.evaluate(async ([sv, op]) => {
    const p = window.__pingo;
    p.jogo.carregar(sv);
    if (op.semente) { const r = await import('/src/core/rng.ts'); r.rng.seed(op.semente); }
    p.jogo.opcoes.dificuldade = op.dificuldade ?? 'aventureiro';
    p.jogo.opcoes.velTexto = 3; p.jogo.opcoes.animBatalha = op.anim ?? false;
    await p.mundo.irPara(sv.jogador.zona, sv.jogador.x, sv.jogador.y, sv.jogador.dir, 'nenhuma');
  }, [save, { dificuldade: o.dificuldade, semente: o.semente, anim: o.anim }]);
  await page.addScriptTag({ content: readFileSync(`${AQUI}piloto-pagina.js`, 'utf8'), type: 'module' });
  await page.waitForFunction(() => window.Q?.pronto || window.Q?.erro, null, { timeout: 60000 });
  const e0 = await page.evaluate(() => window.Q.erro);
  if (e0) throw new Error('piloto não carregou: ' + e0);
  const t = { page, browser, ctx, erros };
  /** roda uma função dentro da página com o piloto `Q` (pode demorar minutos) */
  t.q = (fn, arg) => page.evaluate(fn, arg);
  t.st = () => page.evaluate(() => window.Q.st());
  t.assentar = () => page.evaluate(() => window.Q.assentar());
  t.irAte = (x, y, o2) => page.evaluate(([x, y, o2]) => window.Q.irAte(x, y, o2 ?? {}), [x, y, o2]);
  t.usar = (x, y) => page.evaluate(([x, y]) => window.Q.usar(x, y), [x, y]);
  t.ir = (seq) => page.evaluate((s) => window.Q.ir(s), seq);
  t.agir = (d) => page.evaluate((d) => window.Q.agir(d), d);
  t.irZona = (z) => page.evaluate((z) => window.Q.irZona(z), z);
  t.falarCom = (id) => page.evaluate((id) => window.Q.falarCom(id), id);
  t.treinadores = (o2) => page.evaluate((o2) => window.Q.treinadores(o2 ?? {}), o2);
  t.catar = () => page.evaluate(() => window.Q.catar());
  t.resumo = () => page.evaluate(() => window.Q.resumo());
  t.batalhas = (desde = 0) => page.evaluate((d) => window.Q.batalhas.slice(d), desde);
  t.falas = (n = 6) => page.evaluate((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.flags = (re) => page.evaluate((r) => { const s = window.__pingo.jogo.save, x = new RegExp(r); return Object.keys(s.flags).filter((f) => x.test(f) && s.flags[f]); }, re);
  t.flag = (f) => page.evaluate((f) => !!window.__pingo.jogo.save.flags[f], f);
  t.npcs = () => page.evaluate(() => window.__pingo.mundo.npcs.map((q) => ({ id: q.id, x: q.ator.x, y: q.ator.y, sprite: q.def.sprite, tr: q.treinador?.id })));
  t.foto = async (nome) => {
    // o relógio virtual para durante a captura (a página fica ociosa para o compositor)
    await page.evaluate(() => { window.__pausaRelogio = true; });
    try { await page.screenshot({ path: `${S}/${nome}.png`, timeout: 20000 }); } catch (e) { console.log(`   (captura ${nome} falhou: ${String(e.message).split('\n')[0]})`); }
    await page.evaluate(() => { window.__pausaRelogio = false; });
    return `${S}/${nome}.png`;
  };
  t.save = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__pingo.jogo.save)));
  /** grava o checkpoint (só chame com o jogo livre no mapa) */
  t.checkpoint = async (nome) => { await t.assentar(); const sv = await t.save(); writeFileSync(`${AQUI}saves/${nome}.json`, JSON.stringify(sv)); console.log(`   [checkpoint ${nome}] ${sv.jogador.zona} (${sv.jogador.x},${sv.jogador.y}) $${sv.jogador.dinheiro} · ${sv.equipe.map((c) => c.especie + ':' + c.nivel).join(' ')}`); return sv; };
  t.ok = (cond, rotulo, extra = '') => { console.log(`${cond ? 'ok  ' : 'ERRO'} ${rotulo} ${extra}`); if (!cond) t.falhas = (t.falhas ?? 0) + 1; return cond; };
  t.exige = async (cond, rotulo) => { console.log(`${cond ? 'ok  ' : 'ERRO'} ${rotulo}`); if (!cond) { await t.foto('erro-' + rotulo.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)); throw new Error('falhou: ' + rotulo); } };
  t.fim = async () => { console.log('erros de console:', JSON.stringify([...new Set(erros)].slice(0, 8))); await browser.close(); };
  /** resumo das batalhas desde o índice dado, em uma linha por batalha */
  t.relato = async (desde = 0) => { const bs = await t.batalhas(desde); for (const b of bs) console.log(`   · ${b.tipo}${b.id ? ' ' + b.id : ''} [${b.inimigos}] ${b.resultado} t=${b.turnos}${Object.keys(b.usados).length ? ' usou ' + JSON.stringify(b.usados) : ''}${b.iaUsou ? ' IA usou ' + b.iaUsou + ' item' : ''}${b.resultado === 'derrota' ? ' | antes ' + b.antes : ''}`); return bs; };
  return t;
}
