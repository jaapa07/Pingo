// QA das missões do B2-sul: alunos, Dona Dendê, banca de quinta, Roda de Sábado, Dona Rã, carta B6↔B7, troca B7, pinhões, payada, chimarrão.
import { abrir, montar, FORTE, avancarDias, hora, conversar, usarEm, mostra, mochila, fv, escolhas, junto, nFalas, falasDesde } from './lib.mjs';
const so = process.argv[2] ?? 'tudo';
const quer = (m) => so === 'tudo' || so.split(',').includes(m);
const sv = montar('B5-casa-3', 4, 5, { insignias: 13, flags: { 'laboratorio-ok': true }, mochila: { pequi: 1, caju: 1, acai: 1 } });
const t = await abrir(sv, { equipe: [...FORTE, [162, 55], [138, 55], [24, 50]], hora: 13, dia: 3 });
const diaSem = (d) => t.page.evaluate((dd) => { window.__pingo.jogo.save.relogio.diaSemana0 = (dd - new Date().getDay() + 7) % 7; }, d);
try {
  if (quer('alunos')) {
    console.log('== ALUNOS (Mestre Cabaça)');
    await junto(t, 'B5-casa-3', 'cabaca');
    mostra('cabaça 1', await conversar(t, 'cabaca'));
    t.ok(await fv(t, 'm-alunos'), 'm-alunos');
    for (const n of [1, 2, 3]) { await junto(t, 'B-R3', `aluno-${n}`); mostra(`aluno ${n}`, await conversar(t, `aluno-${n}`)); t.ok(await fv(t, `b2-aluno-${n}`), `b2-aluno-${n}`); }
    const ids = (await t.npcs()).map((n) => n.id); t.ok(!ids.some((i) => /^aluno-/.test(i)), 'alunos sumiram da trilha');
    await junto(t, 'B5-casa-3', 'cabaca');
    const m0 = await mochila(t, ['pt-42', 'cuia-ouro']);
    mostra('cabaça fim', await conversar(t, 'cabaca'));
    const m1 = await mochila(t, ['pt-42', 'cuia-ouro']);
    t.ok(await fv(t, 'm-alunos-ok') && m1['pt-42'] === m0['pt-42'] + 1 && m1['cuia-ouro'] === m0['cuia-ouro'] + 2, 'alunos: recompensa', JSON.stringify([m0, m1]));
    mostra('cabaça depois', await conversar(t, 'cabaca'));
  }
  if (quer('dende')) {
    console.log('== DONA DENDÊ');
    await junto(t, 'B5-feira', 'dende');
    const m0 = await mochila(t, ['pequi', 'caju', 'acai', 'pt-34', 'rapadura']);
    mostra('dendê', await conversar(t, 'dende'));
    const m1 = await mochila(t, ['pequi', 'caju', 'acai', 'pt-34', 'rapadura']);
    t.ok(await fv(t, 'm-dende-ok') && m1['pt-34'] === m0['pt-34'] + 1 && m1.pequi === m0.pequi - 1, 'dendê: recompensa', JSON.stringify([m0, m1]));
    mostra('dendê depois', await conversar(t, 'dende'));
  }
  if (quer('quinta')) {
    console.log('== BANCA DE CUIAS (quinta)');
    await junto(t, 'B5-feira', 'cuias');
    for (const [d, rot] of [[3, 'quarta'], [4, 'quinta']]) {
      await diaSem(d);
      await t.page.evaluate(() => { window.Q.telaEsperada = /tela-loja/; });
      const k = await nFalas(t);
      await t.falarCom('cuias');
      const itens = await t.page.evaluate(() => [...document.querySelectorAll('.tela-loja .lista-item')].length);
      mostra(`cuias ${rot} (itens na loja: ${itens})`, await falasDesde(t, k));
      await t.foto(`b2-cuias-${rot}`);
      await t.page.evaluate(() => { window.Q.telaEsperada = null; });
      await t.assentar();
    }
  }
  if (quer('roda')) {
    console.log('== RODA DE SÁBADO (Contramestra Maré)');
    await diaSem(3);
    await junto(t, 'B5', 'roda-b');
    mostra('maré 1ª (batalha B5-mare)', await conversar(t, 'roda-b'));
    t.ok(await fv(t, 'venceu:B5-mare'), 'venceu:B5-mare');
    mostra('maré sem insígnia 14', await conversar(t, 'roda-b'));
    await t.page.evaluate(() => { const s = window.__pingo.jogo.save; s.insignias = [...new Set([...s.insignias, 12, 13, 14])]; });
    mostra('maré quarta', await conversar(t, 'roda-b'));
    await diaSem(6);
    const nb = (await t.batalhas()).length;
    mostra('maré sábado', await conversar(t, 'roda-b'));
    const bs = await t.batalhas(nb); console.log('   batalhas:', JSON.stringify(bs.map((b) => b.id + ':' + b.resultado + ' [' + b.inimigos + ']')));
    t.ok(bs.some((b) => b.id === 'B5-mare-2'), 'revanche B5-mare-2 no sábado');
    const nb2 = (await t.batalhas()).length;
    mostra('maré sábado de novo', await conversar(t, 'roda-b'));
    t.ok((await t.batalhas()).length === nb2, 'mesmo sábado: recusa');
    await avancarDias(t, 7);
    const nb3 = (await t.batalhas()).length;
    mostra('maré sábado seguinte', await conversar(t, 'roda-b'));
    t.ok((await t.batalhas()).length === nb3 + 1, 'sábado seguinte: nova revanche');
    await t.page.evaluate(() => { const s = window.__pingo.jogo.save; s.insignias = s.insignias.filter((i) => i <= 13); });
  }
  if (quer('ra')) {
    console.log('== DONA RÃ (Pererequinhas)');
    await junto(t, 'B6', 'mae-perereca');
    mostra('dona rã 1', await conversar(t, 'mae-perereca'));
    t.ok(await fv(t, 'm-filhotes'), 'm-filhotes');
    for (const [z, n] of [['B6', 1], ['B6', 2], ['B6', 3], ['B-VV', 4], ['B-VV', 5]]) {
      try { await junto(t, z, `filhote-${n}`); mostra(`perereca ${n}`, await conversar(t, `filhote-${n}`)); } catch (e) { console.log('   perereca', n, 'FALHOU:', e.message.slice(0, 200)); await t.foto(`b2-perereca-${n}`); }
      t.ok(await fv(t, `b2-filhote-${n}`), `b2-filhote-${n}`);
    }
    mostra('dona rã parcial?', []);
    await junto(t, 'B6', 'mae-perereca');
    const eq0 = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.length + window.__pingo.jogo.save.viveiro.flat().filter(Boolean).length);
    mostra('dona rã fim', await conversar(t, 'mae-perereca'));
    const ovo = await t.page.evaluate(() => [...window.__pingo.jogo.save.equipe, ...window.__pingo.jogo.save.viveiro.flat()].filter((c) => c && c.ovo).map((c) => c.especie + ':' + c.nivel));
    t.ok(await fv(t, 'm-filhotes-ok') && ovo.includes('24:' + ovo.find((o) => o.startsWith('24:'))?.split(':')[1]), 'Dona Rã: ovo de Pererequinha', JSON.stringify(ovo));
    mostra('dona rã depois', await conversar(t, 'mae-perereca'));
  }
  if (quer('carta')) {
    console.log('== CARTA B6 ↔ B7');
    await junto(t, 'B6', 'b6-carteiro');
    mostra('carteiro 1', await conversar(t, 'b6-carteiro'));
    t.ok(await fv(t, 'm-carta-serra'), 'm-carta-serra');
    await junto(t, 'B7', 'b7-moca');
    mostra('Dorinha', await conversar(t, 'b7-moca'));
    t.ok(await fv(t, 'm-carta-serra-resposta'), 'resposta');
    mostra('Dorinha de novo', await conversar(t, 'b7-moca'));
    await junto(t, 'B6', 'b6-carteiro');
    const d0 = await t.page.evaluate(() => window.__pingo.jogo.save.jogador.dinheiro), m0 = await mochila(t, ['pt-17']);
    mostra('carteiro fim', await conversar(t, 'b6-carteiro'));
    const d1 = await t.page.evaluate(() => window.__pingo.jogo.save.jogador.dinheiro), m1 = await mochila(t, ['pt-17']);
    t.ok(await fv(t, 'm-carta-serra-ok') && d1 === d0 + 3000 && m1['pt-17'] === m0['pt-17'] + 1, 'carta: recompensa', JSON.stringify([d0, d1, m0, m1]));
  }
  if (quer('troca')) {
    console.log('== TROCA B7 (Tuco-Escavador → Azulina)');
    await junto(t, 'B7', 'b7-trocador');
    mostra('trocador', await conversar(t, 'b7-trocador'));
    const eq = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.apelido ?? ''}:${c.item ?? ''}:${c.treinadorOriginal}:${c.localCaptura ?? ''}`));
    console.log('   equipe', eq.join(' | '));
    t.ok(await fv(t, 'm-troca-b7-ok') && eq.some((e) => e.startsWith('136:55:Azulina:pena-colorida')), 'troca feita');
    mostra('trocador depois', await conversar(t, 'b7-trocador'));
  }
  if (quer('pinhoes')) {
    console.log('== PINHÕES (Serelepão)');
    await junto(t, 'B-R4', 'b-r4-pinhoeiro');
    const m0 = await mochila(t, ['pt-39', 'cha-guarana']);
    mostra('pinhoeiro', await conversar(t, 'b-r4-pinhoeiro'));
    const m1 = await mochila(t, ['pt-39', 'cha-guarana']);
    t.ok(await fv(t, 'm-pinhoes-ok') && m1['pt-39'] === m0['pt-39'] + 1, 'pinhões: recompensa', JSON.stringify([m0, m1]));
    mostra('pinhoeiro depois', await conversar(t, 'b-r4-pinhoeiro'));
  }
  if (quer('payada')) {
    console.log('== PAYADA (CTG)');
    await junto(t, 'B7-ctg', 'payador');
    await escolhas(t, [['coroa e não é rei', 0], ['Cai do alto da serra', 2], ['Quanto mais se tira', 2]]);
    mostra('payada erra 1', await conversar(t, 'payador'));
    t.ok(!(await fv(t, 'b2-payada-ok')), 'errou: sem prenda');
    mostra('payada mesmo dia', await conversar(t, 'payador'));
    await avancarDias(t, 1);
    await escolhas(t, [['coroa e não é rei', 0], ['Cai do alto da serra', 1], ['Quanto mais se tira', 2]]);
    const m0 = await mochila(t, ['pt-22', 'pedra-mare', 'cuia-ouro']);
    mostra('payada acerta', await conversar(t, 'payador'));
    const m1 = await mochila(t, ['pt-22', 'pedra-mare', 'cuia-ouro']);
    t.ok(await fv(t, 'b2-payada-ok') && m1['pt-22'] === m0['pt-22'] + 1, 'payada: prenda', JSON.stringify([m0, m1]));
    await avancarDias(t, 1);
    mostra('payada 3º dia (acerta de novo)', await conversar(t, 'payador'));
    const m2 = await mochila(t, ['cuia-ouro']);
    t.ok(m2['cuia-ouro'] === m1['cuia-ouro'] + 1, 'payada repetida: Cuia de Ouro');
    await escolhas(t, []);
  }
  if (quer('chimarrao')) {
    console.log('== CHIMARRÃO (Patrão Ernesto)');
    await hora(t, 13);
    await junto(t, 'B7', 'b7-patrao');
    mostra('patrão de dia', await conversar(t, 'b7-patrao'));
    t.ok(!(await fv(t, 'b2-chimarrao-ok')), 'de dia: sem causo');
    await hora(t, 22);
    const m0 = await mochila(t, ['pt-45']);
    mostra('patrão de noite', await conversar(t, 'b7-patrao'));
    const m1 = await mochila(t, ['pt-45']);
    t.ok(await fv(t, 'b2-chimarrao-ok') && m1['pt-45'] === m0['pt-45'] + 1, 'chimarrão: causo e presente', JSON.stringify([m0, m1]));
    mostra('patrão de noite de novo', await conversar(t, 'b7-patrao'));
    await t.foto('b2-chimarrao-noite');
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('b2sul-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
