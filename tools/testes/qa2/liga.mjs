// QA 2 — LIGA DOS GUARDIÕES jogada de verdade a partir do checkpoint do Platô (mochila do jogador honesto).
// Uso: run.sh liga.mjs <seg> [n=5] [semente0=1] [save=plato] [compras=sim|nao]
import { abrir, lerSave } from './lib.mjs';
const n = Number(process.argv[2] ?? 5), s0 = Number(process.argv[3] ?? 1), nomeSave = process.argv[4] ?? 'plato', compra = (process.argv[5] ?? 'sim') === 'sim';
const SALAS = ['liga-mare', 'liga-brasa-viva', 'liga-neblina', 'liga-pampa', 'liga-arace'];
const res = [];
for (let k = 0; k < n; k++) {
  const t = await abrir(lerSave(nomeSave), { semente: s0 + k });
  const Qr = (fn, arg) => t.q(fn, arg);
  const r = { semente: s0 + k, venceu: 0, campeao: false, rival: null };
  try {
    if (compra) {
      // jogador honesto: gasta o que tem na Venda do Platô (reanimar e curar primeiro), cura no Posto e entra
      await Qr(() => window.Q.viajar('A-LG-venda'));
      const din = (await t.resumo()).dinheiro;
      const lista = {}; let resto = din; const m = (await t.resumo()).mochila;
      for (const [id, preco, alvo] of [['cha-guarana', 1500, 4], ['rapadura', 4800, 0], ['elixir-andiroba', 2500, 4], ['garrafada', 700, 20], ['pomada-copaiba', 600, 2]]) { const q = Math.max(0, Math.min(alvo - (m[id] ?? 0), Math.floor(resto / preco))); if (q > 0) { lista[id] = q; resto -= q * preco; } }
      r.compras = (await Qr((l) => window.Q.comprar(l), lista)).comprou;
      await Qr(() => window.Q.viajar('A-LG-posto')); await Qr(() => window.Q.curarNoPosto()); await Qr(() => window.Q.viajar('A-LG'));
    }
    const r0 = await t.resumo(); r.equipe = r0.equipe.map((e) => e.split(' (')[0]).join(', '); r.dinheiro = r0.dinheiro;
    r.mochila = Object.fromEntries(Object.entries(r0.mochila).filter(([id]) => /garrafada|elixir|cha-|pomada|garapa|mel|unguento|rapadura/.test(id)));
    await Qr(() => window.Q.rodizio('chefe'));
    // porta sem volta
    await t.irAte(15, 53); await t.ir('n'); let s = await t.assentar();
    r.entrou = await t.flag('liga-em-curso');
    if (k === 0) await t.foto('liga-sala-de-espera');
    const fechou = await Qr(() => window.Q.plano(15, 55) === null);
    r.portaFechou = fechou;
    for (const [i, npc] of SALAS.entries()) {
      await Qr(() => window.Q.cuidar({ limiar: 0.75, reanimar: true })); await Qr(() => window.Q.rodizio('chefe'));
      if (k === 0) await t.foto(`liga-${i + 1}-antes`);
      const nb = (await t.st()).nb;
      await t.falarCom(npc);
      const b = (await t.batalhas(nb)).pop();
      r['luta' + (i + 1)] = `${b?.resultado} t=${b?.turnos} usou ${JSON.stringify(b?.usados)} IA usou ${b?.iaUsou}`;
      if (b?.resultado !== 'vitoria') {
        s = await t.assentar();
        r.depoisDaDerrota = { zona: s.zona, x: s.x, y: s.y, flags: await t.flags('^liga-'), equipe: (await t.resumo()).equipe.map((e) => e.match(/\((\d+\/\d+)\)/)[1]).join(' '), dinheiro: (await t.resumo()).dinheiro, fala: (await t.falas(1))[0]?.slice(0, 90) };
        if (k === 0) await t.foto('liga-depois-da-derrota');
        break;
      }
      r.venceu = i + 1;
    }
    if (r.venceu === 5) {
      r.campeao = true;
      s = await t.assentar();
      const bs = await t.batalhas(); const rv = bs.find((b) => /^rival-5/.test(b.id ?? ''));
      r.rival = rv ? `${rv.id} ${rv.resultado} t=${rv.turnos} [${rv.inimigos}]` : 'não houve';
      r.fim = { zona: s.zona, x: s.x, y: s.y, flags: await t.flags('^liga-|rival-5'), itens: Object.keys((await t.resumo()).mochila).filter((id) => /passe|bilhete|pedra|folha/.test(id)), equipe: (await t.resumo()).equipe.map((e) => e.split(' (')[0]).join(', '), dinheiro: (await t.resumo()).dinheiro };
      await t.foto('liga-campeao-terreiro');
      await t.checkpoint('campeao');
      // a porta fecha depois da vitória
      await t.irAte(15, 53); await t.ir('n'); s = await t.assentar(); r.portaDepois = { y: s.y, fala: (await t.falas(1))[0]?.slice(0, 80) };
    }
    r.derrotasIA = (await t.batalhas()).map((b) => b.iaUsou).join(',');
  } catch (e) { r.erro = e.message.split('\n')[0]; r.st = await t.st().catch(() => null); r.falas = await t.falas(2).catch(() => null); await t.foto('liga-erro-' + k); }
  console.log(JSON.stringify(r));
  res.push(r);
  await t.fim();
}
console.log(`\nLIGA: ${res.filter((r) => r.campeao).length}/${res.length} campeão · lutas vencidas por tentativa: ${res.map((r) => r.venceu).join(' ')}`);
