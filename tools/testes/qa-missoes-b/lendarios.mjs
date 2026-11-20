// Uirapuru (captura), Mapinguari (vitória) e um Ninho Raro (captura): conferem os ramos capturou/venceu dos eventos.
import { abrir, montar, hora, mostra, fv, junto, nFalas, falasDesde, usarEm, conversar } from './lib.mjs';
const sv = montar('B-SG', 30, 30, { insignias: 16, flags: { 'conselho-vencido': true, 'pos-jogo': true, 'garrote-vencido': true }, mochila: { 'cuia-ouro': 99 } });
for (let n = 1; n <= 150; n++) { if (!sv.diario.capturado.includes(n)) sv.diario.capturado.push(n); if (!sv.diario.visto.includes(n)) sv.diario.visto.push(n); }
sv.diario.capturado = sv.diario.capturado.filter((n) => ![177, 175].includes(n));
sv.viveiro = sv.viveiro.map(() => Array(30).fill(null));
const t = await abrir(sv, { equipe: [[3, 100], [6, 100], [9, 100], [12, 100], [72, 100], [110, 100]], hora: 7 });
const objeto = (z, script) => t.page.evaluate(async ([zz, sc]) => { const d = (await import('/src/data/zonas/' + zz + '.ts')).default; const o = (d.objetos ?? []).find((q) => q.script === sc); return o ? { x: o.x, y: o.y } : null; }, [z, script]);
const politica = (esp) => t.page.evaluate((e) => { window.Q.capturar = (x) => x === e; window.Q.maxCapturas = 99; window.Q.saude = () => ({ frac: 1, caidas: 0, vivas: 6, pgBaixo: 0 }); }, esp);
const curar = () => t.page.evaluate(async () => { const CR = await import('/src/battle/criatura.ts'); for (const c of window.__pingo.jogo.save.equipe) { c.vida = CR.atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; } });
const ultimas = async (nb) => (await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado);
try {
  console.log('== UIRAPURU: captura');
  const tot = await objeto('B-SG', 'b2n-uirapuru');
  await junto(t, 'B-SG', tot);
  await politica(177);
  for (let i = 0; i < 6 && !(await fv(t, 'uirapuru-ok')); i++) {
    await curar();
    const nb = (await t.batalhas()).length;
    mostra(`tentativa ${i + 1}`, (await usarEm(t, tot.x, tot.y)).slice(-1));
    console.log('    ', JSON.stringify(await ultimas(nb)));
  }
  t.ok(await fv(t, 'uirapuru-ok'), 'uirapuru-ok');
  const cap = await t.page.evaluate(() => [...window.__pingo.jogo.save.equipe, ...window.__pingo.jogo.save.viveiro.flat()].filter((c) => c && c.especie === 177).length);
  t.ok(cap === 1, 'Uirapuru capturado');
  t.ok(!(await t.npcs()).some((n) => n.id === 'b-sg-uirapuru'), 'Uirapuru sumiu do totem');
  mostra('totem depois', await usarEm(t, tot.x, tot.y));

  console.log('== MAPINGUARI: vitória');
  await hora(t, 13);
  await junto(t, 'B-FA', 'b-fa-mapinguari');
  await politica(-1);
  await curar();
  let nb = (await t.batalhas()).length;
  mostra('mapinguari', await conversar(t, 'b-fa-mapinguari'));
  console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'mapinguari-ok') && await fv(t, 'mapinguari-dormiu'), 'mapinguari-ok + mapinguari-dormiu');
  t.ok(!(await t.npcs()).some((n) => n.id === 'b-fa-mapinguari'), 'Mapinguari sumiu');
  await t.foto('mapinguari-depois');

  console.log('== NINHO RARO DO RIO: captura de manhã');
  await hora(t, 7);
  const o = await objeto('B-FA', 'b2n-ninho-rio');
  await junto(t, 'B-FA', o);
  await politica(9);
  await t.page.evaluate(() => { const d = window.__pingo.jogo.save.diario; d.capturado = d.capturado.filter((n) => n !== 9); });
  await curar();
  nb = (await t.batalhas()).length;
  mostra('ninho rio', await usarEm(t, o.x, o.y));
  console.log('    ', JSON.stringify(await ultimas(nb)));
} catch (e) { console.log('FALHOU:', e.message); await t.foto('lendarios-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
