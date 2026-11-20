// Piloto do QA jogado: joga pelo teclado como um jogador honesto (anda por caminho calculado sobre a colisão viva,
// fala, luta com a política "esperta", cura no Posto, compra na Venda, captura). Não injeta nada no save.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
const req = createRequire(import.meta.url);
export const pw = req('/opt/node-tools/node_modules/playwright');
export const AQUI = new URL('.', import.meta.url).pathname;
export const BASE = 'http://localhost:5194/';
const KEY = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };

/** respostas às perguntas do jogo: devolve o rótulo (ou índice) a escolher; padrão = primeira opção */
const RESPOSTAS = [
  [/apelido/i, 'Não'],
  [/Quer que eu cuide/i, 'Sim'],
  [/Você vai escolher/i, 'Sim'],
];

export async function abrir(o = {}) {
  const turbo = o.turbo ?? 5;
  const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(o.contexto ?? { viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  if (turbo !== 1) await page.addInitScript((k) => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
    const st = window.setTimeout.bind(window);
    window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / k, ...a);
  }, turbo);
  await page.goto(BASE + (o.query ?? ''));
  await page.waitForFunction(() => window.__pingo?.telas, null, { timeout: 60000 });
  await page.evaluate(() => import('/tools/testes/qa/napagina.js'));
  await page.waitForFunction(() => window.__qa?.pronto, null, { timeout: 30000 });
  const t = { page, browser, ctx, erros, diario: [], nome: o.nome ?? 'qa', respostas: [...(o.respostas ?? []), ...RESPOSTAS], perguntas: [], plano: null, derrotas: 0 };
  const ev = t.ev = (f, a) => page.evaluate(f, a);
  t.espera = (ms) => page.waitForTimeout(ms);
  t.log = (...a) => { const l = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); console.log(l); if (o.arquivoLog) appendFileSync(o.arquivoLog, l + '\n'); };
  t.snap = () => ev(() => window.__qa.snap());
  t.resumo = () => ev(() => window.__qa.resumo());
  t.foto = (nome) => page.screenshot({ path: `${AQUI}fotos/${t.nome}-${nome}.png` });
  t.falas = (n = 6) => ev((k) => window.__pingo.mundo.falas.slice(-k).map((f) => f.texto), n);
  t.flag = (f) => ev((f) => window.__pingo.jogo.save.flags[f], f);
  t.cond = (c) => ev(async (c) => (await import('/src/core/estado.ts')).cond(c), c);
  /** toque rápido numa tecla (keydown+keyup no mesmo instante vale por um passo do jogo) */
  t.toque = async (code, ms = 55) => { await ev((code) => { for (const tipo of ['keydown', 'keyup']) document.dispatchEvent(new KeyboardEvent(tipo, { code, key: code === 'Enter' ? 'Enter' : code, bubbles: true })); }, code); await t.espera(ms); };
  const toques = async (lista) => { for (const c of lista) await t.toque(c); };
  const A = 'KeyZ', B = 'KeyX';

  /* ------------------------------ batalha ------------------------------ */
  async function passoBatalha(s) {
    const b = s.bat;
    if (b.menu) {
      const p = t.plano = await ev(() => window.__qa.decidir());
      if (p.tipo === 'golpe') await toques(['ArrowLeft', A]);
      else if (p.tipo === 'troca') await toques(['ArrowLeft', 'ArrowRight', 'ArrowDown', A]);
      else if (p.tipo === 'item') await toques(['ArrowLeft', 'ArrowRight', A]);
      else if (p.tipo === 'fuga') await toques(['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowDown', A]);
      else await t.toque(A);
      await t.espera(60); return;
    }
    if (b.golpes) {
      const alvo = t.plano?.tipo === 'golpe' ? t.plano.slot : 0, de = Math.max(0, b.focoGolpe), k = [];
      if (alvo % 2 !== de % 2) k.push(alvo % 2 ? 'ArrowRight' : 'ArrowLeft');
      if ((alvo >> 1) !== (de >> 1)) k.push(alvo >> 1 ? 'ArrowDown' : 'ArrowUp');
      await toques([...k, A]); t.plano = null; await t.espera(60); return;
    }
    if (b.mochila) {
      const p = t.plano;
      if (p?.tipo !== 'item' || p.indice < 0) { await t.toque(B); return; }
      const k = []; for (let i = 0; i < (p.bolso - b.aba + 3) % 3; i++) k.push('ArrowRight');
      for (let i = 0; i < p.indice; i++) k.push('ArrowDown');
      await toques([...k, A]); if (p.cuia) t.plano = null; await t.espera(60); return;
    }
    if (b.equipe) {
      let alvo;
      if (t.plano?.tipo === 'troca') alvo = t.plano.para; else if (t.plano?.tipo === 'item') alvo = t.plano.alvo; else alvo = await ev(() => window.__qa.substituto());
      const de = Math.max(0, b.focoEquipe), k = [];
      const col = () => { if (alvo % 2 !== de % 2) k.push(alvo % 2 ? 'ArrowRight' : 'ArrowLeft'); };
      const lin = () => { const dl = (alvo >> 1) - (de >> 1); for (let i = 0; i < Math.abs(dl); i++) k.push(dl > 0 ? 'ArrowDown' : 'ArrowUp'); };
      if ((alvo >> 1) > (de >> 1)) { col(); lin(); } else { lin(); col(); }
      await toques([...k, A]); t.plano = null; await t.espera(60); return;
    }
    if (b.esquecer) { const k = []; for (let i = 0; i < (t.plano?.slot ?? 0); i++) k.push('ArrowDown'); await toques([...k, A]); t.plano = null; return; }
    if (b.lista) {
      if (b.fase === 'oferta') { const para = await ev(() => window.__qa.responderOferta()); if (para === null || para === undefined) await t.toque(B); else { t.plano = { tipo: 'troca', para }; await t.toque(A); } return; }
      if (b.terminou) { await t.toque(B); return; } // apelido da capturada: não
      if (t.plano?.desistir) { t.plano = null; await t.toque(A); return; }
      const slot = await ev(() => window.__qa.aprender());
      if (slot >= 0) { t.plano = { aprender: true, slot }; await t.toque(A); } else { t.plano = { desistir: true }; await t.toque(B); }
      await t.espera(80); return;
    }
    await t.toque(A, 45);
  }

  /* ------------------------------ laço geral: resolve tudo o que aparecer até o mapa ficar livre ------------------------------ */
  let nresVisto = 0;
  async function anotarBatalhas() {
    const novos = await ev((n) => window.__qa.resultados.slice(n), nresVisto);
    for (const r of novos) { nresVisto++; t.diario.push(r); if (r.tipo === 'treinador' || r.resultado !== 'vitoria') t.log(`  [batalha] ${r.treinador ?? 'selvagem ' + r.inimigos} → ${r.resultado} · equipe ${r.equipe} · ${r.zona} · $${r.dinheiro}`); if (r.resultado === 'derrota') t.derrotas++; }
    return novos;
  }
  t.batalhasNovas = anotarBatalhas;
  t.resolver = async (max = 900000) => {
    const t0 = Date.now(); let livres = 0, parado = 0;
    while (Date.now() - t0 < max) {
      const s = await t.snap();
      if (!s.pronto || s.ocupada) { await t.espera(40); livres = 0; if (++parado > 1500) throw new Error('resolver: jogo não fica pronto ' + JSON.stringify(s)); continue; }
      parado = 0;
      if (s.bat) { livres = 0; await passoBatalha(s); continue; }
      if (s.dlg?.fase === 'escolhendo' && s.dlg.opcoes) {
        livres = 0;
        const perg = s.dlg.texto ?? '';
        let alvo = 0; const regra = t.respostas.find(([re]) => re.test(perg));
        if (regra) { const r = typeof regra[1] === 'function' ? regra[1](s.dlg.opcoes, perg) : regra[1]; alvo = typeof r === 'number' ? r : Math.max(0, s.dlg.opcoes.indexOf(r)); }
        t.perguntas.push(perg + ' → ' + s.dlg.opcoes[alvo]);
        const n = s.dlg.opcoes.length, k = []; for (let i = 0; i < (alvo - s.dlg.indice + n) % n; i++) k.push('ArrowDown');
        await toques([...k, A]); await t.espera(60); continue;
      }
      if (s.telas > 1 || s.oc) {
        livres = 0;
        if (/tela-relogio/.test(s.topo)) { // acerta o relógio para as 10 h (um jogador joga de dia): A → hora, ↑ até 10, A A A
          const h = await ev(() => new Date().getHours()), k = [A]; for (let i = 0; i < (10 - h + 24) % 24; i++) k.push('ArrowUp');
          await toques([...k, A, A, A]); await t.espera(200);
        }
        else if (/tela-nome/.test(s.topo)) await t.toque(A, 150);
        else if (/tela-menu/.test(s.topo)) await t.toque(B, 100);
        else await t.toque(A, 45);
        continue;
      }
      if (s.mov) { livres = 0; await t.espera(25); continue; }
      if (++livres >= 3) { await anotarBatalhas(); return s; }
      await t.espera(25);
    }
    throw new Error('resolver: tempo esgotado ' + JSON.stringify(await t.snap()));
  };

  /* ------------------------------ andar ------------------------------ */
  t.virar = async (d) => { const s = await t.resolver(); if (s.dir === d) return; await ev((code) => new Promise((res) => { document.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true })); requestAnimationFrame(() => { document.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true })); res(); }); }), KEY[d]); await t.espera(120); const b = await t.snap(); if (b.dir !== d && !b.oc && b.telas === 1) await ev((d) => window.__pingo.mundo.jogador.dir === d || 0, d); };
  t.agir = async (d) => { if (d) await t.virar(d); await t.resolver(); await t.toque(A, 150); return t.resolver(); };
  /** passos literais (roteiros de ginásio): 'nnl' */
  t.ir = async (seq, correr = false) => { let s; for (const d of seq) { await t.resolver(); await ev(([d, c]) => window.__qa.andar([d], c), [d, correr]); s = await t.resolver(); } return s; };
  /** anda até (tx, ty) (ou vizinho); replaneja a cada surpresa; devolve o estado; para se a zona mudar */
  t.irAte = async (tx, ty, op = {}) => {
    const z0 = (await t.resolver()).zona;
    for (let volta = 0; volta < 300; volta++) {
      const s = await t.resolver();
      if (s.zona !== z0) return s;
      const pl = await ev(([tx, ty, v]) => window.__qa.plano(tx, ty, v), [tx, ty, !!op.vizinho]);
      if (pl === null) { if (op.tolerante) return null; throw new Error(`sem caminho em ${s.zona} de (${s.x},${s.y}) até (${tx},${ty})`); }
      if (!pl.length) return s;
      const i = pl.findIndex((p) => p.length > 1);
      if (i === 0) { await t.agir(pl[0][1]); const b = await t.snap(); if (b.x === s.x && b.y === s.y && b.zona === z0) await t.ir(pl[0][1]); continue; }
      const r = await ev(([p, c]) => window.__qa.andar(p, c), [i < 0 ? pl : pl.slice(0, i), op.correr !== false]);
      if (r.motivo === 'tranco') await t.espera(150);
    }
    throw new Error(`irAte: não chegou a (${tx},${ty})`);
  };
  /** interage com o que está em (tx, ty) */
  t.usar = async (tx, ty) => {
    const s = await t.irAte(tx, ty, { vizinho: true });
    const d = tx > s.x ? 'l' : tx < s.x ? 'o' : ty > s.y ? 's' : 'n';
    return t.agir(d);
  };
  t.npc = (id) => ev((id) => window.__qa.npc(id), id);
  t.falarCom = async (id) => { for (let i = 0; i < 6; i++) { const n = await t.npc(id); if (!n) throw new Error('NPC ausente: ' + id + ' em ' + (await t.snap()).zona); const nb = t.diario.length; await t.usar(n.x, n.y); const m = await t.npc(id); if (!m || (m.x === n.x && m.y === n.y) || t.diario.length !== nb) return; } };

  /** vai até a zona `destino` atravessando warps; `ate` = [x, y] final opcional */
  t.viajar = async (destino, ate) => {
    let ultima = '', repet = 0;
    for (let i = 0; i < 80; i++) {
      const s = await t.resolver();
      if (s.zona === destino) { if (ate) await t.irAte(ate[0], ate[1], { vizinho: !!ate[2] }); return t.resolver(); }
      const w = await ev((d) => window.__qa.proximoWarp(d), destino);
      if (w.erro) throw new Error(w.erro);
      const chave = s.zona + '>' + w.para; if (chave === ultima) { if (++repet > 3) throw new Error('viajar: preso em ' + chave); } else { ultima = chave; repet = 0; }
      const r = await t.irAte(w.x, w.y);
      if (r.zona === s.zona) {
        // warp de borda: empurra para fora do mapa
        const z = await ev(() => ({ w: window.__pingo.mundo.zona.mapaChars[0].length, h: window.__pingo.mundo.zona.mapaChars.length }));
        const d = r.x === 0 ? 'o' : r.y === 0 ? 'n' : r.x === z.w - 1 ? 'l' : r.y === z.h - 1 ? 's' : null;
        if (d) await t.ir(d);
        await t.espera(200);
      }
    }
    throw new Error('viajar: não chegou a ' + destino);
  };

  /* ------------------------------ cuidados ------------------------------ */
  t.saude = () => ev(() => window.__qa.saude());
  t.precisaCurar = async () => { const h = await t.saude(); return h.caidos > 0 || h.lider < 0.45 || h.frac < 0.55 || h.semPg; };
  /** cura no último Posto visitado (ou com a mãe, antes do primeiro Posto) e fica lá */
  t.curar = async () => {
    const posto = await ev(() => window.__pingo.jogo.save.ultimoPosto?.zona);
    if (!posto || !/-posto$/.test(posto)) { await t.viajar('A1-casa-jogador'); await t.falarCom('mae'); }
    else { await t.viajar(posto); const n = await ev(() => window.__qa.npcPor('script', 'posto')); if (!n) throw new Error('Posto sem atendente: ' + posto); await t.usar(n.x, n.y); }
    const h = await t.saude(); if (h.caidos || h.frac < 0.99) throw new Error('a cura não curou: ' + JSON.stringify(h));
    t.curas = (t.curas ?? 0) + 1;
  };
  /** garante estar em `zona` com a equipe em condições; devolve true se precisou sair para curar */
  t.emZona = async (zona) => { let saiu = false; for (let i = 0; i < 10; i++) { await t.viajar(zona); if (!(await t.precisaCurar())) return saiu; await t.curar(); saiu = true; } throw new Error('emZona: não consegue ficar em ' + zona); };

  /** luta com todos os treinadores alcançáveis da zona e pega os itens à vista */
  t.limpar = async (zona, op = {}) => {
    const perdas = new Map();
    for (let i = 0; i < 80; i++) {
      await t.emZona(zona);
      const it = (await ev(() => window.__qa.itens()))[0];
      if (it && !op.semItens) { const n = t.diario.length; await t.usar(it.x, it.y); if (t.diario.length === n) continue; else continue; }
      const lista = (await ev(() => window.__qa.treinadores())).filter((x) => !x.lider && (perdas.get(x.t) ?? 0) < (op.tentativas ?? 3) && !(op.menos ?? []).includes(x.t));
      if (!lista.length) return;
      const alvo = lista[0], d0 = t.derrotas, n0 = t.diario.length;
      const s = await t.irAte(alvo.x, alvo.y, { vizinho: true, tolerante: true });
      if (s && t.diario.length === n0 && s.zona === zona) { const m = await t.npc(alvo.id); if (m) await t.usar(m.x, m.y); }
      if (t.derrotas > d0) { perdas.set(alvo.t, (perdas.get(alvo.t) ?? 0) + 1); t.log(`  DERROTA para ${alvo.t} (nv ${alvo.nv})`); if (op.aoPerder) await op.aoPerder(alvo); }
    }
  };
  /** treino em grama alta da zona até a criatura mais forte ganhar `niveis` níveis (anotado como treino extra) */
  t.treinar = async (zona, niveis = 1, rotulo = '') => {
    const nv = async () => Math.max(...(await t.resumo()).equipe.map((c) => c.nv));
    const ini = await nv(), n0 = t.diario.length;
    for (let i = 0; i < 400 && (await nv()) < ini + niveis; i++) {
      await t.emZona(zona);
      const g = await ev(() => { const q = window.__qa, m = window.__pingo.mundo; return q.grama().map(([x, y]) => ({ x, y, d: Math.abs(x - m.jogador.x) + Math.abs(y - m.jogador.y) })).filter((p) => p.d > 0 && q.plano(p.x, p.y, false)).sort((a, b) => a.d - b.d).slice(0, 2); });
      if (!g.length) throw new Error('treinar: sem grama alcançável em ' + zona);
      await t.irAte(g[g.length - 1].x, g[g.length - 1].y, { tolerante: true, correr: false });
    }
    const extra = { zona, rotulo, niveis, batalhas: t.diario.length - n0, de: ini, para: await nv() };
    (t.treinoExtra ??= []).push(extra); t.log('  TREINO EXTRA', extra);
  };

  t.curarSePreciso = async () => { const h = await t.saude(); if (h.caidos || h.frac < 0.999) await t.curar(); };
  /** anda pela grama alta da zona até a equipe ter `tamanho` criaturas (capturando espécies novas) ou `maxBatalhas` */
  t.cacar = async (zona, tamanho, maxBatalhas = 30) => {
    const n0 = t.diario.length;
    for (let i = 0; i < 600; i++) {
      const r = await t.resumo(); if (r.equipe.length >= tamanho || t.diario.length - n0 >= maxBatalhas) break;
      const cuias = Object.entries(r.mochila).filter(([id, q]) => /^cuia/.test(id) && q > 0).length; if (!cuias) { t.log('  caça: acabaram as cuias'); break; }
      await t.emZona(zona);
      const g = await ev(() => { const q = window.__qa, m = window.__pingo.mundo; return q.grama().map(([x, y]) => ({ x, y, d: Math.abs(x - m.jogador.x) + Math.abs(y - m.jogador.y) })).filter((p) => p.d > 0 && p.d < 40 && q.plano(p.x, p.y, false)).sort((a, b) => a.d - b.d).slice(0, 2); });
      if (!g.length) throw new Error('caçar: sem grama alcançável em ' + zona);
      await t.irAte(g[g.length - 1].x, g[g.length - 1].y, { tolerante: true, correr: false });
    }
    t.log(`  caça em ${zona}: ${t.diario.length - n0} batalhas, equipe ${JSON.stringify((await t.resumo()).equipe.map((c) => c.nome + ' ' + c.nv))}`);
  };

  /* ------------------------------ Venda ------------------------------ */
  /** compra `lista` = [[id, qtd]…] na Venda da zona (vai até o balcão, navega a loja pelo teclado) */
  t.comprar = async (zonaVenda, lista) => {
    await t.viajar(zonaVenda);
    const n = await ev(() => window.__qa.npcPor('loja')); if (!n) throw new Error('Venda sem vendedor: ' + zonaVenda);
    const prat = await ev((id) => window.__qa.tabelaLoja(window.__pingo.mundo.npc(id).def.loja), n.id);
    const s = await t.irAte(n.x, n.y, { vizinho: true }).catch(() => null);
    if (!s) { // balcão no meio: fala por cima dele
      const alvo = await ev(([x, y]) => { const q = window.__qa; for (const [dx, dy, d] of [[0, 2, 'n'], [0, -2, 's'], [2, 0, 'o'], [-2, 0, 'l']]) if (q.plano(x + dx, y + dy, false)) return [x + dx, y + dy, d]; return null; }, [n.x, n.y]);
      if (!alvo) throw new Error('vendedor inalcançável em ' + zonaVenda);
      await t.irAte(alvo[0], alvo[1]); await t.virar(alvo[2]);
    } else await t.virar(n.x > s.x ? 'l' : n.x < s.x ? 'o' : n.y > s.y ? 's' : 'n');
    await t.toque(A, 200);
    for (let i = 0; i < 200; i++) { const x = await t.snap(); if (/tela-loja/.test(x.topo)) break; if (i === 199) throw new Error('a loja não abriu'); await t.toque(A, 80); }
    await t.espera(200); await t.toque(A, 200); // Comprar
    const comprou = [];
    for (const [id, qtd] of lista) {
      const i = prat.findIndex((p) => p.id === id); if (i < 0 || qtd <= 0) continue;
      const din = (await t.resumo()).dinheiro, q = Math.min(qtd, Math.floor(din / prat[i].preco)); if (q < 1) continue;
      const k = []; for (let j = 0; j < i; j++) k.push('ArrowDown');
      await toques(k); await t.toque(A, 200);
      const sobe = []; for (let j = 1; j < q; j++) sobe.push('ArrowUp');
      await toques(sobe); await t.toque(A, 250); // confirma a quantidade
      await t.toque(A, 250); // OK do aviso
      const volta = []; for (let j = 0; j < i; j++) volta.push('ArrowUp'); await toques(volta);
      comprou.push(`${q}× ${id}`);
    }
    await t.foto('loja-' + zonaVenda);
    for (let i = 0; i < 6; i++) { const x = await t.snap(); if (!/tela-loja/.test(x.topo)) break; await t.toque(B, 200); }
    await t.resolver();
    t.log(`  compras em ${zonaVenda}: ${comprou.join(', ') || 'nada'} · sobrou $${(await t.resumo()).dinheiro}`);
  };

  /* ------------------------------ checkpoints ------------------------------ */
  t.salvar = async (nome) => {
    const dados = await ev(() => { const p = window.__pingo; p.jogo.save.rng = p.jogo.save.rng; return JSON.stringify({ save: p.jogo.save, opcoes: p.jogo.opcoes }); });
    writeFileSync(`${AQUI}saves/${nome}.json`, JSON.stringify({ ...JSON.parse(dados), qa: { diario: t.diario, treinoExtra: t.treinoExtra ?? [], derrotas: t.derrotas, curas: t.curas ?? 0, perguntas: [...new Set(t.perguntas)] } }));
    t.log(`== checkpoint ${nome}:`, JSON.stringify((await t.resumo()).equipe.map((c) => `${c.nome} ${c.nv}`)), '$' + (await t.resumo()).dinheiro);
  };
  /** retoma um checkpoint alcançado jogando (a página tem de estar no título/splash) */
  t.carregar = async (nome) => {
    const d = JSON.parse(readFileSync(`${AQUI}saves/${nome}.json`, 'utf8'));
    t.diario = d.qa?.diario ?? []; t.treinoExtra = d.qa?.treinoExtra ?? []; t.derrotas = d.qa?.derrotas ?? 0; t.curas = d.qa?.curas ?? 0;
    await ev(async (d) => {
      const p = window.__pingo; const { rng } = await import('/src/core/rng.ts');
      Object.assign(p.jogo.opcoes, d.opcoes); p.jogo.slot = 0; p.jogo.carregar(d.save); rng.seed(d.save.rng);
      p.save.marcarEmJogo(true);
      const j = d.save.jogador; await p.mundo.irPara(j.zona, j.x, j.y, j.dir, 'nenhuma');
    }, d);
    await page.waitForFunction(() => window.__pingo.mundo?.pronto, null, { timeout: 30000 });
    await t.resolver();
  };
  t.temSave = (nome) => existsSync(`${AQUI}saves/${nome}.json`);
  t.fim = async () => { t.log('erros de console:', JSON.stringify([...new Set(t.erros)].slice(0, 10))); await browser.close(); };
  return t;
}
