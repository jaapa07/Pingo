// saída leste de Vila Ferrugem: pedregulho (Força) e passagem para a Estrada do Buriti (A-R7, time A1)
import { abrir } from './lib.mjs';
const t = await abrir('A8', 50, 15, '&dir=l&insignias=7&amuletos=facao,remo,quebra-pedra,forca&flags=inicial-mata');
try {
  let s = await t.irAte(53, 15);
  await t.agir('l'); await t.ir('llll'); s = await t.st(); await t.confere(s.x === 55 && s.y === 15, `empurrou o pedregulho dois tiles (${s.x},${s.y})`);
  s = await t.irAte(58, 15); await t.confere(s.x === 58 && s.y === 15, 'contornou até a borda leste');
  const temR7 = await t.pagina(async () => { const z = await import('/src/world/zonas.ts'); return !!z.zonaDef('A-R7'); });
  if (temR7) { await t.ir('l'); s = await t.assentar(); await t.confere(s.zona === 'A-R7' && s.x === 1 && s.y === 15, `Estrada do Buriti (${s.zona} ${s.x},${s.y})`);
    await t.ir('o'); s = await t.assentar(); await t.confere(s.zona === 'A8' && s.x === 58 && s.y === 15, `volta para Vila Ferrugem (${s.zona} ${s.x},${s.y})`); }
  else console.log('   (A-R7 ainda não existe: parei na borda)');
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro'); }
await t.fim();
