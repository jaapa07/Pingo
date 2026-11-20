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
const passos = async (p) => { const k = await nFalas(t); const nb = (await t.batalhas()).length; await t.page.evaluate(async (pp) => { const W = await import('/src/world/index.ts'); window.__fimPassos = false; void W.rodarPassos(pp).finally(() => { window.__fimPassos = true; }); }, p); for (let i = 0; i < 400 && !(await t.page.evaluate(() => window.__fimPassos)); i++) await t.assentar(); await t.assentar(); return [await falasDesde(t, k), await ultimas(nb)]; };
try {
  let nb, fl, bs;
  console.log('== GALO-MANAÓ e BOREALCE (eventos de batalha)');
  await curar(); await modo('vencer');
  [fl, bs] = await passos([['chamar', 'vis-galo-batalha']]);
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
