import { abrir } from './lib.mjs';
const base = '&insignias=16&amuletos=todos&equipe=9:100,100:100,132:100&flags=conselho-vencido,pos-jogo,liga-vencida,garrote-vencido,boreal-missao';
const t = await abrir('?zona=B-R5&x=32&y=7&dir=n' + base, { turbo: 1 }); t.page.on('crash', () => console.log('PAGINA CAIU'));
await t.pronto(); await t.ev(async () => (await import('/src/battle/index.ts')).definirHeadless(true)); await t.ev(() => { for (const c of window.__pingo.jogo.save.equipe) c.golpes = [{ id: 'labareda', pg: 99, pgMax: 99 }]; }); await t.espera(2000); await t.virar('n');
await t.k('z', 300);
for (let i = 0; i < 500; i++) {
  const s = await t.st();
  if (s.telas <= 1 && !s.oc && i > 5) break;
  await t.k('Enter', 350);
  if (i % 120 === 60) { await t.foto('br5-b' + i); console.log(i, JSON.stringify(s), await t.ev(() => window.__pingo.telas.topo?.el.className)); }
}
await t.foto('br5-fim');
const r = await t.ev(() => ({ l: window.__pingo.jogo.save.mochila['lanterna-boreal'], f: window.__pingo.jogo.save.flags['boreal-lanterna-4'] }));
t.ok(r.l === 1 && r.f, 'venceu B-EXP-4 e ganhou a lanterna', JSON.stringify(r));
console.log((await t.falas(3)).join(' | '));
console.log('erros', t.erros); await t.browser.close();
