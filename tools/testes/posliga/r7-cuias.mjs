// QA pós-Liga 7 — cuieiras (1 fruto por árvore por dia), Mestre Cabaceiro (cuia no dia seguinte) e o arremesso de cada
// cuia artesanal numa batalha selvagem na TELA (A-R7, capim). Uso: run.sh r7-cuias.mjs <seg>
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, amanha, textos, limparTextos, flags, irPara } from './comum.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'campeao'));
await preparar(t);
const ARV = [['A-R2', 14, 9, 'verde', 'cabaca-verde', 'cuia-amiga'], ['A-R3', 7, 7, 'amarela', 'cabaca-amarela', 'cuia-ligeira'], ['A-R4', 18, 5, 'vermelha', 'cabaca-vermelha', 'cuia-nivel'],
  ['A-R5', 19, 11, 'preta', 'cabaca-preta', 'cuia-pesada'], ['A-R7', 17, 12, 'branca', 'cabaca-branca', 'cuia-lua'], ['A-MG', 38, 8, 'azul', 'cabaca-azul', 'cuia-isca'], ['A-PR', 20, 3, 'rosa', 'cabaca-rosa', 'cuia-amor']];
const moch = async (id) => (await t.resumo()).mochila[id] ?? 0;
/** chega perto da árvore (por irPara num tile livre ao lado) e interage */
async function colher(z, x, y) {
  await t.q(async ([z, x, y]) => { await window.__pingo.mundo.irPara(z, x, y + 3, 'n', 'nenhuma'); }, [z, x, y]);
  await t.assentar();
  await t.usar(x, y);
}
try {
  await relogio(t, 1, 10 * 60);
  let anterior = null;
  for (const [z, x, y, cor, fruto, cuia] of ARV) {
    await limparTextos(t);
    await colher(z, x, y).catch((e) => console.log('   colher', z, e.message.split('\n')[0]));
    const f1 = await moch(fruto);
    await colher(z, x, y).catch(() => 0);
    const f2 = await moch(fruto);
    t.ok(f1 === 1 && f2 === 1, `cuieira ${cor} (${z}): 1 fruto e recusa no mesmo dia`, (await textos(t, 1))[0]?.slice(0, 70));
    // artesão: entrega a de ontem (se houver) e recebe esta
    await irPara(t, 'A2', 37, 9, 'n');
    await limparTextos(t); await t.falarCom('a2-cabaceiro');
    if (anterior) { t.ok(await moch(anterior) === 1, `Mestre Cabaceiro entrega ${anterior} no dia seguinte`); await limparTextos(t); await t.falarCom('a2-cabaceiro'); }
    t.ok(await moch(fruto) === 0, `artesão recebe ${fruto}`, (await textos(t, 2)).join(' | ').slice(0, 160));
    await limparTextos(t); await t.falarCom('a2-cabaceiro');
    t.ok((await textos(t, 2)).some((x) => /secando/.test(x)) && await moch(cuia) === 0, 'no mesmo dia a cuia ainda está secando');
    anterior = cuia;
    await amanha(t);
  }
  await irPara(t, 'A2', 37, 9, 'n'); await t.falarCom('a2-cabaceiro');
  const tenho = {}; for (const a of ARV) tenho[a[5]] = await moch(a[5]);
  console.log('   cuias artesanais:', JSON.stringify(tenho));
  // arremessos: uma batalha por cuia no capim de A-R7 (selvagens 35–39), captura permitida de qualquer espécie
  await irPara(t, 'A-R7', 20, 15, 's');
  await t.q(() => { const Q = window.Q; Q.capturar = () => true; Q.capturarRepetidas = true; Q.maxCapturas = 99; });
  for (const a of ARV) {
    const cuia = a[5]; if (!tenho[cuia]) continue;
    await t.q((c) => { window.Q.cuiaPreferida = c; }, cuia);
    const nb = (await t.st()).nb, antes = await t.save();
    let usada = false;
    for (let k = 0; k < 6 && !usada; k++) {
      await t.q(() => window.Q.passear(1)).catch((e) => console.log('   passear', e.message.split('\n')[0]));
      const bs = await t.batalhas(nb); usada = bs.some((b) => b.usados?.[cuia]);
    }
    const bs = await t.batalhas(nb), b = bs.find((x) => x.usados?.[cuia]);
    const depois = await t.save();
    const nova = [...depois.equipe, ...depois.viveiro.flat().filter(Boolean)].find((c) => c.cuia === cuia);
    t.ok(!!b, `${cuia} arremessada na tela`, b ? `${b.inimigos} → ${b.resultado}${nova ? ` (cuia ${nova.cuia}, amizade ${nova.amizade}, ${nova.rara ? 'rara' : 'comum'})` : ''}` : 'sem arremesso');
    if (b?.resultado === 'captura' && cuia === 'cuia-amiga') t.ok(nova?.amizade >= 220, 'Cuia Amiga: chega com amizade 220', String(nova?.amizade));
    await t.foto(`r7-${cuia}`);
    // equipe cheia? o resto vai ao Viveiro; cura a cada 2 lutas
    if ((await t.resumo()).equipe.some((e) => /\(0\//.test(e))) { await irPara(t, 'A10-posto', 7, 4, 'n'); await t.q(() => window.Q.curarNoPosto()); await irPara(t, 'A-R7', 20, 15, 's'); }
  }
  await t.checkpoint('pos-r7-cuias');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r7-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
