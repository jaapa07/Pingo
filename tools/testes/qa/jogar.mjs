// QA jogado, trecho 1: novo jogo → ginásio 4, no Aventureiro, como jogador honesto.
// uso: node jogar.mjs <mata|brasa|rio> [--de N] [--ate N] [--turbo K]
//   --de N  retoma do checkpoint saves/<inicial>-passo-N.json (alcançado jogando); sem ele, o último que existir
import { abrir, AQUI } from './piloto.mjs';
import { ETAPAS } from './etapas.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const inicial = process.argv[2] ?? 'brasa';
const ate = Number(arg('ate', ETAPAS.length)), turbo = Number(arg('turbo', 5));
const t = await abrir({ nome: inicial, turbo, arquivoLog: `${AQUI}saves/${inicial}.log` });
t.inicial = inicial;
t.respostas.unshift([/dificuldade/i, 'Aventureiro (Recomendado)'], [/Quem é você/i, inicial === 'mata' ? 'Ayra' : 'Kauê']);
let de = arg('de');
if (de === undefined) { de = 0; for (let i = ETAPAS.length; i >= 1; i--) if (t.temSave(`${inicial}-passo-${i}`) && i <= ate) { de = i; break; } }
de = Number(de);
const t0 = Date.now();
try {
  if (de > 0) { await t.carregar(`${inicial}-passo-${de}`); t.log(`>> retomando de ${inicial}-passo-${de}`); }
  for (let i = de; i < Math.min(ate, ETAPAS.length); i++) {
    const e = ETAPAS[i];
    t.log(`\n>> etapa ${i + 1}: ${e.nome}  (${Math.round((Date.now() - t0) / 1000)} s)`);
    await e.fn(t);
    await t.resolver();
    await t.salvar(`${inicial}-passo-${i + 1}`);
    await t.foto(`passo-${i + 1}`);
  }
} catch (e) {
  t.log('FALHA', e.stack?.split('\n').slice(0, 4).join(' | '), JSON.stringify(await t.snap().catch(() => 0)), JSON.stringify(await t.falas(3).catch(() => 0)));
  await t.foto('erro').catch(() => 0);
  process.exitCode = 1;
}
t.log('resumo:', JSON.stringify(await t.resumo().catch(() => 0)));
t.log('treino extra:', JSON.stringify(t.treinoExtra ?? []), 'derrotas:', t.derrotas, 'curas:', t.curas ?? 0);
t.log('perguntas:', JSON.stringify([...new Set(t.perguntas)]));
await t.fim();
