import { abrir, lerSave } from './lib.mjs';
const t = await abrir(lerSave('passo-4'));
try {
  const t0 = Date.now();
  const f = await t.q(async () => { const L = await import('/src/core/loop.ts'); const a = L.timing.frame; await window.Q.quadros(120); return L.timing.frame - a; });
  console.log('passos de jogo em 120 quadros:', f, 'em', Date.now() - t0, 'ms');
  const sv = await t.save(); sv.equipe[0].vida = 20; sv.equipe[1].vida = 0;
  await t.q((v) => { const e = window.__pingo.jogo.save.equipe; e[0].vida = 20; e[1].vida = 5; });
  console.log('cuidar:', await t.q(() => window.Q.cuidar({})), (await t.resumo()).equipe.slice(0, 2), JSON.stringify((await t.resumo()).mochila));
  await t.foto('spike-cuidar');
  await t.q(() => window.Q.viajar('A5-venda'));
  console.log('comprar:', JSON.stringify(await t.q(() => window.Q.comprar({ garrafada: 3, cuia: 12 }))), JSON.stringify((await t.resumo()).mochila));
  await t.q(() => window.Q.viajar('A5-posto'));
  console.log('posto:', (await t.q(() => window.Q.curarNoPosto())).equipe.slice(0, 2), await t.falas(2));
  await t.q(() => window.Q.viajar('A5'));
  console.log(await t.st());
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0), await t.falas(3).catch(() => 0)); await t.foto('erro'); }
await t.fim();
