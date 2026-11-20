// QA das missões do B2-norte: carta do Lume, constelações, troca do pastor, escrivã, neve brilhante, Uirapuru, Jubartão, Ninhos Raros, Mapinguari.
import { abrir, montar, FORTE, avancarDias, hora, conversar, usarEm, mostra, mochila, fv, escolhas, junto, nFalas, falasDesde } from './lib.mjs';
const so = process.argv[2] ?? 'tudo';
const quer = (m) => so === 'tudo' || so.split(',').includes(m);
const sv = montar('B8', 20, 20, { insignias: 15, flags: { 'laboratorio-ok': true }, mochila: { 'cuia-ouro': 30 } });
const t = await abrir(sv, { equipe: [...FORTE, [136, 55], [72, 80], [140, 80]], hora: 13, dia: 3 });
const posJogo = () => t.page.evaluate(() => { const s = window.__pingo.jogo.save; s.insignias = Array.from({ length: 16 }, (_, i) => i + 1); Object.assign(s.flags, { 'garrote-vencido': true, 'rival-8': true, 'conselho-vencido': true, 'pos-jogo': true }); });
const objeto = (z, script) => t.page.evaluate(async ([zz, sc]) => { const d = (await import('/src/data/zonas/' + zz + '.ts')).default; const o = (d.objetos ?? []).find((q) => q.script === sc); return o ? { x: o.x, y: o.y } : null; }, [z, script]);
const capturar = (esp) => t.page.evaluate((e) => { window.Q.capturar = (x) => x === e; window.Q.maxCapturas = 99; }, esp);
try {
  if (quer('carta')) {
    console.log('== CARTA DO LUME');
    await junto(t, 'B8', 'b8-aprendiz');
    mostra('Alva 1', await conversar(t, 'b8-aprendiz'));
    t.ok(await fv(t, 'm-carta-lume'), 'm-carta-lume');
    mostra('Alva 2', await conversar(t, 'b8-aprendiz'));
    await junto(t, 'B-LG-cabana', 'b-lg-joca');
    const m0 = await mochila(t, ['cuia-rede']);
    mostra('Joca', await conversar(t, 'b-lg-joca'));
    t.ok(await fv(t, 'm-carta-lume-resposta') && (await mochila(t, ['cuia-rede']))['cuia-rede'] === m0['cuia-rede'] + 3, 'resposta + 3 cuias de rede');
    mostra('Joca 2', await conversar(t, 'b-lg-joca'));
    await junto(t, 'B8', 'b8-aprendiz');
    const p0 = await mochila(t, ['pt-21']);
    mostra('Alva fim', await conversar(t, 'b8-aprendiz'));
    t.ok(await fv(t, 'm-carta-lume-ok') && (await mochila(t, ['pt-21']))['pt-21'] === p0['pt-21'] + 1, 'carta: pt-21');
    await junto(t, 'B-LG-cabana', 'b-lg-joca');
    mostra('Joca depois', await conversar(t, 'b-lg-joca'));
  }
  if (quer('constelacoes')) {
    console.log('== CONSTELAÇÕES (Vega)');
    await hora(t, 13);
    await junto(t, 'B8-observatorio', 'b8-assistente');
    mostra('Vega de dia', await conversar(t, 'b8-assistente'));
    t.ok(!(await fv(t, 'm-constelacoes')), 'de dia: nada');
    await hora(t, 22);
    await t.page.evaluate(() => { const d = window.__pingo.jogo.save.diario; d.capturado = d.capturado.filter((n) => ![170, 172, 44].includes(n)); });
    mostra('Vega de noite, sem as três', await conversar(t, 'b8-assistente'));
    t.ok(await fv(t, 'm-constelacoes'), 'm-constelacoes');
    await t.page.evaluate(() => { const d = window.__pingo.jogo.save.diario; for (const n of [170, 172, 44]) { if (!d.capturado.includes(n)) d.capturado.push(n); if (!d.visto.includes(n)) d.visto.push(n); } });
    await hora(t, 13);
    mostra('Vega de dia com as três', await conversar(t, 'b8-assistente'));
    await hora(t, 22);
    const m0 = await mochila(t, ['pt-37', 'cuia-noturna']);
    mostra('Vega de noite com as três', await conversar(t, 'b8-assistente'));
    const m1 = await mochila(t, ['pt-37', 'cuia-noturna']);
    t.ok(await fv(t, 'm-constelacoes-ok') && m1['pt-37'] === m0['pt-37'] + 1 && m1['cuia-noturna'] === m0['cuia-noturna'] + 5, 'constelações: recompensa', JSON.stringify([m0, m1]));
    await t.foto('b2n-vega-noite');
    await hora(t, 13);
  }
  if (quer('escriva')) {
    console.log('== ESCRIVÃ (Dona Lembrança)');
    await junto(t, 'B8', 'b8-escriva');
    mostra('escrivã', await conversar(t, 'b8-escriva'));
  }
  if (quer('troca')) {
    console.log('== TROCA DO PASTOR (Gralha-Azul → Geadinha)');
    await junto(t, 'B-SG', 'b-sg-pastor');
    mostra('pastor', await conversar(t, 'b-sg-pastor'));
    const eq = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.apelido ?? ''}:${c.item ?? ''}:${c.treinadorOriginal}`));
    console.log('   equipe', eq.join(' | '));
    t.ok(await fv(t, 'm-troca-sg-ok') && eq.some((e) => e.startsWith('140:57:Geadinha:buriti')), 'troca feita');
    mostra('pastor depois', await conversar(t, 'b-sg-pastor'));
  }
  if (quer('uirapuru')) {
    console.log('== UIRAPURU (amanhecer + 150)');
    const tot = await objeto('B-SG', 'b2n-uirapuru');
    await hora(t, 13);
    await junto(t, 'B-SG', tot);
    mostra('totem de dia', await usarEm(t, tot.x, tot.y));
    await hora(t, 7);
    await t.page.evaluate(() => { const d = window.__pingo.jogo.save.diario; d.capturado = d.capturado.slice(0, 20); });
    mostra('totem de manhã, < 150', await usarEm(t, tot.x, tot.y));
    await t.page.evaluate(() => { const d = window.__pingo.jogo.save.diario; for (let n = 1; n <= 150; n++) { if (!d.capturado.includes(n)) d.capturado.push(n); if (!d.visto.includes(n)) d.visto.push(n); } d.capturado = d.capturado.filter((n) => n !== 177); });
    await t.page.evaluate(async () => { (await import('/src/world/index.ts')).reavaliar(); });
    console.log('   NPC do Uirapuru:', (await t.npcs()).filter((n) => /uirapuru/.test(n.id)).map((n) => `${n.id}@${n.x},${n.y}`).join(' ') || 'nenhum');
    await capturar(177);
    const nb = (await t.batalhas()).length;
    mostra('totem de manhã, 150', await usarEm(t, tot.x, tot.y));
    console.log('   batalhas:', JSON.stringify((await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado)));
    t.ok(await fv(t, 'uirapuru-ok'), 'uirapuru-ok');
    mostra('totem depois', await usarEm(t, tot.x, tot.y));
    await hora(t, 13);
  }
  if (quer('neve') || quer('jubarte') || quer('ninhos') || quer('mapinguari')) await posJogo();
  if (quer('neve')) {
    console.log('== NEVE BRILHANTE (20/11)');
    await t.page.evaluate(() => { window.__pingo.jogo.save.flags['pos-jogo'] = false; window.__pingo.jogo.save.flags['conselho-vencido'] = false; });
    await junto(t, 'PP', 'pp-vigia-neve');
    mostra('Floco antes do Conselho', await conversar(t, 'pp-vigia-neve'));
    await posJogo();
    const m0 = await mochila(t, ['pedra-lunar', 'rapadura', 'pena-colorida']);
    mostra('Floco 20/11 pós-jogo', await conversar(t, 'pp-vigia-neve'));
    const m1 = await mochila(t, ['pedra-lunar', 'rapadura', 'pena-colorida']);
    t.ok(m1['pedra-lunar'] === m0['pedra-lunar'] + 1 && m1['pena-colorida'] === m0['pena-colorida'] + 3, 'neve: presentes', JSON.stringify([m0, m1]));
    mostra('Floco de novo', await conversar(t, 'pp-vigia-neve'));
    t.ok((await mochila(t, ['pedra-lunar']))['pedra-lunar'] === m1['pedra-lunar'], 'neve: uma vez por ano');
    await t.foto('b2n-neve');
    await avancarDias(t, 1);
    mostra('Floco 21/11', await conversar(t, 'pp-vigia-neve'));
    await avancarDias(t, -1);
  }
  if (quer('jubarte')) {
    console.log('== JUBARTÃO (Trapiche Comprido)');
    await junto(t, 'B-LG', { x: 36, y: 26 });
    const ir = async (rot) => { const k = await nFalas(t); const nb = (await t.batalhas()).length; await t.irAte(36, 26); await t.assentar(); mostra(rot, await falasDesde(t, k)); return (await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado); };
    console.log('   ', JSON.stringify(await ir('trapiche 1')));
    t.ok(typeof (await fv(t, 'b2n-jubarte-dia')) === 'number', 'b2n-jubarte-dia marcado');
    await junto(t, 'B-LG', { x: 36, y: 26 });
    const b2 = await ir('trapiche 2 (mesmo dia)');
    t.ok(b2.length === 0, 'mesmo dia: sem Jubartão');
    await avancarDias(t, 1);
    await junto(t, 'B-LG', { x: 36, y: 26 });
    const b3 = await ir('trapiche dia seguinte');
    t.ok(b3.length === 1, 'dia seguinte: Jubartão de novo', JSON.stringify(b3));
  }
  if (quer('ninhos')) {
    console.log('== NINHOS RAROS (Floresta Ancestral)');
    for (const [linha, meio, final] of [['mata', 2, 3], ['brasa', 5, 6], ['rio', 8, 9]]) {
      const o = await objeto('B-FA', `b2n-ninho-${linha}`);
      await hora(t, linha === 'mata' ? 7 : 13);
      await junto(t, 'B-FA', o);
      const nb = (await t.batalhas()).length;
      mostra(`ninho ${linha} (${o.x},${o.y})`, await usarEm(t, o.x, o.y));
      const bs = (await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado);
      console.log('    ', JSON.stringify(bs));
      t.ok(bs.length === 1 && bs[0].includes(`${linha === 'mata' ? final : meio}:`), `ninho ${linha}: forma certa para o período`);
      const nb2 = (await t.batalhas()).length;
      mostra(`ninho ${linha} de novo`, await usarEm(t, o.x, o.y));
      t.ok((await t.batalhas()).length === nb2, `ninho ${linha}: 1 visita por dia`);
    }
    await hora(t, 13);
  }
  if (quer('mapinguari')) {
    console.log('== MAPINGUARI');
    await junto(t, 'B-FA', 'b-fa-mapinguari');
    await capturar(-1);
    const nb = (await t.batalhas()).length;
    mostra('mapinguari', await conversar(t, 'b-fa-mapinguari'));
    console.log('   ', JSON.stringify((await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado)));
    t.ok(await fv(t, 'mapinguari-ok'), 'mapinguari-ok');
    t.ok(!(await t.npcs()).some((n) => n.id === 'b-fa-mapinguari'), 'Mapinguari sumiu');
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('b2norte-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
