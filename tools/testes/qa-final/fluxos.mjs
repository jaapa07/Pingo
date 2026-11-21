// QA FINAL — fluxos do jogo completo com o mapa B aberto, no navegador (Vite 5211 do tools/testes/decisoes, batalhas no
// modo sem tela com o piloto padrão do motor, que nunca foge). Saves: checkpoints do QA 4 (tools/testes/qa4/saves) e as
// cópias convertidas para Mata/Brasa (tools/testes/qa-final/trocar-inicial.mts) passadas pelo caminho completo.
// Uso: tools/testes/decisoes/run.sh ../qa-final/fluxos.mjs <seg> [pasta-dos-saves-convertidos]
import { abrir, lerSave } from '../decisoes/lib.mjs';
import { readFileSync } from 'node:fs';
const SV = process.argv[2] ?? '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/sv';
const ler = (n) => (n.startsWith('/') ? JSON.parse(readFileSync(n, 'utf8')) : lerSave(n));
let falhas = 0;
const ok = (c, r, x = '') => { console.log(`${c ? 'ok  ' : 'ERRO'} ${r} ${x}`); if (!c) falhas++; };
async function cenario(save, fn) {
  const t = await abrir(ler(save));
  try {
    await t.q(async () => {
      const Q = window.Q; Q.textos = []; Q.inicios = [];
      const DLG = await import('/src/ui/dialogo.ts'); const def = DLG.CaixaTexto.prototype.definir;
      DLG.CaixaTexto.prototype.definir = function (str, ...r) { Q.textos.push(String(str)); return def.call(this, str, ...r); };
      const B = await import('/src/battle/index.ts'); B.definirHeadless(true);
      const { bus } = await import('/src/core/events.ts');
      bus.on('batalha-inicio', ({ pedido }) => { Q.inicios.push({ id: pedido.treinador?.id, tipo: pedido.tipo, inimigos: (pedido.inimigos ?? []).map((c) => c.especie).join(',') }); });
      Q.rodarAte = async (passos) => {
        let fim = false; const p = window.__pingo.mundo.rodarPassos(passos).then(() => { fim = true; }, (e) => { fim = true; Q.erroEv = String(e); });
        for (let k = 0; k < 40000 && !fim; k++) { if (/dialogo|pergunta|escolha/.test(window.__pingo.telas.topo?.el.className ?? '')) await Q.toque('a'); await Q.quadros(2); }
        await p; await Q.assentar?.();
      };
      /** equipe forte (nível 100) para os lendários */
      Q.forte = async () => { const { criarCriatura } = await import('/src/world/deps.ts'); window.__pingo.jogo.save.equipe = [[3, 100], [6, 100], [9, 100], [12, 100], [72, 100], [110, 100]].map(([e, n]) => criarCriatura(e, n)); };
    });
    await fn(t);
  } catch (e) { ok(false, 'cenário ' + save, String(e).slice(0, 300)); } finally { await t.fim(); }
}
const Fl = (t, f) => t.page.evaluate((f) => window.__pingo.jogo.save.flags[f], f);
const ultimos = (t) => t.q(() => window.Q.inicios.slice(-3));
const ir = (t, z, x, y, d = 's') => t.q(([z, x, y, d]) => window.__pingo.mundo.irPara(z, x, y, d, 'nenhuma'), [z, x, y, d]);

// 1. rival 5 (Platô, logo depois da Liga) e rival 6/7/8: a variante da Tainá conforme o inicial
const RIVAL = { mata: 'brasa', brasa: 'rio' };
for (const ini of ['mata', 'brasa']) {
  await cenario(`${SV}/campeao-${ini}.json`, async (t) => {
    for (const [n, ev, zona, x, y] of [[5, 'rival-5', 'A-LG', 15, 50], [6, null, 'B4', 20, 20], [7, 'b2-rival-7', 'B7', 24, 37], [8, null, 'PP', 20, 20]]) {
      await t.page.evaluate((n) => { const f = window.__pingo.jogo.save.flags; delete f['rival-' + n]; }, n);
      await ir(t, zona, x, y);
      const id = `rival-${n}-${RIVAL[ini]}`;
      // 6 e 8 ficam em constantes dentro dos roteiros: chama a batalha pelo comando que o roteiro usa
      const passos = ev ? [['chamar', ev]] : [['se', `flag:inicial-${ini}`, [['batalha', id, { segue: true }]]]];
      await t.q((p) => window.Q.rodarAte(p), passos);
      const u = await ultimos(t);
      ok(u.some((b) => b.id === id), `${ini}: rival ${n} usa ${id}`, JSON.stringify(u));
    }
  });
}

// 2. presentes do inicial: Drª Buriti (insígnia 8) e o ovo da Praia das Tartarugas
for (const [ini, buriti, ovo] of [['mata', 4, 7], ['brasa', 1, 7]]) {
  await cenario(`${SV}/plato-${ini}.json`, async (t) => {
    await t.page.evaluate(() => { const s = window.__pingo.jogo.save; delete s.flags['inicial-extra-1']; delete s.flags['inicial-extra-2']; delete s.flags['a2-sim']; s.equipe = s.equipe.slice(0, 4); });
    await ir(t, 'A10-lab', 5, 5);
    await t.q(() => window.Q.rodarAte([['chamar', 'dra-buriti']]));
    let e = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => c.especie + (c.ovo ? 'ovo' : '')));
    ok(e.includes(String(buriti)), `${ini}: Drª Buriti dá a espécie ${buriti}`, JSON.stringify(e));
    await ir(t, 'A-PR', 10, 10);
    await t.q(() => window.Q.rodarAte([['chamar', 'a2-pr-ovo']]));
    e = await t.page.evaluate(() => window.__pingo.jogo.save.equipe.map((c) => c.especie + (c.ovo ? 'ovo' : '')));
    ok(e.includes(ovo + 'ovo'), `${ini}: ovo da Praia das Tartarugas é da espécie ${ovo}`, JSON.stringify(e));
  });
}

// 3. lendários de evento que a regra nova cobre e não tinham sido vencidos na tela: Borealce e Gavião-Tupã (vencidos → somem)
await cenario('campeao-b', async (t) => {
  await t.q(() => window.Q.forte());
  await t.page.evaluate(() => { const f = window.__pingo.jogo.save.flags; f['boreal-missao'] = true; f['boreal-acesa'] = true; });
  await ir(t, 'PP', 20, 7);
  await t.q(() => window.Q.rodarAte([['chamar', 'vis-borealce-batalha']]));
  ok(await Fl(t, 'borealce-sumiu') === true && !(await Fl(t, 'borealce-ok')), 'Borealce vencido: borealce-sumiu', JSON.stringify(await ultimos(t)));
  await ir(t, 'A9', 20, 10);
  await t.q(() => window.Q.forte());
  await t.q(() => window.Q.rodarAte([['chamar', 'a2-a9-gaviao']]));
  ok(await Fl(t, 'gaviao-ok') === true && await Fl(t, 'a2-lenda-vencida') === true, 'Gavião-Tupã vencido: gaviao-ok + a2-lenda-vencida', JSON.stringify(await ultimos(t)));
  const n = (await t.q(() => window.Q.inicios.length));
  await t.q(() => window.Q.rodarAte([['chamar', 'a2-a9-gaviao']]));
  ok((await t.q(() => window.Q.inicios.length)) === n, 'Gavião-Tupã não volta a lutar');
});

// 4. Cuia Guardiã: a 3ª vem da Profª Ipê com 100 espécies, uma vez só
await cenario('campeao-b', async (t) => {
  const antes = await t.page.evaluate(() => { const s = window.__pingo.jogo.save; delete s.flags['guardia-100']; for (let i = 1; i <= 120; i++) if (!s.diario.capturado.includes(i)) s.diario.capturado.push(i); return s.mochila['cuia-guardia'] ?? 0; });
  await ir(t, 'A1-lab', 5, 5);
  await t.q(() => window.Q.rodarAte([['chamar', 'prof-ipe']]));
  const d1 = await t.page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-guardia'] ?? 0);
  await t.q(() => window.Q.rodarAte([['chamar', 'prof-ipe']]));
  const d2 = await t.page.evaluate(() => window.__pingo.jogo.save.mochila['cuia-guardia'] ?? 0);
  ok(d1 === antes + 1 && d2 === d1, `Cuia Guardiã da Profª Ipê: ${antes} → ${d1} → ${d2}`);
  // as duas do chão (A-RS e A9) já foram pegas pelo QA 4? (o save do campeão as carrega)
  const chao = await t.page.evaluate(() => ['item:A-RS:fundo', 'item:A9:leste'].map((f) => f + '=' + !!window.__pingo.jogo.save.flags[f]).join(' '));
  console.log('     cuias do chão no save do QA 4:', chao, '· total na mochila:', d2);
});
console.log(falhas ? `FALHAS: ${falhas}` : 'TUDO OK');
