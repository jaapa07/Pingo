import { abrir, AQUI } from './piloto.mjs';
const t = await abrir({ nome: 't2', turbo: 20 });
await t.carregar(process.argv[2] ?? 'brasa-passo-3');
await t.viajar('A-R1');
t.log(JSON.stringify(await t.resumo()));
await t.treinar('A-R1', 1, 'debug');
t.log(JSON.stringify(await t.ev(() => window.__qa.resultados.map((r) => r.resultado + ': ' + r.turnos.join(' | ')))));
await t.fim();
