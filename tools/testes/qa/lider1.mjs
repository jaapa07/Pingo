// Várias tentativas do ginásio N a partir de um checkpoint, cada uma com outra semente do acaso (sem treino entre elas).
// uso: node lider1.mjs <inicial> [--n 6] [--gin 1] [--de <checkpoint>] [--turbo 8]
import { abrir, AQUI } from './piloto.mjs';
import { seq, GINASIOS } from './etapas.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const inicial = process.argv[2], N = Number(arg('n', 6)), gin = Number(arg('gin', 1)), de = arg('de', `${inicial}-pre-lider-${gin}`);
const g = GINASIOS[gin]; let v = 0; const linhas = [];
for (let k = 0; k < N; k++) {
  const t = await abrir({ nome: `${inicial}-l${gin}`, turbo: Number(arg('turbo', 8)) });
  t.inicial = inicial;
  try {
    await t.carregar(de);
    await t.ev(async (k) => { const { rng } = await import('/src/core/rng.ts'); rng.seed(90001 + k * 7919); }, k);
    await t.curarSePreciso(); await t.viajar(g.zona);
    const d0 = t.diario.length;
    let res = 'derrota';
    try { await seq(t, g.zona, g.rota); } catch (e) { if (e.message !== 'derrota') throw e; }
    const r = await t.resumo(); if (r.insignias.includes(gin)) { res = 'VITÓRIA'; v++; }
    const lut = t.diario.slice(d0).filter((x) => x.tipo === 'treinador'), ult = lut[lut.length - 1];
    const l = `${inicial} #${k + 1}: ${res} · caiu em ${res === 'derrota' ? ult?.treinador : '-'} · equipe ${r.equipe.map((c) => c.nome + ' ' + c.nv).join(', ')} · idas ao Posto ${(t.idasAoPosto ?? []).length} · remédios fora ${t.remediosFora ?? 0} · chás ${r.mochila['cha-cidreira'] ?? 0}`;
    linhas.push(l); console.log(l);
    if (res === 'derrota' && ult) console.log('    ' + (ult.turnos ?? []).join(' | '));
  } catch (e) { console.log(`${inicial} #${k + 1}: FALHA ${e.message}`, JSON.stringify(await t.snap().catch(() => 0))); await t.foto('erro-l' + gin).catch(() => 0); }
  await t.browser.close();
}
console.log(`== ${inicial} ginásio ${gin}: ${v}/${N} vitórias`);
