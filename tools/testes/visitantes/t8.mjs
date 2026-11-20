import { abrir } from './lib.mjs';
const base = '&insignias=16&amuletos=todos&equipe=9:100,100:100,132:100&flags=conselho-vencido,pos-jogo,liga-vencida,garrote-vencido';
{
  const t = await abrir('?zona=B9&x=30&y=22&dir=s' + base, { turbo: 3 });
  await t.pronto(); await t.espera(2500);
  await t.passo('s'); await t.virar('s'); await t.k('z', 300); await t.assentar();
  console.log((await t.falas(6)).map((x) => x.slice(0, 80)).join('\n'));
  const f = await t.ev(() => window.__pingo.jogo.save.flags['boreal-missao']);
  t.ok(f === true, 'boreal-missao');
  await t.foto('b9-solveig');
  await t.browser.close();
}
{
  const t = await abrir('?zona=B-R5&x=32&y=7&dir=n' + base + ',boreal-missao', { turbo: 3 });
  await t.pronto(); await t.espera(2000); await t.virar('n');
  await t.k('z', 300);
  try { await t.assentar(400000); } catch (e) { console.log(String(e).slice(0, 200)); await t.foto('br5-travou'); }
  const r = await t.ev(() => ({ l: window.__pingo.jogo.save.mochila['lanterna-boreal'], f: window.__pingo.jogo.save.flags['boreal-lanterna-4'], b: window.__pingo.mundo.batalhas.map((q) => q.treinador?.id) }));
  t.ok(r.l === 1 && r.f, 'venceu B-EXP-4 e ganhou a lanterna', JSON.stringify(r));
  console.log((await t.falas(3)).join(' | '));
  console.log('erros', t.erros); await t.browser.close();
}
