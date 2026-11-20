// QA 2 — passada por TOQUE no iPhone emulado (relógio real): menu de pausa, uma batalha da Liga inteira pelos botões
// de toque (golpe, item da mochila, troca), salvar pelo menu e "Continuar" na tela de título.
// Uso: run.sh toque.mjs <seg> [aparelho="iPhone 13"] [save=plato]   (PULAR_LUTA=1: só menus, salvar e continuar)
import { abrir, lerSave, pw, BASE } from './lib.mjs';
const aparelho = process.argv[2] ?? 'iPhone 13', nome = aparelho.replace(/\s+/g, '-').toLowerCase();
const t = await abrir(lerSave(process.argv[3] ?? 'plato'), { contexto: { ...pw.devices[aparelho] }, rapido: false, anim: true });
const { page } = t;
const espera = (ms) => page.waitForTimeout(ms);
const rects = () => page.evaluate(async () => { const m = await import('/src/ui/toque.ts'); const r = m.retangulosToque(); const o = {}; for (const k in r) o[k] = [r[k].left, r[k].top, r[k].width, r[k].height]; return o; });
const DIR = { cima: [0, -0.36], baixo: [0, 0.36], esq: [-0.36, 0], dir: [0.36, 0] };
async function tap(acao, ms = 220) {
  const r = await rects();
  if (DIR[acao]) { const d = r.dpad; await page.touchscreen.tap(d[0] + d[2] / 2 + DIR[acao][0] * d[2], d[1] + d[3] / 2 + DIR[acao][1] * d[3]); }
  else { const b = r[acao]; if (!b) throw new Error('sem botão de toque: ' + acao); await page.touchscreen.tap(b[0] + b[2] / 2, b[1] + b[3] / 2); }
  await espera(ms);
}
/** o que está na tela agora (classes do topo + menus da batalha + foco) */
const tela = () => page.evaluate(() => {
  const P = window.__pingo, topo = P.telas.topo?.el.className ?? '', $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const foco = (raiz) => { const ls = [...(raiz?.querySelectorAll('.lista-item') ?? [])]; const i = ls.findIndex((l) => l.classList.contains('foco')); return { i, n: ls.length, txt: ls[i]?.textContent ?? '', todos: ls.map((l) => l.textContent) }; };
  const bt = $('.tela.batalha');
  return { topo, menu: /tela-menu/.test(topo) ? foco($('.tela-menu')) : null, lista: foco(document.querySelector('.tela.confirmacao') ?? document.querySelector('.tela.dialogo') ?? document), bt: bt ? { acoes: !!$('.bt-menu'), golpes: !!$('.bt-golpes'), mochila: !!$('.bt-mochila'), equipe: !!$('.bt-equipe'), esquecer: !!$('.bt-esquecer'), lutar: !!$('.bt-lutar')?.classList.contains('foco'), botao: $$('.bt-menu .bt-botao').findIndex((x) => /mol-botao-foco/.test(x.className)), botoes: $$('.bt-menu .bt-botao').map((x) => x.textContent) } : null,
    texto: ($('.dialogo') ?? $('.bt-caixa') ?? { textContent: '' }).textContent.slice(0, 80), mochila: { ...P.jogo.save.mochila }, equipe: P.jogo.save.equipe.map((c) => c.vida) };
});
// a fonte do jogo é desenhada em glifos (<i> com background-position): o texto NÃO está no DOM. Os menus são navegados
// pela posição, na ordem de src/ui/telas/menu.ts (Diário, Equipe, Mochila, Rádio, Perfil, Salvar, Opções, Sair) e dos
// botões da batalha (Mochila, Equipe, Fugir ao lado do LUTAR).
const ordemMenu = () => page.evaluate(() => { const s = window.__pingo.jogo.save, o = []; if (s.mochila['diario-de-campo'] || s.flags['ovo-entregue'] || s.diario.visto.length) o.push('Diário'); if (s.equipe.length) o.push('Equipe'); o.push('Mochila'); if (s.mochila['radio-cipo']) o.push('Rádio'); o.push('Perfil', 'Salvar', 'Opções', 'Sair'); return o; });
async function menuIr(rotulo) { const o = await ordemMenu(), alvo = o.indexOf(rotulo); let s; for (let k = 0; k < 12 && (s = await tela()).menu && s.menu.i !== alvo; k++) await tap(s.menu.i < alvo ? 'baixo' : 'cima'); return alvo; }
const BOTOES_BT = ['Mochila', 'Equipe', 'Fugir'];
const fora = async (rot) => { // controles de toque não podem cobrir o palco em pé; textos dentro da tela
  const i = await page.evaluate(async () => { const p = window.__pingo.palco; const m = await import('/src/ui/toque.ts'); const r = m.retangulosToque(); const cobre = []; for (const k in r) { const q = r[k]; if (q.left < p.x + p.w && q.left + q.width > p.x && q.top < p.y + p.h && q.top + q.height > p.y) cobre.push(k); if (q.left < 0 || q.top < 0 || q.left + q.width > innerWidth + 0.5 || q.top + q.height > innerHeight + 0.5) cobre.push(k + ' fora da janela'); } return { modo: p.modo, ctrl: p.controles, cobre }; });
  t.ok(i.cobre.length === 0 || i.ctrl === 'sobre', `${rot}: controles de toque fora do palco e dentro da janela`, JSON.stringify(i));
};
try {
  await espera(600); await fora('mundo'); await t.foto(`toque-${nome}-1-mundo`);
  // 1. menu de pausa por toque
  await tap('menu', 500); let s = await tela();
  t.ok(/tela-menu/.test(s.topo), 'botão Menu por toque abre o menu de pausa', s.menu?.todos.join(' · ')); await t.foto(`toque-${nome}-2-menu`);
  // equipe: abre e fecha
  await menuIr('Equipe');
  await tap('a', 600); s = await tela(); t.ok(/tela-equipe/.test(s.topo), 'Equipe pelo toque', s.topo); await t.foto(`toque-${nome}-3-equipe`);
  await tap('b', 500);
  await menuIr('Mochila');
  await tap('a', 600); s = await tela(); t.ok(/mochila/.test(s.topo), 'Mochila pelo toque', s.topo); await t.foto(`toque-${nome}-4-mochila`);
  await tap('b', 500); await tap('b', 500); s = await tela(); t.ok(/mundo/.test(s.topo), 'B fecha os menus', s.topo);
  if (process.env.PULAR_LUTA !== '1') {
  // 2. entra na Liga (o piloto anda; a conversa e a luta são por toque)
  await t.irAte(15, 53); await tap('cima', 400);
  for (let k = 0; k < 40; k++) { s = await tela(); if (await t.flag('liga-em-curso') && /mundo/.test(s.topo) && !(await t.st()).oc) break; if (/confirmacao|simnao|escolha/.test(s.topo) && s.lista.i > 0) await tap('cima'); else await tap('a', 350); }
  t.ok(await t.flag('liga-em-curso'), 'entrou na Liga respondendo Sim por toque'); await t.foto(`toque-${nome}-5-sala-de-espera`);
  const mare = await page.evaluate(() => window.Q.npc('liga-mare'));
  await t.irAte(mare.x, mare.y + 1); await t.foto(`toque-${nome}-6-mare`);
  await tap('cima', 300); await tap('a', 500);
  // 3. a batalha inteira por toque: golpes; no 2º turno um item; no 4º uma troca
  let turnos = 0, usouItem = false, trocou = false, guarda = 0, m0 = null, fotos = 0;
  const turnoAtual = () => page.evaluate(() => window.Q.batalhas.length);
  const nb0 = await turnoAtual();
  while (guarda++ < 900) {
    s = await tela();
    if ((await turnoAtual()) > nb0 && !s.bt) break;
    if (!s.bt) { await tap('a', 300); continue; }
    if (s.bt.esquecer) { await tap('b', 300); continue; }
    if (s.bt.mochila) {
      if (fotos < 9) { await t.foto(`toque-${nome}-8-mochila-batalha`); fotos = 9; }
      await tap('a', 500); s = await tela();
      if (s.bt?.equipe) { await t.foto(`toque-${nome}-9-alvo-do-item`); await tap('a', 700); }
      const s2 = await tela(); usouItem = Object.keys(m0).some((k) => (s2.mochila[k] ?? 0) < m0[k]); if (!usouItem) await tap('b', 300);
      continue;
    }
    if (s.bt.equipe) {
      if (!trocou && turnos >= 3) { await t.foto(`toque-${nome}-10-troca`); await tap('dir', 250); await tap('a', 600); const s2 = await tela(); if (!s2.bt?.equipe) trocou = true; else { await tap('baixo', 250); await tap('a', 600); trocou = !(await tela()).bt?.equipe; } if (!trocou) await tap('b', 300); continue; }
      // substituição obrigatória: procura alguém de pé
      await tap('a', 500); if ((await tela()).bt?.equipe) { await tap(['dir', 'baixo', 'esq'][guarda % 3], 250); }
      continue;
    }
    if (s.bt.golpes) { if (turnos === 0) await t.foto(`toque-${nome}-7-golpes`); await tap('a', 500); turnos++; continue; }
    if (s.bt.acoes) {
      if (!m0) m0 = s.mochila;
      const querBotao = !usouItem && turnos >= 1 ? /Mochila|Item/ : !trocou && turnos >= 3 ? /Equipe|Trocar|Criaturas/ : null;
      if (querBotao) {
        const alvo = BOTOES_BT.findIndex((x) => querBotao.test(x));
        if (alvo < 0) { console.log('   botões da batalha:', s.bt.botoes.join(' | ')); usouItem = trocou = true; continue; }
        if (s.bt.lutar) { await tap('dir', 250); continue; }
        if (s.bt.botao !== alvo) { await tap(s.bt.botao < alvo ? 'baixo' : 'cima', 250); continue; }
        await tap('a', 500); if (querBotao.test('Equipe')) { /* a tela de equipe trata */ } continue;
      }
      if (!s.bt.lutar) { await tap('esq', 250); continue; }
      await tap('a', 400); continue;
    }
    await tap('a', 300);
  }
  const b = (await t.batalhas(nb0))[0];
  t.ok(!!b, 'batalha da Liga terminou jogada só por toque', b ? `${b.id} ${b.resultado} t=${b.turnos} usou ${JSON.stringify(b.usados)}` : `guarda ${guarda}`);
  t.ok(usouItem, 'item da mochila usado por toque na batalha'); t.ok(trocou, 'troca de criatura por toque na batalha');
  for (let k = 0; k < 30; k++) { s = await tela(); if (/mundo/.test(s.topo) && !(await t.st()).oc) break; await tap('a', 350); }
  await t.foto(`toque-${nome}-11-depois-da-luta`);
  }
  // 4. salvar pelo menu, por toque
  await tap('menu', 500);
  // o harness abre o jogo por ?zona= (jogo de teste, slot −1): dá ao save o slot 1 para o menu poder gravar de verdade
  await page.evaluate(() => { window.__pingo.jogo.slot = 0; });
  await menuIr('Salvar');
  await tap('a', 700); await t.foto(`toque-${nome}-12-salvar`);
  for (let k = 0; k < 12; k++) { s = await tela(); if (/mundo/.test(s.topo)) break; if (/confirmacao/.test(s.topo) && s.lista.i > 0) await tap('cima'); else await tap(/tela-menu/.test(s.topo) && k > 3 ? 'b' : 'a', 600); }
  const salvo = await page.evaluate(() => Object.keys(localStorage).filter((k) => /pingo/.test(k)).map((k) => `${k}:${localStorage.getItem(k).length}`));
  t.ok(salvo.length > 0, 'jogo salvo pelo menu (toque)', salvo.join(' '));
  const antes = await t.st();
  // 5. recarrega a página sem atalhos e continua pelo título, por toque
  await page.goto(BASE); await espera(2500); await t.foto(`toque-${nome}-13-titulo`).catch(() => 0);
  let st = null;
  for (let k = 0; k < 40; k++) {
    st = await page.evaluate(() => { const P = window.__pingo; return P ? { topo: P.telas.topo?.el.className ?? '', zona: P.jogo.save?.jogador?.zona, x: P.jogo.save?.jogador?.x, y: P.jogo.save?.jogador?.y, pronto: !!P.mundo?.pronto, lista: [...document.querySelectorAll('.lista-item')].map((l) => (l.classList.contains('foco') ? '>' : '') + l.textContent) } : null; });
    if (st && /mundo/.test(st.topo) && st.pronto) break;
    if (k === 3) { console.log('   título:', JSON.stringify(st)); await page.screenshot({ path: (await t.foto(`toque-${nome}-14-jogos`)) }).catch(() => 0); }
    const r = await rects().catch(() => null);
    if (r?.a) await page.touchscreen.tap(r.a[0] + r.a[2] / 2, r.a[1] + r.a[3] / 2); else await page.touchscreen.tap(195, 300);
    await espera(700);
  }
  t.ok(st && /mundo/.test(st.topo) && st.zona === antes.zona, 'Continuar pela tela de título, por toque, volta ao mesmo lugar', JSON.stringify({ antes: [antes.zona, antes.x, antes.y], depois: st && [st.zona, st.x, st.y] }));
  await espera(800); await page.screenshot({ path: `${(await import('./lib.mjs')).S}/toque-${nome}-15-continuou.png` });
} catch (e) { console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await tela().catch(() => 0)).slice(0, 400)); await t.foto(`toque-${nome}-erro`); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
