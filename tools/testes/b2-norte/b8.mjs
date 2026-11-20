import { abrir } from './lib.mjs';
const t = await abrir('B8', 1, 19, '&dir=l&insignias=14&amuletos=todos&flags=inicial-mata&periodo=noite');
await t.pagina(async () => { (await import('/src/battle/index.ts')).definirHeadless(true); });
const log = async (r, n = 2) => console.log('   ', r, (await t.falas(n)).map((x) => x.slice(0, 80)));
try {
  let s = await t.irAte(39, 9); s = await t.assentar(); await t.confere(s.zona === 'B8-observatorio', `entrou no observatório (${s.zona})`);
  await t.usar(2, 4); await log('Vega');
  s = await t.irAte(6, 11); s = await t.assentar(); await t.confere(s.zona === 'B8', `saiu do observatório (${s.x},${s.y})`);
  await t.usar(12, 12); await log('escrivã', 4);
  await t.usar(41, 10); await log('aprendiz');
  console.log('   flags:', JSON.stringify((await t.flags('m-carta|m-const')).flags));
  s = await t.irAte(10, 17); s = await t.assentar(); await t.confere(s.zona === 'B8-posto', `Posto do Lume (${s.zona})`);
  await t.usar(7, 2); await log('posto');
  s = await t.irAte(6, 9); s = await t.assentar(); await t.confere(s.zona === 'B8', `voltou à praça (${s.x},${s.y})`);
  s = await t.irAte(15, 17); s = await t.assentar(); await t.confere(s.zona === 'B8-venda', `Venda (${s.zona})`); s = await t.irAte(5, 8); s = await t.assentar();
  s = await t.irAte(31, 17); s = await t.assentar(); await t.confere(s.zona === 'B8-casa-1', `casa 1 (${s.zona})`); s = await t.irAte(5, 8); s = await t.assentar();
  s = await t.irAte(44, 5); s = await t.st(); await t.confere(s.zona === 'B8' && s.y >= 4, `estrada da floresta (${s.x},${s.y})`);
  await t.ir('n'); s = await t.st(); await t.confere(s.y >= 4, `Guardiã da Floresta barra antes do Conselho (${s.x},${s.y})`); await log('guardiã');
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); }
await t.fim();
