import { abrir } from './lib.mjs';
const t = await abrir('?zona=A1&x=7&y=13&equipe=1:9&itens=cuia:15,diario-de-campo,radio-cipo&flags=intro-ok&periodo=dia&semente=5', { turbo: 3 });
try {
  await t.pronto(); await t.espera(300);
  await t.ev(() => { window.__pingo.jogo.opcoes.velTexto = 3; window.__r = null; window.__pingo.bus.on('batalha-fim', (d) => { window.__r = d.resultado; }); });
  t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(10, 5); });
  await t.espera(5500);
  await t.k('z', 400); await t.k('z', 400); await t.espera(9000);
  for (let tent = 0; tent < 14; tent++) {
    if (await t.ev(() => window.__r)) break;
    await t.k('x', 200); await t.k('x', 200); await t.k('ArrowLeft', 150); await t.k('ArrowUp', 150);
    await t.k('ArrowRight', 250); await t.k('z', 500); if (tent === 0) await t.foto('cap-1');
    await t.k('ArrowRight', 250); if (tent === 0) await t.foto('cap-2');
    await t.k('z', 400); if (tent === 0) await t.foto('cap-3');
    for (let i = 0; i < 30; i++) { await t.espera(400); if (i === 6 && tent === 0) await t.foto('cap-4'); if (await t.ev(() => window.__r)) break; await t.k('z', 100); if (i > 18) break; }
  }
  for (let i = 0; i < 260; i++) { const q = await t.st(); if (q.telas <= 1) break; if (/nome/.test(q.topo)) { await t.page.keyboard.press('Enter'); await t.espera(400); continue; } await t.k('z', 120); }
  const fim = await t.ev(() => ({ r: window.__r, eq: window.__pingo.jogo.save.equipe.map((c) => c.especie), cuias: window.__pingo.jogo.save.mochila['cuia'], cap: window.__pingo.jogo.save.diario.capturado }));
  t.ok(fim.r === 'captura' && fim.eq.includes(10), 'captura real com cuia (batalha → mochila → cuia)', JSON.stringify(fim)); await t.foto('cap-fim');
  // telas a partir do mundo: diário, mapa (rádio), opções
  await t.assentar(20000, 'z');
  await t.k('Escape', 500); await t.k('z', 600); let s = await t.st(); t.ok(/diario/.test(s.topo), 'menu → Diário', s.topo); await t.foto('tela-diario'); await t.k('x', 400);
  s = await t.st(); if (!/menu/.test(s.topo)) await t.k('x', 400);
  for (let i = 0; i < 2; i++) await t.k('ArrowUp', 150); await t.k('z', 600); s = await t.st(); t.ok(/opcoes/.test(s.topo), 'menu → Opções', s.topo); await t.k('x', 400);
  for (let i = 0; i < 3; i++) await t.k('ArrowUp', 150); await t.k('z', 600); s = await t.st(); t.ok(/radio/.test(s.topo), 'menu → Rádio', s.topo);
  for (let i = 0; i < 5; i++) await t.k('ArrowDown', 120); await t.k('z', 600); s = await t.st(); t.ok(/mapa/.test(s.topo), 'Rádio → Mapa', s.topo); await t.foto('tela-mapa');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
