import { abrir } from './lib.mjs';
const t = await abrir('PP', 19, 16, '&dir=n&insignias=16&amuletos=todos&flags=inicial-mata,liga-vencida&itens=elixir-andiroba:20');
await t.pagina(async () => { (await import('/src/battle/index.ts')).definirHeadless(true); });
const log = async (r) => console.log('   ', r, (await t.falas(2)).map((x) => x.slice(0, 90)));
try {
  let s = await t.st();
  s = await t.irAte(19, 13); s = await t.assentar(); console.log('   garrote:', JSON.stringify((await t.flags('garrote|rival')).flags)); await log('após Garrote');
  await t.confere((await t.flags('garrote-vencido')).flags.includes('garrote-vencido'), 'Coronel Garrote vencido');
  s = await t.irAte(19, 8); s = await t.assentar(); await log('rival');
  await t.confere((await t.flags('rival-8')).flags.includes('rival-8'), 'rival 8 marcada');
  await t.foto('cume');
  s = await t.irAte(20, 6); s = await t.assentar(); await t.confere(s.zona === 'PP-conselho', `entrou no Salão (${s.x},${s.y})`);
  await t.irAte(15, 52).catch(() => {}); s = await t.assentar(); await log('entrada'); s = await t.st(); console.log('   pos', s.x, s.y, JSON.stringify((await t.flags('conselho')).flags));
  for (const [n, y] of [[1, 39], [2, 31], [3, 23], [4, 15], [5, 8]]) {
    await t.usar(15, y); s = await t.assentar();
    const f = (await t.flags('conselho|pos-jogo')).flags; console.log(`   sala ${n}: zona ${s.zona} (${s.x},${s.y}) flags ${JSON.stringify(f)} equipe ${JSON.stringify((await t.flags('x')).equipe)}`);
    if (s.zona !== 'PP-conselho' || f.includes('conselho-vencido')) break;
  }
  const f = (await t.flags('conselho|pos-jogo|misterioso|errante')).flags; s = await t.st();
  await t.confere(f.includes('conselho-vencido') && f.includes('pos-jogo'), `Conselho vencido, créditos e pós-jogo (${s.zona} ${s.x},${s.y}) ${JSON.stringify(f)}`);
  await t.foto('pos-conselho');
  await t.usar(32, 3); await log('andarilho');
  console.log('   andarilho:', JSON.stringify((await t.flags('andarilho|misterioso')).flags));
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro-pico'); }
await t.fim();
