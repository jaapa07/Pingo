import { abrir } from './lib.mjs';
let t = await abrir('B-R5', 1, 16, '&dir=l&insignias=13&amuletos=todos&flags=inicial-mata');
try {
  let s = await t.st(); await t.confere(s.zona === 'B-R5', `abriu no Caminho das Névoas (${s.zona} ${s.x},${s.y})`);
  await t.ir('lll'); s = await t.st(); await t.confere(s.x < 5, `Guarda da Névoa barra sem a insígnia 14 (${s.x},${s.y})`); console.log('   ', (await t.falas(1))[0]?.slice(0, 80));
  await t.ir('oooo'); s = await t.assentar(); await t.confere(s.zona === 'B7', `borda oeste leva a B7 (${s.zona} ${s.x},${s.y})`);
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro-r5a'); }
await t.fim();
t = await abrir('B-R5', 1, 16, '&dir=l&insignias=14&amuletos=todos&flags=inicial-mata,' + [1,2,3,4,5,6,7].map((n) => 'venceu:B-R5-' + n).join(','));
try {
  let s = await t.irAte(89, 16); s = await t.assentar(); await t.confere(s.zona === 'B8', `atravessou a névoa até Planalto Lume (${s.zona} ${s.x},${s.y})`);
  console.log('   flags:', JSON.stringify((await t.flags('venceu:B-R5')).flags));
  await t.foto('b8-chegada');
  s = await t.irAte(39, 9); s = await t.assentar(); await t.confere(s.zona === 'B8-observatorio', `entrou no observatório (${s.zona})`);
  await t.usar(2, 4); console.log('   Vega:', (await t.falas(2)).map((x) => x.slice(0, 70)));
  s = await t.irAte(6, 11); s = await t.assentar(); await t.confere(s.zona === 'B8', `saiu do observatório (${s.x},${s.y})`);
  await t.usar(12, 12); console.log('   escrivã:', (await t.falas(4)).map((x) => x.slice(0, 70)));
  await t.usar(41, 10); console.log('   aprendiz:', (await t.falas(2)).map((x) => x.slice(0, 70)));
  console.log('   flags carta:', JSON.stringify((await t.flags('m-carta')).flags));
  s = await t.irAte(10, 17); s = await t.assentar(); await t.confere(s.zona === 'B8-posto', `Posto do Lume (${s.zona})`);
  s = await t.irAte(6, 9); s = await t.assentar(); await t.confere(s.zona === 'B8', `voltou à praça (${s.x},${s.y})`);
  s = await t.irAte(44, 4); s = await t.st(); await t.confere(s.y >= 4 && s.zona === 'B8', `Guardiã da Floresta barra antes do Conselho (${s.x},${s.y})`);
  await t.foto('b8-portao');
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro-r5b'); }
await t.fim();
