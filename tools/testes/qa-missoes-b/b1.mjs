// QA das missões do B1: carta, ninho, órfãos (+crescer), fotos, São João, troca, pepitas, doce, raízes, forja.
import { abrir, montar, FORTE, avancarDias, conversar, usarEm, mostra, mochila, fv, escolhas, junto, nFalas, falasDesde } from './lib.mjs';
const so = process.argv[2] ?? 'tudo';
const sv = montar('B1-casa-2', 4, 6, { insignias: 11, mochila: { pepita: 4, buriti: 4, pequi: 1, acerola: 1, 'cuia-ouro': 0 } });
const t = await abrir(sv, { equipe: [...FORTE, [50, 46], [32, 56], [12, 60]], hora: 13, dia: 3 });
const quer = (m) => so === 'tudo' || so.split(',').includes(m);
try {
  if (quer('carta')) {
    console.log('== CARTA (violeiro → Açucena)');
    await junto(t, 'B1-casa-2', 'b1-violeiro');
    mostra('violeiro 1', await conversar(t, 'b1-violeiro'));
    t.ok(await fv(t, 'm-carta-b1'), 'm-carta-b1 marcada');
    mostra('violeiro 2 (esperando)', await conversar(t, 'b1-violeiro'));
    await junto(t, 'B9-casa-1', 'b9-acucena');
    mostra('Açucena', await conversar(t, 'b9-acucena'));
    t.ok(await fv(t, 'm-carta-b1-resposta'), 'resposta marcada');
    mostra('Açucena 2', await conversar(t, 'b9-acucena'));
    await junto(t, 'B1-casa-2', 'b1-violeiro');
    const m0 = await mochila(t, ['pt-44']);
    mostra('violeiro 3', await conversar(t, 'b1-violeiro'));
    const m1 = await mochila(t, ['pt-44']);
    t.ok(m1['pt-44'] === m0['pt-44'] + 1 && await fv(t, 'm-carta-b1-ok'), 'recompensa pt-44 + m-carta-b1-ok', JSON.stringify([m0, m1]));
    mostra('violeiro 4', await conversar(t, 'b1-violeiro'));
    await t.foto('b1-carta');
  }
  if (quer('ninho')) {
    console.log('== NINHO (Dona Brejeira, um dia)');
    await junto(t, 'B2-casa-1', 'b2-brejeira');
    mostra('brejeira 1', await conversar(t, 'b2-brejeira'));
    t.ok(await fv(t, 'm-ninho'), 'm-ninho');
    mostra('brejeira mesmo dia', await conversar(t, 'b2-brejeira'));
    t.ok(!(await fv(t, 'm-ninho-ok')), 'mesmo dia recusa');
    await avancarDias(t, 1);
    const m0 = await mochila(t, ['cuia-mel', 'pt-43']);
    mostra('brejeira dia seguinte', await conversar(t, 'b2-brejeira'));
    const m1 = await mochila(t, ['cuia-mel', 'pt-43']);
    t.ok(await fv(t, 'm-ninho-ok') && m1['cuia-mel'] === m0['cuia-mel'] + 3 && m1['pt-43'] === m0['pt-43'] + 1, 'ninho: recompensa', JSON.stringify([m0, m1]));
    mostra('brejeira depois', await conversar(t, 'b2-brejeira'));
  }
  if (quer('orfaos')) {
    console.log('== ÓRFÃOS (Drª Taiamã)');
    await junto(t, 'B2-centro', 'b2-veterinaria');
    const antes = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => c.especie + ':' + c.nivel));
    mostra('vet 1', await conversar(t, 'b2-veterinaria'));
    const depois = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.nivelCaptura}:${c.apelido ?? ''}:${c.golpes.map((g) => g.id).join('/')}`));
    console.log('   equipe antes', antes.join(' '), '\n   depois', depois.join(' '));
    t.ok(depois.length === antes.length + 1, 'filhote entrou na equipe');
    const novo = depois.at(-1).split(':');
    t.ok(+novo[1] > 44, 'filhote cresceu acima de 44', depois.at(-1));
    t.ok(await fv(t, 'orfao-105') && await fv(t, 'm-orfaos'), 'orfao-105 + m-orfaos');
    mostra('vet mesmo dia', await conversar(t, 'b2-veterinaria'));
    t.ok((await t.page.evaluate(() => window.__pingo.jogo.save.equipe.length)) === depois.length, 'mesmo dia: nenhum filhote a mais');
    await avancarDias(t, 1);
    // segundo dia, equipe cheia (6): o filhote vai para o viveiro e cresce lá
    mostra('vet dia 2', await conversar(t, 'b2-veterinaria'));
    const viv = await t.page.evaluate(() => window.__pingo.jogo.save.viveiro.flat().filter(Boolean).slice(-2).map((c) => `${c.especie}:${c.nivel}:${c.nivelCaptura}`));
    console.log('   viveiro (últimos)', viv.join(' '));
    t.ok(await fv(t, 'orfao-101'), 'orfao-101 (2º dia)');
    await t.foto('b1-orfaos');
  }
  if (quer('fotos')) {
    console.log('== FOTOS (observadora)');
    await junto(t, 'B-CE', 'observadora');
    mostra('observadora 1', await conversar(t, 'observadora'));
    t.ok(await fv(t, 'm-fotos'), 'm-fotos');
    const ninhos = [['B-R1', 8, 19, 1], ['B-CE', 18, 3, 2], ['B-CE', 53, 3, 3], ['B-PA', null, null, 4], ['B2', 33, 4, 5]];
    for (const [z, x, y, n] of ninhos) {
      let xx = x, yy = y;
      if (xx == null) { const p = await t.page.evaluate(async (zz) => { const d = (await import('/src/data/zonas/' + zz + '.ts')).default; const o = d.objetos.find((q) => q.script === 'b1-foto-4'); return [o.x, o.y]; }, z); [xx, yy] = p; }
      await junto(t, z, { x: xx, y: yy });
      mostra(`ninho ${n} (${z} ${xx},${yy})`, await usarEm(t, xx, yy));
      t.ok(await fv(t, `m-foto-${n}`), `m-foto-${n}`);
      if (n === 1) { mostra('ninho 1 de novo', await usarEm(t, xx, yy)); await t.foto('b1-foto-1'); }
    }
    await junto(t, 'B-CE', 'observadora');
    const m0 = await mochila(t, ['camera-de-bolso', 'pena-colorida', 'pt-39']);
    mostra('observadora fim', await conversar(t, 'observadora'));
    const m1 = await mochila(t, ['camera-de-bolso', 'pena-colorida', 'pt-39']);
    t.ok(await fv(t, 'm-fotos-ok') && m1['camera-de-bolso'] === m0['camera-de-bolso'] + 1, 'fotos: recompensa', JSON.stringify([m0, m1]));
  }
  if (quer('saojoao')) {
    console.log('== SÃO JOÃO (sábado)');
    await junto(t, 'B4', 'b4-festeira');
    mostra('festeira quarta', await conversar(t, 'b4-festeira'));
    t.ok(!(await fv(t, 'm-sao-joao-ok')), 'fora do sábado: nada');
    await t.page.evaluate(() => { const r = window.__pingo.jogo.save.relogio; r.diaSemana0 = (6 - new Date().getDay() + 7) % 7; });
    await escolhas(t, [['marcador grita primeiro', 1]]);
    mostra('festeira sábado (erra)', await conversar(t, 'b4-festeira'));
    t.ok(!(await fv(t, 'm-sao-joao-ok')), 'errou: sem prêmio');
    await escolhas(t, []);
    const m0 = await mochila(t, ['pedra-solar', 'rapadura']);
    mostra('festeira sábado (acerta)', await conversar(t, 'b4-festeira'));
    const m1 = await mochila(t, ['pedra-solar', 'rapadura']);
    t.ok(await fv(t, 'm-sao-joao-ok') && m1['pedra-solar'] === m0['pedra-solar'] + 1, 'São João: prêmio', JSON.stringify([m0, m1]));
    mostra('festeira depois', await conversar(t, 'b4-festeira'));
  }
  if (quer('troca')) {
    console.log('== TROCA (Seu Aroeirinha)');
    await junto(t, 'B1-casa-3', 'b1-criador');
    mostra('criador', await conversar(t, 'b1-criador'));
    const eq = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.apelido ?? ''}:${c.item ?? ''}:${c.treinadorOriginal}`));
    console.log('   equipe', eq.join(' | '));
    t.ok(await fv(t, 'm-troca-b1-ok') && eq.some((e) => e.startsWith('102:46:Corisco:unguento')), 'troca feita (Corisco)');
    mostra('criador depois', await conversar(t, 'b1-criador'));
  }
  if (quer('pepitas')) {
    console.log('== PEPITAS (Seu Cascalho)');
    await junto(t, 'B3-casa-1', 'b3-cascalho');
    const m0 = await mochila(t, ['pepita', 'pt-40', 'cuia-ouro']);
    mostra('cascalho', await conversar(t, 'b3-cascalho'));
    const m1 = await mochila(t, ['pepita', 'pt-40', 'cuia-ouro']);
    t.ok(await fv(t, 'm-pepitas-ok') && m1.pepita === m0.pepita - 3 && m1['pt-40'] === m0['pt-40'] + 1, 'pepitas: troca', JSON.stringify([m0, m1]));
    mostra('cascalho depois', await conversar(t, 'b3-cascalho'));
  }
  if (quer('doce')) {
    console.log('== DOCE (Dona Mangaba)');
    await junto(t, 'B1-casa-1', 'b1-doceira');
    const m0 = await mochila(t, ['buriti', 'rapadura', 'garapa']);
    mostra('doceira', await conversar(t, 'b1-doceira'));
    const m1 = await mochila(t, ['buriti', 'rapadura', 'garapa']);
    t.ok(await fv(t, 'm-doce-ok') && m1.buriti === m0.buriti - 3 && m1.rapadura === m0.rapadura + 3, 'doce: recompensa', JSON.stringify([m0, m1]));
  }
  if (quer('raizes')) {
    console.log('== RAÍZES (Dona Sucupira)');
    await t.page.evaluate(() => { const m = window.__pingo.jogo.save.mochila; m.buriti = Math.max(1, m.buriti ?? 0); m.pequi = 1; m.acerola = 1; });
    await junto(t, 'B1-salao', 'b1-sucupira');
    mostra('sucupira 1', await conversar(t, 'b1-sucupira'));
    t.ok(await fv(t, 'm-raizes'), 'm-raizes');
    const m0 = await mochila(t, ['pequi', 'buriti', 'acerola', 'pt-45']);
    mostra('sucupira 2', await conversar(t, 'b1-sucupira'));
    const m1 = await mochila(t, ['pequi', 'buriti', 'acerola', 'pt-45']);
    t.ok(await fv(t, 'm-raizes-ok') && m1['pt-45'] === m0['pt-45'] + 1, 'raízes: recompensa', JSON.stringify([m0, m1]));
  }
  if (quer('forja')) {
    console.log('== FORJA (Ferreiro Malho)');
    await junto(t, 'B4-forja', 'b4-malho');
    mostra('malho sem boitatá', await conversar(t, 'b4-malho'));
    await t.page.evaluate(() => { window.__pingo.jogo.save.flags['boitata-ok'] = true; window.__pingo.jogo.save.mochila.pepita = Math.max(1, window.__pingo.jogo.save.mochila.pepita ?? 0); });
    const m0 = await mochila(t, ['pepita', 'cuia-ouro']);
    mostra('malho com boitatá', await conversar(t, 'b4-malho'));
    const m1 = await mochila(t, ['pepita', 'cuia-ouro']);
    t.ok(await fv(t, 'm-forja-ok') && m1['cuia-ouro'] === m0['cuia-ouro'] + 5 && m1.pepita === m0.pepita - 1, 'forja: 5 cuias de ouro', JSON.stringify([m0, m1]));
    mostra('malho depois', await conversar(t, 'b4-malho'));
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('b1-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
