// A Pelagem Rara garantida: pós-Liga, capanga Ferrolho no Lago do Fundo (A-GB-2) → batalha → Mandizinho raro → captura.
import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-GB-2&x=27&y=8&dir=o&flags=liga-vencida&amuletos=todos&equipe=4:70&itens=cuia-ouro:30&insignias=8&semente=21');
const { page } = t;
await t.pronto(); await t.assentar(); await t.virar('o');
await t.ev(async () => {
  const E = await import('/src/battle/engine.ts'); window.__msgs = []; const m = E.Batalha.prototype.msg; E.Batalha.prototype.msg = function (x) { window.__msgs.push(x); return m.call(this, x); }; const ini = E.Batalha.prototype.iniciar; E.Batalha.prototype.iniciar = function () { if (this.cfg.tipo === 'treinador') for (const c of this.lados[1].equipe) c.vida = 1; return ini.call(this); };
  window.__fins = []; window.__pingo.bus.on('batalha-fim', (d) => window.__fins.push({ r: d.resultado, rara: d.pedido.inimigos.map((c) => !!c.rara) }));
});
t.ok(await t.ev(() => !!window.__pingo.mundo.npc('cartel-lago')?.ator.visivel), 'capanga visível no lago depois da Liga');
await t.foto('lago-capanga');
await t.k('z', 500);
const menu = () => t.ev(() => !!document.querySelector('.bt-menu'));
const fins = () => t.ev(() => window.__fins.length);
// 1ª batalha (treinador): só ataca
for (let i = 0; i < 300 && (await fins()) < 1; i++) await t.k('z', 200);
// 2ª (o Mandizinho raro): espera a entrada, fotografa e arremessa Cuia de Ouro até capturar
let foto = false, primeira = true;
for (let i = 0; i < 400 && (await fins()) < 2; i++) {
  if (await menu()) {
    if (!foto) { await t.foto('lago-rara'); foto = true; }
    await t.k('ArrowLeft', 200); await t.k('ArrowDown', 250); await t.k('z', 500); if (primeira) await t.k('ArrowRight', 300); primeira = false; await t.k('z', 600);
  } else await t.k('x', 250);
}
for (let i = 0; i < 60 && (await t.ev(() => window.__pingo.telas.pilha.length > 1)); i++) await t.k('x', 250);
await t.assentar(60000, 'x');
const f = await t.ev(() => window.__fins); const s = await t.ev(() => window.__pingo.jogo.save);
t.ok(f.length >= 2 && f[1].rara[0] === true, 'a 2ª batalha foi contra a rara', JSON.stringify(f));
t.ok(s.equipe.some((c) => c.especie === 39 && c.rara) && s.flags['lago-raro-ok'], 'Mandizinho raro capturado e lago-raro-ok', JSON.stringify(s.equipe.map((c) => [c.especie, !!c.rara])));
t.ok(!(await t.ev(() => window.__pingo.mundo.npc('cartel-lago')?.ator.visivel)), 'capanga sumiu');
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
