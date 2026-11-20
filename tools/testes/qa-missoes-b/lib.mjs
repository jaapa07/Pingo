// Apoio do QA das missões do mapa B (cópia adaptada de tools/testes/qa3/qa3-lib.mjs; usa o mesmo piloto qa3-piloto.js): abre o jogo com um save (checkpoint), injeta o piloto que joga pelo
// teclado (qa3-piloto.js) e expõe atalhos de alto nível. Relógio virtual: o requestAnimationFrame da página é
// bombeado o mais depressa que a CPU deixa (5 passos de 1/60 s por quadro) — a simulação é a mesma, só passa mais rápido.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const req = createRequire(import.meta.url);
export const pw = req('/opt/node-tools/node_modules/playwright');
export const S = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qamb';
export const AQUI = new URL('.', import.meta.url).pathname;
export const BASE = 'http://127.0.0.1:5207/';
mkdirSync(S, { recursive: true });
export const lerSave = (nome) => JSON.parse(readFileSync(nome.includes('/') ? nome : `${AQUI}saves/${nome}.json`, 'utf8'));
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
    if (op.equipe) {
      const { criarCriatura } = await import('/src/world/deps.ts');
      p.jogo.save.equipe = op.equipe.map(([e, nv, ap]) => { const c = criarCriatura(e, nv, ap ? { apelido: ap } : {}); c.amizade = 255; return c; });
      for (const c of p.jogo.save.equipe) { if (!p.jogo.save.diario.capturado.includes(c.especie)) p.jogo.save.diario.capturado.push(c.especie); if (!p.jogo.save.diario.visto.includes(c.especie)) p.jogo.save.diario.visto.push(c.especie); }
    }
    if (op.hora != null) { const d = new Date(); p.jogo.save.relogio.deslocamentoMin = Math.round(op.hora * 60) - (d.getHours() * 60 + d.getMinutes()) + (op.diasMais ?? 0) * 1440; }
    if (op.dia != null) { p.jogo.save.relogio.diaSemana0 = (op.dia - new Date().getDay() + 7) % 7; }
    if (op.semente) { const r = await import('/src/core/rng.ts'); r.rng.seed(op.semente); }
    p.jogo.opcoes.dificuldade = op.dificuldade ?? 'aventureiro';
    p.jogo.opcoes.velTexto = 3; p.jogo.opcoes.animBatalha = op.anim ?? false;
    await p.mundo.irPara(sv.jogador.zona, sv.jogador.x, sv.jogador.y, sv.jogador.dir, 'nenhuma');
  }, [save, { dificuldade: o.dificuldade, semente: o.semente, anim: o.anim, equipe: o.equipe, hora: o.hora, dia: o.dia, diasMais: o.diasMais }]);
  await page.addScriptTag({ content: readFileSync(`${AQUI}../qa3/qa3-piloto.js`, 'utf8'), type: 'module' });
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
    // CDP direto: page.screenshot espera um quadro novo do compositor e estoura o prazo com a máquina cheia
    try { t.cdp ??= await ctx.newCDPSession(page); const r = await t.cdp.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${S}/${nome}.png`, Buffer.from(r.data, 'base64')); } catch (e) { console.log(`   (captura ${nome} falhou: ${String(e.message).split('\n')[0]})`); }
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

/* ------------------------------ QA das missões do mapa B: saves montados ------------------------------ */
/**
 * save montado a partir do checkpoint do QA 3 em Cidade Ginga (11 insígnias): `insignias` (nº), `flags` extras, posição e
 * mochila extra. Liga, Pantanal e Mina já vencidos; Amuletos todos.
 */
export function montar(zona, x, y, o = {}) {
  const sv = lerSave(`${AQUI}../qa3/saves/b5.json`);
  sv.jogador = { ...sv.jogador, zona, x, y, dir: o.dir ?? 's' };
  const n = o.insignias ?? 16;
  sv.insignias = Array.from({ length: n }, (_, i) => i + 1);
  sv.amuletos = ['faro', 'facao', 'remo', 'lampiao', 'quebra-pedra', 'forca', 'mergulho', 'escalar', 'cachoeira', 'voo'].slice(0, n >= 14 ? 10 : n >= 12 ? 9 : 8);
  Object.assign(sv.flags, { 'liga-vencida': true, 'pantanal-ok': true, 'mina-ok': true, 'b1-chegou': true }, o.flags ?? {});
  for (const [k, v] of Object.entries(o.mochila ?? {})) sv.mochila[k] = v;
  sv.relogio = { deslocamentoMin: 0, diaSemana0: 0 };
  sv.jogador.dinheiro = 100000;
  return sv;
}
/** equipe forte padrão (iniciais finais nv 90) + extras */
export const FORTE = [[3, 90], [6, 90], [9, 90]];
/** soma dias ao relógio do jogo (dentro da página) */
export async function avancarDias(t, n = 1) { await t.page.evaluate((k) => { window.__pingo.jogo.save.relogio.deslocamentoMin += k * 1440; }, n); }
/** muda a hora do relógio do jogo (0–24) */
export async function hora(t, h) { await t.page.evaluate((hh) => { const d = new Date(); const s = window.__pingo.jogo.save.relogio; const dias = Math.floor((s.deslocamentoMin + d.getHours() * 60 + d.getMinutes()) / 1440); s.deslocamentoMin = dias * 1440 + Math.round(hh * 60) - (d.getHours() * 60 + d.getMinutes()); }, h); }
/** número de falas registradas até agora (para ler só as novas) */
export const nFalas = (t) => t.page.evaluate(() => window.__pingo.mundo.falas.length);
export const falasDesde = (t, k) => t.page.evaluate((i) => window.__pingo.mundo.falas.slice(i).map((f) => f.texto), k);
export const mochila = (t, ids) => t.page.evaluate((l) => Object.fromEntries(l.map((i) => [i, window.__pingo.jogo.save.mochila[i] ?? 0])), ids);
export const fv = (t, f) => t.page.evaluate((k) => window.__pingo.jogo.save.flags[k], f);
/** regras de escolha do piloto: [[regex, índice], …] */
export const escolhas = (t, regras) => t.page.evaluate((r) => { window.Q.regrasEscolha = r.map(([s, i]) => [new RegExp(s, 'i'), i]); }, regras);
/** conversa com um NPC e devolve as falas novas */
export async function conversar(t, id) { const k = await nFalas(t); await t.falarCom(id); return falasDesde(t, k); }
/** interage com o tile (objeto) e devolve as falas novas */
export async function usarEm(t, x, y) { const k = await nFalas(t); await t.usar(x, y); return falasDesde(t, k); }
export const mostra = (rot, falas) => { console.log(`  [${rot}]`); for (const f of falas) console.log('     > ' + String(f).replace(/\n/g, ' / ').replace(/\f/g, ' // ').slice(0, 400)); };
/** teleporta para perto de um NPC (id) ou tile {x,y} na zona dada, num vizinho livre e pisável */
export async function junto(t, zona, alvo) {
  await t.assentar();
  const r = await t.page.evaluate(async ([z, a]) => {
    const p = window.__pingo, V = await import('/src/world/vivo.ts'), M = V.M;
    if (M.zv?.def.id !== z) { const w = (await import('/src/world/zonas.ts')); const def = (await import('/src/data/zonas/' + z + '.ts')).default; const w0 = def.warps?.[0]; await p.mundo.irPara(z, w0 ? w0.x : 1, w0 ? w0.y : 1, 's', 'nenhuma'); }
    let tx, ty;
    if (typeof a === 'string') { const n = M.npcs.find((q) => q.id === a); if (!n) return { erro: 'sem npc ' + a + ' em ' + z + ': ' + M.npcs.map((q) => q.id).join(',') }; tx = n.ator.x; ty = n.ator.y; } else { tx = a.x; ty = a.y; }
    const oc = new Set(M.npcs.filter((n) => n.ator.visivel).map((n) => n.ator.x + ',' + n.ator.y));
    for (const r of [1, 2, 3]) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const x = tx + dx * r, y = ty + dy * r;
      if (M.zv.dentro(x, y) && M.zv.chao(x, y) && !M.zv.warp(x, y) && !oc.has(x + ',' + y) && !M.zv.agua(x, y)) { await p.mundo.irPara(z, x, y, 's', 'nenhuma'); return { x, y, tx, ty }; }
    }
    return { erro: 'sem vizinho livre perto de ' + tx + ',' + ty };
  }, [zona, alvo]);
  if (r.erro) throw new Error(r.erro);
  return t.assentar();
}
