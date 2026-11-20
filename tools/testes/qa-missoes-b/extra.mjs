// Saveiro A5 ↔ B9 e a lista da banca de cuias (quarta × quinta).
import { abrir, montar, FORTE, mostra, junto, nFalas, falasDesde, mochila } from './lib.mjs';
const so = process.argv[2] ?? 'tudo';
const quer = (m) => so === 'tudo' || so.split(',').includes(m);
const sv = montar('A5', 30, 32, { insignias: 11, mochila: { 'bilhete-saveiro': 0 } });
const t = await abrir(sv, { equipe: FORTE, hora: 13, dia: 3 });
try {
  if (quer('saveiro')) {
    console.log('== SAVEIRO A5 ↔ B9');
    const w = await t.page.evaluate(() => (window.__pingo.mundo.zona.warps ?? []).filter((x) => x.tipo === 'saveiro').map((x) => ({ x: x.x, y: x.y, para: x.para })));
    console.log('   warps de saveiro em A5:', JSON.stringify(w));
    let k = await nFalas(t);
    try { await t.irAte(w[0].x, w[0].y); } catch (e) { console.log('   (sem bilhete)', e.message.slice(0, 120)); }
    await t.assentar();
    mostra('sem bilhete', await falasDesde(t, k));
    console.log('   zona:', (await t.st()).zona);
    t.ok((await t.st()).zona === 'A5', 'sem bilhete: fica em A5');
    await t.page.evaluate(() => { window.__pingo.jogo.save.mochila['bilhete-saveiro'] = 1; });
    await junto(t, 'A5', { x: 30, y: 33 });
    k = await nFalas(t);
    const s = await t.irZona('B9');
    mostra('embarque', await falasDesde(t, k));
    t.ok(s.zona === 'B9' && s.x === 10 && s.y === 24, 'chegou a B9 (10,24)', JSON.stringify(s));
    await t.foto('saveiro-b9');
    k = await nFalas(t);
    const s2 = await t.irZona('A5');
    mostra('volta', await falasDesde(t, k));
    t.ok(s2.zona === 'A5' && s2.x === 30 && s2.y === 34, 'voltou a A5 (30,34)', JSON.stringify(s2));
    await t.foto('saveiro-a5');
  }
  if (quer('cuias')) {
    console.log('== BANCA DE CUIAS (lista)');
    await junto(t, 'B5-feira', 'cuias');
    for (const [d, rot] of [[3, 'quarta'], [4, 'quinta']]) {
      await t.page.evaluate((dd) => { window.__pingo.jogo.save.relogio.diaSemana0 = (dd - new Date().getDay() + 7) % 7; window.Q.telaEsperada = /tela-loja/; }, d);
      await t.falarCom('cuias');
      await t.page.evaluate(async () => { await window.Q.toque('a'); await window.Q.quadros(8); });
      const itens = await t.page.evaluate(() => [...document.querySelectorAll('.tela-loja .lista-item')].length);
      console.log(`   ${rot}: ${itens} linhas na lista de compra`);
      await t.foto(`cuias-lista-${rot}`);
      await t.page.evaluate(async () => { window.Q.telaEsperada = null; for (let i = 0; i < 4; i++) { await window.Q.toque('b'); await window.Q.quadros(4); } });
      await t.assentar();
    }
  }
} catch (e) { console.log('FALHOU:', e.message); await t.foto('extra-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
