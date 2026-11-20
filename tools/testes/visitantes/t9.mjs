import { abrir } from './lib.mjs';
const Q = '?zona=X-EA&x=18&y=9&dir=n&insignias=16&amuletos=todos&equipe=9:70,100:70&flags=ea-rota,intro-ok,diario&itens=cuia-guardia:1';
const t = await abrir(Q);
await t.pronto(); await t.espera(1500);
await t.tecla('n');
for (let i = 0; i < 300; i++) { const st = await t.st(); if (st.nb > 0) break; if (st.telas > 1) { await t.k('Enter', 300); continue; } await t.espera(250); }
console.log('batalha', JSON.stringify(await t.st()));
// captura pela MOCHILA → bolso Cuias → Cuia Guardiã
let fez = false;
for (let i = 0; i < 300; i++) {
  const s = await t.st(); if (s.telas <= 1 && s.nb > 0 && !s.oc) break;
  const info = await t.ev(() => ({ menu: !!document.querySelector('.bt-menu'), moch: !!document.querySelector('.bt-mochila'), topo: window.__pingo.telas.topo?.el.className, nome: !!document.querySelector('.tela-nome') }));
  if (i % 10 === 0) console.log('laço', i, JSON.stringify(info), JSON.stringify(s));
  if (info.nome) { await t.k('g', 300); await t.k('a', 300); await t.k('Enter', 1200); continue; }
    if (info.menu && !fez) { fez = true; await t.k('ArrowRight', 300); await t.k('z', 700); await t.foto('galo-mochila0'); await t.k('ArrowRight', 500); await t.foto('galo-mochila'); await t.k('z', 1500); continue; }
  await t.k('Enter', 400);
}
const r = await t.ev(() => ({ ok: window.__pingo.jogo.save.flags['galo-manao-ok'], eq: window.__pingo.jogo.save.equipe.map((c) => c.especie), visto: window.__pingo.jogo.save.diario.visto.filter((n) => n > 180), cap: window.__pingo.jogo.save.diario.capturado.filter((n) => n > 180) }));
t.ok(r.ok && r.eq.includes(181), 'Galo-Manaó capturado', JSON.stringify(r));
console.log((await t.falas(4)).join(' | '));
await t.foto('galo-depois');
// Diário: página Visitantes
await t.ev(() => window.__pingo.dialogo.abrirTela('diario')); await t.espera(1500);
await t.foto('diario-lista');
await t.k('Escape', 800); await t.foto('diario-visitantes');
await t.k('z', 1200); await t.foto('diario-ficha-galo');
await t.k('ArrowRight', 600); await t.k('ArrowRight', 800); await t.foto('diario-habitat-galo');
console.log('erros', t.erros);
await t.browser.close();
