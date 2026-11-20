// QA 2 — CAPTURAS da Liga e do Hall da Fama: cada sala com o Mestre em cena, a batalha do Campeão, o painel do Hall,
// a escolha da pedra, o Rádio Cipó e o terreiro depois da rival-5. A equipe é a do checkpoint do Platô; para chegar
// ao Campeão sem jogar as quatro salas de novo (a taxa já foi medida em liga.mjs), as flags liga-1…liga-4 são marcadas.
// Uso: run.sh capturas.mjs <seg> [save=plato]
import { abrir, lerSave, S } from './lib.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'plato'), { semente: 5 });
const { page } = t;
const Qr = (fn, arg) => t.q(fn, arg);
const topo = () => page.evaluate(() => ({ topo: window.__pingo.telas.topo?.el.className ?? '', hall: !!document.querySelector('.hall-da-fama'), txt: String(window.__pingo.mundo.falas.slice(-1)[0]?.texto ?? '').slice(0, 300), lista: !!document.querySelector('.tela.dialogo .lista') }));
try {
  // salas: o jogador de pé diante de cada Mestre (warp para a frente de cada um)
  const pos = await Qr(() => window.__pingo.mundo.npcs.filter((n) => /^liga-/.test(n.id)).map((n) => [n.id, n.ator.x, n.ator.y, n.ator.visivel, n.def.sprite]));
  console.log('NPCs da Liga:', JSON.stringify(pos));
  await Qr(() => { const s = window.__pingo.jogo.save; for (const f of ['liga-em-curso', 'liga-1', 'liga-2', 'liga-3', 'liga-4']) s.flags[f] = true; });
  for (const [id, x, y] of pos) {
    if (!/mare|brasa|neblina|pampa|arace/.test(id)) continue;
    await Qr(([x, y]) => window.__pingo.mundo.irPara('A-LG', x, y + 2, 'n', 'nenhuma'), [x, y]);
    await t.assentar(); await t.foto(`cap-sala-${id}`);
  }
  // batalha do Campeão (tela de batalha com o sprite liga-arace e a primeira criatura)
  await Qr(() => window.Q.rodizio('chefe'));
  const ini = (await t.st()).nb;
  // o próprio jogo pede a captura: a cada quadro a página confere as condições e, na primeira vez de cada uma, congela o
  // relógio virtual (__pausaRelogio) até o Node fotografar — nada passa entre um quadro e outro
  await page.evaluate(() => {
    const feitas = new Set(); window.__capPend = null;
    const regras = [
      ['cap-batalha-campeao', () => !!document.querySelector('.tela.batalha .bt-menu') && !feitas.has('cap-hall-da-fama')],
      ['cap-hall-da-fama', () => !!document.querySelector('.hall-da-fama') && /dialogo/.test(window.__pingo.telas.topo?.el.className ?? '')],
      ['cap-hall-creditos', () => !!document.querySelector('.hall-da-fama') && /creditos/.test(window.__pingo.telas.topo?.el.className ?? '')],
      ['cap-hall-pedra', () => !!document.querySelector('.tela.dialogo .lista') && feitas.has('cap-hall-creditos')],
      ['cap-radio', () => /Interrompemos/.test(String(window.__pingo.mundo.falas.slice(-1)[0]?.texto ?? '')) && /dialogo/.test(window.__pingo.telas.topo?.el.className ?? '')],
      ['cap-batalha-rival5', () => !!document.querySelector('.tela.batalha .bt-menu') && feitas.has('cap-radio')],
    ];
    const olhar = () => { if (!window.__capPend) for (const [n, f] of regras) if (!feitas.has(n) && f()) { feitas.add(n); window.__capPend = n; window.__pausaRelogio = true; break; } requestAnimationFrame(olhar); };
    requestAnimationFrame(olhar);
  });
  const fotos = [];
  const luta = page.evaluate(() => window.Q.falarCom('liga-arace').then(() => 'ok').catch((e) => 'ERRO ' + e.message));
  let acabou = false; luta.then(() => { acabou = true; });
  while (!acabou && fotos.length < 6) {
    const n = await page.evaluate(() => window.__capPend);
    if (n) { await page.screenshot({ path: `${S}/${n}.png` }); fotos.push(n); await page.evaluate(() => { window.__capPend = null; window.__pausaRelogio = false; }); }
    else await page.waitForTimeout(25);
  }
  console.log('capturas:', fotos.join(', '));
  console.log('falarCom:', await luta, JSON.stringify(fotos));
  await t.assentar();
  const bs = await t.batalhas(ini); console.log(bs.map((b) => `${b.id} ${b.resultado} t=${b.turnos}`).join(' | '));
  await t.foto('cap-terreiro-depois');
  const vis = await Qr(() => window.__pingo.mundo.npcs.filter((n) => n.ator.visivel && /taina/.test(n.def.sprite ?? n.id)).map((n) => [n.id, n.ator.x, n.ator.y]));
  t.ok(vis.length === 0, 'Tainá sai de cena depois da rival-5', JSON.stringify(vis));
  console.log('flags:', JSON.stringify(await t.flags('^liga-|rival-5')));
  const r = await t.resumo(); console.log('equipe:', r.equipe.map((e) => e.split(' [')[0]).join(' · '));
} catch (e) { console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await t.st().catch(() => 0))); await t.foto('cap-erro'); }
await t.fim();
