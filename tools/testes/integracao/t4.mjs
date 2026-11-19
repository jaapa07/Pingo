import { abrir } from './lib.mjs';
const TR = process.argv[2];
const t = await abrir(`?zona=A1&x=7&y=13&equipe=1:8,30:6&itens=radio-cipo,passe-trem,vara-velha&flags=liga-vencida,intro-ok&periodo=dia`, { turbo: 3 });
try {
  await t.pronto(); await t.espera(300);
  await t.ev(() => { window.__pingo.jogo.opcoes.velTexto = 3; });
  // pesca pelo item
  // revanche do rádio com derrota
  await t.ev((id) => { const p = window.__pingo; p.jogo.save.contatos.push(id); for (const c of p.jogo.save.equipe) c.vida = 1; p.jogo.save.jogador.dinheiro = 1000; p.jogo.save.flags['atalho'] = 'radio-cipo'; }, TR);
  await t.k('v', 700); await t.k('z', 700); await t.foto('rd-1'); await t.k('z', 700);
  let s; const t0 = Date.now(); let viu = false;
  while (Date.now() - t0 < 120000) { s = await t.st(); if (s.zona !== 'A1' && s.telas === 1 && !s.oc && s.pronto) break; if (/batalha/.test(s.topo)) viu = true; await t.k('z', 120); }
  s = await t.st(); const j = await t.ev(() => ({ d: window.__pingo.jogo.save.jogador.dinheiro, vidas: window.__pingo.jogo.save.equipe.map((c) => c.vida), posto: window.__pingo.jogo.save.ultimoPosto }));
  t.ok(viu, 'revanche pelo rádio abriu a batalha');
  t.ok(s.zona === j.posto.zona && j.d === 500 && j.vidas.every((v) => v > 1), 'derrota na revanche: último Posto, metade das patacas, equipe curada, menus fechados', JSON.stringify({ s, j }));
  console.log(await t.falas(4)); await t.foto('rd-fim');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
