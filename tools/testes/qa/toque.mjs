// Passada por TOQUE no iPhone emulado (em pé): abertura com a tela de nome, andar, menu, salvar, continuar e uma batalha.
// Todo comando sai por toque de verdade (CDP Input.dispatchTouchEvent) nos controles da tela ou nas teclas da tela de nome.
// uso: node toque.mjs [abertura|batalha] [--turbo 3] [--deitado]
import { abrir, pw, AQUI } from './piloto.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const parte = process.argv[2] ?? 'abertura', deitado = process.argv.includes('--deitado');
const ap = pw.devices[deitado ? 'iPhone 13 landscape' : 'iPhone 13'];
const t = await abrir({ nome: 'toque' + (deitado ? '-d' : ''), turbo: Number(arg('turbo', 3)), contexto: ap });
const cdp = await t.ctx.newCDPSession(t.page);
const ret = () => t.ev(async () => { const m = await import('/src/ui/toque.ts'); const r = m.retangulosToque(), o = {}; for (const k in r) o[k] = { x: r[k].left, y: r[k].top, w: r[k].width, h: r[k].height }; return o; });
const dedo = async (x, y, ms = 70) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await t.espera(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
const DIR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }, BOT = { KeyZ: 'a', KeyX: 'b', Enter: 'menu' };
let toquesDados = 0;
const aperta = async (code, ms = 70) => { const r = await ret(); toquesDados++; if (DIR[code]) { const d = r.dpad; return dedo(d.x + d.w / 2 + DIR[code][0] * d.w * 0.33, d.y + d.h / 2 + DIR[code][1] * d.h * 0.33, ms); } const b = r[BOT[code] ?? code]; return dedo(b.x + b.w / 2, b.y + b.h / 2, ms); };
t.toque = async (code, ms = 55) => { await aperta(code); await t.espera(ms + 60); };
const tocaEl = async (sel, i = 0) => { const p = await t.ev(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, [sel, i]); if (!p) throw new Error('sem elemento ' + sel + '[' + i + ']'); await dedo(p.x, p.y); await t.espera(150); return p; };
const nomeNaTela = () => t.ev(() => window.__pingo.telas.topo?.el.className);
const anda = async (code, passos = 1) => { for (let i = 0; i < passos; i++) { const a = await t.snap(); await aperta(code, 140); await t.espera(260); await t.resolver(); const b = await t.snap(); if (a.x === b.x && a.y === b.y && a.zona === b.zona) { await aperta(code, 200); await t.espera(260); await t.resolver(); } } return t.snap(); };
const achados = [];
try {
  t.log('aparelho:', deitado ? 'iPhone 13 deitado' : 'iPhone 13 em pé', JSON.stringify(ap.viewport), 'controles', JSON.stringify(await ret()));
  if (parte === 'abertura') {
    t.respostas.unshift([/dificuldade/i, 'Aventureiro (Recomendado)'], [/Quem é você/i, 'Kauê']);
    await t.foto('splash');
    let nomeFeito = false;
    for (let i = 0; i < 700; i++) {
      const s = await t.snap();
      if (s.pronto && s.zona && !s.oc && s.telas === 1 && await t.flag('intro-ok')) break;
      if (!s.pronto && s.zona) { await t.espera(60); continue; }
      if (/tela-relogio/.test(s.topo)) { const h = await t.ev(() => new Date().getHours()); await t.foto('relogio'); await t.toque('KeyZ'); for (let k = 0; k < (10 - h + 24) % 24; k++) await t.toque('ArrowUp'); for (let k = 0; k < 3; k++) await t.toque('KeyZ', 150); await t.espera(200); continue; }
      if (s.pronto && s.zona && !s.oc && s.telas === 1) { const n = await t.ev(() => window.__qa.npc('mae')); if (!n) { await t.ev(() => 0); await aperta('ArrowDown', 300); await t.espera(300); continue; } await t.falarCom('mae'); continue; }
      if (s.dlg?.fase === 'escolhendo') {
        const regra = t.respostas.find(([re]) => re.test(s.dlg.texto ?? '')); const alvo = regra ? Math.max(0, s.dlg.opcoes.indexOf(regra[1])) : 0, n = s.dlg.opcoes.length;
        t.log('  pergunta:', s.dlg.texto, JSON.stringify(s.dlg.opcoes), '→', s.dlg.opcoes[alvo]); if (i < 80) await t.foto('pergunta-' + i);
        for (let k = 0; k < (alvo - s.dlg.indice + n) % n; k++) await t.toque('ArrowDown');
        await t.toque('KeyZ', 150); continue;
      }
      if (/tela-nome/.test(s.topo) && !nomeFeito) {
        await t.espera(300); await t.foto('nome-0');
        const lido = () => t.ev(() => { const el = window.__pingo.telas.topo; return el?.el.className; });
        // toca B, i, a nas teclas da tela (a 1ª letra troca a sugestão), erra um "z", apaga com o botão B, e toca "Fim"
        const tecla = async (ch) => { const i = await t.ev((ch) => { const P = [['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'ÁÀÂÃÉÊÍÓÔÕÚÜÇ', "0123456789-'."], ['abcdefghijklm', 'nopqrstuvwxyz', 'áàâãéêíóôõúüç', "0123456789-'."]]; for (const p of P) { const k = p.join('').indexOf(ch); if (k >= 0) return k; } return -1; }, ch); const p = await tocaEl('.tela-nome .tecla', i); return p; };
        const p1 = await tecla('B'); t.log('  tecla da tela de nome: alvo de toque', Math.round(p1.w) + '×' + Math.round(p1.h), 'px CSS');
        if (p1.w < 20 || p1.h < 20) achados.push(`tecla da tela de nome pequena para o dedo: ${Math.round(p1.w)}×${Math.round(p1.h)} px`);
        await tecla('i'); await tecla('a'); await tecla('z'); await t.foto('nome-1');
        await aperta('KeyX'); await t.espera(250); await t.foto('nome-2');
        await tocaEl('.tela-nome .tecla', 52 + 3); await t.espera(400);
        nomeFeito = true; t.log('  tela de nome fechou?', !/tela-nome/.test(await lido() ?? ''));
        continue;
      }
      await t.toque('KeyZ', 120);
    }
    await t.resolver();
    const nome = await t.ev(() => window.__pingo.jogo.save.jogador.nome); t.log('nome gravado:', nome); if (nome !== 'Bia') achados.push('nome por toque saiu "' + nome + '" (esperado "Bia")');
    await t.foto('quarto');
    const a = await t.snap(); t.log('no mapa:', JSON.stringify({ zona: a.zona, x: a.x, y: a.y }));
    for (const d of ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp']) { const antes = await t.snap(); const b = await anda(d, 1); t.log('  direcional', d, `(${antes.x},${antes.y}) → (${b.x},${b.y}) ${b.zona}`); if (b.zona !== antes.zona) break; }
    // menu por toque: abre, vai até Salvar com o direcional, salva
    await t.resolver(); await aperta('menu'); await t.espera(500);
    t.log('menu aberto?', await nomeNaTela()); await t.foto('menu');
    const ops = await t.ev(() => { const s = window.__pingo.jogo.save, o = []; if (s.mochila['diario-de-campo'] || s.flags['ovo-entregue'] || s.diario.visto.length) o.push('Diário'); if (s.equipe.length) o.push('Equipe'); o.push('Mochila'); if (s.mochila['radio-cipo'] || s.flags['intro-ok']) o.push('Rádio Cipó'); o.push(s.jogador.nome, 'Salvar', 'Opções', 'Sair'); return o; }); t.log('  opções do menu:', JSON.stringify(ops));
    if (!/tela-menu/.test(await nomeNaTela() ?? '')) achados.push('o botão Menu de toque não abriu o menu');
    else {
      const alvo = ops.indexOf('Salvar');
      const li = await tocaEl('.tela-menu .lista-item', alvo); t.log('  item do menu: alvo de toque', Math.round(li.w) + '×' + Math.round(li.h)); await t.espera(600); await t.foto('salvar-1'); t.log('  depois de Salvar:', await nomeNaTela(), JSON.stringify((await t.snap()).dlg ?? null));
      for (let k = 0; k < 12; k++) { const s = await t.snap(); if (s.telas === 1 && !s.oc) break; if (/tela-menu/.test(s.topo) && k > 2) { await aperta('KeyX'); await t.espera(300); continue; } await aperta('KeyZ'); await t.espera(450); if (k === 1) await t.foto('salvar-2'); }
      const guardado = await t.ev(() => Object.keys(localStorage).map((k) => k + ':' + (localStorage.getItem(k) ?? '').length)); t.log('  localStorage:', JSON.stringify(guardado));
      if (!guardado.length) achados.push('salvar por toque não gravou nada no localStorage');
    }
    // continuar: recarrega a página e entra no jogo salvo por toque
    const antes = await t.resumo();
    await t.page.reload(); await t.page.waitForFunction(() => window.__pingo?.telas, null, { timeout: 60000 });
    await t.page.evaluate(() => import('/tools/testes/qa/napagina.js')); await t.page.waitForFunction(() => window.__qa?.pronto, null, { timeout: 30000 });
    await t.espera(800); await t.foto('titulo');
    for (let i = 0; i < 80; i++) { const s = await t.snap(); if (s.pronto && s.zona && s.telas === 1 && !s.oc) break; if (i === 6) await t.foto('continuar'); await t.toque('KeyZ', 200); }
    const dep = await t.resumo(), nome2 = await t.ev(() => window.__pingo.jogo.save.jogador.nome);
    t.log('continuar:', JSON.stringify({ zona: dep.zona, x: dep.x, y: dep.y, nome: nome2 }), 'antes', JSON.stringify({ zona: antes.zona, x: antes.x, y: antes.y }));
    if (dep.zona !== antes.zona || nome2 !== 'Bia') achados.push('Continuar não voltou ao ponto salvo');
    await t.foto('continuou');
  } else {
    // batalha por toque: parte de um checkpoint jogado (com a inicial), vai à Trilha do Ipê e entra na grama alta com o direcional
    await t.carregar(arg('de', 'rio-passo-3'));
    await t.viajar('A-R1'); // caminho até a trilha pelo piloto de teclado; daqui em diante, só toque
    const K = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
    let lutou = false;
    for (let i = 0; i < 60 && !lutou; i++) {
      const g = await t.ev(() => { const q = window.__qa, m = window.__pingo.mundo; return q.grama().map(([x, y]) => ({ x, y, d: Math.abs(x - m.jogador.x) + Math.abs(y - m.jogador.y) })).filter((p) => p.d > 0 && q.plano(p.x, p.y, false)).sort((a, b) => a.d - b.d).slice(0, 3); });
      const alvo = g[i % g.length], pl = await t.ev(([x, y]) => window.__qa.plano(x, y, false), [alvo.x, alvo.y]);
      for (const d of pl) {
        if (d.length !== 1) break;
        await aperta(K[d], 150); await t.espera(200);
        for (let k = 0; k < 40; k++) { const s = await t.snap(); if (s.bat) { lutou = true; break; } if (!s.mov && !s.oc && s.telas === 1) break; await t.espera(60); }
        if (lutou) break;
      }
    }
    if (!lutou) throw new Error('não achou batalha andando por toque');
    for (let k = 0; k < 100; k++) { const s = await t.snap(); if (s.bat?.menu) break; await t.toque('KeyZ', 150); }
    await t.foto('batalha-menu');
    // um toque direto no cartão "Lutar" e num golpe (alvos da própria tela de batalha)
    const m1 = await tocaEl('.batalha .bt-menu .tocavel', 0); t.log('  toque direto no menu de batalha: alvo', Math.round(m1.w) + '×' + Math.round(m1.h)); await t.espera(400);
    let s = await t.snap(); t.log('  painel de golpes abriu?', !!s.bat?.golpes); await t.foto('batalha-golpes');
    if (!s.bat?.golpes) achados.push('toque direto em "Lutar" não abriu os golpes');
    else { const g1 = await tocaEl('.batalha .bt-golpes .bt-golpe', 0); t.log('  toque direto no golpe: alvo', Math.round(g1.w) + '×' + Math.round(g1.h)); await t.espera(500); }
    await t.espera(600); await t.foto('batalha-turno');
    const fim = await t.resolver(); await t.foto('batalha-fim');
    const r = await t.ev(() => window.__qa.resultados.slice(-1)[0]); t.log('batalha por toque:', JSON.stringify({ resultado: r?.resultado, inimigos: r?.inimigos, turnos: r?.turnos }), 'zona', fim.zona);
  }
} catch (e) { t.log('FALHA', e.stack?.split('\n').slice(0, 4).join(' | '), JSON.stringify(await t.snap().catch(() => 0))); await t.foto('erro').catch(() => 0); process.exitCode = 1; }
t.log('toques dados:', toquesDados, '· achados:', JSON.stringify(achados));
await t.fim();
