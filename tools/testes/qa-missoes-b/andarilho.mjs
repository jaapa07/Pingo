// Andarilho do Cume: vitória no Conselho (5ª sala) → Cume → Andarilho; depois revanche do Conselho → Andarilho de novo.
import { abrir, montar, conversar, mostra, fv, junto, nFalas, falasDesde } from './lib.mjs';
const flagsC = { 'garrote-vencido': true, 'rival-8': true, 'conselho-em-curso': true, 'conselho-1': true, 'conselho-2': true, 'conselho-3': true, 'conselho-4': true, 'inicial-mata': true };
const sv = montar('PP-conselho', 15, 12, { flags: flagsC, mochila: { 'elixir-andiroba': 10 } });
const t = await abrir(sv, { equipe: [[3, 100], [6, 100], [9, 100], [12, 100], [72, 100], [140, 100]] });
const npcs = () => t.page.evaluate(() => window.__pingo.mundo ? (window.__pingo.mundo.zona.id + ': ' + (window.Q && 1) + ' ' + JSON.stringify(window.__pingo.jogo.save.flags['oculto:PP:pp-misterioso'] ?? null)) : '');
try {
  for (let volta = 1; volta <= 2; volta++) {
    console.log(`== VOLTA ${volta}: Arandu`);
    if (volta === 2) await t.page.evaluate((f) => Object.assign(window.__pingo.jogo.save.flags, f), flagsC);
    await junto(t, 'PP-conselho', 'guardiao-arandu');
    const k = await nFalas(t);
    await t.falarCom('guardiao-arandu');
    const s = await t.assentar();
    mostra('arandu', (await falasDesde(t, k)).slice(-4));
    console.log('   onde:', JSON.stringify(s), 'batalhas:', JSON.stringify((await t.batalhas()).map((b) => b.id + ':' + b.resultado)));
    t.ok(await fv(t, 'conselho-vencido') && await fv(t, 'misterioso-pode'), 'conselho-vencido + misterioso-pode');
    const vivos = await t.page.evaluate(() => window.__pingo.mundo.npcs?.map?.((n) => n.id) ?? (window.Q ? null : null));
    const ids = await t.npcs();
    console.log('   NPCs no Cume:', ids.map((n) => `${n.id}@${n.x},${n.y}`).join(' '), '| oculto:', await npcs());
    t.ok(ids.some((n) => n.id === 'pp-misterioso'), `andarilho visível na volta ${volta}`);
    await t.foto(`andarilho-cume-${volta}`);
    if (ids.some((n) => n.id === 'pp-misterioso')) {
      const k2 = await nFalas(t);
      await t.falarCom('pp-misterioso');
      mostra('andarilho', await falasDesde(t, k2));
      console.log('   batalhas:', JSON.stringify((await t.batalhas()).map((b) => b.id + ':' + b.resultado)));
      t.ok(!(await fv(t, 'misterioso-pode')), 'misterioso-pode apagada depois do duelo');
      const ids2 = await t.npcs();
      t.ok(!ids2.some((n) => n.id === 'pp-misterioso'), 'andarilho some depois do duelo');
    }
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('andarilho-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
