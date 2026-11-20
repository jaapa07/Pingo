import { abrir } from './lib.mjs';
const t = await abrir('PP-conselho', 15, 49, '&dir=n&insignias=16&amuletos=todos&flags=inicial-mata,liga-vencida,garrote-vencido,rival-8,conselho-em-curso&itens=elixir-andiroba:20');
await t.pagina(async () => { (await import('/src/battle/index.ts')).definirHeadless(true); });
const log = async (r, n = 2) => console.log('   ', r, (await t.falas(n)).map((x) => x.slice(0, 90)));
try {
  let s;
  for (const [n, y] of [[1, 39], [2, 31], [3, 23], [4, 15], [5, 8]]) {
    for (let k = 0; k < 4; k++) {
      await t.usar(15, y); s = await t.assentar();
      const f = (await t.flags('conselho|pos-jogo')).flags;
      if (s.zona !== 'PP-conselho' || f.includes(`conselho-${n}`) || f.includes('conselho-vencido')) break;
    }
    const f = (await t.flags('conselho|pos-jogo')).flags; console.log(`   sala ${n}: ${s.zona} (${s.x},${s.y}) ${JSON.stringify(f)} vida ${JSON.stringify(await t.pagina(() => window.__pingo.jogo.save.equipe.map((c) => c.vida)))}`);
    await log(`sala ${n}`);
    if (s.zona !== 'PP-conselho' || f.includes('conselho-vencido')) break;
  }
  const f = (await t.flags('conselho|pos-jogo|misterioso|errante')).flags; s = await t.st();
  await t.confere(f.includes('conselho-vencido') && f.includes('pos-jogo'), `Conselho vencido, créditos e pós-jogo (${s.zona} ${s.x},${s.y}) ${JSON.stringify(f)}`);
  await log('fim', 4);
  await t.usar(32, 3); await log('andarilho');
  console.log('   andarilho:', JSON.stringify((await t.flags('andarilho|misterioso')).flags));
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); }
await t.fim();
