import { abrir } from './lib.mjs';
const base = '&insignias=16&amuletos=todos&equipe=9:100,100:100,132:100&flags=conselho-vencido,pos-jogo,liga-vencida,garrote-vencido';
// B9: Solveig e o navio
{
  const t = await abrir('?zona=B9&x=30&y=22&dir=s' + base);
  await t.pronto(); await t.espera(2500);
  const n = await t.ev(() => { const m = window.__pingo.mundo.npc('vis-solveig'); return m ? [m.ator.x, m.ator.y] : null; });
  t.ok(!!n, 'Solveig em B9', JSON.stringify(n));
  const navio = await t.ev(() => !!document.querySelector('.sprites .pix') );
  await t.foto('b9-solveig');
  await t.tecla('s'); await t.k('z', 300); await t.assentar();
  console.log((await t.falas(5)).map((x) => x.slice(0, 70)).join('\n'));
  const f = await t.ev(() => window.__pingo.jogo.save.flags['boreal-missao']);
  t.ok(f === true, 'boreal-missao', String(navio));
  console.log('erros', t.erros); await t.browser.close();
}
// lanternas: NPCs encaixados
for (const [z, id, x, y] of [['B7', 'vis-exp-1', 30, 8], ['B-SG', 'vis-exp-2', 30, 18], ['B-LG', 'vis-exp-3', 44, 21], ['B-R5', 'vis-exp-4', 32, 8]]) {
  const t = await abrir(`?zona=${z}&x=${x}&y=${y}&dir=n` + base + ',boreal-missao');
  await t.pronto(); await t.espera(2500);
  const n = await t.ev((id) => { const m = window.__pingo.mundo.npc(id); return m ? [m.ator.x, m.ator.y] : null; }, id);
  t.ok(!!n, `${id} em ${z}`, JSON.stringify(n));
  if (z === 'B-R5' && n) {
    await t.ev(([x, y]) => window.__pingo.mundo.irPara('B-R5', x, y + 1, 'n'), n); await t.espera(1500); await t.assentar();
    await t.k('z', 300); await t.assentar(240000);
    const r = await t.ev(() => ({ l: window.__pingo.jogo.save.mochila['lanterna-boreal'], f: window.__pingo.jogo.save.flags['boreal-lanterna-4'], b: window.__pingo.mundo.batalhas.map((q) => q.treinador?.id) }));
    t.ok(r.l === 1 && r.f, 'venceu B-EXP-4 e ganhou a lanterna', JSON.stringify(r));
    console.log((await t.falas(3)).join(' | '));
  }
  await t.foto('lanterna-' + z);
  console.log('erros', t.erros); await t.browser.close();
}
