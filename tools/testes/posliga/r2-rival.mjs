// QA pós-Liga 2 — rival semanal (Tainá na Gruta do Eco, terça/quinta). Segunda: ausente; terça: luta na TELA; de novo: recusa.
// Uso: run.sh r2-rival.mjs <seg> [k=0 níveis a mais (medida)] [save=campeao]
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, amanha, textos, limparTextos, flags, irPara } from './comum.mjs';
const K = Number(process.argv[2] ?? 0);
const t = await abrir(lerSave(process.argv[3] ?? 'campeao'), { anim: true });
await preparar(t);
try {
  await relogio(t, 1, 13 * 60);
  await irPara(t, 'A4-posto', 7, 4, 'n'); await t.q(() => window.Q.curarNoPosto());
  if (K) await t.q(async (k) => { const C = await import('/src/battle/criatura.ts'); const REF = await import('/tools/equilibrio-referencia.ts'); const GO = await import('/src/data/golpes.ts'); for (const c of window.__pingo.jogo.save.equipe) { c.nivel += k; c.exp = C.expParaNivel(C.especie(c.especie).curva, c.nivel); c.golpes = REF.golpesDeJogador(c.especie, c.nivel).map((id) => ({ id, pg: GO.golpe(id).pg, pgMax: GO.golpe(id).pg })); c.vida = C.atributos(c).vida; } }, K);
  await t.q(() => window.Q.viajar('A-GE'));
  let n = (await t.npcs()).map((x) => x.id);
  t.ok(!n.includes('rival-semanal'), 'segunda: Tainá não está na Gruta do Eco');
  await relogio(t, 2, 13 * 60);
  await t.q(() => window.Q.viajar('A4')); await t.q(() => window.Q.viajar('A-GE'));
  n = await t.npcs(); const tn = n.find((x) => x.id === 'rival-semanal');
  t.ok(!!tn, 'terça: Tainá na Gruta do Eco', tn ? `(${tn.x},${tn.y})` : '');
  await t.irAte(tn.x - 1, tn.y).catch(() => 0); await t.foto('r2-taina-gruta');
  await limparTextos(t);
  const nb = (await t.st()).nb, d0 = (await t.resumo()).dinheiro;
  await t.falarCom('rival-semanal').catch((e) => console.log('   (luta)', e.message.split('\n')[0]));
  await t.assentar().catch(() => 0);
  const bs = await t.relato(nb);
  console.log('   falas:', (await textos(t, 6)).map((x) => x.replace(/\n/g, ' ')).join(' ⏎ ').slice(0, 600));
  console.log('   flags:', JSON.stringify(await flags(t, 'rival-sem')), '$', d0, '→', (await t.resumo()).dinheiro);
  t.ok(bs.length === 1, 'luta com a Tainá na tela', bs.map((b) => b.resultado).join(','));
  // de novo no mesmo dia
  const s = await t.st();
  if (s.zona === 'A-GE') {
    const ainda = (await t.npcs()).some((x) => x.id === 'rival-semanal');
    if (ainda) { await limparTextos(t); await t.falarCom('rival-semanal'); const fs = await textos(t, 3); t.ok(fs.some((x) => /Uma por dia/.test(x)), 'segunda conversa no mesmo dia: recusa', fs.join(' | ')); }
    else t.ok(true, 'Tainá sai da gruta depois da luta do dia');
  } else {
    await t.q(() => window.Q.viajar('A-GE'));
    const ainda = (await t.npcs()).some((x) => x.id === 'rival-semanal');
    t.ok(!ainda, 'depois da derrota, Tainá não reaparece no mesmo dia', String(ainda));
  }
  // quinta: volta
  await amanha(t); await amanha(t); await t.q(() => window.Q.viajar('A4')); await t.q(() => window.Q.viajar('A-GE'));
  t.ok((await t.npcs()).some((x) => x.id === 'rival-semanal'), 'quinta: Tainá de volta');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r2-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
