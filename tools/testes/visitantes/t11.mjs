import { abrir } from './lib.mjs';
const Q = '?zona=PP&x=10&y=7&dir=n&periodo=noite&insignias=16&amuletos=todos&equipe=9:100,100:100&flags=conselho-vencido,boreal-missao,boreal-lanterna-1,boreal-lanterna-2,boreal-lanterna-3,boreal-lanterna-4&itens=lanterna-boreal:4';
const t = await abrir(Q);
await t.pronto(); await t.ev(async () => (await import('/src/battle/index.ts')).definirHeadless(true)); await t.ev(() => { for (const c of window.__pingo.jogo.save.equipe) c.golpes = [{ id: 'labareda', pg: 99, pgMax: 99 }]; });
await t.espera(2000);
const g = await t.ev(() => window.__pingo.mundo.zona.gatilhos?.filter((q) => q.script === 'vis-pico-aurora'));
console.log('gatilho', JSON.stringify(g));
await t.foto('pp-antes');
await t.passo('n'); await t.tecla('n');
let fotoAurora = false;
for (let i = 0; i < 120; i++) {
  const s = await t.st(); if (s.nb > 0) break;
  const f = (await t.falas(1))[0] ?? '';
  if (!fotoAurora && f.includes('se rasga')) { fotoAurora = true; await t.foto('pp-aurora'); }
  if (s.telas > 1) { await t.k('z', 350); continue; }
  await t.espera(300);
}
const b = await t.ev(() => { const u = window.__pingo.mundo.batalhas.at(-1); return u ? { tipo: u.tipo, e: u.inimigos.map((c) => c.especie + ':' + c.nivel), arena: u.arena } : null; });
t.ok(b && b.e[0] === '182:65' && b.tipo === 'lendario', 'Borealce nv 65 lendário', JSON.stringify(b));
await t.espera(3000); await t.foto('pp-batalha');
for (let i = 0; i < 300; i++) { const s = await t.st(); if (s.telas <= 1 && !s.oc) break; await t.k('z', 400); }
const r = await t.ev(() => ({ acesa: window.__pingo.jogo.save.flags['boreal-acesa'], lan: window.__pingo.jogo.save.mochila['lanterna-boreal'] ?? 0, res: window.__pingo.jogo.save.flags['ultima-batalha'], aurora: !!document.querySelector('.vis-aurora') }));
t.ok(r.acesa && r.lan === 0, 'lanternas acesas e gastas', JSON.stringify(r));
console.log((await t.falas(2)).join(' | '));
await t.foto('pp-depois');
// reencontro: sai do gatilho e volta
await t.passo('s'); await t.passo('s'); await t.passo('n'); await t.tecla('n');
for (let i = 0; i < 60; i++) { const s = await t.st(); if (s.nb > 1) break; if (s.telas > 1) { await t.k('z', 350); continue; } await t.espera(300); }
const n2 = await t.ev(() => window.__pingo.mundo.batalhas.filter((q) => q.inimigos[0].especie === 182).length);
t.ok(n2 >= 2, 'reencontro do Borealce', String(n2));
console.log('erros', t.erros); await t.browser.close();
