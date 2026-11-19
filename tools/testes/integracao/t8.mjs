import { abrir } from './lib.mjs';
const t = await abrir('', { turbo: 3 });
const P = t.page;
const st = () => t.ev(() => { const p = window.__pingo; const m = p?.mundo; return { topo: p?.telas.topo?.el.className, n: p?.telas.pilha.length, zona: m?.zona?.id, x: m?.jogador?.x, y: m?.jogador?.y, oc: m?.ocupado, pronto: m?.pronto, eq: p?.jogo.save.equipe.length, emJogo: p?.save.estaEmJogo(), flags: Object.keys(p?.jogo.save.flags ?? {}).length }; });
try {
  await t.espera(2500); await t.ev(() => localStorage.clear()); await P.reload(); await t.espera(2500);
  for (let i = 0; i < 40; i++) { const s = await st(); if (/saves/.test(s.topo)) break; await t.k('z', 300); }
  console.log('saves', await st()); await t.foto('e-saves');
  await t.k('z', 500); await t.foto('e-novo'); await t.k('z', 700); await t.foto('e-dif');
  const dif = await t.ev(() => document.querySelector('.tela.dialogo') ? 1 : 0); t.ok(dif === 1, 'novo jogo pergunta a dificuldade');
  await t.k('z', 800);
  // abertura: avança tudo com A até ter controle no mundo (nomes: confirma o padrão)
  const t0 = Date.now(); let livre = 0, ult = '';
  while (Date.now() - t0 < 240000) {
    const s = await st();
    if (s.topo !== ult) { ult = s.topo; console.log(' tela:', s.topo, s.zona ?? ''); }
    if (/mundo/.test(s.topo) && s.pronto && !s.oc && s.n === 1) { if (++livre > 8) break; await t.espera(100); continue; }
    livre = 0;
    if (/nome/.test(s.topo)) { await P.keyboard.press('Enter'); await t.espera(200); await t.ev(() => { const p = window.__pingo; const tl = p.telas.topo; }); }
    await t.k('z', 90);
  }
  let s = await st(); console.log('controle', s, await t.ev(() => ({ dif: window.__pingo.jogo.opcoes.dificuldade, nome: window.__pingo.jogo.save.jogador.nome }))); await t.foto('e-mundo');
  t.ok(/mundo/.test(s.topo) && s.emJogo, 'abertura chega ao controle do jogador', s.zona);
  // menu → salvar
  await t.k('Escape', 500); await t.foto('e-menu');
  const idx = await t.ev(() => 0);
  // acha "Salvar": percorre a lista lendo o texto focado é caro; usa a ordem conhecida (… perfil, Salvar, Opções, Sair) → sobe 3 a partir do topo circular
  for (let i = 0; i < 3; i++) await t.k('ArrowUp', 150);
  await t.foto('e-menu2'); await t.k('z', 500); await t.foto('e-salvar'); await t.k('z', 700); await t.k('z', 500); await t.k('x', 400);
  const slot = await t.ev(() => ({ lista: window.__pingo.save.listarSlots?.().map((x) => x && { nome: x.nome ?? x.jogador?.nome }), slot: window.__pingo.jogo.slot })); console.log('slots', JSON.stringify(slot));
  const antes = await st();
  await P.reload(); await t.espera(2500);
  for (let i = 0; i < 40; i++) { const q = await st(); if (/saves/.test(q.topo)) break; await t.k('z', 300); }
  await t.foto('e-saves2'); await t.k('z', 500); await t.foto('e-cont'); await t.k('z', 800);
  for (let i = 0; i < 30; i++) { const q = await st(); if (/mundo/.test(q.topo) && q.pronto) break; await t.k('z', 300); }
  s = await st(); console.log('depois de continuar', s);
  t.ok(s.zona === antes.zona && s.x === antes.x && s.y === antes.y && s.flags >= antes.flags - 1, 'salvar → recarregar → continuar no mesmo lugar', JSON.stringify([antes.zona, antes.x, antes.y, s.zona, s.x, s.y]));
  await t.foto('e-cont-mundo');
} catch (e) { console.log('FALHA', e.message, await st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
