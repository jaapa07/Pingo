// Regra de 20/11: lendário aparece UMA vez. Derrotado sem captura → some para sempre (com fala); fuga → continua; capturado → ok.
import { abrir, montar, hora, avancarDias, mostra, fv, junto, usarEm, conversar, nFalas, falasDesde } from './lib.mjs';
const sv = montar('B8', 20, 20, { insignias: 16, flags: { 'garrote-vencido': true, 'conselho-vencido': true, 'pos-jogo': true, 'ea-rota': true, 'boreal-missao': true, 'boreal-acesa': true }, mochila: { 'cuia-ouro': 99 } });
for (let n = 1; n <= 150; n++) { if (!sv.diario.capturado.includes(n)) sv.diario.capturado.push(n); if (!sv.diario.visto.includes(n)) sv.diario.visto.push(n); }
sv.diario.capturado = sv.diario.capturado.filter((n) => ![173, 174, 175, 176, 177, 178].includes(n));
sv.viveiro = sv.viveiro.map(() => Array(30).fill(null)); sv.repelente = 0;
const t = await abrir(sv, { equipe: [[3, 100], [6, 100], [9, 100], [12, 100], [72, 100], [110, 100]], hora: 13 });
const objeto = (z, script) => t.page.evaluate(async ([zz, sc]) => { const d = (await import('/src/data/zonas/' + zz + '.ts')).default; const o = (d.objetos ?? []).find((q) => q.script === sc); return o ? { x: o.x, y: o.y } : null; }, [z, script]);
// modo: 'vencer' (não captura, não foge), 'fugir' (foge no 1º turno), 'capturar' (Cuia de Ouro garantida nesta página)
const modo = (m, esp = -1) => t.page.evaluate(async ([mm, e]) => {
  const Q = window.Q, IT = await import('/src/data/itens.ts');
  IT.item('cuia-ouro').uso.cuia.garantida = mm === 'capturar';
  Q.capturar = mm === 'capturar' ? (x) => x === e : null; Q.maxCapturas = 99;
  Q.saude = mm === 'fugir' ? () => ({ frac: 0.1, caidas: 0, vivas: 6, pgBaixo: 0 }) : () => ({ frac: 1, caidas: 0, vivas: 6, pgBaixo: 0 });
}, [m, esp]);
const curar = () => t.page.evaluate(async () => { const CR = await import('/src/battle/criatura.ts'); for (const c of window.__pingo.jogo.save.equipe) { c.vida = CR.atributos(c).vida; c.status = null; for (const g of c.golpes) g.pg = g.pgMax; } });
const ultimas = async (nb) => (await t.batalhas(nb)).map((b) => b.tipo + ' [' + b.inimigos + '] ' + b.resultado);
const tem = async (id) => (await t.npcs()).some((n) => n.id === id);
const reentrar = async (z, alvo) => { await junto(t, 'B8', 'b8-escriva'); await junto(t, z, alvo); };
const passos = async (p) => { const k = await nFalas(t); const nb = (await t.batalhas()).length; await t.page.evaluate(async (pp) => { const W = await import('/src/world/index.ts'); await W.rodarPassos(pp); }, p); await t.assentar(); return [await falasDesde(t, k), await ultimas(nb)]; };
try {
  console.log('== BOITATÁ: fuga → continua; vitória → some para sempre');
  await reentrar('B-CV', 'boitata'); await curar(); await modo('fugir');
  let nb = (await t.batalhas()).length;
  mostra('boitatá (fuga)', (await conversar(t, 'boitata')).slice(-1)); console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await tem('boitata') && !(await fv(t, 'boitata-ok')), 'fugiu: Boitatá continua');
  await curar(); await modo('vencer'); nb = (await t.batalhas()).length;
  mostra('boitatá (vitória)', (await conversar(t, 'boitata')).slice(-1)); console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'boitata-ok') && !(await tem('boitata')), 'vencido: some');
  await avancarDias(t, 3); await reentrar('B-CV', { x: 20, y: 8 });
  t.ok(!(await tem('boitata')), 'dias depois, pós-Conselho: não volta');

  console.log('== MAPINGUARI: vitória → some para sempre');
  await reentrar('B-FA', 'b-fa-mapinguari'); await curar(); await modo('vencer'); nb = (await t.batalhas()).length;
  mostra('mapinguari', (await conversar(t, 'b-fa-mapinguari')).slice(-1)); console.log('    ', JSON.stringify(await ultimas(nb)));
  await avancarDias(t, 2); await reentrar('B-FA', { x: 30, y: 50 });
  t.ok(await fv(t, 'mapinguari-ok') && !(await tem('b-fa-mapinguari')), 'Mapinguari não volta');

  console.log('== UIRAPURU: captura');
  await hora(t, 7);
  const tot = await objeto('B-SG', 'b2n-uirapuru');
  await reentrar('B-SG', tot); await curar(); await modo('capturar', 177); nb = (await t.batalhas()).length;
  mostra('uirapuru', (await usarEm(t, tot.x, tot.y)).slice(-1)); console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'uirapuru-ok') && !(await tem('b-sg-uirapuru')), 'capturado: some do totem');

  console.log('== BOIÚNA (A-RS): vitória');
  await hora(t, 13);
  await reentrar('A-RS', 'boiuna'); await curar(); await modo('vencer'); nb = (await t.batalhas()).length;
  mostra('boiúna', (await conversar(t, 'boiuna')).slice(-2)); console.log('    ', JSON.stringify(await ultimas(nb)));
  t.ok(await fv(t, 'boiuna-ok') && !(await tem('boiuna')), 'Boiúna vencida some');

  console.log('== QUEIXADA-CAIPORA errante: fuga → continua; vitória → fim');
  await reentrar('B-R3', { x: 10, y: 14 });
  await t.page.evaluate(() => { const f = window.__pingo.jogo.save.flags; f['errante:176'] = 'B-R3'; f['errante-nv:176'] = 63; });
  for (const [m, rot] of [['fugir', 'fuga'], ['vencer', 'vitória']]) {
    await modo(m); await curar();
    await t.page.evaluate(() => { window.__pingo.jogo.save.flags['errante:176'] = 'B-R3'; });
    const nb0 = (await t.batalhas()).length; const k = await nFalas(t);
    for (let i = 0; i < 40; i++) { await t.q(() => window.Q.passear(1)); const bs = await t.batalhas(nb0); if (bs.some((b) => b.inimigos.startsWith('176:'))) break; await curar(); }
    const bs = (await t.batalhas(nb0)).filter((b) => b.inimigos.startsWith('176:')).map((b) => b.resultado);
    console.log(`   ${rot}:`, JSON.stringify(bs), 'errante:176 =', JSON.stringify(await fv(t, 'errante:176')));
    mostra(`avisos (${rot})`, (await falasDesde(t, k)).filter((x) => /Queixada/.test(x)));
  }
  t.ok((await fv(t, 'errante:176')) === 'fim', 'Queixada vencida: errante fim');

  console.log('== GALO-MANAÓ e BOREALCE (eventos de batalha)');
  await curar(); await modo('vencer');
  let [fl, bs] = await passos([['chamar', 'vis-galo-batalha']]);
  mostra('galo', fl.slice(-1)); console.log('    ', JSON.stringify(bs));
  t.ok(await fv(t, 'galo-manao-sumiu'), 'galo-manao-sumiu');
  await t.page.evaluate(async () => { const W = await import('/src/world/index.ts'); await W.irPara('X-EA', 18, 44, 'n', 'nenhuma'); });
  await t.assentar();
  const galoNaIlha = await t.page.evaluate(async () => (await import('/src/world/vivo.ts')).M.extras.some((a) => /galo/.test(a.modelo ?? a.sprite?.modeloId ?? String(a.id ?? ''))));
  console.log('   galo desenhado na X-EA:', galoNaIlha);
  await curar(); await modo('fugir');
  [fl, bs] = await passos([['chamar', 'vis-borealce-batalha']]);
  mostra('borealce (fuga)', fl.slice(-1)); console.log('    ', JSON.stringify(bs));
  t.ok(!(await fv(t, 'borealce-sumiu')), 'fugiu: Borealce continua');
  await curar(); await modo('vencer');
  [fl, bs] = await passos([['chamar', 'vis-borealce-batalha']]);
  mostra('borealce (vitória)', fl.slice(-1)); console.log('    ', JSON.stringify(bs));
  t.ok(await fv(t, 'borealce-sumiu'), 'borealce-sumiu');
  await hora(t, 22);
  await t.page.evaluate(() => { window.__pingo.jogo.save.mochila['lanterna-boreal'] = 0; });
  [fl, bs] = await passos([['chamar', 'vis-pico-aurora']]);
  mostra('pico de noite depois', fl); t.ok(bs.length === 0, 'Borealce não volta à aurora');
  await hora(t, 13);
  await junto(t, 'B9', { x: 10, y: 22 });
  [fl] = await passos([['chamar', 'vis-solveig']]); mostra('Solveig', fl);

  console.log('== MANDIZINHO RARO: vitória');
  await curar(); await modo('vencer');
  [fl, bs] = await passos([['lagoRaro']]);
  mostra('lago', fl); console.log('    ', JSON.stringify(bs));
  t.ok(await fv(t, 'lago-raro-ok'), 'lago-raro-ok');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('lendarios2-falha'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
