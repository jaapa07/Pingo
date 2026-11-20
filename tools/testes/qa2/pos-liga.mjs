// QA 2 — DEPOIS DA LIGA: o Campeão volta a andar pelo mapa A. Confere a porta fechada, o trem e o Saveiro "em obras",
// as falas que não podem prometer o Sertão, o portão do Monte Tupã, o Recife Submerso sem Mergulho e uma captura.
// Uso: run.sh pos-liga.mjs <seg> [save=campeao]
import { abrir, lerSave } from './lib.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'campeao'));
const Qr = (fn, arg) => t.q(fn, arg);
const viajar = (z) => Qr((z) => window.Q.viajar(z), z);
const fala = async (n = 2) => (await t.falas(n)).join(' ⏎ ').replace(/\n/g, ' ');
const etapa = async (nome, fn) => { try { await fn(); } catch (e) { t.ok(false, nome, e.message.split('\n')[0] + ' ' + JSON.stringify(await t.st().catch(() => 0))); await t.foto('pos-erro-' + nome.replace(/[^a-z0-9]+/gi, '-')); } };
try {
  const r0 = await t.resumo();
  console.log('Campeão:', r0.zona, '$' + r0.dinheiro, r0.equipe.map((e) => e.split(' [')[0]).join(' · '));
  t.ok(await t.flag('liga-vencida'), 'flag liga-vencida');
  t.ok(!!r0.mochila['passe-trem'] && !!r0.mochila['bilhete-saveiro'], 'Passe do Trem e Bilhete do Saveiro na mochila');
  t.ok(['pedra-solar', 'pedra-mare', 'pedra-lunar', 'folha-ancestral'].some((p) => r0.mochila[p]), 'pedra de evolução na mochila');
  t.ok((await t.flags('^liga-[1-4]$|liga-em-curso')).length === 0, 'sequência da Liga zerada depois da vitória');
  await etapa('porta da Liga', async () => {
    await t.irAte(15, 53); await t.ir('n'); const s = await t.assentar();
    t.ok(s.zona === 'A-LG' && s.y >= 53 && !(await t.flag('liga-em-curso')), 'porta da Liga fechada para o Campeão', await fala(1));
    await t.foto('pos-porta-fechada');
  });
  await etapa('Posto e Venda do Platô', async () => {
    await viajar('A-LG-posto'); await Qr(() => window.Q.curarNoPosto()); await viajar('A-LG-venda'); await t.foto('pos-venda-plato'); await viajar('A-LG');
    t.ok(true, 'Posto e Venda do Platô continuam abertos');
  });
  await etapa('captura depois da Liga', async () => {
    await viajar('A-R7');
    await Qr(() => { window.Q.capturar = () => true; window.Q.maxCapturas = window.Q.capturadas.length + 1; });
    const nb = (await t.st()).nb;
    await Qr(() => window.Q.passear(6)).catch((e) => console.log('   passear:', e.message.split('\n')[0]));
    const bs = await t.batalhas(nb);
    t.ok(bs.length > 0, 'encontros selvagens depois da Liga', bs.map((b) => `${b.inimigos} ${b.resultado}`).join(' | '));
    t.ok(bs.some((b) => b.resultado === 'captura'), 'capturou uma criatura depois da Liga', JSON.stringify(await Qr(() => window.Q.capturadas)));
  });
  await etapa('Monte Tupã', async () => {
    await viajar('A8'); await viajar('A-MT'); await t.foto('pos-monte-tupa');
    const nb = (await t.st()).nb;
    await t.falarCom('mt-guardiao'); const f1 = await fala(2);
    await t.irAte(20, 55).catch(() => 0); await t.ir('n'); await t.ir('n'); const s = await t.assentar();
    t.ok(s.zona === 'A-MT' && s.y >= 55, 'portão do Monte Tupã segura quem tem 8 insígnias', f1.slice(0, 120));
    t.ok((await t.st()).nb === nb, 'nenhuma batalha de nível 57+ antes do portão');
    const antes = await Qr(() => window.__pingo.mundo.npcs.filter((q) => q.treinador && q.ator.y > 54).map((q) => q.id));
    t.ok(antes.length === 0, 'nenhum treinador antes do portão do Monte Tupã', JSON.stringify(antes));
  });
  await etapa('Baía Azul sem Mergulho', async () => {
    await viajar('A-BA');
    const w = await Qr(async () => { const V = await import('/src/world/vivo.ts'); return V.M.zv.def.warps.filter((w) => w.para.zona === 'A-RS').map((w) => [w.x, w.y, !!window.Q.plano(w.x, w.y)]); });
    const [x, y] = w.find((q) => q[2]) ?? w[0];
    await t.irAte(x, y); let s = await t.assentar();
    t.ok(s.zona === 'A-BA', 'remar por cima do ponto de mergulho não leva ao Recife Submerso');
    await t.agir(); s = await t.assentar();
    t.ok(s.zona === 'A-BA', 'sem o Amuleto do Mergulho o Recife Submerso (nível 48+) não abre', await fala(1));
    await t.foto('pos-baia-mergulho');
  });
  await etapa('cais de Cidade Coral', async () => {
    await viajar('A5');
    await t.falarCom('moca-cais'); const f1 = await fala(3); await t.foto('pos-a5-cais');
    t.ok(/em breve/.test(f1) && !/agora está aberta/.test(f1), 'moça do cais não promete o Sertão', f1.slice(0, 200));
    await t.falarCom('bilheteiro'); const f2 = await fala(2);
    t.ok(/reforma|obras/.test(f2), 'bilheteiro: Saveiro em reforma', f2.slice(0, 200));
    const w = await Qr(async () => { const V = await import('/src/world/vivo.ts'); const w = V.M.zv.def.warps.find((w) => w.tipo === 'saveiro'); return [w.x, w.y]; });
    await t.irAte(w[0], w[1] + 1).catch(() => 0); await t.ir('n'); const s = await t.assentar(); const f3 = await fala(1);
    t.ok(s.zona === 'A5' && /obras|reforma/.test(f3), 'Saveiro não embarca: em obras', f3.slice(0, 160));
    await t.foto('pos-a5-saveiro');
  });
  await etapa('estação de Porto Sereia', async () => {
    await viajar('A4-estacao'); await t.foto('pos-estacao');
    await t.falarCom('a4-maquinista-obras'); const f1 = await fala(2);
    t.ok(/em obras/.test(f1), 'maquinista: linha em obras', f1.slice(0, 200));
    await t.irAte(8, 4); await t.ir('n'); const s = await t.assentar(); const f2 = await fala(1);
    t.ok(s.zona === 'A4-estacao' && /em obras/.test(f2), 'o vagão não embarca: linha em obras', f2.slice(0, 160));
    await t.foto('pos-estacao-vagao');
  });
  const r1 = await t.resumo();
  console.log('fim:', r1.zona, '$' + r1.dinheiro, r1.equipe.map((e) => e.split(' [')[0]).join(' · '));
} catch (e) { console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await t.st().catch(() => 0))); await t.foto('pos-erro'); }
console.log('falhas:', t.falhas ?? 0);
await t.fim();
