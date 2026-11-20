// QA pós-Liga 4 — Torre de Desafios no Platô: regras, desafio do dia na TELA (nível 50, sem exp, sem mochila), pontos,
// recusa no mesmo dia, dia seguinte, troca de pontos. Uso: run.sh r4-torre.mjs <seg> [dias=3]
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, amanha, textos, limparTextos, flags, irPara } from './comum.mjs';
const DIAS = Number(process.argv[2] ?? 3);
const t = await abrir(lerSave('campeao'), { anim: true });
await preparar(t);
const eqTxt = async () => (await t.resumo()).equipe.map((e) => e.split(' (')[0]).join(' · ');
try {
  await relogio(t, 3, 14 * 60);
  await irPara(t, 'A-LG-posto', 7, 4, 'n'); await t.q(() => window.Q.curarNoPosto()); await t.q(() => window.Q.viajar('A-LG'));
  // regras
  await t.q(() => { window.Q.regrasEscolha.unshift([/^TORRE DE DESAFIOS/, 2]); });
  await limparTextos(t); await t.falarCom('a-lg-torre');
  console.log('   regras:', (await textos(t, 4)).filter((x) => /nível|Vitória|pontos/.test(x)).map((x) => x.replace(/\n/g, ' ')).join(' ⏎ ').slice(0, 300));
  await t.q(() => { window.Q.regrasEscolha.shift(); });
  for (let d = 0; d < DIAS; d++) {
    const antes = await t.save(), eq0 = await eqTxt();
    await limparTextos(t);
    const nb = (await t.st()).nb;
    await t.falarCom('a-lg-torre').catch((e) => console.log('   (torre)', e.message.split('\n')[0]));
    await t.assentar().catch(() => 0);
    const bs = await t.relato(nb), depois = await t.save();
    const fs = (await textos(t, 30)).filter((x) => /Desafio nº|Vitória!|Derrota|experiência/.test(x));
    console.log(`   dia ${d + 1}:`, fs.map((x) => x.replace(/\n/g, ' ')).join(' ⏎ ').slice(0, 400));
    const fl = await flags(t, '^torre');
    console.log('   flags:', JSON.stringify(fl), '| zona', depois.jogador.zona, '$' + antes.jogador.dinheiro, '→', depois.jogador.dinheiro);
    t.ok(bs.length === 1, `dia ${d + 1}: desafio jogado na tela`, bs.map((b) => b.resultado).join());
    t.ok(eq0 === (await eqTxt()) && JSON.stringify(antes.mochila) === JSON.stringify(depois.mochila), `dia ${d + 1}: equipe e mochila originais de volta, sem exp`, eq0 + ' / ' + (await eqTxt()));
    if (d === 0) {
      await t.foto('r4-depois-1');
      await limparTextos(t); await t.falarCom('a-lg-torre');
      t.ok((await textos(t, 3)).some((x) => /já foi/.test(x)), 'mesmo dia: Torre recusa');
    }
    await amanha(t);
    if (depois.jogador.zona !== 'A-LG') await t.q(() => window.Q.viajar('A-LG'));
  }
  // troca de pontos: o 1º prêmio (Cuia de Ouro, 3 pontos)
  const p0 = Number((await flags(t, '^torre-pontos'))['torre-pontos'] ?? 0), c0 = (await t.resumo()).mochila['cuia-ouro'] ?? 0;
  await t.q(() => { window.Q.regrasEscolha.unshift([/^TORRE DE DESAFIOS/, 1], [/^Pontos: \d+\. Escolha/, 0]); window.Q.trocas = 0; });
  // escolhe a Cuia de Ouro uma vez e depois "Voltar"
  await t.q(() => { let n = 0; const r = window.Q.regrasEscolha.find((x) => String(x[0]) === String(/^Pontos: \d+\. Escolha/)); r[0] = { test: (p) => /^Pontos: \d+\. Escolha/.test(p) && n++ < 1 }; window.Q.regrasEscolha.splice(2, 0, [/^Pontos: \d+\. Escolha/, 9]); });
  await limparTextos(t); await t.falarCom('a-lg-torre');
  const p1 = Number((await flags(t, '^torre-pontos'))['torre-pontos'] ?? 0), c1 = (await t.resumo()).mochila['cuia-ouro'] ?? 0;
  console.log('   troca:', (await textos(t, 4)).join(' ⏎ ').slice(0, 300));
  t.ok(p0 < 3 ? c1 === c0 : (p1 === p0 - 3 && c1 === c0 + 1), 'troca de pontos', `pontos ${p0}→${p1}, cuia-ouro ${c0}→${c1}`);
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r4-erro'); }
console.log('FALHAS:', t.falhas ?? 0);
await t.fim();
