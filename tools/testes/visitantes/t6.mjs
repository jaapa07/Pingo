import { abrir } from './lib.mjs';
const Q = '?zona=X-EA&x=18&y=9&dir=n&insignias=16&amuletos=todos&equipe=9:70,100:70&flags=ea-rota&itens=cuia-guardia:1,cuia-ouro:5';
const t = await abrir(Q);
await t.pronto(); await t.espera(1500);
await t.tecla('n');
let susto = false;
for (let i = 0; i < 300; i++) {
  const st = await t.st(); if (st.nb > 0) break;
  const f = (await t.falas(1))[0] ?? '';
  if (f.includes('assustou')) susto = true;
  if (st.telas > 1) { await t.k('z', 300); continue; }
  await t.espera(250);
}
t.ok(!susto, 'galo não se assustou (jogador parado)');
await t.espera(4000);
console.log('batalha', JSON.stringify(await t.st()));
const b = await t.ev(() => { const u = window.__pingo.mundo.ultimaBatalha ?? window.__pingo.mundo.batalhas?.at(-1); return u ? { tipo: u.tipo, e: u.inimigos.map((c) => c.especie + ':' + c.nivel), arena: u.arena } : null; });
console.log('pedido', JSON.stringify(b));
t.ok(b && b.tipo === 'lendario' && b.e[0] === '181:60', 'batalha lendária 181 nv 60');
await t.foto('galo-batalha');
for (let i = 0; i < 6; i++) { await t.k('z', 700); }
await t.foto('galo-batalha-menu');
await t.ev(() => { window.__pingoEstado = 1; });
console.log('erros', t.erros);
await t.browser.close();
