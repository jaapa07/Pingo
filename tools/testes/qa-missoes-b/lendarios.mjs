// Lendários do mapa B: vencidos voltam depois do Conselho (dia seguinte) — Boitatá, Uirapuru, Mapinguari; e a captura do Uirapuru.
import { abrir, montar, hora, avancarDias, mostra, fv, junto, usarEm, conversar } from './lib.mjs';
const sv = montar('B8', 20, 20, { insignias: 16, flags: { 'garrote-vencido': true }, mochila: { 'cuia-ouro': 99 } });
for (let n = 1; n <= 150; n++) { if (!sv.diario.capturado.includes(n)) sv.diario.capturado.push(n); if (!sv.diario.visto.includes(n)) sv.diario.visto.push(n); }
sv.diario.capturado = sv.diario.capturado.filter((n) => ![173, 177, 175].includes(n));
sv.viveiro = sv.viveiro.map(() => Array(30).fill(null));
const FORTE6 = [[3, 100], [6, 100], [9, 100], [12, 100], [72, 100], [110, 100]];
const t = await abrir(sv, { equipe: FORTE6, hora: 13 });
const objeto = (z, script) => t.page.evaluate(async ([zz, sc]) => { const d = (await import('/src/data/zonas/' + zz + '.ts')).default; const o = (d.objetos ?? []).find((q) => q.script === sc); return o ? { x: o.x, y: o.y } : null; }, [z, script]);
const politica = (esp) => t.page.evaluate((e) => { window.Q.capturar = (x) => x === e; window.Q.maxCapturas = 99; window.Q.saude = () => ({ frac: 1, caidas: 0, vivas: 6, pgBaixo: 0 }); }, esp);
const curar = () => t.page.evaluate(async () => { const CR = await import('/src/battle/criatura.ts'); for (const c of window.__pingo.jogo.save.equipe) { c.vida = CR.atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; } });
const ultimas = async (nb) => (await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado);
const tem = async (id) => (await t.npcs()).some((n) => n.id === id);
const reentrar = async (z, alvo) => { await junto(t, 'B8', 'b8-escriva'); await junto(t, z, alvo); };
const conselho = (v) => t.page.evaluate((x) => { Object.assign(window.__pingo.jogo.save.flags, { 'conselho-vencido': x, 'pos-jogo': x }); }, v);
try {
  await politica(-1);
  console.log('== BOITATÁ vencido antes do Conselho');
  await conselho(false);
  await reentrar('B-CV', 'boitata'); await curar();
  let nb = (await t.batalhas()).length;
  mostra('boitatá', (await conversar(t, 'boitata')).slice(-1));
  console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'boitata-ok') && typeof (await fv(t, 'boitata-dormiu')) === 'number' && !(await tem('boitata')), 'boitatá vencido: some, dormiu = dia');
  await avancarDias(t, 1); await reentrar('B-CV', { x: 20, y: 8 });
  t.ok(!(await tem('boitata')), 'dia seguinte, sem Conselho: continua dormindo');
  await conselho(true); await reentrar('B-CV', { x: 20, y: 8 });
  t.ok(await tem('boitata') && !(await fv(t, 'boitata-ok')), 'depois do Conselho: Boitatá de volta');
  await t.foto('boitata-volta');

  console.log('== MAPINGUARI vencido (pós-jogo)');
  await reentrar('B-FA', 'b-fa-mapinguari'); await curar();
  nb = (await t.batalhas()).length;
  mostra('mapinguari', (await conversar(t, 'b-fa-mapinguari')).slice(-1));
  console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'mapinguari-ok') && !(await tem('b-fa-mapinguari')), 'Mapinguari vencido some');
  await reentrar('B-FA', { x: 30, y: 50 });
  t.ok(!(await tem('b-fa-mapinguari')), 'mesmo dia: não volta');
  await avancarDias(t, 1); await reentrar('B-FA', { x: 30, y: 50 });
  t.ok(await tem('b-fa-mapinguari'), 'dia seguinte: Mapinguari de volta');

  console.log('== UIRAPURU vencido');
  await hora(t, 7);
  const tot = await objeto('B-SG', 'b2n-uirapuru');
  await reentrar('B-SG', tot); await curar();
  nb = (await t.batalhas()).length;
  mostra('uirapuru', (await usarEm(t, tot.x, tot.y)).slice(-1));
  console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'uirapuru-ok') && !(await tem('b-sg-uirapuru')), 'Uirapuru vencido some');
  mostra('totem depois', await usarEm(t, tot.x, tot.y));
  await avancarDias(t, 1); await hora(t, 7); await reentrar('B-SG', tot);
  t.ok(await tem('b-sg-uirapuru') && !(await fv(t, 'uirapuru-ok')), 'dia seguinte de manhã: Uirapuru de volta');

  console.log('== UIRAPURU capturado (equipe nv 70)');
  await t.page.evaluate(async () => { const { criarCriatura } = await import('/src/world/deps.ts'); window.__pingo.jogo.save.equipe = [[110, 70], [72, 70], [12, 70], [3, 70], [6, 70], [9, 70]].map(([e, n]) => criarCriatura(e, n)); });
  await politica(177);
  // o fluxo é o foco (não a sorte): a Cuia de Ouro vira "garantida" só nesta página
  await t.page.evaluate(async () => { const IT = await import('/src/data/itens.ts'); IT.item('cuia-ouro').uso.cuia.garantida = true; });
  for (let i = 0; i < 8 && !(await fv(t, 'uirapuru-ok')); i++) {
    await curar();
    nb = (await t.batalhas()).length;
    mostra(`tentativa ${i + 1}`, (await usarEm(t, tot.x, tot.y)).slice(-1));
    console.log('    ', JSON.stringify(await ultimas(nb)));
    if (await fv(t, 'uirapuru-ok') && !(await t.page.evaluate(() => [...window.__pingo.jogo.save.equipe, ...window.__pingo.jogo.save.viveiro.flat()].some((c) => c && c.especie === 177)))) { await avancarDias(t, 1); await hora(t, 7); await reentrar('B-SG', tot); }
  }
  const cap = await t.page.evaluate(() => [...window.__pingo.jogo.save.equipe, ...window.__pingo.jogo.save.viveiro.flat()].some((c) => c && c.especie === 177));
  t.ok(cap && await fv(t, 'uirapuru-ok') && !(await fv(t, 'uirapuru-dormiu')), 'Uirapuru capturado: ok sem dormiu');
  await avancarDias(t, 1); await hora(t, 7); await reentrar('B-SG', tot);
  t.ok(!(await tem('b-sg-uirapuru')), 'capturado: não volta');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('lendarios-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
