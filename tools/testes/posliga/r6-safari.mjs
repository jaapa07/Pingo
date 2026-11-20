// QA pós-Liga 6 — Safári: doadores dos objetos (A-R3, A10, A-R7), Seu Jatobá abre os setores, porteira (500 patacas,
// 30 cuias), passeio no capim, encontro jogado pelo teclado (PERTO, PEDRA, ISCA, CUIA), captura, mudança de setor, saída.
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, tecla, textos, limparTextos, topo, flags, irPara } from './comum.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'campeao'), { anim: true });
await preparar(t);
const sf = () => t.q(() => { const r = document.querySelector('.tela-safari'); if (!r) return null; const m = r.querySelector('.sf-menu .cursor-mao, .sf-menu > :last-child'); return { pronto: !!m && m.style.visibility !== 'hidden' }; });
/** joga um encontro: plano de ações (índices do menu), repetindo a última até acabar */
async function encontro(plano, rot) {
  const L = [[0], [1, 2], [3, 4]], pos = (i) => { const l = L.findIndex((x) => x.includes(i)); return [l, L[l].indexOf(i)]; };
  let sel = 0, k = 0, fotos = 0;
  for (let g = 0; g < 400; g++) {
    const s = await sf(); if (!s) break;
    if (!s.pronto) { await tecla(t, 'a', 1, 12); continue; }
    const quer = plano[Math.min(k, plano.length - 1)]; k++;
    if (fotos++ < 2) await t.foto(`${rot}-${fotos}`);
    // navega da seleção atual (memorizada) até `quer`
    let [l0, c0] = pos(sel); const [l1, c1] = pos(quer);
    while (l0 !== l1) { await tecla(t, l0 < l1 ? 'baixo' : 'cima', 1, 4); l0 += l0 < l1 ? 1 : -1; c0 = Math.min(c0, L[l0].length - 1); }
    if (c0 !== c1) await tecla(t, c0 < c1 ? 'dir' : 'esq', 1, 4);
    sel = quer; await tecla(t, 'a', 1, 12);
  }
  for (let g = 0; g < 30 && /dialogo|nome/.test(await topo(t)); g++) await tecla(t, /nome/.test(await topo(t)) ? 'b' : 'a', 1, 8);
}
const passoSeguro = (d) => t.q(async (d) => {
  const P = window.__pingo, C = { l: 'ArrowRight', o: 'ArrowLeft', n: 'ArrowUp', s: 'ArrowDown' }[d];
  const ev = (tp) => document.dispatchEvent(new KeyboardEvent(tp, { code: C, key: C, bubbles: true }));
  const q = () => new Promise((r) => requestAnimationFrame(r)); const x0 = P.mundo.jogador.x, y0 = P.mundo.jogador.y;
  ev('keydown'); for (let i = 0; i < 20; i++) { await q(); if (P.mundo.jogador.movendo || P.mundo.jogador.x !== x0 || P.mundo.jogador.y !== y0 || document.querySelector('.tela-safari')) break; } ev('keyup');
  for (let i = 0; i < 30 && P.mundo.jogador.movendo; i++) await q();
}, d);
async function irAteSeguro(x, y, rot) {
  for (let k = 0; k < 6; k++) {
    try { await t.irAte(x, y); return; } catch (e) { if (await sf()) await encontro([0], rot + '-caminho'); else throw e; }
  }
}
try {
  await relogio(t, 3, 11 * 60);
  // doadores (viagem por irPara: o caminho até eles não é o foco)
  for (const [z, x, y, id, item] of [['A-R3', 35, 7, 'safari-pescador-seixo', 'pedra-de-rio'], ['A10', 19, 22, 'safari-viveirista', 'muda-de-buriti'], ['A-R7', 6, 12, 'safari-lenhador', 'tronco-oco']]) {
    await irPara(t, z, x, y, 'n');
    const ids = (await t.npcs()).map((n) => n.id);
    if (!ids.includes(id)) { t.ok(false, `${id} em ${z}`, ids.join(',')); continue; }
    await limparTextos(t); await t.falarCom(id);
    t.ok(((await t.resumo()).mochila[item] ?? 0) === 1, `${id} dá ${item}`, (await textos(t, 1))[0]?.slice(0, 80));
    await limparTextos(t); await t.falarCom(id);
    t.ok(((await t.resumo()).mochila[item] ?? 0) === 1, `${id} não dá 2ª vez`);
  }
  await irPara(t, 'A-SF', 13, 4, 's');
  // dono
  await t.q(() => window.Q.viajar('A-SF-casa'));
  await limparTextos(t); await t.falarCom('safari-dono');
  const fs = await t.flags('safari-setor');
  console.log('   dono:', (await textos(t, 12)).map((x) => x.slice(0, 70)).join(' ⏎ '));
  t.ok(fs.length >= 3, 'Seu Jatobá abre os setores 2–4', fs.join(','));
  await t.q(() => window.Q.viajar('A-SF'));
  // porteira
  const d0 = (await t.resumo()).dinheiro;
  await limparTextos(t); await t.falarCom('safari-bilheteira');
  let s = await t.st();
  const r0 = await t.resumo();
  t.ok(s.zona === 'A-SF-parque' && d0 - r0.dinheiro === 500 && r0.mochila['cuia-safari'] === 30, 'porteira: 500 patacas, 30 Cuias-Safári, dentro do parque', `${s.zona} ${d0 - r0.dinheiro} ${r0.mochila['cuia-safari']}`);
  await t.foto('r6-parque');
  // anda no capim até 3 encontros (setor 1 e depois setor 2)
  const capim = await t.q(([x0, x1]) => { const V = window.__pingo.mundo; const z = V.zona; const r = []; for (let y = 17; y < 34; y++) for (let x = x0; x <= x1; x++) if (z.mapaChars[y][x] === '"' && z.mapaChars[y][x + 1] === '"') r.push([x, y]); return r; }, [0, 21]);
  const capim2 = await t.q(([x0, x1]) => { const z = window.__pingo.mundo.zona; const r = []; for (let y = 17; y < 34; y++) for (let x = x0; x <= x1; x++) if (z.mapaChars[y][x] === '"' && z.mapaChars[y][x + 1] === '"') r.push([x, y]); return r; }, [23, 42]);
  const planos = [[3, 3, 2, 0], [1, 0], [2, 0], [0]];
  let enc = 0, cap0 = Number((await flags(t, 'safari-capturas'))['safari-capturas'] ?? 0);
  for (const [area, alvo] of [[capim, 2], [capim2, 2]]) {
    const [cx, cy] = area[Math.floor(area.length / 2)];
    await irAteSeguro(cx, cy, 'r6-area').catch((e) => console.log('   irAte', e.message.split('\n')[0]));
    let n = 0;
    for (let passo = 0; passo < 120 && n < alvo; passo++) {
      await passoSeguro(passo % 2 ? 'o' : 'l');
      if (await sf()) {
        n++; enc++; const c0 = (await t.resumo()).mochila['cuia-safari'] ?? 0, k0 = Number((await flags(t, 'safari-capturas'))['safari-capturas'] ?? 0);
        const esp = await t.q(() => window.__pingo.jogo.save.diario.visto.slice(-1)[0]);
        await encontro(planos[(enc - 1) % planos.length], `r6-enc${enc}`);
        const c1 = (await t.resumo()).mochila['cuia-safari'] ?? 0, k1 = Number((await flags(t, 'safari-capturas'))['safari-capturas'] ?? 0);
        console.log(`   encontro ${enc} (plano ${planos[(enc - 1) % planos.length]}): ${c0 - c1} cuia(s), ${k1 > k0 ? 'CAPTUROU' : 'não capturou'}`);
      }
      if ((await t.st()).zona !== 'A-SF-parque') break;
    }
  }
  const r1 = await t.resumo(), cap1 = Number((await flags(t, 'safari-capturas'))['safari-capturas'] ?? 0);
  console.log('   passos:', (await flags(t, 'safari-passos'))['safari-passos'], 'cuias', r1.mochila['cuia-safari'], 'capturas', cap0, '→', cap1, 'equipe', r1.equipe.length);
  t.ok(enc >= 2, 'encontros no capim do parque', String(enc));
  // sai pela porteira
  await t.q(() => window.Q.viajar('A-SF')).catch((e) => console.log('   saída', e.message.split('\n')[0]));
  const r2 = await t.resumo(), f2 = await flags(t, 'safari-ativo');
  t.ok(r2.zona === 'A-SF' && !(r2.mochila['cuia-safari'] > 0) && !f2['safari-ativo'], 'saída: cuias ficam na porteira, passeio encerrado', JSON.stringify(f2));
  await t.checkpoint('pos-r6-safari');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r6-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
